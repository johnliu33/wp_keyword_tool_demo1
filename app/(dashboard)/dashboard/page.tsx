import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">歡迎回來！</h2>
        <p className="mt-1 text-sm text-gray-500">
          開始您的 SEO 內容生產流程
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">WordPress 網站</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">0</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">關鍵字專案</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">0</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">已發佈文章</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">0</dd>
        </div>
      </div>

      {/* Getting Started */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">開始使用</h3>
          <div className="mt-5 space-y-4">
            <div className="flex items-start">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <span className="text-lg font-semibold text-blue-600">1</span>
              </div>
              <div className="ml-4">
                <h4 className="text-base font-medium text-gray-900">綁定 WordPress 網站</h4>
                <p className="mt-1 text-sm text-gray-500">
                  首先需要連接您的 WordPress 網站，以便後續發佈文章。
                </p>
                <Link
                  href="/sites"
                  className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  前往設定 →
                </Link>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <span className="text-lg font-semibold text-blue-600">2</span>
              </div>
              <div className="ml-4">
                <h4 className="text-base font-medium text-gray-900">進行關鍵字研究</h4>
                <p className="mt-1 text-sm text-gray-500">
                  輸入核心關鍵字，讓 AI 幫您生成長尾關鍵字並分析搜尋意圖。
                </p>
                <Link
                  href="/keywords"
                  className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  開始研究 →
                </Link>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <span className="text-lg font-semibold text-blue-600">3</span>
              </div>
              <div className="ml-4">
                <h4 className="text-base font-medium text-gray-900">生成 SEO 文章</h4>
                <p className="mt-1 text-sm text-gray-500">
                  選擇關鍵字，生成標題，然後讓 AI 撰寫完整的 SEO 文章。
                </p>
                <Link
                  href="/articles"
                  className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  生成文章 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">帳號資訊</h3>
          <dl className="mt-4 space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">註冊時間</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleString('zh-TW')
                  : '-'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
