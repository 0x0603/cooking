'use client'

import { useState } from 'react'

import type {
  AboutContent,
  ContactContent,
  ContactItem,
  ContactItemType,
  GalleryContent,
  LinkItem,
  LinksContent,
  SocialContent,
  SocialItem,
} from '@/types'
import type { JsonValue } from '@prisma/client/runtime/library'

import ImageUpload from '@/components/dashboard/image-upload'
import SocialLinkPicker from '@/components/dashboard/social-link-picker'
import Button from '@/components/ui/button'
import Dialog from '@/components/ui/dialog'
import Input from '@/components/ui/input'

interface SectionItem {
  id: string
  type: string
  title: string | null
  content: JsonValue
  sortOrder: number
  isVisible: boolean
}

interface SectionEditorProps {
  section: SectionItem
  onSave: (content: JsonValue) => void
  onClose: () => void
}

export default function SectionEditor({ section, onSave, onClose }: SectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave(content: JsonValue) {
    setIsSaving(true)

    try {
      const res = await fetch(`/api/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        onSave(content)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open onClose={onClose} title={`Edit ${section.title ?? section.type}`}>
      {section.type === 'about' && (
        <AboutEditor
          content={section.content as unknown as AboutContent}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
      {section.type === 'contact' && (
        <ContactEditor
          content={section.content as unknown as ContactContent}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
      {section.type === 'social' && (
        <SocialEditor
          content={section.content as unknown as SocialContent}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
      {section.type === 'gallery' && (
        <GalleryEditor
          content={section.content as unknown as GalleryContent}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
      {section.type === 'links' && (
        <LinksEditor
          content={section.content as unknown as LinksContent}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </Dialog>
  )
}

// ─── About Editor ──────────────────────────────────────────────────────────

function AboutEditor({
  content,
  onSave,
  isSaving,
}: {
  content: AboutContent
  onSave: (content: JsonValue) => void
  isSaving: boolean
}) {
  const [text, setText] = useState(content?.text ?? '')

  return (
    <div className="space-y-4">
      <textarea
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        rows={6}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write something about yourself..."
      />
      <div className="flex justify-end">
        <Button onClick={() => onSave({ text })} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

// ─── Contact Editor ────────────────────────────────────────────────────────

const CONTACT_TYPES: { value: ContactItemType; label: string }[] = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
  { value: 'location', label: 'Location' },
]

function ContactEditor({
  content,
  onSave,
  isSaving,
}: {
  content: ContactContent
  onSave: (content: JsonValue) => void
  isSaving: boolean
}) {
  const [items, setItems] = useState<ContactItem[]>(content?.items ?? [])

  function addItem() {
    setItems([...items, { type: 'phone', label: '', value: '' }])
  }

  function updateItem(index: number, updates: Partial<ContactItem>) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...updates } : item)))
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <select
            className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
            value={item.type}
            onChange={e =>
              updateItem(index, {
                type: e.target.value as ContactItemType,
              })
            }
          >
            {CONTACT_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <Input
            placeholder="Label"
            value={item.label}
            onChange={e => updateItem(index, { label: e.target.value })}
            className="flex-1"
          />
          <Input
            placeholder="Value"
            value={item.value}
            onChange={e => updateItem(index, { value: e.target.value })}
            className="flex-1"
          />
          <button
            onClick={() => removeItem(index)}
            className="mt-2 rounded p-1 text-gray-400 hover:text-red-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <Button variant="ghost" size="sm" onClick={addItem}>
        + Add Contact Item
      </Button>

      <div className="flex justify-end">
        <Button onClick={() => onSave({ items } as unknown as JsonValue)} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

// ─── Social Editor ─────────────────────────────────────────────────────────

function SocialEditor({
  content,
  onSave,
  isSaving,
}: {
  content: SocialContent
  onSave: (content: JsonValue) => void
  isSaving: boolean
}) {
  const [items, setItems] = useState<SocialItem[]>(content?.items ?? [])

  function handleChange(updatedItems: SocialItem[]) {
    setItems(updatedItems)
  }

  return (
    <div className="space-y-4">
      <SocialLinkPicker items={items} onChange={handleChange} />

      <div className="flex justify-end">
        <Button onClick={() => onSave({ items } as unknown as JsonValue)} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

// ─── Gallery Editor ────────────────────────────────────────────────────────

function GalleryEditor({
  content,
  onSave,
  isSaving,
}: {
  content: GalleryContent
  onSave: (content: JsonValue) => void
  isSaving: boolean
}) {
  const [images, setImages] = useState<string[]>(content?.images ?? [])

  function addImage(url: string | null) {
    if (url) {
      setImages([...images, url])
    }
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {images.map((src, index) => (
          <div key={index} className="group relative aspect-square">
            <img src={src} alt="" className="h-full w-full rounded-lg object-cover" />
            <button
              onClick={() => removeImage(index)}
              className="absolute right-1 top-1 hidden rounded-full bg-black/50 p-1 text-white group-hover:block"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <ImageUpload value={null} onChange={addImage} />

      <div className="flex justify-end">
        <Button onClick={() => onSave({ images } as unknown as JsonValue)} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

// ─── Links Editor ──────────────────────────────────────────────────────────

function LinksEditor({
  content,
  onSave,
  isSaving,
}: {
  content: LinksContent
  onSave: (content: JsonValue) => void
  isSaving: boolean
}) {
  const [items, setItems] = useState<LinkItem[]>(content?.items ?? [])

  function addItem() {
    setItems([...items, { label: '', url: '' }])
  }

  function updateItem(index: number, updates: Partial<LinkItem>) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...updates } : item)))
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <Input
            placeholder="Label"
            value={item.label}
            onChange={e => updateItem(index, { label: e.target.value })}
            className="flex-1"
          />
          <Input
            placeholder="https://..."
            value={item.url}
            onChange={e => updateItem(index, { url: e.target.value })}
            className="flex-1"
          />
          <button
            onClick={() => removeItem(index)}
            className="mt-2 rounded p-1 text-gray-400 hover:text-red-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <Button variant="ghost" size="sm" onClick={addItem}>
        + Add Link
      </Button>

      <div className="flex justify-end">
        <Button onClick={() => onSave({ items } as unknown as JsonValue)} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
