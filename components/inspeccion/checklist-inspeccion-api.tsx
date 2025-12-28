"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, AlertTriangle, XCircle, Ruler, Camera, ImagePlus, ChevronDown, Eye, User, Calendar as CalendarIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { PuntoInspeccionEvaluado, PuntoInspeccionCatalogo, ItemInspeccion, FotoInspeccionAPI } from "@/lib/types"
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

function FotoModal({ foto, open, onClose }: FotoModalProps) {
  const [showOverlay, setShowOverlay] = useState(false)

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{foto.descripcion || "Foto de Inspección"}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-center bg-muted rounded-lg p-2 min-h-[200px]">
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
                className="max-h-[60vh] md:max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
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

          <div className="space-y-2 text-sm bg-muted/50 dark:bg-muted/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span>{new Date(foto.fecha_captura).toLocaleString("es-EC")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span>Capturada por: {foto.usuario_nombre}</span>
            </div>
          </div>
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
