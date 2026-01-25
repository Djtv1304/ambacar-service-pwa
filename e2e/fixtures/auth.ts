import { Page, expect } from '@playwright/test'
import { testUsers } from './test-data'

/**
 * Helper para login en tests E2E
 */
export async function loginAs(
  page: Page,
  role: keyof typeof testUsers
): Promise<void> {
  const user = testUsers[role]

  await page.goto('/login')

  // Esperar a que el formulario esté visible
  await expect(page.locator('form')).toBeVisible()

  // Llenar credenciales
  await page.fill('input[name="email"], input[type="email"]', user.email)
  await page.fill('input[name="password"], input[type="password"]', user.password)

  // Enviar formulario
  await page.click('button[type="submit"]')

  // Esperar redirección al dashboard
  await page.waitForURL(/dashboard/, { timeout: 10000 })
}

/**
 * Helper para logout
 */
export async function logout(page: Page): Promise<void> {
  // Buscar botón de logout o menú de usuario
  const userMenu = page.locator('[data-testid="user-menu"], [aria-label="User menu"]')

  if (await userMenu.isVisible()) {
    await userMenu.click()
    await page.click('text=Cerrar sesión')
  } else {
    // Fallback: ir directamente a logout
    await page.goto('/api/auth/logout')
  }

  await page.waitForURL(/login/)
}

/**
 * Verificar que el usuario está autenticado
 */
export async function assertAuthenticated(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="dashboard"], .dashboard')).toBeVisible({
    timeout: 5000,
  })
}

/**
 * Verificar rol del usuario actual
 */
export async function assertUserRole(page: Page, expectedRole: string): Promise<void> {
  // Esto depende de cómo se muestra el rol en la UI
  const roleIndicator = page.locator(`[data-role="${expectedRole}"], [data-testid="role-${expectedRole}"]`)
  await expect(roleIndicator).toBeVisible()
}
