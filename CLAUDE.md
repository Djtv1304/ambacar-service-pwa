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