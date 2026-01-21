"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createChart, ColorType, LineStyle, LineSeries, AreaSeries } from "lightweight-charts"
import type { IChartApi, ISeriesApi, LineData, AreaData } from "lightweight-charts"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Moon, Sun, Activity, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SmartPart } from "@/lib/fixtures/smart-inventory"

interface ConsumptionTrendsChartProps {
  parts: SmartPart[]
  selectedPartId?: string
  onPartChange?: (partId: string) => void
}

export function ConsumptionTrendsChart({
  parts,
  selectedPartId,
  onPartChange,
}: ConsumptionTrendsChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const historicalSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const predictedSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const criticalAreaRef = useRef<ISeriesApi<"Area"> | null>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [chartTheme, setChartTheme] = useState<"light" | "dark">("dark")
  const [internalSelectedPart, setInternalSelectedPart] = useState<string>(selectedPartId || parts[0]?.id || "")

  const currentPartId = selectedPartId || internalSelectedPart
  const selectedPart = parts.find(p => p.id === currentPartId)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setChartTheme(resolvedTheme === "dark" ? "dark" : "light")
    }
  }, [mounted, resolvedTheme])

  const isDark = chartTheme === "dark"

  const toggleChartTheme = useCallback(() => {
    setChartTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  // Futuristic colors for dark mode
  const chartColors = {
    backgroundColor: isDark ? "#0a0a0f" : "#ffffff",
    textColor: isDark ? "#a1a1aa" : "#71717a",
    gridColor: isDark ? "rgba(39, 39, 42, 0.5)" : "rgba(228, 228, 231, 0.5)",
    historicalLineColor: isDark ? "#06b6d4" : "#0891b2", // Cyan
    predictedLineColor: isDark ? "#f97316" : "#ea580c", // Orange
    criticalAreaColor: isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)",
    criticalLineColor: isDark ? "rgba(239, 68, 68, 0.5)" : "rgba(239, 68, 68, 0.4)",
  }

  const handlePartChange = (partId: string) => {
    setInternalSelectedPart(partId)
    onPartChange?.(partId)
  }

  useEffect(() => {
    if (!chartContainerRef.current || !mounted || !selectedPart) return

    const chart = createChart(chartContainerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: chartColors.backgroundColor },
        textColor: chartColors.textColor,
      },
      grid: {
        vertLines: { color: chartColors.gridColor },
        horzLines: { color: chartColors.gridColor },
      },
      timeScale: {
        borderColor: chartColors.gridColor,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      rightPriceScale: {
        borderColor: chartColors.gridColor,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: isDark ? "#52525b" : "#a1a1aa",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: chartColors.historicalLineColor,
        },
        horzLine: {
          color: isDark ? "#52525b" : "#a1a1aa",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: chartColors.historicalLineColor,
        },
      },
    })

    chartRef.current = chart

    // Split data
    const historicalData = selectedPart.consumptionHistory
      .filter(d => d.type === "historical")
      .map(d => ({ time: d.date as any, value: d.consumed }))

    const predictedData = selectedPart.consumptionHistory
      .filter(d => d.type === "predicted")
      .map(d => ({ time: d.date as any, value: d.consumed }))

    // Add last historical point to predicted for continuity
    if (historicalData.length > 0 && predictedData.length > 0) {
      predictedData.unshift(historicalData[historicalData.length - 1])
    }

    // Critical stock area (below minimum threshold)
    const criticalAreaData = selectedPart.consumptionHistory.map(d => ({
      time: d.date as any,
      value: selectedPart.umbralMinimo / 7, // Daily threshold
    }))

    // Create critical area series
    const criticalArea = chart.addSeries(AreaSeries, {
      lineColor: chartColors.criticalLineColor,
      topColor: chartColors.criticalAreaColor,
      bottomColor: "transparent",
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
    })
    criticalAreaRef.current = criticalArea
    criticalArea.setData(criticalAreaData as AreaData[])

    // Create historical series
    const historicalSeries = chart.addSeries(LineSeries, {
      color: chartColors.historicalLineColor,
      lineWidth: 3,
      lineStyle: LineStyle.Solid,
      title: "Consumo Real",
      priceFormat: {
        type: "custom",
        formatter: (price: number) => price.toFixed(1),
      },
    })
    historicalSeriesRef.current = historicalSeries
    historicalSeries.setData(historicalData as LineData[])

    // Create predicted series
    const predictedSeries = chart.addSeries(LineSeries, {
      color: chartColors.predictedLineColor,
      lineWidth: 3,
      lineStyle: LineStyle.Dashed,
      title: "Predicción IA",
      priceFormat: {
        type: "custom",
        formatter: (price: number) => price.toFixed(1),
      },
    })
    predictedSeriesRef.current = predictedSeries
    predictedSeries.setData(predictedData as LineData[])

    chart.timeScale().fitContent()

    return () => {
      chart.remove()
    }
  }, [currentPartId, mounted, chartTheme, selectedPart])

  // Update colors when theme changes
  useEffect(() => {
    if (!chartRef.current || !mounted) return

    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: chartColors.backgroundColor },
        textColor: chartColors.textColor,
      },
      grid: {
        vertLines: { color: chartColors.gridColor },
        horzLines: { color: chartColors.gridColor },
      },
    })

    historicalSeriesRef.current?.applyOptions({ color: chartColors.historicalLineColor })
    predictedSeriesRef.current?.applyOptions({ color: chartColors.predictedLineColor })
    criticalAreaRef.current?.applyOptions({
      lineColor: chartColors.criticalLineColor,
      topColor: chartColors.criticalAreaColor,
    })
  }, [chartTheme, mounted])

  if (!selectedPart) return null

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border shadow-lg",
        isDark
          ? "border-gray-800 bg-[#0a0a0f]"
          : "border-gray-200 bg-white"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b px-4 py-3",
          isDark
            ? "border-gray-800 bg-gradient-to-r from-gray-900/80 to-transparent"
            : "border-gray-200 bg-gradient-to-r from-gray-50 to-transparent"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            isDark
              ? "bg-gradient-to-br from-cyan-500 to-cyan-600"
              : "bg-gradient-to-br from-cyan-600 to-cyan-700"
          )}>
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className={cn(
              "text-sm font-bold",
              isDark ? "text-gray-100" : "text-gray-900"
            )}>
              Tendencia de Consumo
            </h3>
            <p className={cn(
              "text-xs",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>
              Histórico 30d + Predicción 14d
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Part Selector */}
          <Select value={currentPartId} onValueChange={handlePartChange}>
            <SelectTrigger className={cn(
              "h-8 w-[180px] text-xs",
              isDark
                ? "border-gray-700 bg-gray-900 text-gray-300"
                : "border-gray-300 bg-white text-gray-700"
            )}>
              <SelectValue placeholder="Seleccionar repuesto" />
            </SelectTrigger>
            <SelectContent className={cn(
              isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
            )}>
              {parts.map(part => (
                <SelectItem
                  key={part.id}
                  value={part.id}
                  className={cn(
                    "text-xs",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  {part.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Theme toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleChartTheme}
            className={cn(
              "h-8 w-8 p-0",
              isDark
                ? "border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Part Stats Bar */}
      <div className={cn(
        "flex flex-wrap items-center gap-4 px-4 py-2 border-b",
        isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"
      )}>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
            Stock:
          </span>
          <span className={cn(
            "text-sm font-bold",
            selectedPart.riskLevel === "critical" ? "text-red-500" :
            selectedPart.riskLevel === "warning" ? "text-orange-500" :
            isDark ? "text-gray-100" : "text-gray-900"
          )}>
            {selectedPart.stockTotal}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
            Demanda 7d:
          </span>
          <span className={cn(
            "text-sm font-bold",
            isDark ? "text-gray-100" : "text-gray-900"
          )}>
            {selectedPart.predictedDemandNextWeek}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
            Confianza:
          </span>
          <Badge variant="outline" className={cn(
            "text-[10px] h-5",
            selectedPart.replenishmentConfidence >= 90
              ? "border-green-500/30 text-green-500"
              : selectedPart.replenishmentConfidence >= 75
                ? "border-yellow-500/30 text-yellow-500"
                : "border-red-500/30 text-red-500"
          )}>
            {selectedPart.replenishmentConfidence}%
          </Badge>
        </div>
        {selectedPart.diasHastaQuiebre !== null && selectedPart.diasHastaQuiebre < 14 && (
          <div className="flex items-center gap-1.5 ml-auto">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs text-red-500 font-medium">
              {selectedPart.diasHastaQuiebre}d hasta quiebre
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="relative">
        <div ref={chartContainerRef} className="w-full h-[300px] sm:h-[350px]" />
      </div>

      {/* Legend */}
      <div className={cn(
        "flex items-center justify-center gap-6 border-t px-4 py-2",
        isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-0.5 w-6 rounded-full",
            isDark ? "bg-cyan-400" : "bg-cyan-600"
          )} />
          <span className={cn(
            "text-xs font-medium",
            isDark ? "text-gray-300" : "text-gray-700"
          )}>
            Consumo Real
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 border-t-2 border-dashed border-orange-500 rounded-full" />
          <span className={cn(
            "text-xs font-medium",
            isDark ? "text-gray-300" : "text-gray-700"
          )}>
            Predicción IA
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-6 bg-red-500/20 border-t border-dashed border-red-500/50 rounded" />
          <span className={cn(
            "text-xs font-medium",
            isDark ? "text-gray-300" : "text-gray-700"
          )}>
            Zona Crítica
          </span>
        </div>
      </div>
    </div>
  )
}
