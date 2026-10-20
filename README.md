# PB.github.io — AI Agent 開發移交說明書

> **給下一位 AI Agent 的讀我文件**  
> 本文件完整記錄專案架構、規範與開發狀態，閱讀後可直接接手繼續開發。  
> 最後更新：2026-10-20

---

## 📁 專案基本資訊

| 項目 | 說明 |
|------|------|
| **性質** | 個人作品集網站（Single Page Application） |
| **技術棧** | 純 HTML + Vanilla CSS + Vanilla JS（無框架、無建置工具） |
| **部署** | GitHub Pages（push 即生效，無需 build 流程） |
| **正式網址** | `https://k591238.github.io/PB.github.io/` — repo 名稱是 `PB.github.io`，帳號是 `k591238`，兩者不相符，所以這是 **Project site**，不是 User site，網址一定要帶 `/PB.github.io/` 路徑，**不可省略** |
| **主要檔案** | `index.html`（~2790行）、`assets/css/style.css`（~1930行）、`assets/js/main.js`（~650行） |
| **語系** | 中英混排，介面部分英文，內容部分繁體中文 |

---

## 🗂 完整檔案結構

```
PB.github.io/
├── index.html                    ← 整個 SPA 的唯一 HTML 入口，含所有 View 和 Template
├── .nojekyll                      ← 告訴 GitHub 不要跑 Jekyll build（本專案未使用 Jekyll）
├── robots.txt                     ← 搜尋引擎爬蟲規則（見下方「SEO / Search Console 設定」）
├── sitemap.xml                    ← 網站地圖，提交給 Google Search Console 用
├── assets/
│   ├── css/
│   │   └── style.css             ← 所有樣式（Design Tokens + 全部元件 CSS）
│   ├── js/
│   │   ├── main.js               ← SPA 路由器、projectsData、SoundCloud 整合
│   │   └── particle.js           ← 首頁粒子背景效果（獨立模組，勿修改）
│   ├── images/
│   │   ├── projects/
│   │   │   ├── p1/               ← 視感認知 Mind Fluid（pic_*.webp）
│   │   │   ├── p2/               ← 認夢 Dream Percept（work_*.webp）
│   │   │   ├── p3/               ← FUTURE VISION LAB 2023（work_*.webp）
│   │   │   ├── p4/               ← 光之曲幕 DJ Friday Night（work_*.webp, thumb.webp）
│   │   │   ├── p5/               ← Thiann 聽 — Sound Campus 26, Linz（work_*.webp, thumb.webp）
│   │   │   ├── p6/               ← 視感認知 Visual Cognition — 新竹聲音藝術節（work_*.webp, banner.webp, thumb.webp）
│   │   │   ├── e1/               ← 聽說 Whisper（work_*.webp）
│   │   │   ├── e2/               ← 繫 Sync（Exhibition/, Exhibition_Documentation/, performance/）
│   │   │   ├── e3/               ← 鹹淡適中 Glub Glub（work_*.webp）
│   │   │   ├── c1/               ← 101 手錶發表會商演（work_01~29.webp）
│   │   │   ├── c2/               ← Live VJ Lab 工作營（work_*.webp）
│   │   │   ├── c3/               ← 離水山：再臨（work_01~14.webp）
│   │   │   ├── co1/              ← 翼手龍摩天劇院（work_*.webp）
│   │   │   ├── co2/              ← VIVIDO: re-Action（work_*.webp）
│   │   │   ├── co3/              ← 樓頂《自動販賣機》（work_*.webp, thumb.webp）
│   │   │   └── ev1/              ← PXP 2026 藝術家短講暨工作坊助教（work_*.webp, banner.webp, thumb.webp）
│   │   └── about/                ← 關於頁照片
│   └── videos/
│       └── projects/
│           ├── p3/               ← FUTURE VISION LAB 影片 (mp4)
│           ├── c1/               ← 101 商演影片 (mp4)
│           └── e3/               ← 鹹淡適中 影片 (mp4)
└── scripts/                      ← Python 圖片轉換工具（開發用，不入 build）
    ├── compress_images.py        ← 批次壓縮圖片
    ├── convert_project.py        ← ★通用轉換腳本，新專案一律用這支（見下方說明），取代「每個專案寫一支 .py」
    └── convert_{id}.py ...       ← 舊專案一次性腳本（已執行過，保留當處理紀錄，不須再用）
```

