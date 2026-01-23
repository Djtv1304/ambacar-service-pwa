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
import { Building2, Shield, Palette, Loader2, Check, User, Mail, Phone, IdCard, Calendar, UserCircle } from "lucide-react"
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

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("")

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
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <CardTitle>Información del Taller</CardTitle>
              </div>
              <CardDescription>Configura los datos básicos de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre-taller">Nombre del Taller</Label>
                  <Input id="nombre-taller" defaultValue="Ambacar Service Center" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC</Label>
                  <Input id="ruc" defaultValue="1234567890001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" defaultValue="+593 2 234 5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="contacto@ambacar.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" defaultValue="Av. Amazonas N24-03 y Colón, Quito, Ecuador" />
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Horario de Atención</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="horario-inicio">Hora de Apertura</Label>
                    <Input id="horario-inicio" type="time" defaultValue="08:00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horario-fin">Hora de Cierre</Label>
                    <Input id="horario-fin" type="time" defaultValue="18:00" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Guardar Cambios</Button>
              </div>
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
