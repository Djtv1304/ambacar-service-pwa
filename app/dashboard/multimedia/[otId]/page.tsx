"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Loader2,
  ArrowLeft,
  Calendar,
  User,
  Image as ImageIcon,
  FileImage,
  ExternalLink,
  Filter,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useAuthToken } from "@/hooks/use-auth-token"
import { getOrdenTrabajoDetalle } from "@/lib/api/ordenes-trabajo"
import { getGaleriaByOT, getUserById } from "@/lib/api/galeria"
import type { OrdenTrabajoDetalle, GaleriaOTResponse, MediaItem, MediaType, User as UserType } from "@/lib/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type FilterOption = MediaType | "TODAS"

const FILTER_LABELS: Record<FilterOption, string> = {
  TODAS: "Todas las fotos",
  RECEPCION: "Recepción",
  DIAGNOSTICO: "Diagnóstico",
  REPARACION: "Reparación",
  ENTREGA: "Entrega",
  INSPECCION: "Inspecciones",
}

const FILTER_COLORS: Record<FilterOption, string> = {
  TODAS: "bg-gray-100 text-gray-700",
  RECEPCION: "bg-blue-100 text-blue-700",
  DIAGNOSTICO: "bg-purple-100 text-purple-700",
  REPARACION: "bg-orange-100 text-orange-700",
  ENTREGA: "bg-green-100 text-green-700",
  INSPECCION: "bg-red-100 text-red-700",
}

