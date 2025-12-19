"use client"

import { useEffect } from "react"
import { Download, Mail, Printer, FileWarning, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ServiceDetail } from "@/lib/mis-servicios/types"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"

interface ProformaSheetProps {
  service: ServiceDetail
  open: boolean
  onClose: () => void
}

interface ProformaItem {
  descripcion: string
  detalle?: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export function ProformaSheet({ service, open, onClose }: ProformaSheetProps) {
  const isMobile = useIsMobile()

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      // Save current scroll position and lock
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'

      return () => {
        // Restore scroll position when modal closes
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [open])

  // Build proforma items from service data
  const buildProformaItems = (): ProformaItem[] => {
    const items: ProformaItem[] = []

    // Base service
    const baseServiceCost = service.subtotal -
      service.trabajosAprobados.reduce((acc, w) => acc + w.costoTotal, 0)

    items.push({
      descripcion: "Servicio Base",
      detalle: service.servicioSolicitado,
      cantidad: 1,
      precioUnitario: baseServiceCost,
      subtotal: baseServiceCost,
    })

    // Add approved additional work
    service.trabajosAprobados.forEach((work) => {
      items.push({
        descripcion: work.titulo,
        detalle: work.descripcion,
        cantidad: 1,
        precioUnitario: work.costoTotal,
        subtotal: work.costoTotal,
      })
    })

    return items
  }

  const items = buildProformaItems()
  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0)
  const iva = subtotal * 0.12
  const total = subtotal + iva - service.descuento

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log("Downloading PDF...")
  }

  const handleEmail = () => {
    // TODO: Implement email sending
    console.log("Sending by email...")
  }

  // Backdrop animation
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  // Panel animation - different for mobile vs desktop
  const panelVariants = {
    hidden: isMobile
      ? { y: "100%" }
      : { x: "100%", opacity: 0.8 },
    visible: isMobile
      ? { y: 0 }
      : { x: 0, opacity: 1 },
    exit: isMobile
      ? { y: "100%" }
      : { x: "100%", opacity: 0.8 },
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3
            }}
            className={cn(
              "fixed z-50 bg-background overflow-hidden flex flex-col",
              // Mobile: Bottom sheet
              "inset-x-0 bottom-0 rounded-t-2xl max-h-[90vh]",
              // Desktop: Floating side panel
              "md:inset-auto md:right-4 md:top-4 md:bottom-4 md:w-[480px] md:max-w-[calc(100vw-2rem)]",
              "md:rounded-2xl md:border md:border-border/50 md:shadow-2xl"
            )}
          >
            {/* Header - Premium style */}
            <div className="shrink-0 bg-muted/30 border-b px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
                      <FileWarning className="h-3 w-3" />
                      PROFORMA
                    </div>
                  </div>
                  <h2 className="text-lg font-bold">{service.numeroOrden}</h2>
                  <p className="text-sm text-muted-foreground">
                    {service.vehiculo.marca} {service.vehiculo.modelo} • {service.vehiculo.placa}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="shrink-0 -mr-2 -mt-1"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={handlePrint} className="flex-1">
                  <Printer className="mr-1.5 h-3.5 w-3.5" />
                  Imprimir
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleEmail} className="flex-1">
                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                  Email
                </Button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <ScrollArea className="flex-1 px-6">
              <div className="py-4 space-y-4">
                {/* Client & Vehicle Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cliente</p>
                    <p className="font-medium">{service.cliente.nombre} {service.cliente.apellido}</p>
                    <p className="text-muted-foreground text-xs">{service.cliente.telefono}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Taller</p>
                    <p className="font-medium">{service.taller.nombre}</p>
                    <p className="text-muted-foreground text-xs">{service.taller.direccion}</p>
                  </div>
                </div>

                <Separator className="border-dashed" />

                {/* Items list */}
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Detalle de Servicios</p>

                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between gap-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.descripcion}</p>
                        {item.detalle && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {item.detalle}
                          </p>
                        )}
                      </div>
                      <p className="font-medium text-sm shrink-0">
                        ${item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="border-dashed" />

                {/* Subtotals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA (12%)</span>
                    <span>${iva.toFixed(2)}</span>
                  </div>
                  {service.descuento > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span>-${service.descuento.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Pending work notice */}
                {service.trabajosAdicionales.length > 0 && (
                  <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm">
                    <p className="font-medium text-yellow-600 dark:text-yellow-400">
                      {service.trabajosAdicionales.length} trabajo{service.trabajosAdicionales.length > 1 ? "s" : ""} pendiente{service.trabajosAdicionales.length > 1 ? "s" : ""} de aprobación
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      El total puede variar según tus decisiones
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer - Total */}
            <div className="shrink-0 border-t bg-muted/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Estimado</p>
                  <p className="text-xs text-muted-foreground">Incluye IVA</p>
                </div>
                <p className="text-2xl font-bold text-primary">
                  ${total.toFixed(2)}
                </p>
              </div>

              {/* Legal disclaimer */}
              <p className="text-[10px] text-muted-foreground mt-3 text-center">
                Este documento es una proforma y no tiene validez tributaria. Validez: 15 días.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

