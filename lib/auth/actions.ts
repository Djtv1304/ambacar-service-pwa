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
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return null
    }

    const user = await getMeApi(accessToken)
    return user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      // Try to refresh token
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        const accessToken = await getAccessToken()
        if (accessToken) {
          try {
            const user = await getMeApi(accessToken)
            return user
          } catch {
            return null
          }
        }
      }
    }
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
    await setAccessToken(response.access)
    return true
  } catch (error) {
    // Refresh token is invalid or expired
    await clearTokens()
    return false
  }
}
