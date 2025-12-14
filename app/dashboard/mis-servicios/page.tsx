"use client"

import { useState } from "react"
import { Car, Search } from "lucide-react"
import { ServiceList } from "@/components/mis-servicios/service-list"
import { ClientSearchForm } from "@/components/mis-servicios/client-search-form"
import { useClientServices } from "@/hooks/use-service-data"
import { useAuth } from "@/components/auth/auth-provider"
import { isInternalUser } from "@/lib/auth/roles"

export default function MisServiciosPage() {
  const { user } = useAuth()
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null)

  // Use centralized role utility
  const userIsInternal = isInternalUser(user)

  // Fetch services - for clients directly, for internal users after client selection
  const shouldFetchServices = !userIsInternal || selectedClientId !== null
  const { activeServices, completedServices, isLoading, error } = useClientServices(
    shouldFetchServices ? selectedClientId : undefined
  )

  // Handle client found from search
  const handleClientFound = (clientId: string, clientName: string) => {
    setSelectedClientId(clientId)
    setSelectedClientName(clientName)
  }

  // Handle clearing client selection
  const handleClearClient = () => {
    setSelectedClientId(null)
    setSelectedClientName(null)
  }

  // Internal user without client selected - show search form
  if (userIsInternal && !selectedClientId) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Consultar Servicios
            </h1>
            <p className="text-sm text-muted-foreground">
              Busca un cliente para ver sus servicios
            </p>
          </div>
        </div>

        {/* Client search form */}
        <ClientSearchForm
          onClientFound={handleClientFound}
          isLoading={isLoading}
        />
      </div>
    )
  }

  // Client view OR internal user with client selected - show services
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Car className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {userIsInternal ? "Servicios del Cliente" : "Mis Servicios"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {userIsInternal
              ? "Vista en modo supervisión"
              : "Sigue el estado de tus vehículos en el taller"
            }
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
        isInternalUser={userIsInternal}
        clientName={selectedClientName || undefined}
        onClearClient={handleClearClient}
      />
    </div>
  )
}
