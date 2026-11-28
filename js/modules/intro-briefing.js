/**
 * js/modules/intro-briefing.js
 * Module: Bilingual Opening Hook Trailer Integration (Option A)
 *
 * Manages:
 * - Lazy-loading EN (`2:36`) and ZH-TW (`2:27`) intro videos (`preload="none"`)
 * - Language auto-sync with PythoniaApp topbar switcher (`en` <-> `zh-Hant`)
 * - Mid-playback bilingual track switching with proportional seek preservation
 * - Seamless handoff between the inline #act-briefing theater and #kc-cinema-modal
 * - Automatic background music ducking via `app.music.pauseForMedia()` / `resumeFromMedia()`
 */
(() => {
  "use strict";
  const App = window.PythoniaApp;
  if (!App) return;

  const TRACKS = {
    en: {
      src: "assets/introvideo/Kais_Pythonia_Adventure_Opening_Hook.mp4",
      heroPoster: "assets/introvideo/intro-poster-en-portal.webp",
      briefingPoster: "assets/introvideo/intro-poster-en-briefing.webp",
      cinemaPoster: "assets/introvideo/intro-poster-en-portal.webp",
      durationLabel: "2:36",
      badgeDuration: "02:36 · HD",
      fallbackDurSec: 156.5
    },
    zh: {
      src: "assets/introvideo/Kais_Pythonia_Adventure_Opening_Hook_ZH_TW.mp4",
      heroPoster: "assets/introvideo/intro-poster-zh-portal.webp",
      briefingPoster: "assets/introvideo/intro-poster-zh-portal.webp",
      cinemaPoster: "assets/introvideo/intro-poster-zh-portal.webp",
      durationLabel: "2:27",
      badgeDuration: "02:27 · HD",
      fallbackDurSec: 146.8
    }
  };

  App.registerModule("intro-briefing", {
    init(app) {
      const inlineVideo = document.getElementById("kc-briefing-video");
      const posterOverlay = document.getElementById("kc-briefing-poster-overlay");
      const popoutBtn = document.getElementById("kc-briefing-popout");
      const inlinePlayBtn = document.getElementById("kc-briefing-play-btn");
      const inlineNextBar = document.getElementById("kc-briefing-next");

      const heroHookImg = document.getElementById("kc-hero-hook-img");
      const heroHookDur = document.getElementById("kc-hero-hook-dur");
      const briefingPosterImg = document.getElementById("kc-briefing-poster-img");
      const briefingDur = document.getElementById("kc-briefing-dur");

      const cinemaModal = document.getElementById("kc-cinema-modal");
      const cinemaVideo = document.getElementById("kc-cinema-video");
      const cinemaCloseBtn = document.getElementById("kc-cinema-close");
      const cinemaBgmPill = document.getElementById("kc-cinema-bgm-pill");
      const cinemaFoot = document.getElementById("kc-cinema-foot");

      const langButtons = [...document.querySelectorAll("[data-kc-video-lang]")];
      const openCinemaTriggers = [...document.querySelectorAll("[data-kc-open-cinema]")];

      let activeVideoLang = app.state.lang === "zh-Hant" ? "zh" : "en";
      let modalOpenerEl = null;

      const setFinishedState = (finished) => {
        if (inlineNextBar) inlineNextBar.classList.toggle("is-finished", Boolean(finished));
        if (cinemaFoot) cinemaFoot.classList.toggle("is-finished", Boolean(finished));
      };

      const syncBgmStatus = () => {
        const playing =
          (inlineVideo && !inlineVideo.paused && !inlineVideo.ended) ||
          (cinemaVideo && !cinemaVideo.paused && !cinemaVideo.ended);
        if (cinemaBgmPill) {
          cinemaBgmPill.hidden = !playing;
        }
        if (playing) {
          app.music?.pauseForMedia?.();
        } else if (cinemaModal && cinemaModal.hidden) {
          app.music?.resumeFromMedia?.();
        }
      };

      const ensureVideoSrc = (videoEl, langKey) => {
        if (!videoEl) return;
        const spec = TRACKS[langKey] || TRACKS.en;
        const currentAttr = videoEl.getAttribute("data-loaded-lang");
        if (currentAttr !== langKey || !videoEl.getAttribute("src")) {
          videoEl.setAttribute("src", spec.src);
          videoEl.setAttribute("data-loaded-lang", langKey);
        }
      };

      const syncVisualTrackUI = () => {
        const spec = TRACKS[activeVideoLang] || TRACKS.en;
        langButtons.forEach((btn) => {
          btn.setAttribute("aria-pressed", String(btn.getAttribute("data-kc-video-lang") === activeVideoLang));
        });
        if (heroHookImg) heroHookImg.setAttribute("src", spec.heroPoster);
        if (heroHookDur) heroHookDur.textContent = spec.durationLabel;
        if (briefingPosterImg) briefingPosterImg.setAttribute("src", spec.briefingPoster);
        if (briefingDur) briefingDur.textContent = spec.badgeDuration;
        if (inlineVideo) inlineVideo.setAttribute("poster", spec.briefingPoster);
        if (cinemaVideo) cinemaVideo.setAttribute("poster", spec.cinemaPoster);
      };

      const swapLoadedVideoTrack = (videoEl, nextLang, autoResumeIfPaused) => {
        if (!videoEl || !videoEl.getAttribute("src")) return;
        const prevLang = videoEl.getAttribute("data-loaded-lang") || activeVideoLang;
        if (prevLang === nextLang) return;

        const wasPlaying = !videoEl.paused && !videoEl.ended;
        const prevDur = Number.isFinite(videoEl.duration) && videoEl.duration > 0
          ? videoEl.duration
          : (TRACKS[prevLang]?.fallbackDurSec || 150);
        const ratio = Math.max(0, Math.min(0.99, (videoEl.currentTime || 0) / prevDur));
        const nextSpec = TRACKS[nextLang] || TRACKS.en;

        videoEl.setAttribute("src", nextSpec.src);
        videoEl.setAttribute("data-loaded-lang", nextLang);
        videoEl.load();

        const onMeta = () => {
          const targetDur = Number.isFinite(videoEl.duration) && videoEl.duration > 0
            ? videoEl.duration
            : nextSpec.fallbackDurSec;
          try {
            videoEl.currentTime = Math.max(0, ratio * targetDur);
          } catch (_err) {
            /* seek before buffer settles */
          }
          if (wasPlaying || autoResumeIfPaused) {
            videoEl.play().catch(() => {});
          }
        };
        videoEl.addEventListener("loadedmetadata", onMeta, { once: true });
      };

      const setVideoLang = (nextLang) => {
        if (nextLang !== "en" && nextLang !== "zh") return;
        if (activeVideoLang === nextLang) {
          syncVisualTrackUI();
          return;
        }
        activeVideoLang = nextLang;
        syncVisualTrackUI();

        const inlineActive = inlineVideo && inlineVideo.getAttribute("src") && (!posterOverlay || posterOverlay.hidden);
        const modalActive = cinemaVideo && cinemaVideo.getAttribute("src") && cinemaModal && !cinemaModal.hidden;
        if (inlineActive) swapLoadedVideoTrack(inlineVideo, activeVideoLang, false);
        if (modalActive) swapLoadedVideoTrack(cinemaVideo, activeVideoLang, false);
      };

      const playInline = () => {
        if (!inlineVideo) return;
        setFinishedState(false);
        if (cinemaModal && !cinemaModal.hidden) closeCinemaModal();
        if (cinemaVideo && !cinemaVideo.paused) cinemaVideo.pause();

        ensureVideoSrc(inlineVideo, activeVideoLang);
        if (posterOverlay) posterOverlay.hidden = true;
        if (popoutBtn) popoutBtn.hidden = false;

        app.music?.pauseForMedia?.();
        inlineVideo.play().catch(() => {});
      };

      const openCinemaModal = (openerEl) => {
        if (!cinemaModal || !cinemaVideo) return;
        modalOpenerEl = openerEl || document.activeElement;
        setFinishedState(false);

        let handoffTime = 0;
        const inlineWasLoaded = inlineVideo && inlineVideo.getAttribute("src");
        if (inlineWasLoaded && (!posterOverlay || posterOverlay.hidden)) {
          handoffTime = Number.isFinite(inlineVideo.currentTime) ? inlineVideo.currentTime : 0;
          if (!inlineVideo.paused) inlineVideo.pause();
        }

        ensureVideoSrc(cinemaVideo, activeVideoLang);
        cinemaModal.hidden = false;
        document.documentElement.style.overflow = "hidden";
        app.music?.pauseForMedia?.();

        const startModalPlayback = () => {
          if (handoffTime > 0.25 && Number.isFinite(cinemaVideo.duration) && handoffTime < cinemaVideo.duration) {
            try {
              cinemaVideo.currentTime = handoffTime;
            } catch (_err) {
              /* ignore early seek guard */
            }
          }
          cinemaVideo.play().catch(() => {});
        };

        if (cinemaVideo.readyState >= 1) {
          startModalPlayback();
        } else {
          cinemaVideo.addEventListener("loadedmetadata", startModalPlayback, { once: true });
          cinemaVideo.play().catch(() => {});
        }

        cinemaCloseBtn?.focus?.();
      };

      const closeCinemaModal = () => {
        if (!cinemaModal || cinemaModal.hidden) return;
        if (cinemaVideo && !cinemaVideo.paused) cinemaVideo.pause();
        cinemaModal.hidden = true;
        document.documentElement.style.overflow = "";
        app.music?.resumeFromMedia?.();
        if (modalOpenerEl && typeof modalOpenerEl.focus === "function") {
          modalOpenerEl.focus();
        }
        modalOpenerEl = null;
      };

      /* ---- Event Wiring --------------------------------------------------- */
      langButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          setVideoLang(btn.getAttribute("data-kc-video-lang"));
        });
      });

      if (posterOverlay) {
        posterOverlay.addEventListener("click", playInline);
      }
      if (inlinePlayBtn) {
        inlinePlayBtn.addEventListener("click", playInline);
      }

      openCinemaTriggers.forEach((trigger) => {
        trigger.addEventListener("click", (e) => {
          e.preventDefault();
          openCinemaModal(trigger);
        });
      });

      if (cinemaCloseBtn) {
        cinemaCloseBtn.addEventListener("click", closeCinemaModal);
      }
      if (cinemaModal) {
        cinemaModal.addEventListener("click", (e) => {
          if (e.target === cinemaModal) closeCinemaModal();
        });
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && cinemaModal && !cinemaModal.hidden) {
          closeCinemaModal();
        }
      });

      [inlineVideo, cinemaVideo].forEach((vid) => {
        if (!vid) return;
        vid.addEventListener("play", () => {
          setFinishedState(false);
          syncBgmStatus();
        });
        vid.addEventListener("pause", () => {
          syncBgmStatus();
        });
        vid.addEventListener("ended", () => {
          setFinishedState(true);
          syncBgmStatus();
        });
      });

      syncVisualTrackUI();

      this.setVideoLang = setVideoLang;
      this.openCinemaModal = openCinemaModal;
      this.closeCinemaModal = closeCinemaModal;
    },

    onLangChange(lang) {
      if (typeof this.setVideoLang === "function") {
        if (lang === "zh-Hant") this.setVideoLang("zh");
        else if (lang === "en") this.setVideoLang("en");
      }
    }
  });
})();
