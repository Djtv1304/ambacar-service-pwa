"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Bell, Mail, MessageCircle, Check, FileText, Smartphone, Users, UserCog } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { mockTallerConfig, type TallerNotificationConfig } from "@/lib/fixtures/notifications-data"

// Types for dual config (clients + staff)
interface ChannelState {
  push: { enabled: boolean; configured: boolean }
  email: { enabled: boolean; configured: boolean }
  whatsapp: { enabled: boolean; configured: boolean }
}

interface ChannelCardProps {
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  configured: boolean
  onToggle: (enabled: boolean) => void
}

function ChannelCard({
  name,
  description,
  icon,
  enabled,
  configured,
  onToggle,
}: ChannelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`transition-all duration-200 ${enabled ? "ring-2 ring-primary/20" : ""} dark:bg-gray-900`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  enabled
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{name}</h3>
                  {configured ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-1.5 py-0">
                      <Check className="mr-0.5 h-3 w-3" />
                      OK
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-1.5 py-0">
                      Pendiente
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{description}</p>
              </div>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              aria-label={`Activar ${name}`}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TemplateCard({
  template,
  onEdit,
}: {
  template: TallerNotificationConfig["templates"][0]
  onEdit: () => void
}) {
  const channelIcons = {
    push: <Bell className="h-3.5 w-3.5" />,
    email: <Mail className="h-3.5 w-3.5" />,
    whatsapp: <MessageCircle className="h-3.5 w-3.5" />,
  }

  const channelColors = {
    push: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    email: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    whatsapp: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  }

  return (
    <Card className="dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer" onClick={onEdit}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${channelColors[template.channel]} text-xs`}>
                {channelIcons[template.channel]}
                <span className="ml-1 capitalize">{template.channel}</span>
              </Badge>
              {template.isDefault && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  Default
                </Badge>
              )}
            </div>
          </div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{template.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{template.body}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Tab indicator component for visual feedback
function TabIndicator({ type }: { type: "clients" | "staff" }) {
  return (
    <div className={`rounded-lg px-3 py-2 text-xs ${
      type === "clients" 
        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800" 
        : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
    }`}>
      {type === "clients" ? (
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Configurando notificaciones para <strong>Clientes</strong>
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <UserCog className="h-3.5 w-3.5" />
          Configurando notificaciones para <strong>Personal Interno</strong>
        </span>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}

export function TallerConfigView() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [config, setConfig] = React.useState<TallerNotificationConfig | null>(null)
  const [editingTemplate, setEditingTemplate] = React.useState<TallerNotificationConfig["templates"][0] | null>(null)

  // Separate state for clients and staff channels
  const [clientChannels, setClientChannels] = React.useState<ChannelState>({
    push: { enabled: true, configured: true },
    email: { enabled: true, configured: true },
    whatsapp: { enabled: true, configured: false },
  })

  const [staffChannels, setStaffChannels] = React.useState<ChannelState>({
    push: { enabled: true, configured: true },
    email: { enabled: true, configured: true },
    whatsapp: { enabled: false, configured: false },
  })

  // Active tabs state
  const [channelsTab, setChannelsTab] = React.useState<"clients" | "staff">("clients")
  const [templatesTab, setTemplatesTab] = React.useState<"clients" | "staff">("clients")

  // Simular carga de datos
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setConfig(mockTallerConfig)
      setClientChannels({
        push: mockTallerConfig.channels.push,
        email: mockTallerConfig.channels.email,
        whatsapp: mockTallerConfig.channels.whatsapp,
      })
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleToggleChannel = (
    target: "clients" | "staff",
    channel: "push" | "email" | "whatsapp",
    enabled: boolean
  ) => {
    const setter = target === "clients" ? setClientChannels : setStaffChannels
    setter((prev) => ({
      ...prev,
      [channel]: { ...prev[channel], enabled },
    }))

    const targetLabel = target === "clients" ? "clientes" : "personal interno"
    toast.success(`Canal ${enabled ? "activado" : "desactivado"}`, {
      description: `Canal para ${targetLabel} ${enabled ? "activado" : "desactivado"} correctamente.`,
    })
  }

  const handleSaveTemplate = () => {
    setEditingTemplate(null)
    toast.success("Plantilla guardada", {
      description: "Los cambios se han guardado correctamente.",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Configuración de Notificaciones
          </h1>
          <p className="text-muted-foreground">
            Configura los canales de notificación disponibles para tu taller
          </p>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  if (!config) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Configuración de Notificaciones
        </h1>
        <p className="text-muted-foreground">
          Configura los canales de notificación para clientes y personal interno
        </p>
      </div>

      {/* Canales de Comunicación */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Canales de Comunicación</h2>
        </div>

        <Tabs value={channelsTab} onValueChange={(v) => setChannelsTab(v as "clients" | "staff")}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <UserCog className="h-4 w-4" />
              Personal Interno
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabIndicator type={channelsTab} />
          </div>

          <TabsContent value="clients" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ChannelCard
                name="Notificaciones Push"
                description="Alertas en el dispositivo móvil"
                icon={<Bell className="h-5 w-5" />}
                enabled={clientChannels.push.enabled}
                configured={clientChannels.push.configured}
                onToggle={(enabled) => handleToggleChannel("clients", "push", enabled)}
              />
              <ChannelCard
                name="Correo Electrónico"
                description="Emails con imagen del taller"
                icon={<Mail className="h-5 w-5" />}
                enabled={clientChannels.email.enabled}
                configured={clientChannels.email.configured}
                onToggle={(enabled) => handleToggleChannel("clients", "email", enabled)}
              />
              <ChannelCard
                name="WhatsApp Business"
                description="Mensajes directos a WhatsApp"
                icon={<MessageCircle className="h-5 w-5" />}
                enabled={clientChannels.whatsapp.enabled}
                configured={clientChannels.whatsapp.configured}
                onToggle={(enabled) => handleToggleChannel("clients", "whatsapp", enabled)}
              />
            </div>
          </TabsContent>

          <TabsContent value="staff" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ChannelCard
                name="Notificaciones Push"
                description="Alertas para técnicos y operadores"
                icon={<Bell className="h-5 w-5" />}
                enabled={staffChannels.push.enabled}
                configured={staffChannels.push.configured}
                onToggle={(enabled) => handleToggleChannel("staff", "push", enabled)}
              />
              <ChannelCard
                name="Correo Electrónico"
                description="Emails corporativos internos"
                icon={<Mail className="h-5 w-5" />}
                enabled={staffChannels.email.enabled}
                configured={staffChannels.email.configured}
                onToggle={(enabled) => handleToggleChannel("staff", "email", enabled)}
              />
              <ChannelCard
                name="WhatsApp Business"
                description="Mensajes al grupo de staff"
                icon={<MessageCircle className="h-5 w-5" />}
                enabled={staffChannels.whatsapp.enabled}
                configured={staffChannels.whatsapp.configured}
                onToggle={(enabled) => handleToggleChannel("staff", "whatsapp", enabled)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* Plantillas de Mensajes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Plantillas de Mensajes</h2>
          </div>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Nueva Plantilla
          </Button>
        </div>

        <Tabs value={templatesTab} onValueChange={(v) => setTemplatesTab(v as "clients" | "staff")}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <UserCog className="h-4 w-4" />
              Personal Interno
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabIndicator type={templatesTab} />
          </div>

          <TabsContent value="clients" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Plantillas de mensajes para notificaciones a clientes. Usa variables como {"{{nombre}}"} o {"{{vehiculo}}"}.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {config.templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => setEditingTemplate(template)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="staff" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Plantillas para notificaciones internas al equipo. Usa variables como {"{{tecnico}}"} o {"{{orden}}"}.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* Mock staff templates */}
              <TemplateCard
                template={{
                  id: "staff-tpl-001",
                  name: "Nueva OT Asignada",
                  channel: "push",
                  body: "Tienes una nueva orden de trabajo asignada: {{orden}}",
                  isDefault: true,
                }}
                onEdit={() => setEditingTemplate({
                  id: "staff-tpl-001",
                  name: "Nueva OT Asignada",
                  channel: "push",
                  body: "Tienes una nueva orden de trabajo asignada: {{orden}}",
                  isDefault: true,
                })}
              />
              <TemplateCard
                template={{
                  id: "staff-tpl-002",
                  name: "Repuesto Disponible",
                  channel: "email",
                  subject: "Repuesto listo para instalación",
                  body: "El repuesto {{repuesto}} ya está disponible para la OT {{orden}}.",
                  isDefault: true,
                }}
                onEdit={() => setEditingTemplate({
                  id: "staff-tpl-002",
                  name: "Repuesto Disponible",
                  channel: "email",
                  subject: "Repuesto listo para instalación",
                  body: "El repuesto {{repuesto}} ya está disponible para la OT {{orden}}.",
                  isDefault: true,
                })}
              />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Dialog de edición de plantilla */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Plantilla</DialogTitle>
            <DialogDescription>
              Modifica el contenido de la plantilla de notificación.
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Nombre de la Plantilla</Label>
                <Input
                  id="template-name"
                  defaultValue={editingTemplate.name}
                  className="dark:bg-gray-800"
                />
              </div>
              {editingTemplate.subject && (
                <div className="space-y-2">
                  <Label htmlFor="template-subject">Asunto (Email)</Label>
                  <Input
                    id="template-subject"
                    defaultValue={editingTemplate.subject}
                    className="dark:bg-gray-800"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="template-body">Contenido del Mensaje</Label>
                <Textarea
                  id="template-body"
                  defaultValue={editingTemplate.body}
                  rows={4}
                  className="dark:bg-gray-800"
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles: {"{{nombre}}"}, {"{{vehiculo}}"}, {"{{fecha}}"}, {"{{kilometraje}}"}, {"{{orden}}"}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveTemplate}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

