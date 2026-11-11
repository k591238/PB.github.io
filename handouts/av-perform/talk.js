/* =====================================================================
   talk.js — reads talk.md (+ notes.md) and turns it into the lecture pages.
   Used by index.html (slides) and presenter.html (speaker window).
   Syntax is documented in README.md; this file normally never needs editing.
   ===================================================================== */

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// inline marks: **bold**  ==accent==  ((muted))
export const inline = s => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/==(.+?)==/g, '<span class="acc">$1</span>')
  .replace(/\(\((.+?)\)\)/g, '<span class="muted">$1</span>');

const CHAPTER_KEYS = new Set(['layout', 'nav', 'bg', 'visual', 'title', 'sub', 'who', 'role', 'line']);
const COMPONENTS = new Set(['path', 'pillars', 'flow', 'timeline', 'adsr', 'qr']);

/* ---------- parse ---------- */
export function parseTalk(src){
  const lines = src.replace(/<!--[\s\S]*?-->/g, m => '\n'.repeat((m.match(/\n/g) || []).length)).split(/\r?\n/);
  const talk = {meta:{}, chapters:[], errors:[]};
  let ch = null, comp = null, item = null, inMeta = false;
  const err = (n, msg) => talk.errors.push(`talk.md 第 ${n + 1} 行：${msg}`);
  lines.forEach((raw, n) => {
    const line = raw.trim();
    const h1 = /^#\s+(\S+)\s*(.*)$/.exec(line);
    if (h1 && !comp){
      ch = {num:h1[1], title:h1[2] || '', meta:{}, blocks:[], line:n};
      talk.chapters.push(ch); inMeta = true; return;
    }
    if (!ch){                                            // document settings before the first chapter
      const kv = /^(\w+):\s*(.*)$/.exec(line);
      if (kv) talk.meta[kv[1]] = kv[2];
      return;
    }
    if (inMeta){
      const kv = /^(\w+):\s*(.*)$/.exec(line);
      if (kv && CHAPTER_KEYS.has(kv[1])){ ch.meta[kv[1]] = kv[2]; return; }
      if (line === '') return;
      inMeta = false;
    }
    if (/^:::/.test(line)){
      const name = line.slice(3).trim();
      if (!name){ comp = null; item = null; return; }   // closing ::: (a stray one is harmless)
      if (comp){ err(n, `「${comp.name}」還沒用 ::: 結束，又開了新的「${name}」`); return; }
      if (!COMPONENTS.has(name)){ err(n, `不認得的元件「${name}」（可用：${[...COMPONENTS].join('、')}）`); return; }
      comp = {type:'comp', name, items:[], lines:[], kv:{}, line:n}; ch.blocks.push(comp); item = null; return;
    }
    if (comp){
      if (line === '') return;
      const h2 = /^##\s+(.*)$/.exec(line);
      if (h2){ item = {head:h2[1].split('|').map(s => s.trim()), bullets:[], lines:[], kv:{}}; comp.items.push(item); return; }
      const li = /^-\s+(.*)$/.exec(line);
      const kv = /^(tags|contact):\s*(.*)$/.exec(line);
      const tgt = item || comp;
      if (li) tgt.bullets ? tgt.bullets.push(li[1]) : (comp.bullets = comp.bullets || []).push(li[1]);
      else if (kv) tgt.kv[kv[1]] = kv[2];
      else tgt.lines.push(line);
      return;
    }
    if (line === ''){ ch.blocks.push({type:'gap'}); return; }
    let m;
    if ((m = /^>\s?(.*)$/.exec(line))) push(ch, 'lead', m[1]);
    else if ((m = /^~\s?(.*)$/.exec(line))) push(ch, 'ex', m[1]);
    else if ((m = /^-\s+(.*)$/.exec(line))) push(ch, 'ul', m[1]);
    else if ((m = /^=>\s*(.*)$/.exec(line))){ const [label, action = 'perform'] = m[1].split('|').map(s => s.trim()); ch.blocks.push({type:'button', label, action}); }
    else if (/^##\s/.test(line)) err(n, '「## 」只能用在 ::: 元件裡面');
    else push(ch, 'p', line);
  });
  if (comp) err(comp.line, `「${comp.name}」少了結尾的 :::`);
  return talk;
}
// consecutive lines of the same kind join into one block
function push(ch, type, text){
  const last = ch.blocks[ch.blocks.length - 1];
  if (last && last.type === type) last.lines.push(text);
  else ch.blocks.push({type, lines:[text]});
}

/* notes.md: "# 01" headings, free text below */
export function parseNotes(src){
  const out = {}, plan = {}; let key = null;
  src.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/).forEach(l => {
    const h = /^#\s+(\S+)(.*)$/.exec(l.trim());
    if (h){ key = h[1]; out[key] = []; const m = /(\d+(?:\.\d+)?)\s*分/.exec(h[2]); if (m) plan[key] = +m[1]; return; }
    if (key) out[key].push(l);
  });
  for (const k in out) out[k] = out[k].join('\n').trim();
  Object.defineProperty(out, '_plan', {value:plan});   // minutes per chapter, from "# 02 10分"
  return out;
}
export function notesHTML(text){
  if (!text) return '<p class="none">（這一章沒有講稿）</p>';
  let html = '', ul = false;
  for (const l of text.split('\n')){
    const t = l.trim(), m = /^(\s*)-\s+(.*)$/.exec(l);
    if (m){ if (!ul){ html += '<ul>'; ul = true; } html += `<li class="${m[1].length ? 'sub' : ''}">${inline(m[2])}</li>`; continue; }
    if (ul){ html += '</ul>'; ul = false; }
    if (t) html += `<p>${inline(t)}</p>`;
  }
  return html + (ul ? '</ul>' : '');
}

