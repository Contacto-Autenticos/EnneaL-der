import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

// sw.js
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || 'Nueva notificación';
    const options = {
      body: data.body || 'Tienes un nuevo mensaje.',
      icon: '/pwa-icons/icon-192x192.png',
      badge: '/pwa-icons/icon-192x192.png',
      data: data.url || '/'
    };
    
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // If so, just focus it
          if (client.url === event.notification.data && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab with the target URL
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data);
        }
      })
    );
  }
});
