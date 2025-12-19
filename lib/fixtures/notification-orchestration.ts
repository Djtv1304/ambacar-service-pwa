/**
 * ============================================
 * NOTIFICATION ORCHESTRATION - TYPES & MOCKS
 * ============================================
 *
 * This file contains type definitions and mock data for the
 * advanced notification orchestration system (Manager View).
 *
 * The orchestration system allows managers to configure
 * automatic notifications based on service types and phases.
 *
 * @module lib/fixtures/notification-orchestration
 */

// ============================================
// TYPES & INTERFACES
// ============================================

/**
 * Available notification channels
 */
export type NotificationChannel = "email" | "push" | "whatsapp"

/**
 * Service Phase Schema
 * --------------------
 * Represents a phase in the service workflow.
 *
 * @property id - Unique phase identifier
 * @property name - Display name
 * @property icon - Lucide icon name
 * @property order - Sequence order in workflow
 */
export interface ServicePhase {
  id: string
  name: string
  icon: string
  order: number
}

/**
 * Service Type Schema
 * -------------------
 * Represents a type of service offered by the workshop.
 *
 * @property id - Unique service type identifier
 * @property name - Display name
 * @property icon - Lucide icon name
 * @property subtypes - Optional array of service subtypes
 */
export interface ServiceType {
  id: string
  name: string
  icon: string
  subtypes?: {
    id: string
    name: string
  }[]
}

/**
 * Channel Configuration for a Phase
 * ----------------------------------
 * Configuration for a single channel in a specific phase.
 *
 * @property enabled - Whether the channel is active for this phase
 * @property templateId - ID of the template to use (null if none selected)
 */
export interface ChannelPhaseConfig {
  enabled: boolean
  templateId: string | null
}

/**
 * Phase Notification Config
 * -------------------------
 * Complete notification configuration for a single phase.
 *
 * @property phaseId - Reference to the phase
 * @property channels - Configuration for each notification channel
 */
export interface PhaseNotificationConfig {
  phaseId: string
  channels: {
    email: ChannelPhaseConfig
    push: ChannelPhaseConfig
    whatsapp: ChannelPhaseConfig
  }
}

/**
 * Service Orchestration Config
 * ----------------------------
 * Complete notification configuration for a service type.
 *
 * @property serviceTypeId - Reference to the service type
 * @property subtypeId - Optional reference to subtype (null for main type)
 * @property target - Whether this config is for "clients" or "staff"
 * @property phases - Array of phase configurations
 */
export interface ServiceOrchestrationConfig {
  serviceTypeId: string
  subtypeId: string | null
  target: "clients" | "staff"
  phases: PhaseNotificationConfig[]
}

/**
 * Template Variable Schema
 * ------------------------
 * A dynamic variable that can be inserted into templates.
 *
 * @property id - Variable identifier (used in template)
 * @property label - Display label
 * @property description - What this variable resolves to
 * @property example - Example value for preview
 */
export interface TemplateVariable {
  id: string
  label: string
  description: string
  example: string
}

/**
 * Notification Template Schema
 * ----------------------------
 * A message template for notifications.
 *
 * @property id - Unique template identifier
 * @property name - Template name
 * @property subject - Email subject (optional for non-email)
 * @property body - Template content with variables
 * @property channel - Primary channel for this template
 * @property target - Whether for "clients" or "staff"
 * @property isDefault - Whether this is a system default template
 * @property createdAt - ISO date of creation
 * @property updatedAt - ISO date of last update
 */