/* ---------- timeline work line ---------- */
function parseWork(s){
  const f = s.split('|').map(x => x.trim());
  const w = {zh:f[0] || '', en:f[1] || '', cat:f[2] || '', role:f[3] || '', where:f[4] || ''};
  for (const x of f.slice(5)){
    const i = x.indexOf(':'); if (i < 0) continue;
    const k = x.slice(0, i).trim(), v = x.slice(i + 1).trim();
    if (k === 'yt') w.yt = v;
    else if (k === 'embed') w.embed = v;
    else if (k === '照片' || k === 'ph'){ const [ph, n] = v.split(/\s+/); w.ph = ph; w.n = +n || 1; }
    else if (k === '註' || k === 'note') w.note = v;
  }
  return w;
}

/* ---------- render ---------- */
const gv = (kind, cls) => `<canvas class="gv ${cls}" data-gv="${kind}" aria-hidden="true"></canvas>`;
const ARROW = `<i>${gv('arrow', 'arr')}</i>`;

function renderComp(c, ctx){
  const I = c.items;
  switch (c.name){
    case 'path':
      return `<div class="path">${I.map(it => {
        const [b, small = '', span = ''] = it.head;
        const tags = it.kv.tags ? `<div class="tags">${it.kv.tags.split(/[、,，]/).map(t => `<em>${inline(t.trim())}</em>`).join('')}</div>` : '';
        const ul = it.bullets.length ? `<ul>${it.bullets.map(x => `<li>${inline(x)}</li>`).join('')}</ul>` : '';
        return `<div><small>${inline(small)}</small><b>${inline(b)}</b><span>${inline(span)}</span>${ul}${tags}${it.lines.map(l => `<p>${inline(l)}</p>`).join('')}</div>`;
      }).join(ARROW)}</div>`;
    case 'pillars':
      return `<div class="pillars">${I.map(it => `<div>${it.head[1] ? gv(it.head[1], 'icon') : ''}<b>${inline(it.head[0])}</b><p>${it.lines.map(inline).join('<br>')}</p></div>`).join('')}</div>`;
    case 'flow':
      return `<div class="flow">${I.map((it, k) => `<div${k === I.length - 1 ? ' class="out"' : ''}>${it.head[1] ? gv(it.head[1], 'icon sm') : ''}<small>${inline(it.head[0])}</small>${it.lines.map(inline).join('<br>')}</div>`).join('<i>→</i>')}</div>`;
    case 'timeline':
      ctx.timeline = I.map(it => ({y:it.head[0], ms:it.head.slice(1).join(' | '), works:it.bullets.map(parseWork)}));
      ctx.sectionClass.push('has-timeline');
      return `<div class="years" id="years"></div><div class="wgrid" id="wgrid"></div>`;
    case 'adsr':
      return ADSR_HTML(c.lines.length ? c.lines.map(inline).join('<br>') : '一個按鍵，同一條曲線，<br>同時控制<b>聲音大小</b>和<b>畫面參數</b>。');
    case 'qr':
      return `<div class="qrs">${(c.bullets || []).map(b => { const [label, url, img] = b.split('|').map(s => s.trim());
        return `<a href="${esc(url)}" target="_blank" rel="noopener"><img alt="${esc(label)} QR" src="img/${esc(img)}"><b>${inline(label)}</b></a>`; }).join('')}</div>`
        + (c.kv.contact ? `<div class="contact">${inline(c.kv.contact)}</div>` : '');
  }
  return '';
}

