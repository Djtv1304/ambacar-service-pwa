// Smart Inventory - AI-Powered Inventory Intelligence System

export type RiskLevel = "critical" | "warning" | "optimal" | "overstock"
export type DemandTrend = "accelerating" | "stable" | "declining" | "seasonal"
export type PartStatus = "reorder_now" | "monitor" | "optimal" | "stagnant" | "excess"

export interface StockLocation {
  sucursal: string
  cantidad: number
  reservado: number
  disponible: number
}

export interface DemandPrediction {
  date: string
  predicted: number
  confidence: number
  factors: string[]
}

export interface ConsumptionHistory {
  date: string
  consumed: number
  type: "historical" | "predicted"
}

export interface SmartPart {
  id: string
  sku: string
  nombre: string
  descripcion: string
  categoria: string
  marca: string
  compatibleWith: string[]

  // Stock actual
  stockTotal: number
  stockByLocation: StockLocation[]
  umbralMinimo: number
  umbralOptimo: number

  // Precios
  precioCompra: number
  precioVenta: number
  costoPromedio: number
  margen: number

  // IA Predictions
  predictedDemandNextWeek: number
  predictedDemandNextMonth: number
  replenishmentConfidence: number // 0-100
  probabilidadUso: number // 0-100 - likelihood of being needed soon
  seasonalFactor: number // multiplier based on season
  demandTrend: DemandTrend

  // Smart Status
  riskLevel: RiskLevel
  status: PartStatus
  stockOptimoIA: number // AI calculated optimal stock
  diasHastaQuiebre: number | null // days until stockout

  // Recommendations
  cantidadRecomendadaPedido: number
  urgenciaPedido: "immediate" | "this_week" | "next_week" | "optional"
  razonRecomendacion: string

  // Historical
  consumptionHistory: ConsumptionHistory[]
  demandPredictions: DemandPrediction[]

  // Metadata
  lastUpdated: string
  modelVersion: string
}

export interface RiskAlert {
  id: string
  partId: string
  partName: string
  partSku: string
  riskLevel: RiskLevel
  title: string
  description: string
  stockActual: number
  demandaPredicha: number
  diasParaQuiebre: number | null
  accionRecomendada: string
  impactoFinanciero: number
  confianzaPrediccion: number
  createdAt: string
}

export interface AIModelMetrics {
  modelName: string
  modelVersion: string
  version: string
  lastTrainingDate: string
  trainingProgress: number // 0-100

  // Accuracy metrics
  accuracy: number // Overall accuracy 0-100
  mae: number // Mean Absolute Error
  rmse: number // Root Mean Square Error
  mape: number // Mean Absolute Percentage Error
  confidenceGlobal: number // 0-100

  // Training data
  totalSamples: number
  dataPointsAnalyzed: number
  predictionsGenerated: number
  trainingPeriodDays: number

  // Feature importance
  featureImportance: {
    feature: string
    importance: number
    enabled: boolean
  }[]

  // Performance by category
  categoryPerformance: {
    category: string
    accuracy: number
    sampleSize: number
  }[]
}

export interface RecommenderConfig {
  // Prediction settings
  predictionHorizonDays: number
  safetyStockMultiplier: number
  confidenceThreshold: number // 0-100
  reorderLeadTimeDays: number

  // Alert settings
  criticalThresholdDays: number
  warningThresholdDays: number
  enablePushNotifications: boolean
  autoReorderEnabled: boolean

  // Model features
  modelFeatures: string[]

  // Legacy fields (for compatibility)
  stockSeguridadDinamico: number // percentage
  nivelConfianzaReorden: number // 0-100
  horizontePrediccion: number // days
  frecuenciaReentrenamiento: "daily" | "weekly" | "monthly"
  alertasActivas: boolean
}

export interface PartFeedback {
  partId: string
  partSku: string
  partName: string
  predictedQuantity: number
  usedQuantity: number
  feedback: "accurate" | "overestimated" | "underestimated" | null
  reason?: string
}

