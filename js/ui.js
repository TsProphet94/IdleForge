// js/ui.js - UI rendering and modal system
import { fmt } from './resources.js';

// ───────────────────────────────────────────────────────────────────────────
// CUSTOM MODAL SYSTEM
// ───────────────────────────────────────────────────────────────────────────

class ModalSystem {
  constructor() {
    this.currentModal = null;
  }

  createModal(options) {
    // Remove existing modal if any
    this.closeModal();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const container = document.createElement("div");
    container.className = "modal-container";

    const header = document.createElement("div");
    header.className = "modal-header";

    const icon = document.createElement("div");
    icon.className = `modal-icon ${options.type || "info"}`;
    icon.innerHTML = options.icon || "⚠️";

    const title = document.createElement("h3");
    title.className = "modal-title";
    title.textContent = options.title || "Notification";

    header.appendChild(icon);
    header.appendChild(title);

    const content = document.createElement("div");
    content.className = "modal-content";
    content.innerHTML = options.message || "";

    const actions = document.createElement("div");
    actions.className = "modal-actions";

    // Add buttons based on options
    if (options.buttons) {
      options.buttons.forEach((button) => {
        const btn = document.createElement("button");
        btn.className = `modal-btn ${button.class || "secondary"}`;
        btn.innerHTML = button.text;
        btn.onclick = () => {
          this.closeModal();
          if (button.callback) button.callback();
        };
        actions.appendChild(btn);
      });
    }

    container.appendChild(header);
    container.appendChild(content);
    container.appendChild(actions);
    overlay.appendChild(container);

    // Close on overlay click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        this.closeModal();
        if (options.onCancel) options.onCancel();
      }
    });

    // Close on escape key
    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        this.closeModal();
        if (options.onCancel) options.onCancel();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);

    document.body.appendChild(overlay);
    this.currentModal = overlay;

    // Animate in
    setTimeout(() => {
      overlay.classList.add("show");
    }, 10);

    return overlay;
  }

  closeModal() {
    if (this.currentModal) {
      this.currentModal.classList.remove("show");
      setTimeout(() => {
        if (this.currentModal && this.currentModal.parentNode) {
          this.currentModal.parentNode.removeChild(this.currentModal);
        }
        this.currentModal = null;
      }, 300);
    }
  }

  // Custom alert replacement
  showAlert(title, message, type = "info") {
    return new Promise((resolve) => {
      this.createModal({
        title,
        message,
        type,
        icon: type === "warning" ? "⚠️" : type === "info" ? "ℹ️" : "✅",
        buttons: [
          {
            text: "OK",
            class: "primary",
            callback: resolve,
          },
        ],
      });
    });
  }

  // Custom confirm replacement
  showConfirm(title, message, type = "confirm") {
    return new Promise((resolve) => {
      this.createModal({
        title,
        message,
        type,
        icon: type === "prestige" ? "⚡" : type === "danger" ? "⚠️" : "❓",
        buttons: [
          {
            text: "Cancel",
            class: "secondary",
            callback: () => resolve(false),
          },
          {
            text: "Confirm",
            class:
              type === "prestige"
                ? "prestige"
                : type === "danger"
                ? "danger"
                : "primary",
            callback: () => resolve(true),
          },
        ],
        onCancel: () => resolve(false),
      });
    });
  }

  // Prestige-specific modal
  showPrestigeConfirm(reward) {
    return new Promise((resolve) => {
      this.createModal({
        title: "Prestige Confirmation",
        message: `
          <p>Are you sure you want to prestige?</p>
          <p><strong>You will gain:</strong> ${reward} Core Shards</p>
          <p><strong>You will lose:</strong> All resources, money, unlocks, and shop upgrades</p>
          <p><strong>You will keep:</strong> Core upgrades and their bonuses</p>
          <p>This action cannot be undone!</p>
        `,
        type: "prestige",
        icon: "⚡",
        buttons: [
          {
            text: "Cancel",
            class: "secondary",
            callback: () => resolve(false),
          },
          {
            text: `Prestige (+${reward} Core Shards)`,
            class: "prestige",
            callback: () => resolve(true),
          },
        ],
        onCancel: () => resolve(false),
      });
    });
  }

  // Unlock requirement modal
  showUnlockRequirement(resourceName, cost) {
    return this.showAlert(
      "Unlock Required",
      `You need <strong>$${fmt(
        cost
      )}</strong> to unlock <strong>${resourceName}</strong>!`,
      "warning"
    );
  }
}

