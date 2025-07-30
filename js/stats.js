// js/stats.js - Statistics UI updates and milestone tracking
import { stats, RES_IDS, MILESTONE_THRESHOLDS, MILESTONE_LABELS, MILESTONE_MULTIPLIERS } from './data.js';
import { fmt, isUnlocked } from './resources.js';
import { setText } from './ui.js';

// ───────────────────────────────────────────────────────────────────────────
// MILESTONE STATE (constants moved to data.js)
// ───────────────────────────────────────────────────────────────────────────

// Track which rewards have been applied per resource & tier
export const milestoneRewardsApplied = RES_IDS.reduce((acc, res) => {
  acc[res] = MILESTONE_THRESHOLDS.map(() => false);
  return acc;
}, {});

// Current multiplier factor for each resource
export const milestoneMultipliers = RES_IDS.reduce((acc, res) => {
  acc[res] = 1;
  return acc;
}, {});

// ───────────────────────────────────────────────────────────────────────────
// STATS UI FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

export function updateStatsUI() {
  setText("stat-earned", stats.earnedMoney);
  setText("stat-spent", stats.spentMoney);
  setText("stat-net", stats.earnedMoney - stats.spentMoney);

  RES_IDS.forEach((res) => {
    setText(`stat-mined-${res}`, stats.mined[res] || 0);
    setText(`stat-sold-${res}`, stats.sold[res] || 0);
  });

  setText("stat-click-mine", stats.clicks.mine || 0);
  setText("stat-click-sell", stats.clicks.sell || 0);
  setText("stat-click-shop", stats.clicks.shopBuy || 0);

  // Calculate and update highscore
  const totalMined = RES_IDS.reduce(
    (sum, res) => sum + (stats.mined[res] || 0),
    0
  );
  const milestoneScore = RES_IDS.reduce((sum, res) => {
    let idx = 0;
    for (let i = MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
      if ((stats.mined[res] || 0) >= MILESTONE_THRESHOLDS[i]) {
        idx = i + 1;
        break;
      }
    }
    return sum + idx * 1000;
  }, 0);

  const currentScore = stats.earnedMoney + totalMined + milestoneScore;
  let highscore = currentScore;

  // Load existing highscore from localStorage
  try {
    const stored = localStorage.getItem("idleforge_highscore");
    const storedScore = stored ? parseInt(stored, 10) : 0;
    highscore = Math.max(currentScore, storedScore);
    if (currentScore > storedScore) {
      localStorage.setItem("idleforge_highscore", currentScore.toString());
    }
  } catch {}
  
  setText("stat-highscore", highscore);

  // Apply any newly reached milestones before showing list
  applyMilestoneRewards();
  updateMilestoneList();
}

// ───────────────────────────────────────────────────────────────────────────
// MILESTONE SYSTEM
// ───────────────────────────────────────────────────────────────────────────

/** Grant autominer rate boosts when milestones are reached */
export function applyMilestoneRewards() {
  RES_IDS.forEach((res) => {
    // Determine the highest milestone achieved for this resource
    let topMultiplier = 1;
    for (let i = MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (stats.mined[res] >= MILESTONE_THRESHOLDS[i]) {
        topMultiplier = MILESTONE_MULTIPLIERS[i];
        break;
      }
    }
    // Apply only the highest-tier multiplier
    milestoneMultipliers[res] = topMultiplier;
  });
}

