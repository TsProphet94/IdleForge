// script.js — Iron, Copper, Bronze, Silver, Gold + autosell, save/load, menu

import iron from "./resources/iron.js";
import copper from "./resources/copper.js";
import bronze from "./resources/bronze.js";
import silver from "./resources/silver.js";
import gold from "./resources/gold.js";
import { shopItems } from "./shop/items.js";

// ─── Data Model ────────────────────────────────────────────────────────────
export const resources = {
  iron,
  copper,
  bronze,
  silver,
  gold,
  money: { id: "money", count: 0 },
};

// ─── UI ELEMENTS ────────────────────────────────────────────────────────────
const ironCountEl = document.getElementById("iron-count");
const copperCountEl = document.getElementById("copper-count");
const bronzeCountEl = document.getElementById("bronze-count");
const silverCountEl = document.getElementById("silver-count");
const goldCountEl = document.getElementById("gold-count");
const moneyCountEl = document.getElementById("money-count");

const shopList = document.getElementById("shop-list");
const resourceTabs = document.querySelectorAll(".resource-tab");
const tabMine = document.getElementById("tab-mine");
const tabShop = document.getElementById("tab-shop");
const shopScreen = document.getElementById("screen-shop");
const overlay = document.getElementById("overlay");

const unlockCopperBtn = document.getElementById("unlock-copper-btn");
const unlockBronzeBtn = document.getElementById("unlock-bronze-btn");
const unlockSilverBtn = document.getElementById("unlock-silver-btn");
const unlockGoldBtn = document.getElementById("unlock-gold-btn");

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

// ─── MENU & SAVE/LOAD ELEMENTS ──────────────────────────────────────────────
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

// ─── Dev-panel (optional) ───────────────────────────────────────────────────
const isDev = false;
const devPanel = document.getElementById("dev-panel");
const devAddIron = document.getElementById("dev-add-iron");
const devAddCopper = document.getElementById("dev-add-copper");
const devAddBronze = document.getElementById("dev-add-bronze");
const devAddSilver = document.getElementById("dev-add-silver");
const devAddGold = document.getElementById("dev-add-gold");
const devAddMoney = document.getElementById("dev-add-money");

if (devPanel) devPanel.classList.toggle("hidden", !isDev);
if (isDev) {
  devAddIron?.addEventListener("click", () => {
    resources.iron.count += 10000;
    updateUI();
  });
  devAddCopper?.addEventListener("click", () => {
    resources.copper.count += 10000;
    updateUI();
  });
  devAddBronze?.addEventListener("click", () => {
    resources.bronze.count += 10000;
    updateUI();
  });
  devAddSilver?.addEventListener("click", () => {
    resources.silver.count += 10000;
    updateUI();
  });
  devAddGold?.addEventListener("click", () => {
    resources.gold.count += 10000;
    updateUI();
  });
  devAddMoney?.addEventListener("click", () => {
    resources.money.count += 10000;
    updateUI();
  });
}

// ─── Auto-sell state ────────────────────────────────────────────────────────
const autoSellTimers = {};
const countdownTimers = {};
const nextSellTimes = {};
const autoSellIntervals = {};

// ─── State ──────────────────────────────────────────────────────────────────
let currentResource = "iron";
let copperUnlocked = false;
let bronzeUnlocked = false;
let silverUnlocked = false;
let goldUnlocked = false;

// ─── Auto-save state ────────────────────────────────────────────────────────
let autoSaveInterval = null;
let gameStarted = false;

// ─── Initial UI setup ───────────────────────────────────────────────────────
shopScreen.classList.add("hidden");
overlay.classList.add("hidden");
tabMine.classList.add("active");

mineCopperBtn.disabled = sellCopperBtn.disabled = true;
mineBronzeBtn.disabled = sellBronzeBtn.disabled = true;
mineSilverBtn.disabled = sellSilverBtn.disabled = true;
mineGoldBtn.disabled = sellGoldBtn.disabled = true;

