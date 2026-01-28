"use client"

import * as React from "react"
import Link from "next/link"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Bell,
  Mail,
  MessageCircle,
  GripVertical,
  ArrowLeft,
  Save,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Lock,
  Loader2,
  BellOff,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/components/auth/auth-provider"
import { useCustomerPreferences } from "@/hooks/use-customer-preferences"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import {
  channelConfig,
  type ChannelPreference,
  type NotificationChannel,
} from "@/lib/api/customer-notifications"

// UI type for displaying channels (mapped from API)
interface ChannelDisplayItem {
  id: NotificationChannel
  name: string
  description: string
  enabled: boolean
  priority: number
}

// Push channel state for special UI handling
interface PushChannelState {
  isSupported: boolean
  isBlocked: boolean
  isLoading: boolean
  tooltipMessage?: string
}

interface NotificationPreferencesViewProps {
  isReadOnly?: boolean
}

// Channel Icons Map
const channelIcons: Record<string, React.ReactNode> = {
  push: <Bell className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
}

// Channel Colors Map
const channelColors: Record<string, string> = {
  push: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  email: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  whatsapp: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
}

// Sortable Channel Item
function SortableChannelItem({
  channel,
  index,
  onToggle,
  isReadOnly,
  pushState,
}: {
  channel: ChannelDisplayItem
  index: number
  onToggle: (enabled: boolean) => void
  isReadOnly?: boolean
  pushState?: PushChannelState
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: channel.id,
    disabled: isReadOnly,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.9 : 1,
  }

  // Determine if this is the push channel with special state
  const isPushChannel = channel.id === "push"
  const isPushDisabled = isPushChannel && pushState && (!pushState.isSupported || pushState.isBlocked)
  const isPushLoading = isPushChannel && pushState?.isLoading

  // Render the toggle control based on channel type and state
  const renderToggle = () => {
    if (isReadOnly) {
      return (
        <Badge variant={channel.enabled ? "default" : "secondary"}>
          {channel.enabled ? "Activo" : "Inactivo"}
        </Badge>
      )
    }

    // Special handling for push channel
    if (isPushChannel && pushState) {
      // Not supported
      if (!pushState.isSupported) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary">No disponible</Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{pushState.tooltipMessage || "Tu navegador no soporta notificaciones push"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }

      // Blocked by user
      if (pushState.isBlocked) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <Badge variant="outline" className="border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400">
                    Bloqueado
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Las notificaciones están bloqueadas. Habilítalas en la configuración de tu navegador.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }

      // Loading state
      if (pushState.isLoading) {
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <Switch checked={channel.enabled} disabled aria-label={`Activar ${channel.name}`} />
          </div>
        )
      }
    }

    // Normal toggle
    return (
      <Switch
        checked={channel.enabled}
        onCheckedChange={onToggle}
        disabled={isPushDisabled || isPushLoading}
        aria-label={`Activar ${channel.name}`}
      />
    )
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`transition-all duration-200 ${
          isDragging ? "shadow-lg ring-2 ring-primary/20" : ""
        } ${channel.enabled && !isPushDisabled ? "ring-1 ring-primary/10" : ""} ${
          isPushDisabled ? "opacity-60" : ""
        } dark:bg-gray-900`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Drag Handle */}
            {!isReadOnly && (
              <button
                {...attributes}
                {...listeners}
                className="touch-none p-1 rounded hover:bg-muted transition-colors cursor-grab active:cursor-grabbing"
                aria-label="Arrastrar para reordenar"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </button>
            )}

            {/* Priority Badge */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
              {index + 1}
            </div>

            {/* Channel Icon */}
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${channelColors[channel.id]}`}>
              {channelIcons[channel.id]}
            </div>

            {/* Channel Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{channel.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{channel.description}</p>
            </div>

            {/* Toggle */}
            {renderToggle()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Configuration Summary Card - Top of page with badges and flow diagram
function ConfigurationSummaryCard({ channels }: { channels: ChannelDisplayItem[] }) {
  const enabledChannels = channels.filter((c) => c.enabled).sort((a, b) => a.priority - b.priority)

  // Badge colors for each channel
  const badgeColors: Record<string, string> = {
    push: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    email: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    whatsapp: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  }

  // Short names for badges
  const channelShortNames: Record<string, string> = {
    push: "Push PWA",
    email: "Correo",
    whatsapp: "WhatsApp",
  }

  return (
    <Card className="bg-white dark:bg-card border-gray-200 dark:border-gray-800 shadow-sm">
      <CardContent className="px-5 space-y-5">
        {/* Section A: Active Channels (Badges) */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Canales de Comunicación Activos
          </h3>
          <div className="flex flex-wrap gap-2">
            {enabledChannels.length > 0 ? (
              enabledChannels.map((channel) => (
                <Badge
                  key={channel.id}
                  className={`${badgeColors[channel.id]} font-medium px-3 py-1 rounded-full`}
                >
                  <span className="mr-1.5">{channelIcons[channel.id]}</span>
                  {channelShortNames[channel.id]}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground italic">
                Ningún canal activo
              </span>
            )}
          </div>
        </div>

        {/* Section B: Priority Order (Flow) */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Orden de Prioridad
          </h3>

          {enabledChannels.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              {enabledChannels.map((channel, index) => (
                <React.Fragment key={channel.id}>
                  {/* Step Box */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">
                        {channelIcons[channel.id]}
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {channel.name}
                      </span>
                    </div>
                  </div>

                  {/* Arrow Connector */}
                  {index < enabledChannels.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Activa al menos un canal para definir el orden de prioridad</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-24" />
    </div>
  )
}

// Helper to map API preferences to UI display items
function mapPreferencesToDisplayItems(preferences: ChannelPreference[]): ChannelDisplayItem[] {
  return preferences.map((pref) => ({
    id: pref.channel,
    name: channelConfig[pref.channel].label,
    description: channelConfig[pref.channel].description,
    enabled: pref.enabled,
    priority: pref.priority,
  }))
}

// Main Component
export function NotificationPreferencesView({ isReadOnly = false }: NotificationPreferencesViewProps) {
  const { user } = useAuth()
  const customerId = user?.id?.toString()

  const {
    preferences: apiPreferences,
    isLoading,
    isSaving,
    error,
    hasChanges,
    updatePreferences,
    setLocalPreferences,
    refresh,
  } = useCustomerPreferences(customerId)

  // Push notifications hook
  const {
    isSupported: isPushSupported,
    unsupportedReason,
    permission: pushPermission,
    isSubscribed: hasPushSubscription,
    isLoading: isPushLoading,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush,
  } = usePushNotifications(customerId)

  // Track if we're currently handling a push toggle action
  const [isPushToggling, setIsPushToggling] = React.useState(false)

  // Map API preferences to UI display items
  // For push channel, sync enabled state with actual subscription status
  const displayItems = React.useMemo(() => {
    const items = mapPreferencesToDisplayItems(apiPreferences)

    // Sync push channel enabled state with actual subscription
    return items.map((item) => {
      if (item.id === "push") {
        // Push is only truly enabled if we have an active subscription
        // and the preference is enabled
        const effectiveEnabled = isPushSupported && hasPushSubscription && item.enabled
        return { ...item, enabled: effectiveEnabled }
      }
      return item
    })
  }, [apiPreferences, isPushSupported, hasPushSubscription])

  // Push channel state for UI
  const pushChannelState: PushChannelState = React.useMemo(() => {
    const getTooltipMessage = () => {
      if (unsupportedReason === "insecure-context") {
        return "Requiere conexión segura (HTTPS)"
      }
      if (unsupportedReason === "no-service-worker") {
        return "Service Worker no disponible"
      }
      if (unsupportedReason === "no-push-manager") {
        return "Tu navegador no soporta notificaciones push"
      }
      return "Notificaciones push no disponibles"
    }

    return {
      isSupported: isPushSupported,
      isBlocked: pushPermission === "denied",
      isLoading: isPushLoading || isPushToggling,
      tooltipMessage: !isPushSupported ? getTooltipMessage() : undefined,
    }
  }, [isPushSupported, pushPermission, isPushLoading, isPushToggling, unsupportedReason])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = apiPreferences.findIndex((c) => c.channel === active.id)
      const newIndex = apiPreferences.findIndex((c) => c.channel === over.id)

      const newPreferences = arrayMove(apiPreferences, oldIndex, newIndex).map(
        (pref, index) => ({
          ...pref,
          priority: index + 1,
        })
      )

      setLocalPreferences(newPreferences)
    }
  }

  // Special handler for push channel toggle
  const handlePushToggle = async (newEnabled: boolean) => {
    setIsPushToggling(true)

    try {
      if (newEnabled) {
        // Activar Push: requiere suscripción
        const success = await subscribeToPush()

        if (!success) {
          // Check if permission was denied
          if (pushPermission === "denied") {
            toast.error("Notificaciones bloqueadas", {
              description: "Habilítalas en la configuración de tu navegador.",
              duration: 5000,
            })
          } else {
            toast.error("Error al activar", {
              description: "No se pudieron activar las notificaciones push.",
            })
          }
          return
        }

        // Actualizar preferencia en backend
        const pushPref = apiPreferences.find((p) => p.channel === "push")
        const channelsToUpdate = apiPreferences.map((pref) => ({
          channel: pref.channel,
          enabled: pref.channel === "push" ? true : pref.enabled,
          priority: pref.priority,
        }))

        const prefsSuccess = await updatePreferences(channelsToUpdate)

        if (prefsSuccess) {
          toast.success("Notificaciones push activadas", {
            description: "Recibirás alertas en tu dispositivo.",
          })
        }
      } else {
        // Desactivar Push: eliminar suscripción
        const success = await unsubscribeFromPush()

        if (!success) {
          toast.error("Error al desactivar", {
            description: "No se pudieron desactivar las notificaciones push.",
          })
          return
        }

        // Actualizar preferencia en backend
        const channelsToUpdate = apiPreferences.map((pref) => ({
          channel: pref.channel,
          enabled: pref.channel === "push" ? false : pref.enabled,
          priority: pref.priority,
        }))

        const prefsSuccess = await updatePreferences(channelsToUpdate)

        if (prefsSuccess) {
          toast.success("Notificaciones push desactivadas", {
            description: "Ya no recibirás alertas push.",
          })
        }
      }
    } catch (error) {
      console.error("[NotificationPreferences] Push toggle error:", error)
      toast.error("Error al actualizar", {
        description: "Ocurrió un error inesperado.",
      })
    } finally {
      setIsPushToggling(false)
    }
  }

  // Handler for non-push channels
  const handleToggleChannel = (channelId: string, enabled: boolean) => {
    // Push channel has special handling
    if (channelId === "push") {
      handlePushToggle(enabled)
      return
    }

    // Other channels: update local state (will be saved with "Guardar Cambios" button)
    const newPreferences = apiPreferences.map((pref) =>
      pref.channel === channelId ? { ...pref, enabled } : pref
    )
    setLocalPreferences(newPreferences)
  }

  const handleSave = async () => {
    const channelsToUpdate = apiPreferences.map((pref) => ({
      channel: pref.channel,
      enabled: pref.enabled,
      priority: pref.priority,
    }))

    const success = await updatePreferences(channelsToUpdate)

    if (success) {
      toast.success("Preferencias guardadas", {
        description: "Tus preferencias de notificación se han actualizado correctamente.",
      })
    } else {
      toast.error("Error al guardar", {
        description: "No se pudieron guardar las preferencias. Intenta de nuevo.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/notificaciones">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Preferencias de Notificación
            </h1>
            <p className="text-muted-foreground">Configura cómo quieres recibir avisos</p>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/notificaciones">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Preferencias de Notificación
            </h1>
            <p className="text-muted-foreground">Configura cómo quieres recibir avisos</p>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-700 dark:text-red-300">
                  Error al cargar preferencias
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
              <Button variant="outline" onClick={refresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedChannels = [...displayItems].sort((a, b) => a.priority - b.priority)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/notificaciones">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Preferencias de Notificación
            </h1>
            <p className="text-muted-foreground">
              {isReadOnly
                ? "Visualizando preferencias (modo lectura)"
                : "Configura cómo quieres recibir avisos"}
            </p>
          </div>
        </div>
        {!isReadOnly && hasChanges && (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        )}
      </div>

      {isReadOnly && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Estás viendo las preferencias del cliente en modo solo lectura.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Summary Card - TOP OF VIEW */}
      <ConfigurationSummaryCard channels={sortedChannels} />

      {/* Canales y Prioridad */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Canales de Notificación
          </h2>
          <p className="text-sm text-muted-foreground">
            {isReadOnly
              ? "Canales configurados por el cliente"
              : "Activa los canales y arrastra para ordenar por prioridad"}
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedChannels.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sortedChannels.map((channel, index) => (
                <SortableChannelItem
                  key={channel.id}
                  channel={channel}
                  index={index}
                  onToggle={(enabled) => handleToggleChannel(channel.id, enabled)}
                  isReadOnly={isReadOnly}
                  pushState={channel.id === "push" ? pushChannelState : undefined}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>
    </div>
  )
}

