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
const modalSystem = new ModalSystem();

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

const storageManager = new LocalStorageManager();

// Helper function to update unlock UI for any resource
function updateResourceUnlockUI(resourceId) {
  const buttons = resourceButtons[resourceId];
  if (!buttons) return;

  const panel = document.querySelector(`[data-resource="${resourceId}"]`);

  // Check unlock status using the specific unlock variables
  const isUnlocked = getResourceUnlockStatus(resourceId);

  if (isUnlocked) {
    panel?.classList.remove("locked");
    buttons.mine?.classList.remove("disabled");
    buttons.sell?.classList.remove("disabled");
    if (buttons.mine) buttons.mine.disabled = false;
    if (buttons.sell) buttons.sell.disabled = false;
  } else {
    panel?.classList.add("locked");
    buttons.mine?.classList.add("disabled");
    buttons.sell?.classList.add("disabled");
    if (buttons.mine) buttons.mine.disabled = true;
    if (buttons.sell) buttons.sell.disabled = true;
  }
} // Helper to check resource unlock status
function getResourceUnlockStatus(resourceId) {
  switch (resourceId) {
    case "iron":
      return true; // Iron is always unlocked
    case "copper":
      return copperUnlocked;
    case "nickel":
      return nickelUnlocked;
    case "bronze":
      return bronzeUnlocked;
    case "silver":
      return silverUnlocked;
    case "cobalt":
      return cobaltUnlocked;
    case "gold":
      return goldUnlocked;
    case "palladium":
      return palladiumUnlocked;
    case "platinum":
      return platinumUnlocked;
    case "titanium":
      return titaniumUnlocked;
    case "adamantium":
      return adamantiumUnlocked;
    default:
      return false;
  }
}

// Generic unlock function for any resource
function unlockResourceUI(resourceId, expandPanel = true) {
  updateResourceUnlockUI(resourceId);

  const panel = document.querySelector(`[data-resource="${resourceId}"]`);

  // Panel expansion logic
  if (expandPanel) {
    panel?.classList.remove("collapsed");
    try {
      localStorage.setItem(`panel-collapsed-${resourceId}`, "0");
    } catch {}
  } else {
    // When loading saves, ensure collapse state matches localStorage
    try {
      const shouldBeCollapsed =
        localStorage.getItem(`panel-collapsed-${resourceId}`) === "1";
      if (shouldBeCollapsed) {
        panel?.classList.add("collapsed");
      } else {
        panel?.classList.remove("collapsed");
      }
    } catch {}
  }

  // Remove lock overlay and unlock shop tab
  document.getElementById(`lock-overlay-${resourceId}`)?.remove();
  document
    .getElementById(`tab-resource-${resourceId}`)
    ?.classList.remove("locked");
}

// ───────────────────────────────────────────────────────────────────────────
// CENTRALIZED DOM INITIALIZATION
// ───────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Initialize shop items first
  ensureShopItemsInitialized();

  // 1. Resource Panel Collapse/Expand System
  document.querySelectorAll(".collapse-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const res = btn.getAttribute("data-res");
      const panel = document.querySelector(
        `.resource-panel[data-resource='${res}']`
      );
      if (!panel) return;
      panel.classList.toggle("collapsed");

      // Remove focus from button after click to prevent persistent styling
      setTimeout(() => {
        btn.blur();
      }, 200);

      // Persist collapsed state in localStorage
      const collapsed = panel.classList.contains("collapsed");
      storageManager.set(`panel-collapsed-${res}`, collapsed ? "1" : "0");
    });
    // On load, restore collapsed state
    const res = btn.getAttribute("data-res");
    const collapsed = storageManager.get(`panel-collapsed-${res}`, "0") === "1";
    if (collapsed) {
      const panel = document.querySelector(
        `.resource-panel[data-resource='${res}']`
      );
      if (panel) panel.classList.add("collapsed");
    }
  });

  // 2. Stats Tab Switching
  const tabBtns = document.querySelectorAll(".stats-tab-btn");
  const mainTab = document.getElementById("stats-main-tab");
  const milestonesTab = document.getElementById("stats-milestones-tab");
  const prestigeTab = document.getElementById("stats-prestige-tab");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Hide all tabs first
      mainTab.classList.add("hidden");
      milestonesTab.classList.add("hidden");
      if (prestigeTab) prestigeTab.classList.add("hidden");

      // Show the selected tab
      if (btn.dataset.tab === "main") {
        mainTab.classList.remove("hidden");
      } else if (btn.dataset.tab === "milestones") {
        milestonesTab.classList.remove("hidden");
        updateMilestoneList();
      } else if (btn.dataset.tab === "prestige" && prestigeTab) {
        prestigeTab.classList.remove("hidden");
        updatePrestigeTab();
      }
    });
  });

  // 3. Initial Save State Check
  const hasSave =
    isLocalStorageAvailable() && !!localStorage.getItem("idleMinerSave");
  if (btnContinue) btnContinue.disabled = !hasSave;
  if (gameUI) gameUI.style.display = "none";
  if (mainMenu) mainMenu.style.display = "flex";
  gameStarted = false;

  if (!hasSave) {
    // fresh boot: relock everything above iron
    relockResource("copper");
    relockResource("nickel");
    relockResource("bronze");
    relockResource("silver");
    relockResource("cobalt");
    relockResource("gold");
    relockResource("palladium");
    relockResource("platinum");
    relockResource("titanium");
    relockResource("adamantium");
  }

  // 4. Initialize locked resources as collapsed
  const lockedResources = [
    "copper",
    "nickel",
    "bronze",
    "silver",
    "cobalt",
    "gold",
    "palladium",
    "platinum",
    "titanium",
    "adamantium",
  ];
  lockedResources.forEach((res) => {
    if (!isUnlocked(res)) {
      const panel = document.querySelector(
        `.resource-panel[data-resource="${res}"]`
      );
      if (panel && !panel.classList.contains("collapsed")) {
        panel.classList.add("collapsed");
      }
    }
  });

  // 5. Initialize prestige UI as hidden
  updatePrestigeUI();

  // 6. Initialize unlock button event listeners for hardcoded HTML buttons
  const unlockResources = [
    "copper",
    "nickel",
    "bronze",
    "silver",
    "cobalt",
    "gold",
    "palladium",
    "platinum",
    "titanium",
    "adamantium",
  ];

  unlockResources.forEach((res) => {
    const btn = document.getElementById(`unlock-${res}-btn`);
    if (btn) {
      btn.addEventListener("click", () => attemptUnlock(res));
    }
  });
});
// ───────────────────────────────────────────────────────────────────────────
// THEME SWITCHER
// ───────────────────────────────────────────────────────────────────────────
const themeSelect = document.getElementById("theme-select");
const themeClassList = [
  "theme-classic",
  "theme-midnight",
  "theme-emerald",
  "theme-sunset",
  "theme-neon-cyan",
  "theme-neon-purple",
  "theme-neon-pink",
  "theme-cyberpunk",
  "theme-aurora",
  "theme-dragon-fire",
];

function setTheme(theme) {
  document.body.classList.remove(...themeClassList);
  if (theme !== "classic") {
    document.body.classList.add(`theme-${theme}`);
  } else {
    document.body.classList.add("theme-classic");
  }
  // Optionally, persist theme in localStorage
  try {
    localStorage.setItem("idleforge-theme", theme);
  } catch {}
}

if (themeSelect) {
  themeSelect.addEventListener("change", (e) => {
    const selectedTheme = e.target.value;
    setTheme(selectedTheme);

    // Premium theme activation effects
    if (selectedTheme === "aurora") {
      // Add special aurora activation effect
      document.body.style.animation = "aurora-dance 2s ease-in-out";
      setTimeout(() => {
        document.body.style.animation = "";
      }, 2000);
    } else if (selectedTheme === "dragon-fire") {
      // Add special dragon fire activation effect
      document.body.style.animation = "fire-flicker 2s ease-in-out";
      setTimeout(() => {
        document.body.style.animation = "";
      }, 2000);
    }
  });

  // On load, set theme from localStorage or default
  let savedTheme = "classic";
  savedTheme = storageManager.get("idleforge-theme", "classic");
  setTheme(savedTheme);
  themeSelect.value = savedTheme;
}
// script.js — IdleForge core + GLOBAL TRACKERS + STATS TAB + FULL-SCREEN SHOP + MICRO-UPGRADES + BUY MAX (>=2 only, no cost shown)

/* eslint-disable no-undef */
import iron from "./resources/iron.js";
import copper from "./resources/copper.js";
import nickel from "./resources/nickel.js";
import bronze from "./resources/bronze.js";
import silver from "./resources/silver.js";
import cobalt from "./resources/cobalt.js";
import gold from "./resources/gold.js";
import palladium from "./resources/palladium.js";
import platinum from "./resources/platinum.js"; // New resource
import titanium from "./resources/titanium.js";
import adamantium from "./resources/adamantium.js";
import { createShopItems } from "./shop/items.js";

/* ────────────────────────────────────────────────────────────────────────────
   DATA MODEL
──────────────────────────────────────────────────────────────────────────── */
export const resources = {
  iron,
  copper,
  nickel,
  bronze,
  silver,
  cobalt,
  gold,
  palladium,
  platinum, // New resource
  titanium,
  adamantium,
  money: { id: "money", count: 0 },
  coreShards: { id: "coreShards", count: 0 },
};

// Initialize shop items with resources - declare but initialize later
export let shopItems;

// Helper function to ensure shop items are initialized
function ensureShopItemsInitialized() {
  if (!shopItems) {
    shopItems = createShopItems(resources);
    console.log("Shop items lazy-initialized:", shopItems.length, "items");
    if (shopItems.length > 0) {
      console.log("Sample shop item:", shopItems[0]);
    } else {
      console.error("No shop items were created!");
    }
  }
  return shopItems;
}

const RES_IDS = [
  "iron",
  "copper",
  "nickel",
  "bronze",
  "silver",
  "cobalt",
  "gold",
  "palladium",
  "platinum",
  "titanium",
  "adamantium",
];

/** Lifetime/global stats */
export const stats = {
  mined: {
    iron: 0,
    copper: 0,
    nickel: 0,
    bronze: 0,
    silver: 0,
    cobalt: 0,
    gold: 0,
    palladium: 0,
    platinum: 0,
    titanium: 0,
    adamantium: 0,
  },
  sold: {
    iron: 0,
    copper: 0,
    nickel: 0,
    bronze: 0,
    silver: 0,
    cobalt: 0,
    gold: 0,
    palladium: 0,
    platinum: 0,
    titanium: 0,
    adamantium: 0,
  },
  earnedMoney: 0,
  spentMoney: 0,
  clicks: { mine: 0, sell: 0, shopBuy: 0, unlock: 0 },
};

/* Unlock costs (balanced for 5-hour progression) */
const UNLOCK_COST = {
  copper: 200000, // Base
  nickel: 800000, // 4x copper (early game)
  bronze: 3200000, // 4x nickel (early game)
  silver: 12800000, // 4x bronze (early game)
  cobalt: 76800000, // 6x silver (mid game start)
  gold: 460800000, // 6x cobalt (mid game)
  palladium: 2764800000, // 6x gold (mid game)
  platinum: 30412800000, // 11x palladium (late game start)
  titanium: 334540800000, // 11x platinum (late game)
  adamantium: 3679948800000, // 11x titanium (late game)
};

/* ────────────────────────────────────────────────────────────────────────────
   UI ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
const ironCountEl = document.getElementById("iron-count");
const copperCountEl = document.getElementById("copper-count");
const nickelCountEl = document.getElementById("nickel-count");
const bronzeCountEl = document.getElementById("bronze-count");
const silverCountEl = document.getElementById("silver-count");
const cobaltCountEl = document.getElementById("cobalt-count");
const goldCountEl = document.getElementById("gold-count");
const palladiumCountEl = document.getElementById("palladium-count");
const platinumCountEl = document.getElementById("platinum-count"); // New resource
const titaniumCountEl = document.getElementById("titanium-count");
const adamantiumCountEl = document.getElementById("adamantium-count");
const moneyCountEl = document.getElementById("money-count");

const shopList = document.getElementById("shop-list");
const resourceTabs = document.querySelectorAll(".resource-tab");

const tabMine = document.getElementById("tab-mine");
const tabShop = document.getElementById("tab-shop");
const tabStats = document.getElementById("tab-stats");
const tabCore = document.getElementById("tab-forgecore");

const screenMine = document.getElementById("screen-mine");
const screenShop = document.getElementById("screen-shop");
const screenStats = document.getElementById("screen-stats");
const screenCore = document.getElementById("screen-forgecore");

const coreShardsCountEl = document.getElementById("core-shards-count");
const prestigeBtn = document.getElementById("prestige-btn");

const overlay = document.getElementById("overlay") || null;

/* ────────────────────────────────────────────────────────────────────────────
   RESOURCE BUTTON ELEMENTS & EVENT LISTENERS
──────────────────────────────────────────────────────────────────────────── */
// Generate resource button elements dynamically
const resourceButtons = {};
RES_IDS.forEach((resId) => {
  resourceButtons[resId] = {
    mine: document.getElementById(`mine-${resId}-btn`),
    sell: document.getElementById(`sell-${resId}-btn`),
  };
});

// Bulk event listener setup for all resources
RES_IDS.forEach((resId) => {
  const { mine, sell } = resourceButtons[resId];
  if (mine) mine.addEventListener("click", () => mineResource(resId));
  if (sell) sell.addEventListener("click", () => sellAll(resId));
});

