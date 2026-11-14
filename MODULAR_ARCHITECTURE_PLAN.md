# Hero Kai · Pythonia (`index.html`) Modularization & Maintainability Plan

## 1. Executive Summary & Architectural Goals

The current `index.html` in `Hero_Kai_Story_Website` is a **4,269-line (~299 KB) monolithic file** that combines:
- **1,708 lines of inline CSS** (`<style>` lines 8–1716)
- **456 lines of semantic HTML markup** (`<body>` lines 1718–2174)
- **~230 KB of single-line inline JSON fallback blocks** (lines 2175–2176)
- **2,090 lines of inline JavaScript** (`<script>` lines 2178–4267)

This refactoring plan splits `index.html` into a **clean, human-maintainable, plug-and-play modular architecture** with standalone CSS and JavaScript files while preserving **100% visual, functional, and offline (`file://` + `http://`) parity**:

1. **Pure Semantic HTML (`index.html` reduced from 4,269 lines to ~475 lines)**: Contains only document metadata, stylesheet links, semantic section markup (Acts I–V, modals, topbars), and ordered script tags.
2. **Domain-Scoped Standalone Stylesheets (`css/`)**: Splits the 1,708 lines of inline CSS into 6 human-readable, domain-scoped stylesheets loaded in `<head>` with clear section headers and CSS custom property contracts.
3. **Plug-and-Play Modular JavaScript (`js/`)**: Splits the 2,090 lines of inline JS (plus the 230 KB of inline JSON fallbacks) into a central `PythoniaApp` Core (`js/core/`), offline-safe JS data fallbacks (`js/data/`), 6 independent feature modules (`js/modules/`), a starter template (`js/modules/_module-template.js`), and a clean bootstrapper (`js/main.js`).
4. **Zero-Bundler, Dual-Protocol Compatibility (`file://` & `http://`)**: Uses standard `<script defer>` and `window.PythoniaApp.registerModule(...)` instead of CORS-restricted `file://` ES module imports, ensuring the site works both when double-clicked locally on Windows/macOS and when hosted on GitHub Pages or Netlify.

## 2. Target Directory & File Structure

```text
Hero_Kai_Story_Website/
├── index.html                           # Refactored semantic HTML (~475 lines, zero inline CSS/JS blobs)
├── index.monolithic.backup.html         # Preserved backup of the original 4,269-line index.html
├── MODULAR_ARCHITECTURE_PLAN.md         # This architecture & developer maintenance guide
├── README.md                            # Project overview & curriculum documentation
├── scrollcraft.css                      # Core scrollcraft taste floor & device mechanics (untouched)
├── scrollcraft.js                       # Core scrollcraft scroll-driven runtime (untouched)
├── css/
│   ├── 01-tokens-base.css               # Brand color tokens (:root), reset, body, lead scrims
│   ├── 02-navigation-chrome.css         # Top-left seal, top-right controls, nav drawer, scrollmap spine
│   ├── 03-stages-acts.css               # Stage wrappers, editorial copy, Act 2 Pan Rail, Act 4 Console, Act 5 Finale
│   ├── 04-storybook-reader.css          # Act 3 52-scene storybook reader, tabs, spell sandbox, spread & lightbox
│   ├── 05-codex-modals.css              # Kindness spread, SVG constellation, Cast/Realm/Spell grids, Realm modal
│   └── 06-responsive.css                # Media queries (1360px, 1024px, 860px, 640px, 520px) & reduced-motion
├── js/
│   ├── data/
│   │   ├── world-fallback.js            # Offline fallback for data/world.json (replaces inline JSON script tag)
│   │   └── jingsi-fallback.js           # Offline fallback for data/jingsi_aphorisms.json
│   ├── core/
│   │   ├── i18n.js                      # Bilingual UI dictionary (EN / 繁體中文) & inline SVG fallback portraits
│   │   └── app-core.js                  # PythoniaApp namespace, shared state store, Event Bus, Module Registry & Data Loader
│   ├── modules/
│   │   ├── music-engine.js              # Module 1: Peaceful MP3 + Web Audio procedural crystal harp + spell chimes
│   │   ├── navigation-scrollmap.js      # Module 2: Chapter drawer, hanging scrollmap spine & Act 3/4 scroll choreography
│   │   ├── battle-lantern-vfx.js        # Module 3: Act 4 Citadel battle 2D canvas VFX & Act 5 sanctuary lantern particles
│   │   ├── storybook-reader.js          # Module 4: 52-scene multi-page reader, spell caster, lightbox & rail jump links
│   │   ├── codex-sanctuary.js           # Module 5: 8 Cast showcase, 12 Realms grid, 11 Spells codex & Realm Explorer modal
│   │   ├── certificate-exporter.js      # Module 6: Act 4 Pillar attunement & Act 5 960x540 PNG certificate generator
│   │   └── _module-template.js          # Annotated starter template for adding new modules in the future
│   └── main.js                          # Application bootstrapper (mounts ScrollCraft, initializes modules, binds i18n)
├── data/
│   ├── world.json                       # Canonical story, cast, 12 realms, 52 scenes & 11 Python spells
│   └── jingsi_aphorisms.json            # Bilingual Jing Si Aphorisms (EN / 繁體中文)
├── chapters/
│   └── chapter-01.html .. chapter-13-advance.html
└── assets/
    └── scenes/, cast/, audio/, *.mp4, *.webp, *.png
```

