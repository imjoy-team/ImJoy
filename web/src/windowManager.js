import { randId, assert } from "./utils.js";

export class WindowManager {
  constructor({
    event_bus = null,
    show_message_callback = null,
    add_window_callback = null,
  }) {
    this.event_bus = event_bus;
    assert(this.event_bus);
    this.windows = [];
    this.window_ids = {};
    this.active_windows = [];
    this.show_message_callback = show_message_callback;
    this.add_window_callback = add_window_callback;
    this.selected_window = null;
    this.window_mode = "grid";
    this.registered_inputs = {};
    this.registered_loaders = {};
    this.default_window_pos = {
      x: 0,
      y: 0,
      w: 20,
      h: 10,
      index: 0,
    };
  }

  showMessage(msg, duration) {
    if (this.show_message_callback) {
      this.show_message_callback(msg, duration);
    } else {
      console.log(`WINDOW MESSAGE: ${msg}`);
    }
  }

  generateGridPosition(config) {
    config.i = randId();
    config.index = this.default_window_pos.index;
    config.w = config.w || this.default_window_pos.w;
    config.h = config.h || this.default_window_pos.h;
    config.x = this.default_window_pos.x;
    config.y = this.default_window_pos.y;
    this.default_window_pos.x =
      this.default_window_pos.x + this.default_window_pos.w;
    if (this.default_window_pos.x >= 20) {
      this.default_window_pos.x = 0;
      this.default_window_pos.y =
        this.default_window_pos.y + this.default_window_pos.h;
    }
    this.default_window_pos.index = this.default_window_pos.index + 1;
  }

  registerInputLoader(op_key, inputs, loader) {
    if (this.registered_inputs[op_key])
      console.log(
        `WARNING: input loader ${op_key} already exists, it will be replaced.`
      );
    this.registered_inputs[op_key] = inputs;
    this.registered_loaders[op_key] = loader;
  }

  unregisterInputLoader(op_key) {
    delete this.registered_inputs[op_key];
    delete this.registered_loaders[op_key];
  }

  getDataLoaders(data) {
    const loaders = {};
    // find all the plugins registered for this type
    for (let k in this.registered_inputs) {
      if (this.registered_inputs.hasOwnProperty(k)) {
        if (
          this.registered_inputs[k].loader_key &&
          this.registered_inputs[k].schema(data)
        ) {
          try {
            const loader_key = this.registered_inputs[k].loader_key;
            if (this.registered_loaders[loader_key]) {
              loaders[loader_key] = loader_key;
            }
          } catch (e) {
            console.error("Failed to get loaders.", e);
          }
        }
      }
    }
    return loaders;
  }

