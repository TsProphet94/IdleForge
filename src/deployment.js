// ───────────────────────────────────────────────────────────────────────────
// DEPLOYMENT UTILITIES
// ───────────────────────────────────────────────────────────────────────────

import { modalSystem } from './modalSystem.js';
import { fmt } from './helpers.js';
import { resources, stats } from './dataModel.js';

// 🚨 DEPLOYMENT SETTINGS - Update these for each release
const GAME_VERSION = "1.0.0";
const RESET_SAVES_ON_VERSION_CHANGE = false; // Set to true for major updates

// Version comparison helper
function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part > v2part) return 1;
    if (v1part < v2part) return -1;
  }
  return 0;
}

// Check if save should be reset based on version
function shouldResetSave() {
  if (!RESET_SAVES_ON_VERSION_CHANGE) return false;
  
  const savedVersion = localStorage.getItem("idleForgeVersion");
  if (!savedVersion) return false;
  
  return compareVersions(GAME_VERSION, savedVersion) > 0;
}

// Get save version information for debugging
function getSaveVersionInfo() {
  return {
    currentVersion: GAME_VERSION,
    savedVersion: localStorage.getItem("idleForgeVersion"),
    shouldReset: shouldResetSave(),
    resetEnabled: RESET_SAVES_ON_VERSION_CHANGE
  };
}

// Developer console commands for version management
window.DEPLOYMENT_SAVE_WIPE = {
  // 🚨 MAIN RESET FUNCTION - Use this for major updates
  resetAllSaves: () => {
    if (typeof Storage !== "undefined") {
      localStorage.removeItem("idleMinerSave");
      localStorage.removeItem("idleMinerHighscore");
      localStorage.removeItem("idleforge-theme");
      localStorage.removeItem("idleForgeVersion");
      // Clear any panel collapsed states
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("panel-collapsed-")) {
          localStorage.removeItem(key);
        }
      });
      console.log("🔥 DEPLOYMENT SAVE WIPE COMPLETE - All saves reset");
      console.log("💡 Reload the page to start fresh");
      return true;
    }
    return false;
  },

  // 📊 Check what would be reset
  checkSaveState: () => {
    const saves = {
      mainSave: !!localStorage.getItem("idleMinerSave"),
      highscore: !!localStorage.getItem("idleMinerHighscore"),
      theme: !!localStorage.getItem("idleforge-theme"),
      version: localStorage.getItem("idleForgeVersion"),
      panelStates: Object.keys(localStorage).filter((k) =>
        k.startsWith("panel-collapsed-")
      ).length,
    };
    console.log("📊 Current save state:", saves);
    return saves;
  },

  // 🔧 Reset specific save data
  resetMainSave: () => {
    localStorage.removeItem("idleMinerSave");
    console.log("🗑️ Main save data cleared");
  },

  resetHighscore: () => {
    localStorage.removeItem("idleMinerHighscore");
    console.log("🗑️ Highscore data cleared");
  },

  resetTheme: () => {
    localStorage.removeItem("idleforge-theme");
    console.log("🗑️ Theme preference cleared");
  },

  // 📈 Version commands
  getCurrentVersion: () => GAME_VERSION,
  getSavedVersion: () => localStorage.getItem("idleForgeVersion"),
  updateVersion: () => {
    localStorage.setItem("idleForgeVersion", GAME_VERSION);
    console.log(`📋 Version updated to ${GAME_VERSION}`);
  }
};

// 🚨 FOR DEPLOYMENTS: Use DEPLOYMENT_SAVE_WIPE functions above for major updates
// Quick access aliases for deployment
window.resetSaves = window.DEPLOYMENT_SAVE_WIPE.resetAllSaves;
window.checkSaves = window.DEPLOYMENT_SAVE_WIPE.checkSaveState;
window.updateVersion = window.DEPLOYMENT_SAVE_WIPE.updateVersion;

// Offline rewards system - gives 10% of online mining rate
function calculateOfflineRewards(offlineTimeMs) {
  const offlineTimeSeconds = Math.min(offlineTimeMs / 1000, 86400); // Cap at 24 hours
  const offlineEfficiency = 0.1; // 10% of online rate
  
  const totalRewards = {};
  
  // Calculate rewards for each unlocked resource
  if (window.RES_IDS && window.isUnlocked && window.milestoneMultipliers) {
    window.RES_IDS.forEach((resId) => {
      if (window.isUnlocked(resId) && resources[resId]) {
        const baseRate = resources[resId].perSecond || 0;
        const multiplier = window.milestoneMultipliers[resId] || 1;
        const offlineGain = baseRate * multiplier * offlineEfficiency * offlineTimeSeconds;
        
        if (offlineGain > 0) {
          totalRewards[resId] = offlineGain;
          // Apply the rewards
          resources[resId].count += offlineGain;
          stats.mined[resId] += offlineGain;
        }
      }
    });
  }
  
  return totalRewards;
}

// Show offline rewards modal
function showOfflineRewardsModal(offlineTime, totalRewards) {
  modalSystem.showOfflineRewards(offlineTime, totalRewards);
}

// Service Worker Update Management
function handleServiceWorkerUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      modalSystem.showServiceWorkerUpdate();
    });
  }
}

// Initialize deployment utilities
function initializeDeployment() {
  // Log version information for deployment monitoring
  console.log(
    `IdleForge v${GAME_VERSION} - Save reset: ${
      RESET_SAVES_ON_VERSION_CHANGE ? "ENABLED" : "DISABLED"
    }`
  );
  
  // Update version in localStorage
  localStorage.setItem("idleForgeVersion", GAME_VERSION);
  
  // Initialize service worker update handling
  handleServiceWorkerUpdate();
}

export {
  GAME_VERSION,
  RESET_SAVES_ON_VERSION_CHANGE,
  compareVersions,
  shouldResetSave,
  getSaveVersionInfo,
  calculateOfflineRewards,
  showOfflineRewardsModal,
  handleServiceWorkerUpdate,
  initializeDeployment
};