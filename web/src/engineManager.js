import io from "socket.io-client";
import { randId, assert } from "./utils.js";

export class Engine {
  constructor({
    config = {},
    event_bus = null,
    show_message_callback = null,
    update_ui_callback = null,
    show_engine_callback = null,
    client_id = null,
  }) {
    this.socket = null;
    this.activate = false;
    this.connection = "Disconnected";
    this.client_id = client_id;
    this.socket_id = null;
    this.config = config;
    this.id = this.config.id;
    this.name = this.config.name || this.config.url;
    this.normalizeName();
    this.config.name = this.name;
    this.url = this.config.url;
    this.token = this.config.token;

    this.show_engine_callback = show_engine_callback || function() {};
    this.show_message_callback = show_message_callback || function() {};
    this.update_ui_callback = update_ui_callback || function() {};
    this.event_bus = event_bus;

    this.disconnecting = false;
    this.connection_lost_timer = null;
  }
  normalizeName() {
    this.name = this.name.replace("http://127.0.0.1:9527", "My Computer");
    this.name = this.name.replace("https://", "");
    this.name = this.name.replace("http://", "");
  }
  requestUploadUrl(config) {
    return new Promise((resolve, reject) => {
      try {
        this.socket.emit("request_upload_url", config, resolve);
      } catch (e) {
        reject(e);
      }
    });
  }

  getFileUrl(config) {
    return new Promise((resolve, reject) => {
      try {
        this.socket.emit("get_file_url", config, resolve);
      } catch (e) {
        reject(e);
      }
    });
  }

  getFilePath(config) {
    return new Promise((resolve, reject) => {
      try {
        this.socket.emit("get_file_path", config, resolve);
      } catch (e) {
        reject(e);
      }
    });
  }

  connect(auto) {
    return new Promise((resolve, reject) => {
      let url = this.config.url;
      let token = this.config.token;
      if (this.connected) {
        resolve();
        return;
      }
      //enforcing 127.0.0.1 for avoid security restrictions
      url = url.replace("//localhost", "//127.0.0.1");
      token = (token && token.trim()) || "";
      let reason = "";
      this.connected = false;
      this.connection = "Connecting...";

      this.name = this.config.name || url;
      this.normalizeName();

      this.disconnecting = false;
      this.engine_session_id = randId();
      if (!auto) this.showMessage("Trying to connect to the plugin engine...");
      const socket = io(url);
      const timer = setTimeout(() => {
        if (!this.connected) {
          this.connection = "Plugin Engine is not connected.";
          this.disconnecting = true;
          socket.disconnect();
          if (!auto) {
            this.show_engine_callback(true, this);
            this.showMessage(
              "Failed to connect, please make sure you have started the plugin engine."
            );
          }
          if (url.endsWith(":8080") && !auto) {
            alert(
              "It seems you are using the legacy plugin engine port (8080), you may want to change the engine url to: " +
                url.replace(":8080", ":9527")
            );
          }
          reject(
            "Failed to connect, please make sure you have started the plugin engine."
          );
        }
      }, 2500);

      //if(!auto) {this.show_engine_callback(true, this)}

      const set_disconnected = () => {
        //disconnect immediately
        this.socket = null;
        this.connected = false;
        this.event_bus.$emit("engine_disconnected", this);
        this.connection = "Disconnected.";
        this.update_ui_callback();
      };

      socket.on("connect", () => {
        if (this.connection_lost_timer) {
          clearTimeout(this.connection_lost_timer);
          this.connection_lost_timer = null;
          //return if it's the same session
          if (this.socket_id === socket.id) {
            this.showMessage(`Connection to ${this.name} has been recovered`);
            return;
          } else {
            // set disconnected first
            set_disconnected();
          }
        }

        socket.emit(
          "register_client",
          {
            id: this.client_id,
            token: token,
            base_url: url,
            session_id: this.engine_session_id,
          },
          ret => {
            clearTimeout(timer);
            if (ret && ret.success) {
              const connect_client = () => {
                this.engine_info = ret.engine_info || {};
                this.engine_info.api_version =
                  this.engine_info.api_version || "0.1.0";
                this.socket = socket;
                this.socket_id = socket.id;
                this.connected = true;
                this.connected_url_token_ = url + token;
                //this.show_engine_callback(false, this)
                this.connection = "Plugin Engine Connected.";
                this.connection_token = token;
                localStorage.setItem("imjoy_connection_token", token);
                localStorage.setItem("imjoy_engine_url", url);
                this.showMessage(
                  `Successfully connected to the Plugin Engine 🚀 (${url}).`
                );
                // console.log('plugin engine connected.')
                this.event_bus.$emit("engine_connected", this);
                this.update_ui_callback();
                resolve();
              };

              // if(ret.message && ret.confirmation){
              //   this.show_engine_callback(true, ret.message, connect_client,  ()=>{
              //     this.disconnecting = true
              //     socket.disconnect()
              //     console.log('you canceled the connection.')
              //     reject('User cancelled the connection.')
              //   })
              // }
              // else{
              connect_client();
              // }
            } else {
              reason = ret.reason;
              if (ret.no_retry && ret.reason) {
                this.showStatus("Failed to connect: " + ret.reason);
                this.showMessage("Failed to connect: " + ret.reason);
              } else {
                if (!auto) this.show_engine_callback(true, this);
                if (ret.reason)
                  this.showMessage("Failed to connect: " + ret.reason);
                console.error(
                  "Failed to connect to the plugin engine.",
                  ret.reason
                );
              }
              this.disconnecting = true;
              setTimeout(() => {
                socket.disconnect();
              }, 200);
              reject("Failed to connect: " + ret.reason);
            }
          }
        );
      });
      socket.on("disconnect", () => {
        console.error("Socket io disconnected from " + this.url);
        if (this.connected) {
          this.showMessage("Plugin Engine disconnected.");
        } else {
          if (reason) {
            this.showMessage("Failed to connect: " + reason);
          } else {
            this.showMessage("Failed to connect to the plugin engine");
          }
        }
        if (this.disconnecting) {
          set_disconnected();
        } else {
          //wait for 10s to see if it recovers
          this.connection_lost_timer = setTimeout(() => {
            this.showMessage("Timeout, connection failed to recover.");
            if (this.connected) {
              this.socket = null;
              this.connected = false;
              this.event_bus.$emit("engine_disconnected", this);
              this.connection = "Disconnected.";
              this.update_ui_callback();
            }
          }, 10000);
        }
      });
    });
  }

