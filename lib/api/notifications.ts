// Notifications API Module
// Módulo para integración con el microservicio de notificaciones

import { ApiError } from "./client"

const NOTIFICATIONS_API_BASE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || "http://localhost:8001"

// Event Types - Para este caso usaremos solo 'custom'
export type NotificationEventType = "custom"

export type NotificationTarget = "clients" | "staff"

// Payload para dispatch de notificación
export interface NotificationDispatchPayload {
  event_type: NotificationEventType
  service_type_id?: string | null // Null para eventos custom
  phase_id?: string | null // Null para eventos custom
  customer_id: string // ID del usuario (number convertido a string)
  target: NotificationTarget
  context: Record<string, string> // Variables para templates (ej: {{Nombre}}, {{Placa}})
}

// Response del endpoint de dispatch (solo para tipado, no requiere manejo especial)
export interface NotificationDispatchResponse {
  success: boolean
  correlation_id: string
  notifications_queued: number
  errors: any[]
}

/**
 * Dispara un evento de notificación al microservicio de notificaciones
 *
 * @param payload - Datos del evento de notificación
 * @param token - JWT token de autenticación (opcional)
 * @returns Response del servidor de notificaciones
 *
 * @throws {ApiError} Si la request falla
 */
export async function dispatchNotificationEvent(
  payload: NotificationDispatchPayload,
  token?: string,
): Promise<NotificationDispatchResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/events/dispatch/`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        data.detail ?? data.message ?? data.error ?? `HTTP ${response.status}`

      throw new ApiError(errorMessage, response.status, data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(error instanceof Error ? error.message : "Network error", 0)
  }
}

/**
 * Construye el contexto para notificación de cita agendada
 * Para notificaciones custom, incluye subject y body que serán renderizados con las variables del context
 */
export function buildAppointmentContext(params: {
  customerName: string
  placa: string
  vehiculo: string
  taller: string
  fecha: string
  hora: string
}): Record<string, string> {
  return {
    subject: "Cita Confirmada - {{nombre}}",
    body: "Hola {{nombre}}, tu cita para el vehículo {{Placa}} {{Vehiculo}} en {{Taller}} ha sido confirmada para el {{Fecha}} a las {{Hora}}.",
    nombre: params.customerName,
    Placa: params.placa,
    Vehiculo: params.vehiculo,
    Taller: params.taller,
    Fecha: params.fecha,
    Hora: params.hora,
  }
}

/**
 * Construye el contexto para notificación de login
 * Para notificaciones custom, incluye subject y body que serán renderizados con las variables del context
 */
export function buildLoginContext(params: {
  customerName: string
  fecha: string
  hora: string
}): Record<string, string> {
  return {
    subject: "Inicio de Sesión Detectado - {{nombre}}",
    body: "Hola {{nombre}}, se ha detectado un inicio de sesión en tu cuenta de Ambacar el {{Fecha}} a las {{Hora}}. Si no reconoces esta actividad, por favor contacta inmediatamente con nuestro equipo de soporte para proteger tu cuenta.",
    nombre: params.customerName,
    Fecha: params.fecha,
    Hora: params.hora,
  }
}

/**
 * Construye el contexto para notificación de registro
 * Para notificaciones custom, incluye subject y body que serán renderizados con las variables del context
 */
export function buildRegistrationContext(params: { customerName: string }): Record<string, string> {
  return {
    subject: "Bienvenido a Ambacar - {{nombre}}",
    body: "Hola {{nombre}}, gracias por registrarte en el sistema Ambacar. Estamos encantados de tenerte con nosotros. Ya puedes acceder a todos nuestros servicios.",
    nombre: params.customerName,
  }
}

// ============================================================================
// TEMPLATES API - Consulta de plantillas de mensajes
// ============================================================================

export type NotificationChannel = "push" | "email" | "whatsapp"

/**
 * Plantilla de notificación desde la API
 */
export interface NotificationTemplateAPI {
  id: string
  name: string
  subject: string | null
  body: string
  channel: NotificationChannel
  target: NotificationTarget
  is_default: boolean
  is_active: boolean
  taller_id: string | null
  service_type_id: string | null
  service_type_name: string | null
  phase_id: string | null
  phase_name: string | null
  subtype_id: string | null
  subtype_name: string | null
  variables: string[]
  preview: string
  created_at: string
  updated_at: string
}

/**
 * Respuesta paginada de plantillas desde Django
 */
export interface TemplatesAPIResponse {
  count: number
  next: string | null
  previous: string | null
  results: NotificationTemplateAPI[]
}

/**
 * Parámetros para fetch de plantillas
 */
export interface FetchTemplatesParams {
  target: NotificationTarget
  page?: number
}

/**
 * Obtiene las plantillas de notificación desde el microservicio
 *
 * @param params - Parámetros de búsqueda (target, page)
 * @param token - JWT token de autenticación (opcional - endpoint actualmente público)
 * @returns Respuesta paginada con plantillas
 *
 * @throws {ApiError} Si la request falla
 */
export async function fetchNotificationTemplates(
  params: FetchTemplatesParams,
  token?: string,
): Promise<TemplatesAPIResponse> {
  const { target, page = 1 } = params

  const url = new URL(`${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/templates/`)
  url.searchParams.set("target", target)
  url.searchParams.set("page", page.toString())

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  // Preparado para cuando la API requiera autenticación
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        data.detail ?? data.message ?? data.error ?? `HTTP ${response.status}`

      throw new ApiError(errorMessage, response.status, data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(error instanceof Error ? error.message : "Network error", 0)
  }
}

/**
 * Obtiene una plantilla de notificación específica por su ID
 *
 * @param templateId - ID de la plantilla
 * @param token - JWT token de autenticación (opcional - endpoint actualmente público)
 * @returns Plantilla con todos sus detalles
 *
 * @throws {ApiError} Si la request falla
 */
export async function fetchNotificationTemplateById(
  templateId: string,
  token?: string,
): Promise<NotificationTemplateAPI> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/templates/${templateId}/`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        data.detail ?? data.message ?? data.error ?? `HTTP ${response.status}`

      throw new ApiError(errorMessage, response.status, data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(error instanceof Error ? error.message : "Network error", 0)
  }
}

