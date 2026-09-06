# Acer Redesign — 兩頁 Demo（列表頁 + 產品詳細頁）

概念性 demo，實作 Figma 高保真設計（file `HEWrjA0NJX4dI037WMmOZ3`）。
與 Acer 官方無關。

- `index.html` — 進入點：範圍聲明 + 「開始瀏覽 →」連到列表頁
- `laptops-list.html` — 筆電列表頁（單一 HTML 檔，CSS/JS 內嵌）
- `product-detail.html` + `style.css` + `main.js` — Swift Go 14 AI 產品詳細頁
- 三頁共用 `images/` 與同一套 `:root` design tokens（逐字相同，改一邊要同步另一邊）
  - `index.html` 與 `product-detail.html` 由 `style.css` 提供 token；
    `laptops-list.html` 的內嵌 `:root` 區塊必須與之逐字相同

## 檔名規則（GitHub Pages 大小寫敏感）

所有 HTML、CSS、JS 與 `images/` 內的檔名一律**純英數小寫、以連字號分隔**，
路徑一律相對路徑。`README.md` 是唯一的例外（GitHub 依慣例辨識此檔名）。
新增資產時請沿用同一規則，否則在 macOS 本機（大小寫不敏感）看起來正常、
上到 GitHub Pages 會 404。

## 本機開啟

直接用瀏覽器開啟即可；若要避免部分瀏覽器對 `file://` 的限制，可起一個簡單伺服器：

```
cd HTML製作
python3 -m http.server 8000
# 瀏覽 http://localhost:8000/
```

發佈前建議掃一次 404：伺服器跑起來後，把三頁都點過一輪，
確認終端機的 access log 裡沒有任何 `404`。

## 已實作

- 桌面（1440）與手機（375）兩種形態（斷點 768px）
- 六台機型完整資料、用途 tabs、系列／價格／重量／螢幕尺寸／特色篩選（AND 跨組、OR 組內、即時套用）
- 系列括號數字依當前結果集動態計算，0 件時 disable
- Empty state 含動態「移除此條件後有 N 件」放寬建議（可點擊直接移除該條件）
- 排序：推薦／價格低→高／價格高→低／重量輕→重
- 比較全流程：勾選（上限 4 台，達上限 disable + tooltip）→ Compare Bar（chip 可單獨移除）→
  Overlay（差異模式：隱藏完全相同列＋標示較優值，僅判定重量／記憶體／儲存／售價四列）→
  關閉（✕ / Esc / 遮罩點擊）後捲動位置、勾選、篩選完整保留，焦點回「開始比較」
- 手機版：篩選為 bottom sheet、卡片 2 欄、比較 overlay 雙欄橫向滑動（規格名稱欄固定）
- 無障礙：鍵盤可完整操作、Esc 關閉、overlay 焦點鎖定、`prefers-reduced-motion` 停用位移動畫

## 刻意不實作（範圍聲明也寫在頁面頂端）

- 首頁與其餘流程（連到 Figma 原型）
- 真實購物車、搜尋、登入（icon 為非互動樣式）
- 分頁（六台一頁顯示完，分頁列為靜態視覺）
- 「立即選購」→ toast 提示未實作結帳
- 比較列刻意只有六列、無電池續航（設計主張，見建置說明書 §8.3）
- localStorage / sessionStorage 一律不使用

## 與 Figma 的差異（有意為之）

- 手機版卡片加了 Figma 未繪出的「比較」checkbox（圖片右上角）：
  比較流程是本 demo 的最高優先路徑，375px 也必須能走完。
- 系列括號數字改為動態計算（Figma 內為靜態設計值，與六台實際分佈不符，說明書 §5 要求）。
- 差異模式標示「儲存」列（說明書 §8.3 定義四列可判定；Figma 93:13 靜態稿僅標了三列）。

## 產品詳細頁（product-detail.html）