/* Menus / Save */
const mainMenu = document.getElementById("main-menu");
const settingsMenu = document.getElementById("settings-menu");
const gameUI = document.getElementById("game-ui");
const btnContinue = document.getElementById("btn-continue");
const btnNewGame = document.getElementById("btn-new");
const btnSettings = document.getElementById("btn-settings");
const btnBackToMenu = document.getElementById("btn-back-to-menu");
const toggleAutoSave = document.getElementById("toggle-auto-save");
const btnSaveMenu = document.getElementById("btn-save-menu");
const saveIndicator = document.getElementById("save-indicator");

/* Dev tools */
const isDev = false;
const devPanel = document.getElementById("dev-panel");
const devAddIron = document.getElementById("dev-add-iron");
const devAddCopper = document.getElementById("dev-add-copper");
const devAddNickel = document.getElementById("dev-add-nickel");
const devAddBronze = document.getElementById("dev-add-bronze");
const devAddSilver = document.getElementById("dev-add-silver");
const devAddCobalt = document.getElementById("dev-add-cobalt");
const devAddGold = document.getElementById("dev-add-gold");
const devAddPalladium = document.getElementById("dev-add-palladium");
const devAddPlatinum = document.getElementById("dev-add-platinum"); // New resource
const devAddTitanium = document.getElementById("dev-add-titanium");
const devAddAdamantium = document.getElementById("dev-add-adamantium");
const devAddMoney = document.getElementById("dev-add-money");

if (devPanel) devPanel.classList.toggle("hidden", !isDev);
if (isDev) {
  devAddIron?.addEventListener("click", () => {
    addOre("iron", 10000);
    updateUI();
  });
  devAddCopper?.addEventListener("click", () => {
    addOre("copper", 10000);
    updateUI();
  });
  devAddNickel?.addEventListener("click", () => {
    addOre("nickel", 10000);
    updateUI();
  });
  devAddBronze?.addEventListener("click", () => {
    addOre("bronze", 10000);
    updateUI();
  });
  devAddSilver?.addEventListener("click", () => {
    addOre("silver", 10000);
    updateUI();
  });
  devAddCobalt?.addEventListener("click", () => {
    addOre("cobalt", 10000);
    updateUI();
  });
  devAddGold?.addEventListener("click", () => {
    addOre("gold", 10000);
    updateUI();
  });
  devAddPalladium?.addEventListener("click", () => {
    addOre("palladium", 10000);
    updateUI();
  });
  devAddPlatinum?.addEventListener("click", () => {
    addOre("platinum", 10000);
    updateUI();
  });
  devAddTitanium?.addEventListener("click", () => {
    addOre("titanium", 10000);
    updateUI();
  });
  devAddAdamantium?.addEventListener("click", () => {
    addOre("adamantium", 10000);
    updateUI();
  });
  devAddMoney?.addEventListener("click", () => {
    addMoney(100000000);
    updateUI();
  });
}

/* ────────────────────────────────────────────────────────────────────────────
   AUTO-SELL STATE
──────────────────────────────────────────────────────────────────────────── */
const autoSellTimers = {};
const countdownTimers = {};
const nextSellTimes = {};
const autoSellIntervals = {};

/* ────────────────────────────────────────────────────────────────────────────
   GAME STATE
──────────────────────────────────────────────────────────────────────────── */
let currentResource = "iron";
let copperUnlocked = false;
let nickelUnlocked = false;
let bronzeUnlocked = false;
let silverUnlocked = false;
let cobaltUnlocked = false;
let goldUnlocked = false;
let palladiumUnlocked = false;
let platinumUnlocked = false; // New resource
let titaniumUnlocked = false;
let adamantiumUnlocked = false;

// Prestige system
let prestigeUnlocked = false;
let totalPrestiges = 0;

// Core upgrades system
const coreUpgrades = {
  globalMineRate: {
    level: 0,
    maxLevel: 10,
    baseCost: 1,
    costScale: 2,
    effect: 0.25,
  },
  globalSellValue: {
    level: 0,
    maxLevel: 50,
    baseCost: 2,
    costScale: 2.5,
    effect: 0.1,
  },
};

let autoSaveInterval = null;
let gameStarted = false;

/* ────────────────────────────────────────────────────────────────────────────
   INITIAL UI
──────────────────────────────────────────────────────────────────────────── */
screenShop.classList.add("hidden");
if (overlay) overlay.classList.add("hidden");
tabMine.classList.add("active");

// Disable all resource buttons using dynamic resourceButtons object
Object.keys(resourceButtons).forEach((resourceId) => {
  if (resourceId !== "iron") {
    // Iron starts unlocked
    const buttons = resourceButtons[resourceId];
    if (buttons?.mine) buttons.mine.disabled = true;
    if (buttons?.sell) buttons.sell.disabled = true;
  }
});

/* ────────────────────────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────────────────────── */
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
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = fmt(value || 0);
}
function isUnlocked(resId) {
  switch (resId) {
    case "iron":
      return true;
    case "copper":
      return copperUnlocked;
    case "nickel":
      return nickelUnlocked;
    case "bronze":
      return bronzeUnlocked;
    case "silver":
      return silverUnlocked;
    case "cobalt":
      return cobaltUnlocked;
    case "gold":
      return goldUnlocked;
    case "palladium":
      return palladiumUnlocked;
    case "platinum":
      return platinumUnlocked; // New resource
    case "titanium":
      return titaniumUnlocked;
    case "adamantium":
      return adamantiumUnlocked;
    default:
      return false;
  }
}

/** Add ore & track mined */
function addOre(resId, amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources[resId].count += amount;
  stats.mined[resId] += amount;
}
/** Add money gained */
function addMoney(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.money.count += amount;
  stats.earnedMoney += amount;
}
/** Spend money */
function spendMoney(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.money.count -= amount;
  stats.spentMoney += amount;
}

/** Add core shards */
function addCoreShards(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.coreShards.count += amount;
}

/** Spend core shards */
function spendCoreShards(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  if (resources.coreShards.count < amount) return false;
  resources.coreShards.count -= amount;
  return true;
}

/** Calculate prestige core shards reward */
function calculatePrestigeReward() {
  // Base calculation on total money earned and milestones achieved
  let baseReward = Math.floor(Math.sqrt(stats.earnedMoney / 1000000));

  // Bonus for milestones
  let milestoneBonus = 0;
  RES_IDS.forEach((res) => {
    const mined = stats.mined[res] || 0;
    MILESTONE_THRESHOLDS.forEach((threshold) => {
      if (mined >= threshold) milestoneBonus++;
    });
  });

  // Minimum 1 shard if nickel is unlocked
  return Math.max(1, baseReward + Math.floor(milestoneBonus / 3));
}

/** Check if prestige is available */
function checkPrestigeUnlock() {
  // Prestige button is only unlocked when nickel is currently unlocked
  // Even if player has prestiged before, they need to reach nickel again
  if (!prestigeUnlocked && nickelUnlocked) {
    prestigeUnlocked = true;
    updatePrestigeUI();
  }
}

/** Update prestige UI visibility */
function updatePrestigeUI() {
  // Prestige button visibility - only show when nickel is unlocked
  if (prestigeBtn) {
    prestigeBtn.style.display = prestigeUnlocked ? "block" : "none";
  }

  // Core tab visibility - show if player has ever prestiged (has core shards or total prestiges > 0)
  const hasEverPrestiged = totalPrestiges > 0 || resources.coreShards.count > 0;
  if (tabCore) {
    tabCore.style.display = hasEverPrestiged ? "block" : "none";
  }

  // Core shards display - show if player has ever prestiged
  const coreShardsDisplay = document.getElementById("core-shards-display");
  if (coreShardsDisplay) {
    coreShardsDisplay.style.display = hasEverPrestiged ? "block" : "none";
  }

  const totalPrestgesEl = document.getElementById("total-prestiges");
  if (totalPrestgesEl) {
    totalPrestgesEl.textContent = totalPrestiges;
  }
}

/** Update prestige tab content */
function updatePrestigeTab() {
  // Update core shards display
  const coreShardsEl = document.getElementById("prestige-core-shards");
  if (coreShardsEl) {
    coreShardsEl.textContent = fmt(resources.coreShards.count);
  }

  // Update total prestiges
  const totalPrestigesEl = document.getElementById("prestige-total-count");
  if (totalPrestigesEl) {
    totalPrestigesEl.textContent = totalPrestiges;
  }

  // Update next reward calculation
  const nextRewardEl = document.getElementById("prestige-next-reward");
  if (nextRewardEl) {
    const nextReward = calculatePrestigeReward();
    nextRewardEl.textContent = nextReward;
  }

  // Update prestige button state
  const prestigeActionBtn = document.getElementById("prestige-action-btn");
  const prestigeLockedMsg = document.getElementById("prestige-locked-message");

  if (prestigeActionBtn && prestigeLockedMsg) {
    if (prestigeUnlocked) {
      const reward = calculatePrestigeReward();
      prestigeActionBtn.style.display = "block";
      prestigeLockedMsg.style.display = "none";
      prestigeActionBtn.textContent = `Prestige (+${reward} Core Shards)`;
      prestigeActionBtn.disabled = reward < 1;
    } else {
      prestigeActionBtn.style.display = "none";
      prestigeLockedMsg.style.display = "block";
    }
  }
}

/** Perform prestige */
async function performPrestige() {
  const reward = calculatePrestigeReward();

  if (reward < 1) {
    await modalSystem.showAlert(
      "Cannot Prestige",
      "You need to progress further before you can prestige!",
      "warning"
    );
    return;
  }

  const confirmed = await modalSystem.showPrestigeConfirm(reward);
  if (!confirmed) return;

  // Award core shards
  addCoreShards(reward);
  totalPrestiges++;

  // Reset game progress
  resetGameForPrestige();

  // Update UI to reflect reset state (hide prestige button, etc.)
  updatePrestigeUI();
  updateUI();
  renderShop();

  // Switch to mine tab since player needs to progress again
  showScreen("mine");

  // Show success notification
  await modalSystem.showAlert(
    "Prestige Complete!",
    `You gained <strong>${reward} Core Shards</strong>! Use them to purchase permanent upgrades in the Core tab.`,
    "info"
  );
}

/** Reset game state for prestige */
function resetGameForPrestige() {
  // Stop and clear all auto-sell and countdown timers
  RES_IDS.forEach((resId) => {
    stopAutoSell(resId);
    clearInterval(autoSellTimers[resId]);
    clearInterval(countdownTimers[resId]);
    autoSellTimers[resId] = null;
    countdownTimers[resId] = null;
    nextSellTimes[resId] = null;
    document.getElementById(`sell-timer-${resId}`)?.classList.add("hidden");
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) toggle.checked = false;
    // Reset countdown display
    const countdownEl = document.getElementById(`sell-countdown-${resId}`);
    if (countdownEl) countdownEl.textContent = "";
  });

  // Reset resources (keep core shards and Core upgrades)
  const savedShards = resources.coreShards.count;
  const savedTotalPrestiges = totalPrestiges;
  const savedCoreUpgrades = {};

  // Save Core upgrades before reset
  Object.keys(coreUpgrades).forEach((upgradeId) => {
    savedCoreUpgrades[upgradeId] = { ...coreUpgrades[upgradeId] };
  });

  RES_IDS.forEach((resId) => {
    resources[resId].count = 0;
    resources[resId].perSecond = 0;
    resources[resId].perClick = 1;
  });
  resources.money.count = 0;
  resources.coreShards.count = savedShards;

  // Reset stats (keep prestige-related data)
  Object.keys(stats.mined).forEach((res) => (stats.mined[res] = 0));
  Object.keys(stats.sold).forEach((res) => (stats.sold[res] = 0));
  stats.earnedMoney = 0;
  stats.spentMoney = 0;
  stats.clicks = { mine: 0, sell: 0, shopBuy: 0, unlock: 0 };

  // Reset unlock states (including prestige button, but keep Core tab available)
  copperUnlocked = false;
  nickelUnlocked = false;
  bronzeUnlocked = false;
  silverUnlocked = false;
  cobaltUnlocked = false;
  goldUnlocked = false;
  palladiumUnlocked = false;
  platinumUnlocked = false;
  titaniumUnlocked = false;
  adamantiumUnlocked = false;

  // Lock prestige button again until nickel is re-unlocked
  // But keep Core tab visible since player has Core Shards to spend
  prestigeUnlocked = false;

  // Reset shop items but preserve the reference
  ensureShopItemsInitialized().forEach((item) => {
    item.count = 0;
    item.price = item.basePrice;
  });

  // Reset milestone multipliers
  RES_IDS.forEach((res) => {
    milestoneMultipliers[res] = 1;
  });

  // Restore Core upgrades (prestige should not reset these)
  Object.keys(savedCoreUpgrades).forEach((upgradeId) => {
    if (coreUpgrades[upgradeId]) {
      coreUpgrades[upgradeId] = savedCoreUpgrades[upgradeId];
    }
  });

  // Relock all resources above iron (same as startNewGame logic)
  relockResource("copper");
  relockResource("nickel");
  relockResource("bronze");
  relockResource("silver");
  relockResource("cobalt");
  relockResource("gold");
  relockResource("palladium");
  relockResource("platinum");
  relockResource("titanium");
  relockResource("adamantium");

  // Lock resource tabs in shop
  document.getElementById("tab-resource-copper")?.classList.add("locked");
  document.getElementById("tab-resource-nickel")?.classList.add("locked");
  document.getElementById("tab-resource-bronze")?.classList.add("locked");
  document.getElementById("tab-resource-silver")?.classList.add("locked");
  document.getElementById("tab-resource-cobalt")?.classList.add("locked");
  document.getElementById("tab-resource-gold")?.classList.add("locked");
  document.getElementById("tab-resource-palladium")?.classList.add("locked");
  document.getElementById("tab-resource-platinum")?.classList.add("locked");
  document.getElementById("tab-resource-titanium")?.classList.add("locked");
  document.getElementById("tab-resource-adamantium")?.classList.add("locked");

  // Reset UI buttons using dynamic resourceButtons object
  Object.keys(resourceButtons).forEach((resourceId) => {
    if (resourceId !== "iron") {
      // Iron starts unlocked
      const buttons = resourceButtons[resourceId];
      if (buttons?.mine) buttons.mine.disabled = true;
      if (buttons?.sell) buttons.sell.disabled = true;
    }
  });

  // Reset current resource and tabs
  currentResource = "iron";
  resourceTabs.forEach((tab) =>
    tab.classList.toggle("active", tab.dataset.resource === "iron")
  );

  // Remove all sell-pop elements
  document.querySelectorAll(".sell-pop").forEach((el) => el.remove());

  // Reset money animation state
  if (typeof updateUI.lastMoney !== "undefined") updateUI.lastMoney = 0;

  // Collapse all resource panels except Iron by default
  const resourcesToCollapse = [
    "copper",
    "nickel",
    "bronze",
    "silver",
    "cobalt",
    "gold",
    "palladium",
    "platinum",
    "titanium",
    "adamantium",
  ];
  resourcesToCollapse.forEach((resId) => {
    const panel = document.querySelector(
      `.resource-panel[data-resource='${resId}']`
    );
    if (panel) {
      panel.classList.add("collapsed");
      // Update localStorage to reflect the collapsed state
      try {
        localStorage.setItem(`panel-collapsed-${resId}`, "1");
      } catch {}
    }
  });

  // Ensure Iron panel is expanded
  const ironPanel = document.querySelector(
    `.resource-panel[data-resource='iron']`
  );
  if (ironPanel) {
    ironPanel.classList.remove("collapsed");
    try {
      localStorage.setItem(`panel-collapsed-iron`, "0");
    } catch {}
  }

  // Reset scroll positions
  mineScrollY = 0;
  shopScrollY = 0;
  window.scrollTo(0, 0);

  // Reset UI
  updateUI();
  updateStatsUI();
  showScreen("mine");
}

