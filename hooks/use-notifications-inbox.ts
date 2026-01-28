"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getStoredNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  type StoredNotification,
} from "@/lib/services/notification-storage"

interface UseNotificationsInboxReturn {
  notifications: StoredNotification[]
  unreadCount: number
  isLoading: boolean
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  refresh: () => void
}

export function useNotificationsInbox(): UseNotificationsInboxReturn {
  const [notifications, setNotifications] = useState<StoredNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load notifications from storage
  const loadNotifications = useCallback(() => {
    const stored = getStoredNotifications()
    setNotifications(stored)
    setIsLoading(false)
  }, [])

  // Initial load
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = (event: CustomEvent<{ notifications: StoredNotification[] }>) => {
      setNotifications(event.detail.notifications)
    }

    window.addEventListener("notifications-updated", handleUpdate as EventListener)

    // Also listen for push notifications received by SW
    const handlePushReceived = (event: CustomEvent<{
      title: string
      body: string
      url?: string
      icon?: string
    }>) => {
      // Refresh to get the latest
      loadNotifications()
    }

    window.addEventListener("push-notification-received", handlePushReceived as EventListener)

    return () => {
      window.removeEventListener("notifications-updated", handleUpdate as EventListener)
      window.removeEventListener("push-notification-received", handlePushReceived as EventListener)
    }
  }, [loadNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll: clearAllNotifications,
    refresh: loadNotifications,
  }
}
