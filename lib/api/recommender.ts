// Recommender API Client - AI-Powered Parts Recommendation System

const RECOMMENDER_BASE_URL = "https://fsw84cwk0wogs80kw44g4k4g.94.72.112.61.sslip.io"

// ============ API Response Types ============

export interface BrandsResponse {
  exito: boolean
  cantidad: number
  marcas: string[]
}

export interface ModelsResponse {
  exito: boolean
  marca: string
  cantidad: number
  modelos: string[]
}

export interface VehicleInfo {
  marca: string
  modelo: string
  anio: number
  kilometraje: number
  rango_km: string
}

export interface RecommendedPart {
  codigo: string
  descripcion: string
  probabilidad: number
  metodo: string
}

export interface MileagePart {
  codigo: string
  descripcion: string
  frecuencia: number
}

export interface PredictionInterpretation {
  resumen: string
  hallazgos: string[]
  recomendaciones: string[]
  alertas: string[]
}

export interface PredictResponse {
  exito: boolean
  mensaje: string
  vehiculo: VehicleInfo
  recomendaciones: RecommendedPart[]
  repuestos_por_kilometraje: MileagePart[]
  interpretacion: PredictionInterpretation
  grafica_base64: string | null
}

export interface ByMileageResponse {
  exito: boolean
  rango_km: string
  cantidad: number
  repuestos: MileagePart[]
}

export interface AllMileageRangesResponse {
  exito: boolean
  rangos_disponibles: string[]
  repuestos_por_rango: Record<string, MileagePart[]>
  grafica_base64: string | null
}

export interface AnalyticsRepuesto {
  codigo: string
  descripcion: string
  frecuencia: number
}

export interface AnalyticsInterpretation {
  resumen: string
  hallazgos: string[]
  recomendaciones: string[]
  alertas: string[] | null
}

export interface AnalyticsResponse {
  exito: boolean
  mensaje: string
  repuestos_por_kilometraje: Record<string, AnalyticsRepuesto[]>
  top_repuestos: string[]
  total_repuestos_analizados: number
  rangos_kilometraje: string[]
  grafica_base64: string | null
  interpretacion: AnalyticsInterpretation
}

export interface ModelMetrics {
  precision: number
  recall: number
  f1: number
}

export interface ModelInfoResponse {
  exito?: boolean
  fecha_entrenamiento: string
  registros_procesados: number
  repuestos_target: number
  metricas: ModelMetrics
  duracion_entrenamiento: number
}

export interface RetrainResponse {
  exito?: boolean
  mensaje?: string
  fecha_entrenamiento: string
  registros_procesados: number
  repuestos_target: number
  metricas_anteriores?: ModelMetrics
  metricas_nuevas: ModelMetrics
  duracion_entrenamiento: number
}

// ============ Valid Mileage Ranges ============

export const VALID_MILEAGE_RANGES = [
  "0-10k",
  "10-25k",
  "25-50k",
  "50-75k",
  "75-100k",
  "100-150k",
  "150-200k",
  "200k+"
] as const

export type MileageRange = typeof VALID_MILEAGE_RANGES[number]

// ============ Prediction Methods ============

export const PREDICTION_METHODS = [
  { value: "knn", label: "KNN (Vecinos Similares)" },
  { value: "rf", label: "Random Forest" }
] as const

export type PredictionMethod = "knn" | "rf"

// ============ API Functions ============

/**
 * Get list of all available vehicle brands
 */
export async function getBrands(): Promise<BrandsResponse> {
  const response = await fetch(`${RECOMMENDER_BASE_URL}/recommender/brands`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching brands: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get list of models for a specific brand
 */
export async function getModels(brand: string): Promise<ModelsResponse> {
  const encodedBrand = encodeURIComponent(brand)
  const response = await fetch(`${RECOMMENDER_BASE_URL}/recommender/models/${encodedBrand}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching models for ${brand}: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get parts recommendations for a specific vehicle
 */
export async function getPredictions(params: {
  marca: string
  modelo: string
  anio: number
  kilometraje: number
  n_recomendaciones?: number
  metodo?: PredictionMethod
}): Promise<PredictResponse> {
  const queryParams = new URLSearchParams({
    marca: params.marca,
    modelo: params.modelo,
    anio: params.anio.toString(),
    kilometraje: params.kilometraje.toString(),
    n_recomendaciones: (params.n_recomendaciones || 10).toString(),
    metodo: params.metodo || "knn",
  })

  const response = await fetch(`${RECOMMENDER_BASE_URL}/recommender/predict?${queryParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error getting predictions: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get parts commonly used in a specific mileage range
 */
export async function getPartsByMileage(
  rangoKm: MileageRange,
  limite?: number
): Promise<ByMileageResponse> {
  const encodedRange = encodeURIComponent(rangoKm)
  const queryParams = new URLSearchParams()
  if (limite) {
    queryParams.set("limite", limite.toString())
  }

  const url = `${RECOMMENDER_BASE_URL}/recommender/by-mileage/${encodedRange}${queryParams.toString() ? `?${queryParams}` : ""}`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching parts by mileage: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get parts for all mileage ranges
 */
export async function getAllMileageRanges(params?: {
  limite?: number
  incluir_grafica?: boolean
}): Promise<AllMileageRangesResponse> {
  const queryParams = new URLSearchParams()
  if (params?.limite) {
    queryParams.set("limite", params.limite.toString())
  }
  if (params?.incluir_grafica) {
    queryParams.set("incluir_grafica", "true")
  }

  const url = `${RECOMMENDER_BASE_URL}/recommender/by-mileage${queryParams.toString() ? `?${queryParams}` : ""}`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching all mileage ranges: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get analytics data about the recommendation system
 */
export async function getAnalytics(incluir_grafica?: boolean): Promise<AnalyticsResponse> {
  const queryParams = new URLSearchParams()
  if (incluir_grafica) {
    queryParams.set("incluir_grafica", "true")
  }

  const url = `${RECOMMENDER_BASE_URL}/recommender/analytics${queryParams.toString() ? `?${queryParams}` : ""}`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching analytics: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get information about the current AI model
 */
export async function getModelInfo(): Promise<ModelInfoResponse> {
  const response = await fetch(`${RECOMMENDER_BASE_URL}/recommender/model/info`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching model info: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Retrain the AI model
 */
export async function retrainModel(): Promise<RetrainResponse> {
  const response = await fetch(`${RECOMMENDER_BASE_URL}/recommender/model/retrain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error retraining model: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// ============ Utility Functions ============

/**
 * Calculate mileage range from a specific kilometraje value
 */
export function getMileageRangeFromKm(km: number): MileageRange {
  if (km < 10000) return "0-10k"
  if (km < 25000) return "10-25k"
  if (km < 50000) return "25-50k"
  if (km < 75000) return "50-75k"
  if (km < 100000) return "75-100k"
  if (km < 150000) return "100-150k"
  if (km < 200000) return "150-200k"
  return "200k+"
}

/**
 * Format probability as percentage
 */
export function formatProbability(probability: number): string {
  return `${(probability * 100).toFixed(1)}%`
}

/**
 * Format frequency number with separator
 */
export function formatFrequency(frequency: number): string {
  return frequency.toLocaleString("es-EC")
}
