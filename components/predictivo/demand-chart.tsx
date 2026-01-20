"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { PredictionDataPoint } from "@/lib/fixtures/predictive-data"
import { createChart, ColorType, LineStyle, LineSeries } from "lightweight-charts"
import type { IChartApi, ISeriesApi, LineData } from "lightweight-charts"
import { useTheme } from "next-themes"

interface DemandChartProps {
  data: PredictionDataPoint[]
  range: "weekly" | "monthly"
  onRangeChange: (range: "weekly" | "monthly") => void
}

export function DemandChart({ data, range, onRangeChange }: DemandChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const historicalSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const projectedSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine current theme
  const currentTheme = mounted ? resolvedTheme || theme : "light"
  const isDark = currentTheme === "dark"

  // Chart colors based on theme
  const chartColors = {
    backgroundColor: isDark ? "#020817" : "#ffffff",
    textColor: isDark ? "#e2e8f0" : "#1e293b",
    gridColor: isDark ? "#1e293b" : "#f1f5f9",
    historicalLineColor: "#3b82f6", // Blue
    projectedLineColor: "#f59e0b", // Orange/Amber
  }

  useEffect(() => {
    if (!chartContainerRef.current || !mounted) return

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
      height: 400,
      timeScale: {
        borderColor: chartColors.gridColor,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: chartColors.gridColor,
      },
      crosshair: {
        mode: 1, // Normal crosshair mode
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
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      title: "Histórico",
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `${Math.round(price)} servicios`,
      },
    })
    historicalSeriesRef.current = historicalSeries
    historicalSeries.setData(historicalData as LineData[])

    // Create projected series (dashed line)
    const projectedSeries = chart.addSeries(LineSeries, {
      color: chartColors.projectedLineColor,
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      title: "Proyectado",
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `${Math.round(price)} servicios`,
      },
    })
    projectedSeriesRef.current = projectedSeries
    projectedSeries.setData(projectedData as LineData[])

    // Fit content
    chart.timeScale().fitContent()

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current)
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [data, mounted])

  // Update chart colors when theme changes
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
  }, [currentTheme, mounted])

  return (
    <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Proyección de Demanda
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {range === "weekly"
                ? "Últimos 7 días + próximos 7 días"
                : "Últimos 30 días + próximos 30 días"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={range === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => onRangeChange("weekly")}
              className={
                range === "weekly"
                  ? "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                  : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }
            >
              Semanal
            </Button>
            <Button
              variant={range === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => onRangeChange("monthly")}
              className={
                range === "monthly"
                  ? "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                  : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }
            >
              Mensual
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} className="w-full" />

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-blue-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Histórico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 border-t-2 border-dashed border-orange-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Proyectado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
