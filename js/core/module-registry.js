/* ============================================================================
 * js/core/module-registry.js
 * Plug-in Module Registry so future modules (Volume 2, Comments, Quizzes,
 * Character Codex) can be added via a single <script> tag without editing core.
 * ============================================================================ */
(function (global) {
  'use strict';

  const modules = new Map();
  let mounted = false;

  const KaiComic = {
    version: '1.0.0',

    registerModule(mod) {
      if (!mod || !mod.id) {
        console.warn('[KaiComic] Module missing required "id" field.');
        return;
      }
      if (modules.has(mod.id)) {
        console.warn(`[KaiComic] Overwriting module "${mod.id}".`);
      }
      modules.set(mod.id, mod);
      if (mounted && typeof mod.mount === 'function') {
        mod.mount(this.getContext());
      }
    },

    getModule(id) {
      return modules.get(id) || null;
    },

    listModules() {
      return Array.from(modules.keys());
    },

    getContext() {
      return {
        bus: global.KaiComicBus,
        store: global.KaiComicStore,
        manifest: global.KAI_COMIC_MANIFEST,
        toast: this.showToast.bind(this)
      };
    },

    mountAll() {
      if (mounted) return;
      mounted = true;
      const ctx = this.getContext();
      modules.forEach((mod) => {
        if (typeof mod.mount === 'function') {
          try {
            mod.mount(ctx);
          } catch (err) {
            console.error(`[KaiComic] Failed to mount module "${mod.id}":`, err);
          }
        }
      });
      if (global.KaiComicBus) {
        global.KaiComicBus.emit('app:ready', { modules: this.listModules() });
      }
    },

    showToast(message) {
      const el = document.getElementById('comic-toast');
      if (!el) return;
      el.textContent = message;
      el.classList.add('is-visible');
      clearTimeout(el._hideTimer);
      el._hideTimer = setTimeout(() => {
        el.classList.remove('is-visible');
      }, 2400);
    }
  };

  global.KaiComic = KaiComic;
})(window);
