// ───────────────────────────────────────────────────────────────────────────
// DATA MODEL
// ───────────────────────────────────────────────────────────────────────────

// Resource IDs array
const RES_IDS = [
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

// Unlock costs (balanced for 5-hour progression)
const UNLOCK_COST = {
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

// Milestone constants
const MILESTONE_THRESHOLDS = [100, 1000, 10000, 100000, 1000000];
const MILESTONE_LABELS = ["100", "1K", "10K", "100K", "1M"];
const MILESTONE_MULTIPLIERS = [1.2, 1.5, 1.8, 2, 2.5];

// Track which rewards have been applied per resource & tier
const milestoneRewardsApplied = RES_IDS.reduce((acc, res) => {
  acc[res] = MILESTONE_THRESHOLDS.map(() => false);
  return acc;
}, {});

// Current multiplier factor for each resource
const milestoneMultipliers = RES_IDS.reduce((acc, res) => {
  acc[res] = 1;
  return acc;
}, {});

// Game state variables - using object to allow mutation across modules
const gameState = {
  currentResource: "iron",
  copperUnlocked: false,
  nickelUnlocked: false,
  bronzeUnlocked: false,
  silverUnlocked: false,
  cobaltUnlocked: false,
  goldUnlocked: false,
  palladiumUnlocked: false,
  platinumUnlocked: false,
  titaniumUnlocked: false,
  adamantiumUnlocked: false,
  prestigeUnlocked: false,
  gameStarted: false
};

// Lifetime/global stats
const stats = {
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

// Resources will be dynamically imported
let resources = {
  money: { id: "money", count: 0 },
  coreShards: { id: "coreShards", count: 0 },
};

// Shop items will be initialized lazily
let shopItems;

// Helper to check resource unlock status
function isUnlocked(resId) {
  switch (resId) {
    case "iron":
      return true;
    case "copper":
      return gameState.copperUnlocked;
    case "nickel":
      return gameState.nickelUnlocked;
    case "bronze":
      return gameState.bronzeUnlocked;
    case "silver":
      return gameState.silverUnlocked;
    case "cobalt":
      return gameState.cobaltUnlocked;
    case "gold":
      return gameState.goldUnlocked;
    case "palladium":
      return gameState.palladiumUnlocked;
    case "platinum":
      return gameState.platinumUnlocked;
    case "titanium":
      return gameState.titaniumUnlocked;
    case "adamantium":
      return gameState.adamantiumUnlocked;
    default:
      return false;
  }
}

// Add ore & track mined
function addOre(resId, amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  
  if (resources[resId]) {
    resources[resId].count += amount;
    stats.mined[resId] += amount;
  }
}

export {
  RES_IDS,
  UNLOCK_COST,
  MILESTONE_THRESHOLDS,
  MILESTONE_LABELS,
  MILESTONE_MULTIPLIERS,
  milestoneRewardsApplied,
  milestoneMultipliers,
  gameState,
  stats,
  resources,
  shopItems,
  isUnlocked,
  addOre
};