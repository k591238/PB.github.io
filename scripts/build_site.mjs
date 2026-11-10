#!/usr/bin/env node
// 產生腳本：讀 data/ 的資料，更新網站裡「由腳本產生」的部分。
//
//   node scripts/build_site.mjs
//
// 目前產生：
//   1. index.html 的作品列表卡片（BUILD:works-grid 標記之間）
//   2. assets/js/main.js 的 projectsData（BUILD:projects-data 標記之間）
//   3. sitemap.xml
//
// 資料來源：
//   data/site.json      網站網址（換網域時只改這裡）
//   data/projects.json  作品資料，陣列順序＝列表顯示順序
//
// ⚠️ 標記之間的內容每次都會被覆蓋，不要手改，要改請改 data/ 再重跑。

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const site = JSON.parse(read('data/site.json'));
const projects = JSON.parse(read('data/projects.json'));

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── 檢查資料 ────────────────────────────────────────
const REQUIRED = ['id', 'title', 'year', 'meta', 'category', 'thumb'];
const errors = [];
const seen = new Set();
const html0 = read('index.html');
for (const [i, p] of projects.entries()) {
  const where = `data/projects.json 第 ${i + 1} 筆（${p.id ?? '沒有 id'}）`;
  for (const k of REQUIRED) if (p[k] === undefined || p[k] === '') errors.push(`${where}：缺少 ${k}`);
  if (seen.has(p.id)) errors.push(`${where}：id 重複`);
  seen.add(p.id);
  if (p.thumb && !fs.existsSync(path.join(ROOT, p.thumb))) errors.push(`${where}：找不到縮圖 ${p.thumb}`);
  if (p.id && !html0.includes(`<template id="template-${p.id}">`)) errors.push(`${where}：index.html 裡沒有 <template id="template-${p.id}">`);
  if (p.category && !html0.includes(`data-filter="${p.category}"`)) errors.push(`${where}：分類 ${p.category} 沒有對應的篩選按鈕（data-filter="${p.category}"）`);
}
if (errors.length) {
  console.error('✗ 資料有問題，沒有寫入任何檔案：\n  ' + errors.join('\n  '));
  process.exit(1);
}

// ── 替換標記之間的內容 ──────────────────────────────
function replaceBetween(file, start, end, body) {
  const src = read(file);
  const a = src.indexOf(start), b = src.indexOf(end);
  if (a < 0 || b < 0 || b < a) throw new Error(`${file} 找不到標記 ${start} … ${end}`);
  const lineStart = src.lastIndexOf('\n', a) + 1;
  const indent = src.slice(lineStart, a);
  const next = src.slice(0, a + start.length) + '\n' + body + indent + src.slice(b);
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const out = next.replace(/\r?\n/g, eol);
  if (out !== src) fs.writeFileSync(path.join(ROOT, file), out);
  return out !== src;
}

// 1. 作品列表卡片
let cards = '', lastYear;
for (const p of projects) {
  if (p.year !== lastYear) { cards += `\n        <!-- ${p.year} -->\n`; lastYear = p.year; }
  cards += `        <a class="work" href="#project/${p.id}" data-project="${p.id}" data-category="${esc(p.category)}">
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
const changed = [];
if (replaceBetween('index.html', '<!-- BUILD:works-grid:start（由 scripts/build_site.mjs 產生，不要手改） -->',
  '<!-- BUILD:works-grid:end -->', cards)) changed.push('index.html（作品卡片）');

// 2. main.js 的 projectsData
const KEEP = ['id', 'title', 'year', 'meta', 'category', 'thumb', 'youtubeId'];
const dataJs = 'const projectsData = ' + JSON.stringify(
  projects.map(p => Object.fromEntries(KEEP.filter(k => p[k] !== undefined).map(k => [k, p[k]]))), null, 2) + ';\n';
if (replaceBetween('assets/js/main.js', '// BUILD:projects-data:start（由 scripts/build_site.mjs 產生，不要手改）',
  '// BUILD:projects-data:end', dataJs)) changed.push('assets/js/main.js（projectsData）');

// 3. sitemap.xml
function lastmod(file) {
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim();
    if (!dirty) {
      const d = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim();
      if (d) return d.slice(0, 10);
    }
  } catch { /* 不是 git 環境就用今天 */ }
  return new Date().toISOString().slice(0, 10);
}
const urls = [{ loc: '', file: 'index.html' }];
for (const d of fs.readdirSync(path.join(ROOT, 'handouts'), { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name).sort()) {
  if (fs.existsSync(path.join(ROOT, 'handouts', d, 'index.html'))) urls.push({ loc: `handouts/${d}/`, file: `handouts/${d}/index.html` });
}
urls.splice(1, 0, { loc: 'handouts/', file: 'handouts/index.html' });
for (const f of fs.readdirSync(path.join(ROOT, 'assets/cv')).filter(f => f.endsWith('.pdf')).sort()) {
  urls.push({ loc: `assets/cv/${f}`, file: `assets/cv/${f}` });
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- 由 scripts/build_site.mjs 產生，不要手改 -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${esc(site.baseUrl + u.loc)}</loc>
    <lastmod>${lastmod(u.file)}</lastmod>
  </url>`).join('\n')}
</urlset>
`;
const smPath = path.join(ROOT, 'sitemap.xml');
const smOld = fs.existsSync(smPath) ? fs.readFileSync(smPath, 'utf8').replace(/\r\n/g, '\n') : '';
if (smOld !== sitemap) { fs.writeFileSync(smPath, sitemap); changed.push('sitemap.xml'); }

console.log(`✓ ${projects.length} 件作品`);
console.log(changed.length ? '  已更新：' + changed.join('、') : '  沒有變動');
