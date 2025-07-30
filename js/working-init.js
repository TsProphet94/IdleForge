// js/working-init.js - Step-by-step working initialization
import { ensureShopItemsInitialized, setGameStarted, gameStarted, resources } from './data.js';
import { UI_ELEMENTS, setTheme, showScreen, storageManager } from './ui.js';
import { saveGame, loadGame, startAutoSave, stopAutoSave, updateSaveCard } from './storage.js';

console.log('🎮 IdleForge Modular - Step by step init');

// Global state
let gameLoopRunning = false;

// ───────────────────────────────────────────────────────────────────────────
// BASIC MENU FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

function startNewGame() {
  console.log('🆕 Starting new game...');
  
  // Reset resources
  Object.values(resources).forEach(res => {
    if (res.count !== undefined) res.count = 0;
    if (res.perClick !== undefined) res.perClick = 1;
    if (res.perSecond !== undefined) res.perSecond = 0;
  });

  // Reset shop items
  const items = ensureShopItemsInitialized();
  items.forEach(item => {
    item.count = 0;
    item.price = item.basePrice;
  });

  console.log('✅ New game state reset');
  startGame();
}

function startGame() {
  console.log('🚀 Starting game...');
  
  const mainMenu = document.getElementById("main-menu");
  const gameUI = document.getElementById("game-ui");
  
  if (mainMenu) mainMenu.style.display = "none";
  if (gameUI) gameUI.style.display = "flex";
  
  setGameStarted(true);
  
  // Show mine screen by default
  showScreen(UI_ELEMENTS.screenMine);
  
  // Update money display
  updateMoneyDisplay();
  
  console.log('✅ Game started successfully');
}

function returnToMenu() {
  const gameUI = document.getElementById("game-ui");
  const mainMenu = document.getElementById("main-menu");
  
  if (gameUI) gameUI.style.display = "none";
  if (mainMenu) mainMenu.style.display = "flex";
  
  setGameStarted(false);
  
  console.log('📋 Returned to main menu');
}

// ───────────────────────────────────────────────────────────────────────────
// BASIC RESOURCE FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

function updateMoneyDisplay() {
  const moneyEl = document.getElementById('money-count');
  if (moneyEl && resources.money) {
    moneyEl.textContent = formatNumber(resources.money.count || 0);
  }
}

