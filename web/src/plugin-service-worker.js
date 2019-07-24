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
    if (event.data && event.data.command) {
      // Use the Cache Storage API directly,
      // and add to the default runtime cache:
      caches.open(workbox.core.cacheNames.runtime)
        .then(cache => {
          switch (event.data.command) {
            // This command returns a list of the URLs corresponding to the Request objects
            // that serve as keys for the current cache.
            case 'keys':
              return cache.keys().then(function(requests) {
                var urls = requests.map(function(request) {
                  return request.url;
                });
      
                return urls.sort();
              }).then(function(urls) {
                // event.ports[0] corresponds to the MessagePort that was transferred as part of the controlled page's
                // call to controller.postMessage(). Therefore, event.ports[0].postMessage() will trigger the onmessage
                // handler from the controlled page.
                // It's up to you how to structure the messages that you send back; this is just one example.
                event.ports[0].postMessage({
                  error: null,
                  urls: urls
                });
              });
      
            // This command adds a new request/response pair to the cache.
            case 'add':
              // If event.data.url isn't a valid URL, new Request() will throw a TypeError which will be handled
              // by the outer .catch().
              // Hardcode {mode: 'no-cors} since the default for new Requests constructed from strings is to require
              // CORS, and we don't have any way of knowing whether an arbitrary URL that a user entered supports CORS.
              var request = new Request(event.data.url, {mode: 'no-cors'});
              return fetch(request).then(function(response) {
                return cache.put(event.data.url, response);
              }).then(function() {
                event.ports[0].postMessage({
                  error: null
                });
              });
      
            // This command removes a request/response pair from the cache (assuming it exists).
            case 'delete':
              return cache.delete(event.data.url).then(function(success) {
                event.ports[0].postMessage({
                  error: success ? null : 'Item was not found in the cache.'
                });
              });
      
            default:
              // This will be handled by the outer .catch().
              throw Error('Unknown command: ' + event.data.command);
          }
        });
    }
  });

  self.addEventListener("install", function(event) {
    self.skipWaiting();
  });
} else {
  console.log(`Workbox didn't load`);
}
