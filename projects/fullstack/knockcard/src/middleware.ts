import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''

  if (host.includes('knockcard.vercel.app')) {
    const url = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      'https://www.knockcard.xyz'
    )
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}
