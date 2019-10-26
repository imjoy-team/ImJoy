/* eslint-disable no-unused-vars */
import { Whenable, assert } from "../utils.js";

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
