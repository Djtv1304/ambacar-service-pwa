"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type {
  ServiceDetail,
  ClientService,
  UseServiceDataReturn
} from "@/lib/mis-servicios/types"
import {
  getMisServiciosActivos,
  getMisServiciosHistorial,
  getServiceDetail,
  approveAdditionalWork,
  rejectAdditionalWork
} from "@/lib/api/mis-servicios"
import { useAuthToken } from "@/hooks/use-auth-token"
import { toast } from "sonner"

/**
 * Hook to fetch and manage a single service's data
 * Uses real API endpoints for fetching and actions
 */
export function useServiceData(serviceId: string): UseServiceDataReturn {
  const [service, setService] = useState<ServiceDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuthToken()

  // Fetch service detail from API
  const fetchService = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) {
        throw new Error("No se pudo obtener el token de autenticación")
      }

      const data = await getServiceDetail(serviceId, token)
      setService(data)
    } catch (err) {
      console.error("Error fetching service:", err)
      setError(err instanceof Error ? err.message : "Error al cargar el servicio")
      setService(null)
    } finally {
      setIsLoading(false)
    }
  }, [serviceId, getToken])

  // Initial fetch
  useEffect(() => {
    fetchService()
  }, [fetchService])

  // Approve additional work via API
  const approveWork = useCallback(async (workId: number) => {
    if (!service) return

    try {
      const token = await getToken()
      if (!token) throw new Error("No se pudo obtener el token")

      const { message, trabajo } = await approveAdditionalWork(service.id, workId, token)

      // Update local state: move from pending to approved
      setService((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          trabajosAdicionales: prev.trabajosAdicionales.filter((w) => w.id !== workId),
          trabajosAprobados: [...prev.trabajosAprobados, trabajo],
          pendingApprovals: prev.pendingApprovals - 1,
          total: prev.total + trabajo.costoTotal,
        }
      })

      // Show success toast with API message
      toast.success(message, {
        description: `${trabajo.titulo} - $${trabajo.costoTotal.toFixed(2)}`,
        duration: 4000,
      })
    } catch (err: unknown) {
      console.error("Error approving work:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al aprobar"
      toast.error("Error al aprobar trabajo", {
        description: errorMessage,
      })
      throw err
    }
  }, [service, getToken])

  // Reject additional work via API
  const rejectWork = useCallback(async (workId: number) => {
    if (!service) return

    try {
      const token = await getToken()
      if (!token) throw new Error("No se pudo obtener el token")

      const { message, trabajo } = await rejectAdditionalWork(service.id, workId, token)

      // Update local state: move from pending to rejected
      setService((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          trabajosAdicionales: prev.trabajosAdicionales.filter((w) => w.id !== workId),
          trabajosRechazados: [...prev.trabajosRechazados, trabajo],
          pendingApprovals: prev.pendingApprovals - 1,
        }
      })

      // Show info toast with API message
      toast.info(message, {
        description: `${trabajo.titulo} ha sido rechazado`,
        duration: 4000,
      })
    } catch (err: unknown) {
      console.error("Error rejecting work:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al rechazar"
      toast.error("Error al rechazar trabajo", {
        description: errorMessage,
      })
      throw err
    }
  }, [service, getToken])

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
 * Hook to fetch all services for a client with lazy loading per tab
 * @param clientId - Optional client ID. If not provided, fetches for current user.
 *                   Pass undefined to skip fetching (useful for internal users before selecting a client).
 */
export function useClientServices(clientId?: string | null) {
  const [activeServices, setActiveServices] = useState<ClientService[]>([])
  const [completedServices, setCompletedServices] = useState<ClientService[]>([])

  // Separate loading states per tab
  const [activeLoading, setActiveLoading] = useState(false)
  const [historialLoading, setHistorialLoading] = useState(false)

  // Track if each tab has been fetched (for caching)
  const activeFetchedRef = useRef(false)
  const historialFetchedRef = useRef(false)

  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuthToken()

  // Fetch active services
  const fetchActiveServices = useCallback(async (force = false) => {
    // Skip if clientId is undefined (internal user without client selected)
    if (clientId === undefined) {
      setActiveLoading(false)
      return
    }

    // Use cache unless forced
    if (activeFetchedRef.current && !force) {
      return
    }

    setActiveLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) {
        setError("No se encontró token de autenticación")
        return
      }

      const data = await getMisServiciosActivos(token)
      setActiveServices(data)
      activeFetchedRef.current = true
    } catch (err) {
      console.error("Error fetching active services:", err)
      setError("Error al cargar los servicios activos")
      toast.error("Error al cargar servicios activos")
    } finally {
      setActiveLoading(false)
    }
  }, [clientId, getToken])

  // Fetch historial (completed services)
  const fetchHistorial = useCallback(async (force = false) => {
    // Skip if clientId is undefined
    if (clientId === undefined) {
      setHistorialLoading(false)
      return
    }

    // Use cache unless forced
    if (historialFetchedRef.current && !force) {
      return
    }

    setHistorialLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) {
        setError("No se encontró token de autenticación")
        return
      }

      const data = await getMisServiciosHistorial(token)
      setCompletedServices(data)
      historialFetchedRef.current = true
    } catch (err) {
      console.error("Error fetching historial:", err)
      setError("Error al cargar el historial")
      toast.error("Error al cargar historial")
    } finally {
      setHistorialLoading(false)
    }
  }, [clientId, getToken])

  // Auto-fetch active services on mount (default tab)
  useEffect(() => {
    fetchActiveServices()
  }, [fetchActiveServices])

  // Reset cache when clientId changes
  useEffect(() => {
    activeFetchedRef.current = false
    historialFetchedRef.current = false
    setActiveServices([])
    setCompletedServices([])
  }, [clientId])

  return {
    activeServices,
    completedServices,
    isLoading: activeLoading || historialLoading,
    activeLoading,
    historialLoading,
    error,
    fetchActiveServices,
    fetchHistorial,
    refetchActive: () => fetchActiveServices(true),
    refetchHistorial: () => fetchHistorial(true),
  }
}

