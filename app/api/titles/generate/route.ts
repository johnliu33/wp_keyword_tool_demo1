import { createClient } from '@/lib/supabase/server'
import { generateTitles } from '@/lib/openai'
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
  const { keyword, intent, type } = body

  if (!keyword || !intent || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const titles = await generateTitles(keyword, intent, type)
    return NextResponse.json(titles)
  } catch (err) {
    console.error('Error generating titles:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI 生成失敗' },
      { status: 500 }
    )
  }
}
