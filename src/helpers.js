// ───────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

// Performance: DOM element cache to avoid repeated queries
const domCache = new Map();
function getCachedElement(id) {
  if (!domCache.has(id)) {
    domCache.set(id, document.getElementById(id));
  }
  return domCache.get(id);
}

// Performance: Animation frame manager to prevent excessive visual updates
let animationFrameId = null;
function scheduleVisualUpdate(callback) {
  if (animationFrameId) return; // Debounce
  animationFrameId = requestAnimationFrame(() => {
    callback();
    animationFrameId = null;
  });
}

// Number formatting function
function fmt(num) {
  if (num < 1_000) return Math.floor(num).toString();
  if (num < 1_000_000)
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  if (num < 1_000_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (num < 1_000_000_000_000)
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b";
  return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") + "t";
}

// Helper to set text content with formatting
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = fmt(value || 0);
}

// Check if localStorage is available
function isLocalStorageAvailable() {
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

export {
  domCache,
  getCachedElement,
  scheduleVisualUpdate,
  fmt,
  setText,
  isLocalStorageAvailable
};