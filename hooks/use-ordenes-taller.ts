import { useState, useEffect, useCallback } from "react"
import { getOrdenesTaller, type OrdenTallerListaAPI } from "@/lib/api/taller"
import { useAuthToken } from "@/hooks/use-auth-token"
import { toast } from "sonner"
import type { TechnicianOrder } from "@/lib/fixtures/technical-progress"

interface UseOrdenesTallerReturn {
  ordenes: TechnicianOrder[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Transforma respuesta de API a TechnicianOrder
 */
function transformOrdenAPI(apiData: OrdenTallerListaAPI): TechnicianOrder {
  return {
    ...apiData,
    // Convertir fechas ISO a Date
    fechaCreacion: new Date(apiData.fechaCreacion),
    fechaEstimadaEntrega: new Date(apiData.fechaEstimadaEntrega),

    // Manejar tecnicoAsignado null
    tecnicoAsignado: apiData.tecnicoAsignado ? {
      id: apiData.tecnicoAsignado.id,
      nombre: apiData.tecnicoAsignado.nombre,
      especialidad: "Mecánica General"  // Valor por defecto (no viene en API)
    } : null,

    // Manejar asesor null
    asesor: apiData.asesor || null,

    // Transformar fases si existen
    fases: apiData.fases.map((fase: any) => ({
      ...fase,
      fechaInicio: fase.fechaInicio ? new Date(fase.fechaInicio) : undefined,
      fechaFin: fase.fechaFin ? new Date(fase.fechaFin) : undefined,
    })),

    // Transformar repuestos (precioUnitario string → number)
    repuestosUtilizados: apiData.repuestosUtilizados.map((rep: any) => ({
      ...rep,
      precioUnitario: typeof rep.precioUnitario === 'string'
        ? parseFloat(rep.precioUnitario)
        : rep.precioUnitario
    })),
  }
}

/**
 * Hook para obtener y gestionar la lista de órdenes de taller del usuario
 * Realiza GET a /api/taller/ con token, el backend filtra según usuario
 */
export function useOrdenesTaller(): UseOrdenesTallerReturn {
  const [ordenes, setOrdenes] = useState<TechnicianOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuthToken()

  const fetchOrdenes = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) {
        throw new Error("No se pudo obtener el token de autenticación")
      }

      const data = await getOrdenesTaller(token)
      const transformedData = data.map(transformOrdenAPI)
      setOrdenes(transformedData)
    } catch (err) {
      console.error("Error fetching órdenes de taller:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al cargar las órdenes"
      setError(errorMessage)
      toast.error("Error al cargar órdenes", {
        description: errorMessage
      })
      setOrdenes([])
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchOrdenes()
  }, [fetchOrdenes])

  return {
    ordenes,
    isLoading,
    error,
    refetch: fetchOrdenes,
  }
}
