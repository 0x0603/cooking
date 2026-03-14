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

  return (
    <div ref={scrollRef} className="min-h-screen bg-white text-[#1a1a1a]">
      <div className="mx-auto max-w-md">
        {/* Hero is always dark */}
        <Hero
          name={card.displayName}
          title={card.title}
          coverPhotoUrl={card.coverPhotoUrl}
          avatarUrl={card.avatarUrl}
          theme={card.theme}
          scrollRef={scrollRef}
        />

        {/* Action buttons */}
        <div className="px-4 pt-3.5">
          <ActionButtons card={card} theme={card.theme} />
        </div>

        {/* Sections with border-top dividers */}
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
  )
}
