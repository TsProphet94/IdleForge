// js/init.js - Bootstrap the game and initialize all modules
import { ensureShopItemsInitialized, setGameStarted } from './data.js';
import { UI_ELEMENTS, setTheme, showScreen, storageManager } from './ui.js';
import { isUnlocked } from './resources.js';
import { initShopEventHandlers } from './shop.js';
import { initStatsTabHandlers } from './stats.js';
import { initPrestigeHandlers, updatePrestigeUI } from './core.js';
import { loadGame, saveGame, startAutoSave, stopAutoSave, updateSaveCard } from './storage.js';

// ───────────────────────────────────────────────────────────────────────────
// VERSION & DEPLOYMENT INFO
// ───────────────────────────────────────────────────────────────────────────

const GAME_VERSION = "0.1.37";
console.log(`🎯 VERSION CONTROL: Game v${GAME_VERSION} | Save Reset: DISABLED`);
console.log('🔧 IdleForgeDebug loaded - For deployments use: resetSaves() or DEPLOYMENT_SAVE_WIPE');

// ───────────────────────────────────────────────────────────────────────────
// PWA & SERVICE WORKER REGISTRATION
// ───────────────────────────────────────────────────────────────────────────

let currentVersion = GAME_VERSION;

// Load version from version.txt
fetch("./version.txt")
  .then((response) => response.text())
  .then((txt) => {
    currentVersion = txt.trim();
    const versionEl = document.getElementById("version");
    if (versionEl) versionEl.textContent = currentVersion;

    // Send version to service worker if available
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SET_VERSION",
        version: currentVersion,
      });
    }
  })
  .catch(() => {});

// Service Worker Update Management
if ("serviceWorker" in navigator) {
  let updateAvailable = false;
  let registration = null;

  // Register service worker
  navigator.serviceWorker
    .register("./sw.js")
    .then((reg) => {
      registration = reg;
      console.log("SW: Registered successfully");

      // Send version to service worker immediately after registration
      if (currentVersion && reg.active) {
        reg.active.postMessage({
          type: "SET_VERSION",
          version: currentVersion,
        });
      }

      // Listen for updates
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        // Skip waiting immediately for critical updates
        if (newWorker.state === "installed" && !navigator.serviceWorker.controller) {
          // First install, skip waiting to activate immediately
          newWorker.postMessage({ type: "SKIP_WAITING" });
        }

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log("SW: Update ready");
            updateAvailable = true;
            showUpdateNotification("ready");
          }
        });
      });
    })
    .catch((err) => {
      console.log("SW: Registration failed", err);
    });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "UPDATE_APPLIED") {
      console.log("SW: Update applied, reloading...");
      showUpdateNotification("applied");
      // Small delay to show the message, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });

  function showUpdateNotification(status) {
    const updateDiv = document.querySelector('.update-notification') || createUpdateNotification();
    
    if (status === "ready") {
      updateDiv.innerHTML = `
        <span>📥</span>
        <span>Update available! <a href="#" onclick="applyUpdate()">Apply now</a></span>
      `;
      updateDiv.style.display = 'flex';
    } else if (status === "applied") {
      updateDiv.innerHTML = `
        <span>✓</span>
        <span>Update applied! Reloading...</span>
      `;
    }
  }

  function createUpdateNotification() {
    const div = document.createElement('div');
    div.className = 'update-notification';
    div.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      display: none;
      align-items: center;
      gap: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;
    document.body.appendChild(div);
    return div;
  }

  window.applyUpdate = function() {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };
}

// ───────────────────────────────────────────────────────────────────────────
// CHANGELOG LOADING
// ───────────────────────────────────────────────────────────────────────────

fetch("./changelog.txt")
  .then((response) => response.text())
  .then((text) => {
    const changelogDiv = document.getElementById("changelog");
    if (changelogDiv) {
      // Convert changelog text to HTML with basic formatting
      const htmlContent = text
        .split('\n')
        .map(line => {
          if (line.startsWith('v') && line.includes('–')) {
            return `<p><strong>${line}</strong></p>`;
          } else if (line.startsWith('•')) {
            return `<p>${line}</p>`;
          } else if (line.trim() === '' || line.includes('---')) {
            return '<p></p>';
          } else {
            return `<p>${line}</p>`;
          }
        })
        .join('');
      changelogDiv.innerHTML = htmlContent;
    }
  })
  .catch(() => {
    const changelogDiv = document.getElementById("changelog");
    if (changelogDiv) {
      changelogDiv.innerHTML = "<p>Unable to load changelog.</p>";
    }
  });

