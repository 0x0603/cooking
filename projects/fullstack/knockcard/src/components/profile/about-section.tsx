'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

import type { AboutContent, SectionData } from '@/types'

interface AboutSectionProps {
  section: SectionData
}

export function AboutSection({ section }: AboutSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  const content = section.content as unknown as AboutContent
  const title = section.title ?? 'About'

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

      <motion.p
        className="text-[14px] leading-[1.65] text-[#666]"
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {content.text}
      </motion.p>
    </div>
  )
}