export interface OTFeedback {
  otId: string
  otNumber: string
  vehiclePlate: string
  serviceType: string
  completedDate: string
  parts: PartFeedback[]
}

// ===================
// MOCK DATA
// ===================

// Generate consumption history for last 30 days + 14 days prediction
function generateConsumptionHistory(baseConsumption: number, trend: DemandTrend): ConsumptionHistory[] {
  const history: ConsumptionHistory[] = []
  const today = new Date()

  // Historical data (last 30 days)
  for (let i = 30; i >= 1; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    let variance = (Math.random() - 0.5) * baseConsumption * 0.4
    let trendFactor = 1

    if (trend === "accelerating") trendFactor = 1 + (30 - i) * 0.01
    else if (trend === "declining") trendFactor = 1 - (30 - i) * 0.008
    else if (trend === "seasonal") trendFactor = 1 + Math.sin(i / 5) * 0.3

    history.push({
      date: date.toISOString().split("T")[0],
      consumed: Math.max(0, Math.round((baseConsumption * trendFactor + variance) * 10) / 10),
      type: "historical",
    })
  }

  // Predicted data (next 14 days)
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)

    let trendFactor = 1
    if (trend === "accelerating") trendFactor = 1.15 + i * 0.02
    else if (trend === "declining") trendFactor = 0.9 - i * 0.01
    else if (trend === "seasonal") trendFactor = 1 + Math.sin((30 + i) / 5) * 0.3

    const variance = (Math.random() - 0.5) * baseConsumption * 0.2

    history.push({
      date: date.toISOString().split("T")[0],
      consumed: Math.max(0, Math.round((baseConsumption * trendFactor + variance) * 10) / 10),
      type: "predicted",
    })
  }

  return history
}