// ───────────────────────────────────────────────────────────────────────────
// THEME MANAGEMENT
// ───────────────────────────────────────────────────────────────────────────

function initThemeSystem() {
  const themeSelect = document.getElementById("theme-select");
  if (!themeSelect) return;

  // Load saved theme
  const savedTheme = storageManager.get('selectedTheme') || 'classic';
  setTheme(savedTheme);
  themeSelect.value = savedTheme;

  // Handle theme changes
  themeSelect.addEventListener("change", (e) => {
    setTheme(e.target.value);
  });
}

// ───────────────────────────────────────────────────────────────────────────
// RESOURCE PANEL COLLAPSE SYSTEM
// ───────────────────────────────────────────────────────────────────────────

function initCollapsePanels() {
  document.querySelectorAll(".collapse-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const res = btn.getAttribute("data-res");
      const panel = document.querySelector(`.resource-panel[data-resource='${res}']`);
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
    const collapsed = storageManager.get(`panel-collapsed-${res}`) === "1";
    if (collapsed) {
      const panel = document.querySelector(`.resource-panel[data-resource='${res}']`);
      if (panel) panel.classList.add("collapsed");
    }
  });
}

// ───────────────────────────────────────────────────────────────────────────
// RESOURCE UNLOCK HANDLERS
// ───────────────────────────────────────────────────────────────────────────

function initUnlockHandlers() {
  const unlockResources = [
    "copper", "nickel", "bronze", "silver", "cobalt", "gold",
    "palladium", "platinum", "titanium", "adamantium",
  ];

  unlockResources.forEach((res) => {
    const btn = document.getElementById(`unlock-${res}-btn`);
    if (btn) {
      btn.addEventListener("click", () => attemptUnlock(res));
    }
  });
}

async function attemptUnlock(resId) {
  const { UNLOCK_COST, resources } = await import('./data.js');
  const { spendMoney, unlockResourceUI, setUnlockState } = await import('./resources.js');
  const { modalSystem } = await import('./ui.js');
  
  const cost = UNLOCK_COST[resId];
  if (!cost) return;

  if (resources.money.count < cost) {
    await modalSystem.showUnlockRequirement(
      resId.charAt(0).toUpperCase() + resId.slice(1),
      cost
    );
    return;
  }

  spendMoney(cost);
  setUnlockState(resId, true);
  unlockResourceUI(resId, true);
  
  // Update UI
  const { updateUI } = await import('./ui.js');
  const { updateStatsUI } = await import('./stats.js');
  const { updateShopFilter } = await import('./shop.js');
  
  updateUI && updateUI();
  updateStatsUI && updateStatsUI();
  updateShopFilter && updateShopFilter();
}

// ───────────────────────────────────────────────────────────────────────────
// TAB NAVIGATION
// ───────────────────────────────────────────────────────────────────────────

function initTabNavigation() {
  // Main navigation tabs
  if (UI_ELEMENTS.tabMine) {
    UI_ELEMENTS.tabMine.addEventListener("click", () => {
      showScreen(UI_ELEMENTS.screenMine);
    });
  }
  
  if (UI_ELEMENTS.tabShop) {
    UI_ELEMENTS.tabShop.addEventListener("click", () => {
      showScreen(UI_ELEMENTS.screenShop);
      // Preserve scroll position
      setTimeout(() => {
        const shopScrollY = parseInt(localStorage.getItem('shopScrollY') || '0');
        window.scrollTo(0, shopScrollY);
      }, 0);
    });
  }
  
  if (UI_ELEMENTS.tabStats) {
    UI_ELEMENTS.tabStats.addEventListener("click", () => {
      showScreen(UI_ELEMENTS.screenStats);
      const { updateStatsUI } = import('./stats.js');
      updateStatsUI.then(fn => fn && fn());
    });
  }
  
  if (UI_ELEMENTS.tabCore) {
    UI_ELEMENTS.tabCore.addEventListener("click", () => {
      showScreen(UI_ELEMENTS.screenCore);
      const { updateCoreUI } = import('./core.js');
      updateCoreUI.then(fn => fn && fn());
    });
  }

  // Save shop scroll position
  window.addEventListener('scroll', () => {
    if (!UI_ELEMENTS.screenShop?.classList.contains('hidden')) {
      localStorage.setItem('shopScrollY', window.scrollY.toString());
    }
  });
}

