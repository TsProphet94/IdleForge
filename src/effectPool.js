// ───────────────────────────────────────────────────────────────────────────
// EFFECT POOL
// ───────────────────────────────────────────────────────────────────────────

// Performance: Object pool for visual effects to reduce garbage collection
const effectPool = {
  particles: [],
  feedbacks: [],
  pulses: [],

  getParticle() {
    return this.particles.pop() || document.createElement("div");
  },

  returnParticle(element) {
    if (this.particles.length < 10) {
      // Limit pool size
      element.className = "";
      element.style.cssText = "";
      element.innerHTML = "";
      this.particles.push(element);
    }
  },

  getFeedback() {
    return this.feedbacks.pop() || document.createElement("div");
  },

  returnFeedback(element) {
    if (this.feedbacks.length < 5) {
      element.className = "";
      element.style.cssText = "";
      element.innerHTML = "";
      this.feedbacks.push(element);
    }
  },
};

export { effectPool };