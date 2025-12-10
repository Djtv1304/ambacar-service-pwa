"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Loader2, User as UserIcon, Car, ChevronsUpDown, Check, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthToken } from "@/hooks/use-auth-token"
import { getTestData } from "@/lib/api/ordenes-trabajo"
import { iniciarRecepcion } from "@/lib/recepcion/api"
import { NIVELES_COMBUSTIBLE } from "@/lib/recepcion/constants"
import type { ClienteTestData, VehiculoTestData } from "@/lib/types"
import { toast } from "sonner"
import * as z from "zod"
import { RegistrarVehiculoModal } from "./registrar-vehiculo-modal"

const nuevaRecepcionSchema = z.object({
  cliente_id: z.number({ required_error: "Debe seleccionar un cliente" }).min(1, "Debe seleccionar un cliente"),
  vehiculo_id: z.number({ required_error: "Debe seleccionar un vehículo" }).min(1, "Debe seleccionar un vehículo"),
  kilometraje_ingreso: z.number().min(0, "El kilometraje debe ser mayor o igual a 0"),
  nivel_combustible: z.string().min(1, "Debe seleccionar el nivel de combustible"),
  motivo_visita: z.string().min(3, "El motivo de visita debe tener al menos 3 caracteres"),
  observaciones_cliente: z.string().optional(),
  tiene_danos_previos: z.boolean(),
})

type NuevaRecepcionFormData = z.infer<typeof nuevaRecepcionSchema>

interface NuevaRecepcionFormProps {
  onRecepcionInitiated: (recepcion: any) => void
}

