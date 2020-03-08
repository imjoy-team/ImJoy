/**
 * @fileoverview Jailed - safe yet flexible sandbox
 * @version 0.3.1
 *
 * @license MIT, see http://github.com/asvd/jailed
 * Copyright (c) 2014 asvd <heliosframework@gmail.com>
 *
 * Main library script, the only one to be loaded by a developer into
 * the application. Other scrips shipped along will be loaded by the
 * library either here (application site), or into the plugin site
 * (Worker/child process):
 *
 *  _JailedSite.js    loaded into both applicaiton and plugin sites
 *  _frame.html       sandboxed frame (web)
 *  _frame.js         sandboxed frame code (web)
 *  _pluginWebWorker.js  platform-dependent plugin routines (web / worker)
 *  _pluginWebIframe.js  platform-dependent plugin routines (web / iframe)
 *  _pluginNode.js    platform-dependent plugin routines (Node.js)
 *  _pluginCore.js    common plugin site protocol implementation
 */

import { randId, Whenable } from "../utils.js";
import { getBackendByType } from "../api.js";

import DOMPurify from "dompurify";

var JailedConfig = {};

// web
if (
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1" ||
  location.hostname.startsWith("deploy-preview-")
) {
  JailedConfig.asset_url = `${location.protocol}//${location.hostname}${
    location.port ? ":" + location.port : ""
  }/static/jailed/`;
} else {
  JailedConfig.asset_url = "https://lib.imjoy.io/static/jailed/";
}

/**
 * Initializes the library site for web environment (loads
 * _JailedSite.js)
 */
var platform_initialized = false;
var initializeJailed = function(config) {
  return new Promise((resolve, reject) => {
    if (config) {
      for (let k in config) {
        JailedConfig[k] = config[k];
      }
    }
    // normalize asset_url
    if (!JailedConfig.asset_url.endsWith("/")) {
      JailedConfig.asset_url = JailedConfig.asset_url + "/";
    }
    // loads additional script to the application environment
    var script = document.createElement("script");
    script.src = JailedConfig.asset_url + "_JailedSite.js";

    var clear = function() {
      script.onload = null;
      script.onerror = null;
      script.onreadystatechange = null;
      script.parentNode.removeChild(script);
    };

    var success = function() {
      clear();
      platform_initialized = true;
      resolve();
    };

    var fail = function() {
      clear();
      reject("Failed to load JailedSite script for jailed module.");
    };

    script.onerror = fail;
    script.onload = success;
    script.onreadystatechange = function() {
      var state = script.readyState;
      if (state === "loaded" || state === "complete") {
        success();
      }
    };

    document.body.appendChild(script);
  });
};

/**
 * Application-site Connection object constructon, reuses the
 * platform-dependent BasicConnection declared above in order to
 * communicate with the plugin environment, implements the
 * application-site protocol of the interraction: provides some
 * methods for loading scripts and executing the given code in the
 * plugin
 */
var Connection = function(id, type, config) {
  const backend = getBackendByType(type);
  if (backend) {
    this._platformConnection = new BasicConnection(id, type, config);
  } else {
    throw `Unsupported backend type (${type})`;
  }

  this._importCallbacks = {};
  this._executeSCb = function() {};
  this._executeFCb = function() {};
  this._messageHandler = function() {};

  var me = this;
  this.whenInit = function(cb) {
    me._platformConnection.whenInit(cb);
  };

  this.whenFailed = function(cb) {
    me._platformConnection.whenFailed(cb);
  };

  this._platformConnection.onMessage(function(m) {
    switch (m && m.type) {
      case "message":
        me._messageHandler(m.data);
        break;
      case "importSuccess":
        me._handleImportSuccess(m.url);
        break;
      case "importFailure":
        me._handleImportFailure(m.url, m.error);
        break;
      case "executeSuccess":
        me._executeSCb();
        break;
      case "executeFailure":
        me._executeFCb(m.error);
        break;
    }
  });
};