---

## 🔍 SEO / Search Console 設定

### 網址驗證

`index.html` `<head>` 有 Google Search Console 的驗證標記：
```html
<meta name="google-site-verification" content="I09JSeMzpK0wOkBSF_9H93B7DKekH41CyU5NfwdUOQY" />
```
不要刪除，刪除會導致 Search Console 失去所有權驗證。

### Open Graph / Twitter Card / JSON-LD

`index.html` `<head>` 內有社群分享預覽（og:*、twitter:*）與結構化資料（`application/ld+json`, `@type: Person`），全部指向正式網址 `https://k591238.github.io/PB.github.io/`。**修改網址、標題、簡介、大頭照時，這些標記要跟著同步更新**，否則社群分享卡片或 Google 的理解會跟實際內容不一致。

### ⚠️ robots.txt 的已知限制

`robots.txt` 依照協定規範**只在網域根目錄有效**（`https://k591238.github.io/robots.txt`）。因為本專案是 Project site，實際內容跑在 `/PB.github.io/` 路徑下，repo 裡的 `robots.txt` 只會被服務在 `https://k591238.github.io/PB.github.io/robots.txt`——**這不是搜尋引擎承認的正式位置，形同無效**。要讓它真正生效，必須另外建立一個名稱完全是 `k591238.github.io` 的新 repo 來佔用網域根目錄，目前尚未執行這一步。

### sitemap.xml 的協定限制

Sitemap 只能列出「跟自己同層或更深層」的網址，**不可以搬進子資料夾**（會因為列出的網址層級比 sitemap 本身高而判定無效）。必須維持在 repo 根目錄。

---

## 🏗 SPA 架構說明

### View 系統

網站共有 5 個 View，透過 JS 切換 CSS class `.active`：

| View ID | 說明 |
|---------|------|
| `home` | 首頁（粒子背景 + 大標題） |
| `projects` | 作品列表（JS 動態渲染 `.work` 卡片） |
| `music` | 音樂頁（Vinyl 黑膠播放器 + SoundCloud embed） |
| `about` | 關於（Bio + CV 分頁切換） |
| `project-detail` | 個別作品詳細頁（載入 `<template>` 或 generic layout） |

對應 HTML 結構：
```html
<section class="view" id="view-{id}">...</section>
```

### 核心路由（`main.js`）

```javascript
navigateTo('projects')         // 切換到 projects view（支援 browser history）
openProjectDetail('p4')        // 開啟 project-detail view，載入 template-p4
```

### 作品詳細頁兩種模式

`openProjectDetail(id)` 的判斷邏輯：

1. **自訂 Template 模式**（有 `<template id="template-{id}">`）→ 直接 clone template 內容
2. **Generic Layout 模式**（無對應 template）→ 用 `projectsData` 的 `gallery[]` 自動生成

目前所有主要作品都已有自訂 Template，Generic Layout 為備援。

### ⚠️ `works-grid`（作品列表卡片）是手寫死的 HTML，不是從 projectsData 動態產生的

這是最容易踩的坑：`index.html` 裡 `<div class="works-grid">`（約在 `#view-projects` 內）的每一張卡片都是手寫的 `<div class="work" data-project="{id}" data-category="{category}">...</div>`，**`projectsData` 只用在 `openProjectDetail()` 的 Generic Layout 備援（抓 `thumb`/`gallery`/`youtubeId`）跟文件標題，不會自動長出列表卡片。**

