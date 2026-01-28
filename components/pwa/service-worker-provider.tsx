"use client"

import { useEffect } from "react"

export function ServiceWorkerProvider() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Registrar el Service Worker cuando el componente se monte
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .then((registration) => {
          console.log("[PWA] Service Worker registrado:", registration.scope)

          // Verificar actualizaciones periódicamente
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[PWA] Nueva versión disponible")
                  // Aquí se podría mostrar un toast para recargar
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("[PWA] Error al registrar Service Worker:", error)
        })
    }
  }, [])

  // Este componente no renderiza nada visible
  return null
}
