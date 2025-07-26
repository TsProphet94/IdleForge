// ───────────────────────────────────────────────────────────────────────────
// RESOURCE PANEL COLLAPSE/EXPAND
// ───────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".collapse-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const res = btn.getAttribute("data-res");
      const panel = document.querySelector(
        `.resource-panel[data-resource='${res}']`
      );
      if (!panel) return;
      panel.classList.toggle("collapsed");

      // Remove focus from button after click to prevent persistent styling
      setTimeout(() => {
        btn.blur();
      }, 200);

      // Persist collapsed state in localStorage
      try {
        const collapsed = panel.classList.contains("collapsed");
        localStorage.setItem(`panel-collapsed-${res}`, collapsed ? "1" : "0");
      } catch {}
    });
    // On load, restore collapsed state
    const res = btn.getAttribute("data-res");
    try {
      const collapsed = localStorage.getItem(`panel-collapsed-${res}`) === "1";
      if (collapsed) {
        const panel = document.querySelector(
          `.resource-panel[data-resource='${res}']`
        );
        if (panel) panel.classList.add("collapsed");
      }
    } catch {}
  });
});
// ───────────────────────────────────────────────────────────────────────────
// THEME SWITCHER
// ───────────────────────────────────────────────────────────────────────────
const themeSelect = document.getElementById("theme-select");
const themeClassList = [
  "theme-classic",
  "theme-midnight",
  "theme-emerald",
  "theme-sunset",
  "theme-neon-cyan",
  "theme-neon-purple",
  "theme-neon-pink",
  "theme-cyberpunk",
];

function setTheme(theme) {
  document.body.classList.remove(...themeClassList);
  if (theme !== "classic") {
    document.body.classList.add(`theme-${theme}`);
  } else {
    document.body.classList.add("theme-classic");
  }
  // Optionally, persist theme in localStorage
  try {
    localStorage.setItem("idleforge-theme", theme);
  } catch {}
}

if (themeSelect) {
  themeSelect.addEventListener("change", (e) => {
    setTheme(e.target.value);
  });
  // On load, set theme from localStorage or default
  let savedTheme = "classic";
  try {
    savedTheme = localStorage.getItem("idleforge-theme") || "classic";
  } catch {}
  setTheme(savedTheme);
  themeSelect.value = savedTheme;
}
// script.js — IdleForge core + GLOBAL TRACKERS + STATS TAB + FULL-SCREEN SHOP + MICRO-UPGRADES + BUY MAX (>=2 only, no cost shown)

/* eslint-disable no-undef */
import iron from "./resources/iron.js";
import copper from "./resources/copper.js";
import nickel from "./resources/nickel.js";
import bronze from "./resources/bronze.js";
import silver from "./resources/silver.js";
import cobalt from "./resources/cobalt.js";
import gold from "./resources/gold.js";
import palladium from "./resources/palladium.js";
import platinum from "./resources/platinum.js"; // New resource
import titanium from "./resources/titanium.js";
import adamantium from "./resources/adamantium.js";
import { shopItems } from "./shop/items.js";

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
  platinum, // New resource
  titanium,
  adamantium,
  money: { id: "money", count: 0 },
};
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
const UNLOCK_COST = {
  copper: 50000, // Base
  nickel: 200000, // 4x copper (early game)
  bronze: 800000, // 4x nickel (early game)
  silver: 3200000, // 4x bronze (early game)
  cobalt: 19200000, // 6x silver (mid game start)
  gold: 115200000, // 6x cobalt (mid game)
  palladium: 691200000, // 6x gold (mid game)
  platinum: 7603200000, // 11x palladium (late game start)
  titanium: 83635200000, // 11x platinum (late game)
  adamantium: 920187200000, // 11x titanium (late game)
};

/* ────────────────────────────────────────────────────────────────────────────
   UI ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
const ironCountEl = document.getElementById("iron-count");
const copperCountEl = document.getElementById("copper-count");
const nickelCountEl = document.getElementById("nickel-count");
const bronzeCountEl = document.getElementById("bronze-count");
const silverCountEl = document.getElementById("silver-count");
const cobaltCountEl = document.getElementById("cobalt-count");
const goldCountEl = document.getElementById("gold-count");
const palladiumCountEl = document.getElementById("palladium-count");
const platinumCountEl = document.getElementById("platinum-count"); // New resource
const titaniumCountEl = document.getElementById("titanium-count");
const adamantiumCountEl = document.getElementById("adamantium-count");
const moneyCountEl = document.getElementById("money-count");

const shopList = document.getElementById("shop-list");
const resourceTabs = document.querySelectorAll(".resource-tab");

const tabMine = document.getElementById("tab-mine");
const tabShop = document.getElementById("tab-shop");
const tabStats = document.getElementById("tab-stats");

const screenMine = document.getElementById("screen-mine");
const screenShop = document.getElementById("screen-shop");
const screenStats = document.getElementById("screen-stats");

const overlay = document.getElementById("overlay") || null;

/* Mine / Sell buttons */
const mineIronBtn = document.getElementById("mine-iron-btn");
const sellIronBtn = document.getElementById("sell-iron-btn");
const mineCopperBtn = document.getElementById("mine-copper-btn");
const sellCopperBtn = document.getElementById("sell-copper-btn");
const mineNickelBtn = document.getElementById("mine-nickel-btn");
const sellNickelBtn = document.getElementById("sell-nickel-btn");
const mineBronzeBtn = document.getElementById("mine-bronze-btn");
const sellBronzeBtn = document.getElementById("sell-bronze-btn");
const mineSilverBtn = document.getElementById("mine-silver-btn");
const sellSilverBtn = document.getElementById("sell-silver-btn");
const mineCobaltBtn = document.getElementById("mine-cobalt-btn");
const sellCobaltBtn = document.getElementById("sell-cobalt-btn");
const mineGoldBtn = document.getElementById("mine-gold-btn");
const sellGoldBtn = document.getElementById("sell-gold-btn");
const minePalladiumBtn = document.getElementById("mine-palladium-btn");
const sellPalladiumBtn = document.getElementById("sell-palladium-btn");
const minePlatinumBtn = document.getElementById("mine-platinum-btn"); // New resource
const sellPlatinumBtn = document.getElementById("sell-platinum-btn"); // New resource
const mineTitaniumBtn = document.getElementById("mine-titanium-btn");
const sellTitaniumBtn = document.getElementById("sell-titanium-btn");
const mineAdamantiumBtn = document.getElementById("mine-adamantium-btn");
const sellAdamantiumBtn = document.getElementById("sell-adamantium-btn");

/* Menus / Save */
const mainMenu = document.getElementById("main-menu");
const settingsMenu = document.getElementById("settings-menu");
const gameUI = document.getElementById("game-ui");
const btnContinue = document.getElementById("btn-continue");
const btnNewGame = document.getElementById("btn-new");
const btnSettings = document.getElementById("btn-settings");
const btnBackToMenu = document.getElementById("btn-back-to-menu");
const toggleAutoSave = document.getElementById("toggle-auto-save");
const btnSaveMenu = document.getElementById("btn-save-menu");
const saveIndicator = document.getElementById("save-indicator");

/* Dev tools */
const isDev = false;
const devPanel = document.getElementById("dev-panel");
const devAddIron = document.getElementById("dev-add-iron");
const devAddCopper = document.getElementById("dev-add-copper");
const devAddNickel = document.getElementById("dev-add-nickel");
const devAddBronze = document.getElementById("dev-add-bronze");
const devAddSilver = document.getElementById("dev-add-silver");
const devAddCobalt = document.getElementById("dev-add-cobalt");
const devAddGold = document.getElementById("dev-add-gold");
const devAddPalladium = document.getElementById("dev-add-palladium");
const devAddPlatinum = document.getElementById("dev-add-platinum"); // New resource
const devAddTitanium = document.getElementById("dev-add-titanium");
const devAddAdamantium = document.getElementById("dev-add-adamantium");
const devAddMoney = document.getElementById("dev-add-money");

if (devPanel) devPanel.classList.toggle("hidden", !isDev);
if (isDev) {
  devAddIron?.addEventListener("click", () => {
    addOre("iron", 10000);
    updateUI();
  });
  devAddCopper?.addEventListener("click", () => {
    addOre("copper", 10000);
    updateUI();
  });
  devAddNickel?.addEventListener("click", () => {
    addOre("nickel", 10000);
    updateUI();
  });
  devAddBronze?.addEventListener("click", () => {
    addOre("bronze", 10000);
    updateUI();
  });
  devAddSilver?.addEventListener("click", () => {
    addOre("silver", 10000);
    updateUI();
  });
  devAddCobalt?.addEventListener("click", () => {
    addOre("cobalt", 10000);
    updateUI();
  });
  devAddGold?.addEventListener("click", () => {
    addOre("gold", 10000);
    updateUI();
  });
  devAddPalladium?.addEventListener("click", () => {
    addOre("palladium", 10000);
    updateUI();
  });
  devAddPlatinum?.addEventListener("click", () => {
    addOre("platinum", 10000);
    updateUI();
  });
  devAddTitanium?.addEventListener("click", () => {
    addOre("titanium", 10000);
    updateUI();
  });
  devAddAdamantium?.addEventListener("click", () => {
    addOre("adamantium", 10000);
    updateUI();
  });
  devAddMoney?.addEventListener("click", () => {
    addMoney(100000000);
    updateUI();
  });
}

/* ────────────────────────────────────────────────────────────────────────────
   AUTO-SELL STATE
──────────────────────────────────────────────────────────────────────────── */
const autoSellTimers = {};
const countdownTimers = {};
const nextSellTimes = {};
const autoSellIntervals = {};

