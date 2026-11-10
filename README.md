# PB.github.io — AI Agent 開發移交說明書

> **給下一位 AI Agent 的讀我文件**  
> 本文件完整記錄專案架構、規範與開發狀態，閱讀後可直接接手繼續開發。  
> 最後更新：2026-11-10

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
├── handouts/                      ← 講義區（獨立靜態頁，不經過 SPA，見下方「📚 講義區」）
│   ├── index.html                ← 講義列表頁（手寫，新增講義要在這裡加一筆）
│   └── laser-pop/                ← 雷射 POP 講義（⚠️ 由 TD_Laser_POP 自動同步，不要在這裡直接改）
│       └── index.html
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
│   ├── videos/
│   │   └── projects/
│   │       ├── p3/               ← FUTURE VISION LAB 影片 (mp4)
│   │       ├── c1/               ← 101 商演影片 (mp4)
│   │       └── e3/               ← 鹹淡適中 影片 (mp4)
│   └── cv/                       ← ⚠️ 自動產生的 CV PDF（WuChengRu_CV_EN.pdf／_ZH.pdf），不要手改，見「📄 CV PDF」
└── scripts/                      ← 開發用工具（不入 build）
    ├── build_cv_pdf.mjs          ← 從 index.html 的 Bio／CV 產生 CV PDF（Node＋Edge）
    ├── cv/                       ← CV PDF 的排版模板（cv-print.html）、雜訊底紋、作品集 QR code
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

Sitemap 只能列出「跟自己同層或更深層」的網址，**不可以搬進子資料夾**（會因為列出的網址層級比 sitemap 本身高而判定無效）。必須維持在 repo 根目錄。新增講義時記得把網址加進 sitemap。

---

## 📄 CV PDF（About 頁「CV PDF ↓」）

About 頁 BIO／CV 分頁列右側有「CV PDF ↓」，下載目前所選語言的 PDF（`main.js` 語言切換時會改 `[data-cv-pdf]` 的 `href`）。

- 檔案：`assets/cv/WuChengRu_CV_EN.pdf`、`WuChengRu_CV_ZH.pdf`（A4，銀灰細雜訊底；頁首左起：個人照、名字／職稱／聯絡方式、作品集 QR code；頁尾有更新年月）
- **字級規範（使用者指定）**：內文與 CV 項目 12pt、次要資訊（年份、補充說明、聯絡方式、分類標題）10.5pt、頁尾 9pt，**最小不得低於 9pt**。改模板後用 PyMuPDF 讀字級確認
- **內容只有一份來源**：排版模板 `scripts/cv/cv-print.html` 執行時直接讀 `index.html` 的 `.about-photo`（個人照）、`.about-name`、`.about-role`、`.bio-text.{en|zh}`、`.cv-content.{en|zh}`、社群連結裡的 Email／Instagram、`<link rel="canonical">`。PDF 裡不要另外手打內容
- 聯絡資訊只放網站上已公開的（Email、IG、網站），**不放電話、地址**
- 英文 CV 刻意維持「Selected Works」精選形式（使用者決定），中文版是完整版

### ⚠️ 改了 Bio／CV／聯絡方式之後，一定要重新產生 PDF

```bash
node scripts/build_cv_pdf.mjs
```

需要 Node 18+ 與 Microsoft Edge（路徑不同時設定 `EDGE_PATH`）。腳本會自己開本機伺服器和 headless Edge、輸出兩份 PDF、結束時自動關閉。產生後用 PDF 閱讀器打開檢查分頁（目前英文 2 頁、中文 4 頁），再跟網站修改一起 commit。忘記重跑的話 PDF 會跟網站內容不一致。