只改 `projectsData` 新增一筆、template 也寫好了，作品還是不會出現在 `/#projects` 列表裡 —— 一定要同時手動在 `works-grid` 補上對應的 `.work` 卡片（見下方「新增作品的完整流程」Step 2.5）。篩選分類(`data-filter`/`data-category`)也是同樣邏輯：按鈕跟卡片都是手寫的純字串比對（`main.js` L391 附近），沒有白名單檢查，新分類只要按鈕跟卡片的字串一致就會動。

---

## 📊 projectsData 說明（`main.js` 頂部）

```javascript
const projectsData = [
  {
    id: 'p4',                                         // 必填，對應 template id 和圖片資料夾名
    title: '光之曲幕 X DJ Friday Night《聲．光．域》',  // 卡片顯示的標題
    year: 2026,                                       // 年份
    meta: 'Performance',                              // 副標（Performance/Exhibition/Case/Collaboration）
    category: 'performance',                          // 篩選分類（小寫）
    thumb: 'assets/images/projects/p4/thumb.webp',   // 作品列表縮圖（必要）
    gallery: ['assets/.../work_01.webp', ...],        // Generic layout 用（有自訂 template 可省略）
    youtubeId: 'TazR2qhRegI'                          // Generic layout 用（可留空 ''）
  },
  ...
]
```

> ✅ 2026-07 已將全部作品的 `thumb`／中文標題換成真實內容，`placehold.co` 佔位圖已清除。新增作品請直接比照既有筆目格式。

---

## 🎨 CSS 設計系統（`style.css`）

### Design Tokens

```css
--bg: #101116          /* 主背景色（深黑） */
--accent: #c8ee60      /* 強調色（螢光黃綠） */
--text: #e8e8e8        /* 主文字色 */
--muted: #888          /* 次要文字色 */
--font: 'Outfit', ...  /* 主字型（Google Fonts） */
--font-heading: ...    /* 標題字型 */
```

### 圖片格線：inline `display: grid`（實際使用中的寫法，非 class 系統）

> ⚠️ **文件歷史註記**：這份文件曾在 2026-07 描述一套 `.proj-gallery` class 系統（`cols-2`/`cols-3`/`natural`/`compact` 等），但那套 class **從未真正寫進 `style.css`**，`index.html` 裡也沒有任何 template 用過它 —— 純屬文件跟實際程式碼對不上。2026-10 盤點後移除了那段描述，改記錄全部 13+ 個 template 實際上在用的寫法。若之後真的想做成可複用的 class（順便補上目前缺的手機版自動收欄），再另外動工，記得同步更新這裡。

所有 template 的圖片格線都是**直接在 `<div>` 上寫 inline `display:grid`**，沒有共用 class，也**沒有手機版自動收欄的 media query**（窄螢幕一樣維持 2/3 欄，只是圖片變小）。範例：

```html
<!-- 2 欄，裁切成 3:2 -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px auto; max-width: 1400px;">
  <img src="..." alt="具體描述這張照片的內容" loading="lazy" style="width: 100%; aspect-ratio: 3 / 2; object-fit: cover;">
  <img src="..." alt="..." loading="lazy" style="width: 100%; aspect-ratio: 3 / 2; object-fit: cover;">
</div>

<!-- 3 欄，寫法相同，grid-template-columns 改 1fr 1fr 1fr -->

<!-- 直式照片：不要用 aspect-ratio:3/2 硬裁，拿掉 aspect-ratio/object-fit，只留 width:100%，
     並把 max-width 縮到 900px 左右做「併排縮小」，避免直式照片單獨撐成一張大圖 -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px auto; max-width: 900px;">
  <img src="..." alt="..." loading="lazy" style="width: 100%;">
  <img src="..." alt="..." loading="lazy" style="width: 100%;">
</div>

<!-- 直式/橫式混排在同一列時，加 align-items: start，避免矮的那張被拉伸 -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px auto; max-width: 1400px; align-items: start;">
  ...
</div>
```

