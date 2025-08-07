// ───────────────────────────────────────────────────────────────────────────
// MAIN INDEX - IDLEFORGE ES6 MODULES
// ───────────────────────────────────────────────────────────────────────────

// Import resource data
import iron from "../resources/iron.js";
import copper from "../resources/copper.js";
import nickel from "../resources/nickel.js";
import bronze from "../resources/bronze.js";
import silver from "../resources/silver.js";
import cobalt from "../resources/cobalt.js";
import gold from "../resources/gold.js";
import palladium from "../resources/palladium.js";
import platinum from "../resources/platinum.js";
import titanium from "../resources/titanium.js";
import adamantium from "../resources/adamantium.js";
import { createShopItems } from "../shop/items.js";

// Import core modules
import { modalSystem } from './modalSystem.js';
import { 
  domCache, 
  getCachedElement, 
  scheduleVisualUpdate, 
  fmt, 
  setText, 
  isLocalStorageAvailable 
} from './helpers.js';
import { storageManager } from './storageManager.js';
import { effectPool } from './effectPool.js';
import { 
  RES_IDS, 
  UNLOCK_COST, 
  MILESTONE_THRESHOLDS, 
  MILESTONE_LABELS, 
  MILESTONE_MULTIPLIERS,
  milestoneRewardsApplied,
  milestoneMultipliers,
  gameState, 
  stats, 
  resources, 
  isUnlocked,
  addOre
} from './dataModel.js';
import { resourceButtons } from './uiElements.js';
import { initializeThemeSwitcher } from './themeSwitcher.js';
import { 
  attemptUnlock, 
  relockResource, 
  spendMoney,
  updateResourceUnlockUI,
  unlockResourceUI
} from './unlocking.js';
import { 
  startGameLoop, 
  stopGameLoop, 
  throttledOperations,
  startAutoSell,
  stopAutoSell,
  initializeThrottledOperations
} from './gameLoop.js';
import { 
  renderShop, 
  updateShopButtons, 
  switchResource, 
  showScreen,
  ensureShopItemsInitialized,
  initializeShopEventListeners
} from './shop.js';
import { 
  checkPrestigeUnlock, 
  updatePrestigeUI, 
  updateCoreUI,
  updatePrestigeTab,
  purchaseCore,
  coreUpgrades,
  totalPrestiges
} from './prestige.js';
import { 
  updateStatsUI, 
  applyMilestoneRewards, 
  updateMilestoneList 
} from './statsMilestones.js';
import { 
  calculateOfflineRewards, 
  showOfflineRewardsModal,
  initializeDeployment,
  GAME_VERSION
} from './deployment.js';
import { 
  initializeGame,
  startGame,
  startNewGame,
  saveGame,
  loadGame
} from './initialization.js';

// ───────────────────────────────────────────────────────────────────────────
// GLOBAL SETUP
// ───────────────────────────────────────────────────────────────────────────

// Initialize resources with imported data
Object.assign(resources, {
  iron,
  copper,
  nickel,
  bronze,
  silver,
  cobalt,
  gold,
  palladium,
  platinum,
  titanium,
  adamantium,
  money: { id: "money", count: 0 },
  coreShards: { id: "coreShards", count: 0 }
});

