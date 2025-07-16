import { resources } from '../resources/iron.js';

export const shopItems = [
  {
    id: 'clicker-upgrade',
    name: 'Tougher Pickaxe',
    description: '+1 iron per click',
    category: 'iron',
    basePrice: 50,
    price: 50,
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
    description: 'Mines 1 iron/sec',
    category: 'iron',
    basePrice: 200,
    price: 200,
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
    description: 'Mines 2 iron/sec',
    category: 'iron',
    basePrice: 500,
    price: 500,
    scale: 1.25,
    count: 0,
    max: 15,
    apply() {
      resources.iron.perSecond += 2;
    }
  },
   // … your existing items …

  
  {
    id: 'coring-rig',
    name: 'Coring Rig',
    description: '+5 iron ore per second',
    category: 'iron',
    basePrice: 2000,
    price: 2000,
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
    description: '+10 iron ore per second',
    category: 'iron',
    basePrice: 5000,
    price: 5000,
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
   description: 'Automatically sell all iron periodically (10 s → 2 s at max)',
   category: 'iron',
  basePrice: 1000,
   price: 1000,
   scale: 1.3,
   count: 0,
   max: 1,
   apply() {
     // No state changes here; the auto-sell loop lives in script.js
   }
  },
 ];
