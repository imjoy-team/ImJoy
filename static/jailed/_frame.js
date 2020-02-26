/**
 * Contains the code executed in the sandboxed frame under web-browser
 *
 * Tries to create a Web-Worker inside the frame and set up the
 * communication between the worker and the parent window. Some
 * browsers restrict creating a worker inside a sandboxed iframe - if
 * this happens, the plugin initialized right inside the frame (in the
 * same thread)
 */

var scripts = document.getElementsByTagName("script");
var thisScript = scripts[scripts.length - 1];
var parentNode = thisScript.parentNode;
var asset_url =
  thisScript.src
    .split("?")[0]
    .split("/")
    .slice(0, -1)
    .join("/") + "/";
// var __pyodide__path__ = thisScript.src
//     .split('?')[0]
//     .split('/')
//     .slice(0, -2)
//     .join('/')+'/pyodide/';

var getParamValue = function(paramName) {
  var url = window.location.search.substring(1); //get rid of "?" in querystring
  var qArray = url.split("&"); //get key-value pairs
  for (var i = 0; i < qArray.length; i++) {
    var pArr = qArray[i].split("="); //split key and value
    if (pArr[0] == paramName) return pArr[1]; //return value
  }
};

var plugin_name = getParamValue("name");
var plugin_mode = getParamValue("type");

function _sendToServiceWorker(message) {
  return new Promise(function(resolve, reject) {
    if (!navigator.serviceWorker || !navigator.serviceWorker.register) {
      reject("Service worker is not supported.");
      return;
    }
    var messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function(event) {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message, [
        messageChannel.port2,
      ]);
    } else {
      console.warn(
        "service worker controller is not available, message:",
        message
      );
    }
  });
}

async function cacheRequirements(requirements) {
  if (requirements && requirements.length > 0) {
    for (let req of requirements) {
      //remove prefix
      if (req.startsWith("js:")) req = req.slice(3);
      if (req.startsWith("css:")) req = req.slice(4);
      if (req.startsWith("cache:")) req = req.slice(6);
      if (!req.startsWith("http")) continue;
      await _sendToServiceWorker({
        command: "add",
        url: req,
      });
    }
  }
}

/**
 * Initializes the plugin inside a web worker. May throw an exception
 * in case this was not permitted by the browser.
 */
var initWebworkerPlugin = function() {
  // creating worker as a blob enables import of local files
  var blobCode = [
    ' self.addEventListener("message", function(m){   ',
    '     if (m.data.type == "initImport") {          ',
    "         importScripts(m.data.url);              ",
    "         self.postMessage({                      ",
    '             type : "initialized",               ',
    "             dedicatedThread : true              ",
    "         });                                     ",

    "     }                                           ",
    " });                                             ",
  ].join("\n");

  var blobUrl = window.URL.createObjectURL(new Blob([blobCode]));

  var worker = new Worker(blobUrl, { name: plugin_name || "plugin_webworker" });

  // telling worker to load _pluginWebWorker.js (see blob code above)
  worker.postMessage({
    type: "initImport",
    url: asset_url + "_pluginWebWorker.js",
  });

  // mixed content warning in Chrome silently skips worker
  // initialization without exception, handling this with timeout
  var fallbackTimeout = setTimeout(function() {
    worker.terminate();
    console.warn(
      `Plugin ${plugin_name} failed to start as a web-worker, running in an iframe instead.`
    );
    initIframePlugin();
  }, 2000);

  // forwarding messages between the worker and parent window
  worker.addEventListener("message", function(m) {
    var transferables = undefined;
    if (m.data.type == "initialized") {
      clearTimeout(fallbackTimeout);
    } else if (m.data.type == "disconnect") {
      worker.terminate();
    } else if (m.data.type == "message") {
      if (m.data.data.__transferables__) {
        transferables = m.data.data.__transferables__;
        delete m.data.data.__transferables__;
      }
    }
    parent.postMessage(m.data, "*", transferables);
  });

  window.addEventListener("message", function(m) {
    var transferables = undefined;
    if (m.data.type == "message") {
      if (m.data.data.__transferables__) {
        transferables = m.data.data.__transferables__;
        delete m.data.data.__transferables__;
      }
    }
    worker.postMessage(m.data, transferables);
  });
};

/**
 * Creates plugin right in this iframe
 */
var initWebPythonIframePlugin = function() {
  // loads additional script into the frame
  window.loadScript = function(path, sCb, fCb) {
    var script = document.createElement("script");
    script.src = path;

    var clear = function() {
      script.onload = null;
      script.onerror = null;
      script.onreadystatechange = null;
      script.parentNode.removeChild(script);
      currentErrorHandler = function() {};
    };

    var success = function() {
      clear();
      sCb();
    };

    var failure = function() {
      clear();
      fCb();
    };

    currentErrorHandler = failure;

    script.onerror = failure;
    script.onload = success;
    script.onreadystatechange = function() {
      var state = script.readyState;
      if (state === "loaded" || state === "complete") {
        success();
      }
    };

    parentNode.appendChild(script);
  };

  // handles script loading error
  // (assuming scripts are loaded one by one in the iframe)
  var currentErrorHandler = function() {};
  window.addEventListener("error", function() {
    currentErrorHandler();
  });

  window.loadScript(
    asset_url + "_pluginWebPython.js",
    function() {},
    function() {}
  );
};

/**
 * Creates plugin right in this iframe
 */
var initIframePlugin = function() {
  // loads additional script into the frame
  window.loadScript = function(path, sCb, fCb) {
    var script = document.createElement("script");
    script.src = path;

    var clear = function() {
      script.onload = null;
      script.onerror = null;
      script.onreadystatechange = null;
      script.parentNode.removeChild(script);
      currentErrorHandler = function() {};
    };

    var success = function() {
      clear();
      sCb();
    };

    var failure = function() {
      clear();
      fCb();
    };

    currentErrorHandler = failure;

    script.onerror = failure;
    script.onload = success;
    script.onreadystatechange = function() {
      var state = script.readyState;
      if (state === "loaded" || state === "complete") {
        success();
      }
    };

    parentNode.appendChild(script);
  };

  // handles script loading error
  // (assuming scripts are loaded one by one in the iframe)
  var currentErrorHandler = function() {};
  window.addEventListener("error", function() {
    currentErrorHandler();
  });

  window.loadScript(
    asset_url + "_pluginWebIframe.js",
    function() {},
    function() {}
  );
};

if (plugin_mode === "web-worker") {
  try {
    initWebworkerPlugin();
  } catch (e) {
    // fallback to iframe
    initIframePlugin();
  }
} else if (
  plugin_mode === "web-python" ||
  plugin_mode === "web-python-window"
) {
  initWebPythonIframePlugin();
} else if (plugin_mode === "iframe" || plugin_mode === "window") {
  initIframePlugin();
} else {
  console.error("Unsupported plugin type: " + plugin_mode);
  throw "Unsupported plugin type: " + plugin_mode;
}

// register service worker for offline access
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("/plugin-service-worker.js").then(
      function(registration) {
        // Registration was successful
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope,
          plugin_name
        );
      },
      function(err) {
        // registration failed :(
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}

// event listener for the plugin message
window.addEventListener("message", function(e) {
  var m = e.data && e.data.data;
  if (m && m.type === "execute") {
    const code = m.code;
    if (code.type == "requirements") {
      if (!Array.isArray(code.requirements)) {
        code.requirements = [code.requirements];
      }
      cacheRequirements(code.requirements);
    }
  }
});
