// API client utilities for making HTTP requests

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface RequestOptions extends RequestInit {
  token?: string
  skipAuth?: boolean // Skip authentication retry logic
}

/**
 * Check if a JWT token is expired or about to expire
 * @param token - JWT token to check
 * @param bufferSeconds - Buffer time in seconds before actual expiration (default 60s)
 * @returns true if token is expired or about to expire
 */
export function isTokenExpired(token: string, bufferSeconds: number = 60): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const bufferTime = bufferSeconds * 1000

    return currentTime >= expirationTime - bufferTime
  } catch (error) {
    // If we can't parse the token, assume it's expired
    return true
  }
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, skipAuth = false, ...fetchOptions } = options

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  }

  // Only set Content-Type for JSON if body is not FormData
  const isFormData = fetchOptions.body instanceof FormData
  if (!isFormData) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status)
      }
      return {} as T
    }

    const data = await response.json()

    if (!response.ok) {
      // Extract error message - Priority: non_field_errors > detail > message > first field error > HTTP status
      const errorMessage =
        data.non_field_errors?.[0] ??
        data.detail ??
        data.message ??
        (Object.values(data).find((value): value is string[] => Array.isArray(value) && value.length > 0)?.[0]) ??
        `HTTP ${response.status}`

      throw new ApiError(errorMessage, response.status, data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Network or other errors
    throw new ApiError(error instanceof Error ? error.message : "Network error", 0)
  }
}