## 3. CSS Split Mapping (Line-by-Line Accountability)

| Target Stylesheet | Source Lines in `index.html` | Scope & Key Selectors | Responsibility |
| :--- | :--- | :--- | :--- |
| `css/01-tokens-base.css` | Lines 9–47 | `:root`, `body`, `a`, `.sc-scrim--lead` | Brand palette (`--kc-gold`, `--kc-cyan`, `--kc-crimson`, `--sc-*`), typography fonts, global reset |
| `css/02-navigation-chrome.css` | Lines 48–283 | `.kc-seal*`, `.kc-topbar-right`, `.kc-ctrl-btn`, `.kc-lang-*`, `.kc-nav__*`, `.kc-scrollmap*` | Fixed top-left badge, top-right language/music/chapter controls, dropdown drawer, right-edge scroll spine |
| `css/03-stages-acts.css` | Lines 284–575, 1504–1650 | `.sc-stage__poster-wrap`, `.kc-plane*`, `.sc-copy--lead`, `.kc-hero-*`, `.kc-btn-*`, `.kc-rail*`, `.kc-console-*`, `.kc-attune-*`, `.kc-finale-bg`, `.kc-seal-card*` | Pinned/scrub stage visual layers, Act 1 hero typography, Act 2 horizontal realm pan rail, Act 4 attunement console, Act 5 certificate UI |
| `css/04-storybook-reader.css` | Lines 576–1092 | `.kc-reader*`, `.kc-pill`, `.kc-progress-*`, `.kc-chapter-tabs`, `.kc-story-card*`, `.kc-dialogue*`, `.kc-spell-*`, `.kc-scene-thumbs`, `.kc-chapter-spread`, `.kc-lightbox*`, `.kc-reader-nav*` | 52-scene interactive storybook reader, chapter tabs, scene thumbnails, 4-scene spread view, Python spell sandbox, fullscreen lightbox |
| `css/05-codex-modals.css` | Lines 1093–1503 | `.kc-spread*`, `.kc-circuit-*`, `.kc-sanctuary*`, `.kc-cast-*`, `.kc-district-*`, `.kc-chapter-group*`, `.kc-lesson-*`, `.kc-realm-modal*`, `.kc-realm-dialog*` | Three Pillars intro spread, SVG constellation, 8 Cast cards, 12 Realms explorer cards, 11 Spells lesson cards, Realm modal dialog |
| `css/06-responsive.css` | Lines 1651–1715 | `@media (max-width: 1360px)`, `1024px`, `860px`, `640px`, `520px`, `(max-height: 700px)`, `(prefers-reduced-motion: reduce)` | Tablet/mobile breakpoints, touch layout adaptations, and accessibility motion overrides |

## 4. JavaScript Modular Architecture & Plugin Contract

