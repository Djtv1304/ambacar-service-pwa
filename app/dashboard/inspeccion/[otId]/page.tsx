"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Save,
  CheckCircle,
  ExternalLink,
  Loader2,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChecklistInspeccionApi } from "@/components/inspeccion/checklist-inspeccion-api"
import {
  getCatalogoInspecciones,
  getInspecciones,
  getInspeccionDetalle,
  createInspeccion,
  createItemInspeccion,
  updateObservacionesGenerales,
  completarInspeccion,
  uploadFotoInspeccion,
} from "@/lib/api/inspecciones"
import { useAuthToken } from "@/hooks/use-auth-token"
import type { PuntoInspeccionEvaluado, PuntoInspeccionCatalogo, InspeccionDetalle, FotoInspeccion } from "@/lib/types"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"

export default function InspeccionPage({ params }: { params: Promise<{ otId: string }> }) {
  const resolvedParams = use(params)
  const otId = resolvedParams.otId
  const router = useRouter()

  const [puntosInspeccion, setPuntosInspeccion] = useState<PuntoInspeccionCatalogo[]>([])
  const [evaluaciones, setEvaluaciones] = useState<PuntoInspeccionEvaluado[]>([])
  const [inspeccionExistente, setInspeccionExistente] = useState<InspeccionDetalle | null>(null)
  const [observacionesGenerales, setObservacionesGenerales] = useState("")
  const [editandoObservaciones, setEditandoObservaciones] = useState(false)
  const [loading, setLoading] = useState(true)
  const [iniciandoInspeccion, setIniciandoInspeccion] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [showResumenDialog, setShowResumenDialog] = useState(false)
  const [resumenFinalizacion, setResumenFinalizacion] = useState<any>(null)
  const { getToken } = useAuthToken()

  // Load catálogo de inspecciones y evaluaciones existentes
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await getToken()
        if (!token) {
          toast.error("No se encontró token de autenticación")
          setLoading(false)
          return
        }

        // Cargar catálogo de inspecciones desde la API
        const catalogo = await getCatalogoInspecciones(token)

        // Ordenar por orden_visualizacion
        const catalogoOrdenado = catalogo.sort((a, b) => a.orden_visualizacion - b.orden_visualizacion)
        setPuntosInspeccion(catalogoOrdenado)

        // Buscar si existe una inspección para esta OT
        const inspecciones = await getInspecciones(token)
        const inspeccionParaOT = inspecciones.find((insp) => insp.orden_trabajo === parseInt(otId))

        if (inspeccionParaOT) {
          // Cargar el detalle completo de la inspección
          const detalle = await getInspeccionDetalle(inspeccionParaOT.id, token)
          setInspeccionExistente(detalle)
          setObservacionesGenerales(detalle.observaciones_generales || "")

          // Mapear los items de la inspección a evaluaciones locales
          const evaluacionesMapeadas: PuntoInspeccionEvaluado[] = detalle.items.map((item) => ({
            punto_id: item.item_catalogo,
            nombre: item.item_catalogo_info.nombre,
            estado:
              item.estado === "VERDE"
                ? "verde"
                : item.estado === "AMARILLO"
                  ? "amarillo"
                  : item.estado === "ROJO"
                    ? "rojo"
                    : "na",
            observaciones: item.observacion || undefined,
            fotos: item.fotos.map((foto) => ({
              id: foto.id.toString(),
              archivo: null as any,
              preview: foto.url_imagen,
              orden: 0,
            })),
            mediciones: item.mediciones || undefined,
            completado: item.aplica,
          }))

          setEvaluaciones(evaluacionesMapeadas)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Error al cargar los datos de inspección")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [otId, getToken])

  const handleIniciarInspeccion = async () => {
    setIniciandoInspeccion(true)
    try {
      const token = await getToken()
      if (!token) {
        toast.error("No se encontró token de autenticación")
        return
      }

      const nuevaInspeccion = await createInspeccion(parseInt(otId), observacionesGenerales || undefined, token)

      setInspeccionExistente(nuevaInspeccion)
      toast.success("Inspección iniciada", {
        description: `Se creó la inspección ${nuevaInspeccion.numero_inspeccion}`,
      })
    } catch (error) {
      console.error("Error iniciando inspección:", error)
      toast.error("Error al iniciar la inspección")
    } finally {
      setIniciandoInspeccion(false)
    }
  }

  const handleGuardarObservaciones = async () => {
    if (!inspeccionExistente) return

    try {
      const token = await getToken()
      if (!token) {
        toast.error("No se encontró token de autenticación")
        return
      }

      const inspeccionActualizada = await updateObservacionesGenerales(
        inspeccionExistente.id,
        observacionesGenerales,
        token
      )

      setInspeccionExistente(inspeccionActualizada)
      setEditandoObservaciones(false)
      toast.success("Observaciones actualizadas")
    } catch (error) {
      console.error("Error actualizando observaciones:", error)
      toast.error("Error al actualizar las observaciones")
    }
  }

  const handleGuardarEvaluacion = async (evaluacion: PuntoInspeccionEvaluado) => {
    if (!inspeccionExistente) {
      toast.error("Debe iniciar la inspección primero")
      return
    }

    try {
      const token = await getToken()
      if (!token) {
        toast.error("No se encontró token de autenticación")
        return
      }

      // Buscar si ya existe un item para este punto (para actualizar en lugar de crear)
      const itemExistente = inspeccionExistente.items.find((item) => item.item_catalogo === evaluacion.punto_id)

      if (itemExistente) {
        // Actualizar item existente con PATCH
        const { updateItemInspeccion } = await import("@/lib/api/inspecciones")
        await updateItemInspeccion(
          itemExistente.id,
          {
            estado: evaluacion.estado.toUpperCase() as "VERDE" | "AMARILLO" | "ROJO" | "N/A",
            aplica: evaluacion.estado !== "na",
            observacion: evaluacion.observaciones,
            mediciones: evaluacion.mediciones,
          },
          token
        )
      } else {
        // Crear nuevo item de inspección
        const itemData = {
          inspeccion: inspeccionExistente.id,
          item_catalogo: evaluacion.punto_id,
          estado: evaluacion.estado.toUpperCase() as "VERDE" | "AMARILLO" | "ROJO" | "N/A",
          aplica: evaluacion.estado !== "na",
          observacion: evaluacion.observaciones,
          mediciones: evaluacion.mediciones,
        }

        await createItemInspeccion(itemData, token)
      }

      // Recargar inspección para obtener datos actualizados (incluye el ID del item creado)
      const inspeccionActualizada = await getInspeccionDetalle(inspeccionExistente.id, token)
      setInspeccionExistente(inspeccionActualizada)

      // Actualizar evaluaciones locales
      setEvaluaciones((prev) => {
        const index = prev.findIndex((e) => e.punto_id === evaluacion.punto_id)
        if (index >= 0) {
          const newEvaluaciones = [...prev]
          newEvaluaciones[index] = evaluacion
          return newEvaluaciones
        } else {
          return [...prev, evaluacion]
        }
      })

      toast.success("Evaluación guardada", {
        description: `Se guardó la evaluación del punto: ${evaluacion.nombre}`,
      })
    } catch (error) {
      console.error("Error al guardar evaluación:", error)
      toast.error("Error al guardar la evaluación")
    }
  }

  const handleFotosSubidas = async () => {
    // Recargar inspección después de subir fotos
    try {
      const token = await getToken()
      if (!token || !inspeccionExistente) return

      const inspeccionActualizada = await getInspeccionDetalle(inspeccionExistente.id, token)
      setInspeccionExistente(inspeccionActualizada)

      // Actualizar evaluaciones locales con las fotos
      const evaluacionesMapeadas: PuntoInspeccionEvaluado[] = inspeccionActualizada.items.map((item) => ({
        punto_id: item.item_catalogo,
        nombre: item.item_catalogo_info.nombre,
        estado:
          item.estado === "VERDE" ? "verde" : item.estado === "AMARILLO" ? "amarillo" : item.estado === "ROJO" ? "rojo" : "na",
        observaciones: item.observacion || undefined,
        fotos: item.fotos.map((foto) => ({
          id: foto.id.toString(),
          archivo: null as any,
          preview: foto.url_imagen,
          orden: 0,
        })),
        mediciones: item.mediciones || undefined,
        completado: item.aplica,
      }))

      setEvaluaciones(evaluacionesMapeadas)

      toast.success("Fotos subidas correctamente")
    } catch (error) {
      console.error("Error al recargar inspección:", error)
      toast.error("Error al actualizar la inspección")
    }
  }

  const handleFinalizarInspeccion = async () => {
    if (!inspeccionExistente) return

    const puntosCompletados = evaluaciones.filter((e) => e.completado).length

    // Validar que estén los 23 puntos completos
    if (puntosCompletados < puntosInspeccion.length) {
      toast.error("Inspección incompleta", {
        description: `Debes completar todos los ${puntosInspeccion.length} puntos antes de finalizar. Completados: ${puntosCompletados}`,
      })
      return
    }

    setGuardando(true)
    try {
      const token = await getToken()
      if (!token) {
        toast.error("No se encontró token de autenticación")
        setGuardando(false)
        return
      }

      const resultado = await completarInspeccion(inspeccionExistente.id, token)

      setResumenFinalizacion(resultado)
      setShowResumenDialog(true)

      // Actualizar inspección local
      setInspeccionExistente(resultado.inspeccion)
    } catch (error) {
      console.error("Error finalizando inspección:", error)
      toast.error("Error al finalizar la inspección")
    } finally {
      setGuardando(false)
    }
  }

  const handleCerrarResumen = () => {
    setShowResumenDialog(false)
    router.push("/dashboard/inspecciones")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const puntosCompletados = evaluaciones.filter((e) => e.completado).length
  const todosCompletados = puntosCompletados === puntosInspeccion.length
  const esReadOnly = inspeccionExistente?.estado === "COMPLETADA"

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Si no hay inspección, mostrar opción de iniciar
  if (!inspeccionExistente) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/ot/${otId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nueva Inspección</h1>
            <p className="text-muted-foreground mt-1">Orden de Trabajo #{otId}</p>
          </div>
        </div>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Iniciar Inspección
            </CardTitle>
            <CardDescription className="text-blue-700">
              Comienza el proceso de inspección para esta orden de trabajo. Se evaluarán {puntosInspeccion.length}{" "}
              puntos del vehículo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="observaciones-iniciales">Observaciones Generales (Opcional)</Label>
              <Textarea
                id="observaciones-iniciales"
                placeholder="Agrega observaciones iniciales sobre la inspección..."
                value={observacionesGenerales}
                onChange={(e) => setObservacionesGenerales(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleIniciarInspeccion}
              disabled={iniciandoInspeccion}
              size="lg"
              className="w-full bg-[#ED1C24] hover:bg-[#c41820]"
            >
              {iniciandoInspeccion ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Iniciar Inspección
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile: 3 filas, Desktop: layout original */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Fila 1 Mobile: Volver | Desktop: parte del layout normal */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" asChild className="sm:size-icon sm:p-2">
            <Link href={inspeccionExistente ? "/dashboard/inspecciones" : `/dashboard/ot/${otId}`} className="flex items-center gap-1">
              <ArrowLeft className="h-5 w-5" />
              <span className="sm:hidden">Volver</span>
            </Link>
          </Button>

          {/* Fila 2 en Desktop: Título e info (oculto en mobile aquí) */}
          <div className="hidden sm:block">
            <h1 className="text-3xl font-bold tracking-tight">
              {inspeccionExistente ? inspeccionExistente.numero_inspeccion : "Nueva Inspección"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {inspeccionExistente
                ? `${inspeccionExistente.orden_trabajo_info.numero_orden} - ${inspeccionExistente.orden_trabajo_info.vehiculo_placa}`
                : `Orden de Trabajo #${otId}`}
            </p>
          </div>
        </div>

        {/* Fila 2 Mobile: Título e info */}
        <div className="sm:hidden">
          <h1 className="text-2xl font-bold tracking-tight">
            {inspeccionExistente ? inspeccionExistente.numero_inspeccion : "Nueva Inspección"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {inspeccionExistente
              ? `${inspeccionExistente.orden_trabajo_info.numero_orden} - ${inspeccionExistente.orden_trabajo_info.vehiculo_placa}`
              : `Orden de Trabajo #${otId}`}
          </p>
        </div>

        {/* Fila 3 Mobile / Derecha Desktop: Badge + Botón */}
        <div className="flex items-center gap-2 flex-wrap">
          {inspeccionExistente && (
            <>
              {inspeccionExistente.estado === "PENDIENTE" && (
                <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-sm sm:text-base px-3 sm:px-4 h-9 sm:h-10 flex items-center">
                  Pendiente
                </Badge>
              )}
              {inspeccionExistente.estado === "EN_PROCESO" && (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-sm sm:text-base px-3 sm:px-4 h-9 sm:h-10 flex items-center">
                  En Proceso
                </Badge>
              )}
              {inspeccionExistente.estado === "COMPLETADA" && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-sm sm:text-base px-3 sm:px-4 h-9 sm:h-10 flex items-center">
                  Completada
                </Badge>
              )}
            </>
          )}
          {!esReadOnly && (
            <Button
              onClick={handleFinalizarInspeccion}
              disabled={!todosCompletados || guardando}
              size="default"
              className="bg-green-600 hover:bg-green-700 text-sm sm:text-base h-9 sm:h-10"
            >
              {guardando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Finalizando...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Finalizar Inspección</span>
                  <span className="sm:hidden">Finalizar</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards cuando existe inspección */}
      {inspeccionExistente && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Orden de Trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{inspeccionExistente.orden_trabajo_info.numero_orden}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Placa: {inspeccionExistente.orden_trabajo_info.vehiculo_placa}
                  </p>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dashboard/ot/${otId}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{inspeccionExistente.orden_trabajo_info.cliente_nombre}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Km: {inspeccionExistente.orden_trabajo_info.kilometraje_ingreso.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Inspector</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{inspeccionExistente.inspector_info.nombre_completo}</p>
              <p className="text-xs text-muted-foreground mt-1">Rol: {inspeccionExistente.inspector_info.role}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Fecha de Inspección</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{formatFecha(inspeccionExistente.fecha_inspeccion)}</p>
              {inspeccionExistente.fecha_completada && (
                <p className="text-xs text-muted-foreground mt-1">
                  Completada: {formatFecha(inspeccionExistente.fecha_completada)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Card cuando existe inspección */}
      {inspeccionExistente && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Progreso de Inspección</CardTitle>
                <CardDescription>
                  {inspeccionExistente.items_completados} de {inspeccionExistente.items_totales} puntos completados
                </CardDescription>
              </div>
              <Badge className="bg-[#ED1C24]/10 text-[#ED1C24] border-[#ED1C24]/20 text-lg px-4 py-2">
                {inspeccionExistente.porcentaje_completado}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={inspeccionExistente.porcentaje_completado} className="h-2" />

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Óptimo</p>
                  <p className="text-lg font-bold">{inspeccionExistente.resumen.items_verde}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Precaución</p>
                  <p className="text-lg font-bold">{inspeccionExistente.resumen.items_amarillo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Crítico</p>
                  <p className="text-lg font-bold">{inspeccionExistente.resumen.items_rojo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <div>
                  <p className="text-xs text-muted-foreground">N/A</p>
                  <p className="text-lg font-bold">{inspeccionExistente.resumen.items_na}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observaciones Generales - Editable */}
      {inspeccionExistente && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observaciones Generales
              </CardTitle>
              {!esReadOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditandoObservaciones(!editandoObservaciones)}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  {editandoObservaciones ? "Cancelar" : "Editar"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editandoObservaciones ? (
              <div className="space-y-2">
                <Textarea
                  value={observacionesGenerales}
                  onChange={(e) => setObservacionesGenerales(e.target.value)}
                  rows={4}
                  className="resize-none bg-white"
                  placeholder="Agrega observaciones generales sobre la inspección..."
                />
                <div className="flex justify-end">
                  <Button onClick={handleGuardarObservaciones} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-blue-800">
                {observacionesGenerales || "Sin observaciones generales"}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alert when ready to finalize */}
      {todosCompletados && !esReadOnly && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900 font-medium">
            ¡Todos los puntos completados! Ya puedes finalizar la inspección usando el botón en la parte superior.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert when is read-only */}
      {esReadOnly && (
        <Alert className="bg-gray-50 border-gray-200">
          <CheckCircle className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-900 font-medium">
            Esta inspección está completada. Los puntos se muestran en modo lectura solamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Checklist */}
      {puntosInspeccion.length > 0 && inspeccionExistente && (
        <ChecklistInspeccionApi
          puntosInspeccion={puntosInspeccion}
          evaluaciones={evaluaciones}
          itemsInspeccion={inspeccionExistente.items}
          onGuardarEvaluacion={esReadOnly ? async () => {} : handleGuardarEvaluacion}
          onFotosSubidas={handleFotosSubidas}
          readOnly={esReadOnly}
        />
      )}

      {/* Diálogo de Resumen de Finalización */}
      <Dialog open={showResumenDialog} onOpenChange={setShowResumenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Inspección Completada
            </DialogTitle>
            <DialogDescription>
              La inspección {resumenFinalizacion?.inspeccion?.numero_inspeccion} ha sido finalizada exitosamente.
            </DialogDescription>
          </DialogHeader>

          {resumenFinalizacion && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Óptimo</p>
                    <p className="text-2xl font-bold text-green-600">{resumenFinalizacion.resumen.verde}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Precaución</p>
                    <p className="text-2xl font-bold text-yellow-600">{resumenFinalizacion.resumen.amarillo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Crítico</p>
                    <p className="text-2xl font-bold text-red-600">{resumenFinalizacion.resumen.rojo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">No Aplica</p>
                    <p className="text-2xl font-bold text-gray-600">{resumenFinalizacion.resumen.n_a}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button onClick={handleCerrarResumen} className="w-full bg-[#ED1C24] hover:bg-[#c41820]">
                  Ver Lista de Inspecciones
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
