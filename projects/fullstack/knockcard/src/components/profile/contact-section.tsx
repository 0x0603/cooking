'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

import type { ContactContent, ContactItem, SectionData } from '@/types'

interface ContactSectionProps {
  section: SectionData
}

function getContactIcon(type: ContactItem['type']) {
  const props = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#1a1a1a',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (type) {
    case 'phone':
      return (
        <svg {...props}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      )
    case 'email':
      return (
        <svg {...props}>
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      )
    case 'website':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      )
    case 'location':
      return (
        <svg {...props}>
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
    case 'website':
      return item.value.startsWith('http') ? item.value : `https://${item.value}`
    default:
      return undefined
  }
}

export function ContactSection({ section }: ContactSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  const content = section.content as unknown as ContactContent
  const title = section.title ?? 'Contact'

  return (
    <div ref={ref}>
      <motion.h2
        className="mb-2.5 text-[11px] font-bold uppercase tracking-[2px] text-[#1a1a1a]"
        initial={{ opacity: 0, x: -16 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h2>

      <div>
        {content.items?.map((item, index) => {
          const href = getContactHref(item)
          const Tag = href ? 'a' : 'div'
          const isLast = index === content.items.length - 1

          return (
            <motion.div
              key={`${item.type}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.06 * (index + 1) }}
            >
              <Tag
                {...(href
                  ? {
                      href,
                      target: item.type === 'website' ? '_blank' : undefined,
                      rel: item.type === 'website' ? 'noopener noreferrer' : undefined,
                    }
                  : {})}
                className={`flex items-center gap-3.5 py-3 transition-opacity hover:opacity-70 ${
                  !isLast ? 'border-b border-[#f0f0f0]' : ''
                }`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[11px] bg-[#f5f5f5]">
                  {getContactIcon(item.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[#1a1a1a]">{item.label}</p>
                  <p className="mt-px truncate text-[12px] text-[#999]">{item.value}</p>
                </div>

                {href && <span className="text-[18px] text-[#ccc]">›</span>}
              </Tag>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
