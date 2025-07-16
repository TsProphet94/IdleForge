// script.js — Full updated file with modular resource panels and fixed shop toggling

import { resources } from './resources/iron.js';
import { shopItems } from './shop/items.js';

// ─── UI ELEMENTS ───────────────────────────────────────────────────────────────
const moneyCountEl   = document.getElementById('money-count');
const autoRateEl     = document.getElementById('auto-rate');
const mineBtn        = document.getElementById('mine-iron-btn');
const sellAllBtn     = document.getElementById('sell-iron-btn');
const shopList       = document.getElementById('shop-list');
const tabMine        = document.getElementById('tab-mine');
const tabShop        = document.getElementById('tab-shop');
const shopScreen     = document.getElementById('screen-shop');
const overlay        = document.getElementById('overlay');
const autoSellToggle = document.getElementById('auto-sell-toggle');
const resourceTabs   = document.querySelectorAll('.resource-tab');

// ─── STATE ────────────────────────────────────────────────────────────────────
let currentResource   = 'iron';
let autoSellTimer     = null;
let countdownTimer    = null;
let nextSellTime      = 0;
let autoSellInterval  = 0;

// ─── RENDER SHOP ──────────────────────────────────────────────────────────────
function renderShop() {
  shopList.innerHTML = '';
  shopItems
    .filter(item => item.category === currentResource)
    .forEach(item => {
      const li  = document.createElement('li');
      const btn = document.createElement('button');
      btn.id        = item.id;
      btn.className = 'shop-btn';
      li.appendChild(btn);
      shopList.appendChild(li);
    });
  updateUI();
}

// Delegate clicks on shop buttons
shopList.addEventListener('click', e => {
  if (e.target.matches('.shop-btn')) {
    const item = shopItems.find(i => i.id === e.target.id);
    if (item) buyItem(item);
  }
});

// ─── SWITCH RESOURCE (Iron, Gold, etc.) ──────────────────────────────────────
function switchResource(res) {
  currentResource = res;

  // Show/Hide panels
  const prevPanel = document.querySelector('.resource-panel.active');
  if (prevPanel) prevPanel.classList.remove('active');
  const newPanel = document.querySelector(`.resource-panel[data-resource="${res}"]`);
  if (newPanel) newPanel.classList.add('active');

  // Highlight active tab
  const prevTab = document.querySelector('.resource-tab.active');
  if (prevTab) prevTab.classList.remove('active');
  const newTab = document.querySelector(`.resource-tab[data-resource="${res}"]`);
  if (newTab) newTab.classList.add('active');

  renderShop();
}

// ─── DEVELOPER MODE (optional) ───────────────────────────────────────────────
const isDev = false;
const devPanel = document.getElementById('dev-panel');
if (devPanel) devPanel.classList.toggle('hidden', !isDev);

if (isDev) {
  document.getElementById('dev-add-iron')
    .addEventListener('click', () => { resources.iron.count += 1000; updateUI(); });
  document.getElementById('dev-add-money')
    .addEventListener('click', () => { resources.money.count += 1000; updateUI(); });
}

// ─── AUTO-SELL CONTROLS ───────────────────────────────────────────────────────
function updateAutoSell(count) {
  if (autoSellTimer)  clearInterval(autoSellTimer);
  if (countdownTimer) clearInterval(countdownTimer);

  const timerLine = document.getElementById('sell-timer');
  if (timerLine) timerLine.classList.toggle('hidden', count <= 0);

  if (count > 0) {
    autoSellInterval = 5000;
    nextSellTime = Date.now() + autoSellInterval;

    updateSellCountdown();
    countdownTimer = setInterval(updateSellCountdown, 500);

    autoSellTimer = setInterval(() => {
      sellAll();
      nextSellTime = Date.now() + autoSellInterval;
    }, autoSellInterval);
  }
}

function updateSellCountdown() {
  const now  = Date.now();
  const diff = nextSellTime - now;
  const sec  = Math.ceil(diff / 1000);
  const el   = document.getElementById('sell-countdown');
  if (el) el.textContent = sec > 0 ? sec : 0;
}

// ─── UI REFRESH ────────────────────────────────────────────────────────────────
function updateUI() {
  // Counts & rates
  const countEl = document.getElementById(`${currentResource}-count`);
  countEl.textContent    = resources[currentResource].count.toFixed(1);
  autoRateEl.textContent = resources[currentResource].perSecond.toFixed(1);
  moneyCountEl.textContent = `$${resources.money.count}`;

  // Sell button
  sellAllBtn.disabled = resources[currentResource].count <= 0;

  // Shop buttons: labels & disabled state
  shopItems
    .filter(item => item.category === currentResource)
    .forEach(item => {
      const btn = document.getElementById(item.id);
      if (!btn) return;
      if (item.count >= item.max) {
        btn.disabled    = true;
        btn.textContent = `${item.name} - Max Purchased`;
      } else {
        const afford = resources.money.count >= item.price;
        btn.disabled    = !afford;
        btn.textContent = `${item.name} ($${item.price}) [${item.count}/${item.max}]`;
      }
    });
}

