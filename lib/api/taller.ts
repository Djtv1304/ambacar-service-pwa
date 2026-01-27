import { apiRequest } from "./client"

/**
 * Estructura de una tarjeta de Cita en el Kanban
 */
export interface KanbanCitaCard {
  id: string
  citaId: string
  clienteNombre: string
  vehiculoPlaca: string
  vehiculoMarca: string
  vehiculoModelo: string
  hora: string
  fecha: string
  servicio: string
  subtipoServicio: string
  asesorAsignado: { id: string; nombre: string } | null
  observaciones?: string
}

/**
 * Respuesta del endpoint de citas confirmadas
 * GET /api/recepciones/citas-confirmadas/?sucursal=X
 */
export interface CitaConfirmadaAPI {
  id: string
  numero_referencia: string
  fecha: string
  hora: string
  cliente: {
    id: string
    nombre: string
    email: string
    cedula: string
    telefono: string
  }
  vehiculo: {
    id: string
    placa: string
    marca: string
    modelo: string
    color: string
    year: number
    kilometraje: number
  }
  tipoServicio: string
  subtipoServicio: string
  sucursal: string
  observaciones: string | null
  asesor_id: number | null
}

/**
 * Obtiene las citas confirmadas para una sucursal
 * @param sucursalId - ID de la sucursal
 * @param token - JWT token para autenticación
 * @returns Array de citas confirmadas
 */
export async function getCitasConfirmadas(
  sucursalId: number,
  token: string
): Promise<CitaConfirmadaAPI[]> {
  return apiRequest<CitaConfirmadaAPI[]>(`/api/recepciones/citas-confirmadas/?sucursal=${sucursalId}`, {
    method: "GET",
    token,
  })
}

/**
 * Asigna un asesor a una cita
 * PATCH /api/citas/{idCita}/asignar-operator/
 * @param citaId - ID de la cita
 * @param asesorId - ID del asesor (idEmpleado del ERP)
 * @param token - JWT token para autenticación
 * @returns true si la asignación fue exitosa
 */
export async function asignarAsesorCita(
  citaId: string,
  asesorId: number,
  token: string
): Promise<boolean> {
  await apiRequest(`/api/citas/${citaId}/asignar-operator/`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ asesor_id: asesorId }),
  })
  return true
}

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
    citas: KanbanCitaCard[]
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
  sucursal?: {
    id: number
    codigo: string
    nombre: string
    direccion: string
    telefono: string
    email: string
    ciudad: string
  } | null
  fases: {
    id: string
    etapaOrdenTrabajoId: number  // ID de la etapa para completar fase via API
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

/**
 * Interfaz para la respuesta de lista de órdenes de taller
 * Endpoint: GET /api/taller/
 */
export interface OrdenTallerListaAPI {
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
  } | null
  tecnicoAsignado: {
    id: string
    nombre: string
  } | null
  fases: any[]
  trabajosAdicionales: any[]
  repuestosUtilizados: any[]
  descripcionProblema: string
  diagnosticoInicial: string | null
}

/**
 * Obtiene la lista de órdenes de taller del usuario autenticado
 * El backend filtra las órdenes según el rol y permisos del usuario (basado en token)
 * @param token - JWT token para autenticación
 * @returns Array de órdenes de taller asignadas al usuario
 */
export async function getOrdenesTaller(token: string): Promise<OrdenTallerListaAPI[]> {
  return apiRequest<OrdenTallerListaAPI[]>("/api/taller/", {
    method: "GET",
    token,
  })
}

/**
 * Datos para completar una etapa de orden de trabajo
 */
export interface CompletarEtapaData {
  observaciones: string
  evidencia: File[]
  responsable_id: number
}

/**
 * Respuesta del endpoint de completar etapa
 */
export interface CompletarEtapaResponse {
  id: string
  fase: string
  estado: string
  fechaFin: string
  observaciones: string
  evidencia: any[]
}

/**
 * Completa una etapa de orden de trabajo
 * POST /api/etapas-orden-trabajo/{etapaId}/completar/
 * @param etapaId - ID de la etapa a completar
 * @param data - Datos de la completación (observaciones, evidencia, responsable_id)
 * @param token - JWT token para autenticación
 * @returns Etapa actualizada
 */
export async function completarEtapaOrdenTrabajo(
  etapaId: string,
  data: CompletarEtapaData,
  token: string
): Promise<CompletarEtapaResponse> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const formData = new FormData()
  formData.append("observaciones", data.observaciones)
  formData.append("responsable_id", data.responsable_id.toString())

  // Append multiple evidence files
  data.evidencia.forEach((file) => {
    formData.append("evidencia", file)
  })

  const response = await fetch(`${API_BASE_URL}/api/etapas-orden-trabajo/${etapaId}/completar/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail || `Error al completar etapa: ${response.status}`)
  }

  return response.json()
}
