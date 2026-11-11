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
| **主要檔案** | `index.html`（~1000行，首頁／列表／音樂／About）、`content/projects/*.html`（作品內容）、`assets/css/style.css`（~1930行）、`assets/js/main.js`（~650行） |
| **語系** | 中英混排，介面部分英文，內容部分繁體中文 |

---

## 🗂 完整檔案結構

```
PB.github.io/
├── index.html                    ← 首頁 SPA（home／projects／music／about 四個 View）
├── projects/{id}/index.html       ← ⚠️ 作品獨立網頁，由 build_site.mjs 產生，不要手改
├── content/projects/{id}.html     ← ★作品頁內容（要改作品頁就改這裡，再跑腳本）
├── .nojekyll                      ← 告訴 GitHub 不要跑 Jekyll build（本專案未使用 Jekyll）
├── robots.txt                     ← 搜尋引擎爬蟲規則（見下方「SEO / Search Console 設定」）
├── sitemap.xml                    ← 網站地圖（⚠️ 由 build_site.mjs 產生，不要手改）
├── data/                          ← ★作品資料（產生腳本的資料來源，見「🛠 產生腳本」）
│   ├── site.json                 ← 網站網址（換網域時只改這裡）
│   └── projects.json             ← 作品資料表，陣列順序＝列表顯示順序
├── handouts/                      ← 講義區（獨立靜態頁，不經過 SPA，見下方「📚 講義區」）
│   ├── index.html                ← 講義列表頁（手寫，新增講義要在這裡加一筆）
│   ├── laser-pop/                ← 雷射 POP 講義（⚠️ 由 TD_Laser_POP 自動同步，不要在這裡直接改）
│   │   └── index.html
│   ├── av-perform/               ← 音像互動體驗（⚠️ 由 scripts/sync_perform.mjs 從私有 repo talks 同步，不要在這裡直接改）
│   └── thumbs/                   ← 列表頁的縮圖（16:10，640×400 webp）
├── assets/
│   ├── css/
│   │   └── style.css             ← 所有樣式（Design Tokens + 全部元件 CSS）
│   ├── js/
│   │   ├── main.js               ← SPA 路由器、SoundCloud 整合；作品頁也載入（body.page-project 時只跑共用功能）
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
    ├── build_site.mjs            ← ★產生腳本：作品頁、作品卡片、sitemap（見「🛠 產生腳本」）
    ├── make_og_images.py         ← 產生作品的社群分享預覽圖 og.jpg（1200×630）
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

### 網站圖示（favicon）

`assets/images/favicon.svg`：2026-11-11 換成依名片設計的 PB 標誌（黑底圓角、銀白線條：左上圓圈＋實心點、P 的弧、直線與一條橫線）。名片原設計較複雜（虛線、三條橫線），為了在瀏覽器分頁 16px 也看得清楚而精簡（使用者在三個版本中選 A）。首頁、作品頁、Teaching 列表、音像互動體驗、雷射講義都引用同一個檔案，換圖只要換這個檔。Google 搜尋結果左邊的圖示要等自訂網域才會出現（見「網址／網域」待辦）。

### Open Graph / Twitter Card / JSON-LD

`index.html` `<head>` 內有社群分享預覽（og:*、twitter:*）與結構化資料（`application/ld+json`, `@type: Person`），全部指向正式網址 `https://k591238.github.io/PB.github.io/`。**修改網址、標題、簡介、大頭照時，這些標記要跟著同步更新**，否則社群分享卡片或 Google 的理解會跟實際內容不一致。

### ⚠️ robots.txt 的已知限制

`robots.txt` 依照協定規範**只在網域根目錄有效**（`https://k591238.github.io/robots.txt`）。因為本專案是 Project site，實際內容跑在 `/PB.github.io/` 路徑下，repo 裡的 `robots.txt` 只會被服務在 `https://k591238.github.io/PB.github.io/robots.txt`——**這不是搜尋引擎承認的正式位置，形同無效**。要讓它真正生效，必須另外建立一個名稱完全是 `k591238.github.io` 的新 repo 來佔用網域根目錄，目前尚未執行這一步。

