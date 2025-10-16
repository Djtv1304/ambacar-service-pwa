// Server-side cookie utilities for token management

import { cookies } from "next/headers"

const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export async function setAccessToken(token: string, maxAge: number = 15 * 60) {
  // 15 minutes default
  const cookieStore = await cookies()
  cookieStore.set(ACCESS_TOKEN_KEY, token, {
    ...COOKIE_OPTIONS,
    maxAge,
  })
}

export async function setRefreshToken(token: string, maxAge: number = 7 * 24 * 60 * 60) {
  // 7 days default
  const cookieStore = await cookies()
  cookieStore.set(REFRESH_TOKEN_KEY, token, {
    ...COOKIE_OPTIONS,
    sameSite: "strict",
    maxAge,
  })
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_TOKEN_KEY)?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(REFRESH_TOKEN_KEY)?.value
}

export async function clearTokens() {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_TOKEN_KEY)
  cookieStore.delete(REFRESH_TOKEN_KEY)
}
