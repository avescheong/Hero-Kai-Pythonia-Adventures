/**
 * js/modules/_module-template.js
 * STARTER TEMPLATE FOR FUTURE PYTHONIA MODULES
 * ============================================================================
 * How to add a new module on top of the existing website:
 *
 * 1. Copy this file to `js/modules/your-new-module.js`.
 * 2. Create a matching stylesheet `css/07-your-new-module.css` (optional).
 * 3. Add your HTML section in `index.html` and include `<script defer src="js/modules/your-new-module.js"></script>`
 *    right before `<script defer src="js/main.js"></script>`.
 * ============================================================================
 */
(() => {
  "use strict";
  const App = window.PythoniaApp;
  if (!App) return;

  const { state } = App;
  const { pickTxt, getUI } = App.utils;

  App.registerModule("example-future-module", {
    /**
     * Called once when the DOM is ready and `PythoniaApp.boot()` runs.
     * Cache DOM elements and attach event listeners here.
     */
    init(app) {
      this.rootEl = document.getElementById("kc-example-module");
      if (!this.rootEl) return; // Safe guard if HTML section is not on page
    },

    /**
     * Called automatically when `data/world.json` (or offline fallback) loads.
     */
    onWorldLoaded(worldData, app) {
      if (!this.rootEl) return;
      this.render();
    },

    /**
     * Called automatically whenever the user switches EN / 繁體中文 / 雙語.
     */
    onLangChange(lang, ui, app) {
      if (!this.rootEl) return;
      this.render();
    },

    /**
     * Custom render method for your module.
     */
    render() {
      if (!this.rootEl || !state.worldData) return;
      const title = pickTxt("New Module Title", "新模組標題");
      this.rootEl.setAttribute("data-module-ready", "true");
      void title;
      void getUI;
    }
  });
})();
