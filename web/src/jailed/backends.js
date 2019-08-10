import { BACKEND_SCHEMA } from "../api.js";
import { Whenable } from "../utils.js";
const _backends = {};

function initBackends() {
  registerBackend("web-worker", {
    name: "Web Worker",
    connection: BasicConnection,
    lang: "javascript",
  });

  registerBackend("iframe", {
    name: "IFrame",
    connection: BasicConnection,
    lang: "javascript",
  });

  registerBackend("window", {
    name: "Window",
    connection: BasicConnection,
    lang: "javascript",
  });

  registerBackend("web-python", {
    name: "Web Python",
    connection: BasicConnection,
    lang: "web-python",
    icon: "🐍",
  });

  registerBackend("web-python-window", {
    name: "Web Python (window)",
    connection: BasicConnection,
    lang: "web-python",
    icon: "🐍",
  });

  registerBackend("native-python", {
    name: "Native Python",
    connection: SocketioConnection,
    lang: "python",
    icon: "🚀",
  });
}

function registerBackend(type, backend) {
  if (!BACKEND_SCHEMA(backend)) {
    const error = BACKEND_SCHEMA.errors;
    console.error("Error occured during registering backend " + type, error);
    throw error;
  }
  _backends[type] = backend;
}

export function getBackends() {
  return _backends;
}

export function getBackendByType(type) {
  return _backends[type];
}

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
    sample.src = config.__jailed__path__ + "_frame.html";
    sample.sandbox = "";
    sample.frameBorder = "0";
    sample.style.width = "100%";
    sample.style.height = "100%";
    sample.style.margin = "0";
    sample.style.padding = "0";
    sample.style.display = "none";

    var me = this;

    if (!me._disconnected) {
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
        if (
          config.permissions.includes("midi") &&
          !allows.includes("midi *;")
        ) {
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

class SocketioConnection {
  constructor(id, type, config) {
    this._init = new Whenable();
    this._fail = new Whenable();
    this._disconnected = false;
    this.id = id;
    this.engine = config.engine;
    if (!this.engine) {
      throw "connection is not established.";
    }
    this._disconnectHandler = () => {};
    this._loggingHandler = () => {};

    if (!this._disconnected && this.engine && this.engine.socket) {
      const config_ = {
        api_version: config.api_version,
        flags: config.flags,
        tag: config.tag,
        workspace: config.workspace,
        env: config.env,
        requirements: config.requirements,
        cmd: config.cmd,
        name: config.name,
        type: config.type,
        inputs: config.inputs,
        outputs: config.outputs,
      };
      // create a plugin here
      this.engine.socket.emit(
        "init_plugin",
        { id: id, type: type, config: config_ },
        result => {
          // console.log('init_plugin: ', result)
          this.initializing = false;
          if (result.success) {
            this._disconnected = false;
            this.secret = result.secret;
            config.work_dir = result.work_dir;
            config.resumed = result.resumed;
            this.engine.socket.on(
              "message_from_plugin_" + this.secret,
              data => {
                // console.log('message_from_plugin_'+this.id, data)
                if (data.type == "initialized") {
                  this.dedicatedThread = data.dedicatedThread;
                  this._init.emit();
                } else if (data.type == "logging") {
                  this._loggingHandler(data.details);
                } else if (data.type == "disconnected") {
                  this._disconnectHandler(data.details);
                } else {
                  this._messageHandler(data);
                }
              }
            );
            if (result.initialized) {
              this.dedicatedThread = true;
              this._init.emit();
            }
          } else {
            this._disconnected = true;
            console.error("failed to initialize plugin on the plugin engine");
            this._fail.emit("failed to initialize plugin on the plugin engine");
            throw "failed to initialize plugin on the plugin engine";
          }
        }
      );
    } else {
      this._fail.emit("connection is not established.");
      throw "connection is not established.";
    }
  }

  send(data) {
    if (this.engine && this.engine.socket) {
      this.engine.socket.emit("message_to_plugin_" + this.secret, {
        type: "message",
        data: data,
      });
    } else {
      throw "socketio disconnected.";
    }
  }

  disconnect() {
    if (!this._disconnected) {
      this._disconnected = true;
    }
    if (this.engine && this.engine.socket) {
      this.engine.socket.emit("kill_plugin", { id: this.id });
    }
    this._disconnectHandler();
  }

  onMessage(handler) {
    this._messageHandler = handler;
  }

  onDisconnect(handler) {
    this._disconnectHandler = handler;
  }

  onLogging(handler) {
    this._loggingHandler = handler;
  }

  whenInit(handler) {
    this._init.whenEmitted(handler);
  }

  whenFailed(handler) {
    this._fail.whenEmitted(handler);
  }
}

initBackends();
