// ───────────────────────────────────────────────────────────────────────────
// STATS AND MILESTONES
// ───────────────────────────────────────────────────────────────────────────

import { 
  RES_IDS, 
  stats, 
  resources, 
  MILESTONE_THRESHOLDS, 
  MILESTONE_LABELS, 
  MILESTONE_MULTIPLIERS,
  milestoneRewardsApplied,
  milestoneMultipliers
} from './dataModel.js';
import { fmt, setText } from './helpers.js';

// Update stats UI
function updateStatsUI() {
  // Financial stats
  setText("stat-earned", stats.earnedMoney);
  setText("stat-spent", stats.spentMoney);
  setText("stat-net", resources.money.count);
  setText("stat-highscore", Math.max(stats.earnedMoney, resources.money.count));

  // Resource stats
  RES_IDS.forEach((res) => {
    setText(`stat-mined-${res}`, stats.mined[res] || 0);
    setText(`stat-sold-${res}`, stats.sold[res] || 0);
  });

  // Activity stats
  setText("stat-click-mine", stats.clicks.mine);
  setText("stat-click-sell", stats.clicks.sell);
  setText("stat-click-shop", stats.clicks.shopBuy);
  setText("stat-click-unlock", stats.clicks.unlock);
}

// Apply milestone rewards
function applyMilestoneRewards() {
  RES_IDS.forEach((resId) => {
    const mined = stats.mined[resId] || 0;
    let newMultiplier = 1;

    MILESTONE_THRESHOLDS.forEach((threshold, i) => {
      if (mined >= threshold && !milestoneRewardsApplied[resId][i]) {
        milestoneRewardsApplied[resId][i] = true;
        console.log(`🏆 Milestone achieved! ${resId} ${MILESTONE_LABELS[i]} - ${MILESTONE_MULTIPLIERS[i]}x boost`);
      }

      if (milestoneRewardsApplied[resId][i]) {
        newMultiplier *= MILESTONE_MULTIPLIERS[i];
      }
    });

    milestoneMultipliers[resId] = newMultiplier;
  });
}

// Update milestone list
function updateMilestoneList() {
  const milestoneList = document.getElementById("milestone-list");
  if (!milestoneList) return;

  milestoneList.innerHTML = "";

  RES_IDS.forEach((resId) => {
    const mined = stats.mined[resId] || 0;
    const resourceName = resId.charAt(0).toUpperCase() + resId.slice(1);

    let nextShown = false;
    MILESTONE_THRESHOLDS.forEach((threshold, i) => {
      const achieved = mined >= threshold;
      const isNext = !achieved && !nextShown;

      // Calculate progress for the current milestone
      let progress = 0;
      if (achieved) {
        progress = 1;
      } else if (i === 0) {
        progress = Math.min(1, mined / threshold);
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
        fill.style.width = `${progress * 100}%`;
        bar.appendChild(fill);

        li.innerHTML = `
          <div class="milestone-content">
            <div class="milestone-header">
              <span class="milestone-resource">${resourceName}</span>
              <span class="milestone-threshold">${MILESTONE_LABELS[i]}</span>
            </div>
            <div class="milestone-reward">
              ${MILESTONE_MULTIPLIERS[i]}x Mining Speed
            </div>
            <div class="milestone-progress">
              ${fmt(mined)}/${fmt(threshold)}
            </div>
          </div>
        `;

        li.appendChild(bar);
        milestoneList.appendChild(li);

        if (isNext) nextShown = true;
      }
    });
  });
}

export {
  updateStatsUI,
  applyMilestoneRewards,
  updateMilestoneList
};