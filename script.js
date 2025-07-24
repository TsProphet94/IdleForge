// script.js — IdleForge core + GLOBAL TRACKERS + STATS TAB + FULL-SCREEN SHOP + MICRO-UPGRADES + BUY MAX (>=2 only, no cost shown)

/* eslint-disable no-undef */
import iron from "./resources/iron.js";
import copper from "./resources/copper.js";
import bronze from "./resources/bronze.js";
import silver from "./resources/silver.js";
import gold from "./resources/gold.js";
import platinum from "./resources/platinum.js"; // New resource
import { shopItems } from "./shop/items.js";

/* ────────────────────────────────────────────────────────────────────────────
   DATA MODEL
──────────────────────────────────────────────────────────────────────────── */
export const resources = {
  iron,
  copper,
  bronze,
  silver,
  gold,
  platinum, // New resource
  money: { id: "money", count: 0 },
};
const RES_IDS = ["iron", "copper", "bronze", "silver", "gold", "platinum"]; // New resource

/** Lifetime/global stats */
export const stats = {
  mined: { iron: 0, copper: 0, bronze: 0, silver: 0, gold: 0, platinum: 0 },
  sold: { iron: 0, copper: 0, bronze: 0, silver: 0, gold: 0, platinum: 0 },
  earnedMoney: 0,
  spentMoney: 0,
  clicks: { mine: 0, sell: 0, shopBuy: 0, unlock: 0 },
};

/* Unlock costs (new curve) */
const UNLOCK_COST = {
  copper: 20000,
  bronze: 150000,
  silver: 1000000,
  gold: 8000000,
  platinum: 20000000, // New resource unlock cost
};

/* ────────────────────────────────────────────────────────────────────────────
   UI ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
const ironCountEl = document.getElementById("iron-count");
const copperCountEl = document.getElementById("copper-count");
const bronzeCountEl = document.getElementById("bronze-count");
const silverCountEl = document.getElementById("silver-count");
const goldCountEl = document.getElementById("gold-count");
const platinumCountEl = document.getElementById("platinum-count"); // New resource
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
const mineBronzeBtn = document.getElementById("mine-bronze-btn");
const sellBronzeBtn = document.getElementById("sell-bronze-btn");
const mineSilverBtn = document.getElementById("mine-silver-btn");
const sellSilverBtn = document.getElementById("sell-silver-btn");
const mineGoldBtn = document.getElementById("mine-gold-btn");
const sellGoldBtn = document.getElementById("sell-gold-btn");
const minePlatinumBtn = document.getElementById("mine-platinum-btn"); // New resource
const sellPlatinumBtn = document.getElementById("sell-platinum-btn"); // New resource

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
const devAddBronze = document.getElementById("dev-add-bronze");
const devAddSilver = document.getElementById("dev-add-silver");
const devAddGold = document.getElementById("dev-add-gold");
const devAddPlatinum = document.getElementById("dev-add-platinum"); // New resource
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
  devAddBronze?.addEventListener("click", () => {
    addOre("bronze", 10000);
    updateUI();
  });
  devAddSilver?.addEventListener("click", () => {
    addOre("silver", 10000);
    updateUI();
  });
  devAddGold?.addEventListener("click", () => {
    addOre("gold", 10000);
    updateUI();
  });
  devAddPlatinum?.addEventListener("click", () => {
    addOre("platinum", 10000);
    updateUI();
  });
  devAddMoney?.addEventListener("click", () => {
    addMoney(1000000);
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
let bronzeUnlocked = false;
let silverUnlocked = false;
let goldUnlocked = false;
let platinumUnlocked = false; // New resource

let autoSaveInterval = null;
let gameStarted = false;

/* ────────────────────────────────────────────────────────────────────────────
   INITIAL UI
──────────────────────────────────────────────────────────────────────────── */
screenShop.classList.add("hidden");
if (overlay) overlay.classList.add("hidden");
tabMine.classList.add("active");

