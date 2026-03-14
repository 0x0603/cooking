'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState, type RefObject } from 'react'

import type { CardTheme } from '@/types'

interface HeroProps {
  name: string
  title: string
  coverPhotoUrl: string | null
  avatarUrl: string | null
  theme: CardTheme
  scrollRef: RefObject<HTMLDivElement>
}

function FloatingParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute h-1.5 w-1.5 rounded-full bg-white/30"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.2, 0.6, 0.2],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

const particles = [
  { delay: 0, x: 15, y: 30 },
  { delay: 0.5, x: 75, y: 20 },
  { delay: 1, x: 45, y: 60 },
  { delay: 1.5, x: 85, y: 45 },
  { delay: 2, x: 25, y: 70 },
  { delay: 2.5, x: 60, y: 80 },
]

export function Hero({ name, title, coverPhotoUrl, avatarUrl, theme, scrollRef }: HeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const isDark = theme === 'dark'

  const { scrollY } = useScroll({ container: scrollRef })
  const nameY = useTransform(scrollY, [0, 300], [0, 40])

  useEffect(() => {
    if (!coverPhotoUrl) {
      setImageLoaded(true)
    }
  }, [coverPhotoUrl])

  return (
    <div className="relative overflow-hidden" style={{ borderBottomRightRadius: 40 }}>
      {/* Cover Photo or Gradient */}
      <div className="relative aspect-[4/3] w-full">
        {coverPhotoUrl ? (
          <>
            <img
              src={coverPhotoUrl}
              alt={`${name} cover`}
              className="h-full w-full object-cover"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div
            className={`h-full w-full ${
              isDark
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100'
            }`}
          />
        )}

        {/* Shimmer Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 4,
            ease: 'easeInOut',
          }}
        />

        {/* Floating Particles */}
        {particles.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}

        {/* Top Bar */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            knockcard
          </span>
          <a
            href="https://knockcard.io"
            className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            Get your card
          </a>
        </div>

        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Name + Title Overlay */}
        <motion.div className="absolute bottom-0 left-0 p-6" style={{ y: nameY }}>
          {avatarUrl && (
            <motion.div
              className="mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-white/30"
              initial={{ scale: 0, opacity: 0 }}
              animate={imageLoaded ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            </motion.div>
          )}

          <motion.h1
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={imageLoaded ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {name}
          </motion.h1>

          <motion.p
            className="mt-1 text-sm text-white/70"
            initial={{ opacity: 0, x: -20 }}
            animate={imageLoaded ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            {title}
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