// ─── Number Formatter ───────────────────────────────────────────────────────
function fmt(num) {
  if (num < 1_000) return Math.floor(num).toString();
  if (num < 1_000_000)
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  if (num < 1_000_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (num < 1_000_000_000_000)
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b";
  return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") + "t";
}

// ─── Mining & Selling ───────────────────────────────────────────────────────
mineIronBtn.addEventListener("click", () => {
  resources.iron.count += resources.iron.perClick;
  updateUI();
});
sellIronBtn.addEventListener("click", () => {
  const amt = Math.floor(resources.iron.count * resources.iron.sellPrice);
  resources.money.count += amt;
  resources.iron.count = 0;
  updateUI();
  createSellPop("iron");
});

mineCopperBtn.addEventListener("click", () => {
  if (!copperUnlocked) return;
  resources.copper.count += resources.copper.perClick;
  updateUI();
});
sellCopperBtn.addEventListener("click", () => {
  if (!copperUnlocked) return;
  const amt = Math.floor(resources.copper.count * resources.copper.sellPrice);
  resources.money.count += amt;
  resources.copper.count = 0;
  updateUI();
  createSellPop("copper");
});

mineBronzeBtn.addEventListener("click", () => {
  if (!bronzeUnlocked) return;
  resources.bronze.count += resources.bronze.perClick;
  updateUI();
});
sellBronzeBtn.addEventListener("click", () => {
  if (!bronzeUnlocked) return;
  const amt = Math.floor(resources.bronze.count * resources.bronze.sellPrice);
  resources.money.count += amt;
  resources.bronze.count = 0;
  updateUI();
  createSellPop("bronze");
});

mineSilverBtn.addEventListener("click", () => {
  if (!silverUnlocked) return;
  resources.silver.count += resources.silver.perClick;
  updateUI();
});
sellSilverBtn.addEventListener("click", () => {
  if (!silverUnlocked) return;
  const amt = Math.floor(resources.silver.count * resources.silver.sellPrice);
  resources.money.count += amt;
  resources.silver.count = 0;
  updateUI();
  createSellPop("silver");
});

mineGoldBtn.addEventListener("click", () => {
  if (!goldUnlocked) return;
  resources.gold.count += resources.gold.perClick;
  updateUI();
});
sellGoldBtn.addEventListener("click", () => {
  if (!goldUnlocked) return;
  const amt = Math.floor(resources.gold.count * resources.gold.sellPrice);
  resources.money.count += amt;
  resources.gold.count = 0;
  updateUI();
  createSellPop("gold");
});

// ─── Auto-mine loop ─────────────────────────────────────────────────────────
setInterval(() => {
  resources.iron.count += resources.iron.perSecond / 10;
  if (copperUnlocked) resources.copper.count += resources.copper.perSecond / 10;
  if (bronzeUnlocked) resources.bronze.count += resources.bronze.perSecond / 10;
  if (silverUnlocked) resources.silver.count += resources.silver.perSecond / 10;
  if (goldUnlocked) resources.gold.count += resources.gold.perSecond / 10;

  updateUI();
  if (shopScreen.classList.contains("open")) updateShopButtons();
}, 100);

// ─── Shop purchase handler ──────────────────────────────────────────────────
shopList.addEventListener("click", (e) => {
  if (!e.target.matches(".shop-btn")) return;
  const item = shopItems.find((i) => i.id === e.target.id);
  if (!item) return;

  resources.money.count -= item.price;
  item.apply();
  item.count++;
  item.price = Math.floor(item.basePrice * Math.pow(item.scale, item.count));

  updateUI();
  updateShopButtons();

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

// ─── Resource tab switching ─────────────────────────────────────────────────
resourceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    currentResource = tab.dataset.resource;
    resourceTabs.forEach((t) => t.classList.toggle("active", t === tab));
    switchResource(currentResource);
  });
});

// ─── Shop drawer toggling ───────────────────────────────────────────────────
tabMine.addEventListener("click", () => switchTab(true));
tabShop.addEventListener("click", () => switchTab(false));
overlay.addEventListener("click", () => switchTab(true));

// ─── Auto-sell toggles per resource ─────────────────────────────────────────
["iron", "copper", "bronze", "silver", "gold"].forEach((resId) => {
  const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
  if (toggle) {
    toggle.addEventListener("change", () => {
      toggle.checked ? startAutoSell(resId) : stopAutoSell(resId);
    });
  }
});

