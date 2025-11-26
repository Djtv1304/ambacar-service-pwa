"use client"

import { motion } from "framer-motion"
import { Calendar, Car, AlertCircle, Pen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface CitaResumenProps {
  cita: any
  onKmEdited?: (km: number) => void
  onProceed?: () => void
}

export function CitaResumen({ cita, onKmEdited, onProceed }: CitaResumenProps) {
  const [km, setKm] = useState(cita.vehiculo.kilometraje_actual)
  const [openDialog, setOpenDialog] = useState(false)

  const handleGuardarKm = () => {
    onKmEdited?.(km)
    setOpenDialog(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Cliente */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium text-lg">{cita.cliente.nombre_completo}</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Cédula:</span> {cita.cliente.cedula}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Teléfono:</span> {cita.cliente.telefono}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Email:</span> {cita.cliente.email}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vehículo */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-4 w-4" />
              Información del Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Placa</p>
                <p className="font-medium text-base">{cita.vehiculo.placa}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">VIN</p>
                <p className="font-medium text-sm">{cita.vehiculo.vin || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Marca & Modelo</p>
                <p className="font-medium">
                  {cita.vehiculo.marca} {cita.vehiculo.modelo}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Año</p>
                <p className="font-medium">{cita.vehiculo.anio}</p>
              </div>
            </div>

            {/* Kilometraje */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Kilometraje</p>
                  <p className="font-medium text-base">{km.toLocaleString()} km</p>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Pen className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Kilometraje</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="number"
                        value={km}
                        onChange={(e) => setKm(Number(e.target.value))}
                        placeholder="Ingresa el kilometraje actual"
                        className="text-base"
                      />
                      <Button onClick={handleGuardarKm} className="w-full bg-[#ED1C24] hover:bg-[#c41820]">
                        Guardar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Servicio */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Servicio Solicitado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tipo de Servicio</p>
              <Badge className="bg-[#ED1C24]/10 text-[#ED1C24] border-[#ED1C24]/20">
                {cita.tipo_servicio.nombre}
              </Badge>
            </div>
            {/* TODO [RECEPCIÓN]: Cuando la API devuelva tipo_servicio.descripcion, mostrarlo aquí */}
            {(cita.tipo_servicio.descripcion || cita.cita.observaciones) && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  {cita.tipo_servicio.descripcion ? "Descripción" : "Observaciones"}
                </p>
                <p className="text-sm">{cita.tipo_servicio.descripcion || cita.cita.observaciones}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Cita */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Datos de la Cita</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Fecha Agendada</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{new Date(cita.cita.fecha_cita).toLocaleDateString("es-EC")}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hora</p>
              <div className="flex items-center gap-2 mt-1">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{cita.cita.hora_cita}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA */}
      {onProceed && (
        <motion.div variants={itemVariants}>
          <Button onClick={onProceed} size="lg" className="w-full bg-[#ED1C24] hover:bg-[#c41820] text-white">
            Continuar con Recepción
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}