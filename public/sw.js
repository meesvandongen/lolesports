// Keeps the app usable offline: hashed build assets are served from the cache;
// the app shell and lolesports API data are fetched from the network, with the
// last copy as a fallback.
const cacheName = "lolesports-v2";
const apiOrigin = "https://esports-api.lolesports.com";
// Every route is the same single-page app shell.
const shellUrl = "/index.html";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      // Also drops older caches, like the previous (Next.js) service worker's.
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (url.origin === apiOrigin) {
    event.respondWith(networkFirst(request));
  } else if (url.origin !== self.location.origin) {
    return;
  } else if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, shellUrl));
  } else if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

/** The network's response, or the cached copy (stored under `cacheKey`). */
async function networkFirst(request, cacheKey = request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(cacheKey, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(cacheKey);
    if (cached) {
      return cached;
    }
    throw error;
  }
}
