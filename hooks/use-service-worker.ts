"use client"

import { useState, useEffect, useCallback } from "react"

interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  registration: ServiceWorkerRegistration | null
  isPushSupported: boolean
  pushSubscription: PushSubscription | null
  isStandalone: boolean
  error: string | null
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    registration: null,
    isPushSupported: false,
    pushSubscription: null,
    isStandalone: false,
    error: null,
  })

  // Registrar el Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (!("serviceWorker" in navigator)) {
      setState((prev) => ({
        ...prev,
        error: "Service Workers no están soportados en este navegador",
      }))
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })

      console.log("[PWA] Service Worker registrado:", registration.scope)

      // Verificar si hay actualizaciones
      registration.addEventListener("updatefound", () => {
        console.log("[PWA] Nueva versión del Service Worker encontrada")
      })

      // Obtener suscripción push existente
      let pushSubscription: PushSubscription | null = null
      if ("PushManager" in window) {
        pushSubscription = await registration.pushManager.getSubscription()
      }

      setState((prev) => ({
        ...prev,
        isRegistered: true,
        registration,
        pushSubscription,
        error: null,
      }))

      return registration
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al registrar Service Worker"
      console.error("[PWA] Error registrando SW:", errorMessage)
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }))
      return null
    }
  }, [])

  // Suscribirse a Push Notifications
  const subscribeToPush = useCallback(async (): Promise<PushSubscription | null> => {
    if (!state.registration) {
      console.error("[PWA] No hay Service Worker registrado")
      return null
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      console.error("[PWA] VAPID public key no configurada")
      return null
    }

    try {
      // Solicitar permiso de notificaciones
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        console.log("[PWA] Permiso de notificaciones denegado")
        return null
      }

      // Convertir VAPID key a Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

      const subscription = await state.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      console.log("[PWA] Suscrito a push notifications")
      setState((prev) => ({
        ...prev,
        pushSubscription: subscription,
      }))

      return subscription
    } catch (error) {
      console.error("[PWA] Error al suscribirse a push:", error)
      return null
    }
  }, [state.registration])

  // Desuscribirse de Push Notifications
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!state.pushSubscription) {
      return true
    }

    try {
      await state.pushSubscription.unsubscribe()
      setState((prev) => ({
        ...prev,
        pushSubscription: null,
      }))
      console.log("[PWA] Desuscrito de push notifications")
      return true
    } catch (error) {
      console.error("[PWA] Error al desuscribirse:", error)
      return false
    }
  }, [state.pushSubscription])

  // Verificar actualizaciones del SW
  const checkForUpdates = useCallback(async () => {
    if (state.registration) {
      await state.registration.update()
    }
  }, [state.registration])

  // Inicialización
  useEffect(() => {
    // Verificar soporte
    const isSupported = "serviceWorker" in navigator
    const isPushSupported = "PushManager" in window
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true

    setState((prev) => ({
      ...prev,
      isSupported,
      isPushSupported,
      isStandalone,
    }))

    // Registrar SW si está soportado
    if (isSupported) {
      registerServiceWorker()
    }

    // Escuchar cambios en display mode
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setState((prev) => ({
        ...prev,
        isStandalone: e.matches,
      }))
    }

    mediaQuery.addEventListener("change", handleDisplayModeChange)

    return () => {
      mediaQuery.removeEventListener("change", handleDisplayModeChange)
    }
  }, [registerServiceWorker])

  return {
    ...state,
    registerServiceWorker,
    subscribeToPush,
    unsubscribeFromPush,
    checkForUpdates,
  }
}

// Helper: Convertir Base64 URL-safe a Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