**排版技術備忘**：
- `@page { margin: 0 }` 才能讓底色滿版；每頁的上下留白靠 `body` padding＋`box-decoration-break: clone`
- 底紋與頁尾是 `position: fixed`，列印時會在每頁重複出現；Chrome 不支援在內容裡顯示頁碼，所以沒有頁碼
- 雜訊是獨立的 `.grain` 圖層：`noise.png` 為 640px、4 階灰的 2-bit 調色盤圖（約 100 KB），以 `background-size: 320px` 顯示（顆粒約 0.13mm），淡度用 `opacity` 控制。貼圖尺寸要用整數 px，太小或非整數會在 PDF 裡出現接縫細線；用帶透明度的全彩雜訊圖會大到 400 KB 以上
- 職稱每一項用 `white-space: nowrap` 包起來、`.cv-sub` 也不拆行，避免單字被拆到下一行
- QR code（`scripts/cv/qr.svg`）用 segno 產生，必須有 `xmlns` 才能當圖片載入；作品集網址改了要重新產生

---

## 📚 講義區（`handouts/`）

講義是**獨立的靜態 HTML 頁**，放在 `handouts/` 底下，GitHub Pages 直接提供，**不經過 SPA 的路由、也不放進 `index.html` 的 `<template>`**。理由：講義有自己的排版和 JS，獨立檔案不會跟作品集互相干擾；也不像 `<template>` 內容那樣可能讀不到，搜尋引擎可以正常收錄。

| 網址 | 檔案 |
|------|------|
| `https://k591238.github.io/PB.github.io/handouts/` | `handouts/index.html`（列表頁） |
| `https://k591238.github.io/PB.github.io/handouts/laser-pop/` | `handouts/laser-pop/index.html` |

**入口**：About 頁的社群連結區有「Teaching」（桌機版 `social-list` 跟手機版 `about-mobile-social` 兩組都有），連到列表頁。刻意不放主選單，避免稀釋作品集定位。

**列表頁不要引用 `assets/css/style.css`**：那支 CSS 會把系統游標藏起來改用自製游標（需要 `main.js` 驅動），單獨套用會讓游標消失。列表頁是內嵌一份同色系的精簡樣式。

### ⚠️ `laser-pop` 是自動同步的，不要在這裡直接改

講義原始檔在另一個 repo：`Desktop\2026_Laser_Tutorial\web\laser-pop-handout.html`（GitHub：`k591238/TD_Laser_POP`）。那邊 commit 時，`post-commit` hook 會執行 `scripts/sync_pages.sh`，在它自己的 clone（`_pages_pb/`）把講義複製到 `handouts/laser-pop/`，**只 commit 這個資料夾**並 push。

**課堂範例檔（`.toe`）不放在公開網站**：學生版 TD 範例只在上課時另外提供，講義頁沒有下載按鈕。之後的講義也比照：公開講義只放內容，課堂用的檔案另外發。

所以：
- 在這裡直接改 `handouts/laser-pop/` 會在下次同步時被覆蓋，要改請改原始檔
- 同步腳本可能已經推了新 commit，**在這個資料夾開工前先 `git pull`**，否則 push 會被拒絕
- 講義頁裡的 QR code 寫死指向上面的網址，網址改了要重新產生（原始檔用 `segno` 產生的 SVG）
- 舊網址 `k591238.github.io/Class_web_Temp/` 已改成轉址頁，會自動跳到新網址

### 新增一份講義

1. 建立 `handouts/{名稱}/index.html`（開頭要有 `<!doctype html>`，否則會進入相容模式，表格等排版會跑掉）
2. 講義裡的資源一律用**相對路徑**，不可寫 `/images/...` 這種從根目錄開始的路徑（專案網址帶 `/PB.github.io/`，會失效）
3. 建議在講義裡放回到作品集的連結：`../../`（作品集）、`../`（講義列表）
4. 在 `handouts/index.html` 的 `<ul>` 加一筆
5. 把網址加進 `sitemap.xml`

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

這是最容易踩的坑：`index.html` 裡 `<div class="works-grid">`（約在 `#view-projects` 內）的每一張卡片都是手寫的 `<a class="work" href="#project/{id}" data-project="{id}" data-category="{category}">...</a>`（2026-11-10 起是連結，可右鍵開新分頁），**`projectsData` 只用在 `openProjectDetail()` 的 Generic Layout 備援（抓 `thumb`/`gallery`/`youtubeId`）跟文件標題，不會自動長出列表卡片。**

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

