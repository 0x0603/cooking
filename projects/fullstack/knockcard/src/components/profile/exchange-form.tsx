'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'

import type { CardTheme } from '@/types'

interface ExchangeFormProps {
  cardId: string
  theme: CardTheme
  onClose: () => void
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function ExchangeForm({ cardId, theme, onClose }: ExchangeFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const backdropRef = useRef<HTMLDivElement>(null)
  const isDark = theme === 'dark'

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose()
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const formData = new FormData(e.currentTarget)
    const body = {
      cardId,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      note: formData.get('note') as string,
    }

    try {
      const res = await fetch('/api/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        throw new Error('Failed to submit')
      }

      setStatus('success')
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  const inputClassName = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${
    isDark
      ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-white/30'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400'
  }`

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={backdropRef}
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className={`w-full max-w-md rounded-t-2xl p-6 sm:rounded-2xl ${
            isDark ? 'bg-[#111]' : 'bg-white'
          }`}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Exchange Contact
            </h3>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-full p-1 transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isDark ? 'text-white/60' : 'text-gray-400'}
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {status === 'success' ? (
            <motion.div
              className="py-8 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-500"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Thank you!
              </p>
              <p className={`mt-1 text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                Your contact has been shared successfully.
              </p>
              <button
                type="button"
                onClick={onClose}
                className={`mt-6 rounded-xl px-6 py-2.5 text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Done
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="name"
                type="text"
                placeholder="Your name *"
                required
                className={inputClassName}
              />
              <input name="email" type="email" placeholder="Email" className={inputClassName} />
              <input name="phone" type="tel" placeholder="Phone" className={inputClassName} />
              <textarea
                name="note"
                placeholder="Note (optional)"
                rows={3}
                className={`${inputClassName} resize-none`}
              />

              {status === 'error' && <p className="text-sm text-red-500">{errorMessage}</p>}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className={`w-full rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-50 ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {status === 'submitting' ? 'Sending...' : 'Send'}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
