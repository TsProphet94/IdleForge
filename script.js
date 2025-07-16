import { resources } from './resources/iron.js';
import { shopItems } from './shop/items.js';

// UI Elements
const oreCountEl    = document.getElementById('iron-count');
const autoRateEl    = document.getElementById('auto-rate');
const moneyCountEl  = document.getElementById('money-count');
const mineBtn       = document.getElementById('mine-btn');
const sellAllBtn    = document.getElementById('sell-all-btn');
const shopList      = document.getElementById('shop-list');
const tabMine       = document.getElementById('tab-mine');
const tabShop       = document.getElementById('tab-shop');
const mineScreen    = document.getElementById('screen-mine');
const shopScreen    = document.getElementById('screen-shop');
const overlay       = document.getElementById('overlay');
// Auto-sell toggle control
const autoSellToggle = document.getElementById('auto-sell-toggle');

// Resource selection and shop filtering
let currentResource = 'iron';
const resourceTabs  = document.querySelectorAll('.resource-tab');

function renderShop() {
  shopList.innerHTML = '';
  shopItems
    .filter(item => item.category === currentResource)
    .forEach(item => {
      const li  = document.createElement('li');
      const btn = document.createElement('button');
      btn.id        = item.id;
      btn.className = 'shop-btn';
      // Removed direct click listener for buyItem
      li.appendChild(btn);
      shopList.appendChild(li);
    });
  updateUI();
}

// Delegate shop button clicks to avoid duplicate handlers
shopList.addEventListener('click', e => {
  if (e.target.matches('.shop-btn')) {
    const item = shopItems.find(i => i.id === e.target.id);
    if (item) buyItem(item);
  }
});

function switchResource(res) {
  currentResource = res;
  // Show only the active resource panel
  document.querySelector('.resource-panel.active')
    .classList.remove('active');
  document.getElementById(`resource-${res}`)
    .classList.add('active');
  // Highlight the active resource tab
  document.querySelector('.resource-tab.active')
    .classList.remove('active');
  document.querySelector(`.resource-tab[data-resource="${res}"]`)
    .classList.add('active');
  renderShop();
}

// Developer mode flag
const isDev = true;

// Show or hide dev panel
const devPanel = document.getElementById('dev-panel');
if (devPanel) devPanel.classList.toggle('hidden', !isDev);

// Dev button handlers
if (isDev) {
  const devAddIron  = document.getElementById('dev-add-iron');
  const devAddMoney = document.getElementById('dev-add-money');
  if (devAddIron)  devAddIron.addEventListener('click', () => { resources.iron.count += 1000; updateUI(); });
  if (devAddMoney) devAddMoney.addEventListener('click', () => { resources.money.count += 1000; updateUI(); });
}


// Auto‐sell timer handle

let autoSellTimer    = null;   // your existing interval
let countdownTimer   = null;   // updates the seconds display
let nextSellTime     = 0;      // timestamp (ms) when the next sell will fire
let autoSellInterval = 0;      // current sell interval (ms)

/**
 * (Re)starts the auto-sell loop and countdown based on how many drones you own.
 * @param {number} count  number of Auto-Seller Drones purchased
 */
function updateAutoSell(count) {
  // clear existing timers
  if (autoSellTimer)  clearInterval(autoSellTimer);
  if (countdownTimer) clearInterval(countdownTimer);

  // show or hide the countdown line
  const timerLine = document.getElementById("sell-timer");
  if (timerLine) timerLine.classList.toggle("hidden", count <= 0);

  if (count > 0) {
    const maxTier = 1;
    // map [1 → 10 000ms] … [5 → 2 000ms]
    autoSellInterval = 5000;
    nextSellTime = Date.now() + autoSellInterval;

    // start countdown updater
    updateSellCountdown();
    countdownTimer = setInterval(updateSellCountdown, 500);

    // start auto-sell loop
    autoSellTimer = setInterval(() => {
      sellAll();
      nextSellTime = Date.now() + autoSellInterval;
    }, autoSellInterval);
  }
}

/**
 * Updates the “sell-countdown” span every half-second
 */
function updateSellCountdown() {
  const now  = Date.now();
  const diff = nextSellTime - now;
  const sec  = Math.ceil(diff / 1000);
  const el   = document.getElementById("sell-countdown");
  if (el) el.textContent = sec > 0 ? sec : 0;
}

