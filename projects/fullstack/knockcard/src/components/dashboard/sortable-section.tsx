'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo, useState } from 'react'

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
import Input from '@/components/ui/input'
import { cn } from '@/lib/utils'

const SECTION_META: Record<string, { icon: string; color: string }> = {
  about: {
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0',
    color: 'text-blue-500',
  },
  contact: {
    icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
    color: 'text-emerald-500',
  },
  social: {
    icon: 'M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z',
    color: 'text-violet-500',
  },
  gallery: {
    icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18h15A2.25 2.25 0 0019.5 15.75V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v9.75A2.25 2.25 0 006.75 18z',
    color: 'text-amber-500',
  },
  links: {
    icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.686-3.374l4.5-4.5a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
    color: 'text-rose-500',
  },
}

interface SectionItem {
  id: string
  type: string
  title: string | null
  content: JsonValue
  sortOrder: number
  isVisible: boolean
}

interface SortableSectionProps {
  section: SectionItem
  onToggleVisibility: () => void
  onDelete: () => void
  onUpdate: (content: JsonValue) => void
}

function getSectionPreview(section: SectionItem): string {
  const content = section.content as Record<string, unknown> | null
  if (!content) {
    return 'Empty'
  }

  switch (section.type) {
    case 'about': {
      const text = (content as unknown as AboutContent)?.text
      return text ? (text.length > 60 ? text.slice(0, 60) + '...' : text) : 'No content'
    }
    case 'contact': {
      const items = (content as unknown as ContactContent)?.items
      return items?.length ? `${items.length} item${items.length > 1 ? 's' : ''}` : 'No items'
    }
    case 'social': {
      const items = (content as unknown as SocialContent)?.items
      return items?.length ? `${items.length} link${items.length > 1 ? 's' : ''}` : 'No links'
    }
    case 'gallery': {
      const images = (content as unknown as GalleryContent)?.images
      return images?.length ? `${images.length} image${images.length > 1 ? 's' : ''}` : 'No images'
    }
    case 'links': {
      const items = (content as unknown as LinksContent)?.items
      return items?.length ? `${items.length} link${items.length > 1 ? 's' : ''}` : 'No links'
    }
    default:
      return ''
  }
}

