"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Download,
  Mail,
  Printer,
  CheckCircle2,
  Clock,
  Wrench,
  Camera,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ServiceDetail } from "@/lib/mis-servicios/types"

interface ServiceCompletionReportProps {
  service: ServiceDetail
  open: boolean
  onClose: () => void
}

export function ServiceCompletionReport({
  service,
  open,
  onClose
}: ServiceCompletionReportProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  // Get all evidence photos
  const getAllPhotos = () => {
    const photos: { url: string; label: string }[] = []

    // Reception photos
    service.recepcion.fotosIngreso.forEach((foto, idx) => {
      photos.push({ url: foto, label: `Ingreso ${idx + 1}` })
    })

    // Timeline evidence photos
    service.timeline.forEach((event) => {
      event.evidencia?.forEach((ev) => {
        if (ev.tipo === "foto") {
          photos.push({ url: ev.url, label: ev.descripcion || event.fase })
        }
      })
    })

    return photos
  }

  const photos = getAllPhotos()
  const completedPhases = service.timeline.filter((e) => e.completada)

  // Format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-EC", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log("Downloading report PDF...")
  }

  const handleEmail = () => {
    // TODO: Implement email sending
    console.log("Sending report by email...")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Reporte de Servicio Completado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 justify-end print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>

            {/* Header info */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {service.vehiculo.marca} {service.vehiculo.modelo}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Placa: {service.vehiculo.placa}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {service.numeroOrden}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">
                      {service.cliente.nombre} {service.cliente.apellido}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Ingreso</p>
                    <p className="font-medium text-sm">
                      {formatDate(service.fechaIngreso)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Finalización</p>
                    <p className="font-medium text-sm">
                      {formatDate(new Date())}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Km Ingreso</p>
                    <p className="font-medium text-sm">
                      {service.recepcion.kilometraje.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Técnico</p>
                    <p className="font-medium text-sm">
                      {service.tecnicoAsignado?.nombre || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completed phases */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Fases Completadas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {completedPhases.map((phase, idx) => (
                    <motion.div
                      key={phase.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{phase.fase}</p>
                        <p className="text-xs text-muted-foreground">
                          {phase.descripcion}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(phase.fecha).toLocaleDateString("es-EC")}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Approved additional work */}
            {service.trabajosAprobados.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Trabajos Adicionales Realizados
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {service.trabajosAprobados.map((work) => (
                      <div
                        key={work.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium text-sm">{work.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {work.descripcion}
                          </p>
                        </div>
                        <p className="font-medium text-sm">
                          ${work.costoTotal.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photo gallery */}
            {photos.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Evidencia Fotográfica ({photos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {photos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className="relative aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors"
                      >
                        <img
                          src={photo.url}
                          alt={photo.label}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                          <p className="text-[10px] text-white truncate">
                            {photo.label}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cost summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resumen de Costos</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Servicio base:</span>
                    <span>
                      ${(service.subtotal - service.trabajosAprobados.reduce((acc, w) => acc + w.costoTotal, 0)).toFixed(2)}
                    </span>
                  </div>
                  {service.trabajosAprobados.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Trabajos adicionales ({service.trabajosAprobados.length}):
                      </span>
                      <span>
                        ${service.trabajosAprobados.reduce((acc, w) => acc + w.costoTotal, 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${service.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (12%):</span>
                    <span>${service.iva.toFixed(2)}</span>
                  </div>
                  {service.descuento > 0 && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>Descuento:</span>
                      <span>-${service.descuento.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">${service.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thank you message */}
            <div className="text-center py-4">
              <p className="text-lg font-semibold">¡Gracias por confiar en Ambacar!</p>
              <p className="text-sm text-muted-foreground">
                Su vehículo está listo para ser retirado
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image viewer modal */}
      {selectedImageIndex !== null && (
        <Dialog
          open={selectedImageIndex !== null}
          onOpenChange={() => setSelectedImageIndex(null)}
        >
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <div className="relative">
              <img
                src={photos[selectedImageIndex].url}
                alt={photos[selectedImageIndex].label}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              {/* Navigation */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={() => setSelectedImageIndex(
                      selectedImageIndex === 0
                        ? photos.length - 1
                        : selectedImageIndex - 1
                    )}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={() => setSelectedImageIndex(
                      selectedImageIndex === photos.length - 1
                        ? 0
                        : selectedImageIndex + 1
                    )}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Caption */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white text-center">
                  {photos[selectedImageIndex].label}
                </p>
                <p className="text-white/70 text-center text-sm">
                  {selectedImageIndex + 1} / {photos.length}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

