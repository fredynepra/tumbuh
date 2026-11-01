// Service Worker untuk Notifikasi Web Tumbuh V2
// Mendukung background push & browser notification di Google Chrome, Safari (macOS & iOS 16.4+), Edge, Firefox

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Tangani klik pada notifikasi browser
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const habitId = event.notification.data?.habitId;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Jika tab Tumbuh sudah terbuka, fokuskan tab tersebut
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (habitId) {
            client.postMessage({ type: 'FOCUS_HABIT', habitId });
          }
          return;
        }
      }
      // Jika belum ada tab yang terbuka, buka aplikasi
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
