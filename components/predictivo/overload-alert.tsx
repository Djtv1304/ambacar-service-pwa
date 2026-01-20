"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState } from "react"
import { toast } from "sonner"

interface OverloadAlertProps {
  taller: string
  marca: string
  modelo: string
}

export function OverloadAlert({ taller, marca, modelo }: OverloadAlertProps) {
  const [isNotifying, setIsNotifying] = useState(false)

  /**
   * Simulates triggering an overload alert to the notification microservice
   * In production, this would call: POST /api/v1/notifications/events/dispatch/
   */
  const handleTriggerAlert = async () => {
    setIsNotifying(true)

    // Simulate API call to notification service
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success("Alerta enviada", {
      description: "El equipo de gestión ha sido notificado sobre la sobrecarga proyectada.",
    })

    setIsNotifying(false)

    // TODO: Implement actual notification dispatch
    // const payload = {
    //   event_type: "custom",
    //   service_type_id: null,
    //   phase_id: null,
    //   customer_id: "system",
    //   target: "staff",
    //   context: {
    //     alert_type: "overload_warning",
    //     taller,
    //     marca,
    //     modelo,
    //     projected_increase: "35%",
    //   },
    // }
    // await dispatchNotificationEvent(payload, authToken)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-yellow-500/30 bg-yellow-50 dark:bg-yellow-900/20 p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/20 dark:bg-yellow-500/30">
            <AlertTriangle className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
              Alerta de Sobrecarga Proyectada
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Se detecta un incremento del{" "}
              <span className="font-semibold">+35%</span> en la demanda para la
              próxima semana. Se recomienda aumentar recursos operativos.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-yellow-700 dark:text-yellow-300 mt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 dark:bg-yellow-800/40 px-2 py-0.5">
                Taller: <strong>{taller === "all" ? "Todos" : taller}</strong>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 dark:bg-yellow-800/40 px-2 py-0.5">
                Marca: <strong>{marca === "all" ? "Todas" : marca}</strong>
              </span>
              {modelo !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 dark:bg-yellow-800/40 px-2 py-0.5">
                  Modelo: <strong>{modelo}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="border-yellow-600 dark:border-yellow-500 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
            onClick={handleTriggerAlert}
            disabled={isNotifying}
          >
            {isNotifying ? "Enviando..." : "Notificar al Staff"}
          </Button>
          <Button
            size="sm"
            className="bg-yellow-600 dark:bg-yellow-500 text-white hover:bg-yellow-700 dark:hover:bg-yellow-600"
            onClick={() => {
              const element = document.getElementById("recommendations-section")
              element?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Ver Recomendaciones
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
