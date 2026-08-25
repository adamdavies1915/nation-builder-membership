"use server"

import { z } from "zod"
import { getAccessToken } from "../lib/token-manager"

// Membership tokens are obtained via the OAuth flow (see token-manager) and
// stored in SQLite — no static API token env var is required here.

const NATION_SLUG = "bikeeasy"
const BASE_URL = `https://${NATION_SLUG}.nationbuilder.com/api/v2`

// Membership types rarely change, so cache the id -> name lookup between requests
const MEMBERSHIP_TYPE_CACHE_TTL = 60 * 60 * 1000
let membershipTypeCache: { names: Map<string, string>; fetchedAt: number } | null = null

async function getMembershipTypeName(
  typeId: string | number | null | undefined,
  apiToken: string,
): Promise<string | null> {
  if (typeId === null || typeId === undefined) {
    return null
  }

  const isCacheStale =
    !membershipTypeCache || Date.now() - membershipTypeCache.fetchedAt > MEMBERSHIP_TYPE_CACHE_TTL

  if (isCacheStale) {
    try {
      const typesResponse = await fetch(`${BASE_URL}/membership_types`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        cache: "no-store",
      })

      if (!typesResponse.ok) {
        throw new Error(`${typesResponse.status} ${typesResponse.statusText}`)
      }

      const typesData = await typesResponse.json()
      const names = new Map<string, string>()

      for (const membershipType of typesData.data ?? []) {
        const name = membershipType.attributes?.name
        if (name) {
          names.set(String(membershipType.id), name)
        }
      }

      membershipTypeCache = { names, fetchedAt: Date.now() }
    } catch (error) {
      // A missing type name shouldn't fail the whole membership check
      console.error("Failed to load membership types:", error)
      return null
    }
  }

  return membershipTypeCache?.names.get(String(typeId)) ?? null
}

export async function checkMembership(email: string) {
  try {
    // Validate email
    const emailSchema = z.string().email()
    emailSchema.parse(email)

    // Get current access token
    const API_TOKEN = await getAccessToken()

    // First, search for the signup by email
    const signupResponse = await fetch(
      `${BASE_URL}/signups?filter[with_email_address][eq]=${encodeURIComponent(email)}`, 
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        cache: "no-store",
      }
    )

    if (!signupResponse.ok) {
      if (signupResponse.status === 404) {
        return { found: false }
      }

      const errorData = await signupResponse.json().catch(() => ({}))
      console.error("Nation Builder API error:", errorData)
      return {
        error: `API error: ${signupResponse.status} ${signupResponse.statusText}`,
      }
    }

    const signupData = await signupResponse.json()

    // Check if we found a signup
    if (!signupData.data || signupData.data.length === 0) {
      return { found: false }
    }

    const signup = signupData.data[0]
    const signupId = signup.id

    // Extract email subscription status from signup attributes
    const emailOptIn = signup.attributes.email_opt_in ?? false
    const mobileOptIn = signup.attributes.mobile_opt_in ?? false

    // Now fetch membership data for this signup
    const membershipResponse = await fetch(
      `${BASE_URL}/memberships?filter[signup_id]=${signupId}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        cache: "no-store",
      }
    )

    if (!membershipResponse.ok) {
      const errorData = await membershipResponse.json().catch(() => ({}))
      console.error("Nation Builder API error:", errorData)
      return {
        error: `API error: ${membershipResponse.status} ${membershipResponse.statusText}`,
      }
    }

    const membershipData = await membershipResponse.json()
    
    // Find active membership if it exists
    const activeMembership = membershipData.data.find(m => m.attributes.status === "active")
    
    // Get name from signup data
    const firstName = signup.attributes.first_name || ""
    const lastName = signup.attributes.last_name || ""
    const fullName = firstName + (lastName ? ` ${lastName}` : "")

    if (activeMembership) {
      const membershipTypeId = activeMembership.attributes.membership_type_id
      // Some nations expose the type name directly on the membership; fall back to a lookup
      const membershipType =
        activeMembership.attributes.name ||
        (await getMembershipTypeName(membershipTypeId, API_TOKEN))

      return {
        found: true,
        isMember: true,
        name: fullName,
        membershipStatus: "active",
        membershipType: membershipType,
        membershipTypeId: membershipTypeId,
        membershipExpires: activeMembership.attributes.expires_on,
        membershipStarted: activeMembership.attributes.started_at,
        // Email subscription status
        emailOptIn: emailOptIn,
        mobileOptIn: mobileOptIn,
      }
    } else {
      // No active membership found
      return {
        found: true,
        isMember: false,
        name: fullName,
        membershipStatus: "inactive",
        membershipExpires: null,
        // Email subscription status
        emailOptIn: emailOptIn,
        mobileOptIn: mobileOptIn,
      }
    }

  } catch (error) {
    console.error("Error checking membership:", error)
    if (error instanceof z.ZodError) {
      return { error: "Please provide a valid email address" }
    }
    return { error: "Failed to check membership status. Please try again later." }
  }
}