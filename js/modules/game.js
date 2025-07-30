// Core game logic module
import { resources, RES_IDS, shopItems, ensureShopItemsInitialized, stats } from './data.js';
import { coreUpgrades } from './state.js';
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

/** Get ForgeCore bonus value */
export function getForgeCoreBonusValue(upgradeId) {
  const upgrade = coreUpgrades[upgradeId];
  if (!upgrade) return 0;
  return upgrade.level * upgrade.effect;
}

/** Sell all resources of a given type */
export function sellAll(resId, isAutoSell = false) {
  if (!isUnlocked(resId)) return 0;
  const qty = resources[resId].count;
  if (qty <= 0) return 0;

  // Apply ForgeCore sell value bonus
  const globalSellBonus = 1 + getForgeCoreBonusValue("globalSellValue");
  const cash = Math.floor(qty * resources[resId].sellPrice * globalSellBonus);
  addMoney(cash);
  stats.sold[resId] += qty;
  resources[resId].count = 0;
  stats.clicks.sell++;

  // TODO: Add visual effects for sell
  // if (isAutoSell) {
  //   createAutoSellEffects(resId, cash, qty);
  // } else {
  //   createSellPop(resId);
  // }

  // TODO: Update UI
  // updateUI();
  return cash;
}
