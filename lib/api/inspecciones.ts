import { apiRequest } from "./client"
import type { PuntoInspeccionCatalogo, InspeccionListItem, InspeccionDetalle, ItemInspeccion } from "@/lib/types"

/**
 * Obtiene el catálogo completo de puntos de inspección
 * @param token - JWT token for authentication
 * @returns Array de puntos de inspección del catálogo
 */
export async function getCatalogoInspecciones(token: string): Promise<PuntoInspeccionCatalogo[]> {
  return apiRequest<PuntoInspeccionCatalogo[]>("/api/catalogo-inspecciones/", {
    method: "GET",
    token,
  })
}

/**
 * Obtiene la lista de inspecciones
 * @param token - JWT token for authentication
 * @returns Array de inspecciones
 */
export async function getInspecciones(token: string): Promise<InspeccionListItem[]> {
  return apiRequest<InspeccionListItem[]>("/api/inspecciones/", {
    method: "GET",
    token,
  })
}

/**
 * Obtiene el detalle de una inspección específica
 * @param id - ID de la inspección
 * @param token - JWT token for authentication
 * @returns Detalle completo de la inspección
 */
export async function getInspeccionDetalle(id: number, token: string): Promise<InspeccionDetalle> {
  return apiRequest<InspeccionDetalle>(`/api/inspecciones/${id}/`, {
    method: "GET",
    token,
  })
}

/**
 * Crea una nueva inspección
 * @param ordenTrabajo - ID de la orden de trabajo
 * @param observacionesGenerales - Observaciones generales opcionales
 * @param token - JWT token for authentication
 * @returns Inspección creada
 */
export async function createInspeccion(
  ordenTrabajo: number,
  observacionesGenerales: string | undefined,
  token: string
): Promise<InspeccionDetalle> {
  const body: any = {
    orden_trabajo: ordenTrabajo,
  }

  if (observacionesGenerales) {
    body.observaciones_generales = observacionesGenerales
  }

  return apiRequest<InspeccionDetalle>("/api/inspecciones/", {
    method: "POST",
    token,
    body,
  })
}

/**
 * Actualiza las observaciones generales de una inspección
 * @param inspeccionId - ID de la inspección
 * @param observacionesGenerales - Nuevas observaciones generales
 * @param token - JWT token for authentication
 * @returns Inspección actualizada
 */
export async function updateObservacionesGenerales(
  inspeccionId: number,
  observacionesGenerales: string,
  token: string
): Promise<InspeccionDetalle> {
  return apiRequest<InspeccionDetalle>(`/api/inspecciones/${inspeccionId}/`, {
    method: "PATCH",
    token,
    body: JSON.stringify({
      observaciones_generales: observacionesGenerales,
    }),
  })
}

/**
 * Sube una foto de inspección
 * @param itemInspeccionId - ID del item de inspección
 * @param imagen - Archivo de imagen
 * @param descripcion - Descripción de la foto
 * @param token - JWT token for authentication
 * @returns Foto subida con metadata
 */
export async function uploadFotoInspeccion(
  itemInspeccionId: number,
  imagen: File,
  descripcion: string,
  token: string
): Promise<any> {
  const formData = new FormData()
  formData.append("item_inspeccion", itemInspeccionId.toString())
  formData.append("imagen", imagen)
  formData.append("descripcion", descripcion)

  return apiRequest<any>("/api/fotos-inspeccion/", {
    method: "POST",
    token,
    body: formData,
  })
}

/**
 * Crea un item de inspección
 * @param data - Datos del item
 * @param token - JWT token for authentication
 * @returns Item de inspección creado
 */
export async function createItemInspeccion(
  data: {
    inspeccion: number
    item_catalogo: number
    estado: "VERDE" | "AMARILLO" | "ROJO" | "N/A"
    aplica: boolean
    observacion?: string
    mediciones?: Record<string, any>
  },
  token: string
): Promise<ItemInspeccion> {
  return apiRequest<ItemInspeccion>("/api/items-inspeccion/", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  })
}

/**
 * Actualiza un item de inspección existente (PATCH)
 * @param itemId - ID del item de inspección
 * @param data - Datos a actualizar (puede ser parcial)
 * @param token - JWT token for authentication
 * @returns Item de inspección actualizado
 */
export async function updateItemInspeccion(
  itemId: number,
  data: {
    estado?: "VERDE" | "AMARILLO" | "ROJO" | "N/A"
    aplica?: boolean
    observacion?: string
    mediciones?: Record<string, any>
  },
  token: string
): Promise<ItemInspeccion> {
  return apiRequest<ItemInspeccion>(`/api/items-inspeccion/${itemId}/`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  })
}

/**
 * Completa una inspección
 * @param inspeccionId - ID de la inspección
 * @param token - JWT token for authentication
 * @returns Resultado de la finalización
 */
export async function completarInspeccion(
  inspeccionId: number,
  token: string
): Promise<{
  success: boolean
  message: string
  inspeccion: InspeccionDetalle
  resumen: {
    verde: number
    amarillo: number
    rojo: number
    n_a: number
  }
}> {
  return apiRequest<any>(`/api/inspecciones/${inspeccionId}/completar/`, {
    method: "POST",
    token,
  })
}