/** Get Core upgrade cost */
function getForgeCoreCost(upgradeId) {
  const upgrade = coreUpgrades[upgradeId];
  if (!upgrade || upgrade.level >= upgrade.maxLevel) return Infinity;
  return Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costScale, upgrade.level)
  );
}

/** Get Core bonus value */
function getForgeCoreBonusValue(upgradeId) {
  const upgrade = coreUpgrades[upgradeId];
  if (!upgrade) return 0;
  return upgrade.level * upgrade.effect;
}

/** Purchase Core upgrade */
function purchaseForgeCore(upgradeId) {
  const upgrade = coreUpgrades[upgradeId];
  if (!upgrade || upgrade.level >= upgrade.maxLevel) {
    console.log(
      "Cannot purchase upgrade: max level reached or invalid upgrade"
    );
    return false;
  }

  const cost = getForgeCoreCost(upgradeId);
  if (!spendCoreShards(cost)) {
    console.log("Cannot purchase upgrade: insufficient core shards");
    return false;
  }

  upgrade.level++;
  console.log(`Purchased ${upgradeId} upgrade level ${upgrade.level}`);

  // Create purchase feedback effect
  createUpgradePurchaseFeedback(upgradeId);

  updateCoreUI();
  updateUI(); // Refresh to apply new bonuses
  return true;
}

// Make purchaseCore globally accessible
window.purchaseForgeCore = purchaseForgeCore;

/** Create visual feedback for upgrade purchase */
function createUpgradePurchaseFeedback(upgradeId) {
  // Find the upgrade container
  const upgradeContainers = document.querySelectorAll(".forgecore-upgrade");
  upgradeContainers.forEach((container) => {
    const button = container.querySelector(`button[onclick*="${upgradeId}"]`);
    if (button) {
      // Add a temporary success animation
      container.style.transform = "scale(1.02)";
      container.style.boxShadow = "0 0 20px rgba(106, 90, 205, 0.6)";

      setTimeout(() => {
        container.style.transform = "";
        container.style.boxShadow = "";
      }, 300);
    }
  });
}

/** Apply Core bonuses to mining */
function applyForgeCoreBonuses() {
  const globalMineBonus = 1 + getForgeCoreBonusValue("globalMineRate");

  return {
    mineRate: globalMineBonus,
  };
}

/** Sell all */
function sellAll(resId, isAutoSell = false) {
  if (!isUnlocked(resId)) return 0;
  const qty = resources[resId].count;
  if (qty <= 0) return 0;

  // Apply ForgeCore sell value bonus
  const globalSellBonus = 1 + getForgeCoreBonusValue("globalSellValue");
  const cash = Math.floor(qty * resources[resId].sellPrice * globalSellBonus);
  addMoney(cash);
  stats.sold[resId] += qty;
  resources[resId].count = 0;
  stats.clicks.sell++;

  // Enhanced visual effects for autosell
  if (isAutoSell) {
    createAutoSellEffects(resId, cash, qty);

    // Add haptic feedback for mobile
    if ("vibrate" in navigator) {
      navigator.vibrate([30, 10, 30]); // Short-pause-short pattern
    }
  } else {
    createSellPop(resId);
  }

  updateUI();
  return cash;
}
/** Manual mine */
function mineResource(resId) {
  if (!isUnlocked(resId)) return;
  const bonuses = applyForgeCoreBonuses();
  const gain = resources[resId].perClick * bonuses.mineRate;
  addOre(resId, gain);
  stats.clicks.mine++;

  // Enhanced mine button feedback for all themes
  const mineButton = document.getElementById(`mine-${resId}-btn`);
  if (mineButton) {
    // Add immediate button feedback
    mineButton.classList.add("mining-active");
    setTimeout(() => {
      mineButton.classList.remove("mining-active");
    }, 200);

    // Add button shake for impact
    mineButton.classList.add("mining-shake");
    setTimeout(() => {
      mineButton.classList.remove("mining-shake");
    }, 300);
  }

  // Premium theme click effects
  const currentTheme = document.body.className;
  if (
    currentTheme.includes("theme-aurora") ||
    currentTheme.includes("theme-dragon-fire")
  ) {
    const resourceCard =
      document.querySelector(`[data-resource="${resId}"]`) ||
      document.querySelector(`#${resId}-panel`);
    if (resourceCard) {
      resourceCard.classList.add("clicking");
      setTimeout(() => {
        resourceCard.classList.remove("clicking");
      }, 600);
    }
  }

  // Create floating damage/gain indicator
  createMiningFeedback(mineButton, gain, resId);

  updateUI();
}

// New function for mining feedback animations
function createMiningFeedback(button, gain, resId) {
  if (!button) return;

  // Haptic feedback for mobile devices
  if ("vibrate" in navigator) {
    navigator.vibrate(50); // Short vibration
  }

  const feedback = document.createElement("div");
  feedback.className = "mining-feedback";
  feedback.textContent = `+${gain}`;

  // Add resource-specific styling
  feedback.setAttribute("data-resource", resId);

  // Position relative to button
  const rect = button.getBoundingClientRect();
  feedback.style.position = "fixed";
  feedback.style.left = rect.left + rect.width / 2 + "px";
  feedback.style.top = rect.top + "px";
  feedback.style.transform = "translateX(-50%)";
  feedback.style.pointerEvents = "none";
  feedback.style.zIndex = "9999";

  document.body.appendChild(feedback);

  // Animate upward and fade out
  setTimeout(() => {
    feedback.style.transform = "translateX(-50%) translateY(-40px) scale(1.2)";
    feedback.style.opacity = "0";
  }, 10);

  // Remove element after animation
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.parentNode.removeChild(feedback);
    }
  }, 800);

  // Create particle burst for higher tier resources
  if (
    ["gold", "palladium", "platinum", "titanium", "adamantium"].includes(resId)
  ) {
    createParticleBurst(button, resId);
  }
}

// Particle burst effect for premium resources
function createParticleBurst(button, resId) {
  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Create 6-8 particles
  for (let i = 0; i < 7; i++) {
    const particle = document.createElement("div");
    particle.className = "mining-particle";
    particle.setAttribute("data-resource", resId);

    particle.style.position = "fixed";
    particle.style.left = centerX + "px";
    particle.style.top = centerY + "px";
    particle.style.width = "4px";
    particle.style.height = "4px";
    particle.style.borderRadius = "50%";
    particle.style.pointerEvents = "none";
    particle.style.zIndex = "9999";

    // Resource-specific particle colors
    const colors = {
      gold: "#ffec8b",
      palladium: "#e8eaf0",
      platinum: "#b2b2b2",
      titanium: "#a3a3a3",
      adamantium: "#6a6a6a",
    };

    particle.style.background = colors[resId] || "#ffffff";
    particle.style.boxShadow = `0 0 6px ${colors[resId] || "#ffffff"}`;

    document.body.appendChild(particle);

    // Random direction and distance
    const angle = (i / 7) * 2 * Math.PI;
    const distance = 30 + Math.random() * 20;
    const targetX = centerX + Math.cos(angle) * distance;
    const targetY = centerY + Math.sin(angle) * distance;

    // Animate particle
    setTimeout(() => {
      particle.style.transition =
        "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      particle.style.left = targetX + "px";
      particle.style.top = targetY + "px";
      particle.style.opacity = "0";
      particle.style.transform = "scale(0)";
    }, 10);

    // Remove particle
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 650);
  }
}

// Screen flash effect for enhanced feedback
function createScreenFlash(resId) {
  const flash = document.createElement("div");
  flash.className = "mining-screen-flash";
  flash.style.position = "fixed";
  flash.style.top = "0";
  flash.style.left = "0";
  flash.style.width = "100vw";
  flash.style.height = "100vh";
  flash.style.pointerEvents = "none";
  flash.style.zIndex = "9998";
  flash.style.opacity = "0";

  // Theme-specific flash colors
  const currentTheme = document.body.className;
  if (currentTheme.includes("theme-aurora")) {
    flash.style.background =
      "radial-gradient(circle, rgba(79, 172, 254, 0.1) 0%, transparent 70%)";
  } else if (currentTheme.includes("theme-dragon-fire")) {
    flash.style.background =
      "radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%)";
  } else {
    flash.style.background =
      "radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)";
  }

  document.body.appendChild(flash);

  // Quick flash animation
  setTimeout(() => {
    flash.style.opacity = "1";
    flash.style.transition = "opacity 0.1s ease-out";
  }, 10);

  setTimeout(() => {
    flash.style.opacity = "0";
    flash.style.transition = "opacity 0.2s ease-out";
  }, 80);

  // Remove after animation
  setTimeout(() => {
    if (flash.parentNode) {
      flash.parentNode.removeChild(flash);
    }
  }, 300);
}

/* ────────────────────────────────────────────────────────────────────────────
   BULK BUY HELPERS
──────────────────────────────────────────────────────────────────────────── */
function bulkCost(item, n) {
  const a = item.basePrice * Math.pow(item.scale, item.count);
  if (item.scale === 1) return Math.floor(a * n);
  return Math.floor((a * (Math.pow(item.scale, n) - 1)) / (item.scale - 1));
}
function bulkAffordable(item, money) {
  const a = item.basePrice * Math.pow(item.scale, item.count);
  if (item.scale === 1) {
    return Math.max(0, Math.min(item.max - item.count, Math.floor(money / a)));
  }
  const n = Math.floor(
    Math.log(1 + (money * (item.scale - 1)) / a) / Math.log(item.scale)
  );
  return Math.max(0, Math.min(n, item.max - item.count));
}
function buyMaxCount(item) {
  return bulkAffordable(item, resources.money.count);
}
// Keeping this in case you want to show cost somewhere else later
function buyMaxCost(item) {
  const n = buyMaxCount(item);
  return n > 0 ? bulkCost(item, n) : 0;
}

/* ────────────────────────────────────────────────────────────────────────────
   STATS UI & MILESTONES
──────────────────────────────────────────────────────────────────────────── */
function updateStatsUI() {
  setText("stat-earned", stats.earnedMoney);
  setText("stat-spent", stats.spentMoney);
  setText("stat-net", stats.earnedMoney - stats.spentMoney);

  RES_IDS.forEach((res) => {
    setText(`stat-mined-${res}`, stats.mined[res]);
    setText(`stat-sold-${res}`, stats.sold[res]);
  });

  setText("stat-click-mine", stats.clicks.mine);
  setText("stat-click-sell", stats.clicks.sell);
  setText("stat-click-shop", stats.clicks.shopBuy);
  setText("stat-click-unlock", stats.clicks.unlock);

  // Highscore calculation: sum of earned money, mined resources, and milestones
  const minedTotal = RES_IDS.reduce(
    (sum, res) => sum + (stats.mined[res] || 0),
    0
  );
  const milestoneScore = RES_IDS.reduce((sum, res) => {
    let idx = 0;
    for (let i = MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
      if ((stats.mined[res] || 0) >= MILESTONE_THRESHOLDS[i]) {
        idx = i + 1;
        break;
      }
    }
    return sum + idx * 1000;
  }, 0);
  const score = Math.floor(stats.earnedMoney + minedTotal * 2 + milestoneScore);
  // Save and display highscore
  let highscore = 0;
  try {
    highscore = parseInt(localStorage.getItem("idleMinerHighscore") || "0", 10);
  } catch {}
  if (score > highscore) {
    highscore = score;
    try {
      localStorage.setItem("idleMinerHighscore", highscore);
    } catch {}
  }
  setText("stat-highscore", highscore);

  // Apply any newly reached milestones before showing list
  applyMilestoneRewards();
  updateMilestoneList();
}

