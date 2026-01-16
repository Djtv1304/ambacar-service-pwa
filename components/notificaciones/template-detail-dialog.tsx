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
  Sparkles,
  User,
  Car,
  CreditCard,
  Calendar,
  Hash,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

// Variable definitions with icons
const DYNAMIC_VARIABLES = [
  { key: "Nombre", icon: User, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", description: "Nombre del cliente" },
  { key: "Placa", icon: CreditCard, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", description: "Placa del vehículo" },
  { key: "Vehículo", icon: Car, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", description: "Marca y modelo del vehículo" },
  { key: "Fecha", icon: Calendar, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", description: "Fecha del servicio" },
  { key: "Hora", icon: Clock, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400", description: "Hora del servicio" },
  { key: "Taller", icon: Building2, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400", description: "Nombre del taller" },
  { key: "Técnico", icon: Wrench, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", description: "Nombre del técnico" },
  { key: "Orden", icon: Hash, color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400", description: "Número de orden" },
]

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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

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

  // Function to render body text with highlighted variables
  const renderBodyWithHighlightedVariables = (bodyText: string) => {
    // Regex to match {{Variable}} patterns
    const variableRegex = /(\{\{[^}]+\}\})/g
    const parts = bodyText.split(variableRegex)

    return (
      <>
        {parts.map((part, index) => {
          // Check if this part is a variable (matches {{...}})
          if (part.match(/^\{\{[^}]+\}\}$/)) {
            // Extract variable name without braces
            const variableName = part.replace(/^\{\{|\}\}$/g, "")

            // Find matching variable config for color
            const variableConfig = DYNAMIC_VARIABLES.find(v => v.key === variableName)
            const Icon = variableConfig?.icon

            return (
              <span
                key={index}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium mx-0.5",
                  variableConfig?.color || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                )}
              >
                {Icon && <Icon className="h-3 w-3" />}
                {part}
              </span>
            )
          }

          // Regular text
          return <span key={index}>{part}</span>
        })}
      </>
    )
  }

  // Function to insert variable at cursor position
  const insertVariable = (variableKey: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPosition = textarea.selectionStart
    const currentValue = form.getValues("body")
    const variableText = `{{${variableKey}}}`

    // Insert variable at cursor position
    const newValue =
      currentValue.slice(0, cursorPosition) +
      variableText +
      currentValue.slice(cursorPosition)

    form.setValue("body", newValue)

    // Move cursor after inserted variable
    setTimeout(() => {
      textarea.focus()
      const newCursorPosition = cursorPosition + variableText.length
      textarea.setSelectionRange(newCursorPosition, newCursorPosition)
    }, 0)

    toast.success(`Variable insertada: ${variableText}`)
  }

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
                        className="h-10"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSaving || metadataLoading}
                        className="gap-2 h-10"
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
                // EDIT MODE - 2 Column Layout with Preview
                <motion.div
                  key="edit-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]"
                >
                  {/* Left Column - Form (Scrollable) */}
                  <ScrollArea className="max-h-[80vh]">
                    <div className="p-5 sm:p-6 lg:border-r border-gray-200 dark:border-gray-800">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          {/* Template Name */}
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium">Nombre de la Plantilla</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ej: Confirmación de cita - Cliente VIP" {...field} className="h-10" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Separator />

                          {/* Message Content Section - FIRST as requested */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                              Contenido del Mensaje
                            </h3>

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
                                        <FormLabel className="text-xs font-medium">Asunto (Email)</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Ej: Tu cita ha sido confirmada"
                                            {...field}
                                            value={field.value || ""}
                                          />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                          Solo se usa para notificaciones por email
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Dynamic Variables Toolkit - Horizontal Scroll on Mobile */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  Variables Dinámicas
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                Haz clic para insertar en el mensaje
                              </p>
                              {/* Mobile: Horizontal scroll, Desktop: Wrap */}
                              <div className="overflow-x-auto pb-2 -mx-1 px-1">
                                <div className="flex md:flex-wrap gap-2 min-w-max md:min-w-0">
                                  {DYNAMIC_VARIABLES.map((variable) => {
                                    const Icon = variable.icon
                                    return (
                                      <Button
                                        key={variable.key}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => insertVariable(variable.key)}
                                        className={cn(
                                          "gap-1.5 px-3 py-1.5 h-auto text-xs font-medium transition-all hover:scale-105 shrink-0",
                                          variable.color,
                                          "border-0 shadow-sm hover:shadow-md"
                                        )}
                                        title={variable.description}
                                      >
                                        <Icon className="h-3.5 w-3.5" />
                                        {`{{${variable.key}}}`}
                                      </Button>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>

                            <FormField
                              control={form.control}
                              name="body"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium">Cuerpo del Mensaje</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Escribe el contenido del mensaje aquí. Usa las variables de arriba para personalizar..."
                                      className="min-h-[160px] text-sm resize-y"
                                      {...field}
                                      ref={(e) => {
                                        field.ref(e)
                                        textareaRef.current = e
                                      }}
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs">
                                    Formato: {`{{Variable}}`} - Las variables se reemplazarán automáticamente
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Separator />

                          {/* Configuration Section with Vertical Division */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                              Configuración de la Plantilla
                            </h3>

                            {/* Two Column Layout with Vertical Divider */}
                            <div className="flex gap-6">
                              {/* Left Column */}
                              <div className="flex-1 space-y-4">
                                {/* Channel */}
                                <FormField
                                  control={form.control}
                                  name="channel"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs font-medium">Canal</FormLabel>
                                      <Select onValueChange={(value) => {
                                        field.onChange(value)
                                        setPreviewTab(value as typeof previewTab)
                                      }} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="h-10">
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

                                {/* Service Type */}
                                <FormField
                                  control={form.control}
                                  name="service_type"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                      <FormLabel className="text-xs font-medium">Tipo de Servicio</FormLabel>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <FormControl>
                                            <Button
                                              variant="outline"
                                              role="combobox"
                                              className={cn(
                                                "w-full justify-between h-10 font-normal",
                                                !field.value && "text-muted-foreground"
                                              )}
                                            >
                                              {field.value
                                                ? serviceTypes.find((st) => st.id === field.value)?.name
                                                : "Seleccionar..."}
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

                                {/* Taller */}
                                <FormField
                                  control={form.control}
                                  name="taller_id"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                      <FormLabel className="text-xs font-medium">Taller</FormLabel>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <FormControl>
                                            <Button
                                              variant="outline"
                                              role="combobox"
                                              className={cn("w-full justify-between h-10 font-normal")}
                                            >
                                              {field.value
                                                ? talleres.find((t) => t.id.toString() === field.value)?.nombre
                                                : "Global (Todos)"}
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
                                                  Global (Todos los talleres)
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
                                      <FormDescription className="text-xs">
                                        Selecciona "Global" para aplicar a todos los talleres
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Vertical Divider */}
                              <div className="w-px bg-gray-200 dark:bg-gray-700" />

                              {/* Right Column */}
                              <div className="flex-1 space-y-4">
                                {/* Audience */}
                                <FormField
                                  control={form.control}
                                  name="target"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs font-medium">Audiencia</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="h-10">
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

                                {/* Phase */}
                                <FormField
                                  control={form.control}
                                  name="phase"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                      <FormLabel className="text-xs font-medium">Fase</FormLabel>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <FormControl>
                                            <Button
                                              variant="outline"
                                              role="combobox"
                                              className={cn(
                                                "w-full justify-between h-10 font-normal",
                                                !field.value && "text-muted-foreground"
                                              )}
                                            >
                                              {field.value
                                                ? phases.find((p) => p.id === field.value)?.name
                                                : "Seleccionar..."}
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

                                {/* Status Toggles - Horizontal Layout */}
                                <div className="space-y-3 pt-2">
                                  <Label className="text-xs font-medium">Estado de la Plantilla</Label>
                                  <div className="flex items-center gap-4 p-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/30">
                                    <FormField
                                      control={form.control}
                                      name="is_active"
                                      render={({ field }) => (
                                        <FormItem className="flex items-center gap-2 space-y-0 flex-1">
                                          <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                          </FormControl>
                                          <FormLabel className="text-sm font-medium cursor-pointer">
                                            {field.value ? "Activo" : "Inactivo"}
                                          </FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                                    <FormField
                                      control={form.control}
                                      name="is_default"
                                      render={({ field }) => (
                                        <FormItem className="flex items-center gap-2 space-y-0 flex-1">
                                          <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                          </FormControl>
                                          <FormLabel className="text-sm font-medium cursor-pointer">
                                            Por Defecto
                                          </FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Las plantillas inactivas no se enviarán automáticamente
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </ScrollArea>

                  {/* Right Column - Live Preview */}
                  <div className="p-4 sm:p-6 bg-gray-100 dark:bg-gray-950 hidden lg:block">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="space-y-6 sticky top-0"
                    >
                      {/* Preview Header with Statistics */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Eye className="h-5 w-5 text-muted-foreground" />
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Vista Previa en Vivo
                          </h3>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{form.watch("body")?.length || 0}</span>
                            <span className="text-muted-foreground">caracteres</span>
                          </div>
                          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                          <div className="flex items-center gap-2 text-xs">
                            <Hash className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="font-semibold text-green-600 dark:text-green-400">{form.watch("body")?.trim().split(/\s+/).filter(w => w.length > 0).length || 0}</span>
                            <span className="text-muted-foreground">palabras</span>
                          </div>
                          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                          <div className="flex items-center gap-2 text-xs">
                            <Variable className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="font-semibold text-purple-600 dark:text-purple-400">{(form.watch("body")?.match(/\{\{[^}]+\}\}/g) || []).length}</span>
                            <span className="text-muted-foreground">variables</span>
                          </div>
                        </div>
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
                          <AnimatePresence mode="wait">
                            {previewTab === "whatsapp" && (
                              <TabsContent value="whatsapp" className="mt-0" asChild>
                                <motion.div
                                  key="whatsapp-edit-preview"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <WhatsAppPreview content={form.watch("body") || "Escribe algo para ver la vista previa..."} />
                                </motion.div>
                              </TabsContent>
                            )}
                            {previewTab === "push" && (
                              <TabsContent value="push" className="mt-0" asChild>
                                <motion.div
                                  key="push-edit-preview"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <PushPreview content={form.watch("body") || "Escribe algo para ver la vista previa..."} title={form.watch("subject") || undefined} />
                                </motion.div>
                              </TabsContent>
                            )}
                            {previewTab === "email" && (
                              <TabsContent value="email" className="mt-0" asChild>
                                <motion.div
                                  key="email-edit-preview"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <EmailPreview content={form.watch("body") || "Escribe algo para ver la vista previa..."} subject={form.watch("subject") || undefined} />
                                </motion.div>
                              </TabsContent>
                            )}
                          </AnimatePresence>
                        </div>
                      </Tabs>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                // VIEW MODE - High-Density Property Grid
                <motion.div
                  key="view-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]"
                >
                  {/* Left Column - Dense Metadata */}
                  <div className="p-5 sm:p-6 lg:border-r border-gray-200 dark:border-gray-800">
                    <div className="space-y-5">
                      {/* Template Name */}
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                          {template.name}
                        </h2>
                      </div>

                      {/* Properties - Vertical Layout with Separators */}
                      <TooltipProvider>
                        <div className="flex flex-wrap items-stretch gap-4 py-4 border-y border-gray-200 dark:border-gray-800">
                          {/* Channel */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col gap-2 flex-1 min-w-[120px]">
                                <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
                                  Canal
                                </span>
                                <Badge className={cn(channelColors[template.channel], "w-fit text-sm font-medium")}>
                                  {channelIcons[template.channel]}
                                  <span className="ml-1.5 capitalize">
                                    {template.channel === "whatsapp" ? "WhatsApp" : template.channel}
                                  </span>
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Canal de comunicación utilizado para enviar esta notificación</p>
                            </TooltipContent>
                          </Tooltip>

                          <div className="w-px bg-gray-200 dark:bg-gray-700" />

                          {/* Audience */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col gap-2 flex-1 min-w-[120px]">
                                <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
                                  Audiencia
                                </span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "w-fit text-sm font-medium",
                                    template.target === "clients"
                                      ? "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400"
                                      : "border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400"
                                  )}
                                >
                                  {template.target === "clients" ? (
                                    <>
                                      <Users className="h-3.5 w-3.5 mr-1" />
                                      Clientes
                                    </>
                                  ) : (
                                    <>
                                      <UserCog className="h-3.5 w-3.5 mr-1" />
                                      Personal
                                    </>
                                  )}
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Tipo de destinatario objetivo de esta plantilla</p>
                            </TooltipContent>
                          </Tooltip>

                          <div className="w-px bg-gray-200 dark:bg-gray-700" />

                          {/* Status */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col gap-2 flex-1 min-w-[120px]">
                                <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
                                  Estado
                                </span>
                                <Badge
                                  variant={template.is_active ? "default" : "secondary"}
                                  className={cn(
                                    "w-fit text-sm font-medium",
                                    template.is_active
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                                  )}
                                >
                                  {template.is_active ? (
                                    <>
                                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                      Activo
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-3.5 w-3.5 mr-1" />
                                      Inactivo
                                    </>
                                  )}
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>{template.is_active ? "Esta plantilla está activa y será enviada automáticamente" : "Esta plantilla está inactiva y no se enviará"}</p>
                            </TooltipContent>
                          </Tooltip>

                          {/* Default Badge */}
                          {template.is_default && (
                            <>
                              <div className="w-px bg-gray-200 dark:bg-gray-700" />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex flex-col gap-2 flex-1 min-w-[120px]">
                                    <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
                                      Predeterminado
                                    </span>
                                    <Badge variant="secondary" className="w-fit text-sm border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                                      <Tag className="h-3 w-3 mr-1" />
                                      Por defecto
                                    </Badge>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>Esta es la plantilla predeterminada para este contexto</p>
                                </TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </TooltipProvider>

                      {/* Context Section - Flex Wrap with Better Distribution */}
                      {(template.service_type_name || template.phase_name || template.taller_id || template.subtype_name) && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Contexto de Aplicación
                          </h3>
                          <div className="flex flex-wrap justify-between gap-4 w-full">
                            {/* Service Type */}
                            {template.service_type_name && (
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 p-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                                  <Wrench className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                                    Servicio
                                  </p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {template.service_type_name}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Phase */}
                            {template.phase_name && (
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 p-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                                  <Layers className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                                    Fase
                                  </p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {template.phase_name}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Workshop */}
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5 p-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                                <Building2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                                  Taller
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {template.taller_id ? (
                                    talleres.find(t => t.id.toString() === template.taller_id)?.nombre || template.taller_id
                                  ) : (
                                    "Global (Todos)"
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Subtype */}
                            {template.subtype_name && (
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 p-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                                  <ListTree className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                                    Subtipo
                                  </p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {template.subtype_name}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Subject (Email Only) */}
                      {template.subject && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Asunto (Email)
                          </label>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {template.subject}
                          </p>
                        </div>
                      )}

                      {/* Message Content with Highlighted Variables */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Contenido del Mensaje
                        </label>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4">
                          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {renderBodyWithHighlightedVariables(template.body)}
                          </div>
                        </div>
                      </div>

                      {/* Variables Legend - Color-Coded */}
                      {template.variables.length > 0 && (
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Variables Utilizadas
                            </label>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {template.variables.map((variableName) => {
                              const variableConfig = DYNAMIC_VARIABLES.find(v => v.key === variableName)
                              const Icon = variableConfig?.icon

                              return (
                                <div
                                  key={variableName}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
                                    variableConfig?.color || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                  )}
                                  title={variableConfig?.description || variableName}
                                >
                                  {Icon && <Icon className="h-3.5 w-3.5" />}
                                  <span>{`{{${variableName}}}`}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
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
                  {/* Preview Header with Statistics */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Vista Previa
                      </h3>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{template.body.length}</span>
                        <span className="text-muted-foreground">caracteres</span>
                      </div>
                      <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                      <div className="flex items-center gap-2 text-xs">
                        <Hash className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-600 dark:text-green-400">{template.body.trim().split(/\s+/).filter(w => w.length > 0).length}</span>
                        <span className="text-muted-foreground">palabras</span>
                      </div>
                      <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                      <div className="flex items-center gap-2 text-xs">
                        <Variable className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{template.variables.length}</span>
                        <span className="text-muted-foreground">variables</span>
                      </div>
                    </div>
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
                      <AnimatePresence mode="wait">
                        {previewTab === "whatsapp" && (
                          <TabsContent value="whatsapp" className="mt-0" asChild>
                            <motion.div
                              key="whatsapp-preview"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2 }}
                            >
                              <WhatsAppPreview content={template.preview} />
                            </motion.div>
                          </TabsContent>
                        )}
                        {previewTab === "push" && (
                          <TabsContent value="push" className="mt-0" asChild>
                            <motion.div
                              key="push-preview"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2 }}
                            >
                              <PushPreview content={template.preview} title={template.subject || undefined} />
                            </motion.div>
                          </TabsContent>
                        )}
                        {previewTab === "email" && (
                          <TabsContent value="email" className="mt-0" asChild>
                            <motion.div
                              key="email-preview"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2 }}
                            >
                              <EmailPreview content={template.preview} subject={template.subject || undefined} />
                            </motion.div>
                          </TabsContent>
                        )}
                      </AnimatePresence>
                    </div>
                  </Tabs>

                  {/* Timestamps */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                  </div>
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
