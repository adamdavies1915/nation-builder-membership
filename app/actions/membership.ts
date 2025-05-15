"use server"

import { z } from "zod"

// Environment variables validation
const requiredEnvVars = ["NATION_BUILDER_API_TOKEN"]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

const API_TOKEN = process.env.NATION_BUILDER_API_TOKEN!
const NATION_SLUG = "bikeeasy"
const BASE_URL = `https://${NATION_SLUG}.nationbuilder.com/api/v2`

export async function checkMembership(email: string) {
  try {
    // Validate email
    const emailSchema = z.string().email()
    emailSchema.parse(email)

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
      return {
        found: true,
        isMember: true,
        name: fullName,
        membershipStatus: "active",
        membershipType: activeMembership.attributes.membership_type_id,
        membershipExpires: activeMembership.attributes.expires_on,
        membershipStarted: activeMembership.attributes.started_at
      }
    } else {
      // No active membership found
      return {
        found: true,
        isMember: false,
        name: fullName,
        membershipStatus: "inactive",
        membershipExpires: null
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