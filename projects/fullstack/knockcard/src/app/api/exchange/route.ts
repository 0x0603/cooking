import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

const exchangeContactSchema = z.object({
  cardId: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200).optional(),
  phone: z.string().max(50).optional(),
  note: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = exchangeContactSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    )
  }

  const { cardId, name, email, phone, note } = result.data

  const card = await prisma.card.findUnique({ where: { id: cardId } })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  const contact = await prisma.exchangeContact.create({
    data: {
      cardId,
      name,
      email: email ?? null,
      phone: phone ?? null,
      note: note ?? null,
    },
  })

  return NextResponse.json(contact, { status: 201 })
}
