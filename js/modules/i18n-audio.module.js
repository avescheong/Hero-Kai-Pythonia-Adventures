/* ============================================================================
 * js/modules/i18n-audio.module.js
 * Bilingual EN / 繁體中文 / 雙語 Switcher + Procedural Web Audio Chimes.
 * ============================================================================ */
(function (global) {
  'use strict';

  const DICT = {
    en: {
      sealTitle: 'Hero Kai Webtoon',
      sealSub: 'Vol. 1 & 2 · 20 Episodes',
      backToSite: '🏰 Pythonia Site',
      soundOn: 'Music: ON',
      soundOff: 'Music: OFF',
      menuBtn: 'Menu',
      navComicHub: '📖 Series Hub & Episodes',
      navGrimoire: '📜 11 Spells Grimoire',
      navStorybook: '✨ Interactive Storybook ↗',
      navLearningHub: '🏰 Learning Hub & 12 Sanctuaries ↗',
      navPdf: '📥 Download Vol. 1 PDF ↗',
      hubShort: 'Hub',
      nextShort: 'Next',
      themeLabel: 'Backdrop',
      widthLabel: 'Strip Width',
      brightLabel: 'Brightness',
      drawerTitle: 'Vol. 1 & 2 · 20 Episodes'
    },
    'zh-Hant': {
      sealTitle: '英雄凱條漫',
      sealSub: '第一、二卷 · 20 話',
      backToSite: '🏰 派森尼亞主站',
      soundOn: '音樂：開',
      soundOff: '音樂：關',
      menuBtn: '選單',
      navComicHub: '📖 條漫首頁與章節',
      navGrimoire: '📜 十一咒語寶典',
      navStorybook: '✨ 互動故事書 ↗',
      navLearningHub: '🏰 學習中心與十二聖殿 ↗',
      navPdf: '📥 下載第一卷完整版 PDF ↗',
      hubShort: '目錄',
      nextShort: '下一話',
      themeLabel: '背景色',
      widthLabel: '漫畫寬度',
      brightLabel: '亮度',
      drawerTitle: '第一、二卷 · 全部 20 話'
    },
    dual: {
      sealTitle: 'Hero Kai Webtoon · 條漫',
      sealSub: 'Vol. 1 & 2 · 20 Episodes',
      backToSite: '🏰 Pythonia Site',
      soundOn: 'Music: ON',
      soundOff: 'Music: OFF',
      menuBtn: 'Menu',
      navComicHub: '📖 Series Hub · 章節目錄',
      navGrimoire: '📜 11 Spells Grimoire · 咒語寶典',
      navStorybook: '✨ Interactive Storybook ↗',
      navLearningHub: '🏰 Learning Hub · 學習中心 ↗',
      navPdf: '📥 Vol. 1 Master PDF ↗',
      hubShort: 'Hub',
      nextShort: 'Next',
      themeLabel: 'Backdrop',
      widthLabel: 'Strip Width',
      brightLabel: 'Brightness',
      drawerTitle: 'Vol. 1 & 2 · 20 Episodes (雙語)'
    }
  };

  let audioCtx = null;

  function playChime(type) {
    const state = global.KaiComicStore.getState();
    if (!state.soundEnabled) return;
    try {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const notes = type === 'spell' ? [523.25, 659.25, 783.99, 1046.5] :
                    type === 'like'  ? [587.33, 880] :
                                       [523.25, 659.25];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.07, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.28);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } catch (_) {
      // Ignore audio block before user gesture
    }
  }

  function applyTranslations(lang) {
    const table = DICT[lang] || DICT.dual;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (table[key]) el.textContent = table[key];
    });
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang-btn') === lang));
    });
    const soundBtn = document.getElementById('kc-sound-btn');
    const st = global.KaiComicStore.getState();
    if (soundBtn) {
      soundBtn.setAttribute('data-active', String(st.soundEnabled));
      soundBtn.setAttribute('aria-pressed', String(st.soundEnabled));
      const lbl = soundBtn.querySelector('[data-i18n]');
      if (lbl) lbl.textContent = st.soundEnabled ? table.soundOn : table.soundOff;
    }
  }

  function formatEpTitle(ep, lang) {
    if (lang === 'en') return ep.title_en;
    if (lang === 'zh-Hant') return ep.title_zh;
    return `${ep.title_en} · ${ep.title_zh}`;
  }

  function formatEpSummary(ep, lang) {
    if (lang === 'en') return ep.summary_en;
    if (lang === 'zh-Hant') return ep.summary_zh;
    return `${ep.summary_en} ${ep.summary_zh}`;
  }

  global.KaiComicI18n = { formatEpTitle, formatEpSummary, playChime };

  global.KaiComic.registerModule({
    id: 'i18n-audio',
    mount(ctx) {
      const state = ctx.store.getState();
      applyTranslations(state.lang);

      document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const lang = btn.getAttribute('data-lang-btn');
          const patch = lang === 'dual' ? { lang } : { lang, comicLang: lang };
          ctx.store.setState(patch, 'lang:changed');
          applyTranslations(lang);
          playChime('tap');
        });
      });

      ctx.bus.on('lang:sync-ui', () => applyTranslations(ctx.store.getState().lang));

      const soundBtn = document.getElementById('kc-sound-btn');

      // ---- Shared soothing background music (same track + settings as the main site) ----
      const bgm = document.getElementById('kc-bgm-audio');
      const musicOn = () => localStorage.getItem('pythonia_music_on') !== 'false';
      if (!musicOn()) ctx.store.setState({ soundEnabled: false });
      else if (ctx.store.getState().soundEnabled === false) ctx.store.setState({ soundEnabled: true });
      let bgmWanted = ctx.store.getState().soundEnabled;
      if (bgm) {
        const vol = Number(localStorage.getItem('pythonia_music_vol') || 35);
        bgm.volume = Math.min(1, Math.max(0, vol / 100));
        const saved = Number(sessionStorage.getItem('pythonia_bgm_time') || '0');
        if (Number.isFinite(saved) && saved > 0) {
          bgm.addEventListener('loadedmetadata', () => {
            if (saved < bgm.duration) bgm.currentTime = saved;
          }, { once: true });
        }
        window.addEventListener('pagehide', () => {
          sessionStorage.setItem('pythonia_bgm_time', String(bgm.currentTime || 0));
        });
        const tryPlay = () => {
          if (!bgmWanted || !bgm.paused) return;
          bgm.play().catch(() => {});
        };
        ['pointerdown', 'touchend', 'click', 'keydown'].forEach((evt) =>
          window.addEventListener(evt, tryPlay, { passive: true })
        );
        tryPlay();
        applyTranslations(state.lang);
      }
      const setBgm = (on) => {
        bgmWanted = on;
        localStorage.setItem('pythonia_music_on', String(on));
        if (!bgm) return;
        if (on) bgm.play().catch(() => {});
        else bgm.pause();
      };

      if (soundBtn) {
        soundBtn.addEventListener('click', () => {
          const next = !ctx.store.getState().soundEnabled;
          ctx.store.setState({ soundEnabled: next });
          setBgm(next);
          applyTranslations(ctx.store.getState().lang);
          if (next) playChime('tap');
          ctx.toast(next ? 'Soothing music on ♪' : 'Music off');
        });
      }

      ctx.bus.on('audio:chime', (type) => playChime(type));
    }
  });
})(window);
