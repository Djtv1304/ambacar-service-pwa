"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Brain,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Zap,
  RefreshCw,
  Settings,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { RiskAlertsHUD } from "@/components/inventario/risk-alerts-hud"
import { ConsumptionTrendsChart } from "@/components/inventario/consumption-trends-chart"
import { SmartPartsGrid } from "@/components/inventario/smart-parts-grid"
import {
  smartParts,
  riskAlerts,
  aiModelMetrics,
  type RiskAlert
} from "@/lib/fixtures/smart-inventory"

// KPI Card component
function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
  pulse = false
}: {
  title: string
  value: string
  subtitle: string
  icon: typeof Package
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  variant?: "default" | "warning" | "danger" | "success" | "ai"
  pulse?: boolean
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
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {value}
            </p>
            {trend && trendValue && (
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
  const [selectedPartId, setSelectedPartId] = useState(smartParts[0]?.id)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Calculate KPIs from smart parts
  const kpis = useMemo(() => {
    const totalValue = smartParts.reduce((sum, part) => sum + (part.stockTotal * part.costoPromedio), 0)
    const criticalParts = smartParts.filter(p => p.riskLevel === "critical")
    const potentialLoss = criticalParts.reduce((sum, part) => sum + (part.predictedDemandNextWeek * part.costoPromedio * 1.5), 0)
    const avgConfidence = smartParts.reduce((sum, part) => sum + part.replenishmentConfidence, 0) / smartParts.length
    const partsNeedingReorder = smartParts.filter(p => p.riskLevel === "critical" || p.riskLevel === "warning").length

    return {
      totalValue,
      potentialLoss,
      avgConfidence,
      partsNeedingReorder,
      criticalCount: criticalParts.length,
      totalParts: smartParts.length
    }
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate AI model refresh
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const handleAddToOrder = (alert: RiskAlert) => {
    console.log("Adding to order:", alert.partSku)
    // TODO: Implement order functionality
  }

  const handleViewDetails = (alert: RiskAlert) => {
    setSelectedPartId(alert.partId)
    // Scroll to chart
    document.getElementById("trends-chart")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 -m-6">
      {/* Command Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
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
                    Inventario Inteligente
                  </h1>
                  <Badge
                    variant="outline"
                    className="hidden sm:flex gap-1 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-400"
                  >
                    <Sparkles className="h-3 w-3" />
                    IA v{aiModelMetrics.modelVersion}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Predicciones actualizadas hace {aiModelMetrics.lastTrainingDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Model Performance Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "hidden md:flex gap-1.5",
                  aiModelMetrics.accuracy >= 90
                    ? "border-green-500/30 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10"
                    : "border-yellow-500/30 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10"
                )}
              >
                <TrendingUp className="h-3 w-3" />
                {aiModelMetrics.accuracy}% Precisión
              </Badge>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-1.5"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                <span className="hidden sm:inline">
                  {isRefreshing ? "Actualizando..." : "Actualizar IA"}
                </span>
              </Button>

              {/* Settings Button */}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                asChild
              >
                <a href="/dashboard/configuracion/ia-models">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Configurar</span>
                </a>
              </Button>
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
            title="Valor Inventario"
            value={`$${(kpis.totalValue / 1000).toFixed(1)}K`}
            subtitle={`${kpis.totalParts} repuestos en sistema`}
            icon={DollarSign}
            variant="default"
          />
          <KpiCard
            title="Pérdida Potencial"
            value={`$${(kpis.potentialLoss / 1000).toFixed(1)}K`}
            subtitle="Por quiebre de stock estimado"
            icon={AlertTriangle}
            variant="danger"
            pulse={kpis.criticalCount > 0}
          />
          <KpiCard
            title="Requieren Pedido"
            value={kpis.partsNeedingReorder.toString()}
            subtitle={`${kpis.criticalCount} críticos, ${kpis.partsNeedingReorder - kpis.criticalCount} alerta`}
            icon={Package}
            variant={kpis.criticalCount > 0 ? "warning" : "success"}
          />
          <KpiCard
            title="Confianza IA"
            value={`${kpis.avgConfidence.toFixed(0)}%`}
            subtitle={`Modelo v${aiModelMetrics.modelVersion} • ${aiModelMetrics.dataPointsAnalyzed.toLocaleString()} datos`}
            icon={Brain}
            variant="ai"
            trend="up"
            trendValue="2.3%"
          />
        </motion.div>

        {/* Risk Alerts HUD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <RiskAlertsHUD
            alerts={riskAlerts}
            onAddToOrder={handleAddToOrder}
            onViewDetails={handleViewDetails}
          />
        </motion.div>

        {/* Chart and Analysis Section */}
        <div className="flex flex-wrap gap-6">
          {/* Consumption Trends Chart */}
          <motion.div
            id="trends-chart"
            className="min-w-[300px] flex-[1_1_600px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ConsumptionTrendsChart
              parts={smartParts}
              selectedPartId={selectedPartId}
              onPartChange={setSelectedPartId}
            />
          </motion.div>

          {/* AI Insights Panel */}
          <motion.div
            className="flex-[1_1_280px] xl:flex-[0_0_320px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg h-full">
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
                      Análisis predictivo en tiempo real
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Model Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Precisión del Modelo</span>
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">{aiModelMetrics.accuracy}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${aiModelMetrics.accuracy}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Predicciones
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {aiModelMetrics.predictionsGenerated.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Datos Analizados
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {(aiModelMetrics.dataPointsAnalyzed / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Patrones Detectados
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                      <p className="text-[11px] text-cyan-700 dark:text-cyan-300">
                        Demanda de filtros +23% por temporada de mantenimiento
                      </p>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                      <p className="text-[11px] text-orange-700 dark:text-orange-300">
                        Pastillas de freno correlacionadas con kilometraje OT
                      </p>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                      <p className="text-[11px] text-purple-700 dark:text-purple-300">
                        Aceites sintéticos preferidos por vehículos &gt;2020
                      </p>
                    </div>
                  </div>
                </div>

                {/* Train Model Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 mt-2 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                >
                  <Brain className="h-4 w-4" />
                  Re-entrenar Modelo
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Smart Parts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <SmartPartsGrid
            parts={smartParts}
            onSelectPart={setSelectedPartId}
          />
        </motion.div>
      </div>
    </div>
  )
}