所有 template 的圖片格線都是**直接在 `<div>` 上寫 inline `display:grid`**，沒有共用 class。範例：

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

**手機版自動收欄（2026-11 新增）**：`style.css` 在 `.detail-grid-2.portrait` 規則後面有兩段 media query，用屬性選擇器抓 `#project-detail-content` 裡所有寫了 `grid-template-columns` 的 inline 格線：
- `≤600px`：全部改成單欄
- `≤799px`：`repeat(4, 1fr)` 的 Instagram 嵌入區改成單欄、最寬 420px（IG 嵌入最小寬度 326px，4 欄在平板會被擠壞）

因為 inline style 優先權比 CSS 檔高，這裡必須用 `!important`。新格線照現有 inline 寫法就會自動套用，不用另外處理；如果之後真的改成共用 class，這兩段要一起改。

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

## 🤝 新增作品的協作 SOP（跟使用者溝通的流程）

> 給 AI Agent：使用者要新增作品時，照這個流程走。技術細節見下一節「新增作品的完整流程」。

### 使用者會提供（或請他照這個範本填）

```
【新增作品】
資料夾：source/
中文標題：
英文標題：
年份：            分類：Performance / Exhibition / Case / Collaboration / Events
演出日期：
場地：
主辦／補助單位：
你的角色：
作品簡介（中）：
作品簡介（英）：
Credits（角色｜姓名｜IG）：
YouTube／IG 貼文連結：
指定封面照／縮圖（可留空）：
其他排版需求（可留空）：
```

- 照片放在 `source/{作品英文名}/`；沒指定 banner／thumb 時，挑幾張候選給使用者選
- 影片優先用 YouTube 連結；一定要放 mp4 時先壓縮（720p、背景循環 10～20 秒、每支 5 MB 以下），並注意 repo 已經很大（見「影片」相關待辦）

### Agent 的步驟

1. 讀照片，分出直式／橫式，提出排版方式
2. 檢查資料：**缺漏或不確定的（日期、場地、單位、人名、國外演出細節）一律先問，不可自己編寫或推測**
3. 轉檔（`convert_project.py`）→ `projectsData` → `works-grid` 卡片 → `<template>`，三處一次改齊
4. 本機截圖驗證（桌機 1280px、手機 390px）：列表有新卡片、作品頁沒破版、直式照片有併排縮小（截圖方法見「本機截圖驗證」）
5. 把截圖和文字給使用者確認，確認後才 commit；**使用者明確說可以才 push**

### 規則
- 圖片一律 webp，`alt` 要具體描述畫面
- 外部連結一律 `target="_blank" rel="noopener noreferrer"`
- 文字以使用者提供的為準，可以調整排版，不改寫內容意思
- 新增作品時如果也要更新 About 的 CV，改完後要跑 `node scripts/build_cv_pdf.mjs` 重新產生 PDF（見「📄 CV PDF」）

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
<a class="work" href="#project/px" data-project="px" data-category="performance">
  <div class="work-inner">
    <img class="work-thumb" src="assets/images/projects/px/thumb.webp" loading="lazy" alt="作品完整名稱">
  </div>
  <div class="work-info">
    <div class="work-title">作品完整名稱</div>
    <div class="work-meta">2026 &nbsp;·&nbsp; Performance</div>
  </div>
</a>
```

卡片外層一定要用 `<a>` 並寫上 `href="#project/{id}"`，否則不能右鍵／Ctrl＋點擊在新分頁開啟。`href` 和 `data-project` 的 id 要一致；`data-project` 要精確對應 `projectsData.id`／`template-{id}`；`data-category` 要跟篩選按鈕的 `data-filter` 字串一致（純字串比對，見 `main.js` `proj-filter-btn` 的 click handler）。

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
- 手機版（375px 寬）格線應該自動變成單欄、沒有圖片超出畫面（見「手機版自動收欄」）

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

### 作品頁影片（本機 mp4）

**不要用 `autoplay`**，改用 `data-autoplay`：

```html
<video width="100%" data-autoplay preload="metadata" loop muted playsinline style="background: #000;">
  <source src="assets/videos/projects/{id}/xxx.mp4" type="video/mp4">
