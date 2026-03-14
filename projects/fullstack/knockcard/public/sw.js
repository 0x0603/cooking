const CACHE_NAME = 'knockcard-v1'

const PRECACHE_URLS = ['/', '/login', '/offline']

// Install — precache shell
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)))
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  )
  self.clients.claim()
})

// Fetch — network first, fallback to cache
self.addEventListener('fetch', event => {
  const { request } = event

  // Skip non-GET and API/auth requests
  if (request.method !== 'GET') {
    return
  }
  if (request.url.includes('/api/')) {
    return
  }
  if (request.url.includes('/auth/')) {
    return
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful page responses
        if (response.ok && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        // Offline — try cache
        return caches.match(request).then(cached => {
          if (cached) {
            return cached
          }
          // Fallback offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline')
          }
          return new Response('Offline', { status: 503 })
        })
      })
  )
})
