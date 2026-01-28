"use client"

import { useEffect } from "react"
import { addNotification, type StoredNotification } from "@/lib/services/notification-storage"

interface ServiceWorkerMessage {
  type: string
  notification: Omit<StoredNotification, "id" | "timestamp" | "read"> & {
    id: string
    timestamp: number
    read: boolean
  }
}

/**
 * Component that listens for push notifications from the Service Worker
 * and stores them in localStorage for the inbox
 */
export function NotificationListener() {
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent<ServiceWorkerMessage>) => {
      if (event.data?.type === "PUSH_NOTIFICATION_RECEIVED") {
        const { notification } = event.data

        // Store the notification
        addNotification({
          title: notification.title,
          body: notification.body,
          url: notification.url,
          icon: notification.icon,
          data: notification.data,
        })

        // Dispatch event for components listening
        window.dispatchEvent(
          new CustomEvent("push-notification-received", {
            detail: notification,
          })
        )
      }
    }

    // Listen for messages from Service Worker
    navigator.serviceWorker?.addEventListener("message", handleServiceWorkerMessage)

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleServiceWorkerMessage)
    }
  }, [])

  // This component doesn't render anything
  return null
}
