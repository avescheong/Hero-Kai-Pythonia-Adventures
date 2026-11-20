/**
 * js/modules/storybook-reader.js
 * Module 4: 52-Scene Multi-Page Storybook Reader, Interactive Spell Box & Fullscreen Lightbox
 *
 * Responsibilities:
 * - Renders all 13 story parts and 52 scenes in 3 view modes:
 *   - `paged`  : Quick Preview (52 individual scene pages with 4-scene thumbnail bar)
 *   - `spread` : 4-Scene Chapter Spread (all 4 scenes of the active chapter side-by-side)
 *   - `all`    : All 13 Chapters continuous overview
 * - Wires interactive Python spell casting buttons (`[data-cast-spell]`) & `input()` sandbox
 * - Manages fullscreen illustration Lightbox (`#kc-lightbox`) with keyboard arrow navigation
 * - Wires Act 2 horizontal pan-rail cards (`[data-jump-part]`) to jump directly into the reader
 */
(() => {
  "use strict";
  const App = window.PythoniaApp;
  if (!App) return;

  const { state } = App;
  const { reducedMotion, getUI, pickTxt, renderPortraitMarkup } = App.utils;

  App.registerModule("storybook-reader", {
    init(app) {
      const tabsEl = document.getElementById("kc-chapter-tabs");
      const stageEl = document.getElementById("kc-story-stage");
      const navFooterEl = document.getElementById("kc-reader-nav");
      const prevBtn = document.getElementById("kc-prev-part");
      const nextBtn = document.getElementById("kc-next-part");
      const progressFill = document.getElementById("kc-reader-progress-fill");
      const progressLabel = document.getElementById("kc-reader-progress-label");
      const navMidLabel = document.getElementById("kc-reader-nav-mid");
      const modePagedBtn = document.getElementById("kc-mode-paged");
      const modeSpreadBtn = document.getElementById("kc-mode-spread");
      const modeAllBtn = document.getElementById("kc-mode-all");
      const openChapLink = document.getElementById("kc-open-chapter-link");
      const openAdvLink = document.getElementById("kc-open-advance-link");

      const lbEl = document.getElementById("kc-lightbox");
      const lbImg = document.getElementById("kc-lightbox-img");
      const lbCap = document.getElementById("kc-lb-caption");
      const lbClose = document.getElementById("kc-lb-close");
      const lbPrev = document.getElementById("kc-lb-prev");
      const lbNext = document.getElementById("kc-lb-next");

      const isPortraitPhone = () =>
        !!(window.matchMedia && window.matchMedia("(max-width: 768px) and (orientation: portrait)").matches);
      const renderResponsiveSceneImg = (desktopSrc, mobileSrc, alt, cls = "", loading = "lazy") => {
        const clsAttr = cls ? ` class="${cls}"` : "";
        const loadAttr = loading ? ` loading="${loading}"` : "";
        if (!mobileSrc || mobileSrc === desktopSrc) {
          return `<img${clsAttr} src="${desktopSrc}" alt="${alt}"${loadAttr} />`;
        }
        return `<picture class="kc-resp-pic"><source media="(max-width: 768px) and (orientation: portrait)" srcset="${mobileSrc}" /><img${clsAttr} src="${desktopSrc}" alt="${alt}"${loadAttr} /></picture>`;
      };

      const openLightbox = (pIdx, sIdx) => {
        const part = state.worldData && state.worldData.storyParts && state.worldData.storyParts[pIdx];
        const sc = part && part.scenes && part.scenes[sIdx];
        if (!lbEl || !lbImg || !sc) return;
        state.activePartIdx = pIdx;
        state.activeSceneIdx = sIdx;
        lbImg.src = (isPortraitPhone() && sc.imageMobile) ? sc.imageMobile : sc.image;
        lbImg.alt = sc.titleEn;
        if (lbCap) {
          lbCap.textContent = state.lang === "zh-Hant"
            ? `第 ${sc.pageNumber} 頁 / 共 52 頁 · ${sc.titleZh}`
            : `Page ${sc.pageNumber} of 52 · ${sc.titleEn}`;
        }
        lbEl.hidden = false;
      };

      const stepGlobalScene = (delta) => {
        if (!state.worldData || !state.worldData.storyParts.length) return false;
        const globalPage = state.activePartIdx * 4 + state.activeSceneIdx + delta;
        if (globalPage < 0 || globalPage >= state.worldData.storyParts.length * 4) return false;
        state.activePartIdx = Math.floor(globalPage / 4);
        state.activeSceneIdx = globalPage % 4;
        return true;
      };

      const buildStoryPartHTML = (part, pIdx, sceneIdxToShow = 0, showSpread = false) => {
        const isZh = state.lang === "zh-Hant";
        const isDual = state.lang === "dual";
        const title = pickTxt(part.titleEn, part.titleZh);
        const subtitle = pickTxt(part.subtitleEn, part.subtitleZh);
        const valLabel = isZh ? part.valueZh : part.valueEn;
        const castMap = new Map((state.worldData.cast || []).map((c) => [c.id, c]));
        const scenes = Array.isArray(part.scenes) ? part.scenes : [];
        const sIdx = Math.max(0, Math.min(Math.max(0, scenes.length - 1), sceneIdxToShow));
        const activeScene = scenes[sIdx];

        const castChips = (part.castIds || []).map((cid) => {
          const c = castMap.get(cid);
          if (!c) return "";
          const cname = isZh ? c.nameZh : c.nameEn;
          return `<span class="kc-cast-mini">${renderPortraitMarkup(c.portrait, cname)}<span>${cname}</span></span>`;
        }).join("");

        const dialoguesHTML = (part.dialogue || []).map((d) => `
          <div class="kc-dialogue">
            <span class="kc-dialogue__speaker">${pickTxt(d.speakerEn, d.speakerZh)}</span>
            <span>${pickTxt(d.lineEn, d.lineZh)}</span>
          </div>
        `).join("");

        const sp = part.spell || {};
        const spellName = pickTxt(sp.nameEn, sp.nameZh);
        const spellExplain = pickTxt(sp.explainEn, sp.explainZh);
        const spellBtn = isZh ? sp.demoBtnZh : sp.demoBtnEn;
        const spellOut = isZh ? sp.demoOutputZh : sp.demoOutputEn;
        const placeholder = isZh ? (sp.demoInputPlaceholderZh || "") : (sp.demoInputPlaceholderEn || "");
        const chapHref = part.chapterUrl || `chapters/chapter-${String(part.partNumber).padStart(2, "0")}.html`;
        const advHref = part.chapterAdvanceUrl || `chapters/chapter-${String(part.partNumber).padStart(2, "0")}-advance.html`;
        const comicEpCode = String(part.partNumber - 1).padStart(2, "0");
        const comicBtnHTML = `<a class="kc-chapter-link" href="comic.html#ep=${comicEpCode}">${isZh ? `🎨 條漫 EP ${comicEpCode} →` : `🎨 Webtoon EP ${comicEpCode} →`}</a>`;
        const sanctMap = (window.PythoniaI18n && window.PythoniaI18n.SANCTUARY_BY_PART) || {};
        const sanctInfo = sanctMap[part.partNumber] || null;
        const sanctBtnHTML = sanctInfo
          ? `<a class="kc-chapter-link kc-sanctuary-link" href="sanctuaries/${sanctInfo.file}">${isZh ? sanctInfo.labelZh : sanctInfo.labelEn} →</a>`
          : "";

        const spellBlockHTML = `
          <div class="kc-spell-box">
            <p class="kc-spell-box__title">${spellName}</p>
            <pre class="kc-spell-code">${sp.code || ""}</pre>
            <p class="kc-spell-explain">${spellExplain}</p>
            <div class="kc-spell-interactive">
              ${sp.interactiveInput ? `<input class="kc-spell-input" type="text" maxlength="20" value="String" placeholder="${placeholder}" aria-label="${placeholder}" />` : ""}
              <button class="kc-spell-cast-btn" type="button" data-cast-spell="${part.id}">${spellBtn}</button>
              <a class="kc-chapter-link" href="${chapHref}">${isZh ? "精簡版章節 ↗" : "Beginner Page ↗"}</a>
              <a class="kc-chapter-link" style="color:#8cf0bd;border-color:rgba(140,240,189,0.4);" href="${advHref}">${isZh ? "完整進階版 ↗" : "Advance Full ↗"}</a>
              ${comicBtnHTML}
              ${sanctBtnHTML}
            </div>
            <div class="kc-spell-output" data-spell-out="${part.id}" data-default-out="${spellOut}" hidden>${spellOut}</div>
          </div>
        `;

        if (showSpread && scenes.length) {
          return `
            <article class="kc-story-card" style="grid-template-columns:minmax(0,1fr);" data-part-id="${part.id}">
              <div class="kc-story-card__text">
                <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;">
                  <div class="kc-story-card__badges">
                    <span class="kc-badge kc-badge--warm">${part.partNumber} / 13 &middot; ${part.zone}</span>
                    <span class="kc-badge">${part.code}</span>
                    <span class="kc-badge">${valLabel}</span>
                  </div>
                  <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                    <a class="kc-btn-primary" href="${chapHref}">${isZh ? `🌱 第 ${part.partNumber} 章・精簡入門 →` : `🌱 Ch ${part.partNumber} Beginner →`}</a>
                    <a class="kc-btn-advance" href="${advHref}">${isZh ? `📚 第 ${part.partNumber} 章・完整進階 →` : `📚 Ch ${part.partNumber} Advance (Full) →`}</a>
                  </div>
                </div>
                <h3>${title}</h3>
                <p class="kc-story-card__subtitle">${subtitle}</p>
                <div class="kc-cast-mini-row" style="margin-bottom:14px;">${castChips}</div>
                <div class="kc-chapter-spread">
                  ${scenes.map((sc, idx) => `
                    <div class="kc-spread-scene">
                      <div class="kc-spread-scene__media" data-zoom-scene="${pIdx}:${idx}">
                        ${renderResponsiveSceneImg(sc.image, sc.imageMobile, sc.titleEn)}
                        <span class="kc-scene-page-pill">Page ${sc.pageNumber} / 52 &middot; ${sc.sceneId}</span>
                      </div>
                      <div class="kc-spread-scene__body">
                        <h4>${pickTxt(sc.titleEn, sc.titleZh)}</h4>
                        <p>${isDual ? `${sc.narrationEn}<br><span style="color:#ffd285;">${sc.narrationZh}</span>` : (isZh ? sc.narrationZh : sc.narrationEn)}</p>
                        ${(sc.dialogueEn || sc.dialogueZh) ? `<div class="kc-dialogue" style="margin:2px 0;">${pickTxt(sc.dialogueEn, sc.dialogueZh)}</div>` : ""}
                      </div>
                    </div>
                  `).join("")}
                </div>
                <div style="margin-top:16px;">${spellBlockHTML}</div>
              </div>
            </article>
          `;
        }

        const displayImg = activeScene ? activeScene.image : part.image;
        const displayImgMobile = activeScene ? activeScene.imageMobile : part.imageMobile;
        const displayAlt = activeScene ? (isZh ? activeScene.titleZh : activeScene.titleEn) : (isZh ? part.imageAltZh : part.imageAltEn);
        const thumbsHTML = scenes.length ? `
          <div class="kc-scene-thumbs" role="tablist" aria-label="4 scenes in this chapter">
            ${scenes.map((sc, idx) => `
              <button class="kc-scene-thumb" type="button" data-pick-scene="${pIdx}:${idx}" aria-current="${idx === sIdx ? "true" : "false"}">
                ${renderResponsiveSceneImg(sc.image, sc.imageMobile, sc.titleEn)}
                <span class="kc-scene-thumb__label">P.${sc.pageNumber} · ${sc.sceneId}</span>
              </button>
            `).join("")}
          </div>
        ` : "";

        const sceneBodyHTML = activeScene ? `
          <div class="kc-story-paragraphs">
            ${isDual
              ? `<p>${activeScene.narrationEn}</p><p style="color:#ffd285;">${activeScene.narrationZh}</p>`
              : `<p>${isZh ? activeScene.narrationZh : activeScene.narrationEn}</p>`}
          </div>
          ${(activeScene.dialogueEn || activeScene.dialogueZh) ? `
            <div class="kc-dialogue-list">
              <div class="kc-dialogue">${pickTxt(activeScene.dialogueEn, activeScene.dialogueZh)}</div>
            </div>` : ""}
          ${activeScene.spellCode ? `<pre class="kc-spell-code" style="margin-bottom:12px;">✨ ${pickTxt(activeScene.spellLabelEn, activeScene.spellLabelZh)}\n${activeScene.spellCode}</pre>` : ""}
        ` : `
          <div class="kc-story-paragraphs">
            ${(isZh ? part.paragraphsZh : part.paragraphsEn).map((p) => `<p>${p}</p>`).join("")}
          </div>
          ${dialoguesHTML ? `<div class="kc-dialogue-list">${dialoguesHTML}</div>` : ""}
        `;

        return `
          <article class="kc-story-card" data-part-id="${part.id}">
            <div class="kc-story-card__visual">
              <div class="kc-story-card__imgwrap" data-zoom-scene="${pIdx}:${sIdx}" title="Click to zoom illustration">
                ${renderResponsiveSceneImg(displayImg, displayImgMobile, displayAlt)}
                ${activeScene ? `<span class="kc-scene-page-pill">Page ${activeScene.pageNumber} / 52 &middot; ${activeScene.sceneId}</span>` : ""}
                <span class="kc-zoom-pill">${isZh ? "🔍 放大插畫" : "🔍 Zoom"}</span>
              </div>
              ${thumbsHTML}
              <div class="kc-story-card__badges">
                <span class="kc-badge kc-badge--warm">${part.partNumber} / 13 &middot; ${part.zone}</span>
                <span class="kc-badge">${part.code}</span>
                <span class="kc-badge">${valLabel}</span>
              </div>
              <div class="kc-cast-mini-row">${castChips}</div>
            </div>

            <div class="kc-story-card__text">
              <div style="margin-bottom:14px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
                <a class="kc-btn-primary" href="${chapHref}">
                  ${isZh ? `🌱 第 ${part.partNumber} 章・精簡入門故事 →` : `🌱 Ch ${part.partNumber} Beginner (Full-Screen) →`}
                </a>
                <a class="kc-btn-advance" href="${advHref}">
                  ${isZh ? `📚 第 ${part.partNumber} 章・完整進階故事 →` : `📚 Ch ${part.partNumber} Advance (Full Story) →`}
                </a>
              </div>
              <h3>${activeScene ? pickTxt(activeScene.titleEn, activeScene.titleZh) : title}</h3>
              <p class="kc-story-card__subtitle">${title} &middot; ${subtitle}</p>
              ${sceneBodyHTML}
              ${spellBlockHTML}
            </div>
          </article>
        `;
      };

      const wireStageInteractions = () => {
        stageEl.querySelectorAll("[data-cast-spell]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const pid = btn.getAttribute("data-cast-spell");
            const card = btn.closest(".kc-spell-box");
            const outEl = card && card.querySelector(`[data-spell-out="${pid}"]`);
            if (!outEl) return;
            const inputEl = card.querySelector(".kc-spell-input");
            let text = outEl.getAttribute("data-default-out") || "";
            if (inputEl) {
              const nm = inputEl.value.trim() || "String";
              text = state.lang === "zh-Hant"
                ? `歡迎你，${nm}！前方的森林荊棘溫柔地分開了道路。`
                : `Welcome, ${nm}! The forest brambles part cleanly before you.`;
            }
            outEl.textContent = text;
            outEl.hidden = false;
            if (app.music) app.music.playChime();
          });
        });

        stageEl.querySelectorAll("[data-pick-scene]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const [p, s] = btn.getAttribute("data-pick-scene").split(":").map(Number);
            state.activePartIdx = p || 0;
            state.activeSceneIdx = s || 0;
            renderStoryReader();
          });
        });

        stageEl.querySelectorAll("[data-zoom-scene]").forEach((el) => {
          el.addEventListener("click", () => {
            const [p, s] = el.getAttribute("data-zoom-scene").split(":").map(Number);
            openLightbox(p || 0, s || 0);
          });
        });
      };

      const syncModeButtons = () => {
        if (modePagedBtn) modePagedBtn.setAttribute("aria-pressed", String(state.readerMode === "paged"));
        if (modeSpreadBtn) modeSpreadBtn.setAttribute("aria-pressed", String(state.readerMode === "spread"));
        if (modeAllBtn) modeAllBtn.setAttribute("aria-pressed", String(state.readerMode === "all"));
      };

      const renderStoryReader = () => {
        if (!state.worldData || !Array.isArray(state.worldData.storyParts)) return;
        const parts = state.worldData.storyParts;
        const total = parts.length;
        state.activePartIdx = Math.max(0, Math.min(total - 1, state.activePartIdx));
        state.activeSceneIdx = Math.max(0, Math.min(3, state.activeSceneIdx));
        state.readParts.add(state.activePartIdx);

        if (tabsEl) {
          tabsEl.innerHTML = parts.map((p, idx) => {
            const shortLabel = state.lang === "zh-Hant"
              ? `${idx + 1}. ${(p.titleZh.split("：")[0] || "").replace("章", "")}`
              : `${idx + 1}. ${p.code.replace("SPELL ", "S")}`;
            return `
              <button class="kc-chap-tab" type="button" role="tab"
                      data-part-idx="${idx}"
                      aria-current="${idx === state.activePartIdx ? "step" : "false"}"
                      data-read="${state.readParts.has(idx) ? "true" : "false"}">
                ${shortLabel}
              </button>
            `;
          }).join("");

          tabsEl.querySelectorAll(".kc-chap-tab").forEach((btn) => {
            btn.addEventListener("click", () => {
              state.activePartIdx = Number(btn.getAttribute("data-part-idx")) || 0;
              state.activeSceneIdx = 0;
              if (state.readerMode === "all") state.readerMode = "paged";
              syncModeButtons();
              renderStoryReader();
            });
          });
        }

        const activePart = parts[state.activePartIdx];
        if (openChapLink && activePart) {
          openChapLink.href = activePart.chapterUrl || `chapters/chapter-${String(activePart.partNumber).padStart(2, "0")}.html`;
          openChapLink.textContent = state.lang === "zh-Hant"
            ? `🌱 開啟第 ${activePart.partNumber} 章（精簡入門）↗`
            : `🌱 Open Ch ${activePart.partNumber} (Beginner) ↗`;
        }
        if (openAdvLink && activePart) {
          openAdvLink.href = activePart.chapterAdvanceUrl || `chapters/chapter-${String(activePart.partNumber).padStart(2, "0")}-advance.html`;
          openAdvLink.textContent = state.lang === "zh-Hant"
            ? `📚 開啟第 ${activePart.partNumber} 章（完整進階）↗`
            : `📚 Open Ch ${activePart.partNumber} (Advance Full) ↗`;
        }

        const globalPage = state.activePartIdx * 4 + state.activeSceneIdx + 1;
        const totalPages = total * 4;
        if (progressFill) {
          progressFill.style.width = `${((globalPage / totalPages) * 100).toFixed(1)}%`;
        }
        if (progressLabel) {
          progressLabel.textContent = getUI().partProgress(state.activePartIdx, state.activeSceneIdx, total);
        }
        if (navMidLabel) {
          navMidLabel.textContent = `Page ${globalPage} / ${totalPages}`;
        }

        if (stageEl) {
          if (state.readerMode === "all") {
            stageEl.innerHTML = parts.map((p, idx) => buildStoryPartHTML(p, idx, 2, false)).join("");
          } else if (state.readerMode === "spread") {
            stageEl.innerHTML = buildStoryPartHTML(activePart, state.activePartIdx, state.activeSceneIdx, true);
          } else {
            stageEl.innerHTML = buildStoryPartHTML(activePart, state.activePartIdx, state.activeSceneIdx, false);
          }
          wireStageInteractions();
        }

        if (navFooterEl) {
          navFooterEl.hidden = state.readerMode === "all";
        }
        if (prevBtn) prevBtn.disabled = globalPage <= 1;
        if (nextBtn) nextBtn.disabled = globalPage >= totalPages;
      };

      if (modePagedBtn) {
        modePagedBtn.addEventListener("click", () => {
          state.readerMode = "paged";
          syncModeButtons();
          renderStoryReader();
        });
      }
      if (modeSpreadBtn) {
        modeSpreadBtn.addEventListener("click", () => {
          state.readerMode = "spread";
          syncModeButtons();
          renderStoryReader();
        });
      }
      if (modeAllBtn) {
        modeAllBtn.addEventListener("click", () => {
          state.readerMode = "all";
          syncModeButtons();
          renderStoryReader();
        });
      }
      const scrollToReaderTop = () => {
        const reader = document.getElementById("story-reader");
        if (reader) reader.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      };
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (state.readerMode === "spread" && state.activePartIdx > 0) {
            state.activePartIdx--;
            state.activeSceneIdx = 0;
            renderStoryReader();
            scrollToReaderTop();
          } else if (stepGlobalScene(-1)) {
            renderStoryReader();
            scrollToReaderTop();
          }
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (state.readerMode === "spread" && state.worldData && state.activePartIdx < state.worldData.storyParts.length - 1) {
            state.activePartIdx++;
            state.activeSceneIdx = 0;
            renderStoryReader();
            scrollToReaderTop();
          } else if (stepGlobalScene(1)) {
            renderStoryReader();
            scrollToReaderTop();
          }
        });
      }

      /* Lightbox listeners & arrow-key scene turning */
      if (lbClose) lbClose.addEventListener("click", () => { lbEl.hidden = true; });
      if (lbEl) lbEl.addEventListener("click", (e) => { if (e.target === lbEl) lbEl.hidden = true; });
      if (lbPrev) lbPrev.addEventListener("click", () => {
        if (stepGlobalScene(-1)) {
          openLightbox(state.activePartIdx, state.activeSceneIdx);
          renderStoryReader();
        }
      });
      if (lbNext) lbNext.addEventListener("click", () => {
        if (stepGlobalScene(1)) {
          openLightbox(state.activePartIdx, state.activeSceneIdx);
          renderStoryReader();
        }
      });
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lbEl && !lbEl.hidden) lbEl.hidden = true;
        if (lbEl && !lbEl.hidden) {
          if (e.key === "ArrowRight" && stepGlobalScene(1)) { openLightbox(state.activePartIdx, state.activeSceneIdx); renderStoryReader(); }
          if (e.key === "ArrowLeft" && stepGlobalScene(-1)) { openLightbox(state.activePartIdx, state.activeSceneIdx); renderStoryReader(); }
        }
      });

      /* Jump from Act 2 Pan Cards straight into the matching story part */
      document.querySelectorAll("[data-jump-part]").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (e.target && e.target.closest && e.target.closest("a")) return;
          const idx = Number(card.getAttribute("data-jump-part")) || 0;
          state.activePartIdx = idx;
          state.activeSceneIdx = 0;
          state.readerMode = "paged";
          syncModeButtons();
          renderStoryReader();
          scrollToReaderTop();
        });
      });


      this.render = renderStoryReader;
      this.syncModeButtons = syncModeButtons;
      this.openLightbox = openLightbox;
    },

    onWorldLoaded() {
      if (this.render) this.render();
    },

    onLangChange() {
      if (this.render) this.render();
    }
  });
})();
