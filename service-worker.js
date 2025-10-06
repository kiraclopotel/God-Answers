// God Answers - Service Worker
// Provides offline support and caching

const CACHE_NAME = 'god-answers-v1';
const API_CACHE = 'god-answers-api-v1';

// Files to cache for offline use
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json'
];

// Install service worker and cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy: Network first, fall back to cache
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    // For API requests, try network first, cache as backup
    if (isAPIRequest(event.request.url)) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the successful API response
            caches.open(API_CACHE).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return response;
          })
          .catch(() => {
            // If network fails, try cache
            return caches.match(event.request);
          })
      );
      return;
    }
    
    // For other cross-origin requests, just fetch
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Helper function to identify API requests
function isAPIRequest(url) {
  const apiDomains = [
    'bible-api.com',
    'api.alquran.cloud',
    'sefaria.org',
    'bhagavadgita.io'
  ];
  
  return apiDomains.some(domain => url.includes(domain));
}

// Handle background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

async function syncFavorites() {
  // Placeholder for syncing favorites when back online
  console.log('Syncing favorites...');
}

// Handle push notifications (for future daily wisdom feature)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'You have a new divine message',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Read Now',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Later',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('God Answers', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
