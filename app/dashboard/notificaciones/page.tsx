"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { TallerConfigView } from "@/components/notificaciones/taller-config-view"
import { CustomerDashboardView } from "@/components/notificaciones/customer-dashboard-view"
import { Loader2 } from "lucide-react"

export default function NotificacionesPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Manager sees the Taller Configuration
  if (user?.role === "manager" || user?.role === "admin") {
    return <TallerConfigView />
  }

  // Customer and Operator see the Customer Dashboard
  // Operator sees it in read-only mode for preferences
  return <CustomerDashboardView isReadOnly={user?.role === "operator"} />
}

