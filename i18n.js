/**
 * Lightweight i18n for Breathwork — dot-key lookup, interpolation, Polish plurals.
 */
(function (root) {
  var LOCALES = {};
  var currentLocale = 'en';
  var changeListeners = [];

  function registerLocale(code, messages) {
    LOCALES[code] = messages;
  }

  function getNested(obj, key) {
    if (!obj || !key) return undefined;
    var parts = key.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function interpolate(text, params) {
    if (!params || typeof text !== 'string') return text;
    return text.replace(/\{(\w+)\}/g, function (_match, name) {
      return params[name] != null ? String(params[name]) : '{' + name + '}';
    });
  }

  function polishPluralForm(count) {
    var n = Math.abs(count);
    if (n === 1) return 'one';
    var mod10 = n % 10;
    var mod100 = n % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'few';
    return 'many';
  }

  function pluralForm(locale, count) {
    if (locale === 'pl') return polishPluralForm(count);
    return count === 1 ? 'one' : 'other';
  }

  function resolveMessage(key, locale) {
    var msg = getNested(LOCALES[locale], key);
    if (msg != null) return msg;
    if (locale !== 'en') return getNested(LOCALES.en, key);
    return undefined;
  }

  function t(key, params) {
    var msg = resolveMessage(key, currentLocale);
    if (msg == null) return key;
    if (typeof msg === 'string') return interpolate(msg, params);
    return key;
  }

  function plural(key, count, params) {
    var form = pluralForm(currentLocale, count);
    var msg =
      resolveMessage(key + '_' + form, currentLocale) ||
      resolveMessage(key + '_other', currentLocale) ||
      resolveMessage(key + '_one', currentLocale) ||
      resolveMessage(key, currentLocale);
    var merged = Object.assign({ count: count }, params || {});
    if (typeof msg === 'string') return interpolate(msg, merged);
    return String(count);
  }

  function detectLocale(stored) {
    if (stored && LOCALES[stored]) return stored;
    var nav = (root.navigator && root.navigator.language) || 'en';
    if (/^pl/i.test(nav)) return 'pl';
    return 'en';
  }

  function applyHtml(rootEl) {
    var scope = rootEl || root.document;
    if (!scope || !scope.querySelectorAll) return;
    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
    scope.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (key) el.innerHTML = t(key);
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', t(key));
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var spec = el.getAttribute('data-i18n-aria');
      if (!spec) return;
      spec.split(';').forEach(function (pair) {
        var parts = pair.split(':');
        if (parts.length === 2) {
          el.setAttribute(parts[0].trim(), t(parts[1].trim()));
        }
      });
    });
    scope.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (key) el.setAttribute('title', t(key));
    });
  }

  function getTechniqueOverlay(id) {
    return getNested(LOCALES[currentLocale], 'techniques.' + id);
  }

  function localizeTechnique(tech) {
    if (!tech) return tech;
    var overlay = getTechniqueOverlay(tech.id);
    if (!overlay) return tech;

    var result = Object.assign({}, tech);
    if (overlay.name) result.name = overlay.name;
    if (overlay.shortDescription) result.shortDescription = overlay.shortDescription;

    if (overlay.metadata) {
      result.metadata = Object.assign({}, tech.metadata, overlay.metadata);
    }

    if (overlay.instructions) {
      result.instructions = Object.assign({}, tech.instructions, overlay.instructions);
      if (overlay.instructions.steps) {
        result.instructions.steps = overlay.instructions.steps.slice();
      }
    }

    if (overlay.phases && tech.phases) {
      result.phases = tech.phases.map(function (phase, index) {
        var lp = overlay.phases[index];
        return lp ? Object.assign({}, phase, lp) : phase;
      });
    }

    if (overlay.holdAfterExhaleLabel) result.holdAfterExhaleLabel = overlay.holdAfterExhaleLabel;
    if (overlay.inhaleHoldLabel) result.inhaleHoldLabel = overlay.inhaleHoldLabel;

    return result;
  }

  function getLocalizedTechniques(source) {
    return (source || []).map(localizeTechnique);
  }

  function getSafety() {
    var safety = getNested(LOCALES[currentLocale], 'safety');
    if (safety) return safety;
    return getNested(LOCALES.en, 'safety') || {};
  }

  function getStoredKeys() {
    var keys = getNested(LOCALES[currentLocale], 'storedKeys');
    if (keys) return keys;
    return getNested(LOCALES.en, 'storedKeys') || [];
  }

  function setLocale(locale, options) {
    options = options || {};
    if (!LOCALES[locale]) locale = 'en';
    currentLocale = locale;
    if (root.document && root.document.documentElement) {
      root.document.documentElement.lang = locale;
    }
    if (!options.silent) {
      changeListeners.forEach(function (fn) {
        fn(locale);
      });
    }
  }

  function getLocale() {
    return currentLocale;
  }

  function onChange(fn) {
    changeListeners.push(fn);
  }

  function init(options) {
    options = options || {};
    registerLocale('en', root.I18N_EN || {});
    registerLocale('pl', root.I18N_PL || {});
    setLocale(detectLocale(options.locale), { silent: true });
  }

  root.I18n = {
    init: init,
    registerLocale: registerLocale,
    t: t,
    plural: plural,
    setLocale: setLocale,
    getLocale: getLocale,
    detectLocale: detectLocale,
    applyHtml: applyHtml,
    localizeTechnique: localizeTechnique,
    getLocalizedTechniques: getLocalizedTechniques,
    getSafety: getSafety,
    getStoredKeys: getStoredKeys,
    onChange: onChange
  };
})(typeof window !== 'undefined' ? window : globalThis);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = globalThis.I18n;
}
