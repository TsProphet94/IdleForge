// script.js — Iron & Copper with independent auto-sell and smooth shop updates

import iron from './resources/iron.js';
import copper from './resources/copper.js';
import { shopItems } from './shop/items.js';

// ─── Data Model ────────────────────────────────────────────────────────────
export const resources = {
  iron,
  copper,
  money: { id: 'money', count: 0 }
};

// ─── UI ELEMENTS ────────────────────────────────────────────────────────────
const ironCountEl     = document.getElementById('iron-count');
const copperCountEl   = document.getElementById('copper-count');
const moneyCountEl    = document.getElementById('money-count');
const shopList        = document.getElementById('shop-list');
const resourceTabs    = document.querySelectorAll('.resource-tab');
const tabMine         = document.getElementById('tab-mine');
const tabShop         = document.getElementById('tab-shop');
const shopScreen      = document.getElementById('screen-shop');
const overlay         = document.getElementById('overlay');
const unlockCopperBtn = document.getElementById('unlock-copper-btn');

const mineIronBtn   = document.getElementById('mine-iron-btn');
const sellIronBtn   = document.getElementById('sell-iron-btn');
const mineCopperBtn = document.getElementById('mine-copper-btn');
const sellCopperBtn = document.getElementById('sell-copper-btn');

// Dev-panel (optional)
const isDev        = true;
const devPanel     = document.getElementById('dev-panel');
const devAddIron   = document.getElementById('dev-add-iron');
const devAddCopper = document.getElementById('dev-add-copper');
const devAddMoney  = document.getElementById('dev-add-money');

// ─── Auto-sell state ─────────────────────────────────────────────────────────
const autoSellTimers    = {};
const countdownTimers   = {};
const nextSellTimes     = {};
const autoSellIntervals = {};

// ─── State ───────────────────────────────────────────────────────────────────
let currentResource = 'iron';
let copperUnlocked  = false; // block copper until unlocked

// ─── Dev-panel logic ──────────────────────────────────────────────────────────
if (devPanel) devPanel.classList.toggle('hidden', !isDev);
if (isDev) {
  devAddIron.addEventListener('click',   () => { resources.iron.count   += 1000; updateUI(); });
  devAddCopper.addEventListener('click', () => { resources.copper.count += 1000; updateUI(); });
  devAddMoney.addEventListener('click',  () => { resources.money.count  += 1000; updateUI(); });
}

// ─── Initial UI setup ────────────────────────────────────────────────────────
shopScreen.classList.add('hidden');
overlay.classList.add('hidden');
tabMine.classList.add('active');

// Disable Copper until unlocked
mineCopperBtn.disabled = true;
sellCopperBtn.disabled = true;

// ─── Mining & Selling ────────────────────────────────────────────────────────
// Iron
mineIronBtn.addEventListener('click', () => {
  resources.iron.count += resources.iron.perClick;
  updateUI();
});

sellIronBtn.addEventListener('click', () => {
  const amt = Math.floor(resources.iron.count * resources.iron.sellPrice);
  resources.money.count += amt;
  resources.iron.count = 0;
  updateUI();
  createSellPop('iron');
});

// Copper (blocked until unlocked)
mineCopperBtn.addEventListener('click', () => {
  if (!copperUnlocked) return;
  resources.copper.count += resources.copper.perClick;
  updateUI();
});

sellCopperBtn.addEventListener('click', () => {
  if (!copperUnlocked) return;
  const amt = Math.floor(resources.copper.count * resources.copper.sellPrice);
  resources.money.count += amt;
  resources.copper.count = 0;
  updateUI();
  createSellPop('copper');
});

// ─── Auto-mine loop (both resources) ─────────────────────────────────────────
setInterval(() => {
  resources.iron.count += resources.iron.perSecond / 10;
  if (copperUnlocked) {
    resources.copper.count += resources.copper.perSecond / 10;
  }

  updateUI();

  // Smoothly update shop buttons if Shop is open
  if (shopScreen.classList.contains('open')) {
    updateShopButtons();
  }
}, 100);

// ─── Shop purchase handler ───────────────────────────────────────────────────
shopList.addEventListener('click', e => {
  if (!e.target.matches('.shop-btn')) return;
  const item = shopItems.find(i => i.id === e.target.id);
  if (!item) return;

  // Purchase
  resources.money.count -= item.price;
  item.apply();
  item.count++;
  item.price = Math.floor(item.basePrice * Math.pow(item.scale, item.count));

  updateUI();
  updateShopButtons();

  // Auto-Seller logic
  if (item.id.startsWith('auto-seller')) {
    const resId = item.category;
    document.getElementById(`sell-timer-${resId}`).classList.remove('hidden');
    const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
    if (toggle) {
      toggle.checked = true;
      startAutoSell(resId);
    }
  }
});

// ─── Resource tab switching ──────────────────────────────────────────────────
resourceTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    currentResource = tab.dataset.resource;
    resourceTabs.forEach(t => t.classList.toggle('active', t === tab));
    switchResource(currentResource);
  });
});

