#!/usr/bin/env node
// 把講座網頁（私有 repo k591238/talks）的「表演模式」同步到公開的 handouts/av-perform/
//
//   node scripts/sync_perform.mjs                       # 來源預設 ../../2026_AV_Lecture/2026-career
//   node scripts/sync_perform.mjs <講座資料夾路徑>
//
// ⚠️ talks 是私有 repo，這裡是公開網站。只複製白名單上的程式檔：
//    講座內容 talk.md、講稿 notes.md、照片 img/、講者視窗、本機伺服器都不會過來。
//    talk.md 由這支腳本產生，只有標題和 `only: perform`（talks 的開關：只有表演頁）。
// 同步完會跑 build_site.mjs 更新 sitemap。之後照常本機檢查 → commit → 使用者同意才 push。

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.resolve(process.argv[2] || path.join(ROOT, '../../2026_AV_Lecture/2026-career'));
const DEST = path.join(ROOT, 'handouts/av-perform');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
const URL = site.baseUrl + 'handouts/av-perform/';

// 頁面資訊（使用者 2026-11-11 確認）
const TITLE = '音像互動體驗 Audiovisual Instrument｜吳承儒 PB';
const DESC = '用鍵盤即時演奏聲音與影像：5 種視覺場景、6 種音色、16 步序列機，以及可以把 ADSR 波形接到畫面參數的合成器。'
  + '源自吳承儒（PB）創作生涯分享講座的現場示範。';

// 從講座資料夾複製的檔案（白名單）
const COPY = ['index.html', 'talk.js', 'theme.css', 'vendor/three.module.min.js'];
// 公開資料夾裡允許存在的檔案：白名單＋腳本產生的 talk.md＋分享預覽圖
const ALLOWED = new Set([...COPY, 'talk.md', 'og.jpg']);

const fail = msg => { console.error('✗ ' + msg + '\n  沒有同步任何檔案。'); process.exit(1); };
for (const f of COPY) if (!fs.existsSync(path.join(SRC, f))) fail(`來源找不到 ${f}（來源：${SRC}）`);

const src = f => fs.readFileSync(path.join(SRC, f), 'utf8');
let html = src('index.html');
if (!html.includes("TALK.meta.only === 'perform'"))
  fail('來源的 index.html 沒有 only: perform 開關（talks 的程式太舊？），同步出去會變成空白的講座頁');
if (!src('talk.js').includes("talk.meta.only === 'perform'"))
  fail('來源的 talk.js 沒有 only: perform 開關，公開頁會去讀講稿 notes.md');

// <head> 加上搜尋引擎與社群分享需要的資訊（只改公開版，不動 talks 的原始檔）
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const ogImg = fs.existsSync(path.join(DEST, 'og.jpg')) ? URL + 'og.jpg' : '';
const head = [
  `<title>${esc(TITLE)}</title>`,
  `<meta name="description" content="${esc(DESC)}">`,
  `<link rel="canonical" href="${URL}">`,
  `<meta property="og:type" content="website">`,
  `<meta property="og:site_name" content="吳承儒 Wu Cheng-Ru（PB）">`,
  `<meta property="og:url" content="${URL}">`,
  `<meta property="og:title" content="${esc(TITLE)}">`,
  `<meta property="og:description" content="${esc(DESC)}">`,
  ...(ogImg ? [`<meta property="og:image" content="${ogImg}">`, `<meta name="twitter:image" content="${ogImg}">`] : []),
  `<meta name="twitter:card" content="summary_large_image">`,
  `<link rel="icon" href="../../assets/images/favicon.svg" type="image/svg+xml">`,
].join('\n');
const titleRe = /<title>[^<]*<\/title>/;
if (!titleRe.test(html)) fail('來源 index.html 找不到 <title>');
html = html.replace(titleRe, `<!-- 由 PB.github.io/scripts/sync_perform.mjs 同步自 talks（只有表演頁），不要在這裡改 -->\n${head}`)
  .replace(/<html lang="[^"]*">/, '<html lang="zh-Hant">');

const talkMd = `title: ${TITLE}\nbrand: WU CHENG-RU ｜PenBit\nonly: perform\n`;

// 寫入：先清掉公開資料夾裡不在允許清單的檔案（例如以前同步過、後來移除的）
fs.mkdirSync(DEST, { recursive: true });
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory()
  ? walk(path.join(d, e.name)) : [path.relative(DEST, path.join(d, e.name)).replace(/\\/g, '/')]);
for (const f of walk(DEST)) if (!ALLOWED.has(f)) { fs.rmSync(path.join(DEST, f)); console.log('  已移除不在白名單的檔案：' + f); }
const changed = [];
const put = (f, content) => {
  const p = path.join(DEST, f);
  const old = fs.existsSync(p) ? fs.readFileSync(p) : null;
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content);
  if (old && old.equals(buf)) return;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, buf);
  changed.push(f);
};
put('index.html', html);
put('talk.md', talkMd);
for (const f of COPY.filter(f => f !== 'index.html')) put(f, fs.readFileSync(path.join(SRC, f)));

// 最後再檢查一次：公開資料夾裡不能有講稿、簡報原稿、照片
const bad = walk(DEST).filter(f => !ALLOWED.has(f) || /notes|\.pptx?$|\.key$|^img\//i.test(f));
if (bad.length) fail('公開資料夾出現不該公開的檔案：' + bad.join('、'));

let rev = '';
try { rev = execFileSync('git', ['-C', SRC, 'log', '-1', '--format=%h'], { encoding: 'utf8' }).trim(); } catch { /* 不是 git */ }
console.log(`✓ 表演頁已同步（talks@${rev || '?'}）→ handouts/av-perform/`);
console.log(changed.length ? '  已更新：' + changed.join('、') : '  沒有變動');
execFileSync(process.execPath, [path.join(ROOT, 'scripts/build_site.mjs')], { stdio: 'inherit' });
