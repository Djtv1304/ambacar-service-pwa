"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Brain,
  Cpu,
  Database,
  TrendingUp,
  Settings,
  RefreshCw,
  Save,
  Clock,
  Zap,
  Activity,
  BarChart3,
  Layers,
  Target,
  Sparkles,
  Play,
  Pause
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  aiModelMetrics,
  recommenderConfig,
  type RecommenderConfig
} from "@/lib/fixtures/smart-inventory"

// Metric Card Component
function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  description,
  variant = "default"
}: {
  label: string
  value: string
  icon: typeof Activity
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  description?: string
  variant?: "default" | "success" | "warning" | "danger" | "ai"
}) {
  const variantStyles = {
    default: "border-gray-200 dark:border-gray-800",
    success: "border-green-500/30",
    warning: "border-orange-500/30",
    danger: "border-red-500/30",
    ai: "border-cyan-500/30"
  }

  const iconStyles = {
    default: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    success: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
    warning: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400",
    danger: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
    ai: "bg-gradient-to-br from-cyan-500 to-purple-600 text-white"
  }

  return (
    <div className={cn(
      "rounded-xl border bg-white dark:bg-gray-950 p-4 shadow-sm",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          iconStyles[variant]
        )}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && trendValue && (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              trend === "up" ? "text-green-600 border-green-200 dark:border-green-800" :
              trend === "down" ? "text-red-600 border-red-200 dark:border-red-800" :
              "text-gray-500 border-gray-200 dark:border-gray-800"
            )}
          >
            {trend === "up" ? "+" : trend === "down" ? "-" : ""}{trendValue}
          </Badge>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {description && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}

// Training Progress Component
function TrainingProgress({ progress, status }: { progress: number; status: "idle" | "training" | "completed" | "error" }) {
  const statusConfig = {
    idle: { color: "bg-gray-200 dark:bg-gray-700", text: "En espera", icon: Clock },
    training: { color: "bg-cyan-500", text: "Entrenando...", icon: RefreshCw },
    completed: { color: "bg-green-500", text: "Completado", icon: CheckCircle },
    error: { color: "bg-red-500", text: "Error", icon: AlertTriangle }
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn(
            "h-4 w-4",
            status === "training" && "animate-spin",
            status === "completed" && "text-green-500",
            status === "error" && "text-red-500"
          )} />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {config.text}
          </span>
        </div>
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
          {progress}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className={cn("h-full rounded-full", config.color)}
        />
      </div>
    </div>
  )
}

