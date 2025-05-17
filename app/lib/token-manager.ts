// app/lib/token-manager.ts
import { Redis } from '@upstash/redis'
import { NATIONBUILDER_CONFIG } from './oauth-config'

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

interface TokenData {
  access_token: string
  refresh_token: string
  expires_at: number
}

export async function getAccessToken(): Promise<string> {
  // Try to get token from Redis
  const tokenData = await redis.get<TokenData>('nationbuilder_token')
  
  // If no token or token is expired, return null - need to authenticate
  if (!tokenData) {
    throw new Error('No token available')
  }
  
  // If token is about to expire (within 5 minutes), refresh it
  if (tokenData.expires_at < Date.now() + 5 * 60 * 1000) {
    try {
      const newTokenData = await refreshToken(tokenData.refresh_token)
      return newTokenData.access_token
    } catch (error) {
      console.error('Failed to refresh token:', error)
      throw new Error('Authentication needed')
    }
  }
  
  // Return existing valid token
  return tokenData.access_token
}

async function refreshToken(refreshToken: string): Promise<TokenData> {
  const response = await fetch(NATIONBUILDER_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: NATIONBUILDER_CONFIG.clientId,
      client_secret: NATIONBUILDER_CONFIG.clientSecret,
      redirect_uri: NATIONBUILDER_CONFIG.redirectUri,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    console.error('Token refresh failed:', response.status, errorText)
    throw new Error(`Token refresh failed: ${response.status}`)
  }

  const data = await response.json()
  
  // Calculate expiration time (current time + expires_in seconds)
  const tokenData: TokenData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken, // Use new refresh token if provided, otherwise keep the old one
    expires_at: Date.now() + data.expires_in * 1000,
  }
  
  // Store the new token
  await redis.set('nationbuilder_token', tokenData)
  
  return tokenData
}

export async function storeInitialToken(code: string): Promise<TokenData> {
  const response = await fetch(NATIONBUILDER_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: NATIONBUILDER_CONFIG.clientId,
      client_secret: NATIONBUILDER_CONFIG.clientSecret,
      redirect_uri: NATIONBUILDER_CONFIG.redirectUri,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    console.error('Token retrieval failed:', response.status, errorText)
    throw new Error(`Token retrieval failed: ${response.status}`)
  }

  const data = await response.json()
  
  const tokenData: TokenData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }
  
  // Store the token
  await redis.set('nationbuilder_token', tokenData)
  
  return tokenData
}

// Utility function to check if we have a valid token (for connection status)
export async function hasValidToken(): Promise<boolean> {
  try {
    const tokenData = await redis.get<TokenData>('nationbuilder_token')
    return !!tokenData && tokenData.expires_at > Date.now()
  } catch (error) {
    console.error('Error checking token validity:', error)
    return false
  }
}

// Utility function to clear token (for admin logout/disconnect)
export async function clearToken(): Promise<void> {
  await redis.del('nationbuilder_token')
}