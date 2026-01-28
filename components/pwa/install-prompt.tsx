"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X, Share, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useServiceWorker } from "@/hooks/use-service-worker"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const { isStandalone, isSupported } = useServiceWorker()

  useEffect(() => {
    // Detectar iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Verificar si ya fue descartado
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      // Mostrar de nuevo después de 7 días
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return
      }
    }

    // Capturar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Para iOS, mostrar instrucciones si no está instalada
    if (isIOSDevice && !isStandalone) {
      // Pequeño delay para no mostrar inmediatamente
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
      return () => {
        clearTimeout(timer)
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [isStandalone])

  // Si ya está instalada, no mostrar nada
  if (isStandalone) {
    return null
  }

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // En iOS, mostrar instrucciones
      if (isIOS) {
        setShowIOSInstructions(true)
      }
      return
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        console.log("[PWA] App instalada")
      } else {
        console.log("[PWA] Instalación cancelada")
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error("[PWA] Error al instalar:", error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setShowIOSInstructions(false)
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
  }

  if (!showPrompt && !showIOSInstructions) {
    return null
  }

  return (
    <AnimatePresence>
      {(showPrompt || showIOSInstructions) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-40 border-b border-border bg-primary/5 dark:bg-primary/10"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-foreground">
                  {showIOSInstructions
                    ? "Instalar en iOS"
                    : "Instalar Ambacar"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {showIOSInstructions
                    ? "Sigue estos pasos:"
                    : "Acceso rápido desde tu pantalla de inicio"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showIOSInstructions ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="hidden sm:inline">Toca</span>
                  <Share className="h-4 w-4" />
                  <span className="hidden sm:inline">luego</span>
                  <span className="flex items-center gap-1 rounded bg-muted px-2 py-1">
                    <Plus className="h-3 w-3" />
                    <span className="hidden sm:inline">Agregar</span>
                  </span>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Instalar</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Cerrar</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
