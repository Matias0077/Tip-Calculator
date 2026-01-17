const CACHE_NAME = "tip-calculator-v1";

const FILES_TO_CACHE = [
  "/Tip-Calculator/",
  "/Tip-Calculator/index.html",
  "/Tip-Calculator/manifest.json",
  "/Tip-Calculator/css/styles.css",
  "/Tip-Calculator/js/app.js",
  "/Tip-Calculator/icons/icon-192.png",
  "/Tip-Calculator/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
