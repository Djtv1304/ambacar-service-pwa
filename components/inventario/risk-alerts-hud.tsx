"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  TrendingDown,
  Package,
  Clock,
  ChevronRight,
  Zap,
  ShoppingCart,
  AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RiskAlert, RiskLevel } from "@/lib/fixtures/smart-inventory"

interface RiskAlertsHUDProps {
  alerts: RiskAlert[]
  onAddToOrder?: (alert: RiskAlert) => void
  onViewDetails?: (alert: RiskAlert) => void
}

const riskConfig: Record<RiskLevel, {
  gradient: string
  border: string
  icon: typeof AlertTriangle
  iconColor: string
  badge: string
  badgeText: string
  pulse: boolean
}> = {
  critical: {
    gradient: "from-red-500/10 via-red-500/5 to-transparent dark:from-red-500/20 dark:via-red-500/10",
    border: "border-red-500/50 dark:border-red-500/30",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    badge: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/30",
    badgeText: "Crítico",
    pulse: true,
  },
  warning: {
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent dark:from-orange-500/20 dark:via-orange-500/10",
    border: "border-orange-500/50 dark:border-orange-500/30",
    icon: AlertCircle,
    iconColor: "text-orange-500",
    badge: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/30",
    badgeText: "Alerta",
    pulse: false,
  },
  optimal: {
    gradient: "from-green-500/10 via-green-500/5 to-transparent dark:from-green-500/20 dark:via-green-500/10",
    border: "border-green-500/50 dark:border-green-500/30",
    icon: Package,
    iconColor: "text-green-500",
    badge: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/30",
    badgeText: "Óptimo",
    pulse: false,
  },
  overstock: {
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-500/20 dark:via-blue-500/10",
    border: "border-blue-500/50 dark:border-blue-500/30",
    icon: TrendingDown,
    iconColor: "text-blue-500",
    badge: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/30",
    badgeText: "Exceso",
    pulse: false,
  },
}

function RiskAlertCard({
  alert,
  index,
  onAddToOrder,
  onViewDetails
}: {
  alert: RiskAlert
  index: number
  onAddToOrder?: (alert: RiskAlert) => void
  onViewDetails?: (alert: RiskAlert) => void
}) {
  const config = riskConfig[alert.riskLevel]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "relative overflow-hidden rounded-xl border-2 bg-white dark:bg-gray-950 shadow-lg",
        "min-w-[320px] max-w-[400px] flex-shrink-0",
        config.border
      )}
    >
      {/* Gradient Background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br pointer-events-none",
        config.gradient
      )} />

      {/* Pulsing indicator for critical alerts */}
      {config.pulse && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        </div>
      )}

      <div className="relative p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            "bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800"
          )}>
            <Icon className={cn("h-5 w-5", config.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn("text-[10px] font-bold", config.badge)}>
                {config.badgeText}
              </Badge>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {alert.confianzaPrediccion}% confianza
              </span>
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
              {alert.title}
            </h3>
          </div>
        </div>

        {/* Part Info */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Repuesto</span>
            <span className="text-xs font-mono text-gray-500">{alert.partSku}</span>
          </div>
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {alert.partName}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
              Stock Actual
            </p>
            <p className={cn(
              "text-xl font-bold",
              alert.riskLevel === "critical" ? "text-red-600 dark:text-red-400" :
              alert.riskLevel === "warning" ? "text-orange-600 dark:text-orange-400" :
              "text-gray-900 dark:text-gray-100"
            )}>
              {alert.stockActual}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
              Demanda 7d
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {alert.demandaPredicha}
            </p>
          </div>
        </div>

        {/* Days until stockout */}
        {alert.diasParaQuiebre !== null && alert.riskLevel !== "overstock" && (
          <div className={cn(
            "flex items-center gap-2 rounded-lg p-2.5",
            alert.diasParaQuiebre <= 5
              ? "bg-red-50 dark:bg-red-900/20"
              : "bg-orange-50 dark:bg-orange-900/20"
          )}>
            <Clock className={cn(
              "h-4 w-4",
              alert.diasParaQuiebre <= 5
                ? "text-red-600 dark:text-red-400"
                : "text-orange-600 dark:text-orange-400"
            )} />
            <span className={cn(
              "text-xs font-medium",
              alert.diasParaQuiebre <= 5
                ? "text-red-700 dark:text-red-300"
                : "text-orange-700 dark:text-orange-300"
            )}>
              {alert.diasParaQuiebre} días hasta quiebre de stock
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {alert.description}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {alert.riskLevel !== "overstock" && (
            <Button
              size="sm"
              className={cn(
                "flex-1 gap-1.5 text-xs h-8",
                alert.riskLevel === "critical"
                  ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  : "bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
              )}
              onClick={() => onAddToOrder?.(alert)}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Añadir a Pedido
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8"
            onClick={() => onViewDetails?.(alert)}
          >
            Ver más
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export function RiskAlertsHUD({ alerts, onAddToOrder, onViewDetails }: RiskAlertsHUDProps) {
  const criticalCount = alerts.filter(a => a.riskLevel === "critical").length
  const warningCount = alerts.filter(a => a.riskLevel === "warning").length

  // Sort alerts: critical first, then warning, then others
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priority: Record<RiskLevel, number> = { critical: 0, warning: 1, optimal: 2, overstock: 3 }
    return priority[a.riskLevel] - priority[b.riskLevel]
  })

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Alertas Predictivas
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Análisis de riesgo basado en IA
            </p>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <Badge variant="outline" className="gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              {criticalCount} Críticos
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline" className="gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800">
              {warningCount} Alertas
            </Badge>
          )}
        </div>
      </div>

      {/* Horizontal scrolling cards */}
      <div className="relative -mx-6 px-6">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          <AnimatePresence>
            {sortedAlerts.map((alert, index) => (
              <RiskAlertCard
                key={alert.id}
                alert={alert}
                index={index}
                onAddToOrder={onAddToOrder}
                onViewDetails={onViewDetails}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
