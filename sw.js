/**
 * Service Worker for Dhanesh Portfolio
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'dhanesh-portfolio-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const CACHE_FILES = [
  '/',
  '/index.html',
  '/about.html',
  '/projects.html',
  '/experience.html',
  '/contact.html',
  '/css/main.css',
  '/css/responsive.css',
  '/css/components.css',
  '/css/animations.css',
  '/js/main.js',
  '/js/utils.js',
  '/assets/images/dhanesh_profile.jpg',
  '/assets/files/Dhanesh_BB_Resume.pdf',
  '/assets/images/favicon.ico',
  // External CDN resources
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install Event');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('Service Worker: All files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate Event');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('Service Worker: Clearing Old Cache');
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(request).then((response) => {
      // Return cached version if available
      if (response) {
        console.log('Service Worker: Serving from cache', request.url);
        return response;
      }

      // Otherwise fetch from network
      return fetch(request)
        .then((response) => {
          // Check if response is valid
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          // Clone response (can only be consumed once)
          const responseToCache = response.clone();

          // Add to cache for future requests
          caches.open(CACHE_NAME).then((cache) => {
            // Only cache same-origin requests
            if (request.url.startsWith(self.location.origin)) {
              cache.put(request, responseToCache);
            }
          });

          return response;
        })
        .catch(() => {
          // If network fails and it's a navigation request, show offline page
          if (request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }

          // For other requests, return a minimal response
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    })
  );
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.ports[0].postMessage({
        type: 'VERSION',
        version: CACHE_NAME,
      });
      break;

    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.addAll(event.data.urls);
        })
      );
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.delete(CACHE_NAME).then(() => {
          event.ports[0].postMessage({
            type: 'CACHE_CLEARED',
          });
        })
      );
      break;
  }
});

// Push notification event (for future use)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Event');

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/assets/images/icon-192x192.png',
      badge: '/assets/images/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      },
      actions: [
        {
          action: 'explore',
          title: 'View Portfolio',
          icon: '/assets/images/action-explore.png',
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/assets/images/action-close.png',
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification Click Event');

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

// Background sync event (for future use)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background Sync Event');

  if (event.tag === 'contact-form-sync') {
    event.waitUntil(
      // Handle offline form submissions
      syncContactForm()
    );
  }
});

// Periodic background sync (for future use)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic Sync Event');

  if (event.tag === 'portfolio-update') {
    event.waitUntil(
      // Check for portfolio updates
      checkForUpdates()
    );
  }
});

// Helper functions
async function syncContactForm() {
  try {
    // Get stored form data from IndexedDB
    const formData = await getStoredFormData();

    if (formData) {
      // Try to submit the form
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Clear stored data on successful submission
        await clearStoredFormData();

        // Show success notification
        await self.registration.showNotification('Form Submitted', {
          body: 'Your contact form has been submitted successfully!',
          icon: '/assets/images/icon-192x192.png',
        });
      }
    }
  } catch (error) {
    console.error('Service Worker: Contact form sync failed', error);
  }
}

async function checkForUpdates() {
  try {
    // Check if there are any updates to the portfolio
    const response = await fetch('/api/check-updates');
    const data = await response.json();

    if (data.hasUpdate) {
      // Show update notification
      await self.registration.showNotification('Portfolio Updated', {
        body: 'New content is available! Refresh to see the latest updates.',
        icon: '/assets/images/icon-192x192.png',
        data: { url: '/' },
        actions: [
          {
            action: 'refresh',
            title: 'Refresh Now',
          },
        ],
      });
    }
  } catch (error) {
    console.error('Service Worker: Update check failed', error);
  }
}

// IndexedDB helpers (for offline form storage)
async function getStoredFormData() {
  // Implementation would use IndexedDB to retrieve stored form data
  return null;
}

async function clearStoredFormData() {
  // Implementation would clear stored form data from IndexedDB
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled Promise Rejection', event.reason);
});

// Debug logging
const debug = {
  log: (...args) => {
    if (
      self.location.hostname === 'localhost' ||
      self.location.hostname === '127.0.0.1'
    ) {
      console.log('[SW Debug]', ...args);
    }
  },

  error: (...args) => {
    console.error('[SW Error]', ...args);
  },
};

// Cache management utilities
const cacheUtils = {
  async cleanOldCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
      cacheNames
        .filter((cacheName) => cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName))
    );
  },

  async getCacheSize() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    let totalSize = 0;

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }

    return totalSize;
  },

  async limitCacheSize(maxSizeInBytes) {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();

    let currentSize = await this.getCacheSize();

    for (const request of requests) {
      if (currentSize <= maxSizeInBytes) break;

      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        await cache.delete(request);
        currentSize -= blob.size;
      }
    }
  },
};

// Periodic cache cleanup (every 24 hours)
setInterval(
  () => {
    cacheUtils.limitCacheSize(50 * 1024 * 1024); // 50MB limit
  },
  24 * 60 * 60 * 1000
);
