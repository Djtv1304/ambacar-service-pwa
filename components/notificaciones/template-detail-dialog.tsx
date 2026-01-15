"use client"

import * as React from "react"
import {
  Mail,
  Bell,
  MessageCircle,
  X,
  Tag,
  Users,
  UserCog,
  Clock,
  CheckCircle2,
  XCircle,
  Variable,
  Eye,
  FileText,
  Loader2,
  AlertCircle,
  Edit,
  Save,
  ChevronsUpDown,
  Check,
  Building2,
  Wrench,
  Layers,
  ListTree,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { fetchNotificationTemplateById, updateNotificationTemplate } from "@/lib/api/notifications"
import type { NotificationTemplateAPI } from "@/lib/api/notifications"
import { notificationTemplateSchema, type NotificationTemplateFormData } from "@/lib/validations/notification-template"
import { useNotificationMetadata } from "@/hooks/use-notification-metadata"
import { useAuthToken } from "@/hooks/use-auth-token"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TemplateDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string | null
  onSave?: (updatedTemplate: NotificationTemplateAPI) => void
}

// Channel Icons
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

// WhatsApp Preview Component
function WhatsAppPreview({ content }: { content: string }) {
  return (
    <div className="mx-auto max-w-[280px]">
      <div className="bg-gray-900 rounded-[2rem] p-2 shadow-xl">
        <div className="bg-[#0b141a] rounded-[1.5rem] overflow-hidden">
          {/* Status Bar */}
          <div className="bg-[#1f2c34] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <div className="w-2 h-2 rounded-full bg-gray-500" />
            </div>
            <p className="text-[10px] text-gray-400">12:30</p>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded-sm bg-gray-500" />
            </div>
          </div>

          {/* Chat Header */}
          <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-3 border-b border-gray-800">
            <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Ambacar Service</p>
              <p className="text-gray-400 text-[10px]">En línea</p>
            </div>
          </div>

          {/* Chat Area */}
          <div className="min-h-[200px] p-3 bg-[#0b141a] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiMxYTI1MmYiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')]">
            <div className="flex justify-end">
              <div className="bg-[#005c4b] text-white rounded-lg rounded-tr-none p-3 max-w-[90%] shadow-md">
                <p className="text-[13px] whitespace-pre-wrap leading-relaxed">
                  {content || "Vista previa..."}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <p className="text-[10px] text-gray-300">12:30</p>
                  <span className="text-[10px] text-blue-300">✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Push Notification Preview
function PushPreview({ content, title }: { content: string; title?: string }) {
  return (
    <div className="mx-auto max-w-[320px]">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                Ambacar Service
              </p>
              <p className="text-[10px] text-muted-foreground">ahora</p>
            </div>
            {title && (
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {title}
              </p>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-3 leading-relaxed">
              {content || "Vista previa..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Email Preview Component
function EmailPreview({ content, subject }: { content: string; subject?: string }) {
  return (
    <div className="mx-auto max-w-[360px]">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
        {/* Email Header */}
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Ambacar Service
              </p>
              <p className="text-xs text-muted-foreground truncate">
                noreply@ambacar.com
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {subject || "Sin asunto"}
          </p>
        </div>

        {/* Email Body */}
        <div className="p-5 min-h-[150px]">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {content || "Vista previa..."}
          </p>
        </div>

        {/* Email Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[10px] text-center text-muted-foreground">
            © 2025 Ambacar Service. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}

// Loading State
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground">Cargando detalles...</p>
    </div>
  )
}

// Error State
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        Error al cargar
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <Button variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}

// Main Component
export function TemplateDetailDialog({
  open,
  onOpenChange,
  templateId,
  onSave,
}: TemplateDetailDialogProps) {
  const [template, setTemplate] = React.useState<NotificationTemplateAPI | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [previewTab, setPreviewTab] = React.useState<"email" | "push" | "whatsapp">("email")
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  const { getToken } = useAuthToken()
  const { serviceTypes, phases, talleres, isLoading: metadataLoading } = useNotificationMetadata()

  // React Hook Form
  const form = useForm<NotificationTemplateFormData>({
    resolver: zodResolver(notificationTemplateSchema),
    defaultValues: {
      name: "",
      subject: null,
      body: "",
      channel: "email",
      target: "clients",
      is_default: false,
      is_active: true,
      taller_id: null,
      service_type: "",
      phase: "",
      subtype: null,
    },
  })

  const fetchTemplate = React.useCallback(async () => {
    if (!templateId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchNotificationTemplateById(templateId)
      setTemplate(data)
      setPreviewTab(data.channel)

      // Inicializar formulario con datos del template
      form.reset({
        name: data.name,
        subject: data.subject,
        body: data.body,
        channel: data.channel,
        target: data.target,
        is_default: data.is_default,
        is_active: data.is_active,
        taller_id: data.taller_id,
        service_type: data.service_type_id || "",
        phase: data.phase_id || "",
        subtype: data.subtype_id,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar la plantilla"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [templateId, form])

  React.useEffect(() => {
    if (open && templateId) {
      fetchTemplate()
    }
  }, [open, templateId, fetchTemplate])

  // Watch service_type for subtype cascade logic
  const serviceTypeValue = form.watch("service_type")
  const channelValue = form.watch("channel")
  const [selectedServiceType, setSelectedServiceType] = React.useState<
    (typeof serviceTypes)[number] | null
  >(null)

  React.useEffect(() => {
    if (serviceTypeValue) {
      const st = serviceTypes.find((st) => st.id === serviceTypeValue)
      setSelectedServiceType(st || null)

      // Reset subtype if new service_type doesn't have subtypes
      if (!st || st.subtypes.length === 0) {
        form.setValue("subtype", null)
      }
    } else {
      setSelectedServiceType(null)
    }
  }, [serviceTypeValue, serviceTypes, form])

  const availableSubtypes = selectedServiceType?.subtypes || []

  // Submit handler
  const onSubmit = async (data: NotificationTemplateFormData) => {
    if (!template || !templateId) return

    setIsSaving(true)

    try {
      const token = await getToken()
      if (!token) {
        throw new Error("No se encontró token de autenticación")
      }

      // Llamada PUT real al microservicio
      const result = await updateNotificationTemplate(templateId, data, token)

      // Actualizar el template local con la respuesta del servidor
      setTemplate(result)

      // Actualizar el preview tab si el canal cambió
      setPreviewTab(result.channel)

      // Reiniciar el formulario con los datos del servidor
      form.reset({
        name: result.name,
        subject: result.subject,
        body: result.body,
        channel: result.channel,
        target: result.target,
        is_default: result.is_default,
        is_active: result.is_active,
        taller_id: result.taller_id,
        service_type: result.service_type_id || "",
        phase: result.phase_id || "",
        subtype: result.subtype_id,
      })

      toast.success("Plantilla actualizada", {
        description: `${result.name} guardada correctamente`,
      })

      // Volver a modo lectura
      setIsEditMode(false)

      // Notificar al componente padre para refrescar la lista
      onSave?.(result)
    } catch (error) {
      console.error("Error saving template:", error)

      // Extraer mensaje de error más específico
      let errorMessage = "Error desconocido"

      if (error instanceof Error) {
        errorMessage = error.message

        // Si es un ApiError con datos adicionales, intentar extraer más detalles
        if ('data' in error && typeof error.data === 'object' && error.data !== null) {
          const errorData = error.data as Record<string, any>

          // Django REST Framework retorna errores de validación como objeto
          // Ejemplo: { "name": ["Este campo es requerido"], "service_type": ["UUID inválido"] }
          if (Object.keys(errorData).length > 0) {
            const firstError = Object.values(errorData)[0]
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = firstError[0]
            } else if (typeof firstError === 'string') {
              errorMessage = firstError
            }
          }
        }
      }

      toast.error("Error al guardar plantilla", {
        description: errorMessage,
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setTemplate(null)
      setError(null)
      setIsEditMode(false)
      form.reset()
    }
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-6xl xl:max-w-7xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              {isEditMode ? "Editar Plantilla" : "Detalles de la Plantilla"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {template && !isLoading && !error && (
                <>
                  {isEditMode ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditMode(false)
                          // Revertir a los valores originales del template
                          if (template) {
                            form.reset({
                              name: template.name,
                              subject: template.subject,
                              body: template.body,
                              channel: template.channel,
                              target: template.target,
                              is_default: template.is_default,
                              is_active: template.is_active,
                              taller_id: template.taller_id,
                              service_type: template.service_type_id || "",
                              phase: template.phase_id || "",
                              subtype: template.subtype_id,
                            })
                          }
                        }}
                        disabled={isSaving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSaving || metadataLoading}
                        className="gap-2"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Guardar
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setIsEditMode(true)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="max-h-[85vh] md:max-h-[80vh]">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={fetchTemplate} />
          ) : !template ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos para mostrar</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {isEditMode ? (
                // EDIT MODE
                <motion.div
                  key="edit-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 sm:p-6"
                >
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      {/* Información Básica */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Información Básica
                        </h3>
                        <Separator />

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de la Plantilla</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Confirmación de cita" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="channel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Canal</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar canal" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="email">
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <span>Email</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="whatsapp">
                                      <div className="flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        <span>WhatsApp</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="push">
                                      <div className="flex items-center gap-2">
                                        <Bell className="h-4 w-4" />
                                        <span>Push</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="target"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Audiencia</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar audiencia" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="clients">
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>Clientes</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="staff">
                                      <div className="flex items-center gap-2">
                                        <UserCog className="h-4 w-4" />
                                        <span>Personal</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Subject - Solo para email */}
                        <AnimatePresence mode="wait">
                          {channelValue === "email" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Asunto (Email)</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Ej: Tu cita ha sido confirmada"
                                        {...field}
                                        value={field.value || ""}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Solo se usa para notificaciones por email
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Contexto de Aplicación */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Contexto de Aplicación
                        </h3>
                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Service Type Dropdown */}
                          <FormField
                            control={form.control}
                            name="service_type"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Tipo de Servicio</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                          "w-full justify-between",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value
                                          ? serviceTypes.find((st) => st.id === field.value)?.name
                                          : "Seleccionar tipo de servicio"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                      <CommandInput placeholder="Buscar tipo de servicio..." />
                                      <CommandList>
                                        <CommandEmpty>No se encontraron resultados</CommandEmpty>
                                        <CommandGroup>
                                          {serviceTypes.map((st) => (
                                            <CommandItem
                                              key={st.id}
                                              value={st.name}
                                              onSelect={() => {
                                                field.onChange(st.id)
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  st.id === field.value ? "opacity-100" : "opacity-0"
                                                )}
                                              />
                                              {st.name}
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

                          {/* Phase Dropdown */}
                          <FormField
                            control={form.control}
                            name="phase"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Fase</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                          "w-full justify-between",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value
                                          ? phases.find((p) => p.id === field.value)?.name
                                          : "Seleccionar fase"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                      <CommandInput placeholder="Buscar fase..." />
                                      <CommandList>
                                        <CommandEmpty>No se encontraron resultados</CommandEmpty>
                                        <CommandGroup>
                                          {phases.map((phase) => (
                                            <CommandItem
                                              key={phase.id}
                                              value={phase.name}
                                              onSelect={() => {
                                                field.onChange(phase.id)
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  phase.id === field.value ? "opacity-100" : "opacity-0"
                                                )}
                                              />
                                              {phase.name}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Taller Dropdown */}
                          <FormField
                            control={form.control}
                            name="taller_id"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Taller</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn("w-full justify-between")}
                                      >
                                        {field.value
                                          ? talleres.find((t) => t.id.toString() === field.value)?.nombre
                                          : "🌐 Global (Todos los talleres)"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                      <CommandInput placeholder="Buscar taller..." />
                                      <CommandList>
                                        <CommandEmpty>No se encontraron resultados</CommandEmpty>
                                        <CommandGroup>
                                          <CommandItem
                                            value="global"
                                            onSelect={() => {
                                              field.onChange(null)
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                !field.value ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            🌐 Global (Todos los talleres)
                                          </CommandItem>
                                          {talleres.map((taller) => (
                                            <CommandItem
                                              key={taller.id}
                                              value={taller.nombre}
                                              onSelect={() => {
                                                field.onChange(taller.id.toString())
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  taller.id.toString() === field.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              {taller.nombre}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormDescription>
                                  Selecciona "Global" para aplicar a todos los talleres
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Subtype Dropdown - Cascading */}
                          <AnimatePresence mode="wait">
                            {availableSubtypes.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <FormField
                                  control={form.control}
                                  name="subtype"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                      <FormLabel>Subtipo (opcional)</FormLabel>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <FormControl>
                                            <Button
                                              variant="outline"
                                              role="combobox"
                                              className={cn("w-full justify-between")}
                                            >
                                              {field.value
                                                ? availableSubtypes.find((st) => st.id === field.value)?.name
                                                : "Ninguno"}
                                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                          </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                          <Command>
                                            <CommandInput placeholder="Buscar subtipo..." />
                                            <CommandList>
                                              <CommandEmpty>No se encontraron resultados</CommandEmpty>
                                              <CommandGroup>
                                                <CommandItem
                                                  value="ninguno"
                                                  onSelect={() => {
                                                    field.onChange(null)
                                                  }}
                                                >
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-4 w-4",
                                                      !field.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                  />
                                                  Ninguno
                                                </CommandItem>
                                                {availableSubtypes.map((subtype) => (
                                                  <CommandItem
                                                    key={subtype.id}
                                                    value={subtype.name}
                                                    onSelect={() => {
                                                      field.onChange(subtype.id)
                                                    }}
                                                  >
                                                    <Check
                                                      className={cn(
                                                        "mr-2 h-4 w-4",
                                                        subtype.id === field.value ? "opacity-100" : "opacity-0"
                                                      )}
                                                    />
                                                    {subtype.name}
                                                  </CommandItem>
                                                ))}
                                              </CommandGroup>
                                            </CommandList>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                      <FormDescription>
                                        Solo si el tipo de servicio tiene subtypes disponibles
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Contenido del Mensaje */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Contenido del Mensaje
                        </h3>
                        <Separator />

                        <FormField
                          control={form.control}
                          name="body"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cuerpo del Mensaje</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Escribe el contenido del mensaje aquí..."
                                  className="min-h-[200px] font-mono text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Usa variables con doble llave: {`{{Nombre}}`}, {`{{Placa}}`}, etc.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Configuración */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Configuración
                        </h3>
                        <Separator />

                        <FormField
                          control={form.control}
                          name="is_default"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Template por defecto</FormLabel>
                                <FormDescription>
                                  Se usará esta plantilla si no hay otra más específica
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="is_active"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Activo</FormLabel>
                                <FormDescription>
                                  Las plantillas inactivas no se enviarán
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                </motion.div>
              ) : (
                // VIEW MODE (existente)
                <motion.div
                  key="view-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_500px]"
                >
                  {/* Left Column - Details */}
                  <div className="p-4 sm:p-6 md:border-r border-gray-200 dark:border-gray-800">
                    <div className="space-y-6">
                  {/* Header Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${channelColors[template.channel]} text-sm`}>
                      {channelIcons[template.channel]}
                      <span className="ml-1.5 capitalize">
                        {template.channel === "whatsapp" ? "WhatsApp" : template.channel}
                      </span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        template.target === "clients"
                          ? "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400"
                          : "border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400"
                      }
                    >
                      {template.target === "clients" ? (
                        <>
                          <Users className="h-3 w-3 mr-1" />
                          Clientes
                        </>
                      ) : (
                        <>
                          <UserCog className="h-3 w-3 mr-1" />
                          Personal
                        </>
                      )}
                    </Badge>
                    {template.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        Por defecto
                      </Badge>
                    )}
                    <Badge
                      variant={template.is_active ? "default" : "secondary"}
                      className={
                        template.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }
                    >
                      {template.is_active ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactivo
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Name */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {template.name}
                    </h3>
                  </div>

                  {/* Context Info */}
                  {(template.service_type_name || template.phase_name || template.taller_id || template.subtype_name) && (
                    <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
                      <CardContent className="p-4">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
                          Contexto de Uso
                        </p>
                        <div className="space-y-1.5">
                          {template.service_type_name && (
                            <div className="flex items-center gap-2">
                              <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Servicio:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {template.service_type_name}
                              </span>
                            </div>
                          )}
                          {template.subtype_name && (
                            <div className="flex items-center gap-2">
                              <ListTree className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Subtipo:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {template.subtype_name}
                              </span>
                            </div>
                          )}
                          {template.phase_name && (
                            <div className="flex items-center gap-2">
                              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Fase:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {template.phase_name}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Taller:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {template.taller_id ? (
                                talleres.find(t => t.id.toString() === template.taller_id)?.nombre || template.taller_id
                              ) : (
                                "🌐 Global (Todos los talleres)"
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Separator />

                  {/* Subject (for email) */}
                  {template.subject && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Asunto (Email)
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {template.subject}
                      </p>
                    </div>
                  )}

                  {/* Body */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Contenido del Mensaje
                    </label>
                    <Card className="mt-2 bg-white dark:bg-gray-900">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-mono">
                          {template.body}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Variables */}
                  {template.variables.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-3">
                        <Variable className="h-4 w-4" />
                        Variables Disponibles
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {template.variables.map((variable) => (
                          <Badge
                            key={variable}
                            variant="outline"
                            className="text-xs bg-white dark:bg-gray-900"
                          >
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <Card className="bg-gray-50 dark:bg-gray-900/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            Creado:{" "}
                            {new Date(template.created_at).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            Actualizado:{" "}
                            {new Date(template.updated_at).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="p-4 sm:p-6 bg-gray-100 dark:bg-gray-950">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-6"
                >
                  {/* Preview Header */}
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Vista Previa
                    </h3>
                  </div>

                  {/* Preview Tabs */}
                  <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as typeof previewTab)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="whatsapp" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </TabsTrigger>
                      <TabsTrigger value="push" className="gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Push</span>
                      </TabsTrigger>
                      <TabsTrigger value="email" className="gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="hidden sm:inline">Email</span>
                      </TabsTrigger>
                    </TabsList>

                    <div className="py-4">
                      <TabsContent value="whatsapp" className="mt-0">
                        <WhatsAppPreview content={template.preview} />
                      </TabsContent>
                      <TabsContent value="push" className="mt-0">
                        <PushPreview content={template.preview} title={template.subject || undefined} />
                      </TabsContent>
                      <TabsContent value="email" className="mt-0">
                        <EmailPreview content={template.preview} subject={template.subject || undefined} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </motion.div>
              </div>
            </motion.div>
            )}
          </AnimatePresence>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
