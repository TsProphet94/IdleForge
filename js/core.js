// js/core.js - Prestige and core upgrades logic
import { resources, stats, RES_IDS, ensureShopItemsInitialized } from './data.js';
import { fmt, addCoreShards, spendCoreShards, nickelUnlocked, setUnlockState } from './resources.js';
import { modalSystem, UI_ELEMENTS } from './ui.js';
import { MILESTONE_THRESHOLDS, milestoneMultipliers } from './stats.js';

// ───────────────────────────────────────────────────────────────────────────
// PRESTIGE & CORE STATE
// ───────────────────────────────────────────────────────────────────────────

// Prestige system
export let prestigeUnlocked = false;
export let totalPrestiges = 0;

// Core upgrades system
export const coreUpgrades = {
  globalMineRate: {
    level: 0,
    maxLevel: 10,
    baseCost: 1,
    costScale: 2,
    effect: 0.25, // 25% bonus per level
  },
  globalSellValue: {
    level: 0,
    maxLevel: 10,  
    baseCost: 2,
    costScale: 2,
    effect: 0.15, // 15% bonus per level
  },
  autoMineSpeed: {
    level: 0,
    maxLevel: 5,
    baseCost: 3,
    costScale: 3,
    effect: 0.2, // 20% bonus per level
  },
};

// Auto-sell timing state
export const autoSellTimers = {};
export const countdownTimers = {};
export const nextSellTimes = {};

// ───────────────────────────────────────────────────────────────────────────
// PRESTIGE CALCULATION & UNLOCK
// ───────────────────────────────────────────────────────────────────────────