/* ────────────────────────────────────────────────────────────────────────────
   GAME STATE
──────────────────────────────────────────────────────────────────────────── */
let currentResource = "iron";
let copperUnlocked = false;
let nickelUnlocked = false;
let bronzeUnlocked = false;
let silverUnlocked = false;
let cobaltUnlocked = false;
let goldUnlocked = false;
let palladiumUnlocked = false;
let platinumUnlocked = false; // New resource
let titaniumUnlocked = false;
let adamantiumUnlocked = false;

let autoSaveInterval = null;
let gameStarted = false;

/* ────────────────────────────────────────────────────────────────────────────
   INITIAL UI
──────────────────────────────────────────────────────────────────────────── */
screenShop.classList.add("hidden");
if (overlay) overlay.classList.add("hidden");
tabMine.classList.add("active");

mineCopperBtn.disabled = sellCopperBtn.disabled = true;
mineNickelBtn.disabled = sellNickelBtn.disabled = true;
mineBronzeBtn.disabled = sellBronzeBtn.disabled = true;
mineSilverBtn.disabled = sellSilverBtn.disabled = true;
mineCobaltBtn.disabled = sellCobaltBtn.disabled = true;
mineGoldBtn.disabled = sellGoldBtn.disabled = true;
minePalladiumBtn.disabled = sellPalladiumBtn.disabled = true;
minePlatinumBtn.disabled = sellPlatinumBtn.disabled = true; // New resource
mineTitaniumBtn.disabled = sellTitaniumBtn.disabled = true;
mineAdamantiumBtn.disabled = sellAdamantiumBtn.disabled = true;

/* ────────────────────────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────────────────────── */
function fmt(num) {
  if (num > 0 && num < 10) return num.toPrecision(2);
  if (num < 1_000) return Math.floor(num).toString();
  if (num < 1_000_000)
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  if (num < 1_000_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (num < 1_000_000_000_000)
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b";
  return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") + "t";
}
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = fmt(value || 0);
}
function isUnlocked(resId) {
  switch (resId) {
    case "iron":
      return true;
    case "copper":
      return copperUnlocked;
    case "nickel":
      return nickelUnlocked;
    case "bronze":
      return bronzeUnlocked;
    case "silver":
      return silverUnlocked;
    case "cobalt":
      return cobaltUnlocked;
    case "gold":
      return goldUnlocked;
    case "palladium":
      return palladiumUnlocked;
    case "platinum":
      return platinumUnlocked; // New resource
    case "titanium":
      return titaniumUnlocked;
    case "adamantium":
      return adamantiumUnlocked;
    default:
      return false;
  }
}

/** Add ore & track mined */
function addOre(resId, amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources[resId].count += amount;
  stats.mined[resId] += amount;
}
/** Add money gained */
function addMoney(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.money.count += amount;
  stats.earnedMoney += amount;
}
/** Spend money */
function spendMoney(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.money.count -= amount;
  stats.spentMoney += amount;
}

/** Sell all */
function sellAll(resId) {
  if (!isUnlocked(resId)) return 0;
  const qty = resources[resId].count;
  if (qty <= 0) return 0;
  const cash = Math.floor(qty * resources[resId].sellPrice);
  addMoney(cash);
  stats.sold[resId] += qty;
  resources[resId].count = 0;
  stats.clicks.sell++;
  createSellPop(resId);
  updateUI();
  return cash;
}
/** Manual mine */
function mineResource(resId) {
  if (!isUnlocked(resId)) return;
  const gain = resources[resId].perClick;
  addOre(resId, gain);
  stats.clicks.mine++;
  updateUI();
}

/* ────────────────────────────────────────────────────────────────────────────
   BULK BUY HELPERS
──────────────────────────────────────────────────────────────────────────── */
function bulkCost(item, n) {
  const a = item.basePrice * Math.pow(item.scale, item.count);
  if (item.scale === 1) return Math.floor(a * n);
  return Math.floor((a * (Math.pow(item.scale, n) - 1)) / (item.scale - 1));
}
function bulkAffordable(item, money) {
  const a = item.basePrice * Math.pow(item.scale, item.count);
  if (item.scale === 1) {
    return Math.max(0, Math.min(item.max - item.count, Math.floor(money / a)));
  }
  const n = Math.floor(
    Math.log(1 + (money * (item.scale - 1)) / a) / Math.log(item.scale)
  );
  return Math.max(0, Math.min(n, item.max - item.count));
}
function buyMaxCount(item) {
  return bulkAffordable(item, resources.money.count);
}
// Keeping this in case you want to show cost somewhere else later
function buyMaxCost(item) {
  const n = buyMaxCount(item);
  return n > 0 ? bulkCost(item, n) : 0;
}

/* ────────────────────────────────────────────────────────────────────────────
   STATS UI & MILESTONES
──────────────────────────────────────────────────────────────────────────── */
function updateStatsUI() {
  setText("stat-earned", stats.earnedMoney);
  setText("stat-spent", stats.spentMoney);
  setText("stat-net", stats.earnedMoney - stats.spentMoney);

  RES_IDS.forEach((res) => {
    setText(`stat-mined-${res}`, stats.mined[res]);
    setText(`stat-sold-${res}`, stats.sold[res]);
  });

  setText("stat-click-mine", stats.clicks.mine);
  setText("stat-click-sell", stats.clicks.sell);
  setText("stat-click-shop", stats.clicks.shopBuy);
  setText("stat-click-unlock", stats.clicks.unlock);

  // Highscore calculation: sum of earned money, mined resources, and milestones
  const minedTotal = RES_IDS.reduce(
    (sum, res) => sum + (stats.mined[res] || 0),
    0
  );
  const milestoneScore = RES_IDS.reduce((sum, res) => {
    let idx = 0;
    for (let i = MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
      if ((stats.mined[res] || 0) >= MILESTONE_THRESHOLDS[i]) {
        idx = i + 1;
        break;
      }
    }
    return sum + idx * 1000;
  }, 0);
  const score = Math.floor(stats.earnedMoney + minedTotal * 2 + milestoneScore);
  // Save and display highscore
  let highscore = 0;
  try {
    highscore = parseInt(localStorage.getItem("idleMinerHighscore") || "0", 10);
  } catch {}
  if (score > highscore) {
    highscore = score;
    try {
      localStorage.setItem("idleMinerHighscore", highscore);
    } catch {}
  }
  setText("stat-highscore", highscore);

  // Apply any newly reached milestones before showing list
  applyMilestoneRewards();
  updateMilestoneList();
}

// Milestone logic
const MILESTONE_THRESHOLDS = [100, 1000, 10000, 100000, 1000000];
const MILESTONE_LABELS = ["100", "1K", "10K", "100K", "1M"];

// Multipliers for each milestone tier
const MILESTONE_MULTIPLIERS = [1.2, 1.5, 2, 3, 5];

// Track which rewards have been applied per resource & tier
export const milestoneRewardsApplied = RES_IDS.reduce((acc, res) => {
  acc[res] = MILESTONE_THRESHOLDS.map(() => false);
  return acc;
}, {});
// Current multiplier factor for each resource
export const milestoneMultipliers = RES_IDS.reduce((acc, res) => {
  acc[res] = 1;
  return acc;
}, {});

/** Grant autominer rate boosts when milestones are reached */
function applyMilestoneRewards() {
  RES_IDS.forEach((res) => {
    // Determine the highest milestone achieved for this resource
    let topMultiplier = 1;
    for (let i = MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (stats.mined[res] >= MILESTONE_THRESHOLDS[i]) {
        topMultiplier = MILESTONE_MULTIPLIERS[i];
        break;
      }
    }
    // Apply only the highest-tier multiplier
    milestoneMultipliers[res] = topMultiplier;
  });
}

const milestoneList = document.getElementById("milestone-list");

function updateMilestoneList() {
  if (!milestoneList) return;
  milestoneList.innerHTML = "";
  RES_IDS.forEach((res) => {
    if (!isUnlocked(res)) return;
    const mined = stats.mined[res] || 0;
    // Find the highest achieved milestone index for this resource
    let currentMilestoneIdx = -1;
    for (let i = MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (mined >= MILESTONE_THRESHOLDS[i]) {
        currentMilestoneIdx = i;
        break;
      }
    }
    // Create a container for each resource
    const section = document.createElement("div");
    section.className = "milestone-resource-section";
    section.innerHTML = `<h4 class=\"milestone-resource-title\">${
      res.charAt(0).toUpperCase() + res.slice(1)
    }</h4>`;
    const ul = document.createElement("ul");
    ul.className = "milestone-resource-list";
    let nextShown = false;
    MILESTONE_THRESHOLDS.forEach((threshold, i) => {
      const achieved = mined >= threshold;
      // Calculate progress for this milestone
      let progress = 0;
      if (achieved) {
        progress = 1;
      } else if (i === 0) {
        progress = Math.max(0, Math.min(1, mined / threshold));
      } else {
        const prev = MILESTONE_THRESHOLDS[i - 1];
        progress = Math.max(
          0,
          Math.min(1, (mined - prev) / (threshold - prev))
        );
      }
      if (achieved || (!nextShown && !achieved)) {
        const li = document.createElement("li");
        li.className = achieved ? "milestone-achieved" : "";
        // Progress bar background
        const bar = document.createElement("div");
        bar.className = "milestone-progress-bar";
        const fill = document.createElement("div");
        fill.className = "milestone-progress-fill";
        fill.style.width = progress * 100 + "%";
        bar.appendChild(fill);
        li.appendChild(bar);
        // Milestone content
        const content = document.createElement("div");
        content.className = "milestone-content";
        let indicator = "";
        // Show multiplier indicator for the current active milestone
        if (i === currentMilestoneIdx && currentMilestoneIdx !== -1) {
          indicator = `<span class=\"milestone-multiplier-indicator\" style=\"margin-left:0.7em;color:#ffd93d;font-weight:700;\">${MILESTONE_MULTIPLIERS[i]}x minerate</span>`;
        }
        // Show next milestone reward for the next milestone (if not achieved and is the next milestone)
        let nextIndicator = "";
        if (
          !achieved &&
          i === currentMilestoneIdx + 1 &&
          i < MILESTONE_MULTIPLIERS.length
        ) {
          nextIndicator = `<span class=\"milestone-next-indicator\" style=\"margin-left:0.7em;color:#b3b3b3;font-weight:600;\">${MILESTONE_MULTIPLIERS[i]}x minerate</span>`;
        }
        content.innerHTML = `
          <span class=\"milestone-badge\">${MILESTONE_LABELS[i]}</span> ${
          res.charAt(0).toUpperCase() + res.slice(1)
        } mined: <strong>${threshold.toLocaleString()}</strong> ${indicator} ${nextIndicator}
        `;
        li.appendChild(content);
        ul.appendChild(li);
        if (!achieved) nextShown = true;
      }
    });
    section.appendChild(ul);
    milestoneList.appendChild(section);
  });
}