mineCopperBtn.disabled = sellCopperBtn.disabled = true;
mineBronzeBtn.disabled = sellBronzeBtn.disabled = true;
mineSilverBtn.disabled = sellSilverBtn.disabled = true;
mineGoldBtn.disabled = sellGoldBtn.disabled = true;
minePlatinumBtn.disabled = sellPlatinumBtn.disabled = true; // New resource

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
    case "bronze":
      return bronzeUnlocked;
    case "silver":
      return silverUnlocked;
    case "gold":
      return goldUnlocked;
    case "platinum":
      return platinumUnlocked; // New resource
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
mineBronzeBtn.addEventListener("click", () => mineResource("bronze"));
sellBronzeBtn.addEventListener("click", () => sellAll("bronze"));
mineSilverBtn.addEventListener("click", () => mineResource("silver"));
sellSilverBtn.addEventListener("click", () => sellAll("silver"));
mineGoldBtn.addEventListener("click", () => mineResource("gold"));
sellGoldBtn.addEventListener("click", () => sellAll("gold"));
minePlatinumBtn.addEventListener("click", () => mineResource("platinum")); // New resource
sellPlatinumBtn.addEventListener("click", () => sellAll("platinum")); // New resource

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
  if (res === "bronze") unlockBronzeUI();
  if (res === "silver") unlockSilverUI();
  if (res === "gold") unlockGoldUI();
  if (res === "platinum") unlockPlatinumUI(); // New resource

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

  if (item.id.startsWith("auto-seller")) {
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
  bronzeCountEl.textContent = fmt(resources.bronze.count);
  silverCountEl.textContent = fmt(resources.silver.count);
  goldCountEl.textContent = fmt(resources.gold.count);
  platinumCountEl.textContent = fmt(resources.platinum.count || 0); // New resource

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
  sellBronzeBtn.disabled = resources.bronze.count <= 0;
  sellSilverBtn.disabled = resources.silver.count <= 0;
  sellGoldBtn.disabled = resources.gold.count <= 0;
  sellPlatinumBtn.disabled = resources.platinum.count <= 0; // New resource

  setText(
    "auto-rate-iron",
    resources.iron.perSecond * milestoneMultipliers.iron
  );
  setText(
    "auto-rate-copper",
    resources.copper.perSecond * milestoneMultipliers.copper
  );
  setText(
    "auto-rate-bronze",
    resources.bronze.perSecond * milestoneMultipliers.bronze
  );
  setText(
    "auto-rate-silver",
    resources.silver.perSecond * milestoneMultipliers.silver
  );
  setText(
    "auto-rate-gold",
    resources.gold.perSecond * milestoneMultipliers.gold
  );
  setText(
    "auto-rate-platinum",
    resources.platinum.perSecond * milestoneMultipliers.platinum
  ); // New resource
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
    (i) => i.category === resId && i.id.startsWith("auto-seller")
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
  return {
    iron: resources.iron.count,
    copper: resources.copper.count,
    bronze: resources.bronze.count,
    silver: resources.silver.count,
    gold: resources.gold.count,
    platinum: resources.platinum.count, // New resource
    money: resources.money.count,

    copperUnlocked,
    bronzeUnlocked,
    silverUnlocked,
    goldUnlocked,
    platinumUnlocked, // New resource

    ironPerSecond: resources.iron.perSecond,
    copperPerSecond: resources.copper.perSecond,
    bronzePerSecond: resources.bronze.perSecond,
    silverPerSecond: resources.silver.perSecond,
    goldPerSecond: resources.gold.perSecond,
    platinumPerSecond: resources.platinum.perSecond, // New resource

    upgrades: shopItems.map((i) => ({
      id: i.id,
      count: i.count,
      price: i.price,
    })),

    stats,

    lastSave: Date.now(),
  };
}

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
    resources.bronze.count = data.bronze || 0;
    resources.silver.count = data.silver || 0;
    resources.gold.count = data.gold || 0;
    resources.platinum.count = data.platinum || 0; // New resource
    resources.money.count = data.money || 0;

    copperUnlocked = !!data.copperUnlocked;
    bronzeUnlocked = !!data.bronzeUnlocked;
    silverUnlocked = !!data.silverUnlocked;
    goldUnlocked = !!data.goldUnlocked;
    platinumUnlocked = !!data.platinumUnlocked; // New resource
    if (copperUnlocked) unlockCopperUI();
    else relockResource("copper");
    if (bronzeUnlocked) unlockBronzeUI();
    else relockResource("bronze");
    if (silverUnlocked) unlockSilverUI();
    else relockResource("silver");
    if (goldUnlocked) unlockGoldUI();
    else relockResource("gold");
    if (platinumUnlocked) unlockPlatinumUI(); // New resource
    else relockResource("platinum"); // New resource

    if (data.ironPerSecond !== undefined)
      resources.iron.perSecond = data.ironPerSecond;
    if (data.copperPerSecond !== undefined)
      resources.copper.perSecond = data.copperPerSecond;
    if (data.bronzePerSecond !== undefined)
      resources.bronze.perSecond = data.bronzePerSecond;
    if (data.silverPerSecond !== undefined)
      resources.silver.perSecond = data.silverPerSecond;
    if (data.goldPerSecond !== undefined)
      resources.gold.perSecond = data.goldPerSecond;
    if (data.platinumPerSecond !== undefined)
      resources.platinum.perSecond = data.platinumPerSecond; // New resource

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
      .filter((i) => i.id.startsWith("auto-seller") && i.count > 0)
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
function unlockCopperUI() {
  copperUnlocked = true;
  mineCopperBtn.disabled = sellCopperBtn.disabled = false;
  document
    .querySelector('.resource-panel[data-resource="copper"]')
    ?.classList.remove("locked");
  document.getElementById("lock-overlay-copper")?.remove();
  document.getElementById("tab-resource-copper")?.classList.remove("locked");
}
function unlockBronzeUI() {
  bronzeUnlocked = true;
  mineBronzeBtn.disabled = sellBronzeBtn.disabled = false;
  document
    .querySelector('.resource-panel[data-resource="bronze"]')
    ?.classList.remove("locked");
  document.getElementById("lock-overlay-bronze")?.remove();
  document.getElementById("tab-resource-bronze")?.classList.remove("locked");
}
function unlockSilverUI() {
  silverUnlocked = true;
  mineSilverBtn.disabled = sellSilverBtn.disabled = false;
  document
    .querySelector('.resource-panel[data-resource="silver"]')
    ?.classList.remove("locked");
  document.getElementById("lock-overlay-silver")?.remove();
  document.getElementById("tab-resource-silver")?.classList.remove("locked");
}
function unlockGoldUI() {
  goldUnlocked = true;
  mineGoldBtn.disabled = sellGoldBtn.disabled = false;
  document
    .querySelector('.resource-panel[data-resource="gold"]')
    ?.classList.remove("locked");
  document.getElementById("lock-overlay-gold")?.remove();
  document.getElementById("tab-resource-gold")?.classList.remove("locked");
}
function unlockPlatinumUI() {
  platinumUnlocked = true;
  minePlatinumBtn.disabled = sellPlatinumBtn.disabled = false;
  document
    .querySelector('.resource-panel[data-resource="platinum"]')
    ?.classList.remove("locked");
  document.getElementById("lock-overlay-platinum")?.remove();
  document.getElementById("tab-resource-platinum")?.classList.remove("locked");
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
  bronzeUnlocked = false;
  silverUnlocked = false;
  goldUnlocked = false;
  platinumUnlocked = false; // New resource

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

  // Remove save
  if (isLocalStorageAvailable()) localStorage.removeItem("idleMinerSave");

  // Reset UI buttons
  mineCopperBtn.disabled = sellCopperBtn.disabled = true;
  mineBronzeBtn.disabled = sellBronzeBtn.disabled = true;
  mineSilverBtn.disabled = sellSilverBtn.disabled = true;
  mineGoldBtn.disabled = sellGoldBtn.disabled = true;
  minePlatinumBtn.disabled = sellPlatinumBtn.disabled = true; // New resource

  // Reset current resource and tabs
  currentResource = "iron";
  resourceTabs.forEach((tab) =>
    tab.classList.toggle("active", tab.dataset.resource === "iron")
  );

  // Relock all resources above iron
  relockResource("copper");
  relockResource("bronze");
  relockResource("silver");
  relockResource("gold");
  relockResource("platinum"); // New resource
  document.getElementById("tab-resource-copper")?.classList.add("locked");

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
function hideAutoSaveIndicator() {
  document.getElementById("autosave-cog")?.classList.remove("show");
}