export default function MultimediaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getToken } = useAuthToken()
  const otId = parseInt(params.otId as string)

  const [loading, setLoading] = useState(true)
  const [ordenTrabajo, setOrdenTrabajo] = useState<OrdenTrabajoDetalle | null>(null)
  const [galeria, setGaleria] = useState<GaleriaOTResponse | null>(null)
  const [filtroActivo, setFiltroActivo] = useState<FilterOption>("TODAS")
  const [imagenSeleccionada, setImagenSeleccionada] = useState<MediaItem | null>(null)
  const [usuariosCache, setUsuariosCache] = useState<Record<number, UserType>>({})
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [otId])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        toast.error("Error de autenticación")
        return
      }

      // Cargar OT primero
      const otData = await getOrdenTrabajoDetalle(otId, token)
      setOrdenTrabajo(otData)

      // Intentar cargar galería
      let galeriaData: GaleriaOTResponse
      try {
        galeriaData = await getGaleriaByOT(otId, token)
        setGaleria(galeriaData)
      } catch (galeriaError: any) {
        console.error("Error cargando galería:", galeriaError)
        // Si la galería no existe, crear estructura vacía
        galeriaData = {
          orden_trabajo_id: otId,
          total_fotos: 0,
          total_con_anotaciones: 0,
          recepcion: [],
          diagnostico: [],
          reparacion: [],
          entrega: [],
          inspecciones: [],
        }
        setGaleria(galeriaData)
        toast.warning("Sin fotografías", {
          description: "Esta orden de trabajo aún no tiene fotografías registradas",
        })
      }

      // Cargar información de usuarios únicos solo si hay fotos
      if (galeriaData.total_fotos > 0) {
        const usuariosUnicos = new Set<number>()
        ;[...galeriaData.recepcion, ...galeriaData.diagnostico, ...galeriaData.reparacion, ...galeriaData.entrega, ...galeriaData.inspecciones].forEach(
          (media) => usuariosUnicos.add(media.usuario_id)
        )

        const usuariosData: Record<number, UserType> = {}
        await Promise.all(
          Array.from(usuariosUnicos).map(async (userId) => {
            try {
              const user = await getUserById(userId, token)
              usuariosData[userId] = user
            } catch (error) {
              console.error(`Error cargando usuario ${userId}:`, error)
            }
          })
        )
        setUsuariosCache(usuariosData)
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
      toast.error("Error", {
        description: "No se pudieron cargar los datos",
      })
    } finally {
      setLoading(false)
    }
  }

  const getImagenesFiltradas = (): MediaItem[] => {
    if (!galeria) return []

    if (filtroActivo === "TODAS") {
      return [
        ...galeria.recepcion,
        ...galeria.diagnostico,
        ...galeria.reparacion,
        ...galeria.entrega,
        ...galeria.inspecciones,
      ]
    }

    switch (filtroActivo) {
      case "RECEPCION":
        return galeria.recepcion
      case "DIAGNOSTICO":
        return galeria.diagnostico
      case "REPARACION":
        return galeria.reparacion
      case "ENTREGA":
        return galeria.entrega
      case "INSPECCION":
        return galeria.inspecciones
      default:
        return []
    }
  }

  const getContadorPorFase = (fase: FilterOption): number => {
    if (!galeria) return 0
    if (fase === "TODAS") return galeria.total_fotos

    switch (fase) {
      case "RECEPCION":
        return galeria.recepcion.length
      case "DIAGNOSTICO":
        return galeria.diagnostico.length
      case "REPARACION":
        return galeria.reparacion.length
      case "ENTREGA":
        return galeria.entrega.length
      case "INSPECCION":
        return galeria.inspecciones.length
      default:
        return 0
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const imagenesFiltradas = getImagenesFiltradas()

  const FilterSidebar = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtrar por Fase
        </h3>
        {mobileFiltersOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileFiltersOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {(Object.keys(FILTER_LABELS) as FilterOption[]).map((filtro) => {
        const contador = getContadorPorFase(filtro)
        if (contador === 0 && filtro !== "TODAS") return null

        return (
          <button
            key={filtro}
            onClick={() => {
              setFiltroActivo(filtro)
              setMobileFiltersOpen(false)
            }}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between",
              filtroActivo === filtro
                ? "bg-[#ED1C24] text-white shadow-md"
                : "bg-white hover:bg-gray-50 text-gray-700"
            )}
          >
            <span className="font-medium text-sm">{FILTER_LABELS[filtro]}</span>
            <Badge
              className={cn(
                "ml-2",
                filtroActivo === filtro ? "bg-white/20 text-white" : FILTER_COLORS[filtro]
              )}
            >
              {contador}
            </Badge>
          </button>
        )
      })}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#ED1C24]" />
      </div>
    )
  }

  if (!ordenTrabajo || !galeria) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No se encontraron datos</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/multimedia")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Multimedia
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#202020] mb-2">
              Registro Fotográfico
            </h1>
            <p className="text-gray-600">
              Orden de Trabajo: {ordenTrabajo.numero_orden} • {galeria.total_fotos} fotografías
            </p>
          </div>

          <Badge
            variant="outline"
            className="w-fit px-4 py-2"
            style={{ borderColor: ordenTrabajo.estado_detalle.color }}
          >
            <div
              className="h-2 w-2 rounded-full mr-2"
              style={{ backgroundColor: ordenTrabajo.estado_detalle.color }}
            />
            {ordenTrabajo.estado_detalle.nombre}
          </Badge>
        </div>

        {/* OT Info */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Cliente:</span>
                <p className="font-medium">
                  {ordenTrabajo.cliente_detalle.first_name} {ordenTrabajo.cliente_detalle.last_name}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Vehículo:</span>
                <p className="font-medium">
                  {ordenTrabajo.vehiculo_detalle.placa} -{" "}
                  {ordenTrabajo.vehiculo_detalle.modelo_tecnico_detalle?.marca}{" "}
                  {ordenTrabajo.vehiculo_detalle.modelo_tecnico_detalle?.modelo}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Fecha Apertura:</span>
                <p className="font-medium">
                  {new Date(ordenTrabajo.fecha_apertura).toLocaleDateString("es-EC", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="w-full"
          variant="outline"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros ({FILTER_LABELS[filtroActivo]})
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Card>
              <CardContent className="p-4">
                <FilterSidebar />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setMobileFiltersOpen(false)}>
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="bg-white h-full w-80 p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <FilterSidebar />
            </motion.div>
          </div>
        )}

        {/* Images Grid */}
        <div className="lg:col-span-3">
          {imagenesFiltradas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No hay fotografías en esta fase</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {imagenesFiltradas.map((media, index) => (
                <motion.div
                  key={media.media_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden"
                    onClick={() => setImagenSeleccionada(media)}
                  >
                    <div className="relative aspect-video bg-gray-100">
                      <img
                        src={media.imagen_url_firmada}
                        alt={media.tipo_foto}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      <Badge className={cn("absolute top-2 left-2", FILTER_COLORS[media.media_type])}>
                        {FILTER_LABELS[media.media_type]}
                      </Badge>
                    </div>

                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-[#202020] truncate">
                            {media.tipo_foto}
                          </h4>
                          <FileImage className="h-4 w-4 text-gray-400" />
                        </div>

                        {media.punto_inspeccion && (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {media.punto_inspeccion}
                            </Badge>
                            {media.estado_inspeccion && (
                              <Badge
                                className={cn(
                                  "text-xs",
                                  media.estado_inspeccion === "VERDE" && "bg-green-500",
                                  media.estado_inspeccion === "AMARILLO" && "bg-yellow-500",
                                  media.estado_inspeccion === "ROJO" && "bg-red-500"
                                )}
                              >
                                {media.estado_inspeccion}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(media.fecha_captura).toLocaleString("es-EC", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>

                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {usuariosCache[media.usuario_id]
                              ? `${usuariosCache[media.usuario_id].first_name} ${usuariosCache[media.usuario_id].last_name}`
                              : `Usuario #${media.usuario_id}`}
                          </div>

                          <div className="text-gray-400">
                            {media.ancho_px}x{media.alto_px} • {formatBytes(media.tamano_bytes)} • {media.formato}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={!!imagenSeleccionada} onOpenChange={() => setImagenSeleccionada(null)}>
        <DialogContent className="max-w-5xl p-0">
          {imagenSeleccionada && (
            <div className="relative">
              <img
                src={imagenSeleccionada.imagen_url_firmada}
                alt={imagenSeleccionada.tipo_foto}
                className="w-full h-auto max-h-[80vh] object-contain bg-black"
              />

              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold text-[#202020] mb-2">
                      {imagenSeleccionada.tipo_foto}
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={FILTER_COLORS[imagenSeleccionada.media_type]}>
                        {FILTER_LABELS[imagenSeleccionada.media_type]}
                      </Badge>
                      {imagenSeleccionada.punto_inspeccion && (
                        <>
                          <Badge variant="outline">{imagenSeleccionada.punto_inspeccion}</Badge>
                          {imagenSeleccionada.estado_inspeccion && (
                            <Badge
                              className={cn(
                                imagenSeleccionada.estado_inspeccion === "VERDE" && "bg-green-500",
                                imagenSeleccionada.estado_inspeccion === "AMARILLO" && "bg-yellow-500",
                                imagenSeleccionada.estado_inspeccion === "ROJO" && "bg-red-500"
                              )}
                            >
                              {imagenSeleccionada.estado_inspeccion}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => window.open(imagenSeleccionada.imagen_url_firmada, "_blank")}
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir original
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Capturada por:</span>
                    <p className="font-medium">
                      {usuariosCache[imagenSeleccionada.usuario_id]
                        ? `${usuariosCache[imagenSeleccionada.usuario_id].first_name} ${usuariosCache[imagenSeleccionada.usuario_id].last_name}`
                        : `Usuario #${imagenSeleccionada.usuario_id}`}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">Fecha:</span>
                    <p className="font-medium">
                      {new Date(imagenSeleccionada.fecha_captura).toLocaleString("es-EC", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">Dimensiones:</span>
                    <p className="font-medium">
                      {imagenSeleccionada.ancho_px} x {imagenSeleccionada.alto_px} px
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">Tamaño:</span>
                    <p className="font-medium">
                      {formatBytes(imagenSeleccionada.tamano_bytes)} ({imagenSeleccionada.formato})
                    </p>
                  </div>
                </div>

                {imagenSeleccionada.tiene_anotaciones && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      Esta imagen tiene {imagenSeleccionada.total_anotaciones} anotaciones
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
