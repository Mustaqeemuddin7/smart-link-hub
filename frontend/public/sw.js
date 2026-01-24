// Smart Link Hub - Service Worker for Offline Support
const CACHE_NAME = 'smart-link-hub-v1';
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/login',
    '/register',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip API requests - don't cache dynamic data
    if (url.pathname.startsWith('/api/')) return;

    // For navigation requests (HTML pages)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(request).then((cached) => {
                        if (cached) return cached;
                        // If not in cache, show offline page
                        return caches.match('/offline');
                    });
                })
        );
        return;
    }

    // For other requests (CSS, JS, images)
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;

            return fetch(request).then((response) => {
                // Don't cache if not a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone and cache the response
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseToCache);
                });

                return response;
            }).catch(() => {
                // Return offline page for HTML requests if everything fails
                if (request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/offline');
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
