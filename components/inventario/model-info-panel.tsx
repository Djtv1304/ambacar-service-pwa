"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Brain,
  Zap,
  Calendar,
  Target,
  BarChart3,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useModelInfo, useRetrain } from "@/lib/hooks/use-recommender"
import { useToast } from "@/components/ui/use-toast"

interface ModelInfoPanelProps {
  className?: string
  compact?: boolean
}

export function ModelInfoPanel({ className, compact = false }: ModelInfoPanelProps) {
  const { data, isLoading, error, refetch } = useModelInfo()
  const { isLoading: isRetraining, retrain } = useRetrain()
  const { toast } = useToast()

  const handleRetrain = async () => {
    const success = await retrain()
    if (success) {
      toast({
        title: "Modelo re-entrenado",
        description: "El modelo de IA ha sido actualizado exitosamente.",
      })
      refetch()
    } else {
      toast({
        title: "Error al re-entrenar",
        description: "No se pudo re-entrenar el modelo. Intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950", className)}>
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={cn("rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20", className)}>
        <div className="p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-600 dark:text-red-400">Error al cargar modelo</span>
        </div>
      </div>
    )
  }

  // Extract with defaults for defensive coding
  const metricas = data.metricas || { precision: 0, recall: 0, f1: 0 }
  const fecha_entrenamiento = data.fecha_entrenamiento || ""
  const registros_procesados = data.registros_procesados || 0
  const repuestos_target = data.repuestos_target || 0
  // duracion_entrenamiento is a number (seconds)
  const duracion_raw = data.duracion_entrenamiento || 0
  const duracion_entrenamiento = typeof duracion_raw === 'number'
    ? `${duracion_raw.toFixed(1)}s`
    : duracion_raw

  const f1Score = metricas.f1 || 0
  const accuracyColor = f1Score >= 0.7 ? "text-green-500" :
                        f1Score >= 0.5 ? "text-yellow-500" :
                        "text-red-500"

  if (compact) {
    return (
      <div className={cn("rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg", className)}>
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Insights de IA
              </h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {new Date(fecha_entrenamiento).toLocaleDateString("es-EC")}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Model Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">F1 Score del Modelo</span>
              <span className={cn("text-xs font-bold", accuracyColor)}>
                {(f1Score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${f1Score * 100}%` }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  f1Score >= 0.7 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                  f1Score >= 0.5 ? "bg-gradient-to-r from-yellow-500 to-amber-500" :
                  "bg-gradient-to-r from-red-500 to-orange-500"
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Precision
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {((metricas.precision || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Recall
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {((metricas.recall || 0) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Estadísticas
            </h4>
            <div className="flex flex-wrap gap-1">
              <Badge
                variant="outline"
                className="text-[10px] bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300"
              >
                {(registros_procesados || 0).toLocaleString()} registros
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
              >
                {repuestos_target || 0} repuestos
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
              >
                {duracion_entrenamiento}
              </Badge>
            </div>
          </div>

          {/* Retrain Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetrain}
            disabled={isRetraining}
            className="w-full gap-2 mt-2 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10"
          >
            {isRetraining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Re-entrenando...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Re-entrenar Modelo
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Full panel version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg overflow-hidden", className)}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-cyan-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-cyan-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 shadow-lg shadow-purple-500/20">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Modelo de Recomendación
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-xs bg-white/50 dark:bg-gray-900/50">
                  {duracion_entrenamiento}
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Entrenado: {new Date(fecha_entrenamiento).toLocaleDateString("es-EC")}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleRetrain}
            disabled={isRetraining}
            className="gap-2"
          >
            {isRetraining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Re-entrenando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Re-entrenar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400">Precision</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {((metricas.precision || 0) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400">Recall</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {((metricas.recall || 0) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400">F1 Score</span>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {((metricas.f1 || 0) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Training Stats */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/50">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Estadísticas de Entrenamiento
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                <BarChart3 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Registros</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {(registros_procesados || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Repuestos Target</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {(repuestos_target || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Duración</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {duracion_entrenamiento || "---"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {fecha_entrenamiento
                ? `Modelo entrenado el ${new Date(fecha_entrenamiento).toLocaleString("es-EC")}`
                : "Fecha de entrenamiento no disponible"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
