// Service Worker for PWA functionality - Service Worker لتطبيق الويب التقدمي
const CACHE_NAME = 'village-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
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
                return response || fetch(event.request);
            })
    );
});
