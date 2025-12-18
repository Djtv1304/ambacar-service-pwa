"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Sidebar, MobileMenuToggle } from "@/components/dashboard/sidebar"
import { SidebarProvider, useSidebar } from "@/components/dashboard/sidebar-context"
import { Topbar } from "@/components/dashboard/topbar"
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs"
import { useAuth } from "@/components/auth/auth-provider"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [canRedirect, setCanRedirect] = useState(false)

  // Mount the component (client-side only)
  useEffect(() => {
    setMounted(true)

    // Give getCurrentUser() time to complete before allowing redirect
    const timer = setTimeout(() => {
      setCanRedirect(true)
    }, 1000) // 1 second grace period

    return () => clearTimeout(timer)
  }, [])

  // Only redirect if we're mounted, not loading, no user, and grace period passed
  useEffect(() => {
    if (mounted && canRedirect && !isLoading && !user) {
      // Use window.location for a hard redirect to avoid React Router issues
      window.location.href = "/login"
    }
  }, [mounted, canRedirect, user, isLoading])

  // Show loading state until mounted and initial loading is complete
  if (!mounted || isLoading || (mounted && !canRedirect)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // If still no user after grace period, show redirecting message
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  // User is authenticated, render dashboard
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  )
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed, isMobile } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileMenuToggle />
      <motion.div
        initial={false}
        animate={{ paddingLeft: isMobile ? 0 : (collapsed ? 80 : 256) }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Breadcrumbs />
          {children}
        </main>
      </motion.div>
    </div>
  )
}
