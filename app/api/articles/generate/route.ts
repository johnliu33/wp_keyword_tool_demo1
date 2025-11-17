import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateArticle } from '@/lib/openai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, keyword, intent, tone, wordCount, style, slug, metaDescription, siteId } =
    body

  if (!title || !keyword || !intent) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // 生成文章內容
    const content = await generateArticle({
      title,
      keyword,
      intent,
      tone: tone || 'professional',
      wordCount: wordCount || 1500,
      style: style || 'guide',
    })

    // 儲存到資料庫
    const article = await prisma.article.create({
      data: {
        title,
        content,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
        metaDescription: metaDescription || '',
        tone: tone || 'professional',
        style: style || 'guide',
        wordCount: wordCount || 1500,
        userId: user.id,
        siteId: siteId || null,
      },
    })

    return NextResponse.json(article)
  } catch (err) {
    console.error('Error generating article:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI 生成失敗' },
      { status: 500 }
    )
  }
}
