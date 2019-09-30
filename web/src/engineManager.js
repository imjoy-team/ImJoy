import io from "socket.io-client";
import { randId, assert } from "./utils.js";

export class EngineManager {
  constructor({ event_bus = null, config_db = null, client_id = null }) {
    this.event_bus = event_bus;
    this.config_db = config_db;
    assert(this.event_bus);
    assert(this.config_db, "config database is not available");
    this.client_id = client_id || randId();
    this.engines = [];
    this.engine_factories = [];
  }

  async init() {}

  addEngineByUrl(url, token) {
    console.log("adding engine: ", url, token);
  }

  findEngine(plugin_config) {
    const matched = [];
    const egs = this.engines.filter(engine => {
      let matched = true;
      for (let k in engine.matchPlugin) {
        if (engine.matchPlugin[k] !== plugin_config[k]) {
          matched = false;
        }
      }
      return matched;
    });

    if (!egs || egs.length <= 0) {
      return null;
    }

    if (plugin_config.engine_mode === "auto") {
      return egs[0];
    }

    return egs.filter(eg => {
      eg.name === plugin_config.engine_mode;
    })[0];
  }

  getEngineByUrl(url) {
    for (let e of this.engines) {
      if (e.url === url) {
        return e;
      }
    }
    return null;
  }

  register(engine) {
    for (let i = 0; i < this.engines.length; i++) {
      if (this.engines[i].name === engine.name) {
        this.engines.splice(i, 1);
        break;
      }
    }
    setInterval(async () => {
      if (engine.getInfo) {
        try {
          engine.engine_info = await engine.getInfo();
          if (engine.engine_info) {
            engine.connected = true;
          } else {
            engine.connected = false;
          }
        } catch (e) {
          engine.connected = false;
        }
      }
    }, 3000);

    this.engines.push(engine);
  }

  unregister(engine) {
    const index = this.engines.indexOf(engine);
    if (index > -1) {
      this.engines.splice(index, 1);
    }
  }

  registerFactory(factory) {
    for (let i = 0; i < this.engine_factories.length; i++) {
      if (this.engine_factories[i].name === factory.name) {
        this.engine_factories.splice(i, 1);
        break;
      }
    }
    this.engine_factories.push(factory);
  }

  unregisterFactory(factory) {
    const index = this.engine_factories.indexOf(factory);
    if (index > -1) {
      this.engine_factories.splice(index, 1);
    }
  }

  getFactory(name) {
    for (let e of this.engine_factories) {
      if (e.name === name) {
        return e;
      }
    }
    return null;
  }

  destroy() {
    for (let e of this.engines) {
      e.destroy();
    }
  }
}