</video>
```

`main.js` 的 `videoObserver` 會在影片接近畫面（200px 內）時才播放、離開畫面就暫停；`openProjectDetail()` 載入作品頁後會自動掛上。寫成 `autoplay` 的話，打開作品頁就會同時下載所有影片（c1 改之前一打開就下載 30 MB）。

**上傳前先壓縮**（ffmpeg，網頁上一律靜音所以拿掉聲音）：

```bash
ffmpeg -i 原檔.mp4 -ss 開始秒數 -t 18 -an -r 30 -vf "scale=-2:540" \
  -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart 輸出.mp4
```

目標：循環片段 10～20 秒、每支 5 MB 以下；在 3 欄格線裡 540p 就夠，單欄大畫面可用 720p。`-movflags +faststart` 讓瀏覽器不用下載整支就能開始播。

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

### 高優先（2026-11-10 架構盤點）

| 作業 | 說明 |
|------|------|
| 影片瘦身（大致完成） | 已完成：c1 六支（79→21 MB）、p2 `ig02.mp4`（52→3.1 MB）、e3 三支（27→7.4 MB）、全站影片改成捲到畫面才播放（見「作品頁影片」）。**p3 三支（約 7 MB）刻意不壓**：只省 2.6 MB，新檔反而讓 git 歷史再多 4.6 MB，划不來。舊的大檔仍在 git 歷史裡（見下一項），之後新增影片務必先壓縮再 commit |
| git 歷史殘留大檔 | 換掉的舊影片仍在歷史裡，約 160 MB（p2 舊 `ig02.mp4` 52 MB、c1 舊檔約 77 MB、e3 舊檔約 27 MB）。只影響 repo 大小與 clone 時間，**不影響訪客**（網站只提供最新版檔案）。**⛔ 這一項只是紀錄，AI Agent 不可自行執行**（見「禁止輕易更動的項目」）。使用者決定：維持現狀；遇到大改版（如「作品獨立網址」）或 repo 接近 1 GB 時，**只提醒使用者有這件事**，由使用者決定要不要處理 |
| 列表卡片自動產生 | `works-grid` 改由 `projectsData` 產生，新增作品從改三處變兩處，消除「漏加卡片」的 bug |
| 照片格線共用 class | 80 多處 inline `display:grid` 改成 `gallery-2`／`gallery-3`／`gallery-portrait` 之類的 class，手機收欄的 `!important` 屬性選擇器可一併改乾淨 |
| 作品獨立網址 | `#project/p4` 的 `#` 會被 Google 和社群平台忽略：分享單一作品時預覽卡片永遠是首頁，個別作品也幾乎搜不到。根本解法是每個作品做成獨立靜態頁（如 `projects/p4/`），屬大改版，等上面三項做完再規劃 |

### 中 / 低優先

| 作業 | 說明 |
|------|------|
| 語義化 `<h3>` | 部分 template 用 `<h3>` 當標籤文字（如 `Date:`），可改 `<p class="detail-info-label">` |
| `musicWidgets` 重構 | 目前掛在 `window` 全域，可改 module-level 變數 |
| 自製游標的備援 | `style.css` 用 `cursor: none !important` 隱藏系統游標，JS 沒載入時會完全沒有游標 |

---

## 🚫 禁止輕易更動的項目

