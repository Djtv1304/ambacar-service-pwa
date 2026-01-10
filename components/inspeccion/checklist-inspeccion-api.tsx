"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, AlertTriangle, XCircle, Ruler, Camera, ImagePlus, ChevronDown, Eye, User, Calendar as CalendarIcon, Sparkles, Loader2, Lightbulb, Target, CheckCircle, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import type { PuntoInspeccionEvaluado, PuntoInspeccionCatalogo, ItemInspeccion, FotoInspeccionAPI } from "@/lib/types"
import { useAuthToken } from "@/hooks/use-auth-token"
import { getSugerenciaInteligente, type SugerenciaInteligente } from "@/lib/api/inspecciones"
import { MIN_FOTOS_INSPECCION } from "@/lib/inspeccion/constants"
import { EvaluacionPuntoDialog } from "./evaluacion-punto-dialog"
import { EvaluacionConMedicionesDialog } from "./evaluacion-con-mediciones-dialog"
import { SubirFotosDialog } from "./subir-fotos-dialog"
import { cn } from "@/lib/utils"

interface ChecklistInspeccionApiProps {
  puntosInspeccion: PuntoInspeccionCatalogo[]
  evaluaciones: PuntoInspeccionEvaluado[]
  itemsInspeccion: ItemInspeccion[]
  onGuardarEvaluacion: (evaluacion: PuntoInspeccionEvaluado) => Promise<void>
  onFotosSubidas: () => void
  readOnly?: boolean
}

interface FotoThumbnailProps {
  foto: FotoInspeccionAPI
  onClick: () => void
}

function FotoThumbnail({ foto, onClick }: FotoThumbnailProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden border border-border bg-muted hover:border-primary transition-colors group"
    >
      <img
        src={foto.url_imagen}
        alt={foto.descripcion || "Foto de inspección"}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Eye className="h-6 w-6 text-white" />
      </div>
    </motion.button>
  )
}

interface FotoModalProps {
  foto: FotoInspeccionAPI | null
  open: boolean
  onClose: () => void
}

// Helper function to determine estado config based on estado_general text
function getEstadoConfig(estadoGeneral: string | undefined) {
  if (!estadoGeneral) return null

  const lowerEstado = estadoGeneral.toLowerCase()

  // Map various possible values to our config
  if (lowerEstado.includes("conforme") && !lowerEstado.includes("no conforme")) {
    return {
      bg: "bg-green-100 dark:bg-green-950/50",
      border: "border-green-300 dark:border-green-800",
      text: "text-green-700 dark:text-green-400",
      icon: CheckCircle,
    }
  } else if (lowerEstado.includes("no conforme") || lowerEstado.includes("malo") || lowerEstado.includes("critico") || lowerEstado.includes("crítico")) {
    return {
      bg: "bg-red-100 dark:bg-red-950/50",
      border: "border-red-300 dark:border-red-800",
      text: "text-red-700 dark:text-red-400",
      icon: AlertTriangle,
    }
  } else if (lowerEstado.includes("regular") || lowerEstado.includes("atención") || lowerEstado.includes("atencion")) {
    return {
      bg: "bg-yellow-100 dark:bg-yellow-950/50",
      border: "border-yellow-300 dark:border-yellow-800",
      text: "text-yellow-700 dark:text-yellow-400",
      icon: AlertTriangle,
    }
  } else if (lowerEstado.includes("bueno") || lowerEstado.includes("bien") || lowerEstado.includes("ok")) {
    return {
      bg: "bg-green-100 dark:bg-green-950/50",
      border: "border-green-300 dark:border-green-800",
      text: "text-green-700 dark:text-green-400",
      icon: CheckCircle,
    }
  }

  // Default to amber/warning for unknown states
  return {
    bg: "bg-amber-100 dark:bg-amber-950/50",
    border: "border-amber-300 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
    icon: AlertCircle,
  }
}

// Animation variants for AI panel
const panelVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.12,
    }
  }
}

const sectionVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
}

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 }
}