// ─── USER ACTIONS ─────────────────────────────────────────────────────────────
function mineClick() {
  resources[currentResource].count += resources[currentResource].perClick;
  updateUI();
}

function sellAll() {
  const amt = Math.floor(
    resources[currentResource].count * resources[currentResource].sellPrice
  );
  resources.money.count                 += amt;
  resources[currentResource].count       = 0;
  updateUI();
  createSellPop();
}

function createSellPop() {
  const pop       = document.createElement('span');
  pop.className   = 'sell-pop';
  pop.textContent = '$';
  sellAllBtn.appendChild(pop);
  pop.addEventListener('animationend', () => pop.remove());
}

function buyItem(item) {
  if (resources.money.count >= item.price && item.count < item.max) {
    resources.money.count -= item.price;
    item.apply();
    item.count++;
    item.price = Math.floor(item.basePrice * Math.pow(item.scale, item.count));

    if (item.id === 'auto-seller') {
      updateAutoSell(item.count);
    }

    updateUI();
  }
}

// ─── AUTO-MINER LOOP ──────────────────────────────────────────────────────────
setInterval(() => {
  resources[currentResource].count += resources[currentResource].perSecond / 10;
  updateUI();
}, 100);

// ─── SHOP PANEL TOGGLING ──────────────────────────────────────────────────────
function switchTab(showMine) {
  if (showMine) {
    // hide shop + overlay
    shopScreen.classList.remove('open');
    shopScreen.classList.add('hidden');
    overlay.classList.remove('open');
    overlay.classList.add('hidden');

    // activate mine tab
    tabMine.classList.add('active');
    tabShop.classList.remove('active');
  } else {
    // show shop + overlay
    shopScreen.classList.add('open');
    shopScreen.classList.remove('hidden');
    overlay.classList.add('open');
    overlay.classList.remove('hidden');

    // activate shop tab
    tabShop.classList.add('active');
    tabMine.classList.remove('active');
  }
}

// ─── BUTTON RIPPLE EFFECT ────────────────────────────────────────────────────
function createRipple(e) {
  const btn  = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  btn.style.setProperty('--ripple-x', `${e.clientX - rect.left}px`);
  btn.style.setProperty('--ripple-y', `${e.clientY - rect.top}px`);
  btn.classList.remove('ripple');
  void btn.offsetWidth;
  btn.classList.add('ripple');
  setTimeout(() => btn.classList.remove('ripple'), 600);
}

// ─── EVENT BINDINGS ───────────────────────────────────────────────────────────
document.querySelectorAll('button').forEach(btn =>
  btn.addEventListener('click', createRipple)
);
mineBtn.addEventListener('click', mineClick);
sellAllBtn.addEventListener('click', sellAll);
tabMine.addEventListener('click', () => switchTab(true));
tabShop.addEventListener('click', () => switchTab(false));
overlay.addEventListener('click', () => switchTab(true));

if (autoSellToggle) {
  autoSellToggle.addEventListener('change', () => {
    if (autoSellToggle.checked) {
      const drone = shopItems.find(i => i.id === 'auto-seller');
      if (drone && drone.count > 0) {
        updateAutoSell(drone.count);
        const sellTimerP = document.getElementById('sell-timer');
        if (sellTimerP) {
          sellTimerP.classList.remove('hidden');
          sellTimerP.innerHTML = `Next auto-sell in <span id="sell-countdown">--</span>s`;
          sellTimerP.appendChild(autoSellToggle.closest('.switch'));
        }
      }
    } else {
      if (autoSellTimer)  clearInterval(autoSellTimer);
      if (countdownTimer) clearInterval(countdownTimer);
      const sellTimerP = document.getElementById('sell-timer');
      if (sellTimerP) {
        sellTimerP.classList.remove('hidden');
        sellTimerP.textContent = 'Auto sell disabled';
        sellTimerP.appendChild(autoSellToggle.closest('.switch'));
      }
    }
  });

  // Load version on startup
  fetch('version.txt')
    .then(res => res.text())
    .then(txt => {
      document.getElementById('version').textContent = txt;
    });
}

// ─── INITIALIZATION ──────────────────────────────────────────────────────────
resourceTabs.forEach(tab =>
  tab.addEventListener('click', () => switchResource(tab.dataset.resource))
);
switchTab(true);
switchResource(currentResource);