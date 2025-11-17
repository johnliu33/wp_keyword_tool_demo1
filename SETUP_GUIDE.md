# 🚀 WP Keyword AI Tool - 完整初始化指南

這份指南會帶你一步步完成專案的初始化設定。

## 📋 前置需求確認

在開始之前，請確認已準備好以下內容：

- [ ] Node.js 20+ 已安裝
- [ ] pnpm 已安裝（推薦）或使用 npm
- [ ] Supabase 帳號（免費）
- [ ] OpenAI API Key（需要有額度）
- [ ] WordPress 網站（用於測試發佈功能）

---

## 步驟 1：取得專案程式碼

```bash
# 複製專案
git clone <repository-url>
cd wp-keyword-ai-tool

# 安裝依賴
pnpm install
```

---

## 步驟 2：設定 Supabase

### 2.1 建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com)
2. 點擊「New Project」
3. 填寫專案資訊：
   - Name: `wp-keyword-ai-tool`（或自訂名稱）
   - Database Password: 設定強密碼（請記住！）
   - Region: 選擇 `Singapore (Southeast Asia)` 或離你最近的區域
4. 點擊「Create new project」並等待專案建立完成（約 2 分鐘）

### 2.2 取得 Supabase 連線資訊

專案建立完成後：

1. 前往 **Project Settings** → **API**
2. 記下以下資訊：
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. 前往 **Project Settings** → **Database**
4. 捲動到「Connection string」區塊
5. 選擇「Connection pooling」標籤
6. 複製連線字串（URI 格式）：
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
7. **將 `[YOUR-PASSWORD]` 替換為你的資料庫密碼**

8. 切換到「Direct connection」標籤
9. 複製連線字串：
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```
10. **同樣替換 `[YOUR-PASSWORD]`**

### 2.3 設定 Authentication

1. 前往 **Authentication** → **URL Configuration**
2. 設定以下 URLs：

   **Site URL** (開發環境):
   ```
   http://localhost:3000
   ```

   **Redirect URLs** (用逗號分隔):
   ```
   http://localhost:3000/auth/callback,
   https://your-domain.vercel.app/auth/callback
   ```

3. 前往 **Authentication** → **Providers**
4. 確認 **Email** provider 已啟用
5. 設定：
   - ✅ Enable Email provider
   - ✅ Confirm email (可選，建議開啟)
   - ❌ Disable Email Confirmations (開發時可關閉以方便測試)

---

## 步驟 3：取得 OpenAI API Key

1. 前往 [OpenAI Platform](https://platform.openai.com)
2. 登入或註冊帳號
3. 前往 **API Keys** 頁面
4. 點擊「Create new secret key」
5. 輸入名稱：`WP Keyword AI Tool`
6. 複製 API Key（格式：`sk-proj-...`）
7. **⚠️ 重要：此 Key 只會顯示一次，請妥善保存**

8. 確認帳戶有可用額度：
   - 前往 **Billing** → **Usage**
   - 確認有可用的 Credits 或已設定付款方式

---

## 步驟 4：設定環境變數

### 4.1 建立 .env.local 檔案

```bash
cp .env.example .env.local
```

### 4.2 編輯 .env.local

開啟 `.env.local` 並填入以下資訊：

```bash
# Supabase（從步驟 2.2 取得）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database（從步驟 2.2 取得，記得替換密碼）
DATABASE_URL="postgresql://postgres.xxxxx:YOUR-PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:YOUR-PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# OpenAI（從步驟 3 取得）
OPENAI_API_KEY=sk-proj-...

