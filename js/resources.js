// js/resources.js - Resource-specific logic (mining, selling, auto-mining)
import { resources, stats, RES_IDS, UNLOCK_COST } from './data.js';
import { UI_ELEMENTS, effectPool, scheduleVisualUpdate, modalSystem } from './ui.js';

// ───────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

export function fmt(num) {
  if (num < 1_000) return Math.floor(num).toString();
  if (num < 1_000_000)
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  if (num < 1_000_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (num < 1_000_000_000_000)
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b";
  return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") + "t";
}

// ───────────────────────────────────────────────────────────────────────────
// RESOURCE UNLOCK STATE
// ───────────────────────────────────────────────────────────────────────────

export let copperUnlocked = false;
export let nickelUnlocked = false;
export let bronzeUnlocked = false;
export let silverUnlocked = false;
export let cobaltUnlocked = false;
export let goldUnlocked = false;
export let palladiumUnlocked = false;
export let platinumUnlocked = false;
export let titaniumUnlocked = false;
export let adamantiumUnlocked = false;

// Prestige system state
export let prestigeUnlocked = false;
export let totalPrestiges = 0;

export function isUnlocked(resId) {
  switch (resId) {
    case "iron":
      return true;
    case "copper":
      return copperUnlocked;
    case "nickel":
      return nickelUnlocked;
    case "bronze":
      return bronzeUnlocked;
    case "silver":
      return silverUnlocked;
    case "cobalt":
      return cobaltUnlocked;
    case "gold":
      return goldUnlocked;
    case "palladium":
      return palladiumUnlocked;
    case "platinum":
      return platinumUnlocked;
    case "titanium":
      return titaniumUnlocked;
    case "adamantium":
      return adamantiumUnlocked;
    default:
      return false;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// RESOURCE OPERATIONS
// ───────────────────────────────────────────────────────────────────────────

/** Add ore & track mined */
export function addOre(resId, amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources[resId].count += amount;
  stats.mined[resId] += amount;
}

/** Add money gained */
export function addMoney(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.money.count += amount;
  stats.earnedMoney += amount;
}

/** Spend money */
export function spendMoney(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.money.count -= amount;
  stats.spentMoney += amount;
}

/** Add core shards */
export function addCoreShards(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  resources.coreShards.count += amount;
}

/** Spend core shards */
export function spendCoreShards(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  if (resources.coreShards.count < amount) return false;
  resources.coreShards.count -= amount;
  return true;
}

// ───────────────────────────────────────────────────────────────────────────
// MINING & SELLING FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

/** Manual mine */
export function mineResource(resId) {
  if (!isUnlocked(resId)) return;
  const bonuses = applyForgeCoreBonuses();
  const gain = resources[resId].perClick * bonuses.mineRate;
  addOre(resId, gain);
  stats.clicks.mine++;

  // Enhanced mine button feedback for all themes
  const mineButton = document.getElementById(`mine-${resId}-btn`);
  if (mineButton) {
    // Add immediate button feedback
    mineButton.classList.add("mining-active");
    setTimeout(() => {
      mineButton.classList.remove("mining-active");
    }, 200);

    // Add button shake for impact
    mineButton.classList.add("mining-shake");
    setTimeout(() => {
      mineButton.classList.remove("mining-shake");
    }, 300);
  }

  // Premium theme click effects
  const currentTheme = document.body.className;
  if (
    currentTheme.includes("theme-aurora") ||
    currentTheme.includes("theme-dragon-fire")
  ) {
    const resourceCard =
      document.querySelector(`[data-resource="${resId}"]`) ||
      document.querySelector(`#${resId}-panel`);
    if (resourceCard) {
      resourceCard.classList.add("clicking");
      setTimeout(() => {
        resourceCard.classList.remove("clicking");
      }, 600);
    }
  }

  // Create floating damage/gain indicator
  createMiningFeedback(mineButton, gain, resId);

  // Update UI
  import('./ui.js').then(({ updateUI }) => updateUI && updateUI());
}

/** Sell all */
export function sellAll(resId, isAutoSell = false) {
  if (!isUnlocked(resId)) return 0;
  const qty = resources[resId].count;
  if (qty <= 0) return 0;

  // Apply ForgeCore sell value bonus
  const globalSellBonus = 1 + getForgeCoreBonusValue("globalSellValue");
  const cash = Math.floor(qty * resources[resId].sellPrice * globalSellBonus);
  addMoney(cash);
  stats.sold[resId] += qty;
  resources[resId].count = 0;
  stats.clicks.sell++;

  // Enhanced visual effects for autosell
  if (isAutoSell) {
    createAutoSellEffects(resId, cash, qty);

    // Add haptic feedback for mobile
    if ("vibrate" in navigator) {
      navigator.vibrate([30, 10, 30]); // Short-pause-short pattern
    }
  } else {
    createSellPop(resId);
  }

  // Update UI
  import('./ui.js').then(({ updateUI }) => updateUI && updateUI());
  return cash;
}

// ───────────────────────────────────────────────────────────────────────────
// VISUAL EFFECTS
// ───────────────────────────────────────────────────────────────────────────

function createMiningFeedback(button, gain, resId) {
  if (!button) return;

  // Haptic feedback for mobile devices
  if ("vibrate" in navigator) {
    navigator.vibrate(50); // Short vibration
  }

  const feedback = effectPool.getFeedback();
  feedback.className = "mining-feedback";
  feedback.textContent = `+${gain}`;

  // Add resource-specific styling
  feedback.setAttribute("data-resource", resId);

  // Position relative to button
  const rect = button.getBoundingClientRect();
  feedback.style.position = "fixed";
  feedback.style.left = rect.left + rect.width / 2 + "px";
  feedback.style.top = rect.top + "px";
  feedback.style.zIndex = "9999";
  feedback.style.pointerEvents = "none";
  feedback.style.fontSize = "1.2em";
  feedback.style.fontWeight = "bold";
  feedback.style.color = "#28a745";
  feedback.style.textShadow = "0 0 5px rgba(40, 167, 69, 0.5)";
  feedback.style.transform = "translateX(-50%) translateY(0)";
  feedback.style.opacity = "0";
  feedback.style.transition = "all 0.8s ease-out";

  document.body.appendChild(feedback);

  // Animate
  setTimeout(() => {
    feedback.style.opacity = "1";
    feedback.style.transform = "translateX(-50%) translateY(-60px)";
  }, 10);

  // Clean up
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.parentNode.removeChild(feedback);
    }
    effectPool.returnFeedback(feedback);
  }, 800);

  // Create particle burst for premium effects
  createParticleBurst(button, resId);
}

