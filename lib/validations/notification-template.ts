import { z } from "zod"

/**
 * Schema para crear/actualizar plantilla completa (PUT/POST)
 * Todos los campos requeridos por el backend
 */
export const notificationTemplateSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  subject: z.string().nullable(),
  body: z.string().min(10, "El cuerpo debe tener al menos 10 caracteres"),
  channel: z.enum(["email", "whatsapp", "push"], {
    errorMap: () => ({ message: "Canal inválido" }),
  }),
  target: z.enum(["clients", "staff"], {
    errorMap: () => ({ message: "Audiencia inválida" }),
  }),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
  taller_id: z.string().uuid().nullable(),
  service_type: z.string().uuid("Debe seleccionar un tipo de servicio válido"),
  phase: z.string().uuid("Debe seleccionar una fase válida"),
  subtype: z.string().uuid().nullable(),
})

/**
 * Schema para actualización parcial (PATCH)
 * Todos los campos opcionales
 */
export const patchNotificationTemplateSchema = notificationTemplateSchema.partial()

/**
 * Tipo inferido del schema para usar en formularios
 */
export type NotificationTemplateFormData = z.infer<typeof notificationTemplateSchema>
