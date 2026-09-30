# TOICE — 多益 60 天衝刺

Next.js + TypeScript 製作的多益學習網站，預設起點 400 分、目標 700 分。使用 Supabase Auth 的 Email／密碼帳號，以及 Supabase PostgreSQL 儲存學習進度。

本版從新的帳號進度開始，不讀取、不匯入原有的本機學習紀錄。尚未設定 Supabase 時會顯示「帳號服務準備中」，不會假裝已啟用雲端功能。

## 開啟網站

Windows：雙擊 `start-toice.cmd`，保持該視窗開啟，再前往 http://127.0.0.1:3000 。
如果網站已經啟動，直接開啟網址即可。這是本機網址，手機或其他電腦無法直接連線。

開發環境建議 Node.js 24 LTS。此電腦啟動檔可使用 Codex 隨附的 Node.js / pnpm；換電腦時請自行安裝 Node.js 與 pnpm。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm typecheck
pnpm build
pnpm start
```

## 第一版功能

- 今日任務、可編輯考試日期與目標分數。
- 900 個單字，分為 18 個情境，各有中文、詞性、自編例句、翻譯、搭配詞、單字與例句美式 IPA。
- 翻面卡：先回想，再評分。空白鍵翻面；沒有聚焦按鈕或輸入框時，1 / 2 / 3 評分。
- 忘記：10 分鐘後；有點印象：1 天後；記得：首次 1 天，之後約 3 / 7 / 16 / 37 / 60 天。
- 待複習優先，再補足每日新字額度（預設 15，設定可調整為 5–30）。
- 每回 10 題，優先已錯／已學字：原有 72 題為情境填空，新增 828 題為語境詞義選擇題；選項隨機排列。
- 錯題加入 10 分鐘後複習，正確答案不直接推算熟練度或多益分數。
- 單字搜尋、18 個情境篩選、收藏、詳細例句與裝置語音朗讀；字庫每頁顯示 24 字，搜尋涵蓋全部 900 字。
- 最近 7 天的練習次數、連續學習天數、情境進度、弱點清單。
- Email 註冊、驗證信、登入、登出、忘記密碼與重設密碼。
- 進度、收藏、練習紀錄與學習設定儲存在登入帳號；可匯出 JSON 留存。
- 登入、重新開啟／切回網頁時讀取雲端，頁面可見時每 30 秒更新，也可按「同步」。
- 手機底部導覽、鍵盤焦點樣式、原生無障礙對話框。

## 資料與限制

學習紀錄存放在 Supabase 的 `public.toice_progress`，以使用者 ID 區分。密碼由 Supabase Auth 處理，進度表不儲存密碼。瀏覽器只由 Supabase SDK 保存登入工作階段，程式不再讀寫 `toice.learning.v1`。清除瀏覽器資料後重新登入可取回已同步進度。
手機、電腦及本機／Vercel 網站必須連接同一個 Supabase 專案，並登入同一帳號。每次寫入先比對資料版本；發生衝突時會讀取最新進度，再套用這次操作。每次操作帶有唯一識別碼，重試不會重複計數。相同設定或收藏同時修改時，以後成功寫入的操作為準。
需要網路才能提交學習操作。雲端確認成功後才更新畫面；失敗時保留這次待重試操作於記憶體，請保持頁面開啟並按「重試」，離開前確認「已同步」。本版不提供離線學習佇列。清除網頁或瀏覽器前尚未送達雲端的操作可能遺失；已送達但回覆中斷的操作會在重試／重新登入後顯示。
發音依作業系統與瀏覽器可用的英文語音提供，聲音品質及是否需連網依裝置而異。
900 字為本站編寫的學習字庫，並非 ETS 官方字表或保證分數的門檻。新增練習中心包含完整題數的自編模考；其難度未經官方校準，不能保證考試成績。
原本 72 個單字的 ID 與順序保留；新增字在原有字之後按情境交錯安排。帳號版從零開始，不自動搬移舊進度，也沒有舊備份匯入入口。
新增美式 IPA 由 CMU Pronouncing Dictionary 的 ARPAbet 轉換，並對詞性造成的多音字補正。整句為逐字讀音參考，不完整標示語流中的連音、弱讀或句子重音；裝置語音可能有口音差異。來源：https://github.com/cmusphinx/cmudict；授權全文：public/licenses/cmudict.txt。字典只供離線產生內容，網站不需連線查字或付費 API。
首頁完成度以每日新字額度與 10 題測驗計算；複習另行顯示。路線圖按開始使用後的天數推進，考試倒數依設定日期計算。
「穩定複習」表示排程間隔達 7 天，屬自評排程指標，並非客觀熟練認證。

## Supabase 設定步驟

### 2026-10-01 練習中心升級

在既有專案執行 `supabase/migrations/202610010001_exam_center.sql`。這是追加式更新，不會刪除或搬移 `toice_progress` 的原有單字紀錄。

- 新增 **516 題**：316 題日常練習、200 題固定模考。Part 1–7 總題數依序為 12、75、48、39、230、40、72。原本 900 道單字練習另行保留。
- 日常練習涵蓋 Part 1–7，可依知識點選題；題組不會被隨機抽題拆散。
- 限時小測以約 20 題為目標（保留完整題組），每題配置 72 秒；完整模考依序為 6／25／39／30／30／16／54 題，聽力 45 分鐘＋閱讀 75 分鐘。離開或重新整理不重設倒數，到時自動交卷；閱讀期間不能回頭修改聽力答案。
- 模考有一份固定卷；重做會遇到相同題目。Part 1 為原創示意圖，Part 2–4 為固定美式合成語音，非真人多口音錄音。音檔由使用者逐題／題組啟動，非正式考試的全場連續播放；篇幅及難度也不等同官方測驗。不做未校準的 TOEIC 分數換算。
- 練習答題後立即解析；小測和模考交卷後顯示答案、中文重點及美式逐字 IPA。模考進行中隱藏翻譯、音標、逐字稿與解析。
- 錯題本包含答錯、未答和猜答；十分鐘後提醒複習，第一次正確後一天再複習，連續兩次不猜而答對後移出。可篩選題型、搜尋與收藏。
- 個人報表包含各 Part 正確率、平均作答秒數、猜答、知識點弱項及歷史紀錄；拼字／聽寫以既有 900 字進行，不改動自評單字排程。
- 聽力練習可調速、重複音檔；解析可逐句朗讀、跟讀錄音。跟讀最長 60 秒，只存在頁面記憶體，不上傳、不自動評分。英式單字朗讀需裝置有相應語音。
- `toice_attempts` 儲存每次測驗，`toice_annotations` 儲存考題與單字筆記／收藏。RLS 限定本人讀寫；測驗 RPC 以版本避免舊裝置覆蓋，使用操作 ID 處理重試，已交卷紀錄不可修改。發生衝突採用最新雲端測驗並通知使用者，須自行確認答案後續做。
- 作答及跳題都等待雲端確認；沒有離線作答佇列。失敗時保留待重試操作於記憶體，離開會有提示。筆記按「儲存筆記」後才同步。登入其他裝置後從「接續上次練習」進入；已開啟的中心可按「同步」讀最新紀錄。
- 練習中心提供獨立的「匯出測驗與筆記」，原設定頁的備份仍只包含單字紀錄。

內容來源為 `content/exam-*.mjs` 的本站自編題目。文法練習含 40 個知識點題族，每族 5 個不同情境；模考文法為另外撰寫的 30 題。內容完整性檢查不等於人工英語教學審訂，仍可持續校訂。

```sh
pnpm exams:build
pnpm exams:check
pnpm test
pnpm build
```

題庫音標沿用 CMUdict 與補正表。固定音檔位於 `public/audio/exams`，由 Windows 隨附的 Microsoft Zira Desktop 語音離線合成，可使用 Windows PowerShell 執行 `scripts/build-exam-audio.ps1` 重新產生；執行前先產生題庫。網站播放現成音檔，不依賴語音 API 金鑰。需維持題目 ID 與既有模考順序以兼容已存進度；新增模考卷時應加入資料版本及遷移，勿直接改寫現有卷。

### 1. 建立專案

前往 https://supabase.com/dashboard 建立帳號與新專案，例如 `toice`。選擇適合的方案與鄰近地區，設定資料庫密碼，等待專案建立完成。資料庫密碼不需要填入網站，也不需要傳給他人。

### 2. 建立資料表與權限

在 Supabase 左側 **SQL Editor → New query**，複製 `supabase/migrations/202609300001_cloud_progress.sql` 的完整內容，貼上並執行。這份 SQL 建立：

- `toice_progress`：每個帳號的學習狀態、版本與更新時間。
- `toice_operations`：儲存操作識別碼，避免斷線重試重複計分。
- RLS：登入者僅能讀自己的進度，訪客不能讀取。
- 兩個 RPC：只允許目前登入的使用者讀寫自己的資料；禁止客戶端直接寫入資料表。

不要關閉 RLS，也不要把資料表改成公開。SQL 可重跑，不會清除既有進度。

### 3. 設定 Email 登入與回跳網址

在 **Authentication → Sign In / Providers → Email** 啟用 Email／Password，保留 Email 確認功能。可將密碼最低長度設為 8。

在 **Authentication → URL Configuration** 設定：

- 本機測試時 Site URL 使用 `http://127.0.0.1:3000/`；部署後改為你的 Vercel 正式 HTTPS 網址。
- Redirect URLs 加入 `http://127.0.0.1:3000/`、需要使用的 `http://localhost:3000/`，以及 Vercel 正式網址（包含結尾 `/`）。
- 使用原有驗證信／重設密碼信的 `ConfirmationURL` 連結範本即可。這版由瀏覽器的 Supabase SDK 處理回跳，沒有額外 `/auth/callback` 路由。

