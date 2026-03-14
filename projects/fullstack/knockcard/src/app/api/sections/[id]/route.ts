import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateSectionSchema = z.object({
  content: z.record(z.unknown()).optional(),
  title: z.string().max(200).nullable().optional(),
  isVisible: z.boolean().optional(),
})

interface RouteParams {
  params: { id: string }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const section = await prisma.cardSection.findUnique({
    where: { id: params.id },
    include: { card: { select: { userId: true } } },
  })

  if (!section) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 })
  }

  if (section.card.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const result = updateSectionSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    )
  }

  const updatedSection = await prisma.cardSection.update({
    where: { id: params.id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: result.data as any,
  })

  return NextResponse.json(updatedSection)
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const section = await prisma.cardSection.findUnique({
    where: { id: params.id },
    include: { card: { select: { userId: true } } },
  })

  if (!section) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 })
  }

  if (section.card.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.cardSection.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
