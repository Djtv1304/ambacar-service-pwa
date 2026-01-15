"use client"

import { useState, useEffect } from "react"
import { getServiceTypes, getPhases, type ServiceTypeAPI, type PhaseAPI } from "@/lib/api/notifications"
import { getSucursales, type Sucursal } from "@/lib/api/agendamiento"
import { useAuthToken } from "./use-auth-token"

/**
 * Hook para cargar metadata necesaria para editar/crear templates:
 * - Service Types (con subtypes anidados)
 * - Phases
 * - Talleres/Sucursales
 *
 * Estos datos se usan en los dropdowns del editor de templates
 */
export function useNotificationMetadata() {
  const { getToken } = useAuthToken()

  const [serviceTypes, setServiceTypes] = useState<ServiceTypeAPI[]>([])
  const [phases, setPhases] = useState<PhaseAPI[]>([])
  const [talleres, setTalleres] = useState<Sucursal[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const token = await getToken()
        if (!token) {
          throw new Error("No se encontró token de autenticación")
        }

        // Fetch en paralelo para optimizar performance
        const [serviceTypesData, phasesData, talleresData] = await Promise.all([
          getServiceTypes(token),
          getPhases(token),
          getSucursales(token),
        ])

        setServiceTypes(serviceTypesData)
        setPhases(phasesData)
        setTalleres(talleresData)
      } catch (err) {
        console.error("Error fetching metadata:", err)
        setError(err instanceof Error ? err.message : "Error cargando metadata")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetadata()
  }, [getToken])

  return {
    serviceTypes,
    phases,
    talleres,
    isLoading,
    error,
  }
}
