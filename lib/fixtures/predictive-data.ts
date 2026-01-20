/**
 * Predictive Data Fixtures
 * Simulated data for the Demand Forecasting Dashboard
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PredictionDataPoint {
  time: string // ISO date string or timestamp
  value: number // Number of services
  type: "historical" | "projected"
}

export interface Recommendation {
  id: string
  type: "staff" | "appointment" | "bay" | "inventory"
  message: string
  severity: "info" | "warning" | "critical"
  icon: "calendar" | "users" | "car" | "package"
  week?: number // For week-specific recommendations
}

export interface QuickStat {
  label: string
  value: number | string
  change?: number // Percentage change
  trend?: "up" | "down" | "neutral"
  unit?: string
}

export interface FilterOption {
  value: string
  label: string
}

export interface HistoricalComparison {
  period: string
  currentYear: number
  previousYear: number
  variance: number // Percentage
}

export interface ModelMetrics {
  accuracy: number // Percentage (e.g., 87.3)
  lastUpdated: Date
  confidence: number // Percentage
  maeScore: number // Mean Absolute Error
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================

export const tallerOptions: FilterOption[] = [
  { value: "all", label: "Todos los Talleres" },
  { value: "norte", label: "Ambacar Norte" },
  { value: "centro", label: "Ambacar Centro" },
  { value: "sur", label: "Ambacar Sur" },
]

export const marcaOptions: FilterOption[] = [
  { value: "all", label: "Todas las Marcas" },
  { value: "great-wall", label: "Great Wall" },
  { value: "haval", label: "Haval" },
  { value: "chery", label: "Chery" },
]

export const modeloOptions: FilterOption[] = [
  { value: "all", label: "Todos los Modelos" },
  { value: "h6", label: "H6" },
  { value: "poer", label: "Poer" },
  { value: "jolion", label: "Jolion" },
  { value: "tiggo", label: "Tiggo" },
]

// ============================================================================
// DEMAND DATA GENERATORS
// ============================================================================

/**
 * Generates weekly demand data (7 days historical + 7 days projected)
 */
export function generateWeeklyDemand(
  baseValue: number = 15,
  overloadWeek: boolean = false
): PredictionDataPoint[] {
  const today = new Date()
  const data: PredictionDataPoint[] = []

  // Historical data (past 7 days)
  for (let i = 7; i >= 1; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayOfWeek = date.getDay()

    // Weekends have lower demand
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.5 : 1
    const variance = Math.random() * 0.3 - 0.15 // ±15% variance

    data.push({
      time: date.toISOString().split("T")[0],
      value: Math.round(baseValue * weekendMultiplier * (1 + variance)),
      type: "historical",
    })
  }

  // Projected data (next 7 days)
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dayOfWeek = date.getDay()

    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.5 : 1
    const overloadMultiplier = overloadWeek ? 1.35 : 1 // 35% increase for overload
    const variance = Math.random() * 0.2 - 0.1 // ±10% variance

    data.push({
      time: date.toISOString().split("T")[0],
      value: Math.round(baseValue * weekendMultiplier * overloadMultiplier * (1 + variance)),
      type: "projected",
    })
  }

  return data
}

/**
 * Generates monthly demand data (30 days historical + 30 days projected)
 */
export function generateMonthlyDemand(
  baseValue: number = 15,
  overloadMonth: boolean = false
): PredictionDataPoint[] {
  const today = new Date()
  const data: PredictionDataPoint[] = []

  // Historical data (past 30 days)
  for (let i = 30; i >= 1; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayOfWeek = date.getDay()

    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.5 : 1
    const variance = Math.random() * 0.3 - 0.15

    data.push({
      time: date.toISOString().split("T")[0],
      value: Math.round(baseValue * weekendMultiplier * (1 + variance)),
      type: "historical",
    })
  }

  // Projected data (next 30 days)
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dayOfWeek = date.getDay()

    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.5 : 1
    const overloadMultiplier = overloadMonth ? 1.3 : 1
    const variance = Math.random() * 0.2 - 0.1

    data.push({
      time: date.toISOString().split("T")[0],
      value: Math.round(baseValue * weekendMultiplier * overloadMultiplier * (1 + variance)),
      type: "projected",
    })
  }

  return data
}

// ============================================================================
// RECOMMENDATIONS DATA
// ============================================================================

