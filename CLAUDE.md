# CLAUDE.md - Ambacar Service Project Guidelines

This file provides context, architectural guidelines, and coding standards for the Ambacar Service PWA.

## 🛠 Tech Stack & Core Libraries
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS v4 + Shadcn/UI
- **Icons:** Lucide React
- **Animations:** Framer Motion (`AnimatePresence`, `motion.div`)
- **Forms:** React Hook Form + Zod (`lib/validations`)
- **Testing:** Vitest (Unit/Integration) & Playwright (E2E)
- **State Management:** React Context (e.g., `sidebar-context.tsx`) + Hooks
- **Mocking:** Heavy reliance on local fixtures (`lib/fixtures/*.ts`) for UI development.

## 🏗 Architecture & Directory Structure
- **`app/`**: App Router structure.
    - `(auth)/`: Authentication routes (login, register).
    - `dashboard/`: Protected application area. Feature-based folders (e.g., `notificaciones`, `ot`, `citas`).
- **`components/`**:
    - `ui/`: Generic, reusable Shadcn components.
    - `[feature]/`: Domain-specific components (e.g., `dashboard/sidebar.tsx`, `inspeccion/camera-dialog.tsx`).
- **`lib/`**: Core logic.
    - `fixtures/`: Static data for development/testing (CRITICAL: Use these instead of empty arrays).
    - `validations/`: Zod schemas shared between frontend and backend logic.
    - `hooks/`: Custom hooks (e.g., `use-mobile.tsx`, `use-service-data.ts`).

## 🚀 Build & Test Commands
- **Dev Server:** `pnpm dev`
- **Linting:** `pnpm lint`
- **Build:** `pnpm build`
- **Unit Tests:** `pnpm test` (Vitest)
- **E2E Tests:** `pnpm test:e2e` (Playwright)

## 🎨 UI/UX Design Principles (Strict)
1.  **Mobile First & Thumb Zone:**
    - Critical actions on mobile must be placed in the bottom "Thumb Zone".
    - Sidebars/Drawers on mobile must be Overlays (`fixed`, `z-50`) and initialize as **Closed/Hidden**.
    - Mobile navigation triggers (FAB) should be bottom-left or bottom-right, avoiding top header conflicts.
2.  **Dark Mode Compliance:**
    - **MANDATORY:** Every component must include `dark:` variant classes.
    - Example: `bg-white dark:bg-gray-950`, `text-gray-900 dark:text-gray-100`, `border-gray-200 dark:border-gray-800`.
3.  **Layout & Spacing:**
    - Use CSS Grid or Flex (`grid-cols-12`).
    - Prioritize information density without clutter. Use Accordions and Tabs to organize complex forms (e.g., Notification Matrix).
    - Alerts/Warnings must be at the **top** of the view hierarchy.

## 📝 Coding Standards
- **Naming:** Kebab-case for files and components (`stat-card.tsx`).
- **Imports:** Use absolute imports `@/` for everything.
- **Component Structure:**
    - Keep components small and focused.
    - Separate logic into custom hooks if a component exceeds ~150 lines.
    - Use `"use client"` directive only when interaction or hooks are needed.
- **Data Fetching:**
    - For now, simulate data fetching using `lib/fixtures` until the API is ready.
    - Use `useEffect` or `SWR` patterns (simulated) for async data loading with Skeleton states.
- **Error Handling:** Use `sonner` or `use-toast` for user feedback on actions (Success/Error).
- **Type Organization:**
    - **Module-Specific Types:** Types that are specific to a business module should be defined in the same file where they're used (e.g., API files in `lib/api/`).
    - **Shared/Global Types:** Only types used across multiple modules should live in `lib/types.ts`.
    - **Examples:**
        - ✅ `Sucursal` type used only in agendamiento → Define in `lib/api/agendamiento.ts`
        - ✅ `Cliente`, `Vehiculo` used across multiple features → Keep in `lib/types.ts`
    - This approach maintains better modularity and reduces coupling between business domains.

## 🔒 Roles & Permissions (RBAC)
The system has distinct views based on `UserRole`:
1.  **Manager (Jefe de Taller):** Full configuration access, Notification Orchestration, Reports.
2.  **Operator:** Read/Write operational data (OTs, Inspections), Read-only configuration.
3.  **Technician:** Execution of services, Checklist filling.
4.  **Customer:** View own data, vehicles, edit contact info, configure personal notifications.
    * *Note:* Customer views often require simplified layouts compared to internal staff views.

