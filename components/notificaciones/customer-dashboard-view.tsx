"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Bell,
  Mail,
  MessageCircle,
  Car,
  Calendar,
  Settings,
  ChevronRight,
  Gauge,
  AlertTriangle,
  Phone,
  Edit2,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
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

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  color: "blue" | "green" | "amber" | "red"
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  }

  return (
    <Card className="dark:bg-gray-900">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Action Button
function QuickActionButton({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer dark:bg-gray-900 dark:hover:bg-gray-800">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
              <p className="text-sm text-muted-foreground truncate">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
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

  return (
    <Card className="dark:bg-gray-900">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Vehicle Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted dark:bg-gray-800">
            <Car className="h-7 w-7 text-muted-foreground" />
          </div>

          {/* Vehicle Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {vehicle.year}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{vehicle.plate}</p>
            </div>

            {/* Kilometrage Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Gauge className="h-4 w-4" />
                  {vehicle.currentKilometers.toLocaleString()} km
                </span>
                <span className={statusColors[status]}>
                  {remainingKm > 0 ? `${remainingKm.toLocaleString()} km restantes` : "¡Servicio requerido!"}
                </span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-2" />
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all ${progressColors[status]}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Próximo servicio: {vehicle.nextServiceKilometers.toLocaleString()} km
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Contact Info Section
function ContactInfoSection({
  contact,
  onEdit,
  isReadOnly,
}: {
  contact: CustomerContactInfo
  onEdit: () => void
  isReadOnly?: boolean
}) {
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`

  return (
    <Card className="dark:bg-gray-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Datos de Contacto</CardTitle>
          {!isReadOnly && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {contact.firstName} {contact.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">Cliente desde 2023</p>
          </div>
        </div>

        <div className="grid gap-3 pt-2">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-gray-700 dark:text-gray-300">{contact.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-gray-700 dark:text-gray-300">{contact.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-gray-700 dark:text-gray-300">{contact.whatsapp}</span>
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 lg:col-span-1" />
        <div className="lg:col-span-2 space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
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
  const [editForm, setEditForm] = React.useState({ email: "", phone: "", whatsapp: "" })

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
        whatsapp: contact.whatsapp,
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
    <div className="space-y-8">
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

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Vehículos Registrados"
          value={summary.vehiclesCount}
          icon={Car}
          color="blue"
        />
        <StatCard
          title="Recordatorios Activos"
          value={summary.activeRemindersCount}
          icon={Bell}
          color="green"
        />
        <StatCard
          title="Canales Activos"
          value={summary.activeChannelsCount}
          icon={MessageCircle}
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Acciones Rápidas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <QuickActionButton
            href="/dashboard/notificaciones/preferencias"
            icon={Settings}
            title="Configurar Notificaciones"
            description="Ajusta cómo y cuándo quieres recibir avisos"
          />
          <QuickActionButton
            href="/dashboard/notificaciones/recordatorios"
            icon={Calendar}
            title="Planificador de Recordatorios"
            description="Programa avisos de mantenimiento para tus vehículos"
          />
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="lg:col-span-1">
          <ContactInfoSection
            contact={contact}
            onEdit={handleEditContact}
            isReadOnly={isReadOnly}
          />
        </div>

        {/* Vehicles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mis Vehículos</h2>
            <Badge variant="outline">{vehicles.length} vehículos</Badge>
          </div>
          <div className="grid gap-4">
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

      {/* Overdue Reminders Alert */}
      {summary.overdueReminders.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300">
                  Tienes {summary.overdueReminders.length} recordatorio(s) vencido(s)
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  Algunos de tus vehículos requieren atención. Te recomendamos agendar una cita pronto.
                </p>
                <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700 text-white">
                  Ver Recordatorios Vencidos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="space-y-2">
              <Label htmlFor="edit-whatsapp">WhatsApp</Label>
              <Input
                id="edit-whatsapp"
                type="tel"
                value={editForm.whatsapp}
                onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
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

