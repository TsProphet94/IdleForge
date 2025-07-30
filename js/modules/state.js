// Game state module

// Current selected resource
export let currentResource = "iron";

// Unlock status for resources
export const unlockState = {
  copper: false,
  nickel: false,
  bronze: false,
  silver: false,
  cobalt: false,
  gold: false,
  palladium: false,
  platinum: false,
  titanium: false,
  adamantium: false,
};

// Prestige system state
export let prestigeUnlocked = false;
export let totalPrestiges = 0;

// Helper functions to update prestige state
export function setPrestigeUnlocked(value) {
  prestigeUnlocked = value;
}

export function setTotalPrestiges(value) {
  totalPrestiges = value;
}

export function incrementPrestiges() {
  totalPrestiges++;
}

// Core upgrades state
export const coreUpgrades = {
  globalMineRate: { level: 0, maxLevel: 10, baseCost: 1, costScale: 2, effect: 0.25 },
  globalSellValue: { level: 0, maxLevel: 50, baseCost: 2, costScale: 2.5, effect: 0.1 },
};

// Auto-save interval
export let autoSaveInterval = null;

// Game started flag  
export let gameStarted = false;

// Helper function to update game started state
export function setGameStarted(value) {
  gameStarted = value;
}

// Make prestige state globally accessible for backwards compatibility
if (typeof window !== 'undefined') {
  window.prestigeUnlocked = prestigeUnlocked;
  window.totalPrestiges = totalPrestiges;
}
