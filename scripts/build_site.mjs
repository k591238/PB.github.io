#!/usr/bin/env node
// 產生腳本：讀 data/ 與 content/，產生網站裡「由腳本產生」的部分。
//
//   node scripts/build_site.mjs
//
// 產生：
//   1. projects/{id}/index.html   每件作品的獨立網頁（整個檔案）
//   2. index.html 的作品列表卡片（BUILD:works-grid 標記之間）
//   3. sitemap.xml
//
// 資料來源：
//   data/site.json             網站網址（換網域時只改這裡）
//   data/projects.json         作品資料，陣列順序＝列表顯示順序
//   content/projects/{id}.html 作品頁內容
//   index.html 的 SHARED:chrome 標記之間   選單與頁首（複製到每個作品頁）
//
// ⚠️ 產生的檔案和標記之間的內容每次都會被覆蓋，不要手改，要改請改來源再重跑。

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const site = JSON.parse(read('data/site.json'));
const projects = JSON.parse(read('data/projects.json'));
const BASE = site.baseUrl;

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── 檢查資料 ────────────────────────────────────────
const REQUIRED = ['id', 'title', 'year', 'meta', 'category', 'thumb', 'description'];
const errors = [];
const seen = new Set();
const index0 = read('index.html');
for (const [i, p] of projects.entries()) {
  const where = `data/projects.json 第 ${i + 1} 筆（${p.id ?? '沒有 id'}）`;
  for (const k of REQUIRED) if (p[k] === undefined || p[k] === '') errors.push(`${where}：缺少 ${k}`);
  if (p.id && !/^[a-z0-9-]+$/.test(p.id)) errors.push(`${where}：id 只能用小寫英文、數字、連字號`);
  if (seen.has(p.id)) errors.push(`${where}：id 重複`);
  seen.add(p.id);
  if (p.thumb && !fs.existsSync(path.join(ROOT, p.thumb))) errors.push(`${where}：找不到縮圖 ${p.thumb}`);
  if (p.id && !fs.existsSync(path.join(ROOT, `content/projects/${p.id}.html`))) errors.push(`${where}：找不到作品內容 content/projects/${p.id}.html`);
  if (p.category && !index0.includes(`data-filter="${p.category}"`)) errors.push(`${where}：分類 ${p.category} 沒有對應的篩選按鈕（data-filter="${p.category}"）`);
}
if (errors.length) {
  console.error('✗ 資料有問題，沒有寫入任何檔案：\n  ' + errors.join('\n  '));
  process.exit(1);
}

const changed = [];
function writeIfChanged(file, content) {
  const full = path.join(ROOT, file);
  const old = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
  // 工作區可能是 CRLF（git autocrlf），比對時忽略換行差異，寫入時沿用原本的換行
  const eol = old && old.includes('\r\n') ? '\r\n' : '\n';
  const out = content.replace(/\r?\n/g, eol);
  if (old === out) return false;
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, out);
  changed.push(file);
  return true;
}
function between(src, start, end) {
  const a = src.indexOf(start), b = src.indexOf(end);
  if (a < 0 || b < 0 || b < a) throw new Error(`找不到標記 ${start} … ${end}`);
  return [a, b];
}

// ── 1. 作品頁 ────────────────────────────────────────
const [ca, cb] = between(index0, '<!-- SHARED:chrome:start', '<!-- SHARED:chrome:end -->');
const chrome = index0.slice(index0.indexOf('\n', ca) + 1, cb).replace(/\r\n/g, '\n').trimEnd();
const headLink = re => (index0.match(re) || [''])[0];
const fontsLink = headLink(/<link\s+href="https:\/\/fonts\.googleapis\.com[^>]*>/);
const ogImage = p => {
  const og = `assets/images/projects/${p.id}/og.jpg`;
  return BASE + (fs.existsSync(path.join(ROOT, og)) ? og : p.thumb);
};

const person = {
  '@type': 'Person',
  name: 'Wu Cheng-Ru',
  alternateName: ['吳承儒', 'PB', 'Pen_bit', 'penbit'],
  url: BASE,
};

for (const p of projects) {
  const url = `${BASE}projects/${p.id}/`;
  const title = `${p.title}｜吳承儒 PB`;
  let raw = read(`content/projects/${p.id}.html`).replace(/\r\n/g, '\n').trimEnd();
  // 頁面最上方的第一個媒體如果是圖片（通常是橫幅大圖），改成最優先載入：
  // 拿掉 loading="lazy"、加 fetchpriority="high"，讓主要畫面最快出現
  const firstMedia = raw.match(/<(img|video|iframe)\b[^>]*>/);
  if (firstMedia && firstMedia[1] === 'img') {
    const tag = firstMedia[0];
    const hero = tag.replace(/\s+loading="lazy"/, '').replace(/^<img\b/, '<img fetchpriority="high"');
    raw = raw.replace(tag, hero);
  }
  const content = raw.split('\n').map(l => (l ? '      ' + l : l)).join('\n');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    url,
    image: ogImage(p),
    description: p.description,
    dateCreated: String(p.year),
    genre: p.meta,
    creator: person,
    isPartOf: { '@type': 'WebSite', name: '吳承儒 Wu Cheng-Ru（PB）', url: BASE },
  };
  const page = `<!DOCTYPE html>
<!-- 由 scripts/build_site.mjs 產生，不要手改。內容請改 content/projects/${p.id}.html，資料請改 data/projects.json -->
<html lang="zh-Hant">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base href="../../" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(p.description)}" />
  <link rel="canonical" href="${url}" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="吳承儒 Wu Cheng-Ru（PB）" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(p.description)}" />
  <meta property="og:image" content="${ogImage(p)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="zh_TW" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(p.description)}" />
  <meta name="twitter:image" content="${ogImage(p)}" />

  <script type="application/ld+json">
${JSON.stringify(ld, null, 2).replace(/</g, '\\u003c').split('\n').map(l => '  ' + l).join('\n')}
  </script>

  <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml" />
  ${fontsLink}
  <link rel="stylesheet" href="assets/css/style.css" />
</head>

<body class="page-project" data-project="${p.id}">

  <div class="cursor-dot" id="cursor-dot"></div>
  <div class="cursor-ring" id="cursor-ring"></div>

${chrome}

  <main class="view active" id="view-project-detail">
    <a class="btn-back" href="#projects">&lt;- Back to Projects</a>
    <div id="project-detail-content">
${content}
    </div>
  </main>

  <button id="scroll-to-top" class="scroll-to-top" aria-label="Scroll to top">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <polyline points="4,13 10,7 16,13" />
    </svg>
  </button>

  <script src="assets/js/main.js"></script>
</body>

</html>
`;
  writeIfChanged(`projects/${p.id}/index.html`, page);
}

