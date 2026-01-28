import type { GaleriaOTResponse, User, MediaType } from "../types"
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

// ============================================================================
// ANOTACIONES TYPES & FUNCTIONS
// ============================================================================

/**
 * Tipos de anotación soportados por el backend
 */
export type TipoAnotacion =
  | "TEXT_NOTE"
  | "VOICE_NOTE"
  | "VISUAL_MARKER"
  | "EDITED_IMAGE"
  | "CANVAS_DRAWING"

/**
 * Estructura de línea dibujada con Konva
 */
export interface LineData {
  id: string
  tool: "pencil" | "eraser"
  points: number[]
  color: string
  strokeWidth: number
}

/**
 * Estructura de forma (flecha o círculo) dibujada con Konva
 */
export interface ShapeData {
  id: string
  type: "arrow" | "circle"
  x: number
  y: number
  points?: number[]
  radius?: number
  color: string
  strokeWidth: number
  rotation?: number
  scaleX?: number
  scaleY?: number
}

/**
 * Contenido JSON para anotaciones de tipo CANVAS_DRAWING
 */
export interface CanvasDrawingContent {
  lines: LineData[]
  shapes: ShapeData[]
}

/**
 * Payload para crear una anotación
 */
export interface CreateAnnotationPayload {
  media_type: MediaType
  media_id: number
  tipo_anotacion: TipoAnotacion
  content_text?: string
  content_json?: CanvasDrawingContent | Record<string, unknown>
}

/**
 * Respuesta del backend al crear una anotación
 */
export interface AnnotationResponse {
  id: number
  media_type: MediaType
  media_id: number
  tipo_anotacion: TipoAnotacion
  content_text?: string
  content_json?: Record<string, unknown>
  created_at: string
  usuario_id: number
}

/**
 * Crea una nueva anotación en una foto/media
 * @param payload - Datos de la anotación
 * @param token - Token de autenticación
 * @returns Anotación creada
 */
export async function createAnnotation(
  payload: CreateAnnotationPayload,
  token: string
): Promise<AnnotationResponse> {
  return apiRequest<AnnotationResponse>("/api/anotaciones-media/", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  })
}
