// ───────────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ───────────────────────────────────────────────────────────────────────────

import { gameState, RES_IDS, isUnlocked } from './dataModel.js';
import { 
  mainMenu, 
  settingsMenu, 
  gameUI, 
  btnContinue, 
  btnNewGame,
  btnSettings,
  btnBackToMenu,
  toggleAutoSave,
  btnSaveMenu,
  confirmModal,
  btnConfirmYes,
  btnConfirmNo,
  mainTab,
  milestonesTab,
  prestigeTab
} from './uiElements.js';
import { initializeThemeSwitcher } from './themeSwitcher.js';
import { isLocalStorageAvailable } from './helpers.js';
import { storageManager } from './storageManager.js';
import { attemptUnlock, relockResource } from './unlocking.js';
import { initializeShopEventListeners, showScreen, switchResource } from './shop.js';
import { startGameLoop, stopGameLoop, initializeThrottledOperations } from './gameLoop.js';
import { initializeDeployment, getSaveVersionInfo, shouldResetSave } from './deployment.js';
import { updatePrestigeUI, checkPrestigeUnlock } from './prestige.js';
import { updateMilestoneList, updateStatsUI } from './statsMilestones.js';

let autoSaveInterval;

// Start game function
function startGame() {
  // Initialize shop items if not already done
  if (window.ensureShopItemsInitialized) {
    window.ensureShopItemsInitialized();
  }

  mainMenu.style.display = "none";
  settingsMenu.style.display = "none";
  gameUI.style.display = "flex";
  gameState.gameStarted = true;

  const bgMusic = document.getElementById("bg-music");
  if (bgMusic) {
    bgMusic.volume = 0.5;
    bgMusic
      .play()
      .catch((err) => console.warn("Background music failed:", err));
  }

  if (window.updateUI) window.updateUI();
  updateStatsUI();
  updatePrestigeUI(); // Ensure prestige elements are properly hidden on start
  switchResource(gameState.currentResource);

  // Ensure shop is rendered
  if (window.renderShop) window.renderShop();

  showScreen("mine");

  // Start optimized game loop
  startGameLoop();

  if (toggleAutoSave?.checked) startAutoSave();
}

// Start new game function
function startNewGame() {
  // Stop all timers and reset game state
  stopGameLoop();
  stopAutoSave();

  // Reset game state variables
  gameState.copperUnlocked = false;
  gameState.nickelUnlocked = false;
  gameState.bronzeUnlocked = false;
  gameState.silverUnlocked = false;
  gameState.cobaltUnlocked = false;
  gameState.goldUnlocked = false;
  gameState.palladiumUnlocked = false;
  gameState.platinumUnlocked = false;
  gameState.titaniumUnlocked = false;
  gameState.adamantiumUnlocked = false;
  gameState.prestigeUnlocked = false;
  gameState.currentResource = "iron";

  // Reset resources and stats (this would need to be implemented properly)
  if (window.resetGameData) window.resetGameData();

  // Relock all resources except iron
  const lockedResources = [
    "copper", "nickel", "bronze", "silver", "cobalt", 
    "gold", "palladium", "platinum", "titanium", "adamantium"
  ];
  lockedResources.forEach(relockResource);

  updatePrestigeUI();
}

// Auto-save functions
function startAutoSave() {
  stopAutoSave();
  if (!isLocalStorageAvailable()) return;
  autoSaveInterval = setInterval(() => {
    if (gameState.gameStarted && window.saveGame) window.saveGame();
  }, 60000);
  window.addEventListener("beforeunload", () => {
    if (window.saveGame) window.saveGame();
  });
}

function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

// Save/load functions (simplified)
function saveGame() {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    const saveData = {
      gameState,
      resources: window.resources,
      stats: window.stats,
      shopItems: window.shopItems,
      milestoneRewardsApplied: window.milestoneRewardsApplied,
      milestoneMultipliers: window.milestoneMultipliers,
      totalPrestiges: window.totalPrestiges,
      coreUpgrades: window.coreUpgrades,
      lastSaveTime: Date.now()
    };
    
    storageManager.setImmediate("idleMinerSave", JSON.stringify(saveData));
    return true;
  } catch (e) {
    console.error("Failed to save game:", e);
    return false;
  }
}