// ─── Unlock Handlers ───────────────────────────────────────────────────────
unlockCopperBtn?.addEventListener("click", () => {
  if (resources.money.count < 5000) {
    alert("You need $5000 to unlock Copper!");
    return;
  }
  resources.money.count -= 5000;
  unlockCopperUI();
  updateUI();
});

unlockBronzeBtn?.addEventListener("click", () => {
  if (resources.money.count < 25000) {
    alert("You need $25000 to unlock Bronze!");
    return;
  }
  resources.money.count -= 25000;
  unlockBronzeUI();
  updateUI();
});

unlockSilverBtn?.addEventListener("click", () => {
  if (resources.money.count < 100000) {
    alert("You need $100,000 to unlock Silver!");
    return;
  }
  resources.money.count -= 100000;
  unlockSilverUI();
  updateUI();
});

unlockGoldBtn?.addEventListener("click", () => {
  if (resources.money.count < 1_000_000) {
    alert("You need $1,000,000 to unlock Gold!");
    return;
  }
  resources.money.count -= 1_000_000;
  unlockGoldUI();
  updateUI();
});

// ─── CORE FUNCTIONS ─────────────────────────────────────────────────────────
function switchTab(showMine) {
  if (showMine) {
    shopScreen.classList.remove("open");
    shopScreen.classList.add("hidden");
    overlay.classList.remove("open");
    overlay.classList.add("hidden");
    tabMine.classList.add("active");
    tabShop.classList.remove("active");
  } else {
    shopScreen.classList.remove("hidden");
    shopScreen.classList.add("open");
    overlay.classList.remove("hidden");
    overlay.classList.add("open");
    tabShop.classList.add("active");
    tabMine.classList.remove("active");
    renderShop();
  }
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

function updateShopButtons() {
  shopItems
    .filter((item) => item.category === currentResource)
    .forEach((item) => {
      const btn = document.getElementById(item.id);
      if (!btn) return;
      const canAfford = resources.money.count >= item.price;
      btn.disabled = !canAfford || item.count >= item.max;
      btn.textContent =
        item.count >= item.max
          ? `${item.name} (Max)`
          : `${item.name} ($${fmt(item.price)}) [${item.count}/${item.max}]`;
    });
}

function renderShop() {
  shopList.innerHTML = "";
  shopItems
    .filter((i) => i.category === currentResource)
    .forEach((item) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.id = item.id;
      btn.className = "shop-btn";
      btn.textContent = `${item.name} ($${fmt(item.price)}) [${item.count}/${
        item.max
      }]`;
      btn.disabled =
        resources.money.count < item.price || item.count >= item.max;
      li.appendChild(btn);
      shopList.appendChild(li);
    });
}

function updateUI() {
  ironCountEl.textContent = fmt(resources.iron.count);
  copperCountEl.textContent = fmt(resources.copper.count);
  bronzeCountEl.textContent = fmt(resources.bronze.count);
  silverCountEl.textContent = fmt(resources.silver.count);
  goldCountEl.textContent = fmt(resources.gold.count);
  moneyCountEl.textContent = `$${fmt(resources.money.count)}`;

  sellIronBtn.disabled = resources.iron.count <= 0;
  sellCopperBtn.disabled = resources.copper.count <= 0;
  sellBronzeBtn.disabled = resources.bronze.count <= 0;
  sellSilverBtn.disabled = resources.silver.count <= 0;
  sellGoldBtn.disabled = resources.gold.count <= 0;

  document.getElementById("auto-rate-iron").textContent = fmt(
    resources.iron.perSecond
  );
  document.getElementById("auto-rate-copper").textContent = fmt(
    resources.copper.perSecond
  );
  document.getElementById("auto-rate-bronze").textContent = fmt(
    resources.bronze.perSecond
  );
  document.getElementById("auto-rate-silver").textContent = fmt(
    resources.silver.perSecond
  );
  document.getElementById("auto-rate-gold").textContent = fmt(
    resources.gold.perSecond
  );
}

