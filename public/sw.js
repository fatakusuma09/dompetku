const CACHE_NAME = 'dompetku-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192.svg',
  '/pwa-512.svg',
  '/apple-touch-icon.svg'
]

// Install: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch: Stale-while-revalidate for assets, Network-first for dynamic navigation
self.addEventListener('fetch', (event) => {
  const req = event.request

  // Only handle GET requests
  if (req.method !== 'GET') return

  // Do not intercept external API requests like Supabase
  if (req.url.includes('supabase.co')) return

  event.respondWith(
    caches.match(req).then((cached) => {
      const networked = fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            const cacheCopy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(req, cacheCopy))
          }
          return response
        })
        .catch(() => {
          // If offline and requesting navigation, return index.html
          if (req.mode === 'navigate') {
            return caches.match('/index.html')
          }
          return cached
        })

      return cached || networked
    })
  )
})
