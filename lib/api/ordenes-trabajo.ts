// API functions for Ordenes de Trabajo

import { apiRequest } from "./client"
import type { User, TipoOT, ClienteAPI, VehiculoAPI, CreateOrdenTrabajoData } from "@/lib/types"

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
 * Obtiene la lista de asesores
 */
export async function getAsesores(token: string): Promise<User[]> {
  return apiRequest<User[]>("/api/usuarios/?role=asesor", {
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

