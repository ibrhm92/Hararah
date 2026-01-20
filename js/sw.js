// Service Worker for PWA functionality - Service Worker لتطبيق الويب التقدمي
const CACHE_NAME = 'village-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/admin.html',
    '/craftsmen.html',
    '/machines.html',
    '/shops.html',
    '/offers.html',
    '/ads.html',
    '/news.html',
    '/emergency.html',
    '/add-service.html',
    '/manifest.json',
    '/styles.css',
    '/script-firebase-fixed.js',
    '/api-config-firebase.js',
    '/icon.jpeg',
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Service Worker - تثبيت Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate Service Worker - تفعيل Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event - معالجة طلبات الجلب
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network - إرجاع النسخة المخزنة أو جلب من الشبكة
                if (response) {
                    return response;
                }

                return fetch(event.request).then(networkResponse => {
                    // Cache successful responses for pages and scripts to make them independent
                    if (networkResponse.ok &&
                        (event.request.url.includes('.html') ||
                         event.request.url.includes('.js') ||
                         event.request.url.includes('.css'))) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // Fallback for offline - if it's a page request, return cached index.html
                    if (event.request.url.includes('.html')) {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});
