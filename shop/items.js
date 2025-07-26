// shop/items.js
import { resources } from "../script.js";

export const shopItems = [
  // ──────────────────────────────────────────────────────────────
  // IRON
  // ──────────────────────────────────────────────────────────────
  {
    id: "iron-clicker",
    name: "Forged Pickaxe",
    description: "+1 iron per click",
    category: "iron",
    basePrice: 20,
    price: 20,
    scale: 1.08,
    count: 0,
    max: 10,
    apply() {
      resources.iron.perClick += 1;
    },
  },
  {
    id: "iron-automine-1",
    name: "Rusty Drill",
    description: "+3 iron/sec",
    category: "iron",
    basePrice: 30,
    price: 30,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.iron.perSecond += 3;
    },
  },
  {
    id: "iron-automine-2",
    name: "Steam Hammer",
    description: "+8 iron/sec",
    category: "iron",
    basePrice: 120,
    price: 120,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.iron.perSecond += 8;
    },
  },
  {
    id: "iron-automine-3",
    name: "Blast Furnace",
    description: "+15 iron/sec",
    category: "iron",
    basePrice: 480,
    price: 480,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.iron.perSecond += 15;
    },
  },
  {
    id: "iron-automine-4",
    name: "Steel Mill Complex",
    description: "+30 iron/sec",
    category: "iron",
    basePrice: 1800,
    price: 1800,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.iron.perSecond += 30;
    },
  },
  {
    id: "iron-automine-5",
    name: "Industrial Foundry",
    description: "+60 iron/sec",
    category: "iron",
    basePrice: 7200,
    price: 7200,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.iron.perSecond += 60;
    },
  },
  {
    id: "iron-autoseller",
    name: "Ore Merchant",
    description: "Automatically sells iron every 5s",
    category: "iron",
    basePrice: 1200,
    price: 1200,
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
    name: "Bronze Chisel",
    description: "+1 copper per click",
    category: "copper",
    basePrice: 120,
    price: 120,
    scale: 1.08,
    count: 0,
    max: 10,
    apply() {
      resources.copper.perClick += 1;
    },
  },
  {
    id: "copper-automine-1",
    name: "Wire Stripper",
    description: "+3 copper/sec",
    category: "copper",
    basePrice: 130,
    price: 130,
    scale: 1.15,
    count: 0,
    max: 85,
    apply() {
      resources.copper.perSecond += 3;
    },
  },
  {
    id: "copper-automine-2",
    name: "Electric Harvester",
    description: "+8 copper/sec",
    category: "copper",
    basePrice: 500,
    price: 500,
    scale: 1.15,
    count: 0,
    max: 85,
    apply() {
      resources.copper.perSecond += 8;
    },
  },
  {
    id: "copper-automine-3",
    name: "Conductivity Lab",
    description: "+15 copper/sec",
    category: "copper",
    basePrice: 2000,
    price: 2000,
    scale: 1.15,
    count: 0,
    max: 85,
    apply() {
      resources.copper.perSecond += 15;
    },
  },
  {
    id: "copper-automine-4",
    name: "Electrical Grid",
    description: "+30 copper/sec",
    category: "copper",
    basePrice: 8000,
    price: 8000,
    scale: 1.15,
    count: 0,
    max: 85,
    apply() {
      resources.copper.perSecond += 30;
    },
  },
  {
    id: "copper-automine-5",
    name: "Voltage Amplifier",
    description: "+40 copper/sec",
    category: "copper",
    basePrice: 30000,
    price: 30000,
    scale: 1.15,
    count: 0,
    max: 85,
    apply() {
      resources.copper.perSecond += 40;
    },
  },
  {
    id: "copper-autoseller",
    name: "Wire Trader",
    description: "Automatically sells copper every 5s",
    category: "copper",
    basePrice: 5000,
    price: 5000,
    scale: 1.15,
    count: 0,
    max: 1,
    apply() {
      /* handled in script.js */
    },
  },

  // ──────────────────────────────────────────────────────────────
  // NICKEL
  // ──────────────────────────────────────────────────────────────
  {
    id: "nickel-clicker",
    name: "Magnetic Hammer",
    description: "+1 nickel per click",
    category: "nickel",
    basePrice: 200,
    price: 200,
    scale: 1.08,
    count: 0,
    max: 10,
    apply() {
      resources.nickel.perClick += 1;
    },
  },
  {
    id: "nickel-automine-1",
    name: "Lodestone Detector",
    description: "+2 nickel/sec",
    category: "nickel",
    basePrice: 280,
    price: 280,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.nickel.perSecond += 2;
    },
  },
  {
    id: "nickel-automine-2",
    name: "Alloy Smelter",
    description: "+5 nickel/sec",
    category: "nickel",
    basePrice: 1000,
    price: 1000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.nickel.perSecond += 5;
    },
  },
  {
    id: "nickel-automine-3",
    name: "Ferrite Core Lab",
    description: "+10 nickel/sec",
    category: "nickel",
    basePrice: 4000,
    price: 4000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.nickel.perSecond += 10;
    },
  },
  {
    id: "nickel-automine-4",
    name: "Magnetic Field Array",
    description: "+20 nickel/sec",
    category: "nickel",
    basePrice: 15000,
    price: 15000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.nickel.perSecond += 20;
    },
  },
  {
    id: "nickel-automine-5",
    name: "Magnetron Generator",
    description: "+40 nickel/sec",
    category: "nickel",
    basePrice: 60000,
    price: 60000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.nickel.perSecond += 40;
    },
  },
  {
    id: "nickel-autoseller",
    name: "Alloy Broker",
    description: "Automatically sells nickel every 5s",
    category: "nickel",
    basePrice: 10000,
    price: 10000,
    scale: 1.15,
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
    name: "Ancient Mallet",
    description: "+1 bronze per click",
    category: "bronze",
    basePrice: 300,
    price: 300,
    scale: 1.08,
    count: 0,
    max: 10,
    apply() {
      resources.bronze.perClick += 1;
    },
  },
  {
    id: "bronze-automine-1",
    name: "Grecian Bellows",
    description: "+2 bronze/sec",
    category: "bronze",
    basePrice: 360,
    price: 360,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.bronze.perSecond += 2;
    },
  },
  {
    id: "bronze-automine-2",
    name: "Roman Forge",
    description: "+5 bronze/sec",
    category: "bronze",
    basePrice: 1500,
    price: 1500,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.bronze.perSecond += 5;
    },
  },
  {
    id: "bronze-automine-3",
    name: "Temple Workshop",
    description: "+10 bronze/sec",
    category: "bronze",
    basePrice: 6000,
    price: 6000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.bronze.perSecond += 10;
    },
  },
  {
    id: "bronze-automine-4",
    name: "Colosseum Foundry",
    description: "+20 bronze/sec",
    category: "bronze",
    basePrice: 25000,
    price: 25000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.bronze.perSecond += 20;
    },
  },
  {
    id: "bronze-automine-5",
    name: "Olympian Arsenal",
    description: "+40 bronze/sec",
    category: "bronze",
    basePrice: 100000,
    price: 100000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.bronze.perSecond += 40;
    },
  },
  {
    id: "bronze-autoseller",
    name: "Market Curator",
    description: "Automatically sells bronze every 5s",
    category: "bronze",
    basePrice: 20000,
    price: 20000,
    scale: 1.15,
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
    id: "silver-clicker",
    name: "Jeweler's Hammer",
    description: "+1 silver per click",
    category: "silver",
    basePrice: 15000,
    price: 15000,
    scale: 1.08,
    count: 0,
    max: 10,
    apply() {
      resources.silver.perClick += 1;
    },
  },
  {
    id: "silver-automine-1",
    name: "Mirror Polisher",
    description: "+2 silver/sec",
    category: "silver",
    basePrice: 5200,
    price: 5200,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.silver.perSecond += 2;
    },
  },
  {
    id: "silver-automine-2",
    name: "Silversmith Atelier",
    description: "+5 silver/sec",
    category: "silver",
    basePrice: 20000,
    price: 20000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.silver.perSecond += 5;
    },
  },
  {
    id: "silver-automine-3",
    name: "Noble Mint",
    description: "+10 silver/sec",
    category: "silver",
    basePrice: 80000,
    price: 80000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.silver.perSecond += 10;
    },
  },
  {
    id: "silver-automine-4",
    name: "Royal Treasury",
    description: "+20 silver/sec",
    category: "silver",
    basePrice: 300000,
    price: 300000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.silver.perSecond += 20;
    },
  },
  {
    id: "silver-automine-5",
    name: "Platinum Refinery",
    description: "+40 silver/sec",
    category: "silver",
    basePrice: 1200000,
    price: 1200000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.silver.perSecond += 40;
    },
  },
  {
    id: "silver-autoseller",
    name: "Luxury Dealer",
    description: "Automatically sells silver every 5s",
    category: "silver",
    basePrice: 100000,
    price: 100000,
    scale: 1.15,
    count: 0,
    max: 1,
    apply() {
      /* handled in script.js */
    },
  },

  // ──────────────────────────────────────────────────────────────
  // COBALT
  // ──────────────────────────────────────────────────────────────
  {
    id: "cobalt-clicker",
    name: "Sapphire Chisel",
    description: "+1 cobalt per click",
    category: "cobalt",
    basePrice: 25000,
    price: 25000,
    scale: 1.08,
    count: 0,
    max: 10,
    apply() {
      resources.cobalt.perClick += 1;
    },
  },
  {
    id: "cobalt-automine-1",
    name: "Ceramic Kiln",
    description: "+2 cobalt/sec",
    category: "cobalt",
    basePrice: 40000,
    price: 40000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.cobalt.perSecond += 2;
    },
  },
  {
    id: "cobalt-automine-2",
    name: "Pigment Mill",
    description: "+5 cobalt/sec",
    category: "cobalt",
    basePrice: 150000,
    price: 150000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.cobalt.perSecond += 5;
    },
  },
  {
    id: "cobalt-automine-3",
    name: "Glass Factory",
    description: "+10 cobalt/sec",
    category: "cobalt",
    basePrice: 600000,
    price: 600000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.cobalt.perSecond += 10;
    },
  },
  {
    id: "cobalt-automine-4",
    name: "Battery Plant",
    description: "+20 cobalt/sec",
    category: "cobalt",
    basePrice: 2500000,
    price: 2500000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.cobalt.perSecond += 20;
    },
  },
  {
    id: "cobalt-automine-5",
    name: "Reactor Core Facility",
    description: "+40 cobalt/sec",
    category: "cobalt",
    basePrice: 10000000,
    price: 10000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.cobalt.perSecond += 40;
    },
  },
  {
    id: "cobalt-autoseller",
    name: "Industrial Broker",
    description: "Automatically sells cobalt every 5s",
    category: "cobalt",
    basePrice: 500000,
    price: 500000,
    scale: 1.15,
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
    id: "gold-clicker",
    name: "Golden Scepter",
    description: "+1 gold per click",
    category: "gold",
    basePrice: 35000,
    price: 35000,
    scale: 1.08,
    count: 0,
    max: 10,
    apply() {
      resources.gold.perClick += 1;
    },
  },
  {
    id: "gold-automine-1",
    name: "Treasure Hunter",
    description: "+2 gold/sec",
    category: "gold",
    basePrice: 100000,
    price: 100000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.gold.perSecond += 2;
    },
  },
  {
    id: "gold-automine-2",
    name: "Midas Machine",
    description: "+5 gold/sec",
    category: "gold",
    basePrice: 400000,
    price: 400000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.gold.perSecond += 5;
    },
  },
  {
    id: "gold-automine-3",
    name: "Bank Vault",
    description: "+10 gold/sec",
    category: "gold",
    basePrice: 1500000,
    price: 1500000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.gold.perSecond += 10;
    },
  },
  {
    id: "gold-automine-4",
    name: "Federal Reserve",
    description: "+20 gold/sec",
    category: "gold",
    basePrice: 6000000,
    price: 6000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.gold.perSecond += 20;
    },
  },
  {
    id: "gold-automine-5",
    name: "Fort Knox Vault",
    description: "+40 gold/sec",
    category: "gold",
    basePrice: 25000000,
    price: 25000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.gold.perSecond += 40;
    },
  },
  {
    id: "gold-autoseller",
    name: "Gold Baron",
    description: "Automatically sells gold every 5s",
    category: "gold",
    basePrice: 2000000,
    price: 2000000,
    scale: 1.15,
    count: 0,
    max: 1,
    apply() {
      /* handled in script.js */
    },
  },

  // ──────────────────────────────────────────────────────────────
  // PALLADIUM
  // ──────────────────────────────────────────────────────────────
  {
    id: "palladium-clicker",
    name: "Catalytic Wrench",
    description: "+1 palladium per click",
    category: "palladium",
    basePrice: 80000,
    price: 80000,
    scale: 1.08,
    count: 0,
    max: 10,
    apply() {
      resources.palladium.perClick += 1;
    },
  },
  {
    id: "palladium-automine-1",
    name: "Catalyst Chamber",
    description: "+2 palladium/sec",
    category: "palladium",
    basePrice: 200000,
    price: 200000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.palladium.perSecond += 2;
    },
  },
  {
    id: "palladium-automine-2",
    name: "Emission Filter",
    description: "+5 palladium/sec",
    category: "palladium",
    basePrice: 800000,
    price: 800000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.palladium.perSecond += 5;
    },
  },
  {
    id: "palladium-automine-3",
    name: "Automotive Plant",
    description: "+10 palladium/sec",
    category: "palladium",
    basePrice: 3000000,
    price: 3000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.palladium.perSecond += 10;
    },
  },
  {
    id: "palladium-automine-4",
    name: "Fuel Cell Factory",
    description: "+20 palladium/sec",
    category: "palladium",
    basePrice: 12000000,
    price: 12000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.palladium.perSecond += 20;
    },
  },
  {
    id: "palladium-automine-5",
    name: "Hydrogen Reactor",
    description: "+40 palladium/sec",
    category: "palladium",
    basePrice: 50000000,
    price: 50000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.palladium.perSecond += 40;
    },
  },
  {
    id: "palladium-autoseller",
    name: "Tech Distributor",
    description: "Automatically sells palladium every 5s",
    category: "palladium",
    basePrice: 5000000,
    price: 5000000,
    scale: 1.15,
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
    name: "Prestige Blade",
    description: "+1 platinum per click",
    category: "platinum",
    basePrice: 150000,
    price: 150000,
    scale: 1.08,
    count: 0,
    max: 10,
    apply() {
      resources.platinum.perClick += 1;
    },
  },
  {
    id: "platinum-automine-1",
    name: "Jewelry Bench",
    description: "+2 platinum/sec",
    category: "platinum",
    basePrice: 500000,
    price: 500000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.platinum.perSecond += 2;
    },
  },
  {
    id: "platinum-automine-2",
    name: "Elite Refinery",
    description: "+5 platinum/sec",
    category: "platinum",
    basePrice: 2000000,
    price: 2000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.platinum.perSecond += 5;
    },
  },
  {
    id: "platinum-automine-3",
    name: "Credit Card Plant",
    description: "+10 platinum/sec",
    category: "platinum",
    basePrice: 8000000,
    price: 8000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.platinum.perSecond += 10;
    },
  },
  {
    id: "platinum-automine-4",
    name: "VIP Lounge",
    description: "+20 platinum/sec",
    category: "platinum",
    basePrice: 30000000,
    price: 30000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.platinum.perSecond += 20;
    },
  },
  {
    id: "platinum-automine-5",
    name: "Diamond Exchange",
    description: "+40 platinum/sec",
    category: "platinum",
    basePrice: 120000000,
    price: 120000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.platinum.perSecond += 40;
    },
  },
  {
    id: "platinum-autoseller",
    name: "Elite Auctioneer",
    description: "Automatically sells platinum every 5s",
    category: "platinum",
    basePrice: 10000000,
    price: 10000000,
    scale: 1.15,
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
    id: "titanium-clicker",
    name: "Aerospace Ripper",
    description: "+1 titanium per click",
    category: "titanium",
    basePrice: 300000,
    price: 300000,
    scale: 1.08,
    count: 0,
    max: 10,
    apply() {
      resources.titanium.perClick += 1;
    },
  },
  {
    id: "titanium-automine-1",
    name: "Jet Engine Mill",
    description: "+2 titanium/sec",
    category: "titanium",
    basePrice: 1000000,
    price: 1000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.titanium.perSecond += 2;
    },
  },
  {
    id: "titanium-automine-2",
    name: "Spacecraft Forge",
    description: "+5 titanium/sec",
    category: "titanium",
    basePrice: 4000000,
    price: 4000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.titanium.perSecond += 5;
    },
  },
  {
    id: "titanium-automine-3",
    name: "Orbital Shipyard",
    description: "+10 titanium/sec",
    category: "titanium",
    basePrice: 15000000,
    price: 15000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.titanium.perSecond += 10;
    },
  },
  {
    id: "titanium-automine-4",
    name: "Space Station",
    description: "+20 titanium/sec",
    category: "titanium",
    basePrice: 60000000,
    price: 60000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.titanium.perSecond += 20;
    },
  },
  {
    id: "titanium-automine-5",
    name: "Galactic Armada",
    description: "+40 titanium/sec",
    category: "titanium",
    basePrice: 250000000,
    price: 250000000,
    scale: 1.15,
    count: 0,
    max: 26,
    apply() {
      resources.titanium.perSecond += 40;
    },
  },
  {
    id: "titanium-autoseller",
    name: "Space Contractor",
    description: "Automatically sells titanium every 5s",
    category: "titanium",
    basePrice: 50000000,
    price: 50000000,
    scale: 1.15,
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
    id: "adamantium-clicker",
    name: "Mythril Claw",
    description: "+1 adamantium per click",
    category: "adamantium",
    basePrice: 600000,
    price: 600000,
    scale: 1.08,
    count: 0,
    max: 10,
    apply() {
      resources.adamantium.perClick += 1;
    },
  },
  {
    id: "adamantium-automine-1",
    name: "Dragon's Breath Forge",
    description: "+2 adamantium/sec",
    category: "adamantium",
    basePrice: 2000000,
    price: 2000000,
    scale: 1.15,
    count: 0,
    max: 16,
    apply() {
      resources.adamantium.perSecond += 2;
    },
  },
  {
    id: "adamantium-automine-2",
    name: "Void Crystal Harvester",
    description: "+5 adamantium/sec",
    category: "adamantium",
    basePrice: 8000000,
    price: 8000000,
    scale: 1.15,
    count: 0,
    max: 16,
    apply() {
      resources.adamantium.perSecond += 5;
    },
  },
  {
    id: "adamantium-automine-3",
    name: "Arcane Synthesis Lab",
    description: "+10 adamantium/sec",
    category: "adamantium",
    basePrice: 30000000,
    price: 30000000,
    scale: 1.15,
    count: 0,
    max: 16,
    apply() {
      resources.adamantium.perSecond += 10;
    },
  },
  {
    id: "adamantium-automine-4",
    name: "Celestial Foundry",
    description: "+20 adamantium/sec",
    category: "adamantium",
    basePrice: 120000000,
    price: 120000000,
    scale: 1.15,
    count: 0,
    max: 16,
    apply() {
      resources.adamantium.perSecond += 20;
    },
  },
  {
    id: "adamantium-automine-5",
    name: "Ethereal Nexus",
    description: "+40 adamantium/sec",
    category: "adamantium",
    basePrice: 500000000,
    price: 500000000,
    scale: 1.15,
    count: 0,
    max: 16,
    apply() {
      resources.adamantium.perSecond += 40;
    },
  },
  {
    id: "adamantium-autoseller",
    name: "Deity's Emissary",
    description: "Automatically sells adamantium every 5s",
    category: "adamantium",
    basePrice: 100000000,
    price: 100000000,
    scale: 1.15,
    count: 0,
    max: 1,
    apply() {
      /* handled in script.js */
    },
  },
];
