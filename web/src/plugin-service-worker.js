/* eslint-disable */

if (workbox) {
  console.log(`Workbox is loaded`);
  /**
   * The workboxSW.precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */

  // workbox.setConfig({
  //   debug: true
  // });

  workbox.core.setCacheNameDetails({ prefix: "lib.imjoy.io" });
  self.__precacheManifest = self.__precacheManifest || [];

  workbox.precaching.suppressWarnings();
  workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

  workbox.routing.registerRoute(
    new RegExp("/static/.*"),
    new workbox.strategies.NetworkFirst()
  );

  //communitations
  workbox.routing.registerRoute(
    new RegExp("(http|https)://.*/socket.io/.*"),
    new workbox.strategies.NetworkOnly()
  );

  workbox.routing.registerRoute(
    new RegExp("https://static.imjoy.io/.*"),
    new workbox.strategies.NetworkFirst()
  );

  // manifest.imjoy.json etc.
  workbox.routing.registerRoute(
    new RegExp("https://raw.githubusercontent.com/.*"),
    new workbox.strategies.NetworkFirst()
  );

  workbox.routing.registerRoute(
    new RegExp("https://gist.githubusercontent.com/.*"),
    new workbox.strategies.NetworkFirst()
  );

  workbox.routing.setDefaultHandler(new workbox.strategies.NetworkOnly());

  self.addEventListener("message", event => {
    if (event.data.action == "skipWaiting") self.skipWaiting();
    if (event.data && event.data.action === 'add_cache') {
      // Use the Cache Storage API directly,
      // and add to the default runtime cache:
      caches.open(workbox.core.cacheNames.runtime)
        .then(cache => cache.add(event.data.url));
    }
  });

  self.addEventListener("install", function(event) {
    self.skipWaiting();
  });
} else {
  console.log(`Workbox didn't load`);
}