**慣例**：
- 橫式紀錄照常用 `aspect-ratio: 3/2; object-fit: cover`（裁切置中）
- 直式照片**不要單獨放成一張撐滿寬度的大圖**；併排縮小（2 欄、`max-width` 收窄到 900px 左右），或跟其他照片混排
- `alt` 文字要具體描述畫面內容（人物動作、投影畫面內容等），不要用「Detail」這種通用字（2026-08 已把全站舊的通用 alt 文字清掉，新增圖片比照辦理）

### 其他重要 CSS Class

| Class | 說明 |
|-------|------|
| `.detail-banner` | 作品詳細頁頂部橫幅大圖（100%寬，21:9）|
| `.detail-grid-2` / `.detail-grid-3` | `template-c3` 專用格線（勿刪除） |
| `.yt-wrapper.detail-video-wrap` | YouTube iframe 16:9 響應式容器 |
| `.credits-section` | Credits 區塊樣式 |
| `.reveal` | IntersectionObserver scroll-reveal 目標 |
| `.work` | 作品卡片（也是 scroll-reveal 目標） |
| `.project-info.p-content` | 詳細頁文字區（有 max-width 和 padding 限制） |
| `.detail-text-block` | `template-c3` 用的舊文字區塊樣式 |

---

## 📋 Template 撰寫標準規範

新增作品時，在 `index.html` 尾部（`<!-- 懸浮回到頂部按鈕 -->` 之前）新增 `<template>`：

```html
<template id="template-{id}">
  <!-- ── 1. 標題區塊 ── -->
  <div class="project-header" style="text-align: left; margin-bottom: 5px;">
    <h1 class="detail-title">作品名稱 Work Title</h1>
  </div>
  <div class="project-info" style="margin-bottom: 60px;">
    <h3 style="font-size: 0.85rem; color: var(--text); margin-bottom: 10px;">副標 / 系列名</h3>
    <h3 style="font-size: 0.75rem; color: var(--muted); margin-top: 30px; margin-bottom: 8px;">Performance / Collaboration:</h3>
    <p style="font-size: 0.95rem; color: var(--text); margin-bottom: 4px;">Date: YYYY/MM/DD</p>
    <p style="font-size: 0.95rem; color: var(--text); margin-bottom: 12px;">Venue: 場地名稱</p>
  </div>

  <!-- ── 2. Banner 大圖 ── -->
  <img src="assets/images/projects/{id}/banner.webp" alt="作品名稱" loading="lazy" class="detail-banner">

  <!-- ── 3. 介紹文字（可選）── -->
  <div class="project-info p-content" style="margin-top: 80px; margin-bottom: 60px; font-size: 1rem; line-height: 1.8; color: #ddd;">
    <h2 style="font-size: 1.5rem; letter-spacing: 0.05em; margin-bottom: 20px;">作品簡介</h2>
    <p>介紹文字...</p>
  </div>

  <!-- ── 4. YouTube 影片（可選）── -->
  <div class="yt-wrapper detail-video-wrap" style="margin-bottom: 60px;">
    <iframe title="YouTube video player" frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen
      src="https://www.youtube.com/embed/{VIDEO_ID}">
    </iframe>
  </div>

  <!-- ── 5. 圖片格線（inline display:grid，見「圖片格線」章節）── -->
  <div class="project-info p-content" style="margin-top: 40px; margin-bottom: 20px;">
    <h3 style="font-size: 1.2rem; letter-spacing: 0.05em;"><strong>Performance Documentation</strong></h3>
  </div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px auto; max-width: 1400px;">
    <img src="assets/images/projects/{id}/work_01.webp" alt="具體描述這張照片的內容" loading="lazy" style="width: 100%; aspect-ratio: 3 / 2; object-fit: cover;">
    <img src="assets/images/projects/{id}/work_02.webp" alt="具體描述這張照片的內容" loading="lazy" style="width: 100%; aspect-ratio: 3 / 2; object-fit: cover;">
  </div>
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 15px auto 80px; max-width: 1400px;">
    <img src="assets/images/projects/{id}/work_03.webp" alt="具體描述這張照片的內容" loading="lazy" style="width: 100%; aspect-ratio: 3 / 2; object-fit: cover;">
    <img src="assets/images/projects/{id}/work_04.webp" alt="具體描述這張照片的內容" loading="lazy" style="width: 100%; aspect-ratio: 3 / 2; object-fit: cover;">
    <img src="assets/images/projects/{id}/work_05.webp" alt="具體描述這張照片的內容" loading="lazy" style="width: 100%; aspect-ratio: 3 / 2; object-fit: cover;">
  </div>

  <!-- ── 6. Credits ── -->
  <div class="project-info p-content credits-section" style="margin-top: 80px; margin-bottom: 100px;">
    <h3 style="margin-bottom: 20px;">Credits:</h3>
    <p style="margin-bottom: 15px;">角色 Role ｜ 姓名 Name <a href="https://instagram.com/xxx" class="link text-link" target="_blank">@xxx</a></p>
  </div>

  <!-- ── 7. Footer ── -->
  <div class="detail-footer">
    <p>&copy; 2026 WU CHENG-RU</p>
  </div>
</template>
```

