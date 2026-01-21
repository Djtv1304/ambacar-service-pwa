"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Brain,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Send,
  Target,
  Clock,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { otFeedbackData, type OTFeedback, type PartFeedback } from "@/lib/fixtures/smart-inventory"

// Feedback Rating Component
function FeedbackRating({
  value,
  onChange,
  disabled = false
}: {
  value: "accurate" | "overestimated" | "underestimated" | null
  onChange: (value: "accurate" | "overestimated" | "underestimated") => void
  disabled?: boolean
}) {
  const options = [
    { value: "accurate" as const, label: "Preciso", icon: CheckCircle, color: "text-green-500 border-green-500 bg-green-50 dark:bg-green-500/10" },
    { value: "overestimated" as const, label: "Sobrestimó", icon: TrendingUp, color: "text-orange-500 border-orange-500 bg-orange-50 dark:bg-orange-500/10" },
    { value: "underestimated" as const, label: "Subestimó", icon: TrendingDown, color: "text-red-500 border-red-500 bg-red-50 dark:bg-red-500/10" },
  ]

  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const Icon = option.icon
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all",
              isSelected
                ? option.color
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs font-medium">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// Part Feedback Card Component
function PartFeedbackCard({
  part,
  onFeedbackChange,
  isSubmitted
}: {
  part: PartFeedback
  onFeedbackChange: (partId: string, field: string, value: any) => void
  isSubmitted: boolean
}) {
  const difference = part.usedQuantity - part.predictedQuantity
  const percentDiff = part.predictedQuantity > 0
    ? Math.round((difference / part.predictedQuantity) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border bg-white dark:bg-gray-950 shadow-sm overflow-hidden",
        part.feedback === "accurate"
          ? "border-green-200 dark:border-green-800"
          : part.feedback === "overestimated"
            ? "border-orange-200 dark:border-orange-800"
            : part.feedback === "underestimated"
              ? "border-red-200 dark:border-red-800"
              : "border-gray-200 dark:border-gray-800"
      )}
    >
      {/* Part Header */}
      <div className={cn(
        "px-4 py-3 border-b",
        part.feedback === "accurate"
          ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-800"
          : part.feedback === "overestimated"
            ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-800"
            : part.feedback === "underestimated"
              ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800"
              : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              part.feedback === "accurate"
                ? "bg-green-500 text-white"
                : part.feedback === "overestimated"
                  ? "bg-orange-500 text-white"
                  : part.feedback === "underestimated"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            )}>
              <Package className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {part.partName}
              </h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                {part.partSku}
              </p>
            </div>
          </div>
          {part.feedback && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                part.feedback === "accurate"
                  ? "border-green-300 dark:border-green-700 text-green-600 dark:text-green-400"
                  : part.feedback === "overestimated"
                    ? "border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400"
                    : "border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
              )}
            >
              {part.feedback === "accurate" ? "Correcto" :
               part.feedback === "overestimated" ? "Sobrestimado" : "Subestimado"}
            </Badge>
          )}
        </div>
      </div>

      {/* Quantities Comparison */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {/* Predicted */}
          <div className="text-center p-3 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Brain className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
              <span className="text-[10px] font-medium text-cyan-600 dark:text-cyan-400">
                Predicción IA
              </span>
            </div>
            <p className="text-xl font-bold text-cyan-700 dark:text-cyan-300">
              {part.predictedQuantity}
            </p>
          </div>

          {/* Actual Used */}
          <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400">
                Usado Real
              </span>
            </div>
            <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
              {part.usedQuantity}
            </p>
          </div>

          {/* Difference */}
          <div className={cn(
            "text-center p-3 rounded-lg border",
            difference === 0
              ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-800"
              : difference > 0
                ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800"
                : "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-800"
          )}>
            <div className="flex items-center justify-center gap-1 mb-1">
              {difference === 0 ? (
                <Minus className="h-3 w-3 text-green-600 dark:text-green-400" />
              ) : difference > 0 ? (
                <TrendingUp className="h-3 w-3 text-red-600 dark:text-red-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              )}
              <span className={cn(
                "text-[10px] font-medium",
                difference === 0
                  ? "text-green-600 dark:text-green-400"
                  : difference > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-orange-600 dark:text-orange-400"
              )}>
                Diferencia
              </span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              difference === 0
                ? "text-green-700 dark:text-green-300"
                : difference > 0
                  ? "text-red-700 dark:text-red-300"
                  : "text-orange-700 dark:text-orange-300"
            )}>
              {difference > 0 ? "+" : ""}{difference}
            </p>
            <p className={cn(
              "text-[10px]",
              difference === 0
                ? "text-green-600 dark:text-green-400"
                : difference > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-orange-600 dark:text-orange-400"
            )}>
              {percentDiff > 0 ? "+" : ""}{percentDiff}%
            </p>
          </div>
        </div>

        {/* Feedback Rating */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-600 dark:text-gray-400">
            ¿Qué tan precisa fue la predicción?
          </Label>
          <FeedbackRating
            value={part.feedback}
            onChange={(value) => onFeedbackChange(part.partId, "feedback", value)}
            disabled={isSubmitted}
          />
        </div>

        {/* Reason Select (if not accurate) */}
        {part.feedback && part.feedback !== "accurate" && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-600 dark:text-gray-400">
              Razón de la diferencia
            </Label>
            <Select
              value={part.reason || ""}
              onValueChange={(value) => onFeedbackChange(part.partId, "reason", value)}
              disabled={isSubmitted}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecciona una razón..." />
              </SelectTrigger>
              <SelectContent>
                {part.feedback === "overestimated" ? (
                  <>
                    <SelectItem value="vehicle_condition">Condición del vehículo mejor de lo esperado</SelectItem>
                    <SelectItem value="partial_repair">Reparación parcial solicitada por cliente</SelectItem>
                    <SelectItem value="incorrect_diagnosis">Diagnóstico inicial incorrecto</SelectItem>
                    <SelectItem value="used_alternative">Se usó repuesto alternativo</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="additional_damage">Daño adicional encontrado</SelectItem>
                    <SelectItem value="defective_part">Repuesto defectuoso</SelectItem>
                    <SelectItem value="scope_expansion">Ampliación del alcance del servicio</SelectItem>
                    <SelectItem value="underestimated_wear">Desgaste mayor al estimado</SelectItem>
                  </>
                )}
                <SelectItem value="other">Otra razón</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function OTFeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const otId = params.id as string

  // Find the OT feedback data
  const [feedbackData, setFeedbackData] = useState<OTFeedback>(() => {
    const data = otFeedbackData.find(f => f.otId === otId)
    return data || otFeedbackData[0] // Fallback to first if not found
  })

  const [generalComments, setGeneralComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Calculate overall accuracy
  const overallAccuracy = useMemo(() => {
    const accurateParts = feedbackData.parts.filter(p => p.feedback === "accurate").length
    const totalWithFeedback = feedbackData.parts.filter(p => p.feedback).length
    return totalWithFeedback > 0 ? Math.round((accurateParts / totalWithFeedback) * 100) : 0
  }, [feedbackData.parts])

  const handlePartFeedbackChange = (partId: string, field: string, value: any) => {
    setFeedbackData(prev => ({
      ...prev,
      parts: prev.parts.map(part =>
        part.partId === partId ? { ...part, [field]: value } : part
      )
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const allPartsHaveFeedback = feedbackData.parts.every(p => p.feedback)

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 -m-6">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 shadow-lg shadow-green-500/20">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                    Feedback de IA
                  </h1>
                  <Badge
                    variant="outline"
                    className="hidden sm:flex gap-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 text-green-700 dark:text-green-400"
                  >
                    <Sparkles className="h-3 w-3" />
                    Aprendizaje
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  OT #{feedbackData.otNumber} • {feedbackData.vehiclePlate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isSubmitted ? (
                <Badge className="gap-1.5 bg-green-500 text-white">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Feedback Enviado
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!allPartsHaveFeedback || isSubmitting}
                  className="gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Send className={cn("h-4 w-4", isSubmitting && "animate-pulse")} />
                  <span className="hidden sm:inline">
                    {isSubmitting ? "Enviando..." : "Enviar Feedback"}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {/* OT Info */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Servicio</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {feedbackData.serviceType}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              {feedbackData.completedDate}
            </p>
          </div>

          {/* Parts Count */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Repuestos</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {feedbackData.parts.length}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              {feedbackData.parts.filter(p => p.feedback).length} evaluados
            </p>
          </div>

          {/* AI Accuracy */}
          <div className={cn(
            "rounded-xl border p-4",
            overallAccuracy >= 80
              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-500/10"
              : overallAccuracy >= 50
                ? "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-500/10"
                : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Target className={cn(
                "h-4 w-4",
                overallAccuracy >= 80 ? "text-green-600 dark:text-green-400" :
                overallAccuracy >= 50 ? "text-orange-600 dark:text-orange-400" :
                "text-red-600 dark:text-red-400"
              )} />
              <span className={cn(
                "text-xs",
                overallAccuracy >= 80 ? "text-green-600 dark:text-green-400" :
                overallAccuracy >= 50 ? "text-orange-600 dark:text-orange-400" :
                "text-red-600 dark:text-red-400"
              )}>
                Precisión IA
              </span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              overallAccuracy >= 80 ? "text-green-700 dark:text-green-300" :
              overallAccuracy >= 50 ? "text-orange-700 dark:text-orange-300" :
              "text-red-700 dark:text-red-300"
            )}>
              {overallAccuracy}%
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              Predicciones correctas
            </p>
          </div>

          {/* Model Learning */}
          <div className="rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-500/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs text-cyan-600 dark:text-cyan-400">Aprendizaje</span>
            </div>
            <p className="text-xl font-bold text-cyan-700 dark:text-cyan-300">
              +{feedbackData.parts.length}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              Datos para entrenar
            </p>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-start gap-3 p-4 rounded-xl border border-cyan-200 dark:border-cyan-800 bg-gradient-to-r from-cyan-50 dark:from-cyan-500/10 to-transparent"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-white shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Tu feedback mejora las predicciones
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Al evaluar la precisión de las predicciones, ayudas al modelo de IA a aprender de los casos reales.
              Cada feedback se incorpora en el próximo ciclo de entrenamiento del modelo.
            </p>
          </div>
        </motion.div>

        {/* Parts Feedback Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {feedbackData.parts.map((part) => (
            <PartFeedbackCard
              key={part.partId}
              part={part}
              onFeedbackChange={handlePartFeedbackChange}
              isSubmitted={isSubmitted}
            />
          ))}
        </div>

        {/* General Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm"
        >
          <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Comentarios Adicionales
              </h3>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              Información adicional que pueda ayudar a mejorar las predicciones
            </p>
          </div>
          <div className="p-4">
            <Textarea
              placeholder="Describe cualquier situación especial, patrones observados o sugerencias para mejorar las predicciones..."
              value={generalComments}
              onChange={(e) => setGeneralComments(e.target.value)}
              disabled={isSubmitted}
              className="min-h-[100px] resize-none"
            />
          </div>
        </motion.div>

        {/* Submit Button (Mobile Fixed) */}
        {!isSubmitted && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 sm:hidden">
            <Button
              onClick={handleSubmit}
              disabled={!allPartsHaveFeedback || isSubmitting}
              className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Send className={cn("h-4 w-4", isSubmitting && "animate-pulse")} />
              {isSubmitting ? "Enviando Feedback..." : "Enviar Feedback"}
            </Button>
          </div>
        )}

        {/* Success Message */}
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20 mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                ¡Feedback Enviado!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Gracias por ayudar a mejorar el modelo de predicción. Tu feedback será procesado en el próximo ciclo de entrenamiento.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/ot/${otId}`)}
                  className="flex-1"
                >
                  Ver OT
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/inventario")}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Ir a Inventario
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Padding for Mobile Fixed Button */}
        <div className="h-20 sm:hidden" />
      </div>
    </div>
  )
}