function renderChapter(ch, i, ctx){
  ctx.sectionClass = [];
  const M = ch.meta, id = 's' + String(i).padStart(2, '0');
  let body = '';
  if (M.layout === 'cover'){
    ctx.sectionClass.push('hero');
    body = (M.visual ? gv(M.visual, 'hero-gv') : '')
      + `<div class="num">${esc(ch.num)}</div>`
      + `<h1>${inline(M.title || ch.title)}</h1>`
      + (M.sub ? `<p class="sub">${inline(M.sub)}</p>` : '')
      + (M.who ? `<div class="who">${inline(M.who)}${M.role ? `<small>${inline(M.role)}</small>` : ''}</div>` : '')
      + (M.line ? `<p class="talk">${inline(M.line)}</p>` : '');
  } else {
    body = (M.bg ? gv(M.bg, 'bg-gv') : '') + `<div class="num">${esc(ch.num)}</div><h2>${inline(ch.title)}</h2>`;
    if (M.bg) ctx.sectionClass.push('has-bg');
  }
  for (const b of ch.blocks){
    if (b.type === 'comp') body += renderComp(b, ctx);
    else if (b.type === 'lead') body += `<p class="lead">${b.lines.map(inline).join('<br>')}</p>`;
    else if (b.type === 'ex') body += `<p class="ex">${b.lines.map(inline).join('<br>')}</p>`;
    else if (b.type === 'p') body += `<p>${b.lines.map(inline).join('<br>')}</p>`;
    else if (b.type === 'ul') body += `<ul class="plain">${b.lines.map(x => `<li>${inline(x)}</li>`).join('')}</ul>`;
    else if (b.type === 'button'){
      const a = b.action, attr = a === 'perform' || a === 'lecture' ? `data-view="${esc(a)}"` : `data-act="${esc(a)}"`;
      body += `<div class="row"><button class="big" ${attr}>${inline(b.label)}</button></div>`;
    }
  }
  const nav = M.nav || (M.layout === 'cover' ? '封面' : ch.title);
  return `<section id="${id}" class="${ctx.sectionClass.join(' ')}" data-title="${esc(nav)}" data-num="${esc(ch.num)}">${body}</section>`;
}

export function renderTalk(talk){
  const ctx = {timeline:[]};
  const html = talk.chapters.map((ch, i) => renderChapter(ch, i, ctx)).join('\n');
  return {html, timeline:ctx.timeline};
}

/* load both files; notes are optional (they stay private) */
export async function loadTalk(){
  const res = await fetch('talk.md', {cache:'no-cache'});
  if (!res.ok) throw new Error('讀不到 talk.md（' + res.status + '）');
  const talk = parseTalk(await res.text());
  // only: perform（公開的表演體驗）不讀講稿
  if (talk.meta.only === 'perform') talk.notes = {};
  else try{ const r = await fetch('notes.md', {cache:'no-cache'}); talk.notes = r.ok ? parseNotes(await r.text()) : {}; }catch(e){ talk.notes = {}; }
  talk.plan = talk.notes._plan || {};
  return talk;
}

/* the ADSR demo (04) is an interactive widget wired up in index.html */
const ADSR_HTML = lead => `<div class="two">
  <div>
    <svg class="diag" viewBox="0 0 340 120" fill="none" stroke="currentColor" stroke-width="1.4">
      <rect x="4" y="44" width="52" height="32" rx="4"/><text x="30" y="65" text-anchor="middle" fill="currentColor" stroke="none" font-size="13">按鍵</text>
      <path d="M58 60h24" marker-end="url(#ar)"/>
      <rect x="86" y="34" width="98" height="52" rx="4"/>
      <path d="M94 78 L108 44 L124 62 L156 62 L176 78" stroke="#e0201c" stroke-width="2"/>
      <text x="135" y="100" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">同一條 ADSR</text>
      <path d="M186 50 L222 24" marker-end="url(#ar)"/><path d="M186 70 L222 96" marker-end="url(#ar)"/>
      <rect x="226" y="6" width="110" height="34" rx="4"/><text x="281" y="28" text-anchor="middle" fill="currentColor" stroke="none" font-size="13">🔊 音量</text>
      <rect x="226" y="80" width="110" height="34" rx="4"/><text x="281" y="102" text-anchor="middle" fill="currentColor" stroke="none" font-size="13">✦ 畫面參數</text>
      <defs><marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="currentColor" stroke="none"/></marker></defs>
    </svg>
    <p class="lead">${lead}</p>
  </div>
  <div>
    <div class="adsr4">
      <div><b>A</b><span>起音</span><small>按下 → 到最大</small></div>
      <div><b>D</b><span>衰減</span><small>掉到持續音量</small></div>
      <div><b>S</b><span>持續</span><small>按住時保持</small></div>
      <div><b>R</b><span>釋放</span><small>放開後消失</small></div>
    </div>
    <canvas id="scope" width="680" height="180"></canvas>
    <div class="adsrtxt" id="adsrtxt">— 按任一字母鍵看曲線 —</div>
    <div class="row" style="margin-top:1rem"><button data-act="rack">→ 表演頁開合成器（M）</button></div>
  </div>
</div>`;
