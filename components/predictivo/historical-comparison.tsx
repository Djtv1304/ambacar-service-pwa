"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { HistoricalComparison } from "@/lib/fixtures/predictive-data"
import { TrendingUp, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"

interface HistoricalComparisonProps {
  comparisons: HistoricalComparison[]
}

export function HistoricalComparisonSection({ comparisons }: HistoricalComparisonProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Análisis Histórico Comparativo
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Comparación del volumen de servicios proyectado vs año anterior
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {comparisons.map((comparison, index) => {
          const isPositive = comparison.variance > 0
          const isHighVariance = Math.abs(comparison.variance) > 20

          return (
            <motion.div
              key={comparison.period}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-base text-gray-900 dark:text-gray-100">
                    {comparison.period}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Volumen total de servicios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Year */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Año Actual (2026)
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {comparison.currentYear.toLocaleString()}
                    </p>
                  </div>

                  {/* Previous Year */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Año Anterior (2025)
                    </p>
                    <p className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
                      {comparison.previousYear.toLocaleString()}
                    </p>
                  </div>

                  {/* Variance */}
                  <div
                    className={`flex items-center justify-between rounded-lg p-3 ${
                      isPositive
                        ? isHighVariance
                          ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                          : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isPositive
                          ? isHighVariance
                            ? "text-orange-700 dark:text-orange-300"
                            : "text-green-700 dark:text-green-300"
                          : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      Variación
                    </span>
                    <div
                      className={`flex items-center gap-1 ${
                        isPositive
                          ? isHighVariance
                            ? "text-orange-700 dark:text-orange-300"
                            : "text-green-700 dark:text-green-300"
                          : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="text-lg font-bold">
                        {isPositive ? "+" : ""}
                        {comparison.variance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
