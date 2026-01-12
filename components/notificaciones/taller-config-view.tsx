"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  Mail,
  MessageCircle,
  FileText,
  Users,
  UserCog,
  Plus,
  Edit,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { OrchestrationMatrix } from "./orchestration-matrix"
import { TemplateEditorDialog } from "./template-editor-dialog"
import { TemplatesPagination } from "./templates-pagination"
import { useNotificationTemplates } from "@/hooks/use-notification-templates"
import { fetchNotificationTemplateById, type NotificationTemplateAPI } from "@/lib/api/notifications"
import { type NotificationTemplate } from "@/lib/fixtures/notification-orchestration"
import { toast } from "sonner"

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

// Template Card Component - Actualizado para API
function TemplateCard({
  template,
  onEdit,
}: {
  template: NotificationTemplateAPI
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
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${channelColors[template.channel]} text-xs`}>
                {channelIcons[template.channel]}
                <span className="ml-1 capitalize">
                  {template.channel === "whatsapp" ? "WhatsApp" : template.channel}
                </span>
              </Badge>
              {template.is_default && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  Default
                </Badge>
              )}
              {!template.is_active && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 opacity-60">
                  Inactivo
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
          {/* Mostrar servicio y fase si están disponibles */}
          {(template.service_type_name || template.phase_name) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {template.service_type_name && (
                <span>{template.service_type_name}</span>
              )}
              {template.service_type_name && template.phase_name && (
                <span>•</span>
              )}
              {template.phase_name && (
                <span>{template.phase_name}</span>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground line-clamp-2">{template.body}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Templates Loading Skeleton
function TemplatesLoadingSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="dark:bg-gray-900">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Empty State Component
function EmptyTemplatesState({ target }: { target: "clients" | "staff" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        No hay plantillas
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {target === "clients"
          ? "No se encontraron plantillas para notificaciones a clientes."
          : "No se encontraron plantillas para el personal interno."}
      </p>
    </motion.div>
  )
}

// Error State Component
function ErrorState({
  error,
  onRetry,
}: {
  error: string
  onRetry: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Error al cargar plantillas
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{error}</p>
      <Button variant="outline" onClick={onRetry} className="mt-4 gap-2">
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </Button>
    </motion.div>
  )
}

// Main Component
export function TallerConfigView() {
  const [orchestrationTab, setOrchestrationTab] = React.useState<"clients" | "staff">("clients")
  const [templatesTab, setTemplatesTab] = React.useState<"clients" | "staff">("clients")
  const [editingTemplate, setEditingTemplate] = React.useState<NotificationTemplate | null>(null)
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)
  const [isLoadingTemplate, setIsLoadingTemplate] = React.useState(false)

  // Hooks para cada tab de plantillas (cache independiente)
  const clientsHook = useNotificationTemplates("clients")
  const staffHook = useNotificationTemplates("staff")

  const handleViewTemplate = async (templateId: string) => {
    setIsLoadingTemplate(true)
    try {
      const apiTemplate = await fetchNotificationTemplateById(templateId)

      // Convertir de formato API a formato del mock para el editor
      const editorTemplate: NotificationTemplate = {
        id: apiTemplate.id,
        name: apiTemplate.name,
        subject: apiTemplate.subject || undefined,
        body: apiTemplate.body,
        channel: apiTemplate.channel,
        target: apiTemplate.target,
        isDefault: apiTemplate.is_default,
        createdAt: apiTemplate.created_at,
        updatedAt: apiTemplate.updated_at,
      }

      setEditingTemplate(editorTemplate)
      setIsEditorOpen(true)
    } catch (error) {
      toast.error("Error al cargar plantilla", {
        description: error instanceof Error ? error.message : "No se pudo cargar la plantilla",
      })
    } finally {
      setIsLoadingTemplate(false)
    }
  }

  const handleSaveTemplate = (template: NotificationTemplate) => {
    // TODO: Implementar guardado via API
    console.log("Save template:", template)
    toast.info("Guardado pendiente", {
      description: "La funcionalidad de guardado se implementará próximamente",
    })
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

            {clientsHook.error ? (
              <ErrorState error={clientsHook.error} onRetry={clientsHook.refresh} />
            ) : clientsHook.isLoading ? (
              <TemplatesLoadingSkeleton />
            ) : clientsHook.templates.length === 0 ? (
              <EmptyTemplatesState target="clients" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {clientsHook.templates.map((template, index) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <TemplateCard
                          template={template}
                          onEdit={() => handleViewTemplate(template.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {clientsHook.totalPages > 1 && (
                  <TemplatesPagination
                    currentPage={clientsHook.currentPage}
                    totalPages={clientsHook.totalPages}
                    onPageChange={clientsHook.setPage}
                    isLoading={clientsHook.isLoading}
                  />
                )}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="staff" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Plantillas para notificaciones internas al equipo de trabajo.
            </p>

            {staffHook.error ? (
              <ErrorState error={staffHook.error} onRetry={staffHook.refresh} />
            ) : staffHook.isLoading ? (
              <TemplatesLoadingSkeleton />
            ) : staffHook.templates.length === 0 ? (
              <EmptyTemplatesState target="staff" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {staffHook.templates.map((template, index) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <TemplateCard
                          template={template}
                          onEdit={() => handleViewTemplate(template.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {staffHook.totalPages > 1 && (
                  <TemplatesPagination
                    currentPage={staffHook.currentPage}
                    totalPages={staffHook.totalPages}
                    onPageChange={staffHook.setPage}
                    isLoading={staffHook.isLoading}
                  />
                )}
              </motion.div>
            )}
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

