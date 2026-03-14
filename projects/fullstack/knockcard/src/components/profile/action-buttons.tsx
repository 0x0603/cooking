'use client'

import { motion } from 'framer-motion'
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

  return (
    <>
      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <SaveContactButton
          card={card}
          className="flex flex-1 items-center gap-2.5 rounded-[14px] bg-[#111] px-4 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[#1a1a1a] hover:-translate-y-px"
        />

        <button
          type="button"
          onClick={() => setExchangeOpen(true)}
          className="flex flex-1 items-center gap-2.5 rounded-[14px] bg-[#111] px-4 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[#1a1a1a] hover:-translate-y-px"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="16 9 12 5 8 9" />
            <polyline points="16 15 12 19 8 15" />
          </svg>
          Exchange contact
        </button>
      </motion.div>

      {exchangeOpen && (
        <ExchangeForm cardId={card.id} theme={theme} onClose={() => setExchangeOpen(false)} />
      )}
    </>
  )
}
