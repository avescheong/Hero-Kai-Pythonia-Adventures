/**
 * js/modules/navigation-scrollmap.js
 * Module 2: Topbar Chapter Drawer, Right-Edge Hanging Handscroll Spine & Act Scroll Choreography
 *
 * Responsibilities:
 * - Toggles `#kc-nav-panel` chapter menu in the top-right control bar
 * - Updates right-edge scrollmap river path (`#kc-river-trace`), flora icon (`#kc-flora-svg`),
 *   and active act waypoint dot (`.kc-scrollmap__node`)
 * - Drives Act 3 SVG constellation circuit draw (`--kc-circuit-p`)
 * - Computes Act 4 Citadel battle zoom, pan, and white flash progress (`actCanopy._kcBattle`)
 */
(() => {
  "use strict";
  const App = window.PythoniaApp;
  if (!App) return;

  const { clamp01, reducedMotion } = App.utils;

  App.registerModule("navigation-scrollmap", {
    init(app) {
      const navBtn = document.querySelector("[data-kc-nav-btn]");
      const navPanel = document.getElementById("kc-nav-panel");
      if (navBtn && navPanel) {
        navBtn.addEventListener("click", () => {
          const open = navBtn.getAttribute("aria-expanded") === "true";
          navBtn.setAttribute("aria-expanded", String(!open));
          navPanel.hidden = open;
        });
        navPanel.querySelectorAll("a").forEach((link) => {
          link.addEventListener("click", () => {
            navBtn.setAttribute("aria-expanded", "false");
            navPanel.hidden = true;
          });
        });
      }

      /* ---- Scrollmap Spine & Act 4 Scrim Opening & Act 3 Circuit ----------- */
      const riverTrace = document.getElementById("kc-river-trace");
      const floraSvg = document.getElementById("kc-flora-svg");
      const scrollNodes = [...document.querySelectorAll(".kc-scrollmap__node")];
      const actCanopy = document.getElementById("act-canopy");
      const circuitCard = document.querySelector(".kc-circuit-card");

      scrollNodes.forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = document.querySelector(btn.getAttribute("data-target"));
          if (target) target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
        });
      });

      const actEls = scrollNodes.map((n) => document.querySelector(n.getAttribute("data-target")));

      const syncScrollDecor = () => {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const globalP = clamp01(window.scrollY / maxScroll);
        document.documentElement.style.setProperty("--kc-scroll", globalP.toFixed(4));

        if (riverTrace) {
          riverTrace.style.strokeDashoffset = (420 * (1 - globalP)).toFixed(1);
        }
        if (floraSvg) {
          const scale = 0.8 + globalP * 0.45;
          const rot = reducedMotion ? 0 : globalP * 90;
          floraSvg.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)}) rotate(${rot.toFixed(1)}deg)`;
        }

        const midY = window.innerHeight * 0.45;
        let activeIdx = 0;
        actEls.forEach((el, idx) => {
          if (!el) return;
          if (el.getBoundingClientRect().top <= midY) activeIdx = idx;
        });
        scrollNodes.forEach((node, idx) => {
          node.setAttribute("data-active", idx === activeIdx ? "true" : "false");
        });

        /* Act 4 Scrim Opening + Sword Charge / Kai+String Dash / Slow-Fading White Flash */
        if (actCanopy) {
          const rect = actCanopy.getBoundingClientRect();
          const span = Math.max(1, actCanopy.offsetHeight - window.innerHeight);
          const p = clamp01(-rect.top / span);
          let op = 1;
          if (p > 0.725) {
            const t = clamp01((p - 0.725) / (0.86 - 0.725));
            op = 1 - t * 0.92;
          }
          actCanopy.style.setProperty("--kc-canopy-scrim-op", op.toFixed(3));

          let scale = 1;
          let tx = 0;
          let ty = 0;
          let flash = 0;
          if (!reducedMotion) {
            const smooth = (a, b, v) => {
              const t = clamp01((v - a) / (b - a));
              return t * t * (3 - 2 * t);
            };
            if (p <= 0.36) {
              const t = smooth(0.02, 0.36, p);
              scale = 1 + 0.07 * t;
              tx = 18 * t;
              ty = 8 * t;
            } else if (p <= 0.74) {
              const t = smooth(0.36, 0.73, p);
              scale = 1.07 + 0.13 * t;
              tx = 18 * (1 - t) - 46 * t;
              ty = 8 * (1 - t);
            } else {
              const t = smooth(0.74, 0.94, p);
              scale = 1.20 - 0.18 * t;
              tx = -46 * (1 - t);
              ty = 0;
            }
            const maxPanX = actCanopy.clientWidth * Math.max(0, scale - 1) * 0.4;
            const maxPanY = window.innerHeight * Math.max(0, scale - 1) * 0.38;
            tx = Math.max(-maxPanX, Math.min(maxPanX, tx));
            ty = Math.max(-maxPanY, Math.min(maxPanY, ty));

            if (p >= 0.73 && p < 0.785) {
              flash = smooth(0.73, 0.785, p) * 0.99;
            } else if (p >= 0.785 && p <= 0.985) {
              const fadeT = clamp01((p - 0.785) / (0.985 - 0.785));
              flash = 0.99 * Math.pow(1 - fadeT, 1.55);
            }
          }
          actCanopy.style.setProperty("--kc-citadel-scale", scale.toFixed(4));
          actCanopy.style.setProperty("--kc-citadel-tx", tx.toFixed(1) + "px");
          actCanopy.style.setProperty("--kc-citadel-ty", ty.toFixed(1) + "px");
          actCanopy.style.setProperty("--kc-citadel-flash", flash.toFixed(3));
          actCanopy._kcBattle = { p, scale, tx, ty, flash };
        }

        /* Act 3 Self-Drawing SVG Constellation */
        if (circuitCard) {
          const rect = circuitCard.getBoundingClientRect();
          const cp = clamp01((window.innerHeight * 0.9 - rect.top) / (window.innerHeight * 0.55));
          circuitCard.style.setProperty("--kc-circuit-p", reducedMotion ? "1" : cp.toFixed(3));
        }
      };

      window.addEventListener("scroll", () => {
        syncScrollDecor();
        if (app.music && typeof app.music.onScrollChime === "function") app.music.onScrollChime();
      }, { passive: true });
      window.addEventListener("resize", syncScrollDecor, { passive: true });
      syncScrollDecor();


      this.syncScrollDecor = syncScrollDecor;
    }
  });
})();
