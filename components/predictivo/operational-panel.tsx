"use client"

import type { Recommendation } from "@/lib/fixtures/predictive-data"
import { Calendar, Users, Car, Package, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface OperationalPanelProps {
  recommendations: Recommendation[]
}

const iconMap = {
  calendar: Calendar,
  users: Users,
  car: Car,
  package: Package,
}

const severityConfig = {
  critical: {
    bgColor: "bg-red-500/10 dark:bg-red-500/20",
    borderColor: "border-l-red-500",
    iconColor: "text-red-600 dark:text-red-400",
    textColor: "text-red-700 dark:text-red-300",
    label: "Crítico",
  },
  warning: {
    bgColor: "bg-yellow-500/10 dark:bg-yellow-500/20",
    borderColor: "border-l-yellow-500",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    textColor: "text-yellow-700 dark:text-yellow-300",
    label: "Advertencia",
  },
  info: {
    bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    borderColor: "border-l-blue-500",
    iconColor: "text-blue-600 dark:text-blue-400",
    textColor: "text-blue-700 dark:text-blue-300",
    label: "Info",
  },
}

export function OperationalPanel({ recommendations }: OperationalPanelProps) {
  return (
    <div
      id="recommendations-panel"
      className="lg:sticky lg:top-24 h-fit overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 shadow-lg backdrop-blur-sm"
    >
      {/* Panel Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 px-4 py-3 sm:px-5 sm:py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">
              Acciones Recomendadas
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Basadas en proyección actual
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-2 sm:space-y-3 p-3 sm:p-5">
        {recommendations.map((rec, index) => {
          const Icon = iconMap[rec.icon]
          const config = severityConfig[rec.severity]

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} bg-white dark:bg-gray-950 p-2.5 sm:p-3 shadow-sm transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                {/* Icon */}
                <div
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-gray-900 shadow-sm`}
                >
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${config.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs sm:text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100">
                    {rec.message}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between gap-2">
                    {rec.week && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Sem. {rec.week}
                      </span>
                    )}
                    <span className={`text-xs font-medium ${config.textColor}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Accent Line */}
              <div
                className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full ${
                  rec.severity === "critical"
                    ? "bg-red-500"
                    : rec.severity === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                }`}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Panel Footer - Model Metrics */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 px-4 py-2.5 sm:px-5 sm:py-3 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Precisión del Modelo</span>
          <span className="font-bold text-green-600 dark:text-green-400">92.5%</span>
        </div>
      </div>
    </div>
  )
}
