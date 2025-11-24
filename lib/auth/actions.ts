"use server"

// Server Actions for authentication

import { redirect } from "next/navigation"
import { loginApi, getMeApi, refreshTokenApi, registerApi } from "./api"
import { setAccessToken, setRefreshToken, getAccessToken, getRefreshToken, clearTokens } from "./cookies"
import type { User } from "@/lib/types"
import { ApiError } from "@/lib/api/client"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const rememberMe = formData.get("rememberMe") === "true"

  try {
    const response = await loginApi({ email, password })

    // Set tokens in httpOnly cookies
    const accessMaxAge = 15 * 60 // 15 minutes
    const refreshMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // 30 days if remember me, else 7 days

    await setAccessToken(response.access, accessMaxAge)
    await setRefreshToken(response.refresh, refreshMaxAge)

    return { success: true, user: response.user }
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        errors: error.errors,
      }
    }
    return {
      success: false,
      error: "Error de conexión. Por favor, intenta de nuevo.",
    }
  }
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const password_confirm = formData.get("password_confirm") as string
  const first_name = formData.get("first_name") as string
  const last_name = formData.get("last_name") as string
  const phone = formData.get("phone") as string

  try {
    const response = await registerApi({
      email,
      username,
      password,
      password_confirm,
      first_name,
      last_name,
      role: "customer", // Default role for new registrations
      phone: phone || undefined,
    })

    // Set tokens in httpOnly cookies
    const accessMaxAge = 15 * 60 // 15 minutes
    const refreshMaxAge = 7 * 24 * 60 * 60 // 7 days

    await setAccessToken(response.access, accessMaxAge)
    await setRefreshToken(response.refresh, refreshMaxAge)

    return { success: true, user: response.user }
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        errors: error.errors,
      }
    }
    return {
      success: false,
      error: "Error de conexión. Por favor, intenta de nuevo.",
    }
  }
}

export async function logoutAction() {
  await clearTokens()
  redirect("/login")
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log("[getCurrentUser] 🔍 Starting...")
    let accessToken = await getAccessToken()

    // If no access token, try to refresh
    if (!accessToken) {
      console.log("[getCurrentUser] ⚠️ No access token, attempting refresh...")
      const refreshed = await refreshAccessToken()
      if (!refreshed) {
        console.log("[getCurrentUser] ❌ Refresh failed, returning null")
        return null
      }
      accessToken = await getAccessToken()
      if (!accessToken) {
        console.log("[getCurrentUser] ❌ No access token after refresh, returning null")
        return null
      }
      console.log("[getCurrentUser] ✅ Token refreshed successfully")
    } else {
      console.log("[getCurrentUser] ✅ Access token found")
    }

    try {
      console.log("[getCurrentUser] 📡 Calling getMeApi...")
      const user = await getMeApi(accessToken)
      console.log("[getCurrentUser] ✅ User retrieved successfully:", user?.email)
      return user
    } catch (error) {
      console.log("[getCurrentUser] ⚠️ getMeApi failed:", error)
      // If 401, try to refresh once
      if (error instanceof ApiError && error.status === 401) {
        console.log("[getCurrentUser] 🔄 Got 401, attempting refresh...")
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          const newAccessToken = await getAccessToken()
          if (newAccessToken) {
            try {
              console.log("[getCurrentUser] 📡 Retrying getMeApi with new token...")
              const user = await getMeApi(newAccessToken)
              console.log("[getCurrentUser] ✅ User retrieved after refresh:", user?.email)
              return user
            } catch (retryError) {
              console.log("[getCurrentUser] ❌ getMeApi failed after refresh:", retryError)
              // Don't clear tokens here - let middleware handle it
              return null
            }
          }
        }
        console.log("[getCurrentUser] ❌ Refresh failed on 401, returning null")
        // Don't clear tokens here - let middleware handle it
      }
      console.log("[getCurrentUser] ❌ Returning null due to error")
      return null
    }
  } catch (error) {
    console.log("[getCurrentUser] ❌ Unexpected error:", error)
    return null
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = await getRefreshToken()
    if (!refreshToken) {
      return false
    }

    const response = await refreshTokenApi(refreshToken)
    await setAccessToken(response.access, 15 * 60) // 15 minutes
    return true
  } catch (error) {
    // Refresh token is invalid or expired - don't clear tokens here, let middleware handle it
    return false
  }
}

/**
 * Get the access token for client components
 * This is a server action that can be called from client components
 * Automatically refreshes if token is missing or expired
 */
export async function getClientAccessToken(): Promise<string | null> {
  try {
    console.log("[getClientAccessToken] 🔍 Starting...")
    let accessToken = await getAccessToken()

    // If no access token, try to refresh
    if (!accessToken) {
      console.log("[getClientAccessToken] ⚠️ No access token, attempting refresh...")
      const refreshed = await refreshAccessToken()
      if (!refreshed) {
        console.log("[getClientAccessToken] ❌ Refresh failed")
        return null
      }
      accessToken = await getAccessToken()
      console.log("[getClientAccessToken] ✅ Token refreshed")
    } else {
      console.log("[getClientAccessToken] ✅ Access token found")
    }

    return accessToken ?? null
  } catch (error) {
    console.log("[getClientAccessToken] ❌ Error:", error)
    return null
  }
}

/**
 * Logout from client components
 * Clears all authentication tokens
 * This is a server action that can be called from client components
 */
export async function logoutClient(): Promise<void> {
  await clearTokens()
}

