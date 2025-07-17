// shop/items.js
import { resources } from '../script.js';

export const shopItems = [
  // ——— Iron Upgrades —————————————————————————————————————————————
  {
    id: 'clicker-upgrade',
    name: 'Tougher Pickaxe',
    description: '+1 per click',
    category: 'iron',
    basePrice: 30,
    price: 30,
    scale: 1.15,
    count: 0,
    max: 10,
    apply() {
      resources.iron.perClick += 1;
    }
  },
  {
    id: 'drill',
    name: 'Small Drill',
    description: 'Mines 1 per second',
    category: 'iron',
    basePrice: 150,
    price: 150,
    scale: 1.2,
    count: 0,
    max: 20,
    apply() {
      resources.iron.perSecond += 1;
    }
  },
  {
    id: 'jackhammer',
    name: 'Jackhammer',
    description: 'Mines 2 per second',
    category: 'iron',
    basePrice: 400,
    price: 400,
    scale: 1.25,
    count: 0,
    max: 15,
    apply() {
      resources.iron.perSecond += 2;
    }
  },
  {
    id: 'coring-rig',
    name: 'Coring Rig',
    description: '+5 per second',
    category: 'iron',
    basePrice: 1500,
    price: 1500,
    scale: 1.2,
    count: 0,
    max: 10,
    apply() {
      resources.iron.perSecond += 5;
    }
  },
  {
    id: 'mining-rig',
    name: 'Mining Rig',
    description: '+10 per second',
    category: 'iron',
    basePrice: 4000,
    price: 4000,
    scale: 1.25,
    count: 0,
    max: 10,
    apply() {
      resources.iron.perSecond += 10;
    }
  },
  {
    id: 'auto-seller',
    name: 'Auto-Seller',
    description: 'Automatically sell Iron every 5s',
    category: 'iron',
    basePrice: 1000,
    price: 1000,
    scale: 1.3,
    count: 0,
    max: 1,
    apply() {
      // auto‐sell handled in script.js
    }
  },

  // ——— Copper Upgrades ————————————————————————————————————————————
  {
    id: 'copper-clicker',
    name: 'Reinforced Chisel',
    description: '+1 copper per click',
    category: 'copper',
    basePrice: 75,
    price: 75,
    scale: 1.15,
    count: 0,
    max: 10,
    apply() {
      resources.copper.perClick += 1;
    }
  },
  {
    id: 'copper-drill',
    name: 'Copper Drill',
    description: 'Mines 1 copper/sec',
    category: 'copper',
    basePrice: 150,
    price: 150,
    scale: 1.2,
    count: 0,
    max: 20,
    apply() {
      resources.copper.perSecond += 1;
    }
  },
  {
    id: 'automated-smelter',
    name: 'Automated Smelter',
    description: 'Mines 3 copper/sec',
    category: 'copper',
    basePrice: 700,
    price: 700,
    scale: 1.2,
    count: 0,
    max: 10,
    apply() {
      resources.copper.perSecond += 3;
    }
  },
  {
    id: 'copper-extractor',
    name: 'Copper Extractor',
    description: 'Mines 10 copper/sec',
    category: 'copper',
    basePrice: 1200,
    price: 1200,
    scale: 1.25,
    count: 0,
    max: 10,
    apply() {
      resources.copper.perSecond += 10;
    }
  },
  {
    id: 'hydraulic-excavator',
    name: 'Hydraulic Excavator',
    description: 'Mines 25 copper/sec',
    category: 'copper',
    basePrice: 5000,
    price: 5000,
    scale: 1.3,
    count: 0,
    max: 2,
    apply() {
      resources.copper.perSecond += 25;
    }
  },
  {
    id: 'auto-seller-copper',
    name: 'Auto Seller',
    description: 'Automatically sells copper every 5s',
    category: 'copper',
    basePrice: 2000,
    price: 2000,
    scale: 1.3,
    count: 0,
    max: 1,
    apply() {
      // auto-sell handled in script.js
    }
  }
];