// API functions for Ordenes de Trabajo

import { apiRequest } from "./client"

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
    modelo_tecnico_detalle: {
      id: number
      marca: string
      modelo: string
    }
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

