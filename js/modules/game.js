// Core game logic module
import { resources, RES_IDS, shopItems, ensureShopItemsInitialized, stats } from './data.js';
import { coreUpgrades } from './state.js';
import { setText, fmt } from './helpers.js';
import { isUnlocked } from './helpers.js';

/** Add ore & track mined (this is for manual mining clicks) */
export function addOre(resId, amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources[resId].count += amount;
  stats.mined[resId] += amount;
}

/** Mine resource manually (including click tracking) */
export function mineResource(resId, amount = null) {
  if (!Number.isFinite(amount)) {
    amount = resources[resId].perClick;
  }
  addOre(resId, amount);
  stats.clicks.mine++;
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

/** Sell all resources of given type */
export function sellAll(resId, isAutoSell = false) {
  const resource = resources[resId];
  if (!resource || resource.count <= 0) return 0;

  // Apply ForgeCore sell value bonus
  const globalSellBonus = 1 + getForgeCoreBonusValue("globalSellValue");
  const totalValue = Math.floor(resource.count * resource.sellPrice * globalSellBonus);
  const quantity = resource.count;
  
  addMoney(totalValue);
  resource.count = 0;
  
  stats.sold[resId] += quantity;
  if (!isAutoSell) {
    stats.clicks.sell++;
  }
  
  console.log(`Sold ${quantity} ${resId} for $${totalValue}`);
  return totalValue;
}