| 項目 | 位置 | 原因 |
|------|------|------|
| ⛔ **git 歷史（絕對禁止改寫）** | 整個 repo | **不可執行** `git filter-repo`、`git filter-branch`、BFG、`git push --force`／`--force-with-lease`、`git reset --hard` 到已 push 的 commit、刪除或重建 repo。即使看起來是在「清理大檔」「縮小 repo」，也一律不做，只能向使用者提起。改寫歷史會讓所有 clone（含 TD_Laser_POP 的自動同步）失效，而且無法復原 |
| `navigateTo()` | `main.js` L100–158 | SPA 路由核心，修改影響所有頁面切換 |
| `openProjectDetail()` | `main.js` | 作品詳細頁渲染邏輯；清空內容前的 `videoObserver.disconnect()` 和最後掛上 `video[data-autoplay]` 的那行不可拿掉 |
| `scrollObserver` | `main.js` L91–98 | 所有 scroll-reveal 動畫依賴 |
| `.detail-grid-2` / `.detail-grid-3` CSS | `style.css` | `template-c3` 仍在使用，刪除會破版 |
| `particle.js` | `assets/js/particle.js` | 首頁背景獨立模組 |
| `window.musicWidgets` | `main.js` | 音樂播放器控制依賴 |
| SoundCloud API `<script>` | `index.html` 尾部 | 外部依賴，與 music 頁強耦合 |
| `google-site-verification` meta | `index.html` `<head>` | 刪除會讓 Search Console 失去網站擁有權驗證 |
| contextmenu / dragstart 監聽 | `main.js` 尾部 | 基本防盜，**不是安全機制**（repo 公開，原始碼和圖片本來就能下載）：右鍵只在連結上開放（選單、作品卡片可在新分頁開啟），圖片、影片、文字上封鎖。卡片縮圖 `.work-thumb` 設了 `pointer-events: none`，右鍵時點到的是卡片連結而非圖片，所以選單只有「新分頁開啟」、沒有「另存圖片」——拿掉這行縮圖就能被右鍵另存。**刻意不擋 F12／開發者工具快捷鍵**（2026-11-10 試過後還原：擋不住瀏覽器選單、妨礙自己維護），也不要用「偵測開發者工具就 debugger 暫停」的做法 |
| 選單／卡片連結的 click 處理 | `main.js` `[data-view]`、`.work` | 選單、標題、作品卡片都是 `<a href="#...">`：一般點擊 `preventDefault` 後走 SPA 切換；Ctrl／⌘／Shift＋點擊直接 return 交給瀏覽器開新分頁。拿掉 `preventDefault` 會造成重複切換 |
| `popstate` 處理 | `main.js` | 沒有 state 時（網址列手動改 hash）也要解析 `#project/{id}`，不然會被導回首頁 |

---

## 🔍 本機截圖驗證

在 `git_Web` 資料夾（PB.github.io 的上一層）執行 `python -m http.server 8765`，網址用 `http://127.0.0.1:8765/PB.github.io/`，路徑會跟正式站一致。

用 headless Edge 的 `--screenshot` 參數截作品集或講義時常常沒有產生檔案（頁面有持續播放的動畫、Edge 會立刻返回並在背景寫檔，殘留程序還會卡住下一次）。比較穩定的做法是用 `--remote-debugging-port` 啟動 headless Edge，再透過 DevTools Protocol（`Page.captureScreenshot`）截圖，Node 24 內建 `WebSocket` 不用裝套件。作品頁可以直接用 `#project/{id}` 網址打開。

---

## 📅 開發歷程紀錄

### 2026-11-10（講義區、手機版收欄）

