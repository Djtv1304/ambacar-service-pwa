import type { CreateTextNoteData, CreateVoiceNoteData, Anotacion } from "../types"
import { apiRequest } from "./client"

/**
 * Crea una anotación de texto para una fotografía
 */
export async function createTextNote(data: CreateTextNoteData, token: string): Promise<Anotacion> {
  return apiRequest<Anotacion>("/api/anotaciones-media/", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  })
}

/**
 * Crea una anotación de voz para una fotografía
 */
export async function createVoiceNote(data: CreateVoiceNoteData, token: string): Promise<Anotacion> {
  const formData = new FormData()
  formData.append("media_type", data.media_type)
  formData.append("media_id", data.media_id.toString())
  formData.append("tipo_anotacion", data.tipo_anotacion)
  formData.append("content_file", data.content_file)

  return apiRequest<Anotacion>("/api/anotaciones-media/", {
    method: "POST",
    body: formData,
    token,
  })
}
