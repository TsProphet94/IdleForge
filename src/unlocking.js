// ───────────────────────────────────────────────────────────────────────────
// UNLOCKING FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

import { 
  UNLOCK_COST, 
  resources, 
  stats,
  gameState
} from './dataModel.js';
import { resourceButtons, resourceFilterSelect } from './uiElements.js';
import { modalSystem } from './modalSystem.js';
import { fmt } from './helpers.js';

// Helper to check resource unlock status
function getResourceUnlockStatus(resourceId) {
  switch (resourceId) {
    case "iron":
      return true; // Iron is always unlocked
    case "copper":
      return gameState.copperUnlocked;
    case "nickel":
      return gameState.nickelUnlocked;
    case "bronze":
      return gameState.bronzeUnlocked;
    case "silver":
      return gameState.silverUnlocked;
    case "cobalt":
      return gameState.cobaltUnlocked;
    case "gold":
      return gameState.goldUnlocked;
    case "palladium":
      return gameState.palladiumUnlocked;
    case "platinum":
      return gameState.platinumUnlocked;
    case "titanium":
      return gameState.titaniumUnlocked;
    case "adamantium":
      return gameState.adamantiumUnlocked;
    default:
      return false;
  }
}

// Helper function to update unlock UI for any resource
function updateResourceUnlockUI(resourceId) {
  const buttons = resourceButtons[resourceId];
  if (!buttons) return;

  const panel = document.querySelector(`[data-resource="${resourceId}"]`);

  // Check unlock status using the specific unlock variables
  const isUnlocked = getResourceUnlockStatus(resourceId);

  if (isUnlocked) {
    panel?.classList.remove("locked");
    buttons.mine?.classList.remove("disabled");
    buttons.sell?.classList.remove("disabled");
    if (buttons.mine) buttons.mine.disabled = false;
    if (buttons.sell) buttons.sell.disabled = false;
  } else {
    panel?.classList.add("locked");
    buttons.mine?.classList.add("disabled");
    buttons.sell?.classList.add("disabled");
    if (buttons.mine) buttons.mine.disabled = true;
    if (buttons.sell) buttons.sell.disabled = true;
  }
}

// Generic unlock function for any resource
function unlockResourceUI(resourceId, expandPanel = true) {
  updateResourceUnlockUI(resourceId);

  const panel = document.querySelector(`[data-resource="${resourceId}"]`);

  // Panel expansion logic
  if (expandPanel) {
    panel?.classList.remove("collapsed");
    try {
      localStorage.setItem(`panel-collapsed-${resourceId}`, "0");
    } catch {}
  } else {
    // When loading saves, ensure collapse state matches localStorage
    try {
      const shouldBeCollapsed =
        localStorage.getItem(`panel-collapsed-${resourceId}`) === "1";
      if (shouldBeCollapsed) {
        panel?.classList.add("collapsed");
      } else {
        panel?.classList.remove("collapsed");
      }
    } catch {}
  }

  // Remove lock overlay and unlock shop dropdown option
  document.getElementById(`lock-overlay-${resourceId}`)?.remove();

  // Enable the dropdown option for this resource
  if (resourceFilterSelect) {
    const option = resourceFilterSelect.querySelector(
      `option[value="${resourceId}"]`
    );
    if (option) {
      option.disabled = false;
      option.classList.remove("locked-option");
      // Remove "(Locked)" from the text
      option.textContent = option.textContent.replace(" (Locked)", "");
    }
  }
}

// Spend money function
function spendMoney(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.money.count -= amount;
  stats.spentMoney += amount;
}

