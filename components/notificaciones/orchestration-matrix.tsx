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
} from "lucide-react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
import type {
  OrchestrationServiceType,
  OrchestrationPhaseConfig,
  NotificationChannel,
} from "@/lib/api/notifications"

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
}: {
  phaseConfig: OrchestrationPhaseConfig
  phaseIndex: number
  onToggleChannel: (phaseId: string, channel: NotificationChannel, enabled: boolean) => void
  onSelectTemplate: (phaseId: string, channel: NotificationChannel, templateId: string | null) => void
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
                />
              </div>

              {/* Template Display */}
              <div
                className={`h-8 px-3 flex items-center text-xs rounded-md border ${
                  !channelConfig.enabled
                    ? "opacity-50 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                <span className={channelConfig.template_name ? "text-gray-900 dark:text-gray-100" : "text-muted-foreground"}>
                  {channelConfig.template_name || "Sin plantilla"}
                </span>
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
}: {
  service: OrchestrationServiceType
  isOpen: boolean
  onToggle: () => void
  onToggleChannel: (serviceId: string, phaseId: string, channel: NotificationChannel, enabled: boolean) => void
  onSelectTemplate: (serviceId: string, phaseId: string, channel: NotificationChannel, templateId: string | null) => void
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

              {service.phases.map((phaseConfig, index) => (
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
                />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
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
  const { serviceTypes, isLoading, error, refresh } = useOrchestrationMatrix(target)
  const [openServices, setOpenServices] = React.useState<Set<string>>(new Set())
  const hasInitialized = React.useRef(false)

  // Open first service by default when data loads (only once)
  React.useEffect(() => {
    if (serviceTypes.length > 0 && !hasInitialized.current) {
      setOpenServices(new Set([serviceTypes[0].id]))
      hasInitialized.current = true
    }
  }, [serviceTypes])

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
    // TODO: Implement API call to update channel configuration
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
    // TODO: Implement API call to update template selection
    toast.success("Plantilla actualizada", {
      description: "La plantilla ha sido asignada correctamente.",
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
        />
      ))}
    </div>
  )
}

