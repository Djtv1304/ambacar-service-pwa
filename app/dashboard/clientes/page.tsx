"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, Plus, Download, Mail, Phone, RefreshCw, Loader2, Eye, EyeOff, UserCheck, UserX, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { obtenerClientes, crearUsuario, editarUsuario, type Usuario } from "@/lib/api/usuarios"
import { crearClienteSchema, editarClienteSchema, type CrearClienteFormData, type EditarClienteFormData } from "@/lib/validations/clientes"

function ClienteCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface ClienteCardProps {
  cliente: Usuario
  onClick: () => void
}

function ClienteCard({ cliente, onClick }: ClienteCardProps) {
  return (
    <Card
      className="transition-colors hover:bg-accent/50 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {cliente.first_name.charAt(0)}
              {cliente.last_name?.charAt(0) || ""}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">
                  {cliente.first_name} {cliente.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  CI: {cliente.cedula}
                </p>
              </div>
              <Badge variant={cliente.is_active ? "default" : "secondary"}>
                {cliente.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {cliente.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {cliente.email}
                </div>
              )}
              {cliente.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {cliente.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DetalleClienteDialogProps {
  cliente: Usuario | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
}

function DetalleClienteDialog({ cliente, open, onOpenChange, onEdit }: DetalleClienteDialogProps) {
  if (!cliente) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {cliente.first_name.charAt(0)}
                {cliente.last_name?.charAt(0) || ""}
              </AvatarFallback>
            </Avatar>
            <div>
              <span>{cliente.first_name} {cliente.last_name}</span>
              <Badge variant={cliente.is_active ? "default" : "secondary"} className="ml-2">
                {cliente.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Información detallada del cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Cédula</p>
              <p className="font-medium">{cliente.cedula}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="font-medium">@{cliente.username}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Correo Electrónico</p>
              <p className="font-medium">{cliente.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="font-medium">{cliente.phone || "No registrado"}</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Fecha de registro:</span>
              <span className="font-medium">{formatDate(cliente.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Última actualización:</span>
              <span className="font-medium">{formatDateTime(cliente.updated_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {cliente.is_active ? (
                <UserCheck className="h-4 w-4 text-green-600" />
              ) : (
                <UserX className="h-4 w-4 text-red-600" />
              )}
              <span className="text-muted-foreground">Estado:</span>
              <span className={`font-medium ${cliente.is_active ? "text-green-600" : "text-red-600"}`}>
                {cliente.is_active ? "Cuenta activa" : "Cuenta inactiva"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={onEdit}>
            Editar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface CrearClienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function CrearClienteDialog({ open, onOpenChange, onSuccess }: CrearClienteDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const form = useForm<CrearClienteFormData>({
    resolver: zodResolver(crearClienteSchema),
    defaultValues: {
      email: "",
      password: "",
      password_confirm: "",
      first_name: "",
      last_name: "",
      cedula: "",
      phone: "",
    },
  })

  const onSubmit = async (data: CrearClienteFormData) => {
    setIsLoading(true)
    try {
      await crearUsuario({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role: "customer",
        cedula: data.cedula,
        phone: data.phone.replace(/\s+/g, ""),
      })

      toast({
        title: "Cliente creado",
        description: `${data.first_name} ${data.last_name} ha sido registrado exitosamente.`,
      })

      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error al crear cliente",
        description: error.message || "No se pudo crear el cliente",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Completa el formulario para registrar un nuevo cliente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Pérez" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cedula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1712345678"
                      maxLength={10}
                      {...field}
                      disabled={isLoading}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="cliente@email.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+593 099 123 4567"
                      {...field}
                      disabled={isLoading}
                      onFocus={(e) => {
                        if (!e.target.value) {
                          field.onChange("+593 0")
                        }
                      }}
                      onChange={(e) => {
                        let value = e.target.value
                        const prefix = "+593 0"
                        if (!value.startsWith(prefix)) {
                          value = prefix
                        }
                        let numberPart = value.slice(prefix.length).replace(/\D/g, "").slice(0, 9)
                        let formatted = ""
                        if (numberPart.length > 0) formatted = numberPart.slice(0, 2)
                        if (numberPart.length > 2) formatted += " " + numberPart.slice(2, 5)
                        if (numberPart.length > 5) formatted += " " + numberPart.slice(5, 9)
                        field.onChange(prefix + formatted)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPasswordConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Cliente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface EditarClienteDialogProps {
  cliente: Usuario | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function EditarClienteDialog({ cliente, open, onOpenChange, onSuccess }: EditarClienteDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<EditarClienteFormData>({
    resolver: zodResolver(editarClienteSchema),
    defaultValues: {
      email: "",
      username: "",
      first_name: "",
      last_name: "",
      cedula: "",
      phone: "",
    },
  })

  // Update form when cliente changes
  useEffect(() => {
    if (cliente) {
      form.reset({
        email: cliente.email,
        username: cliente.username,
        first_name: cliente.first_name,
        last_name: cliente.last_name,
        cedula: cliente.cedula,
        phone: cliente.phone,
      })
    }
  }, [cliente, form])

  const onSubmit = async (data: EditarClienteFormData) => {
    if (!cliente) return

    setIsLoading(true)
    try {
      await editarUsuario(cliente.id, {
        email: data.email,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        cedula: data.cedula,
        phone: data.phone.replace(/\s+/g, ""),
      })

      toast({
        title: "Cliente actualizado",
        description: `Los datos de ${data.first_name} ${data.last_name} han sido actualizados.`,
      })

      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar el cliente",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!cliente) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Modifica los datos del cliente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cedula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula</FormLabel>
                  <FormControl>
                    <Input
                      maxLength={10}
                      {...field}
                      disabled={isLoading}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      {...field}
                      disabled={isLoading}
                      onChange={(e) => {
                        let value = e.target.value
                        const prefix = "+593 0"
                        if (!value.startsWith(prefix) && value.length > 0) {
                          // Allow editing existing numbers
                          field.onChange(value)
                          return
                        }
                        if (!value.startsWith(prefix)) {
                          value = prefix
                        }
                        let numberPart = value.slice(prefix.length).replace(/\D/g, "").slice(0, 9)
                        let formatted = ""
                        if (numberPart.length > 0) formatted = numberPart.slice(0, 2)
                        if (numberPart.length > 2) formatted += " " + numberPart.slice(2, 5)
                        if (numberPart.length > 5) formatted += " " + numberPart.slice(5, 9)
                        field.onChange(prefix + formatted)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default function ClientesPage() {
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")

  // Dialog states
  const [selectedCliente, setSelectedCliente] = useState<Usuario | null>(null)
  const [showDetalleDialog, setShowDetalleDialog] = useState(false)
  const [showCrearDialog, setShowCrearDialog] = useState(false)
  const [showEditarDialog, setShowEditarDialog] = useState(false)

  const fetchClientes = async () => {
    setIsLoading(true)
    try {
      const data = await obtenerClientes()
      setClientes(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los clientes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        searchQuery === "" ||
        `${cliente.first_name} ${cliente.last_name}`.toLowerCase().includes(searchLower) ||
        cliente.cedula.toLowerCase().includes(searchLower) ||
        cliente.email.toLowerCase().includes(searchLower) ||
        cliente.phone?.toLowerCase().includes(searchLower)

      // Status filter
      const matchesEstado =
        filterEstado === "todos" ||
        (filterEstado === "activo" && cliente.is_active) ||
        (filterEstado === "inactivo" && !cliente.is_active)

      return matchesSearch && matchesEstado
    })
  }, [clientes, searchQuery, filterEstado])

  const handleClienteClick = (cliente: Usuario) => {
    setSelectedCliente(cliente)
    setShowDetalleDialog(true)
  }

  const handleEditFromDetalle = () => {
    setShowDetalleDialog(false)
    setShowEditarDialog(true)
  }

  const handleSuccess = () => {
    fetchClientes()
    setSelectedCliente(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona la información de tus clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => setShowCrearDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cédula, email o teléfono..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchClientes} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <ClienteCardSkeleton />
              <ClienteCardSkeleton />
              <ClienteCardSkeleton />
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium">No se encontraron clientes</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterEstado !== "todos"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Registra tu primer cliente para comenzar"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClientes.map((cliente) => (
                <ClienteCard
                  key={cliente.id}
                  cliente={cliente}
                  onClick={() => handleClienteClick(cliente)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <DetalleClienteDialog
        cliente={selectedCliente}
        open={showDetalleDialog}
        onOpenChange={setShowDetalleDialog}
        onEdit={handleEditFromDetalle}
      />

      <CrearClienteDialog
        open={showCrearDialog}
        onOpenChange={setShowCrearDialog}
        onSuccess={handleSuccess}
      />

      <EditarClienteDialog
        cliente={selectedCliente}
        open={showEditarDialog}
        onOpenChange={setShowEditarDialog}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
