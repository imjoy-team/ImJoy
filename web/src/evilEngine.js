import { randId } from "./utils.js";
import axios from "axios";

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
          throw "Unsupported requirements definition";
        }
      } catch (e) {
        throw `Failed to import required scripts ${code.requirements}: ${e}`;
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
};

function promisify_functions(obj) {
  for (let k in obj) {
    if (typeof obj[k] === "function") {
      // make sure it returns a promise
      const func = obj[k];
      if (func.constructor.name !== "AsyncFunction") {
        obj[k] = function(...args) {
          return Promise.resolve(func(...args));
        };
      }
    }
  }
}

export const evil_engine = {
  type: "engine",
  pluginType: "evil",
  icon: "😈",
  name: "imjoy engine",
  url: "https://imjoy.io",
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
        promisify_functions(remote_api);
        resolve(remote_api);
      };
      api_interface = Object.assign({}, api_interface);
      api_interface.export = export_api;
      const raw_register = api_interface.register;
      api_interface.register = config => {
        promisify_functions(config);
        return raw_register(config);
      };
      const raw_on = api_interface.on;
      api_interface.on = (name, cb) => {
        const promise_cb = function(...args) {
          return Promise.resolve(cb(...args));
        };
        return raw_on(name, promise_cb);
      };

      promisify_functions(api_interface);

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
  heartbeat: null,
};
