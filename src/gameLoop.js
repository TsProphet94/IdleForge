// ───────────────────────────────────────────────────────────────────────────
// GAME LOOP
// ───────────────────────────────────────────────────────────────────────────

import { RES_IDS, gameState, resources, milestoneMultipliers, addOre, isUnlocked } from './dataModel.js';
import { scheduleVisualUpdate, fmt } from './helpers.js';
import { screenStats, screenShop } from './uiElements.js';

// Performance: Use single game loop with RAF instead of multiple setInterval
let gameLoopRunning = false;
let lastTimestamp = 0;

// Auto-sell related variables
const autoSellTimers = {};
const countdownTimers = {};
const nextSellTimes = {};
const autoSellIntervals = {};

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

// Main game loop function
function gameLoop(timestamp) {
  if (!gameState.gameStarted || !gameLoopRunning) return;

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
      // These functions need to be imported when available
      if (window.updateUI) window.updateUI();
      if (!screenStats.classList.contains("hidden") && throttledOperations.updateStatsUI)
        throttledOperations.updateStatsUI();
      if (!screenShop.classList.contains("hidden") && throttledOperations.updateShopButtons)
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

// Auto-sell functions
function calculateAutoSellInterval(resId) {
  const baseInterval = 15000; // 15 seconds base
  const minInterval = 3000; // 3 seconds minimum

  // This will need to access shop items when available
  if (!window.ensureShopItemsInitialized) return baseInterval;
  
  const items = window.ensureShopItemsInitialized();

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

  // Ensure shop items are initialized - this will need to be available globally
  if (!window.ensureShopItemsInitialized) return;
  const items = window.ensureShopItemsInitialized();

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
    if (window.sellAll) window.sellAll(resId, true); // Pass true for isAutoSell
    nextSellTimes[resId] = Date.now() + autoSellIntervals[resId];
  }, autoSellIntervals[resId]);
}

function stopAutoSell(resId) {
  clearInterval(autoSellTimers[resId]);
  clearInterval(countdownTimers[resId]);
  autoSellTimers[resId] = null;
  countdownTimers[resId] = null;
  nextSellTimes[resId] = null;
  document.getElementById(`sell-timer-${resId}`)?.classList.add("hidden");
}

function updateSellCountdown(resId) {
  const countdownEl = document.getElementById(`sell-countdown-${resId}`);
  if (!countdownEl || !nextSellTimes[resId]) return;

  const remaining = nextSellTimes[resId] - Date.now();
  
  if (remaining <= 0) {
    countdownEl.textContent = "0.0";
    return;
  }

  // Show countdown with one decimal place for precision
  const seconds = (remaining / 1000).toFixed(1);
  countdownEl.textContent = seconds;

  // Visual feedback: Change color as countdown approaches zero
  if (remaining < 2000) {
    countdownEl.style.color = "#ff6b6b"; // Red
    countdownEl.style.fontWeight = "bold";
  } else if (remaining < 5000) {
    countdownEl.style.color = "#ffa726"; // Orange
    countdownEl.style.fontWeight = "600";
  } else {
    countdownEl.style.color = "#28a745"; // Green
    countdownEl.style.fontWeight = "normal";
  }
}

// Initialize throttled functions - these will be set when the functions become available
function initializeThrottledOperations() {
  if (window.updateShopButtons) {
    throttledOperations.updateShopButtons = throttledOperations.throttle(
      window.updateShopButtons,
      100
    );
  }
  if (window.updateStatsUI) {
    throttledOperations.updateStatsUI = throttledOperations.throttle(
      window.updateStatsUI,
      200
    );
  }
}

export {
  gameLoopRunning,
  gameLoop,
  startGameLoop,
  stopGameLoop,
  throttledOperations,
  autoSellTimers,
  countdownTimers,
  nextSellTimes,
  autoSellIntervals,
  calculateAutoSellInterval,
  startAutoSell,
  stopAutoSell,
  updateSellCountdown,
  initializeThrottledOperations
};