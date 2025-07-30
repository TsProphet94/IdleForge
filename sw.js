// Service Worker for PWA functionality (Optimized)
// Cache name will be set dynamically when the SW receives the version
let CACHE_NAME = "idleforge-v0.1.34"; // Updated to match version.txt
const CACHE_PREFIX = "idleforge-";

const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  // CSS Modules
  "./styles/base.css",
  "./styles/themes.css",
  "./styles/layout.css",
  "./styles/components.css",
  "./styles/interactions.css",
  "./styles/responsive.css",
  // Core JavaScript
  "./script.js",
  // Configuration & Data
  "./manifest.json",
  "./version.txt",
  "./changelog.txt",
  // PWA Icons
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
  "./icons/apple-touch-icon.png",
  // Main UI Assets
  "./images/main/main-logo.png",
  "./images/main/main-menu-background.png",
  "./images/main/pickaxe.png",
  // Resource Images - Optimized grouping
  ...generateResourceImagePaths(),
  // JavaScript Modules
  ...generateResourceJSPaths(),
  // Shop System
  "./shop/items.js",
];

// Helper functions to reduce repetitive arrays
function generateResourceImagePaths() {
  const resources = [
    "iron",
    "copper",
    "nickel",
    "bronze",
    "silver",
    "cobalt",
    "gold",
    "palladium",
    "platinum",
    "titanium",
    "adamantium",
  ];
  const paths = [];
  resources.forEach((res) => {
    // Icon and background for each resource
    paths.push(
      `./images/${res}/${getResourceIconName(res)}.png`,
      `./images/${res}/${res}-background.png`
    );
  });
  return paths;
}

function generateResourceJSPaths() {
  const resources = [
    "iron",
    "copper",
    "nickel",
    "bronze",
    "silver",
    "cobalt",
    "gold",
    "palladium",
    "platinum",
    "titanium",
    "adamantium",
  ];
  return resources.map((res) => `./resources/${res}.js`);
}

// Resource icon name mapping for correct file references
function getResourceIconName(resource) {
  const iconMap = {
    iron: "fe",
    copper: "cu",
    nickel: "Ni",
    bronze: "bronze",
    silver: "Ag",
    cobalt: "Co",
    gold: "Au",
    palladium: "Pd",
    platinum: "Pt",
    titanium: "Ti",
    adamantium: "Ad",
  };
  return iconMap[resource] || resource;
}

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("SW: Installing new version");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("SW: Opened cache", CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("SW: Files cached successfully");
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener("activate", (event) => {
  console.log("SW: Activating new version");
  event.waitUntil(
    cleanupOldCaches()
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
      .then(() => {
        // Notify all clients that update is complete
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "UPDATE_APPLIED" });
          });
        });
      })
  );
});

// Listen for messages from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (event.data && event.data.type === "SET_VERSION") {
    // Update cache name with current version
    CACHE_NAME =
      CACHE_PREFIX + event.data.version.replace(/\s+/g, "-").toLowerCase();
    console.log("SW: Cache name updated to:", CACHE_NAME);
  }
});

// Function to clean up old caches (all versions except current)
function cleanupOldCaches() {
  return caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME) {
          console.log("SW: Deleting old cache:", cacheName);
          return caches.delete(cacheName);
        }
      })
    );
  });
}
