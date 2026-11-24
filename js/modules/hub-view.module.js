/* ============================================================================
 * js/modules/hub-view.module.js  (v1.2 — Vol. 1 + Vol. 2 Series Hub)
 *   - Supports Volume 1 (EP00–EP12) & Volume 2 (EP13–EP19) with clean section headers
 *   - Volume filter pills (All 20 / Vol. 1 · 13 / Vol. 2 · 7) + Read/Unread + Search
 *   - Bonus Shelf includes Vol. 2 2x Retina HD Cover Showcase card
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
    'linear-gradient(145deg, #22543d, #5c4514)', // EP12 Grand Finale
    'linear-gradient(145deg, #5c1f1a, #24130f)', // EP13 Kai's New Companion (Ember)
    'linear-gradient(145deg, #5c4714, #2b2108)', // EP14 Enchanted Piggy Bank
    'linear-gradient(145deg, #2b265e, #12102b)', // EP15 Cosmic Scoops
    'linear-gradient(145deg, #1b385c, #0c1a2e)', // EP16 Wizard's Arcade
    'linear-gradient(145deg, #144d3c, #0a241c)', // EP17 Sealed Chamber
    'linear-gradient(145deg, #632717, #2e110a)', // EP18 Dragon of Ember Peak
    'linear-gradient(145deg, #3f285c, #5c4514)'  // EP19 Missing Crown Finale
  ];

  function renderEpisodeCard(ep, ctx, state, readSet, sealSet) {
    const isRead = readSet.has(ep.episode);
    const isSealed = sealSet.has(ep.episode);
    const title = global.KaiComicI18n.formatEpTitle(ep, state.lang);
    const bg = BIOME_GRADIENTS[ep.episode] || BIOME_GRADIENTS[0];

    const thumbHtml = ep.localThumb
      ? `<img src="${ep.localThumb}" alt="${ep.title_en}" loading="lazy" decoding="async" />`
      : `<div class="ep-card__thumb-biome" style="background:${bg};">
           <span class="ep-card__thumb-icon" aria-hidden="true">${ep.icon}</span>
           <span class="ep-card__thumb-code">${ep.code}</span>
         </div>`;
    const likes = ep.baseLikes + (state.likedEpisodes.includes(ep.episode) ? 1 : 0);
    const epHeight = state.lang === 'zh-Hant' ? (ep.heightPxZh || ep.heightPx) : (ep.heightPxEn || ep.heightPx);

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
            <span>${isSealed ? '🏅 Seal Earned' : `800×${epHeight.toLocaleString()}px`}</span>
          </div>
        </div>
      </button>
    `;
  }

  function renderEpisodeGrid(ctx) {
    const grid = document.getElementById('hub-episode-grid');
    if (!grid) return;

    const state = ctx.store.getState();
    const m = ctx.manifest;
    const lang = state.lang;
    const readSet = new Set(state.readEpisodes);
    const sealSet = new Set(state.unlockedSeals);
    const volFilter = state.volumeFilter || 'all';

    const q = (state.searchQuery || '').trim().toLowerCase();
    const filtered = m.episodes.filter((ep) => {
      const epVol = String(ep.volume || 1);
      if (volFilter !== 'all' && epVol !== volFilter) return false;
      if (state.filterMode === 'read' && !readSet.has(ep.episode)) return false;
      if (state.filterMode === 'unread' && readSet.has(ep.episode)) return false;
      if (!q) return true;
      const hay = `${ep.code} vol${epVol} ${ep.title_en} ${ep.title_zh} ${ep.spellName} ${ep.spellCode}`.toLowerCase();
      return hay.includes(q);
    });

    if (!filtered.length) {
      grid.innerHTML = `<div class="progress-strip" style="grid-column:1/-1;justify-content:center;">No episodes match "${state.searchQuery}".</div>`;
      return;
    }

    const v1Eps = filtered.filter((ep) => (ep.volume || 1) === 1);
    const v2Eps = filtered.filter((ep) => ep.volume === 2);

    const chunks = [];
    if (v1Eps.length) {
      chunks.push(`
        <div class="vol-divider">
          <h3 class="vol-divider__title">${lang === 'zh-Hant' ? '🌿 第一卷：十一道善良的咒語 (EP00–EP12)' : '🌿 Volume 1 · The Eleven Spells of Kindness (EP00–EP12)'}</h3>
          <span class="vol-divider__meta">${v1Eps.length} Episodes · Core Python Spells</span>
        </div>
      `);
      chunks.push(...v1Eps.map((ep) => renderEpisodeCard(ep, ctx, state, readSet, sealSet)));
    }
    if (v2Eps.length) {
      chunks.push(`
        <div class="vol-divider">
          <h3 class="vol-divider__title">${lang === 'zh-Hant' ? '🐉 第二卷：派森尼亞魔導卷軸新冒險 (EP13–EP19)' : '🐉 Volume 2 · The Scrolls of Pythonia (EP13–EP19)'}</h3>
          <span class="vol-divider__meta">${v2Eps.length} Episodes · 2× Retina HD Covers</span>
        </div>
      `);
      chunks.push(...v2Eps.map((ep) => renderEpisodeCard(ep, ctx, state, readSet, sealSet)));
    }

    grid.innerHTML = chunks.join('');

    grid.querySelectorAll('[data-open-ep]').forEach((card) => {
      const epNum = Number(card.getAttribute('data-open-ep'));
      card.addEventListener('click', () => {
        ctx.bus.emit('reader:open', { episode: epNum });
      });
      card.addEventListener('mouseenter', () => {
        ctx.bus.emit('hyperframe:preview', { episode: epNum });
      });
      card.addEventListener('focus', () => {
        ctx.bus.emit('hyperframe:preview', { episode: epNum });
      });
    });

    if (!grid.dataset.hfBound) {
      grid.dataset.hfBound = 'true';
      grid.addEventListener('mouseleave', () => ctx.bus.emit('hyperframe:preview-clear'));
      grid.addEventListener('focusout', (e) => {
        if (!grid.contains(e.relatedTarget)) ctx.bus.emit('hyperframe:preview-clear');
      });
    }

    document.querySelectorAll('[data-vol-filter]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-vol-filter') === volFilter));
    });
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
    const v1Count = m.episodes.filter((e) => (e.volume || 1) === 1).length;
    const v2Count = m.episodes.filter((e) => e.volume === 2).length;
    const readCount = readSet.size;
    const pct = Math.round((readCount / totalEps) * 100);
    const volFilter = state.volumeFilter || 'all';

    const resumeEpNum = state.lastReadEpisode !== null && state.lastReadEpisode !== undefined
      ? state.lastReadEpisode
      : 0;
    const resumeEp = m.episodes.find((e) => e.episode === resumeEpNum) || m.episodes[0];
    const hasStarted = state.lastReadEpisode !== null && state.lastReadEpisode !== undefined;

    const heroTitle = lang === 'zh-Hant' ? m.series_zh :
                      lang === 'en' ? m.series_en :
                      `${m.series_en}<span class="hub-title__zh">${m.series_zh}</span>`;
    const heroSub = lang === 'zh-Hant' ? m.subtitle_zh : m.subtitle_en;
    const synopsis = lang === 'zh-Hant'
      ? '在被蟲王奪去聲音的派森尼亞王國，平凡少年凱與小狗 String 展開奇幻冒險，從第一卷十一道善良咒語到第二卷紅龍寶寶與神秘王冠試煉，一步步用同理心與 Python 程式守護王國！'
      : 'When the Bug King silences Pythonia, an ordinary boy named Kai and his loyal pup String awaken eleven Python spells of kindness in Volume 1 — then team up with baby red dragon Ember in Volume 2!';

    const ctaText = hasStarted
      ? `▶ Continue ${resumeEp.code}`
      : '▶ Start Reading EP 00';
    const vol2CoverImg = (lang === 'zh-Hant' || (lang === 'dual' && state.comicLang === 'zh-Hant'))
      ? (m.assets.vol2CoverZh || m.assets.vol2CoverEn)
      : (m.assets.vol2CoverEn || m.assets.frontCover);

    root.innerHTML = `
      <header class="hub-hero">
        <img class="hub-hero__bg" src="${m.assets.heroBackdrop}" alt="Whispering Forest of Pythonia" />
        <div class="hub-hero__scrim" aria-hidden="true"></div>
        <div class="hub-hero__inner">
          <div class="hub-cover-frame">
            <img src="${m.assets.frontCover}" alt="${m.series_en} Cover" />
            <span class="hub-cover-badge">VOL. 1 &amp; 2 · COMPLETE</span>
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
              <span class="hub-stat"><strong>2</strong> Volumes (Vol. 1 &amp; 2)</span>
              <span class="hub-stat"><strong>${totalEps}</strong> Episodes (EP00–EP19)</span>
              <span class="hub-stat">By <strong>${m.author}</strong></span>
            </div>
            <div class="hub-cta-row">
              <button type="button" class="btn-webtoon-primary" id="hub-start-btn">${ctaText}</button>
              <button type="button" class="btn-webtoon-secondary" id="hub-vol2-btn">🐉 Read Vol. 2 (EP 13)</button>
              <button type="button" class="btn-webtoon-secondary" id="hub-grimoire-btn">📜 11 Spells Grimoire</button>
              <a class="btn-webtoon-secondary" href="${m.masterPdfUrl}" target="_blank" rel="noopener noreferrer">📥 Vol. 1 PDF</a>
            </div>
            <div class="hub-tags hub-tags--bottom">
              <span class="hub-tag">✨ WEBTOON VERTICAL SCROLL</span>
              <span class="hub-tag hub-tag--gold">EN + 繁體中文 BILINGUAL</span>
              <span class="hub-tag">🐍 20 LIVE SPELL PORTALS</span>
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
          <h2>${lang === 'zh-Hant' ? '全部章節 (EP00–EP19)' : 'Episodes · Vol. 1 & Vol. 2 (EP00–EP19)'}</h2>
          <div class="filter-controls">
            <input class="search-input" id="hub-search-input" type="search" value="${state.searchQuery || ''}" placeholder="Search chapter or Python spell..." aria-label="Search episodes" />
            <button type="button" class="filter-pill" data-vol-filter="all" aria-pressed="${volFilter === 'all'}">All (${totalEps})</button>
            <button type="button" class="filter-pill" data-vol-filter="1" aria-pressed="${volFilter === '1'}">Vol. 1 (${v1Count})</button>
            <button type="button" class="filter-pill" data-vol-filter="2" aria-pressed="${volFilter === '2'}">Vol. 2 (${v2Count})</button>
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
            <img class="bonus-card__img" src="${vol2CoverImg}" alt="Volume 2 HD Cover Showcase" loading="lazy" />
            <div class="bonus-card__body">
              <h3>🐉 Vol. 2 · 2× Retina HD Covers</h3>
              <p>All 7 Volume 2 episodes (EP13–EP19) feature bespoke 2× Retina HD bilingual vector covers and zero-drift art.</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <a class="hud-btn hud-btn--primary" href="${m.vol2CoverShowcaseUrl || m.vol2FolderUrl}" target="_blank" rel="noopener noreferrer">HD Cover Showcase PDF</a>
                <button type="button" class="hud-btn" id="shelf-open-vol2cover">Preview Cover</button>
              </div>
            </div>
          </div>

          <div class="bonus-card">
            <img class="bonus-card__img" src="${m.assets.backCover}" alt="Volume 1 Back Cover" loading="lazy" />
            <div class="bonus-card__body">
              <h3>📚 Vol. 1 · 73-Page Collector's PDF</h3>
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

    document.getElementById('hub-start-btn').addEventListener('click', () => {
      ctx.bus.emit('reader:open', { episode: resumeEp.episode });
    });
    document.getElementById('hub-vol2-btn').addEventListener('click', () => {
      ctx.bus.emit('reader:open', { episode: 13 });
    });
    document.getElementById('hub-grimoire-btn').addEventListener('click', () => ctx.bus.emit('modal:open-grimoire'));
    document.getElementById('shelf-open-grimoire').addEventListener('click', () => ctx.bus.emit('modal:open-grimoire'));
    document.getElementById('shelf-open-backcover').addEventListener('click', () => ctx.bus.emit('modal:open-backcover'));
    document.getElementById('shelf-open-vol2cover').addEventListener('click', () => ctx.bus.emit('modal:open-vol2cover'));

    root.querySelectorAll('[data-vol-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const vol = btn.getAttribute('data-vol-filter');
        ctx.store.setState({ volumeFilter: vol });
        renderEpisodeGrid(ctx);
        ctx.bus.emit('hyperframe:volume', { volume: vol });
      });
    });

    root.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const clicked = btn.getAttribute('data-filter');
        const nextMode = ctx.store.getState().filterMode === clicked ? 'all' : clicked;
        ctx.store.setState({ filterMode: nextMode });
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