export const smartParts: SmartPart[] = [
  {
    id: "sp-001",
    sku: "FLT-ACE-001",
    nombre: "Filtro de Aceite Toyota",
    descripcion: "Filtro de aceite original para motores Toyota 1.8L-2.5L",
    categoria: "Filtros",
    marca: "Toyota",
    compatibleWith: ["Corolla", "RAV4", "Camry", "Hilux"],
    stockTotal: 5,
    stockByLocation: [
      { sucursal: "Quito Norte", cantidad: 3, reservado: 1, disponible: 2 },
      { sucursal: "Quito Sur", cantidad: 2, reservado: 0, disponible: 2 },
    ],
    umbralMinimo: 10,
    umbralOptimo: 25,
    precioCompra: 8.50,
    precioVenta: 15.99,
    costoPromedio: 8.50,
    margen: 0.47,
    predictedDemandNextWeek: 12,
    predictedDemandNextMonth: 45,
    replenishmentConfidence: 94,
    probabilidadUso: 95,
    seasonalFactor: 1.2,
    demandTrend: "accelerating",
    riskLevel: "critical",
    status: "reorder_now",
    stockOptimoIA: 28,
    diasHastaQuiebre: 3,
    cantidadRecomendadaPedido: 30,
    urgenciaPedido: "immediate",
    razonRecomendacion: "Demanda acelerada detectada. 3 servicios programados esta semana requieren este filtro.",
    consumptionHistory: generateConsumptionHistory(1.8, "accelerating"),
    demandPredictions: [],
    lastUpdated: new Date().toISOString(),
    modelVersion: "v2.4.1",
  },
  {
    id: "sp-002",
    sku: "PST-FRN-002",
    nombre: "Pastillas de Freno Delanteras",
    descripcion: "Juego de pastillas cerámicas premium para frenos delanteros",
    categoria: "Frenos",
    marca: "Brembo",
    compatibleWith: ["Corolla", "Civic", "Mazda 3", "Sentra"],
    stockTotal: 8,
    stockByLocation: [
      { sucursal: "Quito Norte", cantidad: 5, reservado: 2, disponible: 3 },
      { sucursal: "Quito Sur", cantidad: 3, reservado: 1, disponible: 2 },
    ],
    umbralMinimo: 6,
    umbralOptimo: 15,
    precioCompra: 45.00,
    precioVenta: 89.99,
    costoPromedio: 45.00,
    margen: 0.50,
    predictedDemandNextWeek: 7,
    predictedDemandNextMonth: 28,
    replenishmentConfidence: 87,
    probabilidadUso: 82,
    seasonalFactor: 1.0,
    demandTrend: "stable",
    riskLevel: "warning",
    status: "monitor",
    stockOptimoIA: 18,
    diasHastaQuiebre: 8,
    cantidadRecomendadaPedido: 15,
    urgenciaPedido: "this_week",
    razonRecomendacion: "Stock se agotará en 8 días según tendencia actual. Considerar pedido preventivo.",
    consumptionHistory: generateConsumptionHistory(1.0, "stable"),
    demandPredictions: [],
    lastUpdated: new Date().toISOString(),
    modelVersion: "v2.4.1",
  },
  {
    id: "sp-003",
    sku: "ACE-SYN-003",
    nombre: "Aceite Sintético 5W-30",
    descripcion: "Aceite de motor sintético completo, botella 1L",
    categoria: "Lubricantes",
    marca: "Mobil 1",
    compatibleWith: ["Universal"],
    stockTotal: 48,
    stockByLocation: [
      { sucursal: "Quito Norte", cantidad: 28, reservado: 5, disponible: 23 },
      { sucursal: "Quito Sur", cantidad: 20, reservado: 3, disponible: 17 },
    ],
    umbralMinimo: 20,
    umbralOptimo: 50,
    precioCompra: 12.00,
    precioVenta: 22.50,
    costoPromedio: 12.00,
    margen: 0.47,
    predictedDemandNextWeek: 35,
    predictedDemandNextMonth: 140,
    replenishmentConfidence: 91,
    probabilidadUso: 98,
    seasonalFactor: 1.1,
    demandTrend: "stable",
    riskLevel: "optimal",
    status: "optimal",
    stockOptimoIA: 55,
    diasHastaQuiebre: 12,
    cantidadRecomendadaPedido: 20,
    urgenciaPedido: "next_week",
    razonRecomendacion: "Niveles óptimos. Pedido sugerido para mantener buffer de seguridad.",
    consumptionHistory: generateConsumptionHistory(5.0, "stable"),
    demandPredictions: [],
    lastUpdated: new Date().toISOString(),
    modelVersion: "v2.4.1",
  },
  {
    id: "sp-004",
    sku: "BUJ-NGK-004",
    nombre: "Bujía NGK Iridium",
    descripcion: "Bujía de encendido iridium de larga duración",
    categoria: "Encendido",
    marca: "NGK",
    compatibleWith: ["Toyota", "Honda", "Nissan", "Mazda"],
    stockTotal: 32,
    stockByLocation: [
      { sucursal: "Quito Norte", cantidad: 20, reservado: 4, disponible: 16 },
      { sucursal: "Quito Sur", cantidad: 12, reservado: 0, disponible: 12 },
    ],
    umbralMinimo: 16,
    umbralOptimo: 40,
    precioCompra: 8.00,
    precioVenta: 16.50,
    costoPromedio: 8.00,
    margen: 0.52,
    predictedDemandNextWeek: 8,
    predictedDemandNextMonth: 30,
    replenishmentConfidence: 85,
    probabilidadUso: 65,
    seasonalFactor: 0.9,
    demandTrend: "declining",
    riskLevel: "optimal",
    status: "optimal",
    stockOptimoIA: 35,
    diasHastaQuiebre: 28,
    cantidadRecomendadaPedido: 0,
    urgenciaPedido: "optional",
    razonRecomendacion: "Stock saludable. Demanda ligeramente en descenso por temporada.",
    consumptionHistory: generateConsumptionHistory(1.2, "declining"),
    demandPredictions: [],
    lastUpdated: new Date().toISOString(),
    modelVersion: "v2.4.1",
  },
  {
    id: "sp-005",
    sku: "COR-DST-005",
    nombre: "Correa de Distribución",
    descripcion: "Kit de correa de distribución con tensor y poleas",
    categoria: "Motor",
    marca: "Gates",
    compatibleWith: ["Corolla", "Yaris", "Avensis"],
    stockTotal: 4,
    stockByLocation: [
      { sucursal: "Quito Norte", cantidad: 2, reservado: 1, disponible: 1 },
      { sucursal: "Quito Sur", cantidad: 2, reservado: 1, disponible: 1 },
    ],
    umbralMinimo: 3,
    umbralOptimo: 8,
    precioCompra: 85.00,
    precioVenta: 165.00,
    costoPromedio: 85.00,
    margen: 0.48,
    predictedDemandNextWeek: 3,
    predictedDemandNextMonth: 10,
    replenishmentConfidence: 78,
    probabilidadUso: 72,
    seasonalFactor: 1.3,
    demandTrend: "seasonal",
    riskLevel: "warning",
    status: "monitor",
    stockOptimoIA: 10,
    diasHastaQuiebre: 9,
    cantidadRecomendadaPedido: 8,
    urgenciaPedido: "this_week",
    razonRecomendacion: "Temporada alta de mantenimiento preventivo. Demanda estacional detectada.",
    consumptionHistory: generateConsumptionHistory(0.4, "seasonal"),
    demandPredictions: [],
    lastUpdated: new Date().toISOString(),
    modelVersion: "v2.4.1",
  },
  {
    id: "sp-006",
    sku: "AMT-DEL-006",
    nombre: "Amortiguador Delantero",
    descripcion: "Amortiguador hidráulico delantero izquierdo/derecho",
    categoria: "Suspensión",
    marca: "Monroe",
    compatibleWith: ["RAV4", "CR-V", "Tucson"],
    stockTotal: 12,
    stockByLocation: [
      { sucursal: "Quito Norte", cantidad: 8, reservado: 2, disponible: 6 },
      { sucursal: "Quito Sur", cantidad: 4, reservado: 0, disponible: 4 },
    ],
    umbralMinimo: 4,
    umbralOptimo: 12,
    precioCompra: 65.00,
    precioVenta: 125.00,
    costoPromedio: 65.00,
    margen: 0.48,
    predictedDemandNextWeek: 2,
    predictedDemandNextMonth: 8,
    replenishmentConfidence: 82,
    probabilidadUso: 45,
    seasonalFactor: 1.0,
    demandTrend: "stable",
    riskLevel: "optimal",
    status: "optimal",
    stockOptimoIA: 10,
    diasHastaQuiebre: 42,
    cantidadRecomendadaPedido: 0,
    urgenciaPedido: "optional",
    razonRecomendacion: "Stock óptimo para demanda proyectada.",
    consumptionHistory: generateConsumptionHistory(0.3, "stable"),
    demandPredictions: [],
    lastUpdated: new Date().toISOString(),
    modelVersion: "v2.4.1",
  },
  {
    id: "sp-007",
    sku: "BAT-BSH-007",
    nombre: "Batería 12V 60Ah",
    descripcion: "Batería de arranque libre mantenimiento",
    categoria: "Eléctrico",
    marca: "Bosch",
    compatibleWith: ["Universal - Vehículos medianos"],
    stockTotal: 6,
    stockByLocation: [
      { sucursal: "Quito Norte", cantidad: 4, reservado: 1, disponible: 3 },
      { sucursal: "Quito Sur", cantidad: 2, reservado: 0, disponible: 2 },
    ],
    umbralMinimo: 4,
    umbralOptimo: 10,
    precioCompra: 95.00,
    precioVenta: 175.00,
    costoPromedio: 95.00,
    margen: 0.46,
    predictedDemandNextWeek: 4,
    predictedDemandNextMonth: 14,
    replenishmentConfidence: 88,
    probabilidadUso: 78,
    seasonalFactor: 1.4,
    demandTrend: "accelerating",
    riskLevel: "warning",
    status: "monitor",
    stockOptimoIA: 12,
    diasHastaQuiebre: 11,
    cantidadRecomendadaPedido: 8,
    urgenciaPedido: "this_week",
    razonRecomendacion: "Temporada fría aumenta fallas de batería. Demanda acelerada detectada.",
    consumptionHistory: generateConsumptionHistory(0.5, "accelerating"),
    demandPredictions: [],
    lastUpdated: new Date().toISOString(),
    modelVersion: "v2.4.1",
  },
  {
    id: "sp-008",
    sku: "FLT-AIR-008",
    nombre: "Filtro de Aire Motor",
    descripcion: "Filtro de aire de alto flujo para motor",
    categoria: "Filtros",
    marca: "K&N",
    compatibleWith: ["Fortuner", "Hilux", "Land Cruiser"],
    stockTotal: 15,
    stockByLocation: [
      { sucursal: "Quito Norte", cantidad: 10, reservado: 2, disponible: 8 },
      { sucursal: "Quito Sur", cantidad: 5, reservado: 1, disponible: 4 },
    ],
    umbralMinimo: 8,
    umbralOptimo: 20,
    precioCompra: 35.00,
    precioVenta: 68.00,
    costoPromedio: 35.00,
    margen: 0.49,
    predictedDemandNextWeek: 6,
    predictedDemandNextMonth: 22,
    replenishmentConfidence: 86,
    probabilidadUso: 70,
    seasonalFactor: 1.1,
    demandTrend: "stable",
    riskLevel: "optimal",
    status: "optimal",
    stockOptimoIA: 18,
    diasHastaQuiebre: 18,
    cantidadRecomendadaPedido: 10,
    urgenciaPedido: "next_week",
    razonRecomendacion: "Mantener stock para temporada de polvo.",
    consumptionHistory: generateConsumptionHistory(0.8, "stable"),
    demandPredictions: [],
    lastUpdated: new Date().toISOString(),
    modelVersion: "v2.4.1",
  },
  {
    id: "sp-009",
    sku: "LIQ-FRN-009",
    nombre: "Líquido de Frenos DOT4",
    descripcion: "Líquido de frenos sintético DOT4, 500ml",
    categoria: "Fluidos",
    marca: "Castrol",
    compatibleWith: ["Universal"],
    stockTotal: 24,
    stockByLocation: [
      { sucursal: "Quito Norte", cantidad: 14, reservado: 2, disponible: 12 },
      { sucursal: "Quito Sur", cantidad: 10, reservado: 1, disponible: 9 },
    ],
    umbralMinimo: 12,
    umbralOptimo: 30,
    precioCompra: 8.00,
    precioVenta: 15.00,
    costoPromedio: 8.00,
    margen: 0.47,
    predictedDemandNextWeek: 8,
    predictedDemandNextMonth: 32,
    replenishmentConfidence: 90,
    probabilidadUso: 60,
    seasonalFactor: 1.0,
    demandTrend: "stable",
    riskLevel: "optimal",
    status: "optimal",
    stockOptimoIA: 28,
    diasHastaQuiebre: 21,
    cantidadRecomendadaPedido: 12,
    urgenciaPedido: "next_week",
    razonRecomendacion: "Stock saludable. Pedido de reposición rutinario.",
    consumptionHistory: generateConsumptionHistory(1.1, "stable"),
    demandPredictions: [],
    lastUpdated: new Date().toISOString(),
    modelVersion: "v2.4.1",
  },
  {
    id: "sp-010",
    sku: "EMP-CRT-010",
    nombre: "Empaque de Cárter",
    descripcion: "Empaque de silicona para tapa de cárter",
    categoria: "Empaques",
    marca: "Fel-Pro",
    compatibleWith: ["Corolla", "Yaris", "Avensis"],
    stockTotal: 45,
    stockByLocation: [
      { sucursal: "Quito Norte", cantidad: 25, reservado: 0, disponible: 25 },
      { sucursal: "Quito Sur", cantidad: 20, reservado: 0, disponible: 20 },
    ],
    umbralMinimo: 15,
    umbralOptimo: 30,
    precioCompra: 3.50,
    precioVenta: 8.00,
    costoPromedio: 3.50,
    margen: 0.56,
    predictedDemandNextWeek: 2,
    predictedDemandNextMonth: 8,
    replenishmentConfidence: 75,
    probabilidadUso: 25,
    seasonalFactor: 0.8,
    demandTrend: "declining",
    riskLevel: "overstock",
    status: "stagnant",
    stockOptimoIA: 20,
    diasHastaQuiebre: 150,
    cantidadRecomendadaPedido: 0,
    urgenciaPedido: "optional",
    razonRecomendacion: "Sobrestock detectado. Rotación lenta. Considerar promociones.",
    consumptionHistory: generateConsumptionHistory(0.3, "declining"),
    demandPredictions: [],
    lastUpdated: new Date().toISOString(),
    modelVersion: "v2.4.1",
  },
]

