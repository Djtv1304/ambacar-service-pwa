"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getCustomer,
  getCustomerVehicles,
  getCustomerReminders,
  updateCustomer,
  type CustomerNotificationsAPI,
  type VehicleNotificationsAPI,
  type MaintenanceReminderAPI,
  type UpdateCustomerRequest,
} from "@/lib/api/customer-notifications"

interface UseCustomerNotificationsReturn {
  customer: CustomerNotificationsAPI | null
  vehicles: VehicleNotificationsAPI[]
  reminders: MaintenanceReminderAPI[]
  overdueReminders: MaintenanceReminderAPI[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateCustomerInfo: (data: UpdateCustomerRequest) => Promise<boolean>
  isUpdating: boolean
}

export function useCustomerNotifications(
  customerId: string | undefined
): UseCustomerNotificationsReturn {
  const [customer, setCustomer] = useState<CustomerNotificationsAPI | null>(null)
  const [vehicles, setVehicles] = useState<VehicleNotificationsAPI[]>([])
  const [reminders, setReminders] = useState<MaintenanceReminderAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!customerId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Cargar datos en paralelo
      const [customerData, vehiclesData, remindersData] = await Promise.all([
        getCustomer(customerId),
        getCustomerVehicles(customerId).catch(() => []),
        getCustomerReminders(customerId).catch(() => []),
      ])

      setCustomer(customerData)
      setVehicles(vehiclesData)
      setReminders(remindersData)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar datos"
      setError(errorMessage)
      console.error("[useCustomerNotifications] Error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [customerId])

  // Cargar datos iniciales
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calcular recordatorios vencidos
  const overdueReminders = reminders.filter((r) => r.status === "overdue")

  // Función para actualizar info del cliente
  const updateCustomerInfo = useCallback(
    async (data: UpdateCustomerRequest): Promise<boolean> => {
      if (!customerId) return false

      setIsUpdating(true)
      try {
        const updatedCustomer = await updateCustomer(customerId, data)
        setCustomer(updatedCustomer)
        return true
      } catch (err) {
        console.error("[useCustomerNotifications] Error updating:", err)
        return false
      } finally {
        setIsUpdating(false)
      }
    },
    [customerId]
  )

  return {
    customer,
    vehicles,
    reminders,
    overdueReminders,
    isLoading,
    error,
    refresh: fetchData,
    updateCustomerInfo,
    isUpdating,
  }
}
