'use client'

import { useRef } from 'react'

import type { CardData } from '@/types'

import { ActionButtons } from '@/components/profile/action-buttons'
import { Footer } from '@/components/profile/footer'
import { Hero } from '@/components/profile/hero'
import { SectionRenderer } from '@/components/profile/section-renderer'

interface ProfilePageProps {
  card: CardData
}

export function ProfilePage({ card }: ProfilePageProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDark = card.theme === 'dark'

  return (
    <div
      ref={scrollRef}
      className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#fafafa] text-gray-900'}`}
    >
      <div className="mx-auto max-w-md">
        <Hero
          name={card.displayName}
          title={card.title}
          coverPhotoUrl={card.coverPhotoUrl}
          avatarUrl={card.avatarUrl}
          theme={card.theme}
          scrollRef={scrollRef}
        />

        <div className="px-4 py-4">
          <ActionButtons card={card} theme={card.theme} />
        </div>

        <div className="space-y-6 px-4 pb-8">
          {card.sections.map(section => (
            <SectionRenderer key={section.id} section={section} theme={card.theme} />
          ))}
        </div>

        <Footer theme={card.theme} />
      </div>
    </div>
  )
}