export const normalRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    type: "appointment",
    message: "Mantener agenda actual: 15-18 citas/día",
    severity: "info",
    icon: "calendar",
  },
  {
    id: "rec-2",
    type: "staff",
    message: "Mantener dotación: 3 técnicos turno matutino",
    severity: "info",
    icon: "users",
  },
  {
    id: "rec-3",
    type: "inventory",
    message: "Stock de repuestos adecuado",
    severity: "info",
    icon: "package",
  },
]

export const overloadRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    type: "appointment",
    message: "Incrementar a 25-30 citas/día (Semana 24)",
    severity: "warning",
    icon: "calendar",
    week: 24,
  },
  {
    id: "rec-2",
    type: "staff",
    message: "Contratar 2 técnicos extra (Turno Matutino)",
    severity: "critical",
    icon: "users",
  },
  {
    id: "rec-3",
    type: "bay",
    message: "Habilitar bahía adicional para diagnóstico",
    severity: "warning",
    icon: "car",
  },
  {
    id: "rec-4",
    type: "inventory",
    message: "Aumentar stock: Filtros (+40%), Aceites (+35%)",
    severity: "warning",
    icon: "package",
  },
]

// ============================================================================
// QUICK STATS
// ============================================================================

export function generateQuickStats(isOverload: boolean): QuickStat[] {
  if (isOverload) {
    return [
      {
        label: "Promedio Semanal Proyectado",
        value: 23,
        unit: "servicios/día",
        change: 35,
        trend: "up",
      },
      {
        label: "Pico Máximo Proyectado",
        value: 28,
        unit: "servicios",
        change: 45,
        trend: "up",
      },
      {
        label: "Tendencia General",
        value: "+35%",
        change: 35,
        trend: "up",
      },
      {
        label: "Capacidad Disponible",
        value: "72%",
        change: -18,
        trend: "down",
      },
    ]
  }

  return [
    {
      label: "Promedio Semanal Proyectado",
      value: 16,
      unit: "servicios/día",
      change: 5,
      trend: "up",
    },
    {
      label: "Pico Máximo Proyectado",
      value: 19,
      unit: "servicios",
      change: 8,
      trend: "up",
    },
    {
      label: "Tendencia General",
      value: "+5%",
      change: 5,
      trend: "up",
    },
    {
      label: "Capacidad Disponible",
      value: "88%",
      change: 3,
      trend: "up",
    },
  ]
}

// ============================================================================
// HISTORICAL COMPARISON
// ============================================================================

export function generateHistoricalComparison(
  isOverload: boolean
): HistoricalComparison[] {
  if (isOverload) {
    return [
      {
        period: "Semana Actual vs Año Pasado",
        currentYear: 161,
        previousYear: 119,
        variance: 35.3,
      },
      {
        period: "Mes Actual vs Año Pasado",
        currentYear: 644,
        previousYear: 498,
        variance: 29.3,
      },
      {
        period: "Trimestre Actual vs Año Pasado",
        currentYear: 1872,
        previousYear: 1456,
        variance: 28.6,
      },
    ]
  }

  return [
    {
      period: "Semana Actual vs Año Pasado",
      currentYear: 112,
      previousYear: 119,
      variance: -5.9,
    },
    {
      period: "Mes Actual vs Año Pasado",
      currentYear: 472,
      previousYear: 498,
      variance: -5.2,
    },
    {
      period: "Trimestre Actual vs Año Pasado",
      currentYear: 1398,
      previousYear: 1456,
      variance: -4.0,
    },
  ]
}

// ============================================================================
// MODEL METRICS
// ============================================================================

export const modelMetrics: ModelMetrics = {
  accuracy: 87.3,
  lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  confidence: 91.2,
  maeScore: 2.4,
}

// ============================================================================
// OVERLOAD DETECTION
// ============================================================================

/**
 * Determines if there's an overload condition based on filters
 * For demo purposes, we simulate overload for specific filter combinations
 */
export function isOverloadCondition(
  taller: string,
  marca: string,
  modelo: string
): boolean {
  // Simulate overload for "Ambacar Norte" + "Great Wall"
  if (taller === "norte" && marca === "great-wall") {
    return true
  }

  // Simulate overload for "All" + "Haval" + "H6"
  if (taller === "all" && marca === "haval" && modelo === "h6") {
    return true
  }

  return false
}
