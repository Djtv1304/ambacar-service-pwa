/**
 * Workflow Configuration - Mock Data Fixtures
 * Contains default phase templates and active orders for exception management
 */

export type ServiceType = "preventivo" | "correctivo" | "express" | "garantia"

export interface WorkflowPhase {
  id: string
  nombre: string
  descripcion: string
  tiempoEstimado: number // in minutes
  orden: number
  esCritica: boolean // Cannot be deleted if already executed
  ejecutada?: boolean // For exception mode - if phase was already completed
  color?: string
}

export interface WorkflowTemplate {
  id: string
  tipoServicio: ServiceType
  nombre: string
  descripcion: string
  fases: WorkflowPhase[]
  createdAt: Date
  updatedAt: Date
}

export interface ActiveOrderForSearch {
  id: string
  codigo: string
  placa: string
  clienteNombre: string
  vehiculoModelo: string
  tipoServicio: ServiceType
  estadoActual: string
  fasesPersonalizadas?: WorkflowPhase[]
  fasesCompletadas: string[] // IDs of completed phases
}

// Service type labels
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  preventivo: "Mantenimiento Preventivo",
  correctivo: "Reparación Correctiva",
  express: "Servicio Express",
  garantia: "Servicio de Garantía",
}

// Default phase templates by service type
export const defaultTemplates: WorkflowTemplate[] = [
  {
    id: "template-preventivo",
    tipoServicio: "preventivo",
    nombre: "Flujo de Mantenimiento Preventivo",
    descripcion: "Proceso estándar para servicios de mantenimiento programado",
    fases: [
      {
        id: "fase-1",
        nombre: "Recepción",
        descripcion: "Ingreso del vehículo y verificación de datos",
        tiempoEstimado: 30,
        orden: 1,
        esCritica: true,
        color: "#3B82F6",
      },
      {
        id: "fase-2",
        nombre: "Diagnóstico Inicial",
        descripcion: "Inspección visual y lectura de códigos",
        tiempoEstimado: 45,
        orden: 2,
        esCritica: true,
        color: "#8B5CF6",
      },
      {
        id: "fase-3",
        nombre: "Mantenimiento",
        descripcion: "Ejecución del servicio de mantenimiento programado",
        tiempoEstimado: 120,
        orden: 3,
        esCritica: false,
        color: "#F59E0B",
      },
      {
        id: "fase-4",
        nombre: "Control de Calidad",
        descripcion: "Verificación de trabajos realizados",
        tiempoEstimado: 30,
        orden: 4,
        esCritica: true,
        color: "#10B981",
      },
      {
        id: "fase-5",
        nombre: "Lavado y Limpieza",
        descripcion: "Limpieza exterior e interior del vehículo",
        tiempoEstimado: 45,
        orden: 5,
        esCritica: false,
        color: "#06B6D4",
      },
      {
        id: "fase-6",
        nombre: "Entrega",
        descripcion: "Entrega del vehículo al cliente con explicación",
        tiempoEstimado: 20,
        orden: 6,
        esCritica: true,
        color: "#22C55E",
      },
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "template-correctivo",
    tipoServicio: "correctivo",
    nombre: "Flujo de Reparación Correctiva",
    descripcion: "Proceso para reparaciones no programadas",
    fases: [
      {
        id: "fase-c1",
        nombre: "Recepción",
        descripcion: "Ingreso del vehículo y registro de síntomas",
        tiempoEstimado: 30,
        orden: 1,
        esCritica: true,
        color: "#3B82F6",
      },
      {
        id: "fase-c2",
        nombre: "Diagnóstico Completo",
        descripcion: "Identificación detallada del problema",
        tiempoEstimado: 90,
        orden: 2,
        esCritica: true,
        color: "#8B5CF6",
      },
      {
        id: "fase-c3",
        nombre: "Cotización",
        descripcion: "Elaboración y aprobación de presupuesto",
        tiempoEstimado: 60,
        orden: 3,
        esCritica: true,
        color: "#EC4899",
      },
      {
        id: "fase-c4",
        nombre: "Reparación",
        descripcion: "Ejecución de los trabajos de reparación",
        tiempoEstimado: 240,
        orden: 4,
        esCritica: false,
        color: "#F59E0B",
      },
      {
        id: "fase-c5",
        nombre: "Control de Calidad",
        descripcion: "Verificación y prueba de funcionamiento",
        tiempoEstimado: 45,
        orden: 5,
        esCritica: true,
        color: "#10B981",
      },
      {
        id: "fase-c6",
        nombre: "Entrega",
        descripcion: "Entrega del vehículo con garantía de servicio",
        tiempoEstimado: 30,
        orden: 6,
        esCritica: true,
        color: "#22C55E",
      },
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-11-15"),
  },
  {
    id: "template-express",
    tipoServicio: "express",
    nombre: "Flujo de Servicio Express",
    descripcion: "Proceso rápido para servicios básicos",
    fases: [
      {
        id: "fase-e1",
        nombre: "Recepción Express",
        descripcion: "Registro rápido del vehículo",
        tiempoEstimado: 10,
        orden: 1,
        esCritica: true,
        color: "#3B82F6",
      },
      {
        id: "fase-e2",
        nombre: "Servicio Rápido",
        descripcion: "Ejecución del servicio express",
        tiempoEstimado: 45,
        orden: 2,
        esCritica: false,
        color: "#F59E0B",
      },
      {
        id: "fase-e3",
        nombre: "Verificación",
        descripcion: "Control rápido de calidad",
        tiempoEstimado: 10,
        orden: 3,
        esCritica: true,
        color: "#10B981",
      },
      {
        id: "fase-e4",
        nombre: "Entrega Inmediata",
        descripcion: "Entrega del vehículo",
        tiempoEstimado: 5,
        orden: 4,
        esCritica: true,
        color: "#22C55E",
      },
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-10-20"),
  },
  {
    id: "template-garantia",
    tipoServicio: "garantia",
    nombre: "Flujo de Servicio de Garantía",
    descripcion: "Proceso para reclamos de garantía",
    fases: [
      {
        id: "fase-g1",
        nombre: "Recepción de Garantía",
        descripcion: "Verificación de cobertura de garantía",
        tiempoEstimado: 45,
        orden: 1,
        esCritica: true,
        color: "#3B82F6",
      },
      {
        id: "fase-g2",
        nombre: "Diagnóstico Técnico",
        descripcion: "Evaluación del problema reportado",
        tiempoEstimado: 60,
        orden: 2,
        esCritica: true,
        color: "#8B5CF6",
      },
      {
        id: "fase-g3",
        nombre: "Validación Garantía",
        descripcion: "Aprobación con fábrica o distribuidor",
        tiempoEstimado: 120,
        orden: 3,
        esCritica: true,
        color: "#EC4899",
      },
      {
        id: "fase-g4",
        nombre: "Reparación/Reemplazo",
        descripcion: "Ejecución del servicio cubierto",
        tiempoEstimado: 180,
        orden: 4,
        esCritica: false,
        color: "#F59E0B",
      },
      {
        id: "fase-g5",
        nombre: "Control de Calidad",
        descripcion: "Verificación final del trabajo",
        tiempoEstimado: 30,
        orden: 5,
        esCritica: true,
        color: "#10B981",
      },
      {
        id: "fase-g6",
        nombre: "Documentación y Entrega",
        descripcion: "Cierre de caso de garantía y entrega",
        tiempoEstimado: 30,
        orden: 6,
        esCritica: true,
        color: "#22C55E",
      },
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-10"),
  },
]

// Mock active orders for vehicle search (exception mode)
export const activeOrders: ActiveOrderForSearch[] = [
  {
    id: "order-1",
    codigo: "OT-2025-MANT-001",
    placa: "ABC-1234",
    clienteNombre: "Juan Pérez",
    vehiculoModelo: "Toyota Corolla 2022",
    tipoServicio: "preventivo",
    estadoActual: "En Diagnóstico",
    fasesCompletadas: ["fase-1"],
    fasesPersonalizadas: undefined,
  },
  {
    id: "order-2",
    codigo: "OT-2025-REP-042",
    placa: "XYZ-7890",
    clienteNombre: "María González",
    vehiculoModelo: "Chevrolet Sail 2021",
    tipoServicio: "correctivo",
    estadoActual: "En Reparación",
    fasesCompletadas: ["fase-c1", "fase-c2", "fase-c3"],
    fasesPersonalizadas: [
      {
        id: "fase-c1",
        nombre: "Recepción",
        descripcion: "Ingreso del vehículo y registro de síntomas",
        tiempoEstimado: 30,
        orden: 1,
        esCritica: true,
        ejecutada: true,
        color: "#3B82F6",
      },
      {
        id: "fase-c2",
        nombre: "Diagnóstico Completo",
        descripcion: "Identificación detallada del problema",
        tiempoEstimado: 90,
        orden: 2,
        esCritica: true,
        ejecutada: true,
        color: "#8B5CF6",
      },
      {
        id: "fase-c3",
        nombre: "Cotización",
        descripcion: "Elaboración y aprobación de presupuesto",
        tiempoEstimado: 60,
        orden: 3,
        esCritica: true,
        ejecutada: true,
        color: "#EC4899",
      },
      {
        id: "fase-c4-custom",
        nombre: "Reparación de Motor",
        descripcion: "Trabajo especializado en motor",
        tiempoEstimado: 300,
        orden: 4,
        esCritica: false,
        ejecutada: false,
        color: "#F59E0B",
      },
      {
        id: "fase-c5-custom",
        nombre: "Prueba de Ruta Extendida",
        descripcion: "Verificación en carretera por 50km",
        tiempoEstimado: 120,
        orden: 5,
        esCritica: false,
        ejecutada: false,
        color: "#14B8A6",
      },
      {
        id: "fase-c6",
        nombre: "Control de Calidad",
        descripcion: "Verificación y prueba de funcionamiento",
        tiempoEstimado: 45,
        orden: 6,
        esCritica: true,
        ejecutada: false,
        color: "#10B981",
      },
      {
        id: "fase-c7",
        nombre: "Entrega",
        descripcion: "Entrega del vehículo con garantía de servicio",
        tiempoEstimado: 30,
        orden: 7,
        esCritica: true,
        ejecutada: false,
        color: "#22C55E",
      },
    ],
  },
  {
    id: "order-3",
    codigo: "OT-2025-EXP-015",
    placa: "DEF-4567",
    clienteNombre: "Carlos Rodríguez",
    vehiculoModelo: "Hyundai Accent 2023",
    tipoServicio: "express",
    estadoActual: "En Servicio",
    fasesCompletadas: ["fase-e1"],
    fasesPersonalizadas: undefined,
  },
  {
    id: "order-4",
    codigo: "OT-2025-GAR-008",
    placa: "GHI-8901",
    clienteNombre: "Ana Martínez",
    vehiculoModelo: "Kia Rio 2024",
    tipoServicio: "garantia",
    estadoActual: "Validación Garantía",
    fasesCompletadas: ["fase-g1", "fase-g2"],
    fasesPersonalizadas: undefined,
  },
  {
    id: "order-5",
    codigo: "OT-2025-MANT-089",
    placa: "JKL-2345",
    clienteNombre: "Roberto Sánchez",
    vehiculoModelo: "Nissan Sentra 2020",
    tipoServicio: "preventivo",
    estadoActual: "En Mantenimiento",
    fasesCompletadas: ["fase-1", "fase-2"],
    fasesPersonalizadas: undefined,
  },
]

// Helper function to get template by service type
export function getTemplateByServiceType(tipoServicio: ServiceType): WorkflowTemplate | undefined {
  return defaultTemplates.find(t => t.tipoServicio === tipoServicio)
}

// Helper function to search orders by plate or code
export function searchOrders(query: string): ActiveOrderForSearch[] {
  const normalizedQuery = query.toLowerCase().trim()
  return activeOrders.filter(
    order =>
      order.placa.toLowerCase().includes(normalizedQuery) ||
      order.codigo.toLowerCase().includes(normalizedQuery)
  )
}

// Helper function to calculate total time in minutes
export function calculateTotalTime(fases: WorkflowPhase[]): number {
  return fases.reduce((total, fase) => total + fase.tiempoEstimado, 0)
}

// Helper function to format time in hours and minutes
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