### sitemap.xml 的協定限制

sitemap.xml 由 `scripts/build_site.mjs` 自動產生（首頁、`handouts/` 底下每份講義、`assets/cv/` 的 PDF，`lastmod` 取該檔案最後一次 commit 的日期），不要手改。

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
| `https://k591238.github.io/PB.github.io/handouts/av-perform/` | `handouts/av-perform/`（同步產生，見下方） |

列表頁每一筆有縮圖（`.thumb`，16:10），圖檔放在 `handouts/thumbs/{名稱}.webp`（640×400）。**縮圖不要放進各講義的資料夾**：`laser-pop/` 會被自動同步覆蓋，`av-perform/` 的同步腳本會刪掉白名單以外的檔案。目前不分類（數量少，使用者決定），之後項目變多再考慮。

### ⚠️ `av-perform`（音像互動體驗）是從私有 repo 同步的

來源是講座網頁 repo `k591238/talks`（**私有**，本機在 `Desktop\2026_AV_Lecture`）的表演模式。使用者決定**講座本身只留本機簡報用，不公開**，只公開表演體驗。

```bash
node scripts/sync_perform.mjs                 # 來源預設 ../../2026_AV_Lecture/2026-career
```

- **白名單**：只複製 `index.html`、`talk.js`、`theme.css`、`vendor/three.module.min.js`。`talk.md` 由腳本產生，只有標題和 `only: perform`（talks 的開關：直接進表演頁、沒有講座按鈕、不開講者視窗、不讀講稿、不自動滿版）。**講座內容、講稿 `notes.md`、照片 `img/`、講者視窗都不會過來**；腳本最後會再檢查一次，出現 notes／pptx／img 就停止
- 腳本會在 `<head>` 加上標題、簡介、canonical、og 分享資訊（只改公開版，不動 talks 原始檔），最後自動跑 `build_site.mjs` 更新 sitemap
- **手動同步，不自動**：講座還在密集修改，避免半成品自動公開。使用者說「同步表演」時才跑，跑完本機檢查 → commit → 使用者同意才 push
- 公開版的 `talk.md` 另外寫了 `home: ../../`（左上角名字回作品集首頁）和 `back: ← Teaching | ../`（右上角返回 Teaching 列表），腳本會檢查來源有沒有這兩個功能
- 分享預覽圖 `av-perform/og.jpg`（1200×630）和縮圖是表演頁場景 5 的截圖（點雲組成 PenBit 字樣），在白名單裡、同步時不會被刪


**入口**：About 頁的社群連結區有「Teaching」（桌機版 `social-list` 跟手機版 `about-mobile-social` 兩組都有），連到列表頁。刻意不放主選單，避免稀釋作品集定位。

**列表頁不要引用 `assets/css/style.css`**：那支 CSS 是整個作品集的樣式（版面、View 切換等），單獨套用在講義列表會出問題。列表頁是內嵌一份同色系的精簡樣式。

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
4. 在 `handouts/index.html` 的 `<ul>` 加一筆，並做一張縮圖放到 `handouts/thumbs/`（640×400 webp）
5. 執行 `node scripts/build_site.mjs`，sitemap 會自動加入新講義（不用手改 sitemap）

---

## 🏗 SPA 架構說明

### 兩種頁面（2026-11-11 起）

| 頁面 | 網址 | 說明 |
|---|---|---|
| 首頁 SPA | `/`、`/#projects`、`/#music`、`/#about` | `index.html`，四個 View 用 JS 切換 `.active`（`<section class="view" id="view-{id}">`） |
| 作品頁 | `/projects/{id}/` | 每件作品一個獨立靜態網頁，由 `build_site.mjs` 產生。有自己的標題、簡介、canonical、分享預覽圖、JSON-LD |

