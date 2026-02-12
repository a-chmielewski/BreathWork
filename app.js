(function () {
  const DURATION_MINUTES_OPTIONS = [5, 10, 15];
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 54;
  const STORAGE_KEYS = { lastTechId: 'breathwork_last_tech', lastMins: 'breathwork_last_mins', lastRounds: 'breathwork_last_rounds', sound: 'breathwork_sound' };

  let state = {
    currentTechnique: null,
    durationMinutes: null,
    durationRounds: null,
    soundEnabled: false
  };

  function loadState() {
    try {
      const lastTechId = localStorage.getItem(STORAGE_KEYS.lastTechId);
      if (lastTechId) {
        const tech = TECHNIQUES.find(t => t.id === lastTechId);
        if (tech) {
          state.currentTechnique = tech;
          if (tech.durationMode === 'time') {
            const m = localStorage.getItem(STORAGE_KEYS.lastMins);
            state.durationMinutes = m ? parseInt(m, 10) : null;
            state.durationRounds = null;
          } else {
            const r = localStorage.getItem(STORAGE_KEYS.lastRounds);
            state.durationRounds = r ? parseInt(r, 10) : null;
            state.durationMinutes = null;
          }
        }
      }
      const sound = localStorage.getItem(STORAGE_KEYS.sound);
      state.soundEnabled = sound === '1';
    } catch (_) {}
  }

  function saveState() {
    try {
      if (state.currentTechnique) {
        localStorage.setItem(STORAGE_KEYS.lastTechId, state.currentTechnique.id);
        if (state.currentTechnique.durationMode === 'time') {
          if (state.durationMinutes != null) localStorage.setItem(STORAGE_KEYS.lastMins, String(state.durationMinutes));
        } else {
          if (state.durationRounds != null) localStorage.setItem(STORAGE_KEYS.lastRounds, String(state.durationRounds));
        }
      }
      localStorage.setItem(STORAGE_KEYS.sound, state.soundEnabled ? '1' : '0');
    } catch (_) {}
  }

  function playPhaseSound() {
    if (!state.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 400;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  }

  const screens = {
    list: document.getElementById('screen-list'),
    duration: document.getElementById('screen-duration'),
    exercise: document.getElementById('screen-exercise'),
    completion: document.getElementById('screen-completion')
  };

  const elements = {
    techniqueList: document.getElementById('technique-list'),
    durationBack: document.getElementById('duration-back'),
    durationTitle: document.getElementById('duration-title'),
    durationOptions: document.getElementById('duration-options'),
    durationStart: document.getElementById('duration-start'),
    durationSound: document.getElementById('duration-sound'),
    exerciseStop: document.getElementById('exercise-stop'),
    exerciseSessionLeft: document.getElementById('exercise-session-left'),
    exerciseRoundInfo: document.getElementById('exercise-round-info'),
    exercisePause: document.getElementById('exercise-pause'),
    exercisePhaseLabel: document.getElementById('exercise-phase-label'),
    exerciseCountdown: document.getElementById('exercise-countdown'),
    exerciseTapHold: document.getElementById('exercise-tap-hold'),
    exerciseNeedBreathe: document.getElementById('exercise-need-breathe'),
    exercisePaused: document.getElementById('exercise-paused'),
    exerciseResume: document.getElementById('exercise-resume'),
    exerciseEndSession: document.getElementById('exercise-end-session'),
    completionMessage: document.getElementById('completion-message'),
    completionAgain: document.getElementById('completion-again'),
    completionList: document.getElementById('completion-list'),
    circleProgress: document.querySelector('.circle-progress')
  };

  function showScreen(screenId) {
    const key = screenId.replace('screen-', '');
    const screen = screens[key];
    if (!screen) return;
    Object.values(screens).forEach(s => s.classList.remove('screen-active'));
    screen.classList.add('screen-active');
  }

  function renderTechniqueList() {
    elements.techniqueList.innerHTML = '';
    TECHNIQUES.forEach(tech => {
      const li = document.createElement('li');
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'technique-card';
      card.setAttribute('data-id', tech.id);
      card.innerHTML = `<p class="technique-name">${escapeHtml(tech.name)}</p><p class="technique-desc">${escapeHtml(tech.shortDescription)}</p>`;
      card.addEventListener('click', () => selectTechnique(tech));
      li.appendChild(card);
      elements.techniqueList.appendChild(li);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function selectTechnique(tech) {
    state.currentTechnique = tech;
    if (tech.durationMode === 'time') {
      const opts = DURATION_MINUTES_OPTIONS;
      state.durationMinutes = opts.includes(state.durationMinutes) ? state.durationMinutes : opts[0];
      state.durationRounds = null;
    } else {
      const opts = tech.roundsOptions || [3, 4, 5];
      state.durationRounds = opts.includes(state.durationRounds) ? state.durationRounds : opts[0];
      state.durationMinutes = null;
    }
    elements.durationTitle.textContent = tech.name;
    if (elements.durationSound) {
      elements.durationSound.checked = state.soundEnabled;
      elements.durationSound.onchange = function () {
        state.soundEnabled = elements.durationSound.checked;
        saveState();
      };
    }
    renderDurationOptions(tech);
    saveState();
    showScreen('screen-duration');
  }

  function renderDurationOptions(tech) {
    elements.durationOptions.innerHTML = '';
    if (tech.durationMode === 'time') {
      DURATION_MINUTES_OPTIONS.forEach(mins => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'duration-option' + (state.durationMinutes === mins ? ' selected' : '');
        btn.textContent = mins + ' min';
        btn.setAttribute('data-value', String(mins));
        btn.addEventListener('click', () => {
          state.durationMinutes = mins;
          document.querySelectorAll('.duration-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          saveState();
        });
        elements.durationOptions.appendChild(btn);
      });
    } else {
      const options = tech.roundsOptions || [3, 4, 5];
      options.forEach(rounds => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'duration-option' + (state.durationRounds === rounds ? ' selected' : '');
        btn.textContent = rounds + (rounds === 1 ? ' round' : ' rounds');
        btn.setAttribute('data-value', String(rounds));
        btn.addEventListener('click', () => {
          state.durationRounds = rounds;
          document.querySelectorAll('.duration-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          saveState();
        });
        elements.durationOptions.appendChild(btn);
      });
    }
  }

  function startSession() {
    const tech = state.currentTechnique;
    if (!tech) return;
    if (tech.durationMode === 'time' && !state.durationMinutes) return;
    if (tech.durationMode === 'rounds' && !state.durationRounds) return;
    saveState();
    showScreen('screen-exercise');
    runExercise(tech);
  }

  function runExercise(tech) {
    const isTimeBased = tech.durationMode === 'time';
    const durationMs = isTimeBased ? state.durationMinutes * 60 * 1000 : null;
    const totalRounds = !isTimeBased ? state.durationRounds : null;
    const useTapHold = !!tech.tapToContinueHold;

    let phaseIndex = 0;
    let startTime = Date.now();
    let phaseStartTime = Date.now();
    let phaseStartElapsed = 0;
    let currentPhase = null;
    let lastPhaseSignature = '';
    let animationFrameId = null;
    let paused = false;
    let pausedElapsed = 0;
    let pausedAt = null;
    let ended = false;

    const phaseList = getPhaseList(tech);
    const totalPhasesPerCycle = phaseList.length;
    const cycleDurationMs = phaseList.reduce((s, p) => s + (p.durationSeconds || 0) * 1000, 0);

    function getPhaseList(t) {
      if (t.tapToContinueHold && t.phases) {
        const breathPhases = [];
        for (let i = 0; i < (t.breathsPerRound || 30); i++) {
          t.phases.forEach(p => breathPhases.push({ ...p }));
        }
        breathPhases.push({ type: 'hold', durationSeconds: 0, label: t.holdAfterExhaleLabel, tapHold: true });
        breathPhases.push({ type: 'inhale', durationSeconds: 1, label: t.inhaleHoldLabel });
        breathPhases.push({ type: 'hold', durationSeconds: t.inhaleHoldSeconds || 15, label: 'Hold' });
        return breathPhases;
      }
      return t.phases.map(p => ({ ...p }));
    }

    function getCurrentPhaseFromElapsed(sessionElapsedMs) {
      if (isTimeBased) {
        if (sessionElapsedMs >= durationMs) return null;
        const cycleIndex = Math.floor(sessionElapsedMs / cycleDurationMs);
        const elapsedInCycle = sessionElapsedMs - cycleIndex * cycleDurationMs;
        let acc = 0;
        for (let i = 0; i < phaseList.length; i++) {
          const d = (phaseList[i].durationSeconds || 0) * 1000;
          if (elapsedInCycle < acc + d) {
            return { phase: phaseList[i], phaseIndex: i, round: cycleIndex, totalRounds: null, elapsedInPhaseMs: elapsedInCycle - acc, phaseDurationMs: d };
          }
          acc += d;
        }
        return { phase: phaseList[0], phaseIndex: 0, round: cycleIndex + 1, totalRounds: null, elapsedInPhaseMs: 0, phaseDurationMs: (phaseList[0].durationSeconds || 0) * 1000 };
      }
      const fullListLength = totalPhasesPerCycle * totalRounds;
      let acc = 0;
      for (let i = 0; i < fullListLength; i++) {
        const p = phaseList[i % totalPhasesPerCycle];
        const d = (p.durationSeconds || 0) * 1000;
        if (sessionElapsedMs < acc + d) {
          return { phase: p, phaseIndex: i % totalPhasesPerCycle, round: Math.floor(i / totalPhasesPerCycle), totalRounds, elapsedInPhaseMs: sessionElapsedMs - acc, phaseDurationMs: d };
        }
        acc += d;
      }
      return null;
    }

    function getCurrentPhaseTap(now) {
      const roundLength = phaseList.length;
      const round = Math.floor(phaseIndex / roundLength);
      if (round >= totalRounds) return null;
      const idx = phaseIndex % roundLength;
      const p = phaseList[idx];
      const phaseDurationMs = (p.durationSeconds || 0) * 1000;
      const sessionElapsed = now - startTime - pausedElapsed;
      const elapsedInPhaseMs = p.tapHold ? 0 : Math.min(phaseDurationMs, sessionElapsed - phaseStartElapsed);
      return { phase: p, phaseIndex: idx, round, totalRounds, elapsedInPhaseMs, phaseDurationMs };
    }

    function setPhaseUI(info, remainingSec) {
      if (!info) return;
      const p = info.phase;
      elements.exercisePhaseLabel.textContent = p.label || p.type;
      elements.exerciseCountdown.textContent = remainingSec != null ? String(Math.max(0, Math.ceil(remainingSec))) : (Math.ceil(p.durationSeconds) || '');
      if (useTapHold && p.tapHold) {
        elements.exerciseTapHold.classList.remove('hidden');
        elements.circleProgress.style.strokeDashoffset = '0';
        return;
      }
      elements.exerciseTapHold.classList.add('hidden');
      if (info.totalRounds != null) {
        elements.exerciseRoundInfo.textContent = 'Round ' + (info.round + 1) + ' of ' + info.totalRounds;
      } else {
        elements.exerciseRoundInfo.textContent = '';
      }
    }

    function setBarProgress(progress) {
      const offset = CIRCLE_CIRCUMFERENCE * (1 - progress);
      elements.circleProgress.style.strokeDashoffset = String(offset);
    }

    function updateBarAndCountdown(info) {
      if (!info) return;
      const p = info.phase;
      const sig = info.round + '-' + info.phaseIndex + '-' + p.type;
      if (sig !== lastPhaseSignature) {
        lastPhaseSignature = sig;
        playPhaseSound();
      }
      const elapsed = info.elapsedInPhaseMs;
      const duration = info.phaseDurationMs;
      const remaining = (duration - elapsed) / 1000;
      elements.exerciseCountdown.textContent = String(Math.max(0, Math.ceil(remaining)));
      currentPhase = p;

      if (p.type === 'inhale' || p.type === 'inhale2') {
        const seg = p.sighSegment != null ? p.sighSegment : 1;
        const prog = (elapsed / duration) * seg + (p.type === 'inhale2' ? 0.5 : 0);
        setBarProgress(Math.min(1, prog));
      } else if (p.type === 'exhale') {
        const prog = 1 - elapsed / duration;
        setBarProgress(Math.max(0, prog));
      } else {
        const prevType = getPrevPhaseType(info);
        setBarProgress(prevType === 'inhale' || prevType === 'inhale2' ? 1 : 0);
      }
    }

    function getPrevPhaseType(info) {
      const idx = info.phaseIndex;
      const round = info.round;
      const list = phaseList;
      const perCycle = totalPhasesPerCycle;
      if (idx > 0) return list[idx - 1].type;
      if (round > 0) return list[perCycle - 1].type;
      return 'exhale';
    }

    function formatMinutesSeconds(remainingMs) {
      const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function updateSessionLeft(elapsed, roundInfo) {
      const el = elements.exerciseSessionLeft;
      if (!el) return;
      if (isTimeBased) {
        const remainingMs = Math.max(0, durationMs - elapsed);
        el.textContent = formatMinutesSeconds(remainingMs) + ' left';
      } else {
        el.textContent = roundInfo != null ? 'Round ' + (roundInfo.round + 1) + ' of ' + roundInfo.totalRounds : '';
      }
    }

    function tick() {
      if (ended) return;
      const now = Date.now();
      if (paused) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - startTime - pausedElapsed;

      if (useTapHold) {
        const info = getCurrentPhaseTap(now);
        if (!info) {
          endSession();
          return;
        }
        updateSessionLeft(elapsed, info);
        const p = info.phase;
        if (p.tapHold) {
          setPhaseUI(info, null);
          animationFrameId = requestAnimationFrame(tick);
          return;
        }
        const sessionElapsed = now - startTime - pausedElapsed;
        const phaseElapsed = sessionElapsed - phaseStartElapsed;
        if (phaseElapsed >= info.phaseDurationMs) {
          phaseIndex++;
          phaseStartTime = now;
          phaseStartElapsed = sessionElapsed;
        }
        const updated = getCurrentPhaseTap(now);
        if (updated) {
          setPhaseUI(updated, (updated.phaseDurationMs - updated.elapsedInPhaseMs) / 1000);
          updateBarAndCountdown(updated);
        }
      } else {
        const info = getCurrentPhaseFromElapsed(elapsed);
        if (!info) {
          endSession();
          return;
        }
        updateSessionLeft(elapsed, info.totalRounds != null ? { round: info.round, totalRounds: info.totalRounds } : null);
        setPhaseUI(info, (info.phaseDurationMs - info.elapsedInPhaseMs) / 1000);
        updateBarAndCountdown(info);
      }

      animationFrameId = requestAnimationFrame(tick);
    }

    function endSession() {
      ended = true;
      if (animationFrameId != null) cancelAnimationFrame(animationFrameId);
      elements.completionMessage.textContent = 'Session complete.';
      showScreen('screen-completion');
    }

    elements.exerciseTapHold.classList.add('hidden');
    elements.exercisePaused.classList.add('hidden');

    if (useTapHold) {
      const info = getCurrentPhaseTap(Date.now());
      updateSessionLeft(0, info);
      setPhaseUI(info, info ? (info.phaseDurationMs - info.elapsedInPhaseMs) / 1000 : null);
      if (info && !info.phase.tapHold) updateBarAndCountdown(info);
    } else {
      const info = getCurrentPhaseFromElapsed(0);
      updateSessionLeft(0, info && info.totalRounds != null ? { round: info.round, totalRounds: info.totalRounds } : null);
      setPhaseUI(info, info ? info.phaseDurationMs / 1000 : null);
      updateBarAndCountdown(info);
    }

    elements.exerciseNeedBreathe.onclick = function () {
      if (!useTapHold) return;
      const info = getCurrentPhaseTap(Date.now());
      if (!info || !info.phase.tapHold) return;
      const now = Date.now();
      phaseIndex++;
      phaseStartTime = now;
      phaseStartElapsed = now - startTime - pausedElapsed;
      const next = getCurrentPhaseTap(now);
      setPhaseUI(next, next ? next.phaseDurationMs / 1000 : null);
      elements.exerciseTapHold.classList.add('hidden');
      if (next && !next.phase.tapHold) updateBarAndCountdown(next);
    };

    elements.exercisePause.onclick = function () {
      paused = true;
      pausedAt = Date.now();
      elements.exercisePaused.classList.remove('hidden');
    };

    elements.exerciseResume.onclick = function () {
      paused = false;
      pausedElapsed += Date.now() - pausedAt;
      pausedAt = null;
      elements.exercisePaused.classList.add('hidden');
    };

    elements.exerciseEndSession.onclick = function () {
      ended = true;
      if (animationFrameId != null) cancelAnimationFrame(animationFrameId);
      showScreen('screen-list');
    };

    elements.exerciseStop.onclick = function () {
      ended = true;
      if (animationFrameId != null) cancelAnimationFrame(animationFrameId);
      showScreen('screen-list');
    };

    animationFrameId = requestAnimationFrame(tick);
  }

  elements.durationBack.addEventListener('click', () => showScreen('screen-list'));
  elements.durationStart.addEventListener('click', startSession);
  elements.completionAgain.addEventListener('click', () => showScreen('screen-duration'));
  elements.completionList.addEventListener('click', () => showScreen('screen-list'));

  loadState();
  renderTechniqueList();
})();
