// UI Rendering Module

import { resources, RES_IDS } from './data.js';
import { fmt, setText, isUnlocked } from './helpers.js';
import { stats } from './data.js';
import { updatePrestigeUI, updatePrestigeTab, updateCoreUI, updateMilestoneList } from './prestige.js';

/**
 * Master UI update function, calls individual updates in order.
 */
export function updateUI() {
  updateMoneyDisplay();
  updateResourceUI();
  updateShopUI();
  updateStatsUI();
  updatePrestigeUI();
  updatePrestigeTab();
  updateCoreUI();
  updateMilestoneList();
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
  // Update financial stats
  const earnedEl = document.getElementById('stat-earned');
  if (earnedEl) earnedEl.textContent = '$' + fmt(stats.earnedMoney);
  
  const spentEl = document.getElementById('stat-spent');
  if (spentEl) spentEl.textContent = '$' + fmt(stats.spentMoney);
  
  const netEl = document.getElementById('stat-net');
  if (netEl) netEl.textContent = '$' + fmt(stats.earnedMoney - stats.spentMoney);

  // Update resource stats
  RES_IDS.forEach((res) => {
    const minedEl = document.getElementById(`stat-mined-${res}`);
    if (minedEl) minedEl.textContent = fmt(stats.mined[res] || 0);
    
    const soldEl = document.getElementById(`stat-sold-${res}`);
    if (soldEl) soldEl.textContent = fmt(stats.sold[res] || 0);
  });

  // Update click stats
  const mineClicksEl = document.getElementById('stat-click-mine');
  if (mineClicksEl) mineClicksEl.textContent = fmt(stats.clicks.mine);
  
  const sellClicksEl = document.getElementById('stat-click-sell');
  if (sellClicksEl) sellClicksEl.textContent = fmt(stats.clicks.sell);
  
  const shopClicksEl = document.getElementById('stat-click-shop');
  if (shopClicksEl) shopClicksEl.textContent = fmt(stats.clicks.shopBuy);

  // Update highscore
  const minedTotal = RES_IDS.reduce(
    (sum, res) => sum + (stats.mined[res] || 0),
    0
  );
  const score = Math.floor(stats.earnedMoney + minedTotal * 2);
  
  // TODO: Load and update highscore from localStorage
  const highscoreEl = document.getElementById('stat-highscore');
  if (highscoreEl) {
    let highscore = score; // For now, use current score
    // TODO: Compare with localStorage highscore
    highscoreEl.textContent = '$' + fmt(highscore);
  }
}

export function updatePrestigeUI() {
  // TODO: implement prestige UI updates
}
