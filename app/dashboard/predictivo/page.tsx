"use client"

import { useState, useMemo } from "react"
import { CommandHeader } from "@/components/predictivo/command-header"
import { KpiRibbon } from "@/components/predictivo/kpi-ribbon"
import { HeroChart } from "@/components/predictivo/hero-chart"
import { OperationalPanel } from "@/components/predictivo/operational-panel"
import { ComparativeFooter } from "@/components/predictivo/comparative-footer"
import {
  generateWeeklyDemand,
  generateMonthlyDemand,
  generateQuickStats,
  generateHistoricalComparison,
  normalRecommendations,
  overloadRecommendations,
  isOverloadCondition,
} from "@/lib/fixtures/predictive-data"
import { motion } from "framer-motion"

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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 -m-6 overflow-x-hidden">
      {/* Command Header - Unified Top Bar */}
      <CommandHeader
        taller={taller}
        marca={marca}
        modelo={modelo}
        range={range}
        isOverload={isOverload}
        onTallerChange={setTaller}
        onMarcaChange={setMarca}
        onModeloChange={setModelo}
        onRangeChange={setRange}
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

        {/* Main Canvas - Asymmetric Layout */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Hero Chart (9 cols) */}
          <motion.div
            className="lg:col-span-9 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <HeroChart data={chartData} range={range} />
          </motion.div>

          {/* Right Column: Operational Panel (3 cols) */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <OperationalPanel recommendations={recommendations} />
          </motion.div>
        </div>

        {/* Footer: Comparative Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <ComparativeFooter comparisons={historicalComparisons} />
        </motion.div>
      </div>
    </div>
  )
}
