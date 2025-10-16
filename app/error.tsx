"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Error boundary caught:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <AlertCircle className="mx-auto h-24 w-24 text-destructive" />
        <h1 className="mt-6 text-4xl font-bold">Error</h1>
        <p className="mt-2 text-lg text-muted-foreground">Algo salió mal</p>
        <p className="mt-2 text-sm text-muted-foreground">{error.message || "Ha ocurrido un error inesperado"}</p>
        <Button onClick={reset} className="mt-6">
          Intentar de nuevo
        </Button>
      </div>
    </div>
  )
}
