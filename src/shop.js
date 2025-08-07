// ───────────────────────────────────────────────────────────────────────────
// SHOP
// ───────────────────────────────────────────────────────────────────────────

import { RES_IDS, gameState, resources, stats, isUnlocked } from './dataModel.js';
import { shopList, resourceFilterSelect, tabMine, tabShop, tabStats, tabCore, screenMine, screenShop, screenStats, screenCore } from './uiElements.js';
import { fmt } from './helpers.js';
import { spendMoney, attemptUnlock } from './unlocking.js';
import { startAutoSell, stopAutoSell } from './gameLoop.js';

// Track scroll positions for mine and shop screens
let mineScrollY = 0;
let shopScrollY = 0;

// Helper function to ensure shop items are initialized
function ensureShopItemsInitialized() {
  if (!window.shopItems) {
    if (window.createShopItems) {
      window.shopItems = window.createShopItems(resources);
      console.log("Shop items lazy-initialized:", window.shopItems.length, "items");
      if (window.shopItems.length > 0) {
        console.log("Sample shop item:", window.shopItems[0]);
      } else {
        console.error("No shop items were created!");
      }
    }
  }
  return window.shopItems || [];
}

// Bulk cost calculation
function bulkCost(item, n) {
  const a = item.basePrice * Math.pow(item.scale, item.count);
  if (item.scale === 1) return Math.floor(a * n);
  return Math.floor((a * (Math.pow(item.scale, n) - 1)) / (item.scale - 1));
}

// Calculate how many items can be afforded
function bulkAffordable(item, money) {
  const a = item.basePrice * Math.pow(item.scale, item.count);
  if (item.scale === 1) {
    return Math.max(0, Math.min(item.max - item.count, Math.floor(money / a)));
  }
  const n = Math.floor(
    Math.log(1 + (money * (item.scale - 1)) / a) / Math.log(item.scale)
  );
  return Math.max(0, Math.min(item.max - item.count, n));
}

// Get max buyable count
function buyMaxCount(item) {
  return bulkAffordable(item, resources.money.count);
}

// Get max buy cost
function buyMaxCost(item) {
  const n = buyMaxCount(item);
  return n > 0 ? bulkCost(item, n) : 0;
}

