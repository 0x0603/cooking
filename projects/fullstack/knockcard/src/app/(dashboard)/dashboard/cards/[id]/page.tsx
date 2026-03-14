import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'

import CardEditorShell from '@/components/dashboard/card-editor-shell'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: { id: string }
}

export default async function CardEditorPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  const card = await prisma.card.findFirst({
    where: {
      id: params.id,
      userId: session!.user!.id,
    },
    include: {
      cardSections: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!card) {
    notFound()
  }

  const initialData = {
    id: card.id,
    slug: card.slug,
    displayName: card.displayName,
    title: card.title,
    company: card.company,
    bio: card.bio,
    coverPhotoUrl: card.coverPhotoUrl,
    avatarUrl: card.avatarUrl,
    isPublished: card.isPublished,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sections: card.cardSections.map((s: any) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      content: s.content,
      sortOrder: s.sortOrder,
      isVisible: s.isVisible,
    })),
  }

  return <CardEditorShell initialData={initialData} />
}
