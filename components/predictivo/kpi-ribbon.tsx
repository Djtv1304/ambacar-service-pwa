"use client"

import type { QuickStat } from "@/lib/fixtures/predictive-data"
import { TrendingUp, TrendingDown, Activity, Target, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface KpiRibbonProps {
  stats: QuickStat[]
}

const iconMap: Record<string, any> = {
  "Proyección Total": Activity,
  "Pico Máximo Proyectado": Target,
  "Precisión del Modelo": Zap,
}

export function KpiRibbon({ stats }: KpiRibbonProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.label] || Activity
        const isHighValue =
          stat.label === "Pico Máximo Proyectado" &&
          typeof stat.value === "number" &&
          stat.value > 25

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Gradient Accent Line */}
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                isHighValue
                  ? "bg-gradient-to-b from-orange-500 to-red-500"
                  : stat.trend === "up"
                    ? "bg-gradient-to-b from-green-400 to-emerald-600"
                    : stat.trend === "down"
                      ? "bg-gradient-to-b from-red-400 to-red-600"
                      : "bg-gradient-to-b from-blue-400 to-blue-600"
              }`}
            />

            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                {/* Label */}
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>

                {/* Value */}
                <div className="flex items-baseline gap-2">
                  <p
                    className={`text-2xl font-bold ${
                      isHighValue
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {stat.value}
                  </p>
                  {stat.unit && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.unit}</p>
                  )}
                </div>
              </div>

              {/* Trend Indicator */}
              {stat.trend && stat.change !== undefined && Math.abs(stat.change) > 0 && (
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                    stat.trend === "up"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : stat.trend === "down"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        : "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : stat.trend === "down" ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  <span>
                    {stat.trend === "up" ? "+" : ""}
                    {Math.abs(stat.change)}%
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