function createSellPop(resourceId) {
  const btn = document.getElementById(`sell-${resourceId}-btn`);
  const pop = document.createElement("span");
  pop.className = "sell-pop";
  pop.textContent = "$";
  btn.appendChild(pop);
  pop.addEventListener("animationend", () => pop.remove());
}

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
    const amt = Math.floor(resources[resId].count * resources[resId].sellPrice);
    resources.money.count += amt;
    resources[resId].count = 0;
    updateUI();
    createSellPop(resId);
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

// ─── VERSION LOAD ───────────────────────────────────────────────────────────
fetch("version.txt")
  .then((r) => r.text())
  .then((txt) => {
    const versionEl = document.getElementById("version");
    if (versionEl) versionEl.textContent = txt;
  })
  .catch(() => {});

// ─── SAVE / LOAD HELPERS ────────────────────────────────────────────────────
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
    money: resources.money.count,

    copperUnlocked,
    bronzeUnlocked,
    silverUnlocked,
    goldUnlocked,

    ironPerSecond: resources.iron.perSecond,
    copperPerSecond: resources.copper.perSecond,
    bronzePerSecond: resources.bronze.perSecond,
    silverPerSecond: resources.silver.perSecond,
    goldPerSecond: resources.gold.perSecond,

    upgrades: shopItems.map((i) => ({
      id: i.id,
      count: i.count,
      price: i.price,
    })),

    lastSave: Date.now(),
  };
}

function saveGame() {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.setItem("idleMinerSave", JSON.stringify(getSaveData()));
    console.log("Game saved at", new Date().toLocaleTimeString());
    flashSaveIndicator();
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
    resources.money.count = data.money || 0;

    copperUnlocked = data.copperUnlocked || false;
    bronzeUnlocked = data.bronzeUnlocked || false;
    silverUnlocked = data.silverUnlocked || false;
    goldUnlocked = data.goldUnlocked || false;

    if (copperUnlocked) unlockCopperUI();
    if (bronzeUnlocked) unlockBronzeUI();
    if (silverUnlocked) unlockSilverUI();
    if (goldUnlocked) unlockGoldUI();

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

    if (data.upgrades && Array.isArray(data.upgrades)) {
      data.upgrades.forEach((u) => {
        const item = shopItems.find((i) => i.id === u.id);
        if (item && u.count >= 0) {
          item.count = u.count;
          item.price =
            u.price ||
            Math.floor(item.basePrice * Math.pow(item.scale, item.count));
        }
      });
    }

    // Re-init auto-sellers
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
    return true;
  } catch (e) {
    console.error("Failed to load game:", e);
    return false;
  }
}

// ─── Unlock UI helpers ─────────────────────────────────────────────────────
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

// ─── NEW GAME INITIALIZER ──────────────────────────────────────────────────
function startNewGame() {
  ["iron", "copper", "bronze", "silver", "gold"].forEach((resId) => {
    stopAutoSell(resId);
    document.getElementById(`sell-timer-${resId}`)?.classList.add("hidden");
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) toggle.checked = false;
  });

  resources.iron.count =
    resources.copper.count =
    resources.bronze.count =
    resources.silver.count =
    resources.gold.count =
      0;

  resources.money.count = 0;

  resources.iron.perSecond =
    resources.copper.perSecond =
    resources.bronze.perSecond =
    resources.silver.perSecond =
    resources.gold.perSecond =
      0;

  copperUnlocked = bronzeUnlocked = silverUnlocked = goldUnlocked = false;

  shopItems.forEach((item) => {
    item.count = 0;
    item.price = item.basePrice;
  });

  if (isLocalStorageAvailable()) localStorage.removeItem("idleMinerSave");

  mineCopperBtn.disabled = sellCopperBtn.disabled = true;
  mineBronzeBtn.disabled = sellBronzeBtn.disabled = true;
  mineSilverBtn.disabled = sellSilverBtn.disabled = true;
  mineGoldBtn.disabled = sellGoldBtn.disabled = true;

  currentResource = "iron";
  resourceTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.resource === "iron");
  });

  relockResource("copper", 5000);
  relockResource("bronze", 25000);
  relockResource("silver", 100000);
  relockResource("gold", 1_000_000);

  document.getElementById("tab-resource-copper")?.classList.add("locked");

  updateUI();
  renderShop();

  console.log("New game started - all data wiped");
}