### 4. 設定寄信

Supabase 內建寄信僅供測試，預設只寄給該 Supabase 組織團隊成員的 Email，且有嚴格寄信頻率限制。個人初次測試可使用你的 Supabase 團隊成員 Email；讓其他 Email 註冊之前，請在 **Authentication → Email / SMTP Settings** 設定自己的 SMTP 寄信服務與寄件者。完成服務商要求的寄件者／網域驗證。SMTP 密碼只填在 Supabase，不能放入 `NEXT_PUBLIC_*`。

如果遇到「Email address not authorized」或收不到驗證信，先檢查 SMTP、允許的收件者、垃圾郵件與寄信頻率。不要為了避開寄信問題而關閉 Email 驗證。官方說明：https://supabase.com/docs/guides/auth/auth-smtp 。

### 5. 填入網站連線資料

在專案 **Connect / Project Settings → API Keys** 找到 Project URL 與 Publishable key（`sb_publishable_...`）。舊版專案也可使用 `anon` 公開金鑰。

在專案根目錄將 `.env.example` 複製為 `.env.local`，填入：

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://你的專案代碼.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=你的公開金鑰
```

這兩個值會隨前端程式公開，存取控制由登入憑證和資料庫權限負責。**不要使用 Secret key、service_role 金鑰或資料庫密碼。** `.env.local` 已列入 Git 忽略規則，不要提交。

重新啟動 `pnpm dev`（或停止啟動視窗後重開 `start-toice.cmd`），應能看到登入表單。網站建立的帳號與 Supabase 管理後台帳號是分開的；仍需要在 TOICE 點「免費註冊」。

### 6. 設定 Vercel

1. 把專案放入自己的 GitHub repository（不要上傳 node_modules 或 .next）。
2. 在 Vercel 匯入該 repository，Framework 選 Next.js，根目錄選本專案根目錄。
3. 在 **Settings → Environment Variables** 加入上面的兩個 `NEXT_PUBLIC_*` 值，Production 環境必須設定；需要預覽環境時也設定 Preview。
4. 個人非商業用途可依當時條款使用 Hobby 方案。
5. 保留 `pnpm-lock.yaml`，使用預設建置指令部署。環境變數修改後必須重新部署，因為公開變數在建置時寫入程式。
6. 回 Supabase 完成正式 Site URL 與 Redirect URLs 設定。手機用正式網址，登入相同 TOICE 帳號即可。

### 7. 實際驗收

1. 在 TOICE 註冊，點驗證信，登入；第一次應是 0 個已學單字。
2. 學一字、收藏一字、修改每日目標；等到「已同步」後重新整理，確認仍存在。
3. 手機登入同一帳號，確認紀錄一致；在手機更新後，電腦按「同步」。
4. 登出並用另一個帳號登入，應看到另一份獨立進度。
5. 用「忘記密碼」測試信件回跳與新密碼登入。
6. 暫時斷網後嘗試評分，應顯示尚未確認儲存；恢復網路後按「重試」，該次操作只計算一次。

程式與 SQL 已提供，本機測試使用 PGlite 執行 PostgreSQL 與模擬的 Auth 身分。它驗證 RLS／RPC 與衝突重試，但不能取代實際 Supabase 的 Email 驗證、寄信與跨裝置驗收。

首次部署時，需在自己的 Supabase 專案執行建表 SQL，完成寄信與回跳網址設定，並在 Vercel 填入環境變數。程式建置成功不代表這些雲端設定或 Email 流程已完成驗收。

## 維護

- app/page.tsx：學習操作、帳號工作區、設定與匯出。
- app/auth-gate.tsx：註冊、登入、驗證回跳、忘記／重設密碼、登出。
- app/use-cloud-progress.ts：雲端讀取、儲存、重試及生命週期。
- lib/cloud-progress.ts、lib/cloud-api.ts：操作重套、版本檢查與 Supabase RPC。
- lib/supabase.ts：僅使用公開金鑰的瀏覽器 Supabase client。
- supabase/migrations/202609300001_cloud_progress.sql：資料表、RLS 與 RPC。
- app/views.tsx：五個主要頁面。
- app/globals.css：桌面／手機樣式。
- lib/vocabulary.ts：原有單字與新字整合、學習順序。
- content/vocabulary/*.tsv：新增 828 字的可編輯內容，方括號標記例句中的搭配。
- scripts/build-vocabulary.mjs：驗證內容並產生 lib/vocabulary-expanded.ts；執行 pnpm vocabulary:build 後用 pnpm vocabulary:check 檢查一致性。
- content/pronunciation/cmudict.dict：固定版本的美式發音資料，授權見同目錄 LICENSE。
- lib/distractors.ts：逐題設定的測驗干擾選項。
- lib/learning.ts：排程、統計、資料驗證。
- tests/learning.test.ts：排程、配額、日期、匯入與題庫完整性測試。
- tests/cloud.test.ts：真實 PostgreSQL 引擎中的權限、帳號隔離、衝突、重試與資料驗證。

修改新字內容後執行 pnpm vocabulary:build；請勿直接編輯產生的檔案。追加單字時，請更新產生器、測試與 SQL 中的數量上限，並檢查音標與測驗選項。

紀錄匯出後提供「下載備份檔」連結。若內建預覽沒有下載檔案，請在 Chrome 或 Edge 登入同一帳號匯出。
