import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface LongtailKeyword {
  keyword: string
  intent: 'informational' | 'transactional' | 'navigational'
  relevanceScore: number
  suggestedVolume?: string
}

export interface TitleSuggestion {
  title: string
  slug: string
  metaDescription: string
}

export async function generateLongtails(
  coreKeyword: string,
  count: number = 20
): Promise<LongtailKeyword[]> {
  const prompt = `你是專業的 SEO 關鍵字研究專家。

請針對核心關鍵字「${coreKeyword}」生成 ${count} 個繁體中文長尾關鍵字。

要求：
1. 包含各種搜尋意圖（資訊型 informational、交易型 transactional、導航型 navigational）
2. 符合台灣使用者的搜尋習慣
3. 不同長度（3-8 字）
4. 具有搜尋潛力

請以 JSON 陣列格式輸出，每個項目包含：
- keyword: 長尾關鍵字
- intent: "informational" | "transactional" | "navigational"
- relevanceScore: 0.0-1.0 (與核心字的相關性)
- suggestedVolume: "1K-10K" (預估搜尋量範圍)

只輸出 JSON 陣列，不要其他說明文字。`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('AI 未返回內容')

  const parsed = JSON.parse(content)
  return parsed.keywords || parsed
}

export async function generateTitles(
  keyword: string,
  intent: string,
  type: 'short' | 'seo' | 'clickbait'
): Promise<TitleSuggestion[]> {
  const typeRequirements = {
    short: '簡潔有力，30 字元內',
    seo: '包含關鍵字，50-60 字元，吸引搜尋引擎',
    clickbait: '吸引點擊，可包含數字、問句、驚嘆詞',
  }

  const prompt = `你是專業的 SEO 文案撰寫專家。

關鍵字：${keyword}
搜尋意圖：${intent}

請生成 3 個「${type}」類型的標題。

要求：${typeRequirements[type]}

請以 JSON 陣列格式輸出，每個項目包含：
- title: 標題文字
- slug: URL friendly slug (小寫英文，用 - 連接)
- metaDescription: 150-160 字元的描述

只輸出 JSON 陣列，不要其他說明文字。`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('AI 未返回內容')

  const parsed = JSON.parse(content)
  return parsed.titles || parsed
}

export async function generateArticle(params: {
  title: string
  keyword: string
  intent: string
  tone: string
  wordCount: number
  style: string
}): Promise<string> {
  const intentRequirements = {
    transactional: '包含產品比較、優缺點分析、購買建議、行動呼籲',
    informational: '提供詳細教學、步驟說明、範例、常見問題',
    navigational: '介紹品牌、產品特色、服務內容',
  }

  const prompt = `你是專業的 SEO 內容撰寫專家。

請撰寫一篇完整的 SEO 文章：

文章資訊：
- 標題：${params.title}
- 關鍵字：${params.keyword}
- 搜尋意圖：${params.intent}
- 語氣：${params.tone}
- 風格：${params.style}
- 目標字數：${params.wordCount} 字

要求：
1. 使用繁體中文（台灣）
2. 包含引言、主要內容、結論
3. 適當使用 H2、H3 標題進行分段
4. 自然融入關鍵字（不要過度堆疊）
5. ${intentRequirements[params.intent as keyof typeof intentRequirements]}
6. 使用 Markdown 格式

輸出完整的 Markdown 文章內容。`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  })

  return completion.choices[0].message.content || ''
}
