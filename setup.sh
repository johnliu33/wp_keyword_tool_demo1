#!/bin/bash

# ============================================
# WP Keyword AI Tool - 專案初始化腳本
# ============================================
# 此腳本用於快速設定開發環境
# 執行方式：chmod +x setup.sh && ./setup.sh
# ============================================

set -e  # 遇到錯誤立即停止

echo "🚀 開始初始化 WP Keyword AI Tool 專案..."
echo ""

# ============================================
# 1. 檢查前置需求
# ============================================

echo "📋 檢查前置需求..."

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：未安裝 Node.js"
    echo "請前往 https://nodejs.org 安裝 Node.js 20+ 版本"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ 錯誤：Node.js 版本過舊（目前：$(node -v)）"
    echo "請更新到 Node.js 20+ 版本"
    exit 1
fi

echo "✅ Node.js $(node -v)"

# 檢查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  警告：未安裝 pnpm，將使用 npm"
    PACKAGE_MANAGER="npm"
else
    echo "✅ pnpm $(pnpm -v)"
    PACKAGE_MANAGER="pnpm"
fi

echo ""

# ============================================
# 2. 安裝依賴
# ============================================

echo "📦 安裝專案依賴..."

if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm install
else
    npm install
fi

echo "✅ 依賴安裝完成"
echo ""

# ============================================
# 3. 設定環境變數
# ============================================

echo "⚙️  設定環境變數..."

if [ -f ".env.local" ]; then
    echo "⚠️  .env.local 已存在，跳過複製"
else
    cp .env.example .env.local
    echo "✅ 已建立 .env.local"
    echo ""
    echo "⚠️  重要：請編輯 .env.local 並填入以下資訊："
    echo "   1. Supabase URL 和 API Keys"
    echo "   2. 資料庫連線字串"
    echo "   3. OpenAI API Key"
    echo "   4. 加密金鑰（32 字元）"
    echo ""
    read -p "按 Enter 鍵繼續..."
fi

echo ""

# ============================================
# 4. 產生加密金鑰（如果尚未設定）
# ============================================

if ! grep -q "ENCRYPTION_KEY=your-32-character" .env.local 2>/dev/null; then
    echo "🔑 加密金鑰已設定"
else
    echo "🔑 產生加密金鑰..."

    if command -v openssl &> /dev/null; then
        ENCRYPTION_KEY=$(openssl rand -hex 16)
        # 在 macOS 和 Linux 上使用不同的 sed 語法
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env.local
        else
            sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env.local
        fi
        echo "✅ 加密金鑰已自動產生並儲存"
    else
        echo "⚠️  警告：未安裝 openssl，請手動產生 32 字元的隨機字串"
        echo "   可使用線上工具：https://randomkeygen.com/"
    fi
fi

echo ""

# ============================================
# 5. 檢查 Supabase 設定
# ============================================

echo "🔍 檢查 Supabase 設定..."

if grep -q "your-project-ref" .env.local; then
    echo "⚠️  警告：尚未設定 Supabase 連線資訊"
    echo ""
    echo "請完成以下步驟："
    echo "1. 前往 https://supabase.com 建立專案"
    echo "2. 取得 Project URL 和 API Keys"
    echo "3. 取得資料庫連線字串（Connection Pooling & Direct）"
    echo "4. 編輯 .env.local 並填入相關資訊"
    echo ""
    read -p "完成後按 Enter 繼續，或按 Ctrl+C 取消..."
else
    echo "✅ Supabase 設定看起來正常"
fi

echo ""

# ============================================
# 6. 執行 Prisma 設定
# ============================================

echo "🗄️  設定 Prisma..."

# 產生 Prisma Client
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm prisma generate
else
    npm run prisma generate
fi

echo "✅ Prisma Client 已產生"
echo ""

# 詢問是否執行 migrations
read -p "是否要執行資料庫 migrations？(y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⏳ 執行 Prisma migrations..."

    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm prisma migrate dev --name init
    else
        npm run prisma migrate dev -- --name init
    fi

    echo "✅ Migrations 執行完成"
else
    echo "⏭️  跳過 migrations（稍後可執行：pnpm prisma migrate dev）"
fi

echo ""

# ============================================
# 7. 提醒設定 Row Level Security
# ============================================

echo "🔒 Row Level Security (RLS) 設定"
echo ""
echo "請手動執行以下步驟："
echo "1. 前往 Supabase Dashboard > SQL Editor"
echo "2. 開啟檔案：supabase/rls-policies.sql"
echo "3. 複製內容並在 SQL Editor 中執行"
echo ""
read -p "完成後按 Enter 繼續..."

echo ""

# ============================================
# 8. 完成訊息
# ============================================

echo "🎉 專案初始化完成！"
echo ""
echo "📚 下一步："
echo ""
echo "1. 確認 .env.local 中的所有設定都正確"
echo "2. 確認已在 Supabase 執行 RLS Policies"
echo "3. 執行開發伺服器："
echo ""

if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    echo "   pnpm dev"
else
    echo "   npm run dev"
fi

echo ""
echo "4. 開啟瀏覽器訪問 http://localhost:3000"
echo ""
echo "📖 詳細文件："
echo "   - README.md - 使用說明"
echo "   - CLAUDE.md - 完整開發規格"
echo ""
echo "🔧 常用指令："

if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    echo "   pnpm dev              # 啟動開發伺服器"
    echo "   pnpm build            # 建立 production build"
    echo "   pnpm prisma studio    # 開啟資料庫管理介面"
    echo "   pnpm lint             # 執行程式碼檢查"
else
    echo "   npm run dev           # 啟動開發伺服器"
    echo "   npm run build         # 建立 production build"
    echo "   npm run prisma studio # 開啟資料庫管理介面"
    echo "   npm run lint          # 執行程式碼檢查"
fi

echo ""
echo "✨ 祝開發順利！"