### 4.1 Central Core & Module Registry (`js/core/app-core.js`)

Instead of trapping all variables inside one giant anonymous closure where future modules cannot access state or trigger updates, `js/core/app-core.js` creates `window.PythoniaApp`:

```javascript
window.PythoniaApp = {
  // 1. Shared Reactive State
  state: {
    lang: "en",                 // "en" | "zh-Hant" | "dual"
    worldData: null,            // Loaded from data/world.json or window.PYTHONIA_WORLD_FALLBACK
    jingsiList: [],             // Loaded from data/jingsi_aphorisms.json or window.PYTHONIA_JINGSI_FALLBACK
    currentAphorism: null,      // Currently selected Jing Si aphorism object
    activePartIdx: 0,           // Active chapter index (0..12)
    activeSceneIdx: 0,          // Active scene index within chapter (0..3)
    readerMode: "paged",        // "paged" | "spread" | "all"
    activeValueFilter: "all",   // "all" | "love-others" | "love-yourself" | "love-earth"
    selectedPillar: "Love Others",
    readParts: new Set([0])
  },

  // 2. Shared Utilities & i18n Helpers
  utils: { clamp01, reducedMotion, normalizeLove, getUI, pickTxt, renderPortraitMarkup, scrollToReaderTop },

  // 3. Pub/Sub Event Bus for Decoupled Cross-Module Communication
  on(eventName, handler) { ... },
  emit(eventName, payload) { ... },

  // 4. Plug-and-Play Module Registry
  registerModule(id, moduleDefinition) { ... },
  getModule(id) { ... },

  // 5. Core Actions
  setLanguage(newLang) { ... },
  jumpToStoryPart(partIdx, sceneIdx, mode) { ... },
  boot() { ... }
};
```

### 4.2 Standardized Module Lifecycle Contract

Every feature module in `js/modules/*.js` registers itself using a uniform, self-documented structure:

```javascript
window.PythoniaApp.registerModule("module-name", {
  // Called once when the DOM is ready
  init(app) { ... },

  // Called automatically when world.json (or offline fallback) finishes loading
  onWorldLoaded(worldData, app) { ... },

  // Called automatically whenever the user switches language (EN / 繁體中文 / 雙語)
  onLangChange(lang, ui, app) { ... }
});
```

### 4.3 JavaScript File Breakdown

| Target JS File | Source Lines in `index.html` | Module ID / Role | Key Responsibilities & Public API |
| :--- | :--- | :--- | :--- |
| `js/data/world-fallback.js` | Line 2175 | `window.PYTHONIA_WORLD_FALLBACK` | Stores the canonical 13-part, 52-scene curriculum data as a clean JS object so `index.html` stays lightweight and works offline over `file://` |
| `js/data/jingsi-fallback.js` | Line 2176 | `window.PYTHONIA_JINGSI_FALLBACK` | Stores the 29 bilingual Jing Si Aphorisms for offline `file://` resilience |
| `js/core/i18n.js` | Lines 2196–2407 | `PythoniaApp.UI`, `INLINE_PORTRAITS` | Bilingual dictionary (`en` & `zh-Hant`) and inline SVG fallback portraits |
| `js/core/app-core.js` | Lines 2186–2195, 2408–2425, 3903–3928, 4201–4265 | `window.PythoniaApp` | Central state, utilities, Event Bus (`on`/`emit`), Module Registry (`registerModule`), `applyLanguage()`, `loadWorld()`, `loadJingSiAphorisms()` |
| `js/modules/music-engine.js` | Lines 2426–2672 | `"music-engine"` | `MusicEngine` API (`start`, `pause`, `toggle`, `switchTrack`, `setVolume`, `playChime`, `onScrollChime`, `syncButtonUI`), gesture auto-arming |
| `js/modules/navigation-scrollmap.js` | Lines 2673–2800 | `"navigation-scrollmap"` | Topbar chapter drawer toggle, right-edge scrollmap spine (`#kc-river-trace`, `#kc-flora-svg`), Act 3 circuit draw, Act 4 camera/flash scroll variables |
| `js/modules/battle-lantern-vfx.js` | Lines 2801–3197 | `"battle-lantern-vfx"` | Act 4 Citadel battle 2D canvas animation (`initCitadelBattleVFX`: rune circles, plasma blade, lightning, comet trails, shockwaves, dawn spores) + Act 5 floating lanterns |
| `js/modules/storybook-reader.js` | Lines 3198–3609 | `"storybook-reader"` | 52-scene storybook reader (`renderStoryReader`), Paged / 4-Scene Spread / All-13-Chapters modes, interactive spell sandbox, fullscreen Lightbox (`openLightbox`), Act 2 pan-rail jump cards |
| `js/modules/codex-sanctuary.js` | Lines 3610–3851 | `"codex-sanctuary"` | Cast showcase cards (`CAST_SHOWCASE`), 12 Realms grid, 11 Spells lesson cards, Kindness Value filter pills, Interactive Realm Explorer modal (`openRealmModal`) |
| `js/modules/certificate-exporter.js` | Lines 3852–4200 | `"certificate-exporter"` | Act 4 Pillar attunement console (`setAttunedPillar`), Act 5 960×540 canvas certificate renderer (`drawSealCanvas`), random Jing Si Aphorism button, PNG download |
| `js/modules/_module-template.js` | New file | Template (not loaded in prod) | Copy-pasteable template showing future developers how to add a new module in 3 steps |
| `js/main.js` | Lines 2182–2185, 4237–4266 | Bootstrapper | Mounts `ScrollCraft`, initializes all registered modules, binds topbar language buttons, and boots data loading |