function formatNumber(num) {
  if (num < 1_000) return Math.floor(num).toString();
  if (num < 1_000_000)
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  if (num < 1_000_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (num < 1_000_000_000_000)
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b";
  return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") + "t";
}

function mineIron() {
  if (!resources.iron) return;
  
  resources.iron.count += resources.iron.perClick || 1;
  resources.money.count += 1; // Simple: 1 iron = $1
  
  updateResourceDisplays();
  console.log(`⛏️ Mined iron! Iron: ${resources.iron.count}, Money: ${resources.money.count}`);
}

function updateResourceDisplays() {
  // Update iron count
  const ironEl = document.getElementById('iron-count');
  if (ironEl && resources.iron) {
    ironEl.textContent = formatNumber(resources.iron.count || 0);
  }
  
  // Update money
  updateMoneyDisplay();
}

// ───────────────────────────────────────────────────────────────────────────
// THEME SYSTEM
// ───────────────────────────────────────────────────────────────────────────

function initThemeSystem() {
  const themeSelect = document.getElementById("theme-select");
  if (!themeSelect) return;

  // Load saved theme
  const savedTheme = localStorage.getItem('selectedTheme') || 'classic';
  setTheme(savedTheme);
  themeSelect.value = savedTheme;

  // Handle theme changes
  themeSelect.addEventListener("change", (e) => {
    setTheme(e.target.value);
    localStorage.setItem('selectedTheme', e.target.value);
    console.log(`🎨 Theme changed to: ${e.target.value}`);
  });
}

// ───────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ───────────────────────────────────────────────────────────────────────────

function initNavigation() {
  // Tab navigation
  if (UI_ELEMENTS.tabMine) {
    UI_ELEMENTS.tabMine.addEventListener("click", () => {
      showScreen(UI_ELEMENTS.screenMine);
      console.log('📟 Switched to Mine screen');
    });
  }
  
  if (UI_ELEMENTS.tabShop) {
    UI_ELEMENTS.tabShop.addEventListener("click", () => {
      showScreen(UI_ELEMENTS.screenShop);
      console.log('🛒 Switched to Shop screen');
    });
  }
  
  if (UI_ELEMENTS.tabStats) {
    UI_ELEMENTS.tabStats.addEventListener("click", () => {
      showScreen(UI_ELEMENTS.screenStats);
      console.log('📊 Switched to Stats screen');
    });
  }
}

// ───────────────────────────────────────────────────────────────────────────
// BASIC MINING
// ───────────────────────────────────────────────────────────────────────────

function initMining() {
  const mineIronBtn = document.getElementById('mine-iron-btn');
  if (mineIronBtn) {
    mineIronBtn.addEventListener('click', mineIron);
    console.log('⛏️ Iron mining button initialized');
  }
}

// ───────────────────────────────────────────────────────────────────────────
// MENU HANDLERS
// ───────────────────────────────────────────────────────────────────────────

function initMenuHandlers() {
  const btnNew = document.getElementById('btn-new');
  const btnContinue = document.getElementById('btn-continue');
  const btnSettings = document.getElementById('btn-settings');
  const btnBackToMenu = document.getElementById('btn-back-to-menu');
  const btnSaveMenu = document.getElementById('btn-save-menu');

  if (btnNew) {
    btnNew.addEventListener('click', () => {
      console.log('🆕 New Game clicked');
      startNewGame();
    });
  }

  if (btnContinue) {
    btnContinue.addEventListener('click', () => {
      console.log('▶️ Continue clicked');
      if (loadGame()) {
        startGame();
      } else {
        alert('No save game found. Starting new game.');
        startNewGame();
      }
    });
  }

  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      document.getElementById('main-menu').style.display = 'none';
      document.getElementById('settings-menu').style.display = 'flex';
    });
  }

  if (btnBackToMenu) {
    btnBackToMenu.addEventListener('click', () => {
      document.getElementById('settings-menu').style.display = 'none';
      document.getElementById('main-menu').style.display = 'flex';
    });
  }

  if (btnSaveMenu) {
    btnSaveMenu.addEventListener('click', () => {
      saveGame();
      returnToMenu();
    });
  }
}

// ───────────────────────────────────────────────────────────────────────────  
// MAIN INITIALIZATION
// ───────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  console.log('📋 DOM Content Loaded - Working Init');
  
  try {
    // Initialize UI elements cache
    UI_ELEMENTS.init();
    console.log('✅ UI Elements initialized');

    // Initialize shop items
    ensureShopItemsInitialized();
    console.log('✅ Shop items initialized');

    // Initialize theme system
    initThemeSystem();
    console.log('✅ Theme system initialized');

    // Initialize navigation
    initNavigation();
    console.log('✅ Navigation initialized');

    // Initialize menu handlers
    initMenuHandlers();
    console.log('✅ Menu handlers initialized');

    // Initialize basic mining
    initMining();
    console.log('✅ Basic mining initialized');

    // Set initial game state
    setGameStarted(false);
    
    // Check for save and update continue button
    const hasSave = localStorage.getItem('idleMinerSave');
    const btnContinue = document.getElementById('btn-continue');
    if (btnContinue) {
      btnContinue.disabled = !hasSave;
    }

    // Show main menu
    const gameUI = document.getElementById('game-ui');
    const mainMenu = document.getElementById('main-menu');
    
    if (gameUI) gameUI.style.display = 'none';
    if (mainMenu) mainMenu.style.display = 'flex';

    console.log('🎉 IdleForge modular version fully initialized!');

  } catch (error) {
    console.error('❌ Error during initialization:', error);
  }
});

// Export functions for debugging
window.startGame = startGame;
window.startNewGame = startNewGame;
window.resources = resources;