/** Calculate prestige core shards reward */
export function calculatePrestigeReward() {
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
export function checkPrestigeUnlock() {
  // Prestige button is only unlocked when nickel is currently unlocked
  // Even if player has prestiged before, they need to reach nickel again
  if (!prestigeUnlocked && nickelUnlocked) {
    prestigeUnlocked = true;
    updatePrestigeUI();
  }
}

/** Update prestige UI visibility */
export function updatePrestigeUI() {
  const prestigeBtn = document.getElementById("prestige-btn");
  
  // Prestige button visibility - only show when nickel is unlocked
  if (prestigeBtn) {
    prestigeBtn.style.display = prestigeUnlocked ? "block" : "none";
  }

  // Core tab visibility - show if player has ever prestiged (has core shards or total prestiges > 0)
  const hasEverPrestiged = totalPrestiges > 0 || resources.coreShards.count > 0;
  if (UI_ELEMENTS.tabCore) {
    UI_ELEMENTS.tabCore.style.display = hasEverPrestiged ? "block" : "none";
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
export function updatePrestigeTab() {
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
      prestigeActionBtn.textContent = `Prestige (+${reward} Core Shards)`;
      prestigeLockedMsg.style.display = "none";
    } else {
      prestigeActionBtn.style.display = "none";
      prestigeLockedMsg.style.display = "block";
      prestigeLockedMsg.textContent = "Unlock Nickel to enable prestiging";
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
// PRESTIGE EXECUTION
// ───────────────────────────────────────────────────────────────────────────

export async function handlePrestige() {
  if (!prestigeUnlocked) return;

  const reward = calculatePrestigeReward();
  
  // Show confirmation modal
  const confirmed = await modalSystem.showPrestigeConfirm(reward);
  if (!confirmed) return;

  // Execute prestige
  totalPrestiges++;
  addCoreShards(reward);
  
  // Reset game state
  resetGameForPrestige();

  // Update UI to reflect reset state (hide prestige button, etc.)
  updatePrestigeUI();
  
  // Import UI functions to update
  const { updateUI, showScreen } = await import('./ui.js');
  const { renderShop } = await import('./shop.js');
  
  updateUI();
  renderShop();

  // Switch to mine tab since player needs to progress again
  showScreen(UI_ELEMENTS.screenMine);

  // Show success notification
  await modalSystem.showAlert(
    "Prestige Complete!",
    `You gained <strong>${reward} Core Shards</strong>! Use them to purchase permanent upgrades in the Core tab.`,
    "info"
  );
}

/** Reset game state for prestige */
export function resetGameForPrestige() {
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

  // Reset all resource counts
  RES_IDS.forEach((res) => {
    resources[res].count = 0;
    resources[res].perClick = 1;
    resources[res].perSecond = 0;
  });

  // Reset money
  resources.money.count = 0;

  // Reset unlock states (keep prestige unlocked false so player must reach nickel again)
  prestigeUnlocked = false;
  setUnlockState("copper", false);
  setUnlockState("nickel", false);
  setUnlockState("bronze", false);
  setUnlockState("silver", false);
  setUnlockState("cobalt", false);
  setUnlockState("gold", false);
  setUnlockState("palladium", false);
  setUnlockState("platinum", false);
  setUnlockState("titanium", false);
  setUnlockState("adamantium", false);

  // Relock all resource panels
  const resourcePanels = document.querySelectorAll('.resource-panel[data-resource]');
  resourcePanels.forEach(panel => {
    const resId = panel.dataset.resource;
    if (resId !== 'iron') {
      panel.classList.add('locked', 'collapsed');
      const lockOverlay = document.getElementById(`lock-overlay-${resId}`);
      if (lockOverlay) lockOverlay.style.display = 'block';
      
      // Disable buttons
      const mineBtn = document.getElementById(`mine-${resId}-btn`);
      const sellBtn = document.getElementById(`sell-${resId}-btn`);
      if (mineBtn) mineBtn.disabled = true;
      if (sellBtn) sellBtn.disabled = true;
      
      // Reset filter options
      const option = document.querySelector(`option[data-resource="${resId}"]`);
      if (option) {
        option.disabled = true;
        option.classList.add('locked-option');
        option.textContent = option.textContent.replace(' (Locked)', '') + ' (Locked)';
      }
    }
  });

  // Reset shop items by re-creating them
  const { createShopItems } = await import('../shop/items.js');
  const shopItems = createShopItems(resources);
  shopItems.forEach(item => {
    item.count = 0;
    item.price = item.basePrice;
  });

  // Reset milestone multipliers but keep achievements
  RES_IDS.forEach((res) => {
    milestoneMultipliers[res] = 1;
  });

  // Reset to starting resource filter
  const resourceFilter = document.getElementById('resource-filter-select');
  if (resourceFilter) {
    resourceFilter.value = 'iron';
  }

  // Clear scroll position
  window.scrollTo(0, 0);
}

// ───────────────────────────────────────────────────────────────────────────
// CORE UPGRADE SYSTEM
// ───────────────────────────────────────────────────────────────────────────

/** Get Core upgrade cost */
export function getForgeCoreCost(upgradeId) {
  const upgrade = coreUpgrades[upgradeId];
  if (!upgrade || upgrade.level >= upgrade.maxLevel) return Infinity;
  return Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costScale, upgrade.level)
  );
}

/** Get Core bonus value */
export function getForgeCoreBonusValue(upgradeId) {
  const upgrade = coreUpgrades[upgradeId];
  if (!upgrade) return 0;
  return upgrade.level * upgrade.effect;
}

/** Apply Core bonuses to mining */
export function applyForgeCoreBonuses() {
  const globalMineBonus = 1 + getForgeCoreBonusValue("globalMineRate");

  return {
    mineRate: globalMineBonus,
  };
}

/** Purchase Core upgrade */
export function purchaseForgeCore(upgradeId) {
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
  
  // Import and call updateUI
  import('./ui.js').then(({ updateUI }) => updateUI && updateUI());
  
  return true;
}

/** Create visual feedback for upgrade purchase */
export function createUpgradePurchaseFeedback(upgradeId) {
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

// ───────────────────────────────────────────────────────────────────────────
// CORE UI
// ───────────────────────────────────────────────────────────────────────────

/** Update Core UI */
export function updateCoreUI() {
  if (!UI_ELEMENTS.screenCore) return;

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
      autoMineSpeed: "Auto-Mine Speed",
    };

    const upgradeDescriptions = {
      globalMineRate: "Increases mining rate for all resources",
      globalSellValue: "Increases sell value for all resources",
      autoMineSpeed: "Increases auto-mining speed for all resources",
    };

    const bonusValue = getForgeCoreBonusValue(upgradeId);
    const nextLevelBonus = bonusValue + upgrade.effect;

    upgradeDiv.innerHTML = `
      <h4>${upgradeNames[upgradeId] || upgradeId}</h4>
      <p>${upgradeDescriptions[upgradeId] || "Core upgrade"}</p>
      <div class="upgrade-stats">
        <span>Level: ${upgrade.level}/${upgrade.maxLevel}</span>
        <span>Current Bonus: +${(bonusValue * 100).toFixed(0)}%</span>
        ${upgrade.level < upgrade.maxLevel ? `<span>Next Level: +${(nextLevelBonus * 100).toFixed(0)}%</span>` : ''}
      </div>
      <div class="upgrade-actions">
        ${upgrade.level < upgrade.maxLevel ? 
          `<button 
            onclick="purchaseForgeCore('${upgradeId}')" 
            ${canAfford ? '' : 'disabled'}
            class="upgrade-btn ${canAfford ? 'affordable' : ''}"
          >
            Buy (${fmt(cost)} Core Shards)
          </button>` :
          `<button disabled class="upgrade-btn maxed">Maxed</button>`
        }
      </div>
    `;

    container.appendChild(upgradeDiv);
  });

  // Update core shards display
  if (UI_ELEMENTS.coreShardsCount) {
    UI_ELEMENTS.coreShardsCount.textContent = fmt(resources.coreShards.count);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// AUTO-SELL SYSTEM STUBS (will implement in resources.js)
// ───────────────────────────────────────────────────────────────────────────

function stopAutoSell(resId) {
  // Will be implemented in resources.js
}

// ───────────────────────────────────────────────────────────────────────────
// PRESTIGE BUTTON HANDLER
// ───────────────────────────────────────────────────────────────────────────

export function initPrestigeHandlers() {
  // Handle prestige button clicks in both locations
  document.addEventListener('click', (e) => {
    if (e.target.id === 'prestige-btn' || e.target.id === 'prestige-action-btn') {
      handlePrestige();
    }
  });
}

// Make functions globally accessible for onclick handlers
if (typeof window !== 'undefined') {
  window.purchaseForgeCore = purchaseForgeCore;
}

// Export state setters
export function setPrestigeUnlocked(value) {
  prestigeUnlocked = value;
}

export function setTotalPrestiges(value) {
  totalPrestiges = value;
}

export function setCoreUpgradeLevel(upgradeId, level) {
  if (coreUpgrades[upgradeId]) {
    coreUpgrades[upgradeId].level = level;
  }
}