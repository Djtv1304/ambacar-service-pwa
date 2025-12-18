"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Bell, Mail, MessageCircle, Check, Settings2, FileText, Smartphone } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
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

interface ChannelCardProps {
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  configured: boolean
  onToggle: (enabled: boolean) => void
  onConfigure: () => void
}

function ChannelCard({
  name,
  description,
  icon,
  enabled,
  configured,
  onToggle,
  onConfigure,
}: ChannelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`transition-all duration-200 ${enabled ? "ring-2 ring-primary/20" : ""} dark:bg-gray-900`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  enabled
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
                  {configured ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <Check className="mr-1 h-3 w-3" />
                      Configurado
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Pendiente
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              aria-label={`Activar ${name}`}
            />
          </div>

          {enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <Button variant="outline" size="sm" onClick={onConfigure} className="w-full sm:w-auto">
                <Settings2 className="mr-2 h-4 w-4" />
                Configurar Canal
              </Button>
            </motion.div>
          )}
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
    push: <Bell className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    whatsapp: <MessageCircle className="h-4 w-4" />,
  }

  const channelColors = {
    push: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    email: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    whatsapp: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  }

  return (
    <Card className="dark:bg-gray-900">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={channelColors[template.channel]}>
                {channelIcons[template.channel]}
                <span className="ml-1 capitalize">{template.channel}</span>
              </Badge>
              {template.isDefault && (
                <Badge variant="outline" className="text-xs">
                  Por defecto
                </Badge>
              )}
            </div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{template.name}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{template.body}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
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
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  )
}

export function TallerConfigView() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [config, setConfig] = React.useState<TallerNotificationConfig | null>(null)
  const [editingTemplate, setEditingTemplate] = React.useState<TallerNotificationConfig["templates"][0] | null>(null)

  // Simular carga de datos
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setConfig(mockTallerConfig)
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleToggleChannel = (channel: "push" | "email" | "whatsapp", enabled: boolean) => {
    if (!config) return

    setConfig({
      ...config,
      channels: {
        ...config.channels,
        [channel]: { ...config.channels[channel], enabled },
      },
    })

    toast.success(`Canal ${enabled ? "activado" : "desactivado"}`, {
      description: `El canal ha sido ${enabled ? "activado" : "desactivado"} correctamente.`,
    })
  }

  const handleConfigureChannel = (channel: "push" | "email" | "whatsapp") => {
    toast.info("Configuración de canal", {
      description: `Abriendo configuración para ${channel}...`,
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
          Configura los canales de notificación disponibles para tu taller
        </p>
      </div>

      {/* Canales */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Canales de Comunicación</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Activa los canales que quieres ofrecer a tus clientes para recibir notificaciones.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ChannelCard
            name="Notificaciones Push"
            description="Alertas instantáneas en el dispositivo móvil del cliente"
            icon={<Bell className="h-6 w-6" />}
            enabled={config.channels.push.enabled}
            configured={config.channels.push.configured}
            onToggle={(enabled) => handleToggleChannel("push", enabled)}
            onConfigure={() => handleConfigureChannel("push")}
          />
          <ChannelCard
            name="Correo Electrónico"
            description="Emails profesionales con la imagen de tu taller"
            icon={<Mail className="h-6 w-6" />}
            enabled={config.channels.email.enabled}
            configured={config.channels.email.configured}
            onToggle={(enabled) => handleToggleChannel("email", enabled)}
            onConfigure={() => handleConfigureChannel("email")}
          />
          <ChannelCard
            name="WhatsApp Business"
            description="Mensajes directos al WhatsApp del cliente"
            icon={<MessageCircle className="h-6 w-6" />}
            enabled={config.channels.whatsapp.enabled}
            configured={config.channels.whatsapp.configured}
            onToggle={(enabled) => handleToggleChannel("whatsapp", enabled)}
            onConfigure={() => handleConfigureChannel("whatsapp")}
          />
        </div>
      </section>

      <Separator />

      {/* Plantillas */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Plantillas de Mensajes</h2>
          </div>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Nueva Plantilla
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Personaliza los mensajes que se envían a tus clientes. Usa variables como {"{{nombre}}"} o {"{{vehiculo}}"}.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {config.templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => setEditingTemplate(template)}
            />
          ))}
        </div>
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
                  Variables disponibles: {"{{nombre}}"}, {"{{vehiculo}}"}, {"{{fecha}}"}, {"{{kilometraje}}"}
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

