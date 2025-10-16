"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronLeft, ChevronRight, User, Car, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { mockClientes } from "@/lib/fixtures/clientes"

const steps = [
  { id: 1, title: "Datos del Cliente", icon: User },
  { id: 2, title: "Vehículo", icon: Car },
  { id: 3, title: "Servicio y Horario", icon: CalendarIcon },
]

export function AppointmentWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    clienteId: "",
    vehiculoId: "",
    fecha: "",
    hora: "",
    servicioSolicitado: "",
    observaciones: "",
    sucursal: "Quito Norte",
  })

  const selectedCliente = mockClientes.find((c) => c.id === formData.clienteId)
  const availableVehiculos = selectedCliente?.vehiculos || []

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // Validate form
    if (
      !formData.clienteId ||
      !formData.vehiculoId ||
      !formData.fecha ||
      !formData.hora ||
      !formData.servicioSolicitado
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
      })
      return
    }

    // Mock submission
    toast({
      title: "Cita creada",
      description: "La cita ha sido agendada exitosamente",
    })

    router.push("/dashboard/citas")
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.clienteId !== ""
      case 2:
        return formData.vehiculoId !== ""
      case 3:
        return formData.fecha !== "" && formData.hora !== "" && formData.servicioSolicitado !== ""
      default:
        return false
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors",
                    isActive && "border-primary bg-primary text-primary-foreground",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    !isActive && !isCompleted && "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="text-center">
                  <p className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-4 h-0.5 flex-1 transition-colors",
                    currentStep > step.id ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Selecciona o busca el cliente"}
            {currentStep === 2 && "Selecciona el vehículo del cliente"}
            {currentStep === 3 && "Programa el servicio y horario"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Cliente */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cliente">Cliente *</Label>
                    <Select
                      value={formData.clienteId}
                      onValueChange={(value) => setFormData({ ...formData, clienteId: value, vehiculoId: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nombre} {cliente.apellido} - {cliente.cedula}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCliente && (
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                      <p className="text-sm font-medium">Información del Cliente</p>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>Email: {selectedCliente.email}</p>
                        <p>Teléfono: {selectedCliente.telefono}</p>
                        <p>Ciudad: {selectedCliente.ciudad}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Vehículo */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehiculo">Vehículo *</Label>
                    <Select
                      value={formData.vehiculoId}
                      onValueChange={(value) => setFormData({ ...formData, vehiculoId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un vehículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVehiculos.map((vehiculo) => (
                          <SelectItem key={vehiculo.id} value={vehiculo.id}>
                            {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio}) - {vehiculo.placa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.vehiculoId && (
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                      <p className="text-sm font-medium">Información del Vehículo</p>
                      {(() => {
                        const vehiculo = availableVehiculos.find((v) => v.id === formData.vehiculoId)
                        return (
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>Color: {vehiculo?.color}</p>
                            <p>Kilometraje: {vehiculo?.kilometraje.toLocaleString()} km</p>
                            <p>VIN: {vehiculo?.vin}</p>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Servicio y Horario */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fecha">Fecha *</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hora">Hora *</Label>
                      <Select
                        value={formData.hora}
                        onValueChange={(value) => setFormData({ ...formData, hora: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"].map(
                            (hora) => (
                              <SelectItem key={hora} value={hora}>
                                {hora}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="servicio">Servicio Solicitado *</Label>
                    <Select
                      value={formData.servicioSolicitado}
                      onValueChange={(value) => setFormData({ ...formData, servicioSolicitado: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mantenimiento preventivo">Mantenimiento preventivo</SelectItem>
                        <SelectItem value="Cambio de aceite y filtros">Cambio de aceite y filtros</SelectItem>
                        <SelectItem value="Revisión de frenos">Revisión de frenos</SelectItem>
                        <SelectItem value="Alineación y balanceo">Alineación y balanceo</SelectItem>
                        <SelectItem value="Diagnóstico general">Diagnóstico general</SelectItem>
                        <SelectItem value="Reparación de motor">Reparación de motor</SelectItem>
                        <SelectItem value="Reparación de transmisión">Reparación de transmisión</SelectItem>
                        <SelectItem value="Sistema eléctrico">Sistema eléctrico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sucursal">Sucursal *</Label>
                    <Select
                      value={formData.sucursal}
                      onValueChange={(value) => setFormData({ ...formData, sucursal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Quito Norte">Quito Norte</SelectItem>
                        <SelectItem value="Quito Sur">Quito Sur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <Textarea
                      id="observaciones"
                      placeholder="Detalles adicionales sobre el servicio..."
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={handleNext} disabled={!isStepValid()}>
          {currentStep === 3 ? (
            "Crear Cita"
          ) : (
            <>
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
