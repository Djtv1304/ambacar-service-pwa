/**
 * Push Notification Service
 * Maneja la suscripción y desuscripción de notificaciones push
 */

import {
  checkPushSupport,
  urlBase64ToUint8Array,
  requestNotificationPermission,
  getCurrentPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getPushStatus,
  type PushSubscriptionResponse,
  type PushStatusResponse,
  type PushSupport,
} from "@/lib/api/push-notifications"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null
  private initialized = false

  /**
   * Inicializar el servicio (llamar al cargar la app)
   */
  async initialize(): Promise<PushSupport> {
    const support = checkPushSupport()

    if (!support.isSupported) {
      console.warn("[PushService] Push not supported:", support.reason)
      return support
    }

    try {
      this.registration = await navigator.serviceWorker.ready
      this.initialized = true
      console.log("[PushService] Initialized successfully")
    } catch (error) {
      console.error("[PushService] Failed to get SW registration:", error)
      return { isSupported: false, reason: "no-service-worker" }
    }

    return support
  }

  /**
   * Verificar si el servicio está inicializado
   */
  isInitialized(): boolean {
    return this.initialized && this.registration !== null
  }

  /**
   * Obtener suscripción existente del navegador (si hay)
   */
  async getExistingSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null
    }

    try {
      return await this.registration.pushManager.getSubscription()
    } catch (error) {
      console.error("[PushService] Error getting subscription:", error)
      return null
    }
  }

  /**
   * Suscribirse a notificaciones push
   */
  async subscribe(customerId: string): Promise<PushSubscriptionResponse> {
    // 1. Verificar soporte
    const support = checkPushSupport()
    if (!support.isSupported) {
      throw new Error(`Push not supported: ${support.reason}`)
    }

    // 2. Verificar VAPID key
    if (!VAPID_PUBLIC_KEY) {
      throw new Error("VAPID public key not configured")
    }

    // 3. Solicitar permiso si necesario
    const permission = await requestNotificationPermission()
    if (permission !== "granted") {
      throw new Error("Notification permission denied")
    }

    // 4. Asegurar registration
    if (!this.registration) {
      this.registration = await navigator.serviceWorker.ready
    }

    // 5. Crear suscripción en el navegador
    let subscription: PushSubscription
    try {
      subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    } catch (error) {
      console.error("[PushService] Error creating subscription:", error)
      throw new Error("Failed to create push subscription")
    }

    // 6. Enviar al backend
    try {
      const subscriptionJSON = subscription.toJSON()

      if (!subscriptionJSON.endpoint || !subscriptionJSON.keys) {
        throw new Error("Invalid subscription format")
      }

      const response = await subscribeToPush({
        customer_id: customerId,
        subscription: {
          endpoint: subscriptionJSON.endpoint,
          keys: {
            p256dh: subscriptionJSON.keys.p256dh || "",
            auth: subscriptionJSON.keys.auth || "",
          },
        },
        user_agent: navigator.userAgent,
      })

      console.log("[PushService] Subscribed successfully:", response.id)
      return response
    } catch (error) {
      // Rollback: desuscribir del navegador si backend falla
      console.error("[PushService] Backend subscription failed, rolling back:", error)
      await subscription.unsubscribe().catch(() => {})
      throw error
    }
  }

  /**
   * Desuscribirse de notificaciones push
   */
  async unsubscribe(): Promise<void> {
    // 1. Obtener suscripción actual del navegador
    const subscription = await this.getExistingSubscription()

    if (subscription) {
      const endpoint = subscription.endpoint

      // 2. Desuscribir del navegador primero
      try {
        await subscription.unsubscribe()
        console.log("[PushService] Unsubscribed from browser")
      } catch (error) {
        console.error("[PushService] Error unsubscribing from browser:", error)
      }

      // 3. Eliminar en backend
      try {
        await unsubscribeFromPush(endpoint)
        console.log("[PushService] Unsubscribed from backend")
      } catch (error) {
        // No es crítico si falla en backend, el navegador ya está desuscrito
        console.warn("[PushService] Backend unsubscribe failed:", error)
      }
    }
  }

  /**
   * Verificar estado de suscripción en el backend
   */
  async checkStatus(customerId: string): Promise<PushStatusResponse> {
    return getPushStatus(customerId)
  }

  /**
   * Sincronizar estado local con backend
   */
  async syncSubscriptionState(customerId: string): Promise<{
    hasLocalSubscription: boolean
    hasBackendSubscription: boolean
    needsSync: boolean
    synced: boolean
  }> {
    const localSubscription = await this.getExistingSubscription()

    let backendStatus: PushStatusResponse
    try {
      backendStatus = await this.checkStatus(customerId)
    } catch {
      // Si falla backend, asumir que no hay suscripción
      backendStatus = { has_subscription: false, subscription_count: 0 }
    }

    const hasLocal = !!localSubscription
    const hasBackend = backendStatus.has_subscription
    const needsSync = hasLocal !== hasBackend

    let synced = false

    if (needsSync) {
      // Caso 1: Local tiene suscripción pero backend no → Re-enviar
      if (localSubscription && !hasBackend) {
        try {
          const subscriptionJSON = localSubscription.toJSON()
          if (subscriptionJSON.endpoint && subscriptionJSON.keys) {
            await subscribeToPush({
              customer_id: customerId,
              subscription: {
                endpoint: subscriptionJSON.endpoint,
                keys: {
                  p256dh: subscriptionJSON.keys.p256dh || "",
                  auth: subscriptionJSON.keys.auth || "",
                },
              },
              user_agent: navigator.userAgent,
            })
            synced = true
            console.log("[PushService] Synced local subscription to backend")
          }
        } catch (error) {
          console.error("[PushService] Failed to sync subscription:", error)
        }
      }

      // Caso 2: Backend tiene pero local no → Preferencia debe actualizarse a disabled
      // Este caso se maneja en el hook, retornamos el estado para que el UI actúe
    }

    return {
      hasLocalSubscription: hasLocal,
      hasBackendSubscription: hasBackend,
      needsSync,
      synced,
    }
  }

  /**
   * Obtener permiso actual
   */
  getPermission() {
    return getCurrentPermission()
  }

  /**
   * Verificar soporte
   */
  checkSupport(): PushSupport {
    return checkPushSupport()
  }
}

// Singleton export
export const pushService = new PushNotificationService()
