"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, AlertTriangle, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import { PUNTOS_INSPECCION } from "@/lib/inspeccion/constants"
import type { PuntoInspeccionEvaluado } from "@/lib/types"
import { EvaluacionPuntoDialog } from "./evaluacion-punto-dialog"
import { cn } from "@/lib/utils"

interface ChecklistInspeccionProps {
  evaluaciones: PuntoInspeccionEvaluado[]
  onGuardarEvaluacion: (evaluacion: PuntoInspeccionEvaluado) => Promise<void>
}

export function ChecklistInspeccion({ evaluaciones, onGuardarEvaluacion }: ChecklistInspeccionProps) {
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<(typeof PUNTOS_INSPECCION)[number] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const puntosCompletados = evaluaciones.filter((e) => e.completado).length
  const progreso = (puntosCompletados / PUNTOS_INSPECCION.length) * 100

  const handleClickPunto = (punto: (typeof PUNTOS_INSPECCION)[number]) => {
    setPuntoSeleccionado(punto)
    setDialogOpen(true)
  }

  const getEstadoIcon = (puntoId: string) => {
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
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getEstadoBadge = (puntoId: string) => {
    const evaluacion = evaluaciones.find((e) => e.punto_id === puntoId)
    if (!evaluacion || !evaluacion.completado) {
      return null
    }

    const badgeConfig = {
      verde: { text: "Óptimo", className: "bg-green-500/10 text-green-700 border-green-500/20" },
      amarillo: { text: "Precaución", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
      rojo: { text: "Crítico", className: "bg-red-500/10 text-red-700 border-red-500/20" },
    }

    const config = badgeConfig[evaluacion.estado]
    return (
      <Badge variant="outline" className={config.className}>
        {config.text}
      </Badge>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Puntos de Inspección</CardTitle>
              <CardDescription>Completa los 23 puntos de inspección del vehículo</CardDescription>
            </div>
            <Badge className="bg-[#ED1C24]/10 text-[#ED1C24] border-[#ED1C24]/20 text-lg px-4 py-2">
              {puntosCompletados}/{PUNTOS_INSPECCION.length}
            </Badge>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progreso de Inspección</span>
              <span className="text-muted-foreground">{progreso.toFixed(0)}% completado</span>
            </div>
            <Progress value={progreso} className="h-2" />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            {PUNTOS_INSPECCION.map((punto, index) => {
              const evaluacion = evaluaciones.find((e) => e.punto_id === punto.id)
              const completado = evaluacion?.completado || false

              return (
                <motion.div
                  key={punto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start h-auto p-4 text-left hover:bg-accent transition-colors",
                      completado && "border-2",
                      completado && evaluacion.estado === "verde" && "border-green-200 bg-green-50/50",
                      completado && evaluacion.estado === "amarillo" && "border-yellow-200 bg-yellow-50/50",
                      completado && evaluacion.estado === "rojo" && "border-red-200 bg-red-50/50",
                    )}
                    onClick={() => handleClickPunto(punto)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0 mt-0.5">{getEstadoIcon(punto.id)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-gray-500">#{punto.orden}</span>
                            <h4 className="font-semibold text-base">{punto.nombre}</h4>
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
                        {evaluacion?.fotos && evaluacion.fotos.length > 0 && (
                          <p className="text-xs text-blue-600 mt-1">📷 {evaluacion.fotos.length} foto(s) adjunta(s)</p>
                        )}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {puntoSeleccionado && (
        <EvaluacionPuntoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          puntoId={puntoSeleccionado.id}
          puntoNombre={puntoSeleccionado.nombre}
          puntoDescripcion={puntoSeleccionado.descripcion}
          evaluacionExistente={evaluaciones.find((e) => e.punto_id === puntoSeleccionado.id)}
          onGuardar={onGuardarEvaluacion}
        />
      )}
    </>
  )
}
