/**
 * ============================================
 * NOTIFICATIONS MODULE - MOCK DATA & TYPES
 * ============================================
 *
 * This file contains all type definitions and simulated data
 * for the Notifications system in Ambacar Service PWA.
 *
 * Data Schemas documented here serve as reference for
 * backend API development.
 *
 * @module lib/fixtures/notifications-data
 */

// ============================================
// TYPES & INTERFACES
// ============================================

/**
 * Available notification channels in the system
 */
export type NotificationChannel = "push" | "email" | "whatsapp"

/**
 * Channel Configuration Schema
 * ----------------------------
 * Represents a single notification channel and its settings.
 *
 * @property id - Unique channel identifier (push, email, whatsapp)
 * @property name - Human-readable display name
 * @property description - Brief description for UI tooltips
 * @property icon - Lucide React icon name for rendering
 * @property enabled - Whether the user has activated this channel
 * @property priority - Order in notification cascade (1 = first attempt)
 */
export interface ChannelConfig {
  id: NotificationChannel
  name: string
  description: string
  icon: string
  enabled: boolean
  priority: number
}

/**
 * Taller (Workshop) Notification Configuration Schema
 * ----------------------------------------------------
 * Global settings for the workshop's notification system.
 * Only accessible by Manager role.
 *
 * @property tallerId - Unique workshop identifier
 * @property channels - Available channels and their configuration status
 * @property templates - Message templates for each notification type
 */
export interface TallerNotificationConfig {
  tallerId: string
  channels: {
    push: { enabled: boolean; configured: boolean }
    email: { enabled: boolean; configured: boolean }
    whatsapp: { enabled: boolean; configured: boolean }
  }
  templates: {
    id: string
    name: string
    channel: NotificationChannel
    subject?: string
    body: string
    isDefault: boolean
  }[]
}

/**
 * Customer Contact Information Schema
 * ------------------------------------
 * Personal and contact details for a customer.
 *
 * @property id - Unique customer identifier
 * @property firstName - Customer's first name
 * @property lastName - Customer's last name
 * @property email - Primary email address for notifications
 * @property phone - Primary phone number
 * @property whatsapp - WhatsApp number (may differ from phone)
 * @property preferredLanguage - ISO language code (e.g., "es", "en")
 * @property avatarUrl - Optional profile image URL
 */
export interface CustomerContactInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  whatsapp: string
  preferredLanguage: string
  avatarUrl?: string
}

/**
 * Customer Notification Preferences Schema
 * -----------------------------------------
 * Defines how a customer wants to be notified.
 *
 * @property customerId - Unique identifier for the customer
 * @property channels - Array of notification channels with priority ordering
 *   - id: Channel identifier (push, email, whatsapp)
 *   - name: Display name for the channel
 *   - description: Brief description of the channel
 *   - icon: Lucide icon name for UI rendering
 *   - enabled: Whether the channel is active
 *   - priority: Order of preference (1 = first choice)
 */
export interface CustomerNotificationPreferences {
  customerId: string
  channels: ChannelConfig[]
}

/**
 * Vehicle Schema
 * ---------------
 * Represents a customer's vehicle registered in the system.
 *
 * @property id - Unique vehicle identifier
 * @property customerId - Reference to the owner customer
 * @property brand - Vehicle manufacturer (e.g., "Great Wall")
 * @property model - Vehicle model name (e.g., "Haval H6")
 * @property year - Manufacturing year
 * @property plate - License plate number
 * @property currentKilometers - Current odometer reading
 * @property lastServiceDate - ISO date of last service
 * @property nextServiceKilometers - Odometer target for next service
 * @property imageUrl - Optional vehicle photo URL
 */
export interface Vehicle {
  id: string
  customerId: string
  brand: string
  model: string
  year: number
  plate: string
  currentKilometers: number
  lastServiceDate: string
  nextServiceKilometers: number
  imageUrl?: string
}

