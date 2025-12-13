"use client"

import { Download, Mail, Printer, FileWarning } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ServiceDetail, ProformaItem } from "@/lib/mis-servicios/types"
import { cn } from "@/lib/utils"

interface DigitalProformaProps {
  service: ServiceDetail
  className?: string
}

export function DigitalProforma({ service, className }: DigitalProformaProps) {
  // Build proforma items from service data
  const buildProformaItems = (): ProformaItem[] => {
    const items: ProformaItem[] = []

    // Base service (mano de obra base)
    items.push({
      descripcion: "Servicio Base",
      detalle: service.servicioSolicitado,
      cantidad: 1,
      precioUnitario: service.subtotal -
        service.trabajosAprobados.reduce((acc, w) => acc + w.costoTotal, 0),
      subtotal: service.subtotal -
        service.trabajosAprobados.reduce((acc, w) => acc + w.costoTotal, 0),
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
    // TODO: Implement PDF download using react-pdf or jspdf
    console.log("Downloading PDF...")
  }

  const handleEmail = () => {
    // TODO: Implement email sending
    console.log("Sending by email...")
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 justify-end print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
        <Button variant="outline" size="sm" onClick={handleEmail}>
          <Mail className="mr-2 h-4 w-4" />
          Enviar por Email
        </Button>
      </div>

      {/* Proforma document */}
      <Card className="relative overflow-hidden">
        {/* Watermark - Non-tax document label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
          <div className="text-6xl font-bold text-gray-900 dark:text-gray-100 rotate-[-30deg] whitespace-nowrap">
            PROFORMA - NO TRIBUTARIO
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
                <span className="text-xl font-bold text-primary-foreground">A</span>
              </div>
              <h2 className="text-2xl font-bold">Ambacar</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de Gestión de Taller
              </p>
              <p className="text-sm text-muted-foreground">
                {service.taller.direccion}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm font-medium mb-3">
                <FileWarning className="h-4 w-4" />
                PROFORMA / PRESUPUESTO
              </div>
              <h3 className="text-2xl font-bold">{service.numeroOrden}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fecha: {new Date().toLocaleDateString("es-EC")}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Vehicle & Client Info */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                CLIENTE
              </h4>
              <p className="font-medium">
                {service.cliente.nombre} {service.cliente.apellido}
              </p>
              <p className="text-sm text-muted-foreground">{service.cliente.email}</p>
              <p className="text-sm text-muted-foreground">{service.cliente.telefono}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                VEHÍCULO
              </h4>
              <p className="font-medium">
                {service.vehiculo.marca} {service.vehiculo.modelo} ({service.vehiculo.anio})
              </p>
              <p className="text-sm text-muted-foreground">Placa: {service.vehiculo.placa}</p>
              <p className="text-sm text-muted-foreground">
                Kilometraje: {service.recepcion.kilometraje.toLocaleString()} km
              </p>
            </div>
          </div>

          {/* Items table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium">Descripción</th>
                  <th className="text-right py-3 text-sm font-medium w-20">Cant.</th>
                  <th className="text-right py-3 text-sm font-medium w-28">P. Unit.</th>
                  <th className="text-right py-3 text-sm font-medium w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-3 text-sm">
                      <p className="font-medium">{item.descripcion}</p>
                      {item.detalle && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {item.detalle}
                        </p>
                      )}
                    </td>
                    <td className="text-right py-3 text-sm">{item.cantidad}</td>
                    <td className="text-right py-3 text-sm">
                      ${item.precioUnitario.toFixed(2)}
                    </td>
                    <td className="text-right py-3 text-sm font-medium">
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (12%):</span>
                <span className="font-medium">${iva.toFixed(2)}</span>
              </div>
              {service.descuento > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento:</span>
                  <span className="font-medium text-green-500">
                    -${service.descuento.toFixed(2)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total Estimado:</span>
                <span className="text-2xl font-bold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Pending work notice */}
          {service.trabajosAdicionales.length > 0 && (
            <div className="mt-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Nota: Existen trabajos adicionales pendientes de aprobación
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                El total puede variar según las decisiones sobre{" "}
                {service.trabajosAdicionales.length} trabajo
                {service.trabajosAdicionales.length > 1 ? "s" : ""} adicional
                {service.trabajosAdicionales.length > 1 ? "es" : ""}.
              </p>
            </div>
          )}

          {/* Footer disclaimer */}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Este documento es una proforma/presupuesto y no tiene validez tributaria.
              Los precios pueden variar según disponibilidad de repuestos y trabajos adicionales requeridos.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Validez del presupuesto: 15 días
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

