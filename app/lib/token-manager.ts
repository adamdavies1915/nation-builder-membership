// app/lib/token-manager.ts
import Database from 'better-sqlite3'
import path from 'path'
import { NATIONBUILDER_CONFIG } from './oauth-config'

// Initialize SQLite database with persistent storage
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'tokens.db')

// Ensure the database directory exists and initialize
function getDb(): Database.Database {
  const fs = require('fs')
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const db = new Database(dbPath)

  // Create tokens table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `)

  return db
}

interface TokenData {
  access_token: string
  refresh_token: string
  expires_at: number
}

export async function getAccessToken(): Promise<string> {
  const db = getDb()

  try {
    // Try to get token from SQLite
    const row = db.prepare('SELECT access_token, refresh_token, expires_at FROM tokens WHERE id = 1').get() as TokenData | undefined

    // If no token, return error - need to authenticate
    if (!row) {
      throw new Error('No token available')
    }

    const tokenData: TokenData = {
      access_token: row.access_token,
      refresh_token: row.refresh_token,
      expires_at: row.expires_at,
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
  } finally {
    db.close()
  }
}

async function refreshToken(refreshTokenValue: string): Promise<TokenData> {
  const response = await fetch(NATIONBUILDER_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshTokenValue,
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
    refresh_token: data.refresh_token || refreshTokenValue, // Use new refresh token if provided, otherwise keep the old one
    expires_at: Date.now() + data.expires_in * 1000,
  }

  // Store the new token
  const db = getDb()
  try {
    const stmt = db.prepare(`
      INSERT INTO tokens (id, access_token, refresh_token, expires_at)
      VALUES (1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        expires_at = excluded.expires_at
    `)
    stmt.run(tokenData.access_token, tokenData.refresh_token, tokenData.expires_at)
  } finally {
    db.close()
  }

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
  const db = getDb()
  try {
    const stmt = db.prepare(`
      INSERT INTO tokens (id, access_token, refresh_token, expires_at)
      VALUES (1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        expires_at = excluded.expires_at
    `)
    stmt.run(tokenData.access_token, tokenData.refresh_token, tokenData.expires_at)
  } finally {
    db.close()
  }

  return tokenData
}

// Utility function to check if we have a valid token (for connection status)
export async function hasValidToken(): Promise<boolean> {
  const db = getDb()
  try {
    const row = db.prepare('SELECT expires_at FROM tokens WHERE id = 1').get() as { expires_at: number } | undefined
    return !!row && row.expires_at > Date.now()
  } catch (error) {
    console.error('Error checking token validity:', error)
    return false
  } finally {
    db.close()
  }
}

// Utility function to clear token (for admin logout/disconnect)
export async function clearToken(): Promise<void> {
  const db = getDb()
  try {
    db.prepare('DELETE FROM tokens WHERE id = 1').run()
  } finally {
    db.close()
  }
}
