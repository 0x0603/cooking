'use client'

import type {
  AboutContent,
  ContactContent,
  ContactItemType,
  GalleryContent,
  LinksContent,
  SocialContent,
} from '@/types'
import type { JsonValue } from '@prisma/client/runtime/library'

import { getPlatform } from '@/lib/platforms'

interface SectionItem {
  id: string
  type: string
  title: string | null
  content: JsonValue
  sortOrder: number
  isVisible: boolean
}

interface LivePreviewProps {
  displayName: string
  title: string
  company: string | null
  bio: string | null
  coverPhotoUrl: string | null
  avatarUrl: string | null
  sections: SectionItem[]
}

const INFO_ICONS: Record<string, string> = {
  phone:
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  email:
    'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z|m22-1-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7',
  website: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z|M2 12h20',
  location: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z',
}

function InfoIcon({ type }: { type: ContactItemType }) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {(INFO_ICONS[type] ?? INFO_ICONS.phone).split('|').map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

export default function LivePreview({
  displayName,
  title,
  company,
  coverPhotoUrl,
  avatarUrl,
  sections,
}: LivePreviewProps) {
  const visibleSections = sections
    .filter(s => s.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="sticky top-20">
      {/* Phone frame */}
      <div className="mx-auto w-[280px]">
        <div className="overflow-hidden rounded-[32px] border-[6px] border-gray-900 bg-white shadow-2xl">
          {/* Notch */}
          <div className="relative flex justify-center bg-gray-900 py-1">
            <div className="h-4 w-20 rounded-full bg-gray-800" />
          </div>

          {/* Screen content — scrollable */}
          <div className="h-[520px] overflow-y-auto">
            {/* Cover */}
            <div className="relative h-28">
              {coverPhotoUrl ? (
                <img src={coverPhotoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Name on cover */}
              <div className="absolute bottom-2 left-3 right-3">
                <p className="text-[13px] font-bold leading-tight text-white">
                  {displayName || 'Your Name'}
                </p>
                <p className="text-[9px] text-white/60">
                  {title || 'Your title'}
                  {company ? ` at ${company}` : ''}
                </p>
              </div>
            </div>

            {/* Avatar */}
            <div className="relative mx-3 -mt-5">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-10 w-10 rounded-xl border-2 border-white object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
                  {displayName?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>

            {/* Sections */}
            <div className="mt-2">
              {visibleSections.length === 0 && (
                <div className="px-3 py-6 text-center">
                  <p className="text-[10px] text-gray-400">Add sections to see preview</p>
                </div>
              )}

              {visibleSections.map((section, index) => (
                <div
                  key={section.id}
                  className={`border-t border-gray-100 px-3 py-3 ${index === 0 ? 'mt-1' : ''}`}
                >
                  <PreviewSection section={section} />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-3 py-3 text-center">
              <p className="text-[8px] text-gray-300">KnockCard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section renderers (simplified, no animations) ──────────────────────────

function PreviewSection({ section }: { section: SectionItem }) {
  switch (section.type) {
    case 'about':
      return <PreviewAbout section={section} />
    case 'contact':
      return <PreviewContact section={section} />
    case 'social':
      return <PreviewSocial section={section} />
    case 'gallery':
      return <PreviewGallery section={section} />
    case 'links':
      return <PreviewLinks section={section} />
    default:
      return null
  }
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-1.5 text-[8px] font-bold uppercase tracking-[1.5px] text-gray-900">
      {children}
    </h3>
  )
}

function PreviewAbout({ section }: { section: SectionItem }) {
  const content = section.content as unknown as AboutContent
  const text = content?.text
  if (!text) {
    return null
  }
  return (
    <div>
      <SectionTitle>{section.title ?? 'About'}</SectionTitle>
      <p className="text-[9px] leading-[1.5] text-gray-500 line-clamp-4">{text}</p>
    </div>
  )
}

function PreviewContact({ section }: { section: SectionItem }) {
  const content = section.content as unknown as ContactContent
  const items = content?.items
  if (!items?.length) {
    return null
  }
  return (
    <div>
      <SectionTitle>{section.title ?? 'Information'}</SectionTitle>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 text-gray-500">
              {item.iconUrl ? (
                <img src={item.iconUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <InfoIcon type={item.type} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-medium text-gray-800">
                {item.label || item.type}
              </p>
              <p className="truncate text-[8px] text-gray-400">{item.value || '—'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewSocial({ section }: { section: SectionItem }) {
  const content = section.content as unknown as SocialContent
  const items = content?.items
  if (!items?.length) {
    return null
  }
  return (
    <div>
      <SectionTitle>{section.title ?? 'Social'}</SectionTitle>
      <div className="grid grid-cols-4 gap-1">
        {items.slice(0, 8).map((item, i) => {
          const config = getPlatform(item.platform)
          const label = item.label ?? config?.name ?? item.platform
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-0.5 rounded-lg bg-gray-50 px-1 py-1.5"
            >
              <div className="h-3 w-3 rounded-sm bg-gray-300" />
              <span className="text-center text-[7px] text-gray-500 line-clamp-1">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PreviewGallery({ section }: { section: SectionItem }) {
  const content = section.content as unknown as GalleryContent
  const images = content?.images
  if (!images?.length) {
    return null
  }
  return (
    <div>
      <SectionTitle>{section.title ?? 'Gallery'}</SectionTitle>
      <div className="grid grid-cols-2 gap-1">
        {images.slice(0, 4).map((url, i) => (
          <img key={i} src={url} alt="" className="aspect-square w-full rounded-md object-cover" />
        ))}
      </div>
    </div>
  )
}

function PreviewLinks({ section }: { section: SectionItem }) {
  const content = section.content as unknown as LinksContent
  const items = content?.items
  if (!items?.length) {
    return null
  }
  return (
    <div>
      <SectionTitle>{section.title ?? 'Links'}</SectionTitle>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1.5">
            <span className="flex-1 truncate text-[9px] font-medium text-gray-800">
              {item.label || 'Untitled'}
            </span>
            <svg
              width={8}
              height={8}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ccc"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}
