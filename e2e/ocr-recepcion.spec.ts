import { test, expect, Page } from '@playwright/test'
import { testUsers } from './fixtures/test-data'

/**
 * FE-OCR-001 a FE-OCR-010: Pruebas E2E del módulo OCR y Recepción
 * Cobertura: Navegación y UI - NO crear datos en DB
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

test.describe('FE-OCR-001 a FE-OCR-005: Módulo de Recepción', () => {
  test('FE-OCR-001: Operador puede acceder a página de recepción', async ({ page }) => {
    await loginAs(page, 'operator')
    await page.goto('/dashboard/recepcion')
    await page.waitForSelector('main', { timeout: 10000 })

    await expect(page.locator('main')).toBeVisible({ timeout: 10000 })
  })

  test('FE-OCR-002: Página de nueva recepción tiene estructura correcta', async ({ page }) => {
    await loginAs(page, 'operator')
    await page.goto('/dashboard/recepcion/nueva')
    await page.waitForSelector('main', { timeout: 10000 })

    // Verificar que existe estructura básica
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 })
  })

  test('FE-OCR-003: Existe formulario en página de recepción', async ({ page }) => {
    await loginAs(page, 'operator')
    await page.goto('/dashboard/recepcion/nueva')
    await page.waitForSelector('main', { timeout: 10000 })

    // Verificar que hay un formulario
    const formOrInputs = page.locator('form, input, select')
    await expect(formOrInputs.first()).toBeVisible({ timeout: 10000 })
  })

  test('FE-OCR-004: Página de recepción tiene título o encabezado', async ({ page }) => {
    await loginAs(page, 'operator')
    await page.goto('/dashboard/recepcion')
    await page.waitForSelector('main', { timeout: 10000 })

    // Verificar encabezado
    const header = page.locator('h1, h2, [role="heading"]')
    await expect(header.first()).toBeVisible({ timeout: 10000 })
  })

  test('FE-OCR-005: Nueva recepción carga estructura del formulario', async ({ page }) => {
    await loginAs(page, 'operator')
    await page.goto('/dashboard/recepcion/nueva')
    await page.waitForSelector('main', { timeout: 10000 })

    // Verificar que la página tiene el título correcto
    await expect(page.locator('h1:has-text("Nueva Recepción"), h2:has-text("Nueva Recepción")')).toBeVisible({ timeout: 10000 })

    // Verificar que hay un stepper o estructura de pasos
    const stepper = page.locator('[class*="stepper"], [class*="step"], .rounded-full')
    const stepperCount = await stepper.count()
    expect(stepperCount).toBeGreaterThan(0)
  })
})

test.describe('FE-OCR-006 a FE-OCR-010: Navegación de Operador', () => {
  test('FE-OCR-006: Operador puede ver sidebar completo', async ({ page }) => {
    await loginAs(page, 'operator')
    await page.waitForSelector('main', { timeout: 10000 })

    // Verificar que el sidebar o navegación está visible
    const sidebar = page.locator('nav, aside, [data-testid="sidebar"]')
    await expect(sidebar.first()).toBeVisible({ timeout: 10000 })
  })

  test('FE-OCR-007: Operador puede ver link a Recepción', async ({ page }) => {
    await loginAs(page, 'operator')
    await page.waitForSelector('main', { timeout: 10000 })

    const recepcionLink = page.locator('a:has-text("Recepción"), a[href*="recepcion"]')
    await expect(recepcionLink.first()).toBeVisible({ timeout: 10000 })
  })

  test('FE-OCR-008: Operador puede ver link a OT', async ({ page }) => {
    await loginAs(page, 'operator')
    await page.waitForSelector('main', { timeout: 10000 })

    // Buscar link de órdenes de trabajo
    const otLink = page.locator('a:has-text("Órdenes"), a[href*="/ot"]')
    await expect(otLink.first()).toBeVisible({ timeout: 10000 })
  })

  test('FE-OCR-009: Operador puede ver link a Clientes', async ({ page }) => {
    await loginAs(page, 'operator')
    await page.waitForSelector('main', { timeout: 10000 })

    const clientesLink = page.locator('a:has-text("Clientes"), a[href*="clientes"]')
    await expect(clientesLink.first()).toBeVisible({ timeout: 10000 })
  })

  test('FE-OCR-010: Operador puede navegar entre páginas', async ({ page }) => {
    await loginAs(page, 'operator')

    // Navegar a recepción
    await page.goto('/dashboard/recepcion')
    await expect(page).toHaveURL(/recepcion/)

    // Navegar a OT
    await page.goto('/dashboard/ot')
    await expect(page).toHaveURL(/ot/)

    // Navegar a clientes
    await page.goto('/dashboard/clientes')
    await expect(page).toHaveURL(/clientes/)
  })
})