- 作品卡片是一般連結 `projects/{id}/`，點擊直接換頁。`style.css` 的 `@view-transition` 讓換頁淡入淡出（Chrome／Edge／Safari），`index.html` 的 `speculationrules` 讓滑鼠停在卡片上就預先載入（Chrome／Edge）
- **舊網址 `#project/{id}` 會自動轉到 `projects/{id}/`**（`main.js` 的 `redirectLegacyProjectHash()`），以前分享出去的連結不會失效
- 作品頁有 `<base href="../../">`：內容裡的 `assets/...` 相對路徑、選單的 `#projects` 等連結，都會以網站根目錄解析，所以作品內容的寫法跟以前的 template 完全一樣
- 作品頁也載入 `main.js`。`body.page-project` 時不跑 SPA 路由，只跑選單、影片捲到才播放、回到頂部、右鍵防護等共用功能；「Back to Projects」從列表點進來時用上一頁（保留列表捲動位置），直接開作品頁時連回首頁列表
- 作品頁的選單與頁首是從 `index.html` 的 `<!-- SHARED:chrome:start -->` … `end` 之間複製的。改選單只要改 `index.html` 再跑腳本
- **作品頁的載入速度**（2026-11-11 調整，專業建議：**不要做「等照片影片全部讀完才顯示」的載入畫面**，會讓訪客等更久、也會讓 Google 的速度評分變差；做法是文字和版面立刻出現，照片逐張淡入）：
  - 腳本會把每頁**第一張圖片**（通常是橫幅）的 `loading="lazy"` 拿掉、加上 `fetchpriority="high"`，讓主要畫面最先下載。作品內容檔裡照常寫 `loading="lazy"` 即可，不用手動處理
  - 作品頁不套用 `.view` 的 0.5 秒浮現動畫（`.page-project .view.active`），只保留換頁淡入，避免兩層動畫疊加
  - 照片讀完才淡入：`main.js` 把還沒讀完的圖片加上 `.img-loading`（透明），`load`／`error` 時拿掉。`error` 那行不可拿掉，否則讀取失敗的圖片會永遠透明
  - 實測（限速 10 Mbps）：主要畫面出現時間約縮短一半，例如 e3 2.2 → 1.0 秒、e2 1.2 → 0.6 秒
- **游標：使用系統游標**（2026-11-11 拿掉自製游標，使用者決定）。改成獨立作品頁後，自製游標在換頁時有無法根治的問題：換成新網頁後，瀏覽器要等滑鼠移動才會重新判斷系統游標，所以點擊後滑鼠不動時，系統游標和自製游標會同時出現（網頁程式無法控制系統游標）。曾評估的另一個解法是「混合模式」：從列表點作品時不換頁、在首頁裡切換內容（網址仍改成 `projects/{id}/`），可以保留自製游標和 SPA 的流暢感，但程式較複雜，使用者選擇先用系統游標。`style.css` 開頭有一段讓可點擊元素（連結、按鈕、黑膠封套等）顯示手指游標，新增可點擊、但不是 `<a>`／`<button>` 的元素時要加進去

### 核心路由（`main.js`，只在首頁）

```javascript
navigateTo('projects')         // 切換到 projects view（支援 browser history）
```

---

## 🛠 產生腳本 `scripts/build_site.mjs`（2026-11-11 起）

作品資料**只寫一份**在 `data/projects.json`，執行：

```bash
node scripts/build_site.mjs
```

腳本會產生（**每次都會被覆蓋，不要手改**）：

| 產生的內容 | 位置 |
|---|---|
| 作品頁（每件作品一個） | `projects/{id}/index.html`（整個檔案；資料表裡刪掉的作品，對應的頁面也會刪掉） |
| 作品列表卡片（`.work`，依年份加 `<!-- 2026 -->` 註解） | `index.html` 的 `<!-- BUILD:works-grid:start -->` … `end` 之間 |
| `sitemap.xml` | 整個檔案（首頁、講義、作品頁、CV PDF） |

