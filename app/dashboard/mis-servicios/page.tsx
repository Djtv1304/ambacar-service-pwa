"use client"

import { useState, useCallback } from "react"
import { Car, Search, Wrench, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceList } from "@/components/mis-servicios/service-list"
import { ClientSearchForm } from "@/components/mis-servicios/client-search-form"
import { ServiceModeSelector } from "@/components/mis-servicios/service-mode-selector"
import { useClientServices } from "@/hooks/use-service-data"
import { useAuth } from "@/components/auth/auth-provider"
import { isInternalUser } from "@/lib/auth/roles"
import type { ClientService } from "@/lib/mis-servicios/types"

type ServiceViewMode = "selector" | "buscar-cliente" | "mis-servicios"

export default function MisServiciosPage() {
  const { user } = useAuth()
  const userIsInternal = isInternalUser(user)

  // Estados
  const [viewMode, setViewMode] = useState<ServiceViewMode>("selector")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null)
  const [preloadedServices, setPreloadedServices] = useState<ClientService[] | null>(null)

  // Hooks duales - uno para cada modo
  const clientServicesHook = useClientServices(
    viewMode === "buscar-cliente" && selectedClientId ? selectedClientId : undefined
  )

  const operatorServicesHook = useClientServices(
    viewMode === "mis-servicios" ? null : undefined
  )

  // Handlers
  const handleSelectMode = (mode: "buscar-cliente" | "mis-servicios") => {
    setViewMode(mode)
  }

  const handleBackToSelector = () => {
    setViewMode("selector")
    setSelectedClientId(null)
    setSelectedClientName(null)
    setPreloadedServices(null)
  }

  const handleClientFound = (clientId: string, clientName: string, servicios?: ClientService[]) => {
    setSelectedClientId(clientId)
    setSelectedClientName(clientName)
    if (servicios) {
      setPreloadedServices(servicios)
    }
  }

  const handleRefreshActive = useCallback(async () => {
    setPreloadedServices(null)
    if (viewMode === "buscar-cliente") {
      await clientServicesHook.refetchActive()
    } else {
      await operatorServicesHook.refetchActive()
    }
  }, [viewMode, clientServicesHook, operatorServicesHook])

  // RENDERIZADO CONDICIONAL

  // 1. Operador → Selector de Modo
  if (userIsInternal && viewMode === "selector") {
    return (
      <div className="space-y-6">
        <ServiceModeSelector
          onSelectMode={handleSelectMode}
          userName={user?.first_name}
        />
      </div>
    )
  }

  // 2. Operador → Modo Buscar Cliente
  if (userIsInternal && viewMode === "buscar-cliente") {
    if (!selectedClientId) {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Consultar Servicios</h1>
                <p className="text-sm text-muted-foreground">Busca un cliente para ver sus servicios</p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleBackToSelector} className="hidden sm:flex">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>

          {/* Formulario de búsqueda */}
          <ClientSearchForm
            onClientFound={handleClientFound}
            isLoading={clientServicesHook.isLoading}
          />

          {/* Botón Volver móvil */}
          <div className="sm:hidden">
            <Button variant="outline" onClick={handleBackToSelector} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Menú
            </Button>
          </div>
        </div>
      )
    }

    // Cliente encontrado - mostrar servicios
    const displayServices = preloadedServices || clientServicesHook.activeServices
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Car className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Servicios del Cliente</h1>
            <p className="text-sm text-muted-foreground">Vista en modo supervisión</p>
          </div>
        </div>

        {/* Lista de servicios */}
        <ServiceList
          activeServices={displayServices}
          completedServices={clientServicesHook.completedServices}
          isLoading={clientServicesHook.isLoading}
          activeLoading={clientServicesHook.activeLoading}
          historialLoading={clientServicesHook.historialLoading}
          isInternalUser={true}
          viewContext="operator-client"
          clientName={selectedClientName || undefined}
          onClearClient={handleBackToSelector}
          onTabChange={clientServicesHook.fetchHistorial}
          onRefreshActive={handleRefreshActive}
          onRefreshHistorial={clientServicesHook.refetchHistorial}
        />
      </div>
    )
  }

  // 3. Operador → Modo Mis Servicios
  if (userIsInternal && viewMode === "mis-servicios") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mis Servicios Personales</h1>
              <p className="text-sm text-muted-foreground">Tus vehículos en el taller</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleBackToSelector} className="hidden sm:flex">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Lista de servicios propios */}
        <ServiceList
          activeServices={operatorServicesHook.activeServices}
          completedServices={operatorServicesHook.completedServices}
          isLoading={operatorServicesHook.isLoading}
          activeLoading={operatorServicesHook.activeLoading}
          historialLoading={operatorServicesHook.historialLoading}
          isInternalUser={false} // ← Clave: mostrar botones de aprobación
          viewContext="operator-own"
          operatorName={`${user?.first_name} ${user?.last_name}`}
          onBackToSelector={handleBackToSelector}
          onTabChange={operatorServicesHook.fetchHistorial}
          onRefreshActive={handleRefreshActive}
          onRefreshHistorial={operatorServicesHook.refetchHistorial}
        />

        {/* Botón Volver móvil */}
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50">
          <Button variant="default" onClick={handleBackToSelector} className="w-full shadow-lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Menú
          </Button>
        </div>
      </div>
    )
  }

  // 4. Cliente (sin cambios)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Car className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mis Servicios</h1>
          <p className="text-sm text-muted-foreground">Sigue el estado de tus vehículos en el taller</p>
        </div>
      </div>

      {/* Lista de servicios */}
      <ServiceList
        activeServices={operatorServicesHook.activeServices}
        completedServices={operatorServicesHook.completedServices}
        isLoading={operatorServicesHook.isLoading}
        activeLoading={operatorServicesHook.activeLoading}
        historialLoading={operatorServicesHook.historialLoading}
        isInternalUser={false}
        viewContext="customer"
        onTabChange={operatorServicesHook.fetchHistorial}
        onRefreshActive={handleRefreshActive}
        onRefreshHistorial={operatorServicesHook.refetchHistorial}
      />
    </div>
  )
}
