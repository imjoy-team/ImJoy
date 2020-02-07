/**
 * Contains the routines loaded by the plugin Worker under web-browser.
 *
 * Initializes the web environment version of the platform-dependent
 * connection object for the plugin site
 */

/*global importScripts*/
self.application = {};
self.connection = {};

(function() {
  /**
   * Event lisener for the plugin message
   */
  self.addEventListener("message", function(e) {
    var m = e.data && e.data.data;
    switch (m && m.type) {
      case "import":
      case "importJailed": // already jailed in the iframe
        importScript(m.url);
        break;
      case "execute":
        execute(m.code);
        break;
      case "message":
        conn._messageHandler(m.data);
        break;
    }
  });

  /**
   * Loads and executes the JavaScript file with the given url
   *
   * @param {String} url to load
   */
  var importScript = function(url) {
    var error = null;

    // importScripts does not throw an exception in old webkits
    // (Opera 15.0), but we can determine a failure by the
    // returned value which must be undefined in case of success
    var returned = true;
    try {
      returned = importScripts(url);
    } catch (e) {
      error = e;
      console.error("error occured when loading " + url, e);
    }

    if (error || typeof returned != "undefined") {
      self.postMessage({
        type: "importFailure",
        url: url,
        error: error.stack || String(error),
      });
      if (error) {
        throw error;
      }
    } else {
      self.postMessage({ type: "importSuccess", url: url });
    }
  };

  /**
   * Executes the given code in a jailed environment. For web
   * implementation, we're already jailed in the iframe and the
   * worker, so simply eval()
   *
   * @param {String} code code to execute
   */
  var execute = function(code) {
    try {
      if (code.type == "requirements") {
        try {
          if (
            code.requirements &&
            (Array.isArray(code.requirements) ||
              typeof code.requirements === "string")
          ) {
            try {
              if (!Array.isArray(code.requirements)) {
                code.requirements = [code.requirements];
              }
              for (var i = 0; i < code.requirements.length; i++) {
                if (
                  code.requirements[i].toLowerCase().endsWith(".css") ||
                  code.requirements[i].startsWith("css:")
                ) {
                  throw "unable to import css in a webworker";
                } else if (
                  code.requirements[i].toLowerCase().endsWith(".js") ||
                  code.requirements[i].startsWith("js:")
                ) {
                  if (code.requirements[i].startsWith("js:")) {
                    code.requirements[i] = code.requirements[i].slice(3);
                  }
                  importScripts(code.requirements[i]);
                } else if (code.requirements[i].startsWith("http")) {
                  importScripts(code.requirements[i]);
                } else if (code.requirements[i].startsWith("cache:")) {
                  //ignore cache
                } else {
                  console.log(
                    "Unprocessed requirements url: " + code.requirements[i]
                  );
                }
              }
            } catch (e) {
              throw "failed to import required scripts: " +
                code.requirements.toString();
            }
          }
        } catch (e) {
          throw e;
        }
      } else if (code.type == "script") {
        try {
          if (
            code.requirements &&
            (Array.isArray(code.requirements) ||
              typeof code.requirements === "string")
          ) {
            try {
              if (Array.isArray(code.requirements)) {
                for (let i = 0; i < code.requirements.length; i++) {
                  importScripts(code.requirements[i]);
                }
              } else {
                importScripts(code.requirements);
              }
            } catch (e) {
              throw "failed to import required scripts: " +
                code.requirements.toString();
            }
          }
          eval(code.content);
        } catch (e) {
          console.error(e.message, e.stack);
          throw e;
        }
      } else {
        throw "unsupported code type.";
      }
      self.postMessage({ type: "executeSuccess" });
    } catch (e) {
      console.error("failed to execute scripts: ", code, e);
      self.postMessage({ type: "executeFailure", error: e.stack || String(e) });
    }
  };

  /**
   * Connection object provided to the JailedSite constructor,
   * plugin site implementation for the web-based environment.
   * Global will be then cleared to prevent exposure into the
   * Worker, so we put this local connection object into a closure
   */
  var conn = {
    disconnect: function() {
      self.close();
    },
    send: function(data, transferables) {
      data.__transferables__ = transferables;
      self.postMessage({ type: "message", data: data }, transferables);
    },
    onMessage: function(h) {
      conn._messageHandler = h;
    },
    _messageHandler: function() {},
    onDisconnect: function() {},
  };

  self.connection = conn;
})();
