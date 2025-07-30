// UI Rendering Module

import { resources } from './data.js';
import { fmt, setText, isUnlocked } from './helpers.js';
import { stats } from './data.js';

/**
 * Master UI update function, calls individual updates in order.
 */
export function updateUI() {
  updateMoneyDisplay();
  updateResourceUI();
  updateShopUI();
  updateStatsUI();
  updatePrestigeUI();
}

// Update money display separately for performance
export function updateMoneyDisplay() {
  if (!updateMoneyDisplay.lastMoney) updateMoneyDisplay.lastMoney = resources.money.count;
  const prevMoney = updateMoneyDisplay.lastMoney;
  const newMoney = resources.money.count;

  const moneyCountEl = document.getElementById('money-count');
  if (moneyCountEl) moneyCountEl.textContent = `$${fmt(newMoney)}`;

  if (newMoney > prevMoney + 1) {
    const moneyBox = document.getElementById('money-display');
    if (moneyBox) {
      moneyBox.classList.remove('money-bounce');
      requestAnimationFrame(() => {
        moneyBox.classList.add('money-bounce');
      });
    }
  }
  updateMoneyDisplay.lastMoney = newMoney;
}

// Additional UI update functions (resources, shop, stats, prestige)
export function updateResourceUI() {
  // ...existing code...
}

export function updateShopUI() {
  // ...existing code...
}

export function updateStatsUI() {
  // ...existing code...
}

export function updatePrestigeUI() {
  // ...existing code...
}
