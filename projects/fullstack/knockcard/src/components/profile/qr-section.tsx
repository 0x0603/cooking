'use client'

import { AnimatePresence, motion } from 'framer-motion'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface QrModalProps {
  slug: string
  name: string
}

export function QrButton({ slug, name }: QrModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm transition-colors hover:bg-white/25"
        aria-label="Show QR code"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="8" height="8" rx="1" />
          <rect x="14" y="2" width="8" height="8" rx="1" />
          <rect x="2" y="14" width="8" height="8" rx="1" />
          <rect x="14" y="14" width="4" height="4" rx="0.5" />
          <rect x="20" y="14" width="2" height="2" rx="0.25" />
          <rect x="14" y="20" width="2" height="2" rx="0.25" />
          <rect x="20" y="20" width="2" height="2" rx="0.25" />
        </svg>
      </button>

      {typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && <QrModal slug={slug} name={name} onClose={() => setOpen(false)} />}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}

function QrModal({ slug, name, onClose }: QrModalProps & { onClose: () => void }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const profileUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `/${slug}`

  useEffect(() => {
    QRCode.toDataURL(profileUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl)
  }, [profileUrl])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-[360px] rounded-3xl bg-white p-8 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#999] transition-colors hover:bg-[#f5f5f5] hover:text-[#333]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex flex-col items-center">
          <p className="text-[18px] font-bold text-[#1a1a1a]">{name}</p>
          <p className="mt-0.5 text-[12px] text-[#999]">Scan to connect</p>

          {/* QR Code */}
          {qrDataUrl && (
            <div className="mt-5 rounded-2xl border border-[#e8e8e8] p-3">
              <img src={qrDataUrl} alt="QR Code" className="h-[220px] w-[220px]" />
            </div>
          )}

          {/* URL */}
          <p className="mt-4 text-[13px] font-medium text-[#666]">{profileUrl}</p>

          {/* Copy + Share */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-full bg-[#f5f5f5] px-5 py-2.5 text-[13px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#eee]"
            >
              {copied ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy link
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: name, url: profileUrl })
                }
              }}
              className="flex items-center gap-1.5 rounded-full bg-[#1a1a1a] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#333]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
