"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Settings,
  Sparkles,
  BarChart3,
  Car,
  Zap,
  ChevronRight,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { VehicleSelector } from "@/components/inventario/vehicle-selector"
import { RecommendationsPanel } from "@/components/inventario/recommendations-panel"
import { AnalyticsPanel } from "@/components/inventario/analytics-panel"
import { ModelInfoPanel } from "@/components/inventario/model-info-panel"
import { usePredictions, useAnalytics, useModelInfo } from "@/lib/hooks/use-recommender"
import type { PredictionMethod } from "@/lib/api/recommender"

// KPI Card component
function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
  pulse = false,
  isLoading = false
}: {
  title: string
  value: string
  subtitle: string
  icon: typeof Package
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  variant?: "default" | "warning" | "danger" | "success" | "ai"
  pulse?: boolean
  isLoading?: boolean
}) {
  const variantStyles = {
    default: "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950",
    warning: "border-orange-500/30 bg-gradient-to-br from-orange-50 to-white dark:from-orange-500/10 dark:to-gray-950",
    danger: "border-red-500/30 bg-gradient-to-br from-red-50 to-white dark:from-red-500/10 dark:to-gray-950",
    success: "border-green-500/30 bg-gradient-to-br from-green-50 to-white dark:from-green-500/10 dark:to-gray-950",
    ai: "border-cyan-500/30 bg-gradient-to-br from-cyan-50 via-purple-50/50 to-white dark:from-cyan-500/10 dark:via-purple-500/5 dark:to-gray-950"
  }

  const iconStyles = {
    default: "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400",
    warning: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400",
    danger: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
    success: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
    ai: "bg-gradient-to-br from-cyan-500 to-purple-600 text-white"
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border p-4 shadow-sm",
      variantStyles[variant]
    )}>
      {pulse && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
          iconStyles[variant]
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            {isLoading ? (
              <div className="h-7 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            ) : (
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {value}
              </p>
            )}
            {trend && trendValue && !isLoading && (
              <span className={cn(
                "text-xs font-medium",
                trend === "up" ? "text-green-600 dark:text-green-400" :
                trend === "down" ? "text-red-600 dark:text-red-400" :
                "text-gray-500 dark:text-gray-400"
              )}>
                {trend === "up" ? "+" : trend === "down" ? "-" : ""}{trendValue}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5 truncate">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function InventarioPage() {
  const [activeTab, setActiveTab] = useState("predictor")
  const [isSticky, setIsSticky] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // API Hooks
  const { data: predictions, isLoading: isPredicting, error: predictError, predict, reset: resetPredictions } = usePredictions()
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics()
  const { data: modelInfo, isLoading: modelLoading, refetch: refetchModel } = useModelInfo()

  // Handle prediction request
  const handlePredict = async (params: {
    marca: string
    modelo: string
    anio: number
    kilometraje: number
    metodo: PredictionMethod
    n_recomendaciones: number
  }) => {
    await predict(params)
  }

  // Sticky header detection
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    let rafId: number | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      {
        threshold: [0, 1],
        rootMargin: '-1px 0px 0px 0px'
      }
    )

    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        const sentinelRect = sentinel.getBoundingClientRect()
        setIsSticky(sentinelRect.bottom <= 0)
        rafId = null
      })
    }

    observer.observe(sentinel)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  // Calculate KPIs from analytics and model info
  const modelDurationRaw = modelInfo?.duracion_entrenamiento ?? 0
  const kpis = {
    totalRepuestos: analytics?.total_repuestos_analizados ?? 0,
    totalRangos: analytics?.rangos_kilometraje?.length ?? 0,
    topRepuestos: analytics?.top_repuestos?.length ?? 0,
    modelF1: modelInfo?.metricas?.f1 ?? 0,
    modelDuration: typeof modelDurationRaw === 'number' ? `${modelDurationRaw.toFixed(1)}s` : modelDurationRaw
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 -m-6">
      {/* Sentinel for sticky detection */}
      <div ref={sentinelRef} className="h-0" aria-hidden="true" />

      {/* Command Header */}
      <div
        ref={headerRef}
        className={cn(
          "sticky -top-14 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm",
          "will-change-[padding]",
          isSticky ? "pt-10" : "pt-0"
        )}
      >
        <div className="px-4 sm:px-6 py-4">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                    Recomendador IA
                  </h1>
                  <Badge
                    variant="outline"
                    className="hidden sm:flex gap-1 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-400"
                  >
                    <Sparkles className="h-3 w-3" />
                    {kpis.modelDuration}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Predicciones inteligentes de repuestos por vehiculo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Model Performance Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "hidden md:flex gap-1.5",
                  kpis.modelF1 >= 0.7
                    ? "border-green-500/30 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10"
                    : kpis.modelF1 >= 0.5
                    ? "border-yellow-500/30 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10"
                    : "border-gray-500/30 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-500/10"
                )}
              >
                <TrendingUp className="h-3 w-3" />
                {modelLoading ? "---" : `${(kpis.modelF1 * 100).toFixed(1)}% F1`}
              </Badge>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchModel()}
                disabled={modelLoading}
                className="gap-1.5"
              >
                <RefreshCw className={cn("h-4 w-4", modelLoading && "animate-spin")} />
                <span className="hidden sm:inline">
                  {modelLoading ? "Actualizando..." : "Actualizar"}
                </span>
              </Button>

              {/* Settings Button - Hidden for now */}
              {/* <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                asChild
              >
                <a href="/dashboard/configuracion/ia-models">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Configurar</span>
                </a>
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <KpiCard
            title="Repuestos Analizados"
            value={kpis.totalRepuestos.toString()}
            subtitle="En modelo de IA"
            icon={Package}
            variant="default"
            isLoading={analyticsLoading}
          />
          <KpiCard
            title="Rangos de KM"
            value={kpis.totalRangos.toString()}
            subtitle="Segmentos de datos"
            icon={Car}
            variant="success"
            isLoading={analyticsLoading}
          />
          <KpiCard
            title="Top Repuestos"
            value={kpis.topRepuestos.toString()}
            subtitle="Mas frecuentes"
            icon={BarChart3}
            variant="warning"
            isLoading={analyticsLoading}
          />
          <KpiCard
            title="F1 Score IA"
            value={modelLoading ? "---" : `${(kpis.modelF1 * 100).toFixed(1)}%`}
            subtitle={`Tiempo: ${kpis.modelDuration}`}
            icon={Brain}
            variant="ai"
            trend="up"
            trendValue="estable"
            isLoading={modelLoading}
          />
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="predictor" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Predictor IA</span>
              <span className="sm:hidden">Predictor</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="model" className="gap-1.5">
              <Brain className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Modelo IA</span>
              <span className="sm:hidden">Modelo</span>
            </TabsTrigger>
          </TabsList>

          {/* Predictor Tab */}
          <TabsContent value="predictor" className="mt-0">
            <div className="flex flex-wrap gap-6">
              {/* Left Column - Vehicle Selector */}
              <motion.div
                className="min-w-[300px] flex-[1_1_350px] xl:flex-[0_0_400px]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <VehicleSelector
                  onPredict={handlePredict}
                  isLoading={isPredicting}
                />

                {/* Model Info Panel (Compact) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="mt-4"
                >
                  <ModelInfoPanel compact />
                </motion.div>
              </motion.div>

              {/* Right Column - Results */}
              <motion.div
                className="min-w-[300px] flex-[1_1_600px]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <AnimatePresence mode="wait">
                  {isPredicting ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-12"
                    >
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse" />
                          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Analizando vehiculo...
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            El modelo IA esta procesando los datos
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : predictions ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <RecommendationsPanel
                        data={predictions}
                        onReset={resetPredictions}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-12"
                    >
                      <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                          <Car className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Selecciona un vehiculo
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[250px]">
                            Ingresa la marca, modelo, anio y kilometraje para obtener recomendaciones de repuestos
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                          <ChevronRight className="h-4 w-4" />
                          <span>Las predicciones apareceran aqui</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {predictError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {predictError}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-0">
            <AnalyticsPanel />
          </TabsContent>

          {/* Model Tab */}
          <TabsContent value="model" className="mt-0">
            <ModelInfoPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