## 🧠 Specific Logic Patterns
- **Notification Engine:** Based on Observer Pattern logic. Events (e.g., `FaseFinalizada`) trigger rules defined in the Orchestration Matrix. Fallback logic: Email -> WhatsApp -> Push.
- **Sidebar Logic:** Separate `DesktopSidebar` (Push) and `MobileSidebar` (Overlay). State managed via `SidebarContext`.

## 🔔 Notification Microservice Integration

### Architecture
The application integrates with a Django-based notification microservice for:
- Dispatching notifications (Push, Email, WhatsApp)
- Managing notification templates
- Orchestrating multi-channel notifications

### Base URL Configuration
```typescript
NEXT_PUBLIC_NOTIFICATIONS_API_URL=http://localhost:8001
```

### 1. Dispatching Notifications (`lib/api/notifications.ts`)

**Endpoint:** `POST /api/v1/notifications/events/dispatch/`

**Use Cases:**
- User registration → Welcome notification
- Login detected → Security alert
- Appointment scheduled → Confirmation
- Service phase changes → Progress updates

**Payload Structure:**
```typescript
interface NotificationDispatchPayload {
  event_type: "custom"
  service_type_id?: string | null
  phase_id?: string | null
  customer_id: string
  target: "clients" | "staff"
  context: Record<string, string> // Template variables
}
```

**Context Helpers:**
- `buildRegistrationContext()` - Welcome message with customer name
- `buildLoginContext()` - Security alert with date/time
- `buildAppointmentContext()` - Appointment details (plate, vehicle, workshop, date, time)

**Implementation Pattern:**
```typescript
// After successful registration
try {
  const authToken = await getClientAccessToken()
  await dispatchNotificationEvent(
    {
      event_type: "custom",
      service_type_id: null,
      phase_id: null,
      customer_id: user.id.toString(),
      target: "clients",
      context: buildRegistrationContext({ customerName })
    },
    authToken
  )
} catch (error) {
  console.error("Notification dispatch failed:", error)
  // Don't block the main flow
}
```

**Key Points:**
- Notifications are fire-and-forget (non-blocking)
- Errors are logged but don't interrupt user flow
- JWT token required for authentication

### 2. Notification Templates API (`lib/api/notifications.ts`)

**Endpoint:** `GET /api/v1/notifications/templates/`

**Query Parameters:**
- `target`: `"clients"` | `"staff"`
- `page`: Page number (default: 1)

**Response Structure (Django Pagination):**
```typescript
interface TemplatesAPIResponse {
  count: number              // Total number of templates
  next: string | null        // URL to next page (null if last page)
  previous: string | null    // URL to previous page (null if first page)
  results: NotificationTemplateAPI[]  // Max 20 items per page
}
```

**Pagination Calculation:**
```typescript
const ITEMS_PER_PAGE = 20  // API returns max 20 items per page
const totalPages = Math.ceil(response.count / ITEMS_PER_PAGE)
```

**Template Structure:**
```typescript
interface NotificationTemplateAPI {
  id: string
  name: string
  subject: string | null
  body: string
  channel: "push" | "email" | "whatsapp"
  target: "clients" | "staff"
  is_default: boolean
  is_active: boolean
  taller_id: string | null
  service_type_id: string | null
  service_type_name: string | null
  phase_id: string | null
  phase_name: string | null
  subtype_id: string | null
  subtype_name: string | null
  variables: string[]
  preview: string
  created_at: string
  updated_at: string
}
```

### 3. Templates Hook Pattern (`hooks/use-notification-templates.ts`)

**Cache Strategy:**
- Independent cache for "clients" and "staff" tabs
- Only current page is cached (changing pages = new request)
- Switching tabs uses cached data (instant transition)
- Refresh button invalidates cache

**Hook Usage:**
```typescript
const {
  templates,      // Current page templates
  totalCount,     // Total templates from API count
  currentPage,    // Current page number
  totalPages,     // Calculated: Math.ceil(count / 20)
  isLoading,      // Loading state
  error,          // Error message if failed
  setPage,        // Change page function
  refresh         // Invalidate cache and refetch
} = useNotificationTemplates("clients")
```

