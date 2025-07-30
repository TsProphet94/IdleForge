// js/test-init.js - Simple test to verify module loading
console.log('🎮 Testing modular structure...');

// Test basic imports
import { resources, RES_IDS } from './data.js';

console.log('✅ Data module loaded');
console.log('Resources:', Object.keys(resources));
console.log('Resource IDs:', RES_IDS);

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM loaded, modules working!');
  
  // Simple test - update money display
  const moneyEl = document.getElementById('money-count');
  if (moneyEl) {
    moneyEl.textContent = '100';
    console.log('✅ Updated money display');
  }
  
  console.log('🎉 Basic modular structure test passed!');
});