---

## 🖼 新增作品的完整流程

### Step 1：準備圖片

```
source/{專案名}/    ← 放原始照片

# 用通用腳本（不用再為每個專案寫一支 .py）：
python scripts/convert_project.py --id px --source "source/{專案名}" \
  --banner 檔名.jpg --thumb 檔名.jpg \
  --gallery 檔名1.jpg 檔名2.jpg ... \
  --rotate 需要轉正的檔名.jpg ...   # 可選，90° 順時針
```

輸出位置：`assets/images/projects/{id}/`，依序產生 `banner.webp`、`thumb.webp`、`work_01.webp`、`work_02.webp`...（quality 80、長邊最大 1920px、已修正 EXIF 方向）。不給 `--gallery` 就只處理 banner/thumb；不給 `--banner`/`--thumb` 就把 `--source` 資料夾裡所有圖片依檔名排序通通轉成 work_NN。`scripts/convert_p4.py` 等舊的一次性腳本是各專案的歷史處理紀錄，新專案不用再模仿著寫一支新的。

### Step 2：更新 `main.js` 的 `projectsData`

```javascript
{
  id: 'px',
  title: '作品完整名稱',
  year: 2026,
  meta: 'Performance',        // Performance / Exhibition / Case / Collaboration / Events（或新分類，見下）
  category: 'performance',    // 小寫，對應篩選按鈕的 data-filter
  thumb: 'assets/images/projects/px/thumb.webp',
  youtubeId: ''               // 有 YouTube 影片則填 ID，無則留空（非 YouTube 的影片崁入寫在 template 裡，不用這欄）
}
```

### Step 2.5：⚠️ 在 `works-grid` 新增 `.work` 卡片（容易漏掉，漏了作品不會出現在列表）

`projectsData` **不會**自動產生列表卡片（見前面「`works-grid` 是手寫死的 HTML」章節）。要在 `index.html` 的 `<div class="works-grid">` 裡，依年份分組（`<!-- 2026 -->` 等註解），手動加一張卡片：

```html
<div class="work" data-project="px" data-category="performance">
  <div class="work-inner">
    <img class="work-thumb" src="assets/images/projects/px/thumb.webp" loading="lazy" alt="作品完整名稱">
  </div>
  <div class="work-info">
    <div class="work-title">作品完整名稱</div>
    <div class="work-meta">2026 &nbsp;·&nbsp; Performance</div>
  </div>
</div>
```

`data-project` 要精確對應 `projectsData.id`／`template-{id}`；`data-category` 要跟篩選按鈕的 `data-filter` 字串一致（純字串比對，見 `main.js` `proj-filter-btn` 的 click handler）。

**需要全新分類**（不屬於 Performance/Exhibition/Case/Collaboration/Events）時，要在篩選列再加一顆按鈕：