// Stats tab switching
document.addEventListener("DOMContentLoaded", () => {
  const tabBtns = document.querySelectorAll(".stats-tab-btn");
  const mainTab = document.getElementById("stats-main-tab");
  const milestonesTab = document.getElementById("stats-milestones-tab");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (btn.dataset.tab === "main") {
        mainTab.classList.remove("hidden");
        milestonesTab.classList.add("hidden");
      } else {
        mainTab.classList.add("hidden");
        milestonesTab.classList.remove("hidden");
        updateMilestoneList();
      }
    });
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   BUTTON LISTENERS
──────────────────────────────────────────────────────────────────────────── */
mineIronBtn.addEventListener("click", () => mineResource("iron"));
sellIronBtn.addEventListener("click", () => sellAll("iron"));
mineCopperBtn.addEventListener("click", () => mineResource("copper"));
sellCopperBtn.addEventListener("click", () => sellAll("copper"));
mineNickelBtn.addEventListener("click", () => mineResource("nickel"));
sellNickelBtn.addEventListener("click", () => sellAll("nickel"));
mineBronzeBtn.addEventListener("click", () => mineResource("bronze"));
sellBronzeBtn.addEventListener("click", () => sellAll("bronze"));
mineSilverBtn.addEventListener("click", () => mineResource("silver"));
sellSilverBtn.addEventListener("click", () => sellAll("silver"));
mineCobaltBtn.addEventListener("click", () => mineResource("cobalt"));
sellCobaltBtn.addEventListener("click", () => sellAll("cobalt"));
mineGoldBtn.addEventListener("click", () => mineResource("gold"));
sellGoldBtn.addEventListener("click", () => sellAll("gold"));
minePalladiumBtn.addEventListener("click", () => mineResource("palladium"));
sellPalladiumBtn.addEventListener("click", () => sellAll("palladium"));
minePlatinumBtn.addEventListener("click", () => mineResource("platinum")); // New resource
sellPlatinumBtn.addEventListener("click", () => sellAll("platinum")); // New resource
mineTitaniumBtn.addEventListener("click", () => mineResource("titanium"));
sellTitaniumBtn.addEventListener("click", () => sellAll("titanium"));
mineAdamantiumBtn.addEventListener("click", () => mineResource("adamantium"));
sellAdamantiumBtn.addEventListener("click", () => sellAll("adamantium"));

/* ────────────────────────────────────────────────────────────────────────────
   AUTO-MINE LOOP
──────────────────────────────────────────────────────────────────────────── */
setInterval(() => {
  // 10 ticks/sec
  RES_IDS.forEach((id) => {
    if (!isUnlocked(id)) return;
    const gain = (resources[id].perSecond * milestoneMultipliers[id]) / 10;
    if (gain > 0) addOre(id, gain);
  });

  updateUI();

  if (!screenStats.classList.contains("hidden")) updateStatsUI();
  if (!screenShop.classList.contains("hidden")) updateShopButtons();
}, 100);

/* ────────────────────────────────────────────────────────────────────────────
   UNLOCK LOGIC (FIXED)
──────────────────────────────────────────────────────────────────────────── */
function attemptUnlock(res) {
  const cost = UNLOCK_COST[res];
  if (resources.money.count < cost) {
    alert(
      `You need $${fmt(cost)} to unlock ${res[0].toUpperCase() + res.slice(1)}!`
    );
    return;
  }
  spendMoney(cost);
  stats.clicks.unlock++;

  if (res === "copper") unlockCopperUI();
  if (res === "nickel") unlockNickelUI();
  if (res === "bronze") unlockBronzeUI();
  if (res === "silver") unlockSilverUI();
  if (res === "cobalt") unlockCobaltUI();
  if (res === "gold") unlockGoldUI();
  if (res === "palladium") unlockPalladiumUI();
  if (res === "platinum") unlockPlatinumUI(); // New resource
  if (res === "titanium") unlockTitaniumUI();
  if (res === "adamantium") unlockAdamantiumUI();

  updateUI();
  updateStatsUI();
}

/** Always recreate overlay/button for a locked resource */
function relockResource(res) {
  const panel = document.querySelector(
    `.resource-panel[data-resource="${res}"]`
  );
  if (!panel) return;

  panel.classList.add("locked");
  panel.classList.add("collapsed");

  const old = document.getElementById(`lock-overlay-${res}`);
  if (old) old.remove();

  const lockOverlay = document.createElement("div");
  lockOverlay.className = "lock-overlay";
  lockOverlay.id = `lock-overlay-${res}`;
  lockOverlay.innerHTML = `
    <button id="unlock-${res}-btn">
      Unlock ${res[0].toUpperCase() + res.slice(1)} ($${fmt(UNLOCK_COST[res])})
    </button>
  `;
  panel.appendChild(lockOverlay);

  document
    .getElementById(`unlock-${res}-btn`)
    .addEventListener("click", () => attemptUnlock(res));
}

/* ────────────────────────────────────────────────────────────────────────────
   SHOP
──────────────────────────────────────────────────────────────────────────── */
// Click handler supports Buy 1 & Buy Max
shopList.addEventListener("click", (e) => {
  const isMax = e.target.classList.contains("shop-btn-max");
  const isBuy = e.target.classList.contains("shop-btn") && !isMax;
  if (!isMax && !isBuy) return;

  const id = e.target.dataset.itemId || e.target.id;
  const item = shopItems.find((i) => i.id === id);
  if (!item) return;

  let n = 1;
  if (isMax) {
    n = buyMaxCount(item);
    if (n <= 0) return;
  }

  const cost = isMax ? bulkCost(item, n) : item.price;
  if (resources.money.count < cost) return;

  spendMoney(cost);
  stats.clicks.shopBuy += n;

  for (let i = 0; i < n; i++) item.apply();

  item.count += n;
  item.price = Math.floor(item.basePrice * Math.pow(item.scale, item.count));

  updateUI();
  renderShop();
  // Apply milestone rewards on shop purchase
  applyMilestoneRewards();
  // Refresh UI & stats so new autominer rates show immediately
  updateUI();
  updateStatsUI();

  if (item.id.endsWith("-autoseller")) {
    const resId = item.category;
    document.getElementById(`sell-timer-${resId}`)?.classList.remove("hidden");
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) {
      toggle.checked = true;
      startAutoSell(resId);
    }
  }
});

/* Resource filter tabs inside shop */
resourceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const res = tab.dataset.resource;
    if (!RES_IDS.includes(res)) return;

    if (!isUnlocked(res)) {
      attemptUnlock(res);
      return;
    }

    currentResource = res;
    resourceTabs.forEach((t) => t.classList.toggle("active", t === tab));
    switchResource(currentResource);
  });
});

/* TOP NAV TABS */
tabMine.addEventListener("click", () => showScreen("mine"));
tabShop.addEventListener("click", () => showScreen("shop"));
tabStats.addEventListener("click", () => showScreen("stats"));

// Track scroll positions for mine and shop screens (using window scroll if screens are not independently scrollable)
let mineScrollY = 0;
let shopScrollY = 0;

function showScreen(which) {
  // Save scroll position for the current screen
  if (!screenMine.classList.contains("hidden")) {
    mineScrollY = window.scrollY;
  }
  if (!screenShop.classList.contains("hidden")) {
    shopScrollY = window.scrollY;
  }

  tabMine.classList.remove("active");
  tabShop.classList.remove("active");
  tabStats.classList.remove("active");

  screenMine.classList.add("hidden");
  screenShop.classList.add("hidden");
  screenStats.classList.add("hidden");

  switch (which) {
    case "mine":
      tabMine.classList.add("active");
      screenMine.classList.remove("hidden");
      // Restore mine scroll position
      setTimeout(() => window.scrollTo(0, mineScrollY), 0);
      break;
    case "shop":
      tabShop.classList.add("active");
      screenShop.classList.remove("hidden");
      renderShop();
      // Restore shop scroll position
      setTimeout(() => window.scrollTo(0, shopScrollY), 0);
      break;
    case "stats":
      tabStats.classList.add("active");
      screenStats.classList.remove("hidden");
      updateStatsUI();
      break;
  }
  // Removed analytics tracking
}

function switchResource(res) {
  document
    .querySelectorAll(".resource-panel")
    .forEach((panel) =>
      panel.classList.toggle("active", panel.dataset.resource === res)
    );
  renderShop();
  updateUI();
}