**Component Pattern:**
```typescript
// Separate hooks for each tab (independent cache)
const clientsHook = useNotificationTemplates("clients")
const staffHook = useNotificationTemplates("staff")

// Render based on current tab
{clientsHook.isLoading ? (
  <TemplatesLoadingSkeleton />
) : clientsHook.templates.length === 0 ? (
  <EmptyTemplatesState target="clients" />
) : (
  <TemplateCards templates={clientsHook.templates} />
)}

// Show pagination only if totalPages > 1
{clientsHook.totalPages > 1 && (
  <TemplatesPagination
    currentPage={clientsHook.currentPage}
    totalPages={clientsHook.totalPages}
    onPageChange={clientsHook.setPage}
  />
)}
```

## 🔄 Customer & Vehicle Synchronization

### Architecture
The PWA syncs customer and vehicle data with the notification microservice to enable personalized notifications.

### Security Pattern: Next.js API Routes
**Why:** Protect internal API keys from client-side exposure

**Environment Variable:**
```env
INTERNAL_API_SECRET_KEY=gkxdnJ/KXVNDHOP6DKSQVAhuNP7HbQO5Nw2XqC5BcQA=
```

**Flow:**
```
Client → Next.js API Route → Microservice
         (with API Key)
```

### 1. Customer Sync (`app/api/sync/customer/route.ts`)

**Internal Endpoint:** `POST /api/sync/customer`

**Microservice Endpoint:** `POST /api/internal/v1/customers/sync/`

**Payload:**
```typescript
interface SyncCustomerPayload {
  customer_id: string
  first_name: string
  last_name: string
  email: string
  phone: string          // No spaces: +593099123456
  whatsapp?: string      // No spaces: +593099123456
  sync_version: number   // Always 1 for now
}
```

**When to Sync:**
- ✅ During user registration (`app/(auth)/registro/page.tsx`)
- ❌ NOT during appointment creation (already synced)

**Phone Format:**
- **UI Display:** `+593 099 123 4567` (with spaces)
- **API Payload:** `+593099123456` (spaces removed via `.replace(/\s+/g, "")`)

### 2. Vehicle Sync (`app/api/sync/vehicle/route.ts`)

**Internal Endpoint:** `POST /api/sync/vehicle`

**Microservice Endpoint:** `POST /api/internal/v1/vehicles/sync/`

**Payload:**
```typescript
interface SyncVehiclePayload {
  vehicle_id: string
  customer_id: string
  plate: string
  brand: string
  model: string
  year: number
  current_kilometers: number
  last_service_date?: string | null
  next_service_kilometers?: number | null
  sync_version: number
}
```

**When to Sync:**
- ✅ When new vehicle is created in appointment flow (`app/agendamiento/nueva/page.tsx`)
- ❌ NOT when selecting existing vehicle

### 3. Sync Helper Functions (`lib/api/sync.ts`)

**Client-Side Helpers:**
```typescript
// For customers
export async function syncCustomer(
  cliente: ClienteData,
  customerId: string
): Promise<{ success: boolean; error?: string }>

// For vehicles
export async function syncVehicle(
  vehiculo: VehiculoData,
  customerId: string
): Promise<{ success: boolean; error?: string }>
```

**Error Handling:**
- Sync errors are logged but don't block user flow
- Success/failure returned for optional UI feedback
- No retry logic (keeps flow simple)

**Phone Cleaning Pattern:**
```typescript
// In buildSyncCustomerPayload
phone: cliente.telefono?.replace(/\s+/g, "") || ""
whatsapp: cliente.telefono?.replace(/\s+/g, "") || ""
```

### 4. Sync Implementation Pattern

**Registration Page (`app/(auth)/registro/page.tsx`):**
```typescript
if (result.success) {
  // 1. Refresh auth context
  await refreshUser()

  // 2. Sync customer to microservice
  try {
    const syncResult = await syncCustomer(clienteData, userId)
    if (!syncResult.success) {
      console.warn("Customer sync failed:", syncResult.error)
    }
  } catch (error) {
    console.error("Sync error:", error)
  }

  // 3. Dispatch welcome notification
  try {
    await dispatchNotificationEvent(...)
  } catch (error) {
    console.error("Notification error:", error)
  }

  // 4. Continue to dashboard
  router.push("/dashboard")
}
```

