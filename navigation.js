/**
 * Lightweight history-backed screen navigation for Breathwork.
 */
(function (root) {
  var currentScreen = 'list';
  var onScreenChange = null;
  var onBeforeBack = null;

  function init(options) {
    onScreenChange = options.onScreenChange || null;
    onBeforeBack = options.onBeforeBack || null;
    if (!window.location.hash) {
      history.replaceState({ screen: 'list' }, '', '#list');
    } else {
      var fromHash = window.location.hash.replace(/^#/, '');
      if (fromHash) currentScreen = fromHash;
    }
    window.addEventListener('popstate', function (event) {
      var next = (event.state && event.state.screen) || 'list';
      if (onBeforeBack) {
        var allowed = onBeforeBack(currentScreen, next, event.state || {});
        if (allowed === false) {
          history.pushState({ screen: currentScreen }, '', '#' + currentScreen);
          return;
        }
      }
      currentScreen = next;
      if (onScreenChange) onScreenChange(next, event.state || {}, { fromHistory: true });
    });
  }

  function go(screenId, state, replace) {
    state = state || {};
    state.screen = screenId;
    var url = '#' + screenId;
    if (replace) {
      history.replaceState(state, '', url);
    } else {
      history.pushState(state, '', url);
    }
    currentScreen = screenId;
    if (onScreenChange) onScreenChange(screenId, state, { fromHistory: false });
  }

  function back() {
    history.back();
  }

  function getCurrentScreen() {
    return currentScreen;
  }

  root.AppNavigation = {
    init: init,
    go: go,
    back: back,
    getCurrentScreen: getCurrentScreen
  };
})(typeof window !== 'undefined' ? window : globalThis);
