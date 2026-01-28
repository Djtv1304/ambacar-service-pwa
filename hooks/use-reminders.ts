"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getCustomerVehicles,
  getCustomerReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  type VehicleNotificationsAPI,
  type MaintenanceReminderAPI,
  type CreateReminderRequest,
  type UpdateReminderRequest,
} from "@/lib/api/customer-notifications"

interface UseRemindersReturn {
  vehicles: VehicleNotificationsAPI[]
  reminders: MaintenanceReminderAPI[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  refresh: () => Promise<void>
  addReminder: (data: CreateReminderRequest) => Promise<MaintenanceReminderAPI | null>
  editReminder: (
    reminderId: string,
    data: UpdateReminderRequest
  ) => Promise<MaintenanceReminderAPI | null>
  removeReminder: (reminderId: string) => Promise<boolean>
  markAsComplete: (reminderId: string) => Promise<MaintenanceReminderAPI | null>
  getVehicleReminders: (vehicleId: string) => MaintenanceReminderAPI[]
}

export function useReminders(
  customerId: string | undefined
): UseRemindersReturn {
  const [vehicles, setVehicles] = useState<VehicleNotificationsAPI[]>([])
  const [reminders, setReminders] = useState<MaintenanceReminderAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!customerId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Cargar vehículos y recordatorios en paralelo
      const [vehiclesData, remindersData] = await Promise.all([
        getCustomerVehicles(customerId).catch(() => []),
        getCustomerReminders(customerId).catch(() => []),
      ])

      setVehicles(vehiclesData)
      setReminders(remindersData)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar datos"
      setError(errorMessage)
      console.error("[useReminders] Error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [customerId])

  // Cargar datos iniciales
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Obtener recordatorios de un vehículo específico
  const getVehicleReminders = useCallback(
    (vehicleId: string): MaintenanceReminderAPI[] => {
      return reminders.filter((r) => r.vehicle === vehicleId)
    },
    [reminders]
  )

  // Crear nuevo recordatorio
  const addReminder = useCallback(
    async (
      data: CreateReminderRequest
    ): Promise<MaintenanceReminderAPI | null> => {
      setIsSaving(true)
      try {
        const newReminder = await createReminder(data)
        setReminders((prev) => [...prev, newReminder])
        return newReminder
      } catch (err) {
        console.error("[useReminders] Error creating:", err)
        return null
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  // Actualizar recordatorio existente
  const editReminder = useCallback(
    async (
      reminderId: string,
      data: UpdateReminderRequest
    ): Promise<MaintenanceReminderAPI | null> => {
      setIsSaving(true)
      try {
        const updatedReminder = await updateReminder(reminderId, data)
        setReminders((prev) =>
          prev.map((r) => (r.id === reminderId ? updatedReminder : r))
        )
        return updatedReminder
      } catch (err) {
        console.error("[useReminders] Error updating:", err)
        return null
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  // Eliminar recordatorio
  const removeReminder = useCallback(
    async (reminderId: string): Promise<boolean> => {
      setIsSaving(true)
      try {
        await deleteReminder(reminderId)
        setReminders((prev) => prev.filter((r) => r.id !== reminderId))
        return true
      } catch (err) {
        console.error("[useReminders] Error deleting:", err)
        return false
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  // Marcar como completado
  const markAsComplete = useCallback(
    async (reminderId: string): Promise<MaintenanceReminderAPI | null> => {
      setIsSaving(true)
      try {
        const completedReminder = await completeReminder(reminderId)
        setReminders((prev) =>
          prev.map((r) => (r.id === reminderId ? completedReminder : r))
        )
        return completedReminder
      } catch (err) {
        console.error("[useReminders] Error completing:", err)
        return null
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  return {
    vehicles,
    reminders,
    isLoading,
    isSaving,
    error,
    refresh: fetchData,
    addReminder,
    editReminder,
    removeReminder,
    markAsComplete,
    getVehicleReminders,
  }
}
