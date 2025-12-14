"use client"

import { useState, useEffect, useCallback } from "react"
import type {
  ServiceDetail,
  ClientService,
  UseServiceDataReturn
} from "@/lib/mis-servicios/types"
import {
  getMockServiceById,
  getMockClientServices
} from "@/lib/fixtures/mis-servicios"
import { toast } from "sonner"

/**
 * Hook to fetch and manage a single service's data
 * Separates business logic from UI components (SOLID principle)
 */
export function useServiceData(serviceId: string): UseServiceDataReturn {
  const [service, setService] = useState<ServiceDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchService = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // TODO: Replace with actual API call
      // const token = await getToken()
      // const data = await getServiceDetail(serviceId, token)

      const data = getMockServiceById(serviceId)

      if (!data) {
        setError("Servicio no encontrado")
        setService(null)
      } else {
        setService(data)
      }
    } catch (err) {
      console.error("Error fetching service:", err)
      setError("Error al cargar el servicio")
      setService(null)
    } finally {
      setIsLoading(false)
    }
  }, [serviceId])

  // Initial fetch
  useEffect(() => {
    fetchService()
  }, [fetchService])

  // Approve additional work
  const approveWork = useCallback(async (workId: string) => {
    if (!service) return

    try {
      // TODO: Replace with actual API call
      // await approveAdditionalWork(serviceId, workId, token)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update local state
      const workItem = service.trabajosAdicionales.find((w) => w.id === workId)
      if (workItem) {
        setService((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            trabajosAdicionales: prev.trabajosAdicionales.filter((w) => w.id !== workId),
            trabajosAprobados: [...prev.trabajosAprobados, { ...workItem, estado: "aprobado", fechaRespuesta: new Date() }],
            pendingApprovals: prev.pendingApprovals - 1,
            total: prev.total + workItem.costoTotal,
          }
        })

        toast.success("Trabajo aprobado", {
          description: `"${workItem.titulo}" ha sido aprobado`,
        })
      }
    } catch (err) {
      console.error("Error approving work:", err)
      toast.error("Error al aprobar el trabajo")
      throw err
    }
  }, [service])

  // Reject additional work
  const rejectWork = useCallback(async (workId: string) => {
    if (!service) return

    try {
      // TODO: Replace with actual API call
      // await rejectAdditionalWork(serviceId, workId, token)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update local state
      const workItem = service.trabajosAdicionales.find((w) => w.id === workId)
      if (workItem) {
        setService((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            trabajosAdicionales: prev.trabajosAdicionales.filter((w) => w.id !== workId),
            trabajosRechazados: [...prev.trabajosRechazados, { ...workItem, estado: "rechazado", fechaRespuesta: new Date() }],
            pendingApprovals: prev.pendingApprovals - 1,
          }
        })

        toast.success("Trabajo rechazado", {
          description: `"${workItem.titulo}" ha sido rechazado`,
        })
      }
    } catch (err) {
      console.error("Error rejecting work:", err)
      toast.error("Error al rechazar el trabajo")
      throw err
    }
  }, [service])

  return {
    service,
    isLoading,
    error,
    refetch: fetchService,
    approveWork,
    rejectWork,
  }
}

/**
 * Hook to fetch all services for a client
 * @param clientId - Optional client ID. If not provided, fetches for current user.
 *                   Pass undefined to skip fetching (useful for internal users before selecting a client).
 */
export function useClientServices(clientId?: string | null) {
  const [activeServices, setActiveServices] = useState<ClientService[]>([])
  const [completedServices, setCompletedServices] = useState<ClientService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = useCallback(async () => {
    // If clientId is explicitly undefined (not null), skip fetching
    if (clientId === undefined) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // TODO: Replace with actual API call
      // const token = await getToken()
      // const data = await getClientServices(token, clientId)

      const data = getMockClientServices()
      setActiveServices(data.active)
      setCompletedServices(data.completed)
    } catch (err) {
      console.error("Error fetching services:", err)
      setError("Error al cargar los servicios")
    } finally {
      setIsLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return {
    activeServices,
    completedServices,
    isLoading,
    error,
    refetch: fetchServices,
  }
}

