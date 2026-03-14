'use client'

import type { CardTheme } from '@/types'

interface FooterProps {
  theme: CardTheme
}

export function Footer({ theme }: FooterProps) {
  const isDark = theme === 'dark'

  return (
    <footer className="pb-8 pt-4 text-center">
      <a
        href="https://knockcard.io"
        className={`text-xs transition-colors ${
          isDark ? 'text-white/20 hover:text-white/40' : 'text-gray-300 hover:text-gray-400'
        }`}
      >
        Powered by <span className="font-medium">KnockCard</span>
      </a>
    </footer>
  )
}
