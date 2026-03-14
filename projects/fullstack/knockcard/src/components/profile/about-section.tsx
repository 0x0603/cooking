'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

import type { AboutContent, CardTheme, SectionData } from '@/types'

interface AboutSectionProps {
  section: SectionData
  theme: CardTheme
}

export function AboutSection({ section, theme }: AboutSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })
  const isDark = theme === 'dark'

  const content = section.content as unknown as AboutContent
  const title = section.title ?? 'ABOUT'

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

      <motion.p
        className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {content.text}
      </motion.p>
    </div>
  )
}
