// Service Worker para Ambacar PWA
// Enfocado en Web Push Notifications

const SW_VERSION = '1.0.0'

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

  if (!event.data) {
    console.log('[SW] Push event but no data')
    return
  }

  let data
  try {
    data = event.data.json()
  } catch (e) {
    // Si no es JSON, usar como texto plano
    data = {
      title: 'Ambacar',
      body: event.data.text(),
    }
  }

  const options = {
    body: data.body || data.message || 'Nueva notificación',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'ambacar-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      ...data.data,
    },
    actions: data.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Ambacar', options)
  )
})

// Manejar click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked')

  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  // Manejar acciones específicas si existen
  if (event.action) {
    console.log('[SW] Action clicked:', event.action)
    // Aquí se pueden manejar acciones específicas
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Buscar si ya hay una ventana/pestaña abierta
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          // Navegar a la URL específica
          if (urlToOpen !== '/') {
            client.navigate(urlToOpen)
          }
          return
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
