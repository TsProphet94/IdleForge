// js/storage.js - Load/save logic and auto-save
import { resources, stats, RES_IDS, gameStarted, setGameStarted, setLastActive, ensureShopItemsInitialized, shopItems } from './data.js';
import { 
  copperUnlocked, nickelUnlocked, bronzeUnlocked, silverUnlocked, cobaltUnlocked,
  goldUnlocked, palladiumUnlocked, platinumUnlocked, titaniumUnlocked, adamantiumUnlocked,
  setUnlockState, unlockResourceUI
} from './resources.js';
import { modalSystem, showAutoSaveIndicator, hideAutoSaveIndicator } from './ui.js';
import { milestoneMultipliers, applyMilestoneRewards } from './stats.js';
import { 
  totalPrestiges, prestigeUnlocked, coreUpgrades, 
  setTotalPrestiges, setPrestigeUnlocked, setCoreUpgradeLevel, getForgeCoreBonusValue 
} from './core.js';

// ───────────────────────────────────────────────────────────────────────────
// STORAGE CONSTANTS & STATE
// ───────────────────────────────────────────────────────────────────────────

// Version control for save compatibility
const GAME_VERSION = "0.1.37";
const RESET_SAVES_ON_VERSION_CHANGE = false;

let autoSaveInterval = null;

// ───────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

function isLocalStorageAvailable() {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function compareVersions(version1, version2) {
  const parts1 = version1.split('.').map(Number);
  const parts2 = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}

function shouldResetSave(saveData) {
  if (!RESET_SAVES_ON_VERSION_CHANGE) return false;

  const savedVersion = saveData.gameVersion || "0.0.0";
  const versionChanged = compareVersions(GAME_VERSION, savedVersion) !== 0;

  if (versionChanged) {
    console.log(
      `Version changed from ${savedVersion} to ${GAME_VERSION} - save reset enabled`
    );
    return true;
  }

  return false;
}

// ───────────────────────────────────────────────────────────────────────────
// SAVE SYSTEM
// ───────────────────────────────────────────────────────────────────────────

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
    gameVersion: GAME_VERSION, // Track game version with save data
    iron: resources.iron.count,
    copper: resources.copper.count,
    nickel: resources.nickel.count,
    bronze: resources.bronze.count,
    silver: resources.silver.count,
    cobalt: resources.cobalt.count,
    gold: resources.gold.count,
    palladium: resources.palladium.count,
    platinum: resources.platinum.count,
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
    platinumUnlocked,
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
    platinumPerSecond: resources.platinum.perSecond,
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

export function saveGame() {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.setItem("idleMinerSave", JSON.stringify(getSaveData()));
    console.log("Game saved at", new Date().toLocaleTimeString());
    if (gameStarted) {
      const toggleAutoSave = document.getElementById("toggle-auto-save");
      if (toggleAutoSave?.checked) {
        showAutoSaveIndicator();
        setTimeout(hideAutoSaveIndicator, 1000);
      }
    }
    return true;
  } catch (e) {
    console.error("Failed to save game:", e);
    return false;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// OFFLINE REWARDS SYSTEM
// ───────────────────────────────────────────────────────────────────────────

function getResourceSellPrice(resId) {
  return resources[resId].sellPrice;
}

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
      }
    }
  });

  if (hasRewards) {
    // Apply offline rewards
    Object.entries(offlineRewards).forEach(([resId, reward]) => {
      resources[resId].count += reward.mined;
      stats.mined[resId] += reward.mined;
    });

    resources.money.count += totalMoneyEarned;
    stats.earnedMoney += totalMoneyEarned;

    // Show offline rewards modal
    showOfflineRewardsModal(offlineRewards, totalMoneyEarned, rewardTime);
  }
}

function showOfflineRewardsModal(rewards, totalMoney, timeOffline) {
  const hours = Math.floor(timeOffline / 3600);
  const minutes = Math.floor((timeOffline % 3600) / 60);
  
  let timeString = '';
  if (hours > 0) {
    timeString = `${hours}h ${minutes}m`;
  } else {
    timeString = `${minutes}m`;
  }

  let rewardsList = '';
  Object.entries(rewards).forEach(([resId, reward]) => {
    const resourceName = resId.charAt(0).toUpperCase() + resId.slice(1);
    rewardsList += `<li><strong>${resourceName}:</strong> ${reward.mined.toFixed(1)} mined (+$${reward.money.toFixed(0)})</li>`;
  });

  modalSystem.createModal({
    title: "Welcome Back!",
    message: `
      <div class="offline-rewards-modal">
        <p><strong>You were offline for ${timeString}</strong></p>
        <p>While you were away, your mining operation continued at 10% efficiency:</p>
        <ul class="offline-rewards-list">
          ${rewardsList}
        </ul>
        <div class="offline-total">
          <strong>Total Money Earned: $${totalMoney.toFixed(0)}</strong>
        </div>
        <p class="offline-tip">💡 Tip: Keep your mining operation running for passive income!</p>
      </div>
    `,
    type: "info",
    icon: "💰",
    buttons: [
      {
        text: "Collect Rewards",
        class: "primary",
        callback: () => {
          // Rewards already applied, just close modal
        },
      },
    ],
  });
}

