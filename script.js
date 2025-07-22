// script.js — Iron & Copper with independent auto-sell, smooth shop updates, and save/load + main menu

import iron from "./resources/iron.js";
import copper from "./resources/copper.js";
import { shopItems } from "./shop/items.js";

// ─── Data Model ────────────────────────────────────────────────────────────
export const resources = {
  iron,
  copper,
  money: { id: "money", count: 0 },
};

// ─── UI ELEMENTS ────────────────────────────────────────────────────────────
const ironCountEl = document.getElementById("iron-count");
const copperCountEl = document.getElementById("copper-count");
const moneyCountEl = document.getElementById("money-count");
const shopList = document.getElementById("shop-list");
const resourceTabs = document.querySelectorAll(".resource-tab");
const tabMine = document.getElementById("tab-mine");
const tabShop = document.getElementById("tab-shop");
const shopScreen = document.getElementById("screen-shop");
const overlay = document.getElementById("overlay");
const unlockCopperBtn = document.getElementById("unlock-copper-btn");

const mineIronBtn = document.getElementById("mine-iron-btn");
const sellIronBtn = document.getElementById("sell-iron-btn");
const mineCopperBtn = document.getElementById("mine-copper-btn");
const sellCopperBtn = document.getElementById("sell-copper-btn");

// ─── MENU & SAVE/LOAD ELEMENTS ────────────────────────────────────────────────
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

// ─── Dev-panel (optional) ────────────────────────────────────────────────────
const isDev = true;
const devPanel = document.getElementById("dev-panel");
const devAddIron = document.getElementById("dev-add-iron");
const devAddCopper = document.getElementById("dev-add-copper");
const devAddMoney = document.getElementById("dev-add-money");

if (devPanel) devPanel.classList.toggle("hidden", !isDev);
if (isDev) {
  devAddIron?.addEventListener("click", () => {
    resources.iron.count += 1000;
    updateUI();
  });
  devAddCopper?.addEventListener("click", () => {
    resources.copper.count += 1000;
    updateUI();
  });
  devAddMoney?.addEventListener("click", () => {
    resources.money.count += 1000;
    updateUI();
  });
}

// ─── Auto-sell state ─────────────────────────────────────────────────────────
const autoSellTimers = {};
const countdownTimers = {};
const nextSellTimes = {};
const autoSellIntervals = {};

// ─── State ───────────────────────────────────────────────────────────────────
let currentResource = "iron";
let copperUnlocked = false; // block copper until unlocked

// ─── Auto-save state (FIXED) ─────────────────────────────────────────────────
let autoSaveInterval = null;
let gameStarted = false;

// ─── Initial UI setup for game panels ────────────────────────────────────────
shopScreen.classList.add("hidden");
overlay.classList.add("hidden");
tabMine.classList.add("active");

// Disable Copper until unlocked
mineCopperBtn.disabled = true;
sellCopperBtn.disabled = true;

// ─── Mining & Selling ────────────────────────────────────────────────────────
// Iron
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

// Copper (blocked until unlocked)
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

// ─── Auto-mine loop (both resources) ─────────────────────────────────────────
setInterval(() => {
  resources.iron.count += resources.iron.perSecond / 10;
  if (copperUnlocked) {
    resources.copper.count += resources.copper.perSecond / 10;
  }

  updateUI();

  // Smoothly update shop buttons if Shop is open
  if (shopScreen.classList.contains("open")) {
    updateShopButtons();
  }
}, 100);

// ─── Shop purchase handler ───────────────────────────────────────────────────
shopList.addEventListener("click", (e) => {
  if (!e.target.matches(".shop-btn")) return;
  const item = shopItems.find((i) => i.id === e.target.id);
  if (!item) return;

  // Purchase
  resources.money.count -= item.price;
  item.apply();
  item.count++;
  item.price = Math.floor(item.basePrice * Math.pow(item.scale, item.count));

  updateUI();
  updateShopButtons();

  // Auto-Seller logic
  if (item.id.startsWith("auto-seller")) {
    const resId = item.category;
    const timerEl = document.getElementById(`sell-timer-${resId}`);
    if (timerEl) {
      timerEl.classList.remove("hidden");
    }
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) {
      toggle.checked = true;
      startAutoSell(resId);
    }
  }
});