卡片是腳本寫成**靜態 HTML**，不是瀏覽器端用 JS 產生：AI 爬蟲多半不執行 JS，這樣它們才看得到作品清單。

腳本會先檢查資料，有問題就**不寫入任何檔案**並列出原因：缺必填欄位、id 格式不對（只能小寫英文、數字、連字號）、id 重複、縮圖檔不存在、沒有 `content/projects/{id}.html`、分類沒有對應的篩選按鈕。重複執行結果相同（沒變動就顯示「沒有變動」）。

### `data/projects.json` 欄位

```json
{
  "id": "p4",                                        // 必填，對應 content/projects/{id}.html、圖片資料夾名、網址 projects/{id}/
  "title": "光之曲幕 X DJ Friday Night《聲．光．域》",  // 必填，卡片標題
  "year": 2026,                                      // 必填，數字
  "meta": "Performance",                             // 必填，卡片上顯示的分類文字
  "category": "performance",                         // 必填，篩選用，要跟篩選按鈕的 data-filter 一致
  "thumb": "assets/images/projects/p4/thumb.webp",  // 必填，列表縮圖
  "description": "…",                                // 必填，作品頁簡介（Google 搜尋結果、分享預覽的說明文字），約 70～110 字
  "ogSource": "assets/…/work_03.webp",              // 選填，指定分享預覽圖的來源圖（沒填用 banner.webp，再沒有用 thumb）
  "credit": { "as": "creator", "role": "藝術家 Artist" },  // 你在作品中的身分：creator＝你的作品、contributor＝參與別人的作品
  "creators": ["蔡昱廷 Yu-Ting Tsai"],               // 選填，其他作者／團隊（名稱含 小隊／實驗所／團／工作室 會當成團體）
  "events": [                                        // 選填，展演活動（可多筆，例如兩個場次、展覽＋開幕派對）
    { "type": "Event",                               // Event（演出、講座）／ExhibitionEvent（展覽）／EducationEvent（工作坊、課程）
      "name": "…", "startDate": "2026-05-15",        // 日期：2026-05-15、2026-08-21T19:30+08:00，或只知道年份寫 2025
      "endDate": "2026-05-16",                       // 選填
      "location": "臺中國家歌劇院 2F 大劇前廳",       // 必填
      "address": "Hauptplatz 6, Linz, Austria",      // 選填，原文有地址才寫
      "organizer": "臺中國家歌劇院" }                 // 選填，不知道就不寫
  ],
  "note": "…"                                        // 選填，給維護者看的備註（不會出現在網站上）
  "alt": "…",                                        // 選填，縮圖的替代文字，沒填就用 title
  "youtubeId": "TazR2qhRegI"                         // 選填，主要 YouTube 影片 ID
}
```

**陣列順序就是列表的顯示順序**（目前依年份由新到舊）。新作品插在想要的位置即可。

### 作品的結構化資料（JSON-LD，2026-11-11 階段 3）

腳本會用 `credit`／`creators`／`events` 在每個作品頁產生 JSON-LD：一個 `CreativeWork`（作品，你的身分用 `Role` 寫在 creator 或 contributor），加上每個活動一筆 `Event`／`ExhibitionEvent`／`EducationEvent`（日期、場地、主辦，`workFeatured` 指回作品）。這些只給搜尋引擎和 AI 讀，畫面上不會出現。

**⚠️ 這些資料一律以作品頁原文或使用者確認過的為準，不可推測**（2026-11-11 的 16 件作品資料是逐筆跟使用者確認過的）。不知道的欄位就不要寫，少一項資訊不會出錯，寫錯才會。沒有對外公開的呈現（例如 co3《自動販賣機》是階段性呈現）不建立活動資料，在 `note` 註明，之後有正式演出再補。腳本會檢查 `type`、日期格式、`name`／`location` 是否齊全。

