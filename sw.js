const CACHE_NAME = 'hamuketsu-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './ketsupoyo.png',
  './assets/ham_01.png',
  './assets/ham_02.png',
  './assets/ham_03.png',
  './assets/ham_04.png',
  './assets/ham_05.png',
  './assets/ham_06.png',
  './assets/ham_07.png',
  './assets/ham_08.png',
  './assets/ham_09.png',
  './assets/ham_10.png',
  './assets/ham_11.png',
  './assets/ham_12.png',
  './assets/ham_13.png',
  './assets/ham_14.png',
  './assets/ham_15.png',
  './assets/ham_16.png',
  './assets/ham_17.png',
  './assets/ham_18.png',
  './assets/ham_19.png',
  './assets/ham_20.png',
  './assets/ham_21.png',
  './assets/ham_22.png',
  './assets/ham_23.png',
  './assets/ham_24.png',
];

// Install: pre-cache all required assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Optionally cache new GET responses
        if (event.request.method === 'GET' && response && response.status === 200 && response.type === 'basic') {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
        }
        return response;
      }).catch(() => cached); // fallback to cache if network fails
    })
  );
});