function relockResource(res, cost) {
  const panel = document.querySelector(
    `.resource-panel[data-resource="${res}"]`
  );
  if (panel && !panel.classList.contains("locked")) {
    panel.classList.add("locked");
    const overlayId = `lock-overlay-${res}`;
    if (!document.getElementById(overlayId)) {
      const lockOverlay = document.createElement("div");
      lockOverlay.className = "lock-overlay";
      lockOverlay.id = overlayId;
      lockOverlay.innerHTML = `<button id="unlock-${res}-btn">Unlock ${
        res.charAt(0).toUpperCase() + res.slice(1)
      } ($${fmt(cost)})</button>`;
      panel.appendChild(lockOverlay);

      const newUnlockBtn = document.getElementById(`unlock-${res}-btn`);
      if (newUnlockBtn) {
        newUnlockBtn.addEventListener("click", () => {
          if (resources.money.count < cost) {
            alert(
              `You need $${fmt(cost)} to unlock ${
                res.charAt(0).toUpperCase() + res.slice(1)
              }!`
            );
            return;
          }
          resources.money.count -= cost;
          if (res === "copper") unlockCopperUI();
          if (res === "bronze") unlockBronzeUI();
          if (res === "silver") unlockSilverUI();
          if (res === "gold") unlockGoldUI();
          updateUI();
        });
      }
    }
  }
}

// ─── KICKOFF AFTER MENU SELECTION ───────────────────────────────────────────
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
  switchResource(currentResource);
  switchTab(true);

  if (toggleAutoSave?.checked) startAutoSave();
}

// ─── AUTOSAVE FUNCTIONS ────────────────────────────────────────────────────
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

// ─── MENU BUTTON HANDLERS ──────────────────────────────────────────────────
btnContinue.addEventListener("click", () => {
  if (loadGame()) startGame();
  else {
    alert("Failed to load save data. Starting new game.");
    startNewGame();
    startGame();
  }
});

btnNewGame.addEventListener("click", () => {
  startNewGame();
  startGame();
});

btnSettings.addEventListener("click", () => {
  mainMenu.style.display = "none";
  settingsMenu.style.display = "flex";
});

btnBackToMenu.addEventListener("click", () => {
  settingsMenu.style.display = "none";
  mainMenu.style.display = "flex";
});

if (toggleAutoSave) {
  toggleAutoSave.addEventListener("change", (e) => {
    if (e.target.checked) {
      if (gameStarted) {
        startAutoSave();
        if (saveGame() && btnContinue) btnContinue.disabled = false;
      }
    } else {
      stopAutoSave();
    }
  });
}

// ─── SHOW MENU ON PAGE LOAD ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const hasSave =
    isLocalStorageAvailable() && !!localStorage.getItem("idleMinerSave");
  if (btnContinue) btnContinue.disabled = !hasSave;
  if (gameUI) gameUI.style.display = "none";
  if (mainMenu) mainMenu.style.display = "flex";
  gameStarted = false;
});

// ─── Save Indicator Flash ──────────────────────────────────────────────────
function flashSaveIndicator() {
  if (!saveIndicator) return;
  saveIndicator.classList.remove("hidden");
  saveIndicator.classList.add("show");
  setTimeout(() => {
    saveIndicator.classList.remove("show");
    saveIndicator.classList.add("hidden");
  }, 2000);
}

// ─── AutoSave Cog Indicator ────────────────────────────────────────────────
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

// ─── Save & Menu button ────────────────────────────────────────────────────
if (btnSaveMenu) {
  btnSaveMenu.addEventListener("click", () => {
    if (saveGame()) {
      if (btnContinue) btnContinue.disabled = false;
      flashSaveIndicator();
    } else {
      alert("Failed to save game. Please check browser settings.");
    }
    if (gameUI) gameUI.style.display = "none";
    if (mainMenu) mainMenu.style.display = "flex";
    gameStarted = false;
    stopAutoSave();
  });
}
