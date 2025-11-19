"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getClientAccessToken, logoutClient } from "@/lib/auth/actions"
import { isTokenExpired } from "@/lib/api/client"

/**
 * Hook to manage authentication token in client components
 * Handles token refresh and automatic logout on expiration
 */
export function useAuthToken() {
  const router = useRouter()
  const tokenRef = useRef<string | null>(null)
  const isRefreshingRef = useRef(false)

  /**
   * Get the current access token
   * If token is expired or about to expire, triggers a refresh
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      // If already refreshing, wait a bit and try again
      if (isRefreshingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return tokenRef.current
      }

      // Get token from server
      const token = await getClientAccessToken()

      if (!token) {
        // No token available, user needs to login
        router.push("/login")
        return null
      }

      // Check if token is expired or about to expire (within 2 minutes)
      if (isTokenExpired(token, 120)) {
        isRefreshingRef.current = true

        try {
          // Force a refresh by calling the server action
          // The server will automatically refresh if possible
          const refreshedToken = await getClientAccessToken()

          if (!refreshedToken || isTokenExpired(refreshedToken, 120)) {
            // Token refresh failed or still expired
            router.push("/login")
            return null
          }

          tokenRef.current = refreshedToken
          return refreshedToken
        } finally {
          isRefreshingRef.current = false
        }
      }

      tokenRef.current = token
      return token
    } catch (error) {
      console.error("Error getting token:", error)
      router.push("/login")
      return null
    }
  }, [router])

  return { getToken }
}

/**
 * Hook to setup activity detection and token refresh
 * Refreshes token on user activity to keep session alive
 */
export function useActivityDetection() {
  const router = useRouter()
  const lastActivityRef = useRef<number>(Date.now())
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now()
    }

    // Listen to user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach(event => {
      window.addEventListener(event, updateActivity)
    })

    // Check token every 10 minutes
    checkIntervalRef.current = setInterval(async () => {
      const timeSinceActivity = Date.now() - lastActivityRef.current

      // If user has been inactive for more than 30 minutes, logout
      if (timeSinceActivity > 30 * 60 * 1000) {
        // Clear tokens (logout) before redirect
        await logoutClient()
        router.push("/login")
        return
      }

      // If user has been active in the last 10 minutes, refresh token
      if (timeSinceActivity < 10 * 60 * 1000) {
        try {
          const token = await getClientAccessToken()
          if (!token) {
            await logoutClient()
            router.push("/login")
          }
        } catch (error) {
          console.error("Error refreshing token:", error)
        }
      }
    }, 10 * 60 * 1000) // Check every 10 minutes

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [router])
}