  updateEngineStatus() {
    return new Promise((resolve, reject) => {
      this.plugin_processes = null;
      this.socket.emit("get_engine_status", {}, ret => {
        if (ret && ret.success) {
          this.plugin_num = ret.plugin_num;
          this.plugin_processes = ret.plugin_processes;
          resolve(ret);
        } else {
          this.showMessage(`Failed to get engine status: ${ret.error}`);
          reject(ret.error);
        }
      });
    });
  }

  killPluginProcess(p) {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        "kill_plugin_process",
        { pid: p && p.pid, all: !p },
        ret => {
          if (ret && ret.success) {
            this.updateEngineStatus();
            resolve(ret);
          } else {
            this.showMessage(`Failed to get engine status: ${ret.error}`);
            reject(ret.error);
          }
        }
      );
    });
  }

  resetEngine() {
    return new Promise((resolve, reject) => {
      this.socket.emit("reset_engine", {}, ret => {
        if (ret && ret.success) {
          this.updateEngineStatus();
          this.showMessage("Reset the Plugin Engine successfully");
          resolve(ret);
        } else {
          this.showMessage(`Failed to reset engine: ${ret.error}`);
          reject(ret.error);
        }
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.disconnecting = true;
      this.socket.disconnect();
    }
  }

  listFiles(path, type, recursive) {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        "list_dir",
        {
          path: path || "",
          type: type || "file",
          recursive: recursive || false,
        },
        async ret => {
          if (ret && ret.success) {
            resolve(ret);
          } else {
            this.showMessage(`Failed to list dir: ${path} ${ret.error}`);
            if (path !== "") {
              path = "";
              ret = await this.listFiles(path, type, false);
              resolve(ret);
            } else {
              reject(ret.error);
            }
          }
        }
      );
    });
  }

  removeFiles(path, type, recursive) {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        "remove_files",
        { path: path, type: type, recursive: recursive || false },
        ret => {
          if (ret && ret.success) {
            resolve(ret);
          } else {
            this.showMessage(
              `Failed to remove file/directory: ${ret && ret.error}`
            );
            reject(ret.error);
          }
        }
      );
    });
  }

  showMessage(msg, duration) {
    if (this.show_message_callback) {
      this.show_message_callback(msg, duration);
    } else {
      console.log(`ENGINE MESSAGE: ${msg}`);
    }
  }

  destroy() {
    this.disconnect();
  }
}

export class EngineManager {
  constructor({
    event_bus = null,
    config_db = null,
    show_message_callback = null,
    update_ui_callback = null,
    show_engine_callback = null,
    client_id = null,
  }) {
    this.event_bus = event_bus;
    this.config_db = config_db;
    assert(this.event_bus);
    assert(this.config_db, "config database is not available");
    this.client_id = client_id || randId();
    this.engines = [];
    this.show_engine_callback = show_engine_callback || function() {};
    this.show_message_callback = show_message_callback || function() {};
    this.update_ui_callback = update_ui_callback || function() {};
  }

