// Prestige system module
import { resources, RES_IDS, stats, shopItems } from './data.js';
import { unlockState, prestigeUnlocked, totalPrestiges, setPrestigeUnlocked, setTotalPrestiges, incrementPrestiges, coreUpgrades } from './state.js';
import { addCoreShards, spendCoreShards } from './game.js';
import { fmt } from './helpers.js';
import { modalSystem } from './modal.js';

// Milestone constants
const MILESTONE_THRESHOLDS = [100, 1000, 10000, 100000, 1000000];
const MILESTONE_LABELS = ["100", "1K", "10K", "100K", "1M"];
const MILESTONE_MULTIPLIERS = [1.2, 1.5, 1.8, 2, 2.5];

// Calculate prestige reward
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

// Check if prestige is available
export function checkPrestigeUnlock() {
  // Prestige button is only unlocked when nickel is currently unlocked
  // Even if player has prestiged before, they need to reach nickel again
  const nickelUnlocked = unlockState.nickel;
  if (!prestigeUnlocked && nickelUnlocked) {
    setPrestigeUnlocked(true);
    updatePrestigeUI();
  }
}

// Update prestige UI visibility
export function updatePrestigeUI() {
  // Prestige button visibility - only show when nickel is unlocked
  const prestigeBtn = document.getElementById("prestige-btn");
  if (prestigeBtn) {
    prestigeBtn.style.display = prestigeUnlocked ? "block" : "none";
  }

  // Core tab visibility - show if player has ever prestiged (has core shards or total prestiges > 0)
  const hasEverPrestiged = totalPrestiges > 0 || resources.coreShards.count > 0;
  const tabCore = document.getElementById("tab-forgecore");
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

// Update prestige tab content
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
  if (prestigeActionBtn) {
    const reward = calculatePrestigeReward();
    prestigeActionBtn.disabled = reward < 1;
    prestigeActionBtn.textContent = `Prestige (+${reward} Core Shards)`;
  }
}

// Reset game for prestige
export function resetGameForPrestige() {
  // Reset all resources except core shards
  RES_IDS.forEach(resId => {
    resources[resId].count = 0;
  });
  resources.money.count = 0;

  // Reset unlock state (keep iron unlocked)
  Object.keys(unlockState).forEach(key => {
    unlockState[key] = false;
  });

  // Reset shop items
  Object.keys(shopItems).forEach(category => {
    Object.keys(shopItems[category]).forEach(itemId => {
      shopItems[category][itemId].owned = 0;
    });
  });

  // Reset some stats but keep lifetime totals
  const clickStats = { ...stats.clicks };
  stats.clicks = {
    mine: 0,
    sell: 0,
    shop: 0
  };

  // Keep earnedMoney and other lifetime stats
  // Reset prestige unlock flag so player needs to reach nickel again
  setPrestigeUnlocked(false);
}

// Attempt prestige with confirmation
export async function attemptPrestige() {
  const reward = calculatePrestigeReward();
  
  if (reward < 1) {
    modalSystem.showAlert(
      "Cannot Prestige",
      "You need to earn more money or reach more milestones before you can prestige!",
      "warning"
    );
    return;
  }

  const confirmed = await modalSystem.showPrestigeConfirm(reward);
  if (!confirmed) return;

  // Perform prestige
  resetGameForPrestige();
  addCoreShards(reward);
  incrementPrestiges();

  // Update UI
  updatePrestigeUI();
  
  // Show success message
  modalSystem.showAlert(
    "Prestige Complete!",
    `You gained ${reward} Core Shards! Use them to purchase powerful permanent upgrades.`,
    "success"
  );

  console.log(`Prestige completed! Gained ${reward} core shards. Total prestiges: ${totalPrestiges}`);
}

// Apply milestone rewards
export function applyMilestoneRewards() {
  const milestoneMultiplier = getMilestoneMultiplier();
  
  // Apply multiplier to auto-mining rates
  RES_IDS.forEach(resId => {
    if (resources[resId].baseAutoRate) {
      resources[resId].autoRate = resources[resId].baseAutoRate * milestoneMultiplier;
    }
  });
}

// Get current milestone multiplier
function getMilestoneMultiplier() {
  let totalMultiplier = 1;
  
  RES_IDS.forEach(resId => {
    const mined = stats.mined[resId] || 0;
    MILESTONE_THRESHOLDS.forEach((threshold, index) => {
      if (mined >= threshold) {
        totalMultiplier *= MILESTONE_MULTIPLIERS[index];
      }
    });
  });
  
  return totalMultiplier;
}

