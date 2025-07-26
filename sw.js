// Service Worker for PWA functionality
const CACHE_NAME = "idleforge-v1.0.0";
const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
  "./icons/apple-touch-icon.png",
  "./images/main/main-logo.png",
  "./images/main/main-menu-background.png",
  "./images/main/pickaxe.png",
  // Resource images
  "./images/iron/fe.png",
  "./images/iron/iron-background.png",
  "./images/copper/cu.png",
  "./images/copper/copper-background.png",
  "./images/nickel/nickel-background.png",
  "./images/bronze/bronze.png",
  "./images/bronze/bronze-background.png",
  "./images/silver/Ag.png",
  "./images/silver/silver-background.png",
  "./images/cobalt/cobalt-background.png",
  "./images/gold/Au.png",
  "./images/gold/gold-background.png",
  "./images/palladium/palladium-background.png",
  "./images/platinum/Pt.png",
  "./images/platinum/platinum-background.png",
  "./images/titanium/Ti.png",
  "./images/titanium/titanium-background.png",
  "./images/adamantium/Ad.png",
  "./images/adamantium/adamantium-background.png",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
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

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