/** Update only dynamic bits in existing cards (price, button, bar) */
function updateShopButtons() {
  shopItems
    .filter((item) => item.category === currentResource)
    .forEach((item) => {
      const buyBtn = document.querySelector(
        `.shop-btn[data-item-id="${item.id}"]:not(.shop-btn-max)`
      );
      if (buyBtn) {
        const canAfford = resources.money.count >= item.price;
        buyBtn.disabled = !canAfford || item.count >= item.max;
        buyBtn.textContent = item.count >= item.max ? "Maxed" : "Buy";
      }

      const maxBtn = document.querySelector(
        `.shop-btn-max[data-item-id="${item.id}"]`
      );
      if (maxBtn) {
        const maxN = buyMaxCount(item);
        const locked = item.count >= item.max;
        maxBtn.disabled = locked || maxN < 2;
        maxBtn.textContent = locked
          ? "Maxed"
          : maxN >= 2
          ? `Buy Max (${maxN})`
          : "Buy Max";
      }

      const priceEl = document.getElementById(`price-${item.id}`);
      if (priceEl) priceEl.textContent = `$${fmt(item.price)}`;
      const ownedEl = document.getElementById(`owned-${item.id}`);
      if (ownedEl) ownedEl.textContent = `${item.count}/${item.max}`;
      const barEl = document.getElementById(`bar-${item.id}`);
      if (barEl) barEl.style.width = (item.count / item.max) * 100 + "%";
    });
}

/** Build the shop list with descriptions */
function renderShop() {
  if (!shopList) return;

  const items = shopItems.filter((i) => i.category === currentResource);
  if (!items.length) {
    shopList.innerHTML = `<li class="shop-empty">No upgrades for "${currentResource}"</li>`;
    return;
  }

  const frag = document.createDocumentFragment();

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "shop-card";
    li.dataset.itemId = item.id;

    const pct = (item.count / item.max) * 100;

    li.innerHTML = `
      <div class="shop-item-head">
        <span class="shop-item-name">${item.name}</span>
        <span class="shop-item-price" id="price-${item.id}">$${fmt(
      item.price
    )}</span>
      </div>

      <p class="shop-item-desc">${item.description || ""}</p>

      <div class="shop-bar">
        <div class="shop-bar-fill" id="bar-${
          item.id
        }" style="width:${pct}%;"></div>
      </div>

      <div class="shop-item-meta">
        <span id="owned-${item.id}">${item.count}/${item.max}</span>
        <span class="cat">${item.category}</span>
      </div>
    `;

    const btnRow = document.createElement("div");
    btnRow.className = "shop-btn-row";

    const btn = document.createElement("button");
    btn.className = "shop-btn";
    btn.dataset.itemId = item.id;
    btn.textContent = item.count >= item.max ? "Maxed" : "Buy";
    btn.disabled = resources.money.count < item.price || item.count >= item.max;

    const btnMax = document.createElement("button");
    btnMax.className = "shop-btn shop-btn-max";
    btnMax.dataset.itemId = item.id;
    const maxN = buyMaxCount(item);
    const locked = item.count >= item.max;
    btnMax.disabled = locked || maxN < 2;
    btnMax.textContent = locked
      ? "Maxed"
      : maxN >= 2
      ? `Buy Max (${maxN})`
      : "Buy Max";

    btnRow.appendChild(btn);
    btnRow.appendChild(btnMax);
    li.appendChild(btnRow);

    frag.appendChild(li);
  });

  shopList.innerHTML = "";
  shopList.appendChild(frag);
  // Attach auto-sell toggle listeners after shop is rendered
  RES_IDS.forEach((resId) => {
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) {
      toggle.removeEventListener(
        "change",
        toggle._autoSellHandler || (() => {})
      );
      toggle._autoSellHandler = function (e) {
        if (e.target.checked) {
          startAutoSell(resId);
        } else {
          stopAutoSell(resId);
        }
      };
      toggle.addEventListener("change", toggle._autoSellHandler);
    }
  });
}

/* ────────────────────────────────────────────────────────────────────────────
   GENERAL UI UPDATE
──────────────────────────────────────────────────────────────────────────── */
function updateUI() {
  ironCountEl.textContent = fmt(resources.iron.count);
  copperCountEl.textContent = fmt(resources.copper.count);
  nickelCountEl.textContent = fmt(resources.nickel.count || 0);
  bronzeCountEl.textContent = fmt(resources.bronze.count);
  silverCountEl.textContent = fmt(resources.silver.count);
  cobaltCountEl.textContent = fmt(resources.cobalt.count || 0);
  goldCountEl.textContent = fmt(resources.gold.count);
  palladiumCountEl.textContent = fmt(resources.palladium.count || 0);
  platinumCountEl.textContent = fmt(resources.platinum.count || 0); // New resource
  titaniumCountEl.textContent = fmt(resources.titanium.count || 0);
  adamantiumCountEl.textContent = fmt(resources.adamantium.count || 0);

  // Update resource price tags (show only if unlocked)
  RES_IDS.forEach((res) => {
    const pricetag = document.getElementById(`pricetag-${res}`);
    if (pricetag) {
      if (isUnlocked(res)) {
        pricetag.style.display = "inline-block";
        pricetag.textContent = `$${fmt(resources[res].sellPrice)}`;
      } else {
        pricetag.style.display = "none";
      }
    }
  });

  // Animate money counter box if it increases
  if (!updateUI.lastMoney) updateUI.lastMoney = resources.money.count;
  const prevMoney = updateUI.lastMoney;
  const newMoney = resources.money.count;
  moneyCountEl.textContent = `$${fmt(newMoney)}`;
  const moneyBox = document.getElementById("money-display");
  if (newMoney > prevMoney && moneyBox) {
    moneyBox.classList.remove("money-bounce");
    // Force reflow to restart animation
    void moneyBox.offsetWidth;
    moneyBox.classList.add("money-bounce");
  }
  updateUI.lastMoney = newMoney;

  sellIronBtn.disabled = resources.iron.count <= 0;
  sellCopperBtn.disabled = resources.copper.count <= 0;
  sellNickelBtn.disabled = resources.nickel.count <= 0;
  sellBronzeBtn.disabled = resources.bronze.count <= 0;
  sellSilverBtn.disabled = resources.silver.count <= 0;
  sellCobaltBtn.disabled = resources.cobalt.count <= 0;
  sellGoldBtn.disabled = resources.gold.count <= 0;
  sellPalladiumBtn.disabled = resources.palladium.count <= 0;
  sellPlatinumBtn.disabled = resources.platinum.count <= 0; // New resource
  sellTitaniumBtn.disabled = resources.titanium.count <= 0;
  sellAdamantiumBtn.disabled = resources.adamantium.count <= 0;

  setText(
    "auto-rate-iron",
    resources.iron.perSecond * milestoneMultipliers.iron
  );
  // Update collapsed automine display with formatted value + "/s"
  const collapsedAutoIron = document.getElementById("collapsed-auto-iron");
  if (collapsedAutoIron) {
    const rate = resources.iron.perSecond * milestoneMultipliers.iron || 0;
    collapsedAutoIron.textContent = fmt(rate) + "/s";
  }
  setText(
    "auto-rate-copper",
    resources.copper.perSecond * milestoneMultipliers.copper
  );
  const collapsedAutoCopper = document.getElementById("collapsed-auto-copper");
  if (collapsedAutoCopper) {
    const rate = resources.copper.perSecond * milestoneMultipliers.copper || 0;
    collapsedAutoCopper.textContent = fmt(rate) + "/s";
  }
  setText(
    "auto-rate-nickel",
    resources.nickel.perSecond * milestoneMultipliers.nickel
  );
  const collapsedAutoNickel = document.getElementById("collapsed-auto-nickel");
  if (collapsedAutoNickel) {
    const rate = resources.nickel.perSecond * milestoneMultipliers.nickel || 0;
    collapsedAutoNickel.textContent = fmt(rate) + "/s";
  }
  setText(
    "auto-rate-bronze",
    resources.bronze.perSecond * milestoneMultipliers.bronze
  );
  const collapsedAutoBronze = document.getElementById("collapsed-auto-bronze");
  if (collapsedAutoBronze) {
    const rate = resources.bronze.perSecond * milestoneMultipliers.bronze || 0;
    collapsedAutoBronze.textContent = fmt(rate) + "/s";
  }
  setText(
    "auto-rate-silver",
    resources.silver.perSecond * milestoneMultipliers.silver
  );
  const collapsedAutoSilver = document.getElementById("collapsed-auto-silver");
  if (collapsedAutoSilver) {
    const rate = resources.silver.perSecond * milestoneMultipliers.silver || 0;
    collapsedAutoSilver.textContent = fmt(rate) + "/s";
  }
  setText(
    "auto-rate-cobalt",
    resources.cobalt.perSecond * milestoneMultipliers.cobalt
  );
  const collapsedAutoCobalt = document.getElementById("collapsed-auto-cobalt");
  if (collapsedAutoCobalt) {
    const rate = resources.cobalt.perSecond * milestoneMultipliers.cobalt || 0;
    collapsedAutoCobalt.textContent = fmt(rate) + "/s";
  }
  setText(
    "auto-rate-gold",
    resources.gold.perSecond * milestoneMultipliers.gold
  );
  const collapsedAutoGold = document.getElementById("collapsed-auto-gold");
  if (collapsedAutoGold) {
    const rate = resources.gold.perSecond * milestoneMultipliers.gold || 0;
    collapsedAutoGold.textContent = fmt(rate) + "/s";
  }
  setText(
    "auto-rate-palladium",
    resources.palladium.perSecond * milestoneMultipliers.palladium
  );
  const collapsedAutoPalladium = document.getElementById(
    "collapsed-auto-palladium"
  );
  if (collapsedAutoPalladium) {
    const rate =
      resources.palladium.perSecond * milestoneMultipliers.palladium || 0;
    collapsedAutoPalladium.textContent = fmt(rate) + "/s";
  }
  setText(
    "auto-rate-platinum",
    resources.platinum.perSecond * milestoneMultipliers.platinum
  ); // New resource
  const collapsedAutoPlatinum = document.getElementById(
    "collapsed-auto-platinum"
  );
  if (collapsedAutoPlatinum) {
    const rate =
      resources.platinum.perSecond * milestoneMultipliers.platinum || 0;
    collapsedAutoPlatinum.textContent = fmt(rate) + "/s";
  }
  setText(
    "auto-rate-titanium",
    resources.titanium.perSecond * milestoneMultipliers.titanium
  );
  const collapsedAutoTitanium = document.getElementById(
    "collapsed-auto-titanium"
  );
  if (collapsedAutoTitanium) {
    const rate =
      resources.titanium.perSecond * milestoneMultipliers.titanium || 0;
    collapsedAutoTitanium.textContent = fmt(rate) + "/s";
  }
  setText(
    "auto-rate-adamantium",
    resources.adamantium.perSecond * milestoneMultipliers.adamantium
  );
  const collapsedAutoAdamantium = document.getElementById(
    "collapsed-auto-adamantium"
  );
  if (collapsedAutoAdamantium) {
    const rate =
      resources.adamantium.perSecond * milestoneMultipliers.adamantium || 0;
    collapsedAutoAdamantium.textContent = fmt(rate) + "/s";
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   EFFECTS
──────────────────────────────────────────────────────────────────────────── */
function createSellPop(resourceId) {
  const btn = document.getElementById(`sell-${resourceId}-btn`);
  if (!btn) return;
  const pop = document.createElement("span");
  pop.className = "sell-pop";
  pop.textContent = "$";
  btn.appendChild(pop);
  pop.addEventListener("animationend", () => pop.remove());
}

/* ────────────────────────────────────────────────────────────────────────────
   AUTO-SELL
──────────────────────────────────────────────────────────────────────────── */
function startAutoSell(resId) {
  stopAutoSell(resId);
  const seller = shopItems.find(
    (i) => i.category === resId && i.id.endsWith("-autoseller")
  );
  if (!seller || seller.count === 0) return;

  autoSellIntervals[resId] = 5000;
  nextSellTimes[resId] = Date.now() + autoSellIntervals[resId];

  document.getElementById(`sell-timer-${resId}`)?.classList.remove("hidden");
  countdownTimers[resId] = setInterval(() => updateSellCountdown(resId), 500);
  autoSellTimers[resId] = setInterval(() => {
    sellAll(resId);
    nextSellTimes[resId] = Date.now() + autoSellIntervals[resId];
  }, autoSellIntervals[resId]);
}
function stopAutoSell(resId) {
  clearInterval(autoSellTimers[resId]);
  clearInterval(countdownTimers[resId]);
}
function updateSellCountdown(resId) {
  const sec = Math.ceil((nextSellTimes[resId] - Date.now()) / 1000);
  const countdownEl = document.getElementById(`sell-countdown-${resId}`);
  if (countdownEl) countdownEl.textContent = Math.max(sec, 0);
}

/* ────────────────────────────────────────────────────────────────────────────
   VERSION LOAD
──────────────────────────────────────────────────────────────────────────── */
fetch("version.txt")
  .then((r) => r.text())
  .then((txt) => {
    const versionEl = document.getElementById("version");
    if (versionEl) versionEl.textContent = txt;
  })
  .catch(() => {});

function changelogToHTML(txt) {
  const lines = txt.split(/\r?\n/);
  let html = "";
  let openUl = false;
  lines.forEach((l) => {
    if (/^\s*-\s+/.test(l)) {
      if (!openUl) {
        html += "<ul>";
        openUl = true;
      }
      html += "<li>" + l.replace(/^\s*-\s+/, "") + "</li>";
    } else if (/^\s*\*\*(.+?)\*\*\s*$/.test(l)) {
      if (openUl) {
        html += "</ul>";
        openUl = false;
      }
      html += "<h4>" + l.replace(/^\s*\*\*(.+?)\*\*\s*$/, "$1") + "</h4>";
    } else if (l.trim() === "") {
      if (openUl) {
        html += "</ul>";
        openUl = false;
      }
      html += "<br/>";
    } else {
      if (openUl) {
        html += "</ul>";
        openUl = false;
      }
      html += "<p>" + l + "</p>";
    }
  });
  if (openUl) html += "</ul>";
  return html;
}

fetch("changelog.txt")
  .then((r) => r.text())
  .then((txt) => {
    const box = document.getElementById("changelog");
    if (box) box.innerHTML = changelogToHTML(txt);
  })
  .catch(() => {
    const box = document.getElementById("changelog");
    if (box) box.textContent = "Could not load changelog.";
  });

/* ────────────────────────────────────────────────────────────────────────────
   SAVE / LOAD
──────────────────────────────────────────────────────────────────────────── */
function isLocalStorageAvailable() {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, "test");
    localStorage.removeItem(test);
    return true;
  } catch {
    console.warn("localStorage is not available");
    return false;
  }
}

