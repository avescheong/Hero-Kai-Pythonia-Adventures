/* ============================================================================
 * js/modules/reader-stage.module.js  (v1.1 Upgraded)
 * Fixes shipped:
 *   - Fix #1: Restores saved scroll bookmark with a non-intrusive "Resume at XX%" banner
 *   - Fix #2: Floating scroll percentage pill + Back-to-Top button + Spell Orb jump
 *   - Fix #6: Full keyboard ergonomics (J/K panel step, H HUD toggle, A auto-scroll, ? shortcuts)
 *   - Fix #8: 1-click Share Episode Link (sandbox-safe clipboard) + Next Episode tile preloader
 * ============================================================================ */
(function (global) {
  'use strict';

  const preloadedEps = new Set();

  function copyShareLink(ctx, ep) {
    const base = window.location.href.split('#')[0];
    const url = `${base}#ep=${String(ep.episode).padStart(2, '0')}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        () => ctx.toast(`🔗 Copied link for ${ep.code}!`),
        () => fallbackCopy(ctx, url, ep)
      );
    } else {
      fallbackCopy(ctx, url, ep);
    }
  }

  function fallbackCopy(ctx, text, ep) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      ctx.toast(`🔗 Copied link for ${ep.code}!`);
    } catch (_) {
      ctx.toast(`Share hash: #ep=${String(ep.episode).padStart(2, '0')}`);
    }
  }

  function getActiveComicLang(state) {
    if (state.lang === 'zh-Hant') return 'zh-Hant';
    if (state.lang === 'en') return 'en';
    return state.comicLang === 'zh-Hant' ? 'zh-Hant' : 'en';
  }

  function getEpisodeTiles(ep, comicLang) {
    if (comicLang === 'zh-Hant' && ep.localTilesZh && ep.localTilesZh.length) {
      return ep.localTilesZh;
    }
    if (ep.localTilesEn && ep.localTilesEn.length) {
      return ep.localTilesEn;
    }
    return ep.localTiles || [];
  }

  function preloadNextEpisode(ctx, curEpNum) {
    const nextEp = ctx.manifest.episodes[curEpNum + 1];
    const comicLang = getActiveComicLang(ctx.store.getState());
    const key = nextEp ? `${nextEp.episode}:${comicLang}` : null;
    if (!nextEp || preloadedEps.has(key)) return;
    preloadedEps.add(key);
    const firstSrc = getEpisodeTiles(nextEp, comicLang)[0] || null;
    if (firstSrc) {
      const img = new Image();
      img.decoding = 'async';
      img.src = firstSrc;
    }
  }

  function openHub(ctx) {
    ctx.store.setState({ view: 'hub', hudHidden: false, autoScrollSpeed: 0 });
    document.body.classList.remove('view-reader', 'hud-hidden');
    document.body.classList.add('view-hub');
    document.getElementById('view-hub').hidden = false;
    document.getElementById('view-reader').hidden = true;
    const bar = document.getElementById('comic-progress-bar');
    if (bar) bar.style.width = '0%';
    window.scrollTo({ top: 0, behavior: 'instant' });
    ctx.bus.emit('view:hub');
    ctx.bus.emit('autoscroll:stop');
  }

  function renderDrawer(ctx) {
    const list = document.getElementById('drawer-list');
    if (!list) return;
    const state = ctx.store.getState();
    const readSet = new Set(state.readEpisodes);
    const sealSet = new Set(state.unlockedSeals);

    list.innerHTML = ctx.manifest.episodes.map((ep) => {
      const active = ep.episode === state.currentEpisode;
      const read = readSet.has(ep.episode);
      const sealed = sealSet.has(ep.episode);
      const title = global.KaiComicI18n.formatEpTitle(ep, state.lang);
      return `
        <button type="button" class="drawer-item ${active ? 'is-active' : ''} ${read ? 'is-read' : ''}" data-drawer-ep="${ep.episode}">
          <span class="drawer-item__num">${String(ep.episode).padStart(2, '0')}</span>
          <span class="drawer-item__info">
            <div class="drawer-item__title">${title}</div>
            <div class="drawer-item__spell">${ep.spellCode}</div>
          </span>
          <span style="font-size:0.8rem;color:${sealed ? 'var(--kc-gold)' : 'var(--sc-accent)'}">${sealed ? '🏅' : read ? '✓' : ''}</span>
        </button>
      `;
    }).join('');

    list.querySelectorAll('[data-drawer-ep]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const epNum = Number(btn.getAttribute('data-drawer-ep'));
        closeDrawer();
        openEpisode(ctx, epNum);
      });
    });
  }

  function openDrawer(ctx) {
    renderDrawer(ctx);
    document.getElementById('drawer-backdrop').hidden = false;
    document.getElementById('episode-drawer').hidden = false;
  }

  function closeDrawer() {
    document.getElementById('drawer-backdrop').hidden = true;
    document.getElementById('episode-drawer').hidden = true;
  }

  function openEpisode(ctx, epNum, opts) {
    const options = opts || {};
    const preserveRatio = typeof options.preserveRatio === 'number' ? options.preserveRatio : null;
    const episodes = ctx.manifest.episodes;
    const ep = episodes[epNum] || episodes[0];
    const savedRatio = ctx.store.getState().scrollBookmarks[ep.episode] || 0;

    ctx.store.setState({
      view: 'reader',
      currentEpisode: ep.episode,
      lastReadEpisode: ep.episode,
      hudHidden: false
    });

    document.body.classList.remove('view-hub', 'hud-hidden');
    document.body.classList.add('view-reader');
    document.getElementById('view-hub').hidden = true;
    document.getElementById('view-reader').hidden = false;

    const stNow = ctx.store.getState();
    const lang = stNow.lang;
    const comicLang = getActiveComicLang(stNow);
    const title = global.KaiComicI18n.formatEpTitle(ep, lang);

    // 1. Episode Header Banner + Edition Switcher + Share Button
    const banner = document.getElementById('reader-ep-banner');
    banner.innerHTML = `
      <div class="reader-ep-banner__meta">
        <span class="reader-ep-banner__kicker">${ep.code} · ${ep.spellName} · ~${ep.readMinutes} MIN READ</span>
        <h1 class="reader-ep-banner__title">${title}</h1>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span class="reader-ep-banner__spell">🐍 ${ep.spellCode}</span>
        <div class="reader-lang-switch" role="group" aria-label="Comic edition language">
          <button type="button" class="reader-lang-btn" data-comic-lang="en" aria-pressed="${comicLang === 'en'}">EN Comic</button>
          <button type="button" class="reader-lang-btn" data-comic-lang="zh-Hant" aria-pressed="${comicLang === 'zh-Hant'}">繁體中文</button>
        </div>
        <button type="button" class="hud-btn" id="reader-share-btn" title="Copy direct link to this episode">🔗 Share</button>
      </div>
    `;
    document.getElementById('reader-share-btn').addEventListener('click', () => copyShareLink(ctx, ep));
    banner.querySelectorAll('[data-comic-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextComicLang = btn.getAttribute('data-comic-lang');
        if (nextComicLang === comicLang) return;
        const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const ratio = Math.max(0, Math.min(1, window.scrollY / docH));
        const curSt = ctx.store.getState();
        if (curSt.lang === 'dual') {
          ctx.store.setState({ comicLang: nextComicLang });
          openEpisode(ctx, ep.episode, { preserveRatio: ratio, silent: true });
        } else {
          ctx.store.setState({ lang: nextComicLang, comicLang: nextComicLang }, 'lang:changed');
          ctx.bus.emit('lang:sync-ui');
        }
        ctx.toast(nextComicLang === 'zh-Hant' ? '已切換至繁體中文漫畫' : 'Switched to English Comic');
      });
    });

    // 2. Fix #1: Smart Resume Scroll Bookmark Banner
    const resumeSlot = document.getElementById('reader-resume-banner');
    if (resumeSlot) {
      if (preserveRatio === null && savedRatio >= 0.08 && savedRatio <= 0.92) {
        const pct = Math.round(savedRatio * 100);
        resumeSlot.hidden = false;
        resumeSlot.innerHTML = `
          <span>🔖 Welcome back! You paused around <strong>${pct}%</strong> in ${ep.code}.</span>
          <div style="display:flex;gap:8px;">
            <button type="button" class="hud-btn hud-btn--primary" id="btn-resume-scroll">Jump to ${pct}%</button>
            <button type="button" class="hud-btn" id="btn-dismiss-resume">✕</button>
          </div>
        `;
        document.getElementById('btn-resume-scroll').addEventListener('click', () => {
          const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          window.scrollTo({ top: Math.round(docH * savedRatio), behavior: 'smooth' });
          resumeSlot.hidden = true;
        });
        document.getElementById('btn-dismiss-resume').addEventListener('click', () => {
          resumeSlot.hidden = true;
        });
      } else {
        resumeSlot.hidden = true;
      }
    }

    // 3. Seamless Vertical Webtoon Strip Canvas (EN or 繁體中文 v5.3 tiles)
    const canvas = document.getElementById('webtoon-canvas');
    canvas.innerHTML = '';
    canvas.dataset.comicLang = comicLang;

    const tiles = getEpisodeTiles(ep, comicLang);
    const activeFilename = (comicLang === 'zh-Hant' ? ep.filenameZh : ep.filenameEn) || ep.filename;

    const restoreScroll = () => {
      if (preserveRatio === null || preserveRatio <= 0) return;
      const newDocH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: Math.round(newDocH * preserveRatio), behavior: 'instant' });
    };

    if (tiles.length) {
      tiles.forEach((tileSrc, idx) => {
        const img = document.createElement('img');
        img.className = 'webtoon-tile';
        img.src = tileSrc;
        img.alt = comicLang === 'zh-Hant'
          ? `${ep.title_zh} — 第 ${idx + 1} 段`
          : `${ep.title_en} — Panel Strip ${idx + 1}`;
        img.decoding = 'async';
        if (idx > 1) img.loading = 'lazy';
        if (preserveRatio !== null && preserveRatio > 0 && idx < 3) {
          img.addEventListener('load', restoreScroll, { once: true });
        }
        canvas.appendChild(img);
      });
    } else {
      const loader = document.createElement('div');
      loader.className = 'webtoon-loader';
      loader.textContent = `Loading ${ep.code} (${activeFilename})...`;
      canvas.appendChild(loader);

      const img = document.createElement('img');
      img.className = 'webtoon-tile';
      img.alt = ep.title_en;
      img.decoding = 'async';

      const driveDirect = `https://lh3.googleusercontent.com/d/${ep.driveId}=w800`;
      const candidates = window.KAI_SELF_CONTAINED
        ? [driveDirect, activeFilename, `comics/${activeFilename}`]
        : [activeFilename, `comics/${activeFilename}`, driveDirect];
      let candIdx = 0;

      img.onload = () => {
        if (loader.parentNode) loader.remove();
      };
      img.onerror = () => {
        candIdx++;
        if (candIdx < candidates.length) {
          img.src = candidates[candIdx];
        } else {
          if (loader.parentNode) loader.remove();
          img.remove();
          const fb = document.createElement('div');
          fb.className = 'webtoon-fallback-card';
          fb.innerHTML = `
            <div style="font-size:2.4rem;margin-bottom:8px;">${ep.icon}</div>
            <h3>${ep.code} · ${title}</h3>
            <p>${global.KaiComicI18n.formatEpSummary(ep, lang)}</p>
            <p style="font-size:0.8rem;color:var(--sc-ink-muted);">
              For offline reading, place <code>${activeFilename}</code> inside <code>comics/</code> — or open the full strip on Google Drive, or cast this episode's Live Python Spell right below!
            </p>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
              <a class="btn-webtoon-primary" href="https://drive.google.com/file/d/${ep.driveId}/view?usp=drivesdk" target="_blank" rel="noopener noreferrer">📖 Open Full Strip on Drive ↗</a>
              <button type="button" class="btn-webtoon-secondary" data-fb-ep="0">Read EP 00 (Bundled)</button>
              <button type="button" class="btn-webtoon-secondary" data-fb-ep="1">Read EP 01 (Bundled)</button>
            </div>
          `;
          fb.querySelectorAll('[data-fb-ep]').forEach((b) => {
            b.addEventListener('click', () => openEpisode(ctx, Number(b.getAttribute('data-fb-ep'))));
          });
          canvas.appendChild(fb);
        }
      };

      img.src = candidates[0];
      canvas.appendChild(img);
    }

    // 4. Update Bottom HUD & Float Rail
    const pctDisplay = preserveRatio !== null ? Math.round(preserveRatio * 100) : 0;
    document.getElementById('hud-ep-code').textContent = `${ep.code} · ${pctDisplay}%`;
    document.getElementById('hud-ep-title').textContent = comicLang === 'zh-Hant' ? ep.title_zh : ep.title_en;
    document.getElementById('hud-btn-prev').disabled = ep.episode <= 0;
    document.getElementById('hud-btn-next').disabled = ep.episode >= episodes.length - 1;
    const pctPill = document.getElementById('float-pct-btn');
    if (pctPill) pctPill.textContent = `${pctDisplay}%`;

    // 5. Render End-of-Episode Card
    renderEndCard(ctx, ep);

    if (preserveRatio !== null) {
      requestAnimationFrame(restoreScroll);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    ctx.bus.emit('episode:opened', { episode: ep });
    if (!options.silent) ctx.bus.emit('audio:chime', 'tap');
  }

  function renderEndCard(ctx, ep) {
    const endCard = document.getElementById('reader-end-card');
    const state = ctx.store.getState();
    const isLiked = state.likedEpisodes.includes(ep.episode);
    const likes = ep.baseLikes + (isLiked ? 1 : 0);
    const nextEp = ctx.manifest.episodes[ep.episode + 1];
    const baseSite = (global.KAI_COMIC_CONFIG && global.KAI_COMIC_CONFIG.parentBaseUrl) || ctx.manifest.parentSiteUrl;

    endCard.innerHTML = `
      <div class="reader-end-card__top">
        <div>
          <span class="reader-ep-banner__kicker">END OF ${ep.code}</span>
          <h2 class="reader-end-card__title">${nextEp ? `Up Next: ${nextEp.code} — ${nextEp.title_en}` : 'You Completed Volume 1!'}</h2>
        </div>
        <div style="display:flex;gap:8px;">
          <button type="button" class="like-btn ${isLiked ? 'is-liked' : ''}" id="end-like-btn">
            <span>${isLiked ? '♥' : '♡'}</span>
            <span>${likes}</span>
          </button>
          <button type="button" class="like-btn" id="end-share-btn">🔗 Share</button>
        </div>
      </div>
      <div class="reader-end-actions">
        ${nextEp
          ? `<button type="button" class="btn-webtoon-primary" id="end-next-btn">Next Episode: ${nextEp.code} →</button>`
          : `<button type="button" class="btn-webtoon-primary" id="end-grimoire-btn">📜 View 11 Spells Grimoire</button>`}
        <button type="button" class="btn-webtoon-secondary" id="end-hub-btn">← All 13 Episodes</button>
        <a class="btn-webtoon-secondary" href="./hub.html">🏰 Practice in Learning Hub →</a>
          <a class="btn-webtoon-secondary" href="./index.html">✨ Back to Storybook →</a>
      </div>
    `;

    document.getElementById('end-like-btn').addEventListener('click', () => {
      const liked = ctx.store.toggleLike(ep.episode);
      ctx.bus.emit('audio:chime', 'like');
      renderEndCard(ctx, ep);
      ctx.toast(liked ? `Loved ${ep.code}! ♥` : `Removed heart from ${ep.code}`);
    });
    document.getElementById('end-share-btn').addEventListener('click', () => copyShareLink(ctx, ep));

    const nextBtn = document.getElementById('end-next-btn');
    if (nextBtn && nextEp) nextBtn.addEventListener('click', () => openEpisode(ctx, nextEp.episode));

    const grimBtn = document.getElementById('end-grimoire-btn');
    if (grimBtn) grimBtn.addEventListener('click', () => ctx.bus.emit('modal:open-grimoire'));

    document.getElementById('end-hub-btn').addEventListener('click', () => openHub(ctx));
  }

  global.KaiComic.registerModule({
    id: 'reader-stage',
    mount(ctx) {
      document.getElementById('kc-seal-home').addEventListener('click', (e) => {
        e.preventDefault();
        openHub(ctx);
      });
      document.getElementById('nav-go-hub').addEventListener('click', () => {
        document.getElementById('kc-nav-panel').hidden = true;
        openHub(ctx);
      });
      document.getElementById('hud-btn-hub').addEventListener('click', () => openHub(ctx));
      document.getElementById('hud-btn-prev').addEventListener('click', () => {
        const cur = ctx.store.getState().currentEpisode;
        if (cur > 0) openEpisode(ctx, cur - 1);
      });
      document.getElementById('hud-btn-next').addEventListener('click', () => {
        const cur = ctx.store.getState().currentEpisode;
        if (cur < ctx.manifest.episodes.length - 1) openEpisode(ctx, cur + 1);
      });
      document.getElementById('hud-ep-switcher').addEventListener('click', () => openDrawer(ctx));
      document.getElementById('drawer-close-btn').addEventListener('click', closeDrawer);
      document.getElementById('drawer-backdrop').addEventListener('click', closeDrawer);

      // Float Rail buttons (Fix #2 + v2.0 Spell Orb)
      const topBtn = document.getElementById('float-top-btn');
      if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
      const spellOrb = document.getElementById('float-spell-btn');
      if (spellOrb) spellOrb.addEventListener('click', () => ctx.bus.emit('spell:jump-to-portal'));

      // Tap comic strip to toggle auto-hide HUD
      document.getElementById('webtoon-canvas').addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        const hidden = !ctx.store.getState().hudHidden;
        ctx.store.setState({ hudHidden: hidden });
        document.body.classList.toggle('hud-hidden', hidden);
        const pop = document.getElementById('comfort-popover');
        if (hidden && pop) pop.hidden = true;
      });

      // Scroll progress + mark read + preload next episode
      let scrollTimer = null;
      window.addEventListener('scroll', () => {
        const st = ctx.store.getState();
        if (st.view !== 'reader') return;
        const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const ratio = Math.max(0, Math.min(1, window.scrollY / docH));
        const pct = Math.round(ratio * 100);
        const bar = document.getElementById('comic-progress-bar');
        if (bar) bar.style.width = `${pct}%`;

        const ep = ctx.manifest.episodes[st.currentEpisode];
        const hudCode = document.getElementById('hud-ep-code');
        if (hudCode && ep) hudCode.textContent = `${ep.code} · ${pct}%`;
        const pctBtn = document.getElementById('float-pct-btn');
        if (pctBtn) pctBtn.textContent = `${pct}%`;

        if (ratio >= 0.60) preloadNextEpisode(ctx, st.currentEpisode);
        if (ratio >= 0.72) ctx.store.markEpisodeRead(st.currentEpisode);

        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          ctx.store.saveScrollBookmark(st.currentEpisode, ratio);
        }, 350);
      }, { passive: true });

      // Fix #6: Full Keyboard Ergonomics
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const st = ctx.store.getState();
        if (e.key === 'Escape') {
          closeDrawer();
          document.getElementById('comic-modal-backdrop').hidden = true;
          document.getElementById('comfort-popover').hidden = true;
          return;
        }
        if (e.key === '?') {
          ctx.bus.emit('modal:open-shortcuts');
          return;
        }
        if (st.view !== 'reader') return;
        if (e.key === 'ArrowRight' && st.currentEpisode < ctx.manifest.episodes.length - 1) {
          openEpisode(ctx, st.currentEpisode + 1);
        } else if (e.key === 'ArrowLeft' && st.currentEpisode > 0) {
          openEpisode(ctx, st.currentEpisode - 1);
        } else if (e.key.toLowerCase() === 'j') {
          window.scrollBy({ top: Math.round(window.innerHeight * 0.75), behavior: 'smooth' });
        } else if (e.key.toLowerCase() === 'k') {
          window.scrollBy({ top: -Math.round(window.innerHeight * 0.75), behavior: 'smooth' });
        } else if (e.key.toLowerCase() === 'h') {
          const hidden = !st.hudHidden;
          ctx.store.setState({ hudHidden: hidden });
          document.body.classList.toggle('hud-hidden', hidden);
        } else if (e.key.toLowerCase() === 'a') {
          ctx.bus.emit('autoscroll:cycle');
        } else if (e.key.toLowerCase() === 'd') {
          openDrawer(ctx);
        } else if (e.key.toLowerCase() === 'g') {
          ctx.bus.emit('modal:open-grimoire');
        }
      });

      ctx.bus.on('reader:open', ({ episode }) => openEpisode(ctx, episode));
      ctx.bus.on('lang:changed', () => {
        const st = ctx.store.getState();
        if (st.view === 'reader') {
          const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const ratio = window.scrollY > 20 ? Math.max(0, Math.min(1, window.scrollY / docH)) : 0;
          openEpisode(ctx, st.currentEpisode, { preserveRatio: ratio, silent: true });
        }
      });
    }
  });
})(window);
