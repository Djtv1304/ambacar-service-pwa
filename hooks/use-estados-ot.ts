"use client"

import { useState, useEffect } from "react"
import { getEstadosOrdenTrabajo } from "@/lib/api/ordenes-trabajo"
import { getClientAccessToken } from "@/lib/auth/actions"
import type { EstadoOrdenTrabajo } from "@/lib/types"

export function useEstadosOT() {
  const [estados, setEstados] = useState<EstadoOrdenTrabajo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEstados() {
      try {
        setIsLoading(true)
        const token = await getClientAccessToken()
        if (!token) throw new Error("No token")

        const data = await getEstadosOrdenTrabajo(token)
        // Ordenar por campo 'orden'
        setEstados(data.sort((a, b) => a.orden - b.orden))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEstados()
  }, [])

  return { estados, isLoading, error }
}
