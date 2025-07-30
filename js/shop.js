// js/shop.js - Shop rendering and purchase logic
import { resources, stats, RES_IDS, ensureShopItemsInitialized } from './data.js';
import { fmt, spendMoney, isUnlocked } from './resources.js';
import { getCachedElement, UI_ELEMENTS } from './ui.js';

// ───────────────────────────────────────────────────────────────────────────
// SHOP STATE
// ───────────────────────────────────────────────────────────────────────────

export let currentResource = "iron";

export function setCurrentResource(resource) {
  currentResource = resource;
}

// ───────────────────────────────────────────────────────────────────────────
// BULK BUY HELPERS
// ───────────────────────────────────────────────────────────────────────────

export function bulkCost(item, n) {
  const a = item.basePrice * Math.pow(item.scale, item.count);
  if (item.scale === 1) return Math.floor(a * n);
  return Math.floor((a * (Math.pow(item.scale, n) - 1)) / (item.scale - 1));
}

export function bulkAffordable(item, money) {
  const a = item.basePrice * Math.pow(item.scale, item.count);
  if (item.scale === 1) {
    return Math.max(0, Math.min(item.max - item.count, Math.floor(money / a)));
  }
  const n = Math.floor(
    Math.log(1 + (money * (item.scale - 1)) / a) / Math.log(item.scale)
  );
  return Math.max(0, Math.min(n, item.max - item.count));
}

export function buyMaxCount(item) {
  return bulkAffordable(item, resources.money.count);
}

export function buyMaxCost(item) {
  const n = buyMaxCount(item);
  return n > 0 ? bulkCost(item, n) : 0;
}

// ───────────────────────────────────────────────────────────────────────────
// SHOP PURCHASE FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

export function handleShopPurchase(e, isMax = false) {
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

  // Update UI
  import('./ui.js').then(({ updateUI }) => updateUI && updateUI());
  renderShop();
  
  // Apply milestone rewards on shop purchase
  import('./stats.js').then(({ applyMilestoneRewards, updateStatsUI }) => {
    applyMilestoneRewards && applyMilestoneRewards();
    updateStatsUI && updateStatsUI();
  });

  if (item.id.endsWith("-autoseller")) {
    const resId = item.category;
    document.getElementById(`sell-timer-${resId}`)?.classList.remove("hidden");
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) {
      toggle.checked = true;
      import('./resources.js').then(({ startAutoSell }) => startAutoSell && startAutoSell(resId));
    }
  }

  // Handle autosell speed upgrades
  if (item.id.endsWith("-autosell-speed")) {
    const resId = item.category;
    // Check if autosell is currently active for this resource
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle && toggle.checked) {
      // Restart autosell with the new speed
      import('./resources.js').then(({ startAutoSell }) => startAutoSell && startAutoSell(resId));
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
// SHOP UI FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

export function updateShopButtons() {
  // Ensure shop items are initialized
  const items = ensureShopItemsInitialized();

  // Performance: Cache shop elements to avoid repeated queries
  if (!updateShopButtons.elementCache) {
    updateShopButtons.elementCache = new Map();
  }

  const cache = updateShopButtons.elementCache;
  const currentMoney = resources.money.count;

  items
    .filter((item) => item.category === currentResource)
    .forEach((item) => {
      // Cache DOM elements for this item
      if (!cache.has(item.id)) {
        cache.set(item.id, {
          buyBtn: document.querySelector(
            `.shop-btn[data-item-id="${item.id}"]:not(.shop-btn-max)`
          ),
          maxBtn: document.querySelector(
            `.shop-btn-max[data-item-id="${item.id}"]`
          ),
          priceEl: getCachedElement(`price-${item.id}`),
          ownedEl: getCachedElement(`owned-${item.id}`),
          barEl: getCachedElement(`bar-${item.id}`),
        });
      }

      const elements = cache.get(item.id);
      const { buyBtn, maxBtn, priceEl, ownedEl, barEl } = elements;

      if (buyBtn) {
        const canAfford = currentMoney >= item.price;
        buyBtn.disabled = !canAfford || item.count >= item.max;
        buyBtn.textContent = item.count >= item.max ? "Maxed" : "Buy";
      }

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

      if (priceEl) priceEl.textContent = `$${fmt(item.price)}`;
      if (ownedEl) ownedEl.textContent = `${item.count}/${item.max}`;
      if (barEl) barEl.style.width = (item.count / item.max) * 100 + "%";
    });
}

/** Build the shop list with descriptions */
export function renderShop() {
  if (!UI_ELEMENTS.shopList) {
    console.error("shopList element not found!");
    return;
  }

  // Ensure shop items are initialized
  const allItems = ensureShopItemsInitialized();

  // Always rebuild the cache to ensure fresh data
  // Remove the complex caching logic that might be causing issues
  const items = allItems.filter((i) => i.category === currentResource);

  if (!items.length) {
    UI_ELEMENTS.shopList.innerHTML = `<li class="shop-empty">No upgrades for "${currentResource}"</li>`;
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

  UI_ELEMENTS.shopList.innerHTML = "";
  UI_ELEMENTS.shopList.appendChild(frag);
  
  // Attach auto-sell toggle listeners after shop is rendered
  RES_IDS.forEach((resId) => {
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) {
      toggle.removeEventListener(
        "change",
        toggle._autoSellHandler || (() => {})
      );
      toggle._autoSellHandler = function (e) {
        import('./resources.js').then(({ startAutoSell, stopAutoSell }) => {
          if (e.target.checked) {
            startAutoSell && startAutoSell(resId);
          } else {
            stopAutoSell && stopAutoSell(resId);
          }
        });
      };
      toggle.addEventListener("change", toggle._autoSellHandler);
    }
  });
}

// ───────────────────────────────────────────────────────────────────────────
// SHOP FILTER FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

export function updateShopFilter() {
  if (!UI_ELEMENTS.resourceFilterSelect) return;

  RES_IDS.forEach((resId) => {
    const option = UI_ELEMENTS.resourceFilterSelect.querySelector(`option[data-resource="${resId}"]`);
    if (option) {
      const unlocked = isUnlocked(resId);
      option.disabled = !unlocked;
      
      if (unlocked) {
        option.classList.remove('locked-option');
        option.textContent = option.textContent.replace(' (Locked)', '');
      } else {
        option.classList.add('locked-option');
        if (!option.textContent.includes('(Locked)')) {
          option.textContent += ' (Locked)';
        }
      }
    }
  });
}

export function handleResourceFilterChange(event) {
  const newResource = event.target.value;
  if (newResource && RES_IDS.includes(newResource)) {
    setCurrentResource(newResource);
    renderShop();
    updateShopButtons();
  }
}

// ───────────────────────────────────────────────────────────────────────────
// SHOP EVENT HANDLERS
// ───────────────────────────────────────────────────────────────────────────

export function initShopEventHandlers() {
  // Shop purchase handlers
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('shop-btn')) {
      if (e.target.classList.contains('shop-btn-max')) {
        handleShopPurchase(e, true); // Buy max
      } else {
        handleShopPurchase(e, false); // Buy single
      }
    }
  });

  // Resource filter handler
  if (UI_ELEMENTS.resourceFilterSelect) {
    UI_ELEMENTS.resourceFilterSelect.addEventListener('change', handleResourceFilterChange);
  }
}