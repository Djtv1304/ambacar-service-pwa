"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Image as ImageIcon, Calendar, Car } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthToken } from "@/hooks/use-auth-token"
import { getOrdenesTrabajo, type OrdenTrabajoAPI } from "@/lib/api/ordenes-trabajo"
import { getGaleriaByOT } from "@/lib/api/galeria"
import type { GaleriaOTResponse } from "@/lib/types"
import { toast } from "sonner"

interface OTWithPreview extends OrdenTrabajoAPI {
  previewImage?: string
  totalFotos?: number
}

export default function MultimediaPage() {
  const router = useRouter()
  const { getToken } = useAuthToken()
  const [loading, setLoading] = useState(true)
  const [ordenesConFotos, setOrdenesConFotos] = useState<OTWithPreview[]>([])

  useEffect(() => {
    loadOrdenesConFotos()
  }, [])

  const loadOrdenesConFotos = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        toast.error("Error de autenticación", {
          description: "No se pudo obtener el token de acceso",
        })
        return
      }

      // Obtener todas las órdenes de trabajo
      const ordenes = await getOrdenesTrabajo(token)

      // Para cada OT, obtener su galería y extraer la primera imagen
      const ordenesConPreview = await Promise.all(
        ordenes.map(async (ot: OrdenTrabajoAPI) => {
          try {
            const galeria: GaleriaOTResponse = await getGaleriaByOT(ot.id, token)

            // Buscar la primera imagen disponible en cualquier fase
            let primeraImagen: string | undefined

            if (galeria.recepcion.length > 0) {
              primeraImagen = galeria.recepcion[0].imagen_url_firmada
            } else if (galeria.inspecciones.length > 0) {
              primeraImagen = galeria.inspecciones[0].imagen_url_firmada
            } else if (galeria.diagnostico.length > 0) {
              primeraImagen = galeria.diagnostico[0].imagen_url_firmada
            } else if (galeria.reparacion.length > 0) {
              primeraImagen = galeria.reparacion[0].imagen_url_firmada
            } else if (galeria.entrega.length > 0) {
              primeraImagen = galeria.entrega[0].imagen_url_firmada
            }

            return {
              ...ot,
              previewImage: primeraImagen,
              totalFotos: galeria.total_fotos,
            }
          } catch (error) {
            console.error(`Error cargando galería para OT ${ot.numero_orden}:`, error)
            return {
              ...ot,
              previewImage: undefined,
              totalFotos: 0,
            }
          }
        })
      )

      // Filtrar solo las OT que tienen fotos
      const ordenesConImagenes = ordenesConPreview.filter((ot: OTWithPreview) => ot.previewImage)
      setOrdenesConFotos(ordenesConImagenes)
    } catch (error) {
      console.error("Error cargando órdenes de trabajo:", error)
      toast.error("Error", {
        description: "No se pudieron cargar las órdenes de trabajo",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOTClick = (otId: number) => {
    router.push(`/dashboard/multimedia/${otId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#ED1C24]" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#202020] mb-2">Registro Multimedia</h1>
        <p className="text-gray-600">
          Galería fotográfica de todas las órdenes de trabajo
        </p>
      </div>

      {ordenesConFotos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">No hay registros multimedia</p>
            <p className="text-gray-500 text-sm">
              Las fotografías aparecerán aquí cuando se capturen durante el proceso de trabajo
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ordenesConFotos.map((ot, index) => (
            <motion.div
              key={ot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden group"
                onClick={() => handleOTClick(ot.id)}
              >
                <div className="relative aspect-video bg-gray-100">
                  {ot.previewImage ? (
                    <img
                      src={ot.previewImage}
                      alt={`OT ${ot.numero_orden}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-[#ED1C24]">
                    {ot.totalFotos || 0} fotos
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#202020]">OT {ot.numero_orden}</h3>
                      <Badge variant="outline" className="text-xs">
                        {ot.estado_detalle.nombre}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="truncate">
                          {ot.vehiculo_detalle.placa} - {ot.vehiculo_detalle.marca}{" "}
                          {ot.vehiculo_detalle.modelo}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {new Date(ot.fecha_apertura).toLocaleDateString("es-EC", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Cliente: {ot.cliente_detalle.first_name} {ot.cliente_detalle.last_name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
