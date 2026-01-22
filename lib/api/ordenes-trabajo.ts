// API functions for Ordenes de Trabajo

import { apiRequest } from "./client"
import type {
  User,
  TipoOT,
  ClienteAPI,
  VehiculoAPI,
  CreateOrdenTrabajoData,
  OrdenTrabajoDetalle,
  EstadoOrdenTrabajo,
  CambioEstadoResponse,
  HallazgoOT,
  HallazgoOTPayload
} from "@/lib/types"

export interface OrdenTrabajoAPI {
  id: number
  numero_orden: string
  cliente_detalle: {
    id: number
    first_name: string
    last_name: string
  }
  vehiculo_detalle: {
    id: number
    placa: string
    marca: string
    modelo: string
  }
  tipo_detalle: {
    id: number
    codigo: string
    nombre: string
    descripcion: string
  }
  subtipo_detalle: {
    id: number
    codigo: string
    nombre: string
    descripcion: string
  } | null
  estado_detalle: {
    id: number
    codigo: string
    nombre: string
    color: string
    es_final: boolean
  }
  fecha_apertura: string
  fecha_promesa_entrega: string
  es_garantia: boolean
}

/**
 * Obtiene la lista de todas las órdenes de trabajo
 */
export async function getOrdenesTrabajo(token: string): Promise<OrdenTrabajoAPI[]> {
  return apiRequest<OrdenTrabajoAPI[]>("/api/ordenes-trabajo/", {
    method: "GET",
    token,
  })
}

/**
 * Obtiene el detalle de una orden de trabajo por ID
 */
export async function getOrdenTrabajoById(id: number, token: string): Promise<OrdenTrabajoAPI> {
  return apiRequest<OrdenTrabajoAPI>(`/api/ordenes-trabajo/${id}/`, {
    method: "GET",
    token,
  })
}

/**
 * Obtiene el detalle completo de una orden de trabajo por ID
 */
export async function getOrdenTrabajoDetalle(id: number, token: string): Promise<OrdenTrabajoDetalle> {
  return apiRequest<OrdenTrabajoDetalle>(`/api/ordenes-trabajo/${id}/`, {
    method: "GET",
    token,
  })
}


/**
 * Obtiene la lista de tipos de OT
 */
export async function getTiposOT(token: string): Promise<TipoOT[]> {
  return apiRequest<TipoOT[]>("/api/tipos-ot/", {
    method: "GET",
    token,
  })
}

/**
 * Obtiene la lista de clientes
 */
export async function getClientes(token: string): Promise<ClienteAPI[]> {
  return apiRequest<ClienteAPI[]>("/api/clientes/", {
    method: "GET",
    token,
  })
}

/**
 * Obtiene los vehículos de un cliente
 */
export async function getVehiculosByCliente(clienteId: number, token: string): Promise<VehiculoAPI[]> {
  return apiRequest<VehiculoAPI[]>(`/api/clientes/${clienteId}/vehiculos/`, {
    method: "GET",
    token,
  })
}

/**
 * Obtiene la lista de Operadores o Asesores de Servicio
 */
export async function getAsesores(token: string): Promise<User[]> {
  return apiRequest<User[]>("/api/usuarios/?role=operator", {
    method: "GET",
    token,
  })
}

/**
 * Crea una nueva orden de trabajo
 */
export async function createOrdenTrabajo(
  data: CreateOrdenTrabajoData,
  token: string
): Promise<OrdenTrabajoAPI> {
  return apiRequest<OrdenTrabajoAPI>("/api/ordenes-trabajo/", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  })
}

/**
 * Obtiene los datos de prueba para formularios
 */
export async function getTestData(token: string) {
  return apiRequest<any>("/api/test-data/", {
    method: "GET",
    token,
  })
}

/**
 * Obtiene la lista de estados disponibles para Órdenes de Trabajo
 * GET /api/estados-orden-trabajo/
 */
export async function getEstadosOrdenTrabajo(
  token: string
): Promise<EstadoOrdenTrabajo[]> {
  return apiRequest<EstadoOrdenTrabajo[]>("/api/estados-orden-trabajo/", {
    method: "GET",
    token,
  })
}

/**
 * Cambia el estado de una Orden de Trabajo
 * POST /api/ordenes-trabajo/{id}/cambiar-estado/
 */
export async function cambiarEstadoOrdenTrabajo(
  ordenId: number,
  estadoId: number,
  token: string
): Promise<CambioEstadoResponse> {
  return apiRequest<CambioEstadoResponse>(
    `/api/ordenes-trabajo/${ordenId}/cambiar-estado/`,
    {
      method: "POST",
      token,
      body: JSON.stringify({ estado_id: estadoId }),
    }
  )
}

/**
 * Registra un hallazgo (novedad) para una Orden de Trabajo (sin fotos)
 * POST /api/novedades-orden-trabajo/
 */
export async function registrarHallazgo(
  payload: HallazgoOTPayload,
  token: string
): Promise<HallazgoOT> {
  return apiRequest<HallazgoOT>("/api/novedades-orden-trabajo/", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  })
}

/**
 * Registra un hallazgo (novedad) para una Orden de Trabajo con fotos
 * POST /api/novedades-orden-trabajo/
 * @param payload - Datos del hallazgo
 * @param fotos - Array de archivos de fotos (máximo 6)
 * @param token - Token de autenticación
 */
export async function registrarHallazgoConFotos(
  payload: HallazgoOTPayload,
  fotos: File[],
  token: string
): Promise<HallazgoOT> {
  const formData = new FormData()

  // Agregar campos del hallazgo
  formData.append("orden_trabajo", payload.orden_trabajo.toString())
  formData.append("tipo_novedad", payload.tipo_novedad)
  formData.append("descripcion", payload.descripcion)

  if (payload.justificacion_tecnica) {
    formData.append("justificacion_tecnica", payload.justificacion_tecnica)
  }

  formData.append("severidad", payload.severidad)

  if (payload.costo_mano_obra !== undefined) {
    formData.append("costo_mano_obra", payload.costo_mano_obra.toString())
  }

  if (payload.costo_repuestos !== undefined) {
    formData.append("costo_repuestos", payload.costo_repuestos.toString())
  }

  formData.append("requiere_autorizacion", payload.requiere_autorizacion.toString())
  formData.append("usuario_reporte", payload.usuario_reporte.toString())

  // Agregar fotos
  fotos.forEach((foto) => {
    formData.append("fotos", foto)
  })

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const response = await fetch(`${baseUrl}/api/novedades-orden-trabajo/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

