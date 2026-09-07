(function () {
  var OFFLINE_READY_KEY = 'breathwork_offline_ready';
  var INSTALL_HINT_KEY = 'breathwork_install_hint_dismissed';
  var UPDATE_NOTICE_KEY = 'breathwork_show_update_notice';

  var swRegistration = null;
  var offlineReady = false;
  var ambientOfflineReady = false;
  var updateAvailable = false;
  var pendingReload = false;

  function $(id) {
    return document.getElementById(id);
  }

  function t(key, params) {
    if (window.I18n) return window.I18n.t(key, params);
    return key;
  }

  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }

  function setHidden(el, hidden) {
    if (!el) return;
    el.classList.toggle('hidden', hidden);
  }

  async function verifyAssetGroup(cacheName, assetPaths) {
    if (!('caches' in window)) return false;
    var names = await caches.keys();
    if (names.indexOf(cacheName) === -1) return false;
    var cache = await caches.open(cacheName);
    var responses = await Promise.all(
      assetPaths.map(function (asset) {
        return cache.match(new URL(asset, window.location.href).href);
      })
    );
    return responses.every(function (response) {
      return !!response && response.ok;
    });
  }

  function verifyOfflineReady() {
    if (!window.OfflineAssets) return Promise.resolve(false);
    return verifyAssetGroup(
      'breathwork-' + APP_VERSION,
      window.OfflineAssets.SHELL_ASSET_PATHS
    );
  }

  function verifyAmbientOfflineReady() {
    if (!window.OfflineAssets) return Promise.resolve(false);
    return verifyAssetGroup(
      'breathwork-media-' + APP_VERSION,
      window.OfflineAssets.OPTIONAL_MEDIA_PATHS
    );
  }

  function renderStatusText() {
    var el = $('app-status-text');
    if (!el) return;

    var parts = [];
    parts.push('v' + APP_VERSION);

    if (isStandalone()) {
      parts.push(t('pwa.installed'));
    }

    if (!navigator.onLine) {
      parts.push(t('pwa.offlineNow'));
    }

    if (offlineReady) {
      parts.push(t('pwa.readyOffline'));
    } else if ('serviceWorker' in navigator) {
      parts.push(t('pwa.preparingOffline'));
    }

    if (ambientOfflineReady) {
      parts.push(t('pwa.ambientReadyOffline'));
    }

    if (updateAvailable) {
      parts.push(t('pwa.updateAvailable'));
    }

    el.textContent = parts.join(' · ');
  }

  function showUpdateNoticeIfNeeded() {
    if (sessionStorage.getItem(UPDATE_NOTICE_KEY) !== '1') return;
    sessionStorage.removeItem(UPDATE_NOTICE_KEY);
    var notice = $('update-notice');
    if (!notice) return;
    notice.textContent = t('update.notice', { version: APP_VERSION });
    setHidden(notice, false);
    window.setTimeout(function () {
      setHidden(notice, true);
    }, 5000);
  }

  function showInstallHintIfRelevant() {
    var hint = $('install-hint');
    if (!hint) return;
    if (isStandalone() || !isIOS()) {
      setHidden(hint, true);
      return;
    }
    if (localStorage.getItem(INSTALL_HINT_KEY) === '1') {
      setHidden(hint, true);
      return;
    }
    if (!offlineReady) {
      setHidden(hint, true);
      return;
    }
    setHidden(hint, false);
  }

  function refreshStatus() {
    renderStatusText();
    showInstallHintIfRelevant();
  }

  function notifyOfflineStatus() {
    window.dispatchEvent(
      new CustomEvent('breathwork:offline-status', {
        detail: {
          shellReady: offlineReady,
          ambientReady: ambientOfflineReady
        }
      })
    );
  }

  function markOfflineReady(ready, ambientReady) {
    offlineReady = ready;
    ambientOfflineReady = ambientReady;
    try {
      localStorage.setItem(OFFLINE_READY_KEY, ready ? '1' : '0');
    } catch (_) {}
    refreshStatus();
    notifyOfflineStatus();
  }

  async function evaluateOfflineReady() {
    if (!swRegistration) {
      markOfflineReady(false, false);
      return;
    }
    for (var attempt = 0; attempt < 12; attempt++) {
      var readiness = await Promise.all([verifyOfflineReady(), verifyAmbientOfflineReady()]);
      if (readiness[0] && readiness[1]) {
        markOfflineReady(true, true);
        return;
      }
      markOfflineReady(readiness[0], readiness[1]);
      await new Promise(function (resolve) {
        window.setTimeout(resolve, 500);
      });
    }
    markOfflineReady(await verifyOfflineReady(), await verifyAmbientOfflineReady());
  }

  function syncUpdateBannerLayout() {
    var banner = $('update-banner');
    var visible = banner && !banner.classList.contains('hidden');
    document.body.classList.toggle('has-update-banner', visible);
    if (!visible || !banner) {
      document.documentElement.style.removeProperty('--update-banner-offset');
      if (banner) banner.setAttribute('aria-hidden', 'true');
      return;
    }
    document.documentElement.style.setProperty(
      '--update-banner-offset',
      banner.offsetHeight + 'px'
    );
    banner.setAttribute('aria-hidden', 'false');
  }

  function showUpdateBanner() {
    updateAvailable = true;
    setHidden($('update-banner'), false);
    window.requestAnimationFrame(syncUpdateBannerLayout);
    refreshStatus();
  }

  function watchWaitingWorker(worker) {
    if (!worker) return;
    worker.addEventListener('statechange', function () {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        showUpdateBanner();
      }
    });
  }

  function registerUpdateButton() {
    var updateBtn = $('update-reload');
    if (!updateBtn) return;
    updateBtn.addEventListener('click', function () {
      if (!swRegistration || !swRegistration.waiting || pendingReload) return;
      pendingReload = true;
      updateBtn.disabled = true;

      navigator.serviceWorker.addEventListener('controllerchange', function onControllerChange() {
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
        try {
          sessionStorage.setItem(UPDATE_NOTICE_KEY, '1');
        } catch (_) {}
        window.location.reload();
      });

      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    });
  }

  function registerInstallHint() {
    var dismiss = $('install-hint-dismiss');
    if (!dismiss) return;
    dismiss.addEventListener('click', function () {
      try {
        localStorage.setItem(INSTALL_HINT_KEY, '1');
      } catch (_) {}
      setHidden($('install-hint'), true);
    });
  }

  async function initServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      refreshStatus();
      return;
    }

    try {
      swRegistration = await navigator.serviceWorker.register('sw.js');
      if (swRegistration.waiting && navigator.serviceWorker.controller) {
        showUpdateBanner();
      }
      watchWaitingWorker(swRegistration.installing);
      swRegistration.addEventListener('updatefound', function () {
        watchWaitingWorker(swRegistration.installing);
      });
      await navigator.serviceWorker.ready;
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CACHE_OPTIONAL_MEDIA' });
      }
      await evaluateOfflineReady();
    } catch (err) {
      if (window.AppLog) AppLog.error('pwa', 'Service worker registration failed', err.message);
      else console.error('[pwa] service worker registration failed', err);
      var status = $('app-status-text');
      if (status) {
        status.textContent = 'v' + APP_VERSION + ' · ' + t('pwa.offlineSetupFailed');
      }
    }
  }

  window.refreshPwaStatus = refreshStatus;
  window.getBreathworkOfflineStatus = function () {
    return {
      shellReady: offlineReady,
      ambientReady: ambientOfflineReady
    };
  };
  window.refreshBreathworkOfflineReadiness = async function () {
    var readiness = await Promise.all([verifyOfflineReady(), verifyAmbientOfflineReady()]);
    markOfflineReady(readiness[0], readiness[1]);
    return {
      shellReady: offlineReady,
      ambientReady: ambientOfflineReady
    };
  };

  if (window.I18n) {
    window.I18n.onChange(function () {
      if (window.I18n.applyHtml) window.I18n.applyHtml(document);
      refreshStatus();
    });
  }

  window.addEventListener('online', refreshStatus);
  window.addEventListener('offline', refreshStatus);
  window.addEventListener('resize', syncUpdateBannerLayout);
  window.addEventListener('orientationchange', function () {
    window.requestAnimationFrame(syncUpdateBannerLayout);
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function (event) {
      if (event.data && event.data.type === 'OPTIONAL_MEDIA_CACHE_UPDATED') {
        evaluateOfflineReady();
      }
    });
  }

  registerUpdateButton();
  registerInstallHint();
  showUpdateNoticeIfNeeded();
  refreshStatus();
  initServiceWorker();
})();