// Milestone logic
const MILESTONE_THRESHOLDS = [100, 1000, 10000, 100000, 1000000];
const MILESTONE_LABELS = ["100", "1K", "10K", "100K", "1M"];

// Multipliers for each milestone tier
const MILESTONE_MULTIPLIERS = [1.2, 1.5, 1.8, 2, 2.5];

// Track which rewards have been applied per resource & tier
export const milestoneRewardsApplied = RES_IDS.reduce((acc, res) => {
  acc[res] = MILESTONE_THRESHOLDS.map(() => false);
  return acc;
}, {});
// Current multiplier factor for each resource
export const milestoneMultipliers = RES_IDS.reduce((acc, res) => {
  acc[res] = 1;
  return acc;
}, {});

/** Grant autominer rate boosts when milestones are reached */
function applyMilestoneRewards() {
  RES_IDS.forEach((res) => {
    // Determine the highest milestone achieved for this resource
    let topMultiplier = 1;
    for (let i = MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (stats.mined[res] >= MILESTONE_THRESHOLDS[i]) {
        topMultiplier = MILESTONE_MULTIPLIERS[i];
        break;
      }
    }
    // Apply only the highest-tier multiplier
    milestoneMultipliers[res] = topMultiplier;
  });
}

const milestoneList = document.getElementById("milestone-list");

function updateMilestoneList() {
  if (!milestoneList) return;
  milestoneList.innerHTML = "";
  RES_IDS.forEach((res) => {
    if (!isUnlocked(res)) return;
    const mined = stats.mined[res] || 0;
    // Find the highest achieved milestone index for this resource
    let currentMilestoneIdx = -1;
    for (let i = MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (mined >= MILESTONE_THRESHOLDS[i]) {
        currentMilestoneIdx = i;
        break;
      }
    }
    // Create a container for each resource
    const section = document.createElement("div");
    section.className = "milestone-resource-section";
    section.innerHTML = `<h4 class=\"milestone-resource-title\">${
      res.charAt(0).toUpperCase() + res.slice(1)
    }</h4>`;
    const ul = document.createElement("ul");
    ul.className = "milestone-resource-list";
    let nextShown = false;
    MILESTONE_THRESHOLDS.forEach((threshold, i) => {
      const achieved = mined >= threshold;
      // Calculate progress for this milestone
      let progress = 0;
      if (achieved) {
        progress = 1;
      } else if (i === 0) {
        progress = Math.max(0, Math.min(1, mined / threshold));
      } else {
        const prev = MILESTONE_THRESHOLDS[i - 1];
        progress = Math.max(
          0,
          Math.min(1, (mined - prev) / (threshold - prev))
        );
      }
      if (achieved || (!nextShown && !achieved)) {
        const li = document.createElement("li");
        li.className = achieved ? "milestone-achieved" : "";
        // Progress bar background
        const bar = document.createElement("div");
        bar.className = "milestone-progress-bar";
        const fill = document.createElement("div");
        fill.className = "milestone-progress-fill";
        fill.style.width = progress * 100 + "%";
        bar.appendChild(fill);
        li.appendChild(bar);
        // Milestone content
        const content = document.createElement("div");
        content.className = "milestone-content";
        let indicator = "";
        // Show multiplier indicator for the current active milestone
        if (i === currentMilestoneIdx && currentMilestoneIdx !== -1) {
          indicator = `<span class=\"milestone-multiplier-indicator\" style=\"margin-left:0.7em;color:#ffd93d;font-weight:700;\">${MILESTONE_MULTIPLIERS[i]}x minerate</span>`;
        }
        // Show next milestone reward for the next milestone (if not achieved and is the next milestone)
        let nextIndicator = "";
        if (
          !achieved &&
          i === currentMilestoneIdx + 1 &&
          i < MILESTONE_MULTIPLIERS.length
        ) {
          nextIndicator = `<span class=\"milestone-next-indicator\" style=\"margin-left:0.7em;color:#b3b3b3;font-weight:600;\">${MILESTONE_MULTIPLIERS[i]}x minerate</span>`;
        }
        content.innerHTML = `
          <span class=\"milestone-badge\">${MILESTONE_LABELS[i]}</span> ${
          res.charAt(0).toUpperCase() + res.slice(1)
        } mined: <strong>${threshold.toLocaleString()}</strong> ${indicator} ${nextIndicator}
        `;
        li.appendChild(content);
        ul.appendChild(li);
        if (!achieved) nextShown = true;
      }
    });
    section.appendChild(ul);
    milestoneList.appendChild(section);
  });
}

/* ────────────────────────────────────────────────────────────────────────────
   AUTO-MINE LOOP (OPTIMIZED)
──────────────────────────────────────────────────────────────────────────── */
// Performance: Use single game loop with RAF instead of multiple setInterval
let gameLoopRunning = false;
let lastTimestamp = 0;

// Performance: Throttle expensive operations to improve frame rate
const throttledOperations = {
  updateShopButtons: null,
  updateStatsUI: null,

  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

// Initialize throttled functions
throttledOperations.updateShopButtons = throttledOperations.throttle(
  updateShopButtons,
  100
);
throttledOperations.updateStatsUI = throttledOperations.throttle(
  updateStatsUI,
  200
);

function gameLoop(timestamp) {
  if (!gameStarted || !gameLoopRunning) return;

  // Initialize lastTimestamp on first run
  if (lastTimestamp === 0) {
    lastTimestamp = timestamp;
    requestAnimationFrame(gameLoop);
    return;
  }

  // Calculate delta time (limit to max 100ms to prevent huge jumps)
  const deltaTime = Math.min(timestamp - lastTimestamp, 100);
  lastTimestamp = timestamp;

  if (deltaTime > 0) {
    // Auto-mining: Update at 60fps but calculate proper time-based increments
    RES_IDS.forEach((id) => {
      if (!isUnlocked(id)) return;
      const ratePerSecond = resources[id].perSecond * milestoneMultipliers[id];
      if (ratePerSecond > 0) {
        const gain = (ratePerSecond * deltaTime) / 1000; // Convert ms to seconds
        addOre(id, gain);
      }
    });

    // Update UI every frame for smooth feedback
    scheduleVisualUpdate(() => {
      updateUI();
      if (!screenStats.classList.contains("hidden"))
        throttledOperations.updateStatsUI();
      if (!screenShop.classList.contains("hidden"))
        throttledOperations.updateShopButtons();
    });
  }

  requestAnimationFrame(gameLoop);
}
function startGameLoop() {
  if (!gameLoopRunning) {
    gameLoopRunning = true;
    lastTimestamp = 0; // Reset to ensure proper initialization in gameLoop
    requestAnimationFrame(gameLoop);
  }
}

function stopGameLoop() {
  gameLoopRunning = false;
}

/* ────────────────────────────────────────────────────────────────────────────
   UNLOCK LOGIC (FIXED)
──────────────────────────────────────────────────────────────────────────── */
function attemptUnlock(res) {
  const cost = UNLOCK_COST[res];
  if (resources.money.count < cost) {
    const resourceName = res.charAt(0).toUpperCase() + res.slice(1);
    modalSystem.showUnlockRequirement(resourceName, cost);
    return;
  }
  spendMoney(cost);
  stats.clicks.unlock++;

  if (res === "copper") unlockCopperUI();
  if (res === "nickel") unlockNickelUI();
  if (res === "bronze") unlockBronzeUI();
  if (res === "silver") unlockSilverUI();
  if (res === "cobalt") unlockCobaltUI();
  if (res === "gold") unlockGoldUI();
  if (res === "palladium") unlockPalladiumUI();
  if (res === "platinum") unlockPlatinumUI(); // New resource
  if (res === "titanium") unlockTitaniumUI();
  if (res === "adamantium") unlockAdamantiumUI();

  updateUI();
  updateStatsUI();
}

/** Always recreate overlay/button for a locked resource */
function relockResource(res) {
  const panel = document.querySelector(
    `.resource-panel[data-resource="${res}"]`
  );
  if (!panel) return;

  panel.classList.add("locked");
  panel.classList.add("collapsed");

  const old = document.getElementById(`lock-overlay-${res}`);
  if (old) old.remove();

  const lockOverlay = document.createElement("div");
  lockOverlay.className = "lock-overlay";
  lockOverlay.id = `lock-overlay-${res}`;
  lockOverlay.innerHTML = `
    <button id="unlock-${res}-btn">
      Unlock ${res[0].toUpperCase() + res.slice(1)} ($${fmt(UNLOCK_COST[res])})
    </button>
  `;
  panel.appendChild(lockOverlay);

  document
    .getElementById(`unlock-${res}-btn`)
    .addEventListener("click", () => attemptUnlock(res));
}

/* ────────────────────────────────────────────────────────────────────────────
   SHOP
──────────────────────────────────────────────────────────────────────────── */
// Click handler supports Buy 1 & Buy Max
shopList.addEventListener("click", (e) => {
  const isMax = e.target.classList.contains("shop-btn-max");
  const isBuy = e.target.classList.contains("shop-btn") && !isMax;
  if (!isMax && !isBuy) return;

  // Ensure shop items are initialized
  const items = ensureShopItemsInitialized();

  const id = e.target.dataset.itemId || e.target.id;
  const item = items.find((i) => i.id === id);
  if (!item) return;

  let n = 1;
  if (isMax) {
    n = buyMaxCount(item);
    if (n <= 0) return;
  }

  const cost = isMax ? bulkCost(item, n) : item.price;
  if (resources.money.count < cost) return;

  spendMoney(cost);
  stats.clicks.shopBuy += n;

  for (let i = 0; i < n; i++) item.apply();

  item.count += n;
  item.price = Math.floor(item.basePrice * Math.pow(item.scale, item.count));

  updateUI();
  renderShop();
  // Apply milestone rewards on shop purchase
  applyMilestoneRewards();
  // Refresh UI & stats so new autominer rates show immediately
  updateUI();
  updateStatsUI();

  if (item.id.endsWith("-autoseller")) {
    const resId = item.category;
    document.getElementById(`sell-timer-${resId}`)?.classList.remove("hidden");
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) {
      toggle.checked = true;
      startAutoSell(resId);
    }
  }

  // Handle autosell speed upgrades
  if (item.id.endsWith("-autosell-speed")) {
    const resId = item.category;
    // Check if autosell is currently active for this resource
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle && toggle.checked) {
      // Restart autosell with the new speed
      startAutoSell(resId);
    }
  }
});

/* Resource filter tabs inside shop */
resourceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const res = tab.dataset.resource;
    if (!RES_IDS.includes(res)) return;

    if (!isUnlocked(res)) {
      attemptUnlock(res);
      return;
    }

    currentResource = res;
    resourceTabs.forEach((t) => t.classList.toggle("active", t === tab));
    switchResource(currentResource);
  });
});

/* TOP NAV TABS */
tabMine.addEventListener("click", () => showScreen("mine"));
tabShop.addEventListener("click", () => showScreen("shop"));
tabStats.addEventListener("click", () => showScreen("stats"));
if (tabCore) tabCore.addEventListener("click", () => showScreen("forgecore"));

// Prestige button
if (prestigeBtn) {
  prestigeBtn.addEventListener("click", performPrestige);
}

// Prestige action button in prestige tab
const prestigeActionBtn = document.getElementById("prestige-action-btn");
if (prestigeActionBtn) {
  prestigeActionBtn.addEventListener("click", performPrestige);
}

// Track scroll positions for mine and shop screens (using window scroll if screens are not independently scrollable)
let mineScrollY = 0;
let shopScrollY = 0;

function showScreen(which) {
  // Save scroll position for the current screen
  if (!screenMine.classList.contains("hidden")) {
    mineScrollY = window.scrollY;
  }
  if (!screenShop.classList.contains("hidden")) {
    shopScrollY = window.scrollY;
  }

  tabMine.classList.remove("active");
  tabShop.classList.remove("active");
  tabStats.classList.remove("active");
  if (tabCore) tabCore.classList.remove("active");

  screenMine.classList.add("hidden");
  screenShop.classList.add("hidden");
  screenStats.classList.add("hidden");
  if (screenCore) screenCore.classList.add("hidden");

  switch (which) {
    case "mine":
      tabMine.classList.add("active");
      screenMine.classList.remove("hidden");
      // Restore mine scroll position
      setTimeout(() => window.scrollTo(0, mineScrollY), 0);
      break;
    case "shop":
      tabShop.classList.add("active");
      screenShop.classList.remove("hidden");
      renderShop();
      // Restore shop scroll position
      setTimeout(() => window.scrollTo(0, shopScrollY), 0);
      break;
    case "stats":
      tabStats.classList.add("active");
      screenStats.classList.remove("hidden");
      updateStatsUI();
      break;
    case "forgecore":
      if (tabCore) tabCore.classList.add("active");
      if (screenCore) screenCore.classList.remove("hidden");
      updateCoreUI();
      break;
  }
  // Removed analytics tracking
}