function FotoModal({ foto, open, onClose }: FotoModalProps) {
  const [showOverlay, setShowOverlay] = useState(false)
  const [suggestion, setSuggestion] = useState<SugerenciaInteligente | null>(null)
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)
  const { getToken } = useAuthToken()

  // Reset state when modal closes or photo changes
  useEffect(() => {
    if (!open) {
      setSuggestion(null)
      setSuggestionError(null)
      setIsLoadingSuggestion(false)
      setShowOverlay(false)
    }
  }, [open])

  if (!foto) return null

  const handleImageClick = () => {
    window.open(foto.url_imagen, "_blank")
  }

  const handleTouchStart = () => {
    setShowOverlay(true)
  }

  const handleTouchEnd = () => {
    setShowOverlay(false)
  }

  const handleAnalyzeWithAI = async () => {
    if (!foto) return

    setIsLoadingSuggestion(true)
    setSuggestionError(null)

    try {
      const token = await getToken()
      if (!token) {
        toast.error("Sesión expirada", { description: "Por favor inicia sesión nuevamente" })
        return
      }

      const result = await getSugerenciaInteligente(foto.id, token)
      console.log("AI Suggestion Response:", result)
      setSuggestion(result)
      toast.success("Análisis completado", { description: "Se generaron sugerencias inteligentes" })
    } catch (error: any) {
      console.error("Error getting AI suggestion:", error)

      let errorMessage = "Error al obtener sugerencias. Intenta nuevamente."
      if (error.status === 404) {
        errorMessage = "No se encontró la foto para analizar"
      } else if (error.status === 400) {
        errorMessage = "Solicitud inválida"
      }

      setSuggestionError(errorMessage)
      toast.error("Error al analizar", { description: errorMessage })
    } finally {
      setIsLoadingSuggestion(false)
    }
  }

  // Access the nested sugerencias object
  const sugerencias = suggestion?.sugerencias
  const contexto = suggestion?.contexto

  const hasSuggestions = suggestion?.tiene_sugerencias && sugerencias && (
    (sugerencias.observaciones?.length ?? 0) > 0 ||
    (sugerencias.recomendaciones?.length ?? 0) > 0 ||
    (sugerencias.puntos_atencion?.length ?? 0) > 0
  )

  const estadoConfig = getEstadoConfig(sugerencias?.estado_general)
  const EstadoIcon = estadoConfig?.icon

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto dark:bg-gray-950 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">{foto.descripcion || "Foto de Inspección"}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {/* Photo section */}
          <div className="flex items-center justify-center bg-muted dark:bg-gray-900/50 rounded-lg p-2 min-h-[200px]">
            <div
              className="relative rounded-lg overflow-hidden cursor-pointer group"
              onClick={handleImageClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <img
                src={foto.url_imagen}
                alt={foto.descripcion || "Foto de inspección"}
                className={cn(
                  "w-auto max-w-full object-contain rounded-lg transition-all duration-300",
                  suggestion ? "max-h-[40vh] md:max-h-[50vh]" : "max-h-[60vh] md:max-h-[70vh]"
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 bg-black/60 transition-opacity flex items-center justify-center rounded-lg",
                  showOverlay ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <div className="text-center px-4">
                  <Eye className="h-10 w-10 md:h-12 md:w-12 text-white mx-auto mb-2" />
                  <p className="text-white text-xs md:text-sm font-medium">
                    Click para abrir en nueva pestaña
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata section */}
          <div className="space-y-2 text-sm bg-muted/50 dark:bg-gray-900/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span>{new Date(foto.fecha_captura).toLocaleString("es-EC")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
              <User className="h-4 w-4 shrink-0" />
              <span>Capturada por: {foto.usuario_nombre}</span>
            </div>
          </div>

          {/* AI Analysis Button */}
          {!suggestion && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyzeWithAI}
              disabled={isLoadingSuggestion}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl",
                "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
                "dark:from-purple-700 dark:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600",
                "text-white font-medium shadow-lg shadow-purple-500/25 dark:shadow-purple-900/40",
                "transition-all duration-300",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              )}
            >
              {isLoadingSuggestion ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              <span className="text-sm sm:text-base">
                {isLoadingSuggestion ? "Analizando imagen..." : "Analizar con IA"}
              </span>
            </motion.button>
          )}

          {/* Error state */}
          {suggestionError && !suggestion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
            >
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-300">{suggestionError}</span>
            </motion.div>
          )}

          {/* AI Suggestions Panel */}
          <AnimatePresence>
            {suggestion && (
              <motion.div
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                className="rounded-xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-b from-purple-50/80 to-white dark:from-purple-950/30 dark:to-gray-950 overflow-hidden"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-purple-100/50 dark:bg-purple-900/30 border-b border-purple-200 dark:border-purple-900/50">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-purple-900 dark:text-purple-100">Análisis Inteligente</span>
                  </div>
                </div>

                {/* Panel Content */}
                <div className="p-4 space-y-4">
                  {/* Estado General - Shown prominently first */}
                  {sugerencias?.estado_general && estadoConfig && EstadoIcon && (
                    <motion.div
                      variants={sectionVariants}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border-2",
                        estadoConfig.bg,
                        estadoConfig.border
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        estadoConfig.bg
                      )}>
                        <EstadoIcon className={cn("h-6 w-6", estadoConfig.text)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wider mb-0.5">
                          Estado General
                        </p>
                        <p className={cn("text-lg font-bold", estadoConfig.text)}>
                          {sugerencias.estado_general}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Context info */}
                  {contexto && (contexto.punto_inspeccion || contexto.vehiculo) && (
                    <motion.div variants={sectionVariants} className="text-xs text-muted-foreground dark:text-gray-500 bg-muted/30 dark:bg-gray-900/30 px-3 py-2 rounded-lg">
                      {contexto.punto_inspeccion && (
                        <span className="font-medium">{contexto.punto_inspeccion}</span>
                      )}
                      {contexto.punto_inspeccion && contexto.vehiculo && <span> • </span>}
                      {contexto.vehiculo && <span>{contexto.vehiculo}</span>}
                    </motion.div>
                  )}

                  {/* No suggestions state - only show if API says no suggestions */}
                  {!hasSuggestions && !suggestion.tiene_sugerencias && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6"
                    >
                      <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        No se detectaron problemas o recomendaciones para esta imagen.
                      </p>
                    </motion.div>
                  )}

                  {/* Observaciones */}
                  {sugerencias?.observaciones && sugerencias.observaciones.length > 0 && (
                    <motion.div variants={sectionVariants} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                          Observaciones ({sugerencias.observaciones.length})
                        </span>
                      </div>
                      <motion.ul className="space-y-2 pl-6">
                        {sugerencias.observaciones.map((obs, idx) => (
                          <motion.li
                            key={idx}
                            variants={itemVariants}
                            className="text-sm text-gray-700 dark:text-gray-300 list-disc marker:text-blue-500 dark:marker:text-blue-400"
                          >
                            {obs}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  )}

                  {/* Recomendaciones */}
                  {sugerencias?.recomendaciones && sugerencias.recomendaciones.length > 0 && (
                    <motion.div variants={sectionVariants} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                          Recomendaciones ({sugerencias.recomendaciones.length})
                        </span>
                      </div>
                      <motion.ul className="space-y-2 pl-6">
                        {sugerencias.recomendaciones.map((rec, idx) => (
                          <motion.li
                            key={idx}
                            variants={itemVariants}
                            className="text-sm text-gray-700 dark:text-gray-300 list-disc marker:text-amber-500 dark:marker:text-amber-400"
                          >
                            {rec}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  )}

                  {/* Puntos de Atención */}
                  {sugerencias?.puntos_atencion && sugerencias.puntos_atencion.length > 0 && (
                    <motion.div variants={sectionVariants} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300">
                          Puntos de Atención ({sugerencias.puntos_atencion.length})
                        </span>
                      </div>
                      <motion.ul className="space-y-2 pl-6">
                        {sugerencias.puntos_atencion.map((punto, idx) => (
                          <motion.li
                            key={idx}
                            variants={itemVariants}
                            className="text-sm text-gray-700 dark:text-gray-300 list-disc marker:text-red-500 dark:marker:text-red-400"
                          >
                            {punto}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  )}

                  {/* Re-analyze button */}
                  <motion.div variants={sectionVariants} className="pt-2 border-t border-purple-100 dark:border-purple-900/30">
                    <button
                      onClick={handleAnalyzeWithAI}
                      disabled={isLoadingSuggestion}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors disabled:opacity-50"
                    >
                      {isLoadingSuggestion ? "Analizando..." : "Volver a analizar"}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ChecklistInspeccionApi({
  puntosInspeccion,
  evaluaciones,
  itemsInspeccion,
  onGuardarEvaluacion,
  onFotosSubidas,
  readOnly = false,
}: ChecklistInspeccionApiProps) {
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoInspeccionCatalogo | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [fotosDialogOpen, setFotosDialogOpen] = useState(false)
  const [itemParaFotos, setItemParaFotos] = useState<{ id: number; nombre: string } | null>(null)
  const [expandedPhotos, setExpandedPhotos] = useState<Set<number>>(new Set())
  const [selectedFoto, setSelectedFoto] = useState<FotoInspeccionAPI | null>(null)

  const puntosCompletados = evaluaciones.filter((e) => e.completado).length
  const progreso = (puntosCompletados / puntosInspeccion.length) * 100

  const handleClickPunto = (punto: PuntoInspeccionCatalogo) => {
    if (!readOnly) {
      setPuntoSeleccionado(punto)
      setDialogOpen(true)
    }
  }

  const handleAgregarFotos = (itemId: number, puntoNombre: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setItemParaFotos({ id: itemId, nombre: puntoNombre })
    setFotosDialogOpen(true)
  }

  const toggleExpandedPhotos = (puntoId: number) => {
    setExpandedPhotos((prev) => {
      const next = new Set(prev)
      if (next.has(puntoId)) {
        next.delete(puntoId)
      } else {
        next.add(puntoId)
      }
      return next
    })
  }

  const necesitaFotos = (puntoId: number): boolean => {
    const evaluacion = evaluaciones.find((e) => e.punto_id === puntoId)
    if (!evaluacion || !evaluacion.completado || evaluacion.estado !== "rojo") {
      return false
    }

    const item = itemsInspeccion.find((i) => i.item_catalogo === puntoId)
    if (!item) {
      return false
    }

    const fotosActuales = item.fotos?.length || 0
    return fotosActuales < MIN_FOTOS_INSPECCION
  }

  const getItemId = (puntoId: number): number | null => {
    const item = itemsInspeccion.find((i) => i.item_catalogo === puntoId)
    return item?.id || null
  }

  const getEstadoIcon = (puntoId: number) => {
    const evaluacion = evaluaciones.find((e) => e.punto_id === puntoId)
    if (!evaluacion || !evaluacion.completado) {
      return <Circle className="h-5 w-5 text-gray-400" />
    }

    switch (evaluacion.estado) {
      case "verde":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "amarillo":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "rojo":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "na":
        return <Circle className="h-5 w-5 text-gray-500" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getEstadoBadge = (puntoId: number) => {
    const evaluacion = evaluaciones.find((e) => e.punto_id === puntoId)
    if (!evaluacion || !evaluacion.completado) {
      return null
    }

    const badgeConfig = {
      verde: { text: "Óptimo", className: "bg-green-500/10 text-green-700 border-green-500/20" },
      amarillo: { text: "Precaución", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
      rojo: { text: "Crítico", className: "bg-red-500/10 text-red-700 border-red-500/20" },
      na: { text: "No Aplica", className: "bg-gray-500/10 text-gray-700 border-gray-500/20" },
    }

    const config = badgeConfig[evaluacion.estado]
    return (
      <Badge variant="outline" className={config.className}>
        {config.text}
      </Badge>
    )
  }

  // Agrupar puntos por categoría
  const puntosAgrupados = puntosInspeccion.reduce(
    (acc, punto) => {
      if (!acc[punto.categoria]) {
        acc[punto.categoria] = []
      }
      acc[punto.categoria].push(punto)
      return acc
    },
    {} as Record<string, PuntoInspeccionCatalogo[]>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl">Puntos de Inspección</CardTitle>
              <CardDescription>
                Completa los {puntosInspeccion.length} puntos de inspección del vehículo
              </CardDescription>
            </div>
            <Badge className="bg-[#ED1C24]/10 text-[#ED1C24] border-[#ED1C24]/20 text-base sm:text-lg px-3 py-1.5 sm:px-4 sm:py-2 self-start sm:shrink-0">
              {puntosCompletados}/{puntosInspeccion.length}
            </Badge>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
              <span className="font-medium">Progreso de Inspección</span>
              <span className="text-muted-foreground">{progreso.toFixed(0)}% completado</span>
            </div>
            <Progress value={progreso} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {Object.entries(puntosAgrupados).map(([categoria, puntos]) => (
            <div key={categoria} className="space-y-3">
              <div className="flex items-center gap-2 bg-card py-2">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {puntos[0].categoria_display.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {evaluaciones.filter((e) => e.completado && puntos.some((p) => p.id === e.punto_id)).length}/
                  {puntos.length} completados
                </span>
              </div>

              <div className="space-y-2">
                {puntos.map((punto, index) => {
                  const evaluacion = evaluaciones.find((e) => e.punto_id === punto.id)
                  const completado = evaluacion?.completado || false
                  const item = itemsInspeccion.find((i) => i.item_catalogo === punto.id)
                  const fotosActuales = item?.fotos?.length || 0
                  const requiereFotos = necesitaFotos(punto.id)

                  return (
                    <motion.div
                      key={punto.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="space-y-2"
                    >
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start h-auto p-4 text-left transition-colors",
                          !readOnly && "hover:bg-accent cursor-pointer",
                          readOnly && "cursor-default",
                          completado && "border-2",
                          completado && evaluacion?.estado === "verde" && "border-green-200 bg-green-50/50",
                          completado && evaluacion?.estado === "amarillo" && "border-yellow-200 bg-yellow-50/50",
                          completado && evaluacion?.estado === "rojo" && "border-red-200 bg-red-50/50",
                          completado && evaluacion?.estado === "na" && "border-gray-200 bg-gray-50/50"
                        )}
                        onClick={() => handleClickPunto(punto)}
                      >
                        {/* Mobile Layout: 3 rows */}
                        <div className="flex flex-col gap-2 w-full min-w-0 overflow-hidden sm:hidden">
                          {/* Row 1: Icon + Number + Status Badge */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex-shrink-0">{getEstadoIcon(punto.id)}</div>
                              <span className="font-semibold text-sm text-gray-500">#{punto.orden_visualizacion}</span>
                            </div>
                            {getEstadoBadge(punto.id)}
                          </div>

                          {/* Row 2: Name + Mediciones badge if applicable */}
                          <div className="flex flex-col gap-1 min-w-0">
                            <h4 className="font-semibold text-base break-words whitespace-normal overflow-hidden">{punto.nombre}</h4>
                            {punto.requiere_mediciones && (
                              <Badge variant="outline" className="self-start text-xs bg-blue-50 text-blue-700 border-blue-200">
                                <Ruler className="h-3 w-3 mr-1" />
                                Mediciones
                              </Badge>
                            )}
                          </div>

                          {/* Row 3: Description + Photos/Measurements info */}
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground line-clamp-2">{punto.descripcion}</p>
                            {evaluacion?.observaciones && (
                              <p className="text-xs text-gray-600 italic">
                                Observaciones: {evaluacion.observaciones.substring(0, 50)}...
                              </p>
                            )}
                            {evaluacion?.mediciones && Object.keys(evaluacion.mediciones).length > 0 && (
                              <p className="text-xs text-blue-600 flex items-center gap-1">
                                <Ruler className="h-3 w-3" />
                                {Object.keys(evaluacion.mediciones).length} medición(es) registrada(s)
                              </p>
                            )}
                            {fotosActuales > 0 && (
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleExpandedPhotos(punto.id)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    toggleExpandedPhotos(punto.id)
                                  }
                                }}
                                className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 border border-purple-200 dark:border-purple-900 transition-colors cursor-pointer"
                              >
                                <Camera className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                  Ver {fotosActuales} foto{fotosActuales !== 1 ? 's' : ''}
                                </span>
                                <ChevronDown
                                  className={cn(
                                    "h-3.5 w-3.5 text-purple-600 dark:text-purple-400 transition-transform",
                                    expandedPhotos.has(punto.id) && "rotate-180"
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tablet/Desktop Layout: Horizontal */}
                        <div className="hidden sm:flex items-start gap-3 w-full">
                          <div className="flex-shrink-0 mt-0.5">{getEstadoIcon(punto.id)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm text-gray-500">
                                  #{punto.orden_visualizacion}
                                </span>
                                <h4 className="font-semibold text-base">{punto.nombre}</h4>
                                {punto.requiere_mediciones && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Ruler className="h-3 w-3 mr-1" />
                                    Mediciones
                                  </Badge>
                                )}
                              </div>
                              {getEstadoBadge(punto.id)}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{punto.descripcion}</p>
                            {evaluacion?.observaciones && (
                              <p className="text-xs text-gray-600 mt-2 italic">
                                Observaciones: {evaluacion.observaciones.substring(0, 100)}
                                {evaluacion.observaciones.length > 100 && "..."}
                              </p>
                            )}
                            {evaluacion?.mediciones && Object.keys(evaluacion.mediciones).length > 0 && (
                              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                <Ruler className="h-3 w-3" />
                                {Object.keys(evaluacion.mediciones).length} medición(es) registrada(s)
                              </p>
                            )}
                            {fotosActuales > 0 && (
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleExpandedPhotos(punto.id)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    toggleExpandedPhotos(punto.id)
                                  }
                                }}
                                className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 border border-purple-200 dark:border-purple-900 transition-colors cursor-pointer"
                              >
                                <Camera className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                  Ver {fotosActuales} foto{fotosActuales !== 1 ? 's' : ''}
                                </span>
                                <ChevronDown
                                  className={cn(
                                    "h-3.5 w-3.5 text-purple-600 dark:text-purple-400 transition-transform",
                                    expandedPhotos.has(punto.id) && "rotate-180"
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </Button>

                      {/* Galería de fotos expandible */}
                      <AnimatePresence>
                        {expandedPhotos.has(punto.id) && item?.fotos && item.fotos.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 sm:pl-8 pt-3">
                              <div className="p-3 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
                                <p className="text-xs text-purple-900 dark:text-purple-300 mb-2 font-medium">
                                  Evidencia fotográfica ({item.fotos.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {item.fotos.map((foto) => (
                                    <FotoThumbnail
                                      key={foto.id}
                                      foto={foto}
                                      onClick={() => setSelectedFoto(foto)}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Alerta fotos requeridas - Fuera del Button */}
                      {requiereFotos && item && !readOnly && (
                        <div className="pl-4 sm:pl-8 w-full">
                          {/* Mobile: 3 filas apiladas */}
                          <div className="flex flex-col gap-2 p-3 rounded-md border border-red-300 bg-red-50 sm:hidden">
                            <div className="flex items-center gap-2">
                              <Camera className="h-4 w-4 text-red-600 shrink-0" />
                              <span className="text-red-900 text-sm font-medium">Fotos requeridas</span>
                            </div>
                            <span className="text-red-800 text-xs">
                              Se requieren al menos {MIN_FOTOS_INSPECCION} fotos de evidencia para este punto crítico
                            </span>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-red-600 hover:bg-red-700 w-full"
                              onClick={(e) => handleAgregarFotos(item.id, punto.nombre, e)}
                            >
                              <ImagePlus className="h-4 w-4 mr-1" />
                              Agregar Fotos
                            </Button>
                          </div>

                          {/* Desktop/Tablet: horizontal */}
                          <div className="hidden sm:flex items-center gap-4 p-3 rounded-md border border-red-300 bg-red-50">
                            <div className="flex items-center gap-2 shrink-0">
                              <Camera className="h-4 w-4 text-red-600" />
                              <span className="text-red-900 text-sm font-medium">Fotos requeridas</span>
                            </div>
                            <span className="text-red-800 text-sm flex-1 min-w-0">
                              Se requieren al menos {MIN_FOTOS_INSPECCION} fotos de evidencia para este punto crítico
                            </span>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-red-600 hover:bg-red-700 shrink-0"
                              onClick={(e) => handleAgregarFotos(item.id, punto.nombre, e)}
                            >
                              <ImagePlus className="h-4 w-4 mr-1" />
                              Agregar Fotos
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {puntoSeleccionado &&
        (puntoSeleccionado.requiere_mediciones ? (
          <EvaluacionConMedicionesDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            puntoCatalogo={puntoSeleccionado}
            evaluacionExistente={evaluaciones.find((e) => e.punto_id === puntoSeleccionado.id)}
            onGuardar={onGuardarEvaluacion}
          />
        ) : (
          <EvaluacionPuntoDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            puntoId={puntoSeleccionado.id}
            puntoNombre={puntoSeleccionado.nombre}
            puntoDescripcion={puntoSeleccionado.descripcion}
            evaluacionExistente={evaluaciones.find((e) => e.punto_id === puntoSeleccionado.id)}
            onGuardar={onGuardarEvaluacion}
          />
        ))}

      {itemParaFotos && (
        <SubirFotosDialog
          open={fotosDialogOpen}
          onOpenChange={setFotosDialogOpen}
          itemInspeccionId={itemParaFotos.id}
          puntoNombre={itemParaFotos.nombre}
          onFotosSubidas={() => {
            onFotosSubidas()
            setFotosDialogOpen(false)
            setItemParaFotos(null)
          }}
        />
      )}

      {/* Modal de fotos */}
      <FotoModal
        foto={selectedFoto}
        open={!!selectedFoto}
        onClose={() => setSelectedFoto(null)}
      />
    </>
  )
}
