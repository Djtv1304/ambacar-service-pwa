"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Package,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  Car,
  Gauge,
  Calendar,
  BarChart3,
  Info,
  Copy,
  Check
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { PredictResponse } from "@/lib/api/recommender"
import { formatProbability, formatFrequency } from "@/lib/api/recommender"

interface RecommendationsPanelProps {
  data: PredictResponse
  onReset?: () => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3 text-gray-400" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copiado!" : "Copiar codigo"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ProbabilityBar({ value }: { value: number }) {
  const percentage = value * 100

  const getColor = () => {
    if (percentage >= 60) return "bg-gradient-to-r from-emerald-500 to-green-400"
    if (percentage >= 30) return "bg-gradient-to-r from-amber-500 to-yellow-400"
    return "bg-gradient-to-r from-gray-400 to-gray-300"
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full rounded-full", getColor())}
        />
      </div>
      <span className={cn(
        "text-xs font-bold min-w-[45px] text-right",
        percentage >= 60 ? "text-emerald-600 dark:text-emerald-400" :
        percentage >= 30 ? "text-amber-600 dark:text-amber-400" :
        "text-gray-500"
      )}>
        {formatProbability(value)}
      </span>
    </div>
  )
}

export function RecommendationsPanel({ data, onReset }: RecommendationsPanelProps) {
  const { vehiculo, recomendaciones, repuestos_por_kilometraje, interpretacion, grafica_base64 } = data

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Vehicle Summary Card */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {vehiculo.marca} {vehiculo.modelo}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <Badge variant="outline" className="gap-1 bg-white/50 dark:bg-gray-900/50">
                <Calendar className="h-3 w-3" />
                {vehiculo.anio}
              </Badge>
              <Badge variant="outline" className="gap-1 bg-white/50 dark:bg-gray-900/50">
                <Gauge className="h-3 w-3" />
                {vehiculo.kilometraje.toLocaleString()} km
              </Badge>
              <Badge className="gap-1 bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800">
                <TrendingUp className="h-3 w-3" />
                Rango: {vehiculo.rango_km}
              </Badge>
            </div>
          </div>
          {onReset && (
            <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
              Nueva Consulta
            </Button>
          )}
        </div>
      </div>

      {/* AI Interpretation */}
      <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-2">
              Analisis de IA
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
              {interpretacion.resumen}
            </p>

            {/* Findings */}
            {interpretacion.hallazgos.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {interpretacion.hallazgos.map((finding, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 text-purple-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-purple-700 dark:text-purple-300">{finding}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {interpretacion.recomendaciones.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {interpretacion.recomendaciones.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-purple-700 dark:text-purple-300">{rec}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Alerts */}
            {interpretacion.alertas.length > 0 && (
              <div className="space-y-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                {interpretacion.alertas.map((alert, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-red-700 dark:text-red-300">{alert}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations Tabs */}
      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="predictions" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Predicciones IA
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {recomendaciones.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="mileage" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Por Kilometraje
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {repuestos_por_kilometraje.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="mt-0">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Repuestos Recomendados por IA
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Basado en vehiculos similares y patrones de mantenimiento
              </p>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-2">
                <AnimatePresence mode="popLayout">
                  {recomendaciones.map((part, index) => (
                    <motion.div
                      key={part.codigo}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 mb-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                              {part.codigo}
                              <CopyButton text={part.codigo} />
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] h-4",
                                part.probabilidad >= 0.5
                                  ? "border-emerald-300 text-emerald-600 dark:text-emerald-400"
                                  : "border-gray-300 text-gray-600 dark:text-gray-400"
                              )}
                            >
                              #{index + 1}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                            {part.descripcion}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                            {part.metodo}
                          </p>
                        </div>
                        <Package className="h-5 w-5 text-gray-400 shrink-0" />
                      </div>
                      <ProbabilityBar value={part.probabilidad} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* By Mileage Tab */}
        <TabsContent value="mileage" className="mt-0">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Repuestos Frecuentes en Rango {vehiculo.rango_km}
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Repuestos mas utilizados en vehiculos con kilometraje similar
              </p>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-2">
                <AnimatePresence mode="popLayout">
                  {repuestos_por_kilometraje.map((part, index) => (
                    <motion.div
                      key={part.codigo}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 mb-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                              {part.codigo}
                              <CopyButton text={part.codigo} />
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                            {part.descripcion}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                            {formatFrequency(part.frecuencia)}
                          </p>
                          <p className="text-[10px] text-gray-500">usos</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      {/* Chart if available */}
      {grafica_base64 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
        >
          <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Grafico de Distribucion
            </h4>
          </div>
          <div className="p-4">
            <img
              src={`data:image/png;base64,${grafica_base64}`}
              alt="Grafico de recomendaciones"
              className="w-full rounded-lg"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