/**
 * @returns {Boolean} true if a connection obtained a dedicated
 * thread (subprocess in Node.js or a subworker in browser) and
 * therefore will not hang up on the infinite loop in the
 * untrusted code
 */
Connection.prototype.hasDedicatedThread = function() {
  return this._platformConnection.dedicatedThread;
};

/**
 * Tells the plugin to load a script with the given path, and to
 * execute it. Callbacks executed upon the corresponding responce
 * message from the plugin site
 *
 * @param {String} path of a script to load
 * @param {Function} sCb to call upon success
 * @param {Function} fCb to call upon failure
 */
Connection.prototype.importScript = function(path, sCb, fCb) {
  var f = function() {};
  this._importCallbacks[path] = { sCb: sCb || f, fCb: fCb || f };
  this._platformConnection.send({ type: "import", url: path });
};

/**
 * Tells the plugin to load a script with the given path, and to
 * execute it in the JAILED environment. Callbacks executed upon
 * the corresponding responce message from the plugin site
 *
 * @param {String} path of a script to load
 * @param {Function} sCb to call upon success
 * @param {Function} fCb to call upon failure
 */
Connection.prototype.importJailedScript = function(path, sCb, fCb) {
  var f = function() {};
  this._importCallbacks[path] = { sCb: sCb || f, fCb: fCb || f };
  this._platformConnection.send({ type: "importJailed", url: path });
};

/**
 * Sends the code to the plugin site in order to have it executed
 * in the JAILED enviroment. Assuming the execution may only be
 * requested once by the Plugin object, which means a single set
 * of callbacks is enough (unlike importing additional scripts)
 *
 * @param {String} code code to execute
 * @param {Function} sCb to call upon success
 * @param {Function} fCb to call upon failure
 */
Connection.prototype.execute = function(code) {
  return new Promise((resolve, reject) => {
    this._executeSCb = resolve;
    this._executeFCb = reject;
    this._platformConnection.send({ type: "execute", code: code });
  });
};

/**
 * Adds a handler for a message received from the plugin site
 *
 * @param {Function} handler to call upon a message
 */
Connection.prototype.onMessage = function(handler) {
  this._messageHandler = handler;
};

/**
 * Adds a handler for a disconnect message received from the
 * plugin site
 *
 * @param {Function} handler to call upon disconnect
 */
Connection.prototype.onDisconnect = function(handler) {
  this._platformConnection.onDisconnect(handler);
};

/**
 * Sends a message to the plugin
 *
 * @param {Object} data of the message to send
 */
Connection.prototype.send = function(data, transferables) {
  this._platformConnection.send(
    {
      type: "message",
      data: data,
    },
    transferables
  );
};

/**
 * Handles import succeeded message from the plugin
 *
 * @param {String} url of a script loaded by the plugin
 */
Connection.prototype._handleImportSuccess = function(url) {
  var sCb = this._importCallbacks[url].sCb;
  this._importCallbacks[url] = null;
  delete this._importCallbacks[url];
  sCb();
};

/**
 * Handles import failure message from the plugin
 *
 * @param {String} url of a script loaded by the plugin
 */
Connection.prototype._handleImportFailure = function(url, error) {
  var fCb = this._importCallbacks[url].fCb;
  this._importCallbacks[url] = null;
  delete this._importCallbacks[url];
  fCb(error);
};

/**
 * Disconnects the plugin when it is not needed anymore
 */
Connection.prototype.disconnect = function() {
  if (this._platformConnection) {
    this._platformConnection.disconnect();
  }
};

/**
 * Platform-dependent implementation of the BasicConnection
 * object, initializes the plugin site and provides the basic
 * messaging-based connection with it
 *
 * For the web-browser environment, the plugin is created as a
 * Worker in a sandbaxed frame
 */
