"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { NotificationPreferencesView } from "@/components/notificaciones/notification-preferences-view"
import { Loader2 } from "lucide-react"

export default function PreferenciasPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Operator sees read-only mode
  const isReadOnly = user?.role === "operator"

  return <NotificationPreferencesView isReadOnly={isReadOnly} />
}