export interface NotificationTemplate {
  id: string
  name: string
  subject?: string
  body: string
  channel: NotificationChannel
  target: "clients" | "staff"
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// ============================================
// MOCK DATA - SERVICE PHASES
// ============================================

/**
 * Standard service phases for all service types
 */
export const SERVICE_PHASES: ServicePhase[] = [
  { id: "phase-schedule", name: "Agendar Cita", icon: "Calendar", order: 1 },
  { id: "phase-reception", name: "Recepción", icon: "ClipboardCheck", order: 2 },
  { id: "phase-repair", name: "Reparación", icon: "Wrench", order: 3 },
  { id: "phase-quality", name: "Control Calidad", icon: "ShieldCheck", order: 4 },
  { id: "phase-delivery", name: "Entrega", icon: "CarFront", order: 5 },
]

// ============================================
// MOCK DATA - SERVICE TYPES
// ============================================

/**
 * Available service types in the workshop
 */
export const SERVICE_TYPES: ServiceType[] = [
  {
    id: "avaluo-comercial",
    name: "Avalúo Comercial",
    icon: "FileSearch",
  },
  {
    id: "averia-revision",
    name: "Avería/Revisión",
    icon: "AlertTriangle",
    subtypes: [
      { id: "averia-frenos", name: "Frenos" },
      { id: "averia-diagnostico", name: "Diagnóstico" },
      { id: "averia-alineacion", name: "Alineación" },
    ],
  },
  {
    id: "colision-pintura",
    name: "Colisión/Pintura",
    icon: "Paintbrush",
    subtypes: [
      { id: "colision-siniestro", name: "Siniestro" },
      { id: "colision-golpe", name: "Golpe" },
      { id: "colision-pintura", name: "Pintura" },
    ],
  },
  {
    id: "mantenimiento-preventivo",
    name: "Mantenimiento Preventivo",
    icon: "Settings",
  },
  {
    id: "avaluo-mg",
    name: "Avalúo MG",
    icon: "FileCheck",
  },
]

// ============================================
// MOCK DATA - TEMPLATE VARIABLES
// ============================================

/**
 * Available variables for template insertion
 */
export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    id: "nombre",
    label: "{{Nombre}}",
    description: "Nombre del cliente",
    example: "Carlos Mendoza",
  },
  {
    id: "placa",
    label: "{{Placa}}",
    description: "Placa del vehículo",
    example: "PCU6322",
  },
  {
    id: "vehiculo",
    label: "{{Vehículo}}",
    description: "Marca y modelo del vehículo",
    example: "Haval H6 2024",
  },
  {
    id: "fase",
    label: "{{Fase}}",
    description: "Nombre de la fase actual",
    example: "Recepción",
  },
  {
    id: "fecha",
    label: "{{Fecha}}",
    description: "Fecha programada",
    example: "20 de Diciembre, 2025",
  },
  {
    id: "hora",
    label: "{{Hora}}",
    description: "Hora programada",
    example: "14:30",
  },
  {
    id: "orden",
    label: "{{Orden}}",
    description: "Número de orden de trabajo",
    example: "OT-2025-MANT-014",
  },
  {
    id: "tecnico",
    label: "{{Técnico}}",
    description: "Nombre del técnico asignado",
    example: "Juan Técnico",
  },
  {
    id: "taller",
    label: "{{Taller}}",
    description: "Nombre del taller",
    example: "Ambacar Service",
  },
]

// ============================================
// MOCK DATA - NOTIFICATION TEMPLATES
// ============================================

