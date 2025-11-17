import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { publishToWordPress } from '@/lib/wordpress'
import { decrypt } from '@/lib/encryption'
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
  const { articleId } = body

  if (!articleId) {
    return NextResponse.json({ error: 'Missing articleId' }, { status: 400 })
  }

  // 取得文章
  const article = await prisma.article.findUnique({
    where: { id: articleId, userId: user.id },
    include: { site: true },
  })

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  if (!article.site) {
    return NextResponse.json({ error: 'No WordPress site selected' }, { status: 400 })
  }

  try {
    // 解密 WordPress 密碼
    const password = decrypt(article.site.passwordEnc)

    // 發佈到 WordPress
    const wpPost = await publishToWordPress(
      {
        url: article.site.url,
        username: article.site.username,
        password,
      },
      {
        title: article.title,
        content: article.content,
        slug: article.slug,
        status: 'publish',
        meta: {
          description: article.metaDescription || undefined,
        },
      }
    )

    // 更新文章狀態
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        wpPostId: wpPost.id,
        wpPostUrl: wpPost.link,
      },
    })

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      wpPost,
    })
  } catch (err) {
    console.error('Error publishing article:', err)

    // 更新文章狀態為失敗
    await prisma.article.update({
      where: { id: articleId },
      data: {
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
        retryCount: { increment: 1 },
      },
    })

    return NextResponse.json(
      { error: err instanceof Error ? err.message : '發佈失敗' },
      { status: 500 }
    )
  }
}
