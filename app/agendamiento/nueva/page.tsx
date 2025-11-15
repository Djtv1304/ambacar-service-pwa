"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Car, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { StepsIndicator } from "@/components/agendamiento/steps-indicator"
import { vehiculoSchema, citaSchema, type VehiculoFormData, type CitaFormData } from "@/lib/validations/agendamiento"
import {
  fetchVehiculosByClienteId,
  registrarVehiculo,
  prefetchDisponibilidad,
  reservarSlot,
  crearCita,
  sendEmailConfirm,
  sendWhatsAppConfirm,
} from "@/lib/api/agendamiento"
import { getClientAccessToken } from "@/lib/auth/actions"
import type { Cliente, Vehiculo, Cita } from "@/lib/types"
import { toast as sonnerToast } from "sonner"

const steps = [
  { number: 1, title: "Vehículo" },
  { number: 2, title: "Fecha y Hora" },
  { number: 3, title: "Confirmación" },
]

const horarios = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]

export default function NuevaCitaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null)
  const [nuevoVehiculo, setNuevoVehiculo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingVehiculos, setLoadingVehiculos] = useState(true)
  const [citaCreada, setCitaCreada] = useState<Cita | null>(null)

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedHora, setSelectedHora] = useState<string>("")
  const [disponibilidad, setDisponibilidad] = useState<{
    fechasNoDisponibles: string[]
    horariosOcupados: Record<string, string[]>
  }>({ fechasNoDisponibles: [], horariosOcupados: {} })

  // Forms
  const vehiculoForm = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      placa: "",
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
      color: "",
      vin: "",
      kilometraje: 0,
    },
  })

  const citaForm = useForm<CitaFormData>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      fecha: "",
      hora: "",
      servicio: "",
      observaciones: "",
    },
  })

  // Load cliente from session
  useEffect(() => {
    const loadClienteAndVehicles = async () => {
      const clienteData = sessionStorage.getItem("agendamiento_cliente")
      if (!clienteData) {
        router.push("/agendamiento")
        return
      }

      const clienteObj = JSON.parse(clienteData) as Cliente
      setCliente(clienteObj)

      try {
        // Obtener token de autenticación
        const token = await getClientAccessToken()
        if (!token) {
          sonnerToast.error("Error de autenticación", {
            description: "No se pudo obtener el token de acceso",
          })
          setLoadingVehiculos(false)
          return
        }

        // Fetch vehiculos desde la API
        const vehs = await fetchVehiculosByClienteId(parseInt(clienteObj.id), token)
        setVehiculos(vehs)

        if (vehs.length > 0) {
          setVehiculoSeleccionado(vehs[0])
        } else {
          setNuevoVehiculo(true)
        }
      } catch (error) {
        console.error("Error cargando vehículos:", error)
        sonnerToast.error("Error", {
          description: "No se pudieron cargar los vehículos",
        })
        // Si hay error, permitir agregar nuevo vehículo
        setNuevoVehiculo(true)
      } finally {
        setLoadingVehiculos(false)
      }

      // Prefetch disponibilidad
      const now = new Date()
      prefetchDisponibilidad(now.getFullYear(), now.getMonth() + 1).then(setDisponibilidad)
    }

    loadClienteAndVehicles()
  }, [router])

  const handleVehiculoSubmit = async (data: VehiculoFormData) => {
    if (!cliente) return

    if (nuevoVehiculo) {
      setLoading(true)
      try {
        const nuevoVeh = await registrarVehiculo(cliente.id, data)
        setVehiculoSeleccionado(nuevoVeh)
        setVehiculos([...vehiculos, nuevoVeh])
        sonnerToast.success("Vehículo registrado", {
          description: "Tu vehículo ha sido guardado correctamente.",
        })
        setCurrentStep(2)
      } catch (error) {
        sonnerToast.error("Error", {
          description: "No se pudo registrar el vehículo.",
        })
      } finally {
        setLoading(false)
      }
    } else {
      // Verificar que hay un vehículo seleccionado
      if (!vehiculoSeleccionado) {
        sonnerToast.error("Error", {
          description: "Por favor selecciona un vehículo",
        })
        return
      }
      setCurrentStep(2)
    }
  }

  const handleContinuarVehiculo = () => {
    if (nuevoVehiculo) {
      // Si es nuevo vehículo, usar el submit del formulario
      vehiculoForm.handleSubmit(handleVehiculoSubmit)()
    } else {
      // Si hay vehículo seleccionado, continuar directamente
      if (!vehiculoSeleccionado) {
        sonnerToast.error("Error", {
          description: "Por favor selecciona un vehículo",
        })
        return
      }
      setCurrentStep(2)
    }
  }

  const handleCitaSubmit = async (data: CitaFormData) => {
    if (!cliente || !vehiculoSeleccionado || !selectedDate || !selectedHora) return

    setLoading(true)
    try {
      // Reservar slot
      await reservarSlot({
        fecha: selectedDate.toISOString().split("T")[0],
        hora: selectedHora,
        placa: vehiculoSeleccionado.placa,
      })

      // Crear cita
      const cita = await crearCita({
        clienteId: cliente.id,
        vehiculoPlaca: vehiculoSeleccionado.placa,
        fecha: selectedDate.toISOString().split("T")[0],
        hora: selectedHora,
        servicio: data.servicio,
        observaciones: data.observaciones,
      })

      setCitaCreada(cita)

      // Enviar confirmaciones
      await Promise.all([
        sendEmailConfirm({ email: cliente.email, cita, cliente }),
        sendWhatsAppConfirm({ telefono: cliente.telefono, cita, cliente }),
      ])

      toast({
        title: "¡Cita confirmada!",
        description: "Recibirás una confirmación por email y WhatsApp.",
      })

      setCurrentStep(3)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la cita. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isDateDisabled = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return disponibilidad.fechasNoDisponibles.includes(dateStr) || date < new Date()
  }

  const horariosDisponibles = selectedDate
    ? horarios.filter((hora) => {
        const dateStr = selectedDate.toISOString().split("T")[0]
        return !disponibilidad.horariosOcupados[dateStr]?.includes(hora)
      })
    : horarios

  if (!cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ED1C24]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#ED1C24] flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#202020]">Ambacar</h1>
                <p className="text-xs text-gray-600">Nueva Cita</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => router.push("/agendamiento")} className="text-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <StepsIndicator steps={steps} currentStep={currentStep} />

        <AnimatePresence mode="wait">
          {/* Step 1: Vehículo */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-[#202020] mb-6">Selecciona tu Vehículo</h2>

                {loadingVehiculos ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#ED1C24]" />
                  </div>
                ) : (
                  <form onSubmit={vehiculoForm.handleSubmit(handleVehiculoSubmit)} className="space-y-6">
                    {vehiculos.length > 0 && !nuevoVehiculo && (
                      <div>
                        <Label className="text-[#202020] font-medium">Vehículos Registrados</Label>
                        <div className="grid gap-3 mt-2">
                          {vehiculos.map((veh) => (
                            <button
                              key={veh.id}
                              type="button"
                              onClick={() => setVehiculoSeleccionado(veh)}
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                vehiculoSeleccionado?.id === veh.id
                                  ? "border-[#ED1C24] bg-[#ED1C24]/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="font-semibold text-[#202020]">
                                {veh.marca} {veh.modelo} ({veh.anio})
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Placa: {veh.placa} • {veh.color} • {veh.kilometraje.toLocaleString()} km
                              </div>
                            </button>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setNuevoVehiculo(true)}
                          className="mt-4 w-full"
                        >
                          + Agregar Nuevo Vehículo
                        </Button>
                      </div>
                    )}

                    {nuevoVehiculo && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-[#202020] font-medium">Nuevo Vehículo</Label>
                          {vehiculos.length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setNuevoVehiculo(false)}
                              className="text-[#ED1C24]"
                            >
                              Usar vehículo existente
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="placa">
                              Placa <span className="text-[#ED1C24]">*</span>
                            </Label>
                            <Input id="placa" {...vehiculoForm.register("placa")} placeholder="ABC-1234" />
                            {vehiculoForm.formState.errors.placa && (
                              <p className="text-sm text-[#ED1C24] mt-1">
                                {vehiculoForm.formState.errors.placa.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="marca">
                              Marca <span className="text-[#ED1C24]">*</span>
                            </Label>
                            <Input id="marca" {...vehiculoForm.register("marca")} placeholder="Toyota" />
                            {vehiculoForm.formState.errors.marca && (
                              <p className="text-sm text-[#ED1C24] mt-1">
                                {vehiculoForm.formState.errors.marca.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="modelo">
                              Modelo <span className="text-[#ED1C24]">*</span>
                            </Label>
                            <Input id="modelo" {...vehiculoForm.register("modelo")} placeholder="Corolla" />
                            {vehiculoForm.formState.errors.modelo && (
                              <p className="text-sm text-[#ED1C24] mt-1">
                                {vehiculoForm.formState.errors.modelo.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="anio">
                              Año <span className="text-[#ED1C24]">*</span>
                            </Label>
                            <Input
                              id="anio"
                              type="number"
                              {...vehiculoForm.register("anio", { valueAsNumber: true })}
                              placeholder="2020"
                            />
                            {vehiculoForm.formState.errors.anio && (
                              <p className="text-sm text-[#ED1C24] mt-1">
                                {vehiculoForm.formState.errors.anio.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="color">
                              Color <span className="text-[#ED1C24]">*</span>
                            </Label>
                            <Input id="color" {...vehiculoForm.register("color")} placeholder="Blanco" />
                            {vehiculoForm.formState.errors.color && (
                              <p className="text-sm text-[#ED1C24] mt-1">
                                {vehiculoForm.formState.errors.color.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="kilometraje">
                              Kilometraje <span className="text-[#ED1C24]">*</span>
                            </Label>
                            <Input
                              id="kilometraje"
                              type="number"
                              {...vehiculoForm.register("kilometraje", { valueAsNumber: true })}
                              placeholder="50000"
                            />
                            {vehiculoForm.formState.errors.kilometraje && (
                              <p className="text-sm text-[#ED1C24] mt-1">
                                {vehiculoForm.formState.errors.kilometraje.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="vin">VIN (Opcional)</Label>
                          <Input id="vin" {...vehiculoForm.register("vin")} placeholder="1HGBH41JXMN109186" />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-4">
                      <Button
                        type="button"
                        onClick={handleContinuarVehiculo}
                        disabled={loading || (!nuevoVehiculo && !vehiculoSeleccionado)}
                        className="bg-[#ED1C24] hover:bg-[#c41820] text-white px-8"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            Continuar
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Fecha y Hora */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-[#202020] mb-6">Selecciona Fecha y Hora</h2>

                <form onSubmit={citaForm.handleSubmit(handleCitaSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[#202020] font-medium mb-2 block">Fecha</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={isDateDisabled}
                        className="rounded-lg border border-gray-200"
                      />
                    </div>

                    <div>
                      <Label className="text-[#202020] font-medium mb-2 block">Hora Disponible</Label>
                      {!selectedDate ? (
                        <p className="text-gray-500 text-sm">Primero selecciona una fecha</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {horariosDisponibles.map((hora) => (
                            <button
                              key={hora}
                              type="button"
                              onClick={() => setSelectedHora(hora)}
                              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                selectedHora === hora
                                  ? "border-[#ED1C24] bg-[#ED1C24] text-white"
                                  : "border-gray-200 hover:border-[#ED1C24] text-[#202020]"
                              }`}
                            >
                              {hora}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="servicio">
                      Servicio Requerido <span className="text-[#ED1C24]">*</span>
                    </Label>
                    <Input
                      id="servicio"
                      {...citaForm.register("servicio")}
                      placeholder="Ej: Mantenimiento preventivo, cambio de aceite..."
                      className="mt-2"
                    />
                    {citaForm.formState.errors.servicio && (
                      <p className="text-sm text-[#ED1C24] mt-1">{citaForm.formState.errors.servicio.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
                    <Textarea
                      id="observaciones"
                      {...citaForm.register("observaciones")}
                      placeholder="Describe cualquier detalle adicional..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !selectedDate || !selectedHora}
                      className="bg-[#ED1C24] hover:bg-[#c41820] text-white px-8"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          Confirmar Cita
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmación */}
          {currentStep === 3 && citaCreada && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>

                <h2 className="text-3xl font-bold text-[#202020] mb-4">¡Cita Confirmada!</h2>
                <p className="text-gray-600 mb-8">Tu cita ha sido agendada exitosamente</p>

                <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                  <div className="grid gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Referencia</p>
                      <p className="font-mono font-bold text-[#ED1C24] text-lg">{citaCreada.id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Fecha</p>
                        <p className="font-semibold text-[#202020]">{citaCreada.fecha}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hora</p>
                        <p className="font-semibold text-[#202020]">{citaCreada.hora}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehículo</p>
                      <p className="font-semibold text-[#202020]">{citaCreada.vehiculoPlaca}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Servicio</p>
                      <p className="font-semibold text-[#202020]">{citaCreada.servicio}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>Importante:</strong> Guarda tu número de referencia para consultar o cancelar tu cita.
                    Recibirás una confirmación por email y WhatsApp.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => router.push("/agendamiento")} className="flex-1">
                    Agendar Otra Cita
                  </Button>
                  <Button
                    onClick={() => {
                      sessionStorage.clear()
                      router.push("/agendamiento")
                    }}
                    className="flex-1 bg-[#ED1C24] hover:bg-[#c41820] text-white"
                  >
                    Finalizar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