export const riskAlerts: RiskAlert[] = [
  {
    id: "alert-001",
    partId: "sp-001",
    partName: "Filtro de Aceite Toyota",
    partSku: "FLT-ACE-001",
    riskLevel: "critical",
    title: "Riesgo de Quiebre de Stock",
    description: "Stock actual insuficiente para cubrir demanda proyectada. 3 servicios programados requieren este filtro.",
    stockActual: 5,
    demandaPredicha: 12,
    diasParaQuiebre: 3,
    accionRecomendada: "Reordenar inmediatamente - Cantidad sugerida: 30 unidades",
    impactoFinanciero: 450.00,
    confianzaPrediccion: 94,
    createdAt: new Date().toISOString(),
  },
  {
    id: "alert-002",
    partId: "sp-002",
    partName: "Pastillas de Freno Delanteras",
    partSku: "PST-FRN-002",
    riskLevel: "warning",
    title: "Stock en Nivel de Alerta",
    description: "El stock alcanzará el umbral mínimo en 8 días según proyecciones.",
    stockActual: 8,
    demandaPredicha: 7,
    diasParaQuiebre: 8,
    accionRecomendada: "Programar pedido para esta semana - Cantidad sugerida: 15 unidades",
    impactoFinanciero: 280.00,
    confianzaPrediccion: 87,
    createdAt: new Date().toISOString(),
  },
  {
    id: "alert-003",
    partId: "sp-007",
    partName: "Batería 12V 60Ah",
    partSku: "BAT-BSH-007",
    riskLevel: "warning",
    title: "Demanda Estacional Detectada",
    description: "Temporada fría incrementa fallas de batería. Demanda proyectada superior al promedio.",
    stockActual: 6,
    demandaPredicha: 4,
    diasParaQuiebre: 11,
    accionRecomendada: "Incrementar stock preventivamente - Cantidad sugerida: 8 unidades",
    impactoFinanciero: 520.00,
    confianzaPrediccion: 88,
    createdAt: new Date().toISOString(),
  },
  {
    id: "alert-004",
    partId: "sp-010",
    partName: "Empaque de Cárter",
    partSku: "EMP-CRT-010",
    riskLevel: "overstock",
    title: "Sobrestock Detectado",
    description: "Inventario excede significativamente la demanda proyectada. Capital inmovilizado.",
    stockActual: 45,
    demandaPredicha: 8,
    diasParaQuiebre: 150,
    accionRecomendada: "Considerar promociones o redistribución entre sucursales",
    impactoFinanciero: -157.50,
    confianzaPrediccion: 75,
    createdAt: new Date().toISOString(),
  },
]

