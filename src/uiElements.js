// ───────────────────────────────────────────────────────────────────────────
// UI ELEMENTS
// ───────────────────────────────────────────────────────────────────────────

import { RES_IDS } from './dataModel.js';

/* ────────────────────────────────────────────────────────────────────────────
   RESOURCE COUNT ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
const ironCountEl = document.getElementById("iron-count");
const copperCountEl = document.getElementById("copper-count");
const nickelCountEl = document.getElementById("nickel-count");
const bronzeCountEl = document.getElementById("bronze-count");
const silverCountEl = document.getElementById("silver-count");
const cobaltCountEl = document.getElementById("cobalt-count");
const goldCountEl = document.getElementById("gold-count");
const palladiumCountEl = document.getElementById("palladium-count");
const platinumCountEl = document.getElementById("platinum-count");
const titaniumCountEl = document.getElementById("titanium-count");
const adamantiumCountEl = document.getElementById("adamantium-count");
const moneyCountEl = document.getElementById("money-count");
const coreShardsCountEl = document.getElementById("core-shards-count");

/* ────────────────────────────────────────────────────────────────────────────
   SHOP ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
const shopList = document.getElementById("shop-list");
const resourceFilterSelect = document.getElementById("resource-filter-select");

/* ────────────────────────────────────────────────────────────────────────────
   TAB ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
const tabMine = document.getElementById("tab-mine");
const tabShop = document.getElementById("tab-shop");
const tabStats = document.getElementById("tab-stats");
const tabCore = document.getElementById("tab-forgecore");

/* ────────────────────────────────────────────────────────────────────────────
   SCREEN ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
const screenMine = document.getElementById("screen-mine");
const screenShop = document.getElementById("screen-shop");
const screenStats = document.getElementById("screen-stats");
const screenCore = document.getElementById("screen-forgecore");

/* ────────────────────────────────────────────────────────────────────────────
   PRESTIGE ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
const prestigeBtn = document.getElementById("prestige-btn");

/* ────────────────────────────────────────────────────────────────────────────
   OVERLAY ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
const overlay = document.getElementById("overlay") || null;

/* ────────────────────────────────────────────────────────────────────────────
   MENU ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
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

/* ────────────────────────────────────────────────────────────────────────────
   STATS TAB ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
const mainTab = document.getElementById("stats-main-tab");
const milestonesTab = document.getElementById("stats-milestones-tab");
const prestigeTab = document.getElementById("stats-prestige-tab");

/* ────────────────────────────────────────────────────────────────────────────
   THEME ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
const themeSelect = document.getElementById("theme-select");

/* ────────────────────────────────────────────────────────────────────────────
   CONFIRMATION MODAL ELEMENTS
──────────────────────────────────────────────────────────────────────────── */
const confirmModal = document.getElementById("confirm-newgame-modal");
const btnNewGameModal = document.getElementById("btn-new");
const btnConfirmYes = document.getElementById("confirm-newgame-yes");
const btnConfirmNo = document.getElementById("confirm-newgame-no");

/* ────────────────────────────────────────────────────────────────────────────
   RESOURCE BUTTON ELEMENTS & MAPPING
──────────────────────────────────────────────────────────────────────────── */
// Generate resource button elements dynamically
const resourceButtons = {};
RES_IDS.forEach((resId) => {
  resourceButtons[resId] = {
    mine: document.getElementById(`mine-${resId}-btn`),
    sell: document.getElementById(`sell-${resId}-btn`),
  };
});

export {
  ironCountEl,
  copperCountEl,
  nickelCountEl,
  bronzeCountEl,
  silverCountEl,
  cobaltCountEl,
  goldCountEl,
  palladiumCountEl,
  platinumCountEl,
  titaniumCountEl,
  adamantiumCountEl,
  moneyCountEl,
  coreShardsCountEl,
  shopList,
  resourceFilterSelect,
  tabMine,
  tabShop,
  tabStats,
  tabCore,
  screenMine,
  screenShop,
  screenStats,
  screenCore,
  prestigeBtn,
  overlay,
  mainMenu,
  settingsMenu,
  gameUI,
  btnContinue,
  btnNewGame,
  btnSettings,
  btnBackToMenu,
  toggleAutoSave,
  btnSaveMenu,
  saveIndicator,
  mainTab,
  milestonesTab,
  prestigeTab,
  themeSelect,
  confirmModal,
  btnNewGameModal,
  btnConfirmYes,
  btnConfirmNo,
  resourceButtons
};