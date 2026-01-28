/**
 * API module for Predictive Demand endpoints
 * Connects to the ML prediction microservice
 */

const PREDICTIVO_API_BASE_URL = process.env.NEXT_PUBLIC_PREDICTIVO_API_URL || "https://fsw84cwk0wogs80kw44g4k4g.94.72.112.61.sslip.io"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Data point for prediction
 */
export interface PrediccionDato {
  fecha: string
  prediccion: number
  limite_inferior: number
  limite_superior: number
}

/**
 * Statistics from the prediction
 */
export interface PrediccionEstadisticas {
  total_ordenes: number
  promedio_semanal: number
  promedio_mensual: number
  desviacion_estandar: number
  minimo: number
  maximo: number
  mediana: number
}

/**
 * TradingView series data point
 */
export interface TradingViewDataPoint {
  time: string
  value: number
}

/**
 * TradingView series options
 */
export interface TradingViewSeriesOptions {
  color: string
  lineWidth: number
  lineStyle?: number
  title: string
}

/**
 * TradingView series configuration
 */
export interface TradingViewSeries {
  id: string
  type: string
  data: TradingViewDataPoint[]
  options: TradingViewSeriesOptions
}

/**
 * TradingView chart configuration
 */
export interface TradingViewChartOptions {
  layout?: {
    background?: {
      type: string
      color: string
    }
    textColor?: string
  }
  grid?: {
    vertLines?: { color: string }
    horzLines?: { color: string }
  }
  rightPriceScale?: {
    borderColor?: string
  }
}

/**
 * TradingView time scale configuration
 */
export interface TradingViewTimeScale {
  borderColor?: string
  timeVisible?: boolean
  secondsVisible?: boolean
}

/**
 * Complete TradingView graph configuration from API
 */
export interface GraficaTradingView {
  series: TradingViewSeries[]
  chartOptions: TradingViewChartOptions
  timeScale: TradingViewTimeScale
}

/**
 * Interpretation data from the prediction model
 */
export interface PrediccionInterpretacion {
  resumen: string
  hallazgos: string[]
  recomendaciones: string[]
  alertas: string[]
}

/**
 * Metadata about the prediction
 */
export interface PrediccionMetadata {
  semanas_predichas?: number
  meses_predichos?: number
  modelo: string
  precision_estimada: number
}

/**
 * Complete prediction API response
 */
export interface PrediccionResponse {
  exito: boolean
  mensaje: string
  datos: PrediccionDato[]
  estadisticas: PrediccionEstadisticas
  grafica_base64: string | null
  grafica_json: unknown | null
  grafica_tradingview: GraficaTradingView
  interpretacion: PrediccionInterpretacion
  metadata: PrediccionMetadata
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetches weekly prediction data
 * @param semanas - Number of weeks to predict (default: 1)
 * @returns Weekly prediction response
 */
export async function getPrediccionSemanal(semanas: number = 1): Promise<PrediccionResponse> {
  const url = `${PREDICTIVO_API_BASE_URL}/predictions/weekly?semanas=${semanas}&formato=tradingview`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching weekly prediction: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetches monthly prediction data
 * @param meses - Number of months to predict (default: 1)
 * @returns Monthly prediction response
 */
export async function getPrediccionMensual(meses: number = 1): Promise<PrediccionResponse> {
  const url = `${PREDICTIVO_API_BASE_URL}/predictions/monthly?meses=${meses}&formato=tradingview`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching monthly prediction: ${response.status}`)
  }

  return response.json()
}

// ============================================================================
// WORKSHOPS TYPES & FUNCTION
// ============================================================================

/**
 * Workshop/Taller data from the API
 */
export interface TallerPredictivo {
  id: string
  nombre: string
}

/**
 * Workshops API response
 */
export interface WorkshopsResponse {
  exito: boolean
  cantidad: number
  talleres: TallerPredictivo[]
}

/**
 * Fetches the list of workshops available for predictions
 * @returns List of workshops
 */
export async function getWorkshops(): Promise<WorkshopsResponse> {
  const url = `${PREDICTIVO_API_BASE_URL}/predictions/workshops`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching workshops: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetches weekly prediction data for a specific workshop
 * @param tallerId - Workshop ID
 * @param semanas - Number of weeks to predict (default: 1)
 * @returns Weekly prediction response for the workshop
 */
export async function getPrediccionSemanalByTaller(
  tallerId: string,
  semanas: number = 1
): Promise<PrediccionResponse> {
  const url = `${PREDICTIVO_API_BASE_URL}/predictions/weekly/${tallerId}?semanas=${semanas}&formato=tradingview`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching weekly prediction for taller ${tallerId}: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetches monthly prediction data for a specific workshop
 * @param tallerId - Workshop ID
 * @param meses - Number of months to predict (default: 1)
 * @returns Monthly prediction response for the workshop
 */
export async function getPrediccionMensualByTaller(
  tallerId: string,
  meses: number = 1
): Promise<PrediccionResponse> {
  const url = `${PREDICTIVO_API_BASE_URL}/predictions/monthly/${tallerId}?meses=${meses}&formato=tradingview`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching monthly prediction for taller ${tallerId}: ${response.status}`)
  }

  return response.json()
}

// ============================================================================
// MODEL METRICS TYPES & FUNCTION
// ============================================================================

/**
 * Raw metrics from the ML model
 */
export interface ModelMetricsRaw {
  mae: number
  rmse: number
  r2: number
  mape: number
}

/**
 * Human-readable interpretation of metrics
 */
export interface ModelMetricsInterpretation {
  calidad_modelo: string
  descripcion: string
  precision_porcentaje: string
  error_promedio_ordenes: string
}

/**
 * Complete model metrics API response
 */
export interface ModelMetricsResponse {
  metricas: ModelMetricsRaw
  interpretacion: ModelMetricsInterpretation
  fecha_evaluacion: string
}

/**
 * Fetches the current model metrics and precision
 * @returns Model metrics response with precision percentage
 */
export async function getModelMetrics(): Promise<ModelMetricsResponse> {
  const url = `${PREDICTIVO_API_BASE_URL}/model/metrics`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching model metrics: ${response.status}`)
  }

  return response.json()
}
