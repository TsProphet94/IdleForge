// Event Handlers Module

import { addOre, sellAll } from './game.js';
import { updateUI } from './ui.js';
import { isUnlocked } from './helpers.js';
import { RES_IDS } from './data.js';
import { initShop } from './shop.js';
import { initTheme } from './theme.js';

// Attach DOM event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme picker
  initTheme();

  // Initialize shop module
  initShop();

  // Tab navigation
  const tabs = document.querySelectorAll('nav.header-nav button');
  tabs.forEach(btn => {
    btn.addEventListener('click', e => {
      // TODO: handle tab switching and update UI
      updateUI();
    });
  });

  // Resource mine/sell buttons
  RES_IDS.forEach(resId => {
    const mineBtn = document.getElementById(`mine-${resId}-btn`);
    const sellBtn = document.getElementById(`sell-${resId}-btn`);
    if (mineBtn) mineBtn.addEventListener('click', () => {
      addOre(resId, 1);
      updateUI();
    });
    if (sellBtn) sellBtn.addEventListener('click', () => {
      sellAll(resId);
      updateUI();
    });
  });

  // Other global events (settings toggle, developer panel, etc.)
  // TODO: migrate more event handlers from script.js
});