上線後可以用 Google「複合式搜尋結果測試」（https://search.google.com/test/rich-results）貼作品頁網址檢查。

### `data/site.json`

只有 `baseUrl`（正式網址，結尾要有 `/`）。作品頁的 canonical、og、JSON-LD 和 sitemap 都從這裡產生。換網域時改這裡再重跑腳本。（`index.html` `<head>` 裡的 canonical／og／JSON-LD 網址、CV PDF 與講義的 QR code 目前仍是手寫，換網域時要一起改。）

### 分享預覽圖 `og.jpg`

```bash
python scripts/make_og_images.py          # 只產生還沒有 og.jpg 的作品
python scripts/make_og_images.py p4       # 重新產生指定作品
```

輸出 `assets/images/projects/{id}/og.jpg`（1200×630，置中裁切）。WebP 在部分平台（如 LINE）不一定能顯示，所以另外產生 JPG。新增作品時要跑一次；想換構圖就在資料表填 `ogSource` 再重跑。

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

新增作品時，建立 `content/projects/{id}.html`，內容就是作品頁 `#project-detail-content` 裡面的 HTML（以前寫在 `index.html` 的 `<template>` 裡，2026-11-11 搬出來；下面範例的 `<template>` 外框不用寫）。圖片、影片路徑照樣寫 `assets/...`：

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

使用者**也可以直接貼原始資訊**（活動頁文字、IG 貼文、主辦單位的新聞稿、聊天紀錄等，不用自己整理）。Agent 要：
1. 把資訊整理成下面的範本格式，連同簡介草稿一起給使用者看
2. **列出缺漏或彼此矛盾的地方**（例如日期兩處寫法不同、沒有場地、英文標題缺漏、不確定使用者的角色），請使用者補充；不可自己推測補上
3. 使用者確認後才開始製作

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
3. 轉檔（`convert_project.py`）→ `data/projects.json` 加一筆（含簡介）→ 寫 `content/projects/{id}.html` → `python scripts/make_og_images.py` → `node scripts/build_site.mjs`
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

### Step 2：在 `data/projects.json` 加一筆

欄位見「🛠 產生腳本」。放在陣列裡想要顯示的位置（列表依陣列順序排列）：

```json
{
  "id": "px",
  "title": "作品完整名稱",
  "year": 2026,
  "meta": "Performance",
  "category": "performance",
  "thumb": "assets/images/projects/px/thumb.webp"
}
```

`meta` 常用值：Performance / Exhibition / Case / Collaboration / Events。**需要全新分類**時，要先在 `index.html` 篩選列加一顆按鈕（腳本會檢查分類有沒有對應按鈕）：

```html
<button class="proj-filter-btn" data-filter="你的分類">你的分類顯示文字</button>
```

**不要再手動加 `.work` 卡片、也不要手改 `main.js` 的 `projectsData`**，兩者都由 Step 3.5 的腳本產生。

### Step 3：新增 `content/projects/{id}.html`

寫法見「📋 Template 撰寫標準規範」（不用 `<template>` 外框）。接著產生分享預覽圖：

```bash
python scripts/make_og_images.py
```

### Step 3.5：執行產生腳本

```bash
node scripts/build_site.mjs
```

作品頁 `projects/{id}/`、列表卡片、sitemap 會一起產生。腳本報錯時照訊息修正後重跑。**`projects/` 底下的檔案不要手改**，下次跑腳本會被覆蓋。

### Step 4：驗證

- 產生腳本執行成功（它會檢查作品內容檔、縮圖、分類、簡介）
- 打開 `projects/{id}/` 看作品頁，並從列表點進去、按 Back 回來
- 所有圖片路徑確認存在
- 用瀏覽器打開 `/#projects` 實際看一下新卡片有沒有出現、位置對不對、分類篩選正常
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

