import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/dashboard"]

// Routes that should redirect to dashboard if authenticated
const authRoutes = ["/login", "/registro"]

/**
 * Check if a JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= expirationTime
  } catch {
    // If we can't parse the token, assume it's expired
    return true
  }
}

/**
 * Attempt to refresh the access token using the refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.access
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Get tokens from cookies
  let accessToken = request.cookies.get("access_token")?.value
  const refreshToken = request.cookies.get("refresh_token")?.value

  // If accessing protected route
  if (isProtectedRoute) {
    // No tokens at all
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Access token expired or missing, try to refresh
    if ((!accessToken || isTokenExpired(accessToken)) && refreshToken) {
      const newAccessToken = await refreshAccessToken(refreshToken)

      if (newAccessToken) {
        // Create response and set new access token
        const response = NextResponse.next()
        response.cookies.set("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 15 * 60, // 15 minutes
        })
        response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
        return response
      } else {
        // Refresh token is invalid, clear cookies and redirect to login
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete("access_token")
        response.cookies.delete("refresh_token")
        return response
      }
    }

    // Both tokens are valid or access token is still valid
    if (accessToken && !isTokenExpired(accessToken)) {
      const response = NextResponse.next()
      response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
      return response
    }

    // If we reach here, something went wrong, redirect to login
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing auth route with valid token, redirect to dashboard
  if (isAuthRoute && accessToken && !isTokenExpired(accessToken)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - agendamiento (public appointment booking)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|agendamiento).*)",
  ],
}
