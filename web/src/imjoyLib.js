import { PluginManager } from "./pluginManager.js";
import { WindowManager } from "./windowManager.js";

import { EngineManager } from "./engineManager.js";

import { FileSystemManager } from "./fileSystemManager.js";

import PouchDB from "pouchdb-browser";

import { randId } from "./utils.js";

import Minibus from "minibus";

import { Joy as _Joy } from "./joy";

export const Joy = _Joy;

export class ImJoy {
  constructor({
    imjoy_api = null,
    event_bus = null,
    client_id = null,
    config_db = null,
    show_message_callback = null,
    show_engine_callback = null,
    update_ui_callback = null,
    add_window_callback = null,
  }) {
    this.config_db =
      config_db ||
      new PouchDB("imjoy_config", {
        revs_limit: 2,
        auto_compaction: true,
      });

    this.event_bus = event_bus || Minibus.create();
    this.client_id = client_id || "imjoy_web_" + randId();
    this.imjoy_api = imjoy_api || {};
    this.update_ui_callback = update_ui_callback || function() {};
    this.show_engine_callback =
      show_engine_callback ||
      function(engine) {
        console.log("show engine: ", engine);
      };
    this.show_message_callback =
      show_message_callback ||
      function(msg) {
        console.log("show message: ", msg);
      };
    this.add_window_callback =
      add_window_callback ||
      function(w) {
        console.log("add window: ", w);
      };

    this.em = new EngineManager({
      event_bus: this.event_bus,
      config_db: this.config_db,
      show_message_callback: this.show_message_callback,
      show_engine_callback: this.show_engine_callback,
      client_id: this.client_id,
    });

    this.wm = new WindowManager({
      event_bus: this.event_bus,
      show_message_callback: this.show_message_callback,
      add_window_callback: this.add_window_callback,
    });

    this.fm = new FileSystemManager();

    this.pm = new PluginManager({
      event_bus: this.event_bus,
      config_db: this.config_db,
      engine_manager: this.em,
      window_manager: this.wm,
      file_system_manager: this.fm,
      imjoy_api: this.imjoy_api,
      show_message_callback: this.show_message_callback,
      update_ui_callback: this.update_ui_callback,
    });
  }

  async init() {
    try {
      await this.fm.init();
      console.log("Successfully initialized the file system.");
    } catch (e) {
      console.error(e);
      this.show_message_callback(
        "Failed to initialize file system: " + e.toString()
      );
    }
    await this.pm.init();
    await this.pm.loadWorkspaceList();
    try {
      await this.em.init();

      console.log("Successfully initialized the engine manager.");
    } catch (e) {
      console.error(e);
      this.show_message_callback(
        "Failed to initialize the engine manager: " + e.toString()
      );
    }
  }

  async start(workspace) {
    await this.init();
    await this.pm.loadWorkspace(workspace);
    await this.pm.reloadPlugins(false);
    const connections = this.em.connectAll(true);
    try {
      await connections;
    } catch (e) {
      console.error(e);
    }
  }

  async destroy() {
    this.pm.destroy();
    this.em.destroy();
  }
}
