# WP Keyword AI Tool - 完整開發規格文件

## 📋 目錄

1. [專案概述](#專案概述)
2. [技術架構](#技術架構)
3. [資料庫設計](#資料庫設計)
4. [認證系統](#認證系統)
5. [核心功能模組](#核心功能模組)
6. [API 路由規劃](#api-路由規劃)
7. [開發優先順序](#開發優先順序)
8. [部署指南](#部署指南)

---

## 專案概述

### 產品定位
WP Keyword AI Tool 是一款整合 AI 的 SEO 內容生產與關鍵字研究工具，提供從長尾字挖掘 → 搜尋意圖判斷 → 標題生成 → 文章生成 → WordPress 發佈的完整內容生產流程。

### 使用者流程
```
登入系統
  → 綁定 WordPress 網站
  → Tab1: 輸入核心關鍵字 + AI 產生長尾字
  → Tab2: 選標題 + 生成文章
  → Tab3: 發佈到 WordPress
```

### MVP 範圍 (Phase 1)
- ✅ 使用者認證（Email/Password）
- ✅ WordPress 網站綁定與測試
- ✅ 核心關鍵字輸入（1-5 個）
- ✅ AI 長尾字生成（每個核心字 20 組）
- ✅ 搜尋意圖自動判斷
- ✅ 長尾字表格顯示
- ✅ 標題生成（Short/SEO/Clickbait 各 3 個版本）
- ✅ 文章生成（可設定語氣、長度）
- ✅ 立即發佈到 WordPress
- ✅ 發佈狀態追蹤

### V2 功能 (Phase 2)
- AI 自動分群
- Content Gap 分析
- 排程發佈
- 批量操作
- 資料匯出（CSV）

### V3 功能 (未來)
- 心智圖視覺化
- 搜尋量 API 整合
- 圖片自動配圖
- 富文本編輯器

---

## 技術架構

### 技術堆疊

```yaml
Frontend:
  - Next.js 14+ (App Router)
  - React 18+
  - TypeScript 5+
  - Tailwind CSS 3+
  - shadcn/ui (UI 組件)
  - Zustand (狀態管理)
  - TanStack Table v8 (表格)
  - React Hook Form + Zod (表單驗證)

Backend:
  - Next.js API Routes
  - Node.js 20+
  - Server Actions

Database & Auth:
  - Supabase (PostgreSQL + Auth)
  - Prisma ORM 5+
  - Row Level Security (RLS)

AI:
  - OpenAI GPT-4o-mini (長尾字生成、意圖判斷)
  - OpenAI GPT-4o (文章生成)

WordPress:
  - WordPress REST API
  - Application Password 認證

Deployment:
  - Vercel (主機)
  - Vercel Cron Jobs (排程任務)

Development:
  - ESLint + Prettier
  - Husky (Git Hooks)
  - pnpm (套件管理)
```

### 專案結構

```
wp-keyword-ai-tool/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 認證相關頁面
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts
│   ├── (dashboard)/              # 主要應用頁面
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── sites/                # WordPress 網站管理
│   │   │   └── page.tsx
│   │   ├── keywords/             # Tab 1: 關鍵字研究
│   │   │   └── page.tsx
│   │   ├── articles/             # Tab 2: 標題與文章生成
│   │   │   └── page.tsx
│   │   └── publish/              # Tab 3: 發佈管理
│   │       └── page.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/                 # 認證相關 API
│   │   ├── sites/                # WordPress 網站管理
│   │   ├── keywords/             # 關鍵字生成
│   │   ├── titles/               # 標題生成
│   │   ├── articles/             # 文章生成
│   │   ├── publish/              # 發佈功能
│   │   └── cron/                 # Cron Jobs
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # React 組件
│   ├── ui/                       # shadcn/ui 組件
│   ├── auth/                     # 認證組件
│   ├── keywords/                 # 關鍵字相關組件
│   ├── articles/                 # 文章相關組件
│   └── publish/                  # 發佈相關組件
├── lib/                          # 工具函式庫
│   ├── supabase/
│   │   ├── client.ts             # 瀏覽器端 client
│   │   ├── server.ts             # 服務端 client
│   │   └── middleware.ts         # Middleware helper
│   ├── prisma.ts                 # Prisma client
│   ├── openai.ts                 # OpenAI client
│   ├── wordpress.ts              # WordPress API client
│   ├── encryption.ts             # 密碼加密工具
│   └── utils.ts                  # 通用工具
├── store/                        # Zustand stores
│   ├── useKeywordStore.ts
│   ├── useArticleStore.ts
│   └── useUserStore.ts
├── types/                        # TypeScript 類型定義
│   ├── database.ts
│   ├── wordpress.ts
│   └── ai.ts
├── prisma/
│   ├── schema.prisma             # Prisma Schema
│   └── migrations/               # 資料庫遷移
├── supabase/
│   ├── migrations/               # Supabase migrations
│   └── seed.sql                  # 初始資料
├── public/                       # 靜態資源
├── .env.local                    # 環境變數
├── .env.example                  # 環境變數範例
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 資料庫設計

### Prisma Schema

詳見 `prisma/schema.prisma` 檔案。

### 主要資料表

#### users (Supabase Auth 管理)
- id (UUID, PK)
- email (unique)
- name
- created_at
- updated_at

#### sites (WordPress 網站)
- id (UUID, PK)
- name
- url
- auth_type (app_password)
- username
- password_enc (加密儲存)
- user_id (FK to users)
- created_at

#### projects (關鍵字專案)
- id (UUID, PK)
- name
- core_keywords (string[])
- language (預設 zh-TW)
- country (預設 TW)
- user_id (FK to users)
- created_at
- updated_at

#### keywords (關鍵字)
- id (UUID, PK)
- keyword
- intent (informational | transactional | navigational)
- purchase_score (0-1)
- group (High Purchase | Commercial | Informational)
- content_type (比較文 | 教學 | 評測)
- relevance_score (0-1)
- suggested_volume
- project_id (FK to projects)
- created_at

#### longtails (長尾字)
- id (UUID, PK)
- keyword
- parent_id (FK to keywords)

#### articles (文章)
- id (UUID, PK)
- title
- content (text)
- slug
- meta_description
- title_type (short | seo | clickbait)
- tone (formal | friendly | professional | casual)
- style (listicle | howto | comparison | review | guide)
- word_count (預設 1500)
- status (draft | scheduled | published | failed)
- scheduled_at
- published_at
- wp_post_id
- wp_post_url
- error
- retry_count
- user_id (FK to users)
- site_id (FK to sites)
- created_at
- updated_at

### Row Level Security (RLS)

所有資料表皆啟用 RLS，使用者只能存取自己的資料。詳見 `supabase/rls-policies.sql`。

---

## 認證系統

### 技術方案
- **Supabase Auth**（處理認證邏輯）
- **Next.js Middleware**（保護路由）
- **Cookie-based Session**（無需 JWT 手動管理）

### MVP 功能
- Email/Password 註冊
- Email/Password 登入
- 登出
- Email 驗證（可選）

### V2 功能
- Google OAuth
- 忘記密碼
- 變更密碼

### 認證流程

#### 註冊流程
```typescript
1. 使用者填寫 Email + Password
2. 呼叫 supabase.auth.signUp()
3. Supabase 發送驗證信（可選）
4. 重導向到登入頁面
```

#### 登入流程
```typescript
1. 使用者填寫 Email + Password
2. 呼叫 supabase.auth.signInWithPassword()
3. Supabase 設定 Cookie
4. 重導向到 Dashboard
```

#### 路由保護
```typescript
// middleware.ts
- 未登入使用者：重導向到 /login
- 已登入使用者：可存取 /dashboard 相關頁面
```

### 實作檔案
- `app/(auth)/login/page.tsx` - 登入頁面
- `app/(auth)/signup/page.tsx` - 註冊頁面
- `app/auth/callback/route.ts` - OAuth Callback
- `lib/supabase/client.ts` - 瀏覽器端 client
- `lib/supabase/server.ts` - 服務端 client
- `lib/supabase/middleware.ts` - Middleware helper
- `middleware.ts` - Next.js Middleware

---

## 核心功能模組

### Tab 1：關鍵字研究

#### 功能清單
1. 建立新專案
2. 輸入核心關鍵字（1-5 個）
3. 設定語言、國家
4. AI 生成長尾字（每個核心字 20 組）
5. AI 判斷搜尋意圖
6. 顯示長尾字表格
7. 勾選關鍵字
8. 匯出到 Tab 2

#### AI Prompt 設計

**長尾字生成 Prompt:**
```typescript
const prompt = `你是專業的 SEO 關鍵字研究專家。

請針對核心關鍵字「${coreKeyword}」生成 20 個繁體中文長尾關鍵字。

要求：
1. 包含各種搜尋意圖（資訊型、交易型、導航型）
2. 符合台灣使用者的搜尋習慣
3. 不同長度（3-8 字）
4. 具有搜尋潛力

請以 JSON 格式輸出：
[
  {
    "keyword": "長尾關鍵字",
    "intent": "informational|transactional|navigational",
    "relevanceScore": 0.0-1.0,
    "suggestedVolume": "1K-10K"
  }
]

只輸出 JSON，不要其他說明文字。`;
```

#### 資料流程
```
1. 使用者輸入核心關鍵字
2. 呼叫 /api/keywords/generate
3. OpenAI GPT-4o-mini 生成長尾字
4. 儲存到 keywords 和 longtails 表
5. 顯示在表格中
6. 使用者勾選關鍵字
7. 使用 Zustand 儲存選擇
8. 前往 Tab 2
```

#### UI 組件
- `KeywordProjectForm` - 專案建立表單
- `KeywordGenerationForm` - 關鍵字生成表單
- `KeywordTable` - 長尾字表格
- `KeywordCard` - 關鍵字卡片
- `IntentBadge` - 意圖標籤

---

### Tab 2：標題與文章生成

#### 功能清單
1. 顯示已選關鍵字
2. 生成標題（Short/SEO/Clickbait 各 3 個）
3. 選擇標題版本
4. 設定文章參數（語氣、長度、風格）
5. 生成完整文章
6. 預覽文章
7. 匯出到 Tab 3

#### AI Prompt 設計

**標題生成 Prompt:**
```typescript
const prompt = `你是專業的 SEO 文案撰寫專家。

關鍵字：${keyword}
搜尋意圖：${intent}

請生成 3 個標題，類型：${type}

要求：
- Short: 簡潔有力，30 字元內
- SEO: 包含關鍵字，50-60 字元，吸引搜尋引擎
- Clickbait: 吸引點擊，可包含數字、問句、驚嘆詞

JSON 格式：
[
  {
    "title": "標題文字",
    "slug": "url-friendly-slug",
    "metaDescription": "150-160 字元的描述"
  }
]

只輸出 JSON。`;
```

**文章生成 Prompt:**
```typescript
const prompt = `你是專業的 SEO 內容撰寫專家。

文章參數：
- 標題：${title}
- 關鍵字：${keyword}
- 搜尋意圖：${intent}
- 語氣：${tone}
- 風格：${style}
- 字數：${wordCount}

請撰寫一篇完整的 SEO 文章。

要求：
1. 使用繁體中文（台灣）
2. 包含引言、主要內容、結論
3. 適當使用 H2、H3 標題
4. 自然融入關鍵字（不要過度堆疊）
5. ${getIntentSpecificRequirements(intent)}

輸出 Markdown 格式。`;

function getIntentSpecificRequirements(intent: string) {
  switch (intent) {
    case 'transactional':
      return '包含產品比較、優缺點分析、購買建議、CTA';
    case 'informational':
      return '提供詳細教學、步驟說明、範例、FAQ';
    case 'navigational':
      return '介紹品牌、產品特色、服務內容';
  }
}
```

#### 資料流程
```
1. 從 Zustand 取得選擇的關鍵字
2. 呼叫 /api/titles/generate
3. OpenAI GPT-4o-mini 生成標題
4. 使用者選擇標題並設定參數
5. 呼叫 /api/articles/generate
6. OpenAI GPT-4o 生成文章
7. 儲存到 articles 表
8. 顯示預覽
9. 前往 Tab 3
```

#### UI 組件
- `SelectedKeywords` - 已選關鍵字列表
- `TitleGenerator` - 標題生成介面
- `TitleCard` - 標題卡片（可選擇）
- `ArticleConfigForm` - 文章參數設定
- `ArticlePreview` - 文章預覽
- `MarkdownRenderer` - Markdown 渲染

---

### Tab 3：發佈與排程

#### 功能清單 (MVP)
1. 顯示待發佈文章列表
2. 選擇目標 WordPress 網站
3. 設定分類、標籤
4. 立即發佈
5. 顯示發佈狀態
6. 錯誤處理與重試

#### V2 功能
- 排程發佈
- 批量發佈
- 發佈歷史記錄

#### WordPress API 整合

**測試連線:**
```typescript
// lib/wordpress.ts
export async function testWordPressConnection(
  url: string,
  username: string,
  password: string
) {
  const response = await fetch(`${url}/wp-json/wp/v2/users/me`, {
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    },
  });

  if (!response.ok) {
    throw new Error('WordPress 連線失敗');
  }

  return await response.json();
}
```

**發佈文章:**
```typescript
export async function publishArticle(
  site: Site,
  article: Article
) {
  const decryptedPassword = decrypt(site.passwordEnc);

  const response = await fetch(`${site.url}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${site.username}:${decryptedPassword}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: article.title,
      content: article.content,
      slug: article.slug,
      status: 'publish',
      meta: {
        description: article.metaDescription,
      },
      categories: [], // V2
      tags: [], // V2
    }),
  });

  if (!response.ok) {
    throw new Error('發佈失敗');
  }

  const result = await response.json();

  // 更新文章狀態
  await prisma.article.update({
    where: { id: article.id },
    data: {
      status: 'published',
      publishedAt: new Date(),
      wpPostId: result.id,
      wpPostUrl: result.link,
    },
  });

  return result;
}
```

#### 錯誤處理
```typescript
// 自動重試機制（最多 3 次）
async function publishWithRetry(site: Site, article: Article) {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      return await publishArticle(site, article);
    } catch (error) {
      retryCount++;

      if (retryCount >= maxRetries) {
        // 更新文章狀態為失敗
        await prisma.article.update({
          where: { id: article.id },
          data: {
            status: 'failed',
            error: error.message,
            retryCount,
          },
        });
        throw error;
      }

      // 指數退避
      await new Promise(resolve =>
        setTimeout(resolve, 2000 * Math.pow(2, retryCount))
      );
    }
  }
}
```

#### UI 組件
- `ArticleList` - 文章列表
- `SiteSelector` - WordPress 網站選擇器
- `PublishButton` - 發佈按鈕
- `PublishStatus` - 發佈狀態顯示
- `ErrorAlert` - 錯誤提示

---

## API 路由規劃

### 認證相關
```
GET  /api/auth/user              取得當前使用者
POST /api/auth/logout            登出
```

### WordPress 網站管理
```
GET    /api/sites                取得所有網站
POST   /api/sites                新增網站
PUT    /api/sites/:id            更新網站
DELETE /api/sites/:id            刪除網站
POST   /api/sites/:id/test       測試連線
```

### 關鍵字研究
```
GET  /api/projects               取得所有專案
POST /api/projects               建立專案
GET  /api/projects/:id           取得專案詳情
POST /api/projects/:id/generate  生成長尾字
GET  /api/keywords/:projectId    取得專案的所有關鍵字
```

### 標題與文章生成
```
POST /api/titles/generate        生成標題
POST /api/articles/generate      生成文章
GET  /api/articles               取得所有文章
GET  /api/articles/:id           取得文章詳情
PUT  /api/articles/:id           更新文章
DELETE /api/articles/:id         刪除文章
```

### 發佈管理
```
POST /api/publish                立即發佈
POST /api/publish/schedule       排程發佈 (V2)
POST /api/publish/retry/:id      重試發佈
GET  /api/publish/status/:id     查詢發佈狀態
```

### Cron Jobs (V2)
```
GET /api/cron/publish            處理排程發佈任務
```

---

## 開發優先順序

### Phase 1: 專案基礎建設（Week 1-2）

#### Week 1: 專案架構 + 認證系統
```
Day 1-2:
✅ 建立 Next.js 專案
✅ 設定 TypeScript, Tailwind CSS, ESLint
✅ 安裝 shadcn/ui 組件
✅ 設定 Supabase 專案
✅ 設定 Prisma
✅ 執行資料庫 migrations

Day 3-4:
✅ 實作 Supabase Auth
  - 註冊頁面
  - 登入頁面
  - Middleware 路由保護
✅ 實作使用者資料取得
✅ 設計基本 Layout

Day 5:
✅ 測試認證流程
✅ 優化 UI/UX
```

#### Week 2: WordPress 整合
```
Day 1-2:
✅ 實作 WordPress 網站管理 CRUD
✅ 實作密碼加密/解密
✅ 實作連線測試功能

Day 3-4:
✅ 實作 WordPress API 客戶端
✅ 測試發佈文章功能
✅ 錯誤處理

Day 5:
✅ 建立 WordPress 管理頁面
✅ 測試整合流程
```

---

### Phase 2: 核心功能開發（Week 3-4）

#### Week 3: Tab 1 關鍵字研究
```
Day 1-2:
✅ 設定 OpenAI API 客戶端
✅ 實作專案建立功能
✅ 實作關鍵字生成 API
✅ 優化 AI Prompt

Day 3-4:
✅ 實作關鍵字表格組件
✅ 實作搜尋意圖標籤
✅ 實作關鍵字勾選功能
✅ 設定 Zustand store

Day 5:
✅ 整合測試
✅ 效能優化（loading 狀態、錯誤處理）
```

#### Week 4: Tab 2 標題與文章生成
```
Day 1-2:
✅ 實作標題生成 API
✅ 實作標題選擇 UI
✅ 實作文章參數設定表單

Day 3-4:
✅ 實作文章生成 API
✅ 優化 Intent-based Prompts
✅ 實作 Markdown 預覽組件

Day 5:
✅ 整合測試
✅ AI 輸出品質調優
```

---

### Phase 3: 發佈功能（Week 5-6）

#### Week 5: Tab 3 發佈管理
```
Day 1-2:
✅ 實作文章列表頁面
✅ 實作發佈 API
✅ 實作錯誤處理與重試

Day 3-4:
✅ 實作發佈狀態追蹤
✅ 實作發佈歷史記錄
✅ 優化使用者回饋

Day 5:
✅ 完整流程測試
✅ Edge Case 處理
```

#### Week 6: 測試與優化
```
Day 1-2:
✅ End-to-End 測試
✅ 效能優化
✅ 安全性檢查

Day 3-4:
✅ UI/UX 優化
✅ 錯誤訊息優化
✅ Loading 狀態完善

Day 5:
✅ 部署到 Vercel
✅ 正式環境測試
✅ 文件整理
```

---

## 部署指南

### 環境變數設定

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Database (Prisma)
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# OpenAI
OPENAI_API_KEY=sk-...

# Encryption (for WordPress passwords)
ENCRYPTION_KEY=your-32-character-encryption-key

# Vercel (optional, for cron jobs)
CRON_SECRET=your-random-secret-string
```

### Vercel 部署步驟

1. **連結 GitHub Repository**
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **在 Vercel 建立專案**
   - 匯入 GitHub Repository
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`

3. **設定環境變數**
   - 在 Vercel Dashboard → Settings → Environment Variables
   - 複製 .env.local 的內容
   - 設定為 Production 環境

4. **執行資料庫 Migrations**
   ```bash
   # 在本機執行
   pnpm prisma migrate deploy
   ```

5. **部署**
   - Vercel 會自動部署
   - 檢查部署日誌
   - 測試正式環境

### Supabase 設定

1. **建立專案**
   - 前往 https://supabase.com
   - 建立新專案
   - 選擇地區（建議 Singapore）

2. **設定 Authentication**
   - 前往 Authentication → Settings
   - 設定 Site URL: `https://your-app.vercel.app`
   - 設定 Redirect URLs:
     ```
     https://your-app.vercel.app/auth/callback
     http://localhost:3000/auth/callback
     ```

3. **執行 RLS Policies**
   - 前往 SQL Editor
   - 執行 `supabase/rls-policies.sql`

4. **取得連線字串**
   - Project Settings → Database
   - 複製 Connection Pooling URL (用於 DATABASE_URL)
   - 複製 Direct Connection URL (用於 DIRECT_URL)

### 初次部署檢查清單

- [ ] Supabase 專案已建立
- [ ] 資料庫 Migrations 已執行
- [ ] RLS Policies 已套用
- [ ] Vercel 環境變數已設定
- [ ] OpenAI API Key 已設定
- [ ] Encryption Key 已生成（32 字元隨機字串）
- [ ] 部署成功
- [ ] 註冊/登入功能正常
- [ ] WordPress 連線測試成功
- [ ] AI 生成功能正常
- [ ] 發佈到 WordPress 成功

---

## 開發指令

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 執行 Prisma migrations
pnpm prisma migrate dev

# 產生 Prisma Client
pnpm prisma generate

# 開啟 Prisma Studio
pnpm prisma studio

# 建立 production build
pnpm build

# 執行 production server
pnpm start

# Linting
pnpm lint

# 格式化程式碼
pnpm format
```

---

## 安全性考量

### 1. 密碼加密
WordPress 密碼使用 AES-256-CBC 加密儲存在資料庫中。

### 2. Row Level Security
所有資料表啟用 RLS，使用者只能存取自己的資料。

### 3. API 路由保護
所有 API Routes 都驗證使用者認證狀態。

### 4. 環境變數
敏感資訊（API Keys、加密金鑰）存在環境變數中，不提交到 Git。

### 5. HTTPS
生產環境強制使用 HTTPS（Vercel 自動提供）。

### 6. Rate Limiting (V2)
使用 Upstash Redis 實作 API Rate Limiting。

---

## 效能優化

### 1. 圖片優化
使用 Next.js Image 組件自動優化圖片。

### 2. 程式碼分割
使用 Dynamic Import 延遲載入非關鍵組件。

### 3. 快取策略
- Next.js 自動快取靜態頁面
- Supabase 使用 Connection Pooling
- V2 考慮使用 Redis 快取 AI 生成結果

### 4. 資料庫查詢優化
- 使用 Prisma 的 include 和 select 減少查詢
- 建立適當的索引

### 5. AI API 優化
- 使用 GPT-4o-mini 處理簡單任務
- 僅在文章生成時使用 GPT-4o
- 實作 streaming response (V2)

---

## 錯誤處理

### 1. AI API 錯誤
- Rate Limit → 顯示「服務繁忙，請稍後再試」
- Insufficient Quota → 顯示「額度不足」
- 自動重試（最多 3 次，指數退避）

### 2. WordPress API 錯誤
- 認證失敗 → 提示重新檢查帳密
- 網路錯誤 → 自動重試
- 發佈失敗 → 儲存錯誤訊息，提供手動重試

### 3. 資料庫錯誤
- 連線失敗 → 顯示維護訊息
- 查詢錯誤 → 記錄到 Sentry (V2)

### 4. 使用者回饋
- 使用 react-hot-toast 顯示 Toast 訊息
- 關鍵錯誤使用 Modal 對話框
- Loading 狀態使用 Skeleton 或 Spinner

---

## 測試策略 (V2)

### 1. 單元測試
- Jest + React Testing Library
- 測試關鍵邏輯函式

### 2. 整合測試
- 測試 API Routes
- 測試資料庫操作

### 3. E2E 測試
- Playwright
- 測試完整使用者流程

---

## 監控與日誌 (V2)

### 1. 錯誤追蹤
- Sentry

### 2. 效能監控
- Vercel Analytics

### 3. 使用量追蹤
- 記錄 AI API 使用量
- 記錄文章發佈數量

---

## 未來擴展

### Phase 2 功能
- AI 自動分群
- Content Gap 分析
- 排程發佈
- 批量操作
- Google OAuth

### Phase 3 功能
- 心智圖視覺化（ReactFlow）
- 搜尋量 API 整合（DataForSEO）
- 圖片自動配圖（Unsplash API）
- 富文本編輯器（TipTap）
- 多語言介面（next-intl）

### 付費功能
- 免費版：每月 10 篇文章
- Pro 版：每月 100 篇文章
- Enterprise 版：無限制

---

## 參考資源

- [Next.js 文件](https://nextjs.org/docs)
- [Supabase 文件](https://supabase.com/docs)
- [Prisma 文件](https://www.prisma.io/docs)
- [OpenAI API 文件](https://platform.openai.com/docs)
- [WordPress REST API 文件](https://developer.wordpress.org/rest-api/)
- [shadcn/ui 組件](https://ui.shadcn.com/)

---

**文件版本**: 1.0
**最後更新**: 2025-11-17
**作者**: Claude Code Assistant
