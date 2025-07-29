// Service Worker for PWA functionality
// Cache name will be set dynamically when the SW receives the version
let CACHE_NAME = "idleforge-v0.1.30"; // Default fallback
const CACHE_PREFIX = "idleforge-";

const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./styles/base.css",
  "./styles/themes.css",
  "./styles/layout.css",
  "./styles/components.css",
  "./styles/interactions.css",
  "./styles/responsive.css",
  "./script.js",
  "./manifest.json",
  "./version.txt",
  "./changelog.txt",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
  "./icons/apple-touch-icon.png",
  "./images/main/main-logo.png",
  "./images/main/main-menu-background.png",
  "./images/main/pickaxe.png",
  // Resource images - Icons and Backgrounds
  "./images/iron/fe.png",
  "./images/iron/iron-background.png",
  "./images/copper/cu.png",
  "./images/copper/copper-background.png",
  "./images/nickel/Ni.png",
  "./images/nickel/nickel-background.png",
  "./images/bronze/bronze.png",
  "./images/bronze/bronze-background.png",
  "./images/silver/Ag.png",
  "./images/silver/silver-background.png",
  "./images/cobalt/Co.png",
  "./images/cobalt/cobalt-background.png",
  "./images/gold/Au.png",
  "./images/gold/gold-background.png",
  "./images/palladium/Pd.png",
  "./images/palladium/palladium-background.png",
  "./images/platinum/Pt.png",
  "./images/platinum/platinum-background.png",
  "./images/titanium/Ti.png",
  "./images/titanium/titanium-background.png",
  "./images/adamantium/Ad.png",
  "./images/adamantium/adamantium-background.png",
  // Resource JavaScript modules
  "./resources/iron.js",
  "./resources/copper.js",
  "./resources/nickel.js",
  "./resources/bronze.js",
  "./resources/silver.js",
  "./resources/cobalt.js",
  "./resources/gold.js",
  "./resources/palladium.js",
  "./resources/platinum.js",
  "./resources/titanium.js",
  "./resources/adamantium.js",
  // Shop system
  "./shop/items.js",
];

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
