# WU CHENG-RU — Portfolio

> New Media Artist · Creative Coder · AV Performer

個人作品集網站，部署於 GitHub Pages。

🔗 **Live**: [https://k591238.github.io/PB.github.io](https://k591238.github.io/PB.github.io)

---

## 架構說明

### 技術棧
- **純 HTML / CSS / JavaScript**（無框架）
- **SPA 單頁應用** — 以 URL hash（`#home` / `#projects` / `#about` / `#project/id`）做路由切換
- **RWD 響應式** — 斷點 800px，手機 / 桌面雙佈局
- **Google Fonts** — Kumbh Sans + Noto Sans TC

### 頁面結構

```
index.html（SPA 入口）
├── NAV BAR（fixed/sticky 導覽列）
├── Mobile Overlay Menu（漢堡選單，clip-path 動畫展開）
├── VIEW: Home（Hero 全螢幕，名字動畫 + 社群連結）
├── VIEW: Projects（左側 Sidebar + 右側作品格線 + Filter）
├── VIEW: Project Detail（作品內頁，YouTube 嵌入）
├── VIEW: About（照片 + Bio EN/ZH + CV EN/ZH + Tab 切換）
└── Footer
```

### 檔案結構

```
PB.github.io/
├── index.html              # HTML 結構（不含 CSS/JS）
├── README.md               # 本文件
└── assets/
    ├── css/
    │   └── style.css       # 所有樣式
    ├── js/
    │   └── main.js         # SPA 路由、互動邏輯、作品資料
    └── images/
        └── profile.jpg     # About 頁大頭照
```

### JS 功能模組
| 模組 | 說明 |
|------|------|
| SPA Router | hash 導航 + `pushState` 歷史紀錄 + deep-link |
| Mobile Menu | 漢堡開關 + `clip-path` 圓形展開動畫 |
| Project Filter | 四分類篩選（Performance / Exhibition / Case / Collaboration） |
| Project Detail | 點擊作品卡片 → 展開內頁（YouTube 嵌入、瀏覽器返回支援） |
| About Tabs | Bio / CV 分頁切換 |
| Lang Switch | Bio & CV 的 EN ↔ 中文切換 |

---

## TODO

### 🔴 優先
- [ ] **作品真實內容** — 替換佔位卡片為實際作品圖片、名稱、YouTube 連結
- [ ] **CV PDF** — 放入 `assets/cv.pdf` 實體檔案

### 🟡 建議優化
- [ ] **SVG Icon 去重** — 社群 icon 重複多次，改用 `<defs>` + `<use>` 或外部檔案
- [ ] **Favicon** — 加入網站圖示
- [ ] **Open Graph 標籤** — 社群分享卡片

### 🟢 加分項
- [ ] 首頁背景微動態（grain / 粒子效果）
- [ ] 作品卡片 hover 動畫強化
- [ ] 頁面轉場動畫優化

---

© 2025 WU CHENG-RU