// Initialize shop items
let shopItems;
function ensureShopItemsInitializedLocal() {
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

// ───────────────────────────────────────────────────────────────────────────
// GAME MECHANICS
// ───────────────────────────────────────────────────────────────────────────

// Add core shards
function addCoreShards(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.coreShards.count += amount;
}

// Mining function
function mineResource(resId) {
  if (!isUnlocked(resId)) return;
  
  const resource = resources[resId];
  if (!resource) return;
  
  const multiplier = milestoneMultipliers[resId] || 1;
  const amount = resource.perClick * multiplier;
  
  addOre(resId, amount);
  stats.clicks.mine++;
  
  // Visual effects
  createMiningEffects(resId, amount);
  
  updateUI();
}

// Selling function
function sellAll(resId, isAutoSell = false) {
  const resource = resources[resId];
  if (!resource || resource.count <= 0) return;
  
  const qty = Math.floor(resource.count);
  const sellPrice = getResourceSellPrice(resId);
  const cash = qty * sellPrice;
  
  resource.count = 0;
  resources.money.count += cash;
  stats.sold[resId] += qty;
  stats.earnedMoney += cash;
  
  if (!isAutoSell) {
    stats.clicks.sell++;
  }
  
  // Visual effects
  if (isAutoSell) {
    createAutoSellEffects(resId, cash, qty);
  } else {
    createSellEffects(resId, cash, qty);
  }
  
  updateUI();
}

// Get resource sell price (from resource files)
function getResourceSellPrice(resId) {
  const resource = resources[resId];
  return resource ? resource.sellPrice : 1;
}

// Visual effects (simplified)
function createMiningEffects(resId, amount) {
  // Add visual feedback for mining
  const button = resourceButtons[resId]?.mine;
  if (button) {
    button.classList.add("mining-flash");
    setTimeout(() => button.classList.remove("mining-flash"), 200);
  }
}

function createSellEffects(resId, cash, qty) {
  // Add visual feedback for selling
  const button = resourceButtons[resId]?.sell;
  if (button) {
    button.classList.add("sell-flash");
    setTimeout(() => button.classList.remove("sell-flash"), 300);
  }
}

function createAutoSellEffects(resId, cash, qty) {
  // Add visual feedback for auto-selling
  const panel = document.querySelector(`[data-resource="${resId}"]`);
  if (panel) {
    panel.classList.add("auto-sell-flash");
    setTimeout(() => panel.classList.remove("auto-sell-flash"), 400);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// UI UPDATE FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

function updateUI() {
  // Update resource counts
  RES_IDS.forEach((resId) => {
    const countEl = document.getElementById(`${resId}-count`);
    if (countEl && resources[resId]) {
      countEl.textContent = fmt(resources[resId].count);
    }
    
    // Update auto-mining rates
    const autoRateEl = document.getElementById(`auto-rate-${resId}`);
    if (autoRateEl && resources[resId]) {
      const rate = resources[resId].perSecond * (milestoneMultipliers[resId] || 1);
      autoRateEl.textContent = fmt(rate);
    }
    
    // Update collapsed auto-mining display
    const collapsedAutoEl = document.getElementById(`collapsed-auto-${resId}`);
    if (collapsedAutoEl && resources[resId]) {
      const rate = resources[resId].perSecond * (milestoneMultipliers[resId] || 1);
      collapsedAutoEl.textContent = rate > 0 ? fmt(rate) + "/s" : "";
    }
  });
  
  // Update money display
  const moneyEl = document.getElementById("money-count");
  if (moneyEl) {
    moneyEl.textContent = fmt(resources.money.count);
  }
  
  // Update core shards display
  const coreShardsEl = document.getElementById("core-shards-count");
  if (coreShardsEl) {
    coreShardsEl.textContent = fmt(resources.coreShards.count);
  }
  
  // Update sell button states
  RES_IDS.forEach((resId) => {
    const sellBtn = resourceButtons[resId]?.sell;
    if (sellBtn && resources[resId]) {
      sellBtn.disabled = resources[resId].count <= 0;
    }
  });
}

// Reset game data
function resetGameData() {
  // Reset resource counts and rates
  RES_IDS.forEach((resId) => {
    if (resources[resId]) {
      resources[resId].count = 0;
      resources[resId].perSecond = 0;
    }
  });
  
  // Reset money but keep core shards
  resources.money.count = 0;
  
  // Reset stats
  Object.keys(stats.mined).forEach(res => stats.mined[res] = 0);
  Object.keys(stats.sold).forEach(res => stats.sold[res] = 0);
  stats.earnedMoney = 0;
  stats.spentMoney = 0;
  stats.clicks = { mine: 0, sell: 0, shopBuy: 0, unlock: 0 };
  
  // Reset milestone rewards
  RES_IDS.forEach((resId) => {
    milestoneRewardsApplied[resId] = MILESTONE_THRESHOLDS.map(() => false);
    milestoneMultipliers[resId] = 1;
  });
  
  // Reset shop items
  if (shopItems) {
    shopItems.forEach(item => {
      item.count = 0;
      item.price = item.basePrice;
    });
  }
}

// ───────────────────────────────────────────────────────────────────────────
// GLOBAL EXPORTS FOR LEGACY COMPATIBILITY
// ───────────────────────────────────────────────────────────────────────────

// Make functions globally available for HTML onclick handlers and module interaction
Object.assign(window, {
  // Core game functions
  mineResource,
  sellAll,
  updateUI,
  resetGameData,
  
  // Shop functions
  renderShop,
  updateShopButtons,
  ensureShopItemsInitialized: ensureShopItemsInitializedLocal,
  
  // Stats and milestones
  updateStatsUI,
  applyMilestoneRewards,
  updateMilestoneList,
  
  // Prestige functions
  checkPrestigeUnlock,
  updatePrestigeUI,
  updateCoreUI,
  updatePrestigeTab,
  purchaseCore,
  
  // Deployment functions
  calculateOfflineRewards,
  showOfflineRewardsModal,
  
  // Utility functions
  fmt,
  setText,
  isUnlocked,
  addOre,
  addCoreShards,
  spendMoney,
  
  // Game state exports
  resources,
  stats,
  shopItems,
  gameState,
  milestoneRewardsApplied,
  milestoneMultipliers,
  totalPrestiges,
  coreUpgrades,
  RES_IDS,
  
  // Game control
  startGame,
  startNewGame,
  saveGame,
  loadGame,
  
  // Version info
  GAME_VERSION
});

// ───────────────────────────────────────────────────────────────────────────
// EVENT LISTENERS
// ───────────────────────────────────────────────────────────────────────────

// Setup mining and selling event listeners
RES_IDS.forEach((resId) => {
  const { mine, sell } = resourceButtons[resId];
  if (mine) mine.addEventListener("click", () => mineResource(resId));
  if (sell) sell.addEventListener("click", () => sellAll(resId));
});

// ───────────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ───────────────────────────────────────────────────────────────────────────

// Initialize the game when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log(`🎮 IdleForge v${GAME_VERSION} - ES6 Modules Loaded`);
  
  // Initialize the game
  initializeGame();
  
  // Set up throttled operations
  initializeThrottledOperations();
  
  console.log("✅ Game initialization complete");
});

// Export main game object for debugging
export default {
  version: GAME_VERSION,
  gameState,
  resources,
  stats,
  updateUI,
  mineResource,
  sellAll,
  startGame,
  saveGame,
  loadGame
};