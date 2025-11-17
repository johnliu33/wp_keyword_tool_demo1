import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const articles = await prisma.article.findMany({
    where: { userId: user.id },
    include: {
      site: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(articles)
}

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
  const {
    title,
    content,
    slug,
    metaDescription,
    titleType,
    tone,
    style,
    wordCount,
    siteId,
  } = body

  const article = await prisma.article.create({
    data: {
      title,
      content,
      slug,
      metaDescription,
      titleType,
      tone,
      style,
      wordCount,
      userId: user.id,
      siteId,
    },
  })

  return NextResponse.json(article)
}
