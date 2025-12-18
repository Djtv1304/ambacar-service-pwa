"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface SidebarContextType {
  // Desktop: collapsed/expanded state
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggle: () => void
  // Mobile: open/closed state (drawer behavior)
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  toggleMobile: () => void
  // Device detection
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useIsMobile()

  // Close mobile sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false)
    }
  }, [isMobile])

  // Close mobile sidebar on route change (will be handled by sidebar component)
  const toggle = () => setCollapsed((prev) => !prev)
  const toggleMobile = () => setMobileOpen((prev) => !prev)

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        toggle,
        mobileOpen,
        setMobileOpen,
        toggleMobile,
        isMobile
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

