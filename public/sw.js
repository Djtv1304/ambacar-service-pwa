// Service Worker para Ambacar PWA
// Enfocado en Web Push Notifications

const SW_VERSION = '1.2.0'

// Storage key for notifications
const NOTIFICATIONS_STORAGE_KEY = 'ambacar_notifications'
const MAX_NOTIFICATIONS = 50

// Default notification config
const DEFAULT_NOTIFICATION = {
  title: 'Ambacar',
  body: 'Tienes una nueva notificación',
  icon: '/icon-192.png',
  badge: '/icon-192.png',
  defaultUrl: '/dashboard/notificaciones'
}

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker version:', SW_VERSION)
  // Activar inmediatamente sin esperar a que se cierren otras pestañas
  self.skipWaiting()
})

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated')
  // Tomar control de todas las páginas inmediatamente
  event.waitUntil(self.clients.claim())
})

// Manejar Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')

  let data = { ...DEFAULT_NOTIFICATION }

  if (event.data) {
    try {
      const pushData = event.data.json()
      data = { ...data, ...pushData }
    } catch (e) {
      // Si no es JSON, usar como texto plano
      data.body = event.data.text()
    }
  }

  const notificationData = {
    url: data.url || DEFAULT_NOTIFICATION.defaultUrl,
    timestamp: Date.now(),
    notificationId: data.id || null,
    ...data.data,
  }

  const options = {
    body: data.body || DEFAULT_NOTIFICATION.body,
    icon: data.icon || DEFAULT_NOTIFICATION.icon,
    badge: data.badge || DEFAULT_NOTIFICATION.badge,
    vibrate: data.vibrate || [100, 50, 100],
    tag: data.tag || 'ambacar-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    data: notificationData,
    actions: data.actions || [],
  }

  // Store notification for inbox display
  const notificationToStore = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: data.title || DEFAULT_NOTIFICATION.title,
    body: data.body || DEFAULT_NOTIFICATION.body,
    url: notificationData.url,
    timestamp: notificationData.timestamp,
    read: false,
    icon: data.icon || DEFAULT_NOTIFICATION.icon,
    data: data.data || {},
  }

  event.waitUntil(
    Promise.all([
      // Show the notification
      self.registration.showNotification(data.title || DEFAULT_NOTIFICATION.title, options),
      // Send to all clients to store in localStorage
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: 'PUSH_NOTIFICATION_RECEIVED',
            notification: notificationToStore,
          })
        })
      }),
    ])
  )
})

// Manejar click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag)

  event.notification.close()

  const urlToOpen = event.notification.data?.url || DEFAULT_NOTIFICATION.defaultUrl

  // Manejar acciones específicas si existen
  if (event.action) {
    console.log('[SW] Action clicked:', event.action)
    // Aquí se pueden manejar acciones específicas basadas en el action ID
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Buscar si ya hay una ventana/pestaña abierta de nuestra app
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navegar a la URL específica y luego enfocar
          return client.navigate(urlToOpen).then(() => client.focus())
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Manejar cierre de notificación (sin click)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed without interaction')
})

// Evento fetch - por ahora solo pasar las requests
// En el futuro aquí se implementará el caching offline
self.addEventListener('fetch', (event) => {
  // Por ahora, no interceptamos requests
  // Esto permite que la app funcione normalmente
  // mientras tenemos el SW registrado para push notifications
})
