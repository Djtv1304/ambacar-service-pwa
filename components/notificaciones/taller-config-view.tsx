"use client"

import * as React from "react"
import {
  Bell,
  Mail,
  MessageCircle,
  FileText,
  Users,
  UserCog,
  Plus,
  Edit,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { OrchestrationMatrix } from "./orchestration-matrix"
import { TemplateEditorDialog } from "./template-editor-dialog"
import {
  NOTIFICATION_TEMPLATES,
  type NotificationTemplate,
} from "@/lib/fixtures/notification-orchestration"

// Tab indicator component for visual feedback
function TabIndicator({ type }: { type: "clients" | "staff" }) {
  return (
    <div
      className={`rounded-lg px-3 py-2 text-xs ${
        type === "clients"
          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
          : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
      }`}
    >
      {type === "clients" ? (
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Configurando notificaciones automáticas para <strong>Clientes</strong>
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <UserCog className="h-3.5 w-3.5" />
          Configurando notificaciones automáticas para <strong>Personal Interno</strong>
        </span>
      )}
    </div>
  )
}

// Template Card Component
function TemplateCard({
  template,
  onEdit,
}: {
  template: NotificationTemplate
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
    <Card
      className="dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onEdit}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${channelColors[template.channel]} text-xs`}>
                {channelIcons[template.channel]}
                <span className="ml-1 capitalize">
                  {template.channel === "whatsapp" ? "WhatsApp" : template.channel}
                </span>
              </Badge>
              {template.isDefault && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  Default
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
            {template.name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{template.body}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-12 w-full max-w-md" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}

// Main Component
export function TallerConfigView() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [orchestrationTab, setOrchestrationTab] = React.useState<"clients" | "staff">("clients")
  const [templatesTab, setTemplatesTab] = React.useState<"clients" | "staff">("clients")
  const [templates, setTemplates] = React.useState<NotificationTemplate[]>([])
  const [editingTemplate, setEditingTemplate] = React.useState<NotificationTemplate | null>(null)
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTemplates(NOTIFICATION_TEMPLATES)
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setIsEditorOpen(true)
  }

  const handleNewTemplate = () => {
    setEditingTemplate(null)
    setIsEditorOpen(true)
  }

  const handleSaveTemplate = (template: NotificationTemplate) => {
    setTemplates((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === template.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = template
        return updated
      }
      return [...prev, template]
    })
  }

  const filteredTemplates = templates.filter((t) => t.target === templatesTab)

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Configuración de Notificaciones
        </h1>
        <p className="text-muted-foreground">
          Orquesta las notificaciones automáticas por tipo de servicio y fase
        </p>
      </div>

      {/* Orchestration Matrix Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Matriz de Orquestación
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Configura qué notificaciones se envían automáticamente en cada fase del servicio.
        </p>

        <Tabs
          value={orchestrationTab}
          onValueChange={(v) => setOrchestrationTab(v as "clients" | "staff")}
        >
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
            <TabIndicator type={orchestrationTab} />
          </div>

          <TabsContent value="clients" className="mt-4">
            <OrchestrationMatrix target="clients" />
          </TabsContent>

          <TabsContent value="staff" className="mt-4">
            <OrchestrationMatrix target="staff" />
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* Templates Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Plantillas de Mensajes
            </h2>
          </div>
          <Button onClick={handleNewTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Plantilla
          </Button>
        </div>

        <Tabs
          value={templatesTab}
          onValueChange={(v) => setTemplatesTab(v as "clients" | "staff")}
        >
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

          <TabsContent value="clients" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Plantillas de mensajes para notificaciones automáticas a clientes.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => handleEditTemplate(template)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="staff" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Plantillas para notificaciones internas al equipo de trabajo.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => handleEditTemplate(template)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Template Editor Dialog */}
      <TemplateEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  )
}

