// 從 index.html 的 Bio／CV 產生 assets/cv/WuChengRu_CV_{EN,ZH}.pdf
// 用法（在 repo 根目錄）：node scripts/build_cv_pdf.mjs
// 需要 Node 18+ 與 Microsoft Edge（路徑不同時設定環境變數 EDGE_PATH）
import { createServer } from 'node:http';
import { createReadStream, statSync, readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join, extname, normalize, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = join(ROOT, 'assets', 'cv');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const updated = new Date().toISOString().slice(0, 7);

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const file = join(ROOT, path);
  if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const profile = mkdtempSync(join(tmpdir(), 'cv-edge-'));
spawn(EDGE, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let port;
for (let i = 0; i < 100 && !port; i++) {
  await sleep(200);
  try { port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim(); } catch {}
}
if (!port) throw new Error('Edge 沒有啟動，請確認 EDGE_PATH');

const browserWs = JSON.parse(await (await fetch(`http://127.0.0.1:${port}/json/version`)).text()).webSocketDebuggerUrl;

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, m => m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result));
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  return { ws, send };
}

try {
  for (const lang of ['en', 'zh']) {
    const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
    const { ws, send } = await connect(target.webSocketDebuggerUrl);
    await send('Page.enable');
    await send('Page.navigate', { url: `${base}/scripts/cv/cv-print.html?lang=${lang}&updated=${updated}` });
    let ready = false;
    for (let i = 0; i < 100 && !ready; i++) {
      await sleep(200);
      ready = (await send('Runtime.evaluate', { expression: 'window.__cvReady === true', returnByValue: true })).result.value;
    }
    if (!ready) throw new Error(`${lang} 版面沒有載入完成（字型或 index.html 讀取失敗？）`);
    const { data } = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
    const file = join(OUT, `WuChengRu_CV_${lang.toUpperCase()}.pdf`);
    writeFileSync(file, Buffer.from(data, 'base64'));
    console.log(`✓ ${file}（${(statSync(file).size / 1024).toFixed(0)} KB）`);
    ws.close();
  }
} finally {
  const { ws, send } = await connect(browserWs);
  await send('Browser.close').catch(() => {});
  ws.close();
  server.close();
  await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