// ───────────────────────────────────────────────────────────────────────────  
// MENU BUTTON HANDLERS
// ───────────────────────────────────────────────────────────────────────────

function initMenuHandlers() {
  const btnContinue = document.getElementById("btn-continue");
  const btnNew = document.getElementById("btn-new");
  const btnSettings = document.getElementById("btn-settings");
  const btnBackToMenu = document.getElementById("btn-back-to-menu");
  const btnSaveMenu = document.getElementById("btn-save-menu");
  const toggleAutoSave = document.getElementById("toggle-auto-save");

  // Continue game
  if (btnContinue) {
    btnContinue.addEventListener("click", () => {
      if (loadGame()) {
        startGame();
      } else {
        alert("Failed to load save data. Starting new game.");
        startNewGame();
        startGame();
      }
    });
  }

  // New game with confirmation
  if (btnNew) {
    btnNew.addEventListener("click", () => {
      const confirmModal = document.getElementById("confirm-newgame-modal");
      if (confirmModal) {
        confirmModal.classList.remove("hidden");
      }
    });
  }

  // New game confirmation handlers
  const confirmYes = document.getElementById("confirm-newgame-yes");
  const confirmNo = document.getElementById("confirm-newgame-no");
  
  if (confirmYes) {
    confirmYes.addEventListener("click", () => {
      document.getElementById("confirm-newgame-modal")?.classList.add("hidden");
      startNewGame();
      startGame();
    });
  }
  
  if (confirmNo) {
    confirmNo.addEventListener("click", () => {
      document.getElementById("confirm-newgame-modal")?.classList.add("hidden");
    });
  }

  // Settings menu
  if (btnSettings) {
    btnSettings.addEventListener("click", () => {
      document.getElementById("main-menu").style.display = "none";
      document.getElementById("settings-menu").style.display = "flex";
    });
  }
  
  if (btnBackToMenu) {
    btnBackToMenu.addEventListener("click", () => {
      document.getElementById("settings-menu").style.display = "none";
      document.getElementById("main-menu").style.display = "flex";
    });
  }

  // Save and return to menu
  if (btnSaveMenu) {
    btnSaveMenu.addEventListener("click", () => {
      if (saveGame()) {
        updateSaveCard();
      } else {
        alert("Failed to save game. Please check browser settings.");
      }
      
      const gameUI = document.getElementById("game-ui");
      const mainMenu = document.getElementById("main-menu");
      
      if (gameUI) gameUI.style.display = "none";
      if (mainMenu) mainMenu.style.display = "flex";
      
      setGameStarted(false);
      stopGameLoop();
      stopAutoSave();
    });
  }

  // Auto-save toggle
  if (toggleAutoSave) {
    toggleAutoSave.addEventListener("change", (e) => {
      if (e.target.checked) {
        startAutoSave();
        if (saveGame()) {
          updateSaveCard();
        }
      } else {
        stopAutoSave();
      }
    });
  }
}

// ───────────────────────────────────────────────────────────────────────────
// GAME LIFECYCLE FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

async function startNewGame() {
  const { resources, stats, RES_IDS } = await import('./data.js');
  const { setUnlockState } = await import('./resources.js');
  const { milestoneMultipliers } = await import('./stats.js');
  const { setTotalPrestiges, setPrestigeUnlocked, setCoreUpgradeLevel, coreUpgrades } = await import('./core.js');

  // Reset all resources  
  Object.values(resources).forEach(res => {
    if (res.count !== undefined) res.count = 0;
    if (res.perClick !== undefined) res.perClick = 1;
    if (res.perSecond !== undefined) res.perSecond = 0;
  });

  // Reset unlock states (keep iron unlocked)
  RES_IDS.filter(id => id !== 'iron').forEach(resId => {
    setUnlockState(resId, false);
  });

  // Reset stats
  Object.keys(stats.mined).forEach(k => stats.mined[k] = 0);
  Object.keys(stats.sold).forEach(k => stats.sold[k] = 0);
  stats.earnedMoney = 0;
  stats.spentMoney = 0;
  stats.clicks = { mine: 0, sell: 0, shopBuy: 0, unlock: 0 };

  // Reset prestige system
  setPrestigeUnlocked(false);
  setTotalPrestiges(0);
  resources.coreShards.count = 0;

  // Reset Core upgrades
  Object.keys(coreUpgrades).forEach(upgradeId => {
    setCoreUpgradeLevel(upgradeId, 0);
  });

  // Reset milestone multipliers
  RES_IDS.forEach(res => {
    milestoneMultipliers[res] = 1;
  });

  // Reset shop items
  const items = ensureShopItemsInitialized();
  items.forEach(item => {
    item.count = 0;
    item.price = item.basePrice;
  });

  // Clear localStorage saves
  localStorage.removeItem("idleMinerSave");
  localStorage.removeItem("idleMinerHighscore");

  console.log("New game started - all data wiped");
}

