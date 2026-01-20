"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Recommendation } from "@/lib/fixtures/predictive-data"
import { Calendar, Users, Car, Package } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface RecommendationsProps {
  recommendations: Recommendation[]
}

const iconMap = {
  calendar: Calendar,
  users: Users,
  car: Car,
  package: Package,
}

const severityColors = {
  info: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  warning:
    "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30",
  critical:
    "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <Card
      id="recommendations-section"
      className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
    >
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
          Recomendaciones Operativas
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Acciones sugeridas basadas en la proyección
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => {
          const Icon = iconMap[rec.icon]

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-3"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  rec.severity === "critical"
                    ? "bg-red-500/20 dark:bg-red-500/30"
                    : rec.severity === "warning"
                      ? "bg-yellow-500/20 dark:bg-yellow-500/30"
                      : "bg-blue-500/20 dark:bg-blue-500/30"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    rec.severity === "critical"
                      ? "text-red-600 dark:text-red-400"
                      : rec.severity === "warning"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-blue-600 dark:text-blue-400"
                  }`}
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {rec.message}
                  </p>
                  <Badge variant="outline" className={severityColors[rec.severity]}>
                    {rec.severity === "critical"
                      ? "Crítico"
                      : rec.severity === "warning"
                        ? "Advertencia"
                        : "Info"}
                  </Badge>
                </div>
                {rec.week && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Semana {rec.week}
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}