// ─── Resource tab switching ──────────────────────────────────────────────────
resourceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    currentResource = tab.dataset.resource;
    resourceTabs.forEach((t) => t.classList.toggle("active", t === tab));
    switchResource(currentResource);
  });
});

// ─── Shop drawer toggling ────────────────────────────────────────────────────
tabMine.addEventListener("click", () => switchTab(true));
tabShop.addEventListener("click", () => switchTab(false));
overlay.addEventListener("click", () => switchTab(true));

// ─── Auto-sell toggles per resource ──────────────────────────────────────────
["iron", "copper"].forEach((resId) => {
  const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
  if (toggle) {
    toggle.addEventListener("change", () => {
      toggle.checked ? startAutoSell(resId) : stopAutoSell(resId);
    });
  }
});

// ─── Unlock Copper handler ───────────────────────────────────────────────────
unlockCopperBtn?.addEventListener("click", () => {
  if (resources.money.count < 5000) {
    alert("You need $5000 to unlock Copper!");
    return;
  }

  resources.money.count -= 5000;
  copperUnlocked = true;
  mineCopperBtn.disabled = false;
  sellCopperBtn.disabled = false;
  updateUI();

  // Remove lock UI
  const panel = document.querySelector(
    '.resource-panel[data-resource="copper"]'
  );
  if (panel) {
    panel.classList.remove("locked");
  }
  const lockOverlay = document.getElementById("lock-overlay-copper");
  if (lockOverlay) {
    lockOverlay.remove();
  }

  // Reveal Copper tab
  const copperTab = document.getElementById("tab-resource-copper");
  if (copperTab) {
    copperTab.classList.remove("locked");
  }
});

// ─── CORE FUNCTIONS ──────────────────────────────────────────────────────────
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
          : `${item.name} ($${item.price}) [${item.count}/${item.max}]`;
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
      btn.textContent = `${item.name} ($${item.price}) [${item.count}/${item.max}]`;
      btn.disabled =
        resources.money.count < item.price || item.count >= item.max;
      li.appendChild(btn);
      shopList.appendChild(li);
    });
}

function updateUI() {
  ironCountEl.textContent = resources.iron.count.toFixed(1);
  copperCountEl.textContent = resources.copper.count.toFixed(1);
  moneyCountEl.textContent = `$${resources.money.count}`;

  sellIronBtn.disabled = resources.iron.count <= 0;
  sellCopperBtn.disabled = resources.copper.count <= 0;

  document.getElementById("auto-rate-iron").textContent =
    resources.iron.perSecond.toFixed(1);
  document.getElementById("auto-rate-copper").textContent =
    resources.copper.perSecond.toFixed(1);
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

  const timerEl = document.getElementById(`sell-timer-${resId}`);
  if (timerEl) {
    timerEl.classList.remove("hidden");
  }
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
  if (countdownEl) {
    countdownEl.textContent = Math.max(sec, 0);
  }
}

// ─── VERSION LOAD ───────────────────────────────────────────────────────────
fetch("version.txt")
  .then((r) => r.text())
  .then((txt) => {
    const versionEl = document.getElementById("version");
    if (versionEl) {
      versionEl.textContent = txt;
    }
  })
  .catch(() => {
    // Version file doesn't exist, ignore
  });

// ─── SAVE / LOAD HELPERS WITH ERROR HANDLING (FIXED) ────────────────────────
function isLocalStorageAvailable() {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, "test");
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn("localStorage is not available:", e);
    return false;
  }
}

function getSaveData() {
  return {
    iron: resources.iron.count,
    copper: resources.copper.count,
    money: resources.money.count,
    copperUnlocked: copperUnlocked,
    ironPerSecond: resources.iron.perSecond,
    copperPerSecond: resources.copper.perSecond,
    upgrades: shopItems.map((i) => ({
      id: i.id,
      count: i.count,
      price: i.price,
    })),
    lastSave: Date.now(),
  };
}

