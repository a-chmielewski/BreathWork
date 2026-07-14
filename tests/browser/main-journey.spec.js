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
});
