import { apiRequest } from "./client"

/**
 * Estructura de una Sucursal
 */
export interface Sucursal {
  id: number
  codigo: string
  nombre: string
  direccion: string
  telefono: string
  email: string
  ciudad: string
  ruc: string
  hora_apertura: string  // "09:30:00"
  hora_cierre: string    // "16:00:00"
  es_principal: boolean
  estado: "A" | "I"
  created_at: string
  updated_at: string
}

/**
 * Datos para actualizar una sucursal (campos editables)
 */
export interface UpdateSucursalData {
  nombre?: string
  email?: string
  direccion?: string
  ciudad?: string
  ruc?: string
  hora_apertura?: string
  hora_cierre?: string
  telefono?: string
}

/**
 * Obtiene la lista de sucursales
 * GET /api/sucursales/
 */
export async function getSucursales(token: string): Promise<Sucursal[]> {
  return apiRequest<Sucursal[]>("/api/sucursales/", {
    method: "GET",
    token,
  })
}

/**
 * Obtiene una sucursal por ID
 * GET /api/sucursales/{id}/
 */
export async function getSucursalById(id: number, token: string): Promise<Sucursal> {
  return apiRequest<Sucursal>(`/api/sucursales/${id}/`, {
    method: "GET",
    token,
  })
}

/**
 * Actualiza una sucursal
 * PATCH /api/sucursales/{id}/
 */
export async function updateSucursal(
  id: number,
  data: UpdateSucursalData,
  token: string
): Promise<Sucursal> {
  return apiRequest<Sucursal>(`/api/sucursales/${id}/`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  })
}
