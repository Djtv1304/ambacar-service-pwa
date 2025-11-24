"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs"
import { useAuth } from "@/components/auth/auth-provider"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [canRedirect, setCanRedirect] = useState(false)

  console.log("[v0] DashboardLayout - user:", user, "isLoading:", isLoading, "mounted:", mounted)

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
      console.log("[v0] No user found after grace period, redirecting to login")
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden pl-20 lg:pl-64">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  )
}
