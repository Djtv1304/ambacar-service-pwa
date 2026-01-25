import { describe, it, expect } from 'vitest'
import {
  ROLES,
  INTERNAL_ROLES,
  STAFF_ROLES,
  MANAGEMENT_ROLES,
  isCustomer,
  isInternalUser,
  isManagement,
  isAdmin,
  isTechnician,
  isOperator,
  hasRole,
  hasExactRole,
} from '../roles'
import type { UserRole } from '@/lib/types'

/**
 * FE-AUTH-011 a FE-AUTH-015: Pruebas de manejo de roles (RBAC)
 */
describe('Role Constants', () => {
  describe('FE-AUTH-011: Constantes de roles', () => {
    it('debe tener todos los roles definidos', () => {
      expect(ROLES.CUSTOMER).toBe('customer')
      expect(ROLES.ADMIN).toBe('admin')
      expect(ROLES.MANAGER).toBe('manager')
      expect(ROLES.OPERATOR).toBe('operator')
      expect(ROLES.TECHNICIAN).toBe('technician')
    })

    it('debe tener grupos de roles correctamente definidos', () => {
      expect(INTERNAL_ROLES).toContain('manager')
      expect(INTERNAL_ROLES).toContain('operator')
      expect(INTERNAL_ROLES).toContain('technician')
      expect(INTERNAL_ROLES).not.toContain('customer')

      expect(STAFF_ROLES).toContain('admin')
      expect(STAFF_ROLES).toContain('manager')

      expect(MANAGEMENT_ROLES).toContain('manager')
      expect(MANAGEMENT_ROLES).toContain('admin')
      expect(MANAGEMENT_ROLES).not.toContain('technician')
    })
  })
})

describe('Role Utility Functions', () => {
  const mockCustomer = { role: 'customer' as UserRole }
  const mockAdmin = { role: 'admin' as UserRole }
  const mockManager = { role: 'manager' as UserRole }
  const mockOperator = { role: 'operator' as UserRole }
  const mockTechnician = { role: 'technician' as UserRole }

  describe('FE-AUTH-012: Función isCustomer', () => {
    it('debe retornar true para usuario customer', () => {
      expect(isCustomer(mockCustomer)).toBe(true)
    })

    it('debe retornar false para usuario admin', () => {
      expect(isCustomer(mockAdmin)).toBe(false)
    })

    it('debe retornar false para usuario null', () => {
      expect(isCustomer(null)).toBe(false)
    })

    it('debe retornar false para usuario undefined', () => {
      expect(isCustomer(undefined)).toBe(false)
    })

    it('debe retornar false para objeto vacío', () => {
      expect(isCustomer({})).toBe(false)
    })
  })

  describe('FE-AUTH-013: Función isInternalUser', () => {
    it('debe retornar true para manager', () => {
      expect(isInternalUser(mockManager)).toBe(true)
    })

    it('debe retornar true para operator', () => {
      expect(isInternalUser(mockOperator)).toBe(true)
    })

    it('debe retornar true para technician', () => {
      expect(isInternalUser(mockTechnician)).toBe(true)
    })

    it('debe retornar false para customer', () => {
      expect(isInternalUser(mockCustomer)).toBe(false)
    })

    it('debe retornar false para admin (no está en INTERNAL_ROLES)', () => {
      // Admin está en STAFF_ROLES pero no en INTERNAL_ROLES
      expect(isInternalUser(mockAdmin)).toBe(false)
    })
  })

  describe('FE-AUTH-014: Función isManagement', () => {
    it('debe retornar true para manager', () => {
      expect(isManagement(mockManager)).toBe(true)
    })

    it('debe retornar true para admin', () => {
      expect(isManagement(mockAdmin)).toBe(true)
    })

    it('debe retornar false para technician', () => {
      expect(isManagement(mockTechnician)).toBe(false)
    })

    it('debe retornar false para operator', () => {
      expect(isManagement(mockOperator)).toBe(false)
    })

    it('debe retornar false para customer', () => {
      expect(isManagement(mockCustomer)).toBe(false)
    })
  })

  describe('FE-AUTH-015: Funciones específicas de rol', () => {
    it('isAdmin debe identificar correctamente administradores', () => {
      expect(isAdmin(mockAdmin)).toBe(true)
      expect(isAdmin(mockManager)).toBe(false)
      expect(isAdmin(mockCustomer)).toBe(false)
    })

    it('isTechnician debe identificar correctamente técnicos', () => {
      expect(isTechnician(mockTechnician)).toBe(true)
      expect(isTechnician(mockOperator)).toBe(false)
      expect(isTechnician(mockCustomer)).toBe(false)
    })

    it('isOperator debe identificar correctamente operadores', () => {
      expect(isOperator(mockOperator)).toBe(true)
      expect(isOperator(mockTechnician)).toBe(false)
      expect(isOperator(mockCustomer)).toBe(false)
    })

    it('hasRole debe verificar múltiples roles', () => {
      expect(hasRole(mockManager, ['manager', 'admin'])).toBe(true)
      expect(hasRole(mockAdmin, ['manager', 'admin'])).toBe(true)
      expect(hasRole(mockTechnician, ['manager', 'admin'])).toBe(false)
      expect(hasRole(mockCustomer, ['manager', 'admin'])).toBe(false)
    })

    it('hasExactRole debe verificar rol exacto', () => {
      expect(hasExactRole(mockAdmin, 'admin')).toBe(true)
      expect(hasExactRole(mockAdmin, 'manager')).toBe(false)
      expect(hasExactRole(null, 'admin')).toBe(false)
    })
  })
})
