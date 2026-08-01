// This service worker makes BreakClock work with no internet connection,
// after it has been opened at least once with internet/WiFi.
// Every file the app loads gets saved automatically; if there's no
// connection next time, it's served from that saved copy instead.

const CACHE_NAME = "breakclock-cache-v1";

self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return fetch(event.request)
        .then(function (response) {
          // Online: save a fresh copy for later offline use
          cache.put(event.request, response.clone());
          return response;
        })
        .catch(function () {
          // Offline: fall back to the last saved copy
          return cache.match(event.request);
        });
    })
  );
});
