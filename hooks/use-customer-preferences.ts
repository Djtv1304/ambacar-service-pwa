"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getCustomerPreferences,
  updateCustomerPreferences,
  defaultChannelPreferences,
  type ChannelPreference,
  type NotificationChannel,
} from "@/lib/api/customer-notifications"

interface UseCustomerPreferencesReturn {
  preferences: ChannelPreference[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  hasChanges: boolean
  updatePreferences: (
    channels: Array<{
      channel: NotificationChannel
      enabled: boolean
      priority: number
    }>
  ) => Promise<boolean>
  setLocalPreferences: (preferences: ChannelPreference[]) => void
  refresh: () => Promise<void>
}

export function useCustomerPreferences(
  customerId: string | undefined
): UseCustomerPreferencesReturn {
  const [preferences, setPreferences] = useState<ChannelPreference[]>(
    defaultChannelPreferences
  )
  const [originalPreferences, setOriginalPreferences] = useState<
    ChannelPreference[]
  >(defaultChannelPreferences)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPreferences = useCallback(async () => {
    if (!customerId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await getCustomerPreferences(customerId)
      setPreferences(data)
      setOriginalPreferences(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar preferencias"
      setError(errorMessage)
      console.error("[useCustomerPreferences] Error:", err)
      // En caso de error, usar preferencias por defecto
      setPreferences(defaultChannelPreferences)
      setOriginalPreferences(defaultChannelPreferences)
    } finally {
      setIsLoading(false)
    }
  }, [customerId])

  // Cargar preferencias iniciales
  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  // Detectar si hay cambios
  const hasChanges =
    JSON.stringify(preferences) !== JSON.stringify(originalPreferences)

  // Actualizar preferencias en el servidor
  const updatePreferences = useCallback(
    async (
      channels: Array<{
        channel: NotificationChannel
        enabled: boolean
        priority: number
      }>
    ): Promise<boolean> => {
      if (!customerId) return false

      setIsSaving(true)
      try {
        const updatedPreferences = await updateCustomerPreferences(
          customerId,
          channels
        )
        setPreferences(updatedPreferences)
        setOriginalPreferences(updatedPreferences)
        return true
      } catch (err) {
        console.error("[useCustomerPreferences] Error updating:", err)
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [customerId]
  )

  // Actualizar preferencias localmente (para drag-and-drop y toggles)
  const setLocalPreferences = useCallback((newPreferences: ChannelPreference[]) => {
    setPreferences(newPreferences)
  }, [])

  return {
    preferences,
    isLoading,
    isSaving,
    error,
    hasChanges,
    updatePreferences,
    setLocalPreferences,
    refresh: fetchPreferences,
  }
}
