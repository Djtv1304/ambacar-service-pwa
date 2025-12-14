import type { UserRole } from "@/lib/types"

/**
 * Role constants and utilities for RBAC
 * Centralized logic for role-based access control
 */

// Role constants
export const ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  MANAGER: "manager",
  OPERATOR: "operator",
  TECHNICIAN: "technician",
} as const

// Role groups for common access patterns
export const INTERNAL_ROLES: UserRole[] = ["manager", "operator", "technician"]
export const STAFF_ROLES: UserRole[] = ["manager", "operator", "technician", "admin"]
export const MANAGEMENT_ROLES: UserRole[] = ["manager", "admin"]

/**
 * Type for user object that may be null/undefined
 * Accepts any object with an optional role property
 */
type UserLike = { role?: UserRole | string | null } | null | undefined

/**
 * Check if user is a customer
 * @param user - User object or null/undefined
 * @returns true if user has customer role
 */
export function isCustomer(user: UserLike): boolean {
  return user?.role === ROLES.CUSTOMER
}

/**
 * Check if user is internal staff (non-customer)
 * Internal users include: manager, operator, technician, admin
 * @param user - User object or null/undefined
 * @returns true if user has an internal role
 */
export function isInternalUser(user: UserLike): boolean {
  if (!user?.role) return false
  return INTERNAL_ROLES.includes(user.role as UserRole)
}

/**
 * Check if user is in a management role
 * Management includes: manager, admin
 * @param user - User object or null/undefined
 * @returns true if user has a management role
 */
export function isManagement(user: UserLike): boolean {
  if (!user?.role) return false
  return MANAGEMENT_ROLES.includes(user.role as UserRole)
}

/**
 * Check if user is an admin
 * @param user - User object or null/undefined
 * @returns true if user has admin role
 */
export function isAdmin(user: UserLike): boolean {
  return user?.role === ROLES.ADMIN
}

/**
 * Check if user is a technician
 * @param user - User object or null/undefined
 * @returns true if user has technician role
 */
export function isTechnician(user: UserLike): boolean {
  return user?.role === ROLES.TECHNICIAN
}

/**
 * Check if user is an operator
 * @param user - User object or null/undefined
 * @returns true if user has operator role
 */
export function isOperator(user: UserLike): boolean {
  return user?.role === ROLES.OPERATOR
}

/**
 * Check if user has any of the specified roles
 * @param user - User object or null/undefined
 * @param roles - Array of roles to check against
 * @returns true if user has any of the specified roles
 */
export function hasRole(user: UserLike, roles: UserRole[]): boolean {
  if (!user?.role) return false
  return roles.includes(user.role as UserRole)
}

/**
 * Check if user has a specific role
 * @param user - User object or null/undefined
 * @param role - Role to check
 * @returns true if user has the specified role
 */
export function hasExactRole(user: UserLike, role: UserRole): boolean {
  return user?.role === role
}

