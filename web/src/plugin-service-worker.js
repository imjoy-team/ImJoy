/* eslint-disable */

if (typeof workbox !== "undefined") {
  console.log(`Workbox is loaded (plugin service worker)`);
  /**
   * The workboxSW.precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */

  // workbox.setConfig({
  //   debug: true,
  // });

  workbox.core.setCacheNameDetails({ prefix: "lib.imjoy.io" });
  self.__precacheManifest = self.__precacheManifest || [];

  workbox.precaching.suppressWarnings();
  workbox.precaching.precacheAndRoute(self.__precacheManifest, {
    // Ignore all URL parameters.
    ignoreUrlParametersMatching: [/.*/],
    ignoreURLParametersMatching: [/.*/],
  });

  workbox.routing.registerRoute(
    new RegExp("/static/.*"),
    new workbox.strategies.StaleWhileRevalidate()
  );

  workbox.routing.registerRoute(
    new RegExp("https://static.imjoy.io/.*"),
    new workbox.strategies.StaleWhileRevalidate()
  );

  let plugin_requirements = new Set();
  const matchCb = ({ url, event }) => {
    return plugin_requirements.has(url.href);
  };

  workbox.routing.registerRoute(
    matchCb,
    new workbox.strategies.StaleWhileRevalidate()
  );

  caches.open(workbox.core.cacheNames.runtime).then(cache => {
    cache.keys().then(function(requests) {
      const urls = requests.map(function(request) {
        return request.url;
      });
      plugin_requirements = new Set(urls);
      console.log("cached requirements:", plugin_requirements);
    });
  });

  var reg_match_url = /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/;
  function parseURL(href) {
    var match = href.match(reg_match_url);
    return (
      (match && {
        href: href,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7],
      }) ||
      {}
    );
  }

  self.addEventListener("message", event => {
    if (event.data.action == "skipWaiting") self.skipWaiting();
    if (event.data && event.data.command) {
      // Use the Cache Storage API directly,
      // and add to the default runtime cache:
      caches.open(workbox.core.cacheNames.runtime).then(cache => {
        switch (event.data.command) {
          // This command returns a list of the URLs corresponding to the Request objects
          // that serve as keys for the current cache.
          case "keys":
            return cache
              .keys()
              .then(function(requests) {
                var urls = requests.map(function(request) {
                  return request.url;
                });

                return urls.sort();
              })
              .then(function(urls) {
                // event.ports[0] corresponds to the MessagePort that was transferred as part of the controlled page's
                // call to controller.postMessage(). Therefore, event.ports[0].postMessage() will trigger the onmessage
                // handler from the controlled page.
                // It's up to you how to structure the messages that you send back; this is just one example.
                event.ports[0].postMessage({
                  error: null,
                  urls: urls,
                });
              });

          // This command adds a new request/response pair to the cache.
          case "add":
            // If event.data.url isn't a valid URL, new Request() will throw a TypeError which will be handled
            // by the outer .catch().

            // do not cache localhost requests
            const hostname = parseURL(event.data.url).hostname;
            if (
              !hostname ||
              hostname === "localhost" ||
              hostname === "127.0.0.1"
            )
              return;

            var request = new Request(event.data.url);
            return fetch(request)
              .then(function(response) {
                plugin_requirements.add(event.data.url);
                // console.log("Caching requirement: " + event.data.url);
                return cache.put(event.data.url, response);
              })
              .then(function() {
                event.ports[0].postMessage({
                  error: null,
                });
              });

          // This command removes a request/response pair from the cache (assuming it exists).
          case "delete":
            plugin_requirements.delete(event.data.url);
            return cache.delete(event.data.url).then(function(success) {
              event.ports[0].postMessage({
                error: success ? null : "Item was not found in the cache.",
              });
            });

          default:
            // This will be handled by the outer .catch().
            throw Error("Unknown command: " + event.data.command);
        }
      });
    }
  });
} else {
  console.log(`Workbox didn't load (plugin service worker)`);
}
