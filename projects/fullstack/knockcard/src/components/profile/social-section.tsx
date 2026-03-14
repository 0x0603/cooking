'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

import type { CardTheme, SectionData, SocialContent } from '@/types'

import { getPlatform } from '@/lib/platforms'

interface SocialSectionProps {
  section: SectionData
  theme: CardTheme
}

function PlatformIcon({ platform, iconUrl }: { platform: string; iconUrl?: string }) {
  if (iconUrl) {
    return <img src={iconUrl} alt={platform} className="h-6 w-6" />
  }

  const config = getPlatform(platform)
  if (!config) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    )
  }

  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-xl"
      style={{ backgroundColor: `${config.color}20` }}
    >
      <span className="text-xs font-bold" style={{ color: config.color }}>
        {config.name.slice(0, 2).toUpperCase()}
      </span>
    </div>
  )
}

export function SocialSection({ section, theme }: SocialSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })
  const isDark = theme === 'dark'

  const content = section.content as unknown as SocialContent
  const title = section.title ?? 'SOCIAL'

  return (
    <div ref={ref}>
      <motion.h2
        className={`mb-3 text-xs font-semibold uppercase tracking-widest ${
          isDark ? 'text-white/50' : 'text-gray-400'
        }`}
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h2>

      <div className="grid grid-cols-4 gap-3">
        {content.items?.map((item, index) => {
          const config = getPlatform(item.platform)
          const label = item.label ?? config?.name ?? item.platform

          return (
            <motion.a
              key={`${item.platform}-${index}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-colors ${
                isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.08 * (index + 1) }}
            >
              <PlatformIcon platform={item.platform} iconUrl={item.iconUrl} />
              <span
                className={`text-center text-[10px] leading-tight ${
                  isDark ? 'text-white/60' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </motion.a>
          )
        })}
      </div>
    </div>
  )
}
