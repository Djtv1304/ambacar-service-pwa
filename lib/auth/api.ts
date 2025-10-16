// Auth API functions

import { apiRequest } from "@/lib/api/client"
import type { AuthResponse, LoginCredentials, RegisterData, User } from "@/lib/types"

export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  })
}

export async function registerApi(data: RegisterData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function getMeApi(accessToken: string): Promise<User> {
  return apiRequest<User>("/api/auth/me/", {
    method: "GET",
    token: accessToken,
  })
}

export async function refreshTokenApi(refreshToken: string): Promise<{ access: string }> {
  return apiRequest<{ access: string }>("/api/auth/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  })
}

export async function updateProfileApi(accessToken: string, data: Partial<User>): Promise<User> {
  return apiRequest<User>("/api/auth/profile/", {
    method: "PATCH",
    token: accessToken,
    body: JSON.stringify(data),
  })
}
