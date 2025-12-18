/**
 * Mock Data for Notifications Module
 * This file contains all the simulated data for the notifications system
 */

// ============================================
// TYPES
// ============================================

export type NotificationChannel = "push" | "email" | "whatsapp"

export interface ChannelConfig {
  id: NotificationChannel
  name: string
  description: string
  icon: string
  enabled: boolean
  priority: number
}

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

export interface CustomerNotificationPreferences {
  customerId: string
  channels: ChannelConfig[]
  quietHours: {
    enabled: boolean
    start: string // "22:00"
    end: string // "08:00"
  }
  frequency: "immediate" | "daily_digest" | "weekly_digest"
}

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
  quietHours: {
    enabled: true,
    start: "22:00",
    end: "08:00",
  },
  frequency: "immediate",
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

