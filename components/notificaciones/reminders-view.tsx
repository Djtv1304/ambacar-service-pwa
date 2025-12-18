"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Plus,
  Car,
  Gauge,
  Calendar,
  Bell,
  Mail,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  mockVehicles,
  mockReminders,
  calculateServiceProgress,
  type Vehicle,
  type MaintenanceReminder,
  type NotificationChannel,
} from "@/lib/fixtures/notifications-data"

// Form Schema
const reminderSchema = z.object({
  vehicleId: z.string().min(1, "Selecciona un vehículo"),
  type: z.enum(["kilometers", "date", "both"]),
  description: z.string().min(3, "La descripción es requerida"),
  targetKilometers: z.number().optional(),
  targetDate: z.string().optional(),
  notifyVia: z.array(z.enum(["push", "email", "whatsapp"])).min(1, "Selecciona al menos un canal"),
  notifyBeforeDays: z.number().optional(),
  notifyBeforeKm: z.number().optional(),
})

type ReminderFormData = z.infer<typeof reminderSchema>

// Status Badge Component
function StatusBadge({ status }: { status: MaintenanceReminder["status"] }) {
  const statusConfig = {
    pending: {
      label: "Pendiente",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      icon: Clock,
    },
    notified: {
      label: "Notificado",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      icon: Bell,
    },
    completed: {
      label: "Completado",
      className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      icon: CheckCircle2,
    },
    overdue: {
      label: "Vencido",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      icon: AlertTriangle,
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// Channel Icons
const channelIcons: Record<NotificationChannel, React.ReactNode> = {
  push: <Bell className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
}

// Vehicle Card with Reminders
function VehicleReminderCard({
  vehicle,
  reminders,
  onAddReminder,
  onEditReminder,
  onDeleteReminder,
}: {
  vehicle: Vehicle
  reminders: MaintenanceReminder[]
  onAddReminder: (vehicleId: string) => void
  onEditReminder: (reminder: MaintenanceReminder) => void
  onDeleteReminder: (reminderId: string) => void
}) {
  const { progress, remainingKm, status } = calculateServiceProgress(vehicle)

  const statusColors = {
    ok: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    urgent: "text-red-600 dark:text-red-400",
  }

  return (
    <Card className="dark:bg-gray-900">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted dark:bg-gray-800">
              <Car className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {vehicle.brand} {vehicle.model}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{vehicle.plate}</span>
                <span>•</span>
                <span>{vehicle.year}</span>
              </CardDescription>
            </div>
          </div>
          <Button size="sm" onClick={() => onAddReminder(vehicle.id)}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Recordatorio</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Kilometrage Progress */}
        <div className="rounded-lg bg-muted/50 dark:bg-gray-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Gauge className="h-4 w-4" />
              Kilometraje actual
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {vehicle.currentKilometers.toLocaleString()} km
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Próximo servicio: {vehicle.nextServiceKilometers.toLocaleString()} km</span>
            <span className={statusColors[status]}>
              {remainingKm > 0 ? `${remainingKm.toLocaleString()} km restantes` : "¡Servicio requerido!"}
            </span>
          </div>
        </div>

        {/* Reminders List */}
        {reminders.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Recordatorios ({reminders.length})
            </h4>
            <div className="space-y-2">
              {reminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-card dark:bg-gray-800 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {reminder.description}
                      </p>
                      <StatusBadge status={reminder.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      {reminder.targetKilometers && (
                        <span className="flex items-center gap-1">
                          <Gauge className="h-3 w-3" />
                          {reminder.targetKilometers.toLocaleString()} km
                        </span>
                      )}
                      {reminder.targetDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(reminder.targetDate).toLocaleDateString("es-EC")}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        {reminder.notifyVia.map((channel) => (
                          <span key={channel} className="text-muted-foreground">
                            {channelIcons[channel]}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEditReminder(reminder)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => onDeleteReminder(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay recordatorios configurados</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => onAddReminder(vehicle.id)}
              className="mt-1"
            >
              Crear el primero
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Reminder Form Modal
function ReminderFormModal({
  open,
  onOpenChange,
  vehicles,
  reminder,
  defaultVehicleId,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicles: Vehicle[]
  reminder?: MaintenanceReminder
  defaultVehicleId?: string
  onSave: (data: ReminderFormData) => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      vehicleId: reminder?.vehicleId || defaultVehicleId || "",
      type: reminder?.type || "kilometers",
      description: reminder?.description || "",
      targetKilometers: reminder?.targetKilometers,
      targetDate: reminder?.targetDate,
      notifyVia: reminder?.notifyVia || ["whatsapp"],
      notifyBeforeDays: reminder?.notifyBeforeDays || 7,
      notifyBeforeKm: reminder?.notifyBeforeKm || 500,
    },
  })

  const type = watch("type")
  const notifyVia = watch("notifyVia")

  React.useEffect(() => {
    if (open) {
      reset({
        vehicleId: reminder?.vehicleId || defaultVehicleId || "",
        type: reminder?.type || "kilometers",
        description: reminder?.description || "",
        targetKilometers: reminder?.targetKilometers,
        targetDate: reminder?.targetDate,
        notifyVia: reminder?.notifyVia || ["whatsapp"],
        notifyBeforeDays: reminder?.notifyBeforeDays || 7,
        notifyBeforeKm: reminder?.notifyBeforeKm || 500,
      })
    }
  }, [open, reminder, defaultVehicleId, reset])

  const onSubmit = (data: ReminderFormData) => {
    onSave(data)
    onOpenChange(false)
  }

  const toggleChannel = (channel: NotificationChannel) => {
    const current = notifyVia || []
    if (current.includes(channel)) {
      setValue(
        "notifyVia",
        current.filter((c) => c !== channel),
        { shouldValidate: true }
      )
    } else {
      setValue("notifyVia", [...current, channel], { shouldValidate: true })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reminder ? "Editar Recordatorio" : "Nuevo Recordatorio"}
          </DialogTitle>
          <DialogDescription>
            Configura un recordatorio de mantenimiento para tu vehículo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Vehículo */}
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Vehículo</Label>
            <Select
              value={watch("vehicleId")}
              onValueChange={(v) => setValue("vehicleId", v, { shouldValidate: true })}
            >
              <SelectTrigger className="dark:bg-gray-800">
                <SelectValue placeholder="Selecciona un vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.brand} {v.model} - {v.plate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vehicleId && (
              <p className="text-xs text-red-500">{errors.vehicleId.message}</p>
            )}
          </div>

          {/* Tipo de Recordatorio */}
          <div className="space-y-2">
            <Label>Tipo de Recordatorio</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "kilometers", label: "Kilometraje" },
                { value: "date", label: "Fecha" },
                { value: "both", label: "Ambos" },
              ].map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={type === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setValue("type", option.value as "kilometers" | "date" | "both")
                  }
                  className="w-full"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Ej: Cambio de aceite y filtros"
              className="dark:bg-gray-800"
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Kilometraje Objetivo */}
          {(type === "kilometers" || type === "both") && (
            <div className="space-y-2">
              <Label htmlFor="targetKilometers">Kilometraje Objetivo</Label>
              <Input
                id="targetKilometers"
                type="number"
                {...register("targetKilometers", { valueAsNumber: true })}
                placeholder="Ej: 50000"
                className="dark:bg-gray-800"
              />
            </div>
          )}

          {/* Fecha Objetivo */}
          {(type === "date" || type === "both") && (
            <div className="space-y-2">
              <Label htmlFor="targetDate">Fecha Objetivo</Label>
              <Input
                id="targetDate"
                type="date"
                {...register("targetDate")}
                className="dark:bg-gray-800"
              />
            </div>
          )}

          {/* Canales de Notificación */}
          <div className="space-y-3">
            <Label>Notificar por</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "push" as const, label: "Push", icon: Bell },
                { id: "email" as const, label: "Email", icon: Mail },
                { id: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle },
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant={notifyVia?.includes(id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChannel(id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
            {errors.notifyVia && (
              <p className="text-xs text-red-500">{errors.notifyVia.message}</p>
            )}
          </div>

          {/* Anticipación */}
          <div className="space-y-4 rounded-lg bg-muted/50 dark:bg-gray-800 p-4">
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
              Anticipación de Notificación
            </h4>
            {(type === "date" || type === "both") && (
              <div className="flex items-center gap-3">
                <Label htmlFor="notifyBeforeDays" className="shrink-0 text-sm">
                  Días antes:
                </Label>
                <Input
                  id="notifyBeforeDays"
                  type="number"
                  {...register("notifyBeforeDays", { valueAsNumber: true })}
                  className="w-20 dark:bg-gray-700"
                />
              </div>
            )}
            {(type === "kilometers" || type === "both") && (
              <div className="flex items-center gap-3">
                <Label htmlFor="notifyBeforeKm" className="shrink-0 text-sm">
                  Km antes:
                </Label>
                <Input
                  id="notifyBeforeKm"
                  type="number"
                  {...register("notifyBeforeKm", { valueAsNumber: true })}
                  className="w-20 dark:bg-gray-700"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {reminder ? "Guardar Cambios" : "Crear Recordatorio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  )
}

// Main Component
export function RemindersView() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [reminders, setReminders] = React.useState<MaintenanceReminder[]>([])
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingReminder, setEditingReminder] = React.useState<MaintenanceReminder | undefined>()
  const [defaultVehicleId, setDefaultVehicleId] = React.useState<string | undefined>()
  const [deletingReminderId, setDeletingReminderId] = React.useState<string | null>(null)

  // Simular carga de datos
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVehicles(mockVehicles)
      setReminders(mockReminders)
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleAddReminder = (vehicleId: string) => {
    setDefaultVehicleId(vehicleId)
    setEditingReminder(undefined)
    setIsFormOpen(true)
  }

  const handleEditReminder = (reminder: MaintenanceReminder) => {
    setDefaultVehicleId(undefined)
    setEditingReminder(reminder)
    setIsFormOpen(true)
  }

  const handleSaveReminder = (data: ReminderFormData) => {
    if (editingReminder) {
      // Update existing
      setReminders((prev) =>
        prev.map((r) =>
          r.id === editingReminder.id
            ? {
                ...r,
                ...data,
              }
            : r
        )
      )
      toast.success("Recordatorio actualizado", {
        description: "Los cambios se han guardado correctamente.",
      })
    } else {
      // Create new
      const newReminder: MaintenanceReminder = {
        id: `reminder-${Date.now()}`,
        customerId: "customer-001",
        status: "pending",
        createdAt: new Date().toISOString(),
        ...data,
      }
      setReminders((prev) => [...prev, newReminder])
      toast.success("Recordatorio creado", {
        description: "El recordatorio se ha creado correctamente.",
      })
    }
  }

  const handleDeleteReminder = () => {
    if (deletingReminderId) {
      setReminders((prev) => prev.filter((r) => r.id !== deletingReminderId))
      toast.success("Recordatorio eliminado", {
        description: "El recordatorio se ha eliminado correctamente.",
      })
      setDeletingReminderId(null)
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
              Planificador de Recordatorios
            </h1>
            <p className="text-muted-foreground">Programa avisos de mantenimiento</p>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/notificaciones">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Planificador de Recordatorios
          </h1>
          <p className="text-muted-foreground">
            Programa avisos de mantenimiento para tus vehículos
          </p>
        </div>
      </div>

      {/* Vehicles with Reminders */}
      <div className="space-y-6">
        {vehicles.map((vehicle, index) => {
          const vehicleReminders = reminders.filter((r) => r.vehicleId === vehicle.id)
          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <VehicleReminderCard
                vehicle={vehicle}
                reminders={vehicleReminders}
                onAddReminder={handleAddReminder}
                onEditReminder={handleEditReminder}
                onDeleteReminder={(id) => setDeletingReminderId(id)}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Form Modal */}
      <ReminderFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        vehicles={vehicles}
        reminder={editingReminder}
        defaultVehicleId={defaultVehicleId}
        onSave={handleSaveReminder}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingReminderId} onOpenChange={() => setDeletingReminderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar recordatorio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El recordatorio será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReminder}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

