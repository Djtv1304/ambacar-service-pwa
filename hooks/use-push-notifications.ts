"use client"

import { useState, useEffect, useCallback } from "react"
import { pushService } from "@/lib/services/push-notification-service"
import {
  checkPushSupport,
  getCurrentPermission,
  type NotificationPermissionState,
  type PushSupport,
} from "@/lib/api/push-notifications"

interface UsePushNotificationsReturn {
  /** Si el navegador soporta push notifications */
  isSupported: boolean
  /** Razón por la que no está soportado (si aplica) */
  unsupportedReason?: PushSupport["reason"]
  /** Estado del permiso de notificaciones */
  permission: NotificationPermissionState
  /** Si hay una suscripción activa */
  isSubscribed: boolean
  /** Si está cargando (inicialización o acción) */
  isLoading: boolean
  /** Error de la última operación */
  error: string | null
  /** Suscribirse a push notifications */
  subscribe: () => Promise<boolean>
  /** Desuscribirse de push notifications */
  unsubscribe: () => Promise<boolean>
  /** Sincronizar estado con backend */
  syncState: () => Promise<void>
}

export function usePushNotifications(
  customerId: string | undefined
): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [unsupportedReason, setUnsupportedReason] =
    useState<PushSupport["reason"]>()
  const [permission, setPermission] =
    useState<NotificationPermissionState>("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Inicializar y verificar estado
  useEffect(() => {
    async function init() {
      try {
        // Verificar soporte
        const support = checkPushSupport()
        setIsSupported(support.isSupported)
        setUnsupportedReason(support.reason)

        if (!support.isSupported) {
          setIsLoading(false)
          return
        }

        // Verificar permiso actual
        setPermission(getCurrentPermission())

        // Inicializar servicio
        await pushService.initialize()

        // Verificar si hay suscripción local
        const existingSubscription = await pushService.getExistingSubscription()
        setIsSubscribed(!!existingSubscription)

        // Si hay customerId, sincronizar con backend
        if (customerId && existingSubscription) {
          try {
            const syncResult = await pushService.syncSubscriptionState(customerId)
            // Si backend no tiene pero local sí, ya se sincronizó
            // Si local no tiene pero backend sí, actualizar estado
            if (!syncResult.hasLocalSubscription && syncResult.hasBackendSubscription) {
              setIsSubscribed(false)
            }
          } catch (syncError) {
            console.warn("[usePushNotifications] Sync failed:", syncError)
          }
        }
      } catch (err) {
        console.error("[usePushNotifications] Init error:", err)
        setError(err instanceof Error ? err.message : "Error initializing push")
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [customerId])

  // Suscribirse
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!customerId) {
      setError("Customer ID is required")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      await pushService.subscribe(customerId)
      setIsSubscribed(true)
      setPermission("granted")
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error subscribing"
      setError(message)

      // Actualizar permiso si fue denegado
      if (message.includes("denied")) {
        setPermission("denied")
      }

      return false
    } finally {
      setIsLoading(false)
    }
  }, [customerId])

  // Desuscribirse
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await pushService.unsubscribe()
      setIsSubscribed(false)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error unsubscribing")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sincronizar estado
  const syncState = useCallback(async (): Promise<void> => {
    if (!customerId) return

    try {
      const existingSubscription = await pushService.getExistingSubscription()
      setIsSubscribed(!!existingSubscription)
      setPermission(getCurrentPermission())

      const syncResult = await pushService.syncSubscriptionState(customerId)
      if (!syncResult.hasLocalSubscription) {
        setIsSubscribed(false)
      }
    } catch (err) {
      console.warn("[usePushNotifications] Sync error:", err)
    }
  }, [customerId])

  return {
    isSupported,
    unsupportedReason,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    syncState,
  }
}
