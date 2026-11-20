/* ============================================================================
 * js/core/state-store.js
 * Reactive State Store with Safe localStorage Persistence.
 * ============================================================================ */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'kai_pythonia_webtoon_v1';

  const defaultState = {
    view: 'hub',             // 'hub' | 'reader'
    currentEpisode: 0,
    lastReadEpisode: null,
    readEpisodes: [],        // Array of episode numbers completed
    likedEpisodes: [],       // Array of episode numbers liked
    unlockedSeals: [],       // Array of spell seals earned (1..11 + 12)
    scrollBookmarks: {},     // { [epNum]: scrollRatio (0..1) }
    lang: 'dual',            // 'en' | 'zh-Hant' | 'dual'
    readerTheme: 'forest',   // 'forest' | 'cinema' | 'parchment'
    stripWidth: 800,         // 640 | 800 | 920
    brightness: 100,         // 65..100
    autoScrollSpeed: 0,      // 0 (off) | 1 | 2 | 3
    soundEnabled: true,
    hudHidden: false,
    filterMode: 'all',       // 'all' | 'unread' | 'read'
    searchQuery: ''
  };

  function loadPersisted() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function persist(state) {
    try {
      if (!global.localStorage) return;
      const toSave = {
        lastReadEpisode: state.lastReadEpisode,
        readEpisodes: state.readEpisodes,
        likedEpisodes: state.likedEpisodes,
        unlockedSeals: state.unlockedSeals,
        scrollBookmarks: state.scrollBookmarks,
        lang: state.lang,
        readerTheme: state.readerTheme,
        stripWidth: state.stripWidth,
        brightness: state.brightness,
        soundEnabled: state.soundEnabled
      };
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (_) {
      // Sandbox or private browsing — gracefully stay in-memory
    }
  }

  const state = Object.assign({}, defaultState, loadPersisted());

  const KaiComicStore = {
    getState() {
      return state;
    },

    setState(patch, eventName) {
      Object.assign(state, patch);
      persist(state);
      if (global.KaiComicBus) {
        global.KaiComicBus.emit('state:changed', { state, patch });
        if (eventName) {
          global.KaiComicBus.emit(eventName, { state, patch });
        }
      }
    },

    markEpisodeRead(epNum) {
      if (!state.readEpisodes.includes(epNum)) {
        const next = state.readEpisodes.concat(epNum).sort((a, b) => a - b);
        this.setState({ readEpisodes: next }, 'episode:read');
      }
    },

    toggleLike(epNum) {
      const exists = state.likedEpisodes.includes(epNum);
      const next = exists
        ? state.likedEpisodes.filter((n) => n !== epNum)
        : state.likedEpisodes.concat(epNum);
      this.setState({ likedEpisodes: next }, 'episode:liked');
      return !exists;
    },

    unlockSeal(epNum) {
      if (!state.unlockedSeals.includes(epNum)) {
        const next = state.unlockedSeals.concat(epNum).sort((a, b) => a - b);
        this.setState({ unlockedSeals: next }, 'spell:unlocked');
        return true;
      }
      return false;
    },

    saveScrollBookmark(epNum, ratio) {
      const clamped = Math.max(0, Math.min(1, Number(ratio) || 0));
      const next = Object.assign({}, state.scrollBookmarks, { [epNum]: clamped });
      this.setState({ scrollBookmarks: next, lastReadEpisode: epNum });
    }
  };

  global.KaiComicStore = KaiComicStore;
})(window);
