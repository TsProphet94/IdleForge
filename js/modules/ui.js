// UI Rendering Module

import { resources, RES_IDS } from './data.js';
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
  // Update resource counts and sell button states
  RES_IDS.forEach(resId => {
    const countEl = document.getElementById(`${resId}-count`);
    if (countEl) {
      countEl.textContent = fmt(resources[resId].count);
    }
    
    // Update sell button state
    const sellBtn = document.getElementById(`sell-${resId}-btn`);
    if (sellBtn) {
      sellBtn.disabled = resources[resId].count <= 0;
    }
  });
}

export function updateShopUI() {
  // TODO: implement shop UI updates
}

export function updateStatsUI() {
  // TODO: implement stats UI updates
}

export function updatePrestigeUI() {
  // TODO: implement prestige UI updates
}
