# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

Common commands for development in this repository. Use `pnpm` as the package manager.

- **Development**: `pnpm dev` (Start development server)
- **Build**: `pnpm build` (Build for production)
- **Lint**: `pnpm lint` (Run ESLint)
- **Testing (Unit/Integration)**:
  - `pnpm test` (Run Vitest)
  - `pnpm test:ui` (Run Vitest with UI)
  - `pnpm test:coverage` (Run tests with coverage)
- **Testing (E2E)**:
  - `pnpm test:e2e` (Run Playwright tests)
  - `pnpm test:e2e:ui` (Run Playwright in UI mode)
  - `pnpm test:e2e:report` (Show Playwright report)

## Architecture

This project uses **Next.js 15 (App Router)** with **TypeScript**, **Tailwind CSS v4**, and **Shadcn/UI**.

### Directory Structure

- **`app/`**: Contains the application routes and layouts.
  - **`(auth)/`**: Route group for authentication pages (`login`, `registro`).
  - **`dashboard/`**: Main application area. Contains sub-features like `citas`, `recepcion`, `inspeccion`, `taller`, etc.
  - **`agendamiento/`**: Public or separate flow for scheduling appointments.
- **`components/`**: React components.
  - **`ui/`**: Reusable, generic UI components (Shadcn/UI).
  - **`[feature]/`**: Feature-specific components (e.g., `inspeccion`, `recepcion`, `agendamiento`).
- **`lib/`**: Utilities and core logic.
  - **`api/`**: API client functions and wrappers.
  - **`auth/`**: Authentication logic, server actions, and cookie management.
  - **`validations/`**: Zod schemas for form validation and data parsing.
  - **`fixtures/`**: Mock data for testing and development.
- **`hooks/`**: Custom React hooks.
- **`tests/`**: Likely contains global test setups or integration tests (Vitest/Playwright configs are in root).
- **`e2e/`**: Playwright E2E tests.

### Key Patterns

- **UI Components**: Uses `@/components/ui` for base elements. Feature-specific logic is kept in dedicated folders within `components/`.
- **Data Fetching**: API interaction logic is centralized in `lib/api`.
- **Validation**: Zod schemas are defined in `lib/validations` and used with React Hook Form.
- **Styling**: Tailwind CSS is used for styling.
