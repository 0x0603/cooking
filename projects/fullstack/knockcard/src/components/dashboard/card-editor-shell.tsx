'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

import type { JsonValue } from '@prisma/client/runtime/library'

import ImageUpload from '@/components/dashboard/image-upload'
import LivePreview from '@/components/dashboard/live-preview'
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
  const [showSuccess, setShowSuccess] = useState(false)
  const savedDataRef = useRef(initialData)
  const [dirtyFields, setDirtyFields] = useState(false)
  const [dirtySections, setDirtySections] = useState<Set<string>>(new Set())

  const isDirty = dirtyFields || dirtySections.size > 0

  const updateField = useCallback((field: keyof CardEditorData, value: string | boolean | null) => {
    setData(prev => ({ ...prev, [field]: value }))
    setDirtyFields(true)
  }, [])

  const markSectionDirty = useCallback((sectionId: string) => {
    setDirtySections(prev => new Set(prev).add(sectionId))
  }, [])

  async function handleSave() {
    setIsSaving(true)

    try {
      const promises: Promise<Response>[] = []

      // Save card details
      if (dirtyFields) {
        promises.push(
          fetch(`/api/cards/${data.id}`, {
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
        )
      }

      // Save dirty sections
      for (const sectionId of dirtySections) {
        const section = data.sections.find(s => s.id === sectionId)
        if (section) {
          promises.push(
            fetch(`/api/sections/${sectionId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: section.content }),
            })
          )
        }
      }

      const results = await Promise.all(promises)
      const allOk = results.every(r => r.ok)

      if (allOk) {
        savedDataRef.current = data
        setDirtyFields(false)
        setDirtySections(new Set())
        setShowSuccess(true)
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
        title: type === 'contact' ? 'Information' : type.charAt(0).toUpperCase() + type.slice(1),
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

  const sectionSummary = useMemo(() => {
    const total = data.sections.length
    const visible = data.sections.filter(s => s.isVisible).length
    return { total, visible }
  }, [data.sections])

  return (
    <div className="mx-auto max-w-7xl overflow-x-hidden">
      {/* Top Bar — sticky */}
      <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-gray-200 bg-white/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 lg:mb-6 lg:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
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
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {data.displayName || 'Untitled Card'}
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>
                  {sectionSummary.visible}/{sectionSummary.total} sections visible
                </span>
                <span>&middot;</span>
                <Link
                  href={`/${data.slug}`}
                  target="_blank"
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  Preview
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isDirty && (
              <span className="hidden items-center gap-1 text-xs text-amber-600 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Unsaved changes
              </span>
            )}

            {/* Publish toggle */}
            <button
              onClick={handleTogglePublish}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-gray-50 sm:gap-2 sm:px-3"
            >
              <span
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  data.isPublished ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    data.isPublished ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </span>
              <span
                className={`hidden sm:inline ${data.isPublished ? 'font-medium text-emerald-700' : 'text-gray-500'}`}
              >
                {data.isPublished ? 'Live' : 'Draft'}
              </span>
            </button>

            <Button size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content — three columns */}
      <div className="grid gap-6 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_300px]">
        {/* Left Panel: Card Details */}
        <div className="min-w-0 space-y-4">
          {/* Profile info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Profile
            </h2>
            <div className="space-y-3">
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
              <Input
                label="Slug"
                value={data.slug}
                onChange={e => updateField('slug', e.target.value)}
              />
            </div>
          </div>

          {/* Images */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Images
            </h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Cover Photo</p>
                <ImageUpload
                  value={data.coverPhotoUrl}
                  onChange={url => updateField('coverPhotoUrl', url)}
                />
              </div>
              {/* Avatar — hidden for now, can be re-enabled later */}
            </div>
          </div>
        </div>

        {/* Center Panel: Sections */}
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Sections
            </h2>
            <AddSectionDropdown onAdd={handleAddSection} />
          </div>

          <SectionList
            cardId={data.id}
            sections={data.sections}
            onSectionsChange={handleSectionsChange}
            onSectionContentChange={markSectionDirty}
          />
        </div>

        {/* Right Panel: Live Preview */}
        <div className="hidden lg:block">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Preview
          </h2>
          <LivePreview
            displayName={data.displayName}
            title={data.title}
            company={data.company}
            bio={data.bio}
            coverPhotoUrl={data.coverPhotoUrl}
            avatarUrl={data.avatarUrl}
            sections={data.sections}
          />
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSuccess(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
            {/* Check icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg
                className="h-7 w-7 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-gray-900">Changes Saved!</h3>
            <p className="mt-1.5 text-sm text-gray-500">Your card has been updated successfully.</p>

            <div className="mt-6 space-y-2">
              <a
                href={`/${data.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
                View Your Card
              </a>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Add Section Dropdown ──────────────────────────────────────────────────

const SECTION_TYPES = [
  {
    type: 'about',
    label: 'About',
    desc: 'Text about yourself',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0',
  },
  {
    type: 'contact',
    label: 'Information',
    desc: 'Phone, email, birthday, location & more',
    icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  },
  {
    type: 'social',
    label: 'Social Links',
    desc: 'Social media profiles',
    icon: 'M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z',
  },
  {
    type: 'gallery',
    label: 'Gallery',
    desc: 'Image gallery',
    icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18h15A2.25 2.25 0 0019.5 15.75V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v9.75A2.25 2.25 0 006.75 18z',
  },
  {
    type: 'links',
    label: 'Links',
    desc: 'Custom URLs',
    icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.686-3.374l4.5-4.5a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
  },
]

function AddSectionDropdown({ onAdd }: { onAdd: (type: string) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
        <svg
          className="mr-1.5 h-4 w-4"
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
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
            {SECTION_TYPES.map(s => (
              <button
                key={s.type}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                onClick={() => {
                  onAdd(s.type)
                  setOpen(false)
                }}
              >
                <svg
                  className="h-4 w-4 shrink-0 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-700">{s.label}</div>
                  <div className="text-xs text-gray-400">{s.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
