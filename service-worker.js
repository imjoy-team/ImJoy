importScripts("/precache-manifest.2db5c06fcc86b6d14da848dbe9cbca30.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

/* eslint-disable */

if (workbox) {
  console.log(`Workbox is loaded`);
  /**
   * The workboxSW.precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */

  workbox.setConfig({
    debug: false,
  });

  const removeQuery = {
    cacheKeyWillBeUsed: ({ request }) => {
      return request.url.split("?")[0];
    },
  };

  workbox.core.setCacheNameDetails({ prefix: "imjoy" });
  self.__precacheManifest = self.__precacheManifest || [];

  workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

  workbox.routing.registerRoute(
    new RegExp("/static/.*"),
    new workbox.strategies.StaleWhileRevalidate()
  );

  workbox.routing.registerRoute(
    new RegExp("/docs/.*"),
    new workbox.strategies.StaleWhileRevalidate()
  );

  workbox.routing.registerRoute(
    new RegExp("/.*\\.(html|css|js)"),
    new workbox.strategies.StaleWhileRevalidate()
  );

  workbox.routing.registerRoute(
    new RegExp("(http|https)://lib.imjoy.io/.*"),
    new workbox.strategies.StaleWhileRevalidate()
  );

  //communitations
  workbox.routing.registerRoute(
    new RegExp("(http|https)://.*/socket.io/.*"),
    new workbox.strategies.NetworkOnly()
  );

  workbox.routing.registerRoute(
    new RegExp("https://static.imjoy.io/.*"),
    new workbox.strategies.StaleWhileRevalidate()
  );

  workbox.routing.registerRoute(
    new RegExp("https://imjoy-team.github.io/.*"),
    new workbox.strategies.NetworkFirst({ plugins: [removeQuery] })
  );

  workbox.routing.registerRoute(
    new RegExp("https://github.com/imjoy-team/.*/badge.svg"),
    new workbox.strategies.StaleWhileRevalidate()
  );

  // manifest.imjoy.json etc.
  workbox.routing.registerRoute(
    new RegExp("https://raw.githubusercontent.com/.*"),
    new workbox.strategies.NetworkFirst({ plugins: [removeQuery] })
  );

  workbox.routing.registerRoute(
    new RegExp("https://gist.githubusercontent.com/.*"),
    new workbox.strategies.NetworkFirst({ plugins: [removeQuery] })
  );

  // badges
  workbox.routing.registerRoute(
    new RegExp("https://img.shields.io/.*"),
    new workbox.strategies.StaleWhileRevalidate()
  );

  workbox.routing.registerRoute(
    new RegExp("https://github.com/imjoy-team/ImJoy/.*"),
    new workbox.strategies.NetworkFirst({ plugins: [removeQuery] })
  );

  workbox.routing.registerRoute(
    new RegExp("https://zenodo.org/badge/.*"),
    new workbox.strategies.StaleWhileRevalidate()
  );

  var cached_keys = new Set();
  function matchCb(request) {
    return cached_keys.has(request.url.href.split("?")[0]);
  }

  workbox.routing.registerRoute(
    matchCb,
    new workbox.strategies.StaleWhileRevalidate({ plugins: [removeQuery] })
  );

  caches.open(workbox.core.cacheNames.runtime).then(function(cache) {
    cache.keys().then(function(requests) {
      var urls = requests.map(function(request) {
        return request.url.split("?")[0];
      });
      cached_keys = new Set(urls);
      console.log("cached requirements:", cached_keys);
    });
  });

  self.addEventListener("message", function(event) {
    if (event.data.action == "skipWaiting") self.skipWaiting();
    if (event.data && event.data.command) {
      // Use the Cache Storage API directly,
      // and add to the default runtime cache:
      var resolve = function(result) {
        event.ports[0].postMessage({ result: result });
      };
      var reject = function(error) {
        event.ports[0].postMessage({ error: error });
      };

      caches.open(workbox.core.cacheNames.runtime).then(function(cache) {
        switch (event.data.command) {
          // This command returns a list of the URLs corresponding to the Request objects
          // that serve as keys for the current cache.
          case "keys":
            cache.keys().then(function(requests) {
              var urls = requests.map(function(request) {
                return request.url;
              });
              resolve(urls.sort());
            });
            break;
          // This command adds a new request/response pair to the cache.
          case "add":
            // If event.data.url isn't a valid URL, new Request() will throw a TypeError which will be handled
            // by the outer .catch().

            // do not cache localhost requests
            var hostname = new URL(event.data.url).hostname;
            if (
              !hostname ||
              hostname === "localhost" ||
              hostname === "127.0.0.1"
            ) {
              console.log("Skip caching local file " + event.data.url);
              resolve();
              return;
            }

            var request = new Request(event.data.url);
            fetch(request)
              .then(function(response) {
                const normalized_url = event.data.url.split("?")[0];
                cached_keys.add(normalized_url);
                console.log("Caching requirement: " + event.data.url);
                cache
                  .put(normalized_url, response)
                  .then(resolve)
                  .catch(reject);
              })
              .catch(function(e) {
                console.error("Failed to cache requirement: " + event.data.url);
                reject(e);
              });
            break;
          // This command removes a request/response pair from the cache (assuming it exists).
          case "delete":
            cached_keys.delete(event.data.url.split("?")[0]);
            cache.delete(event.data.url.split("?")[0]).then(function(success) {
              if (success) {
                resolve();
              } else {
                reject("Item was not found in the cache.");
              }
            });
            break;
          case "clear":
            caches.keys().then(function(keyList) {
              Promise.all(
                keyList.map(function(key) {
                  return caches.delete(key);
                })
              )
                .then(resolve)
                .catch(reject);
            });
            break;
          default:
            // This will be handled by the outer .catch().
            reject(new Error("Unknown command: " + event.data.command));
        }
      });
    }
  });
} else {
  console.log(`Workbox didn't load`);
}

