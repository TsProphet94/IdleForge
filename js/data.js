// js/data.js - Game data models and state
import iron from "../resources/iron.js";
import copper from "../resources/copper.js";
import nickel from "../resources/nickel.js";
import bronze from "../resources/bronze.js";
import silver from "../resources/silver.js";
import cobalt from "../resources/cobalt.js";
import gold from "../resources/gold.js";
import palladium from "../resources/palladium.js";
import platinum from "../resources/platinum.js";
import titanium from "../resources/titanium.js";
import adamantium from "../resources/adamantium.js";
import { createShopItems } from "../shop/items.js";

/* ────────────────────────────────────────────────────────────────────────────
   DATA MODEL
──────────────────────────────────────────────────────────────────────────── */
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

// Initialize shop items with resources - declare but initialize later
export let shopItems;

// Helper function to ensure shop items are initialized
export function ensureShopItemsInitialized() {
  if (!shopItems) {
    shopItems = createShopItems(resources);
    console.log("Shop items lazy-initialized:", shopItems.length, "items");
    if (shopItems.length > 0) {
      console.log("Sample shop item:", shopItems[0]);
    } else {
      console.error("No shop items were created!");
    }
  }
  return shopItems;
}

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

/** Lifetime/global stats */
export const stats = {
  mined: {
    iron: 0,
    copper: 0,
    nickel: 0,
    bronze: 0,
    silver: 0,
    cobalt: 0,
    gold: 0,
    palladium: 0,
    platinum: 0,
    titanium: 0,
    adamantium: 0,
  },
  sold: {
    iron: 0,
    copper: 0,
    nickel: 0,
    bronze: 0,
    silver: 0,
    cobalt: 0,
    gold: 0,
    palladium: 0,
    platinum: 0,
    titanium: 0,
    adamantium: 0,
  },
  earnedMoney: 0,
  spentMoney: 0,
  clicks: { mine: 0, sell: 0, shopBuy: 0, unlock: 0 },
};

/* Unlock costs (balanced for 5-hour progression) */
export const UNLOCK_COST = {
  copper: 200000, // Base
  nickel: 800000, // 4x copper (early game)
  bronze: 3200000, // 4x nickel (early game)
  silver: 12800000, // 4x bronze (early game)
  cobalt: 76800000, // 6x silver (mid game start)
  gold: 460800000, // 6x cobalt (mid game)
  palladium: 2764800000, // 6x gold (mid game)
  platinum: 30412800000, // 11x palladium (late game start)
  titanium: 334540800000, // 11x platinum (late game)
  adamantium: 3679948800000, // 11x titanium (late game)
};

// Game state variables
export let gameStarted = false;
export let lastActive = Date.now();
export let debugMode = false;

// Export shopItems for external access - remove duplicate
// export { shopItems };

// Export functions to modify game state
export function setGameStarted(value) {
  gameStarted = value;
}

export function setLastActive(value) {
  lastActive = value;
}

export function setDebugMode(value) {
  debugMode = value;
}