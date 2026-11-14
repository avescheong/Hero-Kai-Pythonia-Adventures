/**
 * js/core/app-core.js
 * Hero Kai · Pythonia: Central State Store, Module Registry, Event Bus & Data Loader
 *
 * Architecture Overview:
 * `window.PythoniaApp` provides a clean, decoupled foundation so humans can
 * maintain individual features or add new modules without editing existing files.
 *
 * Lifecycle Hooks Supported by `PythoniaApp.registerModule(id, spec)`:
 *   - `init(app)`                  : Called once during `PythoniaApp.boot()`
 *   - `onWorldLoaded(world, app)`  : Called when `worldData` is loaded/updated
 *   - `onJingSiLoaded(list, app)`  : Called when `jingsiList` is loaded/updated
 *   - `onLangChange(lang, ui, app)`: Called whenever language switches (en / zh-Hant / dual)
 *   - `onScroll(scrollInfo, app)`  : Optional hook called on window scroll/resize
 */
(() => {
  "use strict";

  const { UI, INLINE_PORTRAITS, renderPortraitMarkup } = window.PythoniaI18n || {
    UI: { en: {}, "zh-Hant": {} },
    INLINE_PORTRAITS: {},
    renderPortraitMarkup: () => ""
  };

  /* ---- Pure Utility Helpers ------------------------------------------------ */
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const normalizeLove = (label) => {
    const s = String(label || "").toLowerCase();
    if (s.includes("other") || s.includes("愛人")) return "love-others";
    if (s.includes("yourself") || s.includes("愛己")) return "love-yourself";
    if (s.includes("earth") || s.includes("地球")) return "love-earth";
    return "all";
  };

  const scrollToReaderTop = () => {
    const reader = document.getElementById("story-reader");
    if (reader) {
      reader.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  };

  /* ---- Shared Reactive State ----------------------------------------------- */
  const savedLang = localStorage.getItem("pythonia_lang");
  const initialLang = ["en", "zh-Hant", "dual"].includes(savedLang) ? savedLang : "en";

  const state = {
    lang: initialLang,
    worldData: null,
    jingsiList: [],
    currentAphorism: null,
    activePartIdx: 0,
    activeSceneIdx: 0,
    readerMode: "paged", // "paged" | "spread" | "all"
    activeValueFilter: "all",
    selectedPillar: "Love Others",
    readParts: new Set([0])
  };

  const getUI = () => UI[state.lang === "zh-Hant" ? "zh-Hant" : "en"];

  const pickTxt = (enVal, zhVal) => {
    if (state.lang === "zh-Hant") return zhVal || enVal || "";
    if (state.lang === "dual") {
      return enVal && zhVal && enVal !== zhVal
        ? `${enVal}<br><span style="color:#ffd285;">${zhVal}</span>`
        : (enVal || zhVal || "");
    }
    return enVal || zhVal || "";
  };

  /* ---- Lightweight Pub/Sub Event Bus --------------------------------------- */
  const listeners = new Map();

  const on = (eventName, handler) => {
    if (!listeners.has(eventName)) listeners.set(eventName, new Set());
    listeners.get(eventName).add(handler);
    return () => listeners.get(eventName)?.delete(handler);
  };

  const emit = (eventName, payload) => {
    const set = listeners.get(eventName);
    if (!set) return;
    set.forEach((fn) => {
      try {
        fn(payload, App);
      } catch (err) {
        console.error(`[PythoniaApp] Error in event listener "${eventName}":`, err);
      }
    });
  };

  /* ---- Plug-and-Play Module Registry --------------------------------------- */
  const modules = new Map();
  let isBooted = false;

  const registerModule = (id, spec) => {
    if (!id || typeof spec !== "object") return;
    modules.set(id, spec);
    if (isBooted && typeof spec.init === "function") {
      spec.init(App);
      if (state.worldData && typeof spec.onWorldLoaded === "function") {
        spec.onWorldLoaded(state.worldData, App);
      }
      if (state.jingsiList.length && typeof spec.onJingSiLoaded === "function") {
        spec.onJingSiLoaded(state.jingsiList, App);
      }
      if (typeof spec.onLangChange === "function") {
        spec.onLangChange(state.lang, getUI(), App);
      }
    }
  };

  const getModule = (id) => modules.get(id) || null;

  /* ---- Language Application & DOM i18n Binding ----------------------------- */
  const applyLanguage = (newLang) => {
    state.lang = ["en", "zh-Hant", "dual"].includes(newLang) ? newLang : "en";
    localStorage.setItem("pythonia_lang", state.lang);
    document.documentElement.lang = state.lang === "zh-Hant" ? "zh-Hant" : "en";
    const t = getUI();
    if (t.pageTitle) document.title = t.pageTitle;

    document.querySelectorAll("[data-lang-btn]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang-btn") === state.lang));
    });

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (typeof t[key] === "string") {
        el.textContent = t[key];
      }
    });

    modules.forEach((mod, id) => {
      if (typeof mod.onLangChange === "function") {
        try {
          mod.onLangChange(state.lang, t, App);
        } catch (err) {
          console.error(`[PythoniaApp] Error in module "${id}.onLangChange":`, err);
        }
      }
    });

    emit("lang:change", { lang: state.lang, ui: t });
  };

  /* ---- Cross-Module Navigation Helper -------------------------------------- */
  const jumpToStoryPart = (partIdx = 0, sceneIdx = 0, mode = "paged", scroll = true) => {
    state.activePartIdx = Number(partIdx) || 0;
    state.activeSceneIdx = Number(sceneIdx) || 0;
    if (mode) state.readerMode = mode;
    const readerMod = getModule("storybook-reader");
    if (readerMod && typeof readerMod.render === "function") {
      readerMod.syncModeButtons?.();
      readerMod.render();
    }
    emit("reader:jump", {
      partIdx: state.activePartIdx,
      sceneIdx: state.activeSceneIdx,
      mode: state.readerMode
    });
    if (scroll) scrollToReaderTop();
  };

  /* ---- Data Loaders (Offline Fallback + Live Fetch) ------------------------ */
  const notifyJingSiLoaded = () => {
    modules.forEach((mod, id) => {
      if (typeof mod.onJingSiLoaded === "function") {
        try {
          mod.onJingSiLoaded(state.jingsiList, App);
        } catch (err) {
          console.error(`[PythoniaApp] Error in module "${id}.onJingSiLoaded":`, err);
        }
      }
    });
    emit("data:jingsi", state.jingsiList);
  };

  const loadJingSiAphorisms = async () => {
    // 1. Immediate offline fallback from js/data/jingsi-fallback.js (or inline script if present)
    try {
      if (window.PYTHONIA_JINGSI_FALLBACK && Array.isArray(window.PYTHONIA_JINGSI_FALLBACK.aphorisms)) {
        state.jingsiList = window.PYTHONIA_JINGSI_FALLBACK.aphorisms;
        notifyJingSiLoaded();
      } else {
        const el = document.getElementById("kc-jingsi-fallback");
        if (el && el.textContent.trim().length > 2) {
          const parsed = JSON.parse(el.textContent);
          if (parsed && Array.isArray(parsed.aphorisms) && parsed.aphorisms.length) {
            state.jingsiList = parsed.aphorisms;
            notifyJingSiLoaded();
          }
        }
      }
    } catch (err) {
      /* fallback below */
    }

    // 2. Refresh from data/jingsi_aphorisms.json when served over HTTP/HTTPS
    try {
      const res = await fetch("data/jingsi_aphorisms.json", { cache: "no-store" });
      if (res.ok) {
        const parsed = await res.json();
        if (parsed && Array.isArray(parsed.aphorisms) && parsed.aphorisms.length) {
          state.jingsiList = parsed.aphorisms;
          notifyJingSiLoaded();
        }
      }
    } catch (err) {
      /* offline fallback remains active */
    }
  };

  const notifyWorldLoaded = () => {
    modules.forEach((mod, id) => {
      if (typeof mod.onWorldLoaded === "function") {
        try {
          mod.onWorldLoaded(state.worldData, App);
        } catch (err) {
          console.error(`[PythoniaApp] Error in module "${id}.onWorldLoaded":`, err);
        }
      }
    });
    applyLanguage(state.lang);
    emit("data:world", state.worldData);
  };

  const loadWorld = async () => {
    // 1. Immediate offline fallback from js/data/world-fallback.js (or inline script if present)
    try {
      if (window.PYTHONIA_WORLD_FALLBACK && Array.isArray(window.PYTHONIA_WORLD_FALLBACK.storyParts)) {
        state.worldData = window.PYTHONIA_WORLD_FALLBACK;
        notifyWorldLoaded();
      } else {
        const fallbackEl = document.getElementById("kc-curriculum-fallback");
        if (fallbackEl && fallbackEl.textContent.trim().length > 2) {
          state.worldData = JSON.parse(fallbackEl.textContent);
          notifyWorldLoaded();
        }
      }
    } catch (err) {
      /* wait for fetch */
    }

    // 2. Refresh from data/world.json when served over HTTP/HTTPS
    try {
      const res = await fetch("data/world.json", { cache: "no-store" });
      if (res.ok) {
        state.worldData = await res.json();
        notifyWorldLoaded();
      }
    } catch (err) {
      /* offline fallback remains active */
    }
  };

  /* ---- Application Boot Sequence ------------------------------------------- */
  const boot = () => {
    if (isBooted) return;
    isBooted = true;

    if (window.ScrollCraft && typeof window.ScrollCraft.mount === "function") {
      window.ScrollCraft.mount();
    }

    modules.forEach((mod, id) => {
      if (typeof mod.init === "function") {
        try {
          mod.init(App);
        } catch (err) {
          console.error(`[PythoniaApp] Error initializing module "${id}":`, err);
        }
      }
    });

    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => applyLanguage(btn.getAttribute("data-lang-btn")));
    });

    loadJingSiAphorisms();
    loadWorld();
  };

  const App = {
    state,
    UI,
    INLINE_PORTRAITS,
    utils: {
      clamp01,
      reducedMotion,
      normalizeLove,
      getUI,
      pickTxt,
      renderPortraitMarkup,
      scrollToReaderTop
    },
    on,
    emit,
    registerModule,
    getModule,
    applyLanguage,
    jumpToStoryPart,
    loadJingSiAphorisms,
    loadWorld,
    boot
  };

  window.PythoniaApp = App;
})();
