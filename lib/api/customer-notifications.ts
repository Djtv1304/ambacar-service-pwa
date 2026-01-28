/**
 * API Client para Centro de Notificaciones del Cliente
 * Microservicio Django: /api/v1/notifications/customers/
 */

const NOTIFICATIONS_API_BASE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || "http://localhost:8001"

// ============================================================================
// TIPOS
// ============================================================================

export type NotificationChannel = "email" | "push" | "whatsapp"
export type ReminderStatus = "pending" | "notified" | "completed" | "overdue"
export type ReminderType = "kilometers" | "date" | "both"

export interface ChannelPreference {
  id?: string
  channel: NotificationChannel
  channel_display?: string
  enabled: boolean
  priority: number
}

export interface CustomerNotificationsAPI {
  id: string
  customer_id: string
  first_name: string
  last_name: string
  full_name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  channel_preferences: ChannelPreference[]
  created_at: string
  updated_at: string
}

export interface VehicleNotificationsAPI {
  id: string
  customer_id: string
  brand: string
  model: string
  year: number
  plate: string
  display_name: string
  current_kilometers: number
  last_service_date: string | null
  next_service_kilometers: number | null
  remaining_km: number | null
  image_url: string | null
  created_at?: string
  updated_at?: string
}

export interface MaintenanceReminderAPI {
  id: string
  vehicle: string
  vehicle_plate: string
  vehicle_display: string
  customer_id: string
  type: ReminderType
  type_display: string
  description: string
  target_kilometers: number | null
  target_date: string | null
  notify_via: NotificationChannel[]
  status: ReminderStatus
  status_display: string
  notify_before_days: number | null
  notify_before_km: number | null
  last_notified_at: string | null
  created_at: string
  updated_at: string
}

export interface UpdateCustomerRequest {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  whatsapp?: string
}

export interface UpdatePreferencesRequest {
  channels: Array<{
    channel: NotificationChannel
    enabled: boolean
    priority: number
  }>
}

export interface CreateReminderRequest {
  vehicle: string // UUID
  customer_id: string
  type: ReminderType
  description: string
  target_kilometers?: number | null
  target_date?: string | null // YYYY-MM-DD
  notify_via: NotificationChannel[]
  notify_before_days?: number | null
  notify_before_km?: number | null
}

export interface UpdateReminderRequest {
  vehicle?: string
  type?: ReminderType
  description?: string
  target_kilometers?: number | null
  target_date?: string | null
  notify_via?: NotificationChannel[]
  notify_before_days?: number | null
  notify_before_km?: number | null
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Formatear kilómetros con separador de miles
 */
export function formatKilometers(km: number): string {
  return km.toLocaleString("es-EC")
}

/**
 * Obtener iniciales para avatar
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
}

/**
 * Extraer año de fecha ISO
 */
export function getYearFromDate(isoDate: string): number {
  return new Date(isoDate).getFullYear()
}

/**
 * Calcular progreso de kilometraje para barra
 */
export function calculateKmProgress(
  current: number,
  target: number | null
): number {
  if (!target || target === 0) return 0
  return Math.min(100, (current / target) * 100)
}

/**
 * Determinar color de barra según km restantes
 */
export function getKmProgressColor(
  remaining: number | null,
  target: number | null
): "green" | "yellow" | "red" {
  if (!remaining || !target) return "green"
  const percentRemaining = (remaining / target) * 100
  if (percentRemaining > 20) return "green"
  if (percentRemaining > 10) return "yellow"
  return "red"
}

/**
 * Configuración de canales con iconos y descripciones
 */
export const channelConfig: Record<
  NotificationChannel,
  { icon: string; description: string; label: string }
> = {
  whatsapp: {
    icon: "whatsapp",
    description: "Mensajes directos a tu WhatsApp",
    label: "WhatsApp",
  },
  push: {
    icon: "bell",
    description: "Alertas en tu dispositivo",
    label: "Notificaciones Push",
  },
  email: {
    icon: "mail",
    description: "Emails a tu bandeja de entrada",
    label: "Correo Electrónico",
  },
}

/**
 * Preferencias por defecto cuando el cliente no tiene configuradas
 */
export const defaultChannelPreferences: ChannelPreference[] = [
  { channel: "whatsapp", enabled: false, priority: 1 },
  { channel: "push", enabled: false, priority: 2 },
  { channel: "email", enabled: false, priority: 3 },
]

/**
 * Formatear fecha de API (YYYY-MM-DD) a display (DD/MM/YYYY)
 */
export function formatDateDisplay(isoDate: string | null): string {
  if (!isoDate) return ""
  const [year, month, day] = isoDate.split("-")
  return `${day}/${month}/${year}`
}

/**
 * Formatear fecha de Date a API (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString().split("T")[0]
}

/**
 * Construir label para dropdown de vehículos
 */
export function buildVehicleLabel(vehicle: VehicleNotificationsAPI): string {
  return `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`
}

/**
 * Obtener color de badge según status
 */
export function getStatusColor(
  status: ReminderStatus
): "blue" | "amber" | "green" | "red" {
  const colors: Record<ReminderStatus, "blue" | "amber" | "green" | "red"> = {
    pending: "blue",
    notified: "amber",
    completed: "green",
    overdue: "red",
  }
  return colors[status]
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Obtener información del cliente
 * GET /api/v1/notifications/customers/{customer_id}/
 */
export async function getCustomer(
  customerId: string
): Promise<CustomerNotificationsAPI> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/customers/${customerId}/`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail || errorData.message || `Error ${response.status}`
    )
  }

  return response.json()
}

/**
 * Obtener vehículos del cliente
 * GET /api/v1/notifications/customers/{customer_id}/vehicles/
 */
export async function getCustomerVehicles(
  customerId: string
): Promise<VehicleNotificationsAPI[]> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/customers/${customerId}/vehicles/`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail || errorData.message || `Error ${response.status}`
    )
  }

  return response.json()
}