/** Update Core UI */
function updateCoreUI() {
  if (!screenCore) return;

  const container = document.getElementById("forgecore-upgrades");
  if (!container) return;

  container.innerHTML = "";

  Object.entries(coreUpgrades).forEach(([upgradeId, upgrade]) => {
    const cost = getForgeCoreCost(upgradeId);
    const canAfford =
      resources.coreShards.count >= cost && upgrade.level < upgrade.maxLevel;

    const upgradeDiv = document.createElement("div");
    upgradeDiv.className = "forgecore-upgrade";

    const upgradeNames = {
      globalMineRate: "Global Mine Rate",
      globalSellValue: "Global Sell Value",
    };

    const upgradeDescriptions = {
      globalMineRate: "Increases manual mining yield",
      globalSellValue: "Increases resource sell prices",
    };

    // Calculate current and next effect values
    const currentEffect = getForgeCoreBonusValue(upgradeId);
    const nextEffect = currentEffect + upgrade.effect;

    // Format effect display (all remaining upgrades are percentage-based)
    let effectDisplay = `Current: +${(currentEffect * 100).toFixed(1)}%`;
    if (upgrade.level < upgrade.maxLevel) {
      effectDisplay += ` | Next: +${(nextEffect * 100).toFixed(1)}%`;
    }

    upgradeDiv.innerHTML = `
      <div class="forgecore-upgrade-header">
        <h3 class="forgecore-upgrade-name">${upgradeNames[upgradeId]}</h3>
        <span class="forgecore-upgrade-level">${upgrade.level}/${
      upgrade.maxLevel
    }</span>
      </div>
      <p class="forgecore-upgrade-desc">${upgradeDescriptions[upgradeId]}</p>
      <div class="forgecore-upgrade-effect">
        ${effectDisplay}
      </div>
      <div class="forgecore-upgrade-cost">
        Cost: ${
          upgrade.level >= upgrade.maxLevel ? "MAXED" : `${cost} Core Shards`
        }
      </div>
      <button 
        class="forgecore-upgrade-btn" 
        ${!canAfford || upgrade.level >= upgrade.maxLevel ? "disabled" : ""}
        onclick="purchaseForgeCore('${upgradeId}')"
      >
        ${upgrade.level >= upgrade.maxLevel ? "MAXED" : "Purchase"}
      </button>
    `;

    container.appendChild(upgradeDiv);
  });
}

function switchResource(res) {
  document
    .querySelectorAll(".resource-panel")
    .forEach((panel) =>
      panel.classList.toggle("active", panel.dataset.resource === res)
    );
  renderShop();
  updateUI();
}

/** Update only dynamic bits in existing cards (price, button, bar) - OPTIMIZED */
function updateShopButtons() {
  // Ensure shop items are initialized
  const items = ensureShopItemsInitialized();

  // Performance: Cache shop elements to avoid repeated queries
  if (!updateShopButtons.elementCache) {
    updateShopButtons.elementCache = new Map();
  }

  const cache = updateShopButtons.elementCache;
  const currentMoney = resources.money.count;

  items
    .filter((item) => item.category === currentResource)
    .forEach((item) => {
      // Cache DOM elements for this item
      if (!cache.has(item.id)) {
        cache.set(item.id, {
          buyBtn: document.querySelector(
            `.shop-btn[data-item-id="${item.id}"]:not(.shop-btn-max)`
          ),
          maxBtn: document.querySelector(
            `.shop-btn-max[data-item-id="${item.id}"]`
          ),
          priceEl: getCachedElement(`price-${item.id}`),
          ownedEl: getCachedElement(`owned-${item.id}`),
          barEl: getCachedElement(`bar-${item.id}`),
        });
      }

      const elements = cache.get(item.id);
      const { buyBtn, maxBtn, priceEl, ownedEl, barEl } = elements;

      if (buyBtn) {
        const canAfford = currentMoney >= item.price;
        buyBtn.disabled = !canAfford || item.count >= item.max;
        buyBtn.textContent = item.count >= item.max ? "Maxed" : "Buy";
      }

      if (maxBtn) {
        const maxN = buyMaxCount(item);
        const locked = item.count >= item.max;
        maxBtn.disabled = locked || maxN < 2;
        maxBtn.textContent = locked
          ? "Maxed"
          : maxN >= 2
          ? `Buy Max (${maxN})`
          : "Buy Max";
      }

      if (priceEl) priceEl.textContent = `$${fmt(item.price)}`;
      if (ownedEl) ownedEl.textContent = `${item.count}/${item.max}`;
      if (barEl) barEl.style.width = (item.count / item.max) * 100 + "%";
    });
}

/** Build the shop list with descriptions */
function renderShop() {
  if (!shopList) {
    console.error("shopList element not found!");
    return;
  }

  // Ensure shop items are initialized
  const allItems = ensureShopItemsInitialized();

  // Always rebuild the cache to ensure fresh data
  // Remove the complex caching logic that might be causing issues
  const items = allItems.filter((i) => i.category === currentResource);

  if (!items.length) {
    shopList.innerHTML = `<li class="shop-empty">No upgrades for "${currentResource}"</li>`;
    return;
  }

  const frag = document.createDocumentFragment();

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "shop-card";
    li.dataset.itemId = item.id;

    const pct = (item.count / item.max) * 100;

    li.innerHTML = `
      <div class="shop-item-head">
        <span class="shop-item-name">${item.name}</span>
        <span class="shop-item-price" id="price-${item.id}">$${fmt(
      item.price
    )}</span>
      </div>

      <p class="shop-item-desc">${item.description || ""}</p>

      <div class="shop-bar">
        <div class="shop-bar-fill" id="bar-${
          item.id
        }" style="width:${pct}%;"></div>
      </div>

      <div class="shop-item-meta">
        <span id="owned-${item.id}">${item.count}/${item.max}</span>
        <span class="cat">${item.category}</span>
      </div>
    `;

    const btnRow = document.createElement("div");
    btnRow.className = "shop-btn-row";

    const btn = document.createElement("button");
    btn.className = "shop-btn";
    btn.dataset.itemId = item.id;
    btn.textContent = item.count >= item.max ? "Maxed" : "Buy";
    btn.disabled = resources.money.count < item.price || item.count >= item.max;

    const btnMax = document.createElement("button");
    btnMax.className = "shop-btn shop-btn-max";
    btnMax.dataset.itemId = item.id;
    const maxN = buyMaxCount(item);
    const locked = item.count >= item.max;
    btnMax.disabled = locked || maxN < 2;
    btnMax.textContent = locked
      ? "Maxed"
      : maxN >= 2
      ? `Buy Max (${maxN})`
      : "Buy Max";

    btnRow.appendChild(btn);
    btnRow.appendChild(btnMax);
    li.appendChild(btnRow);

    frag.appendChild(li);
  });

  shopList.innerHTML = "";
  shopList.appendChild(frag);
  // Attach auto-sell toggle listeners after shop is rendered
  RES_IDS.forEach((resId) => {
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) {
      toggle.removeEventListener(
        "change",
        toggle._autoSellHandler || (() => {})
      );
      toggle._autoSellHandler = function (e) {
        if (e.target.checked) {
          startAutoSell(resId);
        } else {
          stopAutoSell(resId);
        }
      };
      toggle.addEventListener("change", toggle._autoSellHandler);
    }
  });
}

/* ────────────────────────────────────────────────────────────────────────────
   GENERAL UI UPDATE
──────────────────────────────────────────────────────────────────────────── */
/* ────────────────────────────────────────────────────────────────────────────
   GENERAL UI UPDATE (OPTIMIZED)
──────────────────────────────────────────────────────────────────────────── */
function updateUI() {
  // Performance: Early exit if not started
  if (!gameStarted) return;

  // Check for prestige unlock
  checkPrestigeUnlock();

  // Performance: Batch DOM updates to minimize reflows
  const updates = new Map();

  // Collect all updates first
  RES_IDS.forEach((resId) => {
    const resObj = resources[resId];

    updates.set(`${resId}-count`, fmt(resObj.count || 0));

    // Auto-mining rate
    const rate = resObj.perSecond * milestoneMultipliers[resId] || 0;
    updates.set(`auto-rate-${resId}`, fmt(rate));
    updates.set(`collapsed-auto-${resId}`, fmt(rate) + "/s");

    // Sell button state
    const sellBtn = resourceButtons[resId]?.sell;
    if (sellBtn) {
      sellBtn.disabled = resObj.count <= 0;
    }

    // Price tags
    if (isUnlocked(resId)) {
      const basePrice = resources[resId].sellPrice;
      const globalSellBonus = 1 + getForgeCoreBonusValue("globalSellValue");
      const finalPrice = Math.floor(basePrice * globalSellBonus);
      updates.set(`pricetag-${resId}`, {
        display: "inline-block",
        text: `$${fmt(finalPrice)}`,
      });
    } else {
      updates.set(`pricetag-${resId}`, { display: "none" });
    }
  });

  // Apply all updates in one batch
  for (const [elementId, value] of updates) {
    const element = getCachedElement(elementId);
    if (!element) continue;

    if (typeof value === "object" && value !== null) {
      // Handle complex updates
      if (value.display) element.style.display = value.display;
      if (value.text) element.textContent = value.text;
    } else {
      // Simple text updates
      element.textContent = value;
    }
  }

  // Money display with animation optimization
  updateMoneyDisplay();

  // Core shards display
  if (coreShardsCountEl) {
    coreShardsCountEl.textContent = fmt(resources.coreShards.count);
  }

  // Update prestige button
  if (prestigeBtn && prestigeUnlocked) {
    const reward = calculatePrestigeReward();
    prestigeBtn.textContent = `Prestige (+${reward} Core Shards)`;
    prestigeBtn.disabled = reward < 1;
  }

  // Update prestige tab if stats screen and prestige tab are visible
  const statsScreen = document.getElementById("screen-stats");
  const prestigeTab = document.getElementById("stats-prestige-tab");
  if (
    statsScreen &&
    prestigeTab &&
    !statsScreen.classList.contains("hidden") &&
    !prestigeTab.classList.contains("hidden")
  ) {
    updatePrestigeTab();
  }
}

// Separate money display function to reduce main updateUI complexity
function updateMoneyDisplay() {
  if (!updateMoneyDisplay.lastMoney)
    updateMoneyDisplay.lastMoney = resources.money.count;
  const prevMoney = updateMoneyDisplay.lastMoney;
  const newMoney = resources.money.count;

  moneyCountEl.textContent = `$${fmt(newMoney)}`;

  // Only animate if money increased significantly (avoid micro-animations)
  if (newMoney > prevMoney + 1) {
    const moneyBox = getCachedElement("money-display");
    if (moneyBox) {
      moneyBox.classList.remove("money-bounce");
      // Use RAF instead of forcing reflow
      requestAnimationFrame(() => {
        moneyBox.classList.add("money-bounce");
      });
    }
  }
  updateMoneyDisplay.lastMoney = newMoney;
}

/* ────────────────────────────────────────────────────────────────────────────
   EFFECTS
──────────────────────────────────────────────────────────────────────────── */
function createSellPop(resourceId) {
  const btn = document.getElementById(`sell-${resourceId}-btn`);
  if (!btn) return;
  const pop = document.createElement("span");
  pop.className = "sell-pop";
  pop.textContent = "$";
  btn.appendChild(pop);
  pop.addEventListener("animationend", () => pop.remove());
}

/* ────────────────────────────────────────────────────────────────────────────
   AUTO-SELL
──────────────────────────────────────────────────────────────────────────── */

// Calculate current autosell interval based on speed upgrades
function calculateAutoSellInterval(resId) {
  const baseInterval = 15000; // 15 seconds base
  const minInterval = 3000; // 3 seconds minimum

  // Ensure shop items are initialized
  const items = ensureShopItemsInitialized();

  // Find autosell speed upgrades for this resource
  const speedUpgrades = items.filter(
    (item) => item.category === resId && item.id.endsWith("-autosell-speed")
  );

  let totalSpeedBonus = 0;
  speedUpgrades.forEach((upgrade) => {
    totalSpeedBonus += upgrade.count * upgrade.speedReduction;
  });

  // Calculate final interval (can't go below minimum)
  const finalInterval = Math.max(minInterval, baseInterval - totalSpeedBonus);
  return finalInterval;
}

function startAutoSell(resId) {
  stopAutoSell(resId);

  // Ensure shop items are initialized
  const items = ensureShopItemsInitialized();

  const seller = items.find(
    (i) => i.category === resId && i.id.endsWith("-autoseller")
  );
  if (!seller || seller.count === 0) return;

  // Calculate current autosell interval based on upgrades (15s base, down to 3s with upgrades)
  autoSellIntervals[resId] = calculateAutoSellInterval(resId);
  nextSellTimes[resId] = Date.now() + autoSellIntervals[resId];

  document.getElementById(`sell-timer-${resId}`)?.classList.remove("hidden");

  countdownTimers[resId] = setInterval(() => updateSellCountdown(resId), 50); // 20fps for smooth animation
  autoSellTimers[resId] = setInterval(() => {
    // First, update the next sell time for the new cycle
    nextSellTimes[resId] = Date.now() + autoSellIntervals[resId];

    // Then execute the sale
    sellAll(resId, true); // Pass true to indicate this is an autosell
  }, autoSellIntervals[resId]);
}

function stopAutoSell(resId) {
  clearInterval(autoSellTimers[resId]);
  clearInterval(countdownTimers[resId]);

  // Clean up progress bar
  const progressBar = document.getElementById(`autosell-progress-${resId}`);
  if (progressBar) {
    progressBar.remove();
  }

  // Remove visual states
  const timerEl = document.getElementById(`sell-timer-${resId}`);
  if (timerEl) {
    timerEl.classList.remove(
      "autosell-urgent",
      "autosell-ready",
      "autosell-success"
    );
  }
}