# 加密金鑰（產生 32 字元隨機字串）
ENCRYPTION_KEY=請執行下方指令產生
```

### 4.3 產生加密金鑰

**macOS / Linux:**
```bash
openssl rand -hex 16
```

**Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**或使用線上工具：**
- https://randomkeygen.com/ （選擇 256-bit WPA Key）

將產生的 32 字元字串填入 `ENCRYPTION_KEY`。

---

## 步驟 5：初始化資料庫

### 5.1 產生 Prisma Client

```bash
pnpm prisma generate
```

### 5.2 執行資料庫 Migrations

```bash
pnpm prisma migrate dev --name init
```

如果出現錯誤，請檢查：
- ✅ DATABASE_URL 和 DIRECT_URL 是否正確
- ✅ 密碼是否已替換
- ✅ Supabase 專案是否已完成建立

### 5.3 套用 Row Level Security Policies

1. 開啟檔案：`supabase/rls-policies.sql`
2. 複製全部內容
3. 前往 Supabase Dashboard → **SQL Editor**
4. 點擊「New query」
5. 貼上 SQL 內容
6. 點擊「Run」執行

你應該會看到執行結果顯示：
```
✅ Row Level Security Policies 已成功設定！
📊 共設定 5 個資料表的 RLS
🔒 共建立 24 個 Policy
⚡ 共建立 11 個索引
```

---

## 步驟 6：啟動開發伺服器

```bash
pnpm dev
```

看到以下訊息表示成功：
```
▲ Next.js 14.2.15
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.3s
```

---

## 步驟 7：測試功能

### 7.1 開啟瀏覽器

訪問：http://localhost:3000

### 7.2 註冊帳號

1. 點擊「註冊」
2. 輸入 Email 和密碼（至少 6 字元）
3. 點擊「註冊」
4. 如果啟用了 Email 驗證，請前往信箱確認（檢查垃圾信件夾）
5. 登入系統

### 7.3 綁定 WordPress 網站

#### 7.3.1 在 WordPress 建立 Application Password

1. 登入你的 WordPress 網站後台
2. 前往 **使用者** → **個人資料**
3. 捲動到「Application Passwords」區塊
4. 輸入名稱：`WP Keyword AI Tool`
5. 點擊「Add New Application Password」
6. 複製產生的密碼（格式：`xxxx xxxx xxxx xxxx`）

#### 7.3.2 在本工具中綁定網站

1. 前往「網站管理」頁面
2. 點擊「新增網站」
3. 填寫資訊：
   - 網站名稱：自訂名稱（例如：我的部落格）
   - WordPress URL：https://your-site.com
   - 使用者名稱：你的 WordPress 使用者名稱
   - Application Password：剛剛複製的密碼
4. 點擊「測試連線」
5. 看到「連線成功」後，點擊「儲存」

### 7.4 測試關鍵字生成

1. 前往「關鍵字研究」（Tab 1）
2. 建立新專案
3. 輸入核心關鍵字（例如：「SEO 工具」）
4. 點擊「生成長尾字」
5. 等待 AI 生成結果（約 10-20 秒）
6. 查看搜尋意圖分析

### 7.5 測試文章生成

1. 勾選幾個關鍵字
2. 前往「標題與文章生成」（Tab 2）
3. 生成標題
4. 選擇喜歡的標題
5. 設定文章參數
6. 生成文章
7. 預覽內容

### 7.6 測試發佈功能

1. 前往「發佈管理」（Tab 3）
2. 選擇目標 WordPress 網站
3. 點擊「立即發佈」
4. 查看發佈狀態
5. 前往 WordPress 後台確認文章已發佈

---

## 🎉 完成！

恭喜！你已成功設定並測試了 WP Keyword AI Tool。

---

## 🔧 常見問題排解

### Q1: Prisma migrate 失敗

**錯誤訊息：**
```
Error: P1001: Can't reach database server
```

**解決方法：**
1. 檢查 `.env.local` 中的 `DATABASE_URL` 和 `DIRECT_URL` 是否正確
2. 確認密碼已正確替換（不要有 `[YOUR-PASSWORD]` 字樣）
3. 確認 Supabase 專案已完全啟動
4. 檢查網路連線

---

### Q2: OpenAI API 錯誤

**錯誤訊息：**
```
Error: Incorrect API key provided
```

**解決方法：**
1. 確認 `OPENAI_API_KEY` 格式正確（應以 `sk-` 開頭）
2. 確認 API Key 未過期
3. 確認帳戶有可用額度

---

### Q3: WordPress 連線失敗

**錯誤訊息：**
```
WordPress REST API is not available
```

**解決方法：**
1. 確認 WordPress 版本為 5.6+
2. 確認已啟用 REST API（通常預設啟用）
3. 檢查 Application Password 是否正確建立
4. 確認使用者有發佈文章的權限
5. 嘗試訪問：`https://your-site.com/wp-json/wp/v2/`（應該看到 JSON 回應）

---

### Q4: Supabase Auth 錯誤

**錯誤訊息：**
```
Invalid login credentials
```

**解決方法：**
1. 確認 Email 和密碼正確
2. 如果啟用了 Email 驗證，請確認已驗證 Email
3. 檢查 Supabase Dashboard → Authentication → Users 確認帳號是否存在

---

## 📚 下一步

- 📖 閱讀 [CLAUDE.md](./CLAUDE.md) 了解完整技術架構
- 📖 閱讀 [README.md](./README.md) 了解使用說明
- 🚀 開始開發新功能
- 🎨 自訂 UI 樣式

---

## 🆘 需要協助？

如果遇到任何問題，請：

1. 檢查 `.env.local` 設定
2. 查看瀏覽器 Console 錯誤訊息
3. 查看終端機錯誤訊息
4. 前往 Supabase Dashboard 查看 Logs
5. 開 Issue 尋求協助

---

**祝開發順利！** 🎉