export const aiModelMetrics: AIModelMetrics = {
  modelName: "DemandForecaster Pro",
  modelVersion: "2.4.1",
  version: "v2.4.1",
  lastTrainingDate: "hace 2 días",
  trainingProgress: 100,
  accuracy: 92.3,
  mae: 1.24,
  rmse: 1.87,
  mape: 8.5,
  confidenceGlobal: 89,
  totalSamples: 45678,
  dataPointsAnalyzed: 45678,
  predictionsGenerated: 8234,
  trainingPeriodDays: 365,
  featureImportance: [
    { feature: "Historial de Servicios", importance: 0.35, enabled: true },
    { feature: "Estacionalidad", importance: 0.22, enabled: true },
    { feature: "Datos Climáticos", importance: 0.15, enabled: true },
    { feature: "Festivos Locales", importance: 0.12, enabled: true },
    { feature: "Promociones Activas", importance: 0.10, enabled: false },
    { feature: "Edad del Vehículo", importance: 0.06, enabled: true },
  ],
  categoryPerformance: [
    { category: "Filtros", accuracy: 94, sampleSize: 12500 },
    { category: "Frenos", accuracy: 91, sampleSize: 8900 },
    { category: "Lubricantes", accuracy: 96, sampleSize: 15200 },
    { category: "Encendido", accuracy: 88, sampleSize: 6700 },
    { category: "Suspensión", accuracy: 85, sampleSize: 4200 },
    { category: "Eléctrico", accuracy: 82, sampleSize: 3800 },
  ],
}

