// Settings and dev panel module
import { resources } from './data.js';
import { saveGame, resetSaves, resetAndReload, startAutoSave, stopAutoSave } from './storage.js';
import { addMoney, addOre } from './game.js';
import { updateUI } from './ui.js';

// Settings state
let autoSaveEnabled = true;

// Initialize settings system
export function initSettings() {
  console.log("⚙️ Initializing settings system...");
  
  // Load settings from localStorage
  loadSettings();
  
  // Set up event handlers
  setupSettingsEventHandlers();
  
  console.log("✅ Settings system initialized");
}

// Load settings from localStorage
function loadSettings() {
  try {
    const savedAutoSave = localStorage.getItem('idleForge_autoSave');
    if (savedAutoSave !== null) {
      autoSaveEnabled = JSON.parse(savedAutoSave);
    }
    
    // Update UI to reflect loaded settings
    const toggleAutoSave = document.getElementById('toggle-auto-save');
    if (toggleAutoSave) {
      toggleAutoSave.checked = autoSaveEnabled;
    }
    
    // Start or stop auto-save based on setting
    if (autoSaveEnabled) {
      startAutoSave();
    } else {
      stopAutoSave();
    }
  } catch (e) {
    console.warn("Failed to load settings:", e);
  }
}

// Save settings to localStorage
function saveSettings() {
  try {
    localStorage.setItem('idleForge_autoSave', JSON.stringify(autoSaveEnabled));
  } catch (e) {
    console.warn("Failed to save settings:", e);
  }
}

// Set up event handlers for settings
function setupSettingsEventHandlers() {
  // Auto-save toggle
  const toggleAutoSave = document.getElementById('toggle-auto-save');
  if (toggleAutoSave) {
    toggleAutoSave.addEventListener('change', (e) => {
      autoSaveEnabled = e.target.checked;
      saveSettings();
      
      if (autoSaveEnabled) {
        startAutoSave();
        console.log("✅ Auto-save enabled");
      } else {
        stopAutoSave();
        console.log("❌ Auto-save disabled");
      }
    });
  }
  
  // Settings menu button
  const btnSettings = document.getElementById('btn-settings');
  const settingsMenu = document.getElementById('settings-menu');
  if (btnSettings && settingsMenu) {
    btnSettings.addEventListener('click', () => {
      settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'block' : 'none';
    });
  }
  
  // Save menu button
  const btnSaveMenu = document.getElementById('btn-save-menu');
  if (btnSaveMenu) {
    btnSaveMenu.addEventListener('click', () => {
      if (saveGame()) {
        console.log("💾 Manual save completed");
        // Show save feedback
        showSaveIndicator();
      } else {
        console.error("❌ Manual save failed");
      }
    });
  }
}

// Show save indicator
function showSaveIndicator() {
  const indicator = document.getElementById('save-indicator');
  if (indicator) {
    indicator.style.opacity = '1';
    indicator.style.transform = 'translateY(0)';
    
    setTimeout(() => {
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateY(-10px)';
    }, 1000);
  }
}

// Developer panel functionality
const isDev = false; // Set to true to enable dev panel

export function initDevPanel() {
  if (!isDev) return;
  
  console.log("🛠️ Initializing developer panel...");
  
  const devPanel = document.getElementById('dev-panel');
  if (devPanel) {
    devPanel.style.display = 'block';
    setupDevEventHandlers();
  }
  
  console.log("✅ Developer panel initialized");
}

function setupDevEventHandlers() {
  // Add resource buttons
  const resourceButtons = [
    { id: 'dev-add-iron', resource: 'iron', amount: 1000 },
    { id: 'dev-add-copper', resource: 'copper', amount: 1000 },
    { id: 'dev-add-nickel', resource: 'nickel', amount: 1000 },
    { id: 'dev-add-bronze', resource: 'bronze', amount: 1000 },
    { id: 'dev-add-silver', resource: 'silver', amount: 1000 },
    { id: 'dev-add-cobalt', resource: 'cobalt', amount: 1000 },
    { id: 'dev-add-gold', resource: 'gold', amount: 1000 },
    { id: 'dev-add-palladium', resource: 'palladium', amount: 1000 },
    { id: 'dev-add-platinum', resource: 'platinum', amount: 1000 },
    { id: 'dev-add-titanium', resource: 'titanium', amount: 1000 },
    { id: 'dev-add-adamantium', resource: 'adamantium', amount: 1000 }
  ];
  
  resourceButtons.forEach(({ id, resource, amount }) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => {
        addOre(resource, amount);
        updateUI();
        console.log(`🛠️ Added ${amount} ${resource}`);
      });
    }
  });
  
  // Add money button
  const devAddMoney = document.getElementById('dev-add-money');
  if (devAddMoney) {
    devAddMoney.addEventListener('click', () => {
      addMoney(1000000);
      updateUI();
      console.log("🛠️ Added $1,000,000");
    });
  }
  
  // Reset saves button
  const devResetSaves = document.getElementById('dev-reset-saves');
  if (devResetSaves) {
    devResetSaves.addEventListener('click', () => {
      if (confirm("Are you sure you want to reset all saves? This cannot be undone!")) {
        resetSaves();
        console.log("🛠️ Reset all saves");
      }
    });
  }
  
  // Reset and reload button
  const devResetReload = document.getElementById('dev-reset-reload');
  if (devResetReload) {
    devResetReload.addEventListener('click', () => {
      if (confirm("Are you sure you want to reset all saves and reload? This cannot be undone!")) {
        resetAndReload();
      }
    });
  }
}

// Menu system functions
export function showScreen(screenName) {
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
  
  console.log(`📺 Switched to ${screenName} screen`);
}

// Theme-related functionality (basic)
export function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme') || 'classic';
  
  // Simple theme toggle for now
  const themes = ['classic', 'neon-cyan', 'neon-purple', 'neon-pink'];
  const currentIndex = themes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  const nextTheme = themes[nextIndex];
  
  body.setAttribute('data-theme', nextTheme);
  localStorage.setItem('idleForge_theme', nextTheme);
  
  console.log(`🎨 Switched to ${nextTheme} theme`);
}

// Sound settings (placeholder for future implementation)
export function toggleSound() {
  // TODO: Implement sound toggle functionality
  console.log("🔊 Sound toggle not yet implemented");
}

// PWA safe area handling
export function handleSafeArea() {
  // Add CSS variables for safe area insets
  const root = document.documentElement;
  
  // Check if device supports safe area insets
  if (CSS.supports('padding: env(safe-area-inset-top)')) {
    root.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
    root.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
    root.style.setProperty('--safe-area-left', 'env(safe-area-inset-left)');
    root.style.setProperty('--safe-area-right', 'env(safe-area-inset-right)');
  } else {
    root.style.setProperty('--safe-area-top', '0px');
    root.style.setProperty('--safe-area-bottom', '0px');
    root.style.setProperty('--safe-area-left', '0px');
    root.style.setProperty('--safe-area-right', '0px');
  }
}

// Utility functions for settings
export function getAutoSaveEnabled() {
  return autoSaveEnabled;
}

export function setAutoSaveEnabled(enabled) {
  autoSaveEnabled = enabled;
  saveSettings();
  
  const toggleAutoSave = document.getElementById('toggle-auto-save');
  if (toggleAutoSave) {
    toggleAutoSave.checked = enabled;
  }
  
  if (enabled) {
    startAutoSave();
  } else {
    stopAutoSave();
  }
}

// Make functions globally available for backwards compatibility
if (typeof window !== 'undefined') {
  window.showScreen = showScreen;
  window.toggleTheme = toggleTheme;
  window.toggleSound = toggleSound;
}