function createParticleBurst(button, resId) {
  if (!button) return;

  const colors = {
    iron: "#b7b7b7",
    copper: "#b87333",
    nickel: "#727472",
    bronze: "#cd7f32",
    silver: "#c0c0c0",
    cobalt: "#0047ab",
    gold: "#ffd700",
    palladium: "#ced0dd",
    platinum: "#e5e4e2",
    titanium: "#878681",
    adamantium: "#b5651d"
  };

  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Create 6-8 particles
  const particleCount = 6 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const particle = effectPool.getParticle();
    particle.className = "mining-particle";
    particle.style.position = "fixed";
    particle.style.left = centerX + "px";
    particle.style.top = centerY + "px";
    particle.style.width = "4px";
    particle.style.height = "4px";
    particle.style.backgroundColor = colors[resId] || "#fff";
    particle.style.borderRadius = "50%";
    particle.style.zIndex = "9998";
    particle.style.pointerEvents = "none";
    particle.style.opacity = "1";
    
    const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
    const distance = 30 + Math.random() * 20;
    const endX = centerX + Math.cos(angle) * distance;
    const endY = centerY + Math.sin(angle) * distance;
    
    particle.style.transition = "all 0.6s ease-out";
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.style.left = endX + "px";
      particle.style.top = endY + "px";
      particle.style.opacity = "0";
    }, 10);
    
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
      effectPool.returnParticle(particle);
    }, 600);
  }
}

function createSellPop(resId) {
  const sellButton = document.getElementById(`sell-${resId}-btn`);
  if (!sellButton) return;

  sellButton.classList.add("selling-active");
  setTimeout(() => {
    sellButton.classList.remove("selling-active");
  }, 200);

  // Create money indicator
  const rect = sellButton.getBoundingClientRect();
  const money = effectPool.getFeedback();
  money.className = "money-feedback";
  money.innerHTML = "💰";
  money.style.position = "fixed";
  money.style.left = rect.left + rect.width / 2 + "px";
  money.style.top = rect.top + "px";
  money.style.zIndex = "9999";
  money.style.pointerEvents = "none";
  money.style.fontSize = "1.5em";
  money.style.transform = "translateX(-50%) translateY(0)";
  money.style.opacity = "0";
  money.style.transition = "all 0.8s ease-out";

  document.body.appendChild(money);

  setTimeout(() => {
    money.style.opacity = "1";
    money.style.transform = "translateX(-50%) translateY(-50px)";
  }, 10);

  setTimeout(() => {
    if (money.parentNode) {
      money.parentNode.removeChild(money);
    }
    effectPool.returnFeedback(money);
  }, 800);
}

