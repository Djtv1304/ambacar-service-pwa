"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ModelMetrics } from "@/lib/fixtures/predictive-data"
import { RefreshCw, Activity, Clock, Target } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { useState } from "react"

interface ModelConfigProps {
  metrics: ModelMetrics
}

export function ModelConfig({ metrics }: ModelConfigProps) {
  const [isRetraining, setIsRetraining] = useState(false)

  const handleRetrain = async () => {
    setIsRetraining(true)

    // Simulate model retraining API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast.success("Modelo reentrenado", {
      description: "El modelo predictivo ha sido actualizado con los datos más recientes.",
    })

    setIsRetraining(false)

    // TODO: Implement actual model retraining API call
    // await fetch('/api/predictive/retrain', { method: 'POST' })
  }

  return (
    <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
          Configuración del Modelo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Precisión</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {metrics.accuracy}%
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Confianza</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {metrics.confidence}%
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Última actualización
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatDistanceToNow(metrics.lastUpdated, {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Error MAE</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {metrics.maeScore}
            </span>
          </div>
        </div>

        {/* Retrain Button */}
        <Button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="w-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          {isRetraining ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Reentrenando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reentrenar Modelo
            </>
          )}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          El modelo se actualiza automáticamente cada 24 horas
        </p>
      </CardContent>
    </Card>
  )
}
