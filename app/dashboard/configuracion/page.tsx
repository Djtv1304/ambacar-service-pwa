"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Shield, Palette, Loader2, Check, User, Mail, Phone, IdCard, Calendar, UserCircle, MapPin, Wrench } from "lucide-react"
import { WorkflowsPage } from "@/components/configuracion/workflows-page"
import { UsuariosTab } from "@/components/configuracion/usuarios-tab"
import { useTheme } from "next-themes"
import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cambiarPasswordPropio } from "@/lib/api/usuarios"
import { toast } from "sonner"
import { useAuth } from "@/components/auth/auth-provider"
import { getTalleres, type Taller } from "@/lib/api/erp-ambacar"
import { getSucursales, updateSucursal, type Sucursal, type UpdateSucursalData } from "@/lib/api/sucursales"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CURRENT_TALLER_ID } from "@/lib/constants/taller"
import { useAuthToken } from "@/hooks/use-auth-token"
import type { UserRole } from "@/lib/types"

// Zod schema para validar el formulario de cambio de contraseña
const changePasswordSchema = z.object({
  password_actual: z.string().min(1, "La contraseña actual es requerida"),
  password_nuevo: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  password_confirmacion: z.string().min(1, "Debes confirmar la nueva contraseña"),
}).refine((data) => data.password_nuevo === data.password_confirmacion, {
  message: "Las contraseñas no coinciden",
  path: ["password_confirmacion"],
})

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

