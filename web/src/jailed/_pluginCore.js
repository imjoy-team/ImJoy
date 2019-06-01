/* eslint-disable */
/**
 * Core plugin script loaded into the plugin process/thread.
 *
 * Initializes the plugin-site API global methods.
 */

/*global JailedSite connection*/
/*eslint no-global-assign: "off"*/
(function() {
  // localize
  var site = new JailedSite(connection, "__plugin__", "javascript");
  JailedSite = null;
  connection = null;

  site.onGetInterface(function() {
    launchConnected();
  });

  site.onRemoteUpdate(function() {
    application.remote = site.getRemote();
    api = application.remote || {};
    if (api.export) {
      console.error("WARNING: overwriting function 'export'.");
    }
    if (api.onload) {
      console.error("WARNING: overwriting function 'onload'.");
    }
    if (api.dispose) {
      console.error("WARNING: overwriting function 'dispose'.");
    }
    api.export = application.setInterface;
    api.onLoad = application.whenConnected;
    api.dispose = application.disconnect;
  });

  /**
   * Simplified clone of Whenable instance (the object can not be
   * placed into a shared script, because the main library needs it
   * before the additional scripts may load)
   */
  var connected = false;
  var connectedHandlers = [];

  var launchConnected = function() {
    if (!connected) {
      connected = true;

      var handler;
      while ((handler = connectedHandlers.pop())) {
        handler();
      }
    }
  };

  var checkHandler = function(handler) {
    var type = typeof handler;
    if (type != "function") {
      var msg =
        "A function may only be subsribed to the event, " +
        type +
        " was provided instead";
      throw new Error(msg);
    }

    return handler;
  };

  /**
   * Sets a function executed after the connection to the
   * application is estaplished, and the initial interface-exchange
   * messaging is completed
   *
   * @param {Function} handler to be called upon initialization
   */
  application.whenConnected = function(handler) {
    handler = checkHandler(handler);
    if (connected) {
      handler();
    } else {
      connectedHandlers.push(handler);
    }
  };

  /**
   * Sets the plugin interface available to the application
   *
   * @param {Object} _interface to set
   */
  application.setInterface = function(_interface) {
    site.setInterface(_interface);
  };

  /**
   * Disconnects the plugin from the application (sending
   * notification message) and destroys itself
   */
  application.disconnect = function(_interface) {
    site.disconnect();
  };
})();