function getSaveData() {
  // Collect collapse states
  const collapseStates = {};
  RES_IDS.forEach((res) => {
    try {
      collapseStates[res] =
        localStorage.getItem(`panel-collapsed-${res}`) === "1";
    } catch {
      collapseStates[res] = false;
    }
  });

  return {
    iron: resources.iron.count,
    copper: resources.copper.count,
    nickel: resources.nickel.count,
    bronze: resources.bronze.count,
    silver: resources.silver.count,
    cobalt: resources.cobalt.count,
    gold: resources.gold.count,
    palladium: resources.palladium.count,
    platinum: resources.platinum.count, // New resource
    titanium: resources.titanium.count,
    adamantium: resources.adamantium.count,
    money: resources.money.count,

    copperUnlocked,
    nickelUnlocked,
    bronzeUnlocked,
    silverUnlocked,
    cobaltUnlocked,
    goldUnlocked,
    palladiumUnlocked,
    platinumUnlocked, // New resource
    titaniumUnlocked,
    adamantiumUnlocked,

    ironPerSecond: resources.iron.perSecond,
    copperPerSecond: resources.copper.perSecond,
    nickelPerSecond: resources.nickel.perSecond,
    bronzePerSecond: resources.bronze.perSecond,
    silverPerSecond: resources.silver.perSecond,
    cobaltPerSecond: resources.cobalt.perSecond,
    goldPerSecond: resources.gold.perSecond,
    palladiumPerSecond: resources.palladium.perSecond,
    platinumPerSecond: resources.platinum.perSecond, // New resource
    titaniumPerSecond: resources.titanium.perSecond,
    adamantiumPerSecond: resources.adamantium.perSecond,

    upgrades: shopItems.map((i) => ({
      id: i.id,
      count: i.count,
      price: i.price,
    })),

    stats,

    collapseStates,

    lastSave: Date.now(),
    lastActive: Date.now(), // Track when player was last active
  };
}

// Offline rewards system - gives 10% of online mining rate
function calculateOfflineRewards(saveData) {
  const now = Date.now();
  const lastActive = saveData.lastActive || saveData.lastSave || now;
  const offlineTime = (now - lastActive) / 1000; // Convert to seconds

  // Only give offline rewards if player was offline for at least 1 minute
  // and maximum 3 hours of offline rewards
  const minOfflineTime = 60; // 1 minute
  const maxOfflineTime = 3 * 60 * 60; // 3 hours

  if (offlineTime < minOfflineTime) return;

  const rewardTime = Math.min(offlineTime, maxOfflineTime);
  const offlineMultiplier = 0.1; // 10% of online rate

  const offlineRewards = {};
  let totalMoneyEarned = 0;
  let hasRewards = false;

  // Calculate offline mining for each unlocked resource
  RES_IDS.forEach((resId) => {
    const wasUnlocked = saveData[`${resId}Unlocked`];
    if (resId === "iron" || wasUnlocked) {
      const perSecond = saveData[`${resId}PerSecond`] || 0;
      const milestoneMultiplier = milestoneMultipliers[resId] || 1;
      const totalRate = perSecond * milestoneMultiplier * offlineMultiplier;

      if (totalRate > 0) {
        const mined = totalRate * rewardTime;
        const price = getResourceSellPrice(resId);
        const moneyFromResource = mined * price;

        offlineRewards[resId] = {
          mined: mined,
          money: moneyFromResource,
        };

        totalMoneyEarned += moneyFromResource;
        hasRewards = true;

        // Add the mined resources to player's inventory
        addOre(resId, mined);
      }
    }
  });

  if (hasRewards) {
    // Add the money earned
    addMoney(totalMoneyEarned);

    // Show offline rewards modal
    showOfflineRewardsModal(rewardTime, offlineRewards, totalMoneyEarned);
  }
}

// Get resource sell price (imported from resource files)
function getResourceSellPrice(resId) {
  switch (resId) {
    case "iron":
      return iron.sellPrice;
    case "copper":
      return copper.sellPrice;
    case "nickel":
      return nickel.sellPrice;
    case "bronze":
      return bronze.sellPrice;
    case "silver":
      return silver.sellPrice;
    case "cobalt":
      return cobalt.sellPrice;
    case "gold":
      return gold.sellPrice;
    case "palladium":
      return palladium.sellPrice;
    case "platinum":
      return platinum.sellPrice;
    case "titanium":
      return titanium.sellPrice;
    case "adamantium":
      return adamantium.sellPrice;
    default:
      return 1;
  }
}

