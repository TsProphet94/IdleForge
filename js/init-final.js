// js/init-final.js - Final working modular initialization
console.log("🔥 IdleForge Modular v0.1.37 Starting...");

// Version information
const GAME_VERSION = "0.1.37";
console.log(`🎯 VERSION CONTROL: Game v${GAME_VERSION} | Modular Structure`);

// Import modules in dependency order
import { resources, stats, RES_IDS, ensureShopItemsInitialized, setGameStarted } from './data.js';
import { modalSystem, UI_ELEMENTS, setTheme, showScreen, setText } from './ui.js';
import { fmt, mineResource, sellAll, isUnlocked, updateResourceUI } from './resources.js';
import { renderShop, initShopEventHandlers } from './shop.js';
import { updateStatsUI, initStatsTabHandlers } from './stats.js';
import { loadGame, saveGame, startAutoSave } from './storage.js';

console.log("✅ All modules loaded successfully");

// Main menu event handlers
function initMainMenu() {
  // New Game button
  const newGameBtn = document.getElementById('btn-new');
  const confirmModal = document.getElementById('confirm-newgame-modal');
  const confirmYes = document.getElementById('confirm-newgame-yes');
  const confirmNo = document.getElementById('confirm-newgame-no');

  newGameBtn?.addEventListener('click', () => {
    if (confirmModal) {
      confirmModal.classList.remove('hidden');
    } else {
      startNewGame();
    }
  });

  confirmYes?.addEventListener('click', () => {
    confirmModal?.classList.add('hidden');
    startNewGame();
  });

  confirmNo?.addEventListener('click', () => {
    confirmModal?.classList.add('hidden');
  });

  // Continue button
  const continueBtn = document.getElementById('btn-continue');
  continueBtn?.addEventListener('click', () => {
    loadGame();
    startGame();
  });

  // Settings button
  const settingsBtn = document.getElementById('btn-settings');
  const settingsModal = document.getElementById('settings-modal');
  const settingsClose = document.getElementById('settings-close');
  
  settingsBtn?.addEventListener('click', () => {
    settingsModal?.classList.remove('hidden');
  });

  settingsClose?.addEventListener('click', () => {
    settingsModal?.classList.add('hidden');
  });

  // Theme selection
  const themeSelect = document.getElementById('theme-select');
  themeSelect?.addEventListener('change', (e) => {
    setTheme(e.target.value);
  });
}

function startNewGame() {
  console.log("🆕 Starting new game...");
  
  // Reset all game data
  Object.keys(resources).forEach(key => {
    if (resources[key].count !== undefined) {
      resources[key].count = 0;
    }
    if (resources[key].perClick !== undefined) {
      resources[key].perClick = 1;
    }
    if (resources[key].perSecond !== undefined) {
      resources[key].perSecond = 0;
    }
  });

  // Reset stats
  Object.keys(stats).forEach(category => {
    if (typeof stats[category] === 'object') {
      Object.keys(stats[category]).forEach(key => {
        stats[category][key] = 0;
      });
    } else {
      stats[category] = 0;
    }
  });

  startGame();
}

function startGame() {
  console.log("🎮 Starting game interface...");
  
  // Hide main menu, show game
  const mainMenu = document.getElementById('main-menu');
  const gameUI = document.getElementById('game-ui');
  
  if (mainMenu) mainMenu.classList.add('hidden');
  if (gameUI) gameUI.classList.remove('hidden');

  // Initialize game systems
  setGameStarted(true);
  ensureShopItemsInitialized();
  
  // Initialize event handlers
  initShopEventHandlers();
  initStatsTabHandlers();
  initGameEventHandlers();
  
  // Start auto-save
  startAutoSave();
  
  // Update UI
  updateResourceUI();
  updateStatsUI();
  renderShop();
  
  console.log("✅ Game started successfully");
}

function initGameEventHandlers() {
  // Mine buttons
  RES_IDS.forEach(resId => {
    const mineBtn = document.getElementById(`mine-${resId}`);
    mineBtn?.addEventListener('click', () => {
      mineResource(resId);
    });

    const sellBtn = document.getElementById(`sell-all-${resId}`);
    sellBtn?.addEventListener('click', () => {
      sellAll(resId);
    });
  });

  // Navigation tabs
  const mineTab = document.querySelector('[onclick="showTab(\'mine\')"]');
  const shopTab = document.querySelector('[onclick="showTab(\'shop\')"]');
  const statsTab = document.querySelector('[onclick="showTab(\'stats\')"]');

  mineTab?.addEventListener('click', () => showTab('mine'));
  shopTab?.addEventListener('click', () => showTab('shop'));
  statsTab?.addEventListener('click', () => showTab('stats'));
}

function showTab(tabName) {
  // Hide all tab contents
  const contents = ['mine-tab-content', 'shop-tab-content', 'stats-tab-content'];
  contents.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.classList.add('hidden');
  });

  // Remove active class from all tabs
  const tabs = document.querySelectorAll('.nav-btn');
  tabs.forEach(tab => tab.classList.remove('active'));

  // Show selected tab content
  const targetContent = document.getElementById(`${tabName}-tab-content`);
  if (targetContent) targetContent.classList.remove('hidden');

  // Add active class to selected tab
  const targetTab = document.querySelector(`[onclick="showTab('${tabName}')"]`);
  if (targetTab) targetTab.classList.add('active');

  // Update content if needed
  if (tabName === 'shop') {
    renderShop();
  } else if (tabName === 'stats') {
    updateStatsUI();
  }
}

// PWA and Service Worker setup
function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('SW: Registered successfully');
      })
      .catch(error => {
        console.log('SW: Registration failed');
      });
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 DOM ready, initializing IdleForge...");
  
  initMainMenu();
  initPWA();
  
  // Check for saved game to enable/disable continue button
  const continueBtn = document.getElementById('btn-continue');
  const hasSave = localStorage.getItem('idleforge-save') !== null;
  if (continueBtn) {
    continueBtn.disabled = !hasSave;
  }
  
  // Load version information
  fetch('./version.txt')
    .then(response => response.text())
    .then(version => {
      const versionEl = document.getElementById('version');
      if (versionEl) versionEl.textContent = version.trim();
    })
    .catch(() => {
      const versionEl = document.getElementById('version');
      if (versionEl) versionEl.textContent = GAME_VERSION;
    });
  
  console.log("✅ IdleForge modular initialization complete!");
});

// Make functions globally available for HTML onclick handlers
window.showTab = showTab;
window.mineResource = mineResource;
window.sellAll = sellAll;