## 5. How to Add a New Module in the Future (3-Step Human Guide)

Because `PythoniaApp` uses a decoupled **Module Registry + Event Bus**, adding a new feature module (for example, an interactive **"Python Code Quiz Arena"** or **"Voice Narration Player"**) requires **zero changes to existing modules**:

1. **Create your stylesheet (`css/07-quiz-arena.css`)**:
   - Use existing CSS custom properties (`var(--sc-canvas)`, `var(--sc-ink)`, `var(--kc-gold)`, `var(--sc-accent)`, `var(--sc-font-display)`) so your module automatically matches the Pythonia visual theme.
2. **Create your JS module (`js/modules/quiz-arena.js`)** by copying `js/modules/_module-template.js`:
   ```javascript
   (() => {
     "use strict";
     const App = window.PythoniaApp;
     if (!App) return;

     App.registerModule("quiz-arena", {
       init(app) {
         // Query DOM elements & attach event listeners once
       },
       onWorldLoaded(worldData, app) {
         // Populate questions or scenes using worldData.storyParts
       },
       onLangChange(lang, ui, app) {
         // Re-render text when user switches EN / 繁體中文 / 雙語
       }
     });
   })();
   ```
3. **Link in `index.html`**:
   - Add `<link rel="stylesheet" href="css/07-quiz-arena.css" />` in `<head>`.
   - Add your `<section id="kc-quiz-arena">...</section>` markup in `<body>`.
   - Add `<script defer src="js/modules/quiz-arena.js"></script>` before `<script defer src="js/main.js"></script>`.

## 6. Verification & Quality Assurance Checklist

Before completing the split, the refactored codebase will be verified against:
- **Syntax & Parse Validation**: Run `node --check` on every `.js` file in `js/core/`, `js/data/`, `js/modules/`, and `js/main.js`.
- **CSS & Selector Integrity**: Verify balanced braces and confirm all 100% of original CSS rules (lines 8–1716) are preserved across `css/01-tokens-base.css` through `css/06-responsive.css`.
- **DOM ID & Data-Attribute Parity**: Confirm every element ID (`#kc-*`, `#act-*`, `#story-reader`) and `data-*` hook in the refactored `index.html` matches the original DOM tree 1:1.
- **Offline (`file://`) & Server (`http://`) Compatibility**: Verify that fallback data scripts (`world-fallback.js`, `jingsi-fallback.js`) load cleanly without `fetch` CORS errors when opened locally, while `fetch("data/world.json")` continues to refresh live data when served over HTTP.
