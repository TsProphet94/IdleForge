// Event Handlers Module

import { addOre, sellAll, mineResource } from './game.js';
import { updateUI } from './ui.js';
import { isUnlocked } from './helpers.js';
import { RES_IDS, ensureShopItemsInitialized, resources } from './data.js';
import { initShop } from './shop.js';
import { initTheme } from './theme.js';
import { storageManager } from './storage.js';
import { gameStarted } from './state.js';

// Game UI elements
let mainMenu, settingsMenu, gameUI;

// Screen switching functionality
function showScreen(screenName) {
  // Hide all screens
  const screens = document.querySelectorAll('.screen-panel');
  screens.forEach(screen => screen.classList.add('hidden'));
  
  // Show the requested screen
  const targetScreen = document.getElementById(`screen-${screenName}`);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }
  
  // Update tab active states
  const tabButtons = document.querySelectorAll('nav.header-nav button');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  
  // Set active state on the correct tab
  const activeTab = document.getElementById(`tab-${screenName}`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
}

// Initialize game functionality
function startGame() {
  // Initialize shop items if not already done
  ensureShopItemsInitialized();

  mainMenu.style.display = "none";
  settingsMenu.style.display = "none";
  gameUI.style.display = "flex";
  // gameStarted = true; // TODO: need to make this writable

  updateUI();

  // Show the mine screen by default
  showScreen('mine');

  // TODO: implement additional game start logic
  // switchResource(currentResource);
  // renderShop();
  // startGameLoop();
  // if (toggleAutoSave?.checked) startAutoSave();
}

// Attach DOM event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  mainMenu = document.getElementById('main-menu');
  settingsMenu = document.getElementById('settings-menu');
  gameUI = document.getElementById('game-ui');

  // Initialize theme picker
  initTheme();

  // Initialize shop module
  initShop();

  // New Game button
  const btnNew = document.getElementById('btn-new');
  if (btnNew) {
    btnNew.addEventListener('click', () => {
      // TODO: show confirmation modal for new game
      startGame();
    });
  }

  // Continue button
  const btnContinue = document.getElementById('btn-continue');
  if (btnContinue) {
    btnContinue.addEventListener('click', () => {
      // TODO: load saved game first
      startGame();
    });
  }

  // Settings button
  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      mainMenu.style.display = 'none';
      settingsMenu.style.display = 'flex';
    });
  }

  // Back to main menu from settings
  const btnBackToMenu = document.getElementById('btn-back-to-menu');
  if (btnBackToMenu) {
    btnBackToMenu.addEventListener('click', () => {
      settingsMenu.style.display = 'none';
      mainMenu.style.display = 'flex';
    });
  }

  // Tab navigation
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

  // Resource mine/sell buttons
  RES_IDS.forEach(resId => {
    const mineBtn = document.getElementById(`mine-${resId}-btn`);
    const sellBtn = document.getElementById(`sell-${resId}-btn`);
    if (mineBtn) mineBtn.addEventListener('click', () => {
      // Use mineResource which includes click tracking
      mineResource(resId);
      updateUI();
    });
    if (sellBtn) sellBtn.addEventListener('click', () => {
      sellAll(resId);
      updateUI();
    });
  });

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

  // TODO: migrate more event handlers from script.js
  // - Stats tab switching
  // - Developer panel
  // - Settings toggles
  // - Prestige system
  // - Shop functionality
});

export { startGame };
