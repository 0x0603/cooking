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
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'

import type { JsonValue } from '@prisma/client/runtime/library'

import SortableSection from '@/components/dashboard/sortable-section'

interface SectionItem {
  id: string
  type: string
  title: string | null
  content: JsonValue
  sortOrder: number
  isVisible: boolean
}

interface SectionListProps {
  cardId: string
  sections: SectionItem[]
  onSectionsChange: (sections: SectionItem[]) => void
  onSectionContentChange: (sectionId: string) => void
}

export default function SectionList({
  cardId,
  sections,
  onSectionsChange,
  onSectionContentChange,
}: SectionListProps) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sections.findIndex(s => s.id === active.id)
    const newIndex = sections.findIndex(s => s.id === over.id)

    const reordered = arrayMove(sections, oldIndex, newIndex).map((section, index) => ({
      ...section,
      sortOrder: index,
    }))

    onSectionsChange(reordered)

    await fetch(`/api/cards/${cardId}/sections`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sections: reordered.map(s => ({
          id: s.id,
          sortOrder: s.sortOrder,
        })),
      }),
    })
  }

  async function handleToggleVisibility(sectionId: string) {
    const updated = sections.map(s => (s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s))
    onSectionsChange(updated)

    const section = updated.find(s => s.id === sectionId)

    await fetch(`/api/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: section?.isVisible }),
    })
  }

  async function handleDeleteSection(sectionId: string) {
    const updated = sections.filter(s => s.id !== sectionId)
    onSectionsChange(updated)

    await fetch(`/api/sections/${sectionId}`, { method: 'DELETE' })
  }

  function handleSectionUpdate(sectionId: string, content: JsonValue) {
    const updated = sections.map(s => (s.id === sectionId ? { ...s, content } : s))
    onSectionsChange(updated)
    onSectionContentChange(sectionId)
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
        <svg
          className="mb-3 h-10 w-10 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <p className="text-sm font-medium text-gray-500">No sections yet</p>
        <p className="mt-1 text-xs text-gray-400">
          Click &quot;Add Section&quot; above to get started
        </p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sections.map(section => (
            <SortableSection
              key={section.id}
              section={section}
              onToggleVisibility={() => handleToggleVisibility(section.id)}
              onDelete={() => handleDeleteSection(section.id)}
              onUpdate={content => handleSectionUpdate(section.id, content)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
