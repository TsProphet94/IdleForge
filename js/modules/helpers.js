// Helper functions module
import { resources } from './data.js';
import { unlockState } from './state.js';

// Performance: DOM element cache to avoid repeated queries
const domCache = new Map();
export function getCachedElement(id) {
  if (!domCache.has(id)) {
    domCache.set(id, document.getElementById(id));
  }
  return domCache.get(id);
}

// Performance: Animation frame manager to prevent excessive visual updates
let animationFrameId = null;
export function scheduleVisualUpdate(callback) {
  if (animationFrameId) return; // Debounce
  animationFrameId = requestAnimationFrame(() => {
    callback();
    animationFrameId = null;
  });
}

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
  const el = getCachedElement(id);
  if (el) el.textContent = fmt(value || 0);
}

/**
 * Checks if a given resource ID is unlocked.
 */
export function isUnlocked(resId) {
  if (resId === "iron") return true;
  return unlockState[resId] === true;
}

// Visual effect pool for performance
export const effectPool = {
  particles: [],
  maxParticles: 50,
  
  getParticle() {
    if (this.particles.length > 0) {
      return this.particles.pop();
    }
    
    const element = document.createElement('div');
    element.className = "";
    element.style.position = "absolute";
    element.style.pointerEvents = "none";
    element.style.zIndex = "9999";
    return element;
  },
  
  returnParticle(element) {
    if (this.particles.length < this.maxParticles) {
      element.className = "";
      element.style.cssText = "position: absolute; pointer-events: none; z-index: 9999;";
      element.textContent = "";
      this.particles.push(element);
    }
  }
};
