'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

import type { GalleryContent, SectionData } from '@/types'

interface GallerySectionProps {
  section: SectionData
}

export function GallerySection({ section }: GallerySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  const content = section.content as unknown as GalleryContent
  const title = section.title ?? 'Gallery'
  const columns = content.columns ?? 2

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