// Render shop interface
function renderShop() {
  if (!shopList) {
    console.error("shopList element not found!");
    return;
  }

  // Ensure shop items are initialized
  const allItems = ensureShopItemsInitialized();

  // Filter items for current resource
  const items = allItems.filter((i) => i.category === gameState.currentResource);

  if (!items.length) {
    shopList.innerHTML = `<li class="shop-empty">No upgrades for "${gameState.currentResource}"</li>`;
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

// Update shop button states
function updateShopButtons() {
  // Ensure shop items are initialized
  const items = ensureShopItemsInitialized();

  // Performance: Cache shop elements to avoid repeated queries
  if (!updateShopButtons.elementCache) {
    updateShopButtons.elementCache = new Map();
  }

  const cache = updateShopButtons.elementCache;
  const currentMoney = resources.money.count;

  items.forEach((item) => {
    // Cache DOM queries for better performance
    let cachedElements = cache.get(item.id);
    if (!cachedElements) {
      cachedElements = {
        priceEl: document.getElementById(`price-${item.id}`),
        buyBtn: document.querySelector(`.shop-btn[data-item-id="${item.id}"]`),
        maxBtn: document.querySelector(`.shop-btn-max[data-item-id="${item.id}"]`),
        ownedEl: document.getElementById(`owned-${item.id}`),
        barEl: document.getElementById(`bar-${item.id}`)
      };
      cache.set(item.id, cachedElements);
    }

    const { priceEl, buyBtn, maxBtn, ownedEl, barEl } = cachedElements;
    
    // Skip if elements don't exist (item might not be visible)
    if (!priceEl || !buyBtn || !maxBtn) return;

    // Update price display
    priceEl.textContent = `$${fmt(item.price)}`;

    // Update buy button
    const canAfford = currentMoney >= item.price;
    const isMaxed = item.count >= item.max;
    buyBtn.disabled = !canAfford || isMaxed;
    buyBtn.textContent = isMaxed ? "Maxed" : "Buy";

    // Update max buy button
    const maxCount = buyMaxCount(item);
    maxBtn.disabled = isMaxed || maxCount < 2;
    maxBtn.textContent = isMaxed ? "Maxed" : maxCount >= 2 ? `Buy Max (${maxCount})` : "Buy Max";

    // Update owned count and progress bar
    if (ownedEl) ownedEl.textContent = `${item.count}/${item.max}`;
    if (barEl) {
      const pct = (item.count / item.max) * 100;
      barEl.style.width = `${pct}%`;
    }
  });
}

// Switch resource display
function switchResource(res) {
  gameState.currentResource = res;
  document
    .querySelectorAll(".resource-panel")
    .forEach((panel) =>
      panel.classList.toggle("active", panel.dataset.resource === res)
    );
  renderShop();
  if (window.updateUI) window.updateUI();
}

// Show specific screen
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
  if (tabCore) tabCore.classList.remove("active");

  screenMine.classList.add("hidden");
  screenShop.classList.add("hidden");
  screenStats.classList.add("hidden");
  if (screenCore) screenCore.classList.add("hidden");

  if (which === "mine") {
    tabMine.classList.add("active");
    screenMine.classList.remove("hidden");
    // Restore scroll position
    setTimeout(() => window.scrollTo(0, mineScrollY), 0);
  } else if (which === "shop") {
    tabShop.classList.add("active");
    screenShop.classList.remove("hidden");
    renderShop();
    // Restore scroll position
    setTimeout(() => window.scrollTo(0, shopScrollY), 0);
  } else if (which === "stats") {
    tabStats.classList.add("active");
    screenStats.classList.remove("hidden");
    if (window.updateStatsUI) window.updateStatsUI();
  } else if (which === "forgecore" && screenCore) {
    tabCore.classList.add("active");
    screenCore.classList.remove("hidden");
    if (window.updateCoreUI) window.updateCoreUI();
  }
}

// Initialize shop event listeners
function initializeShopEventListeners() {
  // Shop purchase handler
  if (shopList) {
    shopList.addEventListener("click", (e) => {
      const isMax = e.target.classList.contains("shop-btn-max");
      const isBuy = e.target.classList.contains("shop-btn") && !isMax;
      if (!isMax && !isBuy) return;

      // Ensure shop items are initialized
      const items = ensureShopItemsInitialized();

      const id = e.target.dataset.itemId || e.target.id;
      const item = items.find((i) => i.id === id);
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

      if (window.updateUI) window.updateUI();
      renderShop();
      // Apply milestone rewards on shop purchase
      if (window.applyMilestoneRewards) window.applyMilestoneRewards();
      // Refresh UI & stats so new autominer rates show immediately
      if (window.updateUI) window.updateUI();
      if (window.updateStatsUI) window.updateStatsUI();

      if (item.id.endsWith("-autoseller")) {
        const resId = item.category;
        document.getElementById(`sell-timer-${resId}`)?.classList.remove("hidden");
        const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
        if (toggle) {
          toggle.checked = true;
          startAutoSell(resId);
        }
      }

      // Handle autosell speed upgrades
      if (item.id.endsWith("-autosell-speed")) {
        const resId = item.category;
        // Check if autosell is currently active for this resource
        const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
        if (toggle && toggle.checked) {
          // Restart autosell with the new speed
          startAutoSell(resId);
        }
      }
    });
  }

  // Resource filter dropdown handler
  if (resourceFilterSelect) {
    resourceFilterSelect.addEventListener("change", (e) => {
      const res = e.target.value;
      if (!RES_IDS.includes(res)) return;

      if (!isUnlocked(res)) {
        attemptUnlock(res);
        // Reset dropdown to previous valid selection
        resourceFilterSelect.value = gameState.currentResource;
        return;
      }

      switchResource(res);
    });
  }

  // Tab navigation handlers
  if (tabMine) tabMine.addEventListener("click", () => showScreen("mine"));
  if (tabShop) tabShop.addEventListener("click", () => showScreen("shop"));
  if (tabStats) tabStats.addEventListener("click", () => showScreen("stats"));
  if (tabCore) tabCore.addEventListener("click", () => showScreen("forgecore"));
}

export {
  ensureShopItemsInitialized,
  bulkCost,
  bulkAffordable,
  buyMaxCount,
  buyMaxCost,
  renderShop,
  updateShopButtons,
  switchResource,
  showScreen,
  initializeShopEventListeners,
  mineScrollY,
  shopScrollY
};