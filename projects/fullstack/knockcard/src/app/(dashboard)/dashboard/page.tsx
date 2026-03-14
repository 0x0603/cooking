import Link from 'next/link'
import { getServerSession } from 'next-auth'

import CardActions from '@/components/dashboard/card-actions'
import Button from '@/components/ui/button'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatNumber } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const cards = await prisma.card.findMany({
    where: { userId: session!.user!.id },
    include: {
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
    <div>
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
            Create New Card
          </Button>
        </Link>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-16">
          <svg
            className="h-12 w-12 text-gray-300"
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
          <h3 className="mt-4 text-sm font-medium text-gray-900">No cards yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first digital business card to get started.
          </p>
          <Link href="/dashboard/cards/new" className="mt-4">
            <Button size="sm">Create New Card</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {cards.map((card: any) => (
            <div
              key={card.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Card Preview Header */}
              <div className="relative h-24 bg-gradient-to-br from-indigo-500 to-purple-600">
                {card.coverPhotoUrl && (
                  <img src={card.coverPhotoUrl} alt="" className="h-full w-full object-cover" />
                )}
                <div className="absolute bottom-0 left-4 translate-y-1/2">
                  {card.avatarUrl ? (
                    <img
                      src={card.avatarUrl}
                      alt=""
                      className="h-12 w-12 rounded-full border-2 border-white object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-lg font-bold text-indigo-600">
                      {card.displayName[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Info */}
              <div className="px-4 pb-4 pt-8">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-gray-900">
                      {card.displayName}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">/{card.slug}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      card.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {card.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {formatNumber(card._count.analyticsEvents)} views
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  <Link href={`/dashboard/cards/${card.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <CardActions cardId={card.id} cardName={card.displayName} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