// Initialize modal system
export const modalSystem = new ModalSystem();

// ───────────────────────────────────────────────────────────────────────────
// UI HELPER FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

// Performance: DOM element cache to avoid repeated queries
const domCache = new Map();

export function getCachedElement(id) {
  if (!domCache.has(id)) {
    const element = document.getElementById(id);
    if (element) domCache.set(id, element);
  }
  return domCache.get(id);
}

// Performance: Animation frame manager to prevent excessive visual updates
let animationFrameId = null;

export function scheduleVisualUpdate(callback) {
  if (animationFrameId) return; // Skip if already scheduled
  animationFrameId = requestAnimationFrame(() => {
    callback();
    animationFrameId = null;
  });
}

// Performance: Centralized localStorage manager with batch operations
class LocalStorageManager {
  constructor() {
    this.batchUpdates = new Map();
    this.batchTimeout = null;
  }

  set(key, value) {
    this.batchUpdates.set(key, value);
    this.scheduleBatchWrite();
  }

  get(key) {
    // Check batch first, then localStorage
    if (this.batchUpdates.has(key)) {
      return this.batchUpdates.get(key);
    }
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.warn("Failed to parse localStorage item:", key, e);
      return null;
    }
  }

  remove(key) {
    this.batchUpdates.delete(key);
    localStorage.removeItem(key);
  }

  clear() {
    this.batchUpdates.clear();
    localStorage.clear();
  }

  scheduleBatchWrite() {
    if (this.batchTimeout) return;
    this.batchTimeout = setTimeout(() => {
      this.flushBatch();
    }, 100); // Batch writes every 100ms
  }

  flushBatch() {
    if (this.batchUpdates.size === 0) return;
    
    try {
      for (const [key, value] of this.batchUpdates) {
        localStorage.setItem(key, JSON.stringify(value));
      }
      this.batchUpdates.clear();
    } catch (e) {
      console.error("Failed to write to localStorage:", e);
    }
    
    this.batchTimeout = null;
  }

  forceBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.flushBatch();
    }
  }
}

export const storageManager = new LocalStorageManager();

// Performance: Object pool for visual effects to reduce garbage collection
export const effectPool = {
  particles: [],
  feedbacks: [],
  pulses: [],
  
  getParticle() {
    return this.particles.pop() || document.createElement('div');
  },
  
  returnParticle(particle) {
    particle.className = '';
    particle.style.cssText = '';
    particle.innerHTML = '';
    this.particles.push(particle);
  },
  
  getFeedback() {
    return this.feedbacks.pop() || document.createElement('div');
  },
  
  returnFeedback(feedback) {
    feedback.className = '';
    feedback.style.cssText = '';
    feedback.innerHTML = '';
    this.feedbacks.push(feedback);
  },
  
  getPulse() {
    return this.pulses.pop() || document.createElement('div');
  },
  
  returnPulse(pulse) {
    pulse.className = '';
    pulse.style.cssText = '';
    pulse.innerHTML = '';
    this.pulses.push(pulse);
  }
};

