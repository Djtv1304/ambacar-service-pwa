"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  fetchOrchestrationMatrix,
  transformOrchestrationData,
  OrchestrationServiceType,
  NotificationTarget,
} from "@/lib/api/notifications"

interface OrchestrationData {
  serviceTypes: OrchestrationServiceType[]
  hasLoaded: boolean
}

interface UseOrchestrationMatrixReturn {
  // Data
  serviceTypes: OrchestrationServiceType[]

  // States
  isLoading: boolean
  error: string | null

  // Actions
  refresh: () => void
}

/**
 * Hook para gestionar la matriz de orquestación de notificaciones con cache por tab
 *
 * @param target - 'clients' o 'staff'
 * @returns Datos de orquestación, estados y acciones
 *
 * Características:
 * - Cache independiente por tab (clients/staff)
 * - Cambio de tab usa datos cacheados si ya se cargó
 * - Manejo de errores con opción de reintentar
 * - Transforma la respuesta plana de la API a estructura agrupada por fases
 */
export function useOrchestrationMatrix(
  target: NotificationTarget
): UseOrchestrationMatrixReturn {
  // Estado para cada target (cache por tab)
  const [clientsData, setClientsData] = useState<OrchestrationData>({
    serviceTypes: [],
    hasLoaded: false,
  })

  const [staffData, setStaffData] = useState<OrchestrationData>({
    serviceTypes: [],
    hasLoaded: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ref para evitar race conditions
  const abortControllerRef = useRef<AbortController | null>(null)

  // Obtener datos según target actual
  const currentData = target === "clients" ? clientsData : staffData
  const setCurrentData = target === "clients" ? setClientsData : setStaffData

  /**
   * Fetch de matriz de orquestación desde la API
   */
  const fetchMatrix = useCallback(
    async (forceRefresh = false) => {
      // Si ya cargamos este tab y no es refresh, usar cache
      if (currentData.hasLoaded && !forceRefresh) {
        return
      }

      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetchOrchestrationMatrix(target)

        // Transformar la respuesta plana a estructura agrupada por fases
        const serviceTypes = transformOrchestrationData(response)

        setCurrentData({
          serviceTypes,
          hasLoaded: true,
        })
      } catch (err) {
        // Ignorar errores de abort
        if (err instanceof Error && err.name === "AbortError") {
          return
        }

        const errorMessage =
          err instanceof Error ? err.message : "Error al cargar la matriz de orquestación"
        setError(errorMessage)
        console.error("Error fetching orchestration matrix:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [target, currentData.hasLoaded, setCurrentData]
  )

  /**
   * Refrescar datos (invalida cache)
   */
  const refresh = useCallback(() => {
    fetchMatrix(true)
  }, [fetchMatrix])

  // Cargar datos cuando cambia el target (si no se ha cargado)
  useEffect(() => {
    if (!currentData.hasLoaded) {
      fetchMatrix()
    }
  }, [target, currentData.hasLoaded, fetchMatrix])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    serviceTypes: currentData.serviceTypes,
    isLoading,
    error,
    refresh,
  }
}
