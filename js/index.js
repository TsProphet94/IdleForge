// Entry point for IdleForge game using ES6 modules

// Core Data and State (must load first)
import './modules/data.js';
import './modules/state.js';

// Storage and Persistence (load early for save data)
import './modules/storage.js';

// Helpers and UI Utilities
import './modules/helpers.js';
import './modules/modal.js';
import './modules/theme.js';

// Game Mechanics
import './modules/game.js';
import './modules/prestige.js';
import './modules/autosell.js';

// Shop Logic
import './modules/shop.js';

// UI Rendering
import './modules/ui.js';

// Game Loop and Settings
import './modules/gameLoop.js';
import './modules/settings.js';

// Event Handlers (initialize DOM interactions last)
import './modules/events.js';

// Log successful module loading
console.log("✅ All ES6 modules loaded successfully");