function saveGame() {
  if (!isLocalStorageAvailable()) {
    console.warn("Cannot save: localStorage unavailable");
    return false;
  }

  try {
    const saveData = getSaveData();
    localStorage.setItem("idleMinerSave", JSON.stringify(saveData));
    console.log("Game saved successfully at", new Date().toLocaleTimeString());

    // Show save indicators
    flashSaveIndicator();
    if (gameStarted && toggleAutoSave && toggleAutoSave.checked) {
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
  if (!isLocalStorageAvailable()) {
    console.warn("Cannot load: localStorage unavailable");
    return false;
  }

  try {
    const raw = localStorage.getItem("idleMinerSave");
    if (!raw) {
      console.log("No save data found");
      return false;
    }

    const data = JSON.parse(raw);

    // Load resource counts
    resources.iron.count = data.iron || 0;
    resources.copper.count = data.copper || 0;
    resources.money.count = data.money || 0;

    // Load copper unlock status
    copperUnlocked = data.copperUnlocked || false;
    if (copperUnlocked) {
      unlockCopperUI();
    }

    // Load per-second rates directly (these are the final calculated values)
    if (data.ironPerSecond !== undefined) {
      resources.iron.perSecond = data.ironPerSecond;
    }
    if (data.copperPerSecond !== undefined) {
      resources.copper.perSecond = data.copperPerSecond;
    }

    // Load upgrades - only restore counts and prices, don't re-apply effects
    if (data.upgrades && Array.isArray(data.upgrades)) {
      data.upgrades.forEach((upgrade) => {
        const item = shopItems.find((i) => i.id === upgrade.id);
        if (item && upgrade.count >= 0) {
          // Just restore the saved count and price without re-applying effects
          item.count = upgrade.count;
          item.price =
            upgrade.price ||
            Math.floor(item.basePrice * Math.pow(item.scale, item.count));
        }
      });
    }

    console.log("Game loaded successfully");
    return true;
  } catch (e) {
    console.error("Failed to load game:", e);
    return false;
  }
}

// ─── Helper function to unlock copper UI ────────────────────────────────────
function unlockCopperUI() {
  copperUnlocked = true;
  mineCopperBtn.disabled = false;
  sellCopperBtn.disabled = false;

  // Remove lock UI
  const panel = document.querySelector(
    '.resource-panel[data-resource="copper"]'
  );
  if (panel) {
    panel.classList.remove("locked");
  }
  const lockOverlay = document.getElementById("lock-overlay-copper");
  if (lockOverlay) {
    lockOverlay.remove();
  }

  // Reveal Copper tab
  const copperTab = document.getElementById("tab-resource-copper");
  if (copperTab) {
    copperTab.classList.remove("locked");
  }
}

// ─── NEW GAME INITIALIZER (FIXED) ────────────────────────────────────────────
function startNewGame() {
  // Stop all auto-sell timers first
  ["iron", "copper"].forEach((resId) => {
    stopAutoSell(resId);
    // Hide timer displays
    const timerEl = document.getElementById(`sell-timer-${resId}`);
    if (timerEl) {
      timerEl.classList.add("hidden");
    }
    // Reset auto-sell toggles
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) {
      toggle.checked = false;
    }
  });

  // Reset all resources
  resources.iron.count = 0;
  resources.copper.count = 0;
  resources.money.count = 0;
  resources.iron.perSecond = 0;
  resources.copper.perSecond = 0;

  // Reset copper unlock
  copperUnlocked = false;

  // Reset all shop items to their initial state
  shopItems.forEach((item) => {
    item.count = 0;
    item.price = item.basePrice;
  });

  // Clear localStorage to prevent auto-save from preserving old data
  if (isLocalStorageAvailable()) {
    localStorage.removeItem("idleMinerSave");
  }

  // Reset UI states
  mineCopperBtn.disabled = true;
  sellCopperBtn.disabled = true;

  // Reset to iron tab
  currentResource = "iron";
  resourceTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.resource === "iron");
  });

  // Re-lock copper panel and tab
  const panel = document.querySelector(
    '.resource-panel[data-resource="copper"]'
  );
  if (panel && !panel.classList.contains("locked")) {
    panel.classList.add("locked");
    // Re-add lock overlay if it was removed
    if (!document.getElementById("lock-overlay-copper")) {
      const lockOverlay = document.createElement("div");
      lockOverlay.className = "lock-overlay";
      lockOverlay.id = "lock-overlay-copper";
      lockOverlay.innerHTML =
        '<button id="unlock-copper-btn">Unlock Copper ($5000)</button>';
      panel.appendChild(lockOverlay);
      // Re-attach event listener
      const newUnlockBtn = document.getElementById("unlock-copper-btn");
      if (newUnlockBtn) {
        newUnlockBtn.addEventListener("click", () => {
          if (resources.money.count < 5000) {
            alert("You need $5000 to unlock Copper!");
            return;
          }
          resources.money.count -= 5000;
          unlockCopperUI();
          updateUI();
        });
      }
    }
  }

  const copperTab = document.getElementById("tab-resource-copper");
  if (copperTab) {
    copperTab.classList.add("locked");
  }

  // Force UI update and shop re-render
  updateUI();
  renderShop();

  console.log("New game started - all data wiped");
}