export function NuevaRecepcionForm({ onRecepcionInitiated }: NuevaRecepcionFormProps) {
  const { getToken } = useAuthToken()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data for selects
  const [clientes, setClientes] = useState<ClienteTestData[]>([])
  const [vehiculos, setVehiculos] = useState<VehiculoTestData[]>([])
  const [filteredVehiculos, setFilteredVehiculos] = useState<VehiculoTestData[]>([])

  // Combobox open states
  const [clienteOpen, setClienteOpen] = useState(false)

  // Form state
  const [selectedCliente, setSelectedCliente] = useState<string>("")
  const [selectedVehiculo, setSelectedVehiculo] = useState<string>("")

  // Modal state
  const [showRegistrarVehiculo, setShowRegistrarVehiculo] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NuevaRecepcionFormData>({
    resolver: zodResolver(nuevaRecepcionSchema),
    defaultValues: {
      kilometraje_ingreso: 0,
      nivel_combustible: "1/2",
      motivo_visita: "",
      observaciones_cliente: "",
      tiene_danos_previos: false,
    },
  })

  const watchCliente = watch("cliente_id")
  const watchTieneDanos = watch("tiene_danos_previos")
  const watchKilometraje = watch("kilometraje_ingreso")

  const handleVehiculoRegistrado = (vehiculoResponse: any) => {
    // Crear objeto VehiculoTestData compatible
    const nuevoVehiculo: VehiculoTestData = {
      id: vehiculoResponse.id,
      placa: vehiculoResponse.placa,
      cliente__id: watchCliente,
      cliente__first_name: "",
      cliente__last_name: "",
      modelo_tecnico__marca: vehiculoResponse.marca_display || "",
      modelo_tecnico__modelo: vehiculoResponse.modelo_display || "",
      kilometraje_actual: vehiculoResponse.kilometraje_actual,
    }

    // Agregar el nuevo vehículo a la lista
    setVehiculos((prevVehiculos) => [...prevVehiculos, nuevoVehiculo])
    setFilteredVehiculos((prevFiltered) => [...prevFiltered, nuevoVehiculo])

    // Seleccionar automáticamente el vehículo recién creado
    setSelectedVehiculo(nuevoVehiculo.id.toString())
    setValue("vehiculo_id", nuevoVehiculo.id)

    toast.success("Vehículo registrado y seleccionado automáticamente")
  }

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const token = await getToken()
      if (!token) {
        toast.error("No se encontró token de autenticación")
        setLoadingData(false)
        return
      }

      try {
        const data = await getTestData(token)
        setClientes(data.clientes)
        setVehiculos(data.vehiculos)
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Error al cargar los datos del formulario")
        setError("Error al cargar los datos del formulario")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [getToken])

  // Filter vehicles when client changes
  useEffect(() => {
    if (!watchCliente) {
      setFilteredVehiculos([])
      setSelectedVehiculo("")
      setValue("vehiculo_id", 0)
      return
    }

    const vehiculosDelCliente = vehiculos.filter((v) => v.cliente__id === watchCliente)
    setFilteredVehiculos(vehiculosDelCliente)

    // Reset vehicle selection if current vehicle doesn't belong to new client
    if (selectedVehiculo) {
      const vehiculoActual = vehiculos.find((v) => v.id.toString() === selectedVehiculo)
      if (vehiculoActual && vehiculoActual.cliente__id !== watchCliente) {
        setSelectedVehiculo("")
        setValue("vehiculo_id", 0)
      }
    }
  }, [watchCliente, vehiculos, setValue, selectedVehiculo])

  const onSubmit = async (data: NuevaRecepcionFormData) => {
    setError(null)
    setIsLoading(true)

    const token = await getToken()
    if (!token) {
      toast.error("No se encontró token de autenticación")
      setIsLoading(false)
      return
    }

    try {
      // Prepare payload for API
      const payload = {
        cliente_id: data.cliente_id,
        vehiculo_id: data.vehiculo_id,
        kilometraje_ingreso: data.kilometraje_ingreso,
        nivel_combustible: data.nivel_combustible,
        motivo_visita: data.motivo_visita,
        observaciones_cliente: data.observaciones_cliente || "",
        tiene_danos_previos: data.tiene_danos_previos,
      }

      const recepcion = await iniciarRecepcion(payload)

      toast.success("¡Recepción iniciada!", {
        description: `Número de recepción: ${recepcion.numero_recepcion}`,
      })

      onRecepcionInitiated(recepcion)
    } catch (error: any) {
      console.error("Error creating recepcion:", error)
      const errorMessage = error.message || "Error al iniciar la recepción"
      setError(errorMessage)
      toast.error("Error al iniciar la recepción", {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Cliente Selection */}
        <div className="space-y-2">
          <Label htmlFor="cliente" className="text-[#202020] flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Cliente *
          </Label>
          <Popover open={clienteOpen} onOpenChange={setClienteOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={clienteOpen}
                className="w-full justify-between border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                disabled={isLoading}
              >
                {selectedCliente
                  ? (() => {
                      const cliente = clientes.find((c) => c.id.toString() === selectedCliente)
                      return cliente ? `${cliente.first_name} ${cliente.last_name}` : "Selecciona un cliente..."
                    })()
                  : "Selecciona un cliente..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar cliente..." />
                <CommandList>
                  <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                  <CommandGroup>
                    {clientes.map((cliente) => (
                      <CommandItem
                        key={cliente.id}
                        value={`${cliente.first_name} ${cliente.last_name} ${cliente.cedula} ${cliente.email}`}
                        onSelect={() => {
                          const clienteId = cliente.id.toString()
                          setSelectedCliente(clienteId)
                          setValue("cliente_id", cliente.id)
                          setClienteOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCliente === cliente.id.toString() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div>
                          <div className="font-medium">{cliente.first_name} {cliente.last_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {cliente.cedula} • {cliente.email}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.cliente_id && <p className="text-sm text-red-500">{errors.cliente_id.message}</p>}
        </div>

        {/* Vehiculo Selection */}
        <div className="space-y-2">
          <Label htmlFor="vehiculo" className="text-[#202020] flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehículo *
          </Label>

          {watchCliente && filteredVehiculos.length === 0 ? (
            <div className="space-y-2">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900 text-sm">
                  Este cliente no tiene vehículos registrados. Por favor registra uno.
                </AlertDescription>
              </Alert>
              <Button
                type="button"
                onClick={() => setShowRegistrarVehiculo(true)}
                className="w-full bg-[#ED1C24] hover:bg-[#c41820] text-white"
                disabled={isLoading}
              >
                <Car className="mr-2 h-4 w-4" />
                Registrar Vehículo
              </Button>
            </div>
          ) : (
            <>
              <Select
                value={selectedVehiculo}
                onValueChange={(value) => {
                  setSelectedVehiculo(value)
                  setValue("vehiculo_id", parseInt(value))
                }}
                disabled={isLoading || !watchCliente || filteredVehiculos.length === 0}
              >
                <SelectTrigger className="w-full border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]">
                  <SelectValue placeholder="Selecciona un vehículo..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredVehiculos.map((vehiculo) => (
                    <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                      {vehiculo.placa} - {vehiculo.modelo_tecnico__marca} {vehiculo.modelo_tecnico__modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {watchCliente && filteredVehiculos.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRegistrarVehiculo(true)}
                  className="w-full mt-2"
                  disabled={isLoading}
                >
                  <Car className="mr-2 h-4 w-4" />
                  Registrar Otro Vehículo
                </Button>
              )}
            </>
          )}

          {!watchCliente && (
            <p className="text-xs text-muted-foreground">Primero selecciona un cliente</p>
          )}
          {errors.vehiculo_id && <p className="text-sm text-red-500">{errors.vehiculo_id.message}</p>}
        </div>

        {/* Grid para Kilometraje y Nivel de Combustible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kilometraje */}
          <div className="space-y-2">
            <Label htmlFor="kilometraje_ingreso" className="text-[#202020] flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Kilometraje de Ingreso *
            </Label>
            <Input
              id="kilometraje_ingreso"
              type="number"
              {...register("kilometraje_ingreso", { valueAsNumber: true })}
              placeholder="0"
              className="border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
              disabled={isLoading}
            />
            {errors.kilometraje_ingreso && (
              <p className="text-sm text-red-500">{errors.kilometraje_ingreso.message}</p>
            )}
          </div>

          {/* Nivel de Combustible */}
          <div className="space-y-2">
            <Label htmlFor="nivel_combustible" className="text-[#202020]">
              Nivel de Combustible *
            </Label>
            <Select
              defaultValue="1/2"
              onValueChange={(value) => setValue("nivel_combustible", value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]">
                <SelectValue placeholder="Selecciona el nivel de combustible" />
              </SelectTrigger>
              <SelectContent>
                {NIVELES_COMBUSTIBLE.map((nivel) => (
                  <SelectItem key={nivel.value} value={nivel.value}>
                    {nivel.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.nivel_combustible && (
              <p className="text-sm text-red-500">{errors.nivel_combustible.message}</p>
            )}
          </div>
        </div>

        {/* Motivo de Visita */}
        <div className="space-y-2">
          <Label htmlFor="motivo_visita" className="text-[#202020]">
            Motivo de Visita *
          </Label>
          <Input
            id="motivo_visita"
            {...register("motivo_visita")}
            placeholder="Ej: Mantenimiento preventivo, Reparación de frenos, etc."
            className="border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
            disabled={isLoading}
          />
          {errors.motivo_visita && <p className="text-sm text-red-500">{errors.motivo_visita.message}</p>}
        </div>

        {/* Observaciones del Cliente */}
        <div className="space-y-2">
          <Label htmlFor="observaciones_cliente" className="text-[#202020]">
            Observaciones del Cliente
          </Label>
          <Textarea
            id="observaciones_cliente"
            {...register("observaciones_cliente")}
            placeholder="Anota cualquier observación importante del cliente..."
            className="resize-none border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
            rows={3}
            disabled={isLoading}
          />
          {errors.observaciones_cliente && (
            <p className="text-sm text-red-500">{errors.observaciones_cliente.message}</p>
          )}
        </div>

        {/* Tiene Daños Previos */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="tiene_danos_previos" className="text-base cursor-pointer">
              ¿Tiene daños previos visibles?
            </Label>
            <p className="text-sm text-muted-foreground">Marca esta opción si el vehículo tiene daños o rasguños previos</p>
          </div>
          <Checkbox
            id="tiene_danos_previos"
            checked={watchTieneDanos}
            onCheckedChange={(checked) => setValue("tiene_danos_previos", checked as boolean)}
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ED1C24] hover:bg-[#c41820] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando Recepción...
              </>
            ) : (
              "Iniciar Recepción"
            )}
          </Button>
        </div>
      </form>

      {/* Modal de Registrar Vehículo */}
      <RegistrarVehiculoModal
        open={showRegistrarVehiculo}
        onClose={() => setShowRegistrarVehiculo(false)}
        clienteId={watchCliente}
        kilometrajeInicial={watchKilometraje}
        onVehiculoRegistrado={handleVehiculoRegistrado}
      />
    </motion.div>
  )
}

