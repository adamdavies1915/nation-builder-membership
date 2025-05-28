import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Remove all variations of X-Frame-Options
  response.headers.delete('X-Frame-Options')
  response.headers.delete('x-frame-options')
  
  // Don't set X-Frame-Options at all, or use ALLOWALL if needed
  // response.headers.set('X-Frame-Options', 'ALLOWALL')
  
  // Set Content-Security-Policy to explicitly allow bikeeasy.org
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://bikeeasy.org https://www.bikeeasy.org https://*.bikeeasy.org http://bikeeasy.org http://www.bikeeasy.org"
  )
  
  // Handle CORS for cross-origin iframe communication
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Check if request is coming from bikeeasy.org
  if ((origin && origin.includes('bikeeasy.org')) || 
      (referer && referer.includes('bikeeasy.org'))) {
    response.headers.set('Access-Control-Allow-Origin', origin || 'https://bikeeasy.org')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  }
  
  return response
}

export const config = {
  matcher: '/:path*',
}