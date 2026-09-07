const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**', 'test-results/**'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        APP_VERSION: 'readonly',
        TECHNIQUES: 'readonly',
        resolveTechniqueVariation: 'readonly',
        SAFETY: 'readonly',
        SessionEngine: 'readonly',
        GuidedSessions: 'readonly',
        GuidedSessionEngine: 'readonly',
        SessionMedia: 'readonly',
        OfflineAssets: 'readonly',
        AudioCues: 'readonly',
        AppNavigation: 'readonly',
        AppStorage: 'readonly',
        AppLog: 'readonly',
        I18n: 'readonly',
        I18N_EN: 'readonly',
        I18N_PL: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }
      ],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-redeclare': 'off'
    }
  },
  {
    files: [
      'audio-cues.js',
      'session-engine.js',
      'guided-sessions.js',
      'guided-session-engine.js',
      'session-media.js',
      'offline-assets.js',
      'techniques.js',
      'version.js',
      'storage.js',
      'i18n.js',
      'locales/*.js'
    ],
    languageOptions: {
      globals: {
        module: 'readonly',
        exports: 'readonly'
      }
    }
  },
  {
    files: ['scripts/**/*.js', 'tests/**/*.js', 'playwright.config.js', 'eslint.config.cjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['sw.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        APP_VERSION: 'writable',
        OfflineAssets: 'readonly'
      }
    }
  }
];
