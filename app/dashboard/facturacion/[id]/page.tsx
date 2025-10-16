"use client"

import Link from "next/link"
import { ArrowLeft, Download, Mail, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockFacturas } from "@/lib/fixtures/facturas"
import { mockClientes } from "@/lib/fixtures/clientes"
import { mockOrdenesTrabajoData, mockRepuestos } from "@/lib/fixtures/ordenes-trabajo"

const estadoColors = {
  pendiente: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  pagada: "bg-green-500/10 text-green-500 border-green-500/20",
  anulada: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function FacturaDetailPage({ params }: { params: { id: string } }) {
  const factura = mockFacturas[0] // Mock data
  const cliente = mockClientes.find((c) => c.id === factura.clienteId)
  const ot = mockOrdenesTrabajoData.find((o) => o.id === factura.ordenTrabajoId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/facturacion">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{factura.numero}</h1>
            <Badge variant="outline" className={estadoColors[factura.estado]}>
              {factura.estado}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {new Date(factura.fecha).toLocaleDateString("es-EC", { dateStyle: "long" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Enviar por Email
          </Button>
        </div>
      </div>

      {/* Invoice */}
      <Card>
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
                <span className="text-xl font-bold text-primary-foreground">A</span>
              </div>
              <h2 className="text-2xl font-bold">Ambacar</h2>
              <p className="text-sm text-muted-foreground mt-1">Sistema de Gestión de Taller</p>
              <p className="text-sm text-muted-foreground">Quito, Ecuador</p>
            </div>
            <div className="text-right">
              <h3 className="text-3xl font-bold">{factura.numero}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fecha: {new Date(factura.fecha).toLocaleDateString("es-EC")}
              </p>
              {ot && <p className="text-sm text-muted-foreground">OT: {ot.numero}</p>}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Client Info */}
          <div className="mb-8">
            <h4 className="font-semibold mb-2">Facturado a:</h4>
            <p className="text-sm">
              {cliente?.nombre} {cliente?.apellido}
            </p>
            <p className="text-sm text-muted-foreground">{cliente?.email}</p>
            <p className="text-sm text-muted-foreground">{cliente?.telefono}</p>
            <p className="text-sm text-muted-foreground">{cliente?.direccion}</p>
          </div>

          {/* Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium">Descripción</th>
                  <th className="text-right py-3 text-sm font-medium">Cantidad</th>
                  <th className="text-right py-3 text-sm font-medium">Precio Unit.</th>
                  <th className="text-right py-3 text-sm font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {/* Mano de Obra */}
                <tr className="border-b border-border">
                  <td className="py-3 text-sm">
                    <p className="font-medium">Mano de Obra</p>
                    <p className="text-xs text-muted-foreground">Servicios técnicos realizados</p>
                  </td>
                  <td className="text-right py-3 text-sm">1</td>
                  <td className="text-right py-3 text-sm">${ot?.totalManoObra.toFixed(2)}</td>
                  <td className="text-right py-3 text-sm font-medium">${ot?.totalManoObra.toFixed(2)}</td>
                </tr>

                {/* Repuestos */}
                {ot?.repuestos.map((repuestoOT) => {
                  const repuesto = mockRepuestos.find((r) => r.id === repuestoOT.repuestoId)
                  return (
                    <tr key={repuestoOT.repuestoId} className="border-b border-border">
                      <td className="py-3 text-sm">
                        <p className="font-medium">{repuesto?.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {repuesto?.marca} - SKU: {repuesto?.sku}
                        </p>
                      </td>
                      <td className="text-right py-3 text-sm">{repuestoOT.cantidad}</td>
                      <td className="text-right py-3 text-sm">${repuestoOT.precioUnitario.toFixed(2)}</td>
                      <td className="text-right py-3 text-sm font-medium">${repuestoOT.subtotal.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${factura.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (12%):</span>
                <span className="font-medium">${factura.iva.toFixed(2)}</span>
              </div>
              {factura.descuento > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento:</span>
                  <span className="font-medium text-green-500">-${factura.descuento.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">${factura.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {factura.estado === "pagada" && factura.metodoPago && (
            <div className="mt-8 rounded-lg bg-green-500/10 border border-green-500/20 p-4">
              <p className="text-sm font-medium text-green-500">Factura Pagada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Método de pago: <span className="capitalize">{factura.metodoPago}</span>
              </p>
            </div>
          )}

          {factura.estado === "pendiente" && (
            <div className="mt-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
              <p className="text-sm font-medium text-yellow-500">Pago Pendiente</p>
              <p className="text-sm text-muted-foreground mt-1">Esta factura aún no ha sido pagada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