1. **新增講義區 `handouts/`**：雷射 POP 講義從獨立 repo `Class_web_Temp` 搬進作品集，改為 `handouts/laser-pop/`，另做列表頁 `handouts/index.html`。講義仍由 TD_Laser_POP 自動同步（同步目的地從 Class_web_Temp 改成本 repo），`Class_web_Temp` 改成轉址頁。
2. **講義頁調整**（改在原始檔）：補上 `<!doctype html>`（原本跑在相容模式）、`lang`、description、canonical；QR code 和網址換成新網址；頂部加「BY WU CHENG-RU」、頁尾加回列表頁和作品集的連結；拿掉 `Student_Laser.toe` 下載按鈕（範例檔只在上課時提供）。
3. **About 頁**：社群連結區新增「Teaching」（桌機、手機兩組），新增 `icon-teaching` 圖示。
4. **sitemap.xml**：加入講義列表頁和雷射 POP 講義。
5. **手機版作品頁格線自動收欄**：見「圖片格線」章節。16 個作品頁在 390／700／1280px 寬度都驗證過：手機全單欄、沒有圖片超出畫面，桌機版不變。
6. 刪除根目錄未追蹤的舊講義副本 `laser-pop-handout.html`（跟 TD_Laser_POP@130dba1 版本相同，可從那邊歷史找回）。
7. **影片瘦身**：c1 六支改 30fps／540p／去聲音，三支長片剪成 18 秒（L1040138 取 20–38 秒、L1040180 取 40–58 秒、L1040177 取前 18 秒），79→21 MB；p2 `ig02.mp4` 壓成 720×720 並改為自動循環（原本是要按播放鍵），52→3.1 MB。全站 12＋1 支影片改用 `data-autoplay`＋`videoObserver`，打開 c1 時的下載量從 30 MB 降到約 6 MB。
8. **中文 Bio** 改為五段新版本；英文 Bio 依中文版翻譯更新；《聽說 Whisper》四處拼錯的 Wisper 修正。
9. **選單改成真正的連結**：7 個選單按鈕和左上角標題改成 `<a href="#view">`，可右鍵／Ctrl＋點擊在新分頁開啟，外觀不變。
10. **作品卡片改成連結**：16 張 `.work` 從 `<div>` 改成 `<a href="#project/{id}">`，可右鍵／Ctrl＋點擊在新分頁開某個作品，外觀與分類篩選不變。
11. **右鍵規則**：改成只在連結上開放；卡片縮圖加 `pointer-events: none`，右鍵卡片只能開新分頁、不能另存縮圖。曾短暫加上 F12 等快捷鍵屏蔽，討論後還原（見「禁止輕易更動的項目」）。
12. **修正 popstate**：網址列手動改成 `#project/{id}` 時會被導回首頁，現在會正確打開作品頁。
13. 29 項行為測試全數通過（SPA 切換、上一頁、選單與卡片新分頁、直接開 `#music`／`#project/{id}`、手機選單、分類篩選、右鍵開放與封鎖範圍、快捷鍵不再攔截）。
14. **CV PDF 下載**：About 頁新增「CV PDF ↓」，跟著 EN／CN 切換下載對應語言；PDF 由 `scripts/build_cv_pdf.mjs` 從網站內容自動產生（銀灰細雜訊底、個人照、內文 12pt；英文 2 頁、中文 4 頁）。
15. **語言切換改成「EN／中文」**：原本的「CN」是中國的國家代碼，容易被當成簡體中文。中文按鈕與中文 Bio／CV 區塊加上 `lang="zh-Hant"`（字型選繁體字形、螢幕閱讀器用中文唸、搜尋引擎判斷語言），按鈕用 Noto Sans TC 顯示。程式內部代號仍是 `zh`，之後新增中文內容區塊也要加 `lang="zh-Hant"`。
16. **e3 影片剪精華並壓縮**（27→7.4 MB）：`bg with animal.mp4` 改名 `bg_with_animal.mp4`，取 3–21 秒（蜥蜴、鴨子、植物依序出場，頭尾是空的海面，循環自然）；`l1010589.mp4` 取 8–26 秒（廣角互動畫面，避開觀眾擋鏡頭的段落）；`l1010586.mp4` 維持全長 21 秒。皆為 540p／30fps／無聲音／crf 27。p3 決定不壓（理由見待辦「影片瘦身」）。
17. **SEO 小幅修正**（目標：搜名字「吳承儒／PB／Pen_bit／penbit」要找得到）：網頁標題與 og／twitter 標題改為「吳承儒 Wu Cheng-Ru（PB / Pen_bit）｜新媒體・音像藝術家 Audiovisual Artist」；About 頁名字下方新增 `.about-alias`（`吳承儒 · PB / Pen_bit`，原本畫面上完全沒有中文名和 PB）；職稱 `AV Performer` 改為 `Audiovisual Artist`；簡介補上 penbit 拼法；JSON-LD 補別名（含外部網站常見的 Cheng-Ru Wu、ChengRu Wu）、學歷、獲獎、職稱。名字主要用「PB」，帳號類的寫法是 penbit／pen_bit（使用者確認）。Bio 內文維持使用者原文不動。已重新產生 CV PDF。

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


