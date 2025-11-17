'use client'

import { useState, useEffect } from 'react'
import { useKeywordStore } from '@/store/useKeywordStore'
import { useRouter } from 'next/navigation'

interface Project {
  id: string
  name: string
  coreKeywords: string[]
  createdAt: string
  keywords?: Keyword[]
}

interface Keyword {
  id: string
  keyword: string
  intent: string
  relevanceScore: number
  suggestedVolume?: string
}

export default function KeywordsPage() {
  const router = useRouter()
  const { selectedKeywords, toggleKeyword, setProject } = useKeywordStore()

  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    coreKeywords: '',
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data)
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const keywordsArray = formData.coreKeywords.split(',').map((k) => k.trim())

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        coreKeywords: keywordsArray,
      }),
    })

    const project = await res.json()
    setCurrentProject(project)
    setProject(project)
    await fetchProjects()
    setShowForm(false)
    setFormData({ name: '', coreKeywords: '' })
    setLoading(false)
  }

  const handleGenerate = async () => {
    if (!currentProject) return

    setGenerating(true)
    try {
      const res = await fetch(`/api/projects/${currentProject.id}/generate`, {
        method: 'POST',
      })
      const data = await res.json()
      setKeywords(data.keywords)
      alert(`成功生成 ${data.count} 個長尾關鍵字！`)
    } catch (err) {
      alert('生成失敗：' + (err instanceof Error ? err.message : '未知錯誤'))
    } finally {
      setGenerating(false)
    }
  }

  const handleSelectProject = async (project: Project) => {
    setCurrentProject(project)
    setProject(project)

    // 取得該專案的關鍵字
    const res = await fetch(`/api/keywords/${project.id}`)
    const data = await res.json()
    setKeywords(data)
  }

  const getIntentBadgeColor = (intent: string) => {
    switch (intent) {
      case 'informational':
        return 'bg-blue-100 text-blue-800'
      case 'transactional':
        return 'bg-green-100 text-green-800'
      case 'navigational':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getIntentLabel = (intent: string) => {
    switch (intent) {
      case 'informational':
        return '資訊型'
      case 'transactional':
        return '交易型'
      case 'navigational':
        return '導航型'
      default:
        return intent
    }
  }

  const isKeywordSelected = (keywordId: string) => {
    return selectedKeywords.some((k) => k.id === keywordId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">關鍵字研究</h2>
          <p className="mt-1 text-sm text-gray-500">
            輸入核心關鍵字，AI 將幫您生成長尾關鍵字並分析搜尋意圖
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          建立新專案
        </button>
      </div>

      {/* 已選關鍵字數量 */}
      {selectedKeywords.length > 0 && (
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              已選擇 <span className="font-semibold">{selectedKeywords.length}</span> 個關鍵字
            </p>
            <button
              onClick={() => router.push('/articles')}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              前往生成文章 →
            </button>
          </div>
        </div>
      )}

      {/* 建立專案表單 */}
      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">建立新專案</h3>
          <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">專案名稱</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="例如：2025 SEO 策略"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                核心關鍵字（用逗號分隔）
              </label>
              <input
                type="text"
                required
                value={formData.coreKeywords}
                onChange={(e) => setFormData({ ...formData, coreKeywords: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="例如：SEO工具, 關鍵字研究, 內容行銷"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? '建立中...' : '建立專案'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 專案列表 */}
      {projects.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">專案列表</h3>
          <div className="mt-4 space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSelectProject(project)}
                className={`w-full rounded-md border-2 p-4 text-left transition-colors ${
                  currentProject?.id === project.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-medium text-gray-900">{project.name}</h4>
                <p className="text-sm text-gray-500">
                  核心關鍵字：{project.coreKeywords.join(', ')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 當前專案操作 */}
      {currentProject && (
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{currentProject.name}</h3>
              <p className="text-sm text-gray-500">
                核心關鍵字：{currentProject.coreKeywords.join(', ')}
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || keywords.length > 0}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
            >
              {generating ? '生成中...' : keywords.length > 0 ? '已生成' : 'AI 生成長尾字'}
            </button>
          </div>
        </div>
      )}

      {/* 關鍵字表格 */}
      {keywords.length > 0 && (
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">長尾關鍵字列表</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      選擇
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      關鍵字
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      搜尋意圖
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      相關性
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      預估搜尋量
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {keywords.map((keyword) => (
                    <tr key={keyword.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isKeywordSelected(keyword.id)}
                          onChange={() => toggleKeyword(keyword)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {keyword.keyword}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getIntentBadgeColor(
                            keyword.intent
                          )}`}
                        >
                          {getIntentLabel(keyword.intent)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {(keyword.relevanceScore * 100).toFixed(0)}%
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {keyword.suggestedVolume || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {keywords.length === 0 && !currentProject && projects.length === 0 && (
        <div className="rounded-lg bg-gray-50 p-12 text-center">
          <p className="text-gray-500">請先建立一個專案以開始關鍵字研究</p>
        </div>
      )}
    </div>
  )
}
