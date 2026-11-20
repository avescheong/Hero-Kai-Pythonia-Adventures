/* ============================================================================
 * js/modules/autoscroll-comfort.module.js  (v1.1 Upgraded)
 * Fix #5: Automatically pauses Auto-Scroll on manual upward wheel or touchstart
 * so it never fights the reader! Also listens to autoscroll:cycle (key 'A').
 * ============================================================================ */
(function (global) {
  'use strict';

  let rafId = null;
  const SPEEDS = [0, 0.9, 1.8, 3.2];

  function stopAutoScroll(ctx, silent) {
    const wasRunning = (ctx.store.getState().autoScrollSpeed || 0) > 0;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    ctx.store.setState({ autoScrollSpeed: 0 });
    updateAutoScrollBtn(0);
    if (wasRunning && !silent) ctx.toast('Auto-Scroll paused');
  }

  function updateAutoScrollBtn(speedIdx) {
    const btn = document.getElementById('hud-btn-autoscroll');
    const lbl = document.getElementById('hud-autoscroll-label');
    if (!btn) return;
    btn.classList.toggle('hud-btn--active', speedIdx > 0);
    if (lbl) lbl.textContent = speedIdx > 0 ? `${speedIdx}x` : 'Auto';
  }

  function startAutoScroll(ctx, speedIdx) {
    if (rafId) cancelAnimationFrame(rafId);
    ctx.store.setState({ autoScrollSpeed: speedIdx });
    updateAutoScrollBtn(speedIdx);
    if (speedIdx === 0) return;

    function tick() {
      const st = ctx.store.getState();
      if (st.view !== 'reader' || st.autoScrollSpeed === 0) {
        rafId = null;
        return;
      }
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= maxScroll - 4) {
        stopAutoScroll(ctx, true);
        ctx.toast('Reached end of episode — try the Live Spell Portal!');
        return;
      }
      window.scrollBy(0, SPEEDS[st.autoScrollSpeed] || 1);
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  function applyComfort(state) {
    document.body.setAttribute('data-reader-theme', state.readerTheme || 'forest');
    document.documentElement.style.setProperty('--comic-strip-width', `${state.stripWidth || 800}px`);
    const bright = Math.max(65, Math.min(100, Number(state.brightness) || 100));
    document.documentElement.style.setProperty('--comic-brightness', (bright / 100).toFixed(2));

    document.querySelectorAll('[data-theme-opt]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-opt') === state.readerTheme));
    });
    document.querySelectorAll('[data-width-opt]').forEach((b) => {
      b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-width-opt')) === state.stripWidth));
    });
    const range = document.getElementById('comfort-brightness');
    const val = document.getElementById('comfort-bright-val');
    if (range) range.value = String(bright);
    if (val) val.textContent = `${bright}%`;
  }

  global.KaiComic.registerModule({
    id: 'autoscroll-comfort',
    mount(ctx) {
      applyComfort(ctx.store.getState());

      function cycleSpeed() {
        const cur = ctx.store.getState().autoScrollSpeed || 0;
        const next = (cur + 1) % SPEEDS.length;
        startAutoScroll(ctx, next);
        ctx.toast(next === 0 ? 'Auto-Scroll paused' : `Auto-Scroll ${next}x cruising`);
      }

      const autoBtn = document.getElementById('hud-btn-autoscroll');
      if (autoBtn) autoBtn.addEventListener('click', cycleSpeed);

      // Fix #5: Pause auto-scroll if user scrolls upward or touches the screen
      window.addEventListener('wheel', (e) => {
        if (e.deltaY < -8 && ctx.store.getState().autoScrollSpeed > 0) {
          stopAutoScroll(ctx, false);
        }
      }, { passive: true });

      window.addEventListener('touchstart', () => {
        if (ctx.store.getState().autoScrollSpeed > 0) {
          stopAutoScroll(ctx, false);
        }
      }, { passive: true });

      const comfortBtn = document.getElementById('hud-btn-comfort');
      const pop = document.getElementById('comfort-popover');
      if (comfortBtn && pop) {
        comfortBtn.addEventListener('click', () => {
          pop.hidden = !pop.hidden;
          comfortBtn.classList.toggle('hud-btn--active', !pop.hidden);
        });
      }

      const shortcutsBtn = document.getElementById('comfort-shortcuts-btn');
      if (shortcutsBtn) {
        shortcutsBtn.addEventListener('click', () => {
          if (pop) pop.hidden = true;
          ctx.bus.emit('modal:open-shortcuts');
        });
      }

      document.querySelectorAll('[data-theme-opt]').forEach((b) => {
        b.addEventListener('click', () => {
          ctx.store.setState({ readerTheme: b.getAttribute('data-theme-opt') });
          applyComfort(ctx.store.getState());
        });
      });

      document.querySelectorAll('[data-width-opt]').forEach((b) => {
        b.addEventListener('click', () => {
          ctx.store.setState({ stripWidth: Number(b.getAttribute('data-width-opt')) });
          applyComfort(ctx.store.getState());
        });
      });

      const brightRange = document.getElementById('comfort-brightness');
      if (brightRange) {
        brightRange.addEventListener('input', (e) => {
          ctx.store.setState({ brightness: Number(e.target.value) });
          applyComfort(ctx.store.getState());
        });
      }

      ctx.bus.on('autoscroll:stop', () => stopAutoScroll(ctx, true));
      ctx.bus.on('autoscroll:cycle', cycleSpeed);
      ctx.bus.on('episode:opened', () => stopAutoScroll(ctx, true));
    }
  });
})(window);
