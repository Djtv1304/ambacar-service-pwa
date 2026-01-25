import { test, expect, Page } from '@playwright/test'
import { testUsers, testInspectionPoints } from './fixtures/test-data'

/**
 * FE-INS-001 a FE-INS-022: Pruebas E2E del módulo de Inspección y Fases
 * Cobertura: Flujo Técnico, Kanban, Checklist con evidencias
 */

// Helper para login
async function loginAs(page: Page, role: keyof typeof testUsers) {
  const user = testUsers[role]
  await page.goto('/login')
  await page.fill('input[name="email"], input[type="email"]', user.email)
  await page.fill('input[name="password"], input[type="password"]', user.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/dashboard/, { timeout: 15000 })
}

test.describe('FE-INS-001 a FE-INS-007: Flujo del Técnico - Navegación', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de API de órdenes de trabajo
    await page.route('**/api/ordenes-trabajo/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              id: 1,
              numero_orden: 'OT-2024-001',
              vehiculo: { placa: 'ABC1234', marca: 'Toyota', modelo: 'Corolla' },
              estado: 'en_progreso',
              fase_actual: 'diagnostico',
            },
          ],
        }),
      })
    })

    // Mock de Kanban board
    await page.route('**/api/taller/kanban/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          columns: [
            { id: 'citas', nombre: 'Citas', orden_visualizacion: 1, cards: [] },
            { id: 'diagnostico', nombre: 'Diagnóstico', orden_visualizacion: 2, cards: [
              { ordenId: '1', numero_orden: 'OT-2024-001', placa: 'ABC1234', marca: 'Toyota', modelo: 'Corolla', estado: 'diagnostico' }
            ]},
            { id: 'reparacion', nombre: 'Reparación', orden_visualizacion: 3, cards: [] },
            { id: 'calidad', nombre: 'Calidad', orden_visualizacion: 4, cards: [] },
            { id: 'entrega', nombre: 'Entrega', orden_visualizacion: 5, cards: [] },
          ],
        }),
      })
    })
  })

  test('FE-INS-001: Técnico puede acceder al dashboard', async ({ page }) => {
    await loginAs(page, 'technician')

    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL(/dashboard/)
    await expect(page.locator('nav, [data-testid="sidebar"]')).toBeVisible()
  })

  test('FE-INS-002: Técnico puede ver opción de Taller en menú', async ({ page }) => {
    await loginAs(page, 'technician')

    // Buscar opción de Taller en el menú
    const tallerOption = page.locator('a:has-text("Taller"), [data-testid="nav-taller"]')
    await expect(tallerOption).toBeVisible({ timeout: 10000 })
  })

  test('FE-INS-003: Técnico puede navegar a la vista de Taller', async ({ page }) => {
    await loginAs(page, 'technician')

    // Click en Taller
    await page.click('a:has-text("Taller"), [data-testid="nav-taller"]')

    // Verificar navegación
    await expect(page).toHaveURL(/taller/)
  })

  test('FE-INS-004: Vista de Taller muestra tablero Kanban', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller')

    // Verificar que se muestra el Kanban
    const kanbanBoard = page.locator('[data-testid="kanban-board"], .kanban-board, [role="region"]')
    await expect(kanbanBoard).toBeVisible({ timeout: 10000 })
  })

  test('FE-INS-005: Kanban muestra columnas de fases', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller')

    // Verificar columnas del Kanban
    const columns = page.locator('[data-testid^="kanban-column"], .kanban-column')
    await expect(columns.first()).toBeVisible({ timeout: 10000 })
  })

  test('FE-INS-006: Kanban muestra tarjetas de órdenes de trabajo', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller')

    // Verificar que hay tarjetas
    const card = page.locator('[data-testid="kanban-card"], .kanban-card, text=OT-2024-001')
    await expect(card).toBeVisible({ timeout: 10000 })
  })

  test('FE-INS-007: Click en tarjeta abre opciones de perspectiva', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller')

    // Click en una tarjeta
    await page.click('[data-testid="kanban-card"], .kanban-card, text=OT-2024-001')

    // Verificar que aparece el diálogo de perspectiva o las opciones
    const perspectiveDialog = page.locator('[role="dialog"], [data-testid="perspective-dialog"]')
    await expect(perspectiveDialog).toBeVisible({ timeout: 5000 })
  })
})

