/**
 * Follow-E | Expense Tracker
 * Service Worker
 * Version: 1.0.0
 */

const CACHE_NAME = 'follow-e-v1.0.0';
const STATIC_CACHE = 'follow-e-static-v1.0.0';
const DYNAMIC_CACHE = 'follow-e-dynamic-v1.0.0';

// Files to cache
const STATIC_FILES = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon.svg',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// External resources to cache
const EXTERNAL_FILES = [
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

// ============================================
// INSTALL EVENT
// ============================================

self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[SW] Static files cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Cache failed:', error);
            })
    );
});

// ============================================
// ACTIVATE EVENT
// ============================================

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name.startsWith('follow-e-') && 
                                   name !== STATIC_CACHE && 
                                   name !== DYNAMIC_CACHE;
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activated');
                return self.clients.claim();
            })
    );
});

// ============================================
// FETCH EVENT
// ============================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Handle different types of requests
    if (isStaticFile(url)) {
        // Cache-first for static files
        event.respondWith(cacheFirst(request));
    } else if (isExternalResource(url)) {
        // Stale-while-revalidate for external resources
        event.respondWith(staleWhileRevalidate(request));
    } else {
        // Network-first for everything else
        event.respondWith(networkFirst(request));
    }
});

// ============================================
// CACHING STRATEGIES
// ============================================

// Cache-first: Return cached version, fall back to network
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache-first failed:', error);
        return caches.match('/index.html');
    }
}

// Network-first: Try network, fall back to cache
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        
        throw error;
    }
}

// Stale-while-revalidate: Return cached, update in background
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                caches.open(DYNAMIC_CACHE)
                    .then((cache) => cache.put(request, networkResponse.clone()));
            }
            return networkResponse;
        })
        .catch(() => cachedResponse);
    
    return cachedResponse || fetchPromise;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isStaticFile(url) {
    const staticExtensions = ['.html', '.css', '.js', '.json', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2'];
    return url.origin === self.location.origin && 
           staticExtensions.some(ext => url.pathname.endsWith(ext));
}

function isExternalResource(url) {
    return url.origin !== self.location.origin;
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

self.addEventListener('push', (event) => {
    console.log('[SW] Push received');
    
    let data = {
        title: 'Follow-E',
        body: 'Ödeme hatırlatması',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png'
    };
    
    try {
        if (event.data) {
            data = { ...data, ...event.data.json() };
        }
    } catch (e) {
        console.error('[SW] Push data parse error:', e);
    }
    
    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200],
        tag: data.tag || 'follow-e-notification',
        renotify: true,
        requireInteraction: data.requireInteraction || false,
        data: data.data || {},
        actions: [
            { action: 'open', title: 'Aç' },
            { action: 'dismiss', title: 'Kapat' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ============================================
// NOTIFICATION CLICK
// ============================================

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'dismiss') {
        return;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// ============================================
// NOTIFICATION CLOSE
// ============================================

self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification closed');
});

// ============================================
// BACKGROUND SYNC
// ============================================

self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-expenses') {
        event.waitUntil(syncExpenses());
    }
});

async function syncExpenses() {
    // Future: Sync expenses with server
    console.log('[SW] Syncing expenses...');
}

// ============================================
// PERIODIC SYNC
// ============================================

self.addEventListener('periodicsync', (event) => {
    console.log('[SW] Periodic sync:', event.tag);
    
    if (event.tag === 'check-expenses') {
        event.waitUntil(checkUpcomingExpenses());
    }
});

async function checkUpcomingExpenses() {
    // Future: Check and notify about upcoming expenses
    console.log('[SW] Checking upcoming expenses...');
}

// ============================================
// MESSAGE HANDLING
// ============================================

self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
        });
    }
    
    if (event.data.type === 'SCHEDULE_NOTIFICATION') {
        // Handle notification scheduling from main app
        const { expense, delay } = event.data;
        setTimeout(() => {
            self.registration.showNotification(expense.title, {
                body: `₺${expense.amount} ödeme zamanı!`,
                icon: '/icons/icon-192.png',
                tag: expense.id
            });
        }, delay);
    }
});

console.log('[SW] Service Worker loaded');
