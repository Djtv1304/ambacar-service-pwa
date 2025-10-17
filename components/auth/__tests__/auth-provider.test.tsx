import { describe, it, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../auth-provider'
import { getCurrentUser } from '@/lib/auth/actions'
import type { User } from '@/lib/types'

// Mock de las acciones de autenticación
vi.mock('@/lib/auth/actions', () => ({
  getCurrentUser: vi.fn(),
  loginAction: vi.fn(),
  logoutAction: vi.fn(),
  registerAction: vi.fn(),
}))

describe('AuthProvider Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('debe iniciar sesión correctamente y almacenar usuario', async () => {
    const mockUser: User = {
      id: 1,
      email: 'admin@test.com',
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      phone: '1234567890',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.refreshUser()
    })

    await waitFor(() => {
      expect(result.current.user).toBeDefined()
      expect(result.current.user?.email).toBe('admin@test.com')
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  it('debe cerrar sesión y limpiar el estado', async () => {
    const mockUser: User = {
      id: 1,
      email: 'admin@test.com',
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      phone: '1234567890',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser)

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    await waitFor(() => {
      expect(result.current.user).toBeDefined()
    })

    // Simular logout cambiando el mock a null
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null)

    await act(async () => {
      await result.current.refreshUser()
    })

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  it('debe validar roles correctamente', async () => {
    const mockCustomer: User = {
      id: 2,
      email: 'customer@test.com',
      username: 'customer',
      first_name: 'Customer',
      last_name: 'User',
      role: 'customer',
      phone: '0987654321',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    vi.mocked(getCurrentUser).mockResolvedValue(mockCustomer)

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await waitFor(() => {
      expect(result.current.user?.role).toBe('customer')
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  it('debe manejar errores de autenticación', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Unauthorized'))

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  it('debe actualizar el usuario al llamar refreshUser', async () => {
    const initialUser: User = {
      id: 1,
      email: 'user@test.com',
      username: 'user',
      first_name: 'Initial',
      last_name: 'User',
      role: 'customer',
      phone: '1234567890',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedUser: User = {
      ...initialUser,
      first_name: 'Updated',
    }

    vi.mocked(getCurrentUser).mockResolvedValueOnce(initialUser)

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    await waitFor(() => {
      expect(result.current.user?.first_name).toBe('Initial')
    })

    vi.mocked(getCurrentUser).mockResolvedValueOnce(updatedUser)

    await act(async () => {
      await result.current.refreshUser()
    })

    await waitFor(() => {
      expect(result.current.user?.first_name).toBe('Updated')
    })
  })
})