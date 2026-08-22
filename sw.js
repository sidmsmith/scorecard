const CACHE_NAME = "scorecard-cache-v1";
const APP_SHELL_URLS = ["/", "/scorecard", "/scorecard.html", "/scorecard.css", "/lib/scorecard-engine.js", "/manifest.json", "/scorecard-192.png", "/scorecard-512.png"];

async function warmAppShellCache() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    APP_SHELL_URLS.map(async (url) => {
      try {
        const response = await fetch(url, { cache: "no-cache" });
        if (response && response.ok) {
          await cache.put(url, response.clone());
        }
      } catch (error) {
        // Ignore individual cache failures to avoid blocking install.
      }
    })
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(warmAppShellCache());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cachedAppShell =
            (await cache.match("/scorecard.html", { ignoreSearch: true })) ||
            (await cache.match("/scorecard", { ignoreSearch: true })) ||
            (await cache.match("/", { ignoreSearch: true }));

          if (cachedAppShell) {
            return cachedAppShell;
          }
        } catch (error) {
          // Ignore cache read errors and try network.
        }

        try {
          return await fetch(request);
        } catch (error) {
          // Last-chance fallback to avoid browser ERR_FAILED page.
          return new Response(
            "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Scorecard</title></head><body style='font-family:Arial,sans-serif;background:#1a1a2e;color:#eaeaea;padding:24px;'><h2>Scorecard is temporarily unavailable offline.</h2><p>Reconnect once to refresh local cache, then try again.</p></body></html>",
            { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(request);
        const responseClone = networkResponse.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, responseClone))
          .catch(() => {
            // Ignore cache write issues.
          });
        return networkResponse;
      } catch (error) {
        return new Response("", { status: 204 });
      }
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "warm-cache") {
    return;
  }

  event.waitUntil(
    warmAppShellCache().then(() => {
      if (event.source) {
        event.source.postMessage({ type: "cache-warmed", cacheName: CACHE_NAME });
      }
    })
  );
});
