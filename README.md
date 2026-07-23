# PB.github.io — AI Agent 開發移交說明書

> **給下一位 AI Agent 的讀我文件**  
> 本文件完整記錄專案架構、規範與開發狀態，閱讀後可直接接手繼續開發。  
> 最後更新：2026-07-23

---

## 📁 專案基本資訊

| 項目 | 說明 |
|------|------|
| **性質** | 個人作品集網站（Single Page Application） |
| **技術棧** | 純 HTML + Vanilla CSS + Vanilla JS（無框架、無建置工具） |
| **部署** | GitHub Pages（push 即生效，無需 build 流程） |
| **主要檔案** | `index.html`（~2380行）、`assets/css/style.css`（~1980行）、`assets/js/main.js`（569行） |
| **語系** | 中英混排，介面部分英文，內容部分繁體中文 |

---

## 🗂 完整檔案結構

```
PB.github.io/
├── index.html                    ← 整個 SPA 的唯一 HTML 入口，含所有 View 和 Template
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
│   │   │   ├── e1/               ← 聽說 Whisper（work_*.webp）
│   │   │   ├── e2/               ← 繫 Sync（Exhibition/, Exhibition_Documentation/, performance/）
│   │   │   ├── e3/               ← 鹹淡適中 Glub Glub（work_*.webp）
│   │   │   ├── c1/               ← 101 手錶發表會商演（work_01~29.webp）
│   │   │   ├── c2/               ← Live VJ Lab 工作營（work_*.webp）
│   │   │   ├── c3/               ← 離水山：再臨（work_01~14.webp）
│   │   │   ├── co1/              ← 翼手龍摩天劇院（work_*.webp）
│   │   │   ├── co2/              ← VIVIDO: re-Action（work_*.webp）
│   │   │   └── co3/              ← 樓頂《自動販賣機》（work_*.webp, thumb.webp）
│   │   └── about/                ← 關於頁照片
│   └── videos/
│       └── projects/
│           ├── p3/               ← FUTURE VISION LAB 影片 (mp4)
│           ├── c1/               ← 101 商演影片 (mp4)
│           └── e3/               ← 鹹淡適中 影片 (mp4)
└── scripts/                      ← Python 圖片轉換工具（開發用，不入 build）
    ├── compress_images.py        ← 批次壓縮圖片
    ├── convert_p4.py             ← 轉換 p4 原始照片 → webp
    └── convert_{id}.py ...       ← 各專案對應的轉換腳本
```

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

> ⚠️ **待更新**：`p2, p3, e1, e2, e3, c1, c2, co1, co2` 的 `thumb` 和 `title` 仍是佔位資料（`placehold.co` 圖片 + 英文標題），需換成真實內容。

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

### 圖片格線系統：`.proj-gallery`（2026-07 建立）

**這是最重要的新規範，所有新 Template 必須使用此系統。**

```html
<!-- 標準 2 欄，3:2 比例裁切，15px gap -->
<div class="proj-gallery cols-2">
  <img src="..." alt="Detail" loading="lazy">
  <img src="..." alt="Detail" loading="lazy">
</div>

<!-- 標準 3 欄 -->
<div class="proj-gallery cols-3">...</div>

<!-- 緊湊間距（5px gap）— 用於 p1/e1 等攝影感密集排版 -->
<div class="proj-gallery compact cols-3">
  <!-- 覆蓋預設 3:2 比例 -->
  <img src="..." alt="..." loading="lazy" style="aspect-ratio: 16/9;">
</div>

<!-- 自然高度（不裁切）— 用於 p2/co1/co2 等需保留原始比例的照片 -->
<div class="proj-gallery natural cols-2">...</div>

<!-- 最後一組加底部大間距（80px） -->
<div class="proj-gallery cols-2 mb-lg">...</div>

<!-- 單欄（特殊用途） -->
<div class="proj-gallery cols-1">...</div>
```

**RWD 自動響應：**

| 視窗寬度 | `cols-2` | `cols-3` |
|---------|----------|----------|
| `≥900px`（桌面） | 2欄 | 3欄 |
| `≤900px`（平板） | 2欄 | **2欄** |
| `≤600px`（手機） | **1欄** | **1欄** |

**`.proj-gallery img` 的預設 CSS：**
- `aspect-ratio: 3/2`
- `object-fit: cover`

若需不同比例，加 inline `style="aspect-ratio: 16/9;"` 覆蓋。

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

  <!-- ── 5. 圖片格線（使用 .proj-gallery 系統）── -->
  <div class="project-info p-content" style="margin-top: 40px; margin-bottom: 20px;">
    <h3 style="font-size: 1.2rem; letter-spacing: 0.05em;"><strong>Performance Documentation</strong></h3>
  </div>
  <div class="proj-gallery cols-2">
    <img src="assets/images/projects/{id}/work_01.webp" alt="Detail" loading="lazy">
    <img src="assets/images/projects/{id}/work_02.webp" alt="Detail" loading="lazy">
  </div>
  <div class="proj-gallery cols-3 mb-lg">
    <img src="assets/images/projects/{id}/work_03.webp" alt="Detail" loading="lazy">
    <img src="assets/images/projects/{id}/work_04.webp" alt="Detail" loading="lazy">
    <img src="assets/images/projects/{id}/work_05.webp" alt="Detail" loading="lazy">
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
scripts/convert_{id}.py   ← 建立轉換腳本（參考 convert_p4.py）
python scripts/convert_{id}.py   ← 執行轉換
```

輸出位置：`assets/images/projects/{id}/`  
必要檔案：`banner.webp`（橫幅）、`thumb.webp`（列表縮圖）、`work_*.webp`（各張照片）

### Step 2：更新 `main.js` 的 `projectsData`

```javascript
{
  id: 'px',
  title: '作品完整名稱',
  year: 2026,
  meta: 'Performance',        // Performance / Exhibition / Case / Collaboration
  category: 'performance',    // 小寫，對應篩選按鈕
  thumb: 'assets/images/projects/px/thumb.webp',
  youtubeId: ''               // 有影片則填 YouTube ID，無則留空
}
```

### Step 3：在 `index.html` 新增 `<template>`

位置：在最後一個 `</template>` 之後、`<!-- 懸浮回到頂部按鈕 -->` 之前。

### Step 4：驗證

- `<template id="template-{id}">` 的 id 必須精確對應 `projectsData.id`
- 所有圖片路徑確認存在
- 手機版格線正確退為單欄（CSS 自動處理）

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

---

## 📅 開發歷程紀錄

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


