// Service Worker for Amravati Wears Market
// Provides offline support and aggressive caching for better performance

const CACHE_VERSION = 'awm-v1.0.0';
const CACHE_NAME = `awm-cache-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/logo192.png',
    '/logo512.png',
];

// Cache strategies
const CACHE_STRATEGIES = {
    // Cache first, fallback to network (for static assets)
    CACHE_FIRST: 'cache-first',
    // Network first, fallback to cache (for dynamic content)
    NETWORK_FIRST: 'network-first',
    // Network only (for authentication, checkout, etc.)
    NETWORK_ONLY: 'network-only',
};

// Determine cache strategy based on request
function getCacheStrategy(url) {
    // Static assets - cache first
    if (
        url.pathname.match(/\.(js|css|woff2|woff|ttf|jpg|jpeg|png|webp|svg|ico)$/)
    ) {
        return CACHE_STRATEGIES.CACHE_FIRST;
    }

    // API calls - network first
    if (url.pathname.startsWith('/api/') || url.hostname !== location.hostname) {
        return CACHE_STRATEGIES.NETWORK_FIRST;
    }

    // Authentication and checkout - network only
    if (
        url.pathname.includes('/auth') ||
        url.pathname.includes('/checkout') ||
        url.pathname.includes('/payment')
    ) {
        return CACHE_STRATEGIES.NETWORK_ONLY;
    }

    // Default - network first
    return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Install event - precache critical assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');

    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Precaching app shell');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => {
                console.log('[ServiceWorker] Skip waiting on install');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');

    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[ServiceWorker] Removing old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[ServiceWorker] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin && !url.pathname.startsWith('/api/')) {
        return;
    }

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    const strategy = getCacheStrategy(url);

    switch (strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            event.respondWith(cacheFirst(request));
            break;

        case CACHE_STRATEGIES.NETWORK_FIRST:
            event.respondWith(networkFirst(request));
            break;

        case CACHE_STRATEGIES.NETWORK_ONLY:
            // Don't cache, just fetch
            break;

        default:
            event.respondWith(networkFirst(request));
    }
});

// Cache First Strategy
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        console.log('[ServiceWorker] Cache hit:', request.url);
        return cached;
    }

    try {
        const response = await fetch(request);

        // Cache valid responses
        if (response.status === 200) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.error('[ServiceWorker] Fetch failed:', error);

        // Return offline page or fallback
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain',
            }),
        });
    }
}

// Network First Strategy
async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);

    try {
        const response = await fetch(request);

        // Cache valid responses
        if (response.status === 200) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[ServiceWorker] Network failed, trying cache:', request.url);
        const cached = await cache.match(request);

        if (cached) {
            return cached;
        }

        // No cache available
        return new Response('Offline - No cached version available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain',
            }),
        });
    }
}

// Handle messages from the client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    }
});

console.log('[ServiceWorker] Loaded');
