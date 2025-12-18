"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Mail,
  Car,
  Calendar,
  Settings,
  ChevronRight,
  Gauge,
  AlertTriangle,
  Phone,
  Edit2,
  FileText,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  mockCustomerContact,
  mockVehicles,
  getCustomerDashboardSummary,
  calculateServiceProgress,
  type CustomerContactInfo,
  type Vehicle,
  type CustomerDashboardSummary,
} from "@/lib/fixtures/notifications-data"

interface CustomerDashboardViewProps {
  isReadOnly?: boolean
}

// Alert Banner Component - Top Priority
function AlertBanner({ overdueCount, onViewDetails }: { overdueCount: number; onViewDetails: () => void }) {
  if (overdueCount === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-300">
                {overdueCount} Recordatorio{overdueCount > 1 ? "s" : ""} Vencido{overdueCount > 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                Tus vehículos requieren atención. Agenda una cita pronto.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white shrink-0"
            onClick={onViewDetails}
          >
            Ver Detalles
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Profile Card with Metrics
function ProfileCard({
  contact,
  summary,
  onEdit,
  isReadOnly,
}: {
  contact: CustomerContactInfo
  summary: CustomerDashboardSummary
  onEdit: () => void
  isReadOnly?: boolean
}) {
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`

  return (
    <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
      <CardContent className="p-5">
        {/* Profile Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {contact.firstName} {contact.lastName}
              </h3>
              <p className="text-xs text-muted-foreground">Cliente desde 2023</p>
            </div>
          </div>
          {!isReadOnly && (
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-gray-700 dark:text-gray-300 truncate">{contact.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-gray-700 dark:text-gray-300 truncate">{contact.email}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Compact Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{summary.vehiclesCount}</p>
            <p className="text-xs text-muted-foreground">Vehículos</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{summary.activeRemindersCount}</p>
            <p className="text-xs text-muted-foreground">Recordatorios</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{summary.activeChannelsCount}</p>
            <p className="text-xs text-muted-foreground">Canales</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Actions Card - Compact with Red Icon Styling
function QuickActionsCard() {
  return (
    <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Acciones Rápidas</h3>

        <Link href="/dashboard/notificaciones/preferencias" className="block">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-red-200 dark:hover:border-red-800 transition-all cursor-pointer group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 shrink-0">
              <Settings className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                Configurar Notificaciones
              </h4>
              <p className="text-xs text-muted-foreground">
                Ajusta cómo y cuándo quieres recibir avisos
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors shrink-0" />
          </div>
        </Link>

        <Link href="/dashboard/notificaciones/recordatorios" className="block">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-red-200 dark:hover:border-red-800 transition-all cursor-pointer group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 shrink-0">
              <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                Planificador de Recordatorios
              </h4>
              <p className="text-xs text-muted-foreground">
                Programa avisos de mantenimiento
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors shrink-0" />
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}

// Budget Notification Toggle (Customer Only)
function BudgetNotificationCard({
  enabled,
  onToggle,
  isReadOnly,
}: {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  isReadOnly?: boolean
}) {
  return (
    <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 shrink-0 mt-0.5">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                Cambios de Presupuesto
              </h4>
              <p className="text-xs text-muted-foreground">
                Recibir alertas cuando cambien los presupuestos de mis OT
              </p>
            </div>
          </div>
          {isReadOnly ? (
            <Badge variant={enabled ? "default" : "secondary"} className="shrink-0">
              {enabled ? "Activo" : "Inactivo"}
            </Badge>
          ) : (
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              className="shrink-0"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Vehicle Card Component
function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { progress, remainingKm, status } = calculateServiceProgress(vehicle)

  const statusColors = {
    ok: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    urgent: "text-red-600 dark:text-red-400",
  }

  const progressColors = {
    ok: "bg-green-500",
    warning: "bg-amber-500",
    urgent: "bg-red-500",
  }

  const bgColors = {
    ok: "bg-green-50 dark:bg-green-900/20",
    warning: "bg-amber-50 dark:bg-amber-900/20",
    urgent: "bg-red-50 dark:bg-red-900/20",
  }

  return (
    <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Vehicle Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted dark:bg-gray-800 shrink-0">
            <Car className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* Vehicle Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{vehicle.plate}</span>
                  <span>•</span>
                  <span>{vehicle.year}</span>
                </div>
              </div>
              <Badge variant="outline" className={`${bgColors[status]} ${statusColors[status]} border-0 text-xs`}>
                {status === "urgent" ? "Urgente" : status === "warning" ? "Próximo" : "OK"}
              </Badge>
            </div>

            {/* Kilometrage Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" />
                  {vehicle.currentKilometers.toLocaleString()} km
                </span>
                <span className={statusColors[status]}>
                  {remainingKm > 0 ? `${remainingKm.toLocaleString()} km restantes` : "Servicio requerido"}
                </span>
              </div>
              <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all ${progressColors[status]}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Próximo: {vehicle.nextServiceKilometers.toLocaleString()} km
              </p>
            </div>
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
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-32" />
        </div>
        <div className="lg:col-span-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Component
export function CustomerDashboardView({ isReadOnly = false }: CustomerDashboardViewProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [contact, setContact] = React.useState<CustomerContactInfo | null>(null)
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [summary, setSummary] = React.useState<CustomerDashboardSummary | null>(null)
  const [isEditingContact, setIsEditingContact] = React.useState(false)
  const [editForm, setEditForm] = React.useState({ email: "", phone: "" })
  const [budgetNotifications, setBudgetNotifications] = React.useState(true)

  // Simular carga de datos
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setContact(mockCustomerContact)
      setVehicles(mockVehicles)
      setSummary(getCustomerDashboardSummary("customer-001"))
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleEditContact = () => {
    if (contact) {
      setEditForm({
        email: contact.email,
        phone: contact.phone,
      })
      setIsEditingContact(true)
    }
  }

  const handleSaveContact = () => {
    if (contact) {
      setContact({
        ...contact,
        ...editForm,
      })
      setIsEditingContact(false)
      toast.success("Datos actualizados", {
        description: "Tu información de contacto se ha actualizado correctamente.",
      })
    }
  }

  const handleBudgetToggle = (enabled: boolean) => {
    setBudgetNotifications(enabled)
    toast.success(enabled ? "Notificaciones activadas" : "Notificaciones desactivadas", {
      description: enabled
        ? "Recibirás alertas de cambios en presupuestos."
        : "Ya no recibirás alertas de presupuestos.",
    })
  }

  const handleViewOverdueDetails = () => {
    toast.info("Navegando a recordatorios", {
      description: "Redirigiendo al planificador de recordatorios...",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Mi Centro de Notificaciones
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus preferencias de comunicación y recordatorios
          </p>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  if (!contact || !summary) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Mi Centro de Notificaciones
        </h1>
        <p className="text-muted-foreground">
          {isReadOnly
            ? "Visualizando información del cliente (modo lectura)"
            : "Gestiona tus preferencias de comunicación y recordatorios"}
        </p>
        {isReadOnly && (
          <Badge variant="secondary" className="mt-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Modo Solo Lectura
          </Badge>
        )}
      </div>

      {/* Alert Banner - TOP PRIORITY */}
      <AlertBanner
        overdueCount={summary.overdueReminders.length}
        onViewDetails={handleViewOverdueDetails}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Profile & Actions */}
        <div className="lg:col-span-4 space-y-4">
          {/* Profile Card with Metrics */}
          <ProfileCard
            contact={contact}
            summary={summary}
            onEdit={handleEditContact}
            isReadOnly={isReadOnly}
          />

          {/* Quick Actions */}
          <QuickActionsCard />

          {/* Budget Notification Toggle - Only for customers */}
          {!isReadOnly && (
            <BudgetNotificationCard
              enabled={budgetNotifications}
              onToggle={handleBudgetToggle}
              isReadOnly={isReadOnly}
            />
          )}
        </div>

        {/* Right Column - Vehicles */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mis Vehículos</h2>
            <Badge variant="outline">{vehicles.length} registrados</Badge>
          </div>

          <div className="space-y-3">
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <VehicleCard vehicle={vehicle} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditingContact} onOpenChange={setIsEditingContact}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Datos de Contacto</DialogTitle>
            <DialogDescription>
              Actualiza tu información de contacto para recibir notificaciones.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electrónico</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="dark:bg-gray-800"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditingContact(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveContact}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

