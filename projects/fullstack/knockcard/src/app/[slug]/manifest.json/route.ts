import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const card = await prisma.card.findUnique({
    where: { slug: params.slug },
    select: { displayName: true, slug: true, title: true },
  })

  if (!card) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const manifest = {
    name: card.displayName,
    short_name: card.displayName,
    description: card.title || 'Digital business card',
    start_url: `/${card.slug}`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0a0a0a',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  })
}
