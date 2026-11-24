/* ============================================================================
 * js/modules/hyperframe-stage.module.js
 * Comic Page Only — Living Multi-Plane Biome Hyperframe & Realm Companion Rail
 * ============================================================================ */
(function (global) {
  'use strict';

  const EPISODE_BIOMES = {
    0:  { backdrop: 'assets/hero-whispering-forest.webp', accent: '140, 240, 189', accent2: '255, 210, 133', particles: 'fireflies', realm_en: 'Whispering Forest',     realm_zh: '低語森林入口' },
    1:  { backdrop: 'assets/scenes/05_CH01_S01.webp',     accent: '140, 240, 189', accent2: '255, 218, 138', particles: 'fireflies', realm_en: 'Silent Village',        realm_zh: '寂靜之村' },
    2:  { backdrop: 'assets/scenes/09_CH02_S01.webp',     accent: '132, 232, 168', accent2: '255, 196, 112', particles: 'petals',    realm_en: 'Loom Forest',           realm_zh: '織夢森林' },
    3:  { backdrop: 'assets/scenes/15_CH03_S03.webp',     accent: '255, 162, 92',  accent2: '255, 218, 128', particles: 'embers',    realm_en: 'Iron Outpost Forge',    realm_zh: '鋼鐵前哨站' },
    4:  { backdrop: 'assets/scenes/17_CH04_S01.webp',     accent: '121, 216, 230', accent2: '140, 240, 189', particles: 'fireflies', realm_en: 'Whispering Gate',       realm_zh: '微語森林之門' },
    5:  { backdrop: 'assets/scenes/21_CH05_S01.webp',     accent: '255, 210, 133', accent2: '245, 178, 72',  particles: 'stardust',  realm_en: 'Cursed Riverbank',      realm_zh: '黃金變數金庫' },
    6:  { backdrop: 'assets/scenes/28_CH05A_S04.webp',    accent: '121, 216, 230', accent2: '140, 240, 189', particles: 'stardust',  realm_en: 'Silver-Leafed Tree',    realm_zh: '銀葉古樹' },
    7:  { backdrop: 'assets/scenes/29_CH06_S01.webp',     accent: '154, 176, 255', accent2: '255, 194, 112', particles: 'stardust',  realm_en: "Dragon's Library",      realm_zh: '沉睡巨龍圖書館' },
    8:  { backdrop: 'assets/scenes/33_CH07_S01.webp',     accent: '121, 216, 230', accent2: '198, 152, 255', particles: 'stardust',  realm_en: 'Crystal Cave',          realm_zh: '水晶洞窟與晴溪村' },
    9:  { backdrop: 'assets/scenes/37_CH08_S01.webp',     accent: '255, 138, 76',  accent2: '255, 210, 133', particles: 'embers',    realm_en: 'Deep Dwarven Forge',    realm_zh: '深地矮人鍛造廠' },
    10: { backdrop: 'assets/scenes/41_CH09_S01.webp',     accent: '128, 218, 255', accent2: '255, 210, 133', particles: 'runes',     realm_en: 'Twin Illusion Paths',   realm_zh: '雙重幻象之路' },
    11: { backdrop: 'assets/scenes/46_CH10_S02.webp',     accent: '196, 154, 255', accent2: '255, 210, 133', particles: 'runes',     realm_en: 'Final Crossroads',      realm_zh: '最終十字路口' },
    12: { backdrop: 'assets/scenes/52_CH11_S04.webp',     accent: '140, 240, 189', accent2: '255, 224, 138', particles: 'petals',    realm_en: 'Dawn of Pythonia',      realm_zh: '派森尼亞曙光' },
    13: { backdrop: 'assets/scenes/09_CH02_S01.webp',     accent: '255, 118, 96',  accent2: '255, 210, 133', particles: 'embers',    realm_en: "Ember's Forest Glade",  realm_zh: '紅龍小火的林間空地' },
    14: { backdrop: 'assets/scenes/08_CH01_S04.webp',     accent: '255, 210, 133', accent2: '140, 240, 189', particles: 'stardust',  realm_en: 'Silent Village Market', realm_zh: '村莊魔法撲滿市集' },
    15: { backdrop: 'assets/citadel-sanctuary.webp',      accent: '144, 198, 255', accent2: '255, 210, 133', particles: 'stardust',  realm_en: 'Cosmic Scoops Plaza',   realm_zh: '星際冰淇淋廣場' },
    16: { backdrop: 'assets/scenes/32_CH06_S04.webp',     accent: '121, 216, 230', accent2: '255, 210, 133', particles: 'runes',     realm_en: "The Wizard's Arcade",   realm_zh: '大法師的魔法遊樂場' },
    17: { backdrop: 'assets/scenes/17_CH04_S01.webp',     accent: '112, 240, 196', accent2: '121, 216, 230', particles: 'runes',     realm_en: 'Moonlit Sealed Chamber',realm_zh: '月光封印密室' },
    18: { backdrop: 'assets/scenes/29_CH06_S01.webp',     accent: '255, 126, 86',  accent2: '255, 206, 118', particles: 'embers',    realm_en: 'Ember Peak Summit',     realm_zh: '餘燼峰巔' },
    19: { backdrop: 'assets/scenes/44_CH09_S04.webp',     accent: '198, 158, 255', accent2: '255, 218, 133', particles: 'stardust',  realm_en: 'Royal Vault · Midnight',realm_zh: '午夜王城寶庫' }
  };

  const HUB_BIOMES = {
    all: { backdrop: 'assets/hero-whispering-forest.webp', accent: '140, 240, 189', accent2: '255, 210, 133', particles: 'fireflies' },
    '1': { backdrop: 'assets/hero-whispering-forest.webp', accent: '140, 240, 189', accent2: '255, 210, 133', particles: 'fireflies' },
    '2': { backdrop: 'assets/citadel-sanctuary.webp',      accent: '255, 168, 92',  accent2: '121, 216, 230', particles: 'stardust' }
  };

  let activeLayer = 'a';
  let currentSrc = 'assets/hero-whispering-forest.webp';
  let currentMode = 'fireflies';
  let previewTimer = null;
  let rafParticles = null;
  let scrollBoost = 0;

  function applyBiome(biome) {
    if (!biome) return;
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--hf-accent', biome.accent);
    rootStyle.setProperty('--hf-accent-2', biome.accent2);
    currentMode = biome.particles || 'fireflies';

    if (biome.backdrop && biome.backdrop !== currentSrc) {
      const nextSrc = biome.backdrop;
      const pre = new Image();
      pre.decoding = 'async';
      pre.onload = () => {
        const bgA = document.getElementById('hf-bg-a');
        const bgB = document.getElementById('hf-bg-b');
        if (!bgA || !bgB) return;
        if (activeLayer === 'a') {
          bgB.src = nextSrc;
          bgB.classList.add('is-active');
          bgA.classList.remove('is-active');
          activeLayer = 'b';
        } else {
          bgA.src = nextSrc;
          bgA.classList.add('is-active');
          bgB.classList.remove('is-active');
          activeLayer = 'a';
        }
        currentSrc = nextSrc;
      };
      pre.src = nextSrc;
    }
  }

  function renderCompanionRail(ctx, ep, pct) {
    const rail = document.getElementById('hf-companion-rail');
    if (!rail || !ep) return;
    const st = ctx.store.getState();
    const biome = EPISODE_BIOMES[ep.episode] || EPISODE_BIOMES[0];
    const isZh = st.lang === 'zh-Hant';
    const realmLabel = isZh ? biome.realm_zh : biome.realm_en;
    const episodes = ctx.manifest.episodes;
    const idx = episodes.findIndex((e) => e.episode === ep.episode);
    const nextEp = idx >= 0 && idx < episodes.length - 1 ? episodes[idx + 1] : null;
    const pctVal = Math.max(0, Math.min(100, Math.round(pct || 0)));
    const portalReady = pctVal >= 65;

    rail.innerHTML = `
      <div class="hf-rail__biome">
        <span class="hf-rail__dot" aria-hidden="true"></span>
        <span>VOL. ${ep.volume || 1} · ${ep.code}</span>
      </div>
      <h4 class="hf-rail__realm">${realmLabel}</h4>
      <div class="hf-rail__ep">${ep.icon} ${ep.spellName}</div>
      <div class="hf-rail__meter">
        <div class="hf-rail__track"><div class="hf-rail__fill" id="hf-rail-fill" style="width:${pctVal}%"></div></div>
        <span class="hf-rail__pct" id="hf-rail-pct">${pctVal}%</span>
      </div>
      <button type="button" class="hf-rail__btn ${portalReady ? 'is-ready' : ''}" id="hf-rail-portal-btn">
        ${portalReady ? '✨ Spell Portal Ready!' : '🐍 Jump to Spell Portal'}
      </button>
      ${nextEp ? `<button type="button" class="hf-rail__next" id="hf-rail-next-btn" title="${nextEp.title_en}">Next: ${nextEp.icon} ${nextEp.code} →</button>` : ''}
    `;

    const portalBtn = document.getElementById('hf-rail-portal-btn');
    if (portalBtn) {
      portalBtn.addEventListener('click', () => ctx.bus.emit('spell:jump-to-portal'));
    }
    const nextBtn = document.getElementById('hf-rail-next-btn');
    if (nextBtn && nextEp) {
      nextBtn.addEventListener('click', () => ctx.bus.emit('reader:open', { episode: nextEp.episode }));
    }
  }

  function updateCompanionProgress(pctVal) {
    const fill = document.getElementById('hf-rail-fill');
    const pctEl = document.getElementById('hf-rail-pct');
    const portalBtn = document.getElementById('hf-rail-portal-btn');
    if (fill) fill.style.width = `${pctVal}%`;
    if (pctEl) pctEl.textContent = `${pctVal}%`;
    if (portalBtn) {
      const ready = pctVal >= 65;
      portalBtn.classList.toggle('is-ready', ready);
      portalBtn.textContent = ready ? '✨ Spell Portal Ready!' : '🐍 Jump to Spell Portal';
    }
  }

  function startParticles(ctx) {
    const canvas = document.getElementById('hf-particles');
    if (!canvas) return;
    const c2d = canvas.getContext('2d');
    if (!c2d) return;

    const reduceMotion = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    function resize() {
      canvas.width = window.innerWidth || 1280;
      canvas.height = window.innerHeight || 800;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const particles = Array.from({ length: 36 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1.4 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.22 + Math.random() * 0.55,
      drift: (Math.random() - 0.5) * 0.35,
      warm: i % 3 === 0
    }));

    function frame() {
      const st = ctx.store.getState();
      if (document.hidden || (st.hyperframeMode || 'living') !== 'living') {
        c2d.clearRect(0, 0, canvas.width, canvas.height);
        rafParticles = null;
        return;
      }

      c2d.clearRect(0, 0, canvas.width, canvas.height);
      const cs = getComputedStyle(document.documentElement);
      const rgb1 = cs.getPropertyValue('--hf-accent').trim() || '140, 240, 189';
      const rgb2 = cs.getPropertyValue('--hf-accent-2').trim() || '255, 210, 133';
      const boost = scrollBoost;
      scrollBoost *= 0.88;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.phase += 0.025;
        if (currentMode === 'embers') {
          p.y -= p.speed * 1.35 + boost * 0.25;
          p.x += Math.sin(p.phase) * 0.45 + p.drift;
        } else if (currentMode === 'petals') {
          p.y += p.speed * 0.85 - boost * 0.15;
          p.x += Math.sin(p.phase) * 0.55 + 0.18;
        } else {
          p.y += Math.sin(p.phase * 0.7) * 0.28 - p.speed * 0.22 - boost * 0.18;
          p.x += Math.cos(p.phase * 0.6) * 0.26 + p.drift * 0.4;
        }

        if (p.y < -12) p.y = canvas.height + 12;
        if (p.y > canvas.height + 12) p.y = -12;
        if (p.x < -12) p.x = canvas.width + 12;
        if (p.x > canvas.width + 12) p.x = -12;

        const alpha = 0.28 + 0.48 * (0.5 + 0.5 * Math.sin(p.phase * 1.4));
        const rgb = p.warm ? rgb2 : rgb1;
        c2d.fillStyle = `rgba(${rgb}, ${alpha.toFixed(2)})`;

        if (currentMode === 'runes' && i % 2 === 0) {
          c2d.save();
          c2d.translate(p.x, p.y);
          c2d.rotate(p.phase * 0.5);
          c2d.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
          c2d.restore();
        } else {
          c2d.beginPath();
          c2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          c2d.fill();
        }
      }

      rafParticles = requestAnimationFrame(frame);
    }

    if (!rafParticles) rafParticles = requestAnimationFrame(frame);
    return () => {
      if (!rafParticles && !document.hidden && (ctx.store.getState().hyperframeMode || 'living') === 'living') {
        rafParticles = requestAnimationFrame(frame);
      }
    };
  }

  global.KaiComic.registerModule({
    id: 'hyperframe-stage',
    mount(ctx) {
      const st0 = ctx.store.getState();
      document.body.setAttribute('data-hyperframe', st0.hyperframeMode || 'living');
      applyBiome(HUB_BIOMES[st0.volumeFilter || 'all'] || HUB_BIOMES.all);

      const ensureParticles = startParticles(ctx);

      // Subtle pointer parallax (desktop only)
      let pxRaf = null;
      window.addEventListener('pointermove', (e) => {
        if (pxRaf || (ctx.store.getState().hyperframeMode || 'living') !== 'living') return;
        pxRaf = requestAnimationFrame(() => {
          const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
          const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
          document.documentElement.style.setProperty('--hf-px', `${(nx * -8).toFixed(1)}px`);
          document.documentElement.style.setProperty('--hf-py', `${(ny * -6).toFixed(1)}px`);
          pxRaf = null;
        });
      }, { passive: true });

      // Gentle scroll-coupled arch parallax + companion rail live progress
      let lastScrollY = window.scrollY;
      window.addEventListener('scroll', () => {
        const dy = window.scrollY - lastScrollY;
        lastScrollY = window.scrollY;
        scrollBoost = Math.max(-8, Math.min(8, dy * 0.25));

        const st = ctx.store.getState();
        if ((st.hyperframeMode || 'living') === 'living') {
          const shift = Math.max(-22, Math.min(22, -(window.scrollY * 0.012)));
          document.documentElement.style.setProperty('--hf-scroll-y', `${shift.toFixed(1)}px`);
        }
        if (st.view === 'reader') {
          const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const pctVal = Math.round(Math.max(0, Math.min(1, window.scrollY / docH)) * 100);
          updateCompanionProgress(pctVal);
        }
      }, { passive: true });

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && ensureParticles) ensureParticles();
      });

      ctx.bus.on('hyperframe:changed', () => {
        if (ensureParticles) ensureParticles();
      });

      ctx.bus.on('hyperframe:preview', ({ episode }) => {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(() => {
          if (ctx.store.getState().view === 'hub') {
            applyBiome(EPISODE_BIOMES[episode] || HUB_BIOMES.all);
          }
        }, 110);
      });

      ctx.bus.on('hyperframe:preview-clear', () => {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(() => {
          const st = ctx.store.getState();
          if (st.view === 'hub') {
            applyBiome(HUB_BIOMES[st.volumeFilter || 'all'] || HUB_BIOMES.all);
          }
        }, 140);
      });

      ctx.bus.on('hyperframe:volume', ({ volume }) => {
        if (ctx.store.getState().view === 'hub') {
          applyBiome(HUB_BIOMES[volume || 'all'] || HUB_BIOMES.all);
        }
      });

      ctx.bus.on('view:hub', () => {
        const st = ctx.store.getState();
        applyBiome(HUB_BIOMES[st.volumeFilter || 'all'] || HUB_BIOMES.all);
      });

      ctx.bus.on('episode:opened', ({ episode }) => {
        clearTimeout(previewTimer);
        applyBiome(EPISODE_BIOMES[episode.episode] || EPISODE_BIOMES[0]);
        const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const pctVal = Math.round(Math.max(0, Math.min(1, window.scrollY / docH)) * 100);
        renderCompanionRail(ctx, episode, pctVal);
      });

      ctx.bus.on('lang:changed', () => {
        const st = ctx.store.getState();
        if (st.view === 'reader') {
          const ep = ctx.manifest.episodes.find((e) => e.episode === st.currentEpisode);
          const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const pctVal = Math.round(Math.max(0, Math.min(1, window.scrollY / docH)) * 100);
          renderCompanionRail(ctx, ep, pctVal);
        }
      });
    }
  });
})(window);
