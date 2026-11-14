/**
 * js/modules/music-engine.js
 * Module 1: Soothing Music Engine (Peaceful MP3 + Web Audio Crystal Harp + Chimes)
 *
 * Registers `"music-engine"` with `window.PythoniaApp` and exposes `app.music`
 * so other modules (e.g. spell casting, aphorism drawing, scroll chimes) can
 * trigger `app.music.playChime()` or `app.music.onScrollChime()`.
 */
(() => {
  "use strict";
  const App = window.PythoniaApp;
  if (!App) return;

  const { clamp01, getUI } = App.utils;

  App.registerModule("music-engine", {
    init(app) {
      const bgmAudio = document.getElementById("kc-bgm-audio");
      const chimeAudio = document.getElementById("kc-chime-audio");
      const musicBtn = document.getElementById("kc-music-btn");
      const musicLabel = document.getElementById("kc-music-label");
      const trackBtn = document.getElementById("kc-music-track-btn");
      const volSlider = document.getElementById("kc-music-vol");
      const MusicEngine = (() => {
        let ctx = null;
        let master = null;
        let filter = null;
        let padOsc1 = null;
        let padOsc2 = null;
        let padGain = null;
        let stepTimer = null;
        let userEnabled = localStorage.getItem("pythonia_music_on") !== "false";
        let musicMode = localStorage.getItem("pythonia_music_mode") || "mp3"; // "mp3" | "harp"
        let volumePct = Number(localStorage.getItem("pythonia_music_vol") || 35);
        let volume = Math.min(1, Math.max(0, volumePct / 100));
        let isRunning = false;
        let lastScrollNoteAt = 0;
        let stepIdx = 0;

        if (volSlider) volSlider.value = String(volumePct);
        if (bgmAudio) {
          bgmAudio.volume = volume;
          const savedTime = Number(sessionStorage.getItem("pythonia_bgm_time") || "0");
          if (Number.isFinite(savedTime) && savedTime > 0) {
            bgmAudio.addEventListener("loadedmetadata", () => {
              if (savedTime < bgmAudio.duration) bgmAudio.currentTime = savedTime;
            }, { once: true });
          }
          window.addEventListener("pagehide", () => {
            sessionStorage.setItem("pythonia_bgm_time", String(bgmAudio.currentTime || 0));
          });
        }
        if (chimeAudio) chimeAudio.volume = Math.min(0.45, volume + 0.1);

        // Gentle pentatonic voicings shifting smoothly across scroll depth (Hz)
        const SCALES = [
          [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // Prologue & Village (C major pentatonic)
          [293.66, 329.63, 392.00, 440.00, 523.25, 587.33], // Forest & Loom (Warm D sus / F)
          [220.00, 261.63, 329.63, 392.00, 440.00, 523.25], // Cavern & Library (Gentle A minor 7)
          [261.63, 329.63, 392.00, 493.88, 523.25, 659.25]  // Citadel Dawn (Bright C maj7)
        ];
        const PAD_ROOTS = [130.81, 146.83, 110.00, 130.81];

        const getStageIdx = () => {
          const maxS = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const p = clamp01(window.scrollY / maxS);
          return Math.min(3, Math.floor(p * 4));
        };

        const playPluck = (freq, pluckVol = 0.055, dur = 2.4) => {
          if (!ctx || !master || ctx.state !== "running") return;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const over = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);
          over.type = "triangle";
          over.frequency.setValueAtTime(freq * 2, now);
          const overG = ctx.createGain();
          overG.gain.setValueAtTime(0.14, now);
          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(pluckVol * Math.max(0.2, volume * 1.4), now + 0.045);
          g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
          osc.connect(g);
          over.connect(overG);
          overG.connect(g);
          g.connect(filter);
          osc.start(now);
          over.start(now);
          osc.stop(now + dur + 0.05);
          over.stop(now + dur + 0.05);
        };

        const updatePadTone = () => {
          if (!ctx || !padOsc1 || !padOsc2) return;
          const s = getStageIdx();
          const root = PAD_ROOTS[s];
          const now = ctx.currentTime;
          padOsc1.frequency.setTargetAtTime(root, now, 1.4);
          padOsc2.frequency.setTargetAtTime(root * 1.5, now, 1.4);
        };

        const startHarp = () => {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;
          if (!ctx) {
            ctx = new AudioCtx();
            master = ctx.createGain();
            master.gain.setValueAtTime(0.0001, ctx.currentTime);
            filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1350, ctx.currentTime);
            filter.Q.setValueAtTime(0.7, ctx.currentTime);
            filter.connect(master);
            master.connect(ctx.destination);

            padOsc1 = ctx.createOscillator();
            padOsc2 = ctx.createOscillator();
            padGain = ctx.createGain();
            padOsc1.type = "sine";
            padOsc2.type = "sine";
            padGain.gain.setValueAtTime(0.045, ctx.currentTime);
            padOsc1.connect(padGain);
            padOsc2.connect(padGain);
            padGain.connect(filter);
            padOsc1.start();
            padOsc2.start();
          }
          if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
          }
          updatePadTone();
          master.gain.setTargetAtTime(Math.max(0.15, volume * 1.2), ctx.currentTime, 0.8);
          if (!stepTimer) {
            const pattern = [0, 2, 4, 3, 5, 2, 1, 4];
            stepTimer = window.setInterval(() => {
              if (!isRunning || !userEnabled || musicMode !== "harp") return;
              const scale = SCALES[getStageIdx()];
              const note = scale[pattern[stepIdx % pattern.length]];
              stepIdx++;
              playPluck(note, 0.048, 2.8);
              updatePadTone();
            }, 1450);
          }
        };

        const start = () => {
          if (!userEnabled) return;
          if (musicMode === "mp3" && bgmAudio) {
            if (ctx && master) master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3);
            bgmAudio.volume = volume;
            bgmAudio.play().then(() => {
              isRunning = true;
              syncButtonUI();
            }).catch(() => {
              // Browser autoplay gate before explicit click; keep ready state cleanly
              isRunning = false;
              syncButtonUI();
            });
          } else {
            if (bgmAudio) bgmAudio.pause();
            startHarp();
            isRunning = true;
            syncButtonUI();
          }
        };

        const pause = () => {
          if (bgmAudio) bgmAudio.pause();
          if (ctx && master) {
            master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.35);
          }
          isRunning = false;
          syncButtonUI();
        };

        const toggle = () => {
          userEnabled = !userEnabled;
          localStorage.setItem("pythonia_music_on", String(userEnabled));
          if (userEnabled) {
            start();
          } else {
            pause();
          }
          syncButtonUI();
        };

        const switchTrack = () => {
          musicMode = musicMode === "mp3" ? "harp" : "mp3";
          localStorage.setItem("pythonia_music_mode", musicMode);
          if (userEnabled) start();
          syncButtonUI();
        };

        const setVolume = (pct) => {
          volumePct = Number(pct);
          volume = Math.min(1, Math.max(0, volumePct / 100));
          localStorage.setItem("pythonia_music_vol", String(volumePct));
          if (bgmAudio) bgmAudio.volume = volume;
          if (chimeAudio) chimeAudio.volume = Math.min(0.45, volume + 0.1);
          if (ctx && master && isRunning && musicMode === "harp") {
            master.gain.setTargetAtTime(Math.max(0.1, volume * 1.2), ctx.currentTime, 0.2);
          }
        };

        const playChime = () => {
          if (!userEnabled) return;
          if (chimeAudio) {
            chimeAudio.currentTime = 0;
            chimeAudio.play().catch(() => {});
          }
        };

        const onScrollChime = () => {
          if (!userEnabled || !isRunning || musicMode !== "harp") return;
          const nowMs = performance.now();
          if (nowMs - lastScrollNoteAt > 520) {
            lastScrollNoteAt = nowMs;
            const scale = SCALES[getStageIdx()];
            const pick = scale[(stepIdx + Math.floor(Math.random() * 3)) % scale.length];
            playPluck(pick * 1.5, 0.025, 1.9);
          }
          updatePadTone();
        };

        const syncButtonUI = () => {
          const t = getUI();
          if (musicBtn && musicLabel) {
            musicBtn.setAttribute("data-active", String(userEnabled && isRunning));
            musicBtn.setAttribute("aria-pressed", String(userEnabled));
            if (!userEnabled) {
              musicLabel.textContent = t.musicOff;
            } else if (isRunning) {
              musicLabel.textContent = t.musicPlaying;
            } else {
              musicLabel.textContent = t.musicReady;
            }
          }
          if (trackBtn) {
            trackBtn.textContent = musicMode === "mp3" ? "🌿 MP3" : "✨ Harp";
          }
        };

        return { start, toggle, switchTrack, setVolume, playChime, onScrollChime, syncButtonUI };
      })();

      if (musicBtn) musicBtn.addEventListener("click", () => MusicEngine.toggle());
      if (trackBtn) trackBtn.addEventListener("click", () => MusicEngine.switchTrack());
      if (volSlider) volSlider.addEventListener("input", (e) => MusicEngine.setVolume(e.target.value));
      // Arm soothing music cleanly on first user interaction or scroll
      const armOnGesture = () => {
        MusicEngine.start();
        window.removeEventListener("pointerdown", armOnGesture);
        window.removeEventListener("keydown", armOnGesture);
        window.removeEventListener("wheel", armOnGesture);
        window.removeEventListener("touchstart", armOnGesture);
      };
      window.addEventListener("pointerdown", armOnGesture, { passive: true });
      window.addEventListener("keydown", armOnGesture, { passive: true });
      window.addEventListener("wheel", armOnGesture, { passive: true });
      window.addEventListener("touchstart", armOnGesture, { passive: true });


      this.api = MusicEngine;
      app.music = MusicEngine;
    },

    onLangChange() {
      if (this.api && typeof this.api.syncButtonUI === "function") {
        this.api.syncButtonUI();
      }
    }
  });
})();
