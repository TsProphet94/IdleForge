// ───────────────────────────────────────────────────────────────────────────
// PRESTIGE SYSTEM
// ───────────────────────────────────────────────────────────────────────────

import { gameState, resources } from './dataModel.js';
import { prestigeBtn } from './uiElements.js';

// Prestige system variables
let totalPrestiges = 0;

// Core upgrades system
const coreUpgrades = {
  globalMineRate: {
    level: 0,
    cost: 10,
    costScale: 2,
    maxLevel: 50,
    effect: 1.2
  },
  globalSellRate: {
    level: 0,
    cost: 15,
    costScale: 2,
    maxLevel: 50,
    effect: 1.25
  }
};

// Check if prestige is available
function checkPrestigeUnlock() {
  // Prestige button is only unlocked when nickel is currently unlocked
  // Even if player has prestiged before, they need to reach nickel again
  if (!gameState.prestigeUnlocked && gameState.nickelUnlocked) {
    gameState.prestigeUnlocked = true;
    updatePrestigeUI();
  }
}

// Update prestige UI visibility
function updatePrestigeUI() {
  // Prestige button visibility - only show when nickel is unlocked
  if (prestigeBtn) {
    prestigeBtn.style.display = gameState.prestigeUnlocked ? "block" : "none";
  }
  
  // Update Core tab visibility
  const tabCore = document.getElementById("tab-forgecore");
  const coreShardsDisplay = document.getElementById("core-shards-display");
  
  if (tabCore) {
    tabCore.style.display = gameState.prestigeUnlocked ? "block" : "none";
  }
  
  if (coreShardsDisplay) {
    coreShardsDisplay.style.display = gameState.prestigeUnlocked ? "block" : "none";
  }
}

// Calculate prestige reward
function calculatePrestigeReward() {
  // Simplified prestige calculation
  const money = resources.money.count;
  if (money < 1000000) return 0; // Need at least 1M to prestige
  
  return Math.floor(Math.log10(money / 1000000) * 10);
}

// Perform prestige
function performPrestige() {
  const reward = calculatePrestigeReward();
  if (reward <= 0) return false;
  
  // Add core shards
  resources.coreShards.count += reward;
  totalPrestiges++;
  
  // Reset game state (this would call reset functions from other modules)
  if (window.startNewGame) {
    window.startNewGame();
  }
  
  // Restore prestige state
  gameState.prestigeUnlocked = true;
  
  return true;
}

// Update prestige tab
function updatePrestigeTab() {
  const prestigeCoreShards = document.getElementById("prestige-core-shards");
  const prestigeTotalCount = document.getElementById("prestige-total-count");
  const prestigeNextReward = document.getElementById("prestige-next-reward");
  const prestigeActionBtn = document.getElementById("prestige-action-btn");
  const prestigeLockedMessage = document.getElementById("prestige-locked-message");
  
  if (prestigeCoreShards) {
    prestigeCoreShards.textContent = resources.coreShards.count;
  }
  
  if (prestigeTotalCount) {
    prestigeTotalCount.textContent = totalPrestiges;
  }
  
  const nextReward = calculatePrestigeReward();
  if (prestigeNextReward) {
    prestigeNextReward.textContent = nextReward;
  }
  
  if (prestigeActionBtn && prestigeLockedMessage) {
    if (gameState.prestigeUnlocked) {
      prestigeActionBtn.style.display = "block";
      prestigeActionBtn.textContent = `Prestige (+${nextReward} Core Shards)`;
      prestigeActionBtn.disabled = nextReward <= 0;
      prestigeLockedMessage.style.display = "none";
    } else {
      prestigeActionBtn.style.display = "none";
      prestigeLockedMessage.style.display = "block";
    }
  }
}

// Update Core UI
function updateCoreUI() {
  const forgecoreUpgrades = document.getElementById("forgecore-upgrades");
  if (!forgecoreUpgrades) return;
  
  forgecoreUpgrades.innerHTML = "";
  
  Object.entries(coreUpgrades).forEach(([id, upgrade]) => {
    const cost = upgrade.cost * Math.pow(upgrade.costScale, upgrade.level);
    const canAfford = resources.coreShards.count >= cost;
    const isMaxed = upgrade.level >= upgrade.maxLevel;
    
    const div = document.createElement("div");
    div.className = "core-upgrade";
    div.innerHTML = `
      <h4>${id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
      <p>Level: ${upgrade.level}/${upgrade.maxLevel}</p>
      <p>Cost: ${cost} Core Shards</p>
      <button ${isMaxed || !canAfford ? 'disabled' : ''} onclick="purchaseCore('${id}')">
        ${isMaxed ? 'Maxed' : 'Upgrade'}
      </button>
    `;
    
    forgecoreUpgrades.appendChild(div);
  });
}

// Purchase core upgrade
function purchaseCore(upgradeId) {
  const upgrade = coreUpgrades[upgradeId];
  if (!upgrade || upgrade.level >= upgrade.maxLevel) return;
  
  const cost = upgrade.cost * Math.pow(upgrade.costScale, upgrade.level);
  if (resources.coreShards.count < cost) return;
  
  resources.coreShards.count -= cost;
  upgrade.level++;
  
  updateCoreUI();
  if (window.updateUI) window.updateUI();
}

// Make purchaseCore globally accessible for onclick handlers
window.purchaseCore = purchaseCore;

export {
  totalPrestiges,
  coreUpgrades,
  checkPrestigeUnlock,
  updatePrestigeUI,
  calculatePrestigeReward,
  performPrestige,
  updatePrestigeTab,
  updateCoreUI,
  purchaseCore
};