`main.js` 的 `videoObserver` 會在影片接近畫面（200px 內）時才播放、離開畫面就暫停；作品頁載入時 `main.js` 會自動掛上。寫成 `autoplay` 的話，打開作品頁就會同時下載所有影片（c1 改之前一打開就下載 30 MB）。

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
| 照片格線共用 class | 80 多處 inline `display:grid` 改成 `gallery-2`／`gallery-3`／`gallery-portrait` 之類的 class，手機收欄的 `!important` 屬性選擇器可一併改乾淨 |
| 作品獨立網址 | `#project/p4` 的 `#` 會被 Google 和社群平台忽略：分享單一作品時預覽卡片永遠是首頁，個別作品也幾乎搜不到。根本解法是每個作品做成獨立靜態頁（如 `projects/p4/`），屬大改版，分三階段。**階段 1（產生腳本）、階段 2（作品獨立網頁 `projects/{id}/`）、階段 3（作品 JSON-LD）2026-11-11 都已完成**。作品頁已上線，使用者分兩天到 Search Console 對 16 個作品頁要求建立索引。階段 3：每件作品的 JSON-LD（日期、場地等資料整理成表格請使用者逐筆確認）。使用者已同意以上方向，作品簡介由 Agent 從作品頁擷取草稿、使用者修改 |
| 網址／網域（跟大改版一起決定） | Google 搜尋結果的網站名稱顯示成「GitHub Pages documentation」、網站圖示是預設的地球：Google 只支援網域層級的網站名稱和網站圖示（favicon），子資料夾（`/PB.github.io/`）無法自訂，網站內容怎麼改都修不了。解法二選一：①買自訂網域（最佳，使用者想等網站完整後再買）②repo 改名為 `k591238.github.io` 變成 user site（免費，也順便解決 robots.txt 問題）。兩者都要處理舊網址轉址、CV PDF 與講義 QR code 重新產生。**2026-11-11 決定：預計 2027 上半年買自訂網域時一併處理**，不先做 ② 或「在 `k591238.github.io` 放臨時入口頁」的過渡方案。買網域時要做：GitHub Pages 設定自訂網域、改 `data/site.json` 的 `baseUrl` 後重跑 `build_site.mjs`、改 `index.html` `<head>` 的 canonical／og／JSON-LD 網址、重新產生 CV PDF 與講義 QR code、Search Console 新增網域資源並提交 sitemap |

### 中 / 低優先

| 作業 | 說明 |
|------|------|
| 語義化 `<h3>` | 部分 template 用 `<h3>` 當標籤文字（如 `Date:`），可改 `<p class="detail-info-label">` |
| `musicWidgets` 重構 | 目前掛在 `window` 全域，可改 module-level 變數 |

---

## 🚫 禁止輕易更動的項目

