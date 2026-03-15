import type { JsonValue } from '@prisma/client/runtime/library'

// ─── Section Content Types ──────────────────────────────────────────────────

export type ContactItemType =
  | 'phone'
  | 'email'
  | 'website'
  | 'location'
  | 'address'
  | 'birthday'
  | 'fax'
  | 'company'
  | 'department'
  | 'job_title'
  | 'pronouns'
  | 'languages'
  | 'timezone'
  | 'education'
  | 'hours'
  | 'note'
  | 'custom'

export interface ContactItem {
  type: ContactItemType
  label: string
  value: string
  subtitle?: string
}

export interface SocialItem {
  platform: string
  url: string
  label?: string
  iconUrl?: string
}

export interface LinkItem {
  label: string
  url: string
  icon?: string
}

export interface AboutContent {
  text: string
}

export interface ContactContent {
  items: ContactItem[]
}

export interface SocialContent {
  items: SocialItem[]
}

export interface GalleryContent {
  images: string[]
  columns?: number
}

export interface LinksContent {
  items: LinkItem[]
}

// ─── Section & Card Types ───────────────────────────────────────────────────

export type SectionType = 'about' | 'contact' | 'social' | 'gallery' | 'links'

export interface SectionData {
  id: string
  type: SectionType
  title: string | null
  content: JsonValue
  sortOrder: number
  isVisible: boolean
}

export type CardTheme = 'dark' | 'light' | 'custom'

export interface CardData {
  id: string
  slug: string
  displayName: string
  title: string
  company: string | null
  bio: string | null
  coverPhotoUrl: string | null
  avatarUrl: string | null
  theme: CardTheme
  themeConfig: JsonValue
  isPublished: boolean
  sections: SectionData[]
  user: {
    name: string | null
    avatarUrl: string | null
  }
}
