const { test, expect } = require('@playwright/test');

async function openBoxBreathingSetup(page) {
  await page.getByRole('button', { name: 'Box Breathing' }).click();
  await expect(page.getByRole('heading', { name: 'Box Breathing' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to setup' }).click();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
}

test.describe('main journey — iPhone 16 Pro Max WebKit profile', function () {
  test.beforeEach(async function ({ page }) {
    await page.addInitScript(function () {
      localStorage.setItem('breathwork_safety_ack_v1', '1');
      localStorage.setItem('breathwork_install_hint_dismissed', '1');
      var existing = localStorage.getItem('breathwork_prefs_v2');
      if (!existing) {
        localStorage.setItem(
          'breathwork_prefs_v2',
          JSON.stringify({
            version: 2,
            onboardingDismissed: true,
            favorites: [],
            sound: false,
            haptics: false,
            volume: 70,
            showCountdown: true,
            theme: 'system'
          })
        );
      } else {
        try {
          var prefs = JSON.parse(existing);
          prefs.onboardingDismissed = true;
          localStorage.setItem('breathwork_prefs_v2', JSON.stringify(prefs));
        } catch (e) {}
      }
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
    });
    await page.goto('/');
  });

  test('lists techniques and opens duration setup', async function ({ page }) {
    await expect(page.getByRole('heading', { name: 'Breathwork' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Box Breathing' })).toBeVisible();
    await openBoxBreathingSetup(page);
    await expect(page.getByRole('radiogroup', { name: 'Session length' })).toBeVisible();
  });

  test('shows technique instructions on detail screen', async function ({ page }) {
    await page.getByRole('button', { name: 'Alternate Nostril Breathing' }).click();
    await expect(page.getByRole('heading', { name: 'How to practice' })).toBeVisible();
    await expect(page.locator('#detail-meta').getByText('Nasal control')).toBeVisible();
    await expect(page.locator('#detail-sequence')).toContainText('Left inhale');
  });

  test('shows safety information modal from list screen', async function ({ page }) {
    await page.getByRole('button', { name: 'Safety information' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Safety information' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('starts box breathing after get-ready skip', async function ({ page }) {
    await openBoxBreathingSetup(page);
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.getByText('Get ready')).toBeVisible();
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.locator('#exercise-get-ready')).toBeHidden();
    await expect(page.locator('#exercise-phase-label')).toHaveText('Inhale');
    await expect(page.getByRole('button', { name: 'Emergency stop — end session immediately' })).toBeVisible();
  });

  test('emergency stop returns to technique list', async function ({ page }) {
    await openBoxBreathingSetup(page);
    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('button', { name: 'Skip' }).click();
    await page.locator('#exercise-phase-label').waitFor({ state: 'visible' });
    await page.evaluate(function () {
      document.getElementById('exercise-stop').click();
    });
    await expect(page.locator('.technique-card[data-id="box"]')).toBeVisible();
  });

  test('requires safety acknowledgement before first intense session', async function ({ page }) {
    await page.evaluate(function () {
      localStorage.removeItem('breathwork_safety_ack_v1');
    });
    await page.getByRole('button', { name: 'Wim Hof Method' }).click();
    await page.getByRole('button', { name: 'Continue to setup' }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'High-intensity techniques' })).toBeVisible();
  });

  test('continue shortcut starts last session', async function ({ page }) {
    await openBoxBreathingSetup(page);
    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('button', { name: 'Skip' }).click();
    await page.locator('#exercise-phase-label').waitFor({ state: 'visible' });
    await page.evaluate(function () {
      document.getElementById('exercise-stop').click();
    });
    await expect(page.getByRole('button', { name: 'Continue with last settings' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue with last settings' }).click();
    await expect(page.getByText('Get ready')).toBeVisible();
  });

  test('filters techniques by goal', async function ({ page }) {
    await page.locator('#goal-filters').getByRole('button', { name: 'Sleep', exact: true }).click();
    await expect(page.getByRole('button', { name: '4-7-8 Breathing' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Box Breathing' })).toHaveCount(0);
  });

  test('browser back returns from detail to list', async function ({ page }) {
    await page.getByRole('button', { name: 'Box Breathing' }).click();
    await expect(page.getByRole('button', { name: 'Continue to setup' })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Breathwork' })).toBeVisible();
  });

  test('opens the guided overview with stages and honest audio status', async function ({ page }) {
    await expect(page.getByRole('heading', { name: 'Guided sessions' })).toBeVisible();
    await page.getByRole('button', { name: /Unwind with sound/ }).click();
    await expect(page.getByRole('heading', { name: 'Stage overview' })).toBeVisible();
    await expect(page.locator('#guided-stage-list')).toContainText('Arrive');
    await expect(page.locator('#guided-stage-list')).toContainText('Breathe');
    await expect(page.locator('#guided-stage-list')).toContainText('Listen and rest');
    await expect(page.locator('#guided-stage-list')).toContainText('Return');
    await expect(page.locator('#guided-audio-status')).toContainText(/Ambient sound is (ready offline|available online)/);
    await expect(page.getByRole('switch', { name: 'Play ambient sound during rest' })).toBeChecked();
    await expect(page.getByLabel('Ambient volume')).toHaveValue('45');
    await expect(page.locator('#guided-start')).toBeFocused();
    await expect(page.locator('#guided-options')).not.toHaveAttribute('open', '');
    await expect(page.locator('#guided-pace-description')).toBeHidden();
    await page.getByText('Session options', { exact: true }).click();
    await expect(page.locator('#guided-pace-description')).toHaveText(
      'Comfortable pace: 5.5s inhale · 5.5s exhale'
    );
  });

  test('persists dim view and keeps guided controls reachable at 440 by 956', async function ({
    page
  }) {
    await page.getByRole('button', { name: /Unwind with sound/ }).click();
    await page.getByText('Session options', { exact: true }).click();
    await page.getByText('Dim view — hide numeric timing', { exact: true }).click();
    await page.getByRole('button', { name: 'Start guided session' }).click();

    await expect(page.locator('#exercise-session-left')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Arrive' })).toBeVisible();
    await expect(page.locator('#guided-stage-prompt')).toBeVisible();
    const controlMetrics = await page.evaluate(function () {
      return ['guided-stop', 'guided-rest-now', 'guided-pause'].map(function (id) {
        const rect = document.getElementById(id).getBoundingClientRect();
        return { id: id, top: rect.top, bottom: rect.bottom, height: rect.height };
      });
    });
    controlMetrics.forEach(function (control) {
      expect(control.height).toBeGreaterThanOrEqual(44);
      expect(control.top).toBeGreaterThanOrEqual(0);
      expect(control.bottom).toBeLessThanOrEqual(956);
    });
    const prefs = await page.evaluate(function () {
      return JSON.parse(localStorage.getItem('breathwork_prefs_v2'));
    });
    expect(prefs.guidedDimView).toBe(true);
    await page.getByRole('button', { name: 'Emergency stop — end session immediately' }).click();
    await openBoxBreathingSetup(page);
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.locator('#guided-stage-content')).toBeHidden();
    await expect(page.locator('.exercise-main')).not.toHaveClass(/guided-mode/);
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.locator('#exercise-countdown')).toBeVisible();
    await expect(page.locator('#exercise-session-left')).not.toHaveAttribute('aria-hidden');
    await expect(page.locator('#exercise-countdown')).not.toHaveAttribute('aria-hidden');
  });

  test('keeps all guided controls visible during Breathe in landscape', async function ({ page }) {
    await page.setViewportSize({ width: 956, height: 440 });
    await page.evaluate(function () {
      GuidedSessions.getById('unwind-with-sound').stages[0].durationMs = 50;
    });
    await page.getByRole('button', { name: /Unwind with sound/ }).click();
    await page.getByRole('button', { name: 'Start guided session' }).click();
    await expect(page.getByRole('heading', { name: 'Breathe' })).toBeVisible();
    const layout = await page.evaluate(function () {
      return {
        height: window.innerHeight,
        controls: ['guided-stop', 'guided-rest-now', 'guided-pause'].map(function (id) {
          return document.getElementById(id).getBoundingClientRect().toJSON();
        }),
        circle: document.getElementById('circle-wrap').getBoundingClientRect().toJSON()
      };
    });
    layout.controls.forEach(function (rect) {
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.bottom).toBeLessThanOrEqual(layout.height);
    });
    expect(layout.circle.height).toBeLessThanOrEqual(layout.height * 0.4 + 1);
    expect(layout.circle.bottom).toBeLessThanOrEqual(layout.controls[0].top);
  });

  test('pauses, resumes, rests now, and stops a guided session immediately', async function ({ page }) {
    await page.getByRole('button', { name: /Unwind with sound/ }).click();
    await page.getByRole('button', { name: 'Start guided session' }).click();
    await expect(page.getByRole('heading', { name: 'Arrive' })).toBeVisible();

    await page.getByRole('button', { name: 'Pause session' }).click();
    await expect(page.getByText('Paused', { exact: true })).toBeVisible();
    await expect(page.locator('#guided-control-bar')).toHaveAttribute('inert', '');
    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.locator('#guided-control-bar')).not.toHaveAttribute('inert');
    await expect(page.getByRole('heading', { name: 'Arrive' })).toBeVisible();

    await page.getByRole('button', { name: 'Rest now' }).click();
    await expect(page.getByRole('heading', { name: 'Listen and rest' })).toBeVisible();
    await page.getByRole('button', { name: 'Emergency stop — end session immediately' }).click();
    await expect(page.getByRole('heading', { name: 'Breathwork' })).toBeVisible();

    const history = await page.evaluate(function () {
      return JSON.parse(localStorage.getItem('breathwork_history_v1') || '[]');
    });
    expect(history).toHaveLength(0);
  });

  test('requires explicit resume after the guided session is background-paused', async function ({
    page
  }) {
    await page.getByRole('button', { name: /Unwind with sound/ }).click();
    await page.getByRole('button', { name: 'Start guided session' }).click();
    await page.getByRole('button', { name: 'Rest now' }).click();
    await page.evaluate(function () {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: function () {
          return true;
        }
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.locator('#exercise-paused')).toBeVisible();
    await page.evaluate(function () {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: function () {
          return false;
        }
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.locator('#exercise-paused')).toBeVisible();
    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.locator('#exercise-paused')).toBeHidden();
  });

  test('auto-saves one completed guided session with active elapsed time', async function ({ page }) {
    await page.evaluate(function () {
      const guidedSession = GuidedSessions.getById('unwind-with-sound');
      guidedSession.stages[0].durationMs = 50;
      guidedSession.stages[1].durationMinutes = 0.001;
      guidedSession.stages[2].durationMs = 50;
      guidedSession.stages[3].durationMs = 50;
      guidedSession.paceOptions[0].inhaleSeconds = 0.05;
      guidedSession.paceOptions[0].exhaleSeconds = 0.05;
    });

    await page.getByRole('button', { name: /Unwind with sound/ }).click();
    await page.getByRole('button', { name: 'Start guided session' }).click();
    await expect(page.locator('#completion-message')).toHaveText('Guided session complete and saved.');
    await expect(page.getByLabel('Optional reflection — saved only on this device')).toBeVisible();
    const automaticallySaved = await page.evaluate(function () {
      return JSON.parse(localStorage.getItem('breathwork_history_v1') || '[]');
    });
    expect(automaticallySaved).toHaveLength(1);
    await page.getByRole('button', { name: 'Back to list' }).click();
    await page.getByRole('button', { name: 'History' }).click();
    await expect(page.locator('#history-list')).toContainText('Unwind with sound');

    const guidedHistory = await page.evaluate(function () {
      return JSON.parse(localStorage.getItem('breathwork_history_v1') || '[]').filter(function (entry) {
        return entry.sessionType === 'guided';
      });
    });
    expect(guidedHistory).toHaveLength(1);
    expect(guidedHistory[0].elapsedMs).toBe(250);
    expect(guidedHistory[0].reflection).toBeUndefined();
  });

  test('adds an optional local reflection after automatic guided completion', async function ({
    page
  }) {
    await page.evaluate(function () {
      const guidedSession = GuidedSessions.getById('unwind-with-sound');
      guidedSession.stages[0].durationMs = 50;
      guidedSession.stages[1].durationMinutes = 0.001;
      guidedSession.stages[2].durationMs = 50;
      guidedSession.stages[3].durationMs = 50;
      guidedSession.paceOptions[0].inhaleSeconds = 0.05;
      guidedSession.paceOptions[0].exhaleSeconds = 0.05;
    });
    await page.getByRole('button', { name: /Unwind with sound/ }).click();
    await page.getByRole('button', { name: 'Start guided session' }).click();
    const reflection = page.getByLabel('Optional reflection — saved only on this device');
    await reflection.fill('I feel more settled.');
    await page.getByRole('button', { name: 'Save reflection' }).click();
    const history = await page.evaluate(function () {
      return JSON.parse(localStorage.getItem('breathwork_history_v1') || '[]');
    });
    expect(history).toHaveLength(1);
    expect(history[0].reflection).toBe('I feel more settled.');
  });

  test('localizes the guided entry and overview in Polish', async function ({ page }) {
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('radio', { name: 'Polski' }).click();
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Sesje prowadzone' })).toBeVisible();
    await page.getByRole('button', { name: /Wyciszenie z dźwiękiem/ }).click();
    await expect(page.getByRole('heading', { name: 'Przebieg sesji' })).toBeVisible();
    await expect(page.locator('#guided-audio-status')).toContainText(/Dźwięk tła jest (gotowy offline|dostępny online)/);
    await expect(page.getByRole('switch', { name: 'Odtwarzaj dźwięk tła podczas odpoczynku' })).toBeChecked();
  });

  test('persists ambient controls independently from phase cues', async function ({ page }) {
    await page.getByRole('button', { name: /Unwind with sound/ }).click();
    const ambientSwitch = page.getByRole('switch', { name: 'Play ambient sound during rest' });
    await page.getByText('Play ambient sound during rest', { exact: true }).click();
    await expect(ambientSwitch).not.toBeChecked();
    await expect(page.locator('#guided-audio-status')).toContainText('Ambient sound is off');
    await page.getByText('Play ambient sound during rest', { exact: true }).click();
    await expect(ambientSwitch).toBeChecked();
    await page.getByLabel('Ambient volume').fill('30');

    const prefs = await page.evaluate(function () {
      return JSON.parse(localStorage.getItem('breathwork_prefs_v2'));
    });
    expect(prefs.ambientEnabled).toBe(true);
    expect(prefs.ambientVolume).toBe(30);
    expect(prefs.sound).toBe(false);
    expect(prefs.volume).toBe(70);
  });
});

test('guided Start unlocks cue audio from the user gesture', async function ({ browser }) {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 440, height: 956 },
    serviceWorkers: 'block'
  });
  await context.addInitScript(function () {
    window.__mockAudioContexts = [];
    function MockAudioContext() {
      this.currentTime = 0;
      this.state = 'suspended';
      this.destination = {};
      this.resumeCalls = 0;
      window.__mockAudioContexts.push(this);
    }
    MockAudioContext.prototype.createGain = function () {
      return {
        gain: {
          value: 0,
          cancelScheduledValues: function () {},
          setValueAtTime: function (value) {
            this.value = value;
          },
          linearRampToValueAtTime: function (value) {
            this.value = value;
          }
        },
        connect: function () {}
      };
    };
    MockAudioContext.prototype.createOscillator = function () {
      return {
        frequency: { setValueAtTime: function () {} },
        connect: function () {},
        start: function () {},
        stop: function () {}
      };
    };
    MockAudioContext.prototype.createMediaElementSource = function () {
      return { connect: function () {} };
    };
    MockAudioContext.prototype.resume = function () {
      this.resumeCalls++;
      this.state = 'running';
      return Promise.resolve();
    };
    MockAudioContext.prototype.suspend = function () {
      this.state = 'suspended';
      return Promise.resolve();
    };
    MockAudioContext.prototype.close = function () {
      this.state = 'closed';
      return Promise.resolve();
    };
    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = MockAudioContext;
    localStorage.setItem(
      'breathwork_prefs_v2',
      JSON.stringify({
        version: 2,
        onboardingDismissed: true,
        sound: true,
        ambientEnabled: true
      })
    );
    localStorage.setItem('breathwork_install_hint_dismissed', '1');
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('button', { name: /Unwind with sound/ }).click();
  await page.getByRole('button', { name: 'Start guided session' }).click();
  const audioContexts = await page.evaluate(function () {
    return window.__mockAudioContexts.map(function (audioContext) {
      return { resumeCalls: audioContext.resumeCalls, state: audioContext.state };
    });
  });
  expect(audioContexts.length).toBeGreaterThanOrEqual(2);
  expect(audioContexts[0].resumeCalls).toBeGreaterThanOrEqual(1);
  await context.close();
});
