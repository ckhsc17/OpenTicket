# 113-1 資料庫管理 - OpenTicket 專案
## 組員
陳泊華 B12705014、曾煥軒 B12705002、張佑丞 B12705055

## 專案簡介
近年來，人們對各類活動需求不斷提升，活動參與者和主辦方對於輕量化、便捷、高擴展性的票務管理需求有逐漸上漲的趨勢。目前市面上有多個票務系統可供選擇，並根據活動種類的不同，主辦方和參與者對平台會有不同的要求與偏好。例如：在台灣，一部分的大型演唱會使用拓元訂票系統（e.g. 周杰倫巡迴演出），確保平台具備高流量乘載的穩定性；而展覽、演講則會使用 KKTIX / Accupass 等平台，在方便調整的同時，也較能夠節省平台中介費。
目前大多數的訂票平台，都會有「舉辦」向活動主辦方收取一部分的費用，並
針對「小型活動舉辦方」的族群。

OpenTicket 是一個致力於簡化活動管理和票務操作的線上平台，主打開源及客製化，讓用戶可以瀏覽、預訂及管理演唱會、講座、比賽等活動票券。平台的核心價值在於透過易於使用的功能接口，讓主辦方更有效地管理活動資訊、票務銷售和場地設置，同時讓用戶便捷地查詢、選購票券、並且盡量確保選位流程的正確性。

詳細細節可參考 report.pdf。

🔗 [展示影片連結](https://www.youtube.com/watch?v=M3Gjyj0CihU)

## 使用者功能
### User（一般用戶）的功能
#### 註冊與登入：
- 註冊帳號，填寫基本資訊（使用者名稱、密碼、電子郵件）。
- 登入系統後可查看歷史訂單與活動記錄。
#### 瀏覽活動：
- 按照活動類型、地點或日期篩選活動列表，查看活動詳細資訊（例如演出者、票價、時間與地點）。
#### 購買票券：
- 選擇活動與座位後下訂單，系統會自動生成訂單並記錄交易。
#### 管理訂單：
- 查看所有訂單，若符合條件可取消訂票，並自動退款或補償。
#### 查詢歷史活動記錄：
- 瀏覽參加過的活動資訊，便於未來偏好分析。
#### 查詢票務狀態：
- 查看活動的票務情況，包括可用座位與票價資訊。

### Organizer（主辦方）的功能
#### 創建活動：
- 提供活動名稱、表演者、日期、場地與票價等詳細資訊。
#### 管理活動：
- 更新或刪除活動資訊（例如更改活動日期或描述）。
#### 票務管理：
- 查看票券銷售情況，包括售出票券數量與總收入。
#### 參與者名單：
- 查看參與活動的用戶名單及聯絡方式，便於進行活動統計或管理。
#### 查詢座位狀態：
- 管理場地座位，查詢已售出或可預訂的座位狀態。
#### 分析活動表現：
- 分析活動的座位利用率、參與人數及總收入，進行活動評估。

### Admin（系統管理員）的功能
#### 管理活動：
- 查看所有活動，包括主辦方、場地與狀態等詳細資訊。
#### 票務監控：
- 查看全平台票券銷售記錄，分析售出票券數量與未售票數量。

## 使用方法（本地開發版）
- 使用我們的Supabase Token 連線到我們的資料庫或是使用data資料夾下的csv檔案匯入本機端（若有需求可至最下方「聯繫方式」）
- 在本機端輸入 `python3 -m venv .venv` 創建虛擬環境（推薦做法）
- 在本機端執行 `pip install -r requirements.txt` 安裝後端相關套件
- 進入frontend資料夾，在本機端執行 `npm install` 安裝前端相關套件
- 在專案目錄底下輸入 `uvicorn app.main:app --reload` 啟動fastAPI後端伺服器
- 進入frontend資料夾，輸入 `sudo npm run dev` 啟動前端伺服器
- 進入瀏覽器輸入預設連線通道 `http://localhost:3000` 即可使用
- 若想執行多個client測試，進入frontend資料夾後輸入 `sudo npm run dev:3001` 啟動第二台前端伺服器（可參考 `/frontend/package.json` 設定）

## 使用方法（雲端部署版）
- 直接訪問 https://ticketease-frontend-staging-396633212684.asia-east1.run.app/

## 技術細節
1.	後端技術
    - Supabase：
        - 作為後端資料庫服務，基於 PostgreSQL，提供即時資料庫和身份驗證功能。
        - 使用 Supabase 的 API 接口與資料庫進行交互，實現資料操作（CRUD）功能。
        - 支援即時訂票狀態更新，確保多用戶同時操作時的數據一致性。
    - FastAPI：
        - 使用 FastAPI 開發後端 API，提供高效且易擴展的 RESTful 接口。
        - 支援非同步請求處理，提升高併發下的系統性能。
        - 整合 Supabase 驅動，用於處理活動管理、票務查詢、座位預訂和訂單管理等業務邏輯。
    - JSON Schema 驗證：
        - 透過 FastAPI 提供的 Pydantic 模組，對 API 的請求與響應數據進行結構驗證，確保資料完整性與正確性。
2.	前端技術
	- 使用 Next.js 開發用戶端界面：
        - 提供直觀的活動瀏覽、票務查詢與座位選擇介面。
        - 與 FastAPI 提供的 API 進行連接，實現資料即時更新。
        - Tailwind CSS：用於設計響應式、現代化的 UI。
3.	併行控制
	- 使用 Supabase 的資料庫加鎖機制：
        - 防止多用戶同時預訂相同座位的情況。
        - 使用座位狀態標記（如 Available、Reserved、Sold）來管理座位流轉。
        - 例如：
        - 當用戶確認座位後，該座位立即更新為 Reserved，並限制其他用戶選擇該座位。
        - 若用戶取消或超時未完成付款，座位自動釋放並設為 Available。

## 開發環境
- 作業系統
    - MacOS
- 語言與框架：
    - 後端：Python 3.10 + FastAPI
    - 前端：Next.js + Tailwind CSS
- 資料庫：
    - Supabase（基於 PostgreSQL）

## 參考資料
- [實踐一個售票後台的思路](https://medium.com/jkopay-frontend/%E5%AF%A6%E8%B8%90%E4%B8%80%E5%80%8B%E5%94%AE%E7%A5%A8%E5%BE%8C%E5%8F%B0%E7%9A%84%E6%80%9D%E8%B7%AF-f6015cd897aa)
- [FastAPI 官方文檔](https://fastapi.tiangolo.com/)
- [Supabase 官方文檔](https://supabase.io/docs)
- [Next.js 官方文檔](https://nextjs.org/docs)

## 聯繫方式
若有任何問題，請聯繫 bowenchen0227@gmail.com
