// Storage and persistence module
import { resources, RES_IDS, shopItems, stats } from './data.js';
import { unlockState, coreUpgrades, autoSaveInterval, gameStarted } from './state.js';

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

  set(key, value, batchMode = false) {
    if (!this.isAvailable) return;
    
    if (batchMode) {
      this.batchedWrites.set(key, value);
      this.scheduleBatchFlush();
    } else {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn(`Failed to save ${key}:`, e);
      }
    }
  }

  scheduleBatchFlush() {
    if (this.flushTimeout) return;
    this.flushTimeout = setTimeout(() => {
      this.flushBatch();
    }, 100);
  }

  flushBatch() {
    if (!this.batchedWrites.size) return;
    
    try {
      for (const [key, value] of this.batchedWrites) {
        localStorage.setItem(key, value);
      }
      this.batchedWrites.clear();
    } catch (e) {
      console.warn("Batch flush failed:", e);
    } finally {
      this.flushTimeout = null;
    }
  }

  remove(key) {
    if (!this.isAvailable) return;
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}

export const storageManager = new LocalStorageManager();

// Game constants
const GAME_VERSION = "0.1.36";
const RESET_SAVES_ON_VERSION_CHANGE = false;

// Check if localStorage is available
export function isLocalStorageAvailable() {
  return storageManager.isAvailable;
}

// Get current save data
export function getSaveData() {
  return {
    version: GAME_VERSION,
    timestamp: Date.now(),
    resources: { ...resources },
    unlockState: { ...unlockState },
    coreUpgrades: { ...coreUpgrades },
    stats: { ...stats },
    shopItems: { ...shopItems },
    totalPrestiges: window.totalPrestiges || 0,
    prestigeUnlocked: window.prestigeUnlocked || false,
    gameStarted: gameStarted
  };
}

// Compare version strings
function compareVersions(version1, version2) {
  const v1Parts = version1.split('.').map(n => parseInt(n, 10));
  const v2Parts = version2.split('.').map(n => parseInt(n, 10));
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }
  return 0;
}

// Check if save should be reset
function shouldResetSave(saveData) {
  if (!RESET_SAVES_ON_VERSION_CHANGE) return false;
  
  const saveVersion = saveData?.version || "0.0.0";
  const currentVersion = GAME_VERSION;
  
  // Reset if current version is newer than save version
  return compareVersions(currentVersion, saveVersion) > 0;
}

// Calculate offline rewards
export function calculateOfflineRewards(saveData) {
  const now = Date.now();
  const lastSave = saveData.timestamp || now;
  const timeAway = Math.max(0, now - lastSave);
  
  if (timeAway < 60000) return null; // Less than 1 minute offline
  
  const hoursAway = timeAway / (1000 * 60 * 60);
  const maxHours = 24; // Cap at 24 hours
  const effectiveHours = Math.min(hoursAway, maxHours);
  
  const rewards = {};
  let totalMoney = 0;
  
  // Calculate offline mining for each unlocked resource
  RES_IDS.forEach(resId => {
    if (unlockState[resId] && resources[resId].autoRate > 0) {
      const autoMined = Math.floor(resources[resId].autoRate * effectiveHours * 3600);
      const autoSold = Math.floor(autoMined * 0.8); // Assume 80% is sold
      const moneyGained = autoSold * resources[resId].sellPrice;
      
      rewards[resId] = { mined: autoMined, sold: autoSold, money: moneyGained };
      totalMoney += moneyGained;
    }
  });
  
  return {
    timeAway: Math.floor(timeAway / 1000), // in seconds
    hoursAway: Math.floor(hoursAway * 10) / 10, // rounded to 1 decimal
    effectiveHours: Math.floor(effectiveHours * 10) / 10,
    rewards,
    totalMoney
  };
}

// Save game
export function saveGame() {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.setItem("idleMinerSave", JSON.stringify(getSaveData()));
    console.log("Game saved at", new Date().toLocaleTimeString());
    
    // Show auto-save indicator if enabled
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

// Load game
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
      const modalSystem = window.modalSystem;
      if (modalSystem) {
        setTimeout(() => {
          modalSystem.showAlert(
            "Save Reset",
            `Your save has been reset due to a major game update (v${GAME_VERSION}). This ensures compatibility with new features and improvements.`
          );
        }, 1000);
      }
      return false;
    }

    // Load resources
    if (data.resources) {
      Object.keys(data.resources).forEach(key => {
        if (resources[key]) {
          Object.assign(resources[key], data.resources[key]);
        }
      });
    }

    // Load unlock state
    if (data.unlockState) {
      Object.assign(unlockState, data.unlockState);
    }

    // Load core upgrades
    if (data.coreUpgrades) {
      Object.assign(coreUpgrades, data.coreUpgrades);
    }

    // Load stats
    if (data.stats) {
      Object.assign(stats, data.stats);
    }

    // Load shop items
    if (data.shopItems) {
      Object.assign(shopItems, data.shopItems);
    }

    // Load prestige data
    if (typeof data.totalPrestiges === 'number') {
      window.totalPrestiges = data.totalPrestiges;
    }
    if (typeof data.prestigeUnlocked === 'boolean') {
      window.prestigeUnlocked = data.prestigeUnlocked;
    }

    console.log("Game loaded successfully");
    return true;
  } catch (e) {
    console.error("Failed to load game:", e);
    return false;
  }
}

// Auto-save functionality
let currentAutoSaveInterval = null;

export function startAutoSave() {
  stopAutoSave();
  if (!isLocalStorageAvailable()) return;
  
  currentAutoSaveInterval = setInterval(() => {
    if (gameStarted) saveGame();
  }, 60000); // Save every minute
  
  window.addEventListener("beforeunload", saveGame);
}

export function stopAutoSave() {
  if (currentAutoSaveInterval) {
    clearInterval(currentAutoSaveInterval);
    currentAutoSaveInterval = null;
  }
  window.removeEventListener("beforeunload", saveGame);
}

// Auto-save indicator functions
function showAutoSaveIndicator() {
  const indicator = document.getElementById("save-indicator");
  if (indicator) {
    indicator.style.opacity = "1";
    indicator.style.transform = "translateY(0)";
  }
}

function hideAutoSaveIndicator() {
  const indicator = document.getElementById("save-indicator");
  if (indicator) {
    indicator.style.opacity = "0";
    indicator.style.transform = "translateY(-10px)";
  }
}

// Developer functions (for console access)
export function resetSaves() {
  if (!confirm("Are you sure you want to reset ALL save data? This cannot be undone!")) {
    return;
  }
  
  localStorage.removeItem("idleMinerSave");
  localStorage.removeItem("idleMinerHighscore");
  console.log("All saves cleared!");
}

export function resetAndReload() {
  resetSaves();
  location.reload();
}

// Make functions globally available for console access
window.resetSaves = resetSaves;
window.resetAndReload = resetAndReload;
