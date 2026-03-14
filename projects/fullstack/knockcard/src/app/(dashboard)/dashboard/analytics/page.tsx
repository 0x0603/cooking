import { getServerSession } from 'next-auth'

import AnalyticsPageClient from '@/components/dashboard/analytics-page-client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)

  const cards = await prisma.card.findMany({
    where: { userId: session!.user!.id },
    select: { id: true, displayName: true, slug: true },
    orderBy: { createdAt: 'desc' },
  })

  if (cards.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-4 text-sm text-gray-500">Create a card first to see analytics.</p>
      </div>
    )
  }

  // Fetch analytics for all cards
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const cardIds = cards.map((c: { id: string }) => c.id)

  const [viewCount, saveCount, exchangeCount, dailyEvents, recentExchanges] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { cardId: { in: cardIds }, eventType: 'view' },
    }),
    prisma.analyticsEvent.count({
      where: { cardId: { in: cardIds }, eventType: 'save_contact' },
    }),
    prisma.exchangeContact.count({
      where: { cardId: { in: cardIds } },
    }),
    prisma.analyticsEvent.groupBy({
      by: ['createdAt'],
      where: {
        cardId: { in: cardIds },
        eventType: 'view',
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    }),
    prisma.exchangeContact.findMany({
      where: { cardId: { in: cardIds } },
      include: { card: { select: { displayName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  // Aggregate daily views
  const dailyMap = new Map<string, number>()

  for (const event of dailyEvents) {
    const dateKey = event.createdAt.toISOString().split('T')[0]
    dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + event._count)
  }

  // Fill in missing days
  const dailyViews: { date: string; count: number }[] = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    dailyViews.push({ date: dateKey, count: dailyMap.get(dateKey) ?? 0 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exchangeContacts = recentExchanges.map((e: any) => ({
    id: e.id,
    name: e.name,
    email: e.email,
    phone: e.phone,
    note: e.note,
    cardName: e.card.displayName,
    createdAt: e.createdAt.toISOString(),
  }))

  return (
    <AnalyticsPageClient
      cards={cards}
      totalViews={viewCount}
      totalSaves={saveCount}
      totalExchanges={exchangeCount}
      dailyViews={dailyViews}
      recentExchanges={exchangeContacts}
    />
  )
}
