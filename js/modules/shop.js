// Shop Logic Module

import { resources, RES_IDS, stats, ensureShopItemsInitialized } from './data.js';
import { spendMoney } from './game.js';
import { updateUI } from './ui.js';
import { updateStatsUI } from './ui.js';
import { startAutoSell } from './autosell.js';
import { isUnlocked } from './helpers.js';

let currentResource = 'iron';

/** Buy max helper (moved from legacy script) */
export function buyMaxCount(item) {
  // TODO: extract logic from script.js
  // Placeholder implementation
  return 1;
}

/** Bulk cost helper */
export function bulkCost(item, n) {
  // TODO: extract logic from script.js
  return item.basePrice * n;
}

/** Render the shop for the current resource */
export function renderShop() {
  const shopList = document.getElementById('shop-list');
  if (!shopList) return;
  shopList.innerHTML = '';
  const items = ensureShopItemsInitialized().filter(i => i.category === currentResource);
  if (items.length === 0) {
    shopList.innerHTML = `<li class="shop-empty">No upgrades for "${currentResource}"</li>`;
    return;
  }
  const frag = document.createDocumentFragment();
  items.forEach(item => {
    const li = document.createElement('li');
    li.id = item.id;
    // Build inner HTML based on item properties
    li.innerHTML = `
      <div class="shop-item">
        <div class="shop-name">${item.name}</div>
        <div class="shop-count">${item.count}</div>
        <button class="shop-btn" data-item-id="${item.id}">Buy</button>
        <button class="shop-btn-max" data-item-id="${item.id}">Buy Max</button>
      </div>
    `;
    frag.appendChild(li);
  });
  shopList.appendChild(frag);
}

/** Initialize shop event listeners */
export function initShop() {
  const shopList = document.getElementById('shop-list');
  if (shopList) {
    shopList.addEventListener('click', (e) => {
      const isMax = e.target.classList.contains('shop-btn-max');
      const isBuy = e.target.classList.contains('shop-btn') && !isMax;
      if (!isMax && !isBuy) return;

      const items = ensureShopItemsInitialized();
      const id = e.target.dataset.itemId || e.target.id;
      const item = items.find(i => i.id === id);
      if (!item) return;

      let n = isMax ? buyMaxCount(item) : 1;
      if (n <= 0) return;

      const cost = isMax ? bulkCost(item, n) : item.price;
      if (resources.money.count < cost) return;

      spendMoney(cost);
      stats.earnedMoney += cost; // update stats accordingly

      for (let i = 0; i < n; i++) item.apply();
      item.count += n;
      item.price = Math.floor(item.basePrice * Math.pow(item.scale, item.count));

      updateUI();
      renderShop();
      updateStatsUI();

      if (item.id.endsWith('-autoseller')) {
        const resId = item.category;
        const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
        if (toggle) {
          toggle.checked = true;
          startAutoSell(resId);
        }
      }
      if (item.id.endsWith('-autosell-speed')) {
        const resId = item.category;
        const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
        if (toggle && toggle.checked) {
          startAutoSell(resId);
        }
      }
    });
  }

  const resourceFilterSelect = document.getElementById('resource-filter-select');
  if (resourceFilterSelect) {
    resourceFilterSelect.addEventListener('change', (e) => {
      const res = e.target.value;
      if (!RES_IDS.includes(res)) return;
      if (!isUnlocked(res)) {
        // TODO: attemptUnlock logic
        resourceFilterSelect.value = currentResource;
        return;
      }
      currentResource = res;
      renderShop();
    });
  }

  // Initial shop render
  renderShop();
}