export function updateMilestoneList() {
  const milestoneList = document.getElementById("milestone-list");
  if (!milestoneList) return;

  milestoneList.innerHTML = "";

  RES_IDS.forEach((res) => {
    if (!isUnlocked(res)) return;
    const mined = stats.mined[res] || 0;
    // Find the highest achieved milestone index for this resource
    let currentMilestoneIdx = -1;
    for (let i = MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (mined >= MILESTONE_THRESHOLDS[i]) {
        currentMilestoneIdx = i;
        break;
      }
    }
    // Create a container for each resource
    const section = document.createElement("div");
    section.className = "milestone-resource-section";
    section.innerHTML = `<h4 class="milestone-resource-title">${
      res.charAt(0).toUpperCase() + res.slice(1)
    }</h4>`;
    const ul = document.createElement("ul");
    ul.className = "milestone-resource-list";
    let nextShown = false;
    MILESTONE_THRESHOLDS.forEach((threshold, i) => {
      const achieved = mined >= threshold;
      // Calculate progress for this milestone
      let progress = 0;
      if (achieved) {
        progress = 1;
      } else if (i === 0) {
        progress = Math.max(0, Math.min(1, mined / threshold));
      } else {
        const prev = MILESTONE_THRESHOLDS[i - 1];
        progress = Math.max(
          0,
          Math.min(1, (mined - prev) / (threshold - prev))
        );
      }
      if (achieved || (!nextShown && !achieved)) {
        const li = document.createElement("li");
        li.className = achieved ? "milestone-achieved" : "";
        // Progress bar background
        const bar = document.createElement("div");
        bar.className = "milestone-progress-bar";
        const fill = document.createElement("div");
        fill.className = "milestone-progress-fill";
        fill.style.width = progress * 100 + "%";
        bar.appendChild(fill);
        li.appendChild(bar);
        // Milestone content
        const content = document.createElement("div");
        content.className = "milestone-content";
        let indicator = "";
        // Show multiplier indicator for the current active milestone
        if (i === currentMilestoneIdx && currentMilestoneIdx !== -1) {
          indicator = `<span class="milestone-multiplier-indicator" style="margin-left:0.7em;color:#ffd93d;font-weight:700;">${MILESTONE_MULTIPLIERS[i]}x minerate</span>`;
        }
        // Show next milestone reward for the next milestone (if not achieved and is the next milestone)
        let nextIndicator = "";
        if (
          !achieved &&
          i === currentMilestoneIdx + 1 &&
          i < MILESTONE_MULTIPLIERS.length
        ) {
          nextIndicator = `<span class="milestone-next-indicator" style="margin-left:0.7em;color:#b3b3b3;font-weight:600;">${MILESTONE_MULTIPLIERS[i]}x minerate</span>`;
        }
        content.innerHTML = `
          <span class="milestone-badge">${MILESTONE_LABELS[i]}</span> ${
          res.charAt(0).toUpperCase() + res.slice(1)
        } mined: <strong>${threshold.toLocaleString()}</strong> ${indicator} ${nextIndicator}
        `;
        li.appendChild(content);
        ul.appendChild(li);
        if (!achieved) nextShown = true;
      }
    });
    section.appendChild(ul);
    milestoneList.appendChild(section);
  });
}

// ───────────────────────────────────────────────────────────────────────────
// STATS TAB MANAGEMENT
// ───────────────────────────────────────────────────────────────────────────

export function initStatsTabHandlers() {
  const statsTabButtons = document.querySelectorAll('.stats-tab-btn');
  const statsTabContents = document.querySelectorAll('#stats-main-tab, #stats-milestones-tab, #stats-prestige-tab');

  statsTabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      
      // Remove active class from all tab buttons
      statsTabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Hide all tab contents
      statsTabContents.forEach(content => content.classList.add('hidden'));
      
      // Activate clicked tab
      button.classList.add('active');
      
      // Show corresponding content
      const targetContent = document.getElementById(`stats-${targetTab}-tab`);
      if (targetContent) {
        targetContent.classList.remove('hidden');
        
        // Update content if needed
        if (targetTab === 'milestones') {
          updateMilestoneList();
        } else if (targetTab === 'prestige') {
          import('./core.js').then(({ updatePrestigeTab }) => {
            updatePrestigeTab && updatePrestigeTab();
          });
        }
      }
    });
  });
}

// ───────────────────────────────────────────────────────────────────────────
// THROTTLED STATS UPDATE
// ───────────────────────────────────────────────────────────────────────────

let statsUpdateThrottle = null;

export function throttledStatsUpdate() {
  if (statsUpdateThrottle) return;
  
  statsUpdateThrottle = setTimeout(() => {
    updateStatsUI();
    statsUpdateThrottle = null;
  }, 200);
}