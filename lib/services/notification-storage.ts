/**
 * Notification Storage Service
 * Manages storing and retrieving push notifications in localStorage
 */

const STORAGE_KEY = "ambacar_notifications"
const MAX_NOTIFICATIONS = 50 // Keep last 50 notifications

export interface StoredNotification {
  id: string
  title: string
  body: string
  url?: string
  timestamp: number
  read: boolean
  icon?: string
  data?: Record<string, unknown>
}

/**
 * Get all stored notifications
 */
export function getStoredNotifications(): StoredNotification[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const notifications = JSON.parse(stored) as StoredNotification[]
    // Sort by timestamp descending (newest first)
    return notifications.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error("[NotificationStorage] Error reading:", error)
    return []
  }
}

/**
 * Add a new notification to storage
 */
export function addNotification(notification: Omit<StoredNotification, "id" | "timestamp" | "read">): StoredNotification {
  const newNotification: StoredNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    read: false,
  }

  try {
    const notifications = getStoredNotifications()

    // Add to beginning
    notifications.unshift(newNotification)

    // Keep only the most recent MAX_NOTIFICATIONS
    const trimmed = notifications.slice(0, MAX_NOTIFICATIONS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))

    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent("notifications-updated", {
      detail: { notifications: trimmed }
    }))

    return newNotification
  } catch (error) {
    console.error("[NotificationStorage] Error adding:", error)
    return newNotification
  }
}

/**
 * Mark a notification as read
 */
export function markAsRead(notificationId: string): void {
  try {
    const notifications = getStoredNotifications()
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    )

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

    window.dispatchEvent(new CustomEvent("notifications-updated", {
      detail: { notifications: updated }
    }))
  } catch (error) {
    console.error("[NotificationStorage] Error marking as read:", error)
  }
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): void {
  try {
    const notifications = getStoredNotifications()
    const updated = notifications.map((n) => ({ ...n, read: true }))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

    window.dispatchEvent(new CustomEvent("notifications-updated", {
      detail: { notifications: updated }
    }))
  } catch (error) {
    console.error("[NotificationStorage] Error marking all as read:", error)
  }
}

/**
 * Delete a notification
 */
export function deleteNotification(notificationId: string): void {
  try {
    const notifications = getStoredNotifications()
    const updated = notifications.filter((n) => n.id !== notificationId)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

    window.dispatchEvent(new CustomEvent("notifications-updated", {
      detail: { notifications: updated }
    }))
  } catch (error) {
    console.error("[NotificationStorage] Error deleting:", error)
  }
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))

    window.dispatchEvent(new CustomEvent("notifications-updated", {
      detail: { notifications: [] }
    }))
  } catch (error) {
    console.error("[NotificationStorage] Error clearing:", error)
  }
}

/**
 * Get unread count
 */
export function getUnreadCount(): number {
  const notifications = getStoredNotifications()
  return notifications.filter((n) => !n.read).length
}
