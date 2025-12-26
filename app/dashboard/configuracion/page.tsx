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
import { mockUsers, type MockUser } from "@/lib/fixtures/users"
import { Building2, Bell, Shield, Users, Palette, Database } from "lucide-react"
import { WorkflowsPage } from "@/components/configuracion/workflows-page"

export default function ConfiguracionPage() {
  const usuarios: MockUser[] = mockUsers.filter((u) => u.rol !== "customer")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Administra la configuración del sistema</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="fases">Fases del Servicio</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
        </TabsList>

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
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="idioma">Idioma</Label>
                <Select defaultValue="es">
                  <SelectTrigger id="idioma">
                    <SelectValue placeholder="Selecciona un idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español (Ecuador)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fases" className="space-y-4">
          <WorkflowsPage />
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              {/* Mobile: Stack vertical */}
              <div className="flex flex-col gap-3 sm:hidden">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Gestión de Usuarios</CardTitle>
                </div>
                <CardDescription>Administra los usuarios del sistema y sus permisos</CardDescription>
                <Button size="sm" className="w-full">Agregar Usuario</Button>
              </div>

              {/* Desktop: Horizontal layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Gestión de Usuarios</CardTitle>
                </div>
                <Button size="sm">Agregar Usuario</Button>
              </div>
              <CardDescription className="hidden sm:block">Administra los usuarios del sistema y sus permisos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usuarios.map((usuario) => (
                  <div key={usuario.id} className="rounded-lg border p-4">
                    {/* Mobile Layout: Vertical Stack */}
                    <div className="flex flex-col gap-3 sm:hidden">
                      {/* Row 1: Avatar + Name + Email */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {usuario.nombre.charAt(0)}
                            {usuario.apellido.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {usuario.nombre} {usuario.apellido}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{usuario.email}</p>
                        </div>
                      </div>

                      {/* Row 2: Badge Role */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground shrink-0">Rol:</span>
                        <Badge variant={usuario.rol === "admin" ? "default" : "secondary"}>
                          {usuario.rol === "admin" && "Administrador"}
                          {usuario.rol === "operator" && "Operador"}
                          {usuario.rol === "technician" && "Técnico"}
                          {usuario.rol === "manager" && "Jefe de Taller"}
                        </Badge>
                      </div>

                      {/* Row 3: Active Switch */}
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          {usuario.activo ? "Usuario Activo" : "Usuario Inactivo"}
                        </Label>
                        <Switch defaultChecked={usuario.activo} />
                      </div>

                      {/* Row 4: Edit Button */}
                      <Button variant="outline" size="sm" className="w-full">
                        Editar Usuario
                      </Button>
                    </div>

                    {/* Desktop Layout: Horizontal */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {usuario.nombre.charAt(0)}
                            {usuario.apellido.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {usuario.nombre} {usuario.apellido}
                          </p>
                          <p className="text-sm text-muted-foreground">{usuario.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={usuario.rol === "admin" ? "default" : "secondary"}>
                          {usuario.rol === "admin" && "Administrador"}
                          {usuario.rol === "operator" && "Operador"}
                          {usuario.rol === "technician" && "Técnico"}
                          {usuario.rol === "manager" && "Jefe de Taller"}
                        </Badge>
                        <Switch defaultChecked={usuario.activo} />
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Preferencias de Notificaciones</CardTitle>
              </div>
              <CardDescription>Configura cómo y cuándo recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Notificaciones del Sistema</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Nuevas Citas</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe notificaciones cuando se agende una nueva cita
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Órdenes de Trabajo</Label>
                      <p className="text-sm text-muted-foreground">Notificaciones sobre cambios en las OTs</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Stock Bajo</Label>
                      <p className="text-sm text-muted-foreground">Alertas cuando el inventario esté bajo</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Notificaciones por Email</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Resumen Diario</Label>
                      <p className="text-sm text-muted-foreground">Recibe un resumen diario de actividades</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reporte Semanal</Label>
                      <p className="text-sm text-muted-foreground">Reporte semanal de métricas y rendimiento</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <div className="space-y-4">
                <h3 className="font-semibold">Contraseña</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña Actual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Cambiar Contraseña</Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Opciones de Seguridad</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Autenticación de Dos Factores</Label>
                      <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad</p>
                    </div>
                    <Switch />
                  </div>
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
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  <h3 className="font-semibold">Respaldo de Datos</h3>
                </div>
                <p className="text-sm text-muted-foreground">Último respaldo: Hace 2 horas</p>
                <div className="flex gap-2">
                  <Button variant="outline">Crear Respaldo</Button>
                  <Button variant="outline">Restaurar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
