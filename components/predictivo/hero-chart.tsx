"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { PredictionDataPoint } from "@/lib/fixtures/predictive-data"
import { createChart, ColorType, LineStyle, LineSeries } from "lightweight-charts"
import type { IChartApi, ISeriesApi, LineData, MouseEventParams } from "lightweight-charts"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, TrendingUp, Calendar } from "lucide-react"

interface HeroChartProps {
  data: PredictionDataPoint[]
  range: "weekly" | "monthly"
}

interface TooltipData {
  date: string
  value: number
  type: "historical" | "projected"
  x: number
  y: number
}

export function HeroChart({ data, range }: HeroChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const historicalSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const projectedSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  const [chartTheme, setChartTheme] = useState<"light" | "dark">("light")

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync chart theme with system theme on mount
  useEffect(() => {
    if (mounted) {
      const systemTheme = resolvedTheme || theme
      setChartTheme(systemTheme === "dark" ? "dark" : "light")
    }
  }, [mounted, resolvedTheme, theme])

  const isDark = chartTheme === "dark"

  // Toggle chart theme independently
  const toggleChartTheme = useCallback(() => {
    setChartTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  // Chart colors based on theme - More vibrant for dark mode
  const chartColors = {
    backgroundColor: isDark ? "#020817" : "#ffffff",
    textColor: isDark ? "#e2e8f0" : "#1e293b",
    gridColor: isDark ? "rgba(30, 41, 59, 0.3)" : "rgba(241, 245, 249, 0.6)",
    historicalLineColor: isDark ? "#60a5fa" : "#3b82f6",
    projectedLineColor: isDark ? "#fb923c" : "#f97316",
  }

  // Format date for tooltip
  const formatTooltipDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("es-EC", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  useEffect(() => {
    if (!chartContainerRef.current || !mounted) return

    // Responsive height
    const isMobile = window.innerWidth < 768
    const chartHeight = isMobile ? 350 : 450

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: chartColors.backgroundColor },
        textColor: chartColors.textColor,
      },
      grid: {
        vertLines: { color: chartColors.gridColor },
        horzLines: { color: chartColors.gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
      timeScale: {
        borderColor: chartColors.gridColor,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: chartColors.gridColor,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: isDark ? "#64748b" : "#94a3b8",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: chartColors.historicalLineColor,
        },
        horzLine: {
          color: isDark ? "#64748b" : "#94a3b8",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: chartColors.historicalLineColor,
        },
      },
    })

    chartRef.current = chart

    // Split data into historical and projected
    const historicalData = data
      .filter((d) => d.type === "historical")
      .map((d) => ({
        time: d.time as any,
        value: d.value,
      }))

    const projectedData = data
      .filter((d) => d.type === "projected")
      .map((d) => ({
        time: d.time as any,
        value: d.value,
      }))

    // Add last historical point to projected data for continuity
    if (historicalData.length > 0 && projectedData.length > 0) {
      const lastHistorical = historicalData[historicalData.length - 1]
      projectedData.unshift(lastHistorical)
    }

    // Create historical series (solid line)
    const historicalSeries = chart.addSeries(LineSeries, {
      color: chartColors.historicalLineColor,
      lineWidth: 3,
      lineStyle: LineStyle.Solid,
      title: "Histórico",
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `${Math.round(price)} servicios`,
      },
    })
    historicalSeriesRef.current = historicalSeries
    historicalSeries.setData(historicalData as LineData[])

    // Create projected series (dashed line) - Vibrant color
    const projectedSeries = chart.addSeries(LineSeries, {
      color: chartColors.projectedLineColor,
      lineWidth: 3,
      lineStyle: LineStyle.Dashed,
      title: "Proyectado",
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `${Math.round(price)} servicios`,
      },
    })
    projectedSeriesRef.current = projectedSeries
    projectedSeries.setData(projectedData as LineData[])

    // Crosshair move handler for custom tooltip
    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (!param.time || !param.point) {
        setTooltipData(null)
        return
      }

      const timeStr = param.time.toString()
      const dataPoint = data.find((d) => d.time === timeStr)

      if (dataPoint && chartContainerRef.current) {
        const containerRect = chartContainerRef.current.getBoundingClientRect()
        setTooltipData({
          date: timeStr,
          value: dataPoint.value,
          type: dataPoint.type,
          x: Math.min(param.point.x, containerRect.width - 180),
          y: param.point.y,
        })
      }
    })

    // Fit content
    chart.timeScale().fitContent()

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        const newIsMobile = window.innerWidth < 768
        const newHeight = newIsMobile ? 350 : 450
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: newHeight,
        })
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [data, mounted, chartTheme])

  // Update chart colors when chart theme changes
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
      timeScale: {
        borderColor: chartColors.gridColor,
      },
      rightPriceScale: {
        borderColor: chartColors.gridColor,
      },
      crosshair: {
        vertLine: {
          color: isDark ? "#64748b" : "#94a3b8",
          labelBackgroundColor: chartColors.historicalLineColor,
        },
        horzLine: {
          color: isDark ? "#64748b" : "#94a3b8",
          labelBackgroundColor: chartColors.historicalLineColor,
        },
      },
    })

    if (historicalSeriesRef.current) {
      historicalSeriesRef.current.applyOptions({
        color: chartColors.historicalLineColor,
      })
    }

    if (projectedSeriesRef.current) {
      projectedSeriesRef.current.applyOptions({
        color: chartColors.projectedLineColor,
      })
    }
  }, [chartTheme, mounted])

  return (
    <div className="w-full overflow-x-auto">
      <div
        className={`relative overflow-hidden rounded-xl border shadow-sm transition-colors duration-300 min-w-[500px] ${
          isDark
            ? "border-gray-800 bg-gray-950"
            : "border-gray-200 bg-white"
        }`}
      >
        {/* Chart Title - Integrated */}
        <div
          className={`flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4 ${
            isDark
              ? "border-gray-800 bg-gradient-to-r from-gray-900/50 to-transparent"
              : "border-gray-200 bg-gradient-to-r from-gray-50 to-transparent"
          }`}
        >
          <div>
            <h3
              className={`text-base font-semibold sm:text-lg ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Proyección de Demanda
            </h3>
            <p
              className={`text-xs sm:text-sm mt-0.5 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {range === "weekly"
                ? "Últimos 7 días + próximos 7 días"
                : "Últimos 30 días + próximos 30 días"}
            </p>
          </div>

          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleChartTheme}
            className={`gap-2 ${
              isDark
                ? "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">Modo Oscuro</span>
              </>
            )}
          </Button>
        </div>

        {/* Chart Canvas with Tooltip */}
        <div className="relative p-2 sm:p-4">
          <div ref={chartContainerRef} className="w-full" />

          {/* Custom Tracking Tooltip */}
          {tooltipData && (
            <div
              className={`pointer-events-none absolute z-10 min-w-[160px] rounded-lg border p-3 shadow-lg transition-all duration-150 ${
                isDark
                  ? "border-gray-700 bg-gray-900/95 backdrop-blur-sm"
                  : "border-gray-200 bg-white/95 backdrop-blur-sm"
              }`}
              style={{
                left: tooltipData.x + 16,
                top: Math.max(tooltipData.y - 60, 10),
              }}
            >
              {/* Tooltip Header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    tooltipData.type === "projected"
                      ? "bg-orange-500/20"
                      : "bg-blue-500/20"
                  }`}
                >
                  {tooltipData.type === "projected" ? (
                    <TrendingUp
                      className={`h-3 w-3 ${
                        isDark ? "text-orange-400" : "text-orange-600"
                      }`}
                    />
                  ) : (
                    <Calendar
                      className={`h-3 w-3 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                    />
                  )}
                </div>
                <span
                  className={`text-xs font-medium uppercase tracking-wide ${
                    tooltipData.type === "projected"
                      ? isDark
                        ? "text-orange-400"
                        : "text-orange-600"
                      : isDark
                        ? "text-blue-400"
                        : "text-blue-600"
                  }`}
                >
                  {tooltipData.type === "projected" ? "Proyectado" : "Histórico"}
                </span>
              </div>

              {/* Date */}
              <p
                className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {formatTooltipDate(tooltipData.date)}
              </p>

              {/* Value */}
              <p
                className={`text-xl font-bold ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {tooltipData.value}{" "}
                <span
                  className={`text-sm font-normal ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  servicios
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Legend - Bottom Integrated */}
        <div
          className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 border-t px-4 py-2 sm:px-6 sm:py-3 ${
            isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 sm:w-8 bg-blue-500 rounded-full" />
            <span
              className={`text-xs sm:text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Histórico
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 sm:w-8 border-t-2 border-dashed border-orange-500 rounded-full" />
            <span
              className={`text-xs sm:text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Proyectado
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