/**
 * Maintenance Reminder Schema
 * ----------------------------
 * A scheduled reminder for vehicle maintenance.
 *
 * @property id - Unique reminder identifier
 * @property vehicleId - Reference to the target vehicle
 * @property customerId - Reference to the vehicle owner
 * @property type - Trigger type: "kilometers" | "date" | "both"
 * @property description - What maintenance is needed
 * @property targetKilometers - Odometer reading to trigger reminder
 * @property targetDate - ISO date to trigger reminder
 * @property notifyVia - Array of channels to use for notification
 * @property status - Current state: "pending" | "notified" | "completed" | "overdue"
 * @property createdAt - ISO date when reminder was created
 * @property notifyBeforeDays - Days before targetDate to notify
 * @property notifyBeforeKm - Km before targetKilometers to notify
 */
export interface MaintenanceReminder {
  id: string
  vehicleId: string
  customerId: string
  type: "kilometers" | "date" | "both"
  description: string
  targetKilometers?: number
  targetDate?: string
  notifyVia: NotificationChannel[]
  status: "pending" | "notified" | "completed" | "overdue"
  createdAt: string
  notifyBeforeDays?: number
  notifyBeforeKm?: number
}

/**
 * Customer Dashboard Summary Schema
 * -----------------------------------
 * Aggregated data for the customer's notification dashboard.
 *
 * @property vehiclesCount - Total registered vehicles
 * @property activeRemindersCount - Number of pending reminders
 * @property activeChannelsCount - Number of enabled notification channels
 * @property upcomingReminders - List of next reminders (max 3)
 * @property overdueReminders - List of overdue reminders requiring attention
 */
export interface CustomerDashboardSummary {
  vehiclesCount: number
  activeRemindersCount: number
  activeChannelsCount: number
  upcomingReminders: MaintenanceReminder[]
  overdueReminders: MaintenanceReminder[]
}

// ============================================
// MOCK DATA
// ============================================

/**
 * Configuración global del taller (Solo Manager)
 */
export const mockTallerConfig: TallerNotificationConfig = {
  tallerId: "taller-001",
  channels: {
    push: { enabled: true, configured: true },
    email: { enabled: true, configured: true },
    whatsapp: { enabled: true, configured: false },
  },
  templates: [
    {
      id: "tpl-001",
      name: "Recordatorio de Servicio",
      channel: "email",
      subject: "🔧 Tu vehículo necesita atención - Ambacar",
      body: "Hola {{nombre}}, te recordamos que tu {{vehiculo}} está próximo a requerir mantenimiento.",
      isDefault: true,
    },
    {
      id: "tpl-002",
      name: "Servicio Completado",
      channel: "whatsapp",
      body: "✅ ¡Listo! Tu {{vehiculo}} ya está disponible para recoger en Ambacar.",
      isDefault: true,
    },
    {
      id: "tpl-003",
      name: "Notificación Push",
      channel: "push",
      body: "Tu vehículo requiere atención",
      isDefault: true,
    },
  ],
}

/**
 * Información de contacto del cliente
 */
export const mockCustomerContact: CustomerContactInfo = {
  id: "customer-001",
  firstName: "Carlos",
  lastName: "Mendoza",
  email: "carlos.mendoza@email.com",
  phone: "+593 98 765 4321",
  whatsapp: "+593 98 765 4321",
  preferredLanguage: "es",
  avatarUrl: undefined,
}

/**
 * Preferencias de notificación del cliente
 */
export const mockCustomerPreferences: CustomerNotificationPreferences = {
  customerId: "customer-001",
  channels: [
    {
      id: "whatsapp",
      name: "WhatsApp",
      description: "Mensajes directos a tu WhatsApp",
      icon: "MessageCircle",
      enabled: true,
      priority: 1,
    },
    {
      id: "push",
      name: "Notificaciones Push",
      description: "Alertas en tu dispositivo",
      icon: "Bell",
      enabled: true,
      priority: 2,
    },
    {
      id: "email",
      name: "Correo Electrónico",
      description: "Emails a tu bandeja de entrada",
      icon: "Mail",
      enabled: false,
      priority: 3,
    },
  ],
}

/**
 * Vehículos del cliente
 */
