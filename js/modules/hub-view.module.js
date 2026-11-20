/* ============================================================================
 * js/modules/hub-view.module.js  (v1.1 Upgraded)
 * Fixes shipped:
 *   - Fix #3: Rich per-episode biome gradient emblems + lazy Drive thumbnail overlay + Golden Seal badge
 *   - Fix #4: Decoupled episode-grid rendering so search & filters never flicker or break 繁體中文 IME
 * ============================================================================ */
(function (global) {
  'use strict';

  const BIOME_GRADIENTS = [
    'linear-gradient(145deg, #163e2e, #0d231b)', // EP00 Whispering Forest
    'linear-gradient(145deg, #1b4332, #2d6a4f)', // EP01 Silent Village
    'linear-gradient(145deg, #4b3822, #261b10)', // EP02 Grandma Looma's Loom
    'linear-gradient(145deg, #4f251b, #24100d)', // EP03 Iron Outpost
    'linear-gradient(145deg, #164446, #0d2229)', // EP04 Whispering Gate
    'linear-gradient(145deg, #5c4514, #2b2009)', // EP05 Golden Vault
    'linear-gradient(145deg, #541c2c, #240c14)', // EP06 Red Shadow
    'linear-gradient(145deg, #273152, #12172b)', // EP07 Dragon's Library
    'linear-gradient(145deg, #3c2259, #1c102e)', // EP08 Crystal Cave
    'linear-gradient(145deg, #612c14, #2c1208)', // EP09 Dwarven Forge
    'linear-gradient(145deg, #1c3d59, #0e1e2e)', // EP10 Twin Illusions
    'linear-gradient(145deg, #463252, #1e1529)', // EP11 Final Crossroads
    'linear-gradient(145deg, #22543d, #5c4514)'  // EP12 Grand Finale
  ];

  function renderEpisodeGrid(ctx) {
    const grid = document.getElementById('hub-episode-grid');
    if (!grid) return;

    const state = ctx.store.getState();
    const m = ctx.manifest;
    const lang = state.lang;
    const readSet = new Set(state.readEpisodes);
    const sealSet = new Set(state.unlockedSeals);

    const q = (state.searchQuery || '').trim().toLowerCase();
    const filtered = m.episodes.filter((ep) => {
      if (state.filterMode === 'read' && !readSet.has(ep.episode)) return false;
      if (state.filterMode === 'unread' && readSet.has(ep.episode)) return false;
      if (!q) return true;
      const hay = `${ep.code} ${ep.title_en} ${ep.title_zh} ${ep.spellName} ${ep.spellCode}`.toLowerCase();
      return hay.includes(q);
    });

    if (!filtered.length) {
      grid.innerHTML = `<div class="progress-strip" style="grid-column:1/-1;justify-content:center;">No episodes match "${state.searchQuery}".</div>`;
      return;
    }

    grid.innerHTML = filtered.map((ep) => {
      const isRead = readSet.has(ep.episode);
      const isSealed = sealSet.has(ep.episode);
      const title = global.KaiComicI18n.formatEpTitle(ep, lang);
      const bg = BIOME_GRADIENTS[ep.episode] || BIOME_GRADIENTS[0];

      const thumbHtml = ep.localThumb
        ? `<img src="${ep.localThumb}" alt="${ep.title_en}" loading="lazy" decoding="async" />`
        : `<div class="ep-card__thumb-biome" style="background:${bg};">
             <span class="ep-card__thumb-icon" aria-hidden="true">${ep.icon}</span>
             <span class="ep-card__thumb-code">${ep.code}</span>
           </div>`;
      const likes = ep.baseLikes + (state.likedEpisodes.includes(ep.episode) ? 1 : 0);

      return `
        <button type="button" class="ep-card ${isRead ? 'is-read' : ''}" data-open-ep="${ep.episode}">
          <div class="ep-card__thumb">
            ${thumbHtml}
            ${isSealed ? '<span class="ep-card__seal-dot" title="Golden Spell Seal Earned">★</span>' : ''}
          </div>
          <div class="ep-card__body">
            <div class="ep-card__top">
              <span class="ep-card__epnum">${ep.code} · ${ep.spellName}</span>
              ${isRead ? '<span class="ep-card__status">✓ Read</span>' : `<span class="ep-card__status" style="opacity:0.75">${ep.readMinutes} min</span>`}
            </div>
            <h3 class="ep-card__title">${title}</h3>
            <div class="ep-card__spell">${ep.spellCode}</div>
            <div class="ep-card__foot">
              <span>♥ ${likes}</span>
              <span>${isSealed ? '🏅 Seal Earned' : `800×${ep.heightPx.toLocaleString()}px`}</span>
            </div>
          </div>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('[data-open-ep]').forEach((card) => {
      card.addEventListener('click', () => {
        ctx.bus.emit('reader:open', { episode: Number(card.getAttribute('data-open-ep')) });
      });
    });

    // Update filter pill active states
    document.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-filter') === state.filterMode));
    });
  }

  function renderHub(ctx) {
    const root = document.getElementById('view-hub');
    if (!root) return;

    const state = ctx.store.getState();
    const m = ctx.manifest;
    const lang = state.lang;
    const readSet = new Set(state.readEpisodes);
    const totalEps = m.episodes.length;
    const readCount = readSet.size;
    const pct = Math.round((readCount / totalEps) * 100);
    const baseSite = (global.KAI_COMIC_CONFIG && global.KAI_COMIC_CONFIG.parentBaseUrl) || m.parentSiteUrl;

    const resumeEpNum = state.lastReadEpisode !== null && state.lastReadEpisode !== undefined
      ? state.lastReadEpisode
      : 0;
    const resumeEp = m.episodes[resumeEpNum] || m.episodes[0];
    const hasStarted = state.lastReadEpisode !== null && state.lastReadEpisode !== undefined;

    const heroTitle = lang === 'zh-Hant' ? m.series_zh :
                      lang === 'en' ? m.series_en :
                      `${m.series_en}<span class="hub-title__zh">${m.series_zh}</span>`;
    const heroSub = lang === 'zh-Hant' ? m.subtitle_zh : m.subtitle_en;
    const synopsis = lang === 'zh-Hant'
      ? '在被蟲王奪去聲音的派森尼亞王國，平凡少年凱與小狗 String 展開奇幻冒險，逐一喚醒十一道善良的 Python 咒語，用傾聽與同理心療癒世界。'
      : 'When the Bug King silences the realm of Pythonia, an ordinary boy named Kai and his loyal pup String embark on a watercolor quest to awaken eleven Python spells of kindness.';

    const ctaText = hasStarted
      ? `▶ Continue ${resumeEp.code}`
      : '▶ Start Reading EP 00';

    root.innerHTML = `
      <header class="hub-hero">
        <img class="hub-hero__bg" src="${m.assets.heroBackdrop}" alt="Whispering Forest of Pythonia" />
        <div class="hub-hero__scrim" aria-hidden="true"></div>
        <div class="hub-hero__inner">
          <div class="hub-cover-frame">
            <img src="${m.assets.frontCover}" alt="${m.series_en} Volume 1 Front Cover" />
            <span class="hub-cover-badge">VOL. 1 · COMPLETE</span>
          </div>
          <div class="hub-meta">
            <nav class="hub-sitelinks" aria-label="Pythonia sites">
              <a class="hub-sitelink" href="./index.html">✨ ${lang === 'zh-Hant' ? '互動故事書' : lang === 'en' ? 'Storybook' : 'Storybook · 故事書'}</a>
              <a class="hub-sitelink" href="./hub.html">🏰 ${lang === 'zh-Hant' ? '學習中心' : lang === 'en' ? 'Learning Hub' : 'Learning Hub · 學習中心'}</a>
            </nav>
            <h1 class="hub-title">${heroTitle}</h1>
            <p class="hub-subtitle">${heroSub}</p>
            <p class="hub-synopsis">${synopsis}</p>
            <div class="hub-stats-row">
              <span class="hub-stat"><strong>13</strong> Episodes (EP00–EP12)</span>
              <span class="hub-stat"><strong>73</strong> Pages</span>
              <span class="hub-stat">By <strong>${m.author}</strong></span>
            </div>
            <div class="hub-cta-row">
              <button type="button" class="btn-webtoon-primary" id="hub-start-btn">${ctaText}</button>
              <button type="button" class="btn-webtoon-secondary" id="hub-grimoire-btn">📜 11 Spells Grimoire</button>
              <a class="btn-webtoon-secondary" href="${m.masterPdfUrl}" target="_blank" rel="noopener noreferrer">📥 Download 73-Page PDF</a>
            </div>
            <div class="hub-tags hub-tags--bottom">
              <span class="hub-tag">✨ WEBTOON VERTICAL SCROLL</span>
              <span class="hub-tag hub-tag--gold">EN + 繁體中文 BILINGUAL</span>
              <span class="hub-tag">🐍 LIVE SPELL PORTAL</span>
            </div>
          </div>
        </div>
      </header>

      <div class="hub-container">
        <div class="progress-strip">
          <span class="progress-strip__label">📖 Reading Progress: <strong>${readCount} / ${totalEps}</strong> Episodes (${pct}%)</span>
          <div class="progress-strip__track" aria-hidden="true">
            <div class="progress-strip__fill" style="width:${pct}%"></div>
          </div>
          <div id="hub-passport-slot"></div>
        </div>

        <div class="section-bar">
          <h2>${lang === 'zh-Hant' ? '全部章節 (EP00–EP12)' : 'Episodes · Volume 1 (EP00–EP12)'}</h2>
          <div class="filter-controls">
            <input class="search-input" id="hub-search-input" type="search" value="${state.searchQuery || ''}" placeholder="Search chapter or Python spell..." aria-label="Search episodes" />
            <button type="button" class="filter-pill" data-filter="all" aria-pressed="${state.filterMode === 'all'}">All (${totalEps})</button>
            <button type="button" class="filter-pill" data-filter="unread" aria-pressed="${state.filterMode === 'unread'}">Unread</button>
            <button type="button" class="filter-pill" data-filter="read" aria-pressed="${state.filterMode === 'read'}">Read</button>
          </div>
        </div>

        <div class="episode-grid" id="hub-episode-grid"></div>

        <section class="bonus-shelf" aria-label="Bonus Editions and Grimoire">
          <div class="bonus-card">
            <img class="bonus-card__img" src="${m.assets.spellGrimoire}" alt="The Eleven Spells Python Grimoire" loading="lazy" />
            <div class="bonus-card__body">
              <h3>📜 The Eleven Spells Grimoire</h3>
              <p>Quick-reference bilingual cheat sheet covering all 11 Python spells from print() to if/elif/else.</p>
              <button type="button" class="hud-btn hud-btn--primary" id="shelf-open-grimoire">Open Full Grimoire</button>
            </div>
          </div>

          <div class="bonus-card">
            <img class="bonus-card__img" src="${m.assets.backCover}" alt="Volume 1 Back Cover" loading="lazy" />
            <div class="bonus-card__body">
              <h3>📚 Complete 73-Page Collector's PDF</h3>
              <p>Printable A4 bilingual edition with Front Cover, Prologue, Chapters 1–12, Spell Grimoire, and Back Cover.</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <a class="hud-btn hud-btn--primary" href="${m.masterPdfUrl}" target="_blank" rel="noopener noreferrer">Download PDF (6.7 MB)</a>
                <button type="button" class="hud-btn" id="shelf-open-backcover">View Back Cover</button>
              </div>
            </div>
          </div>
        </section>

        <footer class="citadel-footer">
          <img class="citadel-footer__bg" src="${m.assets.citadelBackdrop}" alt="Crystal Citadel of Pythonia" loading="lazy" />
          <div class="citadel-footer__scrim" aria-hidden="true"></div>
          <div class="citadel-footer__content">
            <h3>Continue the Journey in Pythonia</h3>
            <p>Finished an episode? Step directly into the interactive 52-scene storybook, 12 Learning Sanctuaries, and hands-on Python spell lessons.</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <a class="btn-webtoon-primary" href="./index.html">✨ Visit Hero Kai Storybook →</a>
              <a class="btn-webtoon-secondary" href="./hub.html">🏰 Open Learning Hub →</a>
            </div>
          </div>
        </footer>
      </div>
    `;

    // Bind non-grid controls once
    document.getElementById('hub-start-btn').addEventListener('click', () => {
      ctx.bus.emit('reader:open', { episode: resumeEp.episode });
    });
    document.getElementById('hub-grimoire-btn').addEventListener('click', () => ctx.bus.emit('modal:open-grimoire'));
    document.getElementById('shelf-open-grimoire').addEventListener('click', () => ctx.bus.emit('modal:open-grimoire'));
    document.getElementById('shelf-open-backcover').addEventListener('click', () => ctx.bus.emit('modal:open-backcover'));

    root.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        ctx.store.setState({ filterMode: btn.getAttribute('data-filter') });
        renderEpisodeGrid(ctx);
      });
    });

    const searchInput = document.getElementById('hub-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        ctx.store.setState({ searchQuery: e.target.value });
        renderEpisodeGrid(ctx);
      });
    }

    renderEpisodeGrid(ctx);
    ctx.bus.emit('hub:rendered', { root });
  }

  global.KaiComic.registerModule({
    id: 'hub-view',
    mount(ctx) {
      renderHub(ctx);
      ctx.bus.on('lang:changed', () => renderHub(ctx));
      ctx.bus.on('episode:read', () => renderHub(ctx));
      ctx.bus.on('episode:liked', () => renderEpisodeGrid(ctx));
      ctx.bus.on('spell:unlocked', () => renderHub(ctx));
      ctx.bus.on('view:hub', () => renderHub(ctx));
    }
  });
})(window);
