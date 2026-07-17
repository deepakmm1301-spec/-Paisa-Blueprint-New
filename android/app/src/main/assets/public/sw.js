/**
 * Self-uninstalling Service Worker to resolve blank pages, asset caching,
 * and service worker stuck issues for returning users.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Unregister this active service worker
      return self.registration.unregister();
    }).then(() => {
      console.log('[Service Worker] Successfully cleaned up caches and self-unregistered.');
    })
  );
});

// Immediately bypass and let network handle all requests
self.addEventListener('fetch', (event) => {
  // Let browser fetch normally
  return;
});