function createAutoSellEffects(resId, cash, qty) {
  // Create visual feedback
  createAutoSellFeedback(resId, cash);
  createScreenFlash(resId);
  createAutoSellPulse(resId);
  createAutoSellAudioCue(resId);
}

function createAutoSellFeedback(resId, cash) {
  const resourcePanel = document.querySelector(`[data-resource="${resId}"]`);
  if (!resourcePanel) return;

  const feedback = effectPool.getFeedback();
  feedback.className = "autosell-feedback";
  feedback.innerHTML = `🤖 Sold! +$${fmt(cash)}`;

  const rect = resourcePanel.getBoundingClientRect();
  feedback.style.position = "fixed";
  feedback.style.left = rect.left + rect.width / 2 + "px";
  feedback.style.top = rect.top + rect.height / 2 + "px";
  feedback.style.zIndex = "9999";
  feedback.style.pointerEvents = "none";
  feedback.style.fontSize = "1.1em";
  feedback.style.fontWeight = "bold";
  feedback.style.color = "#28a745";
  feedback.style.textShadow = "0 0 10px rgba(40, 167, 69, 0.8)";
  feedback.style.backgroundColor = "rgba(40, 167, 69, 0.1)";
  feedback.style.padding = "8px 12px";
  feedback.style.borderRadius = "20px";
  feedback.style.border = "2px solid rgba(40, 167, 69, 0.3)";
  feedback.style.transform = "translateX(-50%) translateY(-50%) scale(0.8)";
  feedback.style.opacity = "0";
  feedback.style.transition = "all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.style.opacity = "1";
    feedback.style.transform = "translateX(-50%) translateY(-50%) scale(1)";
  }, 10);

  setTimeout(() => {
    feedback.style.opacity = "0";
    feedback.style.transform = "translateX(-50%) translateY(-80px) scale(0.9)";
  }, 600);

  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.parentNode.removeChild(feedback);
    }
    effectPool.returnFeedback(feedback);
  }, 1000);
}

function createScreenFlash(resId) {
  const colors = {
    iron: "rgba(183, 183, 183, 0.1)",
    copper: "rgba(184, 115, 51, 0.1)",
    nickel: "rgba(114, 116, 114, 0.1)",
    bronze: "rgba(205, 127, 50, 0.1)",
    silver: "rgba(192, 192, 192, 0.1)",
    cobalt: "rgba(0, 71, 171, 0.1)",
    gold: "rgba(255, 215, 0, 0.15)",
    palladium: "rgba(206, 208, 221, 0.1)",
    platinum: "rgba(229, 228, 226, 0.1)",
    titanium: "rgba(135, 134, 129, 0.1)",
    adamantium: "rgba(181, 101, 29, 0.15)"
  };

  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.top = "0";
  flash.style.left = "0";
  flash.style.width = "100vw";
  flash.style.height = "100vh";
  flash.style.backgroundColor = colors[resId] || "rgba(40, 167, 69, 0.1)";
  flash.style.zIndex = "9997";
  flash.style.pointerEvents = "none";
  flash.style.opacity = "0";
  flash.style.transition = "opacity 0.2s ease-out";

  document.body.appendChild(flash);

  setTimeout(() => {
    flash.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    flash.style.opacity = "0";
  }, 150);

  setTimeout(() => {
    if (flash.parentNode) {
      flash.parentNode.removeChild(flash);
    }
  }, 350);
}

function createAutoSellPulse(resId) {
  const resourcePanel = document.querySelector(`[data-resource="${resId}"]`);
  if (!resourcePanel) return;

  const pulse = effectPool.getPulse();
  pulse.className = "autosell-pulse";

  const rect = resourcePanel.getBoundingClientRect();
  pulse.style.position = "fixed";
  pulse.style.left = rect.left + rect.width / 2 + "px";
  pulse.style.top = rect.top + rect.height / 2 + "px";
  pulse.style.width = "20px";
  pulse.style.height = "20px";
  pulse.style.border = "3px solid #28a745";
  pulse.style.borderRadius = "50%";
  pulse.style.transform = "translateX(-50%) translateY(-50%) scale(0)";
  pulse.style.zIndex = "9998";
  pulse.style.pointerEvents = "none";
  pulse.style.opacity = "1";

  document.body.appendChild(pulse);

  setTimeout(() => {
    pulse.style.transform = "translateX(-50%) translateY(-50%) scale(3)";
    pulse.style.opacity = "0";
    pulse.style.transition = "all 0.4s ease-out";
  }, 200);

  setTimeout(() => {
    if (pulse.parentNode) {
      pulse.parentNode.removeChild(pulse);
    }
    effectPool.returnPulse(pulse);
  }, 600);
}

