import { NextRequest, NextResponse } from 'next/server'
import { storeInitialToken } from '../../../lib/token-manager'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  
  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }
  
  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
  }
  
  try {
    await storeInitialToken(code)
    return NextResponse.redirect(new URL('/admin/success', request.url))
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/admin/error', request.url))
  }
}