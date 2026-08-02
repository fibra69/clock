// This service worker makes BreakClock work with no internet connection,
// as long as it has been opened ONCE with internet/WiFi so it can
// download and store its own files. After that first visit, every
// file the app needs is already saved, and it will keep working even
// if the device NEVER connects to the internet again.

const CACHE_NAME = "breakclock-cache-v2";

// Everything the app needs to run, listed up front so it's all saved
// immediately on install (not only the pages someone happens to visit).
const APP_SHELL = [
  "./",
  "index.html",
  "employee.html",
  "manager.html",
  "style.css",
  "app.js",
  "employee.js",
  "employees.js",
  "manager.js",
  "manifest.json",
  "icons/favicon-32.png",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // addAll fails all-or-nothing if one file 404s, so add what we
      // can individually instead of risking install failing silently.
      return Promise.all(
        APP_SHELL.map(function (url) {
          return cache.add(url).catch(function (err) {
            console.warn("BreakClock: couldn't precache", url, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (name) {
            return name !== CACHE_NAME;
          })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      // Cache-first: instant + reliable offline, since the app shell
      // rarely changes. Still refreshes the cache in the background
      // whenever there IS a connection, so updates aren't missed.
      const networkFetch = fetch(event.request)
        .then(function (response) {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        })
        .catch(function () {
          return cached;
        });

      return cached || networkFetch;
    })
  );
});