function updateSellCountdown(resId) {
  const totalInterval =
    autoSellIntervals[resId] || calculateAutoSellInterval(resId);
  const remaining = nextSellTimes[resId] - Date.now();
  const sec = Math.ceil(remaining / 1000);

  // More precise progress calculation for smoother animation
  // Ensure progress is properly bounded and handles timing edge cases
  let progress = (totalInterval - remaining) / totalInterval;
  progress = Math.max(0, Math.min(1, progress));

  // If remaining time is negative (timer has passed), reset to start of next cycle
  if (remaining <= 0) {
    progress = 0;
  }

  const countdownEl = document.getElementById(`sell-countdown-${resId}`);
  if (countdownEl) {
    const timeLeft = Math.max(sec, 0);
    countdownEl.textContent = timeLeft;

    // Update progress bar if it exists, or create it
    let progressBar = document.getElementById(`autosell-progress-${resId}`);
    if (!progressBar) {
      progressBar = document.createElement("div");
      progressBar.id = `autosell-progress-${resId}`;
      progressBar.className = "autosell-progress-bar";
      progressBar.innerHTML = '<div class="autosell-progress-fill"></div>';

      // Check if panel is collapsed to determine where to append the progress bar
      const panel = document.getElementById(`${resId}-box`);
      if (panel && panel.classList.contains("collapsed")) {
        // For collapsed panels, append to the panel itself
        panel.appendChild(progressBar);
      } else {
        // For expanded panels, append to the countdown timer's parent (normal location)
        countdownEl.parentNode.appendChild(progressBar);
      }
    } else {
      // If progress bar exists, check if we need to move it based on collapse state
      const panel = document.getElementById(`${resId}-box`);
      if (panel && panel.classList.contains("collapsed")) {
        // Move to panel if collapsed
        if (progressBar.parentNode !== panel) {
          panel.appendChild(progressBar);
        }
      } else {
        // Move to normal location if expanded
        if (progressBar.parentNode !== countdownEl.parentNode) {
          countdownEl.parentNode.appendChild(progressBar);
        }
      }
    }

    const fillEl = progressBar.querySelector(".autosell-progress-fill");
    if (fillEl) {
      // Use a more precise percentage with decimals for smoother animation
      const percentage = Math.round(progress * 10000) / 100; // Two decimal places
      fillEl.style.width = percentage + "%";
    }

    // Add visual urgency as countdown gets closer to 0
    const timerEl = document.getElementById(`sell-timer-${resId}`);
    if (timerEl) {
      timerEl.classList.remove("autosell-urgent", "autosell-ready");
      if (timeLeft <= 1) {
        timerEl.classList.add("autosell-ready");
      } else if (timeLeft <= 2) {
        timerEl.classList.add("autosell-urgent");
      }
    }
  }
}

// Enhanced autosell visual effects
function createAutoSellEffects(resId, cashEarned, quantitySold) {
  // Check if the resource panel is collapsed
  const panel = document.getElementById(`${resId}-box`);
  if (panel && panel.classList.contains("collapsed")) {
    // Special effect for collapsed panels
    createCollapsedAutoSellEffect(panel, cashEarned, quantitySold, resId);
    return;
  }

  const sellButton = document.getElementById(`sell-${resId}-btn`);
  const timerEl = document.getElementById(`sell-timer-${resId}`);

  // Subtle haptic feedback for mobile devices
  if ("vibrate" in navigator) {
    navigator.vibrate([30, 10, 30]); // Double pulse for autosell
  }

  if (sellButton) {
    // Auto-sell button flash effect
    sellButton.classList.add("autosell-flash");
    setTimeout(() => {
      sellButton.classList.remove("autosell-flash");
    }, 600);

    // Create floating money indicator from sell button
    createAutoSellFeedback(sellButton, cashEarned, quantitySold, resId);
  }

  if (timerEl) {
    // Timer success pulse
    timerEl.classList.add("autosell-success");
    setTimeout(() => {
      timerEl.classList.remove("autosell-success");
    }, 400);
  }

  // Screen pulse effect for autosell
  createAutoSellPulse(resId);
}

// Floating feedback for autosell
function createAutoSellFeedback(button, cash, quantity, resId) {
  if (!button) return;

  // Double-check if the resource panel is collapsed
  const panel = document.getElementById(`${resId}-panel`);
  if (panel && panel.classList.contains("collapsed")) {
    return; // Don't show feedback for collapsed panels
  }

  // Check if button is actually visible and positioned correctly
  const rect = button.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0 || rect.top === 0) {
    return; // Button is not properly positioned, likely hidden
  }

  // Performance: Use object pool for feedback elements
  const feedback = effectPool.getFeedback();
  feedback.className = "autosell-feedback";
  feedback.innerHTML = `
    <div class="autosell-feedback-main">+$${fmt(cash)}</div>
  `;

  // Position relative to button
  feedback.style.position = "fixed";
  feedback.style.left = rect.left + rect.width / 2 + "px";
  feedback.style.top = rect.top + "px";
  feedback.style.transform = "translateX(-50%)";
  feedback.style.pointerEvents = "none";
  feedback.style.zIndex = "9999";

  document.body.appendChild(feedback);

  // Animate upward and fade out
  setTimeout(() => {
    feedback.style.transform = "translateX(-50%) translateY(-50px) scale(1.1)";
    feedback.style.opacity = "0";
  }, 10);

  // Remove element after animation and return to pool
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.parentNode.removeChild(feedback);
      effectPool.returnFeedback(feedback);
    }
  }, 1000);
}

// Subtle screen pulse for autosell
function createAutoSellPulse(resId) {
  const pulse = document.createElement("div");
  pulse.className = "autosell-screen-pulse";
  pulse.style.position = "fixed";
  pulse.style.top = "0";
  pulse.style.left = "0";
  pulse.style.width = "100vw";
  pulse.style.height = "100vh";
  pulse.style.pointerEvents = "none";
  pulse.style.zIndex = "9997";
  pulse.style.opacity = "0";

  // Resource-specific subtle colors
  const colors = {
    iron: "rgba(176, 176, 176, 0.03)",
    copper: "rgba(230, 168, 108, 0.03)",
    nickel: "rgba(160, 160, 160, 0.03)",
    bronze: "rgba(232, 176, 106, 0.03)",
    silver: "rgba(245, 245, 245, 0.03)",
    cobalt: "rgba(65, 105, 225, 0.03)",
    gold: "rgba(255, 236, 139, 0.04)",
    palladium: "rgba(232, 234, 240, 0.03)",
    platinum: "rgba(178, 178, 178, 0.03)",
    titanium: "rgba(163, 163, 163, 0.03)",
    adamantium: "rgba(106, 106, 106, 0.05)",
  };

  pulse.style.background = `radial-gradient(circle, ${
    colors[resId] || "rgba(255, 255, 255, 0.02)"
  } 0%, transparent 70%)`;

  document.body.appendChild(pulse);

  // Gentle pulse animation
  setTimeout(() => {
    pulse.style.opacity = "1";
    pulse.style.transition = "opacity 0.2s ease-out";
  }, 10);

  setTimeout(() => {
    pulse.style.opacity = "0";
    pulse.style.transition = "opacity 0.4s ease-out";
  }, 200);

  // Remove after animation
  setTimeout(() => {
    if (pulse.parentNode) {
      pulse.parentNode.removeChild(pulse);
    }
  }, 600);
}

// Audio cue simulation through visual feedback
function createAutoSellAudioCue(resId) {
  // Create a subtle visual "ding" effect at the top of the screen
  const ding = document.createElement("div");
  ding.className = "autosell-audio-cue";
  ding.innerHTML = "♪";
  ding.style.position = "fixed";
  ding.style.top = "20px";
  ding.style.right = "20px";
  ding.style.fontSize = "1.5em";
  ding.style.color = "#28a745";
  ding.style.fontWeight = "700";
  ding.style.textShadow = "0 0 10px #28a745";
  ding.style.pointerEvents = "none";
  ding.style.zIndex = "9999";
  ding.style.opacity = "0";
  ding.style.transform = "scale(0.5)";
  ding.style.transition = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

  document.body.appendChild(ding);

  // Animate in
  setTimeout(() => {
    ding.style.opacity = "1";
    ding.style.transform = "scale(1)";
  }, 10);

  // Animate out
  setTimeout(() => {
    ding.style.opacity = "0";
    ding.style.transform = "scale(0.8) translateY(-20px)";
  }, 300);

  // Remove
  setTimeout(() => {
    if (ding.parentNode) {
      ding.parentNode.removeChild(ding);
    }
  }, 600);
}

// Special visual effect for collapsed panels when autosell triggers
function createCollapsedAutoSellEffect(panel, cashEarned, quantitySold, resId) {
  if (!panel) return;

  // Subtle panel flash
  panel.style.boxShadow = "0 0 20px rgba(45, 212, 191, 0.4)";
  panel.style.borderColor = "rgba(45, 212, 191, 0.6)";
  panel.style.transition = "all 0.3s ease-out";

  // Create floating money indicator
  const moneyFloat = document.createElement("div");
  moneyFloat.textContent = `+$${formatNumber(cashEarned)}`;
  moneyFloat.style.position = "absolute";
  moneyFloat.style.top = "50%";
  moneyFloat.style.right = "10px";
  moneyFloat.style.transform = "translateY(-50%)";
  moneyFloat.style.color = "#22c55e";
  moneyFloat.style.fontWeight = "bold";
  moneyFloat.style.fontSize = "0.9em";
  moneyFloat.style.textShadow = "0 0 8px rgba(34, 197, 94, 0.5)";
  moneyFloat.style.pointerEvents = "none";
  moneyFloat.style.zIndex = "10";
  moneyFloat.style.opacity = "0";
  moneyFloat.style.transition = "all 0.5s ease-out";

  panel.style.position = "relative";
  panel.appendChild(moneyFloat);

  // Animate the money indicator
  setTimeout(() => {
    moneyFloat.style.opacity = "1";
    moneyFloat.style.transform = "translateY(-70%)";
  }, 50);

  setTimeout(() => {
    moneyFloat.style.opacity = "0";
    moneyFloat.style.transform = "translateY(-90%)";
  }, 800);

  // Reset panel styling
  setTimeout(() => {
    panel.style.boxShadow = "";
    panel.style.borderColor = "";
    panel.style.transition = "";
  }, 500);

  // Remove money indicator
  setTimeout(() => {
    if (moneyFloat.parentNode) {
      moneyFloat.parentNode.removeChild(moneyFloat);
    }
  }, 1300);

  // Subtle haptic feedback for mobile
  if ("vibrate" in navigator) {
    navigator.vibrate([20, 10, 20]); // Gentle pulse for collapsed
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   VERSION LOAD & UPDATE SYSTEM
──────────────────────────────────────────────────────────────────────────── */
let currentVersion = null;

fetch("version.txt")
  .then((r) => r.text())
  .then((txt) => {
    currentVersion = txt.trim();
    const versionEl = document.getElementById("version");
    if (versionEl) versionEl.textContent = currentVersion;

    // Send version to service worker if available
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SET_VERSION",
        version: currentVersion,
      });
    }
  })
  .catch(() => {});

