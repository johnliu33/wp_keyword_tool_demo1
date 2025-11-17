'use client'

import { useState, useEffect } from 'react'
import { useKeywordStore } from '@/store/useKeywordStore'

interface TitleOption {
  title: string
  slug: string
  metaDescription: string
}

export default function ArticlesPage() {
  const { selectedKeywords, clearSelection } = useKeywordStore()

  const [currentKeyword, setCurrentKeyword] = useState<any>(null)
  const [titleType, setTitleType] = useState<'short' | 'seo' | 'clickbait'>('seo')
  const [titles, setTitles] = useState<TitleOption[]>([])
  const [selectedTitle, setSelectedTitle] = useState<TitleOption | null>(null)
  const [generatingTitles, setGeneratingTitles] = useState(false)
  const [generatingArticle, setGeneratingArticle] = useState(false)

  // 文章參數
  const [articleParams, setArticleParams] = useState({
    tone: 'professional',
    wordCount: 1500,
    style: 'guide',
  })

  const [generatedArticle, setGeneratedArticle] = useState<any>(null)
  const [sites, setSites] = useState<any[]>([])
  const [selectedSite, setSelectedSite] = useState('')

  useEffect(() => {
    fetchSites()
    if (selectedKeywords.length > 0 && !currentKeyword) {
      setCurrentKeyword(selectedKeywords[0])
    }
  }, [selectedKeywords])

  const fetchSites = async () => {
    const res = await fetch('/api/sites')
    const data = await res.json()
    setSites(data)
    if (data.length > 0) {
      setSelectedSite(data[0].id)
    }
  }

  const handleGenerateTitles = async () => {
    if (!currentKeyword) return

    setGeneratingTitles(true)
    try {
      const res = await fetch('/api/titles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: currentKeyword.keyword,
          intent: currentKeyword.intent,
          type: titleType,
        }),
      })
      const data = await res.json()
      setTitles(data)
    } catch (err) {
      alert('生成標題失敗：' + (err instanceof Error ? err.message : '未知錯誤'))
    } finally {
      setGeneratingTitles(false)
    }
  }

  const handleGenerateArticle = async () => {
    if (!selectedTitle || !currentKeyword) return

    setGeneratingArticle(true)
    try {
      const res = await fetch('/api/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedTitle.title,
          keyword: currentKeyword.keyword,
          intent: currentKeyword.intent,
          tone: articleParams.tone,
          wordCount: articleParams.wordCount,
          style: articleParams.style,
          slug: selectedTitle.slug,
          metaDescription: selectedTitle.metaDescription,
          siteId: selectedSite || null,
        }),
      })
      const article = await res.json()
      setGeneratedArticle(article)
      alert('文章生成成功！')
    } catch (err) {
      alert('生成文章失敗：' + (err instanceof Error ? err.message : '未知錯誤'))
    } finally {
      setGeneratingArticle(false)
    }
  }

  if (selectedKeywords.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">標題與文章生成</h2>
        <div className="rounded-lg bg-yellow-50 p-12 text-center">
          <p className="text-gray-700">請先在「關鍵字研究」頁面選擇關鍵字</p>
          <a
            href="/keywords"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            前往關鍵字研究
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">標題與文章生成</h2>
          <p className="mt-1 text-sm text-gray-500">
            已選擇 {selectedKeywords.length} 個關鍵字
          </p>
        </div>
        <button
          onClick={() => clearSelection()}
          className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
        >
          清空選擇
        </button>
      </div>

      {/* 關鍵字選擇 */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">選擇關鍵字</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedKeywords.map((keyword) => (
            <button
              key={keyword.id}
              onClick={() => setCurrentKeyword(keyword)}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                currentKeyword?.id === keyword.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {keyword.keyword}
            </button>
          ))}
        </div>
      </div>

      {currentKeyword && (
        <>
          {/* 標題生成 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900">生成標題</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">標題類型</label>
                <select
                  value={titleType}
                  onChange={(e) =>
                    setTitleType(e.target.value as 'short' | 'seo' | 'clickbait')
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="short">Short - 簡潔有力（30字內）</option>
                  <option value="seo">SEO - 搜尋引擎優化（50-60字）</option>
                  <option value="clickbait">Clickbait - 吸引點擊</option>
                </select>
              </div>
              <button
                onClick={handleGenerateTitles}
                disabled={generatingTitles}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
              >
                {generatingTitles ? '生成中...' : 'AI 生成標題'}
              </button>
            </div>

            {titles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-gray-900">選擇標題：</h4>
                {titles.map((title, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedTitle(title)}
                    className={`cursor-pointer rounded-md border-2 p-4 transition-colors ${
                      selectedTitle?.title === title.title
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h5 className="font-medium text-gray-900">{title.title}</h5>
                    <p className="mt-1 text-sm text-gray-500">Slug: {title.slug}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Meta: {title.metaDescription}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 文章參數設定 */}
          {selectedTitle && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">文章參數設定</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">語氣</label>
                  <select
                    value={articleParams.tone}
                    onChange={(e) =>
                      setArticleParams({ ...articleParams, tone: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="formal">正式</option>
                    <option value="friendly">友好</option>
                    <option value="professional">專業</option>
                    <option value="casual">輕鬆</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">字數</label>
                  <select
                    value={articleParams.wordCount}
                    onChange={(e) =>
                      setArticleParams({ ...articleParams, wordCount: Number(e.target.value) })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="800">800 字</option>
                    <option value="1500">1500 字</option>
                    <option value="3000">3000 字</option>
                    <option value="5000">5000 字</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">風格</label>
                  <select
                    value={articleParams.style}
                    onChange={(e) =>
                      setArticleParams({ ...articleParams, style: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="listicle">列表文</option>
                    <option value="howto">教學文</option>
                    <option value="comparison">比較文</option>
                    <option value="review">評測文</option>
                    <option value="guide">指南文</option>
                  </select>
                </div>
              </div>

              {sites.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    目標 WordPress 網站（可選）
                  </label>
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">不選擇</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} ({site.url})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleGenerateArticle}
                disabled={generatingArticle}
                className="mt-6 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
              >
                {generatingArticle ? '生成中（約需 30-60 秒）...' : 'AI 生成完整文章'}
              </button>
            </div>
          )}

          {/* 文章預覽 */}
          {generatedArticle && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">文章預覽</h3>
              <div className="mt-4">
                <div className="mb-4 border-b pb-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {generatedArticle.title}
                  </h1>
                  <p className="mt-2 text-sm text-gray-500">
                    Slug: {generatedArticle.slug}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Meta: {generatedArticle.metaDescription}
                  </p>
                </div>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">
                    {generatedArticle.content}
                  </pre>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <a
                  href="/publish"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                  前往發佈 →
                </a>
                <button
                  onClick={() => {
                    setGeneratedArticle(null)
                    setSelectedTitle(null)
                    setTitles([])
                  }}
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  重新開始
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
