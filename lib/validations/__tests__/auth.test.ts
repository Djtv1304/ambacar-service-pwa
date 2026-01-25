import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '../auth'

/**
 * FE-AUTH-001 a FE-AUTH-010: Pruebas de validación de schemas de autenticación
 * Cobertura: Inputs vacíos, formato email, contraseña
 */
describe('loginSchema', () => {
  describe('FE-AUTH-001: Validación de email', () => {
    it('debe rechazar email vacío', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El correo electrónico es requerido')
      }
    })

    it('debe rechazar email con formato inválido', () => {
      const result = loginSchema.safeParse({
        email: 'correo-invalido',
        password: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Correo electrónico inválido')
      }
    })

    it('debe rechazar email sin dominio', () => {
      const result = loginSchema.safeParse({
        email: 'usuario@',
        password: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Correo electrónico inválido')
      }
    })

    it('debe aceptar email válido', () => {
      const result = loginSchema.safeParse({
        email: 'usuario@empresa.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('FE-AUTH-002: Validación de contraseña', () => {
    it('debe rechazar contraseña vacía', () => {
      const result = loginSchema.safeParse({
        email: 'usuario@empresa.com',
        password: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La contraseña es requerida')
      }
    })

    it('debe rechazar contraseña menor a 6 caracteres', () => {
      const result = loginSchema.safeParse({
        email: 'usuario@empresa.com',
        password: '12345',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La contraseña debe tener al menos 6 caracteres')
      }
    })

    it('debe aceptar contraseña de 6 caracteres', () => {
      const result = loginSchema.safeParse({
        email: 'usuario@empresa.com',
        password: '123456',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('FE-AUTH-003: Validación completa del formulario', () => {
    it('debe rechazar formulario con ambos campos vacíos', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
      }
    })

    it('debe aceptar formulario válido completo', () => {
      const result = loginSchema.safeParse({
        email: 'admin@ambacar.ec',
        password: 'SecurePass123',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('admin@ambacar.ec')
        expect(result.data.password).toBe('SecurePass123')
      }
    })
  })
})

describe('registerSchema', () => {
  const validRegisterData = {
    email: 'nuevo@usuario.com',
    username: 'nuevouser',
    password: 'Password1',
    password_confirm: 'Password1',
    first_name: 'Juan',
    last_name: 'Pérez',
    cedula: '1234567890',
    phone: '+593 099 123 4567',
  }

  describe('FE-AUTH-004: Validación de username', () => {
    it('debe rechazar username menor a 3 caracteres', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        username: 'ab',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const usernameError = result.error.issues.find(i => i.path.includes('username'))
        expect(usernameError?.message).toBe('El nombre de usuario debe tener al menos 3 caracteres')
      }
    })

    it('debe rechazar username con caracteres especiales', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        username: 'user@name',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const usernameError = result.error.issues.find(i => i.path.includes('username'))
        expect(usernameError?.message).toBe('Solo letras, números y guiones bajos')
      }
    })

    it('debe aceptar username válido con guión bajo', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        username: 'user_name123',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('FE-AUTH-005: Validación de contraseña de registro', () => {
    it('debe rechazar contraseña sin mayúscula', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        password: 'password1',
        password_confirm: 'password1',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const passwordError = result.error.issues.find(i => i.path.includes('password'))
        expect(passwordError?.message).toBe('Debe contener al menos una mayúscula')
      }
    })

    it('debe rechazar contraseña sin minúscula', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        password: 'PASSWORD1',
        password_confirm: 'PASSWORD1',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const passwordError = result.error.issues.find(i => i.path.includes('password'))
        expect(passwordError?.message).toBe('Debe contener al menos una minúscula')
      }
    })

    it('debe rechazar contraseña sin número', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        password: 'Password',
        password_confirm: 'Password',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const passwordError = result.error.issues.find(i => i.path.includes('password'))
        expect(passwordError?.message).toBe('Debe contener al menos un número')
      }
    })

    it('debe rechazar contraseña menor a 8 caracteres', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        password: 'Pass1',
        password_confirm: 'Pass1',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const passwordError = result.error.issues.find(i => i.path.includes('password'))
        expect(passwordError?.message).toBe('La contraseña debe tener al menos 8 caracteres')
      }
    })
  })

  describe('FE-AUTH-006: Validación de confirmación de contraseña', () => {
    it('debe rechazar cuando las contraseñas no coinciden', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        password: 'Password1',
        password_confirm: 'Password2',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const confirmError = result.error.issues.find(i => i.path.includes('password_confirm'))
        expect(confirmError?.message).toBe('Las contraseñas no coinciden')
      }
    })

    it('debe aceptar cuando las contraseñas coinciden', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        password: 'Password1',
        password_confirm: 'Password1',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('FE-AUTH-007: Validación de cédula', () => {
    it('debe rechazar cédula con menos de 10 dígitos', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        cedula: '123456789',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const cedulaError = result.error.issues.find(i => i.path.includes('cedula'))
        expect(cedulaError?.message).toBe('La cédula debe tener exactamente 10 dígitos')
      }
    })

    it('debe rechazar cédula con más de 10 dígitos', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        cedula: '12345678901',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const cedulaError = result.error.issues.find(i => i.path.includes('cedula'))
        expect(cedulaError?.message).toBe('La cédula debe tener exactamente 10 dígitos')
      }
    })

    it('debe rechazar cédula con letras', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        cedula: '123456789A',
      })
      expect(result.success).toBe(false)
    })

    it('debe aceptar cédula válida de 10 dígitos', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        cedula: '1712345678',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('FE-AUTH-008: Validación de teléfono', () => {
    it('debe rechazar teléfono sin formato ecuatoriano', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        phone: '0991234567',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const phoneError = result.error.issues.find(i => i.path.includes('phone'))
        expect(phoneError?.message).toBe('Formato inválido. Debe ser +593 0XX XXX XXXX')
      }
    })

    it('debe aceptar teléfono con formato correcto', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        phone: '+593 099 123 4567',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('FE-AUTH-009: Validación de nombres', () => {
    it('debe rechazar nombre vacío', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        first_name: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const nameError = result.error.issues.find(i => i.path.includes('first_name'))
        expect(nameError?.message).toBe('El nombre es requerido')
      }
    })

    it('debe rechazar apellido vacío', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        last_name: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const lastNameError = result.error.issues.find(i => i.path.includes('last_name'))
        expect(lastNameError?.message).toBe('El apellido es requerido')
      }
    })
  })

  describe('FE-AUTH-010: Validación completa de registro', () => {
    it('debe aceptar formulario de registro válido completo', () => {
      const result = registerSchema.safeParse(validRegisterData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('nuevo@usuario.com')
        expect(result.data.username).toBe('nuevouser')
        expect(result.data.cedula).toBe('1234567890')
      }
    })
  })
})