export const mockVehicles: Vehicle[] = [
  {
    id: "vehicle-001",
    customerId: "customer-001",
    brand: "Great Wall",
    model: "Haval H6",
    year: 2024,
    plate: "PCU6322",
    currentKilometers: 15420,
    lastServiceDate: "2024-10-15",
    nextServiceKilometers: 20000,
    imageUrl: undefined,
  },
  {
    id: "vehicle-002",
    customerId: "customer-001",
    brand: "Great Wall",
    model: "Poer",
    year: 2023,
    plate: "ABC1234",
    currentKilometers: 32150,
    lastServiceDate: "2024-09-20",
    nextServiceKilometers: 35000,
    imageUrl: undefined,
  },
  {
    id: "vehicle-003",
    customerId: "customer-001",
    brand: "Great Wall",
    model: "Wingle 7",
    year: 2022,
    plate: "XYZ9876",
    currentKilometers: 48200,
    lastServiceDate: "2024-08-10",
    nextServiceKilometers: 50000,
    imageUrl: undefined,
  },
]

/**
 * Recordatorios de mantenimiento
 */
export const mockReminders: MaintenanceReminder[] = [
  {
    id: "reminder-001",
    vehicleId: "vehicle-001",
    customerId: "customer-001",
    type: "kilometers",
    description: "Cambio de aceite y filtros",
    targetKilometers: 20000,
    notifyVia: ["whatsapp", "push"],
    status: "pending",
    createdAt: "2024-11-01",
    notifyBeforeKm: 500,
  },
  {
    id: "reminder-002",
    vehicleId: "vehicle-002",
    customerId: "customer-001",
    type: "both",
    description: "Revisión de frenos",
    targetKilometers: 35000,
    targetDate: "2025-01-15",
    notifyVia: ["email", "whatsapp"],
    status: "pending",
    createdAt: "2024-10-15",
    notifyBeforeDays: 7,
    notifyBeforeKm: 1000,
  },
  {
    id: "reminder-003",
    vehicleId: "vehicle-003",
    customerId: "customer-001",
    type: "kilometers",
    description: "Cambio de banda de distribución",
    targetKilometers: 50000,
    notifyVia: ["whatsapp"],
    status: "overdue",
    createdAt: "2024-07-01",
    notifyBeforeKm: 2000,
  },
  {
    id: "reminder-004",
    vehicleId: "vehicle-001",
    customerId: "customer-001",
    type: "date",
    description: "Renovación de matrícula",
    targetDate: "2025-03-15",
    notifyVia: ["email", "push"],
    status: "pending",
    createdAt: "2024-11-20",
    notifyBeforeDays: 30,
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calcula el resumen del dashboard del cliente
 */
export function getCustomerDashboardSummary(customerId: string): CustomerDashboardSummary {
  const vehicles = mockVehicles.filter((v) => v.customerId === customerId)
  const reminders = mockReminders.filter((r) => r.customerId === customerId)
  const activeChannels = mockCustomerPreferences.channels.filter((c) => c.enabled)

  return {
    vehiclesCount: vehicles.length,
    activeRemindersCount: reminders.filter((r) => r.status === "pending").length,
    activeChannelsCount: activeChannels.length,
    upcomingReminders: reminders.filter((r) => r.status === "pending").slice(0, 3),
    overdueReminders: reminders.filter((r) => r.status === "overdue"),
  }
}

/**
 * Calcula el progreso hacia el próximo servicio
 */
export function calculateServiceProgress(vehicle: Vehicle): {
  progress: number
  remainingKm: number
  status: "ok" | "warning" | "urgent"
} {
  const totalKm = vehicle.nextServiceKilometers - (vehicle.nextServiceKilometers - 5000) // Asumiendo intervalos de 5000km
  const currentProgress = vehicle.currentKilometers - (vehicle.nextServiceKilometers - 5000)
  const progress = Math.min(100, Math.max(0, (currentProgress / totalKm) * 100))
  const remainingKm = vehicle.nextServiceKilometers - vehicle.currentKilometers

  let status: "ok" | "warning" | "urgent" = "ok"
  if (remainingKm <= 500) status = "urgent"
  else if (remainingKm <= 1500) status = "warning"

  return { progress, remainingKm, status }
}

/**
 * Obtiene el icono del canal
 */
export function getChannelIcon(channel: NotificationChannel): string {
  const icons: Record<NotificationChannel, string> = {
    push: "Bell",
    email: "Mail",
    whatsapp: "MessageCircle",
  }
  return icons[channel]
}

/**
 * Obtiene el color del canal
 */
export function getChannelColor(channel: NotificationChannel): string {
  const colors: Record<NotificationChannel, string> = {
    push: "blue",
    email: "purple",
    whatsapp: "green",
  }
  return colors[channel]
}

