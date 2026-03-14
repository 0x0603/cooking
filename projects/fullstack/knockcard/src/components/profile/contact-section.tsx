'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

import type { CardTheme, ContactContent, ContactItem, SectionData } from '@/types'

interface ContactSectionProps {
  section: SectionData
  theme: CardTheme
}

function getContactIcon(type: ContactItem['type']) {
  switch (type) {
    case 'phone':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      )
    case 'email':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      )
    case 'website':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      )
    case 'location':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    default:
      return null
  }
}

function getContactHref(item: ContactItem): string | undefined {
  switch (item.type) {
    case 'phone':
      return `tel:${item.value}`
    case 'email':
      return `mailto:${item.value}`
    case 'website': {
      const url = item.value.startsWith('http') ? item.value : `https://${item.value}`
      return url
    }
    default:
      return undefined
  }
}

export function ContactSection({ section, theme }: ContactSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })
  const isDark = theme === 'dark'

  const content = section.content as unknown as ContactContent
  const title = section.title ?? 'CONTACT'

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
        {content.items?.map((item, index) => {
          const href = getContactHref(item)
          const Tag = href ? 'a' : 'div'

          return (
            <motion.div
              key={`${item.type}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
            >
              <Tag
                {...(href
                  ? {
                      href,
                      target: item.type === 'website' ? '_blank' : undefined,
                      rel: item.type === 'website' ? 'noopener noreferrer' : undefined,
                    }
                  : {})}
                className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                  isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`flex-shrink-0 ${isDark ? 'text-white/60' : 'text-gray-400'}`}>
                  {getContactIcon(item.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    {item.label}
                  </p>
                  <p className={`truncate text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.value}
                  </p>
                </div>

                {href && (
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
                    className={`flex-shrink-0 ${isDark ? 'text-white/30' : 'text-gray-300'}`}
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                )}
              </Tag>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
