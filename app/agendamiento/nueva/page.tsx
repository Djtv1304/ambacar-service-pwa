"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Car, CheckCircle2, Loader2, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StepsIndicator } from "@/components/agendamiento/steps-indicator"
import { vehiculoSchema, citaSchema, type VehiculoFormData, type CitaFormData } from "@/lib/validations/agendamiento"
import {
  fetchVehiculosByClienteId,
  registrarVehiculo,
  getHorariosDisponibles,
  getTiposServicio,
  crearCitaAPI,
} from "@/lib/api/agendamiento"
import { useAuthToken } from "@/hooks/use-auth-token"
import type { Cliente, Vehiculo, Cita, HorarioDisponible, TipoServicio } from "@/lib/types"
import { toast as sonnerToast } from "sonner"

const steps = [
  { number: 1, title: "Vehículo" },
  { number: 2, title: "Fecha y Hora" },
  { number: 3, title: "Confirmación" },
]

export default function NuevaCitaPage() {
  const router = useRouter()
  const { getToken } = useAuthToken()
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
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([])
  const [loadingHorarios, setLoadingHorarios] = useState(false)

  // Service types state
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([])
  const [selectedServicio, setSelectedServicio] = useState<string>("")
  const [loadingServicios, setLoadingServicios] = useState(false)

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

  // Load cliente from session and fetch service types
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
        const token = await getToken()
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
    }

    loadClienteAndVehicles()
  }, [router])

  // Fetch service types when step 2 is reached
  useEffect(() => {
    if (currentStep === 2 && tiposServicio.length === 0) {
      const fetchServicios = async () => {
        setLoadingServicios(true)
        try {
          const servicios = await getTiposServicio()
          setTiposServicio(servicios)
        } catch (error) {
          console.error("Error cargando tipos de servicio:", error)
          sonnerToast.error("Error", {
            description: "No se pudieron cargar los tipos de servicio",
          })
        } finally {
          setLoadingServicios(false)
        }
      }

      fetchServicios()
    }
  }, [currentStep, tiposServicio.length])

  // Sync selectedServicio with form field
  useEffect(() => {
    if (selectedServicio) {
      const servicioData = tiposServicio.find((s) => s.id.toString() === selectedServicio)
      if (servicioData) {
        citaForm.setValue("servicio", servicioData.nombre)
      }
    }
  }, [selectedServicio, tiposServicio, citaForm])

  // Fetch available hours when date is selected
  useEffect(() => {
    if (selectedDate) {
      const fetchHorarios = async () => {
        setLoadingHorarios(true)
        setSelectedHora("") // Reset selected hour
        try {
          const fecha = selectedDate.toISOString().split("T")[0]
          const response = await getHorariosDisponibles(fecha)
          setHorariosDisponibles(response.horarios_disponibles || [])
        } catch (error) {
          console.error("Error cargando horarios:", error)
          sonnerToast.error("Error", {
            description: "No se pudieron cargar los horarios disponibles",
          })
          setHorariosDisponibles([])
        } finally {
          setLoadingHorarios(false)
        }
      }

      fetchHorarios()
    } else {
      setHorariosDisponibles([])
    }
  }, [selectedDate])

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

  const handleCitaSubmit = async () => {
    if (!cliente || !vehiculoSeleccionado || !selectedDate || !selectedHora || !selectedServicio) {
      sonnerToast.error("Error", {
        description: "Por favor completa todos los campos requeridos",
      })
      return
    }

    // Solo avanzar al paso 3 para revisión
    setCurrentStep(3)
  }

  const handleConfirmarCita = async () => {
    if (!cliente || !vehiculoSeleccionado || !selectedDate || !selectedHora || !selectedServicio) return

    setLoading(true)
    try {
      // Obtener token de autenticación
      const token = await getToken()
      if (!token) {
        sonnerToast.error("Error de autenticación", {
          description: "No se pudo obtener el token de acceso. Por favor inicia sesión nuevamente.",
          duration: 6000,
        })
        setLoading(false)
        return
      }

      // Crear cita en la API
      const citaData = {
        cliente: parseInt(cliente.id),
        vehiculo: parseInt(vehiculoSeleccionado.id),
        tipo_servicio: parseInt(selectedServicio),
        fecha_cita: selectedDate.toISOString().split("T")[0],
        hora_cita: selectedHora,
        observaciones: citaForm.getValues("observaciones") || undefined,
      }

      const citaResponse = await crearCitaAPI(citaData, token)

      // Convertir respuesta de la API al formato Cita esperado con datos enriquecidos
      const cita: Cita = {
        id: citaResponse.numero_cita || citaResponse.id?.toString() || `CITA-${Date.now()}`,
        clienteId: cliente.id,
        vehiculoPlaca: citaResponse.vehiculo_detalle?.placa || vehiculoSeleccionado.placa,
        fecha: citaResponse.fecha_cita,
        hora: horariosDisponibles.find((h) => h.hora === selectedHora)?.hora_display || selectedHora,
        servicio: citaResponse.tipo_servicio_detalle?.nombre || citaForm.getValues("servicio"),
        observaciones: citaResponse.observaciones,
        estado: citaResponse.estado_display || "confirmada",
        sucursal: "Principal",
        createdAt: citaResponse.created_at || new Date().toISOString(),
        updatedAt: citaResponse.updated_at || new Date().toISOString(),
      }

      setCitaCreada(cita)

      sonnerToast.success("¡Cita agendada exitosamente!", {
        description: `Tu cita ${citaResponse.numero_cita} ha sido confirmada.`,
        duration: 5000,
      })
    } catch (error: any) {
      console.error("Error creando cita:", error)

      // Manejar diferentes tipos de errores
      let errorMessage = "No se pudo crear la cita. Por favor intenta nuevamente."

      if (error?.response?.data) {
        const errorData = error.response.data
        if (typeof errorData === "string") {
          errorMessage = errorData
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } else if (error?.message) {
        errorMessage = error.message
      }

      sonnerToast.error("Error al agendar la cita", {
        description: errorMessage,
        duration: 6000,
      })
    } finally {
      setLoading(false)
    }
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date < tomorrow
  }

  const selectedServicioData = tiposServicio.find((s) => s.id.toString() === selectedServicio)

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
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-[#ED1C24] flex items-center justify-center flex-shrink-0">
                <Car className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-[#202020]">Ambacar</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Nueva Cita</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/agendamiento")}
              className="text-gray-600 hover:text-[#ED1C24] transition-colors text-sm sm:text-base px-2 sm:px-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Volver al</span> Inicio
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
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
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#202020] mb-4 sm:mb-6">Selecciona tu Vehículo</h2>

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
              className="max-w-5xl mx-auto"
            >
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#202020] mb-4 sm:mb-6">Selecciona Fecha y Hora</h2>

                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="w-full">
                      <Label className="text-[#202020] font-medium mb-2 sm:mb-3 block text-sm sm:text-base">Fecha</Label>
                      <div className="flex justify-center">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={isDateDisabled}
                          className="rounded-lg border border-gray-200 scale-90 sm:scale-100"
                        />
                      </div>
                    </div>

                    <div className="w-full">
                      <Label className="text-[#202020] font-medium mb-2 sm:mb-3 block text-sm sm:text-base">Hora Disponible</Label>
                      {!selectedDate ? (
                        <div className="flex items-center justify-center h-full min-h-[200px] border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-gray-500 text-sm">Primero selecciona una fecha</p>
                        </div>
                      ) : loadingHorarios ? (
                        <div className="flex items-center justify-center h-full min-h-[200px] border border-gray-200 rounded-lg">
                          <Loader2 className="h-6 w-6 animate-spin text-[#ED1C24]" />
                        </div>
                      ) : horariosDisponibles.length === 0 ? (
                        <div className="flex items-center justify-center h-full min-h-[150px] sm:min-h-[200px] border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-gray-500 text-xs sm:text-sm text-center px-4">No hay horarios disponibles para esta fecha</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] sm:max-h-[350px] overflow-y-auto pr-1 sm:pr-2">
                          {horariosDisponibles.map((horario) => (
                            <button
                              key={horario.hora}
                              type="button"
                              onClick={() => horario.disponible && setSelectedHora(horario.hora)}
                              disabled={!horario.disponible}
                              className={`p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all ${
                                selectedHora === horario.hora
                                  ? "border-[#ED1C24] bg-[#ED1C24] text-white"
                                  : horario.disponible
                                  ? "border-gray-200 hover:border-[#ED1C24] text-[#202020]"
                                  : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {horario.hora_display}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="servicio" className="text-[#202020] font-medium">
                      Servicio Requerido <span className="text-[#ED1C24]">*</span>
                    </Label>
                    {loadingServicios ? (
                      <div className="mt-2 p-3 border border-gray-200 rounded-lg flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-[#ED1C24] mr-2" />
                        <span className="text-sm text-gray-600">Cargando servicios...</span>
                      </div>
                    ) : (
                      <Select value={selectedServicio} onValueChange={setSelectedServicio}>
                        <SelectTrigger className="w-full mt-2 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]">
                          <SelectValue placeholder="Selecciona un servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposServicio.map((servicio) => (
                            <SelectItem key={servicio.id} value={servicio.id.toString()}>
                              {servicio.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {citaForm.formState.errors.servicio && (
                      <p className="text-sm text-[#ED1C24] mt-1">{citaForm.formState.errors.servicio.message}</p>
                    )}

                    {selectedServicioData && (
                      <div className="mt-3 p-4 bg-[#ED1C24]/5 border-2 border-[#ED1C24]/20 rounded-lg">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedServicioData.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm text-[#202020] mb-2">
                              <strong className="text-[#ED1C24]">Descripción:</strong> {selectedServicioData.descripcion}
                            </p>
                            <p className="text-sm text-[#202020]">
                              <strong className="text-[#ED1C24]">Duración Estimada:</strong>{" "}
                              {selectedServicioData.duracion_estimada} minutos
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="observaciones" className="text-[#202020] font-medium">
                      Observaciones (Opcional)
                    </Label>
                    <Textarea
                      id="observaciones"
                      {...citaForm.register("observaciones")}
                      placeholder="Describe cualquier detalle adicional..."
                      rows={4}
                      className="mt-2 border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="cursor-pointer w-full sm:w-auto"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Atrás
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCitaSubmit}
                      disabled={loading || !selectedDate || !selectedHora || !selectedServicio}
                      className="bg-[#ED1C24] hover:bg-[#c41820] active:scale-95 text-white px-6 sm:px-8 cursor-pointer transition-all duration-150 w-full sm:w-auto"
                    >
                      Revisar Datos
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmación */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              {citaCreada ? (
                // Cita confirmada - mostrar resumen final con animación
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8 text-center"
                >
                  {/* Icono de éxito animado */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 sm:mb-6"
                  >
                    <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#202020] mb-2">¡Cita Agendada!</h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Tu cita ha sido confirmada exitosamente</p>
                  </motion.div>

                  {/* Número de referencia destacado */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#ED1C24]/5 border-2 border-[#ED1C24]/20 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6"
                  >
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Número de Referencia</p>
                    <p className="font-mono font-bold text-[#ED1C24] text-lg sm:text-2xl tracking-wider break-all">{citaCreada.id}</p>
                    <p className="text-xs text-gray-500 mt-2">Guarda este número para consultar tu cita</p>
                  </motion.div>

                  {/* Detalles de la cita */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-left"
                  >
                    <h3 className="font-semibold text-[#202020] mb-3 sm:mb-4 text-center text-sm sm:text-base">Detalles de tu Cita</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-[#ED1C24]/10 flex items-center justify-center flex-shrink-0">
                            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#ED1C24]" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Fecha</p>
                            <p className="font-semibold text-[#202020] text-xs sm:text-sm">
                              {(() => {
                                // Parse date as YYYY-MM-DD and create date in local timezone
                                const [year, month, day] = citaCreada.fecha.split('-').map(Number)
                                const localDate = new Date(year, month - 1, day)
                                return localDate.toLocaleDateString("es-EC", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-[#ED1C24]/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#ED1C24]" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Hora</p>
                            <p className="font-semibold text-[#202020] text-xs sm:text-sm">{citaCreada.hora}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-[#ED1C24]/10 flex items-center justify-center flex-shrink-0">
                            <Car className="h-4 w-4 sm:h-5 sm:w-5 text-[#ED1C24]" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Vehículo</p>
                            <p className="font-semibold text-[#202020] text-xs sm:text-sm">
                              {vehiculoSeleccionado?.marca} {vehiculoSeleccionado?.modelo}
                            </p>
                            <p className="text-xs text-gray-500">Placa: {citaCreada.vehiculoPlaca}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-[#ED1C24]/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#ED1C24]" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Servicio</p>
                            <p className="font-semibold text-[#202020] text-xs sm:text-sm">{citaCreada.servicio}</p>
                          </div>
                        </div>
                      </div>

                      {citaCreada.observaciones && (
                        <div className="p-2 sm:p-3 bg-white rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Observaciones</p>
                          <p className="text-xs sm:text-sm text-[#202020]">{citaCreada.observaciones}</p>
                        </div>
                      )}

                      <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-700 mb-1">Estado</p>
                        <p className="text-xs sm:text-sm font-semibold text-green-700">{citaCreada.estado}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Mensaje informativo */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left"
                  >
                    <p className="text-sm text-blue-900">
                      <strong>📧 Confirmación enviada:</strong> Recibirás un email con los detalles de tu cita.
                      También te contactaremos por WhatsApp para confirmar tu asistencia.
                    </p>
                  </motion.div>

                  {/* Botones de acción */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCitaCreada(null)
                        setCurrentStep(1)
                        setSelectedDate(undefined)
                        setSelectedHora("")
                        setSelectedServicio("")
                        citaForm.reset()
                      }}
                      className="flex-1 cursor-pointer text-sm sm:text-base"
                    >
                      Agendar Otra Cita
                    </Button>
                    <Button
                      onClick={() => {
                        sessionStorage.clear()
                        router.push("/agendamiento")
                      }}
                      className="flex-1 bg-[#ED1C24] hover:bg-[#c41820] text-white cursor-pointer text-sm sm:text-base"
                    >
                      Finalizar
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                // Revisión de datos antes de confirmar
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#202020] mb-2">Revisa tu Cita</h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Verifica que todos los datos sean correctos antes de confirmar</p>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Información del Cliente */}
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                      <h3 className="font-semibold text-[#202020] mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#ED1C24] text-white flex items-center justify-center mr-2 sm:mr-3 text-sm flex-shrink-0">
                          1
                        </div>
                        Información del Cliente
                      </h3>
                      <div className="ml-9 sm:ml-11 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-600 text-xs sm:text-sm">Nombre:</span>
                          <span className="font-medium text-[#202020] text-sm sm:text-base">
                            {cliente?.nombre} {cliente?.apellido}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-600 text-xs sm:text-sm">Email:</span>
                          <span className="font-medium text-[#202020] text-sm sm:text-base break-all">{cliente?.email}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-600 text-xs sm:text-sm">Teléfono:</span>
                          <span className="font-medium text-[#202020] text-sm sm:text-base">{cliente?.telefono}</span>
                        </div>
                      </div>
                    </div>

                    {/* Información del Vehículo */}
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                      <h3 className="font-semibold text-[#202020] mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#ED1C24] text-white flex items-center justify-center mr-2 sm:mr-3 text-sm flex-shrink-0">
                          2
                        </div>
                        Vehículo
                      </h3>
                      <div className="ml-9 sm:ml-11 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-600 text-xs sm:text-sm">Placa:</span>
                          <span className="font-medium text-[#202020] text-sm sm:text-base">{vehiculoSeleccionado?.placa}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-600 text-xs sm:text-sm">Vehículo:</span>
                          <span className="font-medium text-[#202020] text-sm sm:text-base">
                            {vehiculoSeleccionado?.marca} {vehiculoSeleccionado?.modelo} ({vehiculoSeleccionado?.anio})
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-600 text-xs sm:text-sm">Color:</span>
                          <span className="font-medium text-[#202020] text-sm sm:text-base">{vehiculoSeleccionado?.color}</span>
                        </div>
                      </div>
                    </div>

                    {/* Detalles de la Cita */}
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                      <h3 className="font-semibold text-[#202020] mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#ED1C24] text-white flex items-center justify-center mr-2 sm:mr-3 text-sm flex-shrink-0">
                          3
                        </div>
                        Detalles de la Cita
                      </h3>
                      <div className="ml-9 sm:ml-11 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-600 text-xs sm:text-sm">Fecha:</span>
                          <span className="font-medium text-[#202020] text-sm sm:text-base text-right">
                            {selectedDate?.toLocaleDateString("es-EC", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-600 text-xs sm:text-sm">Hora:</span>
                          <span className="font-medium text-[#202020] text-sm sm:text-base">
                            {horariosDisponibles.find((h) => h.hora === selectedHora)?.hora_display || selectedHora}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-600 text-xs sm:text-sm">Servicio:</span>
                          <span className="font-medium text-[#202020] text-sm sm:text-base text-right">{selectedServicioData?.nombre}</span>
                        </div>
                        {citaForm.getValues("observaciones") && (
                          <div className="pt-2 border-t border-gray-200">
                            <span className="text-gray-600 block mb-1 text-xs sm:text-sm">Observaciones:</span>
                            <p className="font-medium text-[#202020] text-xs sm:text-sm">
                              {citaForm.getValues("observaciones")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Modificar
                    </Button>
                    <Button
                      onClick={handleConfirmarCita}
                      disabled={loading}
                      className="bg-[#ED1C24] hover:bg-[#c41820] text-white px-6 sm:px-8 w-full sm:w-auto"
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
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
