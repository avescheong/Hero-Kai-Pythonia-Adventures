/* ============================================================================
 * js/core/event-bus.js
 * Decoupled Pub/Sub Event Bus for Hero Kai Webtoon Modular Architecture.
 * Future modules communicate strictly via events without tight coupling.
 * ============================================================================ */
(function (global) {
  'use strict';

  const listeners = new Map();

  const KaiComicBus = {
    on(eventName, handler) {
      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
      }
      listeners.get(eventName).add(handler);
      return () => this.off(eventName, handler);
    },

    off(eventName, handler) {
      const set = listeners.get(eventName);
      if (set) set.delete(handler);
    },

    emit(eventName, payload) {
      const set = listeners.get(eventName);
      if (!set) return;
      set.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[KaiComicBus] Listener error on "${eventName}":`, err);
        }
      });
    }
  };

  global.KaiComicBus = KaiComicBus;
})(window);