**Appointment Page (`app/agendamiento/nueva/page.tsx`):**
```typescript
// Only sync if NEW vehicle
if (nuevoVehiculo && savedVehiculo) {
  try {
    const syncResult = await syncVehicle(vehiculoData, customerId)
    if (!syncResult.success) {
      console.warn("Vehicle sync failed:", syncResult.error)
    }
  } catch (error) {
    console.error("Sync error:", error)
  }
}
```

## 🏭 Ambacar ERP (Zeus) Integration

### Architecture
The PWA integrates with Ambacar's ERP system (Zeus) for fetching agencies, stock, and workshop data.
Uses Next.js API Route proxies to avoid CORS issues and keep the ERP URL server-side only.

### Base URL Configuration (Server-side only)
```env
AMBACAR_ERP_API_URL=https://ambysoftapitest.ambacar.ec:8443
```

### Security Pattern: Next.js API Route Proxy
```
Client → /api/erp/agencias           → GET /Apis/Taller/ObtenerAgencias
Client → /api/erp/stock-repuestos     → GET /Apis/Taller/ObtenerStockRepuestos
Client → /api/erp/talleres            → GET /Apis/Taller/ObtenerTalleres
Client → /api/erp/asesores-servicio   → GET /Apis/Taller/ObtenerAsesoresServicio
Client → /api/erp/asesores-tecnicos   → GET /Apis/Taller/ObtenerAsesoresTecnico
         (all server-side, no CORS)
```

### 1. Fetching Agencies (`app/api/erp/agencias/route.ts`)

**Internal Endpoint:** `GET /api/erp/agencias`

**ERP Endpoint:** `GET /Apis/Taller/ObtenerAgencias`

**Authentication:** None required (public endpoint)

**Response Structure:**
```typescript
interface Agencia {
  idAgencia: string        // Agency code (e.g., "QC", "GR")
  nombreAgencia: string    // Display name (e.g., "CUENCA", "GRANADOS")
  ciudadAgencia: string    // City
  direccion: string        // Address
  urlComoLlegar: string | null  // Google Maps URL (nullable)
}
```

### 2. Agency Filtering
The ERP returns all agencies. The proxy filters to only include workshop-relevant ones:
```typescript
const ALLOWED_AGENCY_IDS = [
  "CU", "FC", "FI", "GR", "IN", "MA", "MS",
  "QA", "QC", "QL", "QN", "QP", "QS", "QT", "SR"
]
```

### 3. Client-Side Helper (`lib/api/erp-ambacar.ts`)

```typescript
import { getAgencias, type Agencia } from "@/lib/api/erp-ambacar"

const agencias = await getAgencias() // Fetches from /api/erp/agencias
```

### 4. Fetching Stock Repuestos (`app/api/erp/stock-repuestos/route.ts`)

**Internal Endpoint:** `GET /api/erp/stock-repuestos?idAgencia=XX&descripcion=TEXTO&page=1&pageSize=50`

**ERP Endpoint:** `GET /Apis/Taller/ObtenerStockRepuestos`

**Query Parameters:**
- `idAgencia` (required): Agency code from ObtenerAgencias
- `descripcion` (required): Search text (automatically uppercased by proxy)
- `page` (optional, default: 1): Page number
- `pageSize` (optional, default: 50): Items per page

**Response Structure:**
```typescript
interface StockResponse {
  page: number
  pageSize: number
  totalPages: number
  repuestos: RepuestoStock[]
}

interface RepuestoStock {
  agencia: string       // Agency code
  codigo: string        // Part code
  descripcion: string   // Part description (UPPERCASE from API)
  linea: string         // Brand/line (e.g., "GWM", "BYD")
  precio: number        // Unit price
  stockActual: number   // Current stock quantity
}
```

**Client-Side Usage:**
```typescript
import { getStockRepuestos } from "@/lib/api/erp-ambacar"

const result = await getStockRepuestos("QP", "FRENO", 1, 20)
// result.repuestos, result.totalPages, result.page
```

### 5. Usage in RepuestosList
- Shows a sucursal selector when an OT has `sucursal_detalle`
- Default-selects the OT's sucursal by matching `nombreAgencia` with `sucursal_detalle.nombre`
- "Agregar" button only visible when selected sucursal matches the OT's sucursal
- If OT has no sucursal info, selector is hidden and add functionality works normally
- Stock search section with debounced input (500ms), pagination, and animated results
- Names displayed in Title Case (e.g., "QUICENTRO SUR" → "Quicentro Sur")

