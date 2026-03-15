import Link from 'next/link'
import { getServerSession } from 'next-auth'

import CardItem from '@/components/dashboard/card-item'
import Button from '@/components/ui/button'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatNumber } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const cards = await prisma.card.findMany({
    where: { userId: session!.user!.id },
    include: {
      cardSections: {
        select: { type: true, isVisible: true },
      },
      _count: {
        select: {
          analyticsEvents: {
            where: { eventType: 'view' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalViews = cards.reduce(
    (sum: number, card: { _count: { analyticsEvents: number } }) =>
      sum + card._count.analyticsEvents,
    0
  )

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Cards</h1>
          <p className="mt-1 text-sm text-gray-500">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'} &middot;{' '}
            {formatNumber(totalViews)} total views
          </p>
        </div>
        <Link href="/dashboard/cards/new">
          <Button>
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Card
          </Button>
        </Link>
      </div>

      {/* Cards */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
              />
            </svg>
          </div>
          <h3 className="mt-5 text-base font-semibold text-gray-900">No cards yet</h3>
          <p className="mt-1.5 text-sm text-gray-500">
            Create your first digital business card to get started.
          </p>
          <Link href="/dashboard/cards/new" className="mt-5">
            <Button>Create Your First Card</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {cards.map((card: any) => (
            <CardItem
              key={card.id}
              card={{
                id: card.id,
                slug: card.slug,
                displayName: card.displayName,
                title: card.title,
                company: card.company,
                coverPhotoUrl: card.coverPhotoUrl,
                avatarUrl: card.avatarUrl,
                isPublished: card.isPublished,
                createdAt: card.createdAt.toISOString(),
                sectionCount: card.cardSections?.length ?? 0,
                visibleCount:
                  card.cardSections?.filter((s: { isVisible: boolean }) => s.isVisible).length ?? 0,
                viewCount: card._count.analyticsEvents,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