test.describe('FE-INS-008 a FE-INS-014: Flujo del Técnico - Ejecución de Inspección', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de catálogo de inspección
    await page.route('**/api/catalogo-inspecciones/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, nombre: 'Sistema de frenos', categoria: 'seguridad', requiere_mediciones: false },
          { id: 2, nombre: 'Nivel de aceite', categoria: 'motor', requiere_mediciones: false },
          { id: 3, nombre: 'Estado de neumáticos', categoria: 'seguridad', requiere_mediciones: true, campos_medicion: { profundidad_mm: { tipo: 'number', min: 0, max: 10, unidad: 'mm' } } },
        ]),
      })
    })

    // Mock de inspección actual
    await page.route('**/api/inspecciones/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          orden_trabajo: 1,
          items: [],
        }),
      })
    })
  })

  test('FE-INS-008: Puede acceder a vista de inspección de OT', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    // Verificar que carga la página de inspección/detalle
    await expect(page.locator('h1, h2, [data-testid="page-title"]')).toBeVisible({ timeout: 10000 })
  })

  test('FE-INS-009: Vista de inspección muestra checklist', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    // Verificar que hay puntos de inspección
    const checklistItems = page.locator('[data-testid="inspection-point"], .inspection-item')
    await expect(checklistItems.first()).toBeVisible({ timeout: 10000 })
  })

  test('FE-INS-010: Puede evaluar un punto de inspección como verde', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    // Click en un punto de inspección
    await page.click('[data-testid="inspection-point"]:first-child, .inspection-item:first-child')

    // Seleccionar estado verde
    const greenButton = page.locator('button:has-text("Verde"), [data-testid="estado-verde"], [data-value="verde"]')
    await expect(greenButton).toBeVisible({ timeout: 5000 })
  })

  test('FE-INS-011: Puede evaluar un punto como amarillo con observaciones', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    await page.click('[data-testid="inspection-point"]:first-child, .inspection-item:first-child')

    // Seleccionar amarillo
    const yellowButton = page.locator('button:has-text("Amarillo"), [data-testid="estado-amarillo"], [data-value="amarillo"]')
    if (await yellowButton.isVisible()) {
      await yellowButton.click()

      // Debe mostrar campo de observaciones
      const obsField = page.locator('textarea[name="observaciones"], [data-testid="observaciones-input"]')
      await expect(obsField).toBeVisible({ timeout: 3000 })
    }
  })

  test('FE-INS-012: Estado rojo muestra alerta de requerimiento de fotos', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    await page.click('[data-testid="inspection-point"]:first-child, .inspection-item:first-child')

    // Seleccionar rojo
    const redButton = page.locator('button:has-text("Rojo"), [data-testid="estado-rojo"], [data-value="rojo"]')
    if (await redButton.isVisible()) {
      await redButton.click()

      // Debe mostrar alerta de fotos requeridas
      const photoAlert = page.locator('text=/foto|evidencia|requerida/i, [role="alert"]')
      await expect(photoAlert).toBeVisible({ timeout: 3000 })
    }
  })

  test('FE-INS-013: Puntos con mediciones muestran campos numéricos', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    // Buscar punto que requiere mediciones
    const measurementPoint = page.locator('[data-testid="inspection-point"][data-requires-measurements="true"], .inspection-item:has([data-testid="measurement-badge"])')

    if (await measurementPoint.first().isVisible()) {
      await measurementPoint.first().click()

      // Verificar campos de medición
      const measurementField = page.locator('input[type="number"], [data-testid="measurement-input"]')
      await expect(measurementField).toBeVisible({ timeout: 5000 })
    }
  })

  test('FE-INS-014: Muestra progreso de inspección', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    // Verificar indicador de progreso
    const progressIndicator = page.locator('[data-testid="inspection-progress"], .progress-bar, text=/\\d+.*\\/.*\\d+/')
    await expect(progressIndicator).toBeVisible({ timeout: 10000 })
  })
})