async function startGame() {
  const { renderShop } = await import('./shop.js');
  const { updateStatsUI } = await import('./stats.js');
  const { updatePrestigeUI, updateCoreUI } = await import('./core.js');
  
  // Initialize shop items if not already done
  ensureShopItemsInitialized();

  const mainMenu = document.getElementById("main-menu");
  const settingsMenu = document.getElementById("settings-menu");
  const gameUI = document.getElementById("game-ui");

  if (mainMenu) mainMenu.style.display = "none";
  if (settingsMenu) settingsMenu.style.display = "none";
  if (gameUI) gameUI.style.display = "flex";
  
  setGameStarted(true);

  updateStatsUI();
  updatePrestigeUI();
  renderShop();
  
  showScreen(UI_ELEMENTS.screenMine);
  
  // Start game loop and auto-save
  startGameLoop();
  
  const toggleAutoSave = document.getElementById("toggle-auto-save");
  if (toggleAutoSave?.checked) startAutoSave();
}

// ───────────────────────────────────────────────────────────────────────────
// GAME LOOP
// ───────────────────────────────────────────────────────────────────────────

let gameLoopRunning = false;

async function startGameLoop() {
  if (gameLoopRunning) return;
  gameLoopRunning = true;
  
  const { gameStarted } = await import('./data.js');
  
  function gameLoop() {
    if (!gameStarted || !gameLoopRunning) return;
    
    // Auto-mining logic will be handled by imported modules
    const { handleAutoMining } = import('./resources.js');
    handleAutoMining.then(fn => fn && fn());
    
    // Schedule next frame
    requestAnimationFrame(gameLoop);
  }
  
  gameLoop();
}

function stopGameLoop() {
  gameLoopRunning = false;
}

// ───────────────────────────────────────────────────────────────────────────
// MAIN INITIALIZATION
// ───────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 DEPLOYMENT SAVE WIPE FUNCTIONS LOADED");
  console.log("📝 Quick commands:");
  console.log("  resetSaves() - Reset all saves");
  console.log("  resetAndReload() - Reset and reload page");
  console.log("  DEPLOYMENT_SAVE_WIPE.checkSaveState() - Check current saves");

  // Initialize UI elements cache
  UI_ELEMENTS.init();

  // Initialize shop items
  ensureShopItemsInitialized();

  // Initialize all module event handlers
  initThemeSystem();
  initCollapsePanels();
  initUnlockHandlers();
  initTabNavigation();
  initMenuHandlers();
  initShopEventHandlers();
  initStatsTabHandlers();
  initPrestigeHandlers();

  // Check for existing save and update UI
  const hasSave = localStorage.getItem("idleMinerSave");
  const btnContinue = document.getElementById("btn-continue");
  
  if (btnContinue) {
    btnContinue.disabled = !hasSave;
  }
  
  updateSaveCard();

  // Initialize game state  
  const gameUI = document.getElementById("game-ui");
  const mainMenu = document.getElementById("main-menu");
  
  if (gameUI) gameUI.style.display = "none";
  if (mainMenu) mainMenu.style.display = "flex";
  
  setGameStarted(false);

  // Initialize prestige UI as hidden
  updatePrestigeUI();

  // Initialize collapsed states for locked resources
  const { RES_IDS } = await import('./data.js');
  const lockedResources = RES_IDS.filter(res => res !== 'iron' && !isUnlocked(res));
  
  lockedResources.forEach(res => {
    const panel = document.querySelector(`.resource-panel[data-resource="${res}"]`);
    if (panel && !panel.classList.contains("collapsed")) {
      panel.classList.add("collapsed");
    }
  });

  console.log("🎮 IdleForge initialized successfully");
});

// ───────────────────────────────────────────────────────────────────────────
// GLOBAL FUNCTIONS FOR DEVELOPMENT
// ───────────────────────────────────────────────────────────────────────────

// Make some functions globally available for development and debugging
window.startGame = startGame;
window.startNewGame = startNewGame;
window.loadGame = loadGame;
window.saveGame = saveGame;

// Export for other modules that might need these
export { startGame, startNewGame, stopGameLoop };