export default function IAModelsConfigPage() {
  const [config, setConfig] = useState<RecommenderConfig>(recommenderConfig)
  const [trainingStatus, setTrainingStatus] = useState<"idle" | "training" | "completed" | "error">("idle")
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("metrics")

  const handleStartTraining = async () => {
    setTrainingStatus("training")
    setTrainingProgress(0)

    // Simulate training progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setTrainingProgress(i)
    }

    setTrainingStatus("completed")
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
  }

  const updateConfig = (key: keyof RecommenderConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 -m-6">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 shadow-lg shadow-purple-500/20">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                    Laboratorio de IA
                  </h1>
                  <Badge
                    variant="outline"
                    className="hidden sm:flex gap-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400"
                  >
                    <Sparkles className="h-3 w-3" />
                    Avanzado
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Configuración del modelo de predicción de demanda
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="gap-1.5"
              >
                <Save className={cn("h-4 w-4", isSaving && "animate-pulse")} />
                <span className="hidden sm:inline">
                  {isSaving ? "Guardando..." : "Guardar"}
                </span>
              </Button>

              <Button
                size="sm"
                onClick={handleStartTraining}
                disabled={trainingStatus === "training"}
                className="gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {trainingStatus === "training" ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {trainingStatus === "training" ? "Entrenando..." : "Entrenar Modelo"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Model Metrics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <MetricCard
            label="Precisión del Modelo"
            value={`${aiModelMetrics.accuracy}%`}
            icon={Target}
            variant="success"
            trend="up"
            trendValue="2.3%"
            description="vs. mes anterior"
          />
          <MetricCard
            label="Predicciones Generadas"
            value={aiModelMetrics.predictionsGenerated.toLocaleString()}
            icon={Brain}
            variant="ai"
            description="Últimos 30 días"
          />
          <MetricCard
            label="Datos Analizados"
            value={`${(aiModelMetrics.dataPointsAnalyzed / 1000).toFixed(0)}K`}
            icon={Database}
            variant="default"
            description="Registros históricos"
          />
          <MetricCard
            label="Versión del Modelo"
            value={aiModelMetrics.modelVersion}
            icon={Layers}
            variant="default"
            description={`Última actualización: ${aiModelMetrics.lastTrainingDate}`}
          />
        </motion.div>

        {/* Training Progress (if training) */}
        {trainingStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-50 dark:from-cyan-500/10 to-transparent p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-white">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Entrenamiento del Modelo
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Procesando datos históricos de consumo y predicciones
                </p>
              </div>
            </div>
            <TrainingProgress progress={trainingProgress} status={trainingStatus} />
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="metrics" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Métricas</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-1.5">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configuración</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-1.5">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
          </TabsList>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Model Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Performance del Modelo
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Métricas de evaluación del modelo predictivo
                  </p>
                </div>
                <div className="p-4 space-y-4">
                  {/* Accuracy */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Accuracy</span>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">{aiModelMetrics.accuracy}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        style={{ width: `${aiModelMetrics.accuracy}%` }}
                      />
                    </div>
                  </div>

                  {/* Precision */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Precision</span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">89.2%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: "89.2%" }}
                      />
                    </div>
                  </div>

                  {/* Recall */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Recall</span>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">87.5%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: "87.5%" }}
                      />
                    </div>
                  </div>

                  {/* F1 Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">F1 Score</span>
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400">88.3%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                        style={{ width: "88.3%" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Training History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Historial de Entrenamiento
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Últimas actualizaciones del modelo
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { version: "2.1.4", date: "2024-01-15", accuracy: 92.3, status: "active" },
                    { version: "2.1.3", date: "2024-01-08", accuracy: 91.8, status: "archived" },
                    { version: "2.1.2", date: "2024-01-01", accuracy: 90.5, status: "archived" },
                    { version: "2.1.1", date: "2023-12-25", accuracy: 89.2, status: "archived" },
                  ].map((training) => (
                    <div
                      key={training.version}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        training.status === "active"
                          ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20"
                          : "bg-gray-50 dark:bg-gray-900/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg",
                          training.status === "active"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        )}>
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            v{training.version}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {training.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-bold",
                          training.status === "active"
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-400"
                        )}>
                          {training.accuracy}%
                        </p>
                        {training.status === "active" && (
                          <Badge variant="outline" className="text-[9px] border-green-300 dark:border-green-700 text-green-600 dark:text-green-400">
                            Activo
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Prediction Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Configuración de Predicciones
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Ajustes de horizonte y umbrales
                  </p>
                </div>
                <div className="p-4 space-y-5">
                  {/* Prediction Horizon */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Horizonte de Predicción</Label>
                      <span className="text-xs font-mono text-gray-500">{config.predictionHorizonDays} días</span>
                    </div>
                    <Slider
                      value={[config.predictionHorizonDays]}
                      onValueChange={([value]) => updateConfig("predictionHorizonDays", value)}
                      min={7}
                      max={90}
                      step={7}
                      className="w-full"
                    />
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Período de tiempo para generar predicciones de demanda
                    </p>
                  </div>

                  {/* Safety Stock Multiplier */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Multiplicador de Stock de Seguridad</Label>
                      <span className="text-xs font-mono text-gray-500">{config.safetyStockMultiplier}x</span>
                    </div>
                    <Slider
                      value={[config.safetyStockMultiplier * 10]}
                      onValueChange={([value]) => updateConfig("safetyStockMultiplier", value / 10)}
                      min={10}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Factor de seguridad para el cálculo de stock mínimo
                    </p>
                  </div>

                  {/* Confidence Threshold */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Umbral de Confianza</Label>
                      <span className="text-xs font-mono text-gray-500">{config.confidenceThreshold}%</span>
                    </div>
                    <Slider
                      value={[config.confidenceThreshold]}
                      onValueChange={([value]) => updateConfig("confidenceThreshold", value)}
                      min={50}
                      max={99}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Confianza mínima requerida para mostrar predicciones
                    </p>
                  </div>

                  {/* Reorder Lead Time */}
                  <div className="space-y-2">
                    <Label className="text-xs">Tiempo de Entrega (Lead Time)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={config.reorderLeadTimeDays}
                        onChange={(e) => updateConfig("reorderLeadTimeDays", parseInt(e.target.value) || 0)}
                        className="h-9"
                        min={1}
                        max={60}
                      />
                      <span className="text-xs text-gray-500">días</span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Tiempo promedio de entrega de proveedores
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Alert Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Configuración de Alertas
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Umbrales para alertas automáticas
                  </p>
                </div>
                <div className="p-4 space-y-5">
                  {/* Critical Threshold */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-red-600 dark:text-red-400">Umbral Crítico</Label>
                      <span className="text-xs font-mono text-red-500">{config.criticalThresholdDays} días</span>
                    </div>
                    <Slider
                      value={[config.criticalThresholdDays]}
                      onValueChange={([value]) => updateConfig("criticalThresholdDays", value)}
                      min={1}
                      max={14}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Días restantes para marcar como alerta crítica
                    </p>
                  </div>

                  {/* Warning Threshold */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-orange-600 dark:text-orange-400">Umbral de Advertencia</Label>
                      <span className="text-xs font-mono text-orange-500">{config.warningThresholdDays} días</span>
                    </div>
                    <Slider
                      value={[config.warningThresholdDays]}
                      onValueChange={([value]) => updateConfig("warningThresholdDays", value)}
                      min={5}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Días restantes para marcar como advertencia
                    </p>
                  </div>

                  {/* Enable Notifications */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <div>
                      <Label className="text-xs">Notificaciones Push</Label>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        Recibir alertas en tiempo real
                      </p>
                    </div>
                    <Switch
                      checked={config.enablePushNotifications}
                      onCheckedChange={(checked) => updateConfig("enablePushNotifications", checked)}
                    />
                  </div>

                  {/* Auto Reorder */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <div>
                      <Label className="text-xs">Pedidos Automáticos</Label>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        Generar pedidos automáticamente
                      </p>
                    </div>
                    <Switch
                      checked={config.autoReorderEnabled}
                      onCheckedChange={(checked) => updateConfig("autoReorderEnabled", checked)}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm"
            >
              <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Features del Modelo
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Variables utilizadas en las predicciones
                </p>
              </div>
              <div className="p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {config.modelFeatures.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-100 dark:bg-cyan-500/20">
                          <Activity className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {feature.replace(/_/g, " ")}
                        </span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>

                {/* Add New Feature */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="Nueva feature..."
                      className="flex-1 h-9"
                    />
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Zap className="h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                    Las nuevas features requieren re-entrenamiento del modelo
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature Importance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm"
            >
              <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Importancia de Features
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Impacto de cada variable en las predicciones
                </p>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { name: "Historial de Consumo", importance: 85, color: "from-cyan-500 to-blue-500" },
                  { name: "Estacionalidad", importance: 72, color: "from-purple-500 to-pink-500" },
                  { name: "Kilometraje OT", importance: 68, color: "from-orange-500 to-amber-500" },
                  { name: "Tipo de Servicio", importance: 55, color: "from-green-500 to-emerald-500" },
                  { name: "Marca Vehículo", importance: 42, color: "from-red-500 to-rose-500" },
                  { name: "Día de la Semana", importance: 28, color: "from-gray-500 to-slate-500" },
                ].map((feature) => (
                  <div key={feature.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{feature.name}</span>
                      <span className="text-xs font-mono text-gray-500">{feature.importance}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full bg-gradient-to-r", feature.color)}
                        style={{ width: `${feature.importance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
