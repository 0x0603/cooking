'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

import type { CardTheme, GalleryContent, SectionData } from '@/types'

interface GallerySectionProps {
  section: SectionData
  theme: CardTheme
}

export function GallerySection({ section, theme }: GallerySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })
  const isDark = theme === 'dark'

  const content = section.content as unknown as GalleryContent
  const title = section.title ?? 'GALLERY'
  const columns = content.columns ?? 2

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

      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {content.images?.map((url, index) => (
          <motion.div
            key={index}
            className="overflow-hidden rounded-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
          >
            <img
              src={url}
              alt={`Gallery image ${index + 1}`}
              className="aspect-square w-full object-cover"
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
