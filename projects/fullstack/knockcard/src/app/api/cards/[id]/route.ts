import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateCardSchema = z.object({
  displayName: z.string().min(1).max(200).optional(),
  title: z.string().max(200).optional(),
  company: z.string().max(200).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  coverPhotoUrl: z.string().url().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  theme: z.string().max(50).optional(),
  themeConfig: z.record(z.unknown()).nullable().optional(),
  isPublished: z.boolean().optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
})

interface RouteParams {
  params: { id: string }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const card = await prisma.card.findUnique({
    where: { id: params.id },
    include: {
      cardSections: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  if (card.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(card)
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
  const result = updateCardSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    )
  }

  if (result.data.slug && result.data.slug !== card.slug) {
    const existingCard = await prisma.card.findUnique({
      where: { slug: result.data.slug },
    })

    if (existingCard) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
    }
  }

  const updatedCard = await prisma.card.update({
    where: { id: params.id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: result.data as any,
    include: {
      cardSections: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  revalidateTag('card-by-slug')

  return NextResponse.json(updatedCard)
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

  await prisma.card.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