export default function SortableSection({
  section,
  onToggleVisibility,
  onDelete,
  onUpdate,
}: SortableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const meta = SECTION_META[section.type] ?? SECTION_META.links
  const preview = getSectionPreview(section)

  function handleDelete() {
    const confirmed = window.confirm('Delete this section?')
    if (confirmed) {
      onDelete()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border border-gray-200 bg-white transition-shadow',
        isDragging && 'z-10 shadow-lg',
        !section.isVisible && 'opacity-50'
      )}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Drag Handle */}
        <button
          className="cursor-grab touch-none rounded p-1 text-gray-300 transition-colors hover:text-gray-500 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>

        {/* Type Icon + Title — clickable to expand */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <svg
            className={cn('h-4 w-4 shrink-0', meta.color)}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
          </svg>
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium text-gray-900">
              {section.title ?? section.type}
            </span>
            {!isExpanded && <span className="ml-2 text-xs text-gray-400">{preview}</span>}
          </div>
          <svg
            className={cn(
              'h-4 w-4 shrink-0 text-gray-400 transition-transform',
              isExpanded && 'rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Visibility Toggle */}
        <button
          onClick={onToggleVisibility}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title={section.isVisible ? 'Hide' : 'Show'}
        >
          {section.isVisible ? (
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
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ) : (
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
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          )}
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
          title="Delete"
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
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>

      {/* Inline editor — accordion body */}
      {isExpanded && (
        <div className="min-w-0 overflow-hidden border-t border-gray-100 px-3 py-4 sm:px-4">
          <InlineEditor section={section} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  )
}

// ─── Inline Editor (renders the right editor based on type) ─────────────────

function InlineEditor({
  section,
  onUpdate,
}: {
  section: SectionItem
  onUpdate: (content: JsonValue) => void
}) {
  switch (section.type) {
    case 'about':
      return (
        <AboutInline
          content={section.content as unknown as AboutContent}
          onChange={c => onUpdate(c as unknown as JsonValue)}
        />
      )
    case 'contact':
      return (
        <ContactInline
          content={section.content as unknown as ContactContent}
          onChange={c => onUpdate(c as unknown as JsonValue)}
        />
      )
    case 'social':
      return (
        <SocialInline
          content={section.content as unknown as SocialContent}
          onChange={c => onUpdate(c as unknown as JsonValue)}
        />
      )
    case 'gallery':
      return (
        <GalleryInline
          content={section.content as unknown as GalleryContent}
          onChange={c => onUpdate(c as unknown as JsonValue)}
        />
      )
    case 'links':
      return (
        <LinksInline
          content={section.content as unknown as LinksContent}
          onChange={c => onUpdate(c as unknown as JsonValue)}
        />
      )
    default:
      return <p className="text-sm text-gray-500">Unknown section type</p>
  }
}

// ─── About ──────────────────────────────────────────────────────────────────

function AboutInline({
  content,
  onChange,
}: {
  content: AboutContent
  onChange: (c: AboutContent) => void
}) {
  return (
    <textarea
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      rows={4}
      value={content?.text ?? ''}
      onChange={e => onChange({ text: e.target.value })}
      placeholder="Write something about yourself..."
    />
  )
}

// ─── Contact ────────────────────────────────────────────────────────────────

const INFO_TYPES: {
  value: ContactItemType
  label: string
  valuePlaceholder?: string
  subtitlePlaceholder?: string
}[] = [
  { value: 'phone', label: 'Phone', valuePlaceholder: 'Phone number' },
  { value: 'email', label: 'Email', valuePlaceholder: 'Email address' },
  { value: 'website', label: 'Website', valuePlaceholder: 'URL' },
  { value: 'location', label: 'Location', valuePlaceholder: 'City, Country' },
  { value: 'address', label: 'Address', valuePlaceholder: 'Full address' },
  { value: 'birthday', label: 'Birthday', valuePlaceholder: 'Date of birth' },
  { value: 'fax', label: 'Fax', valuePlaceholder: 'Fax number' },
  {
    value: 'company',
    label: 'Company',
    valuePlaceholder: 'Company name',
    subtitlePlaceholder: 'Your role or description',
  },
  {
    value: 'department',
    label: 'Department',
    valuePlaceholder: 'Department name',
    subtitlePlaceholder: 'Team or division',
  },
  {
    value: 'job_title',
    label: 'Job Title',
    valuePlaceholder: 'Position',
    subtitlePlaceholder: 'Company or description',
  },
  { value: 'pronouns', label: 'Pronouns', valuePlaceholder: 'e.g. she/her' },
  { value: 'languages', label: 'Languages', valuePlaceholder: 'e.g. Vietnamese, English' },
  { value: 'timezone', label: 'Timezone', valuePlaceholder: 'e.g. GMT+7' },
  {
    value: 'education',
    label: 'Education',
    valuePlaceholder: 'School or university',
    subtitlePlaceholder: 'Degree, major, year...',
  },
  {
    value: 'hours',
    label: 'Office Hours',
    valuePlaceholder: 'e.g. Mon-Fri 9AM-5PM',
  },
  {
    value: 'note',
    label: 'Note',
    valuePlaceholder: 'Note content',
    subtitlePlaceholder: 'Additional details',
  },
  {
    value: 'custom',
    label: 'Custom',
    valuePlaceholder: 'Value',
    subtitlePlaceholder: 'Additional details',
  },
]

interface ContactItemWithId extends ContactItem {
  _id: string
}

function ensureIds(items: ContactItem[]): ContactItemWithId[] {
  return items.map((item, i) => ({
    ...item,
    _id: (item as ContactItemWithId)._id ?? `info-${i}-${Date.now()}`,
  }))
}

function stripIds(items: ContactItemWithId[]): ContactItem[] {
  return items.map(({ _id, ...rest }) => rest)
}

function ContactInline({
  content,
  onChange,
}: {
  content: ContactContent
  onChange: (c: ContactContent) => void
}) {
  const [items, setItems] = useState<ContactItemWithId[]>(() => ensureIds(content?.items ?? []))
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))
  const itemIds = useMemo(() => items.map(i => i._id), [items])

  function commit(updated: ContactItemWithId[]) {
    setItems(updated)
    onChange({ items: stripIds(updated) })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }
    const oldIndex = items.findIndex(i => i._id === active.id)
    const newIndex = items.findIndex(i => i._id === over.id)
    commit(arrayMove(items, oldIndex, newIndex))
  }

  function addItem() {
    const typeLabel = INFO_TYPES.find(t => t.value === 'phone')?.label ?? 'Phone'
    commit([
      ...items,
      { _id: `info-new-${Date.now()}`, type: 'phone', label: typeLabel, value: '' },
    ])
  }

  function updateItem(id: string, updates: Partial<ContactItem>) {
    commit(items.map(item => (item._id === id ? { ...item, ...updates } : item)))
  }

  function removeItem(id: string) {
    commit(items.filter(item => item._id !== id))
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map(item => (
            <DraggableInfoItem
              key={item._id}
              item={item}
              onUpdate={updates => updateItem(item._id, updates)}
              onRemove={() => removeItem(item._id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button variant="ghost" size="sm" onClick={addItem}>
        + Add Item
      </Button>
    </div>
  )
}

function DraggableInfoItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: ContactItemWithId
  onUpdate: (updates: Partial<ContactItem>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const typeConfig = INFO_TYPES.find(t => t.value === item.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex gap-2 rounded-lg border border-gray-100 bg-gray-50/50 p-2',
        isDragging && 'z-10 shadow-md'
      )}
    >
      <button
        className="mt-2 shrink-0 cursor-grab touch-none rounded p-0.5 text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
          <select
            className="min-w-0 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm sm:w-36 sm:shrink-0"
            value={item.type}
            onChange={e => {
              const newType = e.target.value as ContactItemType
              const newLabel =
                newType === 'custom'
                  ? ''
                  : (INFO_TYPES.find(t => t.value === newType)?.label ?? newType)
              onUpdate({ type: newType, label: newLabel })
            }}
          >
            {INFO_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {item.type === 'custom' && (
            <div className="sm:w-32 sm:shrink-0">
              <Input
                placeholder="Label"
                value={item.label}
                onChange={e => onUpdate({ label: e.target.value })}
              />
            </div>
          )}
          <div className="sm:flex-1">
            <Input
              placeholder={typeConfig?.valuePlaceholder ?? 'Value'}
              value={item.value}
              onChange={e => onUpdate({ value: e.target.value })}
            />
          </div>
        </div>
        {typeConfig?.subtitlePlaceholder && (
          <Input
            placeholder={typeConfig.subtitlePlaceholder}
            value={item.subtitle ?? ''}
            onChange={e => onUpdate({ subtitle: e.target.value || undefined })}
          />
        )}
      </div>

      <button
        onClick={onRemove}
        className="mt-2 shrink-0 rounded p-1 text-gray-400 transition-colors hover:text-red-500"
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
  )
}

// ─── Social ─────────────────────────────────────────────────────────────────

function SocialInline({
  content,
  onChange,
}: {
  content: SocialContent
  onChange: (c: SocialContent) => void
}) {
  const items = content?.items ?? []

  function handleChange(updatedItems: SocialItem[]) {
    onChange({ items: updatedItems })
  }

  return <SocialLinkPicker items={items} onChange={handleChange} />
}

// ─── Gallery ────────────────────────────────────────────────────────────────

function GalleryInline({
  content,
  onChange,
}: {
  content: GalleryContent
  onChange: (c: GalleryContent) => void
}) {
  const images = content?.images ?? []

  function addImage(url: string | null) {
    if (url) {
      onChange({ images: [...images, url] })
    }
  }

  function removeImage(index: number) {
    onChange({ images: images.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
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
      )}
      <ImageUpload value={null} onChange={addImage} />
    </div>
  )
}

// ─── Links ──────────────────────────────────────────────────────────────────

function LinksInline({
  content,
  onChange,
}: {
  content: LinksContent
  onChange: (c: LinksContent) => void
}) {
  const items = content?.items ?? []

  function addItem() {
    onChange({ items: [...items, { label: '', url: '' }] })
  }

  function updateItem(index: number, updates: Partial<LinkItem>) {
    onChange({
      items: items.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    })
  }

  function removeItem(index: number) {
    onChange({ items: items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border border-gray-100 bg-gray-50/50 p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Link {index + 1}</span>
            <button
              onClick={() => removeItem(index)}
              className="rounded p-1 text-gray-400 transition-colors hover:text-red-500"
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
          <div className="mt-1.5 space-y-2">
            <Input
              placeholder="Label"
              value={item.label}
              onChange={e => updateItem(index, { label: e.target.value })}
            />
            <Input
              placeholder="https://..."
              value={item.url}
              onChange={e => updateItem(index, { url: e.target.value })}
            />
          </div>
        </div>
      ))}

      <Button variant="ghost" size="sm" onClick={addItem}>
        + Add Link
      </Button>
    </div>
  )
}
