"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getBrands,
  getModels,
  getPredictions,
  getPartsByMileage,
  getAnalytics,
  getModelInfo,
  retrainModel,
  type BrandsResponse,
  type ModelsResponse,
  type PredictResponse,
  type ByMileageResponse,
  type AnalyticsResponse,
  type ModelInfoResponse,
  type RetrainResponse,
  type PredictionMethod,
  type MileageRange,
} from "@/lib/api/recommender"

// ============ Brands Hook ============

interface UseBrandsResult {
  brands: string[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useBrands(): UseBrandsResult {
  const [brands, setBrands] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBrands = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getBrands()
      if (response.exito) {
        setBrands(response.marcas)
      } else {
        setError("No se pudieron cargar las marcas")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar marcas")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  return { brands, isLoading, error, refetch: fetchBrands }
}

// ============ Models Hook ============

interface UseModelsResult {
  models: string[]
  isLoading: boolean
  error: string | null
  refetch: (brand: string) => Promise<void>
}

export function useModels(brand: string | null): UseModelsResult {
  const [models, setModels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchModels = useCallback(async (selectedBrand: string) => {
    if (!selectedBrand) {
      setModels([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const response = await getModels(selectedBrand)
      if (response.exito) {
        setModels(response.modelos)
      } else {
        setError("No se pudieron cargar los modelos")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar modelos")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (brand) {
      fetchModels(brand)
    } else {
      setModels([])
    }
  }, [brand, fetchModels])

  return { models, isLoading, error, refetch: fetchModels }
}

// ============ Predictions Hook ============

interface UsePredictionsParams {
  marca: string
  modelo: string
  anio: number
  kilometraje: number
  n_recomendaciones?: number
  metodo?: PredictionMethod
}

interface UsePredictionsResult {
  data: PredictResponse | null
  isLoading: boolean
  error: string | null
  predict: (params: UsePredictionsParams) => Promise<void>
  reset: () => void
}

export function usePredictions(): UsePredictionsResult {
  const [data, setData] = useState<PredictResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const predict = useCallback(async (params: UsePredictionsParams) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getPredictions(params)
      if (response.exito) {
        setData(response)
      } else {
        setError(response.mensaje || "Error al obtener predicciones")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener predicciones")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
  }, [])

  return { data, isLoading, error, predict, reset }
}

// ============ By Mileage Hook ============

interface UseByMileageResult {
  data: ByMileageResponse | null
  isLoading: boolean
  error: string | null
  fetch: (range: MileageRange, limit?: number) => Promise<void>
}

export function useByMileage(): UseByMileageResult {
  const [data, setData] = useState<ByMileageResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (range: MileageRange, limit?: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getPartsByMileage(range, limit)
      if (response.exito) {
        setData(response)
      } else {
        setError("Error al cargar repuestos por kilometraje")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos")
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, isLoading, error, fetch: fetchData }
}

// ============ Analytics Hook ============

interface UseAnalyticsResult {
  data: AnalyticsResponse | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAnalytics(): UseAnalyticsResult {
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (includeChart: boolean = false) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getAnalytics(includeChart)
      console.log("Analytics API response:", response)
      // Accept response if it has data
      if (response && (response.exito || response.repuestos_por_kilometraje)) {
        setData(response)
      } else {
        console.error("Analytics response invalid:", response)
        setError("Error al cargar analytics")
      }
    } catch (err) {
      console.error("Analytics error:", err)
      setError(err instanceof Error ? err.message : "Error al cargar analytics")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { data, isLoading, error, refetch: fetchAnalytics }
}

// ============ Model Info Hook ============

interface UseModelInfoResult {
  data: ModelInfoResponse | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useModelInfo(): UseModelInfoResult {
  const [data, setData] = useState<ModelInfoResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchModelInfo = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getModelInfo()
      console.log("Model info API response:", response)
      // Accept response if it has metrics data (exito might not always be present)
      if (response && (response.exito || response.metricas)) {
        setData(response)
      } else {
        console.error("Model info response invalid:", response)
        setError("Error al cargar información del modelo")
      }
    } catch (err) {
      console.error("Model info error:", err)
      setError(err instanceof Error ? err.message : "Error al cargar información del modelo")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModelInfo()
  }, [fetchModelInfo])

  return { data, isLoading, error, refetch: fetchModelInfo }
}

// ============ Retrain Hook ============

interface UseRetrainResult {
  data: RetrainResponse | null
  isLoading: boolean
  error: string | null
  retrain: () => Promise<boolean>
}

export function useRetrain(): UseRetrainResult {
  const [data, setData] = useState<RetrainResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const doRetrain = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await retrainModel()
      if (response.exito) {
        setData(response)
        return true
      } else {
        setError(response.mensaje || "Error al re-entrenar el modelo")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al re-entrenar el modelo")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, isLoading, error, retrain: doRetrain }
}
