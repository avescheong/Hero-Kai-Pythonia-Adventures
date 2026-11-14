/**
 * js/modules/battle-lantern-vfx.js
 * Module 3: Act 4 Citadel Battle 2D Canvas VFX & Act 5 Sanctuary Lantern Particles
 *
 * Responsibilities:
 * - Renders Act 4 (`#kc-dawn-canvas`) 3-phase battle choreography synchronized with scroll:
 *   - Phase 1 (0.00..0.46): Kai's IronSword superpower accumulation & 11-spell rune rings
 *   - Phase 2 (0.33..0.78): Kai & String charging together with comet trails & X-slash shockwave
 *   - Phase 3 (0.68..1.00): Floating golden dawn spores over the Baby Praying Mantis reveal
 * - Renders Act 5 (`#kc-lantern-canvas`) floating emerald sanctuary motes
 */
(() => {
  "use strict";
  const App = window.PythoniaApp;
  if (!App) return;

  const { clamp01, reducedMotion } = App.utils;

  App.registerModule("battle-lantern-vfx", {
    init() {
      const actCanopy = document.getElementById("act-canopy");
      const initCitadelBattleVFX = (canvas) => {
        if (reducedMotion || !canvas || !actCanopy) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const smooth = (a, b, v) => {
          const t = clamp01((v - a) / (b - a));
          return t * t * (3 - 2 * t);
        };
        const quadPt = (p0, pc, p1, t) => {
          const u = 1 - t;
          return [
            u * u * p0[0] + 2 * u * t * pc[0] + t * t * p1[0],
            u * u * p0[1] + 2 * u * t * pc[1] + t * t * p1[1]
          ];
        };
        const drawStar = (x, y, radius, alpha, rot) => {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rot);
          for (let i = 0; i < 2; i++) {
            ctx.rotate(Math.PI * 0.5);
            ctx.fillStyle = "rgba(255, 255, 255, " + alpha.toFixed(3) + ")";
            ctx.beginPath();
            ctx.ellipse(0, 0, radius, radius * 0.16, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        };
        const drawCometTrail = (p0, pc, p1, headT, tailSpan, rgbOuter, rgbCore, alpha, unit, rot) => {
          const tStart = Math.max(0, headT - tailSpan);
          const steps = 18;
          for (let i = 0; i < steps; i++) {
            const f0 = i / steps;
            const f1 = (i + 1) / steps;
            const ptA = quadPt(p0, pc, p1, tStart + (headT - tStart) * f0);
            const ptB = quadPt(p0, pc, p1, tStart + (headT - tStart) * f1);
            const a = f1 * alpha;
            ctx.strokeStyle = "rgba(" + rgbOuter + ", " + (a * 0.72).toFixed(3) + ")";
            ctx.lineWidth = (2 + 16 * f1) * (unit / 55);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(ptA[0], ptA[1]);
            ctx.lineTo(ptB[0], ptB[1]);
            ctx.stroke();

            ctx.strokeStyle = "rgba(" + rgbCore + ", " + (a * 0.95).toFixed(3) + ")";
            ctx.lineWidth = (1 + 6 * f1) * (unit / 55);
            ctx.beginPath();
            ctx.moveTo(ptA[0], ptA[1]);
            ctx.lineTo(ptB[0], ptB[1]);
            ctx.stroke();
          }
          const head = quadPt(p0, pc, p1, headT);
          const glowR = unit * 0.65;
          const grd = ctx.createRadialGradient(head[0], head[1], 0, head[0], head[1], glowR);
          grd.addColorStop(0, "rgba(255, 255, 255, " + Math.min(1, alpha).toFixed(3) + ")");
          grd.addColorStop(0.32, "rgba(" + rgbOuter + ", " + (alpha * 0.8).toFixed(3) + ")");
          grd.addColorStop(1, "rgba(" + rgbOuter + ", 0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(head[0], head[1], glowR, 0, Math.PI * 2);
          ctx.fill();
          drawStar(head[0], head[1], glowR * 0.9, Math.min(1, alpha), rot);
        };

        const motes = Array.from({ length: 28 }, (_, i) => ({
          angle: (i / 28) * Math.PI * 2,
          phase: (i * 0.137) % 1,
          dist: 0.7 + ((i * 19) % 21) * 0.11,
          size: 1.8 + (i % 4) * 0.9,
          x: ((i * 73) % 100) / 100,
          y: ((i * 41) % 100) / 100,
          vy: 0.045 + (i % 5) * 0.012
        }));

        const renderBattle = (now) => {
          const rect = actCanopy.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            if (w > 0 && h > 0) {
              if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
                canvas.width = Math.round(w * dpr);
                canvas.height = Math.round(h * dpr);
              }
              ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
              ctx.clearRect(0, 0, w, h);

              const span = Math.max(1, actCanopy.offsetHeight - window.innerHeight);
              const battle = actCanopy._kcBattle || {
                p: clamp01(-rect.top / span),
                scale: 1,
                tx: 0,
                ty: 0,
                flash: 0
              };
              const p = battle.p;
              const cover = Math.max(w / 16, h / 9);
              const offX = (w - 16 * cover) * 0.5;
              const offY = (h - 9 * cover) * 0.5;
              const orgX = w * 0.42;
              const orgY = h * 0.62;
              const sc = battle.scale || 1;
              const tx = battle.tx || 0;
              const ty = battle.ty || 0;
              const toXY = (nx, ny) => {
                const bx = offX + nx * 16 * cover;
                const by = offY + ny * 9 * cover;
                return [orgX + (bx - orgX) * sc + tx, orgY + (by - orgY) * sc + ty];
              };

              const unit = Math.max(24, cover * 0.65);
              /* Anchors matched directly to Kai's raised sword & String in 50_CH11_S02 (and 51_CH11_S03) */
              const swordHilt = toXY(0.328, 0.555);
              const swordMid = toXY(0.376, 0.43);
              const swordTip = toXY(0.424, 0.305);
              const kaiBody = toXY(0.355, 0.465);
              const stringGem = toXY(0.71, 0.79);
              const stringBody = toXY(0.66, 0.72);
              const kingCore = toXY(0.685, 0.43);
              const timeS = now * 0.001;

              ctx.save();
              ctx.globalCompositeOperation = "lighter";

              /* Phase 1 (0..0.46): Kai's IronSword superpower accumulation & 11-spell rune rings */
              const chargePower = Math.max(0.22, smooth(0.0, 0.34, p)) * (1 - smooth(0.38, 0.48, p));
              if (chargePower > 0.02) {
                const auraR = unit * (0.75 + 1.35 * chargePower);
                const aura = ctx.createRadialGradient(swordMid[0], swordMid[1], 0, swordMid[0], swordMid[1], auraR);
                aura.addColorStop(0, "rgba(255, 250, 215, " + (0.7 * chargePower).toFixed(3) + ")");
                aura.addColorStop(0.36, "rgba(126, 247, 180, " + (0.5 * chargePower).toFixed(3) + ")");
                aura.addColorStop(0.74, "rgba(255, 214, 138, " + (0.24 * chargePower).toFixed(3) + ")");
                aura.addColorStop(1, "rgba(126, 247, 180, 0)");
                ctx.fillStyle = aura;
                ctx.beginPath();
                ctx.arc(swordMid[0], swordMid[1], auraR, 0, Math.PI * 2);
                ctx.fill();

                /* Counter-rotating 11-spell rune circles locked onto Kai's raised IronSword */
                [0.54, 0.88].forEach((mult, idx) => {
                  const r = unit * mult * (0.58 + 0.65 * chargePower);
                  ctx.save();
                  ctx.translate(swordMid[0], swordMid[1]);
                  ctx.rotate(timeS * (idx === 0 ? 1.55 : -1.05) + p * 6.5);
                  ctx.strokeStyle =
                    idx === 0
                      ? "rgba(255, 214, 138, " + (0.78 * chargePower).toFixed(3) + ")"
                      : "rgba(126, 247, 180, " + (0.64 * chargePower).toFixed(3) + ")";
                  ctx.lineWidth = idx === 0 ? 2.4 : 1.7;
                  ctx.setLineDash(idx === 0 ? [8, 6] : [14, 8]);
                  ctx.beginPath();
                  ctx.arc(0, 0, r, 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.setLineDash([]);
                  if (idx === 1) {
                    for (let k = 0; k < 11; k++) {
                      const ang = (k / 11) * Math.PI * 2;
                      ctx.fillStyle = "rgba(255, 232, 168, " + (0.9 * chargePower).toFixed(3) + ")";
                      ctx.beginPath();
                      ctx.arc(Math.cos(ang) * r, Math.sin(ang) * r, 2.7 * chargePower, 0, Math.PI * 2);
                      ctx.fill();
                    }
                  }
                  ctx.restore();
                });

                /* Blade plasma core + crackling lightning bolts */
                const bladeLayers = [
                  { width: 20 * chargePower, color: "rgba(126, 247, 180, " + (0.55 * chargePower).toFixed(3) + ")" },
                  { width: 9 * chargePower, color: "rgba(255, 214, 138, " + (0.9 * chargePower).toFixed(3) + ")" },
                  { width: 3.4 * chargePower, color: "rgba(255, 255, 255, " + Math.min(1, chargePower).toFixed(3) + ")" }
                ];
                bladeLayers.forEach((layer) => {
                  ctx.strokeStyle = layer.color;
                  ctx.lineWidth = Math.max(1.2, layer.width);
                  ctx.lineCap = "round";
                  ctx.beginPath();
                  ctx.moveTo(swordHilt[0], swordHilt[1]);
                  ctx.lineTo(swordTip[0], swordTip[1]);
                  ctx.stroke();
                });

                for (let b = 0; b < 6; b++) {
                  const seed = timeS * 5.2 + b * 1.9 + p * 12;
                  const frac = 0.2 + 0.15 * b;
                  const sx = swordHilt[0] + (swordTip[0] - swordHilt[0]) * frac;
                  const sy = swordHilt[1] + (swordTip[1] - swordHilt[1]) * frac;
                  const ex = sx + Math.cos(seed * 1.7 + b) * unit * (0.48 + 0.58 * chargePower);
                  const ey = sy + Math.sin(seed * 2.1 - b) * unit * (0.48 + 0.58 * chargePower);
                  const mx = (sx + ex) * 0.5 + Math.sin(seed * 4.3) * unit * 0.2;
                  const my = (sy + ey) * 0.5 + Math.cos(seed * 3.9) * unit * 0.2;
                  ctx.strokeStyle = b % 2 === 0
                    ? "rgba(255, 224, 145, " + (0.88 * chargePower).toFixed(3) + ")"
                    : "rgba(116, 245, 255, " + (0.8 * chargePower).toFixed(3) + ")";
                  ctx.lineWidth = 2 * chargePower;
                  ctx.beginPath();
                  ctx.moveTo(sx, sy);
                  ctx.lineTo(mx, my);
                  ctx.lineTo(ex, ey);
                  ctx.stroke();
                }

                /* Spiraling inward superpower motes into the blade */
                motes.forEach((m, idx) => {
                  const life = (m.phase + timeS * (0.38 + 0.58 * chargePower) + p * 2.4) % 1;
                  const dist = (1 - life) * m.dist * unit;
                  const ang = m.angle + life * 4.2;
                  const px = swordMid[0] + Math.cos(ang) * dist;
                  const py = swordMid[1] + Math.sin(ang) * dist;
                  const alpha = Math.sin(life * Math.PI) * 0.92 * chargePower;
                  ctx.fillStyle = idx % 2 === 0
                    ? "rgba(255, 224, 145, " + alpha.toFixed(3) + ")"
                    : "rgba(126, 247, 180, " + alpha.toFixed(3) + ")";
                  ctx.beginPath();
                  ctx.arc(px, py, m.size * (0.65 + 0.65 * chargePower), 0, Math.PI * 2);
                  ctx.fill();
                });

                /* String's emerald collar resonance + bond arc to Kai's sword */
                const strGlow = ctx.createRadialGradient(stringGem[0], stringGem[1], 0, stringGem[0], stringGem[1], unit * 0.52);
                strGlow.addColorStop(0, "rgba(220, 255, 255, " + (0.82 * chargePower).toFixed(3) + ")");
                strGlow.addColorStop(0.5, "rgba(110, 240, 255, " + (0.45 * chargePower).toFixed(3) + ")");
                strGlow.addColorStop(1, "rgba(110, 240, 255, 0)");
                ctx.fillStyle = strGlow;
                ctx.beginPath();
                ctx.arc(stringGem[0], stringGem[1], unit * 0.52, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = "rgba(118, 245, 225, " + (0.38 * chargePower).toFixed(3) + ")";
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(stringGem[0], stringGem[1]);
                ctx.quadraticCurveTo((stringGem[0] + swordMid[0]) * 0.5, swordMid[1] + unit * 0.65, swordMid[0], swordMid[1]);
                ctx.stroke();
              }

              /* Phase 2 (0.33..0.78): Kai & String charging together toward the Bug King */
              const dashRaw = clamp01((p - 0.33) / 0.40);
              const dashVis = smooth(0.33, 0.39, p) * (1 - smooth(0.72, 0.79, p));
              if (dashVis > 0.01) {
                /* Dynamic kinetic wind / speedlines surging across upper-right battlefield */
                for (let sIdx = 0; sIdx < 18; sIdx++) {
                  const ly = h * (0.12 + ((sIdx * 0.049) % 0.72));
                  const lxBase = ((timeS * 2.5 + sIdx * 0.17 + p * 4.5) % 1.2) - 0.1;
                  const lx0 = lxBase * w;
                  const len = unit * (1.35 + (sIdx % 3) * 0.85);
                  ctx.strokeStyle = sIdx % 3 === 0
                    ? "rgba(126, 247, 180, " + (0.32 * dashVis).toFixed(3) + ")"
                    : "rgba(255, 232, 178, " + (0.28 * dashVis).toFixed(3) + ")";
                  ctx.lineWidth = 1.6 + (sIdx % 2);
                  ctx.beginPath();
                  ctx.moveTo(lx0, ly);
                  ctx.lineTo(lx0 + len, ly - len * 0.09);
                  ctx.stroke();
                }

                const kaiCtrl = [(kaiBody[0] + kingCore[0]) * 0.48, kaiBody[1] - unit * 0.75];
                const strCtrl = [(stringBody[0] + kingCore[0]) * 0.54, stringBody[1] - unit * 0.55];
                const strTarget = [kingCore[0] - unit * 0.15, kingCore[1] + unit * 0.35];

                drawCometTrail(
                  kaiBody,
                  kaiCtrl,
                  kingCore,
                  Math.pow(dashRaw, 1.28),
                  0.42,
                  "255, 214, 138",
                  "160, 255, 210",
                  dashVis,
                  unit * 1.05,
                  timeS * 4 + p * 8
                );
                drawCometTrail(
                  stringBody,
                  strCtrl,
                  strTarget,
                  Math.pow(dashRaw, 1.22),
                  0.38,
                  "110, 240, 255",
                  "255, 235, 175",
                  dashVis * 0.94,
                  unit * 0.9,
                  -timeS * 3.5 - p * 6
                );

                /* Impact X-slash and expanding shockwaves right before the white flash erupts */
                const hit = smooth(0.62, 0.725, p) * (1 - smooth(0.74, 0.80, p));
                if (hit > 0.01) {
                  const ringR = unit * (0.55 + 3.8 * smooth(0.62, 0.785, p));
                  ctx.strokeStyle = "rgba(255, 255, 255, " + (0.88 * hit).toFixed(3) + ")";
                  ctx.lineWidth = 4.5 * hit;
                  ctx.beginPath();
                  ctx.arc(kingCore[0], kingCore[1], ringR, 0, Math.PI * 2);
                  ctx.stroke();

                  const slashLen = unit * (1.35 + 3.0 * hit);
                  [-0.65, 0.65].forEach((ang) => {
                    ctx.save();
                    ctx.translate(kingCore[0], kingCore[1]);
                    ctx.rotate(ang);
                    ctx.fillStyle = "rgba(255, 248, 215, " + (0.92 * hit).toFixed(3) + ")";
                    ctx.beginPath();
                    ctx.ellipse(0, 0, slashLen, 5 * hit, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                  });
                }
              }

              /* Phase 3 (0.68..1.0): Floating golden dawn spores over mantis reveal */
              const sporeVis = smooth(0.68, 0.88, p);
              if (sporeVis > 0.01) {
                ctx.globalCompositeOperation = "source-over";
                motes.forEach((m, idx) => {
                  const py = ((m.y - timeS * m.vy + 10) % 1) * h;
                  const px = ((m.x + Math.sin(timeS * 0.6 + idx) * 0.015 + 1) % 1) * w;
                  ctx.fillStyle = "rgba(255, 214, 138, " + (0.62 * sporeVis).toFixed(3) + ")";
                  ctx.beginPath();
                  ctx.arc(px, py, m.size, 0, Math.PI * 2);
                  ctx.fill();
                });
              }

              ctx.restore();
            }
          }
          window.requestAnimationFrame(renderBattle);
        };
        window.requestAnimationFrame(renderBattle);
      };

      const initParticles = () => {
        if (reducedMotion) return;
        const dawnCanvas = document.getElementById("kc-dawn-canvas");
        initCitadelBattleVFX(dawnCanvas);
        const lanternCanvas = document.getElementById("kc-lantern-canvas");
        const setups = [
          { canvas: lanternCanvas, count: 22, color: "140, 240, 189", speedY: -0.22, minP: -1, act: document.getElementById("act-finale") }
        ].filter((s) => s.canvas && s.act);

        if (!setups.length) return;
        const makeDots = (n) => Array.from({ length: n }, () => ({
          x: Math.random(),
          y: Math.random(),
          r: 1.2 + Math.random() * 2.4,
          drift: (Math.random() - 0.5) * 0.0007,
          phase: Math.random() * Math.PI * 2
        }));
        setups.forEach((s) => { s.dots = makeDots(s.count); });

        const tick = () => {
          setups.forEach((s) => {
            const rect = s.act.getBoundingClientRect();
            if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.max(1, s.canvas.clientWidth);
            const h = Math.max(1, s.canvas.clientHeight);
            if (s.canvas.width !== w * dpr || s.canvas.height !== h * dpr) {
              s.canvas.width = w * dpr;
              s.canvas.height = h * dpr;
            }
            const ctx = s.canvas.getContext("2d");
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);

            let alphaGate = 1;
            if (s.minP >= 0) {
              const span = Math.max(1, s.act.offsetHeight - window.innerHeight);
              const p = clamp01(-rect.top / span);
              alphaGate = clamp01((p - s.minP) / 0.22);
            }
            if (alphaGate <= 0.02) return;

            s.dots.forEach((d) => {
              d.y += s.speedY * 0.002;
              d.x += d.drift;
              d.phase += 0.03;
              if (d.y < -0.05) d.y = 1.05;
              if (d.x < -0.05) d.x = 1.05;
              if (d.x > 1.05) d.x = -0.05;
              const a = (0.35 + 0.45 * Math.sin(d.phase)) * alphaGate;
              ctx.beginPath();
              ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${s.color}, ${Math.max(0.08, a).toFixed(3)})`;
              ctx.fill();
            });
          });
          window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      };
      initParticles();


    }
  });
})();