// ============================================================================
// TEMPLATES MUTATION API - Crear y actualizar plantillas
// ============================================================================

/**
 * Payload para crear/actualizar plantilla completa (PUT/POST)
 * Todos los campos obligatorios excepto los que son nullable
 */
export interface UpdateNotificationTemplatePayload {
  name: string
  subject: string | null
  body: string
  channel: NotificationChannel
  target: NotificationTarget
  is_default: boolean
  is_active: boolean
  taller_id: string | null
  service_type: string // UUID
  phase: string // UUID
  subtype: string | null // UUID
}

/**
 * Payload para actualización parcial (PATCH)
 * Todos los campos opcionales
 */
export interface PatchNotificationTemplatePayload {
  name?: string
  subject?: string | null
  body?: string
  channel?: NotificationChannel
  target?: NotificationTarget
  is_default?: boolean
  is_active?: boolean
  taller_id?: string | null
  service_type?: string
  phase?: string
  subtype?: string | null
}

/**
 * Crea una nueva plantilla de notificación
 *
 * @param payload - Datos de la plantilla a crear
 * @param token - JWT token de autenticación
 * @returns Plantilla creada con ID asignado
 *
 * @throws {ApiError} Si la request falla
 */
export async function createNotificationTemplate(
  payload: UpdateNotificationTemplatePayload,
  token: string
): Promise<NotificationTemplateAPI> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/templates/`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        data.detail ?? data.message ?? data.error ?? `HTTP ${response.status}`

      throw new ApiError(errorMessage, response.status, data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(error instanceof Error ? error.message : "Network error", 0)
  }
}

/**
 * Actualiza una plantilla completa (PUT - requiere todos los campos)
 *
 * @param templateId - ID de la plantilla a actualizar
 * @param payload - Datos completos de la plantilla
 * @param token - JWT token de autenticación
 * @returns Plantilla actualizada
 *
 * @throws {ApiError} Si la request falla
 */
export async function updateNotificationTemplate(
  templateId: string,
  payload: UpdateNotificationTemplatePayload,
  token: string
): Promise<NotificationTemplateAPI> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/templates/${templateId}/`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        data.detail ?? data.message ?? data.error ?? `HTTP ${response.status}`

      throw new ApiError(errorMessage, response.status, data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(error instanceof Error ? error.message : "Network error", 0)
  }
}

