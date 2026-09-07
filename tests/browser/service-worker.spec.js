const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe.configure({ mode: 'serial' });

const iphone16ProMax = {
  viewport: { width: 440, height: 956 },
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true
};

function hideUpdateBannerInitScript() {
  return function () {
    function hideUpdateBanner() {
      var banner = document.getElementById('update-banner');
      if (banner) banner.classList.add('hidden');
    }
    hideUpdateBanner();
    document.addEventListener('DOMContentLoaded', hideUpdateBanner);
    new MutationObserver(hideUpdateBanner).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  };
}

function readManifest() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'manifest.json'), 'utf8'));
}

test.describe('service worker — root scope', function () {
  test.beforeEach(async function ({ page }) {
    await page.addInitScript(hideUpdateBannerInitScript());
  });

  test('registers a controller and caches shell assets', async function ({ page }) {
    await page.goto('/');
    const swState = await page.evaluate(async function () {
      if (!('serviceWorker' in navigator)) return { supported: false };
      const registration = await navigator.serviceWorker.ready;
      const names = await caches.keys();
      const shellCacheName = names.find(function (name) {
        return name === 'breathwork-' + APP_VERSION;
      });
      const mediaCacheName = names.find(function (name) {
        return name === 'breathwork-media-' + APP_VERSION;
      });
      const shellCache = await caches.open(shellCacheName || '');
      const mediaCache = await caches.open(mediaCacheName || '');
      const keys = (await shellCache.keys()).map(function (req) {
        return new URL(req.url).pathname;
      });
      const mediaKeys = (await mediaCache.keys()).map(function (req) {
        return new URL(req.url).pathname;
      });
      const ambientResponse = await mediaCache.match(
        new URL('./assets/audio/unwind-ambient.m4a', window.location.href).href
      );
      return {
        supported: true,
        scope: registration.scope,
        controller: !!navigator.serviceWorker.controller,
        cacheNames: names,
        cachedPaths: keys,
        cachedMediaPaths: mediaKeys,
        ambientContentType: ambientResponse ? ambientResponse.headers.get('content-type') : null
      };
    });

    expect(swState.supported).toBe(true);
    expect(swState.controller).toBe(true);
    expect(swState.cacheNames[0]).toContain('breathwork-');
    expect(swState.cachedPaths).toEqual(
      expect.arrayContaining([
        '/index.html',
        '/session-engine.js',
        '/guided-sessions.js',
        '/guided-session-engine.js',
        '/session-media.js',
        '/offline-assets.js',
        '/pwa.js'
      ])
    );
    expect(swState.cachedMediaPaths).toContain('/assets/audio/unwind-ambient.m4a');
    expect(swState.ambientContentType).toContain('audio/mp4');
  });

  test('shows offline-ready status after cache warms', async function ({ page }) {
    await page.goto('/');
    await page.waitForFunction(function () {
      return navigator.serviceWorker && navigator.serviceWorker.controller;
    });
    await expect(page.locator('#app-status-text')).toContainText('Ready offline', { timeout: 15000 });
    await expect(page.locator('#app-status-text')).toContainText('Ambient ready offline', {
      timeout: 15000
    });
  });

  test('serves cached ambient media byte ranges for WebKit playback', async function ({ page }) {
    await page.goto('/');
    await page.waitForFunction(function () {
      return navigator.serviceWorker && navigator.serviceWorker.controller;
    });
    const rangeResponse = await page.evaluate(async function () {
      const response = await fetch('./assets/audio/unwind-ambient.m4a', {
        headers: { Range: 'bytes=100-199' }
      });
      return {
        status: response.status,
        contentRange: response.headers.get('content-range'),
        acceptRanges: response.headers.get('accept-ranges'),
        length: (await response.arrayBuffer()).byteLength
      };
    });
    expect(rangeResponse.status).toBe(206);
    expect(rangeResponse.contentRange).toMatch(/^bytes 100-199\/\d+$/);
    expect(rangeResponse.acceptRanges).toBe('bytes');
    expect(rangeResponse.length).toBe(100);
  });

  test('keeps the shell usable and reports silence when the media cache is missing', async function ({
    page,
    context
  }) {
    await page.goto('/');
    await page.waitForFunction(function () {
      return (
        window.getBreathworkOfflineStatus &&
        window.getBreathworkOfflineStatus().ambientReady === true
      );
    });
    await context.setOffline(true);
    const readiness = await page.evaluate(async function () {
      const cache = await caches.open('breathwork-media-' + APP_VERSION);
      await cache.delete(new URL('./assets/audio/unwind-ambient.m4a', window.location.href).href);
      return window.refreshBreathworkOfflineReadiness();
    });
    expect(readiness).toEqual({ shellReady: true, ambientReady: false });
    if (await page.locator('#onboarding-modal').isVisible()) {
      await page.locator('#onboarding-dismiss').click();
    }
    await page.getByRole('button', { name: /Unwind with sound/ }).click();
    await expect(page.locator('#guided-audio-status')).toContainText(
      'Ambient sound is not available offline'
    );
    await context.setOffline(false);
  });

  test('manifest uses scope-relative install paths', function () {
    const manifest = readManifest();
    expect(manifest.start_url).toBe('./');
    expect(manifest.scope).toBe('./');
    expect(manifest.id).toBe('breathwork-app');
  });
});