// Update all UI elements
function updateUI() {
  oreCountEl.textContent   = resources.iron.count.toFixed(1);
  autoRateEl.textContent   = resources.iron.perSecond.toFixed(1);
  moneyCountEl.textContent = `$${resources.money.count}`;


  // Sell All button state
  sellAllBtn.disabled = resources.iron.count <= 0;


  // Shop buttons state & labels (only active resource items)
  shopItems
    .filter(item => item.category === currentResource)
    .forEach(item => {
      const btn = document.getElementById(item.id);
      if (!btn) return;
      if (item.count >= item.max) {
        // Max purchased: disable and show "Max Purchased"
        btn.disabled = true;
        btn.textContent = `${item.name} - Max Purchased`;
      } else {
        const affordable = resources.money.count >= item.price;
        btn.disabled = !affordable;
        btn.textContent = `${item.name} ($${item.price}) [${item.count}/${item.max}]`;
      }
    });

}

// Mine on click
function mineClick() {
  resources.iron.count += resources.iron.perClick;
  updateUI();
}

// Sell all mined iron
function sellAll() {
  const amount = Math.floor(resources.iron.count * resources.iron.sellPrice);
  resources.money.count += amount;
  resources.iron.count = 0;
  updateUI();
  createSellPop();
}

// Create a pop-up effect on the Sell All button
function createSellPop() {
  const pop = document.createElement('span');
  pop.className = 'sell-pop';
  pop.textContent = '$';
  sellAllBtn.appendChild(pop);
  pop.addEventListener('animationend', () => pop.remove());
}

// Buy an upgrade
function buyItem(item) {
  if (resources.money.count >= item.price && item.count < item.max) {
    resources.money.count -= item.price;
    item.apply();
item.count++;
item.price = Math.floor(item.basePrice *
  Math.pow(item.scale, item.count));
if (item.id === 'auto-seller') {
  updateAutoSell(item.count);
  const drone = shopItems.find(i => i.id === 'auto-seller');
if (drone && drone.count > 0) updateAutoSell(drone.count);
}

    // if this is our auto‐seller upgrade, restart the loop
    if (item.id === 'auto-seller') {
      // note: make sure item.apply() or buyItem logic increments item.count first
      updateAutoSell(item.count);
    }

    updateUI();
  }
}

// Auto-miner loop (runs every 0.1s for fluidity)
setInterval(() => {
  resources.iron.count += resources.iron.perSecond / 10;
  updateUI();
}, 100);


// Tab switching
function switchTab(showMine) {
  if (showMine) {
    shopScreen.classList.remove('open');
    overlay.classList.remove('open');
    tabMine.classList.add('active');
    tabShop.classList.remove('active');
  } else {
    shopScreen.classList.add('open');
    overlay.classList.add('open');
    tabShop.classList.add('active');
    tabMine.classList.remove('active');
  }
}

function createRipple(e) {
  const btn = e.currentTarget;
  // Calculate click position relative to button
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // Set CSS variables for the ripple position
  btn.style.setProperty("--ripple-x", `${x}px`);
  btn.style.setProperty("--ripple-y", `${y}px`);
  // Restart animation
  btn.classList.remove("ripple");
  void btn.offsetWidth;
  btn.classList.add("ripple");
  // Remove the ripple class after animation completes
  setTimeout(() => {
    btn.classList.remove("ripple");
  }, 600);
}

document.querySelectorAll("button").forEach(btn =>
  btn.addEventListener("click", createRipple)
);

tabMine.addEventListener('click', () => switchTab(true));
tabShop.addEventListener('click', () => switchTab(false));
overlay.addEventListener('click', () => switchTab(true));
mineBtn.addEventListener('click', mineClick);
sellAllBtn.addEventListener('click', sellAll);

// Enable or disable auto-sell via toggle
if (autoSellToggle) {
  autoSellToggle.addEventListener('change', () => {
    if (autoSellToggle.checked) {
      // Resume auto-sell if drones purchased
      const drone = shopItems.find(i => i.id === 'auto-seller');
      if (drone && drone.count > 0) updateAutoSell(drone.count);
      // Restore timer text when re-enabled
      const sellTimerP = document.getElementById('sell-timer');
      if (sellTimerP) {
        sellTimerP.classList.remove('hidden');
        sellTimerP.innerHTML = `Next auto-sell in <span id="sell-countdown">--</span>s`;
        // Reattach the toggle switch
        sellTimerP.appendChild(autoSellToggle.closest('.switch'));
      }
    } else {
      // Pause auto-sell and countdown
      if (autoSellTimer) clearInterval(autoSellTimer);
      if (countdownTimer) clearInterval(countdownTimer);
      // Show disabled state text
      const sellTimerP = document.getElementById('sell-timer');
      if (sellTimerP) {
        sellTimerP.classList.remove('hidden');
        // Set disabled message
        sellTimerP.textContent = 'Auto sell disabled';
        // Reattach the toggle switch
        sellTimerP.appendChild(autoSellToggle.closest('.switch'));
      }
    }
  });
}

// Wire up resource tabs
resourceTabs.forEach(tab =>
  tab.addEventListener('click', () =>
    switchResource(tab.dataset.resource)
  )
);
// Initialize UI for the default resource
switchResource(currentResource);