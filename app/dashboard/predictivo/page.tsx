"use client"

import { useState, useMemo } from "react"
import { PredictiveFilters } from "@/components/predictivo/predictive-filters"
import { OverloadAlert } from "@/components/predictivo/overload-alert"
import { DemandChart } from "@/components/predictivo/demand-chart"
import { QuickStats } from "@/components/predictivo/quick-stats"
import { Recommendations } from "@/components/predictivo/recommendations"
import { ModelConfig } from "@/components/predictivo/model-config"
import { HistoricalComparisonSection } from "@/components/predictivo/historical-comparison"
import {
  generateWeeklyDemand,
  generateMonthlyDemand,
  generateQuickStats,
  generateHistoricalComparison,
  normalRecommendations,
  overloadRecommendations,
  modelMetrics,
  isOverloadCondition,
} from "@/lib/fixtures/predictive-data"
import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"

export default function PredictivoPage() {
  // Filter state
  const [taller, setTaller] = useState("all")
  const [marca, setMarca] = useState("all")
  const [modelo, setModelo] = useState("all")
  const [range, setRange] = useState<"weekly" | "monthly">("weekly")

  // Determine if there's an overload condition
  const isOverload = useMemo(
    () => isOverloadCondition(taller, marca, modelo),
    [taller, marca, modelo]
  )

  // Generate data based on filters
  const chartData = useMemo(() => {
    const baseValue = 15 // Base number of services per day

    if (range === "weekly") {
      return generateWeeklyDemand(baseValue, isOverload)
    }
    return generateMonthlyDemand(baseValue, isOverload)
  }, [range, isOverload])

  const quickStats = useMemo(() => generateQuickStats(isOverload), [isOverload])

  const recommendations = useMemo(
    () => (isOverload ? overloadRecommendations : normalRecommendations),
    [isOverload]
  )

  const historicalComparisons = useMemo(
    () => generateHistoricalComparison(isOverload),
    [isOverload]
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Predictivo de Demanda
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análisis y proyección de la demanda de servicios en talleres
          </p>
        </div>
      </div>

      {/* Filters */}
      <PredictiveFilters
        taller={taller}
        marca={marca}
        modelo={modelo}
        onTallerChange={setTaller}
        onMarcaChange={setMarca}
        onModeloChange={setModelo}
      />

      {/* Overload Alert Banner (Conditional) */}
      {isOverload && <OverloadAlert taller={taller} marca={marca} modelo={modelo} />}

      {/* Main Grid: Chart + Sidebar */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Chart Column (Left - 8 cols) */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <DemandChart data={chartData} range={range} onRangeChange={setRange} />
          </motion.div>
        </div>

        {/* Sidebar Column (Right - 4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <QuickStats stats={quickStats} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Recommendations recommendations={recommendations} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <ModelConfig metrics={modelMetrics} />
          </motion.div>
        </div>
      </div>

      {/* Historical Comparison Section (Bottom) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <HistoricalComparisonSection comparisons={historicalComparisons} />
      </motion.div>
    </div>
  )
}
