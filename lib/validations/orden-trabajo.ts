import { z } from "zod"

export const ordenTrabajoSchema = z.object({
  tipo: z
    .string()
    .min(1, "Debe seleccionar un tipo de orden"),

  subtipo: z
    .string()
    .optional(),

  cliente: z
    .string()
    .min(1, "Debe seleccionar un cliente"),

  vehiculo: z
    .string()
    .min(1, "Debe seleccionar un vehículo"),

  fecha_promesa_entrega: z
    .string()
    .min(1, "La fecha de entrega es requerida"),

  kilometraje_ingreso: z
    .number({ invalid_type_error: "El kilometraje debe ser un número" })
    .min(1, "El kilometraje debe ser mayor a 0")
    .max(999999, "El kilometraje no puede exceder 999,999 km"),

  descripcion_trabajo: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres"),

  asesor: z
    .string()
    .optional(),
})

export type OrdenTrabajoFormData = z.infer<typeof ordenTrabajoSchema>
