const CACHE_NAME = 'breathwork-v2';
const ASSETS = ['/', 'index.html', 'styles.css', 'app.js', 'techniques.js', 'manifest.json', 'icon.svg'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS).catch(function () {});
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (key) {
      if (key !== CACHE_NAME) return caches.delete(key);
    }));
  }).then(function () {
    return self.clients.claim();
  }));
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var requestUrl = new URL(event.request.url);
  var isRootNav = event.request.mode === 'navigate' && requestUrl.origin === self.location.origin && (requestUrl.pathname === '/' || requestUrl.pathname === '');
  if (isRootNav) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        return caches.match(new URL('index.html', event.request.url)).then(function (indexCached) {
          return indexCached || fetch(event.request);
        });
      })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
