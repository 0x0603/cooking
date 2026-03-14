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
}

export default function SectionList({ cardId, sections, onSectionsChange }: SectionListProps) {
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
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-gray-500">No sections yet. Add one to get started.</p>
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