// Mapeo de roles a nombres en español
const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  operator: "Operador de Servicio",
  technician: "Técnico",
  manager: "Jefe de Taller",
  customer: "Cliente",
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Interfaz para los campos editables del formulario de sucursal
interface SucursalFormData {
  nombre: string
  email: string
  direccion: string
  ciudad: string
  ruc: string
  telefono: string
  hora_apertura: string
  hora_cierre: string
}

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const { getToken } = useAuthToken()
  const { theme, setTheme } = useTheme()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("")
  const [tallerView, setTallerView] = useState<"info" | "talleres">("info")
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [loadingTalleres, setLoadingTalleres] = useState(false)

  // Estado para la sucursal del taller
  const [sucursal, setSucursal] = useState<Sucursal | null>(null)
  const [loadingSucursal, setLoadingSucursal] = useState(false)
  const [savingSucursal, setSavingSucursal] = useState(false)

  // Estado para el formulario editable
  const [formData, setFormData] = useState<SucursalFormData>({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    ruc: "",
    telefono: "",
    hora_apertura: "",
    hora_cierre: "",
  })

  // Estado inicial para detectar cambios
  const [initialFormData, setInitialFormData] = useState<SucursalFormData>({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    ruc: "",
    telefono: "",
    hora_apertura: "",
    hora_cierre: "",
  })

  // Form handling para cambio de contraseña
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determinar qué tabs mostrar según el rol del usuario
  const visibleTabs = useMemo(() => {
    const tabs = {
      perfil: true, // Todos pueden ver su perfil
      general: user?.role === "manager" || user?.role === "admin",
      fases: user?.role === "manager" || user?.role === "admin",
      usuarios: true, // Todos pueden ver usuarios (la lógica interna filtra)
      seguridad: true, // Todos pueden cambiar su contraseña
    }
    return tabs
  }, [user?.role])

  // Determinar el tab por defecto (desde URL o el primero que esté visible)
  const defaultTab = useMemo(() => {
    const tabFromUrl = searchParams.get("tab")

    // Si hay un tab en la URL y es visible, usarlo
    if (tabFromUrl && visibleTabs[tabFromUrl as keyof typeof visibleTabs]) {
      return tabFromUrl
    }

    // Caso contrario, usar el primero visible
    if (visibleTabs.perfil) return "perfil"
    if (visibleTabs.general) return "general"
    if (visibleTabs.fases) return "fases"
    if (visibleTabs.usuarios) return "usuarios"
    return "seguridad"
  }, [visibleTabs, searchParams])

  // Sincronizar activeTab con defaultTab (incluye cambios de URL)
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab)
    }
  }, [defaultTab])

  // Fetch talleres when General tab is active
  useEffect(() => {
    if (activeTab !== "general" || talleres.length > 0) return

    const fetchTalleres = async () => {
      setLoadingTalleres(true)
      try {
        const data = await getTalleres()
        setTalleres(data)
      } catch (error) {
        console.error("Error loading talleres:", error)
      } finally {
        setLoadingTalleres(false)
      }
    }

    fetchTalleres()
  }, [activeTab, talleres.length])

  // Fetch sucursal data when General tab is active
  useEffect(() => {
    if (activeTab !== "general" || sucursal !== null) return

    const fetchSucursal = async () => {
      setLoadingSucursal(true)
      try {
        const token = await getToken()
        if (!token) return

        const sucursales = await getSucursales(token)
        if (sucursales.length > 0) {
          const suc = sucursales[0] // Tomamos la primera (y única) sucursal
          setSucursal(suc)

          // Inicializar el formulario con los datos de la sucursal
          const initialData: SucursalFormData = {
            nombre: suc.nombre || "",
            email: suc.email || "",
            direccion: suc.direccion || "",
            ciudad: suc.ciudad || "",
            ruc: suc.ruc || "",
            telefono: suc.telefono || "",
            hora_apertura: suc.hora_apertura?.slice(0, 5) || "", // "09:30:00" -> "09:30"
            hora_cierre: suc.hora_cierre?.slice(0, 5) || "",
          }
          setFormData(initialData)
          setInitialFormData(initialData)
        }
      } catch (error) {
        console.error("Error loading sucursal:", error)
        toast.error("Error al cargar la información del taller")
      } finally {
        setLoadingSucursal(false)
      }
    }

    fetchSucursal()
  }, [activeTab, sucursal, getToken])

  // Detectar si hay cambios en el formulario
  const hasFormChanges = useMemo(() => {
    return (
      formData.nombre !== initialFormData.nombre ||
      formData.email !== initialFormData.email ||
      formData.direccion !== initialFormData.direccion ||
      formData.ciudad !== initialFormData.ciudad ||
      formData.ruc !== initialFormData.ruc ||
      formData.telefono !== initialFormData.telefono ||
      formData.hora_apertura !== initialFormData.hora_apertura ||
      formData.hora_cierre !== initialFormData.hora_cierre
    )
  }, [formData, initialFormData])

  // Verificar si el usuario puede editar (admin o manager)
  const canEditSucursal = user?.role === "admin" || user?.role === "manager"

  // Handler para guardar cambios de la sucursal
  const handleSaveSucursal = async () => {
    if (!sucursal || !hasFormChanges || !canEditSucursal) return

    setSavingSucursal(true)
    try {
      const token = await getToken()
      if (!token) {
        toast.error("Error de autenticación")
        return
      }

      // Preparar datos para el PATCH (convertir hora a formato HH:MM:SS)
      const updateData: UpdateSucursalData = {
        nombre: formData.nombre,
        email: formData.email,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        ruc: formData.ruc,
        telefono: formData.telefono,
        hora_apertura: formData.hora_apertura ? `${formData.hora_apertura}:00` : undefined,
        hora_cierre: formData.hora_cierre ? `${formData.hora_cierre}:00` : undefined,
      }

      const updatedSucursal = await updateSucursal(sucursal.id, updateData, token)
      setSucursal(updatedSucursal)

      // Actualizar el estado inicial para reflejar los nuevos valores guardados
      const newInitialData: SucursalFormData = {
        nombre: updatedSucursal.nombre || "",
        email: updatedSucursal.email || "",
        direccion: updatedSucursal.direccion || "",
        ciudad: updatedSucursal.ciudad || "",
        ruc: updatedSucursal.ruc || "",
        telefono: updatedSucursal.telefono || "",
        hora_apertura: updatedSucursal.hora_apertura?.slice(0, 5) || "",
        hora_cierre: updatedSucursal.hora_cierre?.slice(0, 5) || "",
      }
      setFormData(newInitialData)
      setInitialFormData(newInitialData)

      toast.success("Cambios guardados", {
        description: "La información del taller ha sido actualizada exitosamente",
      })
    } catch (error: any) {
      console.error("Error saving sucursal:", error)
      toast.error("Error al guardar cambios", {
        description: error.message || "No se pudo actualizar la información del taller",
      })
    } finally {
      setSavingSucursal(false)
    }
  }

  // Handler para actualizar campos del formulario
  const handleFormChange = (field: keyof SucursalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Datos del usuario para la Tab de Perfil
  const userInitials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : "??"
  const userFullName = user ? `${user.first_name} ${user.last_name}` : "Usuario"
  const userRole = user ? roleLabels[user.role] : "N/A"

  // Handler para cambio de contraseña
  const onSubmitPasswordChange = async (data: ChangePasswordForm) => {
    setIsChangingPassword(true)
    try {
      await cambiarPasswordPropio(data)
      toast.success("Contraseña cambiada", {
        description: "Tu contraseña ha sido actualizada exitosamente",
      })
      reset() // Limpiar el formulario
    } catch (error: any) {
      console.error("Error cambiando contraseña:", error)
      toast.error("Error al cambiar contraseña", {
        description: error.message || "No se pudo cambiar la contraseña. Verifica tu contraseña actual.",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Administra la configuración del sistema</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          {visibleTabs.perfil && <TabsTrigger value="perfil">Perfil</TabsTrigger>}
          {visibleTabs.general && <TabsTrigger value="general">General</TabsTrigger>}
          {visibleTabs.fases && <TabsTrigger value="fases">Fases de Servicios</TabsTrigger>}
          {visibleTabs.usuarios && <TabsTrigger value="usuarios">Usuarios</TabsTrigger>}
          {visibleTabs.seguridad && <TabsTrigger value="seguridad">Seguridad</TabsTrigger>}
        </TabsList>

        {/* Tab de Perfil */}
        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  <CardTitle>Mi Perfil</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const userId = user?.id
                    if (userId) {
                      window.location.href = `/dashboard/configuracion?tab=usuarios&userId=${userId}`
                    }
                  }}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  Editar datos
                </Button>
              </div>
              <CardDescription>Información de tu cuenta y perfil personal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar y Nombre */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground">{userFullName}</h3>
                  <Badge variant="outline" className="mt-1">{userRole}</Badge>
                </div>
              </div>

              {/* Mensaje informativo */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="shrink-0 h-8 w-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">
                    ¿Necesitas actualizar tu información?
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                    Utiliza el botón "Editar datos" en la parte superior para modificar tu información personal.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Información Personal</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nombre
                    </Label>
                    <Input value={user.first_name} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Apellido
                    </Label>
                    <Input value={user.last_name} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Correo Electrónico
                    </Label>
                    <Input value={user.email} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      Nombre de Usuario
                    </Label>
                    <Input value={user.username} disabled className="bg-muted" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Información de Contacto */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Información de Contacto</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </Label>
                    <Input
                      value={user.phone || "No registrado"}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      Cédula
                    </Label>
                    <Input
                      value={user.cedula || "No registrada"}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Información de Cuenta */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Información de Cuenta</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Rol en el Sistema
                    </Label>
                    <Input value={userRole} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Creación
                    </Label>
                    <Input
                      value={user.created_at ? new Date(user.created_at).toLocaleDateString("es-EC", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }) : "N/A"}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <CardTitle>Información del Taller</CardTitle>
                  </div>
                  <CardDescription className="mt-1.5">
                    {tallerView === "info"
                      ? "Configura los datos básicos de tu negocio"
                      : "Talleres disponibles en la red Ambacar"}
                  </CardDescription>
                </div>
                <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
                  <button
                    onClick={() => setTallerView("info")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      tallerView === "info"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Mi Taller
                  </button>
                  <button
                    onClick={() => setTallerView("talleres")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      tallerView === "talleres"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Talleres
                    {talleres.length > 0 && (
                      <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                        {talleres.length}
                      </Badge>
                    )}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tallerView === "info" ? (
                <>
                  {loadingSucursal ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : sucursal ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="nombre-taller">Nombre del Taller</Label>
                          <Input
                            id="nombre-taller"
                            value={formData.nombre}
                            onChange={(e) => handleFormChange("nombre", e.target.value)}
                            disabled={!canEditSucursal || savingSucursal}
                            className={!canEditSucursal ? "bg-muted" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ruc">RUC</Label>
                          <Input
                            id="ruc"
                            value={formData.ruc}
                            onChange={(e) => handleFormChange("ruc", e.target.value)}
                            disabled={!canEditSucursal || savingSucursal}
                            className={!canEditSucursal ? "bg-muted" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefono">Teléfono</Label>
                          <Input
                            id="telefono"
                            value={formData.telefono}
                            onChange={(e) => handleFormChange("telefono", e.target.value)}
                            disabled={!canEditSucursal || savingSucursal}
                            className={!canEditSucursal ? "bg-muted" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleFormChange("email", e.target.value)}
                            disabled={!canEditSucursal || savingSucursal}
                            className={!canEditSucursal ? "bg-muted" : ""}
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="direccion">Dirección</Label>
                          <Input
                            id="direccion"
                            value={formData.direccion}
                            onChange={(e) => handleFormChange("direccion", e.target.value)}
                            disabled={!canEditSucursal || savingSucursal}
                            className={!canEditSucursal ? "bg-muted" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ciudad">Ciudad</Label>
                          <Input
                            id="ciudad"
                            value={formData.ciudad}
                            onChange={(e) => handleFormChange("ciudad", e.target.value)}
                            disabled={!canEditSucursal || savingSucursal}
                            className={!canEditSucursal ? "bg-muted" : ""}
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="font-semibold">Horario de Atención</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="horario-inicio">Hora de Apertura</Label>
                            <Input
                              id="horario-inicio"
                              type="time"
                              value={formData.hora_apertura}
                              onChange={(e) => handleFormChange("hora_apertura", e.target.value)}
                              disabled={!canEditSucursal || savingSucursal}
                              className={!canEditSucursal ? "bg-muted" : ""}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="horario-fin">Hora de Cierre</Label>
                            <Input
                              id="horario-fin"
                              type="time"
                              value={formData.hora_cierre}
                              onChange={(e) => handleFormChange("hora_cierre", e.target.value)}
                              disabled={!canEditSucursal || savingSucursal}
                              className={!canEditSucursal ? "bg-muted" : ""}
                            />
                          </div>
                        </div>
                      </div>
                      {canEditSucursal && (
                        <div className="flex justify-end">
                          <Button
                            onClick={handleSaveSucursal}
                            disabled={!hasFormChanges || savingSucursal}
                          >
                            {savingSucursal ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Guardar Cambios
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Building2 className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No se pudo cargar la información del taller</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {loadingTalleres ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : talleres.length > 0 ? (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {talleres.map((taller) => {
                          const isCurrent = taller.idTaller === CURRENT_TALLER_ID
                          return (
                            <div
                              key={taller.idTaller}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                isCurrent
                                  ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                                  : "border-border hover:bg-muted/50"
                              }`}
                            >
                              <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
                                isCurrent
                                  ? "bg-primary/10 dark:bg-primary/20"
                                  : "bg-muted"
                              }`}>
                                <Wrench className={`h-4 w-4 ${
                                  isCurrent ? "text-primary" : "text-muted-foreground"
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate">
                                    {toTitleCase(taller.nombreTaller)}
                                  </p>
                                  {isCurrent && (
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-primary/30 text-primary shrink-0">
                                      Actual
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <span className="text-xs text-muted-foreground">
                                    Agencia: {taller.idAgencia}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground font-mono shrink-0">
                                ID: {taller.idTaller}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Building2 className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No se pudieron cargar los talleres</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>Apariencia</CardTitle>
              </div>
              <CardDescription>Personaliza la apariencia del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tema Oscuro</Label>
                  <p className="text-sm text-muted-foreground">Activa el modo oscuro en toda la aplicación</p>
                </div>
                <Switch
                  checked={mounted ? theme === 'dark' : false}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  disabled={!mounted}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fases" className="space-y-4">
          <WorkflowsPage />
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <UsuariosTab userIdToView={searchParams.get("userId") ? Number(searchParams.get("userId")) : undefined} />
        </TabsContent>

        <TabsContent value="seguridad" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Seguridad</CardTitle>
              </div>
              <CardDescription>Configura las opciones de seguridad del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmitPasswordChange)} className="space-y-4">
                <h3 className="font-semibold">Contraseña</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password_actual">Contraseña Actual</Label>
                    <Input
                      id="password_actual"
                      type="password"
                      {...register("password_actual")}
                      disabled={isChangingPassword}
                    />
                    {errors.password_actual && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.password_actual.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password_nuevo">Nueva Contraseña</Label>
                    <Input
                      id="password_nuevo"
                      type="password"
                      {...register("password_nuevo")}
                      disabled={isChangingPassword}
                    />
                    {errors.password_nuevo && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.password_nuevo.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password_confirmacion">Confirmar Contraseña</Label>
                    <Input
                      id="password_confirmacion"
                      type="password"
                      {...register("password_confirmacion")}
                      disabled={isChangingPassword}
                    />
                    {errors.password_confirmacion && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.password_confirmacion.message}</p>
                    )}
                  </div>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cambiando contraseña...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Cambiar Contraseña
                      </>
                    )}
                  </Button>
                </div>
              </form>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Opciones de Seguridad</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cerrar Sesión Automáticamente</Label>
                      <p className="text-sm text-muted-foreground">
                        Cierra la sesión después de 30 minutos de inactividad
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