/**
 * Actualiza parcialmente una plantilla (PATCH - solo campos modificados)
 *
 * @param templateId - ID de la plantilla a actualizar
 * @param payload - Campos a modificar (solo los que cambiaron)
 * @param token - JWT token de autenticación
 * @returns Plantilla actualizada
 *
 * @throws {ApiError} Si la request falla
 */
export async function patchNotificationTemplate(
  templateId: string,
  payload: PatchNotificationTemplatePayload,
  token: string
): Promise<NotificationTemplateAPI> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/templates/${templateId}/`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        data.detail ?? data.message ?? data.error ?? `HTTP ${response.status}`

      throw new ApiError(errorMessage, response.status, data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(error instanceof Error ? error.message : "Network error", 0)
  }
}

// ============================================================================
// METADATA API - Service Types, Phases, etc.
// ============================================================================

/**
 * Subtipo de servicio anidado dentro de ServiceType
 */
export interface ServiceSubtypeAPI {
  id: string // UUID
  slug: string
  name: string
  icon: string // NO USAR - Decidir iconos en frontend
  parent: string // UUID del service_type padre
  is_active: boolean
  description: string | null
}

/**
 * Tipo de servicio desde API (con subtypes anidados)
 */
export interface ServiceTypeAPI {
  id: string // UUID
  slug: string
  name: string
  icon: string // NO USAR - Decidir iconos en frontend
  is_active: boolean
  description: string | null
  subtypes: ServiceSubtypeAPI[] // Array de subtypes (puede estar vacío)
}

/**
 * Response paginada de service types
 */
export interface ServiceTypesAPIResponse {
  count: number
  next: string | null
  previous: string | null
  results: ServiceTypeAPI[]
}

/**
 * Fase del servicio
 */
export interface PhaseAPI {
  id: string // UUID
  name: string
  slug: string
  order: number
}

/**
 * Obtiene los tipos de servicio con sus subtypes anidados
 *
 * @param token - JWT token de autenticación
 * @returns Lista de tipos de servicio
 *
 * @throws {ApiError} Si la request falla
 */
export async function getServiceTypes(token: string): Promise<ServiceTypeAPI[]> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/service-types/`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    const data: ServiceTypesAPIResponse = await response.json()

    if (!response.ok) {
      const errorMessage =
        data.next ?? data.previous ?? `HTTP ${response.status}`

      throw new ApiError(errorMessage as string, response.status, data)
    }

    return data.results
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(error instanceof Error ? error.message : "Network error", 0)
  }
}

/**
 * Obtiene las fases del servicio
 *
 * @param token - JWT token de autenticación
 * @returns Lista de fases ordenadas
 *
 * @throws {ApiError} Si la request falla
 */
export async function getPhases(token: string): Promise<PhaseAPI[]> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/phases/`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        data.detail ?? data.message ?? data.error ?? `HTTP ${response.status}`

      throw new ApiError(errorMessage, response.status, data)
    }

    // El endpoint puede retornar array directo o estar paginado
    // Si tiene estructura de paginación, extraer results
    if (Array.isArray(data)) {
      return data
    } else if (data.results && Array.isArray(data.results)) {
      return data.results
    }

    // Fallback: retornar array vacío si la estructura no es la esperada
    console.warn("getPhases returned unexpected format:", data)
    return []
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(error instanceof Error ? error.message : "Network error", 0)
  }
}
