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

export function Hero({ name, title, coverPhotoUrl, scrollRef }: HeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const { scrollY } = useScroll({ container: scrollRef })

  // Parallax: whole block moves up at 0.35x speed, fades out
  const infoY = useTransform(scrollY, [0, 400], [0, 140])
  const infoOpacity = useTransform(scrollY, [0, 333], [1, 0])

  useEffect(() => {
    if (!coverPhotoUrl) {
      setImageLoaded(true)
    }
  }, [coverPhotoUrl])

  return (
    <div
      className="relative overflow-hidden bg-[#0a0a0a]"
      style={{ borderBottomRightRadius: 40, height: 400 }}
    >
      {/* Cover Photo or Gradient */}
      <div className="absolute inset-0">
        {coverPhotoUrl ? (
          <img
            src={coverPhotoUrl}
            alt={`${name} cover`}
            className="h-full w-full object-cover"
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_50%_35%,#3a3a3a_0%,#1a1a1a_45%,#0a0a0a_100%)]" />
        )}
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Shimmer Sweep */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, transparent 0%, transparent 40%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 55%, transparent 60%, transparent 100%)',
        }}
        initial={{ x: '-50%' }}
        animate={{ x: '150%' }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Particles */}
      {particles.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* Top Nav */}
      <div className="absolute left-0 right-0 top-0 z-10 p-5">
        <span className="text-[22px] font-extrabold tracking-[-0.5px] text-white">knockcard</span>
      </div>

      {/* Name + Title — parallax: slides up at 0.35x speed, fades out */}
      <motion.div
        className="absolute bottom-[30px] left-0 right-0 z-10 px-6"
        style={{ y: infoY, opacity: infoOpacity }}
      >
        <motion.h1
          className="text-[42px] font-extrabold leading-[1.05] tracking-[-1.5px] text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={imageLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {name.split(' ').map((word, i) => (
            <span key={i}>
              {word}
              {i < name.split(' ').length - 1 && <br />}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className="mt-1.5 text-[15px] font-normal text-white/[0.55]"
          initial={{ opacity: 0, y: 10 }}
          animate={imageLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          {title}
        </motion.p>
      </motion.div>
    </div>
  )
}
