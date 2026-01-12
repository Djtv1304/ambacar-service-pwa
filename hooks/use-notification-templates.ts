"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  fetchNotificationTemplates,
  NotificationTemplateAPI,
  NotificationTarget,
} from "@/lib/api/notifications"

interface TemplatesData {
  templates: NotificationTemplateAPI[]
  page: number
  totalPages: number
  totalCount: number
  hasLoaded: boolean
}

interface UseNotificationTemplatesReturn {
  // Data
  templates: NotificationTemplateAPI[]
  totalCount: number
  currentPage: number
  totalPages: number

  // States
  isLoading: boolean
  error: string | null

  // Actions
  setPage: (page: number) => void
  refresh: () => void
}

const ITEMS_PER_PAGE = 20 // API returns max 20 items per page

/**
 * Hook para gestionar plantillas de notificación con cache por tab
 *
 * @param target - 'clients' o 'staff'
 * @returns Datos de plantillas, estados y acciones
 *
 * Características:
 * - Cache independiente por tab (clients/staff)
 * - Solo página actual en cache (cambiar de página = nuevo request)
 * - Cambio de tab usa datos cacheados si ya se cargó
 * - Manejo de errores con opción de reintentar
 */
export function useNotificationTemplates(
  target: NotificationTarget
): UseNotificationTemplatesReturn {
  // Estado para cada target (cache por tab)
  const [clientsData, setClientsData] = useState<TemplatesData>({
    templates: [],
    page: 1,
    totalPages: 1,
    totalCount: 0,
    hasLoaded: false,
  })

  const [staffData, setStaffData] = useState<TemplatesData>({
    templates: [],
    page: 1,
    totalPages: 1,
    totalCount: 0,
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
   * Fetch de plantillas desde la API
   */
  const fetchTemplates = useCallback(
    async (page: number, forceRefresh = false) => {
      // Si ya cargamos este tab y no es refresh, usar cache
      if (currentData.hasLoaded && currentData.page === page && !forceRefresh) {
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
        const response = await fetchNotificationTemplates({ target, page })

        // Calcular total de páginas
        const totalPages = Math.ceil(response.count / ITEMS_PER_PAGE)

        setCurrentData({
          templates: response.results,
          page,
          totalPages,
          totalCount: response.count,
          hasLoaded: true,
        })
      } catch (err) {
        // Ignorar errores de abort
        if (err instanceof Error && err.name === "AbortError") {
          return
        }

        const errorMessage =
          err instanceof Error ? err.message : "Error al cargar las plantillas"
        setError(errorMessage)
        console.error("Error fetching templates:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [target, currentData.hasLoaded, currentData.page, setCurrentData]
  )

  /**
   * Cambiar de página
   */
  const setPage = useCallback(
    (page: number) => {
      if (page < 1 || page > currentData.totalPages) return
      fetchTemplates(page)
    },
    [fetchTemplates, currentData.totalPages]
  )

  /**
   * Refrescar datos (invalida cache)
   */
  const refresh = useCallback(() => {
    fetchTemplates(currentData.page, true)
  }, [fetchTemplates, currentData.page])

  // Cargar datos cuando cambia el target (si no se ha cargado)
  useEffect(() => {
    if (!currentData.hasLoaded) {
      fetchTemplates(1)
    }
  }, [target, currentData.hasLoaded, fetchTemplates])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    templates: currentData.templates,
    totalCount: currentData.totalCount,
    currentPage: currentData.page,
    totalPages: currentData.totalPages,
    isLoading,
    error,
    setPage,
    refresh,
  }
}
