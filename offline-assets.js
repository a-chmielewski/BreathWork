/**
 * Shared offline asset manifest for the page and service worker.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.OfflineAssets = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var SHELL_ASSET_PATHS = [
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
    './guided-sessions.js',
    './guided-session-engine.js',
    './audio-cues.js',
    './session-media.js',
    './offline-assets.js',
    './manifest.json',
    './icon.svg',
    './icon-180.png',
    './icon-192.png',
    './icon-512.png',
    './icon-512-maskable.png',
    './favicon-32.png'
  ];

  var OPTIONAL_MEDIA_PATHS = ['./assets/audio/unwind-ambient.m4a'];

  return {
    SHELL_ASSET_PATHS: SHELL_ASSET_PATHS,
    OPTIONAL_MEDIA_PATHS: OPTIONAL_MEDIA_PATHS
  };
});
