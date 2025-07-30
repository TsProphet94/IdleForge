// Main game initialization and loop module
import { resources, RES_IDS, ensureShopItemsInitialized, stats } from './data.js';
import { unlockState, setGameStarted, gameStarted } from './state.js';
import { updateUI } from './ui.js';
import { saveGame, loadGame, startAutoSave, stopAutoSave } from './storage.js';
import { checkPrestigeUnlock, applyForgeCoreBonuses, applyMilestoneRewards } from './prestige.js';
import { spendMoney } from './game.js';

// Game loop variables
let gameLoopRunning = false;
let lastTimestamp = 0;

// Unlock cost constants
const UNLOCK_COST = {
  copper: 200000,
  nickel: 800000,
  bronze: 3200000,
  silver: 12800000,
  cobalt: 76800000,
  gold: 460800000,
  palladium: 2764800000,
  platinum: 30412800000,
  titanium: 334540800000,
  adamantium: 3679948800000,
};

// Game initialization
export function startNewGame() {
  console.log("🎮 Starting new game...");
  
  // Reset all resources to initial state
  RES_IDS.forEach(resId => {
    resources[resId].count = 0;
  });
  resources.money.count = 0;
  resources.coreShards.count = 0;

  // Reset unlock state (keep iron unlocked)
  Object.keys(unlockState).forEach(key => {
    unlockState[key] = false;
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

  // Reset prestige state
  if (typeof window !== 'undefined') {
    window.totalPrestiges = 0;
    window.prestigeUnlocked = false;
  }

  // Initialize shop items
  ensureShopItemsInitialized();
  
  console.log("✅ New game initialized");
}

export function startGame() {
  console.log("🚀 Starting game...");
  
  // Initialize game state
  setGameStarted(true);
  
  // Apply bonuses and rewards
  applyForgeCoreBonuses();
  applyMilestoneRewards();
  
  // Start game systems
  startGameLoop();
  startAutoSave();
  
  // Update UI
  updateUI();
  
  console.log("✅ Game started successfully");
}

// Main game loop
export function gameLoop(timestamp) {
  if (!gameLoopRunning) return;
  
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  
  // Skip first frame to avoid large delta
  if (deltaTime > 100) {
    requestAnimationFrame(gameLoop);
    return;
  }
  
  // Auto-mining logic
  const deltaSeconds = deltaTime / 1000;
  RES_IDS.forEach(resId => {
    if (resources[resId].autoRate > 0 && (resId === 'iron' || unlockState[resId])) {
      const autoMined = resources[resId].autoRate * deltaSeconds;
      resources[resId].count += autoMined;
      stats.mined[resId] += autoMined;
    }
  });
  
  // Check for prestige unlock
  checkPrestigeUnlock();
  
  // Update UI periodically (not every frame for performance)
  if (Math.floor(timestamp / 1000) !== Math.floor(lastTimestamp / 1000)) {
    updateUI();
  }
  
  // Continue loop
  requestAnimationFrame(gameLoop);
}

export function startGameLoop() {
  if (gameLoopRunning) return;
  
  gameLoopRunning = true;
  lastTimestamp = performance.now();
  requestAnimationFrame(gameLoop);
  console.log("🔄 Game loop started");
}

export function stopGameLoop() {
  gameLoopRunning = false;
  console.log("⏹️ Game loop stopped");
}

// Resource unlock functions
export function attemptUnlock(resId) {
  const cost = UNLOCK_COST[resId];
  if (!cost) {
    console.warn(`No unlock cost defined for resource: ${resId}`);
    return false;
  }
  
  if (resources.money.count < cost) {
    console.log(`Cannot unlock ${resId}: insufficient funds ($${resources.money.count} < $${cost})`);
    return false;
  }
  
  if (unlockState[resId]) {
    console.log(`${resId} is already unlocked`);
    return false;
  }
  
  // Spend the money and unlock the resource
  spendMoney(cost);
  unlockState[resId] = true;
  
  console.log(`✅ Unlocked ${resId} for $${cost}`);
  
  // Update UI to reflect changes
  updateResourceUnlockUI(resId);
  updateUI();
  
  return true;
}

export function relockResource(resId) {
  if (resId === 'iron') {
    console.warn("Cannot relock iron");
    return false;
  }
  
  unlockState[resId] = false;
  resources[resId].count = 0;
  console.log(`🔒 Relocked ${resId}`);
  
  updateResourceUnlockUI(resId);
  updateUI();
  
  return true;
}

// Resource unlock UI management
function updateResourceUnlockUI(resourceId) {
  const panel = document.getElementById(`${resourceId}-box`);
  if (!panel) return;

  const isUnlocked = unlockState[resourceId];
  
  if (isUnlocked) {
    panel.classList.remove('locked');
    panel.classList.add('unlocked');
    
    // Hide unlock button
    const unlockBtn = panel.querySelector(`[id*="unlock-${resourceId}"]`);
    if (unlockBtn) unlockBtn.style.display = 'none';
    
    // Show resource controls
    const resourceContent = panel.querySelector('.resource-content');
    if (resourceContent) resourceContent.style.display = 'block';
  } else {
    panel.classList.remove('unlocked');
    panel.classList.add('locked');
    
    // Show unlock button
    const unlockBtn = panel.querySelector(`[id*="unlock-${resourceId}"]`);
    if (unlockBtn) unlockBtn.style.display = 'block';
    
    // Hide resource controls
    const resourceContent = panel.querySelector('.resource-content');
    if (resourceContent) resourceContent.style.display = 'none';
  }
}

export function getResourceUnlockStatus(resourceId) {
  return unlockState[resourceId] || false;
}

// Menu and initialization handlers
export function continueGame() {
  if (loadGame()) {
    startGame();
    return true;
  } else {
    alert("Failed to load save data. Starting new game.");
    startNewGame();
    startGame();
    return false;
  }
}

export function newGameConfirmed() {
  startNewGame();
  startGame();
}

// Make functions globally available for backwards compatibility
if (typeof window !== 'undefined') {
  window.startNewGame = startNewGame;
  window.startGame = startGame;
  window.attemptUnlock = attemptUnlock;
  window.continueGame = continueGame;
  window.newGameConfirmed = newGameConfirmed;
}