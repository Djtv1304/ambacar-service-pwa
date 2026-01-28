import { useState, useEffect, useCallback } from "react"
import { getWorkshops, type TallerPredictivo } from "@/lib/api/predictivo"

interface UseWorkshopsReturn {
  workshops: TallerPredictivo[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener la lista de talleres disponibles para predicciones
 */
export function useWorkshops(): UseWorkshopsReturn {
  const [workshops, setWorkshops] = useState<TallerPredictivo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await getWorkshops()

      if (!response.exito) {
        throw new Error("Error al obtener talleres")
      }

      setWorkshops(response.talleres)
    } catch (err) {
      console.error("Error fetching workshops:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al cargar talleres"
      setError(errorMessage)
      setWorkshops([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    workshops,
    isLoading,
    error,
    refetch: fetchData,
  }
}