| 項目 | 位置 | 原因 |
|------|------|------|
| ⛔ **git 歷史（絕對禁止改寫）** | 整個 repo | **不可執行** `git filter-repo`、`git filter-branch`、BFG、`git push --force`／`--force-with-lease`、`git reset --hard` 到已 push 的 commit、刪除或重建 repo。即使看起來是在「清理大檔」「縮小 repo」，也一律不做，只能向使用者提起。改寫歷史會讓所有 clone（含 TD_Laser_POP 的自動同步）失效，而且無法復原 |
| `navigateTo()` | `main.js` L100–158 | SPA 路由核心，修改影響所有頁面切換 |
| `initRouter()` 的作品頁分支 | `main.js` | 作品頁（`body.page-project`）不跑 SPA 路由，但要掛上 `video[data-autoplay]` 的 `videoObserver`，拿掉影片就不會播放 |
| `<base href="../../">` | 作品頁（腳本產生） | 作品內容的 `assets/...` 路徑和選單連結都靠它解析到網站根目錄，拿掉整頁圖片會壞 |
| `redirectLegacyProjectHash()` | `main.js` | 舊網址 `#project/{id}` 轉到 `projects/{id}/`，以前分享出去的連結靠它才不會失效 |
| `scrollObserver` | `main.js` L91–98 | 所有 scroll-reveal 動畫依賴 |
| `.detail-grid-2` / `.detail-grid-3` CSS | `style.css` | `template-c3` 仍在使用，刪除會破版 |
| `particle.js` | `assets/js/particle.js` | 首頁背景獨立模組 |
| `window.musicWidgets` | `main.js` | 音樂播放器控制依賴 |
| SoundCloud API `<script>` | `index.html` 尾部 | 外部依賴，與 music 頁強耦合 |
| `google-site-verification` meta | `index.html` `<head>` | 刪除會讓 Search Console 失去網站擁有權驗證 |
| contextmenu / dragstart 監聽 | `main.js` 尾部 | 基本防盜，**不是安全機制**（repo 公開，原始碼和圖片本來就能下載）：右鍵只在連結上開放（選單、作品卡片可在新分頁開啟），圖片、影片、文字上封鎖。卡片縮圖 `.work-thumb` 設了 `pointer-events: none`，右鍵時點到的是卡片連結而非圖片，所以選單只有「新分頁開啟」、沒有「另存圖片」——拿掉這行縮圖就能被右鍵另存。**刻意不擋 F12／開發者工具快捷鍵**（2026-11-10 試過後還原：擋不住瀏覽器選單、妨礙自己維護），也不要用「偵測開發者工具就 debugger 暫停」的做法 |
| 選單連結的 click 處理 | `main.js` `[data-view]` | 選單、標題都是 `<a href="#...">`：首頁上一般點擊 `preventDefault` 後走 SPA 切換；Ctrl／⌘／Shift＋點擊、或在作品頁上，直接交給瀏覽器（作品卡片是一般連結，不需要 JS） |
| `popstate` 處理 | `main.js` | 網址列手動改成舊的 `#project/{id}` 時要轉址到作品頁，不然會被導回首頁 |

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

### 2026-11-11（大改版階段 1：產生腳本）

