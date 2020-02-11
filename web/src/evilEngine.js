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

export const evil_engine = {
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
