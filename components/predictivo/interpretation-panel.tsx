"use client"

import { Info, Lightbulb, AlertTriangle, FileText } from "lucide-react"
import { motion } from "framer-motion"
import type { PrediccionInterpretacion } from "@/lib/api/predictivo"

interface InterpretationPanelProps {
  interpretacion: PrediccionInterpretacion | null
  isLoading?: boolean
}

export function InterpretationPanel({ interpretacion, isLoading }: InterpretationPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              Interpretación del Modelo
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Cargando análisis...
            </p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!interpretacion) {
    return null
  }

  const hasAlerts = interpretacion.alertas && interpretacion.alertas.length > 0

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700">
          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
        </div>
        <div>
          <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
            Interpretación del Modelo
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Análisis automático de predicciones
          </p>
        </div>
      </div>

      {/* Resumen Card */}
      {interpretacion.resumen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 dark:bg-blue-500/30">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Resumen</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{interpretacion.resumen}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alertas Section */}
      {hasAlerts && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 dark:bg-orange-500/30">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Alertas</h3>
              <ul className="space-y-1.5">
                {interpretacion.alertas.map((alerta, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-orange-800 dark:text-orange-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    {alerta}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hallazgos Grid */}
      {interpretacion.hallazgos && interpretacion.hallazgos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {interpretacion.hallazgos.map((hallazgo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 shadow-sm"
            >
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-400">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{hallazgo}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
