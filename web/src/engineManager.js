import { randId, assert } from "./utils.js";
import axios from "axios";

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

  async init({ enable_evil_engine = false }) {
    if (enable_evil_engine) {
      this.register(evil_engine, true);
    }
  }

  matchEngineByType(pluginType) {
    return this.engines.filter(engine => {
      return engine.pluginType === pluginType;
    });
  }

  findEngine(plugin_config) {
    const egs = this.engines.filter(engine => {
      return engine.pluginType === plugin_config.type;
    });

    if (!egs || egs.length <= 0) {
      return null;
    }

    if (plugin_config.engine_mode === "auto") {
      return egs.filter(eg => {
        return eg.connected;
      })[0];
    }

    return egs.filter(eg => {
      return eg.name === plugin_config.engine_mode;
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

  async register(engine_, disable_heartbeat) {
    const engine = Object.assign({}, engine_);
    // backup the engine api
    engine.api = engine_;
    if (engine_ === evil_engine) {
      // make an exception for localhost debugging
      if (
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "localhost"
      ) {
        engine._is_evil = false;
      } else {
        engine._is_evil = true;
      }
    } else {
      engine._is_evil = false;
    }
    for (let i = 0; i < this.engines.length; i++) {
      if (this.engines[i].name === engine.name) {
        this.engines.splice(i, 1);
        break;
      }
    }
    engine.connected = false;
    engine.engine_status = engine.engine_status || {};
    if (engine.getEngineInfo) {
      Promise.resolve(engine.getEngineInfo()).then(engine_info => {
        engine.engine_info = engine_info;
      });
    }

    const check_connectivity = async () => {
      const live = await engine.heartbeat();
      if (!engine.connected && live) {
        engine.connected = true;
        this.event_bus.emit("engine_connected", engine);
      } else if (engine.connected && !live) {
        engine.connected = false;
        this.event_bus.emit("engine_disconnected", engine);
        for (let p of engine._plugins) {
          p.terminate();
        }
        // clearInterval(timerId);
      } else {
        engine.connected = live;
      }
    };

    engine._plugins = [];
    engine.registerPlugin = p => {
      engine._plugins.push(p);
    };
    this.engines.push(engine);
    engine.connect();

    await check_connectivity();
    if (!disable_heartbeat) {
      engine.heartbeat_timer = setInterval(check_connectivity, 5000);
    }
  }

  unregister(engine) {
    engine = this.getEngineByUrl(engine.url);
    if (!engine) throw `Engine ${engine.url} not found.`;
    const index = this.engines.indexOf(engine);
    for (let p of engine._plugins) {
      p.terminate();
    }
    if (index > -1) {
      this.engines.splice(index, 1);
    }
    if (engine.heartbeat_timer) clearInterval(engine.heartbeat_timer);
    this.event_bus.emit("engine_disconnected", engine);
  }

  registerFactory(factory_) {
    const factory = Object.assign({}, factory_);
    //backup the factory api
    factory.api = factory_;
    for (let i = 0; i < this.engine_factories.length; i++) {
      if (this.engine_factories[i].name === factory.name) {
        this.engine_factories.splice(i, 1);
        break;
      }
    }
    this.engine_factories.push(factory);
  }

  unregisterFactory(factory) {
    factory = this.getFactory(factory.name);
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
      this.unregister(e);
    }
  }
}

async function _importScript(url, scope) {
  const response = await axios.get(url + "?" + randId());
  if (response && response.status == 200 && response.data) {
    const code = response.data;
    evalInScope(code, scope);
  } else {
    throw "Faild to fetch code from " + url;
  }
}

function evalInScope(code, scope) {
  var keys = Object.keys(scope);
  var values = keys.map(function(key) {
    return scope[key];
  });
  var f = Function(keys.join(", "), code);

  // Note that at this point you could cache the function f.
  return f.apply(undefined, values);
}

// evaluates the provided string
var execute = async function(code, api_interface) {
  try {
    if (code.type == "requirements") {
      if (
        code.requirements &&
        (Array.isArray(code.requirements) ||
          typeof code.requirements === "string")
      ) {
        try {
          code.requirements =
            typeof code.requirements === "string"
              ? [code.requirements]
              : code.requirements;
          if (Array.isArray(code.requirements)) {
            for (var i = 0; i < code.requirements.length; i++) {
              if (
                code.requirements[i].toLowerCase().endsWith(".js") ||
                code.requirements[i].startsWith("js:")
              ) {
                if (code.requirements[i].startsWith("js:")) {
                  code.requirements[i] = code.requirements[i].slice(3);
                }
                await _importScript(code.requirements[i], {
                  api: api_interface,
                });
              } else if (code.requirements[i].startsWith("http")) {
                await _importScript(code.requirements[i], {
                  api: api_interface,
                });
              } else if (code.requirements[i].startsWith("cache:")) {
                //ignore cache
              } else {
                console.log(
                  "Unprocessed requirements url: " + code.requirements[i]
                );
              }
            }
          } else {
            throw "unsupported requirements definition";
          }
        } catch (e) {
          throw "failed to import required scripts: " +
            code.requirements.toString();
        }
      }
    } else if (code.type == "script") {
      if (code.src) {
        var script_node = document.createElement("script");
        script_node.setAttribute("type", code.attrs.type);
        script_node.setAttribute("src", code.src);
        document.head.appendChild(script_node);
      } else {
        if (
          code.content &&
          (!code.attrs.type || code.attrs.type === "text/javascript")
        ) {
          // document.addEventListener("DOMContentLoaded", function(){
          evalInScope(code.content, { api: api_interface });
          // });
        } else {
          var node = document.createElement("script");
          node.setAttribute("type", code.attrs.type);
          node.appendChild(document.createTextNode(code.content));
          document.body.appendChild(node);
        }
      }
    } else {
      throw "unsupported code type.";
    }
    parent.postMessage({ type: "executeSuccess" }, "*");
  } catch (e) {
    console.error("failed to execute scripts: ", code, e);
    parent.postMessage(
      { type: "executeFailure", error: e.stack || String(e) },
      "*"
    );
  }
};

const evil_engine = {
  type: "engine",
  pluginType: "evil",
  icon: "😈",
  name: "default eval engine",
  url: "default-eval-engine",
  config: {},
  connect() {
    this._disconnected = false;
    return true;
  },
  disconnect() {
    this._disconnected = true;
  },
  async startPlugin(config, api_interface) {
    if (this._disconnected) throw "engine is disconnected.";
    return new Promise(async (resolve, reject) => {
      const export_api = remote_api => {
        console.log(
          `plugin ${config.name} (id=${config.id}) initialized.`,
          remote_api
        );
        resolve(remote_api);
      };
      api_interface = Object.assign({}, api_interface);
      api_interface["export"] = export_api;
      try {
        await execute(
          {
            type: "requirements",
            lang: config.lang,
            requirements: config.requirements,
            env: config.env,
          },
          api_interface
        );
        for (let i = 0; i < config.scripts.length; i++) {
          await execute(
            {
              type: "script",
              content: config.scripts[i].content,
              lang: config.scripts[i].attrs.lang,
              attrs: config.scripts[i].attrs,
              src: config.scripts[i].attrs.src,
            },
            api_interface
          );
        }
      } catch (e) {
        reject(e);
      }
    });
  },
  heartbeat() {
    return true;
  },
};