/**
 * Pre-configured notification templates
 */
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // Client Templates - Email
  {
    id: "tpl-client-email-welcome",
    name: "Bienvenida - Cita Agendada",
    subject: "✅ Tu cita ha sido confirmada - {{Taller}}",
    body: "Hola {{Nombre}},\n\nTu cita para {{Vehículo}} ({{Placa}}) ha sido confirmada para el {{Fecha}} a las {{Hora}}.\n\nTe esperamos en {{Taller}}.\n\n¡Gracias por confiar en nosotros!",
    channel: "email",
    target: "clients",
    isDefault: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  {
    id: "tpl-client-email-reception",
    name: "Vehículo en Recepción",
    subject: "🚗 Hemos recibido tu vehículo - {{Taller}}",
    body: "Hola {{Nombre}},\n\nTu {{Vehículo}} ({{Placa}}) ha sido recibido en nuestras instalaciones.\n\nOrden de trabajo: {{Orden}}\n\nTe mantendremos informado del progreso.",
    channel: "email",
    target: "clients",
    isDefault: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  {
    id: "tpl-client-email-ready",
    name: "Vehículo Listo para Entrega",
    subject: "🎉 Tu vehículo está listo - {{Taller}}",
    body: "Hola {{Nombre}},\n\n¡Excelentes noticias! Tu {{Vehículo}} ({{Placa}}) ya está listo para ser retirado.\n\nPuedes pasar a recogerlo en nuestro horario de atención.\n\n¡Gracias por tu preferencia!",
    channel: "email",
    target: "clients",
    isDefault: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  // Client Templates - WhatsApp
  {
    id: "tpl-client-wa-welcome",
    name: "Confirmación de Cita (WA)",
    body: "✅ *Cita Confirmada*\n\nHola {{Nombre}}, tu cita para {{Vehículo}} está confirmada:\n\n📅 {{Fecha}}\n⏰ {{Hora}}\n\n¡Te esperamos!",
    channel: "whatsapp",
    target: "clients",
    isDefault: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  {
    id: "tpl-client-wa-progress",
    name: "Actualización de Progreso (WA)",
    body: "🔧 *Actualización de Servicio*\n\nHola {{Nombre}}, tu {{Vehículo}} ahora está en: *{{Fase}}*\n\nTe seguimos informando.",
    channel: "whatsapp",
    target: "clients",
    isDefault: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  {
    id: "tpl-client-wa-ready",
    name: "Vehículo Listo (WA)",
    body: "🎉 *¡Tu vehículo está listo!*\n\nHola {{Nombre}}, tu {{Vehículo}} ({{Placa}}) ya puede ser retirado.\n\n📍 {{Taller}}",
    channel: "whatsapp",
    target: "clients",
    isDefault: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  // Client Templates - Push
  {
    id: "tpl-client-push-welcome",
    name: "Cita Confirmada (Push)",
    body: "Tu cita para {{Vehículo}} ha sido confirmada para el {{Fecha}}",
    channel: "push",
    target: "clients",
    isDefault: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  {
    id: "tpl-client-push-progress",
    name: "Cambio de Fase (Push)",
    body: "Tu vehículo {{Placa}} ahora está en: {{Fase}}",
    channel: "push",
    target: "clients",
    isDefault: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  {
    id: "tpl-client-push-ready",
    name: "Vehículo Listo (Push)",
    body: "¡Tu {{Vehículo}} está listo para retirar!",
    channel: "push",
    target: "clients",
    isDefault: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  // Staff Templates
  {
    id: "tpl-staff-push-assigned",
    name: "Nueva OT Asignada",
    body: "Se te ha asignado la orden {{Orden}} - {{Vehículo}}",
    channel: "push",
    target: "staff",
    isDefault: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  {
    id: "tpl-staff-email-daily",
    name: "Resumen Diario",
    subject: "📋 Tu resumen de órdenes - {{Fecha}}",
    body: "Hola {{Técnico}},\n\nAquí está tu resumen de órdenes para hoy.\n\nRevisa el panel para más detalles.",
    channel: "email",
    target: "staff",
    isDefault: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
]

// ============================================
// MOCK DATA - ORCHESTRATION CONFIGURATIONS
// ============================================

/**
 * Generate default phase configurations
 * All channels disabled by default
 */
function generateDefaultPhaseConfigs(): PhaseNotificationConfig[] {
  return SERVICE_PHASES.map((phase) => ({
    phaseId: phase.id,
    channels: {
      email: { enabled: false, templateId: null },
      push: { enabled: false, templateId: null },
      whatsapp: { enabled: false, templateId: null },
    },
  }))
}

/**
 * Sample orchestration configurations for Mantenimiento Preventivo (Clients)
 */
export const MOCK_ORCHESTRATION_CONFIGS: ServiceOrchestrationConfig[] = [
  {
    serviceTypeId: "mantenimiento-preventivo",
    subtypeId: null,
    target: "clients",
    phases: [
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
    ],
  },
  {
    serviceTypeId: "avaluo-comercial",
    subtypeId: null,
    target: "clients",
    phases: generateDefaultPhaseConfigs(),
  },
  {
    serviceTypeId: "averia-revision",
    subtypeId: null,
    target: "clients",
    phases: generateDefaultPhaseConfigs(),
  },
  {
    serviceTypeId: "colision-pintura",
    subtypeId: null,
    target: "clients",
    phases: generateDefaultPhaseConfigs(),
  },
  {
    serviceTypeId: "avaluo-mg",
    subtypeId: null,
    target: "clients",
    phases: generateDefaultPhaseConfigs(),
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get templates filtered by channel and target
 */
export function getTemplatesByChannel(
  channel: NotificationChannel,
  target: "clients" | "staff"
): NotificationTemplate[] {
  return NOTIFICATION_TEMPLATES.filter(
    (t) => t.channel === channel && t.target === target
  )
}

/**
 * Get orchestration config for a service type
 */
export function getOrchestrationConfig(
  serviceTypeId: string,
  target: "clients" | "staff"
): ServiceOrchestrationConfig | undefined {
  return MOCK_ORCHESTRATION_CONFIGS.find(
    (c) => c.serviceTypeId === serviceTypeId && c.target === target
  )
}

/**
 * Replace template variables with example values for preview
 */
export function previewTemplate(body: string): string {
  let result = body
  TEMPLATE_VARIABLES.forEach((variable) => {
    const regex = new RegExp(`{{${variable.id}}}`, "gi")
    result = result.replace(regex, variable.example)
  })
  return result
}

/**
 * Count template statistics
 */
export function getTemplateStats(body: string): {
  characters: number
  words: number
  variables: number
} {
  const characters = body.length
  const words = body.trim().split(/\s+/).filter(Boolean).length
  const variableMatches = body.match(/\{\{[^}]+}}/g) || []
  const variables = variableMatches.length

  return { characters, words, variables }
}

