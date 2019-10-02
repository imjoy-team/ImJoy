import { BACKEND_SCHEMA } from "../api.js";
import { Whenable, assert } from "../utils.js";
const _backends = {};

function initBackends() {
  registerBackend("web-worker", {
    type: "internal",
    name: "Web Worker",
    lang: "javascript",
  });

  registerBackend("iframe", {
    type: "internal",
    name: "IFrame",
    lang: "javascript",
  });

  registerBackend("window", {
    type: "internal",
    name: "Window",
    lang: "javascript",
  });

  registerBackend("web-python", {
    type: "internal",
    name: "Web Python",
    lang: "web-python",
    icon: "🐍",
  });

  registerBackend("web-python-window", {
    type: "internal",
    name: "Web Python (window)",
    lang: "web-python",
    icon: "🐍",
  });

  registerBackend("collection", {
    type: "-",
    name: "Collection",
    lang: "",
    icon: "",
  });
}

export function registerBackend(type, backend) {
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

    if (this.engine && this.engine.socket) {
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

class PostMessageIO {
  constructor() {
    this._callbacks = {};
    window.addEventListener(
      "message",
      e => {
        if (e.source === window.parent) {
          if (e.data.channel && this._callbacks[e.data.channel]) {
            for (let cb of this._callbacks[e.data.channel]) cb(e.data);
          }
        }
      },
      false
    );
  }
  connect() {
    window.parent.postMessage({ type: "pio_connect" }, "*");
  }

  disconnect() {
    window.parent.postMessage({ type: "pio_disconnect" }, "*");
  }

  emit(channel, data) {
    data.channel = channel;
    window.parent.postMessage(data, "*");
  }

  on(channel, callback) {
    if (this._callbacks[channel]) {
      this._callbacks[channel].push(callback);
    } else {
      this._callbacks[channel] = [callback];
    }
  }

  off(channel, callback) {
    if (this._callbacks[channel]) {
      for (var i = 0; i < this._callbacks[channel].length; i++) {
        if (this._callbacks[channel][i] === callback) {
          this._callbacks[channel].splice(i, 1);
        }
      }
    }
  }
}

const pio = new PostMessageIO();
pio.connect();

class PostMessageConnection {
  constructor(id, type, config) {
    assert(
      window.top !== window.self,
      "PostMessage Connection can only be used inside an iframe."
    );
    this._init = null;
    this._fail = new Whenable();
    this._disconnected = false;
    this.id = id;

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
    pio.emit("init_plugin", { id: this.id, type: type, config: config_ });

    this._disconnected = false;
    config.work_dir = "";
    config.resumed = false;

    pio.on("message_from_plugin_" + this.id, data => {
      if (data.type == "initialized") {
        this.dedicatedThread = data.dedicatedThread;
        this._init();
      } else if (data.type == "logging") {
        this._loggingHandler(data.details);
      } else if (data.type == "disconnected") {
        this._disconnectHandler(data.details);
      } else {
        this._messageHandler(data);
      }
    });
  }

  whenInit(handler) {
    this._init = handler;
  }

  whenFailed(handler) {
    this._fail.whenEmitted(handler);
  }

  send(data) {
    if (pio) {
      pio.emit("message_to_plugin_" + this.id, {
        type: "message",
        data: data,
      });
    } else {
      throw "socketio disconnected.";
    }
  }

  onMessage(handler) {
    this._messageHandler = handler;
  }

  onDisconnect() {}

  /**
   * Disconnects the plugin (= kills the frame)
   */
  disconnect() {}
}

initBackends();
