// shop/items.js
import { resources } from "../script.js";

export const shopItems = [
  // ──────────────────────────────────────────────────────────────
  // IRON
  // ──────────────────────────────────────────────────────────────
  {
    id: "clicker-upgrade",
    name: "Tougher Pickaxe",
    description: "+1 iron per click",
    category: "iron",
    basePrice: 40,
    price: 40,
    scale: 1.08,
    count: 0,
    max: 10,
    apply() {
      resources.iron.perClick += 1;
    },
  },
  {
    id: "drill",
    name: "Small Drill",
    description: "+0.8 iron/sec per level",
    category: "iron",
    basePrice: 45,
    price: 45,
    scale: 1.1,
    count: 0,
    max: 50,
    apply() {
      resources.iron.perSecond += 0.8;
    },
  },
  {
    id: "jackhammer",
    name: "Jackhammer",
    description: "+1.2 iron/sec per level",
    category: "iron",
    basePrice: 70,
    price: 70,
    scale: 1.12,
    count: 0,
    max: 50,
    apply() {
      resources.iron.perSecond += 1.2;
    },
  },
  {
    id: "coring-rig",
    name: "Coring Rig",
    description: "+2 iron/sec per level",
    category: "iron",
    basePrice: 120,
    price: 120,
    scale: 1.15,
    count: 0,
    max: 40,
    apply() {
      resources.iron.perSecond += 2;
    },
  },
  {
    id: "mining-rig",
    name: "Mining Rig",
    description: "+5 iron/sec per level",
    category: "iron",
    basePrice: 350,
    price: 350,
    scale: 1.18,
    count: 0,
    max: 40,
    apply() {
      resources.iron.perSecond += 5;
    },
  },
  {
    id: "auto-seller",
    name: "Auto-Seller (Iron)",
    description: "Automatically sells iron every 5s",
    category: "iron",
    basePrice: 2000,
    price: 2000,
    scale: 1.15,
    count: 0,
    max: 1,
    apply() {
      /* handled in script.js */
    },
  },

  // ──────────────────────────────────────────────────────────────
  // COPPER
  // ──────────────────────────────────────────────────────────────
  {
    id: "copper-clicker",
    name: "Reinforced Chisel",
    description: "+1 copper per click",
    category: "copper",
    basePrice: 120,
    price: 120,
    scale: 1.1,
    count: 0,
    max: 10,
    apply() {
      resources.copper.perClick += 1;
    },
  },
  {
    id: "copper-drill",
    name: "Copper Drill",
    description: "+0.4 copper/sec per level",
    category: "copper",
    basePrice: 130,
    price: 130,
    scale: 1.12,
    count: 0,
    max: 50,
    apply() {
      resources.copper.perSecond += 0.4;
    },
  },
  {
    id: "automated-smelter",
    name: "Automated Smelter",
    description: "+1.2 copper/sec per level",
    category: "copper",
    basePrice: 470,
    price: 470,
    scale: 1.15,
    count: 0,
    max: 40,
    apply() {
      resources.copper.perSecond += 1.2;
    },
  },
  {
    id: "copper-extractor",
    name: "Copper Extractor",
    description: "+5 copper/sec per level",
    category: "copper",
    basePrice: 2250,
    price: 2250,
    scale: 1.18,
    count: 0,
    max: 40,
    apply() {
      resources.copper.perSecond += 5;
    },
  },
  {
    id: "hydraulic-excavator",
    name: "Hydraulic Excavator",
    description: "+5 copper/sec per level",
    category: "copper",
    basePrice: 2550,
    price: 2550,
    scale: 1.2,
    count: 0,
    max: 20,
    apply() {
      resources.copper.perSecond += 5;
    },
  },
  {
    id: "auto-seller-copper",
    name: "Auto-Seller (Copper)",
    description: "Automatically sells copper every 5s",
    category: "copper",
    basePrice: 20000,
    price: 20000,
    scale: 1.18,
    count: 0,
    max: 1,
    apply() {
      /* handled in script.js */
    },
  },

  // ──────────────────────────────────────────────────────────────
  // BRONZE
  // ──────────────────────────────────────────────────────────────
  {
    id: "bronze-clicker",
    name: "Bronze Pickaxe",
    description: "+1 bronze per click",
    category: "bronze",
    basePrice: 300,
    price: 300,
    scale: 1.12,
    count: 0,
    max: 10,
    apply() {
      resources.bronze.perClick += 1;
    },
  },
  {
    id: "bronze-drill",
    name: "Bronze Drill",
    description: "+0.4 bronze/sec per level",
    category: "bronze",
    basePrice: 360,
    price: 360,
    scale: 1.15,
    count: 0,
    max: 50,
    apply() {
      resources.bronze.perSecond += 0.4;
    },
  },
  {
    id: "bronze-smelter",
    name: "Bronze Smelter",
    description: "+1.2 bronze/sec per level",
    category: "bronze",
    basePrice: 1200,
    price: 1200,
    scale: 1.18,
    count: 0,
    max: 40,
    apply() {
      resources.bronze.perSecond += 1.2;
    },
  },
  {
    id: "bronze-extractor",
    name: "Bronze Extractor",
    description: "+5 bronze/sec per level",
    category: "bronze",
    basePrice: 5500,
    price: 5500,
    scale: 1.2,
    count: 0,
    max: 40,
    apply() {
      resources.bronze.perSecond += 5;
    },
  },
  {
    id: "bronze-excavator",
    name: "Bronze Excavator",
    description: "+5 bronze/sec per level",
    category: "bronze",
    basePrice: 6000,
    price: 6000,
    scale: 1.22,
    count: 0,
    max: 20,
    apply() {
      resources.bronze.perSecond += 5;
    },
  },
  {
    id: "auto-seller-bronze",
    name: "Auto-Seller (Bronze)",
    description: "Automatically sells bronze every 5s",
    category: "bronze",
    basePrice: 45000,
    price: 45000,
    scale: 1.2,
    count: 0,
    max: 1,
    apply() {
      /* handled in script.js */
    },
  },

  // ──────────────────────────────────────────────────────────────
  // SILVER
  // ──────────────────────────────────────────────────────────────
  {
    id: "silver-click-1",
    name: "Silver Pickaxe",
    description: "+1 silver per click",
    category: "silver",
    basePrice: 15000,
    price: 15000,
    scale: 1.25,
    count: 0,
    max: 10,
    apply() {
      resources.silver.perClick += 1;
    },
  },
  {
    id: "silver-auto-1",
    name: "Silver Drill",
    description: "+2 silver/sec per level",
    category: "silver",
    basePrice: 5200,
    price: 5200,
    scale: 1.25,
    count: 0,
    max: 40,
    apply() {
      resources.silver.perSecond += 2;
    },
  },
  {
    id: "silver-auto-2",
    name: "Silver Rig",
    description: "+6 silver/sec per level",
    category: "silver",
    basePrice: 18000,
    price: 18000,
    scale: 1.25,
    count: 0,
    max: 40,
    apply() {
      resources.silver.perSecond += 6;
    },
  },
  {
    id: "silver-auto-3",
    name: "Silver Excavator",
    description: "+20 silver/sec per level",
    category: "silver",
    basePrice: 68000,
    price: 68000,
    scale: 1.25,
    count: 0,
    max: 30,
    apply() {
      resources.silver.perSecond += 20;
    },
  },
  {
    id: "silver-auto-4",
    name: "Quantum Silver Miner",
    description: "+50 silver/sec per level",
    category: "silver",
    basePrice: 190000,
    price: 190000,
    scale: 1.25,
    count: 0,
    max: 20,
    apply() {
      resources.silver.perSecond += 50;
    },
  },
  {
    id: "auto-seller-silver",
    name: "Auto-Seller (Silver)",
    description: "Automatically sells silver every 5s",
    category: "silver",
    basePrice: 500000,
    price: 500000,
    scale: 1.25,
    count: 0,
    max: 1,
    apply() {
      /* handled in script.js */
    },
  },

  // ──────────────────────────────────────────────────────────────
  // GOLD
  // ──────────────────────────────────────────────────────────────
  {
    id: "gold-click-1",
    name: "Gold Pickaxe",
    description: "+1 gold per click",
    category: "gold",
    basePrice: 35000,
    price: 35000,
    scale: 1.25,
    count: 0,
    max: 10,
    apply() {
      resources.gold.perClick += 1;
    },
  },
  {
    id: "gold-auto-1",
    name: "Gold Drill",
    description: "+2 gold/sec per level",
    category: "gold",
    basePrice: 12000,
    price: 12000,
    scale: 1.25,
    count: 0,
    max: 40,
    apply() {
      resources.gold.perSecond += 2;
    },
  },
  {
    id: "gold-auto-2",
    name: "Gold Rig",
    description: "+6 gold/sec per level",
    category: "gold",
    basePrice: 40000,
    price: 40000,
    scale: 1.25,
    count: 0,
    max: 40,
    apply() {
      resources.gold.perSecond += 6;
    },
  },
  {
    id: "gold-auto-3",
    name: "Gold Excavator",
    description: "+20 gold/sec per level",
    category: "gold",
    basePrice: 150000,
    price: 150000,
    scale: 1.25,
    count: 0,
    max: 30,
    apply() {
      resources.gold.perSecond += 20;
    },
  },
  {
    id: "gold-auto-4",
    name: "Quantum Gold Miner",
    description: "+50 gold/sec per level",
    category: "gold",
    basePrice: 400000,
    price: 400000,
    scale: 1.25,
    count: 0,
    max: 20,
    apply() {
      resources.gold.perSecond += 50;
    },
  },
  {
    id: "auto-seller-gold",
    name: "Auto-Seller (Gold)",
    description: "Automatically sells gold every 5s",
    category: "gold",
    basePrice: 900000,
    price: 1200000,
    scale: 1.25,
    count: 0,
    max: 1,
    apply() {
      /* handled in script.js */
    },
  },

  // ──────────────────────────────────────────────────────────────
  // PLATINUM
  // ──────────────────────────────────────────────────────────────
  {
    id: "platinum-clicker",
    name: "Platinum Pickaxe",
    description: "+1 platinum per click",
    category: "platinum",
    basePrice: 8000,
    price: 8000,
    scale: 1.25,
    count: 0,
    max: 20,
    apply() {
      resources.platinum.perClick += 1;
    },
  },
  {
    id: "platinum-miner-1",
    name: "Basic Platinum Miner",
    description: "+2 platinum/sec",
    category: "platinum",
    basePrice: 10000,
    price: 10000,
    scale: 1.25,
    count: 0,
    max: 20,
    apply() {
      resources.platinum.perSecond += 2;
    },
  },
  {
    id: "platinum-miner-2",
    name: "Advanced Platinum Miner",
    description: "+5 platinum/sec",
    category: "platinum",
    basePrice: 25000,
    price: 25000,
    scale: 1.25,
    count: 0,
    max: 20,
    apply() {
      resources.platinum.perSecond += 5;
    },
  },
  {
    id: "platinum-miner-3",
    name: "Elite Platinum Miner",
    description: "+15 platinum/sec",
    category: "platinum",
    basePrice: 70000,
    price: 70000,
    scale: 1.25,
    count: 0,
    max: 10,
    apply() {
      resources.platinum.perSecond += 15;
    },
  },
  {
    id: "platinum-miner-4",
    name: "Industrial Platinum Miner",
    description: "+50 platinum/sec",
    category: "platinum",
    basePrice: 200000,
    price: 200000,
    scale: 1.25,
    count: 0,
    max: 5,
    apply() {
      resources.platinum.perSecond += 50;
    },
  },
  {
    id: "auto-seller-platinum",
    name: "Auto-Seller (Platinum)",
    description: "Automatically sells platinum every 5s",
    category: "platinum",
    basePrice: 700000,
    price: 700000,
    scale: 1.25,
    count: 0,
    max: 1,
    apply() {
      /* handled in script.js */
    },
  },

  // ──────────────────────────────────────────────────────────────
  // TITANIUM
  // ──────────────────────────────────────────────────────────────
  {
    id: "titanium-clicker-upgrade",
    name: "Titanium Pickaxe",
    description: "+1 titanium per click",
    category: "titanium",
    basePrice: 800,
    price: 800,
    scale: 1.12,
    count: 0,
    max: 10,
    apply() {
      resources.titanium.perClick += 1;
    },
  },
  {
    id: "titanium-drill",
    name: "Titanium Drill",
    description: "+1.5 titanium/sec per level",
    category: "titanium",
    basePrice: 1000,
    price: 1000,
    scale: 1.15,
    count: 0,
    max: 25,
    apply() {
      resources.titanium.perSecond += 1.5;
    },
  },
  {
    id: "titanium-miner-1",
    name: "Basic Titanium Miner",
    description: "+3 titanium/sec",
    category: "titanium",
    basePrice: 2500,
    price: 2500,
    scale: 1.25,
    count: 0,
    max: 15,
    apply() {
      resources.titanium.perSecond += 3;
    },
  },
  {
    id: "titanium-miner-2",
    name: "Advanced Titanium Miner",
    description: "+8 titanium/sec",
    category: "titanium",
    basePrice: 7500,
    price: 7500,
    scale: 1.25,
    count: 0,
    max: 10,
    apply() {
      resources.titanium.perSecond += 8;
    },
  },
  {
    id: "titanium-miner-3",
    name: "Elite Titanium Miner",
    description: "+20 titanium/sec",
    category: "titanium",
    basePrice: 25000,
    price: 25000,
    scale: 1.25,
    count: 0,
    max: 8,
    apply() {
      resources.titanium.perSecond += 20;
    },
  },
  {
    id: "titanium-miner-4",
    name: "Industrial Titanium Miner",
    description: "+60 titanium/sec",
    category: "titanium",
    basePrice: 80000,
    price: 80000,
    scale: 1.25,
    count: 0,
    max: 5,
    apply() {
      resources.titanium.perSecond += 60;
    },
  },
  {
    id: "auto-seller-titanium",
    name: "Auto-Seller (Titanium)",
    description: "Automatically sells titanium every 5s",
    category: "titanium",
    basePrice: 300000,
    price: 300000,
    scale: 1.25,
    count: 0,
    max: 1,
    apply() {
      /* handled in script.js */
    },
  },

  // ──────────────────────────────────────────────────────────────
  // ADAMANTIUM
  // ──────────────────────────────────────────────────────────────
  {
    id: "adamantium-clicker-upgrade",
    name: "Adamantium Pickaxe",
    description: "+1 adamantium per click",
    category: "adamantium",
    basePrice: 1600,
    price: 1600,
    scale: 1.15,
    count: 0,
    max: 10,
    apply() {
      resources.adamantium.perClick += 1;
    },
  },
  {
    id: "adamantium-drill",
    name: "Adamantium Drill",
    description: "+2 adamantium/sec per level",
    category: "adamantium",
    basePrice: 2000,
    price: 2000,
    scale: 1.18,
    count: 0,
    max: 25,
    apply() {
      resources.adamantium.perSecond += 2;
    },
  },
  {
    id: "adamantium-miner-1",
    name: "Basic Adamantium Miner",
    description: "+4 adamantium/sec",
    category: "adamantium",
    basePrice: 5000,
    price: 5000,
    scale: 1.28,
    count: 0,
    max: 15,
    apply() {
      resources.adamantium.perSecond += 4;
    },
  },
  {
    id: "adamantium-miner-2",
    name: "Advanced Adamantium Miner",
    description: "+12 adamantium/sec",
    category: "adamantium",
    basePrice: 15000,
    price: 15000,
    scale: 1.25,
    count: 0,
    max: 10,
    apply() {
      resources.adamantium.perSecond += 12;
    },
  },
  {
    id: "adamantium-miner-3",
    name: "Elite Adamantium Miner",
    description: "+30 adamantium/sec",
    category: "adamantium",
    basePrice: 50000,
    price: 50000,
    scale: 1.25,
    count: 0,
    max: 8,
    apply() {
      resources.adamantium.perSecond += 30;
    },
  },
  {
    id: "adamantium-miner-4",
    name: "Industrial Adamantium Miner",
    description: "+80 adamantium/sec",
    category: "adamantium",
    basePrice: 160000,
    price: 160000,
    scale: 1.25,
    count: 0,
    max: 5,
    apply() {
      resources.adamantium.perSecond += 80;
    },
  },
  {
    id: "auto-seller-adamantium",
    name: "Auto-Seller (Adamantium)",
    description: "Automatically sells adamantium every 5s",
    category: "adamantium",
    basePrice: 600000,
    price: 600000,
    scale: 1.25,
    count: 0,
    max: 1,
    apply() {
      /* handled in script.js */
    },
  },
];
