'use client'

import Link from 'next/link'

import CardActions from '@/components/dashboard/card-actions'
import { formatNumber } from '@/lib/utils'

interface CardItemProps {
  card: {
    id: string
    slug: string
    displayName: string
    title: string
    company: string | null
    coverPhotoUrl: string | null
    avatarUrl: string | null
    isPublished: boolean
    createdAt: string
    sectionCount: number
    visibleCount: number
    viewCount: number
  }
}

export default function CardItem({ card }: CardItemProps) {
  const createdDate = new Date(card.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link
      href={`/dashboard/cards/${card.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/60"
    >
      {/* Cover / gradient header */}
      <div className="relative h-28 overflow-hidden">
        {card.coverPhotoUrl ? (
          <img
            src={card.coverPhotoUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Status badge */}
        <div className="absolute right-3 top-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${
              card.isPublished ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/20 text-white/80'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                card.isPublished ? 'bg-emerald-400' : 'bg-white/60'
              }`}
            />
            {card.isPublished ? 'Live' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Avatar */}
      <div className="relative mx-5 -mt-8">
        {card.avatarUrl ? (
          <img
            src={card.avatarUrl}
            alt=""
            className="h-16 w-16 rounded-2xl border-[3px] border-white object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-white bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-sm">
            {card.displayName[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col px-5 pb-4 pt-3">
        <h3 className="text-[15px] font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
          {card.displayName}
        </h3>
        {card.title && (
          <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
            {card.title}
            {card.company ? ` at ${card.company}` : ''}
          </p>
        )}

        {/* Meta chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
            <svg
              className="h-3 w-3 text-gray-400"
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
            {formatNumber(card.viewCount)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
            <svg
              className="h-3 w-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
            {card.visibleCount}/{card.sectionCount}
          </span>
          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            /{card.slug}
          </span>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 mt-4">
          <span className="text-[11px] text-gray-400">{createdDate}</span>
          <div onClick={e => e.preventDefault()}>
            <CardActions cardId={card.id} cardName={card.displayName} />
          </div>
        </div>
      </div>
    </Link>
  )
}