// Update milestone list UI
export function updateMilestoneList() {
  const milestoneList = document.getElementById("milestone-list");
  if (!milestoneList) return;

  milestoneList.innerHTML = "";

  RES_IDS.forEach(resId => {
    const resourceName = resId.charAt(0).toUpperCase() + resId.slice(1);
    const mined = stats.mined[resId] || 0;

    MILESTONE_THRESHOLDS.forEach((threshold, index) => {
      const label = MILESTONE_LABELS[index];
      const multiplier = MILESTONE_MULTIPLIERS[index];
      const achieved = mined >= threshold;

      const milestoneItem = document.createElement("div");
      milestoneItem.className = `milestone-item ${achieved ? "achieved" : "not-achieved"}`;
      
      milestoneItem.innerHTML = `
        <div class="milestone-info">
          <span class="milestone-title">${resourceName} - ${label}</span>
          <span class="milestone-reward">${multiplier}x Speed</span>
        </div>
        <div class="milestone-progress">
          <span class="milestone-current">${fmt(mined)}</span>
          <span class="milestone-target">/ ${fmt(threshold)}</span>
        </div>
        <div class="milestone-status">
          ${achieved ? "✅" : "🔒"}
        </div>
      `;

      milestoneList.appendChild(milestoneItem);
    });
  });
}

// Core upgrade functions
export function getForgeCoreCost(upgradeId) {
  const upgrade = coreUpgrades[upgradeId];
  if (!upgrade || upgrade.level >= upgrade.maxLevel) return Infinity;
  return Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costScale, upgrade.level)
  );
}

export function getForgeCoreBonusValue(upgradeId) {
  const upgrade = coreUpgrades[upgradeId];
  if (!upgrade) return 0;
  return upgrade.level * upgrade.effect;
}

export function purchaseForgeCore(upgradeId) {
  const upgrade = coreUpgrades[upgradeId];
  if (!upgrade || upgrade.level >= upgrade.maxLevel) {
    console.log("Cannot purchase upgrade: max level reached or invalid upgrade");
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
  // updateUI will be called by the main UI module
  return true;
}

export function applyForgeCoreBonuses() {
  // Apply core bonuses to resources
  const globalMineBonus = getForgeCoreBonusValue('globalMineRate');
  const globalSellBonus = getForgeCoreBonusValue('globalSellValue');
  
  RES_IDS.forEach(resId => {
    // Apply mine rate bonus
    if (resources[resId].basePerClick) {
      resources[resId].perClick = resources[resId].basePerClick * (1 + globalMineBonus);
    }
    if (resources[resId].baseAutoRate) {
      resources[resId].autoRate = resources[resId].baseAutoRate * (1 + globalMineBonus);
    }
    
    // Apply sell value bonus  
    if (resources[resId].baseSellPrice) {
      resources[resId].sellPrice = resources[resId].baseSellPrice * (1 + globalSellBonus);
    }
  });
}

// Update core UI
export function updateCoreUI() {
  // Update core shards count
  const coreShardsCountEl = document.getElementById("core-shards-count");
  if (coreShardsCountEl) {
    coreShardsCountEl.textContent = fmt(resources.coreShards.count);
  }

  // Update each upgrade
  Object.keys(coreUpgrades).forEach(upgradeId => {
    const upgrade = coreUpgrades[upgradeId];
    const cost = getForgeCoreCost(upgradeId);
    const bonusValue = getForgeCoreBonusValue(upgradeId);

    // Update level display
    const levelEl = document.getElementById(`${upgradeId}-level`);
    if (levelEl) {
      levelEl.textContent = `${upgrade.level}/${upgrade.maxLevel}`;
    }

    // Update cost display
    const costEl = document.getElementById(`${upgradeId}-cost`);
    if (costEl) {
      costEl.textContent = cost === Infinity ? "MAX" : fmt(cost);
    }

    // Update bonus display
    const bonusEl = document.getElementById(`${upgradeId}-bonus`);
    if (bonusEl) {
      bonusEl.textContent = `+${Math.round(bonusValue * 100)}%`;
    }

    // Update button state
    const upgradeBtn = document.querySelector(`button[onclick*="${upgradeId}"]`);
    if (upgradeBtn) {
      upgradeBtn.disabled = cost > resources.coreShards.count || cost === Infinity;
    }
  });
}

// Create visual feedback for upgrade purchase
function createUpgradePurchaseFeedback(upgradeId) {
  const upgradeContainers = document.querySelectorAll(".forgecore-upgrade");
  upgradeContainers.forEach((container) => {
    const button = container.querySelector(`button[onclick*="${upgradeId}"]`);
    if (button) {
      // Add a temporary success animation
      container.style.transform = "scale(1.02)";
      container.style.boxShadow = "0 0 20px rgba(106, 90, 205, 0.6)";
      container.style.transition = "all 0.3s ease";

      setTimeout(() => {
        container.style.transform = "scale(1)";
        container.style.boxShadow = "none";
        setTimeout(() => {
          container.style.transition = "";
        }, 300);
      }, 200);
    }
  });
}

// Make functions globally accessible
if (typeof window !== 'undefined') {
  window.purchaseForgeCore = purchaseForgeCore;
  window.attemptPrestige = attemptPrestige;
}