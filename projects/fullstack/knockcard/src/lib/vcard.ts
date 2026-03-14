interface VCardData {
  name: string
  title?: string
  company?: string
  phone?: string
  email?: string
  website?: string
  address?: string
}

export function generateVCard(data: VCardData): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name}`,
    `N:${formatName(data.name)}`,
  ]

  if (data.title) {
    lines.push(`TITLE:${data.title}`)
  }

  if (data.company) {
    lines.push(`ORG:${data.company}`)
  }

  if (data.phone) {
    lines.push(`TEL;TYPE=CELL:${data.phone}`)
  }

  if (data.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${data.email}`)
  }

  if (data.website) {
    lines.push(`URL:${data.website}`)
  }

  if (data.address) {
    lines.push(`ADR;TYPE=WORK:;;${data.address};;;;`)
  }

  lines.push('END:VCARD')

  return lines.join('\r\n')
}

function formatName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)

  if (parts.length === 1) {
    return `${parts[0]};;;;`
  }

  const lastName = parts[parts.length - 1]
  const firstName = parts.slice(0, -1).join(' ')

  return `${lastName};${firstName};;;`
}
