// Data Model Module

import iron from "../../resources/iron.js";
import copper from "../../resources/copper.js";
import nickel from "../../resources/nickel.js";
import bronze from "../../resources/bronze.js";
import silver from "../../resources/silver.js";
import cobalt from "../../resources/cobalt.js";
import gold from "../../resources/gold.js";
import palladium from "../../resources/palladium.js";
import platinum from "../../resources/platinum.js";
import titanium from "../../resources/titanium.js";
import adamantium from "../../resources/adamantium.js";
import { createShopItems } from "../../shop/items.js";

// Resource definitions
export const resources = {
  iron,
  copper,
  nickel,
  bronze,
  silver,
  cobalt,
  gold,
  palladium,
  platinum,
  titanium,
  adamantium,
  money: { id: "money", count: 0 },
  coreShards: { id: "coreShards", count: 0 },
};

// Shop items lazy initialization
export let shopItems;
export function ensureShopItemsInitialized() {
  if (!shopItems) {
    shopItems = createShopItems(resources);
  }
  return shopItems;
}

// List of resource IDs
export const RES_IDS = [
  "iron",
  "copper",
  "nickel",
  "bronze",
  "silver",
  "cobalt",
  "gold",
  "palladium",
  "platinum",
  "titanium",
  "adamantium",
];

// Global stats
export const stats = {
  mined: Object.fromEntries(RES_IDS.map((res) => [res, 0])),
  sold: Object.fromEntries(RES_IDS.map((res) => [res, 0])),
  earnedMoney: 0,
  spentMoney: 0,
  clicks: {
    mine: 0,
    sell: 0,
    shopBuy: 0,
    unlock: 0
  }
};
