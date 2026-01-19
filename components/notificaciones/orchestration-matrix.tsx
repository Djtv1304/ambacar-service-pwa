"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ChevronDown,
  Mail,
  Bell,
  MessageCircle,
  Calendar,
  ClipboardCheck,
  Wrench,
  ShieldCheck,
  CarFront,
  FileSearch,
  AlertTriangle,
  Paintbrush,
  Settings,
  FileCheck,
  Info,
  RefreshCw,
  AlertCircle,
  Inbox,
  Loader2,
  Save,
  X,
  CheckCircle2,
  Eye,
} from "lucide-react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { useOrchestrationMatrix } from "@/hooks/use-orchestration-matrix"
import {
  updateOrchestrationMatrix,
  transformOrchestrationData,
  fetchTemplatesForContext,
  fetchNotificationTemplateById,
  type OrchestrationServiceType,
  type OrchestrationPhaseConfig,
  type OrchestrationUpdateConfig,
  type NotificationChannel,
  type NotificationTemplateAPI,
} from "@/lib/api/notifications"
import { getClientAccessToken } from "@/lib/auth/actions"
import { TemplatePreviewDialog } from "@/components/notificaciones/template-preview-dialog"

interface OrchestrationMatrixProps {
  target: "clients" | "staff"
}

// Channel icons
const channelIcons: Record<NotificationChannel, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  push: <Bell className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
}

// Channel colors
const channelColors: Record<NotificationChannel, string> = {
  email: "text-purple-600 dark:text-purple-400",
  push: "text-blue-600 dark:text-blue-400",
  whatsapp: "text-green-600 dark:text-green-400",
}

// Phase icon mapping by phase name
const getPhaseIcon = (phaseName: string): React.ReactNode => {
  const nameLower = phaseName.toLowerCase()
  if (nameLower.includes("agend") || nameLower.includes("cita")) {
    return <Calendar className="h-4 w-4" />
  }
  if (nameLower.includes("recep")) {
    return <ClipboardCheck className="h-4 w-4" />
  }
  if (nameLower.includes("repar") || nameLower.includes("ejecuc")) {
    return <Wrench className="h-4 w-4" />
  }
  if (nameLower.includes("calidad") || nameLower.includes("control")) {
    return <ShieldCheck className="h-4 w-4" />
  }
  if (nameLower.includes("entreg")) {
    return <CarFront className="h-4 w-4" />
  }
  return <Settings className="h-4 w-4" />
}

