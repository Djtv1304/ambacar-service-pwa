"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { RemindersView } from "@/components/notificaciones/reminders-view"
import { Loader2 } from "lucide-react"

export default function RecordatoriosPage() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Operator can edit reminders, so not read-only
  return <RemindersView />
}

