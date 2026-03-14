'use client'

import { useState } from 'react'

import AnalyticsChart from '@/components/dashboard/analytics-chart'

interface CardOption {
  id: string
  displayName: string
  slug: string
}

interface ExchangeContact {
  id: string
  name: string
  email: string | null
  phone: string | null
  note: string | null
  cardName: string
  createdAt: string
}

interface AnalyticsPageClientProps {
  cards: CardOption[]
  totalViews: number
  totalSaves: number
  totalExchanges: number
  dailyViews: { date: string; count: number }[]
  recentExchanges: ExchangeContact[]
}

export default function AnalyticsPageClient({
  cards,
  totalViews,
  totalSaves,
  totalExchanges,
  dailyViews,
  recentExchanges,
}: AnalyticsPageClientProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>('all')

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

        {cards.length > 1 && (
          <select
            value={selectedCardId}
            onChange={e => setSelectedCardId(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All Cards</option>
            {cards.map(card => (
              <option key={card.id} value={card.id}>
                {card.displayName}
              </option>
            ))}
          </select>
        )}
      </div>

      <AnalyticsChart
        totalViews={totalViews}
        totalSaves={totalSaves}
        totalExchanges={totalExchanges}
        dailyViews={dailyViews}
      />

      {/* Recent Exchanges */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Recent Exchange Contacts</h3>

        {recentExchanges.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">No exchange contacts yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentExchanges.map(contact => (
              <div key={contact.id} className="flex items-center gap-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600">
                  {contact.name[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                  <p className="text-xs text-gray-500">
                    {[contact.email, contact.phone].filter(Boolean).join(' \u00b7 ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{contact.cardName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
