// Core game logic module
import { resources, coreUpgrades, RES_IDS, shopItems, ensureShopItemsInitialized, stats } from './data.js';
import { setText, fmt } from './helpers.js';
import { isUnlocked } from './helpers.js';

/** Add ore & track mined */
export function addOre(resId, amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources[resId].count += amount;
  stats.mined[resId] += amount;
}

/** Add money gained */
export function addMoney(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.money.count += amount;
  stats.earnedMoney += amount;
}

/** Spend money */
export function spendMoney(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.money.count -= amount;
  stats.spentMoney += amount;
}

/** Add core shards */
export function addCoreShards(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.coreShards.count += amount;
}

/** Spend core shards */
export function spendCoreShards(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return false;
  if (resources.coreShards.count < amount) return false;
  resources.coreShards.count -= amount;
  return true;
}
