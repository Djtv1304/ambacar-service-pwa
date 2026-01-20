"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { QuickStat } from "@/lib/fixtures/predictive-data"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { motion } from "framer-motion"

interface QuickStatsProps {
  stats: QuickStat[]
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
          Estadísticas Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, index) => {
          const isHighValue =
            stat.label === "Pico Máximo Proyectado" &&
            typeof stat.value === "number" &&
            stat.value > 25

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                {stat.trend && (
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      stat.trend === "up"
                        ? "text-green-600 dark:text-green-400"
                        : stat.trend === "down"
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : stat.trend === "down" ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    {stat.change !== undefined && Math.abs(stat.change) > 0 && (
                      <span>{Math.abs(stat.change)}%</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <p
                  className={`text-2xl font-bold ${
                    isHighValue
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {stat.value}
                </p>
                {stat.unit && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.unit}</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}
