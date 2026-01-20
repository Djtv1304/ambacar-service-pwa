"use client"

import type { HistoricalComparison } from "@/lib/fixtures/predictive-data"
import { TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { motion } from "framer-motion"

interface ComparativeFooterProps {
  comparisons: HistoricalComparison[]
}

export function ComparativeFooter({ comparisons }: ComparativeFooterProps) {
  const averageVariance =
    comparisons.reduce((sum, c) => sum + c.variance, 0) / comparisons.length

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700">
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
        </div>
        <div>
          <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
            Análisis Histórico Comparativo
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Volumen de servicios: Este año vs año anterior
          </p>
        </div>
      </div>

      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-3">
        {comparisons.map((comparison, index) => {
          const isPositive = comparison.variance > 0
          const isHighVariance = Math.abs(comparison.variance) > 20
          const difference = comparison.currentYear - comparison.previousYear

          return (
            <motion.div
              key={comparison.period}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {comparison.period}
                </span>
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                    isPositive
                      ? isHighVariance
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>
                    {isPositive ? "+" : ""}
                    {comparison.variance.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Values Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">2026</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {comparison.currentYear.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">2025</p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    {comparison.previousYear.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dif.</p>
                  <p
                    className={`text-lg font-semibold ${
                      isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {difference.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Mobile Summary Card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Promedio de Variación
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              +{averageVariance.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Tablet/Desktop: Table Layout */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-4 lg:px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
          <div className="col-span-1">Período</div>
          <div className="text-right">Año 2026</div>
          <div className="text-right">Año 2025</div>
          <div className="text-right">Diferencia</div>
          <div className="text-right">Variación</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {comparisons.map((comparison, index) => {
            const isPositive = comparison.variance > 0
            const isHighVariance = Math.abs(comparison.variance) > 20
            const difference = comparison.currentYear - comparison.previousYear

            return (
              <motion.div
                key={comparison.period}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="grid grid-cols-5 gap-4 px-4 lg:px-6 py-3 lg:py-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors duration-150"
              >
                {/* Period */}
                <div className="col-span-1 flex items-center">
                  <span className="font-semibold text-sm lg:text-base text-gray-900 dark:text-gray-100">
                    {comparison.period}
                  </span>
                </div>

                {/* Current Year */}
                <div className="flex items-center justify-end">
                  <span className="text-lg lg:text-xl font-bold text-blue-600 dark:text-blue-400">
                    {comparison.currentYear.toLocaleString()}
                  </span>
                </div>

                {/* Previous Year */}
                <div className="flex items-center justify-end">
                  <span className="text-base lg:text-lg font-semibold text-gray-600 dark:text-gray-400">
                    {comparison.previousYear.toLocaleString()}
                  </span>
                </div>

                {/* Difference */}
                <div className="flex items-center justify-end">
                  <span
                    className={`text-sm lg:text-base font-semibold ${
                      isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {difference.toLocaleString()}
                  </span>
                </div>

                {/* Variance Badge */}
                <div className="flex items-center justify-end">
                  <div
                    className={`inline-flex items-center gap-1 lg:gap-1.5 rounded-full px-2 lg:px-3 py-1 text-xs lg:text-sm font-bold ${
                      isPositive
                        ? isHighVariance
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                          : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
                    ) : (
                      <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4" />
                    )}
                    <span>
                      {isPositive ? "+" : ""}
                      {comparison.variance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Table Footer - Summary */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-600 dark:text-gray-400">
              Promedio de Variación
            </span>
            <span className="font-bold text-gray-900 dark:text-gray-100">
              +{averageVariance.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