已實作：
- Zone 1a Hero 淡入、Zone 1b 敘事 ×3（IntersectionObserver 進場，單次播放）
- Zone 2「數字背後的故事」：GSAP ScrollTrigger pin + scrub（捲動 250%），
  重量對比（0 起算軸線＋「輕 190 公克」差值標註）→ 電池續航（8hr 基準線，
  越線時「超過一天工作 ✓」，觸發進度由數值算出）→ 連接埠側視圖（依序亮起）
- 防呆：768px 以下與 prefers-reduced-motion 完全不註冊 pin（降級為 IO 各自播放
  ／靜態最終狀態）、右下「跳過 ↓」逃生梯、resize 後 ScrollTrigger.refresh()
- §7 三項核准附加效果：規格表數值 count-up（只動純數值）、連接埠 hover/focus/點擊
  互動（鍵盤可用、觸控改點擊）、Sticky Buy Bar 價格常駐（pin 期間可見、375px 縮機型名不縮價格）
- FAQ accordion、保固方案單選（僅 UI 狀態）、機型提示（`?model=` 非 swift-go-14-ai 或缺省時顯示）
- 「加入購物車／立即訂購」→ toast；「加入比較」→ toast 附列表頁連結
- 導覽「筆電」與麵包屑「筆記型電腦」連回 laptops-list.html

### 與 Figma / 說明書的差異（有意為之，均已記錄）
- Zone 2 靜態稿（98:2）是螢幕規格 bars＋tabs；互動規格 §6.2 定義的是
  重量／續航／連接埠三模組的 pin 時間軸。實作以 §6.2 為準，
  保留 Figma 的視覺語言與右側四張數據卡。
- 數據卡數字與評測總分 4.5 在 Figma 為 green-500 文字（白底對比 2.4:1），
  依說明書 §4 無障礙硬規則改 green-700。
- 深色敘事段（設計 03）的綠色小字用 green-500（深底對比 7.9:1；green-700 於深底僅 3.8:1 不合格）。
- 規格表無「儲存」列（Figma 99:2 即無），§7.1 提及的「512」count-up 無對應元素，未實作。
- Figma 內部矛盾，皆照原稿保留、待設計端裁決：規格表「2× Thunderbolt 4」vs
  連接埠圖「TB4 ×1 + USB-C ×1」；FAQ「原廠提供 2 年保固」vs 保固方案／FAQ5「標準 1 年保固」。

## 待確認

- Nitro V 16S、Swift X 14、TravelMate P4 14、Aspire Lite 15 四台的 compare 欄位
  為說明書中的推導值（Figma Compare Overlay 僅含 Predator 與 Swift Go 14 AI 兩台，已逐字核對一致）。
- 「詳情」連到 `product-detail.html?model=<id>`（第二階段，見 `production-guide-product-detail-html.md`）；
  詳細頁需依 `?model=` 在頂端顯示「概念性 demo 僅實作 Swift Go 14 AI 的詳細頁」提示。

## 發佈前檢查（已完成）

- `images/` 內所有檔名為純英數小寫，兩頁 HTML 路徑同步更新
- 三頁 `<head>` 皆有 `title` / `description` / Open Graph / Twitter Card
- favicon：`images/favicon.svg`（主要）、`favicon.ico`（瀏覽器根目錄探測的後備）、
  `images/favicon.png`（apple-touch-icon）
- 本機 `python3 -m http.server` 全站點過，access log 零 404

## 發佈網址

```
https://leortsai.github.io/acer-redesign-demo/
```

三頁的 `og:url` / `og:image` / `canonical` 皆為對應此網址的**完整絕對網址**
（社群平台爬蟲不解析相對路徑）。分享預覽圖為 `images/og.png`（1200×630）。

站台掛在子目錄 `/acer-redesign-demo/` 之下，因此頁面內的資源一律用**相對路徑**，
不可改成 `/images/...` 這種根相對路徑——那會指到網域根目錄而 404。

若之後換了帳號或 repo 名稱，要同步更新三頁 `<head>` 內的九處絕對網址。