  setupCallbacks(w) {
    w._callbacks = w._callbacks || {};
    w.api = w.api || {};
    w.api.on = (name, handler, fire_if_emitted) => {
      if (w._callbacks[name]) {
        w._callbacks[name].push(handler);
      } else {
        w._callbacks[name] = [handler];
      }
      if (fire_if_emitted && w._callbacks[name].emitted) {
        handler(w._callbacks[name].emitted_data);
      }
    };
    w.api.off = (name, handler) => {
      if (w._callbacks[name]) {
        if (handler) {
          const handlers = w._callbacks[name];
          const idx = handlers.indexOf(handler);
          if (idx >= 0) {
            handlers.splice(idx, 1);
          } else {
            console.warn(`callback ${name} does not exist.`);
          }
        } else {
          delete w._callbacks[name];
        }
      } else {
        console.warn(`callback ${name} does not exist.`);
      }
    };
    w.api.emit = (name, data) => {
      return new Promise(async (resolve, reject) => {
        const errors = [];
        try {
          if (w._callbacks[name]) {
            for (let cb of w._callbacks[name]) {
              try {
                await cb(data !== undefined ? data : undefined);
              } catch (e) {
                errors.push(e);
                console.error(e);
              }
            }
          } else {
            // if no handler set, store the data
            w._callbacks[name] = [];
            w._callbacks[name].emitted = true;
            w._callbacks[name].emitted_data = data;
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
    w._refresh_callbacks = [];
    w.api.refresh = w.refresh = async () => {
      await Promise.all(w._refresh_callbacks.map(item => item()));
    };

    w._resize_callbacks = [];
    w.api.resize = w.resize = async contentRect => {
      contentRect = contentRect || (w.$el && w.$el.getBoundingClientRect());
      w.api.emit("resize", contentRect);
    };

    w.api.focus = w.focus = () => {
      w.api.emit("focus");
    };

    w.api.close = w.close = async () => {
      // TODO: handle close gracefully
      let close_timer = setTimeout(() => {
        console.warn("Force quitting the window due to timeout.");
        forceClose();
      }, 2000);

      const forceClose = () => {
        const index = this.windows.indexOf(w);
        if (index > -1) {
          this.windows.splice(index, 1);
          delete this.window_ids[w.id];
        }
        if (w.selected || this.selected_window === w) {
          w.selected = false;
          if (this.window_mode === "single") {
            this.selected_window = this.windows[0];
          } else {
            this.selected_window = null;
          }
        }
        this.event_bus.emit("close_window", w);
      };
      try {
        //TODO: figure out why it's not closing if we await the emit function
        w.api.emit("close");
      } catch (es) {
        console.error(es);
      } finally {
        forceClose();
        clearTimeout(close_timer);
      }
    };
  }

  addWindow(w) {
    return new Promise((resolve, reject) => {
      try {
        w.id = w.id || w.name + randId();
        w.loaders = this.getDataLoaders(w.data);
        if (!w.dialog) this.generateGridPosition(w);
        if (w.standalone) {
          w.h = 0;
          w.w = 0;
        }
        if (this.window_ids[w.id]) {
          this.windows.splice(this.windows.indexOf(this.window_ids[w.id]), 1);
        }
        this.windows.push(w);
        this.window_ids[w.id] = w;
        this.setupCallbacks(w);
        this.selectWindow(w, w.dialog);
        if (this.add_window_callback) {
          this.add_window_callback(w).then(() => {
            this.event_bus.emit("add_window", w);
            resolve(w.id);
          });
        } else {
          this.event_bus.emit("add_window", w);
          resolve(w.id);
        }
        //hack for testing
        if (w.__test__mode__) {
          w.api.emit("ready");
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  selectWindow(w, is_dialog) {
    if (!is_dialog) {
      for (let i = 0; i < this.active_windows.length; i++) {
        this.active_windows[i].selected = false;
        if (this.active_windows[i]) this.active_windows[i].refresh();
      }
      if (this.window_mode === "single" || w.standalone) {
        this.selected_window = w;
      } else {
        this.selected_window = null;
      }
      this.active_windows = [w];
      if (!w.standalone && w.focus) w.focus();
    }
    w.selected = true;
    if (w.refresh) {
      w.refresh();
    }
  }

  resizeAll() {
    for (var i = this.windows.length; i--; ) {
      try {
        this.windows[i].resize();
      } catch (e) {}
    }
  }

  closeAll() {
    const current_index =
      (this.default_window_pos && this.default_window_pos.index) || 0;
    this.default_window_pos = {
      i: 0,
      x: 0,
      y: 0,
      w: 20,
      h: 10,
      index: current_index,
    };
    this.status_text = "";

    for (var i = this.windows.length; i--; ) {
      if (this.windows[i].type != "imjoy/plugin-editor") {
        // delete this.window_ids[this.windows[i].id]
        // this.windows.splice(i, 1);
        this.windows[i].close();
      }
    }
    if (this.windows.length === 0) {
      this.default_window_pos.index = 0;
    }
    //this.event_bus.emit('close_window')
  }

  destroy() {
    this.disconnect();
  }
}