**Error Handling:**
- Errors are caught and logged but do not block component rendering
- If agencies fail to load, the selector remains hidden
- Stock search errors clear results without crashing

### 6. Fetching Talleres (`app/api/erp/talleres/route.ts`)

**Internal Endpoint:** `GET /api/erp/talleres`

**ERP Endpoint:** `GET /Apis/Taller/ObtenerTalleres`

**Authentication:** None required (public endpoint)

**Response Structure:**
```typescript
interface Taller {
  idTaller: number       // Workshop ID (e.g., 10)
  nombreTaller: string   // Workshop name (e.g., "QUICENTRO SUR")
  idAgencia: string      // Agency code (e.g., "QS")
}
```

**Client-Side Usage:**
```typescript
import { getTalleres, type Taller } from "@/lib/api/erp-ambacar"

const talleres = await getTalleres() // Fetches from /api/erp/talleres
```

### 7. Talleres in Configuration Page

**File:** `app/dashboard/configuracion/page.tsx`

**Current Taller Constant:**
```typescript
const CURRENT_TALLER_ID = 10 // Quicentro Sur
```

**UI Pattern:**
- General tab has a segmented control toggle: "Mi Taller" | "Talleres"
- "Mi Taller" shows current workshop info (static for now)
- "Talleres" shows ScrollArea list of all workshops from ERP
- Current taller is highlighted with a Badge "Actual"
- Names displayed in Title Case (e.g., "QUICENTRO SUR" → "Quicentro Sur")

### 8. Fetching Asesores de Servicio (`app/api/erp/asesores-servicio/route.ts`)

**Internal Endpoint:** `GET /api/erp/asesores-servicio?idTaller=XX`

**ERP Endpoint:** `GET /Apis/Taller/ObtenerAsesoresServicio?idTaller=XX`

**Response Structure:**
```typescript
interface Empleado {
  idEmpleado: number       // Employee ID
  nombreEmpleado: string   // Full name (UPPERCASE from API)
}
```

### 9. Fetching Asesores Técnicos (`app/api/erp/asesores-tecnicos/route.ts`)

**Internal Endpoint:** `GET /api/erp/asesores-tecnicos?idTaller=XX`

**ERP Endpoint:** `GET /Apis/Taller/ObtenerAsesoresTecnico?idTaller=XX`

**Response:** Same `Empleado[]` structure as asesores de servicio.

**Client-Side Usage:**
```typescript
import { getAsesoresServicio, getAsesoresTecnicos, type Empleado } from "@/lib/api/erp-ambacar"
import { CURRENT_TALLER_ID } from "@/lib/constants/taller"

const asesores = await getAsesoresServicio(CURRENT_TALLER_ID)
const tecnicos = await getAsesoresTecnicos(CURRENT_TALLER_ID)
```

### 10. Centralized Taller Constants (`lib/constants/taller.ts`)

```typescript
export const CURRENT_TALLER_ID = 10       // Quicentro Sur
export const CURRENT_TALLER_NOMBRE = "Quicentro Sur"
```

Used by: `configuracion/page.tsx`, `kanban-board.tsx`

### 11. Staff Assignment in Kanban Board

**Pattern:** Visual-only assignment (no POST endpoint yet)

- **Citas column:** Assign Asesor de Servicio to appointments
- **Diagnóstico/Reparación columns:** Assign Técnico to work orders
- Staff lists fetched from ERP via `getAsesoresServicio` / `getAsesoresTecnicos`
- Assignment updates local state and shows toast confirmation
- Searchable Popover with employee list (names in Title Case)
- POST for persisting assignments will be implemented later

**Perspective Dialog:**
- Clicking a Kanban card shows a dialog with two options:
  - "Vista Técnico" → `/dashboard/taller/${ordenId}` (phase execution view)
  - "Vista Taller (OT)" → `/dashboard/ot/${ordenId}` (costs/repuestos/management view)

## 📊 Pagination Best Practices

### API-Driven Pagination
- **Always calculate from API response:** `totalPages = Math.ceil(count / ITEMS_PER_PAGE)`
- **Never hardcode page numbers** in pagination component
- **Check `next` field** to determine if next page exists
- **Use `count` field** to calculate total pages on first load