```html
<button class="proj-filter-btn" data-filter="你的分類">你的分類顯示文字</button>
```

### Step 3：在 `index.html` 新增 `<template>`

位置：在最後一個 `</template>` 之後、`<!-- 懸浮回到頂部按鈕 -->` 之前。

### Step 4：驗證

- `<template id="template-{id}">` 的 id 必須精確對應 `projectsData.id` 跟 `.work` 卡片的 `data-project`
- 所有圖片路徑確認存在
- `works-grid` 裡的卡片有加（Step 2.5）—— 用瀏覽器打開 `/#projects` 實際看一下新卡片有沒有出現，不要只靠改 code 判斷
- 直式照片有併排縮小處理，沒有單獨撐成一張大圖
- 手機版（375px 寬）格線沒有破版（目前**沒有**自動收欄，2/3 欄數不變，只是圖片變小，正常現象）

---

## 🔧 常見操作 Quick Reference

### 調整照片裁切焦點

```html
<!-- 顯示照片上方（往上移） -->
<img src="..." style="object-position: center 20%;">
<!-- 顯示照片下方（往下移） -->
<img src="..." style="object-position: center 80%;">
```

### 在格線中使用不同比例

```html
<!-- 直式照片（3:4） -->
<img src="..." loading="lazy" style="aspect-ratio: 3/4;">
<!-- 橫式 16:9 -->
<img src="..." loading="lazy" style="aspect-ratio: 16/9;">
<!-- 電影比例 21:9 -->
<img src="..." loading="lazy" style="aspect-ratio: 21/9;">
```

### 嵌入 SoundCloud 音樂

```html
<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay"
  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/{TRACK_ID}&color=%230a070a&auto_play=false&visual=true">
</iframe>
```

### 嵌入 Instagram 貼文

```html
<div style="width: 100%; aspect-ratio: 4/5; overflow: hidden; border-radius: 8px;">
  <iframe src="https://www.instagram.com/p/{POST_ID}/embed" width="100%" height="100%"
    frameborder="0" scrolling="no" allowtransparency="true" style="min-width: 326px;">
  </iframe>
</div>
```

---

## ⚠️ 已知待辦事項

### 中 / 低優先

| 作業 | 說明 |
|------|------|
| 語義化 `<h3>` | 部分 template 用 `<h3>` 當標籤文字（如 `Date:`），可改 `<p class="detail-info-label">` |
| `musicWidgets` 重構 | 目前掛在 `window` 全域，可改 module-level 變數 |

---

## 🚫 禁止輕易更動的項目

| 項目 | 位置 | 原因 |
|------|------|------|
| `navigateTo()` | `main.js` L100–158 | SPA 路由核心，修改影響所有頁面切換 |
| `openProjectDetail()` | `main.js` L160–229 | 作品詳細頁渲染邏輯 |
| `scrollObserver` | `main.js` L91–98 | 所有 scroll-reveal 動畫依賴 |
| `.detail-grid-2` / `.detail-grid-3` CSS | `style.css` | `template-c3` 仍在使用，刪除會破版 |
| `particle.js` | `assets/js/particle.js` | 首頁背景獨立模組 |
| `window.musicWidgets` | `main.js` | 音樂播放器控制依賴 |
| SoundCloud API `<script>` | `index.html` 尾部 | 外部依賴，與 music 頁強耦合 |
| `google-site-verification` meta | `index.html` `<head>` | 刪除會讓 Search Console 失去網站擁有權驗證 |
| contextmenu / dragstart 監聽 | `main.js` 尾部 | 右鍵與拖曳圖片防護，僅供基本防盜用，非安全機制 |

---

## 📅 開發歷程紀錄

### 2026-10-20（新增 3 個作品、Events 分類、通用轉換腳本、文件勘誤）

