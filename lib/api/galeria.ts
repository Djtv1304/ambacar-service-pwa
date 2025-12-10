import type { GaleriaOTResponse, User } from "../types"
import { apiRequest } from "./client"

/**
 * Obtiene todas las fotos de una orden de trabajo específica
 * agrupadas por fase del proceso
 */
export async function getGaleriaByOT(otId: number, token: string): Promise<GaleriaOTResponse> {
  return apiRequest<GaleriaOTResponse>(`/api/galeria/orden-trabajo/${otId}/`, {
    method: "GET",
    token,
  })
}

/**
 * Obtiene información de un usuario por su ID
 */
export async function getUserById(userId: number, token: string): Promise<User> {
  return apiRequest<User>(`/api/usuarios/${userId}/`, {
    method: "GET",
    token,
  })
}