class BasicConnection {
  constructor(id, type, config) {
    this._init = new Whenable();
    this._fail = new Whenable();
    this._disconnected = false;
    this.id = id;
    var iframe_container = config.iframe_container;
    var sample = document.createElement("iframe");
    this._loggingHandler = () => {};
    sample.src = JailedConfig.asset_url + "_frame.html";
    sample.sandbox = "";
    sample.frameBorder = "0";
    sample.style.width = "100%";
    sample.style.height = "100%";
    sample.style.margin = "0";
    sample.style.padding = "0";
    sample.style.display = "none";

    var me = this;

    me._frame = sample.cloneNode(false);
    var perm = [
      "allow-scripts",
      "allow-forms",
      "allow-modals",
      "allow-popups",
      "allow-same-origin",
    ];
    var allows = "";
    if (config.permissions) {
      if (config.permissions.includes("midi") && !allows.includes("midi *;")) {
        allows += "midi *;";
      }
      if (
        config.permissions.includes("geolocation") &&
        !allows.includes("geolocation *;")
      ) {
        allows += "geolocation *;";
      }
      if (
        config.permissions.includes("microphone") &&
        !allows.includes("microphone *;")
      ) {
        allows += "microphone *;";
      }
      if (
        config.permissions.includes("camera") &&
        !allows.includes("camera *;")
      ) {
        allows += "camera *;";
      }
      if (
        config.permissions.includes("encrypted-media") &&
        !allows.includes("encrypted-media *;")
      ) {
        allows += "encrypted-media *;";
      }
      if (config.permissions.includes("full-screen")) {
        me._frame.allowfullscreen = "";
      }
      if (config.permissions.includes("payment-request")) {
        me._frame.allowpaymentrequest = "";
      }
    }
    me._frame.sandbox = perm.join(" ");
    me._frame.allow = allows;
    me._frame.src =
      me._frame.src +
      "?type=" +
      type +
      "&name=" +
      config.name +
      "&workspace=" +
      config.workspace;
    me._frame.id = "iframe_" + id;
    if (type == "iframe" || type == "window" || type == "web-python-window") {
      if (typeof iframe_container == "string") {
        iframe_container = document.getElementById(iframe_container);
      }
      if (iframe_container) {
        me._frame.style.display = "block";
        iframe_container.appendChild(me._frame);
      } else {
        document.body.appendChild(me._frame);
      }
    } else {
      document.body.appendChild(me._frame);
    }
    window.addEventListener("message", function(e) {
      if (e.source === me._frame.contentWindow) {
        if (e.data.type == "initialized") {
          me.dedicatedThread = e.data.dedicatedThread;
          me._init.emit();
        } else {
          me._messageHandler(e.data);
        }
      }
    });
  }

  /**
   * Sets-up the handler to be called upon the BasicConnection
   * initialization is completed.
   *
   * For the web-browser environment, the handler is issued when
   * the plugin worker successfully imported and executed the
   * _pluginWebWorker.js or _pluginWebIframe.js, and replied to
   * the application site with the initImprotSuccess message.
   *
   * @param {Function} handler to be called upon connection init
   */
  whenInit(handler) {
    this._init.whenEmitted(handler);
  }

  /**
   * Sets-up the handler to be called upon the BasicConnection
   * failed.
   *
   * For the web-browser environment, the handler is issued when
   * the plugin worker successfully imported and executed the
   * _pluginWebWorker.js or _pluginWebIframe.js, and replied to
   * the application site with the initImprotSuccess message.
   *
   * @param {Function} handler to be called upon connection init
   */
  whenFailed(handler) {
    this._fail.whenEmitted(handler);
  }

  /**
   * Sends a message to the plugin site
   *
   * @param {Object} data to send
   */
  send(data, transferables) {
    this._frame.contentWindow &&
      this._frame.contentWindow.postMessage(
        { type: "message", data: data },
        "*",
        transferables
      );
  }

  onLogging(handler) {
    this._loggingHandler = handler;
  }
  /**
   * Adds a handler for a message received from the plugin site
   *
   * @param {Function} handler to call upon a message
   */
  onMessage(handler) {
    this._messageHandler = handler;
  }

