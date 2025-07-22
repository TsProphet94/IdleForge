// shop/items.js
import { resources } from "../script.js";

export const shopItems = [
  // ——— Iron Upgrades —————————————————————————————————————————————
  {
    id: "clicker-upgrade",
    name: "Tougher Pickaxe",
    description: "+1 per click",
    category: "iron",
    basePrice: 40, // ↑ was 20 → doubled to slow clicker ROI
    price: 40,
    scale: 1.15,
    count: 0,
    max: 10,
    apply() {
      resources.iron.perClick += 1;
    },
  },
  {
    id: "drill",
    name: "Small Drill",
    description: "Mines 1 per second",
    category: "iron",
    basePrice: 120, // ↑ was 100 → 2 iron/sec sells for $2/sec → 120 cost → 60 s ROI
    price: 120,
    scale: 1.2,
    count: 0,
    max: 10,
    apply() {
      resources.iron.perSecond += 2;
    },
  },
  {
    id: "jackhammer",
    name: "Jackhammer",
    description: "Mines 2 per second",
    category: "iron",
    basePrice: 180, // ↓ was 250 → 3 iron/sec sells for $3/sec → 180 cost → 60 s ROI
    price: 180,
    scale: 1.25,
    count: 0,
    max: 10,
    apply() {
      resources.iron.perSecond += 3;
    },
  },
  {
    id: "coring-rig",
    name: "Coring Rig",
    description: "+5 per second",
    category: "iron",
    basePrice: 300, // ↓ was 600 → 5 iron/sec sells for $5/sec → 300 cost → 60 s ROI
    price: 300,
    scale: 1.2,
    count: 0,
    max: 8,
    apply() {
      resources.iron.perSecond += 5;
    },
  },
  {
    id: "mining-rig",
    name: "Mining Rig",
    description: "+10 per second",
    category: "iron",
    basePrice: 1200, // ↓ was 1500 → 20 iron/sec sells for $20/sec → 1200 cost → 60 s ROI
    price: 1200,
    scale: 1.25,
    count: 0,
    max: 5,
    apply() {
      resources.iron.perSecond += 20;
    },
  },
  {
    id: "auto-seller",
    name: "Auto-Seller",
    description: "Automatically sell Iron every 5s",
    category: "iron",
    basePrice: 1200, // unchanged
    price: 1200,
    scale: 1.3,
    count: 0,
    max: 1,
    apply() {
      // auto-sell handled in script.js
    },
  },

  // ——— Copper Upgrades (no change, already at 40 s ROI) ——————————————————
  {
    id: "copper-clicker",
    name: "Reinforced Chisel",
    description: "+1 copper per click",
    category: "copper",
    basePrice: 50,
    price: 50,
    scale: 1.15,
    count: 0,
    max: 10,
    apply() {
      resources.copper.perClick += 1;
    },
  },
  {
    id: "copper-drill",
    name: "Copper Drill",
    description: "Mines 1 copper/sec",
    category: "copper",
    basePrice: 120,
    price: 120,
    scale: 1.2,
    count: 0,
    max: 10,
    apply() {
      resources.copper.perSecond += 1;
    },
  },
  {
    id: "automated-smelter",
    name: "Automated Smelter",
    description: "Mines 3 copper/sec",
    category: "copper",
    basePrice: 360,
    price: 360,
    scale: 1.2,
    count: 0,
    max: 8,
    apply() {
      resources.copper.perSecond += 3;
    },
  },
  {
    id: "copper-extractor",
    name: "Copper Extractor",
    description: "Mines 10 copper/sec",
    category: "copper",
    basePrice: 1200,
    price: 1200,
    scale: 1.25,
    count: 0,
    max: 10,
    apply() {
      resources.copper.perSecond += 10;
    },
  },
  {
    id: "hydraulic-excavator",
    name: "Hydraulic Excavator",
    description: "Mines 25 copper/sec",
    category: "copper",
    basePrice: 3000,
    price: 3000,
    scale: 1.3,
    count: 0,
    max: 2,
    apply() {
      resources.copper.perSecond += 25;
    },
  },
  {
    id: "auto-seller-copper",
    name: "Auto Seller",
    description: "Automatically sells copper every 5s",
    category: "copper",
    basePrice: 2400,
    price: 2400,
    scale: 1.3,
    count: 0,
    max: 1,
    apply() {
      // auto-sell handled in script.js
    },
  },

  // ——— Bronze Upgrades ————————————————————————————————————————————
  {
    id: "bronze-clicker",
    name: "Bronze Pickaxe",
    description: "+1 bronze per click",
    category: "bronze",
    basePrice: 100, // unchanged
    price: 100,
    scale: 1.15,
    count: 0,
    max: 10,
    apply() {
      resources.bronze.perClick += 1;
    },
  },
  {
    id: "bronze-drill",
    name: "Bronze Drill",
    description: "Mines 1 bronze/sec",
    category: "bronze",
    basePrice: 150, // ↓ was 200 → 1 bps @ $5/sec → 150 cost → 30 s ROI
    price: 150,
    scale: 1.2,
    count: 0,
    max: 10,
    apply() {
      resources.bronze.perSecond += 1;
    },
  },
  {
    id: "bronze-smelter",
    name: "Bronze Smelter",
    description: "Mines 3 bronze/sec",
    category: "bronze",
    basePrice: 450, // ↓ was 500 → 3 bps @ $15/sec → 450 cost → 30 s ROI
    price: 450,
    scale: 1.2,
    count: 0,
    max: 8,
    apply() {
      resources.bronze.perSecond += 3;
    },
  },
  {
    id: "bronze-extractor",
    name: "Bronze Extractor",
    description: "Mines 10 bronze/sec",
    category: "bronze",
    basePrice: 1500, // ↑ was 1200 → 10 bps @ $50/sec → 1500 cost → 30 s ROI
    price: 1500,
    scale: 1.25,
    count: 0,
    max: 10,
    apply() {
      resources.bronze.perSecond += 10;
    },
  },
  {
    id: "bronze-excavator",
    name: "Bronze Excavator",
    description: "Mines 25 bronze/sec",
    category: "bronze",
    basePrice: 3750, // ↑ was 3000 → 25 bps @ $125/sec → 3750 cost → 30 s ROI
    price: 3750,
    scale: 1.3,
    count: 0,
    max: 2,
    apply() {
      resources.bronze.perSecond += 25;
    },
  },
  {
    id: "auto-seller-bronze",
    name: "Auto Seller (Bronze)",
    description: "Automatically sells bronze every 5s",
    category: "bronze",
    basePrice: 6000, // unchanged
    price: 6000,
    scale: 1.3,
    count: 0,
    max: 1,
    apply() {
      // auto-sell handled in script.js
    },
  },
];
