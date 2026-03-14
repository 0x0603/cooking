'use client'

import { motion, useScroll, useTransform } from 'framer-motion'

import type { CardData } from '@/types'

import { ActionButtons } from '@/components/profile/action-buttons'
import { Footer } from '@/components/profile/footer'
import { Hero } from '@/components/profile/hero'
import { SectionRenderer } from '@/components/profile/section-renderer'

interface ProfilePageProps {
  card: CardData
}

export function ProfilePage({ card }: ProfilePageProps) {
  const { scrollY } = useScroll()

  // Name: fade out quickly on first scroll
  const nameY = useTransform(scrollY, [0, 100], [0, 20])
  const nameOpacity = useTransform(scrollY, [0, 100], [1, 0])

  return (
    <div className="relative min-h-screen bg-white text-[#1a1a1a]">
      <div className="mx-auto max-w-md">
        {/* Hero — sticky behind */}
        <div className="sticky top-0 z-0">
          <Hero
            name={card.displayName}
            slug={card.slug}
            title={card.title}
            coverPhotoUrl={card.coverPhotoUrl}
            avatarUrl={card.avatarUrl}
            theme={card.theme}
          />
        </div>

        {/* Name overlay — positioned above content, below hero visually but z above content */}
        <motion.div
          className="pointer-events-none sticky top-[300px] z-20 px-6 pb-4"
          style={{ y: nameY, opacity: nameOpacity, marginTop: -180 }}
        >
          <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-[-1.5px] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.6)]">
            {card.displayName}
          </h1>
          <p className="mt-2 text-[15px] font-normal text-white/[0.6] [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
            {card.title}
          </p>
        </motion.div>

        {/* Content — slides up over hero */}
        <div className="relative z-10 flex min-h-screen flex-col rounded-t-[28px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
          <div className="px-4 pt-5">
            <ActionButtons card={card} theme={card.theme} />
          </div>

          {card.sections.map((section, index) => (
            <div
              key={section.id}
              className={`border-t border-[#e8e8e8] px-5 py-5 ${index === 0 ? 'mt-3' : ''}`}
            >
              <SectionRenderer section={section} />
            </div>
          ))}

          <Footer />
        </div>
      </div>
    </div>
  )
}