/**
 * Obtener recordatorios del cliente
 * GET /api/v1/notifications/customers/{customer_id}/reminders/
 * GET /api/v1/notifications/customers/{customer_id}/reminders/?status=overdue
 */
export async function getCustomerReminders(
  customerId: string,
  status?: ReminderStatus
): Promise<MaintenanceReminderAPI[]> {
  let url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/customers/${customerId}/reminders/`

  if (status) {
    url += `?status=${status}`
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail || errorData.message || `Error ${response.status}`
    )
  }

  return response.json()
}

/**
 * Actualizar información del cliente
 * PATCH /api/v1/notifications/customers/{customer_id}/
 */
export async function updateCustomer(
  customerId: string,
  data: UpdateCustomerRequest
): Promise<CustomerNotificationsAPI> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/customers/${customerId}/`

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail || errorData.message || `Error ${response.status}`
    )
  }

  return response.json()
}

/**
 * Obtener preferencias de notificación del cliente
 * GET /api/v1/notifications/customers/{customer_id}/preferences/
 */
export async function getCustomerPreferences(
  customerId: string
): Promise<ChannelPreference[]> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/customers/${customerId}/preferences/`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail || errorData.message || `Error ${response.status}`
    )
  }

  const data = await response.json()

  // Si retorna array vacío, devolver preferencias por defecto
  if (Array.isArray(data) && data.length === 0) {
    return defaultChannelPreferences
  }

  return data
}

/**
 * Actualizar preferencias de notificación del cliente
 * POST /api/v1/notifications/customers/{customer_id}/update_preferences/
 */
export async function updateCustomerPreferences(
  customerId: string,
  channels: Array<{
    channel: NotificationChannel
    enabled: boolean
    priority: number
  }>
): Promise<ChannelPreference[]> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/customers/${customerId}/update_preferences/`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channels }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail || errorData.message || `Error ${response.status}`
    )
  }

  return response.json()
}

// ============================================================================
// REMINDER API FUNCTIONS
// ============================================================================

/**
 * Crear un recordatorio
 * POST /api/v1/notifications/reminders/
 */
export async function createReminder(
  data: CreateReminderRequest
): Promise<MaintenanceReminderAPI> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/reminders/`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail ||
        errorData.message ||
        JSON.stringify(errorData) ||
        `Error ${response.status}`
    )
  }

  return response.json()
}

/**
 * Actualizar un recordatorio
 * PATCH /api/v1/notifications/reminders/{reminder_id}/
 */
export async function updateReminder(
  reminderId: string,
  data: UpdateReminderRequest
): Promise<MaintenanceReminderAPI> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/reminders/${reminderId}/`

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail ||
        errorData.message ||
        JSON.stringify(errorData) ||
        `Error ${response.status}`
    )
  }

  return response.json()
}

/**
 * Eliminar un recordatorio
 * DELETE /api/v1/notifications/reminders/{reminder_id}/
 */
export async function deleteReminder(reminderId: string): Promise<void> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/reminders/${reminderId}/`

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })

  // 204 No Content es éxito
  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail || errorData.message || `Error ${response.status}`
    )
  }
}

/**
 * Marcar recordatorio como completado
 * POST /api/v1/notifications/reminders/{reminder_id}/complete/
 */
export async function completeReminder(
  reminderId: string
): Promise<MaintenanceReminderAPI> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/reminders/${reminderId}/complete/`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail || errorData.message || `Error ${response.status}`
    )
  }

  return response.json()
}
