// Helper Functions Module

/**
 * Formats large numbers into human-readable strings (e.g., 1.5k, 2.3m).
 */
export function fmt(num) {
  if (num < 1_000) return Math.floor(num).toString();
  if (num < 1_000_000)
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  if (num < 1_000_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (num < 1_000_000_000_000)
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b";
  return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") + "t";
}

/**
 * Sets the text content of an element by ID using formatted values.
 */
export function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = fmt(value || 0);
}

/**
 * Checks if a given resource ID is unlocked.
 */
export function isUnlocked(resId, unlockState) {
  if (resId === "iron") return true;
  return !!unlockState[resId];
}

/**
 * Caches and retrieves DOM elements by ID for performance.
 */
const elementCache = new Map();
export function getCachedElement(id) {
  if (elementCache.has(id)) return elementCache.get(id);
  const el = document.getElementById(id);
  if (el) elementCache.set(id, el);
  return el;
}