  /**
   * Adds a handler for the event of plugin disconnection
   * (not used in case of Worker)
   *
   * @param {Function} handler to call upon a disconnect
   */
  onDisconnect() {}

  /**
   * Disconnects the plugin (= kills the frame)
   */
  disconnect() {
    if (!this._disconnected) {
      this._disconnected = true;
      if (typeof this._frame != "undefined") {
        this._frame.parentNode.removeChild(this._frame);
      } // otherwise farme is not yet created
    }
  }
}

/**
 * DynamicPlugin constructor, represents a plugin initialized by a
 * string containing the code to be executed
 *
 * @param {String} code of the plugin
 * @param {Object} _interface to provide to the plugin
 */
var DynamicPlugin = function(config, _interface, engine, is_proxy, allow_evil) {
  if (!platform_initialized)
    throw "Please call `initializeJailed()` before using Jailed.";
  this.config = config;
  this.id = config.id || randId();
  this._id = config._id;
  this.name = config.name;
  this.type = config.type;
  this.tag = config.tag;
  this.tags = config.tags;
  this.type = config.type || "web-worker";
  this.initializing = false;
  this.running = false;
  this._log_history = [];
  this._callbacks = config._callbacks || {};
  this._is_proxy = is_proxy;
  this.backend = getBackendByType(this.type);
  this.engine = engine;
  this.allow_evil = allow_evil;

  this._updateUI =
    (_interface && _interface.utils && _interface.utils.$forceUpdate) ||
    function() {};
  if (is_proxy) {
    this._disconnected = false;
  } else {
    this._disconnected = true;
    this._bindInterface(_interface);

    // use the plugin event functions if it doesn't exist (window plugins has their own event functions)
    if (!this._initialInterface.on) this._initialInterface.on = this.on;
    if (!this._initialInterface.off) this._initialInterface.off = this.off;
    if (!this._initialInterface.emit) this._initialInterface.emit = this.emit;

    this._connect();
  }
  this._updateUI();
};
/**
 * Bind the first argument of all the interface functions to this plugin
 */
DynamicPlugin.prototype._bindInterface = function(_interface) {
  _interface = _interface || {};
  this._initialInterface = { __as_interface__: true };
  // bind this plugin to api functions
  for (var k in _interface) {
    if (_interface.hasOwnProperty(k)) {
      if (typeof _interface[k] === "function") {
        this._initialInterface[k] = _interface[k].bind(null, this);
      } else if (typeof _interface[k] === "object") {
        var utils = {};
        for (var u in _interface[k]) {
          if (_interface[k].hasOwnProperty(u)) {
            if (typeof _interface[k][u] === "function") {
              utils[u] = _interface[k][u].bind(null, this);
            }
          }
        }
        this._initialInterface[k] = utils;
      } else {
        this._initialInterface[k] = _interface[k];
      }
    }
  }
};
/**
 * Creates the connection to the plugin site
 */