// Show offline rewards modal
function showOfflineRewardsModal(timeAway, rewards, totalMoney) {
  const modal = document.createElement("div");
  modal.className = "offline-rewards-modal overlay";
  modal.style.display = "flex";

  const hours = Math.floor(timeAway / 3600);
  const minutes = Math.floor((timeAway % 3600) / 60);
  const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  let rewardsList = "";
  Object.entries(rewards).forEach(([resId, data]) => {
    if (data.mined > 0) {
      const resName = resId.charAt(0).toUpperCase() + resId.slice(1);
      rewardsList += `<li>${resName}: ${fmt(data.mined)} (+$${fmt(
        data.money
      )})</li>`;
    }
  });

  modal.innerHTML = `
    <div class="offline-rewards-content">
      <h2>🎁 Welcome Back!</h2>
      <p>You were away for <strong>${timeText}</strong></p>
      <p>Your mines kept working at 10% efficiency:</p>
      <ul class="offline-rewards-list">
        ${rewardsList}
      </ul>
      <div class="offline-rewards-total">
        <strong>Total Money Earned: $${fmt(totalMoney)}</strong>
      </div>
      <button class="offline-rewards-btn" onclick="closeOfflineRewardsModal()">
        Collect Rewards
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

// Close offline rewards modal
function closeOfflineRewardsModal() {
  const modal = document.querySelector(".offline-rewards-modal");
  if (modal) {
    modal.remove();
  }
}

// Make closeOfflineRewardsModal globally accessible
window.closeOfflineRewardsModal = closeOfflineRewardsModal;

function saveGame() {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.setItem("idleMinerSave", JSON.stringify(getSaveData()));
    console.log("Game saved at", new Date().toLocaleTimeString());
    if (gameStarted && toggleAutoSave?.checked) {
      showAutoSaveIndicator();
      setTimeout(hideAutoSaveIndicator, 1000);
    }
    return true;
  } catch (e) {
    console.error("Failed to save game:", e);
    return false;
  }
}

function loadGame() {
  if (!isLocalStorageAvailable()) return false;
  try {
    const raw = localStorage.getItem("idleMinerSave");
    if (!raw) return false;
    const data = JSON.parse(raw);

    resources.iron.count = data.iron || 0;
    resources.copper.count = data.copper || 0;
    resources.nickel.count = data.nickel || 0;
    resources.bronze.count = data.bronze || 0;
    resources.silver.count = data.silver || 0;
    resources.cobalt.count = data.cobalt || 0;
    resources.gold.count = data.gold || 0;
    resources.palladium.count = data.palladium || 0;
    resources.platinum.count = data.platinum || 0; // New resource
    resources.titanium.count = data.titanium || 0;
    resources.adamantium.count = data.adamantium || 0;
    resources.money.count = data.money || 0;

    copperUnlocked = !!data.copperUnlocked;
    nickelUnlocked = !!data.nickelUnlocked;
    bronzeUnlocked = !!data.bronzeUnlocked;
    silverUnlocked = !!data.silverUnlocked;
    cobaltUnlocked = !!data.cobaltUnlocked;
    goldUnlocked = !!data.goldUnlocked;
    palladiumUnlocked = !!data.palladiumUnlocked;
    platinumUnlocked = !!data.platinumUnlocked; // New resource
    titaniumUnlocked = !!data.titaniumUnlocked;
    adamantiumUnlocked = !!data.adamantiumUnlocked;

    // Restore collapse states BEFORE unlocking resources
    if (data.collapseStates) {
      RES_IDS.forEach((res) => {
        try {
          const collapsed = data.collapseStates[res];
          localStorage.setItem(`panel-collapsed-${res}`, collapsed ? "1" : "0");
        } catch {}
      });
    }

    if (copperUnlocked) unlockCopperUI(false);
    else relockResource("copper");
    if (nickelUnlocked) unlockNickelUI(false);
    else relockResource("nickel");
    if (bronzeUnlocked) unlockBronzeUI(false);
    else relockResource("bronze");
    if (silverUnlocked) unlockSilverUI(false);
    else relockResource("silver");
    if (cobaltUnlocked) unlockCobaltUI(false);
    else relockResource("cobalt");
    if (goldUnlocked) unlockGoldUI(false);
    else relockResource("gold");
    if (palladiumUnlocked) unlockPalladiumUI(false);
    else relockResource("palladium");
    if (platinumUnlocked) unlockPlatinumUI(false); // New resource
    else relockResource("platinum"); // New resource
    if (titaniumUnlocked) unlockTitaniumUI(false);
    else relockResource("titanium");
    if (adamantiumUnlocked) unlockAdamantiumUI(false);
    else relockResource("adamantium");

    if (data.ironPerSecond !== undefined)
      resources.iron.perSecond = data.ironPerSecond;
    if (data.copperPerSecond !== undefined)
      resources.copper.perSecond = data.copperPerSecond;
    if (data.nickelPerSecond !== undefined)
      resources.nickel.perSecond = data.nickelPerSecond;
    if (data.bronzePerSecond !== undefined)
      resources.bronze.perSecond = data.bronzePerSecond;
    if (data.silverPerSecond !== undefined)
      resources.silver.perSecond = data.silverPerSecond;
    if (data.cobaltPerSecond !== undefined)
      resources.cobalt.perSecond = data.cobaltPerSecond;
    if (data.goldPerSecond !== undefined)
      resources.gold.perSecond = data.goldPerSecond;
    if (data.palladiumPerSecond !== undefined)
      resources.palladium.perSecond = data.palladiumPerSecond;
    if (data.platinumPerSecond !== undefined)
      resources.platinum.perSecond = data.platinumPerSecond; // New resource
    if (data.titaniumPerSecond !== undefined)
      resources.titanium.perSecond = data.titaniumPerSecond;
    if (data.adamantiumPerSecond !== undefined)
      resources.adamantium.perSecond = data.adamantiumPerSecond;

    // Calculate and apply offline rewards AFTER perSecond values are loaded
    calculateOfflineRewards(data);

    if (Array.isArray(data.upgrades)) {
      data.upgrades.forEach((u) => {
        const item = shopItems.find((i) => i.id === u.id);
        if (item && u.count >= 0) {
          item.count = u.count;
          item.price =
            u.price ??
            Math.floor(item.basePrice * Math.pow(item.scale, item.count));
        }
      });
    }

    if (data.stats) {
      stats.earnedMoney = data.stats.earnedMoney ?? stats.earnedMoney;
      stats.spentMoney = data.stats.spentMoney ?? stats.spentMoney;
      Object.assign(stats.mined, data.stats.mined || {});
      Object.assign(stats.sold, data.stats.sold || {});
      Object.assign(stats.clicks, data.stats.clicks || {});
    }

    // re-init autosellers
    shopItems
      .filter((i) => i.id.endsWith("-autoseller") && i.count > 0)
      .forEach((item) => {
        const resId = item.category;
        document
          .getElementById(`sell-timer-${resId}`)
          ?.classList.remove("hidden");
        const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
        if (toggle) toggle.checked = true;
        startAutoSell(resId);
      });

    console.log("Game loaded successfully");
    updateStatsUI();
    return true;
  } catch (e) {
    console.error("Failed to load game:", e);
    return false;
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   UNLOCK UI HELPERS
──────────────────────────────────────────────────────────────────────────── */
function unlockCopperUI(expandPanel = true) {
  copperUnlocked = true;
  mineCopperBtn.disabled = sellCopperBtn.disabled = false;
  const panel = document.querySelector(
    '.resource-panel[data-resource="copper"]'
  );
  panel?.classList.remove("locked");

  // Only force expansion for fresh unlocks, not when loading saves
  if (expandPanel) {
    panel?.classList.remove("collapsed");
    try {
      localStorage.setItem("panel-collapsed-copper", "0");
    } catch {}
  } else {
    // When loading saves, ensure collapse state matches localStorage
    try {
      const shouldBeCollapsed =
        localStorage.getItem("panel-collapsed-copper") === "1";
      if (shouldBeCollapsed) {
        panel?.classList.add("collapsed");
      } else {
        panel?.classList.remove("collapsed");
      }
    } catch {}
  }

  document.getElementById("lock-overlay-copper")?.remove();
  document.getElementById("tab-resource-copper")?.classList.remove("locked");
}

function unlockNickelUI(expandPanel = true) {
  nickelUnlocked = true;
  mineNickelBtn.disabled = sellNickelBtn.disabled = false;
  const panel = document.querySelector(
    '.resource-panel[data-resource="nickel"]'
  );
  panel?.classList.remove("locked");

  // Only force expansion for fresh unlocks, not when loading saves
  if (expandPanel) {
    panel?.classList.remove("collapsed");
    try {
      localStorage.setItem("panel-collapsed-nickel", "0");
    } catch {}
  } else {
    // When loading saves, ensure collapse state matches localStorage
    try {
      const shouldBeCollapsed =
        localStorage.getItem("panel-collapsed-nickel") === "1";
      if (shouldBeCollapsed) {
        panel?.classList.add("collapsed");
      } else {
        panel?.classList.remove("collapsed");
      }
    } catch {}
  }

  document.getElementById("lock-overlay-nickel")?.remove();
  document.getElementById("tab-resource-nickel")?.classList.remove("locked");
}
function unlockBronzeUI(expandPanel = true) {
  bronzeUnlocked = true;
  mineBronzeBtn.disabled = sellBronzeBtn.disabled = false;
  const panel = document.querySelector(
    '.resource-panel[data-resource="bronze"]'
  );
  panel?.classList.remove("locked");

  // Only force expansion for fresh unlocks, not when loading saves
  if (expandPanel) {
    panel?.classList.remove("collapsed");
    try {
      localStorage.setItem("panel-collapsed-bronze", "0");
    } catch {}
  } else {
    // When loading saves, ensure collapse state matches localStorage
    try {
      const shouldBeCollapsed =
        localStorage.getItem("panel-collapsed-bronze") === "1";
      if (shouldBeCollapsed) {
        panel?.classList.add("collapsed");
      } else {
        panel?.classList.remove("collapsed");
      }
    } catch {}
  }

  document.getElementById("lock-overlay-bronze")?.remove();
  document.getElementById("tab-resource-bronze")?.classList.remove("locked");
}
function unlockSilverUI(expandPanel = true) {
  silverUnlocked = true;
  mineSilverBtn.disabled = sellSilverBtn.disabled = false;
  const panel = document.querySelector(
    '.resource-panel[data-resource="silver"]'
  );
  panel?.classList.remove("locked");

  // Only force expansion for fresh unlocks, not when loading saves
  if (expandPanel) {
    panel?.classList.remove("collapsed");
    try {
      localStorage.setItem("panel-collapsed-silver", "0");
    } catch {}
  } else {
    // When loading saves, ensure collapse state matches localStorage
    try {
      const shouldBeCollapsed =
        localStorage.getItem("panel-collapsed-silver") === "1";
      if (shouldBeCollapsed) {
        panel?.classList.add("collapsed");
      } else {
        panel?.classList.remove("collapsed");
      }
    } catch {}
  }

  document.getElementById("lock-overlay-silver")?.remove();
  document.getElementById("tab-resource-silver")?.classList.remove("locked");
}

function unlockCobaltUI(expandPanel = true) {
  cobaltUnlocked = true;
  mineCobaltBtn.disabled = sellCobaltBtn.disabled = false;
  const panel = document.querySelector(
    '.resource-panel[data-resource="cobalt"]'
  );
  panel?.classList.remove("locked");

  // Only force expansion for fresh unlocks, not when loading saves
  if (expandPanel) {
    panel?.classList.remove("collapsed");
    try {
      localStorage.setItem("panel-collapsed-cobalt", "0");
    } catch {}
  } else {
    // When loading saves, ensure collapse state matches localStorage
    try {
      const shouldBeCollapsed =
        localStorage.getItem("panel-collapsed-cobalt") === "1";
      if (shouldBeCollapsed) {
        panel?.classList.add("collapsed");
      } else {
        panel?.classList.remove("collapsed");
      }
    } catch {}
  }

  document.getElementById("lock-overlay-cobalt")?.remove();
  document.getElementById("tab-resource-cobalt")?.classList.remove("locked");
}
function unlockGoldUI(expandPanel = true) {
  goldUnlocked = true;
  mineGoldBtn.disabled = sellGoldBtn.disabled = false;
  const panel = document.querySelector('.resource-panel[data-resource="gold"]');
  panel?.classList.remove("locked");

  // Only force expansion for fresh unlocks, not when loading saves
  if (expandPanel) {
    panel?.classList.remove("collapsed");
    try {
      localStorage.setItem("panel-collapsed-gold", "0");
    } catch {}
  } else {
    // When loading saves, ensure collapse state matches localStorage
    try {
      const shouldBeCollapsed =
        localStorage.getItem("panel-collapsed-gold") === "1";
      if (shouldBeCollapsed) {
        panel?.classList.add("collapsed");
      } else {
        panel?.classList.remove("collapsed");
      }
    } catch {}
  }

  document.getElementById("lock-overlay-gold")?.remove();
  document.getElementById("tab-resource-gold")?.classList.remove("locked");
}

function unlockPalladiumUI(expandPanel = true) {
  palladiumUnlocked = true;
  minePalladiumBtn.disabled = sellPalladiumBtn.disabled = false;
  const panel = document.querySelector(
    '.resource-panel[data-resource="palladium"]'
  );
  panel?.classList.remove("locked");

  // Only force expansion for fresh unlocks, not when loading saves
  if (expandPanel) {
    panel?.classList.remove("collapsed");
    try {
      localStorage.setItem("panel-collapsed-palladium", "0");
    } catch {}
  } else {
    // When loading saves, ensure collapse state matches localStorage
    try {
      const shouldBeCollapsed =
        localStorage.getItem("panel-collapsed-palladium") === "1";
      if (shouldBeCollapsed) {
        panel?.classList.add("collapsed");
      } else {
        panel?.classList.remove("collapsed");
      }
    } catch {}
  }

  document.getElementById("lock-overlay-palladium")?.remove();
  document.getElementById("tab-resource-palladium")?.classList.remove("locked");
}
function unlockPlatinumUI(expandPanel = true) {
  platinumUnlocked = true;
  minePlatinumBtn.disabled = sellPlatinumBtn.disabled = false;
  const panel = document.querySelector(
    '.resource-panel[data-resource="platinum"]'
  );
  panel?.classList.remove("locked");

  // Only force expansion for fresh unlocks, not when loading saves
  if (expandPanel) {
    panel?.classList.remove("collapsed");
    try {
      localStorage.setItem("panel-collapsed-platinum", "0");
    } catch {}
  } else {
    // When loading saves, ensure collapse state matches localStorage
    try {
      const shouldBeCollapsed =
        localStorage.getItem("panel-collapsed-platinum") === "1";
      if (shouldBeCollapsed) {
        panel?.classList.add("collapsed");
      } else {
        panel?.classList.remove("collapsed");
      }
    } catch {}
  }

  document.getElementById("lock-overlay-platinum")?.remove();
  document.getElementById("tab-resource-platinum")?.classList.remove("locked");
}
function unlockTitaniumUI(expandPanel = true) {
  titaniumUnlocked = true;
  mineTitaniumBtn.disabled = sellTitaniumBtn.disabled = false;
  const panel = document.querySelector(
    '.resource-panel[data-resource="titanium"]'
  );
  panel?.classList.remove("locked");

  // Only force expansion for fresh unlocks, not when loading saves
  if (expandPanel) {
    panel?.classList.remove("collapsed");
    try {
      localStorage.setItem("panel-collapsed-titanium", "0");
    } catch {}
  } else {
    // When loading saves, ensure collapse state matches localStorage
    try {
      const shouldBeCollapsed =
        localStorage.getItem("panel-collapsed-titanium") === "1";
      if (shouldBeCollapsed) {
        panel?.classList.add("collapsed");
      } else {
        panel?.classList.remove("collapsed");
      }
    } catch {}
  }

  document.getElementById("lock-overlay-titanium")?.remove();
  document.getElementById("tab-resource-titanium")?.classList.remove("locked");
}
function unlockAdamantiumUI(expandPanel = true) {
  adamantiumUnlocked = true;
  mineAdamantiumBtn.disabled = sellAdamantiumBtn.disabled = false;
  const panel = document.querySelector(
    '.resource-panel[data-resource="adamantium"]'
  );
  panel?.classList.remove("locked");

  // Only force expansion for fresh unlocks, not when loading saves
  if (expandPanel) {
    panel?.classList.remove("collapsed");
    try {
      localStorage.setItem("panel-collapsed-adamantium", "0");
    } catch {}
  } else {
    // When loading saves, ensure collapse state matches localStorage
    try {
      const shouldBeCollapsed =
        localStorage.getItem("panel-collapsed-adamantium") === "1";
      if (shouldBeCollapsed) {
        panel?.classList.add("collapsed");
      } else {
        panel?.classList.remove("collapsed");
      }
    } catch {}
  }

  document.getElementById("lock-overlay-adamantium")?.remove();
  document
    .getElementById("tab-resource-adamantium")
    ?.classList.remove("locked");
}

/* ────────────────────────────────────────────────────────────────────────────
   NEW GAME
──────────────────────────────────────────────────────────────────────────── */
function startNewGame() {
  // Stop and clear all auto-sell and countdown timers
  RES_IDS.forEach((resId) => {
    stopAutoSell(resId);
    clearInterval(autoSellTimers[resId]);
    clearInterval(countdownTimers[resId]);
    autoSellTimers[resId] = null;
    countdownTimers[resId] = null;
    nextSellTimes[resId] = null;
    document.getElementById(`sell-timer-${resId}`)?.classList.add("hidden");
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) toggle.checked = false;
    // Reset countdown display
    const countdownEl = document.getElementById(`sell-countdown-${resId}`);
    if (countdownEl) countdownEl.textContent = "";
  });

  // Reset all resource values and manual mining perClick
  RES_IDS.forEach((r) => {
    resources[r].count = 0;
    resources[r].perSecond = 0;
    if (typeof resources[r].perClick !== "undefined") resources[r].perClick = 1;
  });
  resources.money.count = 0;

  // Reset unlocks
  copperUnlocked = false;
  nickelUnlocked = false;
  bronzeUnlocked = false;
  silverUnlocked = false;
  cobaltUnlocked = false;
  goldUnlocked = false;
  palladiumUnlocked = false;
  platinumUnlocked = false; // New resource
  titaniumUnlocked = false;
  adamantiumUnlocked = false;

  // Reset shop items
  shopItems.forEach((item) => {
    item.count = 0;
    item.price = item.basePrice;
  });

  // Reset stats
  Object.keys(stats.mined).forEach((k) => (stats.mined[k] = 0));
  Object.keys(stats.sold).forEach((k) => (stats.sold[k] = 0));
  stats.earnedMoney = 0;
  stats.spentMoney = 0;
  stats.clicks = { mine: 0, sell: 0, shopBuy: 0, unlock: 0 };

  // Remove save and highscore
  if (isLocalStorageAvailable()) {
    localStorage.removeItem("idleMinerSave");
    localStorage.removeItem("idleMinerHighscore");
  }

  // Reset UI buttons
  mineCopperBtn.disabled = sellCopperBtn.disabled = true;
  mineNickelBtn.disabled = sellNickelBtn.disabled = true;
  mineBronzeBtn.disabled = sellBronzeBtn.disabled = true;
  mineSilverBtn.disabled = sellSilverBtn.disabled = true;
  mineCobaltBtn.disabled = sellCobaltBtn.disabled = true;
  mineGoldBtn.disabled = sellGoldBtn.disabled = true;
  minePalladiumBtn.disabled = sellPalladiumBtn.disabled = true;
  minePlatinumBtn.disabled = sellPlatinumBtn.disabled = true; // New resource
  mineTitaniumBtn.disabled = sellTitaniumBtn.disabled = true;
  mineAdamantiumBtn.disabled = sellAdamantiumBtn.disabled = true;

  // Reset current resource and tabs
  currentResource = "iron";
  resourceTabs.forEach((tab) =>
    tab.classList.toggle("active", tab.dataset.resource === "iron")
  );

  // Relock all resources above iron
  relockResource("copper");
  relockResource("nickel");
  relockResource("bronze");
  relockResource("silver");
  relockResource("cobalt");
  relockResource("gold");
  relockResource("palladium");
  relockResource("platinum"); // New resource
  relockResource("titanium");
  relockResource("adamantium");
  document.getElementById("tab-resource-copper")?.classList.add("locked");
  document.getElementById("tab-resource-nickel")?.classList.add("locked");
  document.getElementById("tab-resource-bronze")?.classList.add("locked");
  document.getElementById("tab-resource-silver")?.classList.add("locked");
  document.getElementById("tab-resource-cobalt")?.classList.add("locked");
  document.getElementById("tab-resource-gold")?.classList.add("locked");
  document.getElementById("tab-resource-palladium")?.classList.add("locked");
  document.getElementById("tab-resource-platinum")?.classList.add("locked");
  document.getElementById("tab-resource-titanium")?.classList.add("locked");
  document.getElementById("tab-resource-adamantium")?.classList.add("locked");

  // Hide overlays, modals, and popups
  if (overlay) overlay.classList.add("hidden");
  if (typeof confirmModal !== "undefined" && confirmModal)
    confirmModal.classList.add("hidden");
  // Remove all sell-pop elements
  document.querySelectorAll(".sell-pop").forEach((el) => el.remove());
  // Hide autosave indicator
  hideAutoSaveIndicator();

  // Reset scroll positions
  mineScrollY = 0;
  shopScrollY = 0;
  window.scrollTo(0, 0);

  // Reset UI screens
  if (screenShop) screenShop.classList.add("hidden");
  if (screenStats) screenStats.classList.add("hidden");
  if (screenMine) screenMine.classList.remove("hidden");
  tabMine.classList.add("active");
  tabShop.classList.remove("active");
  tabStats.classList.remove("active");

  // Stop autosave
  stopAutoSave();

  // Reset money animation state
  if (typeof updateUI.lastMoney !== "undefined") updateUI.lastMoney = 0;

  // Collapse all resource panels except Iron by default
  const resourcesToCollapse = [
    "copper",
    "bronze",
    "silver",
    "gold",
    "platinum",
    "titanium",
    "adamantium",
  ];
  resourcesToCollapse.forEach((resId) => {
    const panel = document.querySelector(
      `.resource-panel[data-resource='${resId}']`
    );
    if (panel) {
      panel.classList.add("collapsed");
      // Update localStorage to reflect the collapsed state
      try {
        localStorage.setItem(`panel-collapsed-${resId}`, "1");
      } catch {}
    }
  });

  // Ensure Iron panel is expanded
  const ironPanel = document.querySelector(
    `.resource-panel[data-resource='iron']`
  );
  if (ironPanel) {
    ironPanel.classList.remove("collapsed");
    try {
      localStorage.setItem(`panel-collapsed-iron`, "0");
    } catch {}
  }

  // Update all UI
  updateUI();
  renderShop();
  updateStatsUI();

  console.log("New game started - all data wiped");
}

/* ────────────────────────────────────────────────────────────────────────────
   START GAME
──────────────────────────────────────────────────────────────────────────── */
function startGame() {
  mainMenu.style.display = "none";
  settingsMenu.style.display = "none";
  gameUI.style.display = "flex";
  gameStarted = true;

  const bgMusic = document.getElementById("bg-music");
  if (bgMusic) {
    bgMusic.volume = 0.5;
    bgMusic
      .play()
      .catch((err) => console.warn("Background music failed:", err));
  }

  updateUI();
  updateStatsUI();
  switchResource(currentResource);
  showScreen("mine");

  if (toggleAutoSave?.checked) startAutoSave();
}

/* ────────────────────────────────────────────────────────────────────────────
   AUTOSAVE
──────────────────────────────────────────────────────────────────────────── */
function startAutoSave() {
  stopAutoSave();
  if (!isLocalStorageAvailable()) return;
  autoSaveInterval = setInterval(() => {
    if (gameStarted) saveGame();
  }, 60000);
  window.addEventListener("beforeunload", saveGame);
}
function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
  window.removeEventListener("beforeunload", saveGame);
}

/* ────────────────────────────────────────────────────────────────────────────
   MENU BUTTONS
──────────────────────────────────────────────────────────────────────────── */
btnContinue?.addEventListener("click", () => {
  if (loadGame()) startGame();
  else {
    alert("Failed to load save data. Starting new game.");
    startNewGame();
    startGame();
  }
});

// New Game confirmation modal logic
const confirmModal = document.getElementById("confirm-newgame-modal");
const btnNewGameModal = document.getElementById("btn-new");
const btnConfirmYes = document.getElementById("confirm-newgame-yes");
const btnConfirmNo = document.getElementById("confirm-newgame-no");

btnNewGameModal?.addEventListener("click", (e) => {
  if (confirmModal) {
    confirmModal.classList.remove("hidden");
  } else {
    // fallback: just start new game
    startNewGame();
    startGame();
  }
});

btnConfirmYes?.addEventListener("click", () => {
  if (confirmModal) confirmModal.classList.add("hidden");
  startNewGame();
  startGame();
});

btnConfirmNo?.addEventListener("click", () => {
  if (confirmModal) confirmModal.classList.add("hidden");
});

btnSettings?.addEventListener("click", () => {
  mainMenu.style.display = "none";
  settingsMenu.style.display = "flex";
});

btnBackToMenu?.addEventListener("click", () => {
  settingsMenu.style.display = "none";
  mainMenu.style.display = "flex";
});

toggleAutoSave?.addEventListener("change", (e) => {
  if (e.target.checked) {
    if (gameStarted) {
      startAutoSave();
      if (saveGame() && btnContinue) btnContinue.disabled = false;
    }
  } else {
    stopAutoSave();
  }
});

btnSaveMenu?.addEventListener("click", () => {
  if (saveGame()) {
    if (btnContinue) btnContinue.disabled = false;
  } else {
    alert("Failed to save game. Please check browser settings.");
  }
  if (gameUI) gameUI.style.display = "none";
  if (mainMenu) mainMenu.style.display = "flex";
  gameStarted = false;
  stopAutoSave();
});

/* ────────────────────────────────────────────────────────────────────────────
   ON LOAD
──────────────────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const hasSave =
    isLocalStorageAvailable() && !!localStorage.getItem("idleMinerSave");
  // Removed analytics tracking
  if (btnContinue) btnContinue.disabled = !hasSave;
  if (gameUI) gameUI.style.display = "none";
  if (mainMenu) mainMenu.style.display = "flex";
  gameStarted = false;

  if (!hasSave) {
    // fresh boot: relock everything above iron
    relockResource("copper");
    relockResource("bronze");
    relockResource("silver");
    relockResource("gold");
    relockResource("platinum"); // New resource
    relockResource("titanium");
    relockResource("adamantium");
  }
});

/* ────────────────────────────────────────────────────────────────────────────
   SAVE INDICATORS
──────────────────────────────────────────────────────────────────────────── */

function showAutoSaveIndicator() {
  let cogIndicator = document.getElementById("autosave-cog");
  if (!cogIndicator) {
    cogIndicator = document.createElement("div");
    cogIndicator.id = "autosave-cog";
    cogIndicator.className = "autosave-cog";
    cogIndicator.innerHTML = "⚙️";
    cogIndicator.title = "Auto-saving...";
    document.body.appendChild(cogIndicator);

    if (!document.getElementById("autosave-cog-styles")) {
      const style = document.createElement("style");
      style.id = "autosave-cog-styles";
      style.textContent = `
        .autosave-cog {
          position: fixed;
          top: 20px;
          right: 20px;
          font-size: 20px;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s ease;
          animation: spin 1s linear infinite;
          pointer-events: none;
        }
        .autosave-cog.show { opacity: 0.7; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `;
      document.head.appendChild(style);
    }
  }
  cogIndicator.classList.add("show");
}

// Initialize locked resources as collapsed on page load
document.addEventListener("DOMContentLoaded", () => {
  // Ensure all locked resources start collapsed
  const lockedResources = [
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
  lockedResources.forEach((res) => {
    if (!isUnlocked(res)) {
      const panel = document.querySelector(
        `.resource-panel[data-resource="${res}"]`
      );
      if (panel && !panel.classList.contains("collapsed")) {
        panel.classList.add("collapsed");
      }
    }
  });
});
function hideAutoSaveIndicator() {
  document.getElementById("autosave-cog")?.classList.remove("show");
}

/* ────────────────────────────────────────────────────────────────────────────
   PWA SAFE AREA DEBUGGING (DEVELOPMENT ONLY)
──────────────────────────────────────────────────────────────────────────── */
if (isDev) {
  // Log safe area values for debugging on iPhone
  document.addEventListener("DOMContentLoaded", () => {
    const checkSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      const safeAreaTop = computedStyle.getPropertyValue('--safe-area-inset-top') || 
                         getComputedStyle(document.body).paddingTop;
      
      console.log('🔍 Safe Area Debug Info:');
      console.log('  Device:', navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Other');
      console.log('  Display Mode:', window.matchMedia('(display-mode: standalone)').matches ? 'PWA' : 'Browser');
      console.log('  Viewport:', window.innerWidth + 'x' + window.innerHeight);
      console.log('  Body padding-top:', getComputedStyle(document.body).paddingTop);
      console.log('  Screen:', screen.width + 'x' + screen.height);
      
      // Test if safe area is working
      if (CSS.supports('padding-top: env(safe-area-inset-top)')) {
        console.log('  ✅ env() CSS support: Available');
      } else {
        console.log('  ❌ env() CSS support: Not available');
      }
    };
    
    // Check immediately and after orientation changes
    checkSafeArea();
    window.addEventListener('orientationchange', () => {
      setTimeout(checkSafeArea, 100);
    });
  });
}