// ───────────────────────────────────────────────────────────────────────────
// LOAD SYSTEM
// ───────────────────────────────────────────────────────────────────────────

export function loadGame() {
  if (!isLocalStorageAvailable()) return false;
  try {
    const raw = localStorage.getItem("idleMinerSave");
    if (!raw) return false;
    const data = JSON.parse(raw);

    // Check if save should be reset due to version change
    if (shouldResetSave(data)) {
      console.log("Save reset triggered due to version change");
      localStorage.removeItem("idleMinerSave");
      localStorage.removeItem("idleMinerHighscore");

      // Show notification to user about the reset
      setTimeout(() => {
        modalSystem.showAlert(
          "Save Reset",
          `Your save has been reset due to a major game update (v${GAME_VERSION}). This ensures compatibility with new features and improvements.`
        );
      }, 1000);

      return false; // No save to load after reset
    }

    // Load resource counts
    resources.iron.count = data.iron || 0;
    resources.copper.count = data.copper || 0;
    resources.nickel.count = data.nickel || 0;
    resources.bronze.count = data.bronze || 0;
    resources.silver.count = data.silver || 0;
    resources.cobalt.count = data.cobalt || 0;
    resources.gold.count = data.gold || 0;
    resources.palladium.count = data.palladium || 0;
    resources.platinum.count = data.platinum || 0;
    resources.titanium.count = data.titanium || 0;
    resources.adamantium.count = data.adamantium || 0;
    resources.money.count = data.money || 0;
    resources.coreShards.count = data.coreShards || 0;

    // Load unlock states
    setUnlockState("copper", !!data.copperUnlocked);
    setUnlockState("nickel", !!data.nickelUnlocked);
    setUnlockState("bronze", !!data.bronzeUnlocked);
    setUnlockState("silver", !!data.silverUnlocked);
    setUnlockState("cobalt", !!data.cobaltUnlocked);
    setUnlockState("gold", !!data.goldUnlocked);
    setUnlockState("palladium", !!data.palladiumUnlocked);
    setUnlockState("platinum", !!data.platinumUnlocked);
    setUnlockState("titanium", !!data.titaniumUnlocked);
    setUnlockState("adamantium", !!data.adamantiumUnlocked);

    // Restore collapse states BEFORE unlocking resources
    if (data.collapseStates) {
      RES_IDS.forEach((res) => {
        try {
          const collapsed = data.collapseStates[res];
          localStorage.setItem(`panel-collapsed-${res}`, collapsed ? "1" : "0");
        } catch {}
      });
    }

    // Apply unlock UI states (without expanding panels to preserve collapse states)
    RES_IDS.forEach((resId) => {
      if (resId !== 'iron') {
        const unlocked = data[`${resId}Unlocked`];
        if (unlocked) {
          unlockResourceUI(resId, false); // Don't expand panels
        } else {
          // Relock the resource
          const panel = document.querySelector(`[data-resource='${resId}']`);
          const lockOverlay = document.getElementById(`lock-overlay-${resId}`);
          if (panel) {
            panel.classList.add('locked', 'collapsed');
          }
          if (lockOverlay) {
            lockOverlay.style.display = 'block';
          }
        }
      }
    });

    // Load per-second rates
    if (data.ironPerSecond !== undefined) resources.iron.perSecond = data.ironPerSecond;
    if (data.copperPerSecond !== undefined) resources.copper.perSecond = data.copperPerSecond;
    if (data.nickelPerSecond !== undefined) resources.nickel.perSecond = data.nickelPerSecond;
    if (data.bronzePerSecond !== undefined) resources.bronze.perSecond = data.bronzePerSecond;
    if (data.silverPerSecond !== undefined) resources.silver.perSecond = data.silverPerSecond;
    if (data.cobaltPerSecond !== undefined) resources.cobalt.perSecond = data.cobaltPerSecond;
    if (data.goldPerSecond !== undefined) resources.gold.perSecond = data.goldPerSecond;
    if (data.palladiumPerSecond !== undefined) resources.palladium.perSecond = data.palladiumPerSecond;
    if (data.platinumPerSecond !== undefined) resources.platinum.perSecond = data.platinumPerSecond;
    if (data.titaniumPerSecond !== undefined) resources.titanium.perSecond = data.titaniumPerSecond;
    if (data.adamantiumPerSecond !== undefined) resources.adamantium.perSecond = data.adamantiumPerSecond;

    // Calculate and apply offline rewards AFTER perSecond values are loaded
    calculateOfflineRewards(data);

    // Load shop upgrades
    if (Array.isArray(data.upgrades)) {
      const items = ensureShopItemsInitialized();
      data.upgrades.forEach((u) => {
        const item = items.find((i) => i.id === u.id);
        if (item && u.count >= 0) {
          item.count = u.count;
          item.price = u.price ?? Math.floor(item.basePrice * Math.pow(item.scale, item.count));
        }
      });
    }

    // Load statistics
    if (data.stats) {
      stats.earnedMoney = data.stats.earnedMoney ?? stats.earnedMoney;
      stats.spentMoney = data.stats.spentMoney ?? stats.spentMoney;
      Object.assign(stats.mined, data.stats.mined || {});
      Object.assign(stats.sold, data.stats.sold || {});
      Object.assign(stats.clicks, data.stats.clicks || {});
    }

    // Load prestige data
    if (data.totalPrestiges !== undefined) {
      setTotalPrestiges(data.totalPrestiges);
    }
    if (data.prestigeUnlocked !== undefined) {
      setPrestigeUnlocked(data.prestigeUnlocked);
    }
    if (data.coreUpgrades || data.forgeCoreUpgrades) {
      // Support both old and new format for backward compatibility
      const upgradeData = data.coreUpgrades || data.forgeCoreUpgrades;
      Object.entries(upgradeData).forEach(([key, saveData]) => {
        if (coreUpgrades[key] && saveData.level !== undefined) {
          setCoreUpgradeLevel(key, saveData.level);
        }
      });
    }

    // Re-init autosellers with random timing variation to prevent synchronization
    const items = ensureShopItemsInitialized();
    items
      .filter((i) => i.id.endsWith("-autoseller") && i.count > 0)
      .forEach((item, index) => {
        const resId = item.category;
        const randomDelay = Math.random() * 5000; // 0-5s random delay
        setTimeout(() => {
          import('./resources.js').then(({ startAutoSell }) => {
            startAutoSell && startAutoSell(resId);
          });
        }, randomDelay);
      });

    console.log("Game loaded successfully");
    
    // Apply milestone rewards and update UI
    applyMilestoneRewards();
    
    // Import and update various UI elements
    import('./core.js').then(({ checkPrestigeUnlock, updatePrestigeUI, updateCoreUI }) => {
      checkPrestigeUnlock && checkPrestigeUnlock();
      updatePrestigeUI && updatePrestigeUI();
      updateCoreUI && updateCoreUI();
    });
    
    import('./stats.js').then(({ updateStatsUI }) => {
      updateStatsUI && updateStatsUI();
    });

    return true;
  } catch (e) {
    console.error("Failed to load game:", e);
    return false;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// AUTO-SAVE SYSTEM
// ───────────────────────────────────────────────────────────────────────────

export function startAutoSave() {
  stopAutoSave();
  if (!isLocalStorageAvailable()) return;
  autoSaveInterval = setInterval(() => {
    if (gameStarted) saveGame();
  }, 60000);
  window.addEventListener("beforeunload", saveGame);
}

export function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
  window.removeEventListener("beforeunload", saveGame);
}

// ───────────────────────────────────────────────────────────────────────────
// SAVE VERSION INFO
// ───────────────────────────────────────────────────────────────────────────

export function getSaveVersionInfo() {
  if (!isLocalStorageAvailable()) return { hasSave: false };

  try {
    const raw = localStorage.getItem("idleMinerSave");
    if (!raw) return { hasSave: false };

    const data = JSON.parse(raw);
    return {
      hasSave: true,
      savedVersion: data.gameVersion || "unknown",
      currentVersion: GAME_VERSION,
      resetEnabled: RESET_SAVES_ON_VERSION_CHANGE,
      wouldReset: shouldResetSave(data),
    };
  } catch (e) {
    return { hasSave: false, error: e.message };
  }
}

// ───────────────────────────────────────────────────────────────────────────
// SAVE CARD UPDATE
// ───────────────────────────────────────────────────────────────────────────

export function updateSaveCard() {
  if (!isLocalStorageAvailable()) return;

  const saveCard = document.getElementById("save-card");
  const saveMoney = document.getElementById("save-money");
  const saveUnlocks = document.getElementById("save-unlocks");
  const btnContinue = document.getElementById("btn-continue");

  try {
    const raw = localStorage.getItem("idleMinerSave");
    if (raw && saveCard && saveMoney && saveUnlocks && btnContinue) {
      const data = JSON.parse(raw);
      
      // Show save card
      saveCard.classList.remove("hidden");
      btnContinue.disabled = false;
      
      // Update money display
      const money = data.money || 0;
      saveMoney.textContent = `$${fmt(money)}`;
      
      // Find highest unlocked resource
      const unlockOrder = ['Iron', 'Copper', 'Nickel', 'Bronze', 'Silver', 'Cobalt', 'Gold', 'Palladium', 'Platinum', 'Titanium', 'Adamantium'];
      let highestUnlock = 'Iron';
      
      RES_IDS.forEach((resId, index) => {
        if (data[`${resId}Unlocked`]) {
          highestUnlock = unlockOrder[index + 1] || highestUnlock;
        }
      });
      
      saveUnlocks.textContent = highestUnlock;
    } else {
      // No save found
      if (saveCard) saveCard.classList.add("hidden");
      if (btnContinue) btnContinue.disabled = true;
    }
  } catch (e) {
    console.error("Failed to update save card:", e);
    if (saveCard) saveCard.classList.add("hidden");
    if (btnContinue) btnContinue.disabled = true;
  }
}

// Helper function for formatting
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