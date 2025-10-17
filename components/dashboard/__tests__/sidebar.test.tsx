import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '../sidebar'
import { useAuth } from '@/components/auth/auth-provider'

vi.mock('@/components/auth/auth-provider')

describe('Sidebar Component', () => {
  it('debe renderizar el sidebar con el logo', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
          id: 1,
          role: 'admin',
          email: 'admin@test.com',
          first_name: 'Admin',
          username: 'admin',
          last_name: 'User',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
      },
      isLoading: false,
      refreshUser: vi.fn(),
      isAuthenticated: true,
    })

    render(<Sidebar />)

    expect(screen.getByText('Ambacar')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('debe filtrar items según el rol de usuario', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
          id: 1,
          role: 'customer',
          email: 'customer@test.com',
          first_name: 'Customer',
          username: 'customer',
          last_name: 'User',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
      },
      isLoading: false,
      refreshUser: vi.fn(),
      isAuthenticated: true,
    })

    render(<Sidebar />)

    expect(screen.getByText('Citas')).toBeInTheDocument()
    expect(screen.queryByText('Configuración')).not.toBeInTheDocument()
  })

  it('debe mostrar todos los items para admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
          id: 1,
          role: 'admin',
          email: 'admin@test.com',
          first_name: 'Admin',
          username: 'admin',
          last_name: 'User',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
      },
      isLoading: false,
      refreshUser: vi.fn(),
      isAuthenticated: true,
    })

    render(<Sidebar />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Configuración')).toBeInTheDocument()
    expect(screen.getByText('Inventario')).toBeInTheDocument()
  })
})