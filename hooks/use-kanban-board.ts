import { useState, useEffect, useCallback } from "react"
import { getKanbanBoard, type KanbanBoardAPI } from "@/lib/api/taller"
import { useAuthToken } from "@/hooks/use-auth-token"
import { toast } from "sonner"

interface UseKanbanBoardReturn {
  board: KanbanBoardAPI | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener y gestionar los datos del tablero Kanban
 */
export function useKanbanBoard(): UseKanbanBoardReturn {
  const [board, setBoard] = useState<KanbanBoardAPI | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuthToken()

  const fetchBoard = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) {
        throw new Error("No se pudo obtener el token de autenticación")
      }

      const data = await getKanbanBoard(token)
      setBoard(data)
    } catch (err) {
      // Only log non-500 errors or first occurrence
      if (!(err instanceof Error && err.message.includes("HTTP 500"))) {
        console.error("Error fetching kanban board:", err)
      }

      const errorMessage = err instanceof Error ? err.message : "Error al cargar el tablero"

      // Handle 500 errors more gracefully
      if (errorMessage.includes("HTTP 500")) {
        setError("Error del servidor. Por favor, intenta nuevamente.")
        // Don't show toast for 500 errors to avoid spam when navigating
      } else {
        setError(errorMessage)
        toast.error("Error al cargar tablero", {
          description: errorMessage
        })
      }

      setBoard(null)
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  return {
    board,
    isLoading,
    error,
    refetch: fetchBoard,
  }
}
