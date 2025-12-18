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
  Check,
  AlertTriangle,
  Moon,
  Clock,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  mockCustomerPreferences,
  type ChannelConfig,
  type CustomerNotificationPreferences,
} from "@/lib/fixtures/notifications-data"

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
}: {
  channel: ChannelConfig
  index: number
  onToggle: (enabled: boolean) => void
  isReadOnly?: boolean
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

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`transition-all duration-200 ${
          isDragging ? "shadow-lg ring-2 ring-primary/20" : ""
        } ${channel.enabled ? "ring-1 ring-primary/10" : ""} dark:bg-gray-900`}
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
            {isReadOnly ? (
              <Badge variant={channel.enabled ? "default" : "secondary"}>
                {channel.enabled ? "Activo" : "Inactivo"}
              </Badge>
            ) : (
              <Switch
                checked={channel.enabled}
                onCheckedChange={onToggle}
                aria-label={`Activar ${channel.name}`}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Priority Preview Card
function PriorityPreviewCard({ channels }: { channels: ChannelConfig[] }) {
  const enabledChannels = channels.filter((c) => c.enabled).sort((a, b) => a.priority - b.priority)

  if (enabledChannels.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              No tienes ningún canal activo. Activa al menos un canal para recibir notificaciones.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Así te contactaremos:
            </p>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              {enabledChannels.length === 1 ? (
                <>Te enviaremos notificaciones por <strong>{enabledChannels[0].name}</strong>.</>
              ) : (
                <>
                  Intentaremos primero por <strong>{enabledChannels[0].name}</strong>
                  {enabledChannels.length > 1 && (
                    <>
                      {enabledChannels.slice(1, -1).map((c) => (
                        <span key={c.id}>, luego <strong>{c.name}</strong></span>
                      ))}
                      {enabledChannels.length > 1 && (
                        <> y finalmente <strong>{enabledChannels[enabledChannels.length - 1].name}</strong></>
                      )}
                    </>
                  )}
                  .
                </>
              )}
            </p>
          </div>
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

// Main Component
export function NotificationPreferencesView({ isReadOnly = false }: NotificationPreferencesViewProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [preferences, setPreferences] = React.useState<CustomerNotificationPreferences | null>(null)

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

  // Simular carga de datos
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPreferences(mockCustomerPreferences)
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && preferences) {
      const oldIndex = preferences.channels.findIndex((c) => c.id === active.id)
      const newIndex = preferences.channels.findIndex((c) => c.id === over.id)

      const newChannels = arrayMove(preferences.channels, oldIndex, newIndex).map(
        (channel, index) => ({
          ...channel,
          priority: index + 1,
        })
      )

      setPreferences({ ...preferences, channels: newChannels })
      setHasChanges(true)
    }
  }

  const handleToggleChannel = (channelId: string, enabled: boolean) => {
    if (!preferences) return

    const newChannels = preferences.channels.map((c) =>
      c.id === channelId ? { ...c, enabled } : c
    )

    setPreferences({ ...preferences, channels: newChannels })
    setHasChanges(true)
  }

  const handleToggleQuietHours = (enabled: boolean) => {
    if (!preferences) return
    setPreferences({
      ...preferences,
      quietHours: { ...preferences.quietHours, enabled },
    })
    setHasChanges(true)
  }

  const handleFrequencyChange = (frequency: "immediate" | "daily_digest" | "weekly_digest") => {
    if (!preferences) return
    setPreferences({ ...preferences, frequency })
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setHasChanges(false)
    toast.success("Preferencias guardadas", {
      description: "Tus preferencias de notificación se han actualizado correctamente.",
    })
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

  if (!preferences) return null

  const sortedChannels = [...preferences.channels].sort((a, b) => a.priority - b.priority)

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
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Preview */}
        <PriorityPreviewCard channels={sortedChannels} />
      </section>

      <Separator />

      {/* Configuración Adicional */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Configuración Adicional
        </h2>

        {/* Horario Silencioso */}
        <Card className="dark:bg-gray-900">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Moon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Horario Silencioso</h3>
                  <p className="text-sm text-muted-foreground">
                    No recibir notificaciones entre las {preferences.quietHours.start} y las{" "}
                    {preferences.quietHours.end}
                  </p>
                </div>
              </div>
              {isReadOnly ? (
                <Badge variant={preferences.quietHours.enabled ? "default" : "secondary"}>
                  {preferences.quietHours.enabled ? "Activo" : "Inactivo"}
                </Badge>
              ) : (
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={handleToggleQuietHours}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Frecuencia */}
        <Card className="dark:bg-gray-900">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Frecuencia de Notificaciones
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Elige con qué frecuencia quieres recibir resúmenes
                  </p>
                </div>
              </div>
              {isReadOnly ? (
                <Badge variant="secondary">
                  {preferences.frequency === "immediate"
                    ? "Inmediato"
                    : preferences.frequency === "daily_digest"
                    ? "Resumen diario"
                    : "Resumen semanal"}
                </Badge>
              ) : (
                <Select
                  value={preferences.frequency}
                  onValueChange={(v) =>
                    handleFrequencyChange(v as "immediate" | "daily_digest" | "weekly_digest")
                  }
                >
                  <SelectTrigger className="w-[180px] dark:bg-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Inmediato</SelectItem>
                    <SelectItem value="daily_digest">Resumen diario</SelectItem>
                    <SelectItem value="weekly_digest">Resumen semanal</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

