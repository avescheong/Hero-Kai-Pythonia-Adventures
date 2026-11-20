/* ============================================================================
 * js/app.js
 * Bootstrap for Hero Kai · Pythonia Webtoon Comic Reader.
 * Mounts all registered modules and resolves initial hash route (#ep=XX).
 * ============================================================================ */
(function (global) {
  'use strict';

  function applyRouteFromHash() {
    const hash = window.location.hash || '';
    const m = hash.match(/ep=(\d+)/i);
    if (m) {
      const epNum = Number(m[1]);
      if (epNum >= 0 && epNum < global.KAI_COMIC_MANIFEST.episodes.length) {
        global.KaiComicBus.emit('reader:open', { episode: epNum });
      }
      return;
    }
    if (hash === '#hub') {
      const sealBtn = document.getElementById('kc-seal-home');
      const hubEl = document.getElementById('view-hub');
      if (sealBtn && hubEl && hubEl.hidden) {
        sealBtn.click();
      }
    }
  }

  function boot() {
    global.KaiComic.mountAll();
    applyRouteFromHash();
    window.addEventListener('hashchange', applyRouteFromHash);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
