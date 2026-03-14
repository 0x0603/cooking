import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
  })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  if (card.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [totalViews, totalSaves, totalExchanges, viewsPerDay] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { cardId: params.id, eventType: 'view' },
    }),
    prisma.analyticsEvent.count({
      where: { cardId: params.id, eventType: 'save' },
    }),
    prisma.exchangeContact.count({
      where: { cardId: params.id },
    }),
    prisma.analyticsEvent.groupBy({
      by: ['createdAt'],
      where: {
        cardId: params.id,
        eventType: 'view',
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
    }),
  ])

  const dailyViews: Record<string, number> = {}
  for (const entry of viewsPerDay) {
    const dateKey = entry.createdAt.toISOString().split('T')[0]
    dailyViews[dateKey] = (dailyViews[dateKey] ?? 0) + entry._count.id
  }

  const viewsByDay = Object.entries(dailyViews)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json({
    totalViews,
    totalSaves,
    totalExchanges,
    viewsByDay,
  })
}
