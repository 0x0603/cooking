import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

const trackEventSchema = z.object({
  cardId: z.string().uuid(),
  eventType: z.string().min(1).max(50),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = trackEventSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    )
  }

  const { cardId, eventType } = result.data

  const card = await prisma.card.findUnique({ where: { id: cardId } })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  const visitorIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const userAgent = request.headers.get('user-agent') ?? null

  const event = await prisma.analyticsEvent.create({
    data: {
      cardId,
      eventType,
      visitorIp,
      userAgent,
    },
  })

  return NextResponse.json(event, { status: 201 })
}
