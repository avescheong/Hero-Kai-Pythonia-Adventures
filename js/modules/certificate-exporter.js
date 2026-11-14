/**
 * js/modules/certificate-exporter.js
 * Module 6: Act 4 Pillar Attunement Console & Act 5 960x540 Spellkeeper Certificate Exporter
 *
 * Responsibilities:
 * - Synchronizes Act 4 Kindness Pillar attunement buttons (`#kc-attune-row`) with Act 5
 * - Draws random bilingual Jing Si Aphorisms (靜思語) for student reflection
 * - Renders the live 960×540 HTML5 Canvas keepsake certificate (`#kc-seal-preview`)
 *   featuring Hero Kai's portrait, 11 Spellkeeper stars, student name, kindness note,
 *   and Jing Si Aphorism plaque
 * - Exports and downloads `pythonia-spellkeeper-seal.png` (with CORS-safe fallback)
 */
(() => {
  "use strict";
  const App = window.PythoniaApp;
  if (!App) return;

  const { state } = App;
  const { getUI } = App.utils;

  App.registerModule("certificate-exporter", {
    init(app) {
      const lbEl = document.getElementById("kc-lightbox");
      const lbImg = document.getElementById("kc-lightbox-img");
      const lbCap = document.getElementById("kc-lb-caption");
      const lbClose = document.getElementById("kc-lb-close");
      const lbPrev = document.getElementById("kc-lb-prev");
      const lbNext = document.getElementById("kc-lb-next");
      const attuneBtns = [...document.querySelectorAll("#kc-attune-row .kc-attune-btn")];
      const attuneReadout = document.getElementById("kc-attune-readout");
      const sealNameInput = document.getElementById("kc-seal-name");
      const sealNoteInput = document.getElementById("kc-seal-note");
      const aphorismBtn = document.getElementById("kc-aphorism-btn");
      const aphorismTextEl = document.getElementById("kc-aphorism-text");
      const sealStatus = document.getElementById("kc-seal-status");
      const sealBtn = document.getElementById("kc-seal-btn");
      const sealCanvas = document.getElementById("kc-seal-preview");

      const sealKaiImg = new Image();
      sealKaiImg.crossOrigin = "anonymous";
      sealKaiImg.src = "assets/cast/hero-kai.webp";

      // jingsiList managed in App.state.jingsiList
      // currentAphorism managed in App.state.currentAphorism

      const formatAphorismText = (item, mode) => {
        if (!item) return "";
        if (mode === "zh-Hant") return item.zh || item.en || "";
        if (mode === "dual") {
          return item.zh && item.en ? `${item.en}\n${item.zh}` : (item.en || item.zh || "");
        }
        return item.en || item.zh || "";
      };

      const renderAphorismBox = () => {
        if (!aphorismTextEl) return;
        if (!state.currentAphorism) {
          aphorismTextEl.textContent = state.lang === "zh-Hant" ? "靜心行善，萬法歸一" : "Calm hearts, kind code, and a gentle world restored.";
          return;
        }
        if (state.lang === "dual" && state.currentAphorism.en && state.currentAphorism.zh) {
          aphorismTextEl.innerHTML = `${state.currentAphorism.en}<br><span style="color:#ffd285;">${state.currentAphorism.zh}</span>`;
        } else {
          aphorismTextEl.textContent = formatAphorismText(state.currentAphorism, state.lang);
        }
      };

      const pickRandomAphorism = (redraw = true) => {
        if (!state.jingsiList.length) return;
        let pool = state.jingsiList;
        if (pool.length > 1 && state.currentAphorism) {
          pool = pool.filter((item) => item.id !== state.currentAphorism.id);
        }
        state.currentAphorism = pool[Math.floor(Math.random() * pool.length)] || state.jingsiList[0];
        renderAphorismBox();
        if (redraw) drawSealCanvas();
      };

      const loadJingSiAphorisms = async () => {
        try {
          const el = document.getElementById("kc-jingsi-fallback");
          if (el && el.textContent.trim().length > 2) {
            const parsed = JSON.parse(el.textContent);
            if (parsed && Array.isArray(parsed.aphorisms) && parsed.aphorisms.length) {
              state.jingsiList = parsed.aphorisms;
              if (!state.currentAphorism) pickRandomAphorism(true);
            }
          }
        } catch (err) {
          /* fallback below */
        }
        try {
          const res = await fetch("data/jingsi_aphorisms.json", { cache: "no-store" });
          if (res.ok) {
            const parsed = await res.json();
            if (parsed && Array.isArray(parsed.aphorisms) && parsed.aphorisms.length) {
              state.jingsiList = parsed.aphorisms;
              if (!state.currentAphorism) pickRandomAphorism(true);
            }
          }
        } catch (err) {
          /* inline fallback active */
        }
      };

      const wrapCanvasText = (ctx, text, maxW, maxLines) => {
        const rawParagraphs = String(text || "").split(/\r?\n/);
        const lines = [];
        for (const para of rawParagraphs) {
          const hasSpaces = /\s/.test(para);
          const tokens = hasSpaces ? para.split(/(\s+)/) : Array.from(para);
          let cur = "";
          for (const tok of tokens) {
            const test = cur + tok;
            if (ctx.measureText(test).width > maxW && cur.trim()) {
              lines.push(cur.trimEnd());
              cur = tok.trimStart();
              if (lines.length >= maxLines) break;
            } else {
              cur = test;
            }
          }
          if (lines.length < maxLines && cur.trim()) {
            lines.push(cur.trim());
          }
          if (lines.length >= maxLines) break;
        }
        return lines.slice(0, maxLines);
      };

      const roundRectPath = (ctx, x, y, w, h, r) => {
        const rr = Math.min(r, w * 0.5, h * 0.5);
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr);
        ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
      };

      const drawCertScene = (ctx, includeKaiRaster = true) => {
        const w = 960;
        const h = 540;
        const t = getUI();
        const name = (sealNameInput && sealNameInput.value.trim()) || (state.lang === "zh-Hant" ? "小英雄凱" : "Hero Kai");
        const noteText = (sealNoteInput && sealNoteInput.value.trim()) || "";
        const pillarDisplay = t.pillarLabels[state.selectedPillar] || state.selectedPillar;

        const bg = ctx.createLinearGradient(0, 0, w, h);
        bg.addColorStop(0, "#0b1a14");
        bg.addColorStop(0.56, "#132920");
        bg.addColorStop(1, "#2a2315");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "rgba(255, 210, 133, 0.78)";
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, w - 40, h - 40);
        ctx.strokeStyle = "rgba(140, 240, 189, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(32, 32, w - 64, h - 64);

        const glow = ctx.createRadialGradient(170, 240, 18, 170, 240, 220);
        glow.addColorStop(0, "rgba(140, 240, 189, 0.28)");
        glow.addColorStop(1, "rgba(140, 240, 189, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        /* Left Side: Hero Kai Framed Portrait inside the Certificate */
        const px = 56;
        const py = 86;
        const pw = 216;
        const ph = 278;
        ctx.save();
        roundRectPath(ctx, px, py, pw, ph, 22);
        ctx.fillStyle = "#0b1612";
        ctx.fill();
        ctx.clip();
        if (includeKaiRaster && sealKaiImg.complete && sealKaiImg.naturalWidth > 0) {
          const aspectImg = sealKaiImg.naturalWidth / sealKaiImg.naturalHeight;
          const aspectBox = pw / ph;
          let dw = pw;
          let dh = ph;
          let dx = px;
          let dy = py;
          if (aspectImg > aspectBox) {
            dh = ph;
            dw = ph * aspectImg;
            dx = px - (dw - pw) * 0.5;
          } else {
            dw = pw;
            dh = pw / aspectImg;
            dy = py - (dh - ph) * 0.18;
          }
          ctx.drawImage(sealKaiImg, dx, dy, dw, dh);
        } else {
          ctx.fillStyle = "#173328";
          ctx.fillRect(px, py, pw, ph);
        }
        const vig = ctx.createLinearGradient(px, py + ph * 0.65, px, py + ph);
        vig.addColorStop(0, "rgba(11, 22, 18, 0)");
        vig.addColorStop(1, "rgba(11, 22, 18, 0.85)");
        ctx.fillStyle = vig;
        ctx.fillRect(px, py, pw, ph);
        ctx.restore();

        roundRectPath(ctx, px, py, pw, ph, 22);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffd285";
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = "#ffd285";
        ctx.font = "700 15px 'Microsoft JhengHei', Consolas, monospace";
        ctx.fillText("HERO KAI · 小英雄凱", px + pw * 0.5, py + ph + 28);

        ctx.fillStyle = "#8cf0bd";
        ctx.font = "600 12px 'Microsoft JhengHei', Consolas, monospace";
        ctx.fillText("PYTHONIA SPELLKEEPER", px + pw * 0.5, py + ph + 50);

        /* Right Side: 11 Spellkeeper Stars, Student Name, Lesson Note & Jing Si Aphorism */
        const cx = 602;
        for (let i = 0; i < 11; i++) {
          const angle = Math.PI + ((i + 1) / 12) * Math.PI;
          const sx = cx + Math.cos(angle) * 208;
          const sy = 104 + Math.sin(angle) * 52;
          ctx.beginPath();
          ctx.arc(sx, sy, i === 5 ? 5.5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? "#ffd285" : "#8cf0bd";
          ctx.fill();
        }

        ctx.fillStyle = "#8cf0bd";
        ctx.font = "600 15px 'Microsoft JhengHei', Consolas, monospace";
        ctx.fillText(t.certHeader, cx, 108);

        ctx.fillStyle = "#fbf7ef";
        ctx.font = "700 46px 'Microsoft JhengHei', Georgia, serif";
        ctx.fillText(name, cx, 170, 560);

        ctx.fillStyle = "#ffd285";
        ctx.font = "600 21px 'Microsoft JhengHei', Georgia, serif";
        ctx.fillText(t.certSub(pillarDisplay), cx, 212, 560);

        if (noteText) {
          ctx.fillStyle = "#dcebe3";
          ctx.font = "italic 17px 'Microsoft JhengHei', Georgia, serif";
          const noteLines = wrapCanvasText(ctx, `“${noteText}”`, 530, 2);
          noteLines.forEach((ln, idx) => {
            ctx.fillText(ln, cx, 246 + idx * 23);
          });
        }

        /* Jing Si Aphorism Plaque */
        const boxX = 320;
        const boxY = noteText ? 278 : 252;
        const boxW = 564;
        const boxH = 138;
        roundRectPath(ctx, boxX, boxY, boxW, boxH, 16);
        ctx.fillStyle = "rgba(8, 17, 13, 0.72)";
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(255, 210, 133, 0.45)";
        ctx.stroke();

        ctx.fillStyle = "#8cf0bd";
        ctx.font = "700 13px 'Microsoft JhengHei', Consolas, monospace";
        ctx.fillText(state.lang === "zh-Hant" ? "✦ 靜思語祝福 ✦" : "✦ JING SI APHORISM · 靜思語 ✦", cx, boxY + 25);

        const aphStr = state.currentAphorism
          ? formatAphorismText(state.currentAphorism, state.lang === "en" ? "dual" : state.lang)
          : "Calm hearts, kind code, and a gentle world restored.";
        ctx.fillStyle = "#fff6e3";
        ctx.font = "600 17px 'Microsoft JhengHei', Georgia, serif";
        const aphLines = wrapCanvasText(ctx, aphStr, boxW - 44, 4);
        const startY = boxY + 52 + (aphLines.length <= 2 ? 12 : 0);
        aphLines.forEach((ln, idx) => {
          ctx.fillText(ln, cx, startY + idx * 23);
        });

        ctx.fillStyle = "#c0d3c8";
        ctx.font = "500 15px 'Microsoft JhengHei', Consolas, monospace";
        ctx.fillText(t.certFooter, cx - 22, 478);

        /* Crimson & Gold Wax Seal XI */
        ctx.beginPath();
        ctx.arc(w - 76, h - 66, 32, 0, Math.PI * 2);
        ctx.fillStyle = "#9f2d22";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffd285";
        ctx.stroke();
        ctx.fillStyle = "#fff5e2";
        ctx.font = "700 20px Georgia, serif";
        ctx.fillText("XI", w - 76, h - 59);
      };

      const drawSealCanvas = () => {
        if (!sealCanvas) return;
        const ctx = sealCanvas.getContext("2d");
        drawCertScene(ctx, true);
      };

      sealKaiImg.addEventListener("load", drawSealCanvas);

      const exportCertDataUrl = () => {
        drawSealCanvas();
        try {
          return sealCanvas.toDataURL("image/png");
        } catch (err) {
          const safeCanvas = document.createElement("canvas");
          safeCanvas.width = 960;
          safeCanvas.height = 540;
          drawCertScene(safeCanvas.getContext("2d"), false);
          return safeCanvas.toDataURL("image/png");
        }
      };

      const setAttunedPillar = (pillar) => {
        state.selectedPillar = pillar;
        const t = getUI();
        const pillarLabel = t.pillarLabels[pillar] || pillar;
        attuneBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-attune") === pillar)));
        if (attuneReadout) {
          attuneReadout.textContent = state.lang === "zh-Hant"
            ? `已選擇信念：${pillarLabel} · ${t.attuneNotes[pillar] || ""}`
            : `Attuned Pillar: ${pillarLabel} · ${t.attuneNotes[pillar] || ""}`;
        }
        if (sealStatus) {
          sealStatus.textContent = state.lang === "zh-Hant"
            ? `信念已選定：${pillarLabel} · 可立即下載`
            : `Pillar attuned: ${pillarLabel} · Ready to forge`;
        }
        drawSealCanvas();
      };

      attuneBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          setAttunedPillar(btn.getAttribute("data-attune") || "Love Others");
        });
      });
      if (sealNameInput) sealNameInput.addEventListener("input", drawSealCanvas);
      if (sealNoteInput) sealNoteInput.addEventListener("input", drawSealCanvas);
      if (aphorismBtn) {
        aphorismBtn.addEventListener("click", () => {
          pickRandomAphorism(true);
          if (app.music) app.music.playChime();
        });
      }
      if (sealCanvas && lbEl && lbImg) {
        sealCanvas.addEventListener("click", () => {
          lbImg.src = exportCertDataUrl();
          lbImg.alt = "Full-size 960x540 Spellkeeper Certificate featuring Hero Kai";
          if (lbCap) lbCap.textContent = state.lang === "zh-Hant" ? "專屬守咒人證書預覽 (960x540)" : "Spellkeeper Certificate Preview (960x540)";
          if (lbPrev) lbPrev.disabled = true;
          if (lbNext) lbNext.disabled = true;
          lbEl.hidden = false;
          document.body.style.overflow = "hidden";
          if (lbClose) lbClose.focus();
        });
      }
      if (sealBtn && sealCanvas) {
        sealBtn.addEventListener("click", () => {
          const a = document.createElement("a");
          a.href = exportCertDataUrl();
          a.download = "pythonia-spellkeeper-seal.png";
          a.click();
          if (sealStatus) {
            sealStatus.textContent = state.lang === "zh-Hant"
              ? `已下載含小英雄凱的 960x540 守咒人證書！`
              : `Stamped 960x540 PNG seal with Hero Kai!`;
          }
        });
      }


      this.sealNameInput = sealNameInput;
      this.sealNoteInput = sealNoteInput;
      this.renderAphorismBox = renderAphorismBox;
      this.pickRandomAphorism = pickRandomAphorism;
      this.setAttunedPillar = setAttunedPillar;
      this.drawSealCanvas = drawSealCanvas;
    },

    onJingSiLoaded(list) {
      if (list && list.length && !state.currentAphorism && this.pickRandomAphorism) {
        this.pickRandomAphorism(true);
      } else if (this.renderAphorismBox) {
        this.renderAphorismBox();
        this.drawSealCanvas?.();
      }
    },

    onLangChange(lang, t) {
      if (this.sealNameInput) {
        this.sealNameInput.placeholder = t.sealPlaceholder;
        if (this.sealNameInput.value === "Hero Kai" && lang === "zh-Hant") {
          this.sealNameInput.value = "小英雄凱";
        } else if (this.sealNameInput.value === "小英雄凱" && lang === "en") {
          this.sealNameInput.value = "Hero Kai";
        }
      }
      if (this.sealNoteInput && t.sealNotePlaceholder) {
        this.sealNoteInput.placeholder = t.sealNotePlaceholder;
      }
      this.renderAphorismBox?.();
      this.setAttunedPillar?.(state.selectedPillar);
    }
  });
})();
