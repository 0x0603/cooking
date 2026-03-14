import { prisma } from '@/lib/prisma'

type EventType = 'view' | 'save_contact' | 'exchange'

export async function trackEvent(
  cardId: string,
  eventType: EventType,
  request: Request
): Promise<void> {
  const ip = extractIp(request)
  const userAgent = request.headers.get('user-agent') ?? ''

  await prisma.analyticsEvent.create({
    data: {
      cardId,
      eventType,
      visitorIp: ip,
      userAgent,
    },
  })
}

function extractIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')

  if (realIp) {
    return realIp
  }

  return '0.0.0.0'
}
