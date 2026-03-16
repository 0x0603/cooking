'use client'

import type { CardData, ContactContent } from '@/types'

import { generateVCard } from '@/lib/vcard'

interface SaveContactButtonProps {
  card: CardData
  className?: string
}

export function SaveContactButton({ card, className }: SaveContactButtonProps) {
  const handleSave = () => {
    const contactSection = card.sections.find(s => s.type === 'contact')
    const content = contactSection?.content as unknown as ContactContent | undefined

    const phone = content?.items?.find(i => i.type === 'phone')?.value
    const email = content?.items?.find(i => i.type === 'email')?.value
    const website = content?.items?.find(i => i.type === 'website')?.value
    const address = content?.items?.find(i => i.type === 'location')?.value
    const companyFromSection = content?.items?.find(i => i.type === 'company')?.value

    const vcf = generateVCard({
      name: card.displayName,
      title: card.title,
      company: card.company ?? companyFromSection ?? undefined,
      phone,
      email,
      website,
      address,
    })

    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${card.displayName.replace(/\s+/g, '-').toLowerCase()}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" onClick={handleSave} className={className}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Save contact
    </button>
  )
}
