'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

import type { CardTheme, SectionData } from '@/types'

import { AboutSection } from '@/components/profile/about-section'
import { ContactSection } from '@/components/profile/contact-section'
import { GallerySection } from '@/components/profile/gallery-section'
import { LinksSection } from '@/components/profile/links-section'
import { SocialSection } from '@/components/profile/social-section'

interface SectionRendererProps {
  section: SectionData
  theme: CardTheme
}

function getSectionComponent(type: string) {
  switch (type) {
    case 'about':
      return AboutSection
    case 'contact':
      return ContactSection
    case 'social':
      return SocialSection
    case 'gallery':
      return GallerySection
    case 'links':
      return LinksSection
    default:
      return null
  }
}

export function SectionRenderer({ section, theme }: SectionRendererProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const Component = getSectionComponent(section.type)

  if (!Component) {
    return null
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Component section={section} theme={theme} />
    </motion.div>
  )
}