DynamicPlugin.prototype._connect = function() {
  this.remote = null;
  this.api = null;

  this._connected = new Whenable();
  this._fail = new Whenable();
  this._disconnect = new Whenable();

  var me = this;

  // binded failure callback
  this._fCb = function(error) {
    me._fail.emit(error);
    me.disconnect();
    me.initializing = false;
    if (error) me.error(error.toString());
    if (me.config.type === "window" && me.config.iframe_container) {
      const container = document.getElementById(me.config.iframe_container);
      container.innerHTML = `<h5>Oops! failed to load the window.</h5><code>Details: ${DOMPurify.sanitize(
        String(error)
      )}</code>`;
    }
    me._updateUI();
  };

  if (!me.backend) {
    if (me.engine && me.engine._is_evil && me.allow_evil !== "eval is evil") {
      me._fail.emit("Evil engine is not allowed.");
      me._connection = null;
      me.error("Evil engine is not allowed.");
      me._set_disconnected();
      return;
    }
    if (!me.engine || !me.engine.connected) {
      me._fail.emit("Please connect to the Plugin Engine 🚀.");
      me._connection = null;
      me.error("Please connect to the Plugin Engine 🚀.");
      me._set_disconnected();
      return;
    }
    me.initializing = true;
    me._updateUI();
    const engine_utils = {
      __as_interface__: true,
      __id__: me.config.id + "_utils",
      terminatePlugin() {
        me.terminate();
      },
      setPluginStatus(status) {
        if (!me._disconnected) {
          me.running = status.running;
          me._updateUI();
        }
      },
    };
    me.engine
      .startPlugin(me.config, me._initialInterface, engine_utils)
      .then(remote => {
        // check if the plugin is terminated during startup
        if (!me.engine) {
          console.warn("Plugin " + me.id + " is ready, but it was termianted.");
          if (me.engine && me.engine.killPlugin)
            me.engine.killPlugin({ id: me.config.id, name: me.config.name });
          return;
        }
        me.remote = remote;
        me.api = me.remote;
        me.api.__as_interface__ = true;
        me.api.__id__ = me.id;
        me._disconnected = false;
        me.initializing = false;
        me._updateUI();
        me._connected.emit();
        me.engine.registerPlugin(me);
      })
      .catch(e => {
        me.error(e);
        me._set_disconnected();
      });

    // me._connection._platformConnection.onLogging(function(details) {
    //   if (details.type === "error") {
    //     me.error(details.value);
    //   } else if (details.type === "progress") {
    //     me.progress(details.value);
    //   } else if (details.type === "info") {
    //     me.log(details.value);
    //   } else {
    //     console.log(details.value);
    //   }
    // });
  } else {
    me._connection = new Connection(me.id, me.type, me.config);
    me.initializing = true;
    me._updateUI();
    me._connection.whenInit(function() {
      me._init();
    });
    me._connection.whenFailed(function(e) {
      me._fail.emit(e);
    });

    me._connection.onDisconnect(function(details) {
      if (details) {
        if (details.success) {
          me.log(details.message);
        } else {
          me.error(details.message);
        }
      }
      if (me._connection._platformConnection._frame) {
        var iframe_container = document.getElementById(
          me._connection._platformConnection._frame.id
        );
        iframe_container.parentNode.removeChild(iframe_container);
      }
      me._set_disconnected();
      // me.terminate()
    });
  }
};

DynamicPlugin.prototype.registerSiteEvents = function(_site) {
  var me = this;
  _site.onDisconnect(function(details) {
    me._disconnect.emit();
    if (details) {
      if (details.success) {
        me.log(details.message);
      } else {
        me.error(details.message);
      }
    }
    me._set_disconnected();
  });

  _site.onRemoteReady(function() {
    if (me.running) {
      me.running = false;
      me._updateUI();
    }
  });

  _site.onRemoteBusy(function() {
    if (!me._disconnected && !me.running) {
      me.running = true;
      me._updateUI();
    }
  });
};

/**
 * Creates the Site object for the plugin, and then loads the
 * common routines (_JailedSite.js)
 */
DynamicPlugin.prototype._init = function() {
  var lang = this.backend.lang;

  /*global JailedSite*/
  this._site = new JailedSite(this._connection, this.id, lang);

  var me = this;
  this.registerSiteEvents(this._site);

  this.getRemoteCallStack = this._site.getRemoteCallStack;
  var sCb = function() {
    me._loadCore();
  };
  this._connection.importScript(
    JailedConfig.asset_url + "_JailedSite.js",
    sCb,
    this._fCb
  );
};

/**
 * Loads the core scirpt into the plugin
 */
DynamicPlugin.prototype._loadCore = function() {
  var me = this;
  var sCb = function() {
    me._sendInterface();
  };

  this._connection.importScript(
    JailedConfig.asset_url + "_pluginCore.js",
    sCb,
    this._fCb
  );
};

