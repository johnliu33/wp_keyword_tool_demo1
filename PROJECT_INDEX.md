# 📂 專案文件索引

這份文件列出了所有已生成的專案文件，方便快速查找。

---

## 📖 核心文件

### 1. **CLAUDE.md**
**用途：** 完整的開發規格文件
**內容：**
- 專案概述與目標
- 技術架構詳解
- 資料庫設計
- 認證系統架構
- 核心功能模組（Tab 1, 2, 3）
- API 路由規劃
- AI Prompt 設計
- 開發優先順序與時程
- 部署指南

**適合：** 開發人員、技術主管

---

### 2. **README.md**
**用途：** 專案說明與快速開始指南
**內容：**
- 專案簡介與功能列表
- 技術堆疊
- 安裝與設定步驟
- 開發指令
- 使用說明
- 部署指南

**適合：** 所有使用者、新加入的開發人員

---

### 3. **SETUP_GUIDE.md**
**用途：** 詳細的初始化設定指南
**內容：**
- 前置需求確認
- Supabase 專案設定（步驟說明）
- OpenAI API Key 取得
- 環境變數設定
- 資料庫初始化
- 常見問題排解

**適合：** 首次設定專案的開發人員

---

### 4. **AUTH_IMPLEMENTATION.md**
**用途：** 認證系統完整實作指南
**內容：**
- Supabase Auth 整合程式碼
- 登入/註冊頁面範例
- Middleware 設定
- 受保護路由實作
- OAuth 整合（Google）
- 安全性提醒

**適合：** 負責實作認證功能的開發人員

---

## 🗄️ 資料庫相關

### 5. **prisma/schema.prisma**
**用途：** Prisma ORM Schema 定義
**內容：**
- 所有資料表定義
- 欄位類型與關聯
- 索引設定
- 預設值

**相關指令：**
```bash
pnpm prisma generate          # 產生 Prisma Client
pnpm prisma migrate dev       # 建立並執行 migration
pnpm prisma studio            # 開啟資料庫管理介面
```

---

### 6. **supabase/rls-policies.sql**
**用途：** Row Level Security (RLS) 設定
**內容：**
- 啟用 RLS
- 24 個 Policy（SELECT, INSERT, UPDATE, DELETE）
- 11 個資料庫索引
- 驗證查詢

**執行方式：**
1. 前往 Supabase Dashboard → SQL Editor
2. 複製檔案內容
3. 執行

---

## ⚙️ 設定檔

### 7. **.env.example**
**用途：** 環境變數範例
**內容：**
- Supabase 連線設定
- 資料庫連線字串
- OpenAI API Key
- 加密金鑰
- 其他設定（Cron, OAuth 等）

**使用方式：**
```bash
cp .env.example .env.local
# 然後編輯 .env.local 填入實際值
```

---

### 8. **package.json**
**用途：** 專案依賴與腳本設定
**內容：**
- 所有 npm 套件
- 開發指令
- 版本資訊

**主要依賴：**
- Next.js 14.2.15
- React 18
- Prisma 5.22.0
- Supabase SSR
- OpenAI SDK
- Zustand (狀態管理)
- TanStack Table (表格)

---

### 9. **.gitignore**
**用途：** Git 忽略檔案設定
**內容：**
- node_modules
- .next
- .env*.local
- IDE 設定檔
- 其他暫存檔

---

## 🚀 初始化腳本

### 10. **setup.sh**
**用途：** 自動化專案初始化
**功能：**
- 檢查前置需求
- 安裝依賴
- 建立 .env.local
- 產生加密金鑰
- 執行 Prisma migrations
- 提醒設定 RLS

**執行方式：**
```bash
chmod +x setup.sh
./setup.sh
```

---

## 📁 專案結構

```
wp-keyword-ai-tool/
├── 📖 核心文件
│   ├── CLAUDE.md                    # 完整開發規格
│   ├── README.md                    # 專案說明
│   ├── SETUP_GUIDE.md               # 初始化指南
│   └── PROJECT_INDEX.md             # 本檔案
│
├── 📚 文件目錄
│   └── docs/
│       └── AUTH_IMPLEMENTATION.md   # 認證系統實作指南
│
├── 🗄️ 資料庫
│   ├── prisma/
│   │   └── schema.prisma            # Prisma Schema
│   └── supabase/
│       └── rls-policies.sql         # RLS 設定
│
├── ⚙️ 設定檔
│   ├── .env.example                 # 環境變數範例
│   ├── .gitignore                   # Git 忽略檔案
│   ├── package.json                 # 專案依賴
│   └── setup.sh                     # 初始化腳本
│
└── 🚧 待建立的目錄（執行 setup.sh 後）
    ├── app/                         # Next.js 應用程式
    ├── components/                  # React 組件
    ├── lib/                         # 工具函式庫
    ├── store/                       # Zustand stores
    └── types/                       # TypeScript 類型
```

---

## 🎯 快速導航

### 我想要...

#### ✅ 了解整個專案
→ 閱讀 [README.md](./README.md)

#### ✅ 開始開發
→ 閱讀 [SETUP_GUIDE.md](./SETUP_GUIDE.md) 並執行 `setup.sh`

#### ✅ 查看技術規格
→ 閱讀 [CLAUDE.md](./CLAUDE.md)

#### ✅ 實作認證功能
→ 閱讀 [docs/AUTH_IMPLEMENTATION.md](./docs/AUTH_IMPLEMENTATION.md)

#### ✅ 修改資料庫結構
→ 編輯 [prisma/schema.prisma](./prisma/schema.prisma) 並執行 `pnpm prisma migrate dev`

#### ✅ 設定 Row Level Security
→ 執行 [supabase/rls-policies.sql](./supabase/rls-policies.sql)

#### ✅ 查看環境變數範例
→ 查看 [.env.example](./.env.example)

---

## 📋 開發檢查清單

### 初次設定
- [ ] 已閱讀 README.md
- [ ] 已執行 setup.sh
- [ ] 已設定 .env.local
- [ ] 已建立 Supabase 專案
- [ ] 已取得 OpenAI API Key
- [ ] 已執行 Prisma migrations
- [ ] 已套用 RLS Policies
- [ ] 已測試開發伺服器

### 認證系統
- [ ] 已閱讀 AUTH_IMPLEMENTATION.md
- [ ] 已實作登入頁面
- [ ] 已實作註冊頁面
- [ ] 已設定 Middleware
- [ ] 已測試登入流程
- [ ] 已測試註冊流程
- [ ] 已測試路由保護

### 核心功能（待實作）
- [ ] Tab 1: 關鍵字研究
- [ ] Tab 2: 標題與文章生成
- [ ] Tab 3: 發佈管理
- [ ] WordPress 整合
- [ ] AI 整合

---

## 🔄 版本歷史

### v1.0 (2025-11-17)
- ✅ 初始專案文件
- ✅ Prisma Schema
- ✅ Supabase RLS 設定
- ✅ 認證系統實作指南
- ✅ 初始化腳本

---

## 🆘 需要協助？

如果找不到需要的資訊：

1. 檢查相關文件（上方導航）
2. 查看 SETUP_GUIDE.md 的常見問題
3. 開 Issue 尋求協助

---

**祝開發順利！** 🚀
