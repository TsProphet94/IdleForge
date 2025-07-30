// js/simple-init.js - Simplified initialization 
import { ensureShopItemsInitialized, setGameStarted } from './data.js';
import { UI_ELEMENTS } from './ui.js';

console.log('🎮 IdleForge - Modular Version Starting...');

document.addEventListener("DOMContentLoaded", () => {
  console.log('📋 DOM Content Loaded');
  
  try {
    // Initialize UI elements cache
    UI_ELEMENTS.init();
    console.log('✅ UI Elements initialized');

    // Initialize shop items
    ensureShopItemsInitialized();
    console.log('✅ Shop items initialized');

    // Initialize basic game state
    setGameStarted(false);
    console.log('✅ Game state initialized');

    console.log('🎉 IdleForge modular version loaded successfully!');
    
    // Test a button click
    const newGameBtn = document.getElementById('btn-new');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        console.log('🆕 New Game button clicked!');
        alert('Modular version working! New Game clicked.');
      });
    }

  } catch (error) {
    console.error('❌ Error during initialization:', error);
  }
});