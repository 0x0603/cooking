'use client'

import { motion, useScroll, useTransform } from 'framer-motion'

import type { CardTheme } from '@/types'

import { QrButton } from '@/components/profile/qr-section'

interface HeroProps {
  name: string
  slug: string
  title: string
  coverPhotoUrl: string | null
  avatarUrl: string | null
  theme: CardTheme
}

function FloatingParticle({
  delay,
  x,
  y,
  size,
}: {
  delay: number
  x: number
  y: number
  size: number
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/20"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{
        y: [0, -60, 0],
        x: [0, 20, 0],
        opacity: [0, 0.6, 0.3, 0.5, 0],
        scale: [1, 0.5, 1],
      }}
      transition={{
        duration: 8 + delay * 2,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

const particles = [
  { delay: 0, x: 15, y: 30, size: 1.5 },
  { delay: 1, x: 70, y: 20, size: 2 },
  { delay: 2, x: 40, y: 60, size: 1 },
  { delay: 0.5, x: 85, y: 45, size: 1.5 },
  { delay: 3, x: 25, y: 75, size: 1 },
  { delay: 1.5, x: 55, y: 15, size: 2 },
]

export function Hero({ name, slug, coverPhotoUrl }: HeroProps) {
  const { scrollY } = useScroll()

  const coverY = useTransform(scrollY, [0, 500], [0, 40])
  const vignetteOpacity = useTransform(scrollY, [0, 400], [0, 0.5])
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0])
  const headerY = useTransform(scrollY, [0, 100], [0, -20])
  const borderRadius = useTransform(scrollY, [0, 300], [40, 0])
  const shimmerOpacity = useTransform(scrollY, [0, 300], [1, 0.3])

  return (
    <motion.div
      className="relative overflow-hidden bg-[#0a0a0a]"
      style={{ borderBottomRightRadius: borderRadius, height: '65vh' }}
    >
      {/* Cover */}
      <motion.div className="absolute inset-0" style={{ y: coverY }}>
        {coverPhotoUrl ? (
          <img src={coverPhotoUrl} alt={`${name} cover`} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_50%_35%,#3a3a3a_0%,#1a1a1a_45%,#0a0a0a_100%)]" />
        )}
      </motion.div>

      {/* Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-[75%] bg-gradient-to-t from-black from-[15%] via-black/70 to-transparent" />

      {/* Vignette on scroll */}
      <motion.div className="absolute inset-0 bg-black" style={{ opacity: vignetteOpacity }} />

      {/* Shimmer */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: shimmerOpacity,
          background:
            'linear-gradient(105deg, transparent 0%, transparent 40%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 55%, transparent 60%, transparent 100%)',
        }}
        initial={{ x: '-50%' }}
        animate={{ x: '150%' }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Particles */}
      {particles.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* Header: logo + QR button */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 pt-4"
        style={{ y: headerY, opacity: headerOpacity }}
      >
        <img src="/logo.png" alt="KnockCard" className="h-7 brightness-0 invert" />
        <QrButton slug={slug} name={name} />
      </motion.div>
    </motion.div>
  )
}