  async init() {
    await this.loadPluginEngineList();
  }

  getEngineByUrl(url) {
    for (let e of this.engines) {
      if (e.url === url) {
        return e;
      }
    }
    return null;
  }

  async addEngine(config, force_save) {
    if (config.type === "default") {
      config.id = config.id || config.url;

      let existed = false;
      let engine = new Engine({
        config: config,
        event_bus: this.event_bus,
        show_engine_callback: this.show_engine_callback,
        show_message_callback: this.show_message_callback,
        update_ui_callback: this.update_ui_callback,
        client_id: this.client_id,
      });
      for (let e of this.engines) {
        if (e.id === engine.id && engine.config.token === e.config.token) {
          engine = e;
          existed = true;
          this.show_message_callback("Plugin Engine already exists.");
          break;
        }
      }

      const save_engine = async () => {
        if (existed) {
          return;
        }
        //remove duplication
        const es = [];
        for (let e of this.engines) {
          if (e.url !== engine.url) {
            es.push(e);
          } else {
            if (e.connected) {
              e.disconnect();
            }
          }
        }
        es.push(engine);
        this.engines = es;
        await this.savePluginEngineList();
      };
      if (force_save) {
        await save_engine();
        await engine.connect(true);
      } else {
        await engine.connect(true);
        await save_engine();
        this.show_engine_callback(false, engine);
      }
      return engine;
    }
  }

  removeEngine(engine) {
    engine.disconnect();
    this.engines = this.engines.filter(function(ele) {
      return ele != engine;
    });
    return this.savePluginEngineList();
  }

  getEngine(mode) {
    if (mode === "auto") {
      for (let e of this.engines) {
        if (e.connected) {
          return e;
        }
      }
    } else {
      const id = mode;
      if (!id && this.engines.length > 0) {
        return this.engines[0];
      }

      for (let e of this.engines) {
        if (e.id === id) {
          return e;
        }
      }
    }
    return null;
  }

  connectAll(auto) {
    //this.engines[0].connect(this.engine_url, this.connection_token, true)
    const ps = [];
    for (let c of this.engines) {
      ps.push(c.connect(auto));
    }
    return Promise.all(ps);
  }

  loadPluginEngineList() {
    return new Promise((resolve, reject) => {
      let _rev;
      this.config_db
        .get("plugin_engine_list")
        .then(doc => {
          this.config = doc;
          _rev = doc._rev;
          this.config.engines = this.config.engines || [];
          this.engines = [];
          for (let c of this.config.engines) {
            const engine = new Engine({
              config: c,
              event_bus: this.event_bus,
              show_engine_callback: this.show_engine_callback,
              show_message_callback: this.show_message_callback,
              update_ui_callback: this.update_ui_callback,
              client_id: this.client_id,
            });
            this.engines.push(engine);
          }
          resolve(this.config);
        })
        .catch(err => {
          if (err.name != "not_found") {
            console.error("Database Error", err);
          }
          this.config = { engines: [] };
          this.config_db
            .put({
              _rev: _rev,
              _id: "plugin_engine_list",
              engines: [],
            })
            .then(() => {
              for (let c of this.config.engines) {
                const engine = new Engine({
                  config: c,
                  event_bus: this.event_bus,
                  show_engine_callback: this.show_engine_callback,
                  show_message_callback: this.show_message_callback,
                  update_ui_callback: this.update_ui_callback,
                  client_id: this.client_id,
                });
                this.engines.push(engine);
              }
              resolve(this.config);
            })
            .catch(() => {
              reject(
                "Failed to load Plugin Engine list, database Error:" +
                  err.toString()
              );
            });
        });
    });
  }

  savePluginEngineList() {
    return new Promise((resolve, reject) => {
      this.config.engines = [];
      for (let e of this.engines) {
        this.config.engines.push(e.config);
      }
      let rev = null;
      this.config_db
        .get("plugin_engine_list")
        .then(doc => {
          rev = doc._rev;
        })
        .finally(() => {
          this.config_db
            .put({
              _id: "plugin_engine_list",
              _rev: rev || undefined,
              engines: this.config.engines,
            })
            .then(() => {
              resolve(this.config.engines);
            })
            .catch(e => {
              reject(
                `Failed to plugin engine list, database error: ${e.toString()}`
              );
            });
        });
    });
  }

  destroy() {
    for (let e of this.engines) {
      e.destroy();
    }
  }
}
