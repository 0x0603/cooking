import { unstable_cache } from 'next/cache'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import type { CardData, SectionData } from '@/types'
import type { Metadata } from 'next'

import { ProfilePage } from '@/components/profile/profile-page'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: { slug: string }
}

const getCardBySlug = unstable_cache(
  async (slug: string): Promise<CardData | null> => {
    const card = await prisma.card.findUnique({
      where: { slug },
      include: {
        cardSections: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    })

    if (!card || !card.isPublished) {
      return null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sections: SectionData[] = card.cardSections.map((s: any) => ({
      id: s.id,
      type: s.type as SectionData['type'],
      title: s.title,
      content: s.content,
      sortOrder: s.sortOrder,
      isVisible: s.isVisible,
    }))

    return {
      id: card.id,
      slug: card.slug,
      displayName: card.displayName,
      title: card.title,
      company: card.company,
      bio: card.bio,
      coverPhotoUrl: card.coverPhotoUrl,
      avatarUrl: card.avatarUrl,
      theme: card.theme as CardData['theme'],
      themeConfig: card.themeConfig,
      isPublished: card.isPublished,
      sections,
      user: {
        name: card.user.name,
        avatarUrl: card.user.avatarUrl,
      },
    }
  },
  ['card-by-slug'],
  { revalidate: 60 }
)

async function trackView(cardId: string): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        cardId,
        eventType: 'view',
      },
    })
  } catch {
    // Silently fail — don't block page render for analytics
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const card = await getCardBySlug(params.slug)

  if (!card) {
    return { title: 'Not Found' }
  }

  const description =
    card.bio ?? `${card.displayName} — ${card.title}${card.company ? ` at ${card.company}` : ''}`

  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  return {
    title: `${card.displayName} | KnockCard`,
    description,
    manifest: `/${card.slug}/manifest.json`,
    openGraph: {
      title: card.displayName,
      description,
      type: 'profile',
      url: `${baseUrl}/${card.slug}`,
      images: card.coverPhotoUrl ? [{ url: card.coverPhotoUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: card.displayName,
      description,
    },
  }
}

export default async function SlugPage({ params }: PageProps) {
  const card = await getCardBySlug(params.slug)

  if (!card) {
    notFound()
  }

  // Fire-and-forget — don't block page render
  trackView(card.id)

  return <ProfilePage card={card} />
}
