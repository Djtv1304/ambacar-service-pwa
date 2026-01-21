"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  Snowflake,
  Flame,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Brain,
  Sparkles,
  BarChart3
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { SmartPart, RiskLevel, DemandTrend, PartStatus } from "@/lib/fixtures/smart-inventory"

interface SmartPartsGridProps {
  parts: SmartPart[]
  onAddToOrder?: (part: SmartPart) => void
  onViewTrend?: (part: SmartPart) => void
}

const statusConfig: Record<PartStatus, {
  label: string
  icon: typeof TrendingUp
  color: string
  bg: string
}> = {
  reorder_now: {
    label: "Reordenar Ya",
    icon: Flame,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
  monitor: {
    label: "Monitorear",
    icon: TrendingDown,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
  optimal: {
    label: "Óptimo",
    icon: TrendingUp,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  stagnant: {
    label: "Estancado",
    icon: Snowflake,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  excess: {
    label: "Exceso",
    icon: Minus,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
}

const trendConfig: Record<DemandTrend, {
  label: string
  icon: typeof TrendingUp
  color: string
}> = {
  accelerating: {
    label: "Acelerando",
    icon: TrendingUp,
    color: "text-red-500",
  },
  stable: {
    label: "Estable",
    icon: Minus,
    color: "text-gray-500",
  },
  declining: {
    label: "Decreciendo",
    icon: TrendingDown,
    color: "text-blue-500",
  },
  seasonal: {
    label: "Estacional",
    icon: Sparkles,
    color: "text-purple-500",
  },
}

function ProbabilityCircle({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const circumference = 2 * Math.PI * (size === "sm" ? 16 : 20)
  const strokeDashoffset = circumference - (value / 100) * circumference

  const getColor = (v: number) => {
    if (v >= 80) return "text-red-500"
    if (v >= 60) return "text-orange-500"
    if (v >= 40) return "text-yellow-500"
    return "text-green-500"
  }

  const dimensions = size === "sm" ? { w: 40, h: 40, r: 16, cx: 20, cy: 20 } : { w: 52, h: 52, r: 20, cx: 26, cy: 26 }

  return (
    <div className="relative" style={{ width: dimensions.w, height: dimensions.h }}>
      <svg className="transform -rotate-90" width={dimensions.w} height={dimensions.h}>
        <circle
          cx={dimensions.cx}
          cy={dimensions.cy}
          r={dimensions.r}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-gray-200 dark:text-gray-800"
        />
        <circle
          cx={dimensions.cx}
          cy={dimensions.cy}
          r={dimensions.r}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-500", getColor(value))}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          "font-bold",
          size === "sm" ? "text-[10px]" : "text-xs",
          getColor(value)
        )}>
          {value}%
        </span>
      </div>
    </div>
  )
}

function SmartPartRow({
  part,
  index,
  onAddToOrder,
  onViewTrend
}: {
  part: SmartPart
  index: number
  onAddToOrder?: (part: SmartPart) => void
  onViewTrend?: (part: SmartPart) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const status = statusConfig[part.status]
  const trend = trendConfig[part.demandTrend]
  const StatusIcon = status.icon
  const TrendIcon = trend.icon

  const needsAction = part.urgenciaPedido === "immediate" || part.urgenciaPedido === "this_week"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div
          className={cn(
            "group border rounded-xl overflow-hidden transition-all duration-200",
            "bg-white dark:bg-gray-950",
            part.riskLevel === "critical"
              ? "border-red-300 dark:border-red-800 shadow-red-100 dark:shadow-red-900/20 shadow-md"
              : part.riskLevel === "warning"
                ? "border-orange-200 dark:border-orange-900 shadow-orange-50 dark:shadow-orange-900/10 shadow-sm"
                : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700",
            needsAction && "ring-1 ring-inset ring-red-500/20"
          )}
        >
          {/* Main Row */}
          <div className="p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Part Info */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    {part.sku}
                  </span>
                  <Badge variant="outline" className="text-[10px] h-4">
                    {part.categoria}
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {part.nombre}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {part.marca} • {part.compatibleWith.slice(0, 2).join(", ")}
                  {part.compatibleWith.length > 2 && ` +${part.compatibleWith.length - 2}`}
                </p>
              </div>

              {/* Stock Comparison */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-0.5">
                    Actual
                  </p>
                  <p className={cn(
                    "text-lg font-bold",
                    part.riskLevel === "critical" ? "text-red-600 dark:text-red-400" :
                    part.riskLevel === "warning" ? "text-orange-600 dark:text-orange-400" :
                    "text-gray-900 dark:text-gray-100"
                  )}>
                    {part.stockTotal}
                  </p>
                </div>
                <div className="text-gray-300 dark:text-gray-700">→</div>
                <div className="text-center">
                  <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1">
                    <Brain className="h-2.5 w-2.5" />
                    Óptimo IA
                  </p>
                  <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    {part.stockOptimoIA}
                  </p>
                </div>
              </div>

              {/* Probability Circle */}
              <div className="hidden sm:flex flex-col items-center">
                <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-1">
                  Prob. Uso
                </p>
                <ProbabilityCircle value={part.probabilidadUso} />
              </div>

              {/* Trend */}
              <div className="hidden md:flex items-center gap-1.5">
                <TrendIcon className={cn("h-4 w-4", trend.color)} />
                <span className={cn("text-xs font-medium", trend.color)}>
                  {trend.label}
                </span>
              </div>

              {/* Status */}
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
                status.bg
              )}>
                <StatusIcon className={cn("h-3.5 w-3.5", status.color)} />
                <span className={cn("text-xs font-semibold", status.color)}>
                  {status.label}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {needsAction && (
                  <Button
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 text-xs",
                      part.urgenciaPedido === "immediate"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-orange-600 hover:bg-orange-700"
                    )}
                    onClick={() => onAddToOrder?.(part)}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {part.urgenciaPedido === "immediate" ? "Pedir Ya" : "Añadir"}
                    </span>
                  </Button>
                )}
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          <CollapsibleContent>
            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Demanda 7d
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {part.predictedDemandNextWeek}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Demanda 30d
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {part.predictedDemandNextMonth}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Confianza IA
                  </p>
                  <div className="flex items-center gap-2">
                    <Progress value={part.replenishmentConfidence} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{part.replenishmentConfidence}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Factor Estacional
                  </p>
                  <p className={cn(
                    "text-lg font-bold",
                    part.seasonalFactor > 1.1 ? "text-orange-500" :
                    part.seasonalFactor < 0.9 ? "text-blue-500" :
                    "text-gray-900 dark:text-gray-100"
                  )}>
                    {part.seasonalFactor.toFixed(1)}x
                  </p>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className={cn(
                "rounded-lg p-3 mb-4",
                "bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20",
                "border border-cyan-200 dark:border-cyan-800"
              )}>
                <div className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1">
                      Recomendación IA
                    </p>
                    <p className="text-xs text-cyan-800 dark:text-cyan-200">
                      {part.razonRecomendacion}
                    </p>
                    {part.cantidadRecomendadaPedido > 0 && (
                      <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300 mt-2">
                        Cantidad sugerida: <span className="font-bold">{part.cantidadRecomendadaPedido} unidades</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock by location */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {part.stockByLocation.map(loc => (
                  <div
                    key={loc.sucursal}
                    className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border border-gray-200 dark:border-gray-800"
                  >
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                      {loc.sucursal}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {loc.disponible}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        disp.
                      </span>
                      {loc.reservado > 0 && (
                        <span className="text-[10px] text-orange-500 ml-1">
                          ({loc.reservado} res.)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => onViewTrend?.(part)}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Ver Tendencia
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
  )
}

export function SmartPartsGrid({ parts, onAddToOrder, onViewTrend }: SmartPartsGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategoria, setFilterCategoria] = useState<string>("todas")
  const [filterRisk, setFilterRisk] = useState<string>("todos")
  const [sortBy, setSortBy] = useState<string>("risk")

  const categorias = Array.from(new Set(parts.map(p => p.categoria)))

  const filteredParts = parts
    .filter(part => {
      const matchesSearch = searchQuery === "" ||
        part.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.marca.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategoria = filterCategoria === "todas" || part.categoria === filterCategoria
      const matchesRisk = filterRisk === "todos" || part.riskLevel === filterRisk

      return matchesSearch && matchesCategoria && matchesRisk
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "risk":
          const riskOrder: Record<RiskLevel, number> = { critical: 0, warning: 1, optimal: 2, overstock: 3 }
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
        case "probability":
          return b.probabilidadUso - a.probabilidadUso
        case "stock":
          return a.stockTotal - b.stockTotal
        case "name":
          return a.nombre.localeCompare(b.nombre)
        default:
          return 0
      }
    })

  const criticalCount = parts.filter(p => p.riskLevel === "critical").length
  const warningCount = parts.filter(p => p.riskLevel === "warning").length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Inventario Inteligente
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {parts.length} repuestos • {criticalCount} críticos • {warningCount} en alerta
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Brain className="h-3 w-3" />
            Modelo v2.4.1
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, SKU o marca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las categorías</SelectItem>
            {categorias.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRisk} onValueChange={setFilterRisk}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Riesgo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="warning">Alerta</SelectItem>
            <SelectItem value="optimal">Óptimo</SelectItem>
            <SelectItem value="overstock">Exceso</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="risk">Por Riesgo</SelectItem>
            <SelectItem value="probability">Por Probabilidad</SelectItem>
            <SelectItem value="stock">Por Stock</SelectItem>
            <SelectItem value="name">Por Nombre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredParts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Package className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No se encontraron repuestos con los filtros aplicados
              </p>
            </motion.div>
          ) : (
            filteredParts.map((part, index) => (
              <SmartPartRow
                key={part.id}
                part={part}
                index={index}
                onAddToOrder={onAddToOrder}
                onViewTrend={onViewTrend}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
