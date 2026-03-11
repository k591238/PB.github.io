# WU CHENG-RU — Portfolio

> New Media Artist · Interactive Developer · A/V Performer

個人作品集網站，部署於 GitHub Pages。

🔗 **Live**: [https://k591238.github.io/PB.github.io](https://k591238.github.io/PB.github.io)

---

## 架構說明

### 技術棧
- **純 HTML / CSS / JavaScript**（無框架、零外部依賴）
- **SPA 單頁應用** — URL hash（`#home` / `#projects` / `#about` / `#project/id`）路由
- **RWD 響應式** — 斷點 800px，手機 / 桌面雙佈局
- **Google Fonts** — Kumbh Sans + Noto Sans TC

### 檔案結構

```
PB.github.io/
├── index.html              # HTML 結構
├── README.md               # 本文件
└── assets/
    ├── css/
    │   └── style.css       # 所有樣式 + CSS tokens
    ├── js/
    │   ├── particle.js     # Bird Fluid 動畫（首頁背景）
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
| Lang Switch | Bio & CV 的 EN / CN 中英文雙語切換 |
| **Bird Fluid** | 3D Boid 群飛動畫，滑鼠相機旋轉 + Blob tracking |

---

## Bird Fluid 動畫參數（`assets/js/particle.js`）

所有可調參數集中在檔案頂部的 `CFG` 物件。

### 鳥群數量與速度

| 參數 | 預設（桌面/手機） | 說明 |
|------|------------------|------|
| `count` | `100` / `60` | 鳥的數量，越多越耗效能 |
| `maxSpeed` | `2.6` / `2.0` | 最大飛行速度（px/frame） |
| `maxForce` | `0.055` | 每幀最大加速度，影響轉向靈活度 |
| `worldR` | `420` / `300` | 鳥群生成空間的半徑（越大覆蓋範圍越廣） |

### Boid 群體行為（三力權重）

| 參數 | 預設 | 說明 |
|------|------|------|
| `sepWeight` | `1.7` | **分離力**：避免碰撞，調高 → 鳥群更散 |
| `aliWeight` | `1.0` | **對齊力**：跟上鄰近方向，調高 → 更整齊 |
| `cohWeight` | `0.85` | **凝聚力**：向群體中心靠，調高 → 更聚集 |
| `wanderWeight` | `0.55` | **漫遊力**：個體隨機力，調高 → 飛行更隨意散亂 |
| `wanderSpeed` | `0.055` | 漫遊方向的漂移速率，調高 → 轉向更頻繁 |
| `sepRadius` | `40` | 分離感知距離（3D 世界單位） |
| `aliRadius` | `85` | 對齊感知距離 |
| `cohRadius` | `85` | 凝聚感知距離 |

> **調整技巧**：`wanderWeight` ↑ + `cohWeight` ↓ → 鳥群更像流體隨機飄散；反之則更像整齊編隊。

### 相機與透視

| 參數 | 預設 | 說明 |
|------|------|------|
| `fov` | `350` | 透視焦距（px）。調小 → 魚眼誇張，調大 → 接近正射影 |
| `camSmooth` | `0.015` | 相機跟隨平滑度（0~1），越大越跟手、越小慣性越重 |
| `camMaxX` | `0.65` | 滑鼠 Y 可旋轉的最大 pitch 角（rad，約 ±37°） |
| `camMaxY` | `Math.PI` | 滑鼠 X 可旋轉的最大 yaw 角（rad，預設 ±180°） |

> ⚠️ `worldR * 0.6`（在 `project()` 函式內）為相機距離 offset，調小 → 畫面更近；若要改需直接編輯函式。

### 滑鼠互動（Blob Tracking）

| 參數 | 預設（桌面/手機） | 說明 |
|------|------------------|------|
| `blobRadius` | `130` / `90` | 互動框偵測半徑（screen px） |
| `blobRepelSS` | `2.2` | 鳥被游標推開的力度 |

### 視覺外觀

| 參數 | 預設 | 說明 |
|------|------|------|
| `trailLen` | `20` | 拖尾軌跡幀數，調大 → 尾巴更長 |
| `wingSpan` | `7` / `5` | 翅膀展開寬（px，會依景深縮放） |
| `wingAngle` | `0.52` | V 型開口角（rad，約 30°），調大 → 更扁平 |
| `birdColor` | `#d9ff82` | 鳥的顏色 |
| `trailColor` | `rgba(217,255,130,0.22)` | 軌跡顏色（含透明度） |

### 3D 空間網格與座標軸（Grid & Axes）

| 元素 | 說明 |
|------|------|
| **地板網格** | XZ 平面投影（高度固定在 `y = worldR * 0.85`）。範圍延伸至 `worldR * 2.2`，隨著景深淡化透明度。 |
| **X / Z 軸** | 分別以紅色（X軸）與藍色（Z軸）標示，平貼於地板網格上且向外無限延伸。 |
| **Y 軸** | 以綠色標示，從地板網格中心點垂直向上無限延伸（`y = worldR * 0.85` 至畫面頂端之外）。 |

---

## 作品內容更新（`assets/js/main.js`）

在 `main.js` 頂部 `projectsData` 陣列新增或修改作品卡片：

```js
{
  id: 'p1',               // 唯一 ID（對應 HTML data-project）
  title: 'Performance 1', // 顯示名稱
  year: 2025,
  meta: 'Performance',    // 副標（年份·類型）
  category: 'performance',// 篩選分類（performance/exhibition/case/collaboration）
  thumb: '',              // 封面圖路徑（留空則隱藏）
  youtubeId: 'dQw4w9WgXcQ' // YouTube 影片 ID（留空則不嵌入）
}
```

新增作品除了修改 `main.js`，還需在 `index.html` 的 `.works-grid` 區塊加入對應的 HTML 卡片（`data-project` 對應 `id`）。

---

## TODO

### 🔴 優先
- [ ] **作品真實內容** — 替換佔位卡片為實際作品圖片、名稱、YouTube 連結
- [ ] **About 照片** — 放入 `assets/images/profile.jpg`

### 🟡 建議優化
- [ ] **Favicon** — 加入網站圖示
- [ ] **Open Graph 標籤** — 社群分享卡片預覽
- [ ] **CV PDF** — 放入 `assets/cv.pdf`

### 🟢 最新優化與清理 (2026/03)
- **架構與效能優化 (Awwwards Level)**：
  - 移除了 HTML 結構中非必要的 Inline styles（如 `proj-main`、`proj-footer` 以及專案內文模板），並統一收斂至 `style.css` 透過 Class 進行管理，提升程式碼可讀性與日後維護性。
  - 針對 `main.js` 的全域捲動事件（Scroll Event）引入 `requestAnimationFrame` 進行節流（Throttle）處理，避免過度計算造成渲染效能消耗與佈局重繪（Layout Thrashing），顯著提升網頁捲動時的流暢度。
  - 修復 SPA 視圖切換（View Exit）時，因原先使用 `position: absolute` 導致排版與高度坍塌的閃爍與捲動亂跳問題，並將路由捲動回頂部的方式優化為無動畫瞬間置頂，提升 UX 流暢度。
- 調整 CV 區塊的語言切換設計，將英文（EN）與中文（CN）按鈕整合至與 Bio、CV 導覽列同行的右側，並將選項字體放大。
- 更新中英文版簡歷（CV）內容並確保左右語系資料一致，包含加上過去相關工作坊與展演等相關外部連結。
- 移除了未使用的 `footer` 元素，並同步清理了 `style.css` 與 `main.js` 中的對應程式碼，避免頁面載入時發生 Javascript 錯誤。
- 清理了 `particle.js` 中的部分閒置程式碼，精簡程式碼結構。
- 調整首頁標題及社群連結位置，並將版權宣告移至畫面置中。

---

© 2026 WU CHENG-RU
