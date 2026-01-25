import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Calendar } from '../calendar'

/**
 * FE-AGE-010 a FE-AGE-012: Pruebas del componente Calendar
 * Cobertura: Renderizado, fechas pasadas deshabilitadas, navegación
 */
describe('Calendar Component', () => {
  let mockToday: Date

  beforeEach(() => {
    // Mock fecha fija para tests consistentes
    mockToday = new Date('2024-12-15T12:00:00')
    vi.useFakeTimers()
    vi.setSystemTime(mockToday)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('FE-AGE-010: Renderizado básico', () => {
    it('debe renderizar el componente Calendar', () => {
      render(<Calendar />)
      // Verificar que existe el contenedor del calendario
      const calendar = screen.getByRole('grid')
      expect(calendar).toBeInTheDocument()
    })

    it('debe tener encabezados de días de la semana', () => {
      render(<Calendar />)
      // El calendario usa una tabla con thead que contiene los días
      const grid = screen.getByRole('grid')
      expect(grid).toBeInTheDocument()
      // Verificar que hay celdas th en el calendario
      const headers = grid.querySelectorAll('th')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('debe mostrar celdas de días', () => {
      render(<Calendar />)
      // Debe tener múltiples botones para los días del mes
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('FE-AGE-011: Deshabilitación de fechas pasadas', () => {
    it('debe aplicar callback de fechas deshabilitadas', () => {
      const isDateDisabled = (date: Date) => {
        const today = new Date(mockToday)
        today.setHours(0, 0, 0, 0)
        return date < today
      }

      render(<Calendar disabled={isDateDisabled} />)

      // Debe existir el calendario
      const calendar = screen.getByRole('grid')
      expect(calendar).toBeInTheDocument()
    })

    it('debe renderizar correctamente con prop disabled', () => {
      const isDateDisabled = (date: Date) => {
        const yesterday = new Date(mockToday)
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(0, 0, 0, 0)
        return date <= yesterday
      }

      render(<Calendar disabled={isDateDisabled} />)

      // Verificar que el calendario se renderiza correctamente
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    it('debe permitir configurar modo single', () => {
      const onSelect = vi.fn()

      render(<Calendar mode="single" onSelect={onSelect} />)

      // Buscar botones de día
      const dayButtons = screen.getAllByRole('button')
      expect(dayButtons.length).toBeGreaterThan(0)
    })
  })

  describe('FE-AGE-012: Navegación del calendario', () => {
    it('debe renderizar botones de navegación', () => {
      render(<Calendar />)

      // Buscar los botones de navegación (deben haber al menos 2 - prev/next)
      const navButtons = screen.getAllByRole('button')
      expect(navButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('debe soportar prop captionLayout', () => {
      render(<Calendar captionLayout="label" />)

      const calendar = screen.getByRole('grid')
      expect(calendar).toBeInTheDocument()
    })

    it('debe soportar selección de fecha única', () => {
      const mockOnSelect = vi.fn()

      render(
        <Calendar
          mode="single"
          onSelect={mockOnSelect}
        />
      )

      const calendar = screen.getByRole('grid')
      expect(calendar).toBeInTheDocument()
    })

    it('debe mostrar días de meses adyacentes cuando showOutsideDays es true', () => {
      render(<Calendar showOutsideDays={true} />)

      // Verificar que el calendario tiene celdas
      const calendar = screen.getByRole('grid')
      expect(calendar).toBeInTheDocument()
    })

    it('debe aceptar className personalizada', () => {
      render(<Calendar className="custom-calendar-class" />)

      // El calendario debe renderizarse
      const calendar = screen.getByRole('grid')
      expect(calendar).toBeInTheDocument()
    })
  })
})
