// ───────────────────────────────────────────────────────────────────────────
// THEME SWITCHER
// ───────────────────────────────────────────────────────────────────────────

import { storageManager } from './storageManager.js';
import { themeSelect } from './uiElements.js';

const themeClassList = [
  "theme-classic",
  "theme-midnight",
  "theme-emerald",
  "theme-sunset",
  "theme-neon-cyan",
  "theme-neon-purple",
  "theme-neon-pink",
  "theme-cyberpunk",
  "theme-aurora",
  "theme-dragon-fire",
];

function setTheme(theme) {
  document.body.classList.remove(...themeClassList);
  if (theme !== "classic") {
    document.body.classList.add(`theme-${theme}`);
  } else {
    document.body.classList.add("theme-classic");
  }
  // Optionally, persist theme in localStorage
  try {
    localStorage.setItem("idleforge-theme", theme);
  } catch {}
}

function initializeThemeSwitcher() {
  if (themeSelect) {
    themeSelect.addEventListener("change", (e) => {
      const selectedTheme = e.target.value;
      setTheme(selectedTheme);

      // Premium theme activation effects
      if (selectedTheme === "aurora") {
        // Add special aurora activation effect
        document.body.style.animation = "aurora-dance 2s ease-in-out";
        setTimeout(() => {
          document.body.style.animation = "";
        }, 2000);
      } else if (selectedTheme === "dragon-fire") {
        // Add special dragon fire activation effect
        document.body.style.animation = "fire-flicker 2s ease-in-out";
        setTimeout(() => {
          document.body.style.animation = "";
        }, 2000);
      }
    });

    // On load, set theme from localStorage or default
    let savedTheme = "classic";
    savedTheme = storageManager.get("idleforge-theme", "classic");
    setTheme(savedTheme);
    themeSelect.value = savedTheme;
  }
}

export { setTheme, initializeThemeSwitcher };