/**
 * Sends to the remote site a signature of the interface provided
 * upon the Plugin creation
 */
DynamicPlugin.prototype._sendInterface = function() {
  var me = this;
  this._site.onInterfaceSetAsRemote(function() {
    if (me._disconnected) {
      me._loadPlugin();
    }
  });

  this._site.setInterface(this._initialInterface);
};

/**
 * Loads the plugin body (executes the code in case of the
 * DynamicPlugin)
 */
DynamicPlugin.prototype._loadPlugin = async function() {
  try {
    if (this.config.requirements) {
      await this._connection.execute({
        type: "requirements",
        lang: this.config.lang,
        requirements: this.config.requirements,
        env: this.config.env,
      });
    }
    if (
      this.config.type === "iframe" ||
      this.config.type === "window" ||
      this.config.type === "web-python-window"
    ) {
      for (let i = 0; i < this.config.styles.length; i++) {
        await this._connection.execute({
          type: "style",
          content: this.config.styles[i].content,
          attrs: this.config.styles[i].attrs,
          src: this.config.styles[i].attrs.src,
        });
      }
      for (let i = 0; i < this.config.links.length; i++) {
        await this._connection.execute({
          type: "link",
          rel: this.config.links[i].attrs.rel,
          type_: this.config.links[i].attrs.type,
          attrs: this.config.links[i].attrs,
          href: this.config.links[i].attrs.href,
        });
      }
      for (let i = 0; i < this.config.windows.length; i++) {
        await this._connection.execute({
          type: "html",
          content: this.config.windows[i].content,
          attrs: this.config.windows[i].attrs,
        });
      }
    }
    for (let i = 0; i < this.config.scripts.length; i++) {
      await this._connection.execute({
        type: "script",
        content: this.config.scripts[i].content,
        lang: this.config.scripts[i].attrs.lang,
        attrs: this.config.scripts[i].attrs,
        src: this.config.scripts[i].attrs.src,
      });
    }
    this._requestRemote();
  } catch (e) {
    this._fCb((e && e.toString()) || "Error");
  }
};

/**
 * Requests the remote interface from the plugin (which was
 * probably set by the plugin during its initialization), emits
 * the connect event when done, then the plugin is fully usable
 * (meaning both the plugin and the application can use the
 * interfaces provided to each other)
 */
DynamicPlugin.prototype._requestRemote = function() {
  var me = this;
  this._site.onRemoteUpdate(function() {
    me.remote = me._site.getRemote();
    me.api = me.remote;
    me.api.__as_interface__ = true;
    me.api.__id__ = me.id;
    me._disconnected = false;
    me.initializing = false;
    me._updateUI();
    me._connected.emit();
  });

  this._site.requestRemote();
};

/**
 * @returns {Boolean} true if a plugin runs on a dedicated thread
 * (subprocess in Node.js or a subworker in browser) and therefore
 * will not hang up on the infinite loop in the untrusted code
 */
DynamicPlugin.prototype.hasDedicatedThread = function() {
  return this._connection.hasDedicatedThread();
};

/**
 * Disconnects the plugin immideately
 */
DynamicPlugin.prototype.disconnect = function() {
  if (this._connection) this._connection.disconnect();
  this._disconnect.emit();
};

/**
 * Saves the provided function as a handler for the connection
 * failure Whenable event
 *
 * @param {Function} handler to be issued upon disconnect
 */
DynamicPlugin.prototype.whenFailed = function(handler) {
  this._fail.whenEmitted(handler);
};

/**
 * Saves the provided function as a handler for the connection
 * success Whenable event
 *
 * @param {Function} handler to be issued upon connection
 */
DynamicPlugin.prototype.whenConnected = function(handler) {
  this._connected.whenEmitted(handler);
};

/**
 * Saves the provided function as a handler for the connection
 * failure Whenable event
 *
 * @param {Function} handler to be issued upon connection failure
 */
