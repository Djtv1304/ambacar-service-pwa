/**
 * Technical Progress Module - Mock Data Fixtures
 * Covers both Technician View and Admin Kanban View
 */

// Phase status types
export type PhaseStatus = "completed" | "in_progress" | "pending"

// Work order phases
export type WorkOrderPhase =
  | "recepcion"
  | "diagnostico"
  | "reparacion"
  | "calidad"
  | "entrega"

export const PHASE_CONFIG: Record<WorkOrderPhase, {
  label: string
  order: number
  maxHours: number // Alert threshold
}> = {
  recepcion: { label: "Recepción", order: 1, maxHours: 1 },
  diagnostico: { label: "Diagnóstico", order: 2, maxHours: 3 },
  reparacion: { label: "Reparación", order: 3, maxHours: 4 },
  calidad: { label: "Control de Calidad", order: 4, maxHours: 2 },
  entrega: { label: "Entrega", order: 5, maxHours: 1 },
}

// Evidence types
export interface PhaseEvidence {
  id: string
  tipo: "foto" | "video" | "audio"
  url: string
  thumbnail?: string
  descripcion?: string
  fecha: Date
}

// Phase timeline item
export interface PhaseTimelineItem {
  id: string
  fase: WorkOrderPhase
  estado: PhaseStatus
  fechaInicio?: Date
  fechaFin?: Date
  duracionMinutos?: number
  tecnicoId?: string
  tecnicoNombre?: string
  observaciones?: string
  evidencia?: PhaseEvidence[]
}

// Additional work item for technician
export interface AdditionalWorkItem {
  id: string
  titulo: string
  descripcion: string
  completado: boolean
  fechaAprobacion: Date
  costoTotal: number
}

// Part used in work order
export interface PartUsed {
  id: string
  codigo: string
  descripcion: string
  cantidad: number
  unidad: string
  precioUnitario: number
}

// Complete technician order view
export interface TechnicianOrder {
  id: string
  codigo: string
  estado: "abierta" | "en_proceso" | "pausada" | "cerrada"
  tipoOrden: "mantenimiento" | "reparacion" | "garantia"
  fechaCreacion: Date
  fechaEstimadaEntrega: Date
  cliente: {
    id: string
    nombre: string
    apellido: string
    telefono: string
    email: string
  }
  vehiculo: {
    id: string
    placa: string
    marca: string
    modelo: string
    anio: number
    color: string
    vin: string
    kilometraje: number
  }
  asesor: {
    id: string
    nombre: string
  }
  tecnicoAsignado: {
    id: string
    nombre: string
    especialidad: string
  }
  fases: PhaseTimelineItem[]
  trabajosAdicionales: AdditionalWorkItem[]
  repuestosUtilizados: PartUsed[]
  descripcionProblema: string
  diagnosticoInicial?: string
}

// Kanban card for admin view
export interface KanbanCard {
  id: string
  ordenId: string
  codigo: string
  placa: string
  marca: string
  modelo: string
  tecnicoId: string
  tecnicoNombre: string
  tecnicoAvatar?: string
  problemaBreve: string
  faseActual: WorkOrderPhase
  tiempoEnFaseMinutos: number
  alertaRetraso: boolean
  prioridad: "alta" | "normal" | "baja"
}

// Kanban board structure
export interface KanbanBoard {
  columnas: Record<WorkOrderPhase, KanbanCard[]>
  totalOrdenes: number
}

// ============================================
// MOCK DATA: Technician Order View
// ============================================

