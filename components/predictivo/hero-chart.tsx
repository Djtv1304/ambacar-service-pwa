"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { PredictionDataPoint } from "@/lib/fixtures/predictive-data"
import type { GraficaTradingView } from "@/lib/api/predictivo"
import { createChart, ColorType, LineStyle, LineSeries } from "lightweight-charts"
import type { IChartApi, ISeriesApi, LineData, MouseEventParams } from "lightweight-charts"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, TrendingUp, Calendar, Loader2 } from "lucide-react"

interface HeroChartProps {
  /** Legacy data format for fixtures */
  data?: PredictionDataPoint[]
  /** API data format from grafica_tradingview */
  apiData?: GraficaTradingView | null
  range: "weekly" | "monthly"
  periods?: number
  isLoading?: boolean
}

interface TooltipData {
  date: string
  value: number
  type: "historical" | "projected"
  x: number
  y: number
}

export function HeroChart({ data, apiData, range, periods = 1, isLoading = false }: HeroChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRefs = useRef<Map<string, ISeriesApi<"Line">>>(new Map())
  const { theme, resolvedTheme } = useTheme()
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
    if (!chartContainerRef.current || !mounted || isLoading) return

    // Need either legacy data or API data
    if (!data && !apiData) return

    // Create chart instance with autoSize for native responsive behavior
    const chart = createChart(chartContainerRef.current, {
      autoSize: true, // Native responsive - chart adjusts to container
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
        fixLeftEdge: true, // Prevent scrolling past left edge
        fixRightEdge: true, // Prevent scrolling past right edge
        lockVisibleTimeRangeOnResize: true, // Maintain visible range on resize
      },
      rightPriceScale: {
        borderColor: chartColors.gridColor,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false, // Allow page scroll on vertical touch
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
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
    seriesRefs.current.clear()

    // Use API data if available, otherwise fall back to legacy format
    if (apiData && apiData.series && apiData.series.length > 0) {
      // Create series from API data
      apiData.series.forEach((seriesConfig) => {
        const lineStyle = seriesConfig.options.lineStyle === 2 ? LineStyle.Dashed : LineStyle.Solid

        const series = chart.addSeries(LineSeries, {
          color: seriesConfig.options.color,
          lineWidth: seriesConfig.options.lineWidth || 2,
          lineStyle: lineStyle,
          title: seriesConfig.options.title,
          priceFormat: {
            type: "custom",
            formatter: (price: number) => `${Math.round(price)}`,
          },
        })

        // Transform data to LineData format
        const lineData = seriesConfig.data.map((d) => ({
          time: d.time as any,
          value: d.value,
        }))

        series.setData(lineData as LineData[])
        seriesRefs.current.set(seriesConfig.id, series)
      })

      // Crosshair move handler for API data
      chart.subscribeCrosshairMove((param: MouseEventParams) => {
        if (!param.time || !param.point) {
          setTooltipData(null)
          return
        }

        const timeStr = param.time.toString()

        // Find value from prediccion series (main line)
        const prediccionSeries = apiData.series.find(s => s.id === "prediccion")
        const dataPoint = prediccionSeries?.data.find((d) => d.time === timeStr)

        if (dataPoint && chartContainerRef.current) {
          const containerRect = chartContainerRef.current.getBoundingClientRect()
          setTooltipData({
            date: timeStr,
            value: dataPoint.value,
            type: "projected",
            x: Math.min(param.point.x, containerRect.width - 180),
            y: param.point.y,
          })
        }
      })
    } else if (data) {
      // Legacy format handling
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
          formatter: (price: number) => `${Math.round(price)}`,
        },
      })
      seriesRefs.current.set("historical", historicalSeries)
      historicalSeries.setData(historicalData as LineData[])

      // Create projected series (dashed line) - Vibrant color
      const projectedSeries = chart.addSeries(LineSeries, {
        color: chartColors.projectedLineColor,
        lineWidth: 3,
        lineStyle: LineStyle.Dashed,
        title: "Proyectado",
        priceFormat: {
          type: "custom",
          formatter: (price: number) => `${Math.round(price)}`,
        },
      })
      seriesRefs.current.set("projected", projectedSeries)
      projectedSeries.setData(projectedData as LineData[])

      // Crosshair move handler for legacy data
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
    }

    // Fit all content into visible area
    chart.timeScale().fitContent()

    // Cleanup
    return () => {
      chart.remove()
    }
  }, [data, apiData, mounted, chartTheme, isLoading])

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

    // Update legacy series colors if they exist
    const historicalSeries = seriesRefs.current.get("historical")
    if (historicalSeries) {
      historicalSeries.applyOptions({
        color: chartColors.historicalLineColor,
      })
    }

    const projectedSeries = seriesRefs.current.get("projected")
    if (projectedSeries) {
      projectedSeries.applyOptions({
        color: chartColors.projectedLineColor,
      })
    }
  }, [chartTheme, mounted])

  return (
    <div
      className={`relative overflow-hidden rounded-xl border shadow-sm transition-colors duration-300 ${
        isDark
          ? "border-gray-800 bg-gray-950"
          : "border-gray-200 bg-white dark:border-border dark:bg-card"
      }`}
    >
      {/* Chart Title - Integrated */}
      <div
        className={`flex items-center justify-between border-b px-3 py-2 sm:px-4 sm:py-3 ${
          isDark
            ? "border-gray-800 bg-gradient-to-r from-gray-900/50 to-transparent"
            : "border-gray-200 bg-gradient-to-r from-gray-50 to-transparent dark:border-border dark:bg-gradient-to-r dark:from-muted dark:to-transparent"
        }`}
      >
        <div className="min-w-0 flex-1">
          <h3
            className={`text-sm font-semibold sm:text-base ${
              isDark ? "text-gray-100" : "text-gray-900 dark:text-foreground"
            }`}
          >
            Proyección de Demanda
          </h3>
          <p
            className={`text-[10px] sm:text-xs mt-0.5 ${
              isDark ? "text-gray-400" : "text-gray-600 dark:text-muted-foreground"
            }`}
          >
            {range === "weekly"
              ? `Proyección: ${periods} ${periods === 1 ? "semana" : "semanas"}`
              : `Proyección: ${periods} ${periods === 1 ? "mes" : "meses"}`
            }
          </p>
        </div>

        {/* Theme Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleChartTheme}
          className={`h-7 px-2 gap-1.5 shrink-0 ${
            isDark
              ? "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted"
          }`}
        >
          {isDark ? (
            <>
              <Sun className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Claro</span>
            </>
          ) : (
            <>
              <Moon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Oscuro</span>
            </>
          )}
        </Button>
      </div>

      {/* Chart Canvas with Tooltip - Fixed height for autoSize */}
      <div className="relative">
        <div ref={chartContainerRef} className="w-full h-[280px] sm:h-[350px] lg:h-[400px]" />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Cargando predicciones...
              </span>
            </div>
          </div>
        )}

        {/* Custom Tracking Tooltip */}
        {tooltipData && (
          <div
            className={`pointer-events-none absolute z-10 min-w-[140px] rounded-lg border p-2 shadow-lg transition-all duration-150 ${
              isDark
                ? "border-gray-700 bg-gray-900/95 backdrop-blur-sm"
                : "border-gray-200 bg-white/95 backdrop-blur-sm dark:border-border dark:bg-card/95"
            }`}
            style={{
              left: Math.min(tooltipData.x + 12, (chartContainerRef.current?.clientWidth || 300) - 160),
              top: Math.max(tooltipData.y - 50, 10),
            }}
          >
            {/* Tooltip Header */}
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  tooltipData.type === "projected"
                    ? "bg-orange-500/20"
                    : "bg-blue-500/20"
                }`}
              >
                {tooltipData.type === "projected" ? (
                  <TrendingUp
                    className={`h-2.5 w-2.5 ${
                      isDark ? "text-orange-400" : "text-orange-600"
                    }`}
                  />
                ) : (
                  <Calendar
                    className={`h-2.5 w-2.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium uppercase tracking-wide ${
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
              className={`text-[10px] mb-0.5 ${isDark ? "text-gray-400" : "text-gray-500 dark:text-muted-foreground"}`}
            >
              {formatTooltipDate(tooltipData.date)}
            </p>

            {/* Value */}
            <p
              className={`text-base font-bold ${
                isDark ? "text-gray-100" : "text-gray-900 dark:text-foreground"
              }`}
            >
              {tooltipData.value}{" "}
              <span
                className={`text-xs font-normal ${
                  isDark ? "text-gray-400" : "text-gray-500 dark:text-muted-foreground"
                }`}
              >
                serv.
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Legend - Bottom Integrated */}
      <div
        className={`flex items-center justify-center gap-4 border-t px-3 py-1.5 sm:px-4 sm:py-2 ${
          isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50 dark:border-border dark:bg-muted"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-5 bg-blue-500 rounded-full" />
          <span
            className={`text-[10px] sm:text-xs font-medium ${
              isDark ? "text-gray-300" : "text-gray-700 dark:text-foreground"
            }`}
          >
            Histórico
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-5 border-t-2 border-dashed border-orange-500 rounded-full" />
          <span
            className={`text-[10px] sm:text-xs font-medium ${
              isDark ? "text-gray-300" : "text-gray-700 dark:text-foreground"
            }`}
          >
            Proyectado
          </span>
        </div>
      </div>
    </div>
  )
}
