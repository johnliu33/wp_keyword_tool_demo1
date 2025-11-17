import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateLongtails } from '@/lib/openai'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  // 取得專案
  const project = await prisma.project.findUnique({
    where: { id, userId: user.id },
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  try {
    // 為每個核心關鍵字生成長尾字
    const allKeywords = []

    for (const coreKeyword of project.coreKeywords) {
      const longtails = await generateLongtails(coreKeyword, 20)

      // 儲存到資料庫
      for (const longtail of longtails) {
        const keyword = await prisma.keyword.create({
          data: {
            keyword: longtail.keyword,
            intent: longtail.intent,
            relevanceScore: longtail.relevanceScore,
            suggestedVolume: longtail.suggestedVolume,
            projectId: id,
          },
        })

        allKeywords.push(keyword)
      }
    }

    return NextResponse.json({
      success: true,
      count: allKeywords.length,
      keywords: allKeywords,
    })
  } catch (err) {
    console.error('Error generating longtails:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI 生成失敗' },
      { status: 500 }
    )
  }
}
