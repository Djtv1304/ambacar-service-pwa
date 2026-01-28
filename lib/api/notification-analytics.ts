/**
 * Notification Analytics API Client
 * Connects to the notification microservice analytics endpoints
 */

const NOTIFICATIONS_API_BASE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || "http://localhost:8001"

// ============================================
// Types
// ============================================

export type NotificationChannel = "email" | "whatsapp" | "push"

export type NotificationStatus =
  | "pending"
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "bounced"
  | "failed"

export type EventType =
  | "appointment_scheduled"
  | "vehicle_received"
  | "repair_started"
  | "quality_check"
  | "vehicle_ready"
  | "maintenance_reminder"
  | "maintenance_overdue"
  | "custom"

export interface DailyBreakdown {
  date: string // YYYY-MM-DD
  total: number
  sent: number
  delivered: number
  failed: number
}

export interface AnalyticsSummary {
  period_start: string
  period_end: string
  total_sent: number
  total_delivered: number
  total_failed: number
  total_pending: number
  delivery_rate: number
  avg_delivery_time_seconds: number | null
  by_channel: Partial<Record<NotificationChannel, number>>
  by_status: Partial<Record<NotificationStatus, number>>
  by_event_type: Partial<Record<EventType, number>>
  daily_breakdown: DailyBreakdown[]
}

export interface NotificationLog {
  id: string
  event_type: EventType
  channel: NotificationChannel
  recipient_id: string
  status: NotificationStatus
  sent_at: string | null
  created_at: string
  template_name: string | null
  error_reason: string | null
  inferred_status: string
}

export interface ChannelHealth {
  total: number
  success: number
  failed: number
  success_rate: number
  is_healthy: boolean
}

export type HealthResponse = Record<NotificationChannel, ChannelHealth>

export interface SummaryParams {
  days?: number // default: 30
}

export interface RecentParams {
  limit?: number // default: 10, max: 100
  channel?: NotificationChannel
  status?: NotificationStatus
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch analytics summary for a given period
 */
export async function getAnalyticsSummary(
  days: number = 30
): Promise<AnalyticsSummary> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/analytics/summary/?days=${days}`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(
      errorData?.detail || `Error fetching analytics summary: ${response.status}`
    )
  }

  return response.json()
}

/**
 * Fetch recent notification logs with optional filters
 */
export async function getRecentLogs(
  params: RecentParams = {}
): Promise<NotificationLog[]> {
  const searchParams = new URLSearchParams()

  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.channel) searchParams.set("channel", params.channel)
  if (params.status) searchParams.set("status", params.status)

  const queryString = searchParams.toString()
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/analytics/recent/${
    queryString ? `?${queryString}` : ""
  }`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(
      errorData?.detail || `Error fetching recent logs: ${response.status}`
    )
  }

  return response.json()
}

/**
 * Fetch channel health status (last 24h)
 */
export async function getChannelHealth(): Promise<HealthResponse> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/analytics/health/`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(
      errorData?.detail || `Error fetching channel health: ${response.status}`
    )
  }

  return response.json()
}

// ============================================
// Utility Functions
// ============================================

export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
  })
}

export function formatNumber(num: number): string {
  return num.toLocaleString("es-EC")
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDeliveryTime(seconds: number | null): string {
  if (seconds === null) return "N/A"
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = seconds / 60
  return `${minutes.toFixed(1)}m`
}

export const eventTypeLabels: Record<EventType, string> = {
  appointment_scheduled: "Cita Agendada",
  vehicle_received: "Vehículo Recibido",
  repair_started: "Reparación Iniciada",
  quality_check: "Control Calidad",
  vehicle_ready: "Vehículo Listo",
  maintenance_reminder: "Recordatorio",
  maintenance_overdue: "Mant. Vencido",
  custom: "Personalizado",
}

export const statusLabels: Record<NotificationStatus, string> = {
  pending: "Pendiente",
  queued: "En Cola",
  sent: "Enviado",
  delivered: "Entregado",
  read: "Leído",
  bounced: "Rebotado",
  failed: "Fallido",
}

export const channelLabels: Record<NotificationChannel, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  push: "Push",
}
