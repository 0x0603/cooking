'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

import type { LinksContent, SectionData } from '@/types'

interface LinksSectionProps {
  section: SectionData
}

export function LinksSection({ section }: LinksSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  const content = section.content as unknown as LinksContent
  const title = section.title ?? 'Links'

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

      <div className="space-y-2">
        {content.items?.map((item, index) => (
          <motion.a
            key={`${item.url}-${index}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl bg-[#f5f5f5] p-3 transition-colors hover:bg-[#eee]"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
          >
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <span className="flex-1 text-[14px] font-medium text-[#1a1a1a]">{item.label}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ccc"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
