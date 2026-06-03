import { NextRequest, NextResponse } from 'next/server'
import { storeInitialToken } from '../../../lib/token-manager'
import { NATIONBUILDER_CONFIG } from '../../../lib/oauth-config'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Build redirects from the public app origin (derived from the configured
  // OAuth redirect URI) rather than request.url. Behind a reverse proxy,
  // request.url resolves to the container's internal host (e.g. 0.0.0.0:3000).
  const appOrigin = new URL(NATIONBUILDER_CONFIG.redirectUri).origin

  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
  }

  try {
    await storeInitialToken(code)
    return NextResponse.redirect(new URL('/admin/success', appOrigin))
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/admin/error', appOrigin))
  }
}