function loadGame() {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    const saveData = JSON.parse(storageManager.get("idleMinerSave"));
    if (!saveData) return false;
    
    // Load game state
    Object.assign(gameState, saveData.gameState);
    if (window.resources) Object.assign(window.resources, saveData.resources);
    if (window.stats) Object.assign(window.stats, saveData.stats);
    
    // Handle offline rewards if needed
    if (saveData.lastSaveTime) {
      const offlineTime = Date.now() - saveData.lastSaveTime;
      if (offlineTime > 60000) { // More than 1 minute offline
        if (window.calculateOfflineRewards && window.showOfflineRewardsModal) {
          const rewards = window.calculateOfflineRewards(offlineTime);
          if (Object.keys(rewards).length > 0) {
            window.showOfflineRewardsModal(offlineTime / 1000, rewards);
          }
        }
      }
    }
    
    return true;
  } catch (e) {
    console.error("Failed to load game:", e);
    return false;
  }
}

// Make functions globally available
window.saveGame = saveGame;
window.loadGame = loadGame;
window.startGame = startGame;
window.startNewGame = startNewGame;

// DOMContentLoaded initialization
function initializeGame() {
  // Initialize deployment utilities
  initializeDeployment();

  // Initialize theme switcher
  initializeThemeSwitcher();

  // Initialize throttled operations
  initializeThrottledOperations();

  // Initialize shop event listeners
  initializeShopEventListeners();

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
        if (window.updatePrestigeTab) window.updatePrestigeTab();
      }
    });
  });

  // 3. Initial Save State Check
  const hasSave = isLocalStorageAvailable() && !!localStorage.getItem("idleMinerSave");

  // Log version information for deployment monitoring
  if (hasSave) {
    const versionInfo = getSaveVersionInfo();
    console.log("Save version info:", versionInfo);
    
    // Check if save should be reset
    if (shouldResetSave()) {
      console.log("🔄 Resetting save due to version change");
      window.DEPLOYMENT_SAVE_WIPE?.resetAllSaves();
    }
  }

  if (btnContinue) btnContinue.disabled = !hasSave;
  if (gameUI) gameUI.style.display = "none";
  if (mainMenu) mainMenu.style.display = "flex";
  gameState.gameStarted = false;

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
    "copper", "nickel", "bronze", "silver", "cobalt",
    "gold", "palladium", "platinum", "titanium", "adamantium"
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
    "copper", "nickel", "bronze", "silver", "cobalt",
    "gold", "palladium", "platinum", "titanium", "adamantium"
  ];

  unlockResources.forEach((res) => {
    const btn = document.getElementById(`unlock-${res}-btn`);
    if (btn) {
      btn.addEventListener("click", () => attemptUnlock(res));
    }
  });

  // 7. Menu button event listeners
  if (btnContinue) {
    btnContinue.addEventListener("click", () => {
      if (loadGame()) {
        startGame();
      }
    });
  }

  if (btnNewGame) {
    btnNewGame.addEventListener("click", () => {
      if (confirmModal) {
        confirmModal.classList.remove("hidden");
      } else {
        startNewGame();
        startGame();
      }
    });
  }

  if (btnConfirmYes) {
    btnConfirmYes.addEventListener("click", () => {
      if (confirmModal) confirmModal.classList.add("hidden");
      startNewGame();
      startGame();
    });
  }

  if (btnConfirmNo) {
    btnConfirmNo.addEventListener("click", () => {
      if (confirmModal) confirmModal.classList.add("hidden");
    });
  }

  if (btnSettings) {
    btnSettings.addEventListener("click", () => {
      mainMenu.style.display = "none";
      settingsMenu.style.display = "flex";
    });
  }

  if (btnBackToMenu) {
    btnBackToMenu.addEventListener("click", () => {
      settingsMenu.style.display = "none";
      mainMenu.style.display = "flex";
    });
  }

  if (toggleAutoSave) {
    toggleAutoSave.addEventListener("change", (e) => {
      if (e.target.checked) {
        if (gameState.gameStarted) {
          startAutoSave();
          if (saveGame() && btnContinue) btnContinue.disabled = false;
        }
      } else {
        stopAutoSave();
      }
    });
  }

  if (btnSaveMenu) {
    btnSaveMenu.addEventListener("click", () => {
      if (saveGame()) {
        if (btnContinue) btnContinue.disabled = false;
      } else {
        alert("Failed to save game. Please check browser settings.");
      }
      if (gameUI) gameUI.style.display = "none";
      if (mainMenu) mainMenu.style.display = "flex";
      gameState.gameStarted = false;

      // Clean up to prevent memory leaks
      stopGameLoop();
      stopAutoSave();
    });
  }
}

export {
  initializeGame,
  startGame,
  startNewGame,
  startAutoSave,
  stopAutoSave,
  saveGame,
  loadGame
};