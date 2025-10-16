import type { User } from "@/lib/types"

// Server-side auth utilities for RSC
export async function getServerUser(): Promise<User | null> {
  // In production, this would validate session tokens from cookies
  // For now, return null - client components will handle auth state
  return null
}

export async function requireAuth(): Promise<User> {
  const user = await getServerUser()
  if (!user) {
    throw new Error("No autenticado")
  }
  return user
}

export async function requireRole(allowedRoles: User["rol"][]): Promise<User> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.rol)) {
    throw new Error("No autorizado")
  }
  return user
}
