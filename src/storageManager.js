// ───────────────────────────────────────────────────────────────────────────
// STORAGE MANAGER
// ───────────────────────────────────────────────────────────────────────────

import { isLocalStorageAvailable } from './helpers.js';

// Performance: Centralized localStorage manager with batch operations
class LocalStorageManager {
  constructor() {
    this.batchedWrites = new Map();
    this.flushTimeout = null;
    this.isAvailable = this.testAvailability();
  }

  testAvailability() {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, "test");
      localStorage.removeItem(test);
      return true;
    } catch {
      console.warn("localStorage is not available");
      return false;
    }
  }

  get(key, defaultValue = null) {
    if (!this.isAvailable) return defaultValue;
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  set(key, value) {
    if (!this.isAvailable) return false;

    // Batch writes to reduce localStorage access
    this.batchedWrites.set(key, value);

    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    this.flushTimeout = setTimeout(() => this.flush(), 50); // 50ms debounce
    return true;
  }

  setImmediate(key, value) {
    if (!this.isAvailable) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  flush() {
    if (!this.isAvailable || this.batchedWrites.size === 0) return;

    try {
      for (const [key, value] of this.batchedWrites) {
        localStorage.setItem(key, value);
      }
      this.batchedWrites.clear();
    } catch (e) {
      console.warn("Failed to flush localStorage batch:", e);
    }

    this.flushTimeout = null;
  }

  remove(key) {
    if (!this.isAvailable) return false;
    try {
      localStorage.removeItem(key);
      this.batchedWrites.delete(key); // Remove from batch if pending
      return true;
    } catch {
      return false;
    }
  }
}

const storageManager = new LocalStorageManager();

export { LocalStorageManager, storageManager };