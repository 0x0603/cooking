'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import type { JsonValue } from '@prisma/client/runtime/library'

import ImageUpload from '@/components/dashboard/image-upload'
import SectionList from '@/components/dashboard/section-list'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'

interface SectionItem {
  id: string
  type: string
  title: string | null
  content: JsonValue
  sortOrder: number
  isVisible: boolean
}

interface CardEditorData {
  id: string
  slug: string
  displayName: string
  title: string
  company: string | null
  bio: string | null
  coverPhotoUrl: string | null
  avatarUrl: string | null
  isPublished: boolean
  sections: SectionItem[]
}

interface CardEditorShellProps {
  initialData: CardEditorData
}

export default function CardEditorShell({ initialData }: CardEditorShellProps) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const updateField = useCallback((field: keyof CardEditorData, value: string | boolean | null) => {
    setData(prev => ({ ...prev, [field]: value }))
  }, [])

  async function handleSave() {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const res = await fetch(`/api/cards/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: data.slug,
          displayName: data.displayName,
          title: data.title,
          company: data.company,
          bio: data.bio,
          coverPhotoUrl: data.coverPhotoUrl,
          avatarUrl: data.avatarUrl,
          isPublished: data.isPublished,
        }),
      })

      if (res.ok) {
        setSaveMessage('Saved!')
        setTimeout(() => setSaveMessage(null), 2000)
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTogglePublish() {
    const newState = !data.isPublished
    updateField('isPublished', newState)

    await fetch(`/api/cards/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: newState }),
    })
  }

  function handleSectionsChange(sections: SectionItem[]) {
    setData(prev => ({ ...prev, sections }))
  }

  async function handleAddSection(type: string) {
    const res = await fetch(`/api/cards/${data.id}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        content: {},
        sortOrder: data.sections.length,
      }),
    })

    if (res.ok) {
      const section = await res.json()
      setData(prev => ({
        ...prev,
        sections: [...prev.sections, section],
      }))
    }
  }

  return (
    <div>
      {/* Top Bar */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Edit Card</h1>
          <Link
            href={`/${data.slug}`}
            target="_blank"
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Preview &rarr;
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {saveMessage && <span className="text-sm text-green-600">{saveMessage}</span>}
          <button
            onClick={handleTogglePublish}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              data.isPublished ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                data.isPublished ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-sm text-gray-600">{data.isPublished ? 'Published' : 'Draft'}</span>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Left Panel: Card Details */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Card Details</h2>
            <div className="space-y-4">
              <Input
                label="Display Name"
                value={data.displayName}
                onChange={e => updateField('displayName', e.target.value)}
              />
              <Input
                label="Title / Role"
                value={data.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="e.g. Software Engineer"
              />
              <Input
                label="Company"
                value={data.company ?? ''}
                onChange={e => updateField('company', e.target.value)}
                placeholder="e.g. Acme Corp"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  rows={3}
                  value={data.bio ?? ''}
                  onChange={e => updateField('bio', e.target.value)}
                  placeholder="A short bio..."
                />
              </div>
              <Input
                label="Slug"
                value={data.slug}
                onChange={e => updateField('slug', e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Images</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Cover Photo</p>
                <ImageUpload
                  value={data.coverPhotoUrl}
                  onChange={url => updateField('coverPhotoUrl', url)}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Avatar</p>
                <ImageUpload
                  value={data.avatarUrl}
                  onChange={url => updateField('avatarUrl', url)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Sections */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Sections</h2>
            <AddSectionDropdown onAdd={handleAddSection} />
          </div>

          <SectionList
            cardId={data.id}
            sections={data.sections}
            onSectionsChange={handleSectionsChange}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Add Section Dropdown ──────────────────────────────────────────────────

const SECTION_TYPES = [
  {
    type: 'about',
    label: 'About',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0',
  },
  {
    type: 'contact',
    label: 'Contact',
    icon: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
  },
  {
    type: 'social',
    label: 'Social',
    icon: 'M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z',
  },
  {
    type: 'gallery',
    label: 'Gallery',
    icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18h15A2.25 2.25 0 0019.5 15.75V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v9.75A2.25 2.25 0 006.75 18z',
  },
  {
    type: 'links',
    label: 'Links',
    icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.686-3.374l4.5-4.5a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
  },
]

function AddSectionDropdown({ onAdd }: { onAdd: (type: string) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
        <svg
          className="mr-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Section
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {SECTION_TYPES.map(s => (
            <button
              key={s.type}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                onAdd(s.type)
                setOpen(false)
              }}
            >
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
