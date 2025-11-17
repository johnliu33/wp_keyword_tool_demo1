'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

interface Article {
  id: string
  title: string
  slug: string
  metaDescription: string | null
  status: string
  publishedAt: string | null
  wpPostUrl: string | null
  error: string | null
  retryCount: number
  site: any
  createdAt: string
}

export default function PublishPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
    fetchSites()
  }, [])

  const fetchArticles = async () => {
    const res = await fetch('/api/articles')
    const data = await res.json()
    setArticles(data)
    setLoading(false)
  }

  const fetchSites = async () => {
    const res = await fetch('/api/sites')
    const data = await res.json()
    setSites(data)
  }

  const handlePublish = async (articleId: string) => {
    const article = articles.find((a) => a.id === articleId)
    if (!article?.site) {
      alert('請先為文章選擇目標 WordPress 網站')
      return
    }

    if (!confirm('確定要發佈此文章到 WordPress 嗎？')) {
      return
    }

    setPublishing(articleId)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      alert('發佈成功！')
      await fetchArticles()
    } catch (err) {
      alert('發佈失敗：' + (err instanceof Error ? err.message : '未知錯誤'))
      await fetchArticles()
    } finally {
      setPublishing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return '草稿'
      case 'published':
        return '已發佈'
      case 'failed':
        return '發佈失敗'
      case 'scheduled':
        return '已排程'
      default:
        return status
    }
  }

  if (loading) {
    return <div>載入中...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">發佈管理</h2>
        <p className="mt-1 text-sm text-gray-500">
          管理您的文章並發佈到 WordPress
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-12 text-center">
          <p className="text-gray-500">尚無文章</p>
          <p className="mt-2 text-sm text-gray-400">
            請先在「文章生成」頁面產生文章
          </p>
          <a
            href="/articles"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            前往文章生成
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {article.title}
                    </h3>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(
                        article.status
                      )}`}
                    >
                      {getStatusLabel(article.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Slug: {article.slug}</p>
                  {article.metaDescription && (
                    <p className="mt-1 text-sm text-gray-500">
                      Meta: {article.metaDescription}
                    </p>
                  )}
                  {article.site && (
                    <p className="mt-2 text-sm text-gray-600">
                      目標網站：{article.site.name} ({article.site.url})
                    </p>
                  )}
                  {article.wpPostUrl && (
                    <p className="mt-2 text-sm text-green-600">
                      WordPress URL:{' '}
                      <a
                        href={article.wpPostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-green-500"
                      >
                        {article.wpPostUrl}
                      </a>
                    </p>
                  )}
                  {article.error && (
                    <p className="mt-2 text-sm text-red-600">
                      錯誤：{article.error}
                      {article.retryCount > 0 && ` (重試次數：${article.retryCount})`}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    建立時間：{formatDate(article.createdAt)}
                    {article.publishedAt && (
                      <> | 發佈時間：{formatDate(article.publishedAt)}</>
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {article.status === 'draft' || article.status === 'failed' ? (
                    <button
                      onClick={() => handlePublish(article.id)}
                      disabled={publishing === article.id || !article.site}
                      className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
                    >
                      {publishing === article.id
                        ? '發佈中...'
                        : article.status === 'failed'
                          ? '重試發佈'
                          : '立即發佈'}
                    </button>
                  ) : null}
                  {article.status === 'published' && article.wpPostUrl && (
                    <a
                      href={article.wpPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-500"
                    >
                      查看文章
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sites.length === 0 && articles.length > 0 && (
        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ 您尚未綁定 WordPress 網站，無法發佈文章
          </p>
          <a
            href="/sites"
            className="mt-2 inline-block text-sm font-medium text-yellow-900 underline hover:text-yellow-700"
          >
            前往綁定 WordPress 網站 →
          </a>
        </div>
      )}
    </div>
  )
}
