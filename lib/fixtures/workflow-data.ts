/**
 * Workflow Configuration - Mock Data Fixtures
 * Contains default phase templates and active orders for exception management
 *
 * @fileoverview This file contains mock data for the workflow configuration module.
 * The data structures defined here serve as the contract for the Backend API.
 *
 * @see Backend API Contract Documentation below each interface
 */

// ============================================================================
// TYPE DEFINITIONS - Backend API Contract
// ============================================================================

/**
 * Service types available in the system
 * @backend Maps to: `service_types` enum in database
 */
export type ServiceType = "preventivo" | "correctivo" | "express" | "garantia"

/**
 * Represents a single phase in a workflow.
 *
 * @backend API Contract for Phase Entity:
 *
 * Required fields for CREATE/UPDATE:
 * - `id`: string - Unique identifier. For new phases, use format `fase-temp-{timestamp}`.
 *         Backend will replace with permanent UUID on save.
 * - `nombre`: string (max 50 chars) - Phase name, required, non-empty
 * - `tiempoEstimado`: number (1-480) - Estimated time in minutes
 * - `orden`: number (1-15) - Position in the workflow sequence (1-indexed)
 * - `esCritica`: boolean - If true, phase cannot be deleted once executed
 *
 * Optional fields:
 * - `descripcion`: string (max 200 chars) - Brief description
 * - `color`: string (hex color) - Display color for UI
 *
 * Read-only fields (set by backend):
 * - `ejecutada`: boolean - True if phase has been completed for this order
 * - `fechaEjecucion`: Date - Timestamp when phase was completed
 * - `tecnicoId`: string - ID of technician who completed the phase
 *
 * @example
 * // Minimum valid phase for creation
 * {
 *   id: "fase-temp-1702749600000",
 *   nombre: "Recepción",
 *   descripcion: "",
 *   tiempoEstimado: 30,
 *   orden: 1,
 *   esCritica: true
 * }
 */
export interface WorkflowPhase {
  /** Unique identifier. Use `fase-temp-{timestamp}` for new phases. */
  id: string
  /** Phase name (required, max 50 chars) */
  nombre: string
  /** Brief description (optional, max 200 chars) */
  descripcion: string
  /** Estimated time in minutes (1-480) */
  tiempoEstimado: number
  /** Position in workflow sequence (1-indexed) */
  orden: number
  /** If true, cannot be deleted once executed */
  esCritica: boolean
  /** Read-only: True if phase has been completed */
  ejecutada?: boolean
  /** Display color (hex format, e.g., "#3B82F6") */
  color?: string
}

/**
 * Represents a workflow template for a specific service type.
 * Templates define the default phases for new orders.
 *
 * @backend API Endpoint: GET /api/workflow-templates/:serviceType
 * @backend API Endpoint: PUT /api/workflow-templates/:id (Admin only)
 */
