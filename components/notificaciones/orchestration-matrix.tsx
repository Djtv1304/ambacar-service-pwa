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
} from "lucide-react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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

import {
  SERVICE_TYPES,
  SERVICE_PHASES,
  getTemplatesByChannel,
  type ServiceType,
  type ServicePhase,
  type NotificationChannel,
  type PhaseNotificationConfig,
} from "@/lib/fixtures/notification-orchestration"

interface OrchestrationMatrixProps {
  target: "clients" | "staff"
}

// Icon mapping for service types
const serviceIcons: Record<string, React.ReactNode> = {
  FileSearch: <FileSearch className="h-5 w-5" />,
  AlertTriangle: <AlertTriangle className="h-5 w-5" />,
  Paintbrush: <Paintbrush className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
  FileCheck: <FileCheck className="h-5 w-5" />,
}

// Icon mapping for phases
const phaseIcons: Record<string, React.ReactNode> = {
  Calendar: <Calendar className="h-4 w-4" />,
  ClipboardCheck: <ClipboardCheck className="h-4 w-4" />,
  Wrench: <Wrench className="h-4 w-4" />,
  ShieldCheck: <ShieldCheck className="h-4 w-4" />,
  CarFront: <CarFront className="h-4 w-4" />,
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

// Phase Row Component
function PhaseConfigRow({
  phase,
  config,
  target,
  onToggleChannel,
  onSelectTemplate,
}: {
  phase: ServicePhase
  config: PhaseNotificationConfig
  target: "clients" | "staff"
  onToggleChannel: (phaseId: string, channel: NotificationChannel, enabled: boolean) => void
  onSelectTemplate: (phaseId: string, channel: NotificationChannel, templateId: string | null) => void
}) {
  const channels: NotificationChannel[] = ["email", "push", "whatsapp"]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Phase Info */}
      <div className="flex items-center gap-3 lg:col-span-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {phaseIcons[phase.icon]}
        </div>
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{phase.name}</p>
          <p className="text-xs text-muted-foreground">Fase {phase.order}</p>
        </div>
      </div>

      {/* Channel Configurations */}
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {channels.map((channel) => {
          const channelConfig = config.channels[channel]
          const templates = getTemplatesByChannel(channel, target)

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
                  onCheckedChange={(enabled) => onToggleChannel(phase.id, channel, enabled)}
                  className="scale-90"
                />
              </div>

              {/* Template Selector */}
              <Select
                value={channelConfig.templateId || ""}
                onValueChange={(value) => onSelectTemplate(phase.id, channel, value || null)}
                disabled={!channelConfig.enabled}
              >
                <SelectTrigger
                  className={`h-8 text-xs ${
                    !channelConfig.enabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <SelectValue placeholder="Seleccionar plantilla..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id} className="text-xs">
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Service Accordion Item
function ServiceAccordionItem({
  service,
  target,
  isOpen,
  onToggle,
  phaseConfigs,
  onToggleChannel,
  onSelectTemplate,
}: {
  service: ServiceType
  target: "clients" | "staff"
  isOpen: boolean
  onToggle: () => void
  phaseConfigs: PhaseNotificationConfig[]
  onToggleChannel: (serviceId: string, phaseId: string, channel: NotificationChannel, enabled: boolean) => void
  onSelectTemplate: (serviceId: string, phaseId: string, channel: NotificationChannel, templateId: string | null) => void
}) {
  // Count active channels for this service
  const activeChannelsCount = phaseConfigs.reduce((acc, phase) => {
    return acc + Object.values(phase.channels).filter((c) => c.enabled).length
  }, 0)

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className="overflow-hidden dark:bg-gray-950 border-gray-200 dark:border-gray-800">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                {serviceIcons[service.icon]}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{service.name}</h3>
                {service.subtypes && (
                  <p className="text-xs text-muted-foreground">
                    {service.subtypes.length} subtipos disponibles
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
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
            {/* Subtypes Tabs (if any) */}
            {service.subtypes && service.subtypes.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-3 border-b border-gray-200 dark:border-gray-800">
                <Badge variant="default" className="cursor-pointer">
                  General
                </Badge>
                {service.subtypes.map((subtype) => (
                  <Badge
                    key={subtype.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {subtype.name}
                  </Badge>
                ))}
              </div>
            )}

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

              {SERVICE_PHASES.map((phase) => {
                const phaseConfig = phaseConfigs.find((p) => p.phaseId === phase.id) || {
                  phaseId: phase.id,
                  channels: {
                    email: { enabled: false, templateId: null },
                    push: { enabled: false, templateId: null },
                    whatsapp: { enabled: false, templateId: null },
                  },
                }

                return (
                  <PhaseConfigRow
                    key={phase.id}
                    phase={phase}
                    config={phaseConfig}
                    target={target}
                    onToggleChannel={(phaseId, channel, enabled) =>
                      onToggleChannel(service.id, phaseId, channel, enabled)
                    }
                    onSelectTemplate={(phaseId, channel, templateId) =>
                      onSelectTemplate(service.id, phaseId, channel, templateId)
                    }
                  />
                )
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// Main Component
export function OrchestrationMatrix({ target }: OrchestrationMatrixProps) {
  const [openServices, setOpenServices] = React.useState<Set<string>>(new Set(["mantenimiento-preventivo"]))
  const [configs, setConfigs] = React.useState<Record<string, PhaseNotificationConfig[]>>({})

  // Initialize configs for all services
  React.useEffect(() => {
    const initialConfigs: Record<string, PhaseNotificationConfig[]> = {}
    SERVICE_TYPES.forEach((service) => {
      initialConfigs[service.id] = SERVICE_PHASES.map((phase) => ({
        phaseId: phase.id,
        channels: {
          email: { enabled: false, templateId: null },
          push: { enabled: false, templateId: null },
          whatsapp: { enabled: false, templateId: null },
        },
      }))
    })

    // Set some defaults for "mantenimiento-preventivo" to demonstrate
    if (target === "clients") {
      initialConfigs["mantenimiento-preventivo"] = [
        {
          phaseId: "phase-schedule",
          channels: {
            email: { enabled: true, templateId: "tpl-client-email-welcome" },
            push: { enabled: true, templateId: "tpl-client-push-welcome" },
            whatsapp: { enabled: true, templateId: "tpl-client-wa-welcome" },
          },
        },
        {
          phaseId: "phase-reception",
          channels: {
            email: { enabled: true, templateId: "tpl-client-email-reception" },
            push: { enabled: false, templateId: null },
            whatsapp: { enabled: true, templateId: "tpl-client-wa-progress" },
          },
        },
        {
          phaseId: "phase-repair",
          channels: {
            email: { enabled: false, templateId: null },
            push: { enabled: true, templateId: "tpl-client-push-progress" },
            whatsapp: { enabled: false, templateId: null },
          },
        },
        {
          phaseId: "phase-quality",
          channels: {
            email: { enabled: false, templateId: null },
            push: { enabled: false, templateId: null },
            whatsapp: { enabled: false, templateId: null },
          },
        },
        {
          phaseId: "phase-delivery",
          channels: {
            email: { enabled: true, templateId: "tpl-client-email-ready" },
            push: { enabled: true, templateId: "tpl-client-push-ready" },
            whatsapp: { enabled: true, templateId: "tpl-client-wa-ready" },
          },
        },
      ]
    }

    setConfigs(initialConfigs)
  }, [target])

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
    setConfigs((prev) => {
      const serviceConfigs = [...(prev[serviceId] || [])]
      const phaseIndex = serviceConfigs.findIndex((p) => p.phaseId === phaseId)

      if (phaseIndex >= 0) {
        serviceConfigs[phaseIndex] = {
          ...serviceConfigs[phaseIndex],
          channels: {
            ...serviceConfigs[phaseIndex].channels,
            [channel]: {
              ...serviceConfigs[phaseIndex].channels[channel],
              enabled,
              templateId: enabled ? serviceConfigs[phaseIndex].channels[channel].templateId : null,
            },
          },
        }
      }

      return { ...prev, [serviceId]: serviceConfigs }
    })

    toast.success(enabled ? "Canal activado" : "Canal desactivado", {
      description: `${channel} ${enabled ? "habilitado" : "deshabilitado"} para esta fase.`,
    })
  }

  const handleSelectTemplate = (
    serviceId: string,
    phaseId: string,
    channel: NotificationChannel,
    templateId: string | null
  ) => {
    setConfigs((prev) => {
      const serviceConfigs = [...(prev[serviceId] || [])]
      const phaseIndex = serviceConfigs.findIndex((p) => p.phaseId === phaseId)

      if (phaseIndex >= 0) {
        serviceConfigs[phaseIndex] = {
          ...serviceConfigs[phaseIndex],
          channels: {
            ...serviceConfigs[phaseIndex].channels,
            [channel]: {
              ...serviceConfigs[phaseIndex].channels[channel],
              templateId,
            },
          },
        }
      }

      return { ...prev, [serviceId]: serviceConfigs }
    })
  }

  return (
    <div className="space-y-3">
      {SERVICE_TYPES.map((service) => (
        <ServiceAccordionItem
          key={service.id}
          service={service}
          target={target}
          isOpen={openServices.has(service.id)}
          onToggle={() => handleToggleService(service.id)}
          phaseConfigs={configs[service.id] || []}
          onToggleChannel={handleToggleChannel}
          onSelectTemplate={handleSelectTemplate}
        />
      ))}
    </div>
  )
}