// Service Worker Update Management
if ("serviceWorker" in navigator) {
  let updateAvailable = false;
  let registration = null;

  // Register service worker
  navigator.serviceWorker
    .register("./sw.js")
    .then((reg) => {
      registration = reg;
      console.log("SW: Registered successfully");

      // Send version to service worker immediately after registration
      if (currentVersion && reg.active) {
        reg.active.postMessage({
          type: "SET_VERSION",
          version: currentVersion,
        });
      }

      // Check for updates periodically
      setInterval(() => {
        reg.update();
      }, 60000); // Check every minute

      // Listen for service worker updates
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;

        if (newWorker) {
          console.log("SW: Update found, downloading...");
          showUpdateNotification("downloading");

          // Send version to new service worker
          if (currentVersion) {
            newWorker.postMessage({
              type: "SET_VERSION",
              version: currentVersion,
            });
          }

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("SW: Update ready");
              updateAvailable = true;
              showUpdateNotification("ready");
            }
          });
        }
      });
    })
    .catch((err) => {
      console.log("SW: Registration failed", err);
    });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "UPDATE_APPLIED") {
      console.log("SW: Update applied, reloading...");
      showUpdateNotification("applied");
      // Small delay to show the message, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });

  // Function to apply update
  function applyUpdate() {
    if (updateAvailable && registration && registration.waiting) {
      console.log("SW: Applying update...");
      showUpdateNotification("applying");
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }

  // Auto-apply update after a short delay
  function autoApplyUpdate() {
    setTimeout(() => {
      if (updateAvailable) {
        applyUpdate();
      }
    }, 3000); // 3 second delay to show the notification
  }

  // Update notification system
  function showUpdateNotification(stage) {
    // Remove existing notification
    const existingNotification = document.getElementById("update-notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    let message = "";
    let buttonText = "";
    let showButton = false;
    let autoClose = false;

    switch (stage) {
      case "downloading":
        message = "📥 Downloading update...";
        autoClose = false;
        break;
      case "ready":
        message = "✨ Update ready! Applying automatically...";
        autoClose = true;
        autoApplyUpdate(); // Auto-apply after showing message
        break;
      case "applying":
        message = "⚡ Applying update...";
        autoClose = false;
        break;
      case "applied":
        message = "🎉 Update applied! Reloading...";
        autoClose = false;
        break;
    }

    if (message) {
      const notification = document.createElement("div");
      notification.id = "update-notification";
      notification.className = "update-notification";
      notification.innerHTML = `
        <div class="update-message">
          <span class="update-icon">${message.split(" ")[0]}</span>
          <span class="update-text">${message.substring(2)}</span>
        </div>
        ${
          showButton
            ? `<button class="update-button" onclick="applyUpdate()">${buttonText}</button>`
            : ""
        }
      `;

      document.body.appendChild(notification);

      // Auto-close for some stages
      if (autoClose) {
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 8000); // Increased from 5000ms to 8000ms (8 seconds)
      }
    }
  }

  // Make applyUpdate globally available
  window.applyUpdate = applyUpdate;
}

function changelogToHTML(txt) {
  const lines = txt.split(/\r?\n/);
  let html = "";
  let openUl = false;
  lines.forEach((l) => {
    if (/^\s*-\s+/.test(l)) {
      if (!openUl) {
        html += "<ul>";
        openUl = true;
      }
      html += "<li>" + l.replace(/^\s*-\s+/, "") + "</li>";
    } else if (/^\s*\*\*(.+?)\*\*\s*$/.test(l)) {
      if (openUl) {
        html += "</ul>";
        openUl = false;
      }
      html += "<h4>" + l.replace(/^\s*\*\*(.+?)\*\*\s*$/, "$1") + "</h4>";
    } else if (l.trim() === "") {
      if (openUl) {
        html += "</ul>";
        openUl = false;
      }
      html += "<br/>";
    } else {
      if (openUl) {
        html += "</ul>";
        openUl = false;
      }
      html += "<p>" + l + "</p>";
    }
  });
  if (openUl) html += "</ul>";
  return html;
}

fetch("changelog.txt")
  .then((r) => r.text())
  .then((txt) => {
    const box = document.getElementById("changelog");
    if (box) box.innerHTML = changelogToHTML(txt);
  })
  .catch(() => {
    const box = document.getElementById("changelog");
    if (box) box.textContent = "Could not load changelog.";
  });

/* ────────────────────────────────────────────────────────────────────────────
   SAVE / LOAD
──────────────────────────────────────────────────────────────────────────── */
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

function getSaveData() {
  // Collect collapse states
  const collapseStates = {};
  RES_IDS.forEach((res) => {
    try {
      collapseStates[res] =
        localStorage.getItem(`panel-collapsed-${res}`) === "1";
    } catch {
      collapseStates[res] = false;
    }
  });

  return {
    iron: resources.iron.count,
    copper: resources.copper.count,
    nickel: resources.nickel.count,
    bronze: resources.bronze.count,
    silver: resources.silver.count,
    cobalt: resources.cobalt.count,
    gold: resources.gold.count,
    palladium: resources.palladium.count,
    platinum: resources.platinum.count, // New resource
    titanium: resources.titanium.count,
    adamantium: resources.adamantium.count,
    money: resources.money.count,
    coreShards: resources.coreShards.count,

    copperUnlocked,
    nickelUnlocked,
    bronzeUnlocked,
    silverUnlocked,
    cobaltUnlocked,
    goldUnlocked,
    palladiumUnlocked,
    platinumUnlocked, // New resource
    titaniumUnlocked,
    adamantiumUnlocked,

    ironPerSecond: resources.iron.perSecond,
    copperPerSecond: resources.copper.perSecond,
    nickelPerSecond: resources.nickel.perSecond,
    bronzePerSecond: resources.bronze.perSecond,
    silverPerSecond: resources.silver.perSecond,
    cobaltPerSecond: resources.cobalt.perSecond,
    goldPerSecond: resources.gold.perSecond,
    palladiumPerSecond: resources.palladium.perSecond,
    platinumPerSecond: resources.platinum.perSecond, // New resource
    titaniumPerSecond: resources.titanium.perSecond,
    adamantiumPerSecond: resources.adamantium.perSecond,

    upgrades: ensureShopItemsInitialized().map((i) => ({
      id: i.id,
      count: i.count,
      price: i.price,
    })),

    stats,

    collapseStates,

    // Prestige data
    totalPrestiges,
    prestigeUnlocked,
    coreUpgrades: Object.fromEntries(
      Object.entries(coreUpgrades).map(([key, upgrade]) => [
        key,
        { level: upgrade.level },
      ])
    ),

    lastSave: Date.now(),
    lastActive: Date.now(), // Track when player was last active
  };
}

// Offline rewards system - gives 10% of online mining rate
function calculateOfflineRewards(saveData) {
  const now = Date.now();
  const lastActive = saveData.lastActive || saveData.lastSave || now;
  const offlineTime = (now - lastActive) / 1000; // Convert to seconds

  // Only give offline rewards if player was offline for at least 1 minute
  // and maximum 3 hours of offline rewards
  const minOfflineTime = 60; // 1 minute
  const maxOfflineTime = 3 * 60 * 60; // 3 hours

  if (offlineTime < minOfflineTime) return;

  const rewardTime = Math.min(offlineTime, maxOfflineTime);
  const offlineMultiplier = 0.1; // 10% of online rate

  const offlineRewards = {};
  let totalMoneyEarned = 0;
  let hasRewards = false;

  // Calculate offline mining for each unlocked resource
  RES_IDS.forEach((resId) => {
    const wasUnlocked = saveData[`${resId}Unlocked`];
    if (resId === "iron" || wasUnlocked) {
      const perSecond = saveData[`${resId}PerSecond`] || 0;
      const milestoneMultiplier = milestoneMultipliers[resId] || 1;
      const totalRate = perSecond * milestoneMultiplier * offlineMultiplier;

      if (totalRate > 0) {
        const mined = totalRate * rewardTime;
        const basePrice = getResourceSellPrice(resId);
        const globalSellBonus = 1 + getForgeCoreBonusValue("globalSellValue");
        const finalPrice = Math.floor(basePrice * globalSellBonus);
        const moneyFromResource = mined * finalPrice;

        offlineRewards[resId] = {
          mined: mined,
          money: moneyFromResource,
        };

        totalMoneyEarned += moneyFromResource;
        hasRewards = true;

        // Add the mined resources to player's inventory
        addOre(resId, mined);
      }
    }
  });

  if (hasRewards) {
    // Add the money earned
    addMoney(totalMoneyEarned);

    // Show offline rewards modal
    showOfflineRewardsModal(rewardTime, offlineRewards, totalMoneyEarned);
  }
}

// Get resource sell price (imported from resource files)
function getResourceSellPrice(resId) {
  switch (resId) {
    case "iron":
      return iron.sellPrice;
    case "copper":
      return copper.sellPrice;
    case "nickel":
      return nickel.sellPrice;
    case "bronze":
      return bronze.sellPrice;
    case "silver":
      return silver.sellPrice;
    case "cobalt":
      return cobalt.sellPrice;
    case "gold":
      return gold.sellPrice;
    case "palladium":
      return palladium.sellPrice;
    case "platinum":
      return platinum.sellPrice;
    case "titanium":
      return titanium.sellPrice;
    case "adamantium":
      return adamantium.sellPrice;
    default:
      return 1;
  }
}

// Show offline rewards modal
function showOfflineRewardsModal(timeAway, rewards, totalMoney) {
  const modal = document.createElement("div");
  modal.className = "offline-rewards-modal overlay";
  modal.style.display = "flex";

  const hours = Math.floor(timeAway / 3600);
  const minutes = Math.floor((timeAway % 3600) / 60);
  const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  let rewardsList = "";
  Object.entries(rewards).forEach(([resId, data]) => {
    if (data.mined > 0) {
      const resName = resId.charAt(0).toUpperCase() + resId.slice(1);
      rewardsList += `<li>${resName}: ${fmt(data.mined)} (+$${fmt(
        data.money
      )})</li>`;
    }
  });

  modal.innerHTML = `
    <div class="offline-rewards-content">
      <h2>🎁 Welcome Back!</h2>
      <p>You were away for <strong>${timeText}</strong></p>
      <p>Your mines kept working at 10% efficiency:</p>
      <ul class="offline-rewards-list">
        ${rewardsList}
      </ul>
      <div class="offline-rewards-total">
        <strong>Total Money Earned: $${fmt(totalMoney)}</strong>
      </div>
      <button class="offline-rewards-btn" onclick="closeOfflineRewardsModal()">
        Collect Rewards
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

// Close offline rewards modal
function closeOfflineRewardsModal() {
  const modal = document.querySelector(".offline-rewards-modal");
  if (modal) {
    modal.remove();
  }
}

// Make closeOfflineRewardsModal globally accessible
window.closeOfflineRewardsModal = closeOfflineRewardsModal;

function saveGame() {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.setItem("idleMinerSave", JSON.stringify(getSaveData()));
    console.log("Game saved at", new Date().toLocaleTimeString());
    if (gameStarted && toggleAutoSave?.checked) {
      showAutoSaveIndicator();
      setTimeout(hideAutoSaveIndicator, 1000);
    }
    return true;
  } catch (e) {
    console.error("Failed to save game:", e);
    return false;
  }
}

function loadGame() {
  if (!isLocalStorageAvailable()) return false;
  try {
    const raw = localStorage.getItem("idleMinerSave");
    if (!raw) return false;
    const data = JSON.parse(raw);

    resources.iron.count = data.iron || 0;
    resources.copper.count = data.copper || 0;
    resources.nickel.count = data.nickel || 0;
    resources.bronze.count = data.bronze || 0;
    resources.silver.count = data.silver || 0;
    resources.cobalt.count = data.cobalt || 0;
    resources.gold.count = data.gold || 0;
    resources.palladium.count = data.palladium || 0;
    resources.platinum.count = data.platinum || 0; // New resource
    resources.titanium.count = data.titanium || 0;
    resources.adamantium.count = data.adamantium || 0;
    resources.money.count = data.money || 0;
    resources.coreShards.count = data.coreShards || 0;

    copperUnlocked = !!data.copperUnlocked;
    nickelUnlocked = !!data.nickelUnlocked;
    bronzeUnlocked = !!data.bronzeUnlocked;
    silverUnlocked = !!data.silverUnlocked;
    cobaltUnlocked = !!data.cobaltUnlocked;
    goldUnlocked = !!data.goldUnlocked;
    palladiumUnlocked = !!data.palladiumUnlocked;
    platinumUnlocked = !!data.platinumUnlocked; // New resource
    titaniumUnlocked = !!data.titaniumUnlocked;
    adamantiumUnlocked = !!data.adamantiumUnlocked;

    // Restore collapse states BEFORE unlocking resources
    if (data.collapseStates) {
      RES_IDS.forEach((res) => {
        try {
          const collapsed = data.collapseStates[res];
          localStorage.setItem(`panel-collapsed-${res}`, collapsed ? "1" : "0");
        } catch {}
      });
    }

    if (copperUnlocked) unlockCopperUI(false);
    else relockResource("copper");
    if (nickelUnlocked) unlockNickelUI(false);
    else relockResource("nickel");
    if (bronzeUnlocked) unlockBronzeUI(false);
    else relockResource("bronze");
    if (silverUnlocked) unlockSilverUI(false);
    else relockResource("silver");
    if (cobaltUnlocked) unlockCobaltUI(false);
    else relockResource("cobalt");
    if (goldUnlocked) unlockGoldUI(false);
    else relockResource("gold");
    if (palladiumUnlocked) unlockPalladiumUI(false);
    else relockResource("palladium");
    if (platinumUnlocked) unlockPlatinumUI(false); // New resource
    else relockResource("platinum"); // New resource
    if (titaniumUnlocked) unlockTitaniumUI(false);
    else relockResource("titanium");
    if (adamantiumUnlocked) unlockAdamantiumUI(false);
    else relockResource("adamantium");

    if (data.ironPerSecond !== undefined)
      resources.iron.perSecond = data.ironPerSecond;
    if (data.copperPerSecond !== undefined)
      resources.copper.perSecond = data.copperPerSecond;
    if (data.nickelPerSecond !== undefined)
      resources.nickel.perSecond = data.nickelPerSecond;
    if (data.bronzePerSecond !== undefined)
      resources.bronze.perSecond = data.bronzePerSecond;
    if (data.silverPerSecond !== undefined)
      resources.silver.perSecond = data.silverPerSecond;
    if (data.cobaltPerSecond !== undefined)
      resources.cobalt.perSecond = data.cobaltPerSecond;
    if (data.goldPerSecond !== undefined)
      resources.gold.perSecond = data.goldPerSecond;
    if (data.palladiumPerSecond !== undefined)
      resources.palladium.perSecond = data.palladiumPerSecond;
    if (data.platinumPerSecond !== undefined)
      resources.platinum.perSecond = data.platinumPerSecond; // New resource
    if (data.titaniumPerSecond !== undefined)
      resources.titanium.perSecond = data.titaniumPerSecond;
    if (data.adamantiumPerSecond !== undefined)
      resources.adamantium.perSecond = data.adamantiumPerSecond;

    // Calculate and apply offline rewards AFTER perSecond values are loaded
    calculateOfflineRewards(data);

    if (Array.isArray(data.upgrades)) {
      data.upgrades.forEach((u) => {
        const item = shopItems.find((i) => i.id === u.id);
        if (item && u.count >= 0) {
          item.count = u.count;
          item.price =
            u.price ??
            Math.floor(item.basePrice * Math.pow(item.scale, item.count));
        }
      });
    }

    if (data.stats) {
      stats.earnedMoney = data.stats.earnedMoney ?? stats.earnedMoney;
      stats.spentMoney = data.stats.spentMoney ?? stats.spentMoney;
      Object.assign(stats.mined, data.stats.mined || {});
      Object.assign(stats.sold, data.stats.sold || {});
      Object.assign(stats.clicks, data.stats.clicks || {});
    }

    // Load prestige data
    if (data.totalPrestiges !== undefined) {
      totalPrestiges = data.totalPrestiges;
    }
    if (data.prestigeUnlocked !== undefined) {
      prestigeUnlocked = data.prestigeUnlocked;
    }
    if (data.coreUpgrades || data.forgeCoreUpgrades) {
      // Support both old and new format for backward compatibility
      const upgradeData = data.coreUpgrades || data.forgeCoreUpgrades;
      Object.entries(upgradeData).forEach(([key, saveData]) => {
        if (coreUpgrades[key] && saveData.level !== undefined) {
          coreUpgrades[key].level = saveData.level;
        }
      });
    }

    // re-init autosellers with random timing variation to prevent synchronization
    shopItems
      .filter((i) => i.id.endsWith("-autoseller") && i.count > 0)
      .forEach((item, index) => {
        const resId = item.category;
        document
          .getElementById(`sell-timer-${resId}`)
          ?.classList.remove("hidden");
        const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
        if (toggle) toggle.checked = true;

        // Add random delay to desynchronize autosell timers (0-4 seconds)
        const randomDelay = Math.random() * 4000;
        setTimeout(() => {
          startAutoSell(resId);
        }, randomDelay);
      });

    console.log("Game loaded successfully");
    updateStatsUI();
    checkPrestigeUnlock(); // Check prestige unlock status after loading
    updatePrestigeUI();
    updateCoreUI();
    return true;
  } catch (e) {
    console.error("Failed to load game:", e);
    return false;
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   UNLOCK UI HELPERS
──────────────────────────────────────────────────────────────────────────── */
function unlockCopperUI(expandPanel = true) {
  copperUnlocked = true;
  unlockResourceUI("copper", expandPanel);
}

function unlockNickelUI(expandPanel = true) {
  nickelUnlocked = true;
  unlockResourceUI("nickel", expandPanel);

  // Check if prestige should be unlocked
  checkPrestigeUnlock();
}
function unlockBronzeUI(expandPanel = true) {
  bronzeUnlocked = true;
  unlockResourceUI("bronze", expandPanel);
}
function unlockSilverUI(expandPanel = true) {
  silverUnlocked = true;
  unlockResourceUI("silver", expandPanel);
}

function unlockCobaltUI(expandPanel = true) {
  cobaltUnlocked = true;
  unlockResourceUI("cobalt", expandPanel);
}
function unlockGoldUI(expandPanel = true) {
  goldUnlocked = true;
  unlockResourceUI("gold", expandPanel);
}

function unlockPalladiumUI(expandPanel = true) {
  palladiumUnlocked = true;
  unlockResourceUI("palladium", expandPanel);
}
function unlockPlatinumUI(expandPanel = true) {
  platinumUnlocked = true;
  unlockResourceUI("platinum", expandPanel);
}
function unlockTitaniumUI(expandPanel = true) {
  titaniumUnlocked = true;
  unlockResourceUI("titanium", expandPanel);
}
function unlockAdamantiumUI(expandPanel = true) {
  adamantiumUnlocked = true;
  unlockResourceUI("adamantium", expandPanel);
}

/* ────────────────────────────────────────────────────────────────────────────
   NEW GAME
──────────────────────────────────────────────────────────────────────────── */
function startNewGame() {
  // Stop and clear all auto-sell and countdown timers
  RES_IDS.forEach((resId) => {
    stopAutoSell(resId);
    clearInterval(autoSellTimers[resId]);
    clearInterval(countdownTimers[resId]);
    autoSellTimers[resId] = null;
    countdownTimers[resId] = null;
    nextSellTimes[resId] = null;
    document.getElementById(`sell-timer-${resId}`)?.classList.add("hidden");
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) toggle.checked = false;
    // Reset countdown display
    const countdownEl = document.getElementById(`sell-countdown-${resId}`);
    if (countdownEl) countdownEl.textContent = "";
  });

  // Reset all resource values and manual mining perClick
  RES_IDS.forEach((r) => {
    resources[r].count = 0;
    resources[r].perSecond = 0;
    if (typeof resources[r].perClick !== "undefined") resources[r].perClick = 1;
  });
  resources.money.count = 0;

  // Reset unlocks
  copperUnlocked = false;
  nickelUnlocked = false;
  bronzeUnlocked = false;
  silverUnlocked = false;
  cobaltUnlocked = false;
  goldUnlocked = false;
  palladiumUnlocked = false;
  platinumUnlocked = false; // New resource
  titaniumUnlocked = false;
  adamantiumUnlocked = false;

  // Reset shop items
  ensureShopItemsInitialized().forEach((item) => {
    item.count = 0;
    item.price = item.basePrice;
  });

  // Reset stats
  Object.keys(stats.mined).forEach((k) => (stats.mined[k] = 0));
  Object.keys(stats.sold).forEach((k) => (stats.sold[k] = 0));
  stats.earnedMoney = 0;
  stats.spentMoney = 0;
  stats.clicks = { mine: 0, sell: 0, shopBuy: 0, unlock: 0 };

  // Reset prestige system for true new game
  prestigeUnlocked = false;
  totalPrestiges = 0;
  resources.coreShards.count = 0;

  // Reset Core upgrades
  Object.keys(coreUpgrades).forEach((upgradeId) => {
    coreUpgrades[upgradeId].level = 0;
  });

  // Reset milestone multipliers
  RES_IDS.forEach((res) => {
    milestoneMultipliers[res] = 1;
  });

  // Remove save and highscore
  if (isLocalStorageAvailable()) {
    localStorage.removeItem("idleMinerSave");
    localStorage.removeItem("idleMinerHighscore");
  }

  // Reset UI buttons using dynamic resourceButtons object
  Object.keys(resourceButtons).forEach((resourceId) => {
    if (resourceId !== "iron") {
      // Iron starts unlocked
      const buttons = resourceButtons[resourceId];
      if (buttons?.mine) buttons.mine.disabled = true;
      if (buttons?.sell) buttons.sell.disabled = true;
    }
  });

  // Reset current resource and tabs
  currentResource = "iron";
  resourceTabs.forEach((tab) =>
    tab.classList.toggle("active", tab.dataset.resource === "iron")
  );

  // Relock all resources above iron
  relockResource("copper");
  relockResource("nickel");
  relockResource("bronze");
  relockResource("silver");
  relockResource("cobalt");
  relockResource("gold");
  relockResource("palladium");
  relockResource("platinum"); // New resource
  relockResource("titanium");
  relockResource("adamantium");
  document.getElementById("tab-resource-copper")?.classList.add("locked");
  document.getElementById("tab-resource-nickel")?.classList.add("locked");
  document.getElementById("tab-resource-bronze")?.classList.add("locked");
  document.getElementById("tab-resource-silver")?.classList.add("locked");
  document.getElementById("tab-resource-cobalt")?.classList.add("locked");
  document.getElementById("tab-resource-gold")?.classList.add("locked");
  document.getElementById("tab-resource-palladium")?.classList.add("locked");
  document.getElementById("tab-resource-platinum")?.classList.add("locked");
  document.getElementById("tab-resource-titanium")?.classList.add("locked");
  document.getElementById("tab-resource-adamantium")?.classList.add("locked");

  // Hide overlays, modals, and popups
  if (overlay) overlay.classList.add("hidden");
  if (typeof confirmModal !== "undefined" && confirmModal)
    confirmModal.classList.add("hidden");
  // Remove all sell-pop elements
  document.querySelectorAll(".sell-pop").forEach((el) => el.remove());
  // Hide autosave indicator
  hideAutoSaveIndicator();

  // Reset scroll positions
  mineScrollY = 0;
  shopScrollY = 0;
  window.scrollTo(0, 0);

  // Reset UI screens
  if (screenShop) screenShop.classList.add("hidden");
  if (screenStats) screenStats.classList.add("hidden");
  if (screenCore) screenCore.classList.add("hidden");
  if (screenMine) screenMine.classList.remove("hidden");
  tabMine.classList.add("active");
  tabShop.classList.remove("active");
  tabStats.classList.remove("active");
  if (tabCore) tabCore.classList.remove("active");

  // Stop autosave
  stopAutoSave();

  // Reset money animation state
  if (typeof updateUI.lastMoney !== "undefined") updateUI.lastMoney = 0;

  // Collapse all resource panels except Iron by default
  const resourcesToCollapse = [
    "copper",
    "bronze",
    "silver",
    "gold",
    "platinum",
    "titanium",
    "adamantium",
  ];
  resourcesToCollapse.forEach((resId) => {
    const panel = document.querySelector(
      `.resource-panel[data-resource='${resId}']`
    );
    if (panel) {
      panel.classList.add("collapsed");
      // Update localStorage to reflect the collapsed state
      try {
        localStorage.setItem(`panel-collapsed-${resId}`, "1");
      } catch {}
    }
  });

  // Ensure Iron panel is expanded
  const ironPanel = document.querySelector(
    `.resource-panel[data-resource='iron']`
  );
  if (ironPanel) {
    ironPanel.classList.remove("collapsed");
    try {
      localStorage.setItem(`panel-collapsed-iron`, "0");
    } catch {}
  }

  // Update all UI
  updateUI();
  renderShop();
  updateStatsUI();
  updatePrestigeUI(); // Ensure prestige elements are hidden for new game

  console.log("New game started - all data wiped");
}

/* ────────────────────────────────────────────────────────────────────────────
   START GAME
──────────────────────────────────────────────────────────────────────────── */
function startGame() {
  // Initialize shop items if not already done
  ensureShopItemsInitialized();

  mainMenu.style.display = "none";
  settingsMenu.style.display = "none";
  gameUI.style.display = "flex";
  gameStarted = true;

  const bgMusic = document.getElementById("bg-music");
  if (bgMusic) {
    bgMusic.volume = 0.5;
    bgMusic
      .play()
      .catch((err) => console.warn("Background music failed:", err));
  }

  updateUI();
  updateStatsUI();
  updatePrestigeUI(); // Ensure prestige elements are properly hidden on start
  switchResource(currentResource);

  // Ensure shop is rendered
  renderShop();

  showScreen("mine");

  // Start optimized game loop
  startGameLoop();

  if (toggleAutoSave?.checked) startAutoSave();
}

/* ────────────────────────────────────────────────────────────────────────────
   AUTOSAVE
──────────────────────────────────────────────────────────────────────────── */
function startAutoSave() {
  stopAutoSave();
  if (!isLocalStorageAvailable()) return;
  autoSaveInterval = setInterval(() => {
    if (gameStarted) saveGame();
  }, 60000);
  window.addEventListener("beforeunload", saveGame);
}
function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
  window.removeEventListener("beforeunload", saveGame);
}

/* ────────────────────────────────────────────────────────────────────────────
   MENU BUTTONS
──────────────────────────────────────────────────────────────────────────── */
btnContinue?.addEventListener("click", () => {
  if (loadGame()) startGame();
  else {
    alert("Failed to load save data. Starting new game.");
    startNewGame();
    startGame();
  }
});

// New Game confirmation modal logic
const confirmModal = document.getElementById("confirm-newgame-modal");
const btnNewGameModal = document.getElementById("btn-new");
const btnConfirmYes = document.getElementById("confirm-newgame-yes");
const btnConfirmNo = document.getElementById("confirm-newgame-no");

btnNewGameModal?.addEventListener("click", (e) => {
  if (confirmModal) {
    confirmModal.classList.remove("hidden");
  } else {
    // fallback: just start new game
    startNewGame();
    startGame();
  }
});

btnConfirmYes?.addEventListener("click", () => {
  if (confirmModal) confirmModal.classList.add("hidden");
  startNewGame();
  startGame();
});

btnConfirmNo?.addEventListener("click", () => {
  if (confirmModal) confirmModal.classList.add("hidden");
});

btnSettings?.addEventListener("click", () => {
  mainMenu.style.display = "none";
  settingsMenu.style.display = "flex";
});

btnBackToMenu?.addEventListener("click", () => {
  settingsMenu.style.display = "none";
  mainMenu.style.display = "flex";
});

toggleAutoSave?.addEventListener("change", (e) => {
  if (e.target.checked) {
    if (gameStarted) {
      startAutoSave();
      if (saveGame() && btnContinue) btnContinue.disabled = false;
    }
  } else {
    stopAutoSave();
  }
});

btnSaveMenu?.addEventListener("click", () => {
  if (saveGame()) {
    if (btnContinue) btnContinue.disabled = false;
  } else {
    alert("Failed to save game. Please check browser settings.");
  }
  if (gameUI) gameUI.style.display = "none";
  if (mainMenu) mainMenu.style.display = "flex";
  gameStarted = false;

  // Clean up to prevent memory leaks
  stopGameLoop();
  stopAutoSave();

  // Clear all caches and pools to free memory
  if (updateShopButtons.elementCache) {
    updateShopButtons.elementCache.clear();
  }
  if (renderShop.itemCache) {
    renderShop.itemCache.clear();
  }
  domCache.clear();

  // Reset effect pools
  effectPool.particles.length = 0;
  effectPool.feedbacks.length = 0;
  effectPool.pulses.length = 0;

  // Force garbage collection hint
  if (window.gc) {
    window.gc();
  }
});

/* ────────────────────────────────────────────────────────────────────────────
   SAVE INDICATORS
──────────────────────────────────────────────────────────────────────────── */

function showAutoSaveIndicator() {
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

function hideAutoSaveIndicator() {
  document.getElementById("autosave-cog")?.classList.remove("show");
}