test.describe('service worker — subpath scope (BW-005)', function () {
  test('installs, caches, and serves offline from /BreathWork/', async function ({ browser }) {
    const context = await browser.newContext({
      baseURL: 'http://127.0.0.1:4173',
      serviceWorkers: 'allow',
      ...iphone16ProMax
    });
    await context.addInitScript(function () {
      var existing = localStorage.getItem('breathwork_prefs_v2');
      var prefs = existing ? JSON.parse(existing) : { version: 2 };
      prefs.onboardingDismissed = true;
      localStorage.setItem('breathwork_prefs_v2', JSON.stringify(prefs));
    });
    const page = await context.newPage();
    await page.addInitScript(hideUpdateBannerInitScript());

    await page.goto('/BreathWork/');
    await page.waitForFunction(function () {
      return navigator.serviceWorker && navigator.serviceWorker.controller;
    }, null, { timeout: 15000 });

    const swState = await page.evaluate(async function () {
      const registration = await navigator.serviceWorker.ready;
      const names = await caches.keys();
      const cache = await caches.open(names[0] || '');
      const keys = (await cache.keys()).map(function (req) {
        return new URL(req.url).pathname;
      });
      return {
        scope: registration.scope,
        pathname: location.pathname,
        controllerScript: navigator.serviceWorker.controller
          ? navigator.serviceWorker.controller.scriptURL
          : '',
        cachedPaths: keys
      };
    });

    expect(swState.pathname).toContain('/BreathWork');
    expect(swState.scope).toContain('/BreathWork/');
    expect(swState.controllerScript).toContain('/BreathWork/sw.js');
    expect(swState.cachedPaths).toEqual(
      expect.arrayContaining(['/BreathWork/index.html', '/BreathWork/sw.js'])
    );

    await expect(page.locator('#app-status-text')).toContainText('Ready offline', { timeout: 15000 });

    const rangeStatus = await page.evaluate(async function () {
      const response = await fetch('./assets/audio/unwind-ambient.m4a', {
        headers: { Range: 'bytes=0-31' }
      });
      return {
        status: response.status,
        contentRange: response.headers.get('content-range'),
        length: (await response.arrayBuffer()).byteLength
      };
    });
    expect(rangeStatus.status).toBe(206);
    expect(rangeStatus.contentRange).toMatch(/^bytes 0-31\/\d+$/);
    expect(rangeStatus.length).toBe(32);

    await context.setOffline(true);
    await page.evaluate(function () {
      window.location.reload();
    });
    await expect(page.locator('#list-heading')).toBeVisible({ timeout: 15000 });
    await context.setOffline(false);
    await context.close();
  });
});
