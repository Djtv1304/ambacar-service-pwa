"use client"

import { useState, useMemo } from "react"
import { CommandHeader } from "@/components/predictivo/command-header"
import { KpiRibbon } from "@/components/predictivo/kpi-ribbon"
import { HeroChart } from "@/components/predictivo/hero-chart"
import { OperationalPanel } from "@/components/predictivo/operational-panel"
import { InterpretationPanel } from "@/components/predictivo/interpretation-panel"
import { usePredictionData } from "@/hooks/use-prediction-data"
import { useModelMetrics } from "@/hooks/use-model-metrics"
import { useWorkshops } from "@/hooks/use-workshops"
import type { QuickStat, Recommendation } from "@/lib/fixtures/predictive-data"
import { motion } from "framer-motion"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PredictivoPage() {
  // Filter state
  const [taller, setTaller] = useState("all")
  const [marca, setMarca] = useState("all")
  const [modelo, setModelo] = useState("all")
  const [range, setRange] = useState<"weekly" | "monthly">("weekly")
  const [periods, setPeriods] = useState(1)

  // Handler to adjust periods when range changes (monthly max is 12)
  const handleRangeChange = (newRange: "weekly" | "monthly") => {
    setRange(newRange)
    // If switching to monthly and periods > 12, cap it
    if (newRange === "monthly" && periods > 12) {
      setPeriods(12)
    }
  }

  // Fetch workshops list from API
  const { workshops, isLoading: isLoadingWorkshops } = useWorkshops()

  // Fetch prediction data from API - re-fetches when range, periods or taller change
  const { data: predictionData, isLoading, error } = usePredictionData(range, periods, taller)

  // Fetch model metrics (precision) from separate endpoint
  const { precisionPorcentaje, isLoading: isLoadingMetrics } = useModelMetrics()

  // Determine if there's an overload condition based on API alerts
  const isOverload = useMemo(() => {
    if (predictionData?.interpretacion?.alertas?.length) {
      return predictionData.interpretacion.alertas.length > 0
    }
    return false
  }, [predictionData])

  // Transform API data to QuickStats format
  const quickStats = useMemo((): QuickStat[] => {
    if (!predictionData?.estadisticas) {
      return [
        { label: "Promedio Semanal Proyectado", value: "-", unit: "servicios/día" },
        { label: "Pico Máximo Proyectado", value: "-", unit: "servicios" },
        { label: "Precisión del Modelo", value: isLoadingMetrics ? "..." : (precisionPorcentaje || "-") },
        { label: "Total Órdenes", value: "-", unit: "órdenes" },
      ]
    }

    const stats = predictionData.estadisticas

    return [
      {
        label: "Promedio Semanal Proyectado",
        value: stats.promedio_semanal,
        unit: "servicios/sem",
        change: 0,
        trend: "neutral" as const,
      },
      {
        label: "Pico Máximo Proyectado",
        value: stats.maximo,
        unit: "servicios",
        change: 0,
        trend: "up" as const,
      },
      {
        label: "Precisión del Modelo",
        value: isLoadingMetrics ? "..." : (precisionPorcentaje || "-"),
        change: 0,
        trend: "neutral" as const,
      },
      {
        label: "Total Órdenes",
        value: stats.total_ordenes.toLocaleString(),
        unit: "órdenes",
        change: 0,
        trend: "up" as const,
      },
    ]
  }, [predictionData, precisionPorcentaje, isLoadingMetrics])

  // Transform API recommendations to component format
  const recommendations = useMemo((): Recommendation[] => {
    if (!predictionData?.interpretacion?.recomendaciones?.length) {
      return [
        {
          id: "loading",
          type: "staff",
          message: isLoading ? "Cargando recomendaciones..." : "Sin recomendaciones disponibles",
          severity: "info",
          icon: "calendar",
        },
      ]
    }

    return predictionData.interpretacion.recomendaciones.map((rec, index) => ({
      id: `rec-${index}`,
      type: "staff" as const,
      message: rec,
      severity: "info" as const,
      icon: index === 0 ? "users" : index === 1 ? "calendar" : "package",
    }))
  }, [predictionData, isLoading])


  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 -m-6">
      {/* Command Header - Unified Top Bar */}
      <CommandHeader
        taller={taller}
        marca={marca}
        modelo={modelo}
        range={range}
        periods={periods}
        isOverload={isOverload}
        isLoading={isLoading}
        workshops={workshops}
        isLoadingWorkshops={isLoadingWorkshops}
        onTallerChange={setTaller}
        onMarcaChange={setMarca}
        onModeloChange={setModelo}
        onRangeChange={handleRangeChange}
        onPeriodsChange={setPeriods}
      />

      {/* Main Content Area */}
      <div className="space-y-6 p-6">
        {/* KPI Ribbon - Quick Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <KpiRibbon stats={quickStats} />
        </motion.div>

        {/* Main Canvas - Flex layout with auto-wrap */}
        <div className="flex flex-wrap gap-6">
          {/* Hero Chart - Takes available space, min 300px to force wrap */}
          <motion.div
            className="min-w-[300px] flex-[1_1_600px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <HeroChart
              apiData={predictionData?.grafica_tradingview}
              range={range}
              periods={periods}
              isLoading={isLoading}
            />
          </motion.div>

          {/* Operational Panel - Grows to 100% when wrapped, fixed width when inline */}
          <motion.div
            className="flex-[1_1_280px] xl:flex-[0_0_320px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <OperationalPanel
              recommendations={recommendations}
              modelPrecision={precisionPorcentaje}
              isLoadingPrecision={isLoadingMetrics}
            />
          </motion.div>
        </div>

        {/* Footer: Model Interpretation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <InterpretationPanel
            interpretacion={predictionData?.interpretacion || null}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Error al cargar predicciones
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reintentar
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
