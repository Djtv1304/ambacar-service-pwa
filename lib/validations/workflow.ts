import { z } from "zod"

// Schema for a single workflow phase
export const workflowPhaseSchema = z.object({
  id: z.string().min(1, "El ID es requerido"),
  nombre: z.string()
    .min(1, "El nombre de la fase es requerido")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  descripcion: z.string()
    .max(200, "La descripción no puede exceder 200 caracteres")
    .default(""),
  tiempoEstimado: z.coerce
    .number()
    .min(1, "El tiempo estimado debe ser al menos 1 minuto")
    .max(480, "El tiempo estimado no puede exceder 8 horas (480 minutos)"),
  orden: z.number().int().positive("El orden debe ser un número positivo"),
  esCritica: z.boolean().default(false),
  ejecutada: z.boolean().optional(),
  color: z.string().optional(),
})

export type WorkflowPhaseFormData = z.infer<typeof workflowPhaseSchema>

// Schema for the complete workflow configuration
export const workflowConfigSchema = z.object({
  tipoServicio: z.enum(["preventivo", "correctivo", "express", "garantia"], {
    required_error: "El tipo de servicio es requerido",
  }),
  fases: z.array(workflowPhaseSchema)
    .min(2, "Debe haber al menos 2 fases en el flujo")
    .max(15, "No puede haber más de 15 fases")
    .refine(
      (fases) => {
        const tiempoTotal = fases.reduce((sum, fase) => sum + fase.tiempoEstimado, 0)
        return tiempoTotal > 0
      },
      {
        message: "El tiempo total del flujo debe ser mayor a 0",
      }
    )
    .refine(
      (fases) => {
        const nombres = fases.map(f => f.nombre.toLowerCase().trim())
        return new Set(nombres).size === nombres.length
      },
      {
        message: "Los nombres de las fases no pueden repetirse",
      }
    ),
})

export type WorkflowConfigFormData = z.infer<typeof workflowConfigSchema>

// Schema for exception mode (editing a specific order)
export const workflowExceptionSchema = z.object({
  orderId: z.string().min(1, "El ID de la orden es requerido"),
  placa: z.string().min(1, "La placa es requerida"),
  fases: z.array(workflowPhaseSchema)
    .min(2, "Debe haber al menos 2 fases en el flujo")
    .refine(
      (fases) => {
        // Check that critical phases that are already executed cannot be removed
        // This is a client-side validation hint; real validation happens server-side
        const fasesEjecutadas = fases.filter(f => f.ejecutada)
        return fasesEjecutadas.every(f => !f.esCritica || fases.some(phase => phase.id === f.id))
      },
      {
        message: "No se pueden eliminar fases críticas que ya fueron ejecutadas",
      }
    ),
})

export type WorkflowExceptionFormData = z.infer<typeof workflowExceptionSchema>

// Validation helper for checking if a phase can be deleted
export function canDeletePhase(fase: WorkflowPhaseFormData, fasesCompletadas: string[] = []): {
  canDelete: boolean
  reason?: string
} {
  // Cannot delete if already executed
  if (fase.ejecutada || fasesCompletadas.includes(fase.id)) {
    return {
      canDelete: false,
      reason: `La fase "${fase.nombre}" ya fue ejecutada y no puede ser eliminada.`,
    }
  }

  // Cannot delete critical phases that are at the beginning or end (reception/delivery)
  if (fase.esCritica && (fase.orden === 1)) {
    return {
      canDelete: false,
      reason: `La fase "${fase.nombre}" es crítica para el inicio del proceso.`,
    }
  }

  return { canDelete: true }
}