// 刪掉資料表裡已經沒有的作品頁
const projDir = path.join(ROOT, 'projects');
if (fs.existsSync(projDir)) {
  for (const d of fs.readdirSync(projDir)) {
    if (!seen.has(d) && fs.existsSync(path.join(projDir, d, 'index.html'))) {
      fs.rmSync(path.join(projDir, d, 'index.html'));
      try { fs.rmdirSync(path.join(projDir, d)); } catch { /* 資料夾裡還有其他檔案就留著 */ }
      changed.push(`projects/${d}/（已刪除）`);
    }
  }
}

// ── 2. 作品列表卡片 ──────────────────────────────────
let cards = '', lastYear;
for (const p of projects) {
  if (p.year !== lastYear) { cards += `\n        <!-- ${p.year} -->\n`; lastYear = p.year; }
  cards += `        <a class="work" href="projects/${p.id}/" data-project="${p.id}" data-category="${esc(p.category)}">
          <div class="work-inner">
            <img class="work-thumb" src="${esc(p.thumb)}" loading="lazy" alt="${esc(p.alt || p.title)}">
          </div>
          <div class="work-info">
            <div class="work-title">${esc(p.title)}</div>
            <div class="work-meta">${p.year} &nbsp;·&nbsp; ${esc(p.meta)}</div>
          </div>
        </a>
`;
}
{
  const START = '<!-- BUILD:works-grid:start（由 scripts/build_site.mjs 產生，不要手改） -->';
  const src = index0.replace(/\r\n/g, '\n');
  const [a, b] = between(src, START, '<!-- BUILD:works-grid:end -->');
  const indent = src.slice(src.lastIndexOf('\n', a) + 1, a);
  writeIfChanged('index.html', src.slice(0, a + START.length) + '\n' + cards + indent + src.slice(b));
}

// ── 3. sitemap.xml ───────────────────────────────────
function lastmod(...files) {
  let latest = '';
  for (const file of files) {
    let d = new Date().toISOString().slice(0, 10);
    try {
      const dirty = execFileSync('git', ['status', '--porcelain', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim();
      if (!dirty) {
        const c = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim();
        if (c) d = c.slice(0, 10);
      }
    } catch { /* 不是 git 環境就用今天 */ }
    if (d > latest) latest = d;
  }
  return latest;
}
const urls = [{ loc: '', files: ['index.html'] }, { loc: 'handouts/', files: ['handouts/index.html'] }];
for (const d of fs.readdirSync(path.join(ROOT, 'handouts'), { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name).sort()) {
  if (fs.existsSync(path.join(ROOT, 'handouts', d, 'index.html'))) urls.push({ loc: `handouts/${d}/`, files: [`handouts/${d}/index.html`] });
}
for (const p of projects) urls.push({ loc: `projects/${p.id}/`, files: [`content/projects/${p.id}.html`, 'data/projects.json'] });
for (const f of fs.readdirSync(path.join(ROOT, 'assets/cv')).filter(f => f.endsWith('.pdf')).sort()) {
  urls.push({ loc: `assets/cv/${f}`, files: [`assets/cv/${f}`] });
}
writeIfChanged('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- 由 scripts/build_site.mjs 產生，不要手改 -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${esc(BASE + u.loc)}</loc>
    <lastmod>${lastmod(...u.files)}</lastmod>
  </url>`).join('\n')}
</urlset>
`);

console.log(`✓ ${projects.length} 件作品`);
console.log(changed.length ? '  已更新：' + (changed.length > 8 ? `${changed.length} 個檔案` : changed.join('、')) : '  沒有變動');
