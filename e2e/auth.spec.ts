import { test, expect } from '@playwright/test'
import { testUsers } from './fixtures/test-data'

/**
 * FE-E2E-AUTH-001 a FE-E2E-AUTH-008: Pruebas E2E de Autenticación
 * Cobertura: Login, validaciones de formulario, redirección por rol
 */

test.describe('FE-E2E-AUTH: Flujo de Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de API de autenticación
    await page.route('**/api/auth/login/**', async (route) => {
      const body = route.request().postDataJSON()

      // Validar credenciales de prueba
      const validUser = Object.values(testUsers).find(
        u => u.email === body?.email && u.password === body?.password
      )

      if (validUser) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access: 'mock-access-token',
            refresh: 'mock-refresh-token',
            user: {
              id: 1,
              email: validUser.email,
              role: validUser.role,
              first_name: 'Test',
              last_name: 'User',
            },
          }),
        })
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: 'Credenciales inválidas',
          }),
        })
      }
    })

    // Mock de API /me
    await page.route('**/api/auth/me/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: testUsers.admin.email,
          role: 'admin',
          first_name: 'Admin',
          last_name: 'Test',
        }),
      })
    })
  })

  test('FE-E2E-AUTH-001: Página de login se carga correctamente', async ({ page }) => {
    await page.goto('/login')

    // Verificar elementos del formulario
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('FE-E2E-AUTH-002: Muestra error con campos vacíos', async ({ page }) => {
    await page.goto('/login')

    // Intentar enviar formulario vacío
    await page.click('button[type="submit"]')

    // Verificar mensaje de error
    const errorMessage = page.locator('text=/requerido|required/i, [role="alert"], .text-red')
    await expect(errorMessage.first()).toBeVisible({ timeout: 3000 })
  })

  test('FE-E2E-AUTH-003: Muestra error con email inválido', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"], input[name="email"]', 'email-invalido')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    const errorMessage = page.locator('text=/email|correo.*inválido/i')
    await expect(errorMessage).toBeVisible({ timeout: 3000 })
  })

  test('FE-E2E-AUTH-004: Muestra error con contraseña corta', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"], input[name="email"]', 'test@test.com')
    await page.fill('input[type="password"]', '123')
    await page.click('button[type="submit"]')

    const errorMessage = page.locator('text=/contraseña.*6|6.*caracteres|password.*short/i')
    await expect(errorMessage).toBeVisible({ timeout: 3000 })
  })

  test('FE-E2E-AUTH-005: Login exitoso redirige al dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"], input[name="email"]', testUsers.admin.email)
    await page.fill('input[type="password"]', testUsers.admin.password)
    await page.click('button[type="submit"]')

    // Verificar redirección
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
  })

  test('FE-E2E-AUTH-006: Credenciales incorrectas muestran error', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"], input[name="email"]', 'wrong@email.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    const errorMessage = page.locator('text=/inválid|incorrect|error/i, [role="alert"]')
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
  })

  test('FE-E2E-AUTH-007: Acceso a ruta protegida sin auth redirige a login', async ({ page }) => {
    // Intentar acceder directamente al dashboard
    await page.goto('/dashboard')

    // Debe redirigir a login
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })

  test('FE-E2E-AUTH-008: Toggle de mostrar/ocultar contraseña funciona', async ({ page }) => {
    await page.goto('/login')

    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill('mypassword123')

    // Buscar botón de toggle
    const toggleButton = page.locator('[data-testid="toggle-password"], button[aria-label*="password"], button:has(svg)')

    if (await toggleButton.first().isVisible()) {
      // El input empieza como password
      await expect(passwordInput).toHaveAttribute('type', 'password')

      // Click en toggle
      await toggleButton.first().click()

      // Ahora debe ser text
      const textInput = page.locator('input[name="password"][type="text"]')
      await expect(textInput).toBeVisible()
    }
  })
})
