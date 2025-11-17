import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = params

  // 驗證專案屬於當前使用者
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId: user.id },
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const keywords = await prisma.keyword.findMany({
    where: { projectId },
    include: {
      longtails: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(keywords)
}
