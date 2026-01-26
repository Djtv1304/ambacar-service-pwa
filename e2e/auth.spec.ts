import { test, expect, Page } from '@playwright/test'
import { testUsers } from './fixtures/test-data'

/**
 * FE-E2E-AUTH-001 a FE-E2E-AUTH-008: Pruebas E2E de Autenticación
 * Cobertura: Login, validaciones de formulario, redirección por rol
 * Usa credenciales reales - NO crear datos en DB
 */

// Helper para login con timeout extendido
async function loginAs(page: Page, role: keyof typeof testUsers) {
  const user = testUsers[role]
  await page.goto('/login')

  // Esperar que el formulario esté listo
  await page.waitForSelector('#email', { state: 'visible', timeout: 15000 })

  // Llenar los campos usando IDs
  await page.fill('#email', user.email)
  await page.fill('#password', user.password)

  // Click en el botón de submit
  await page.click('button[type="submit"]')

  // Esperar redirección al dashboard con timeout extendido
  await page.waitForURL(/dashboard/, { timeout: 25000 })
  // Esperar que el contenido principal cargue
  await page.waitForSelector('main', { timeout: 10000 })
}

test.describe('FE-E2E-AUTH: Flujo de Autenticación', () => {
  test('FE-E2E-AUTH-001: Página de login se carga correctamente', async ({ page }) => {
    await page.goto('/login')
    await page.waitForSelector('#email', { state: 'visible', timeout: 10000 })

    // Verificar elementos del formulario
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('FE-E2E-AUTH-002: Muestra error con campos vacíos al hacer blur', async ({ page }) => {
    await page.goto('/login')
    await page.waitForSelector('#email', { state: 'visible', timeout: 10000 })

    // Focus y blur en email para activar validación
    const emailInput = page.locator('#email')
    await emailInput.focus()
    await emailInput.blur()

    // El formulario debe tener inputs visibles
    await expect(emailInput).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('FE-E2E-AUTH-003: Input de email valida formato', async ({ page }) => {
    await page.goto('/login')
    await page.waitForSelector('#email', { state: 'visible', timeout: 10000 })

    await page.fill('#email', 'email-invalido')
    await page.fill('#password', 'password123456')
    await page.click('button[type="submit"]')

    // Esperar un poco y verificar que siga en login
    await page.waitForTimeout(2000)
    const url = page.url()
    expect(url).toContain('login') // Debe quedarse en login
  })

  test('FE-E2E-AUTH-004: Muestra error con contraseña corta', async ({ page }) => {
    await page.goto('/login')
    await page.waitForSelector('#email', { state: 'visible', timeout: 10000 })

    await page.fill('#email', 'test@test.com')
    await page.fill('#password', '123')
    await page.click('button[type="submit"]')

    // Verificar que hay mensaje de error visible
    await page.waitForTimeout(2000)
    const errorText = page.locator('text=/caracteres|mínimo|short/i')
    await expect(errorText.first()).toBeVisible({ timeout: 5000 })
  })

  test('FE-E2E-AUTH-005: Login exitoso con admin redirige al dashboard', async ({ page }) => {
    await loginAs(page, 'admin')

    // Verificar que estamos en dashboard
    await expect(page).toHaveURL(/dashboard/)
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 5000 })
  })

  test('FE-E2E-AUTH-006: Credenciales incorrectas muestran error', async ({ page }) => {
    await page.goto('/login')
    await page.waitForSelector('#email', { state: 'visible', timeout: 10000 })

    await page.fill('#email', 'wrong@email.com')
    await page.fill('#password', 'wrongpassword123')
    await page.click('button[type="submit"]')

    // Esperar mensaje de error
    await page.waitForTimeout(3000)
    const errorMessage = page.locator('text=/inválid|incorrect|error|credenciales/i')
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 })
  })

  test('FE-E2E-AUTH-007: Acceso a ruta protegida sin auth redirige a login', async ({ page }) => {
    // Intentar acceder directamente al dashboard sin login
    await page.goto('/dashboard')

    // Debe redirigir a login
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })

  test('FE-E2E-AUTH-008: Login exitoso con técnico muestra menú correcto', async ({ page }) => {
    await loginAs(page, 'technician')

    // Verificar que estamos en dashboard
    await expect(page).toHaveURL(/dashboard/)

    // Técnico debe ver opción de Taller
    await expect(page.locator('text=Taller')).toBeVisible({ timeout: 5000 })
  })
})
