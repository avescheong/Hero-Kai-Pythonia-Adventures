/**
 * js/modules/codex-sanctuary.js
 * Module 5: Interactive Codex (8 Cast, 12 Realms, 11 Spells) & Realm Explorer Modal
 *
 * Responsibilities:
 * - Renders the 8 Character Showcase cards (`#kc-cast-grid`) with click-to-chapter jump
 * - Renders the 12 Kingdom Realm cards (`#kc-district-grid`) filtered by Kindness Pillar
 * - Renders the 3 Act Curriculum groups & 13 Lesson cards (`#kc-chapter-list`)
 * - Manages the Interactive Realm Explorer Modal (`#kc-realm-modal`) and its live spell tester
 */
(() => {
  "use strict";
  const App = window.PythoniaApp;
  if (!App) return;

  const { state } = App;
  const { normalizeLove } = App.utils;

  App.registerModule("codex-sanctuary", {
    init(app) {
      const castGrid = document.getElementById("kc-cast-grid");
      const districtGrid = document.getElementById("kc-district-grid");
      const chapterList = document.getElementById("kc-chapter-list");
      const filterBtns = [...document.querySelectorAll("#kc-value-filters .kc-pill")];

      const CAST_SHOWCASE = {
        "hero-kai": { img: "assets/scenes/01_PRO_S01.webp", pos: "62% 28%", partIdx: 0 },
        "string": { img: "assets/scenes/20_CH04_S04.webp", pos: "74% 72%", partIdx: 4 },
        "great-wizard": { img: "assets/scenes/03_PRO_S03.webp", pos: "70% 25%", partIdx: 0 },
        "grandma-looma": { img: "assets/scenes/11_CH02_S03.webp", pos: "64% 28%", partIdx: 2 },
        "blacksmith": { img: "assets/scenes/14_CH03_S02.webp", pos: "72% 28%", partIdx: 3 },
        "master-grimsby": { img: "assets/scenes/38_CH08_S02.webp", pos: "82% 35%", partIdx: 9 },
        "bug-king": { img: "assets/scenes/49_CH11_S01.webp", pos: "72% 24%", partIdx: 12 },
        "spell-guardian": { img: "assets/scenes/52_CH11_S04.webp", pos: "50% 62%", partIdx: 12 }
      };

      const realmModal = document.getElementById("kc-realm-modal");
      const realmModalImg = document.getElementById("kc-realm-modal-img");
      const realmModalMeta = document.getElementById("kc-realm-modal-meta");
      const realmModalTitle = document.getElementById("kc-realm-modal-title");
      const realmModalDesc = document.getElementById("kc-realm-modal-desc");
      const realmSpellName = document.getElementById("kc-realm-spell-name");
      const realmSpellCode = document.getElementById("kc-realm-spell-code");
      const realmSpellExplain = document.getElementById("kc-realm-spell-explain");
      const realmSpellOut = document.getElementById("kc-realm-spell-out");
      const realmSpellBtn = document.getElementById("kc-realm-spell-btn");
      const realmBegLink = document.getElementById("kc-realm-beg-link");
      const realmAdvLink = document.getElementById("kc-realm-adv-link");
      const realmSanctuaryLink = document.getElementById("kc-realm-sanctuary-link");
      const realmReadBtn = document.getElementById("kc-realm-read-btn");
      const realmCloseBtn = document.getElementById("kc-realm-close");
      let activeRealmTrigger = null;

      const findPartForDistrict = (d) => {
        const parts = (state.worldData && state.worldData.storyParts) || [];
        const zoneHead = String(d.zone || "").split(" ")[0].split("/")[0];
        return parts.find((p) => p.zone && zoneHead && p.zone === zoneHead) || parts[Number(d.chapter) || 0] || parts[0];
      };

      const closeRealmModal = () => {
        if (!realmModal) return;
        realmModal.hidden = true;
        document.body.style.overflow = "";
        if (activeRealmTrigger && activeRealmTrigger.focus) {
          activeRealmTrigger.focus();
        }
      };

      const openRealmModal = (district, part, triggerEl) => {
        if (!realmModal || !district) return;
        activeRealmTrigger = triggerEl || null;
        const isZh = state.lang === "zh-Hant";
        const isDual = state.lang === "dual";
        const sp = (part && part.spell) || {};
        realmModalImg.src = (part && part.image) || "assets/scenes/03_PRO_S03.webp";
        realmModalImg.alt = isZh ? (part && part.imageAltZh) || "" : (part && part.imageAltEn) || "";
        realmModalMeta.textContent = `${district.zone} · ${isZh ? (district.valueZh || district.value) : district.value}`;
        realmModalTitle.textContent = isZh
          ? district.nameZh
          : isDual
          ? `${district.nameEn} · ${district.nameZh}`
          : district.nameEn;
        const descText = isZh
          ? (district.ecoFeatureZh || district.ecoFeature)
          : isDual
          ? `${district.ecoFeature} — ${district.ecoFeatureZh || ""}`
          : district.ecoFeature;
        realmModalDesc.textContent = descText;
        realmSpellName.textContent = isZh ? (sp.nameZh || sp.nameEn || "") : (sp.nameEn || "");
        realmSpellCode.textContent = sp.code || "";
        realmSpellExplain.textContent = isZh ? (sp.explainZh || sp.explainEn || "") : (sp.explainEn || "");
        realmSpellBtn.textContent = isZh ? (sp.demoBtnZh || "✨ 施展地區魔法") : (sp.demoBtnEn || "✨ Test Realm Spell");
        realmSpellOut.hidden = true;
        realmSpellOut.textContent = "";
        realmSpellBtn.onclick = () => {
          const outText = isZh
            ? (sp.demoOutputZh || sp.demoOutputEn || "")
            : isDual
            ? `${sp.demoOutputEn || ""} (${sp.demoOutputZh || ""})`
            : (sp.demoOutputEn || "");
          realmSpellOut.textContent = outText;
          realmSpellOut.hidden = false;
          if (app.music) app.music.playChime();
        };

        const chIdx = part ? (Number(part.partNumber) || 1) : 1;
        const padCh = String(chIdx).padStart(2, "0");
        realmBegLink.href = (part && part.chapterUrl) || `chapters/chapter-${padCh}.html`;
        realmAdvLink.href = (part && part.chapterAdvanceUrl) || `chapters/chapter-${padCh}-advance.html`;
        realmBegLink.textContent = isZh ? `🌱 第 ${chIdx} 章（精簡入門）↗` : `🌱 Ch ${chIdx} Beginner ↗`;
        realmAdvLink.textContent = isZh ? `📚 第 ${chIdx} 章（完整進階）↗` : `📚 Ch ${chIdx} Advance ↗`;
        if (realmSanctuaryLink) {
          const sanctMap = (window.PythoniaI18n && window.PythoniaI18n.SANCTUARY_BY_PART) || {};
          const sanctInfo = sanctMap[chIdx] || null;
          if (sanctInfo) {
            realmSanctuaryLink.href = `sanctuaries/${sanctInfo.file}`;
            realmSanctuaryLink.textContent = `${isZh ? sanctInfo.labelZh : sanctInfo.labelEn} →`;
            realmSanctuaryLink.hidden = false;
          } else {
            realmSanctuaryLink.hidden = true;
          }
        }
        realmReadBtn.textContent = isZh ? "📖 跳轉至繪本閱讀器" : "📖 Jump to Story Reader";
        realmReadBtn.onclick = () => {
          closeRealmModal();
          const parts = (state.worldData && state.worldData.storyParts) || [];
          const pIndex = part ? Math.max(0, parts.indexOf(part)) : 0;
          app.jumpToStoryPart(pIndex, 0, "paged", true);
        };

        realmModal.hidden = false;
        document.body.style.overflow = "hidden";
        if (realmCloseBtn) realmCloseBtn.focus();
      };

      if (realmCloseBtn) realmCloseBtn.addEventListener("click", closeRealmModal);
      if (realmModal) {
        realmModal.addEventListener("click", (e) => {
          if (e.target === realmModal) closeRealmModal();
        });
      }
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && realmModal && !realmModal.hidden) closeRealmModal();
      });

      const renderSanctuary = () => {
        if (!state.worldData) return;
        const isZh = state.lang === "zh-Hant";

        if (castGrid && Array.isArray(state.worldData.cast)) {
          castGrid.innerHTML = state.worldData.cast.map((c) => {
            const cname = isZh ? c.nameZh : c.nameEn;
            const role = isZh ? c.roleZh : c.roleEn;
            const debut = isZh ? c.debutZh : c.debutEn;
            const note = isZh ? c.noteZh : c.noteEn;
            const showcase = CAST_SHOWCASE[c.id] || { img: "assets/scenes/03_PRO_S03.webp", pos: "50% 40%", partIdx: 0 };
            return `
              <article class="kc-cast-card" tabindex="0" role="button" data-cast-part="${showcase.partIdx}" aria-label="${cname} — ${role}">
                <div class="kc-cast-card__banner">
                  <img src="${showcase.img}" alt="${cname}" loading="lazy" style="object-position:${showcase.pos};" />
                </div>
                <div class="kc-cast-card__body">
                  <div class="kc-cast-card__badge">${role}</div>
                  <h4>${cname}</h4>
                  <div class="kc-cast-card__debut">${debut}</div>
                  <p>${note}</p>
                </div>
              </article>
            `;
          }).join("");

          castGrid.querySelectorAll(".kc-cast-card").forEach((card) => {
            const jumpCast = () => {
              const targetPart = Number(card.getAttribute("data-cast-part")) || 0;
              app.jumpToStoryPart(targetPart, 0, "paged", true);
            };
            card.addEventListener("click", jumpCast);
            card.addEventListener("keydown", (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                jumpCast();
              }
            });
          });
        }

        if (districtGrid && Array.isArray(state.worldData.districts)) {
          const filtered = state.worldData.districts.filter((d) =>
            state.activeValueFilter === "all" || normalizeLove(d.value) === state.activeValueFilter
          );
          districtGrid.innerHTML = filtered.map((d) => {
            const part = findPartForDistrict(d);
            const thumb = (part && part.image) || "assets/scenes/03_PRO_S03.webp";
            const dName = isZh ? d.nameZh : d.nameEn;
            const dConcept = isZh ? (d.conceptZh || d.concept) : d.concept;
            const dEco = isZh ? (d.ecoFeatureZh || d.ecoFeature) : d.ecoFeature;
            const ctaTxt = isZh ? "✨ 探索地區、測試魔法與開啟章節 →" : "✨ Explore Realm & Test Spell →";
            return `
              <button class="kc-district-card" type="button" data-realm-id="${d.id}">
                <div class="kc-district-card__thumb">
                  <span class="kc-district-card__zone">${d.zone}</span>
                  <img src="${thumb}" alt="${dName}" loading="lazy" />
                </div>
                <div class="kc-district-card__body">
                  <h4>${dName}</h4>
                  <div class="kc-district-card__concept">${dConcept}</div>
                  <p>${dEco}</p>
                  <div class="kc-district-card__cta">${ctaTxt}</div>
                </div>
              </button>
            `;
          }).join("");

          districtGrid.querySelectorAll(".kc-district-card").forEach((card) => {
            card.addEventListener("click", () => {
              const rid = card.getAttribute("data-realm-id");
              const district = state.worldData.districts.find((item) => item.id === rid);
              if (district) openRealmModal(district, findPartForDistrict(district), card);
            });
          });
        }

        if (chapterList && Array.isArray(state.worldData.chapters)) {
          chapterList.innerHTML = state.worldData.chapters.map((group) => {
            const lessons = (group.lessons || []).filter((l) =>
              state.activeValueFilter === "all" || normalizeLove(l.love) === state.activeValueFilter
            );
            if (!lessons.length) return "";
            return `
              <section class="kc-chapter-group">
                <header class="kc-chapter-group__head">
                  <h4>${isZh ? group.titleZh : group.titleEn}</h4>
                  <p>${isZh ? group.summaryZh : group.summaryEn}</p>
                </header>
                <div class="kc-lesson-grid">
                  ${lessons.map((l) => `
                    <article class="kc-lesson-card">
                      <div class="kc-lesson-card__top">
                        <span>${l.branch}</span>
                        <span>${isZh ? (l.loveZh || l.love) : l.love}</span>
                      </div>
                      <h5>${isZh ? l.titleZh : l.titleEn}</h5>
                      <p class="kc-lesson-card__concept">${isZh ? l.conceptZh : l.conceptEn}</p>
                      <p class="kc-lesson-card__habit">${isZh ? l.habitZh : l.habitEn}</p>
                      <a href="chapters/chapter-${String((Number(l.num) || 0) + 1).padStart(2, "0")}.html" style="margin-top:auto;padding-top:6px;font-family:var(--sc-font-mono);font-size:0.72rem;color:var(--kc-gold);text-decoration:none;">
                        ${isZh ? `開啟第 ${(Number(l.num) || 0) + 1} 章繪本 →` : `Open Chapter ${(Number(l.num) || 0) + 1} (4 Scenes) →`}
                      </a>
                    </article>
                  `).join("")}
                </div>
              </section>
            `;
          }).join("");
        }
      };

      filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          state.activeValueFilter = btn.getAttribute("data-value") || "all";
          filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
          renderSanctuary();
        });
      });


      this.render = renderSanctuary;
      this.openRealmModal = openRealmModal;
      this.closeRealmModal = closeRealmModal;
    },

    onWorldLoaded() {
      if (this.render) this.render();
    },

    onLangChange() {
      if (this.render) this.render();
    }
  });
})();
