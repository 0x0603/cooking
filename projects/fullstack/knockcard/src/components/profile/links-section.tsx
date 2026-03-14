'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

import type { CardTheme, LinksContent, SectionData } from '@/types'

interface LinksSectionProps {
  section: SectionData
  theme: CardTheme
}

export function LinksSection({ section, theme }: LinksSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })
  const isDark = theme === 'dark'

  const content = section.content as unknown as LinksContent
  const title = section.title ?? 'LINKS'

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

      <div className="space-y-2">
        {content.items?.map((item, index) => (
          <motion.a
            key={`${item.url}-${index}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
              isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
          >
            {item.icon && <span className="text-lg">{item.icon}</span>}

            <span
              className={`flex-1 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {item.label}
            </span>

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
              className={isDark ? 'text-white/30' : 'text-gray-300'}
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </motion.a>
        ))}
      </div>
    </div>
  )
}