1. **新增作品**：
   - `p5`《Thiann》聽 — Sound Campus 26, Ars Electronica Festival Linz（Performance，國外演出，中英對照）
   - `ev1` PXP 2026 藝術家短講暨工作坊助教（新分類 **Events**，完整 Credits 清單）
   - `p6` 視感認知 Visual Cognition — 2026 新響藝術季《新聲複樂之夜》（Performance）
2. **新增分類 `Events`**：篩選按鈕 `data-filter="events"`，給短講／工作坊／非表演類活動紀錄用，跟使用者討論命名後採用。
3. **新增通用圖片轉換腳本 `scripts/convert_project.py`**：取代「每個專案寫一支 `convert_{id}.py`」，用 CLI 參數指定 `--id`/`--source`/`--banner`/`--thumb`/`--gallery`/`--rotate` 即可，支援只更新 banner/thumb 不動 gallery。舊的一次性腳本保留當歷史紀錄，不刪除。
4. **文件勘誤（重要）**：
   - 發現 `works-grid` 列表卡片其實是手寫死的 HTML，`projectsData` 不會自動產生卡片 —— 之前只改 `projectsData` 導致新作品沒出現在列表的 bug，已補上 Step 2.5 跟醒目警告。
   - 發現 README 描述的 `.proj-gallery` class 系統從未真正寫進 `style.css`／`index.html`，純屬文件與程式碼不符 —— 已改記錄實際在用的 inline `display:grid` 寫法，並補上「直式照片不要單獨放大圖、要併排縮小」的實務慣例。
   - 清除已過時的 `p2/p3/e1/e2/e3/c1/c2/co1/co2` 佔位資料警告（這些早已換成真實內容）。
5. **排版慣例補充**：直式照片一律併排（2 欄、`max-width` 收窄到 ~900px），不再單獨撐成一張大圖；直式跟橫式混排同一列時加 `align-items: start` 避免拉伸變形。

### 2026-08-20（Google 收錄 / SEO 設定）

1. **Google Search Console 驗證**：改用 `<meta name="google-site-verification">` 標記（非上傳 HTML 檔案的方式）。
2. **修正網址誤判**：確認本專案為 Project site（`k591238` ≠ `PB.github.io`），正確網址帶 `/PB.github.io/` 路徑，修正所有相關檔案內先前誤寫的根網域網址。
3. **新增 SEO 基礎檔案**：`.nojekyll`、`robots.txt`、`sitemap.xml`（詳見「SEO / Search Console 設定」章節）。
4. **新增 Open Graph / Twitter Card / JSON-LD**（`index.html` `<head>`），改善社群分享預覽與 AI/搜尋引擎對網站內容的辨識度。
5. **右鍵與拖曳防護**：`main.js` 尾部新增 `contextmenu`、`dragstart` 監聽，防止作品圖片/影片被隨手另存（僅基本防護，非真正版權保護機制，repo 為 Public，原始檔案本來就可透過 git clone 取得）。

### 2026-07-23（Antigravity 作業完成）

1. **圖片處理**：重新整理 p4（歌劇院）的圖片轉換腳本，修復重複檔案問題。
2. **Credits 重構**：p4 Template 的 Credits 區塊，從「主要人員」格式改為「角色 ｜ 人名」格式，並新增演出人員列表。
3. **標題修正**：移除「2026光之曲幕」標題中的「2026」年份。
4. **照片裁切**：調整 `work_12.webp` 的 `object-position` 避免上方裁切過多。
5. **CSS 重構**：
   - 移除冗餘規則（overflow-y, min-height 無效值, 空 media query, 未使用的 .portrait 變體）。
   - **新增 `.proj-gallery` 系統**（~75行含完整 RWD）。
6. **HTML 重構**：所有 template 的 inline `display:grid` styles → `.proj-gallery` class（共清除 40+ 處）。
7. **projectsData 資料同步**：更新 `main.js` 內全部 13 個作品的中文標題、年份、分類與真實縮圖路徑（清除所有 placehold.co 佔位圖）。
8. **開發移交文件**：撰寫專案開發移交說明書 `README.md`。


