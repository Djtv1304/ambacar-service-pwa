/**
 * API Client para Push Notifications
 * Microservicio Django: /api/v1/notifications/push/
 */

const NOTIFICATIONS_API_BASE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || "http://localhost:8001"

// ============================================================================
// TIPOS
// ============================================================================

/** Objeto PushSubscription.toJSON() del navegador */
export interface PushSubscriptionJSON {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  expirationTime?: number | null
}

/** Request para suscribirse a push */
export interface PushSubscribeRequest {
  customer_id: string
  subscription: PushSubscriptionJSON
  user_agent?: string
}

/** Response de suscripción exitosa */
export interface PushSubscriptionResponse {
  id: string
  customer_id: string
  is_active: boolean
  last_used_at: string | null
  failure_count: number
  created_at: string
}

/** Request para desuscribirse */
export interface PushUnsubscribeRequest {
  endpoint: string
}

/** Response de estado de suscripción */
export interface PushStatusResponse {
  has_subscription: boolean
  subscription_count: number
}

/** Estados de permiso de notificación */
export type NotificationPermissionState = "default" | "granted" | "denied"

/** Soporte de Push en el navegador */
export interface PushSupport {
  isSupported: boolean
  reason?: "no-service-worker" | "no-push-manager" | "insecure-context" | "no-notification"
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Convertir VAPID key de base64 a Uint8Array (requerido por subscribe)
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Verificar soporte de Push en el navegador
 */
export function checkPushSupport(): PushSupport {
  if (typeof window === "undefined") {
    return { isSupported: false, reason: "no-service-worker" }
  }

  if (!window.isSecureContext) {
    return { isSupported: false, reason: "insecure-context" }
  }

  if (!("serviceWorker" in navigator)) {
    return { isSupported: false, reason: "no-service-worker" }
  }

  if (!("PushManager" in window)) {
    return { isSupported: false, reason: "no-push-manager" }
  }

  if (!("Notification" in window)) {
    return { isSupported: false, reason: "no-notification" }
  }

  return { isSupported: true }
}

/**
 * Obtener permiso actual de notificaciones
 */
export function getCurrentPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied"
  }
  return Notification.permission as NotificationPermissionState
}

/**
 * Solicitar permiso de notificaciones al usuario
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied"
  }
  const result = await Notification.requestPermission()
  return result as NotificationPermissionState
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Registrar suscripción push en el backend
 * POST /api/v1/notifications/push/subscribe/
 */
export async function subscribeToPush(
  request: PushSubscribeRequest
): Promise<PushSubscriptionResponse> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/push/subscribe/`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
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
 * Eliminar suscripción push del backend
 * DELETE /api/v1/notifications/push/subscribe/
 */
export async function unsubscribeFromPush(endpoint: string): Promise<void> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/push/subscribe/`

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint } as PushUnsubscribeRequest),
  })

  // 204 No Content es éxito, 404 significa que ya no existe (ok)
  if (!response.ok && response.status !== 404) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail || errorData.message || `Error ${response.status}`
    )
  }
}

/**
 * Verificar estado de suscripción push de un cliente
 * GET /api/v1/notifications/push/status/{customer_id}/
 */
export async function getPushStatus(
  customerId: string
): Promise<PushStatusResponse> {
  const url = `${NOTIFICATIONS_API_BASE_URL}/api/v1/notifications/push/status/${customerId}/`

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
