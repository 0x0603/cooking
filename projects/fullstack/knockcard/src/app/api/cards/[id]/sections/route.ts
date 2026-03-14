import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createSectionSchema = z.object({
  type: z.string().min(1).max(50),
  title: z.string().max(200).optional(),
  content: z.record(z.unknown()),
})

const reorderSectionsSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int().min(0),
    })
  ),
})

interface RouteParams {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const card = await prisma.card.findUnique({
    where: { id: params.id },
  })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  if (card.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const result = createSectionSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    )
  }

  const maxSortOrder = await prisma.cardSection.aggregate({
    where: { cardId: params.id },
    _max: { sortOrder: true },
  })

  const nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1

  const section = await prisma.cardSection.create({
    data: {
      cardId: params.id,
      type: result.data.type,
      title: result.data.title ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content: result.data.content as any,
      sortOrder: nextSortOrder,
    },
  })

  return NextResponse.json(section, { status: 201 })
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const card = await prisma.card.findUnique({
    where: { id: params.id },
  })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  if (card.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const result = reorderSectionsSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    )
  }

  await prisma.$transaction(
    result.data.sections.map(section =>
      prisma.cardSection.update({
        where: { id: section.id },
        data: { sortOrder: section.sortOrder },
      })
    )
  )

  const sections = await prisma.cardSection.findMany({
    where: { cardId: params.id },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(sections)
}