export const mockTechnicianOrder: TechnicianOrder = {
  id: "ot-001",
  codigo: "OT-2025-MANT-014",
  estado: "en_proceso",
  tipoOrden: "mantenimiento",
  fechaCreacion: new Date("2025-12-14T08:00:00"),
  fechaEstimadaEntrega: new Date("2025-12-16T14:00:00"),
  cliente: {
    id: "c1",
    nombre: "Carlos",
    apellido: "Mendoza",
    telefono: "0991234567",
    email: "carlos.mendoza@email.com",
  },
  vehiculo: {
    id: "v1",
    placa: "PBX-4521",
    marca: "Toyota",
    modelo: "Hilux",
    anio: 2022,
    color: "Blanco",
    vin: "JTFDU5AN7NJ012345",
    kilometraje: 45000,
  },
  asesor: {
    id: "a1",
    nombre: "Roberto Paz",
  },
  tecnicoAsignado: {
    id: "t1",
    nombre: "Miguel Torres",
    especialidad: "Mecánica General",
  },
  fases: [
    {
      id: "fase-1",
      fase: "recepcion",
      estado: "completed",
      fechaInicio: new Date("2025-12-14T08:15:00"),
      fechaFin: new Date("2025-12-14T08:45:00"),
      duracionMinutos: 30,
      tecnicoNombre: "Carlos Recepción",
      observaciones: "Vehículo recibido sin daños visibles. Cliente reporta ruido en frenos.",
      evidencia: [
        {
          id: "ev1",
          tipo: "foto",
          url: "/placeholder.svg",
          thumbnail: "/placeholder.svg",
          descripcion: "Estado general del vehículo - Frontal",
          fecha: new Date("2025-12-14T08:20:00"),
        },
        {
          id: "ev2",
          tipo: "foto",
          url: "/placeholder.svg",
          thumbnail: "/placeholder.svg",
          descripcion: "Estado general del vehículo - Lateral",
          fecha: new Date("2025-12-14T08:22:00"),
        },
      ],
    },
    {
      id: "fase-2",
      fase: "diagnostico",
      estado: "completed",
      fechaInicio: new Date("2025-12-14T09:00:00"),
      fechaFin: new Date("2025-12-14T11:30:00"),
      duracionMinutos: 150,
      tecnicoNombre: "Miguel Torres",
      observaciones: "Pastillas de freno delanteras con 70% de desgaste. Discos en buen estado. Se recomienda cambio preventivo.",
      evidencia: [
        {
          id: "ev3",
          tipo: "foto",
          url: "/placeholder.svg",
          thumbnail: "/placeholder.svg",
          descripcion: "Estado de pastillas de freno - Desgaste visible",
          fecha: new Date("2025-12-14T10:15:00"),
        },
      ],
    },
    {
      id: "fase-3",
      fase: "reparacion",
      estado: "in_progress",
      fechaInicio: new Date("2025-12-15T08:00:00"),
      tecnicoNombre: "Miguel Torres",
      duracionMinutos: 195, // 3h 15min en curso
    },
    {
      id: "fase-4",
      fase: "calidad",
      estado: "pending",
    },
    {
      id: "fase-5",
      fase: "entrega",
      estado: "pending",
    },
  ],
  trabajosAdicionales: [
    {
      id: "ta1",
      titulo: "Cambio de filtro de aire",
      descripcion: "Filtro de aire saturado detectado durante diagnóstico",
      completado: true,
      fechaAprobacion: new Date("2025-12-14T14:00:00"),
      costoTotal: 45.00,
    },
    {
      id: "ta2",
      titulo: "Alineación y balanceo",
      descripcion: "Recomendado después del cambio de pastillas",
      completado: false,
      fechaAprobacion: new Date("2025-12-14T14:30:00"),
      costoTotal: 35.00,
    },
  ],
  repuestosUtilizados: [
    {
      id: "r1",
      codigo: "TOY-BP-HLX22",
      descripcion: "Pastillas de freno delanteras Toyota Hilux OEM",
      cantidad: 1,
      unidad: "Juego",
      precioUnitario: 85.00,
    },
    {
      id: "r2",
      codigo: "TOY-FA-001",
      descripcion: "Filtro de aire motor Toyota Hilux 2.4L",
      cantidad: 1,
      unidad: "Unidad",
      precioUnitario: 28.00,
    },
    {
      id: "r3",
      codigo: "GEN-LF-5W30",
      descripcion: "Aceite de motor sintético 5W-30 (Litro)",
      cantidad: 6,
      unidad: "Litros",
      precioUnitario: 12.50,
    },
    {
      id: "r4",
      codigo: "TOY-OF-HLX",
      descripcion: "Filtro de aceite Toyota Hilux",
      cantidad: 1,
      unidad: "Unidad",
      precioUnitario: 18.00,
    },
  ],
  descripcionProblema: "Mantenimiento preventivo 45,000 km. Cliente reporta ruido metálico al frenar en velocidades bajas.",
  diagnosticoInicial: "Se requiere cambio de pastillas de freno y mantenimiento estándar según kilometraje.",
}

// ============================================
// MOCK DATA: Kanban Board for Admin View
// ============================================

