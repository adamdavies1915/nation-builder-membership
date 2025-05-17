// app/api/auth/route.ts
import { NextResponse } from 'next/server'
import { NATIONBUILDER_CONFIG } from '@/app/lib/oauth-config'

export async function GET() {
  const authUrl = `${NATIONBUILDER_CONFIG.authorizationUrl}?client_id=${NATIONBUILDER_CONFIG.clientId}&redirect_uri=${encodeURIComponent(NATIONBUILDER_CONFIG.redirectUri)}&response_type=code&scope=${encodeURIComponent(NATIONBUILDER_CONFIG.scope)}`
  
  return NextResponse.redirect(authUrl)
}