'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

import type { SectionData, SocialContent } from '@/types'

import { getPlatform } from '@/lib/platforms'

interface SocialSectionProps {
  section: SectionData
}

function PlatformSvgIcon({ platform }: { platform: string }) {
  // Each platform gets its own SVG icon, stroke #1a1a1a
  const props = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#1a1a1a',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (platform) {
    case 'linkedin':
      return (
        <svg {...props}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    case 'github':
      return (
        <svg {...props}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...props}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    case 'twitter':
      return (
        <svg {...props}>
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...props}>
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      )
    case 'facebook':
      return (
        <svg {...props}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )
  }
}

export function SocialSection({ section }: SocialSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  const content = section.content as unknown as SocialContent
  const title = section.title ?? 'Social'

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

      <div className="grid grid-cols-4 gap-2.5">
        {content.items?.map((item, index) => {
          const config = getPlatform(item.platform)
          const label = item.label ?? config?.name ?? item.platform

          return (
            <motion.a
              key={`${item.platform}-${index}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 rounded-[13px] bg-[#f5f5f5] px-1.5 py-3.5 transition-all hover:-translate-y-px hover:bg-[#eee]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.06 * (index + 1) }}
            >
              <PlatformSvgIcon platform={item.platform} />
              <span className="text-center text-[10px] font-medium text-[#666]">{label}</span>
            </motion.a>
          )
        })}
      </div>
    </div>
  )
}
