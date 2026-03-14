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
    <div className="space-y-6">
      {/* Platform Grid by Category */}
      {Object.entries(PLATFORM_CATEGORIES).map(([category, platformIds]) => (
        <div key={category}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {category}
          </h4>
          <div className="flex flex-wrap gap-2">
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
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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

      {/* URL Inputs for Enabled Platforms */}
      {items.length > 0 && (
        <div className="space-y-3 border-t border-gray-200 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">URLs</h4>
          {items.map(item => (
            <div key={item.platform} className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-sm font-medium text-gray-700">
                {item.label ?? item.platform}
              </span>
              <Input
                placeholder="Enter URL"
                value={item.url}
                onChange={e => updateUrl(item.platform, e.target.value)}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      )}

      {/* Custom Link */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Custom Link
        </h4>
        <div className="flex items-end gap-2">
          <Input
            placeholder="Label"
            value={customLabel}
            onChange={e => setCustomLabel(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="https://..."
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            className="flex-1"
          />
          <button
            onClick={addCustomLink}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