export const mockKanbanBoard: KanbanBoard = {
  totalOrdenes: 12,
  columnas: {
    recepcion: [
      {
        id: "k1",
        ordenId: "ot-010",
        codigo: "OT-2025-REP-022",
        placa: "ABC-1234",
        marca: "Chevrolet",
        modelo: "Cruze",
        tecnicoId: "t2",
        tecnicoNombre: "Pedro Gómez",
        problemaBreve: "Check engine encendido, posible falla en sensores",
        faseActual: "recepcion",
        tiempoEnFaseMinutos: 25,
        alertaRetraso: false,
        prioridad: "normal",
      },
    ],
    diagnostico: [
      {
        id: "k2",
        ordenId: "ot-011",
        codigo: "OT-2025-MANT-015",
        placa: "XYZ-7890",
        marca: "Kia",
        modelo: "Sportage",
        tecnicoId: "t3",
        tecnicoNombre: "Luis Herrera",
        problemaBreve: "Mantenimiento 30,000 km + revisión de suspensión",
        faseActual: "diagnostico",
        tiempoEnFaseMinutos: 95,
        alertaRetraso: false,
        prioridad: "normal",
      },
      {
        id: "k3",
        ordenId: "ot-012",
        codigo: "OT-2025-GAR-003",
        placa: "DEF-4567",
        marca: "Hyundai",
        modelo: "Tucson",
        tecnicoId: "t1",
        tecnicoNombre: "Miguel Torres",
        problemaBreve: "Garantía: Falla en sistema de climatización",
        faseActual: "diagnostico",
        tiempoEnFaseMinutos: 210, // 3.5 horas - cerca del límite
        alertaRetraso: true,
        prioridad: "alta",
      },
    ],
    reparacion: [
      {
        id: "k4",
        ordenId: "ot-001",
        codigo: "OT-2025-MANT-014",
        placa: "PBX-4521",
        marca: "Toyota",
        modelo: "Hilux",
        tecnicoId: "t1",
        tecnicoNombre: "Miguel Torres",
        problemaBreve: "Mantenimiento 45,000 km + cambio de pastillas",
        faseActual: "reparacion",
        tiempoEnFaseMinutos: 195, // 3h 15min
        alertaRetraso: false,
        prioridad: "normal",
      },
      {
        id: "k5",
        ordenId: "ot-013",
        codigo: "OT-2025-REP-023",
        placa: "GHI-8901",
        marca: "Mazda",
        modelo: "CX-5",
        tecnicoId: "t2",
        tecnicoNombre: "Pedro Gómez",
        problemaBreve: "Cambio de embrague completo",
        faseActual: "reparacion",
        tiempoEnFaseMinutos: 320, // 5+ horas - ALERTA
        alertaRetraso: true,
        prioridad: "alta",
      },
      {
        id: "k6",
        ordenId: "ot-014",
        codigo: "OT-2025-MANT-016",
        placa: "JKL-2345",
        marca: "Nissan",
        modelo: "Frontier",
        tecnicoId: "t3",
        tecnicoNombre: "Luis Herrera",
        problemaBreve: "Mantenimiento mayor 60,000 km",
        faseActual: "reparacion",
        tiempoEnFaseMinutos: 145,
        alertaRetraso: false,
        prioridad: "normal",
      },
    ],
    calidad: [
      {
        id: "k7",
        ordenId: "ot-015",
        codigo: "OT-2025-REP-024",
        placa: "MNO-6789",
        marca: "Ford",
        modelo: "Ranger",
        tecnicoId: "t1",
        tecnicoNombre: "Miguel Torres",
        problemaBreve: "Reparación sistema de dirección",
        faseActual: "calidad",
        tiempoEnFaseMinutos: 45,
        alertaRetraso: false,
        prioridad: "normal",
      },
      {
        id: "k8",
        ordenId: "ot-016",
        codigo: "OT-2025-MANT-017",
        placa: "PQR-0123",
        marca: "Suzuki",
        modelo: "Vitara",
        tecnicoId: "t2",
        tecnicoNombre: "Pedro Gómez",
        problemaBreve: "Mantenimiento preventivo completo",
        faseActual: "calidad",
        tiempoEnFaseMinutos: 130, // Cerca del límite
        alertaRetraso: true,
        prioridad: "normal",
      },
    ],
    entrega: [
      {
        id: "k9",
        ordenId: "ot-017",
        codigo: "OT-2025-MANT-018",
        placa: "STU-4567",
        marca: "Toyota",
        modelo: "Corolla",
        tecnicoId: "t3",
        tecnicoNombre: "Luis Herrera",
        problemaBreve: "Cambio de aceite y filtros",
        faseActual: "entrega",
        tiempoEnFaseMinutos: 15,
        alertaRetraso: false,
        prioridad: "baja",
      },
      {
        id: "k10",
        ordenId: "ot-018",
        codigo: "OT-2025-REP-025",
        placa: "VWX-8901",
        marca: "Chevrolet",
        modelo: "D-Max",
        tecnicoId: "t1",
        tecnicoNombre: "Miguel Torres",
        problemaBreve: "Reparación de alternador",
        faseActual: "entrega",
        tiempoEnFaseMinutos: 30,
        alertaRetraso: false,
        prioridad: "normal",
      },
    ],
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h ${mins}min`
}

/**
 * Get relative delivery date string
 */
export function getRelativeDeliveryDate(date: Date): { text: string; isLate: boolean } {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffMs < 0) {
    return { text: "Atrasado", isLate: true }
  }

  if (diffHours < 24) {
    return {
      text: `Hoy a las ${date.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`,
      isLate: false
    }
  }

  if (diffDays < 2) {
    return {
      text: `Mañana a las ${date.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`,
      isLate: false
    }
  }

  return {
    text: date.toLocaleDateString("es-EC", { weekday: "short", day: "numeric", month: "short" }),
    isLate: false
  }
}

/**
 * Check if phase time exceeds threshold
 */
export function isPhaseDelayed(fase: WorkOrderPhase, minutos: number): boolean {
  const config = PHASE_CONFIG[fase]
  return minutos > config.maxHours * 60
}

/**
 * Get mock orders assigned to a specific technician
 */
export function getMockTechnicianOrders(technicianId: string): TechnicianOrder[] {
  // For demo, return the mock order if it matches
  if (technicianId === "t1") {
    return [mockTechnicianOrder]
  }
  return []
}

/**
 * Get kanban board data
 */
export function getMockKanbanBoard(): KanbanBoard {
  return mockKanbanBoard
}

