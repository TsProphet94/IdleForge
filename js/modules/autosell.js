// Auto-sell System Module

import { ensureShopItemsInitialized } from './data.js';
import { sellAll } from './game.js';

// Calculate current autosell interval based on speed upgrades
export function calculateAutoSellInterval(resId) {
  const baseInterval = 15000; // 15 seconds base
  const minInterval = 3000;  // 3 seconds min
  const items = ensureShopItemsInitialized();
  const speedUpgrades = items.filter(
    (i) => i.category === resId && i.id.endsWith('-autosell-speed')
  );
  let totalBonus = 0;
  speedUpgrades.forEach(u => {
    totalBonus += u.count * u.speedReduction;
  });
  return Math.max(minInterval, baseInterval - totalBonus);
}

// Start auto-selling for a resource
export function startAutoSell(resId, autoSellTimers, countdownTimers, nextSellTimes) {
  stopAutoSell(resId, autoSellTimers, countdownTimers);
  const items = ensureShopItemsInitialized();
  const seller = items.find(
    i => i.category === resId && i.id.endsWith('-autoseller')
  );
  if (!seller || seller.count === 0) return;
  const interval = calculateAutoSellInterval(resId);
  nextSellTimes[resId] = Date.now() + interval;
  autoSellTimers[resId] = setInterval(() => {
    nextSellTimes[resId] = Date.now() + interval;
    sellAll(resId, true);
  }, interval);
  countdownTimers[resId] = setInterval(() => updateSellCountdown(resId), 50);
}

// Stop auto-selling
export function stopAutoSell(resId, autoSellTimers, countdownTimers) {
  clearInterval(autoSellTimers[resId]);
  clearInterval(countdownTimers[resId]);
}

// Update countdown display (to be used by UI module)
export function updateSellCountdown(resId, autoSellIntervals, nextSellTimes) {
  // TODO: migrate countdown logic here
}

// Visual pop effect on manual sell
export function createSellPop(resourceId) {
  // TODO: migrate createSellPop logic here
}
