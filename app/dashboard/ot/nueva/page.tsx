"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, FileText, Calendar, Gauge, User as UserIcon, Car, Wrench } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthToken } from "@/hooks/use-auth-token"
import {
  getTestData,
  createOrdenTrabajo,
} from "@/lib/api/ordenes-trabajo"
import type { TipoOT, SubtipoOT, ClienteTestData, AsesorTestData, VehiculoTestData } from "@/lib/types"
import { ordenTrabajoSchema, type OrdenTrabajoFormData } from "@/lib/validations/orden-trabajo"
import { toast } from "sonner"

export default function NuevaOrdenTrabajoPage() {
  const router = useRouter()
  const { getToken } = useAuthToken()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

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

  // Form configuration with React Hook Form + Zod
  const form = useForm<OrdenTrabajoFormData>({
    resolver: zodResolver(ordenTrabajoSchema),
    defaultValues: {
      tipo: "",
      subtipo: "",
      cliente: "",
      vehiculo: "",
      fecha_promesa_entrega: "",
      kilometraje_ingreso: 0,
      descripcion_trabajo: "",
      asesor: "",
    },
    mode: "onChange",
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
  const tipoValue = form.watch("tipo")
  useEffect(() => {
    if (!tipoValue) {
      setFilteredSubtipos([])
      form.setValue("subtipo", "")
      return
    }

    const tipoSeleccionado = tipos.find((t) => t.id.toString() === tipoValue)
    if (tipoSeleccionado) {
      const subtipposFiltrados = subtipos.filter((st) => st.tipo__codigo === tipoSeleccionado.codigo)
      setFilteredSubtipos(subtipposFiltrados)
    }
  }, [tipoValue, tipos, subtipos, form])

  // Filter vehicles when client changes
  const clienteValue = form.watch("cliente")
  useEffect(() => {
    if (!clienteValue) {
      setFilteredVehiculos([])
      form.setValue("vehiculo", "")
      return
    }

    // Filtrar vehículos por cliente
    const vehiculosDelCliente = vehiculos.filter(
      (v) => v.cliente__id.toString() === clienteValue
    )
    setFilteredVehiculos(vehiculosDelCliente)

    // TODO: Implementar carga desde API
    // const loadVehiculosFromAPI = async () => {
    //   const token = await getClientAccessToken()
    //   if (!token) return
    //   try {
    //     const vehiculosData = await getVehiculosByCliente(parseInt(clienteValue), token)
    //     setFilteredVehiculos(vehiculosData)
    //   } catch (error) {
    //     console.error("Error loading vehicles:", error)
    //     toast.error("Error al cargar los vehículos del cliente")
    //   }
    // }
    // loadVehiculosFromAPI()
  }, [clienteValue, vehiculos, form])

  const handleSubmit = async (data: OrdenTrabajoFormData) => {
    setLoading(true)

    const token = await getToken()
    if (!token) {
      toast.error("No se encontró token de autenticación")
      setLoading(false)
      return
    }

    try {
      // Prepare data for API (schema exacto requerido)
      const createData: any = {
        tipo: parseInt(data.tipo),
        cliente: parseInt(data.cliente),
        vehiculo: parseInt(data.vehiculo),
        fecha_promesa_entrega: new Date(data.fecha_promesa_entrega).toISOString(),
        kilometraje_ingreso: data.kilometraje_ingreso,
        descripcion_trabajo: data.descripcion_trabajo,
      }

      // Agregar subtipo si está seleccionado (opcional)
      if (data.subtipo) {
        createData.subtipo = parseInt(data.subtipo)
      }

      // Agregar asesor si está seleccionado (opcional)
      if (data.asesor) {
        createData.asesor = parseInt(data.asesor)
      }

      // Realizar POST a la API
      await createOrdenTrabajo(createData, token)

      // Si llegamos aquí, la creación fue exitosa (código 200)
      toast.success("Orden de trabajo creada exitosamente")

      // Redirigir a la lista de órdenes de trabajo
      router.push("/dashboard/ot")
    } catch (error: any) {
      console.error("Error creating OT:", error)
      toast.error(error.message || "Error al crear la orden de trabajo")
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
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">Información de la Orden</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Completa los datos para crear una nueva orden de trabajo
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <CardContent className="space-y-6 px-4 sm:px-6">

              {/* Grid para Tipo de Orden y Subtipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de OT */}
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Tipo de Orden *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                        <FormControl>
                          <SelectTrigger className="w-full border-gray-300 dark:border-border focus:border-primary focus:ring-primary">
                            <SelectValue placeholder="Selecciona el tipo de orden" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tipos.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id.toString()}>
                              {tipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subtipo de OT */}
                <FormField
                  control={form.control}
                  name="subtipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Subtipo de Orden
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading || !tipoValue || filteredSubtipos.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-gray-300 dark:border-border focus:border-primary focus:ring-primary">
                            <SelectValue
                              placeholder={
                                !tipoValue
                                  ? "Primero selecciona un tipo"
                                  : filteredSubtipos.length === 0
                                    ? "No hay subtipos disponibles"
                                    : "Selecciona el subtipo (opcional)"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredSubtipos.map((subtipo) => (
                            <SelectItem key={subtipo.id} value={subtipo.id.toString()}>
                              {subtipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Grid para Cliente y Asesor */}
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                {/* Cliente */}
                <FormField
                  control={form.control}
                  name="cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Cliente *
                      </FormLabel>
                      <Popover open={clienteOpen} onOpenChange={setClienteOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={clienteOpen}
                              className="w-full justify-between border-gray-300 dark:border-border focus:border-primary focus:ring-primary"
                              disabled={loading}
                            >
                              {field.value
                                ? (() => {
                                    const cliente = clientes.find((c) => c.id.toString() === field.value)
                                    return cliente
                                      ? `${cliente.first_name} ${cliente.last_name} - ${cliente.cedula}`
                                      : "Selecciona el cliente"
                                  })()
                                : "Selecciona el cliente"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full max-w-md mx-4 p-0 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                          <Command className="bg-white dark:bg-gray-950">
                            <CommandInput
                              placeholder="Buscar por nombre o cédula..."
                              className="border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                            />
                            <CommandList className="max-h-[300px] overflow-y-auto">
                              <CommandEmpty className="dark:text-gray-400">No se encontraron clientes.</CommandEmpty>
                              <CommandGroup className="overflow-x-auto">
                                {clientes.map((cliente) => (
                                  <CommandItem
                                    key={cliente.id}
                                    value={`${cliente.first_name} ${cliente.last_name} ${cliente.cedula}`}
                                    onSelect={() => {
                                      field.onChange(cliente.id.toString())
                                      setClienteOpen(false)
                                    }}
                                    className="whitespace-nowrap cursor-pointer dark:hover:bg-gray-800 dark:aria-selected:bg-gray-800"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 flex-shrink-0 text-primary",
                                        field.value === cliente.id.toString() ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="inline-block dark:text-gray-100">
                                      {cliente.first_name} {cliente.last_name} - {cliente.cedula}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Asesor */}
                <FormField
                  control={form.control}
                  name="asesor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Asesor (opcional)
                      </FormLabel>
                      <Popover open={asesorOpen} onOpenChange={setAsesorOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={asesorOpen}
                              className="w-full justify-between border-gray-300 dark:border-border focus:border-primary focus:ring-primary"
                              disabled={loading}
                            >
                              {field.value
                                ? (() => {
                                    const asesor = asesores.find((a) => a.id.toString() === field.value)
                                    return asesor
                                      ? `${asesor.first_name} ${asesor.last_name} - ${asesor.cedula}`
                                      : "Selecciona el asesor"
                                  })()
                                : "Selecciona el asesor"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full max-w-md mx-4 p-0 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                          <Command className="bg-white dark:bg-gray-950">
                            <CommandInput
                              placeholder="Buscar por nombre o cédula..."
                              className="border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                            />
                            <CommandList className="max-h-[300px] overflow-y-auto">
                              <CommandEmpty className="dark:text-gray-400">No se encontraron asesores.</CommandEmpty>
                              <CommandGroup className="overflow-x-auto">
                                {asesores.map((asesor) => (
                                  <CommandItem
                                    key={asesor.id}
                                    value={`${asesor.first_name} ${asesor.last_name} ${asesor.cedula}`}
                                    onSelect={() => {
                                      field.onChange(asesor.id.toString())
                                      setAsesorOpen(false)
                                    }}
                                    className="whitespace-nowrap cursor-pointer dark:hover:bg-gray-800 dark:aria-selected:bg-gray-800"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 flex-shrink-0 text-primary",
                                        field.value === asesor.id.toString() ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="inline-block dark:text-gray-100">
                                      {asesor.first_name} {asesor.last_name} - {asesor.cedula}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Vehículo */}
              <FormField
                control={form.control}
                name="vehiculo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Vehículo *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading || !clienteValue || filteredVehiculos.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 dark:border-border focus:border-primary focus:ring-primary">
                          <SelectValue
                            placeholder={
                              !clienteValue
                                ? "Primero selecciona un cliente"
                                : filteredVehiculos.length === 0
                                  ? "Este cliente no tiene vehículos"
                                  : "Selecciona el vehículo"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredVehiculos.map((vehiculo) => (
                          <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                            {vehiculo.modelo_tecnico__marca} {vehiculo.modelo_tecnico__modelo} - {vehiculo.placa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Grid para Fecha Promesa y Kilometraje */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha Promesa de Entrega */}
                <FormField
                  control={form.control}
                  name="fecha_promesa_entrega"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha Promesa de Entrega *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          className="border-gray-300 dark:border-border focus:border-primary focus:ring-primary"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Kilometraje */}
                <FormField
                  control={form.control}
                  name="kilometraje_ingreso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Kilometraje de Ingreso *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="45000"
                          className="border-gray-300 dark:border-border focus:border-primary focus:ring-primary"
                          disabled={loading}
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Descripción */}
              <FormField
                control={form.control}
                name="descripcion_trabajo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Descripción del Trabajo *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el trabajo a realizar..."
                        className="border-gray-300 dark:border-border focus:border-primary focus:ring-primary min-h-[100px]"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:flex-1"
                  onClick={() => router.push("/dashboard/ot")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:flex-1 bg-primary hover:bg-primary/90"
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
          </Form>
        </Card>
      </motion.div>
      </div>
    </div>
  )
}

