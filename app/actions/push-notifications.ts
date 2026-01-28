"use server"

import webpush from "web-push"

// Configurar VAPID
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!
const VAPID_CONTACT = `mailto:${process.env.VAPID_CONTACT_EMAIL || "admin@ambacar.com"}`

// Inicializar web-push con las credenciales VAPID
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

// Tipo para la suscripción serializada
interface SerializedSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// Tipo para el payload de notificación
interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  tag?: string
  requireInteraction?: boolean
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  data?: Record<string, unknown>
}

/**
 * Guarda una suscripción push en el servidor
 * NOTA: En producción, deberías guardar esto en una base de datos
 */
export async function saveSubscription(
  subscription: SerializedSubscription,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implementar guardado en base de datos
    // Por ahora solo logueamos
    console.log("[Push] Nueva suscripción recibida:", {
      endpoint: subscription.endpoint.substring(0, 50) + "...",
      userId,
    })

    // Aquí deberías guardar en tu base de datos o enviar al microservicio de notificaciones
    // Ejemplo:
    // await db.pushSubscriptions.create({
    //   data: {
    //     endpoint: subscription.endpoint,
    //     p256dh: subscription.keys.p256dh,
    //     auth: subscription.keys.auth,
    //     userId,
    //   }
    // })

    return { success: true }
  } catch (error) {
    console.error("[Push] Error guardando suscripción:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

/**
 * Elimina una suscripción push del servidor
 */
export async function removeSubscription(
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implementar eliminación de base de datos
    console.log("[Push] Suscripción eliminada:", endpoint.substring(0, 50) + "...")

    return { success: true }
  } catch (error) {
    console.error("[Push] Error eliminando suscripción:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

/**
 * Envía una notificación push a una suscripción específica
 */
export async function sendPushNotification(
  subscription: SerializedSubscription,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return { success: false, error: "VAPID keys no configuradas" }
  }

  try {
    const pushSubscription: webpush.PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icon-192.png",
      badge: payload.badge || "/icon-192.png",
      url: payload.url || "/",
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      actions: payload.actions || [],
      data: payload.data || {},
    })

    await webpush.sendNotification(pushSubscription, notificationPayload)

    console.log("[Push] Notificación enviada exitosamente")
    return { success: true }
  } catch (error: any) {
    console.error("[Push] Error enviando notificación:", error)

    // Si el endpoint ya no es válido (usuario desuscrito)
    if (error.statusCode === 410 || error.statusCode === 404) {
      // TODO: Eliminar esta suscripción de la base de datos
      console.log("[Push] Suscripción inválida, debería eliminarse")
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al enviar notificación",
    }
  }
}

/**
 * Envía una notificación de prueba (útil para testing)
 */
export async function sendTestNotification(
  subscription: SerializedSubscription,
  message: string = "Esta es una notificación de prueba"
): Promise<{ success: boolean; error?: string }> {
  return sendPushNotification(subscription, {
    title: "Ambacar - Test",
    body: message,
    icon: "/icon-192.png",
    url: "/dashboard",
    tag: "test-notification",
  })
}
