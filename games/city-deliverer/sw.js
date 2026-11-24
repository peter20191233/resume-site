const CACHE_PREFIX = 'city-deliverer-assets-';
const CACHE = `${CACHE_PREFIX}v2`;
const LEGACY_CACHE = 'tramline-assets-v4-author';
const CACHEABLE = /\.(?:js|css|png|svg|woff2?|ttf|webmanifest)$/i;

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys => Promise.all(keys
      .filter(key => key === LEGACY_CACHE || (key.startsWith(CACHE_PREFIX) && key !== CACHE))
      .map(key => caches.delete(key)))),
  ]));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate' || !CACHEABLE.test(url.pathname)) return;

  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(request);
    const network = fetch(request).then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    }).catch(() => cached || Response.error());
    return cached || network;
  }));
});
