# WP Keyword AI Tool

一款整合 AI 的 SEO 內容生產與關鍵字研究工具，提供從長尾字挖掘 → 搜尋意圖判斷 → 標題生成 → 文章生成 → WordPress 發佈的完整內容生產流程。

## ✨ 主要功能

### MVP (Phase 1)
- 🔐 使用者認證（Email/Password）
- 🌐 WordPress 網站綁定與測試
- 🔍 核心關鍵字輸入與長尾字 AI 生成
- 🎯 搜尋意圖自動判斷（Informational/Transactional/Navigational）
- 📊 長尾字表格顯示與篩選
- ✍️ 標題生成（Short/SEO/Clickbait）
- 📝 文章 AI 生成（可自訂語氣、長度、風格）
- 🚀 立即發佈到 WordPress
- 📈 發佈狀態追蹤

### V2 (Future)
- 📦 AI 自動分群
- 🔬 Content Gap 分析
- ⏰ 排程發佈
- 🔄 批量操作
- 📥 資料匯出（CSV）

## 🛠️ 技術堆疊

- **Frontend**: Next.js 14+, React 18+, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Node.js 20+
- **Database**: Supabase (PostgreSQL), Prisma ORM
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4o-mini, GPT-4o
- **Deployment**: Vercel

## 📋 開始使用

### 前置需求

- Node.js 20+ 或更新版本
- pnpm (推薦) 或 npm
- Supabase 帳號
- OpenAI API Key
- WordPress 網站（支援 REST API + Application Password）

### 1. 複製專案

```bash
git clone <repository-url>
cd wp-keyword-ai-tool
```

### 2. 安裝依賴

```bash
pnpm install
```

### 3. 設定環境變數

複製 `.env.example` 為 `.env.local`：

```bash
cp .env.example .env.local
```

編輯 `.env.local` 並填入以下資訊：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Database (從 Supabase 取得)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# OpenAI
OPENAI_API_KEY=sk-...

# WordPress 密碼加密金鑰（32 字元隨機字串）
ENCRYPTION_KEY=your-32-character-random-string
```

### 4. 設定 Supabase

#### 4.1 建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com)
2. 建立新專案
3. 選擇地區（建議 Singapore）
4. 記下專案 URL 和 API Keys

#### 4.2 設定 Authentication

1. 前往 Supabase Dashboard → Authentication → Settings
2. 設定 Site URL: `http://localhost:3000` (開發) 或 `https://your-domain.com` (正式)
3. 設定 Redirect URLs:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```

#### 4.3 執行資料庫 Migrations

```bash
# 執行 Prisma migrations
pnpm prisma migrate dev --name init
```

#### 4.4 套用 Row Level Security Policies

1. 前往 Supabase Dashboard → SQL Editor
2. 開啟 `supabase/rls-policies.sql`
3. 複製內容並執行

### 5. 啟動開發伺服器

```bash
pnpm dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 📁 專案結構

```
wp-keyword-ai-tool/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認證頁面
│   ├── (dashboard)/       # 主要應用頁面
│   └── api/               # API Routes
├── components/            # React 組件
├── lib/                   # 工具函式庫
├── store/                 # Zustand stores
├── types/                 # TypeScript 類型
├── prisma/                # Prisma schema & migrations
├── supabase/              # Supabase 設定
└── public/                # 靜態資源
```

## 🔧 開發指令

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 建立 production build
pnpm build

# 執行 production server
pnpm start

# Prisma
pnpm prisma migrate dev      # 建立並執行 migration
pnpm prisma generate          # 產生 Prisma Client
pnpm prisma studio            # 開啟 Prisma Studio

# Linting & Formatting
pnpm lint                     # 執行 ESLint
pnpm format                   # 執行 Prettier
```

## 🚀 部署到 Vercel

### 1. 推送到 GitHub

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. 在 Vercel 建立專案

1. 前往 [Vercel](https://vercel.com)
2. 匯入 GitHub Repository
3. Framework Preset: Next.js
4. Build Command: `pnpm build`
5. Install Command: `pnpm install`

### 3. 設定環境變數

在 Vercel Dashboard → Settings → Environment Variables 新增所有 `.env.local` 中的變數。

### 4. 部署

Vercel 會自動部署。部署完成後：

1. 更新 Supabase 的 Redirect URLs（加入 Vercel URL）
2. 測試正式環境功能

## 🔐 WordPress 設定

### 啟用 Application Password

1. 登入 WordPress 後台
2. 前往 使用者 → 個人資料
3. 捲動到「Application Passwords」區塊
4. 輸入應用程式名稱（例如：WP Keyword AI）
5. 點擊「Add New Application Password」
6. 複製產生的密碼（格式：xxxx xxxx xxxx xxxx）
7. 在本工具中使用此密碼綁定網站

## 📖 使用說明

### 完整流程

1. **註冊/登入**
   - 使用 Email 和密碼註冊帳號
   - 驗證 Email（可選）
   - 登入系統

2. **綁定 WordPress 網站**
   - 前往「網站管理」
   - 新增 WordPress 網站
   - 輸入網站 URL、使用者名稱、Application Password
   - 測試連線

3. **關鍵字研究（Tab 1）**
   - 建立新專案
   - 輸入 1-5 個核心關鍵字
   - 設定語言和國家
   - 點擊「生成長尾字」
   - AI 會生成 20 個長尾字（每個核心字）
   - 查看搜尋意圖分析結果
   - 勾選想要撰寫文章的關鍵字
   - 前往 Tab 2

4. **標題與文章生成（Tab 2）**
   - 查看已選關鍵字
   - 生成標題（Short/SEO/Clickbait 各 3 個版本）
   - 選擇喜歡的標題
   - 設定文章參數：
     - 語氣（formal/friendly/professional/casual）
     - 長度（800/1500/3000/5000 字）
     - 風格（listicle/howto/comparison/review/guide）
   - 生成完整文章
   - 預覽文章內容
   - 前往 Tab 3

5. **發佈管理（Tab 3）**
   - 查看待發佈文章列表
   - 選擇目標 WordPress 網站
   - 設定分類和標籤（V2）
   - 點擊「立即發佈」
   - 查看發佈狀態
   - 如果失敗，可重試

## 🤝 開發指南

完整的開發規格請參閱 [CLAUDE.md](./CLAUDE.md)，包含：

- 詳細的技術架構
- 資料庫設計
- API 路由規劃
- 認證系統實作
- 核心功能模組說明
- AI Prompt 設計
- 部署指南

## 📝 授權

MIT License

## 🙋 支援

如有問題或建議，請開 Issue 或聯繫開發團隊。

---

**開發文件版本**: 1.0
**最後更新**: 2025-11-17
