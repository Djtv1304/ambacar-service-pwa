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