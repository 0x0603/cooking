'use client'

import { useState } from 'react'

import type { SocialItem } from '@/types'

import Input from '@/components/ui/input'
import { PLATFORMS, PLATFORM_CATEGORIES } from '@/lib/platforms'

interface SocialLinkPickerProps {
  items: SocialItem[]
  onChange: (items: SocialItem[]) => void
}

export default function SocialLinkPicker({ items, onChange }: SocialLinkPickerProps) {
  const [customLabel, setCustomLabel] = useState('')
  const [customUrl, setCustomUrl] = useState('')

  const enabledPlatforms = new Set(items.map(i => i.platform))

  function togglePlatform(platformId: string) {
    if (enabledPlatforms.has(platformId)) {
      onChange(items.filter(i => i.platform !== platformId))
    } else {
      const platform = PLATFORMS[platformId]
      onChange([
        ...items,
        {
          platform: platformId,
          url: platform?.baseUrl ?? '',
          label: platform?.name,
        },
      ])
    }
  }

  function updateUrl(platformId: string, url: string) {
    onChange(items.map(i => (i.platform === platformId ? { ...i, url } : i)))
  }

  function removePlatform(platformId: string) {
    onChange(items.filter(i => i.platform !== platformId))
  }

  function addCustomLink() {
    if (!customLabel.trim() || !customUrl.trim()) {
      return
    }

    onChange([
      ...items,
      {
        platform: `custom-${Date.now()}`,
        url: customUrl,
        label: customLabel,
      },
    ])
    setCustomLabel('')
    setCustomUrl('')
  }

  return (
    <div className="space-y-5">
      {/* Platform toggle grid */}
      <div className="space-y-3">
        {Object.entries(PLATFORM_CATEGORIES).map(([category, platformIds]) => (
          <div key={category}>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              {category}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {platformIds.map(id => {
                const platform = PLATFORMS[id]
                if (!platform) {
                  return null
                }

                const isActive = enabledPlatforms.has(id)

                return (
                  <button
                    key={id}
                    onClick={() => togglePlatform(id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                    style={isActive ? { backgroundColor: platform.color } : undefined}
                  >
                    {platform.name}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Active platforms — URL inputs */}
      {items.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Active Links
          </p>
          {items.map(item => {
            const platform = PLATFORMS[item.platform]
            return (
              <div
                key={item.platform}
                className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/50 p-2"
              >
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                  style={{ backgroundColor: platform?.color ?? '#666' }}
                >
                  {item.label ?? item.platform}
                </span>
                <div className="min-w-0 flex-1">
                  <Input
                    placeholder="Enter URL"
                    value={item.url}
                    onChange={e => updateUrl(item.platform, e.target.value)}
                  />
                </div>
                <button
                  onClick={() => removePlatform(item.platform)}
                  className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:text-red-500"
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
          })}
        </div>
      )}

      {/* Custom Link */}
      <div className="border-t border-gray-100 pt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Custom Link
        </p>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Label"
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="https://..."
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={addCustomLink}
            disabled={!customLabel.trim() || !customUrl.trim()}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-40"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  )
}
