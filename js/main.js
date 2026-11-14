/**
 * js/main.js
 * Hero Kai · Pythonia: Application Entry Point & Bootstrapper
 *
 * Boots `window.PythoniaApp` after all core scripts and feature modules
 * have registered themselves.
 */
(() => {
  "use strict";

  const startApp = () => {
    if (window.PythoniaApp && typeof window.PythoniaApp.boot === "function") {
      window.PythoniaApp.boot();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp, { once: true });
  } else {
    startApp();
  }
})();
