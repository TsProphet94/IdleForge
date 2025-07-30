// Event Handlers Module

import { addOre, sellAll, mineResource } from './game.js';
import { updateUI } from './ui.js';
import { isUnlocked } from './helpers.js';
import { RES_IDS, ensureShopItemsInitialized, resources } from './data.js';
import { initShop } from './shop.js';
import { initTheme } from './theme.js';
import { storageManager } from './storage.js';
import { gameStarted } from './state.js';
import { startNewGame, startGame, continueGame, newGameConfirmed, attemptUnlock, startGameLoop } from './gameLoop.js';
import { initSettings, initDevPanel, showScreen } from './settings.js';
import { modalSystem } from './modal.js';

// Game UI elements
let mainMenu, settingsMenu, gameUI;

// Initialize all event handlers
function initializeEventHandlers() {
  console.log("🎯 Initializing event handlers...");
  
  // Get UI elements
  mainMenu = document.getElementById('main-menu');
  settingsMenu = document.getElementById('settings-menu');
  gameUI = document.getElementById('game-ui');

  // Initialize systems
  initTheme();
  initSettings();
  initDevPanel();
  initShop();
  
  // Set up menu event handlers
  setupMenuEventHandlers();
  
  // Set up game event handlers
  setupGameEventHandlers();
  
  // Set up navigation event handlers
  setupNavigationEventHandlers();
  
  // Set up panel collapse/expand
  setupPanelEventHandlers();
  
  console.log("✅ Event handlers initialized");
}

// Menu event handlers
function setupMenuEventHandlers() {
  // New Game button
  const btnNewGame = document.getElementById('btn-new');
  if (btnNewGame) {
    btnNewGame.addEventListener('click', () => {
      // Check if there's existing save data
      const existingSave = localStorage.getItem('idleMinerSave');
      if (existingSave) {
        // Show confirmation modal
        if (confirm("This will overwrite your current save. Are you sure?")) {
          transitionToGame();
          newGameConfirmed();
        }
      } else {
        transitionToGame();
        newGameConfirmed();
      }
    });
  }
  
  // Continue button
  const btnContinue = document.getElementById('btn-continue');
  if (btnContinue) {
    btnContinue.addEventListener('click', () => {
      transitionToGame();
      continueGame();
    });
  }
  
  // Settings button
  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      if (mainMenu) mainMenu.style.display = 'none';
      if (settingsMenu) settingsMenu.style.display = 'flex';
    });
  }
  
  // Back to main menu from settings
  const btnBackToMenu = document.getElementById('btn-back-to-menu');
  if (btnBackToMenu) {
    btnBackToMenu.addEventListener('click', () => {
      if (settingsMenu) settingsMenu.style.display = 'none';
      if (mainMenu) mainMenu.style.display = 'flex';
    });
  }
}

// Game event handlers
function setupGameEventHandlers() {
  // Mining buttons
  RES_IDS.forEach(resId => {
    const mineBtn = document.getElementById(`mine-${resId}-btn`);
    if (mineBtn) {
      mineBtn.addEventListener('click', () => {
        mineResource(resId);
        updateUI();
      });
    }
    
    // Selling buttons
    const sellBtn = document.getElementById(`sell-${resId}-btn`);
    if (sellBtn) {
      sellBtn.addEventListener('click', () => {
        sellAll(resId);
        updateUI();
      });
    }
    
    // Unlock buttons
    const unlockBtn = document.getElementById(`unlock-${resId}-btn`);
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        attemptUnlock(resId);
      });
    }
  });
  
  // Menu button (in game)
  const menuBtn = document.getElementById('menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      transitionToMenu();
    });
  }
}

// Navigation event handlers
function setupNavigationEventHandlers() {
  // Tab buttons
  const tabs = document.querySelectorAll('nav.header-nav button');
  tabs.forEach(btn => {
    btn.addEventListener('click', e => {
      const btnId = btn.id;
      if (btnId === 'tab-mine') {
        showScreen('mine');
      } else if (btnId === 'tab-shop') {
        showScreen('shop');
      } else if (btnId === 'tab-stats') {
        showScreen('stats');
      } else if (btnId === 'tab-forgecore') {
        showScreen('forgecore');
      }
      updateUI();
    });
  });
}

// Panel collapse/expand event handlers
function setupPanelEventHandlers() {
  // Resource Panel Collapse/Expand System
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
}

// Screen transition functions
function transitionToGame() {
  if (mainMenu) mainMenu.style.display = "none";
  if (settingsMenu) settingsMenu.style.display = "none";
  if (gameUI) gameUI.style.display = "flex";
  
  // Show the mine screen by default
  showScreen('mine');
}

function transitionToMenu() {
  if (gameUI) gameUI.style.display = "none";
  if (settingsMenu) settingsMenu.style.display = "none";
  if (mainMenu) mainMenu.style.display = "flex";
}

// Screen switching functionality
export function switchToScreen(screenName) {
  showScreen(screenName);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("📄 DOM loaded, initializing IdleForge...");
  
  try {
    initializeEventHandlers();
    
    // Initialize shop items
    ensureShopItemsInitialized();
    
    // Update UI to show initial state
    updateUI();
    
    console.log("🎮 IdleForge initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize IdleForge:", error);
  }
});
