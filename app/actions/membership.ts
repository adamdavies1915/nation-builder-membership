"use server"

import { z } from "zod"

// Environment variables validation
const requiredEnvVars = ["NATION_BUILDER_API_TOKEN"]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Update the comment for clarity about the specific Nation Builder instance
const API_TOKEN = process.env.NATION_BUILDER_API_TOKEN!
const NATION_SLUG = "bikeeasy" // Hardcoded slug for Bike Easy
const BASE_URL = `https://${NATION_SLUG}.nationbuilder.com/api/v1` // Will resolve to https://bikeeasy.nationbuilder.com/api/v1

export async function checkMembership(email: string) {
  try {
    // Validate email
    const emailSchema = z.string().email()
    emailSchema.parse(email)

    // First, search for the person by email
    const personResponse = await fetch(`${BASE_URL}/people/match?email=${encodeURIComponent(email)}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!personResponse.ok) {
      if (personResponse.status === 404) {
        return { found: false }
      }

      const errorData = await personResponse.json().catch(() => ({}))
      console.error("Nation Builder API error:", errorData)
      return {
        error: `API error: ${personResponse.status} ${personResponse.statusText}`,
      }
    }

    const personData = await personResponse.json()

    if (!personData.person) {
      return { found: false }
    }

    const person = personData.person

    // Check if the person has an active membership
    // This depends on how memberships are tracked in your Nation Builder instance
    // Common approaches include checking tags, membership_level_name, or custom fields

    const isMember = Boolean(
      person.tags?.includes("member") || person.membership_level_name || person.membership_status === "active",
    )

    // Format expiration date if available
    let membershipExpires = null
    if (person.membership_expires_on) {
      membershipExpires = new Date(person.membership_expires_on).toLocaleDateString()
    }

    return {
      found: true,
      isMember,
      name: person.first_name,
      membershipStatus: person.membership_status || person.membership_level_name,
      membershipExpires,
    }
  } catch (error) {
    console.error("Error checking membership:", error)
    if (error instanceof z.ZodError) {
      return { error: "Please provide a valid email address" }
    }
    return { error: "Failed to check membership status. Please try again later." }
  }
}