// ─── KICKOFF AFTER MENU SELECTION ────────────────────────────────────────────
function startGame() {
  mainMenu.style.display = "none";
  settingsMenu.style.display = "none";
  gameUI.style.display = "flex";
  gameStarted = true; // Mark game as started
  updateUI();
  switchResource(currentResource);
  switchTab(true);

  // Start autosave if it's enabled
  if (toggleAutoSave && toggleAutoSave.checked) {
    startAutoSave();
  }
}

// ─── AUTOSAVE FUNCTIONS (COMPLETELY REWRITTEN) ──────────────────────────────
function startAutoSave() {
  stopAutoSave(); // Clear any existing interval

  if (!isLocalStorageAvailable()) {
    console.warn("Cannot start autosave: localStorage unavailable");
    return;
  }

  console.log("Starting autosave with 10-second interval");
  autoSaveInterval = setInterval(() => {
    if (gameStarted) {
      console.log("Autosave triggered");
      saveGame();
    }
  }, 10000); // 10 seconds

  // Save on page unload
  window.addEventListener("beforeunload", saveGame);
}

function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
    console.log("Autosave stopped");
  }
  window.removeEventListener("beforeunload", saveGame);
}

// ─── MENU BUTTON HANDLERS (FIXED) ───────────────────────────────────────────
btnContinue.addEventListener("click", () => {
  if (loadGame()) {
    startGame();
  } else {
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

// ─── AUTO-SAVE TOGGLE (COMPLETELY REWRITTEN) ────────────────────────────────
if (toggleAutoSave) {
  toggleAutoSave.addEventListener("change", (e) => {
    console.log("Autosave toggle changed:", e.target.checked);

    if (e.target.checked) {
      // Enable auto-save
      if (gameStarted) {
        startAutoSave();
        // Do an immediate save to test
        if (saveGame()) {
          if (btnContinue) btnContinue.disabled = false;
        }
      }
    } else {
      // Disable auto-save
      stopAutoSave();
    }
  });
}

// ─── SHOW MENU ON PAGE LOAD (FIXED) ──────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const hasSave =
    isLocalStorageAvailable() && !!localStorage.getItem("idleMinerSave");

  if (btnContinue) btnContinue.disabled = !hasSave;
  if (gameUI) gameUI.style.display = "none";
  if (mainMenu) mainMenu.style.display = "flex";

  console.log("Page loaded, save available:", hasSave);

  // Don't start autosave here - only when game actually starts
  gameStarted = false;
});

// ─── Save Indicator Flash (IMPROVED) ────────────────────────────────────────
function flashSaveIndicator() {
  if (!saveIndicator) return;
  saveIndicator.classList.remove("hidden");
  saveIndicator.classList.add("show");
  setTimeout(() => {
    saveIndicator.classList.remove("show");
    saveIndicator.classList.add("hidden");
  }, 2000);
}

// ─── AutoSave Cog Indicator (IMPROVED) ──────────────────────────────────────
function showAutoSaveIndicator() {
  let cogIndicator = document.getElementById("autosave-cog");
  if (!cogIndicator) {
    cogIndicator = document.createElement("div");
    cogIndicator.id = "autosave-cog";
    cogIndicator.className = "autosave-cog";
    cogIndicator.innerHTML = "⚙️";
    cogIndicator.title = "Auto-saving...";
    document.body.appendChild(cogIndicator);

    // Add styles dynamically if they don't exist
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
        
        .autosave-cog.show {
          opacity: 0.7;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  cogIndicator.classList.add("show");
}

function hideAutoSaveIndicator() {
  const cogIndicator = document.getElementById("autosave-cog");
  if (cogIndicator) {
    cogIndicator.classList.remove("show");
  }
}

// ─── Save & Menu button with proper error handling ──────────────────────────
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
    gameStarted = false; // Stop autosave when returning to menu
    stopAutoSave();
  });
}
