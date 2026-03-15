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

  // Name fades on scroll
  const nameY = useTransform(scrollY, [0, 80], [0, 15])
  const nameOpacity = useTransform(scrollY, [0, 80], [1, 0])

  return (
    <div className="relative h-screen snap-y snap-mandatory overflow-y-auto bg-[#0a0a0a] text-[#1a1a1a]">
      {/* Snap point 1: Hero fully visible */}
      <div className="snap-start">
        <div className="mx-auto max-w-md">
          {/* Hero */}
          <div className="relative" style={{ height: '65vh' }}>
            <Hero
              name={card.displayName}
              slug={card.slug}
              title={card.title}
              coverPhotoUrl={card.coverPhotoUrl}
              avatarUrl={card.avatarUrl}
              theme={card.theme}
            />

            {/* Name overlay */}
            <motion.div
              className="pointer-events-none absolute bottom-[60px] left-0 right-0 z-20 px-6"
              style={{ y: nameY, opacity: nameOpacity }}
            >
              <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-[-1.5px] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.6)]">
                {card.displayName}
              </h1>
              <p className="mt-2 text-[15px] font-normal text-white/[0.6] [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
                {card.title}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Snap point 2: Content pulled up — stops 64px from top */}
      <div className="snap-start">
        <div className="mx-auto max-w-md">
          {/* Content panel */}
          <div
            className="relative z-10 rounded-t-[28px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
            style={{ minHeight: 'calc(100vh - 64px)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pb-2 pt-3">
              <div className="h-[4px] w-10 rounded-full bg-gray-300" />
            </div>

            <div className="px-4 pb-2">
              <ActionButtons card={card} theme={card.theme} />
            </div>

            {card.sections.map((section, index) => (
              <div
                key={section.id}
                className={`border-t border-[#e8e8e8] px-5 py-5 ${index === 0 ? 'mt-1' : ''}`}
              >
                <SectionRenderer section={section} />
              </div>
            ))}

            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