1. 新增 `scripts/build_site.mjs`、`data/projects.json`、`data/site.json`（見「🛠 產生腳本」）。作品列表卡片、`main.js` 的 `projectsData`、`sitemap.xml` 改由腳本產生，作品資料只寫一份。
2. 資料以原本手寫卡片為準（卡片才是訪客看到的）：ev1 標題 `PXP 2026 Artist Talk`、e1 `聽說 Whisper`、p1 縮圖 `pic_15.webp`、co2 縮圖 `work_10.webp`，p5／c2／co1 的 alt 保留；`projectsData` 順序改成跟列表一致。拿掉沒有任何作品使用的 `gallery` 欄位。
3. sitemap 改由腳本產生（使用者同意，取代 2026-11-10 換上的線上產生器版本），內容相同，拿掉 Google 不使用的 `priority`。
4. 驗證：16 張卡片的連結、分類、縮圖、alt、標題、年份逐一比對與改版前完全一致；列表、四種分類篩選、點卡片、上一頁、直接開 `#project/p4` 測試通過，無 JS 錯誤。
5. **階段 2：作品獨立網頁**。16 件作品的 `<template>` 搬到 `content/projects/{id}.html`，由腳本產生 `projects/{id}/index.html`（各自的 `<title>`、簡介、canonical、og／twitter 卡片、`CreativeWork` JSON-LD）；`index.html` 從 2905 行減為約 1000 行。作品卡片改連到 `projects/{id}/`，舊的 `#project/{id}` 自動轉址。加上換頁轉場（View Transitions）與滑過卡片預先載入（Speculation Rules）。`main.js` 拿掉 `openProjectDetail()`、`projectsData`、卡片 click 處理，新增作品頁模式。
6. 新增 `scripts/make_og_images.py`，為 16 件作品產生 1200×630 的 `og.jpg`。
7. 每件作品新增簡介 `description`（Agent 從作品頁原文擷取的草稿，請使用者確認）。
8. 驗證：16 件作品在 1280／390px，改版前（`#project/{id}`）與改版後（`projects/{id}/`）的文字、圖片／影片／嵌入網址、內容高度逐一比對一致（p2 的 IG 嵌入每次載入高度不同，兩版都會浮動）；沒有壞圖、沒有 404、沒有 JS 錯誤。換頁操作 11 項測試通過（點卡片、影片播放、Back、作品頁選單與標題、直接開作品頁按 Back、舊網址轉址、手機選單）。
9. **作品頁載入優化**：第一張圖片最優先載入、拿掉疊加的浮現動畫、照片讀完才淡入（見「兩種頁面」）。限速 10 Mbps 實測主要畫面出現時間約縮短一半；16 頁 208 張照片捲到底後全部正常淡入，換頁測試重跑通過。
10. **自製游標跨頁修正**（後來第 11 項改用系統游標，這項已不適用）：換頁後游標不再跳到左上角、轉場時不再出現兩個游標、hover 狀態不會卡住（見「兩種頁面」）。模擬點卡片、Back、首頁內切換、直接開作品頁等 9 個情境連續兩次結果一致。
11. **拿掉自製游標，改用系統游標**：換頁後滑鼠不動時系統游標與自製游標會同時出現，屬瀏覽器限制無法根治；使用者在「先隱藏自製游標到滑鼠移動」「混合模式（點作品不換頁）」「改用系統游標」三案中選擇系統游標。移除 `style.css` 游標區塊、`index.html`／作品頁的游標元素與內嵌規則、`main.js` 游標程式；可點擊元素補上手指游標。驗證：一般區域為箭頭、卡片／篩選／選單／分頁／語言／黑膠／返回／回到頂部皆為手指；換頁 11 項測試通過。
12. **正式網站速度**（上線後實測，無快取、限速 10 Mbps）：作品頁主要畫面 0.7～1.4 秒出現，在 Google 的「良好」標準（2.5 秒）內。
13. **階段 3：作品 JSON-LD**。`data/projects.json` 新增 `credit`／`creators`／`events`／`note`（見「作品的結構化資料」），16 件作品的日期、場地、主辦、角色逐筆跟使用者確認。使用者補充：繫 Sync 主辦 glitch 毛刺空間（受邀展出藝術家）；101 商演不填主辦；Live VJ Lab 2025/07/30–08/03 09:30–16:30 於 BLND；自動販賣機為階段性呈現不建活動；離水山場地與主辦為國立臺灣美術館；聽說 Whisper 2024/10/19–11/03 18:00–22:00 於北藝大戰車草原；Mind Fluid 主辦用透視音像；白晝之夜主辦為臺北數位藝術節。簡介修正：光之曲幕改「臺中國家歌劇院」、自動販賣機補「影像技術」、VIVIDO 改「live audiovisual 演出」（作品頁原文 live A/V 保留，搜尋用完整的 audiovisual）。
14. **Teaching 區新增「音像互動體驗」`handouts/av-perform/`**：講座網頁（私有 repo talks）的表演模式獨立公開，講座本身不公開（使用者決定）。talks 新增 `only: perform` 開關（talks@049faf3），作品集新增 `scripts/sync_perform.mjs`（白名單同步）。公開版預設不滿版，手機也能用面板按鈕操作。驗證：公開版不請求 notes.md／img／presenter，按 N 不開視窗；本機講座行為不變（預設講座頁、7 章、讀講稿、N 開講者視窗）。
15. **Teaching 列表加縮圖**：每筆「年份｜縮圖｜文字｜箭頭」，手機版縮圖在文字上方。雷射 POP 用講義封面「LASER × POP」，音像互動體驗用場景 5 截圖。intro 改為「課程講義、教學資料與互動示範」。

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