export const recommenderConfig: RecommenderConfig = {
  // Prediction settings
  predictionHorizonDays: 14,
  safetyStockMultiplier: 1.5,
  confidenceThreshold: 75,
  reorderLeadTimeDays: 7,

  // Alert settings
  criticalThresholdDays: 5,
  warningThresholdDays: 14,
  enablePushNotifications: true,
  autoReorderEnabled: false,

  // Model features
  modelFeatures: [
    "consumption_history",
    "seasonality",
    "service_type",
    "vehicle_brand",
    "vehicle_age",
    "day_of_week",
  ],

  // Legacy fields (for compatibility)
  stockSeguridadDinamico: 20,
  nivelConfianzaReorden: 75,
  horizontePrediccion: 14,
  frecuenciaReentrenamiento: "weekly",
  alertasActivas: true,
}

export const otFeedbackData: OTFeedback[] = [
  {
    otId: "ot-12345",
    otNumber: "OT-2026-0145",
    vehiclePlate: "ABC-1234",
    serviceType: "Mantenimiento 10,000 km",
    completedDate: "2026-01-20",
    parts: [
      {
        partId: "sp-001",
        partSku: "FLT-TOY-001",
        partName: "Filtro de Aceite Toyota",
        predictedQuantity: 1,
        usedQuantity: 1,
        feedback: null,
      },
      {
        partId: "sp-003",
        partSku: "OIL-SYN-5W30",
        partName: "Aceite Sintético 5W-30",
        predictedQuantity: 4,
        usedQuantity: 4,
        feedback: null,
      },
      {
        partId: "sp-002",
        partSku: "BRK-PAD-FR",
        partName: "Pastillas de Freno Delanteras",
        predictedQuantity: 1,
        usedQuantity: 0,
        feedback: null,
      },
      {
        partId: "sp-004",
        partSku: "SPK-NGK-IR",
        partName: "Bujía NGK Iridium",
        predictedQuantity: 4,
        usedQuantity: 4,
        feedback: null,
      },
    ],
  },
  {
    otId: "ot-12346",
    otNumber: "OT-2026-0146",
    vehiclePlate: "XYZ-5678",
    serviceType: "Reparación de Frenos",
    completedDate: "2026-01-19",
    parts: [
      {
        partId: "sp-002",
        partSku: "BRK-PAD-FR",
        partName: "Pastillas de Freno Delanteras",
        predictedQuantity: 1,
        usedQuantity: 1,
        feedback: null,
      },
      {
        partId: "sp-006",
        partSku: "BRK-DSC-FR",
        partName: "Disco de Freno Delantero",
        predictedQuantity: 2,
        usedQuantity: 2,
        feedback: null,
      },
      {
        partId: "sp-007",
        partSku: "BRK-FLD-DOT4",
        partName: "Líquido de Frenos DOT4",
        predictedQuantity: 1,
        usedQuantity: 2,
        feedback: null,
      },
    ],
  },
]

