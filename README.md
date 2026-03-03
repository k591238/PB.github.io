# WU CHENG-RU — Portfolio

> New Media Artist · Creative Coder · AV Performer

個人作品集網站，部署於 GitHub Pages。

🔗 **Live**: [https://k591238.github.io/PB.github.io](https://k591238.github.io/PB.github.io)

---

## 架構說明

### 技術棧
- **純 HTML / CSS / JavaScript**（無框架）
- **SPA 單頁應用** — 以 URL hash（`#home` / `#projects` / `#about`）做路由切換
- **RWD 響應式** — 斷點 800px，手機 / 桌面雙佈局
- **Google Fonts** — Kumbh Sans + Noto Sans TC

### 頁面結構

```
index.html（單檔 SPA）
├── NAV BAR（fixed/sticky 導覽列）
├── Mobile Overlay Menu（漢堡選單，clip-path 動畫展開）
├── VIEW: Home（Hero 全螢幕，名字動畫 + 社群連結）
├── VIEW: Projects（左側 Sidebar + 右側作品格線）
├── VIEW: About（照片 + Bio EN/ZH + CV EN/ZH + Tab 切換）
└── Footer
```

### 檔案結構

```
PB.github.io/
├── index.html          # 主頁面（含 inline CSS + JS）
├── README.md           # 本文件
└── assets/
    └── images/
        └── profile.jpg # About 頁大頭照
```

### JS 功能模組
| 模組 | 說明 |
|------|------|
| SPA Router | hash 導航 + `pushState` 歷史紀錄 |
| Mobile Menu | 漢堡開關 + `clip-path` 圓形展開動畫 |
| About Tabs | Bio / CV 分頁切換 |
| Bio 語言切換 | EN ↔ 中文 |
| CV 語言切換 | EN ↔ 中文 |
| Work Cards | 作品卡片點擊（待實作 detail panel） |

---

## TODO

### 🔴 優先
- [ ] **作品 Detail Panel** — 點擊作品卡片後的展開 / 內頁邏輯
- [ ] **作品封面圖** — 替換 4 個佔位卡片為實際作品圖片與資訊
- [ ] **CV PDF** — 放入 `assets/cv.pdf` 實體檔案

### 🟡 建議優化
- [ ] **CSS / JS 外拆** — 將 inline style 與 script 拆分為 `style.css` 和 `main.js`
- [ ] **SVG Icon 去重** — 社群 icon 目前重複 4 次，改用 `<defs>` + `<use>` 或外部檔案
- [ ] **SEO Meta** — 補上 `<meta name="description">`、Open Graph 標籤
- [ ] **Favicon** — 加入網站圖示
- [ ] **Footer 年份動態化** — 改用 JS `new Date().getFullYear()`

### 🟢 加分項
- [ ] 首頁背景微動態（grain / 粒子效果）
- [ ] 作品卡片 hover 動畫強化（圖片微放大、底色浮現）
- [ ] 頁面轉場動畫優化

---

## 開發筆記

- 設計走 **暗色極簡風**（`--bg: #0d0d0d`），適合新媒體藝術家作品集調性
- 目前為單檔 SPA，後續若作品量增加，可考慮拆為多檔或引入輕量打包工具

---

© 2025 WU CHENG-RU
