import { useState, useEffect, useCallback } from "react"
import { getOrdenTallerDetalle, type OrdenTallerDetalleAPI } from "@/lib/api/taller"
import { useAuthToken } from "@/hooks/use-auth-token"
import { toast } from "sonner"
import type { TechnicianOrder, PhaseTimelineItem, PartUsed, PhaseEvidence } from "@/lib/fixtures/technical-progress"

interface UseOrdenTallerDetalleReturn {
  orden: TechnicianOrder | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener el detalle de una orden de trabajo del taller
 * Transforma la respuesta de la API al formato TechnicianOrder que espera la UI
 */
export function useOrdenTallerDetalle(ordenId: string): UseOrdenTallerDetalleReturn {
  const [orden, setOrden] = useState<TechnicianOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuthToken()

  const transformAPIResponse = useCallback((apiData: OrdenTallerDetalleAPI): TechnicianOrder => {
    return {
      id: apiData.id,
      codigo: apiData.codigo,
      estado: apiData.estado,
      tipoOrden: apiData.tipoOrden,
      // Conversión de strings ISO a Date
      fechaCreacion: new Date(apiData.fechaCreacion),
      fechaEstimadaEntrega: new Date(apiData.fechaEstimadaEntrega),
      cliente: apiData.cliente,
      vehiculo: apiData.vehiculo,
      asesor: apiData.asesor,
      tecnicoAsignado: apiData.tecnicoAsignado,
      // Incluir sucursal si existe
      sucursal: apiData.sucursal || null,
      // Transformar fases con conversión de fechas
      fases: apiData.fases.map((fase): PhaseTimelineItem => ({
        id: fase.id,
        etapaOrdenTrabajoId: fase.etapaOrdenTrabajoId,  // ID para completar fase via API
        fase: fase.fase as any,  // Cast necesario
        estado: fase.estado,
        fechaInicio: fase.fechaInicio ? new Date(fase.fechaInicio) : undefined,
        fechaFin: fase.fechaFin ? new Date(fase.fechaFin) : undefined,
        duracionMinutos: fase.duracionMinutos,
        tecnicoId: fase.tecnicoId,
        tecnicoNombre: fase.tecnicoNombre,
        observaciones: fase.observaciones || undefined,
        evidencia: fase.evidencia as PhaseEvidence[] || [],
      })),
      trabajosAdicionales: apiData.trabajosAdicionales,
      // Transformar repuestos con conversión de precioUnitario string → number
      repuestosUtilizados: apiData.repuestosUtilizados.map((repuesto): PartUsed => ({
        id: repuesto.id,
        codigo: repuesto.codigo,
        descripcion: repuesto.descripcion,
        cantidad: repuesto.cantidad,
        unidad: repuesto.unidad,
        precioUnitario: parseFloat(repuesto.precioUnitario),
      })),
      descripcionProblema: apiData.descripcionProblema,
      diagnosticoInicial: apiData.diagnosticoInicial || undefined,
    }
  }, [])

  const fetchOrden = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) {
        throw new Error("No se pudo obtener el token de autenticación")
      }

      const apiData = await getOrdenTallerDetalle(ordenId, token)
      const transformedData = transformAPIResponse(apiData)
      setOrden(transformedData)
    } catch (err) {
      console.error("Error fetching orden taller detalle:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al cargar el detalle de la orden"
      setError(errorMessage)
      toast.error("Error al cargar orden", {
        description: errorMessage
      })
      setOrden(null)
    } finally {
      setIsLoading(false)
    }
  }, [ordenId, getToken, transformAPIResponse])

  useEffect(() => {
    fetchOrden()
  }, [fetchOrden])

  return {
    orden,
    isLoading,
    error,
    refetch: fetchOrden,
  }
}