export interface WorkflowTemplate {
  id: string
  tipoServicio: ServiceType
  nombre: string
  descripcion: string
  fases: WorkflowPhase[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Represents an active order that can be searched for exception editing.
 *
 * @backend API Endpoint: GET /api/orders/search?q={plate|orderCode}
 * @backend Returns: Array of matching orders with their current workflow state
 */
export interface ActiveOrderForSearch {
  /** Order unique identifier */
  id: string
  /** Order code (e.g., "OT-2025-MANT-001") */
  codigo: string
  /** Vehicle license plate */
  placa: string
  /** Customer full name */
  clienteNombre: string
  /** Vehicle make/model/year */
  vehiculoModelo: string
  /** Type of service being performed */
  tipoServicio: ServiceType
  /** Current status description */
  estadoActual: string
  /**
   * Custom phases for this order (if modified from template).
   * If undefined, use default template phases.
   */
  fasesPersonalizadas?: WorkflowPhase[]
  /** Array of phase IDs that have been completed */
  fasesCompletadas: string[]
}

/**
 * Payload for saving workflow configuration.
 *
 * @backend API Contract for Workflow Save:
 *
 * For Global Template Update:
 * - POST /api/workflow-templates/:serviceType
 * - Body: { fases: WorkflowPhase[] }
 *
 * For Order Exception:
 * - PUT /api/orders/:orderId/workflow
 * - Body: WorkflowPayload
 *
 * @example
 * // Save exception for specific order
 * {
 *   orderId: "order-123",
 *   tipoServicio: "preventivo",
 *   isException: true,
 *   fases: [...],
 *   metadata: {
 *     modifiedBy: "user-456",
 *     modifiedAt: "2025-12-16T10:30:00Z",
 *     reason: "Cliente solicita fase adicional de revisión"
 *   }
 * }
 */
export interface WorkflowPayload {
  /** Order ID (required for exceptions, null for templates) */
  orderId?: string
  /** Service type being configured */
  tipoServicio: ServiceType
  /** True if this is an exception for a specific order */
  isException: boolean
  /** Array of phases in order */
  fases: WorkflowPhase[]
  /** Optional metadata for audit trail */
  metadata?: {
    modifiedBy: string
    modifiedAt: string
    reason?: string
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Service type display labels */
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  preventivo: "Mantenimiento Preventivo",
  correctivo: "Reparación Correctiva",
  express: "Servicio Express",
  garantia: "Servicio de Garantía",
}

// ============================================================================
// DEFAULT TEMPLATES - Standard workflow configurations
// ============================================================================

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

// ============================================================================
// ACTIVE ORDERS - Mock data for Exception Mode testing
// ============================================================================

/**
 * Mock active orders for testing the Exception Mode (vehicle search).
 *
 * Test Cases:
 * - PCU6322: Standard preventive maintenance (no custom phases)
 * - PDI2144: Order with custom phases already modified (exception exists)
 * - PCU7089: Warranty service (loads different template)
 * - ABC-1234: In diagnosis phase
 * - XYZ-7890: Complex repair with multiple completed phases
 */
export const activeOrders: ActiveOrderForSearch[] = [
  // -------------------------------------------------------------------------
  // CASE 1: PCU6322 - Standard Preventive Maintenance (No modifications)
  // Use this to test creating a NEW exception from scratch
  // -------------------------------------------------------------------------
  {
    id: "order-pcu6322",
    codigo: "OT-2025-MANT-101",
    placa: "PCU6322",
    clienteNombre: "Diego Armando Maradona",
    vehiculoModelo: "Great Wall Haval H6 2024",
    tipoServicio: "preventivo",
    estadoActual: "En Diagnóstico Inicial",
    fasesCompletadas: ["fase-1"],
    fasesPersonalizadas: undefined, // Uses default template
  },

  // -------------------------------------------------------------------------
  // CASE 2: PDI2144 - Order with EXISTING custom phases
  // Use this to test editing an already-modified workflow
  // -------------------------------------------------------------------------
  {
    id: "order-pdi2144",
    codigo: "OT-2025-REP-055",
    placa: "PDI2144",
    clienteNombre: "Carlos Alberto Paredes",
    vehiculoModelo: "Chevrolet Captiva 2023",
    tipoServicio: "correctivo",
    estadoActual: "En Reparación Especializada",
    fasesCompletadas: ["fase-pdi-1", "fase-pdi-2", "fase-pdi-3"],
    fasesPersonalizadas: [
      {
        id: "fase-pdi-1",
        nombre: "Recepción Urgente",
        descripcion: "Ingreso prioritario por falla crítica",
        tiempoEstimado: 15,
        orden: 1,
        esCritica: true,
        ejecutada: true,
        color: "#DC2626",
      },
      {
        id: "fase-pdi-2",
        nombre: "Diagnóstico Electrónico",
        descripcion: "Escaneo completo de módulos",
        tiempoEstimado: 120,
        orden: 2,
        esCritica: true,
        ejecutada: true,
        color: "#8B5CF6",
      },
      {
        id: "fase-pdi-3",
        nombre: "Aprobación Cliente",
        descripcion: "Cotización aprobada vía WhatsApp",
        tiempoEstimado: 30,
        orden: 3,
        esCritica: true,
        ejecutada: true,
        color: "#EC4899",
      },
      {
        id: "fase-pdi-4",
        nombre: "Reparación de Transmisión",
        descripcion: "Trabajo especializado en caja CVT",
        tiempoEstimado: 480,
        orden: 4,
        esCritica: false,
        ejecutada: false,
        color: "#F59E0B",
      },
      {
        id: "fase-pdi-5",
        nombre: "Prueba de Ruta Extendida",
        descripcion: "Verificación en carretera por 80km",
        tiempoEstimado: 180,
        orden: 5,
        esCritica: false,
        ejecutada: false,
        color: "#14B8A6",
      },
      {
        id: "fase-pdi-6",
        nombre: "Control de Calidad Final",
        descripcion: "Revisión exhaustiva post-reparación",
        tiempoEstimado: 60,
        orden: 6,
        esCritica: true,
        ejecutada: false,
        color: "#10B981",
      },
      {
        id: "fase-pdi-7",
        nombre: "Entrega con Garantía",
        descripcion: "Entrega con 6 meses de garantía en transmisión",
        tiempoEstimado: 45,
        orden: 7,
        esCritica: true,
        ejecutada: false,
        color: "#22C55E",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // CASE 3: PCU7089 - Warranty Service (Different template)
  // Use this to test loading the "garantia" template
  // -------------------------------------------------------------------------
  {
    id: "order-pcu7089",
    codigo: "OT-2025-GAR-012",
    placa: "PCU7089",
    clienteNombre: "María Fernanda López",
    vehiculoModelo: "Kia Sportage 2025",
    tipoServicio: "garantia",
    estadoActual: "Validación con Fábrica",
    fasesCompletadas: ["fase-g1", "fase-g2"],
    fasesPersonalizadas: undefined, // Uses default warranty template
  },

  // -------------------------------------------------------------------------
  // Legacy test cases (maintained for backwards compatibility)
  // -------------------------------------------------------------------------
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the default template for a service type.
 * @param tipoServicio - The service type to get template for
 * @returns The matching template or undefined
 */
export function getTemplateByServiceType(tipoServicio: ServiceType): WorkflowTemplate | undefined {
  return defaultTemplates.find(t => t.tipoServicio === tipoServicio)
}

/**
 * Search orders by license plate or order code.
 * @param query - Search term (plate or order code)
 * @returns Array of matching orders
 */
export function searchOrders(query: string): ActiveOrderForSearch[] {
  const normalizedQuery = query.toLowerCase().trim()
  if (!normalizedQuery) return []

  return activeOrders.filter(
    order =>
      order.placa.toLowerCase().includes(normalizedQuery) ||
      order.codigo.toLowerCase().includes(normalizedQuery)
  )
}

/**
 * Calculate total time for a list of phases.
 * @param fases - Array of phases
 * @returns Total time in minutes
 */
export function calculateTotalTime(fases: WorkflowPhase[]): number {
  return fases.reduce((total, fase) => total + fase.tiempoEstimado, 0)
}

/**
 * Format minutes as human-readable time string.
 * @param minutes - Time in minutes
 * @returns Formatted string (e.g., "2h 30min")
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

/**
 * Generate a temporary ID for new phases.
 * Backend will replace with permanent UUID on save.
 * @returns Temporary phase ID
 */
export function generateTempPhaseId(): string {
  return `fase-temp-${Date.now()}`
}

