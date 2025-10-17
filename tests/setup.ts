import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import React from "react";

// Cleanup después de cada test
afterEach(() => {
  cleanup()
})

// Mock de Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock de framer-motion para evitar errores de animación en tests
vi.mock('framer-motion', () => ({
  motion: {
    aside: ({ children, ...props }: any) => React.createElement('aside', props, children),
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
  },
}))