import { useState, useEffect, useCallback, useRef } from "react"
import {
  getAnalyticsSummary,
  getRecentLogs,
  getChannelHealth,
  type AnalyticsSummary,
  type NotificationLog,
  type HealthResponse,
  type RecentParams,
  type NotificationChannel,
  type NotificationStatus,
} from "@/lib/api/notification-analytics"

// ============================================
// useAnalyticsSummary
// ============================================

interface UseAnalyticsSummaryReturn {
  data: AnalyticsSummary | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAnalyticsSummary(days: number = 30): UseAnalyticsSummaryReturn {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const summary = await getAnalyticsSummary(days)
      setData(summary)
    } catch (err) {
      console.error("Error fetching analytics summary:", err)
      setError(err instanceof Error ? err.message : "Error al cargar estadísticas")
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

// ============================================
// useRecentLogs
// ============================================

interface UseRecentLogsReturn {
  data: NotificationLog[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRecentLogs(params: RecentParams = {}): UseRecentLogsReturn {
  const [data, setData] = useState<NotificationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use refs to track params and avoid unnecessary re-fetches
  const paramsRef = useRef(params)
  paramsRef.current = params

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const logs = await getRecentLogs(paramsRef.current)
      setData(logs)
    } catch (err) {
      console.error("Error fetching recent logs:", err)
      setError(err instanceof Error ? err.message : "Error al cargar logs")
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [params.limit, params.channel, params.status, fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

// ============================================
// useChannelHealth
// ============================================

interface UseChannelHealthReturn {
  data: HealthResponse | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useChannelHealth(): UseChannelHealthReturn {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const health = await getChannelHealth()
      setData(health)
    } catch (err) {
      console.error("Error fetching channel health:", err)
      setError(err instanceof Error ? err.message : "Error al cargar estado de canales")
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

// ============================================
// Combined Hook for Full Analytics Dashboard
// ============================================

interface UseNotificationAnalyticsReturn {
  summary: {
    data: AnalyticsSummary | null
    isLoading: boolean
    error: string | null
  }
  logs: {
    data: NotificationLog[]
    isLoading: boolean
    error: string | null
    filters: {
      channel: NotificationChannel | undefined
      status: NotificationStatus | undefined
      limit: number
    }
    setChannel: (channel: NotificationChannel | undefined) => void
    setStatus: (status: NotificationStatus | undefined) => void
    setLimit: (limit: number) => void
  }
  health: {
    data: HealthResponse | null
    isLoading: boolean
    error: string | null
  }
  period: {
    days: number
    setDays: (days: number) => void
  }
  refetchAll: () => Promise<void>
}

export function useNotificationAnalytics(): UseNotificationAnalyticsReturn {
  // Period state
  const [days, setDays] = useState(30)

  // Log filters state
  const [logChannel, setLogChannel] = useState<NotificationChannel | undefined>(undefined)
  const [logStatus, setLogStatus] = useState<NotificationStatus | undefined>(undefined)
  const [logLimit, setLogLimit] = useState(20)

  // Individual hooks
  const summaryHook = useAnalyticsSummary(days)
  const logsHook = useRecentLogs({
    limit: logLimit,
    channel: logChannel,
    status: logStatus,
  })
  const healthHook = useChannelHealth()

  // Combined refetch
  const refetchAll = useCallback(async () => {
    await Promise.all([
      summaryHook.refetch(),
      logsHook.refetch(),
      healthHook.refetch(),
    ])
  }, [summaryHook, logsHook, healthHook])

  return {
    summary: {
      data: summaryHook.data,
      isLoading: summaryHook.isLoading,
      error: summaryHook.error,
    },
    logs: {
      data: logsHook.data,
      isLoading: logsHook.isLoading,
      error: logsHook.error,
      filters: {
        channel: logChannel,
        status: logStatus,
        limit: logLimit,
      },
      setChannel: setLogChannel,
      setStatus: setLogStatus,
      setLimit: setLogLimit,
    },
    health: {
      data: healthHook.data,
      isLoading: healthHook.isLoading,
      error: healthHook.error,
    },
    period: {
      days,
      setDays,
    },
    refetchAll,
  }
}
