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
