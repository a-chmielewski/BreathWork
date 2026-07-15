(function () {
  var OFFLINE_READY_KEY = 'breathwork_offline_ready';
  var INSTALL_HINT_KEY = 'breathwork_install_hint_dismissed';
  var UPDATE_NOTICE_KEY = 'breathwork_show_update_notice';

  var swRegistration = null;
  var offlineReady = false;
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

  function requiredAssetPaths() {
    return ['./index.html', './app.js', './styles.css', './manifest.json'];
  }

  async function verifyOfflineReady() {
    if (!('caches' in window)) return false;
    var names = await caches.keys();
    var cacheName = names.find(function (name) {
      return name.indexOf('breathwork-') === 0;
    });
    if (!cacheName) return false;
    var cache = await caches.open(cacheName);
    var keys = await cache.keys();
    return requiredAssetPaths().every(function (asset) {
      var expectedPath = new URL(asset, window.location.href).pathname;
      return keys.some(function (req) {
        return new URL(req.url).pathname === expectedPath;
      });
    });
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

  function markOfflineReady(ready) {
    offlineReady = ready;
    try {
      localStorage.setItem(OFFLINE_READY_KEY, ready ? '1' : '0');
    } catch (_) {}
    refreshStatus();
  }

  async function evaluateOfflineReady() {
    if (!swRegistration) {
      markOfflineReady(false);
      return;
    }
    for (var attempt = 0; attempt < 12; attempt++) {
      if (await verifyOfflineReady()) {
        markOfflineReady(true);
        return;
      }
      await new Promise(function (resolve) {
        window.setTimeout(resolve, 500);
      });
    }
    markOfflineReady(false);
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

  registerUpdateButton();
  registerInstallHint();
  showUpdateNoticeIfNeeded();
  refreshStatus();
  initServiceWorker();
})();