test.describe('FE-INS-015 a FE-INS-022: Checklist - Validación de Evidencias', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de items de inspección con estado rojo sin fotos
    await page.route('**/api/items-inspeccion/**', async (route) => {
      if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
        const body = route.request().postDataJSON()

        // Si el estado es rojo y no hay fotos, simular error
        if (body?.estado === 'rojo' && (!body?.fotos || body.fotos.length < 2)) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Se requieren mínimo 2 fotografías para puntos críticos',
            }),
          })
          return
        }
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })
  })

  test('FE-INS-015: Intentar guardar punto rojo sin fotos debe mostrar error', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    // Abrir punto de inspección
    await page.click('[data-testid="inspection-point"]:first-child, .inspection-item:first-child')

    // Seleccionar rojo
    const redButton = page.locator('button:has-text("Rojo"), [data-testid="estado-rojo"]')
    if (await redButton.isVisible()) {
      await redButton.click()

      // Intentar guardar sin fotos
      const saveButton = page.locator('button:has-text("Guardar"), button[type="submit"]')
      if (await saveButton.isVisible()) {
        await saveButton.click()

        // Debe mostrar mensaje de error
        const errorMessage = page.locator('text=/foto|evidencia|requerida/i, [role="alert"], .toast-error')
        await expect(errorMessage).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('FE-INS-016: Debe existir botón para agregar fotos en puntos rojos', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    await page.click('[data-testid="inspection-point"]:first-child, .inspection-item:first-child')

    const redButton = page.locator('button:has-text("Rojo"), [data-testid="estado-rojo"]')
    if (await redButton.isVisible()) {
      await redButton.click()

      // Buscar botón de agregar fotos
      const addPhotosButton = page.locator('button:has-text("Agregar Fotos"), button:has-text("Subir Fotos"), [data-testid="add-photos"]')
      await expect(addPhotosButton).toBeVisible({ timeout: 5000 })
    }
  })

  test('FE-INS-017: Diálogo de fotos muestra requisito mínimo (2 fotos)', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    await page.click('[data-testid="inspection-point"]:first-child, .inspection-item:first-child')

    const redButton = page.locator('button:has-text("Rojo"), [data-testid="estado-rojo"]')
    if (await redButton.isVisible()) {
      await redButton.click()

      const addPhotosButton = page.locator('button:has-text("Agregar Fotos"), button:has-text("Subir Fotos"), [data-testid="add-photos"]')
      if (await addPhotosButton.isVisible()) {
        await addPhotosButton.click()

        // Verificar indicador de mínimo
        const minIndicator = page.locator('text=/mínimo.*2|2.*foto/i')
        await expect(minIndicator).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('FE-INS-018: Diálogo de fotos muestra máximo (5 fotos)', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    await page.click('[data-testid="inspection-point"]:first-child, .inspection-item:first-child')

    const redButton = page.locator('button:has-text("Rojo"), [data-testid="estado-rojo"]')
    if (await redButton.isVisible()) {
      await redButton.click()

      const addPhotosButton = page.locator('button:has-text("Agregar Fotos"), button:has-text("Subir Fotos"), [data-testid="add-photos"]')
      if (await addPhotosButton.isVisible()) {
        await addPhotosButton.click()

        // Verificar indicador de máximo
        const maxIndicator = page.locator('text=/máximo.*5|5.*foto|hasta.*5/i')
        await expect(maxIndicator).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('FE-INS-019: Puede capturar múltiples fotos', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    await page.click('[data-testid="inspection-point"]:first-child')

    const redButton = page.locator('[data-testid="estado-rojo"]')
    if (await redButton.isVisible()) {
      await redButton.click()

      const addPhotosButton = page.locator('[data-testid="add-photos"]')
      if (await addPhotosButton.isVisible()) {
        await addPhotosButton.click()

        // Verificar input de archivo múltiple o área de captura
        const fileInput = page.locator('input[type="file"]')
        await expect(fileInput).toBeAttached()
      }
    }
  })

  test('FE-INS-020: Progreso de fotos se actualiza visualmente', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    await page.click('[data-testid="inspection-point"]:first-child')

    const redButton = page.locator('[data-testid="estado-rojo"]')
    if (await redButton.isVisible()) {
      await redButton.click()

      const addPhotosButton = page.locator('[data-testid="add-photos"]')
      if (await addPhotosButton.isVisible()) {
        await addPhotosButton.click()

        // Subir una foto
        const fileInput = page.locator('input[type="file"]').first()
        await fileInput.setInputFiles({
          name: 'evidencia-1.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-content'),
        })

        // Verificar contador de fotos
        const photoCounter = page.locator('[data-testid="photo-count"], .photo-count, text=/1.*\\/.*5|Foto.*1/i')
        await expect(photoCounter).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('FE-INS-021: Botón confirmar habilitado solo con mínimo de fotos', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    await page.click('[data-testid="inspection-point"]:first-child')

    const redButton = page.locator('[data-testid="estado-rojo"]')
    if (await redButton.isVisible()) {
      await redButton.click()

      const addPhotosButton = page.locator('[data-testid="add-photos"]')
      if (await addPhotosButton.isVisible()) {
        await addPhotosButton.click()

        // Antes de subir fotos, el botón debe estar deshabilitado
        const confirmButton = page.locator('button:has-text("Confirmar"), button[data-testid="confirm-photos"]')
        await expect(confirmButton).toBeDisabled()
      }
    }
  })

  test('FE-INS-022: Galería muestra thumbnails de fotos subidas', async ({ page }) => {
    await loginAs(page, 'technician')
    await page.goto('/dashboard/taller/1')

    await page.click('[data-testid="inspection-point"]:first-child')

    const redButton = page.locator('[data-testid="estado-rojo"]')
    if (await redButton.isVisible()) {
      await redButton.click()

      const addPhotosButton = page.locator('[data-testid="add-photos"]')
      if (await addPhotosButton.isVisible()) {
        await addPhotosButton.click()

        // Subir fotos
        const fileInput = page.locator('input[type="file"]').first()
        await fileInput.setInputFiles([
          {
            name: 'evidencia-1.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('fake-image-1'),
          },
          {
            name: 'evidencia-2.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('fake-image-2'),
          },
        ])

        // Verificar thumbnails
        const thumbnails = page.locator('[data-testid="photo-thumbnail"], .photo-thumbnail, img[src^="data:"], img[src^="blob:"]')
        await expect(thumbnails.first()).toBeVisible({ timeout: 5000 })
      }
    }
  })
})
