import { apiRequest } from "./client"

/**
 * Estructura de una tarjeta Kanban
 */
export interface KanbanCardAPI {
  id: string
  ordenId: string
  codigo: string
  placa: string
  marca: string
  modelo: string
  tecnicoId: string
  tecnicoNombre: string
  tecnicoAvatar: string | null
  problemaBreve: string
  faseActual: "recepcion" | "diagnostico" | "reparacion" | "calidad" | "entrega"
  tiempoEnFaseMinutos: number
  alertaRetraso: boolean
  prioridad: "alta" | "normal" | "baja"
}

/**
 * Respuesta del endpoint de Kanban
 */
export interface KanbanBoardAPI {
  totalOrdenes: number
  columnas: {
    recepcion: KanbanCardAPI[]
    diagnostico: KanbanCardAPI[]
    reparacion: KanbanCardAPI[]
    calidad: KanbanCardAPI[]
    entrega: KanbanCardAPI[]
  }
}

/**
 * Obtiene los datos del tablero Kanban del taller
 * @param token - JWT token para autenticación
 * @returns Tablero Kanban con todas las órdenes organizadas por fase
 */
export async function getKanbanBoard(token: string): Promise<KanbanBoardAPI> {
  return apiRequest<KanbanBoardAPI>("/api/taller/kanban/", {
    method: "GET",
    token,
  })
}

/**
 * Respuesta del endpoint de detalle de orden de taller
 * Los campos de fecha vienen como strings ISO desde la API
 */
export interface OrdenTallerDetalleAPI {
  id: string
  codigo: string
  estado: "abierta" | "en_proceso" | "pausada" | "cerrada"
  tipoOrden: "mantenimiento" | "reparacion" | "garantia"
  fechaCreacion: string  // ISO string
  fechaEstimadaEntrega: string  // ISO string
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
  fases: {
    id: string
    fase: "recepcion" | "diagnostico" | "reparacion" | "calidad" | "entrega"
    estado: "completed" | "in_progress" | "pending"
    fechaInicio?: string  // ISO string
    fechaFin?: string | null  // ISO string
    duracionMinutos?: number
    tecnicoId?: string
    tecnicoNombre?: string
    observaciones?: string | null
    evidencia?: any[]
  }[]
  trabajosAdicionales: any[]
  repuestosUtilizados: {
    id: string
    codigo: string
    descripcion: string
    cantidad: number
    unidad: string
    precioUnitario: string  // STRING desde API
  }[]
  descripcionProblema: string
  diagnosticoInicial?: string | null
}

/**
 * Obtiene el detalle completo de una orden de trabajo del taller
 * @param ordenId - ID de la orden de trabajo
 * @param token - JWT token para autenticación
 * @returns Detalle completo de la orden de trabajo
 */
export async function getOrdenTallerDetalle(
  ordenId: string,
  token: string
): Promise<OrdenTallerDetalleAPI> {
  return apiRequest<OrdenTallerDetalleAPI>(`/api/taller/${ordenId}/`, {
    method: "GET",
    token,
  })
}
