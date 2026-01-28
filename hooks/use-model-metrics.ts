import { useState, useEffect, useCallback } from "react"
import { getModelMetrics, type ModelMetricsResponse } from "@/lib/api/predictivo"

interface UseModelMetricsReturn {
  data: ModelMetricsResponse | null
  precisionPorcentaje: string | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener las métricas del modelo de predicción
 * Extrae específicamente el precision_porcentaje para mostrar en la UI
 */
export function useModelMetrics(): UseModelMetricsReturn {
  const [data, setData] = useState<ModelMetricsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await getModelMetrics()
      setData(response)
    } catch (err) {
      console.error("Error fetching model metrics:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al cargar métricas del modelo"
      setError(errorMessage)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    precisionPorcentaje: data?.interpretacion?.precision_porcentaje || null,
    isLoading,
    error,
    refetch: fetchData,
  }
}