// ─── Shop drawer toggling ────────────────────────────────────────────────────
tabMine.addEventListener('click',   () => switchTab(true));
tabShop.addEventListener('click',   () => switchTab(false));
overlay.addEventListener('click',   () => switchTab(true));

// ─── Auto-sell toggles per resource ──────────────────────────────────────────
['iron', 'copper'].forEach(resId => {
  const toggle = document.getElementById(`auto-sell-toggle-${resId}`);
  if (toggle) {
    toggle.addEventListener('change', () => {
      toggle.checked ? startAutoSell(resId) : stopAutoSell(resId);
    });
  }
});

// ─── Unlock Copper handler ───────────────────────────────────────────────────
unlockCopperBtn.addEventListener('click', () => {
  if (resources.money.count < 2000) {
    alert('You need $2000 to unlock Copper!');
    return;
  }

  resources.money.count -= 2000;
  copperUnlocked = true;
  mineCopperBtn.disabled = false;
  sellCopperBtn.disabled = false;
  updateUI();

  // Remove lock UI
  const panel = document.querySelector('.resource-panel[data-resource="copper"]');
  panel.classList.remove('locked');
  document.getElementById('lock-overlay-copper').remove();

  // Reveal Copper tab
  document.getElementById('tab-resource-copper').classList.remove('locked');
});

// ─── CORE FUNCTIONS ──────────────────────────────────────────────────────────
function switchTab(showMine) {
  if (showMine) {
    shopScreen.classList.remove('open');
    shopScreen.classList.add('hidden');
    overlay.classList.remove('open');
    overlay.classList.add('hidden');
    tabMine.classList.add('active');
    tabShop.classList.remove('active');
  } else {
    shopScreen.classList.remove('hidden');
    shopScreen.classList.add('open');
    overlay.classList.remove('hidden');
    overlay.classList.add('open');
    tabShop.classList.add('active');
    tabMine.classList.remove('active');
    renderShop();
  }
}

function switchResource(res) {
  document.querySelectorAll('.resource-panel').forEach(panel =>
    panel.classList.toggle('active', panel.dataset.resource === res)
  );
  renderShop();
  updateUI();
}

function updateShopButtons() {
  shopItems
    .filter(item => item.category === currentResource)
    .forEach(item => {
      const btn = document.getElementById(item.id);
      if (!btn) return;
      const canAfford = resources.money.count >= item.price;
      btn.disabled = !canAfford || item.count >= item.max;
      btn.textContent = item.count >= item.max
        ? `${item.name} (Max)`
        : `${item.name} ($${item.price}) [${item.count}/${item.max}]`;
    });
}

function renderShop() {
  shopList.innerHTML = '';
  shopItems
    .filter(i => i.category === currentResource)
    .forEach(item => {
      const li  = document.createElement('li');
      const btn = document.createElement('button');
      btn.id        = item.id;
      btn.className = 'shop-btn';
      btn.textContent = `${item.name} ($${item.price}) [${item.count}/${item.max}]`;
      btn.disabled  = resources.money.count < item.price || item.count >= item.max;
      li.appendChild(btn);
      shopList.appendChild(li);
    });
}

function updateUI() {
  ironCountEl.textContent   = resources.iron.count.toFixed(1);
  copperCountEl.textContent = resources.copper.count.toFixed(1);
  moneyCountEl.textContent  = `$${resources.money.count}`;

  sellIronBtn.disabled   = resources.iron.count <= 0;
  sellCopperBtn.disabled = resources.copper.count <= 0;

  document.getElementById('auto-rate-iron').textContent   = resources.iron.perSecond.toFixed(1);
  document.getElementById('auto-rate-copper').textContent = resources.copper.perSecond.toFixed(1);
}

function createSellPop(resourceId) {
  const btn = document.getElementById(`sell-${resourceId}-btn`);
  const pop = document.createElement('span');
  pop.className   = 'sell-pop';
  pop.textContent = '$';
  btn.appendChild(pop);
  pop.addEventListener('animationend', () => pop.remove());
}

function startAutoSell(resId) {
  stopAutoSell(resId);
  const seller = shopItems.find(i =>
    i.category === resId && i.id.startsWith('auto-seller')
  );
  if (!seller || seller.count === 0) return;

  autoSellIntervals[resId] = 5000;
  nextSellTimes[resId]     = Date.now() + autoSellIntervals[resId];

  document.getElementById(`sell-timer-${resId}`).classList.remove('hidden');
  countdownTimers[resId] = setInterval(() => updateSellCountdown(resId), 500);
  autoSellTimers[resId]  = setInterval(() => {
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
  document.getElementById(`sell-countdown-${resId}`).textContent = Math.max(sec, 0);
}

// Load version into footer
fetch('version.txt')
  .then(r => r.text())
  .then(txt => document.getElementById('version').textContent = txt);

// ─── INITIALIZE ─────────────────────────────────────────────────────────────
switchResource(currentResource);
switchTab(true);