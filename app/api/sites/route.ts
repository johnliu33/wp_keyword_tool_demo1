import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'
import { testWordPressConnection } from '@/lib/wordpress'
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

  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(sites)
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
  const { name, url, username, password } = body

  // 測試連線
  try {
    await testWordPressConnection({ url, username, password })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'WordPress 連線失敗' },
      { status: 400 }
    )
  }

  // 加密密碼並儲存
  const passwordEnc = encrypt(password)

  const site = await prisma.site.create({
    data: {
      name,
      url,
      username,
      passwordEnc,
      userId: user.id,
    },
  })

  return NextResponse.json(site)
}
