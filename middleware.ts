import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.delete('X-Frame-Options')
  
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://bikeeasy.org https://www.bikeeasy.org"
  )
  
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}