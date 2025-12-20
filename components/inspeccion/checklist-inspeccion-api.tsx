"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, AlertTriangle, XCircle, Ruler, Camera, ImagePlus } from "lucide-react"
import { motion } from "framer-motion"
import type { PuntoInspeccionEvaluado, PuntoInspeccionCatalogo, ItemInspeccion } from "@/lib/types"
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
                              <p className="text-xs text-purple-600 flex items-center gap-1">
                                <Camera className="h-3 w-3" />
                                {fotosActuales} foto(s) adjunta(s)
                              </p>
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
                              <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                                <Camera className="h-3 w-3" />
                                {fotosActuales} foto(s) adjunta(s)
                              </p>
                            )}
                          </div>
                        </div>
                      </Button>

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
    </>
  )
}
