// Theme switching module

import { storageManager } from './storage.js';

const themeClassList = [
  'theme-classic',
  'theme-midnight',
  'theme-emerald',
  'theme-sunset',
  'theme-neon-cyan',
  'theme-neon-purple',
  'theme-neon-pink',
  'theme-cyberpunk',
  'theme-aurora',
  'theme-dragon-fire',
];

/**
 * Apply the given theme by adjusting body classes and persisting choice.
 */
export function setTheme(theme) {
  document.body.classList.remove(...themeClassList);
  if (theme !== 'classic') {
    document.body.classList.add(`theme-${theme}`);
  } else {
    document.body.classList.add('theme-classic');
  }
  try {
    storageManager.set('idleforge-theme', theme);
  } catch {}
}

/**
 * Initialize theme selector and load saved theme.
 */
export function initTheme() {
  const themeSelect = document.getElementById('theme-select');
  if (!themeSelect) return;

  themeSelect.addEventListener('change', (e) => {
    const selected = e.target.value;
    setTheme(selected);
    if (selected === 'aurora') {
      document.body.style.animation = 'aurora-dance 2s ease-in-out';
      setTimeout(() => (document.body.style.animation = ''), 2000);
    } else if (selected === 'dragon-fire') {
      document.body.style.animation = 'fire-flicker 2s ease-in-out';
      setTimeout(() => (document.body.style.animation = ''), 2000);
    }
  });

  const saved = storageManager.get('idleforge-theme', 'classic');
  setTheme(saved);
  themeSelect.value = saved;
}
