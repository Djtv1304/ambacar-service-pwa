"use client"

// This file is deprecated and replaced by the new JWT auth system
// All auth functionality is now handled by:
// - /lib/auth/actions.ts (Server Actions)
// - /lib/auth/api.ts (API calls)
// - /lib/auth/cookies.ts (Cookie management)
// - /components/auth/auth-provider.tsx (Client state)

// Keeping this file for backwards compatibility during migration
// TODO: Remove this file once all references are updated

export function getStoredUser() {
  return null
}

export function setStoredUser() {
  // No-op
}
