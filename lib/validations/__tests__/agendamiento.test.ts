import { describe, it, expect } from 'vitest'
import {
  clienteSchema,
  vehiculoSchema,
  citaSchema,
  cancelacionSchema
} from '../agendamiento'

/**
 * FE-AGE-001 a FE-AGE-012: Pruebas de validación de schemas de agendamiento
 * Cobertura: Cédula ecuatoriana, Placa, VIN, y validaciones de formularios
 */
describe('clienteSchema', () => {
  describe('FE-AGE-001: Validación de cédula ecuatoriana', () => {
    it('debe rechazar cédula menor a 10 caracteres', () => {
      const result = clienteSchema.safeParse({
        cedula: '123456789',
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+593991234567',
        email: 'juan@test.com',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const cedulaError = result.error.issues.find(i => i.path.includes('cedula'))
        expect(cedulaError?.message).toBe('La cédula debe tener al menos 10 caracteres')
      }
    })

    it('debe rechazar cédula mayor a 13 caracteres', () => {
      const result = clienteSchema.safeParse({
        cedula: '12345678901234',
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+593991234567',
        email: 'juan@test.com',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const cedulaError = result.error.issues.find(i => i.path.includes('cedula'))
        expect(cedulaError?.message).toBe('La cédula no puede exceder 13 caracteres')
      }
    })

    it('debe rechazar cédula con letras', () => {
      const result = clienteSchema.safeParse({
        cedula: '123456789A',
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+593991234567',
        email: 'juan@test.com',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const cedulaError = result.error.issues.find(i => i.path.includes('cedula'))
        expect(cedulaError?.message).toBe('La cédula solo debe contener números')
      }
    })

    it('debe rechazar cédula con caracteres especiales', () => {
      const result = clienteSchema.safeParse({
        cedula: '1234-56789',
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+593991234567',
        email: 'juan@test.com',
      })
      expect(result.success).toBe(false)
    })

    it('debe aceptar cédula válida de 10 dígitos', () => {
      const result = clienteSchema.safeParse({
        cedula: '1712345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+593991234567',
        email: 'juan@test.com',
      })
      expect(result.success).toBe(true)
    })

    it('debe aceptar cédula/RUC válido de 13 dígitos', () => {
      const result = clienteSchema.safeParse({
        cedula: '1712345678001',
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+593991234567',
        email: 'juan@test.com',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('FE-AGE-002: Validación de nombre y apellido', () => {
    it('debe rechazar nombre menor a 2 caracteres', () => {
      const result = clienteSchema.safeParse({
        cedula: '1712345678',
        nombre: 'J',
        apellido: 'Pérez',
        telefono: '+593991234567',
        email: 'juan@test.com',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const nameError = result.error.issues.find(i => i.path.includes('nombre'))
        expect(nameError?.message).toBe('El nombre debe tener al menos 2 caracteres')
      }
    })

    it('debe rechazar nombre mayor a 50 caracteres', () => {
      const longName = 'J'.repeat(51)
      const result = clienteSchema.safeParse({
        cedula: '1712345678',
        nombre: longName,
        apellido: 'Pérez',
        telefono: '+593991234567',
        email: 'juan@test.com',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const nameError = result.error.issues.find(i => i.path.includes('nombre'))
        expect(nameError?.message).toBe('El nombre no puede exceder 50 caracteres')
      }
    })
  })
})

describe('vehiculoSchema', () => {
  const validVehiculo = {
    placa: 'ABC1234',
    marca: 'Toyota',
    modelo: 'Corolla',
    anio: 2020,
    kilometraje: 50000,
    color: 'Blanco',
    vin: '1HGCM82633A004352',
  }

  describe('FE-AGE-003: Validación de placa ecuatoriana', () => {
    it('debe rechazar placa vacía', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        placa: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const placaError = result.error.issues.find(i => i.path.includes('placa'))
        expect(placaError?.message).toBe('La placa es requerida')
      }
    })

    it('debe rechazar placa con menos de 3 letras', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        placa: 'AB1234',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const placaError = result.error.issues.find(i => i.path.includes('placa'))
        expect(placaError?.message).toContain('formato')
      }
    })

    it('debe rechazar placa con menos de 3 números', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        placa: 'ABC12',
      })
      expect(result.success).toBe(false)
    })

    it('debe rechazar placa con más de 4 números', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        placa: 'ABC12345',
      })
      expect(result.success).toBe(false)
    })

    it('debe rechazar placa con números antes de letras', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        placa: '123ABC',
      })
      expect(result.success).toBe(false)
    })

    it('debe aceptar placa válida con 3 números (formato antiguo)', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        placa: 'ABC123',
      })
      expect(result.success).toBe(true)
    })

    it('debe aceptar placa válida con 4 números (formato nuevo)', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        placa: 'ABC1234',
      })
      expect(result.success).toBe(true)
    })

    it('debe aceptar placa en minúsculas (case insensitive)', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        placa: 'abc1234',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('FE-AGE-004: Validación de VIN', () => {
    it('debe rechazar VIN menor a 17 caracteres', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        vin: '1HGCM82633A00435',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const vinError = result.error.issues.find(i => i.path.includes('vin'))
        expect(vinError?.message).toBe('El VIN debe tener exactamente 17 caracteres')
      }
    })

    it('debe rechazar VIN mayor a 17 caracteres', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        vin: '1HGCM82633A0043521',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const vinError = result.error.issues.find(i => i.path.includes('vin'))
        expect(vinError?.message).toBe('El VIN debe tener exactamente 17 caracteres')
      }
    })

    it('debe rechazar VIN con letra I', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        vin: '1HGCM82633I004352',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const vinError = result.error.issues.find(i => i.path.includes('vin'))
        expect(vinError?.message).toContain('no se permiten I, O, Q')
      }
    })

    it('debe rechazar VIN con letra O', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        vin: '1HGCM82633O004352',
      })
      expect(result.success).toBe(false)
    })

    it('debe rechazar VIN con letra Q', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        vin: '1HGCM82633Q004352',
      })
      expect(result.success).toBe(false)
    })

    it('debe rechazar VIN con caracteres especiales', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        vin: '1HGCM82633-004352',
      })
      expect(result.success).toBe(false)
    })

    it('debe aceptar VIN válido de 17 caracteres', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        vin: '1HGCM82633A004352',
      })
      expect(result.success).toBe(true)
    })

    it('debe aceptar VIN válido en minúsculas', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        vin: '1hgcm82633a004352',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('FE-AGE-005: Validación de año del vehículo', () => {
    it('debe rechazar año menor a 1990', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        anio: 1989,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const anioError = result.error.issues.find(i => i.path.includes('anio'))
        expect(anioError?.message).toBe('El año debe ser mayor a 1990')
      }
    })

    it('debe rechazar año muy futuro', () => {
      const futureYear = new Date().getFullYear() + 2
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        anio: futureYear,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const anioError = result.error.issues.find(i => i.path.includes('anio'))
        expect(anioError?.message).toBe('El año no puede ser futuro')
      }
    })

    it('debe aceptar año actual', () => {
      const currentYear = new Date().getFullYear()
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        anio: currentYear,
      })
      expect(result.success).toBe(true)
    })

    it('debe aceptar año siguiente (modelos próximos)', () => {
      const nextYear = new Date().getFullYear() + 1
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        anio: nextYear,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('FE-AGE-006: Validación de kilometraje', () => {
    it('debe rechazar kilometraje 0', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        kilometraje: 0,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const kmError = result.error.issues.find(i => i.path.includes('kilometraje'))
        expect(kmError?.message).toBe('El kilometraje debe ser mayor a 0')
      }
    })

    it('debe rechazar kilometraje mayor a 999999', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        kilometraje: 1000000,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const kmError = result.error.issues.find(i => i.path.includes('kilometraje'))
        expect(kmError?.message).toBe('El kilometraje es muy alto')
      }
    })

    it('debe aceptar kilometraje válido', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        kilometraje: 150000,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('FE-AGE-007: Validación de color', () => {
    it('debe rechazar color con números', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        color: 'Rojo123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const colorError = result.error.issues.find(i => i.path.includes('color'))
        expect(colorError?.message).toBe('El color solo puede contener letras')
      }
    })

    it('debe aceptar color con caracteres españoles', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        color: 'Añil',
      })
      expect(result.success).toBe(true)
    })

    it('debe aceptar color con tildes', () => {
      const result = vehiculoSchema.safeParse({
        ...validVehiculo,
        color: 'Marrón',
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('citaSchema', () => {
  describe('FE-AGE-008: Validación de cita', () => {
    it('debe rechazar fecha vacía', () => {
      const result = citaSchema.safeParse({
        fecha: '',
        hora: '09:00',
        servicio: 'Cambio de aceite',
        sucursal: 'Quicentro Sur',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const fechaError = result.error.issues.find(i => i.path.includes('fecha'))
        expect(fechaError?.message).toBe('La fecha es requerida')
      }
    })

    it('debe rechazar hora vacía', () => {
      const result = citaSchema.safeParse({
        fecha: '2024-12-20',
        hora: '',
        servicio: 'Cambio de aceite',
        sucursal: 'Quicentro Sur',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const horaError = result.error.issues.find(i => i.path.includes('hora'))
        expect(horaError?.message).toBe('La hora es requerida')
      }
    })

    it('debe rechazar servicio menor a 5 caracteres', () => {
      const result = citaSchema.safeParse({
        fecha: '2024-12-20',
        hora: '09:00',
        servicio: 'abc',
        sucursal: 'Quicentro Sur',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const servicioError = result.error.issues.find(i => i.path.includes('servicio'))
        expect(servicioError?.message).toContain('mínimo 5 caracteres')
      }
    })

    it('debe aceptar cita válida', () => {
      const result = citaSchema.safeParse({
        fecha: '2024-12-20',
        hora: '09:00',
        servicio: 'Cambio de aceite y revisión general',
        sucursal: 'Quicentro Sur',
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('cancelacionSchema', () => {
  describe('FE-AGE-009: Validación de cancelación', () => {
    it('debe rechazar cédula menor a 10 caracteres', () => {
      const result = cancelacionSchema.safeParse({
        cedula: '123456789',
        referencia: 'REF-12345',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const cedulaError = result.error.issues.find(i => i.path.includes('cedula'))
        expect(cedulaError?.message).toBe('La cédula debe tener al menos 10 caracteres')
      }
    })

    it('debe rechazar referencia menor a 5 caracteres', () => {
      const result = cancelacionSchema.safeParse({
        cedula: '1712345678',
        referencia: 'REF',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const refError = result.error.issues.find(i => i.path.includes('referencia'))
        expect(refError?.message).toBe('La referencia debe tener al menos 5 caracteres')
      }
    })

    it('debe aceptar datos de cancelación válidos', () => {
      const result = cancelacionSchema.safeParse({
        cedula: '1712345678',
        referencia: 'REF-12345',
      })
      expect(result.success).toBe(true)
    })
  })
})
