"use client"

import { motion } from "framer-motion"
import {
  BarChart3,
  Package,
  TrendingUp,
  Database,
  Loader2,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  AlertTriangle,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAnalytics } from "@/lib/hooks/use-recommender"

interface AnalyticsPanelProps {
  className?: string
}

export function AnalyticsPanel({ className }: AnalyticsPanelProps) {
  const { data, isLoading, error, refetch } = useAnalytics()

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6", className)}>
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Cargando analytics...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={cn("rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6", className)}>
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">{error || "Error al cargar analytics"}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  // Get ranges and repuestos data
  const rangos = data.rangos_kilometraje || []
  const repuestosPorKm = data.repuestos_por_kilometraje || {}
  const topRepuestos = data.top_repuestos || []
  const interpretacion = data.interpretacion || { resumen: "", hallazgos: [], recomendaciones: [], alertas: null }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("space-y-4", className)}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-cyan-500" />
            <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400">Repuestos Analizados</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.total_repuestos_analizados || 0}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400">Rangos de KM</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {rangos.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-purple-500" />
            <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400">Top Repuestos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {topRepuestos.length}
          </p>
        </div>
      </div>

      {/* AI Interpretation */}
      {interpretacion.resumen && (
        <div className="rounded-xl border border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 overflow-hidden">
          <div className="border-b border-cyan-200 dark:border-cyan-800 px-4 py-3 bg-gradient-to-r from-cyan-100/50 dark:from-cyan-900/30 to-transparent">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <h4 className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                Interpretacion IA
              </h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {interpretacion.resumen}
            </p>

            {interpretacion.hallazgos && interpretacion.hallazgos.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Hallazgos Principales
                </h5>
                <ul className="space-y-1">
                  {interpretacion.hallazgos.map((hallazgo, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <ChevronRight className="h-3 w-3 mt-0.5 text-cyan-500 shrink-0" />
                      <span>{hallazgo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {interpretacion.recomendaciones && interpretacion.recomendaciones.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Recomendaciones
                </h5>
                <ul className="space-y-1">
                  {interpretacion.recomendaciones.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <TrendingUp className="h-3 w-3 mt-0.5 text-emerald-500 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {interpretacion.alertas && interpretacion.alertas.length > 0 && (
              <div className="space-y-2 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <h5 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                  Alertas
                </h5>
                <ul className="space-y-1">
                  {interpretacion.alertas.map((alerta, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{alerta}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart Image */}
      {data.grafica_base64 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Visualizacion de Datos
              </h4>
            </div>
          </div>
          <div className="p-4">
            <img
              src={`data:image/png;base64,${data.grafica_base64}`}
              alt="Grafico de Analytics"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Top Repuestos */}
      {topRepuestos.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-500" />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Top {topRepuestos.length} Repuestos Mas Frecuentes
              </h4>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {topRepuestos.map((codigo, index) => (
                <Badge
                  key={codigo}
                  variant="outline"
                  className="text-xs bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                >
                  #{index + 1} {codigo}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Repuestos por Kilometraje */}
      {rangos.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-500" />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Repuestos por Rango de Kilometraje
              </h4>
            </div>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="p-4 space-y-6">
              {rangos.map((rango) => {
                const repuestos = repuestosPorKm[rango] || []
                const maxFreq = repuestos.length > 0 ? Math.max(...repuestos.map(r => r.frecuencia)) : 0

                return (
                  <div key={rango} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800">
                        {rango}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {repuestos.length} repuestos
                      </span>
                    </div>
                    <div className="space-y-2">
                      {repuestos.map((repuesto, index) => {
                        const percentage = maxFreq > 0 ? (repuesto.frecuencia / maxFreq) * 100 : 0
                        return (
                          <motion.div
                            key={repuesto.codigo}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                            className="p-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded shrink-0">
                                  {repuesto.codigo}
                                </span>
                                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                  {repuesto.descripcion}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
                                {repuesto.frecuencia.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                              />
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </motion.div>
  )
}
