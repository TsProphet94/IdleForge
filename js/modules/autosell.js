// Auto-sell System Module
import { ensureShopItemsInitialized } from './data.js';
import { sellAll } from './game.js';

// Auto-sell state management
const autoSellTimers = {};
const countdownTimers = {};
const nextSellTimes = {};
const autoSellIntervals = {};

// Calculate current autosell interval based on speed upgrades
export function calculateAutoSellInterval(resId) {
  const baseInterval = 15000; // 15 seconds base
  const minInterval = 3000;  // 3 seconds minimum
  const items = ensureShopItemsInitialized();
  const speedUpgrades = items.filter(
    (i) => i.category === resId && i.id.endsWith('-autosell-speed')
  );
  let totalBonus = 0;
  speedUpgrades.forEach(u => {
    totalBonus += u.count * u.speedReduction;
  });
  return Math.max(minInterval, baseInterval - totalBonus);
}

// Start auto-selling for a resource
export function startAutoSell(resId) {
  stopAutoSell(resId);
  const items = ensureShopItemsInitialized();
  const seller = items.find(
    i => i.category === resId && i.id.endsWith('-autoseller')
  );
  if (!seller || seller.count === 0) return;
  
  const interval = calculateAutoSellInterval(resId);
  autoSellIntervals[resId] = interval;
  nextSellTimes[resId] = Date.now() + interval;
  
  // Show the timer UI
  const timerEl = document.getElementById(`sell-timer-${resId}`);
  if (timerEl) timerEl.classList.remove("hidden");
  
  // Start the auto-sell timer
  autoSellTimers[resId] = setInterval(() => {
    sellAll(resId, true);
    nextSellTimes[resId] = Date.now() + autoSellIntervals[resId];
  }, interval);
  
  // Start the countdown display timer
  countdownTimers[resId] = setInterval(() => updateSellCountdown(resId), 50);
  
  console.log(`🤖 Auto-sell started for ${resId} (${interval/1000}s interval)`);
}

// Stop auto-selling for a resource
export function stopAutoSell(resId) {
  if (autoSellTimers[resId]) {
    clearInterval(autoSellTimers[resId]);
    autoSellTimers[resId] = null;
  }
  if (countdownTimers[resId]) {
    clearInterval(countdownTimers[resId]);
    countdownTimers[resId] = null;
  }
  
  // Hide the timer UI
  const timerEl = document.getElementById(`sell-timer-${resId}`);
  if (timerEl) timerEl.classList.add("hidden");
  
  // Remove progress bar if it exists
  const progressBar = document.getElementById(`autosell-progress-${resId}`);
  if (progressBar) progressBar.remove();
  
  // Clear next sell time
  nextSellTimes[resId] = null;
  
  console.log(`⏹️ Auto-sell stopped for ${resId}`);
}

// Update countdown display and progress bar
export function updateSellCountdown(resId) {
  const totalInterval = autoSellIntervals[resId] || calculateAutoSellInterval(resId);
  const remaining = nextSellTimes[resId] - Date.now();
  const sec = Math.ceil(remaining / 1000);
  
  // Calculate progress for smooth animation
  let progress = (totalInterval - remaining) / totalInterval;
  progress = Math.max(0, Math.min(1, progress));
  
  // If remaining time is negative, reset for next cycle
  if (remaining <= 0) {
    progress = 0;
  }
  
  const countdownEl = document.getElementById(`sell-countdown-${resId}`);
  if (countdownEl) {
    const timeLeft = Math.max(sec, 0);
    countdownEl.textContent = timeLeft;
    
    // Update or create progress bar
    let progressBar = document.getElementById(`autosell-progress-${resId}`);
    if (!progressBar) {
      progressBar = document.createElement("div");
      progressBar.id = `autosell-progress-${resId}`;
      progressBar.className = "autosell-progress-bar";
      progressBar.innerHTML = '<div class="autosell-progress-fill"></div>';
      
      // Find appropriate parent for progress bar
      const panel = document.getElementById(`${resId}-box`);
      const isCollapsed = panel?.classList.contains('collapsed');
      
      if (isCollapsed) {
        // For collapsed panels, add to collapsed progress bar
        const collapsedBar = document.getElementById(`progress-bar-${resId}`);
        if (collapsedBar) {
          collapsedBar.appendChild(progressBar);
        }
      } else {
        // For expanded panels, add to auto-status section
        const autoStatus = panel?.querySelector('.auto-status');
        if (autoStatus) {
          autoStatus.appendChild(progressBar);
        }
      }
    }
    
    // Update progress bar fill
    const progressFill = progressBar?.querySelector('.autosell-progress-fill');
    if (progressFill) {
      progressFill.style.width = `${progress * 100}%`;
    }
  }
}

// Toggle auto-sell for a resource
export function toggleAutoSell(resId) {
  const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
  if (!toggle) return;
  
  if (toggle.checked) {
    startAutoSell(resId);
  } else {
    stopAutoSell(resId);
  }
}

// Visual pop effect on manual sell
export function createSellPop(resourceId) {
  const btn = document.getElementById(`sell-${resourceId}-btn`);
  if (!btn) return;
  
  const pop = document.createElement("span");
  pop.className = "sell-pop";
  pop.textContent = "$";
  btn.appendChild(pop);
  
  // Remove the pop after animation
  pop.addEventListener("animationend", () => pop.remove());
}

// Check if auto-sell is enabled for a resource
export function isAutoSellEnabled(resId) {
  return autoSellTimers[resId] !== null && autoSellTimers[resId] !== undefined;
}

// Initialize auto-sell event handlers
export function initAutoSellHandlers() {
  const resourceIds = [
    'iron', 'copper', 'nickel', 'bronze', 'silver', 'cobalt', 
    'gold', 'palladium', 'platinum', 'titanium', 'adamantium'
  ];
  
  resourceIds.forEach(resId => {
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) {
      toggle.addEventListener('change', () => toggleAutoSell(resId));
    }
  });
  
  console.log("✅ Auto-sell handlers initialized");
}

// Cleanup all auto-sell timers (useful for game reset)
export function cleanupAllAutoSell() {
  const resourceIds = [
    'iron', 'copper', 'nickel', 'bronze', 'silver', 'cobalt', 
    'gold', 'palladium', 'platinum', 'titanium', 'adamantium'
  ];
  
  resourceIds.forEach(resId => {
    stopAutoSell(resId);
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) toggle.checked = false;
  });
  
  console.log("🧹 All auto-sell timers cleaned up");
}

// Export state objects for backward compatibility
export { autoSellTimers, countdownTimers, nextSellTimes, autoSellIntervals };
