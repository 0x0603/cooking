import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createCardSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must be alphanumeric with hyphens only',
    }),
  displayName: z.string().min(1).max(200),
})

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cards = await prisma.card.findMany({
    where: { userId: session.user.id },
    include: {
      cardSections: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(cards)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const result = createCardSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    )
  }

  const { slug, displayName } = result.data

  const existingCard = await prisma.card.findUnique({ where: { slug } })

  if (existingCard) {
    return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
  }

  const card = await prisma.card.create({
    data: {
      userId: session.user.id,
      slug,
      displayName,
      title: '',
      cardSections: {
        createMany: {
          data: [
            { type: 'about', title: 'About', content: {}, sortOrder: 0 },
            { type: 'contact', title: 'Information', content: {}, sortOrder: 1 },
            { type: 'social', title: 'Social', content: {}, sortOrder: 2 },
          ],
        },
      },
    },
    include: {
      cardSections: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  return NextResponse.json(card, { status: 201 })
}
