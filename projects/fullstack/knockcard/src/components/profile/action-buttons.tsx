'use client'

import { useState } from 'react'

import type { CardData, CardTheme } from '@/types'

import { ExchangeForm } from '@/components/profile/exchange-form'
import { SaveContactButton } from '@/components/profile/save-contact-btn'

interface ActionButtonsProps {
  card: CardData
  theme: CardTheme
}

export function ActionButtons({ card, theme }: ActionButtonsProps) {
  const [exchangeOpen, setExchangeOpen] = useState(false)
  const isDark = theme === 'dark'

  return (
    <>
      <div className="flex gap-3">
        <SaveContactButton
          card={card}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors ${
            isDark
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        />

        <button
          type="button"
          onClick={() => setExchangeOpen(true)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors ${
            isDark
              ? 'border-white/20 text-white hover:bg-white/10'
              : 'border-gray-300 text-gray-900 hover:bg-gray-100'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 3h5v5" />
            <path d="M4 20 21 3" />
            <path d="M21 16v5h-5" />
            <path d="M15 15 3 21" />
          </svg>
          Exchange contact
        </button>
      </div>

      {exchangeOpen && (
        <ExchangeForm cardId={card.id} theme={theme} onClose={() => setExchangeOpen(false)} />
      )}
    </>
  )
}
