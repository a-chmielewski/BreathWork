importScripts('./offline-assets.js');

const APP_VERSION = '2.0.0';
const CACHE_NAME = 'breathwork-' + APP_VERSION;
const MEDIA_CACHE_NAME = 'breathwork-media-' + APP_VERSION;

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
      OfflineAssets.SHELL_ASSET_PATHS.map(function (path) {
        return cache.add(scopeUrl(path)).catch(function (err) {
          console.error('[sw] precache failed for', path, err);
          throw err;
        });
      })
    );
  });
}

function cacheOptionalMedia() {
  return caches.open(MEDIA_CACHE_NAME).then(function (cache) {
    return Promise.all(
      OfflineAssets.OPTIONAL_MEDIA_PATHS.map(function (path) {
        return cache.add(scopeUrl(path)).catch(function (err) {
          console.warn('[sw] optional media cache failed for', path, err);
          return false;
        });
      })
    );
  });
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    cacheShell()
      .then(cacheOptionalMedia)
      .catch(function (err) {
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
            if (key !== CACHE_NAME && key !== MEDIA_CACHE_NAME) return caches.delete(key);
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
    return;
  }
  if (event.data && event.data.type === 'CACHE_OPTIONAL_MEDIA') {
    event.waitUntil(
      cacheOptionalMedia().then(function () {
        if (event.source) event.source.postMessage({ type: 'OPTIONAL_MEDIA_CACHE_UPDATED' });
      })
    );
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

function isOptionalMediaRequest(request) {
  var requestUrl = new URL(request.url).href;
  return OfflineAssets.OPTIONAL_MEDIA_PATHS.some(function (path) {
    return scopeUrl(path) === requestUrl;
  });
}

function createRangeResponse(request, response) {
  var rangeHeader = request.headers.get('range');
  if (!rangeHeader || response.status !== 200) return Promise.resolve(response);
  return response.arrayBuffer().then(function (buffer) {
    var totalLength = buffer.byteLength;
    var match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
    var start;
    var end;
    if (!match || (!match[1] && !match[2])) {
      return new Response('', {
        status: 416,
        headers: { 'Content-Range': 'bytes */' + totalLength }
      });
    }
    if (!match[1]) {
      var suffixLength = Number(match[2]);
      if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
        return new Response('', {
          status: 416,
          headers: { 'Content-Range': 'bytes */' + totalLength }
        });
      }
      start = Math.max(0, totalLength - suffixLength);
      end = totalLength - 1;
    } else {
      start = Number(match[1]);
      end = match[2] ? Number(match[2]) : totalLength - 1;
    }
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start < 0 ||
      start >= totalLength ||
      end < start
    ) {
      return new Response('', {
        status: 416,
        headers: { 'Content-Range': 'bytes */' + totalLength }
      });
    }
    end = Math.min(end, totalLength - 1);
    var headers = new Headers(response.headers);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + totalLength);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(buffer.slice(start, end + 1), {
      status: 206,
      statusText: 'Partial Content',
      headers: headers
    });
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

  if (isOptionalMediaRequest(event.request)) {
    event.respondWith(
      caches.open(MEDIA_CACHE_NAME).then(function (cache) {
        return cache.match(event.request.url).then(function (cached) {
          if (cached) return createRangeResponse(event.request, cached);
          return fetch(event.request)
            .then(function (response) {
              if (response && response.status === 200) {
                cache.put(event.request.url, response.clone()).catch(function (err) {
                  console.warn('[sw] runtime media cache failed', err);
                });
              }
              return createRangeResponse(event.request, response);
            })
            .catch(function () {
              return new Response('', { status: 504, statusText: 'Ambient audio unavailable offline' });
            });
        });
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
