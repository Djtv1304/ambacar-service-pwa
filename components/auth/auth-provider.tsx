"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, LoginCredentials, RegisterData } from "@/lib/types"
import { getCurrentUser, loginAction, registerAction } from "@/lib/auth/actions"
import { useActivityDetection } from "@/hooks/use-auth-token"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  refreshUser: () => Promise<void>
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User; error?: string; errors?: Record<string, string[]> }>
  register: (data: RegisterData) => Promise<{ success: boolean; user?: User; error?: string; errors?: Record<string, string[]> }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Setup activity detection for automatic token refresh
  useActivityDetection()

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("[v0] Error fetching user:", error)
      setUser(null)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    const formData = new FormData()
    formData.append("email", credentials.email)
    formData.append("password", credentials.password)

    const result = await loginAction(formData)

    if (result.success && result.user) {
      setUser(result.user)
    }

    return result
  }

  const register = async (data: RegisterData) => {
    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("username", data.username)
    formData.append("password", data.password)
    formData.append("password_confirm", data.password_confirm)
    formData.append("first_name", data.first_name)
    formData.append("last_name", data.last_name)
    if (data.phone) formData.append("phone", data.phone)

    const result = await registerAction(formData)

    if (result.success && result.user) {
      setUser(result.user)
    }

    return result
  }

  useEffect(() => {
    // Fetch user on mount
    refreshUser().finally(() => setIsLoading(false))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        refreshUser,
        login,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
