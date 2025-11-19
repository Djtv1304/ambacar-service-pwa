"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, AlertCircle, FileText, Calendar, Gauge, User as UserIcon, Car, Wrench } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthToken } from "@/hooks/use-auth-token"
import {
  getTestData,
  createOrdenTrabajo,
} from "@/lib/api/ordenes-trabajo"
import type { TipoOT, SubtipoOT, ClienteTestData, AsesorTestData, VehiculoTestData } from "@/lib/types"
import { toast } from "sonner"

export default function NuevaOrdenTrabajoPage() {
  const router = useRouter()
  const { getToken } = useAuthToken()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data for selects
  const [tipos, setTipos] = useState<TipoOT[]>([])
  const [subtipos, setSubtipos] = useState<SubtipoOT[]>([])
  const [filteredSubtipos, setFilteredSubtipos] = useState<SubtipoOT[]>([])
  const [clientes, setClientes] = useState<ClienteTestData[]>([])
  const [vehiculos, setVehiculos] = useState<VehiculoTestData[]>([])
  const [filteredVehiculos, setFilteredVehiculos] = useState<VehiculoTestData[]>([])
  const [asesores, setAsesores] = useState<AsesorTestData[]>([])

  // Combobox open states
  const [clienteOpen, setClienteOpen] = useState(false)
  const [asesorOpen, setAsesorOpen] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    tipo: "",
    subtipo: "",
    cliente: "",
    vehiculo: "",
    fecha_promesa_entrega: "",
    kilometraje_ingreso: "",
    descripcion_trabajo: "",
    asesor: "",
  })

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const token = await getToken()
      if (!token) {
        toast.error("No se encontró token de autenticación")
        router.push("/login")
        return
      }

      try {
        const data = await getTestData(token)

        setTipos(data.tipos_orden_trabajo)
        setSubtipos(data.subtipos_orden_trabajo)
        setClientes(data.clientes)
        setVehiculos(data.vehiculos)
        setAsesores(data.asesores)
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Error al cargar los datos del formulario")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [router, getToken])

  // Filter subtipos when tipo changes
  useEffect(() => {
    if (!formData.tipo) {
      setFilteredSubtipos([])
      setFormData((prev) => ({ ...prev, subtipo: "" }))
      return
    }

    const tipoSeleccionado = tipos.find((t) => t.id.toString() === formData.tipo)
    if (tipoSeleccionado) {
      const subtipposFiltrados = subtipos.filter((st) => st.tipo__codigo === tipoSeleccionado.codigo)
      setFilteredSubtipos(subtipposFiltrados)
    }
  }, [formData.tipo, tipos, subtipos])

  // Filter vehicles when client changes
  useEffect(() => {
    if (!formData.cliente) {
      setFilteredVehiculos([])
      setFormData((prev) => ({ ...prev, vehiculo: "" }))
      return
    }

    // Filtrar vehículos por cliente
    const vehiculosDelCliente = vehiculos.filter(
      (v) => v.cliente__id.toString() === formData.cliente
    )
    setFilteredVehiculos(vehiculosDelCliente)

    // TODO: Implementar carga desde API
    // const loadVehiculosFromAPI = async () => {
    //   const token = await getClientAccessToken()
    //   if (!token) return
    //   try {
    //     const vehiculosData = await getVehiculosByCliente(parseInt(formData.cliente), token)
    //     setFilteredVehiculos(vehiculosData)
    //   } catch (error) {
    //     console.error("Error loading vehicles:", error)
    //     toast.error("Error al cargar los vehículos del cliente")
    //   }
    // }
    // loadVehiculosFromAPI()
  }, [formData.cliente, vehiculos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validation
    if (!formData.tipo || !formData.cliente || !formData.vehiculo || !formData.fecha_promesa_entrega || !formData.kilometraje_ingreso || !formData.descripcion_trabajo) {
      setError("Por favor completa todos los campos requeridos")
      setLoading(false)
      return
    }

    const token = await getToken()
    if (!token) {
      toast.error("No se encontró token de autenticación")
      setLoading(false)
      return
    }

    try {
      // Prepare data for API (schema exacto requerido)
      const createData: any = {
        tipo: parseInt(formData.tipo),
        cliente: parseInt(formData.cliente),
        vehiculo: parseInt(formData.vehiculo),
        fecha_promesa_entrega: new Date(formData.fecha_promesa_entrega).toISOString(),
        kilometraje_ingreso: parseInt(formData.kilometraje_ingreso),
        descripcion_trabajo: formData.descripcion_trabajo,
      }

      // Agregar subtipo si está seleccionado (opcional)
      if (formData.subtipo) {
        createData.subtipo = parseInt(formData.subtipo)
      }

      // Realizar POST a la API
      await createOrdenTrabajo(createData, token)

      // Si llegamos aquí, la creación fue exitosa (código 200)
      toast.success("Orden de trabajo creada exitosamente")

      // Redirigir a la lista de órdenes de trabajo
      router.push("/dashboard/ot")
    } catch (error: any) {
      console.error("Error creating OT:", error)
      setError(error.message || "Error al crear la orden de trabajo")
      toast.error("Error al crear la orden de trabajo")
    } finally {
      setLoading(false)
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
    <div className="py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/ot">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Orden de Trabajo</h1>
          <p className="text-muted-foreground mt-1">Crea una nueva orden de trabajo para el taller</p>
        </div>
      </div>

      {/* Form */}
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#202020]">Información de la Orden</CardTitle>
            <CardDescription className="text-gray-600">
              Completa los datos para crear una nueva orden de trabajo
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Grid para Tipo de Orden y Subtipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de OT */}
                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-[#202020] flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Tipo de Orden *
                  </Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, tipo: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]">
                      <SelectValue placeholder="Selecciona el tipo de orden" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subtipo de OT */}
                <div className="space-y-2">
                  <Label htmlFor="subtipo" className="text-[#202020] flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Subtipo de Orden
                  </Label>
                  <Select
                    value={formData.subtipo}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, subtipo: value }))}
                    disabled={loading || !formData.tipo || filteredSubtipos.length === 0}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]">
                      <SelectValue
                        placeholder={
                          !formData.tipo
                            ? "Primero selecciona un tipo"
                            : filteredSubtipos.length === 0
                              ? "No hay subtipos disponibles"
                              : "Selecciona el subtipo (opcional)"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubtipos.map((subtipo) => (
                        <SelectItem key={subtipo.id} value={subtipo.id.toString()}>
                          {subtipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Grid para Cliente y Asesor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cliente */}
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
                        disabled={loading}
                      >
                        {formData.cliente
                          ? (() => {
                              const cliente = clientes.find((c) => c.id.toString() === formData.cliente)
                              return cliente
                                ? `${cliente.first_name} ${cliente.last_name} - ${cliente.cedula}`
                                : "Selecciona el cliente"
                            })()
                          : "Selecciona el cliente"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar por nombre o cédula..." />
                        <CommandList>
                          <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                          <CommandGroup>
                            {clientes.map((cliente) => (
                              <CommandItem
                                key={cliente.id}
                                value={`${cliente.first_name} ${cliente.last_name} ${cliente.cedula}`}
                                onSelect={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    cliente: cliente.id.toString(),
                                  }))
                                  setClienteOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.cliente === cliente.id.toString() ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {cliente.first_name} {cliente.last_name} - {cliente.cedula}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Asesor */}
                <div className="space-y-2">
                  <Label htmlFor="asesor" className="text-[#202020] flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Asesor
                  </Label>
                  <Popover open={asesorOpen} onOpenChange={setAsesorOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={asesorOpen}
                        className="w-full justify-between border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                        disabled={loading}
                      >
                        {formData.asesor
                          ? (() => {
                              const asesor = asesores.find((a) => a.id.toString() === formData.asesor)
                              return asesor
                                ? `${asesor.first_name} ${asesor.last_name} - ${asesor.cedula}`
                                : "Selecciona el asesor"
                            })()
                          : "Selecciona el asesor (opcional)"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar por nombre o cédula..." />
                        <CommandList>
                          <CommandEmpty>No se encontraron asesores.</CommandEmpty>
                          <CommandGroup>
                            {asesores.map((asesor) => (
                              <CommandItem
                                key={asesor.id}
                                value={`${asesor.first_name} ${asesor.last_name} ${asesor.cedula}`}
                                onSelect={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    asesor: asesor.id.toString(),
                                  }))
                                  setAsesorOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.asesor === asesor.id.toString() ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {asesor.first_name} {asesor.last_name} - {asesor.cedula}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Vehículo */}
              <div className="space-y-2">
                <Label htmlFor="vehiculo" className="text-[#202020] flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Vehículo *
                </Label>
                <Select
                  value={formData.vehiculo}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, vehiculo: value }))}
                  disabled={loading || !formData.cliente || filteredVehiculos.length === 0}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]">
                    <SelectValue
                      placeholder={
                        !formData.cliente
                          ? "Primero selecciona un cliente"
                          : filteredVehiculos.length === 0
                            ? "Este cliente no tiene vehículos"
                            : "Selecciona el vehículo"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredVehiculos.map((vehiculo) => (
                      <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                        {vehiculo.modelo_tecnico__marca} {vehiculo.modelo_tecnico__modelo} - {vehiculo.placa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Grid para Fecha Promesa y Kilometraje */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha Promesa de Entrega */}
                <div className="space-y-2">
                  <Label htmlFor="fecha_promesa_entrega" className="text-[#202020] flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha Promesa de Entrega *
                  </Label>
                  <Input
                    id="fecha_promesa_entrega"
                    type="datetime-local"
                    className="border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                    value={formData.fecha_promesa_entrega}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, fecha_promesa_entrega: e.target.value }))
                    }
                    disabled={loading}
                  />
                </div>

                {/* Kilometraje */}
                <div className="space-y-2">
                  <Label htmlFor="kilometraje_ingreso" className="text-[#202020] flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    Kilometraje de Ingreso *
                  </Label>
                  <Input
                    id="kilometraje_ingreso"
                    type="number"
                    placeholder="45000"
                    className="border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24]"
                    value={formData.kilometraje_ingreso}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, kilometraje_ingreso: e.target.value }))
                    }
                    disabled={loading}
                    min="0"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion_trabajo" className="text-[#202020] flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descripción del Trabajo *
                </Label>
                <Textarea
                  id="descripcion_trabajo"
                  placeholder="Describe el trabajo a realizar..."
                  className="border-gray-300 focus:border-[#ED1C24] focus:ring-[#ED1C24] min-h-[100px]"
                  value={formData.descripcion_trabajo}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, descripcion_trabajo: e.target.value }))
                  }
                  disabled={loading}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/dashboard/ot")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#ED1C24] hover:bg-[#C41820]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Orden de Trabajo"
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </motion.div>
      </div>
    </div>
  )
}

