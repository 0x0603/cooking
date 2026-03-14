'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { slugify } from '@/lib/utils'

export default function NewCardPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [slug, setSlug] = useState('')
  const [autoSlug, setAutoSlug] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(value: string) {
    setDisplayName(value)

    if (autoSlug) {
      setSlug(slugify(value))
    }
  }

  function handleSlugChange(value: string) {
    setAutoSlug(false)
    setSlug(slugify(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, displayName }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
        return
      }

      const card = await res.json()
      router.push(`/dashboard/cards/${card.id}`)
    } catch {
      setError('Failed to create card. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Create New Card</h1>
      <p className="mt-1 text-sm text-gray-500">
        Set up the basics for your digital business card.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Input
          label="Display Name"
          placeholder="e.g. John Doe"
          value={displayName}
          onChange={e => handleNameChange(e.target.value)}
          required
        />

        <Input
          label="Slug"
          placeholder="e.g. john-doe"
          value={slug}
          onChange={e => handleSlugChange(e.target.value)}
          required
        />
        <p className="-mt-4 text-xs text-gray-400">
          Your card will be available at knockcard.app/{slug || '...'}
        </p>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !slug || !displayName}>
            {isSubmitting ? 'Creating...' : 'Create Card'}
          </Button>
        </div>
      </form>
    </div>
  )
}
