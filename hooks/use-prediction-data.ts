import { useState, useEffect, useCallback } from "react"
import {
  getPrediccionSemanal,
  getPrediccionMensual,
  getPrediccionSemanalByTaller,
  getPrediccionMensualByTaller,
  type PrediccionResponse,
} from "@/lib/api/predictivo"
import { toast } from "sonner"

interface UsePredictionDataReturn {
  data: PrediccionResponse | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener datos de predicción de demanda
 * @param range - "weekly" o "monthly"
 * @param periods - Número de semanas o meses a predecir (default: 1)
 * @param tallerId - ID del taller (opcional, "all" para predicción global)
 */
export function usePredictionData(
  range: "weekly" | "monthly",
  periods: number = 1,
  tallerId: string = "all"
): UsePredictionDataReturn {
  const [data, setData] = useState<PrediccionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let response: PrediccionResponse

      if (tallerId === "all") {
        // Global prediction (all workshops)
        response = range === "weekly"
          ? await getPrediccionSemanal(periods)
          : await getPrediccionMensual(periods)
      } else {
        // Workshop-specific prediction
        response = range === "weekly"
          ? await getPrediccionSemanalByTaller(tallerId, periods)
          : await getPrediccionMensualByTaller(tallerId, periods)
      }

      if (!response.exito) {
        throw new Error(response.mensaje || "Error en la predicción")
      }

      setData(response)
    } catch (err) {
      console.error("Error fetching prediction data:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al cargar predicciones"
      setError(errorMessage)
      toast.error("Error al cargar predicciones", {
        description: errorMessage,
      })
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [range, periods, tallerId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}
