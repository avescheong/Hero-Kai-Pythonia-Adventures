/* ============================================================================
 * js/modules/integration-bridge.module.js  (v1.1 Upgraded)
 * Fix #6: Keyboard Shortcuts modal
 * Fix #7: Environment-aware parent site routing (relative index.html / hub.html
 * when hosted inside kaipy.netlify.app or local repo; absolute URL when standalone)
 * ============================================================================ */
(function (global) {
  'use strict';

  function resolveParentBaseUrl(manifest) {
    if (global.KAI_COMIC_CONFIG && global.KAI_COMIC_CONFIG.parentBaseUrl) {
      return global.KAI_COMIC_CONFIG.parentBaseUrl;
    }
    return manifest.parentSiteUrl || './';
  }

  function openModal(title, html) {
    const backdrop = document.getElementById('comic-modal-backdrop');
    document.getElementById('comic-modal-title').textContent = title;
    document.getElementById('comic-modal-body').innerHTML = html;
    backdrop.hidden = false;
  }

  function closeModal() {
    document.getElementById('comic-modal-backdrop').hidden = true;
  }

  global.KaiComic.registerModule({
    id: 'integration-bridge',
    mount(ctx) {
      const parentBase = resolveParentBaseUrl(ctx.manifest);
      global.KAI_COMIC_CONFIG = Object.assign({}, global.KAI_COMIC_CONFIG, { parentBaseUrl: parentBase });

      // Wire parent site links dynamically
      const topPill = document.getElementById('kc-parent-site-link');
      if (topPill) topPill.href = parentBase === './' ? './index.html' : parentBase;
      const navStory = document.getElementById('nav-link-storybook');
      if (navStory) navStory.href = parentBase === './' ? './index.html' : parentBase;
      const navHub = document.getElementById('nav-link-hub');
      if (navHub) navHub.href = parentBase === './' ? './hub.html' : `${parentBase}hub.html`;

      const menuBtn = document.getElementById('kc-menu-btn');
      const navPanel = document.getElementById('kc-nav-panel');
      if (menuBtn && navPanel) {
        menuBtn.addEventListener('click', () => {
          const open = navPanel.hidden;
          navPanel.hidden = !open;
          menuBtn.setAttribute('aria-expanded', String(open));
        });
        document.addEventListener('click', (e) => {
          if (!navPanel.hidden && !e.target.closest('.kc-topbar-right')) {
            navPanel.hidden = true;
            menuBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      const modalClose = document.getElementById('comic-modal-close');
      const modalBackdrop = document.getElementById('comic-modal-backdrop');
      if (modalClose) modalClose.addEventListener('click', closeModal);
      if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
          if (e.target === modalBackdrop) closeModal();
        });
      }

      const openGrimoire = () => {
        if (navPanel) navPanel.hidden = true;
        openModal(
          '📜 The Eleven Spells of Kindness — Python Grimoire',
          `<img class="comic-modal__img" src="${ctx.manifest.assets.spellGrimoire}" alt="The Eleven Spells Python Grimoire" />`
        );
      };

      const openBackCover = () => {
        if (navPanel) navPanel.hidden = true;
        openModal(
          '📚 Volume 1 — Back Cover & Series Synopsis',
          `<img class="comic-modal__img" src="${ctx.manifest.assets.backCover}" alt="Volume 1 Back Cover" />`
        );
      };

      const openShortcuts = () => {
        if (navPanel) navPanel.hidden = true;
        openModal(
          '⌨️ Reader Keyboard Shortcuts',
          `<div class="shortcut-grid">
            <div class="shortcut-item"><span>Next / Previous Episode</span><span class="kbd-key">→ / ←</span></div>
            <div class="shortcut-item"><span>Smooth Scroll Down / Up</span><span class="kbd-key">J / K</span></div>
            <div class="shortcut-item"><span>Cycle Auto-Scroll (1x–3x)</span><span class="kbd-key">A</span></div>
            <div class="shortcut-item"><span>Hide / Show Reader HUD</span><span class="kbd-key">H</span></div>
            <div class="shortcut-item"><span>Open Episode Drawer</span><span class="kbd-key">D</span></div>
            <div class="shortcut-item"><span>Open 11 Spells Grimoire</span><span class="kbd-key">G</span></div>
            <div class="shortcut-item"><span>Close Modal / Drawer</span><span class="kbd-key">Esc</span></div>
            <div class="shortcut-item"><span>Show Shortcuts</span><span class="kbd-key">?</span></div>
          </div>`
        );
      };

      document.getElementById('nav-open-grimoire').addEventListener('click', openGrimoire);
      const navPassport = document.getElementById('nav-open-passport');
      if (navPassport) {
        navPassport.addEventListener('click', () => {
          if (navPanel) navPanel.hidden = true;
          ctx.bus.emit('spell:open-passport');
        });
      }

      ctx.bus.on('modal:open-grimoire', openGrimoire);
      ctx.bus.on('modal:open-backcover', openBackCover);
      ctx.bus.on('modal:open-shortcuts', openShortcuts);

      ctx.bus.on('episode:opened', ({ episode }) => {
        try {
          window.history.replaceState(null, '', `#ep=${String(episode.episode).padStart(2, '0')}`);
        } catch (_) {}
      });
      ctx.bus.on('view:hub', () => {
        try {
          window.history.replaceState(null, '', '#hub');
        } catch (_) {}
      });
    }
  });
})(window);