// Phase Row Component
function PhaseConfigRow({
  phaseConfig,
  phaseIndex,
  onToggleChannel,
  onSelectTemplate,
  onLoadTemplates,
  onPreviewTemplate,
  availableTemplates,
  isLoadingTemplates,
  disabled,
}: {
  phaseConfig: OrchestrationPhaseConfig
  phaseIndex: number
  onToggleChannel: (phaseId: string, channel: NotificationChannel, enabled: boolean) => void
  onSelectTemplate: (phaseId: string, channel: NotificationChannel, templateId: string | null) => void
  onLoadTemplates?: (phaseId: string, channel: NotificationChannel) => void
  onPreviewTemplate?: (templateId: string) => void
  availableTemplates: Record<NotificationChannel, NotificationTemplateAPI[]>
  isLoadingTemplates: Record<NotificationChannel, boolean>
  disabled?: boolean
}) {
  const channels: NotificationChannel[] = ["email", "push", "whatsapp"]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Phase Info */}
      <div className="flex items-center gap-3 lg:col-span-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {getPhaseIcon(phaseConfig.phase_name)}
        </div>
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{phaseConfig.phase_name}</p>
          <p className="text-xs text-muted-foreground">Fase {phaseIndex + 1}</p>
        </div>
      </div>

      {/* Channel Configurations */}
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {channels.map((channel) => {
          const channelConfig = phaseConfig.channels[channel]

          return (
            <div
              key={channel}
              className={`flex flex-col gap-2 p-3 rounded-lg border transition-all ${
                channelConfig.enabled
                  ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  : "bg-gray-100 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800"
              }`}
            >
              {/* Channel Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={channelColors[channel]}>{channelIcons[channel]}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {channel === "whatsapp" ? "WhatsApp" : channel === "push" ? "Push" : "Email"}
                  </span>
                </div>
                <Switch
                  checked={channelConfig.enabled}
                  onCheckedChange={(enabled) => onToggleChannel(phaseConfig.phase_id, channel, enabled)}
                  className="scale-90"
                  disabled={disabled}
                />
              </div>

              {/* Template Selection + Preview */}
              <div className="flex gap-2 items-center">
                <Select
                  value={channelConfig.template_id || "__none__"}
                  onValueChange={(value) => {
                    // Si el valor es "__none__", pasar null para limpiar la selección
                    const templateId = value === "__none__" ? null : value
                    onSelectTemplate(phaseConfig.phase_id, channel, templateId)
                  }}
                  disabled={disabled || !channelConfig.enabled}
                  onOpenChange={(open) => {
                    if (open && onLoadTemplates) {
                      onLoadTemplates(phaseConfig.phase_id, channel)
                    }
                  }}
                >
                  <SelectTrigger
                    className={`flex-1 h-8 text-xs ${!channelConfig.enabled ? "opacity-50" : ""}`}
                  >
                    <SelectValue>
                      {channelConfig.template_name || "Sin plantilla"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-w-[280px] sm:max-w-sm">
                    {isLoadingTemplates[channel] ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : availableTemplates[channel].length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        No hay plantillas disponibles
                      </div>
                    ) : (
                      <>
                        <SelectItem value="__none__">Sin plantilla</SelectItem>
                        {availableTemplates[channel].map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2 max-w-full">
                              <span className="truncate">{template.name}</span>
                              {template.is_default && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  Default
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>

                {/* Preview Button */}
                {channelConfig.template_id && onPreviewTemplate && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 shrink-0"
                          onClick={() => onPreviewTemplate(channelConfig.template_id!)}
                          disabled={disabled}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Vista previa</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Service icon mapping by service name
const getServiceIcon = (serviceName: string): React.ReactNode => {
  const nameLower = serviceName.toLowerCase()
  if (nameLower.includes("mantenimiento") && nameLower.includes("preventivo")) {
    return <Settings className="h-5 w-5" />
  }
  if (nameLower.includes("avería") || nameLower.includes("revisión") || nameLower.includes("averia") || nameLower.includes("revision")) {
    return <AlertTriangle className="h-5 w-5" />
  }
  if (nameLower.includes("colisión") || nameLower.includes("pintura") || nameLower.includes("colision")) {
    return <Paintbrush className="h-5 w-5" />
  }
  if (nameLower.includes("avalúo") || nameLower.includes("avaluo")) {
    return <FileSearch className="h-5 w-5" />
  }
  if (nameLower.includes("inspección") || nameLower.includes("inspeccion")) {
    return <FileCheck className="h-5 w-5" />
  }
  return <Settings className="h-5 w-5" />
}

// Service Accordion Item
function ServiceAccordionItem({
  service,
  isOpen,
  onToggle,
  onToggleChannel,
  onSelectTemplate,
  onLoadTemplates,
  onPreviewTemplate,
  getTemplatesForContext,
  isLoadingTemplatesForContext,
  hasChanges,
  isSaving,
  onSave,
  onCancel,
  showSuccess,
}: {
  service: OrchestrationServiceType
  isOpen: boolean
  onToggle: () => void
  onToggleChannel: (serviceId: string, phaseId: string, channel: NotificationChannel, enabled: boolean) => void
  onSelectTemplate: (serviceId: string, phaseId: string, channel: NotificationChannel, templateId: string | null) => void
  onLoadTemplates: (serviceId: string, phaseId: string, channel: NotificationChannel) => void
  onPreviewTemplate: (templateId: string) => void
  getTemplatesForContext: (serviceId: string, phaseId: string, channel: NotificationChannel) => NotificationTemplateAPI[]
  isLoadingTemplatesForContext: (serviceId: string, phaseId: string, channel: NotificationChannel) => boolean
  hasChanges: boolean
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
  showSuccess: boolean
}) {
  // Count active channels for this service
  const activeChannelsCount = service.phases.reduce((acc, phase) => {
    return (
      acc +
      (phase.channels.email.enabled ? 1 : 0) +
      (phase.channels.push.enabled ? 1 : 0) +
      (phase.channels.whatsapp.enabled ? 1 : 0)
    )
  }, 0)

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <motion.div
        animate={
          showSuccess
            ? {
                scale: [1, 1.02, 1],
                borderColor: ["hsl(var(--border))", "hsl(142.1 76.2% 36.3%)", "hsl(var(--border))"],
              }
            : {}
        }
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="rounded-lg"
      >
        <Card className="overflow-hidden dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                {getServiceIcon(service.service_type_name)}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{service.service_type_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {service.phases.length} fases configuradas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {showSuccess && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </motion.div>
              )}
              {activeChannelsCount > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {activeChannelsCount} activos
                </Badge>
              )}
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-4 bg-white dark:bg-gray-950">
            {/* Phases Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Configuración por Fase
                </h4>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        El sistema aplicará lógica de fallback automática (Email → WhatsApp → Push) si falla el canal principal.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {service.phases.map((phaseConfig, index) => {
                // Create templates object for all channels
                const channels: NotificationChannel[] = ["email", "push", "whatsapp"]
                const templatesForPhase: Record<NotificationChannel, NotificationTemplateAPI[]> = {
                  email: getTemplatesForContext(service.id, phaseConfig.phase_id, "email"),
                  push: getTemplatesForContext(service.id, phaseConfig.phase_id, "push"),
                  whatsapp: getTemplatesForContext(service.id, phaseConfig.phase_id, "whatsapp"),
                }
                const loadingForPhase: Record<NotificationChannel, boolean> = {
                  email: isLoadingTemplatesForContext(service.id, phaseConfig.phase_id, "email"),
                  push: isLoadingTemplatesForContext(service.id, phaseConfig.phase_id, "push"),
                  whatsapp: isLoadingTemplatesForContext(service.id, phaseConfig.phase_id, "whatsapp"),
                }

                return (
                  <PhaseConfigRow
                    key={phaseConfig.phase_id}
                    phaseConfig={phaseConfig}
                    phaseIndex={index}
                    onToggleChannel={(phaseId, channel, enabled) =>
                      onToggleChannel(service.id, phaseId, channel, enabled)
                    }
                    onSelectTemplate={(phaseId, channel, templateId) =>
                      onSelectTemplate(service.id, phaseId, channel, templateId)
                    }
                    onLoadTemplates={(phaseId, channel) => onLoadTemplates(service.id, phaseId, channel)}
                    onPreviewTemplate={onPreviewTemplate}
                    availableTemplates={templatesForPhase}
                    isLoadingTemplates={loadingForPhase}
                    disabled={isSaving}
                  />
                )
              })}
            </div>

            {/* Save/Cancel Buttons */}
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                  className="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </CollapsibleContent>
        </Card>
      </motion.div>
    </Collapsible>
  )
}

// Loading Skeleton Component
function OrchestrationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-5" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// Error State Component
function OrchestrationError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Card className="p-8 text-center dark:bg-gray-950 border-gray-200 dark:border-gray-800">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Error al cargar la matriz
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {error}
          </p>
        </div>
        <Button variant="outline" onClick={onRetry} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    </Card>
  )
}

// Empty State Component
function OrchestrationEmpty({ target }: { target: "clients" | "staff" }) {
  return (
    <Card className="p-8 text-center dark:bg-gray-950 border-gray-200 dark:border-gray-800">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Inbox className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Sin configuración
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            No hay tipos de servicio configurados para {target === "clients" ? "clientes" : "personal"}.
          </p>
        </div>
      </div>
    </Card>
  )
}

// Main Component
export function OrchestrationMatrix({ target }: OrchestrationMatrixProps) {
  const { serviceTypes: originalServiceTypes, isLoading, error, refresh } = useOrchestrationMatrix(target)
  const [openServices, setOpenServices] = React.useState<Set<string>>(new Set())
  const hasInitialized = React.useRef(false)

  // Local state for modified service types (deep copy for mutations)
  const [modifiedServiceTypes, setModifiedServiceTypes] = React.useState<OrchestrationServiceType[]>([])

  // Track which services have pending changes
  const [serviceChanges, setServiceChanges] = React.useState<Record<string, boolean>>({})

  // Track which services are currently saving
  const [savingServices, setSavingServices] = React.useState<Record<string, boolean>>({})

  // Track which services just saved successfully (for animation)
  const [successServices, setSuccessServices] = React.useState<Record<string, boolean>>({})

  // Template dropdown states
  const [loadingTemplates, setLoadingTemplates] = React.useState<Record<string, boolean>>({})
  const [templatesByContext, setTemplatesByContext] = React.useState<
    Record<string, NotificationTemplateAPI[]>
  >({})

  // Preview dialog state
  const [previewTemplate, setPreviewTemplate] = React.useState<NotificationTemplateAPI | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = React.useState(false)

  // Initialize modified state when original data loads
  React.useEffect(() => {
    if (originalServiceTypes.length > 0) {
      // Deep clone to avoid mutating original
      setModifiedServiceTypes(JSON.parse(JSON.stringify(originalServiceTypes)))
    }
  }, [originalServiceTypes])

  // Open first service by default when data loads (only once)
  React.useEffect(() => {
    if (originalServiceTypes.length > 0 && !hasInitialized.current) {
      setOpenServices(new Set([originalServiceTypes[0].id]))
      hasInitialized.current = true
    }
  }, [originalServiceTypes])

  // Use modified service types for display
  const serviceTypes = modifiedServiceTypes.length > 0 ? modifiedServiceTypes : originalServiceTypes

  const handleToggleService = (serviceId: string) => {
    setOpenServices((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId)
      } else {
        newSet.add(serviceId)
      }
      return newSet
    })
  }

  const handleToggleChannel = (
    serviceId: string,
    phaseId: string,
    channel: NotificationChannel,
    enabled: boolean
  ) => {
    setModifiedServiceTypes((prev) => {
      const newServices = [...prev]
      const serviceIndex = newServices.findIndex((s) => s.id === serviceId)

      if (serviceIndex === -1) return prev

      const service = newServices[serviceIndex]
      const phaseIndex = service.phases.findIndex((p) => p.phase_id === phaseId)

      if (phaseIndex === -1) return prev

      // Update channel enabled status
      newServices[serviceIndex] = {
        ...service,
        phases: service.phases.map((phase, idx) =>
          idx === phaseIndex
            ? {
                ...phase,
                channels: {
                  ...phase.channels,
                  [channel]: {
                    ...phase.channels[channel],
                    enabled,
                  },
                },
              }
            : phase
        ),
      }

      return newServices
    })

    // Mark service as having changes
    setServiceChanges((prev) => ({ ...prev, [serviceId]: true }))
  }

  /**
   * Load templates for a specific cell (service + phase + channel)
   */
  const loadTemplatesForCell = React.useCallback(
    async (serviceId: string, phaseId: string, channel: NotificationChannel) => {
      const service = serviceTypes.find((s) => s.id === serviceId)
      if (!service) return

      const contextKey = `${serviceId}_${phaseId}_${channel}`

      // Check cache first
      if (templatesByContext[contextKey]) {
        return // Already loaded
      }

      setLoadingTemplates((prev) => ({ ...prev, [contextKey]: true }))

      try {
        const token = await getClientAccessToken()
        if (!token) {
          throw new Error("No se pudo obtener el token de autenticación")
        }

        const templates = await fetchTemplatesForContext(
          {
            service_type_id: service.service_type_id,
            phase_id: phaseId,
            channel,
            target,
            // Add subtype_id if the service has it
            // subtype_id: service.subtype_id
          },
          token
        )

        setTemplatesByContext((prev) => ({
          ...prev,
          [contextKey]: templates,
        }))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        toast.error("Error al cargar plantillas", {
          description: errorMessage,
        })
      } finally {
        setLoadingTemplates((prev) => {
          const newState = { ...prev }
          delete newState[contextKey]
          return newState
        })
      }
    },
    [serviceTypes, target, templatesByContext]
  )

  const handleSelectTemplate = (
    serviceId: string,
    phaseId: string,
    channel: NotificationChannel,
    templateId: string | null
  ) => {
    setModifiedServiceTypes((prev) => {
      const newServices = [...prev]
      const serviceIndex = newServices.findIndex((s) => s.id === serviceId)
      if (serviceIndex === -1) return prev

      const service = newServices[serviceIndex]
      const phaseIndex = service.phases.findIndex((p) => p.phase_id === phaseId)
      if (phaseIndex === -1) return prev

      // Update template_id
      newServices[serviceIndex] = {
        ...service,
        phases: service.phases.map((phase, idx) =>
          idx === phaseIndex
            ? {
                ...phase,
                channels: {
                  ...phase.channels,
                  [channel]: {
                    ...phase.channels[channel],
                    template_id: templateId,
                  },
                },
              }
            : phase
        ),
      }

      return newServices
    })

    // Mark service as having changes
    setServiceChanges((prev) => ({ ...prev, [serviceId]: true }))
  }

  /**
   * Handle preview template request
   */
  const handlePreviewTemplate = React.useCallback(
    async (templateId: string) => {
      // Find template in cache first
      let template: NotificationTemplateAPI | null = null

      for (const templates of Object.values(templatesByContext)) {
        const found = templates.find((t) => t.id === templateId)
        if (found) {
          template = found
          break
        }
      }

      if (template) {
        setPreviewTemplate(template)
        setShowPreviewDialog(true)
      } else {
        // Fallback: Fetch from API if not in cache
        try {
          const token = await getClientAccessToken()
          if (!token) {
            throw new Error("No se pudo obtener el token de autenticación")
          }

          const fetchedTemplate = await fetchNotificationTemplateById(templateId, token)
          setPreviewTemplate(fetchedTemplate)
          setShowPreviewDialog(true)
        } catch (error) {
          toast.error("Error al cargar vista previa")
        }
      }
    },
    [templatesByContext]
  )

  /**
   * Helper: Get templates for a specific context
   */
  const getTemplatesForContext = React.useCallback(
    (serviceId: string, phaseId: string, channel: NotificationChannel) => {
      const contextKey = `${serviceId}_${phaseId}_${channel}`
      return templatesByContext[contextKey] || []
    },
    [templatesByContext]
  )

  /**
   * Helper: Check if templates are loading for a specific context
   */
  const isLoadingTemplatesForContext = React.useCallback(
    (serviceId: string, phaseId: string, channel: NotificationChannel) => {
      const contextKey = `${serviceId}_${phaseId}_${channel}`
      return loadingTemplates[contextKey] || false
    },
    [loadingTemplates]
  )

  const handleSave = async (serviceId: string) => {
    const modifiedService = modifiedServiceTypes.find((s) => s.id === serviceId)
    if (!modifiedService) return

    // Set saving state
    setSavingServices((prev) => ({ ...prev, [serviceId]: true }))

    try {
      // Get auth token
      const token = await getClientAccessToken()
      if (!token) {
        throw new Error("No se pudo obtener el token de autenticación")
      }

      // Flatten hierarchical data to API format
      const configs: OrchestrationUpdateConfig[] = []
      modifiedService.phases.forEach((phase) => {
        ;(Object.keys(phase.channels) as NotificationChannel[]).forEach((channel) => {
          const channelConfig = phase.channels[channel]
          configs.push({
            phase_id: phase.phase_id,
            channel,
            enabled: channelConfig.enabled,
            template_id: channelConfig.template_id,
          })
        })
      })

      // Call API to update orchestration matrix
      const response = await updateOrchestrationMatrix(
        serviceId,
        { configs },
        token
      )

      // Transform response and update original data
      const transformedResponse = transformOrchestrationData({
        count: 1,
        next: null,
        previous: null,
        results: [response],
      })

      // Update both original and modified state
      const updatedService = transformedResponse[0]
      setModifiedServiceTypes((prev) =>
        prev.map((s) => (s.id === serviceId ? updatedService : s))
      )

      // Clear dirty state
      setServiceChanges((prev) => {
        const newChanges = { ...prev }
        delete newChanges[serviceId]
        return newChanges
      })

      // Trigger success animation
      setSuccessServices((prev) => ({ ...prev, [serviceId]: true }))

      // Clear success animation after 2 seconds
      setTimeout(() => {
        setSuccessServices((prev) => {
          const newSuccess = { ...prev }
          delete newSuccess[serviceId]
          return newSuccess
        })
      }, 2000)

      toast.success("Configuración guardada", {
        description: "Los cambios han sido guardados correctamente.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast.error("Error al guardar", {
        description: errorMessage,
      })
      console.error("Error saving orchestration:", error)
    } finally {
      setSavingServices((prev) => {
        const newSaving = { ...prev }
        delete newSaving[serviceId]
        return newSaving
      })
    }
  }

  const handleCancel = (serviceId: string) => {
    // Revert to original values
    const originalService = originalServiceTypes.find((s) => s.id === serviceId)
    if (!originalService) return

    setModifiedServiceTypes((prev) =>
      prev.map((s) => (s.id === serviceId ? JSON.parse(JSON.stringify(originalService)) : s))
    )

    // Clear dirty state
    setServiceChanges((prev) => {
      const newChanges = { ...prev }
      delete newChanges[serviceId]
      return newChanges
    })
  }

  // Loading state
  if (isLoading) {
    return <OrchestrationSkeleton />
  }

  // Error state
  if (error) {
    return <OrchestrationError error={error} onRetry={refresh} />
  }

  // Empty state
  if (serviceTypes.length === 0) {
    return <OrchestrationEmpty target={target} />
  }

  return (
    <div className="space-y-3">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {serviceTypes.map((service) => (
        <ServiceAccordionItem
          key={service.id}
          service={service}
          isOpen={openServices.has(service.id)}
          onToggle={() => handleToggleService(service.id)}
          onToggleChannel={handleToggleChannel}
          onSelectTemplate={handleSelectTemplate}
          onLoadTemplates={loadTemplatesForCell}
          onPreviewTemplate={handlePreviewTemplate}
          getTemplatesForContext={getTemplatesForContext}
          isLoadingTemplatesForContext={isLoadingTemplatesForContext}
          hasChanges={serviceChanges[service.id] || false}
          isSaving={savingServices[service.id] || false}
          onSave={() => handleSave(service.id)}
          onCancel={() => handleCancel(service.id)}
          showSuccess={successServices[service.id] || false}
        />
      ))}

      {/* Template Preview Dialog */}
      <TemplatePreviewDialog
        template={previewTemplate}
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
      />
    </div>
  )
}