function createAutoSellAudioCue(resId) {
  const ding = document.createElement("div");
  ding.className = "autosell-audio-cue";
  ding.innerHTML = "♪";
  ding.style.position = "fixed";
  ding.style.top = "20px";
  ding.style.right = "20px";
  ding.style.fontSize = "1.5em";
  ding.style.color = "#28a745";
  ding.style.fontWeight = "700";
  ding.style.textShadow = "0 0 10px #28a745";
  ding.style.pointerEvents = "none";
  ding.style.zIndex = "9999";
  ding.style.opacity = "0";
  ding.style.transform = "scale(0.5)";
  ding.style.transition = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

  document.body.appendChild(ding);

  setTimeout(() => {
    ding.style.opacity = "1";
    ding.style.transform = "scale(1)";
  }, 10);

  setTimeout(() => {
    ding.style.opacity = "0";
    ding.style.transform = "scale(0.8) translateY(-20px)";
  }, 300);

  setTimeout(() => {
    if (ding.parentNode) {
      ding.parentNode.removeChild(ding);
    }
  }, 600);
}

// ───────────────────────────────────────────────────────────────────────────
// UNLOCK SYSTEM
// ───────────────────────────────────────────────────────────────────────────

export function updateResourceUnlockUI(resourceId) {
  const cost = UNLOCK_COST[resourceId];
  if (!cost) return;

  const unlockBtn = document.getElementById(`unlock-${resourceId}-btn`);
  const lockOverlay = document.getElementById(`lock-overlay-${resourceId}`);
  
  if (!unlockBtn || !lockOverlay) return;

  const canAfford = resources.money.count >= cost;
  unlockBtn.disabled = !canAfford;
  unlockBtn.classList.toggle('affordable', canAfford);
  unlockBtn.textContent = `Unlock ${resourceId.charAt(0).toUpperCase() + resourceId.slice(1)} ($${fmt(cost)})`;
}

export function getResourceUnlockStatus(resourceId) {
  const cost = UNLOCK_COST[resourceId];
  if (!cost) return { locked: false, canAfford: true, cost: 0 };
  
  return {
    locked: !isUnlocked(resourceId),
    canAfford: resources.money.count >= cost,
    cost: cost
  };
}

export function unlockResourceUI(resourceId, expandPanel = true) {
  const panel = document.querySelector(`[data-resource='${resourceId}']`);
  const lockOverlay = document.getElementById(`lock-overlay-${resourceId}`);
  const resourceFilterOption = document.querySelector(`option[data-resource='${resourceId}']`);
  
  if (panel) {
    panel.classList.remove('locked');
    if (expandPanel) {
      panel.classList.remove('collapsed');
    }
  }
  
  if (lockOverlay) {
    lockOverlay.style.display = 'none';
  }
  
  if (resourceFilterOption) {
    resourceFilterOption.disabled = false;
    resourceFilterOption.classList.remove('locked-option');
    resourceFilterOption.textContent = resourceFilterOption.textContent.replace(' (Locked)', '');
  }

  // Enable mine and sell buttons
  const mineBtn = document.getElementById(`mine-${resourceId}-btn`);
  const sellBtn = document.getElementById(`sell-${resourceId}-btn`);
  if (mineBtn) mineBtn.disabled = false;
  if (sellBtn) sellBtn.disabled = false;
}

// Unlock state setters
export function setUnlockState(resId, unlocked) {
  switch (resId) {
    case "copper": copperUnlocked = unlocked; break;
    case "nickel": nickelUnlocked = unlocked; break;
    case "bronze": bronzeUnlocked = unlocked; break;
    case "silver": silverUnlocked = unlocked; break;
    case "cobalt": cobaltUnlocked = unlocked; break;
    case "gold": goldUnlocked = unlocked; break;
    case "palladium": palladiumUnlocked = unlocked; break;
    case "platinum": platinumUnlocked = unlocked; break;
    case "titanium": titaniumUnlocked = unlocked; break;
    case "adamantium": adamantiumUnlocked = unlocked; break;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// CORE SYSTEM INTEGRATION STUBS
// ───────────────────────────────────────────────────────────────────────────

// These will be implemented in core.js
function applyForgeCoreBonuses() {
  return { mineRate: 1, sellValue: 1 };
}

function getForgeCoreBonusValue(upgradeId) {
  return 0;
}