// UI Elements cache
export const UI_ELEMENTS = {
  // Resource count elements
  ironCount: null,
  copperCount: null,
  nickelCount: null,
  bronzeCount: null,
  silverCount: null,
  cobaltCount: null,
  goldCount: null,
  palladiumCount: null,
  platinumCount: null,
  titaniumCount: null,
  adamantiumCount: null,
  moneyCount: null,
  coreShardsCount: null,
  
  // Main UI panels
  shopList: null,
  resourceFilterSelect: null,
  
  // Tab elements
  tabMine: null,
  tabShop: null,
  tabStats: null,
  tabCore: null,
  
  // Screen elements
  screenMine: null,
  screenShop: null,
  screenStats: null,
  screenCore: null,
  
  // Initialize all UI elements
  init() {
    this.ironCount = getCachedElement("iron-count");
    this.copperCount = getCachedElement("copper-count");
    this.nickelCount = getCachedElement("nickel-count");
    this.bronzeCount = getCachedElement("bronze-count");
    this.silverCount = getCachedElement("silver-count");
    this.cobaltCount = getCachedElement("cobalt-count");
    this.goldCount = getCachedElement("gold-count");
    this.palladiumCount = getCachedElement("palladium-count");
    this.platinumCount = getCachedElement("platinum-count");
    this.titaniumCount = getCachedElement("titanium-count");
    this.adamantiumCount = getCachedElement("adamantium-count");
    this.moneyCount = getCachedElement("money-count");
    this.coreShardsCount = getCachedElement("core-shards-count");
    
    this.shopList = getCachedElement("shop-list");
    this.resourceFilterSelect = getCachedElement("resource-filter-select");
    
    this.tabMine = getCachedElement("tab-mine");
    this.tabShop = getCachedElement("tab-shop");
    this.tabStats = getCachedElement("tab-stats");
    this.tabCore = getCachedElement("tab-forgecore");
    
    this.screenMine = getCachedElement("screen-mine");
    this.screenShop = getCachedElement("screen-shop");
    this.screenStats = getCachedElement("screen-stats");
    this.screenCore = getCachedElement("screen-forgecore");
  }
};

export function setText(id, value) {
  const el = getCachedElement(id);
  if (el) el.textContent = value;
}

// Theme management
export const themeClassList = [
  "classic",
  "neon-cyan",
  "neon-purple", 
  "neon-pink",
  "aurora",
  "dragon-fire",
];

export function setTheme(theme = "classic") {
  // Remove all theme classes
  themeClassList.forEach((cls) => {
    document.body.classList.remove(cls);
  });
  
  // Add selected theme
  document.body.classList.add(theme);
  
  // Save theme preference
  storageManager.set('selectedTheme', theme);
}

// Tab navigation
export function showScreen(targetScreen) {
  const screens = [UI_ELEMENTS.screenMine, UI_ELEMENTS.screenShop, UI_ELEMENTS.screenStats, UI_ELEMENTS.screenCore];
  const tabs = [UI_ELEMENTS.tabMine, UI_ELEMENTS.tabShop, UI_ELEMENTS.tabStats, UI_ELEMENTS.tabCore];
  
  // Hide all screens
  screens.forEach(screen => {
    if (screen) screen.classList.add('hidden');
  });
  
  // Remove active class from all tabs
  tabs.forEach(tab => {
    if (tab) tab.classList.remove('active');
  });
  
  // Show target screen and activate corresponding tab
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
    
    // Activate corresponding tab
    if (targetScreen === UI_ELEMENTS.screenMine && UI_ELEMENTS.tabMine) {
      UI_ELEMENTS.tabMine.classList.add('active');
    } else if (targetScreen === UI_ELEMENTS.screenShop && UI_ELEMENTS.tabShop) {
      UI_ELEMENTS.tabShop.classList.add('active');
    } else if (targetScreen === UI_ELEMENTS.screenStats && UI_ELEMENTS.tabStats) {
      UI_ELEMENTS.tabStats.classList.add('active');
    } else if (targetScreen === UI_ELEMENTS.screenCore && UI_ELEMENTS.tabCore) {
      UI_ELEMENTS.tabCore.classList.add('active');
    }
  }
}

// Auto-save indicator functions
export function showAutoSaveIndicator() {
  let cogIndicator = document.getElementById("autosave-cog");
  if (!cogIndicator) {
    cogIndicator = document.createElement("div");
    cogIndicator.id = "autosave-cog";
    cogIndicator.className = "autosave-cog";
    cogIndicator.innerHTML = "⚙️";
    cogIndicator.title = "Auto-saving...";
    document.body.appendChild(cogIndicator);

    if (!document.getElementById("autosave-cog-styles")) {
      const style = document.createElement("style");
      style.id = "autosave-cog-styles";
      style.textContent = `
        .autosave-cog {
          position: fixed;
          top: 20px;
          right: 20px;
          font-size: 20px;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s ease;
          animation: spin 1s linear infinite;
          pointer-events: none;
        }
        .autosave-cog.show { opacity: 0.7; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `;
      document.head.appendChild(style);
    }
  }
  cogIndicator.classList.add("show");
}

export function hideAutoSaveIndicator() {
  document.getElementById("autosave-cog")?.classList.remove("show");
}