### Pagination Component Pattern
```typescript
<TemplatesPagination
  currentPage={currentPage}
  totalPages={totalPages}  // From API calculation
  onPageChange={setPage}
  isLoading={isLoading}
/>
```

### Dots Algorithm (for 5+ pages)
```typescript
// Shows: [1] [2] [3] ... [10] when currentPage=2
// Shows: [1] ... [4] [5] [6] ... [10] when currentPage=5
const getVisiblePages = () => {
  const delta = 2
  // Show current page ± 2, always show first and last
}
```

## 🧪 Testing Guidelines

### Testing Stack
- **Unit/Integration:** Vitest with jsdom environment
- **E2E:** Playwright with Chromium
- **Coverage:** v8 provider with HTML + LCOV reporters

### File Naming Conventions
```
component-name.test.tsx    # Unit tests for components
hook-name.test.ts          # Unit tests for hooks
api-module.test.ts         # Integration tests for API modules
flow-name.e2e.ts           # E2E tests for user flows
```

### Test Structure Pattern
```typescript
describe("ComponentName", () => {
  describe("rendering", () => {
    it("renders correctly with default props", () => {})
    it("renders loading state", () => {})
    it("renders error state", () => {})
  })

  describe("interactions", () => {
    it("handles click events", () => {})
    it("validates form inputs", () => {})
  })

  describe("edge cases", () => {
    it("handles empty data", () => {})
    it("handles API errors", () => {})
  })
})
```

### Mocking Strategy
- **API Calls:** Mock at the fetch level using `vi.mock` or MSW
- **Contexts:** Wrap components with mock providers
- **Hooks:** Use `renderHook` from `@testing-library/react`
- **Fixtures:** Use `/lib/fixtures` data for consistent test data

### Critical Paths to Test (Priority Order)
1. **Authentication Flow:** Login, register, token refresh, logout
2. **Agendamiento:** Complete booking flow (vehicle → service → date → confirm)
3. **OT Lifecycle:** Creation → diagnosis → repair → quality → delivery
4. **Kanban Operations:** Card movement, staff assignment
5. **Inspections:** Point evaluation, measurements, photo capture

### E2E Test Scenarios

**Flujo Cliente:**
```typescript
test("cliente puede agendar cita completa", async ({ page }) => {
  await page.goto("/agendamiento/nueva")
  // Select vehicle
  // Choose service
  // Pick date/time
  // Confirm booking
  await expect(page.locator("[data-testid=confirmation]")).toBeVisible()
})
```

**Flujo Operador:**
```typescript
test("operador puede hacer check-in de vehículo", async ({ page }) => {
  await loginAs(page, "operador")
  await page.goto("/dashboard/recepcion")
  // Find appointment
  // Start check-in
  // Fill form
  // Create OT
  await expect(page.locator("[data-testid=ot-created]")).toBeVisible()
})
```

### Accessibility Testing
- Use `axe-playwright` for automated a11y checks
- Test keyboard navigation for all interactive elements
- Verify ARIA labels on complex components (Kanban, dialogs)

### Performance Testing Thresholds
```typescript
// playwright.config.ts
expect.extend({
  async toHaveFCP(page, maxMs) {
    const fcp = await page.evaluate(() =>
      performance.getEntriesByName("first-contentful-paint")[0]?.startTime
    )
    return { pass: fcp < maxMs }
  }
})
```

### Test Data Management
- Use `/lib/fixtures` for predictable test data
- Never hardcode IDs that depend on database state
- Reset test state between E2E runs

### CI/CD Integration
```yaml
# Recommended test stages
- lint: pnpm lint
- unit: pnpm test --coverage
- e2e: pnpm test:e2e
- quality-gate: coverage > 70%, no critical bugs
```

## 📋 Testing Quadrants Reference

### Q1 - Unit Tests (Technology-facing, Team Support)
- Component rendering
- Hook behavior
- Utility functions
- Zod schema validation
- API client error handling

### Q2 - Functional Tests (Business-facing, Team Support)
- User story acceptance tests
- Form validation flows
- CRUD operations
- Role-based access verification

### Q3 - Exploratory Tests (Business-facing, Product Critique)
- Usability sessions
- Edge case discovery
- Mobile experience validation
- Dark mode consistency

### Q4 - Non-functional Tests (Technology-facing, Product Critique)
- Performance (Core Web Vitals)
- Security (Auth, CORS, input sanitization)
- Load testing (concurrent users)
- Browser compatibility