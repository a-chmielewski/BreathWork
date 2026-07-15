const APP_VERSION = '1.6.1';
const CACHE_NAME = 'breathwork-' + APP_VERSION;

const ASSET_PATHS = [
  './index.html',
  './sw.js',
  './styles.css',
  './logger.js',
  './storage.js',
  './i18n.js',
  './locales/en.js',
  './locales/pl.js',
  './app.js',
  './navigation.js',
  './pwa.js',
  './version.js',
  './techniques.js',
  './safety.js',
  './session-engine.js',
  './audio-cues.js',
  './manifest.json',
  './icon.svg',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './favicon-32.png'
];

function scopeUrl(relativePath) {
  return new URL(relativePath, self.location).href;
}

function getScopePrefix() {
  return new URL('./', self.location).pathname;
}

function isScopeNavigation(request) {
  if (request.mode !== 'navigate') return false;
  var url = new URL(request.url);
  var scopePrefix = getScopePrefix();
  if (url.origin !== self.location.origin) return false;
  if (scopePrefix === '/') {
    return url.pathname === '/' || url.pathname === '';
  }
  return url.pathname === scopePrefix || url.pathname === scopePrefix.replace(/\/$/, '') || url.pathname.indexOf(scopePrefix) === 0;
}

function cacheShell() {
  return caches.open(CACHE_NAME).then(function (cache) {
    return Promise.all(
      ASSET_PATHS.map(function (path) {
        return cache.add(scopeUrl(path)).catch(function (err) {
          console.error('[sw] precache failed for', path, err);
          throw err;
        });
      })
    );
  });
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    cacheShell().catch(function (err) {
      console.error('[sw] install aborted — keeping previous worker', err);
      throw err;
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (key !== CACHE_NAME) return caches.delete(key);
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function offlineShellResponse() {
  return caches.match(scopeUrl('./index.html')).then(function (cached) {
    return (
      cached ||
      new Response('Offline — open Breathwork while online first.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      })
    );
  });
}

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  if (isScopeNavigation(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          if (response && response.ok) return response;
          return offlineShellResponse();
        })
        .catch(function () {
          return offlineShellResponse();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).catch(function () {
        if (event.request.mode === 'navigate') {
          return offlineShellResponse();
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});