DynamicPlugin.prototype.whenDisconnected = function(handler) {
  this._disconnect.whenEmitted(handler);
};

DynamicPlugin.prototype._set_disconnected = function() {
  this._disconnected = true;
  this.running = false;
  this.initializing = false;
  this.terminating = false;
  this.engine = null;
  this._updateUI();
};

DynamicPlugin.prototype.terminate = async function(force) {
  if (this._disconnected) {
    this._set_disconnected();
    return;
  }
  const disconnectAll = () => {
    if (this.engine && this.engine.killPlugin)
      this.engine.killPlugin({ id: this.config.id, name: this.config.name });
    this._set_disconnected();
    if (this._site) {
      this._site.disconnect();
      this._site = null;
    }
    if (this._connection) {
      this._connection.disconnect();
      this._connection = null;
    }
  };
  //prevent call loop
  if (this.terminating) {
    return;
  } else {
    this.terminating = true;
    setTimeout(() => {
      console.warn(
        `Plugin termination takes more than 5s, force quiting ${this.id}!`
      );
      if (this.terminating) disconnectAll();
    }, 5000);
  }
  try {
    await this.emit("close");
  } catch (e) {
    console.error(e);
  }
  if (force) {
    disconnectAll();
  }
  try {
    if (this.api && this.api.exit && typeof this.api.exit == "function") {
      await this.api.exit();
    }
  } catch (e) {
    console.error("error occured when terminating the plugin", e);
  } finally {
    disconnectAll();
  }
};

DynamicPlugin.prototype.on = function(name, handler, fire_if_emitted) {
  this._callbacks = this._callbacks || {};

  if (this._callbacks[name]) {
    this._callbacks[name].push(handler);
  } else {
    this._callbacks[name] = [handler];
  }
  if (fire_if_emitted && this._callbacks[name].emitted) {
    handler(this._callbacks[name].emitted_data);
  }
};
DynamicPlugin.prototype.off = function(name, handler) {
  if (this._callbacks[name]) {
    if (handler) {
      const handlers = this._callbacks[name];
      const idx = handlers.indexOf(handler);
      if (idx >= 0) {
        handlers.splice(idx, 1);
      } else {
        console.warn(`callback ${name} does not exist.`);
      }
    } else {
      delete this._callbacks[name];
    }
  } else {
    console.warn(`callback ${name} does not exist.`);
  }
};
DynamicPlugin.prototype.emit = function(name, data) {
  return new Promise(async (resolve, reject) => {
    const errors = [];
    try {
      if (this._callbacks[name]) {
        for (let cb of this._callbacks[name]) {
          try {
            await cb(data !== undefined ? data : undefined);
          } catch (e) {
            errors.push(e);
            console.error(e);
          }
        }
      } else {
        // if no handler set, store the data
        this._callbacks[name] = [];
        this._callbacks[name].emitted = true;
        this._callbacks[name].emitted_data = data;
      }
      if (errors.length <= 0) {
        resolve();
      } else {
        reject(errors);
      }
    } catch (e) {
      reject(e);
    }
  });
};

DynamicPlugin.prototype.log = function(msg) {
  if (typeof msg === "object") {
    this._log_history.push(msg);
    console.log(`Plugin ${this.id}:`, msg);
  } else {
    const args = Array.prototype.slice.call(arguments).join(" ");
    this._log_history._info = args.slice(0, 100);
    this._log_history.push({ type: "info", value: args });
    console.log(`Plugin ${this.id}: ${args}`);
  }
};

DynamicPlugin.prototype.error = function() {
  const args = Array.prototype.slice.call(arguments).join(" ");
  this._log_history._error = args.slice(0, 100);
  this._log_history.push({ type: "error", value: args });
  console.error(`Error in Plugin ${this.id}: ${args}`);
};

DynamicPlugin.prototype.progress = function(p) {
  if (p < 1) this._progress = p * 100;
  else this._progress = p;
};

export { initializeJailed, DynamicPlugin, Plugin };