// Main unlock attempt function
function attemptUnlock(res) {
  const cost = UNLOCK_COST[res];
  if (resources.money.count < cost) {
    const resourceName = res.charAt(0).toUpperCase() + res.slice(1);
    modalSystem.createModal({
      title: "Insufficient Funds",
      icon: "💰",
      type: "warning",
      message: `You need $${fmt(cost)} to unlock ${resourceName}. You currently have $${fmt(resources.money.count)}.`,
      buttons: [
        {
          text: "OK",
          class: "primary"
        }
      ]
    });
    return;
  }
  spendMoney(cost);
  stats.clicks.unlock++;

  if (res === "copper") unlockCopperUI();
  if (res === "nickel") unlockNickelUI();
  if (res === "bronze") unlockBronzeUI();
  if (res === "silver") unlockSilverUI();
  if (res === "cobalt") unlockCobaltUI();
  if (res === "gold") unlockGoldUI();
  if (res === "palladium") unlockPalladiumUI();
  if (res === "platinum") unlockPlatinumUI();
  if (res === "titanium") unlockTitaniumUI();
  if (res === "adamantium") unlockAdamantiumUI();
}

// Relock resource function
function relockResource(res) {
  const panel = document.querySelector(
    `.resource-panel[data-resource="${res}"]`
  );
  if (!panel) return;

  panel.classList.add("locked");
  panel.classList.add("collapsed");

  const old = document.getElementById(`lock-overlay-${res}`);
  if (old) old.remove();

  const lockOverlay = document.createElement("div");
  lockOverlay.className = "lock-overlay";
  lockOverlay.id = `lock-overlay-${res}`;
  lockOverlay.innerHTML = `
    <button id="unlock-${res}-btn">
      Unlock ${res[0].toUpperCase() + res.slice(1)} ($${fmt(UNLOCK_COST[res])})
    </button>
  `;
  panel.appendChild(lockOverlay);

  // Re-add event listener to the new button
  const btn = document.getElementById(`unlock-${res}-btn`);
  if (btn) {
    btn.addEventListener("click", () => attemptUnlock(res));
  }

  // Re-lock the shop dropdown option
  if (resourceFilterSelect) {
    const option = resourceFilterSelect.querySelector(
      `option[value="${res}"]`
    );
    if (option) {
      option.disabled = true;
      option.classList.add("locked-option");
      const baseText = option.textContent.replace(" (Locked)", "");
      option.textContent = baseText + " (Locked)";
    }
  }
}

// Individual unlock functions for each resource
function unlockCopperUI(expandPanel = true) {
  gameState.copperUnlocked = true;
  unlockResourceUI("copper", expandPanel);
}

function unlockNickelUI(expandPanel = true) {
  gameState.nickelUnlocked = true;
  unlockResourceUI("nickel", expandPanel);

  // Check if prestige should be unlocked (this will need to import prestige module)
  // checkPrestigeUnlock();
}

function unlockBronzeUI(expandPanel = true) {
  gameState.bronzeUnlocked = true;
  unlockResourceUI("bronze", expandPanel);
}

function unlockSilverUI(expandPanel = true) {
  gameState.silverUnlocked = true;
  unlockResourceUI("silver", expandPanel);
}

function unlockCobaltUI(expandPanel = true) {
  gameState.cobaltUnlocked = true;
  unlockResourceUI("cobalt", expandPanel);
}

function unlockGoldUI(expandPanel = true) {
  gameState.goldUnlocked = true;
  unlockResourceUI("gold", expandPanel);
}

function unlockPalladiumUI(expandPanel = true) {
  gameState.palladiumUnlocked = true;
  unlockResourceUI("palladium", expandPanel);
}

function unlockPlatinumUI(expandPanel = true) {
  gameState.platinumUnlocked = true;
  unlockResourceUI("platinum", expandPanel);
}

function unlockTitaniumUI(expandPanel = true) {
  gameState.titaniumUnlocked = true;
  unlockResourceUI("titanium", expandPanel);
}

function unlockAdamantiumUI(expandPanel = true) {
  gameState.adamantiumUnlocked = true;
  unlockResourceUI("adamantium", expandPanel);
}

export {
  getResourceUnlockStatus,
  updateResourceUnlockUI,
  unlockResourceUI,
  spendMoney,
  attemptUnlock,
  relockResource,
  unlockCopperUI,
  unlockNickelUI,
  unlockBronzeUI,
  unlockSilverUI,
  unlockCobaltUI,
  unlockGoldUI,
  unlockPalladiumUI,
  unlockPlatinumUI,
  unlockTitaniumUI,
  unlockAdamantiumUI
};