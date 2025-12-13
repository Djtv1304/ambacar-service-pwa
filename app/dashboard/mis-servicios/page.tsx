"use client"

import { Car } from "lucide-react"
import { ServiceList } from "@/components/mis-servicios/service-list"
import { useClientServices } from "@/hooks/use-service-data"

export default function MisServiciosPage() {
  const { activeServices, completedServices, isLoading, error } = useClientServices()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Car className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mis Servicios
          </h1>
          <p className="text-sm text-muted-foreground">
            Sigue el estado de tus vehículos en el taller
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Service list with tabs */}
      <ServiceList
        activeServices={activeServices}
        completedServices={completedServices}
        isLoading={isLoading}
      />
    </div>
  )
}

