<template>
  <div class="plugin-editor">
    <div class="loading loading-lg floating" v-show="loading"></div>
    <div class="floating-text" v-show="loading">Loading code...</div>
    <form v-show="false" ref="file_form">
      <input
        class="md-file"
        type="file"
        @change="fileSelected"
        ref="file_select"
        multiple
      />
    </form>
    <md-toolbar
      v-if="window"
      class="md-dense editor-toolbar md-layout"
      md-elevation="1"
    >
      <div class="md-toolbar-section-start">
        <md-menu md-size="big">
          <md-button class="md-icon-button" md-menu-trigger>
            <md-icon>folder_open</md-icon>
            <md-tooltip class="md-medium-hide">Open File</md-tooltip>
          </md-button>

          <md-menu-content>
            <md-menu-item
              @click="
                $refs.file_form.reset();
                $refs.file_select.click();
              "
            >
              <md-icon>insert_drive_file</md-icon>Open Local File
            </md-menu-item>
            <md-menu-item
              @click="openEngineFile()"
              :disabled="window.engine_manager.engines.length <= 0"
            >
              <md-icon>add_to_queue</md-icon>Open Engine File
              <md-tooltip>Load files through Plugin Engine</md-tooltip>
            </md-menu-item>
          </md-menu-content>
        </md-menu>

        <md-switch
          v-if="code_origin || lastModified"
          v-model="watch_file"
          @change="watchModeChanged"
        >
          <md-tooltip class="md-medium-hide"
            >Watch content change automatically.
          </md-tooltip>
          Watch
        </md-switch>

        <md-switch v-if="watch_file" v-model="run_changed_file">
          <md-tooltip class="md-medium-hide"
            >Run automatically when code changes.
          </md-tooltip>
          AutoRun
        </md-switch>

        <md-button @click="run()" class="md-icon-button">
          <md-icon>play_arrow</md-icon>
          <md-tooltip class="md-medium-hide"
            >Save and run this plugin (Ctrl+E)</md-tooltip
          >
        </md-button>
        <md-button @click="save()" class="md-icon-button">
          <md-icon>save</md-icon>
          <md-tooltip class="md-medium-hide"
            >Save this plugin (Ctrl+S)</md-tooltip
          >
        </md-button>
        <md-button @click="saveAs()" class="md-icon-button">
          <md-icon>cloud_download</md-icon>
          <md-tooltip>Export this plugin</md-tooltip>
        </md-button>
        <md-button
          @click="remove()"
          v-if="window && window.config && window.config._id"
          class="md-icon-button"
        >
          <md-icon>delete</md-icon>
          <md-tooltip>Remove this plugin</md-tooltip>
        </md-button>
        <md-field
          style="max-width: 100px;"
          v-if="
            this.editor &&
              window &&
              window.config &&
              window.config.tags &&
              window.config.tags.length > 0
          "
        >
          <md-select
            id="tag"
            @md-selected="
              window.config.tags.includes(window.config.tag) && reload()
            "
            v-model="window.config.tag"
            name="tag"
          >
            <md-option
              :value="tag"
              v-for="tag in window.config.tags"
              :key="tag"
              >{{ tag }}</md-option
            >
          </md-select>
          <md-tooltip
            >Select a tag for testing, the plugin will be reloaded.</md-tooltip
          >
        </md-field>
        <md-field
          style="max-width: 220px;"
          v-if="
            this.editor &&
              window &&
              window.config &&
              window.config.engine_mode &&
              window.engine_manager
          "
        >
          <md-select
            id="engine_mode"
            @md-selected="reload()"
            v-model="window.config.engine_mode"
            name="tag"
          >
            <md-option value="auto">auto</md-option>
            <md-option
              :value="e.name"
              v-for="e in window.engine_manager.matchEngineByType(
                window.config.type
              )"
              :key="e.name"
              >{{ e.name }}</md-option
            >
          </md-select>
          <md-tooltip
            >Select an engine, the plugin will be reloaded.</md-tooltip
          >
        </md-field>
      </div>
    </md-toolbar>
    <div
      class="code_editor"
      :class="window ? 'editor-with-toolbar' : 'editor-without-toolbar'"
      ref="code_editor"
      style='width="auto";height="auto"'
    ></div>
  </div>
</template>

<script>
import { saveAs } from "file-saver";
import axios from "axios";

import { randId, assert } from "../utils.js";

import * as monaco from "monaco-editor";

import SparkMD5 from "spark-md5";

window.MonacoEnvironment = {
  getWorkerUrl: function() {
    var fullPath =
      location.protocol +
      "//" +
      location.hostname +
      (location.port ? ":" + location.port : "");
    return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
      self.MonacoEnvironment = {
        baseUrl: '${fullPath}/static'
      };
      try {
        importScripts('${fullPath}/static/vs/base/worker/workerMain.js');
      } catch (e) {
        console.error(e)
      } finally {

      }
      `)}`;
  },
};

export default {
  name: "joy",
  props: ["value", "title", "pluginId", "window"],
  data() {
    return {
      codeValue: "",
      editor: null,
      saved: false,
      code_origin: null,
      watch_file: false,
      run_changed_file: false,
      loading: false,
      watch_timer: null,
      lastModified: null,
      local_file: null,
    };
  },
  created() {
    this.store = this.$root.$data.store;
    this.event_bus = this.$root.$data.store && this.$root.$data.store.event_bus;
    if (this.event_bus) this.event_bus.on("resize", this.updateSize);
  },
  beforeDestroy() {
    if (this.event_bus) this.event_bus.off("resize", this.updateSize);
    if (this.watch_timer) {
      window.clearInterval(this.watch_timer);
    }
  },
  mounted() {
    this.$el.addEventListener("touchmove", function(ev) {
      ev.preventDefault();
    });
    this.codeValue = this.value;
    this.editor = monaco.editor.create(this.$refs.code_editor, {
      value: this.codeValue,
      language: "html",
      minimap: {
        enabled: this.$el.clientWidth > 500,
      },
    });

    this.window.api.on("refresh", () => {
      this.editor.layout();
    });

    if (this.window) {
      this.window.api.on("resize", () => {
        this.$nextTick(this.updateSize);
      });
    }
    this.updateSize();

    this.editor.addCommand(
      window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KEY_S,
      () => {
        this.save();
      }
    );
    this.editor.addCommand(
      window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KEY_E,
      () => {
        this.run();
      }
    );
    this.editor.addCommand(
      window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KEY_L,
      () => {
        this.loadCodeFromURL();
      }
    );
  },
  methods: {
    updateSize() {
      if (this.editor) {
        const medianScreen = this.$el.clientWidth > 500;
        const bigScreen = this.$el.clientWidth > 900;
        this.editor.updateOptions({
          minimap: {
            enabled: bigScreen,
          },
          lineNumbers: medianScreen ? "on" : "off",
          folding: medianScreen,
          lineDecorationsWidth: medianScreen ? 5 : 2,
        });
        this.editor.layout();
        setTimeout(() => {
          this.editor.layout();
          this.window.refresh();
        }, 200);
        setTimeout(() => {
          this.editor.layout();
          this.window.refresh();
        }, 500);
      }
    },
    save() {
      assert(this.window.plugin_manager);
      return new Promise((resolve, reject) => {
        if (!this.editor) {
          reject("editor is not available");
          return;
        }
        this.codeValue = this.editor.getValue();
        this.$emit("input", this.codeValue);
        this.window.plugin_manager
          .savePlugin({
            pluginId: this.pluginId,
            code: this.codeValue,
            tag: this.window.config && this.window.config.tag,
            origin: this.window.config && this.window.config.origin,
          })
          .then(config => {
            this.window.data.config = config;
            this.saved = true;
            this.reload()
              .catch(() => {
                this.window.config = config;
              })
              .finally(() => {
                this.window.data._id = config._id;
                this.window.name = "Edit-" + config.name;
                this.window.data._name = config.name;
                this.$forceUpdate();
                resolve();
              });
          });
      });
    },
    fileSelected() {
      this.lastModified = null;
      if (!this.$refs.file_select.files) return;
      this.local_file = this.$refs.file_select.files[0];
      this.loadCodeFromFile(this.local_file, false);
    },
    watchModeChanged() {
      if (this.watch_file) {
        this.editor.updateOptions({ readOnly: true });
        this.lastModified = "old";
        this.watch_timer = setInterval(() => {
          this.$forceUpdate();
          if (this.code_origin) {
            this.loadCodeFromURL();
          } else {
            this.loadCodeFromFile(this.local_file, true);
          }
        }, 1000);
      } else {
        this.editor.updateOptions({ readOnly: false });
        if (this.watch_timer) {
          window.clearInterval(this.watch_timer);
          this.watch_timer = null;
        }
        this.loading = false;
        this.run_changed_file = false;
        this.$forceUpdate();
      }
    },
    loadCodeFromFile(file, save) {
      file = file || this.local_file;
      if (!file) return;
      this.code_origin = null;

      const reader = new FileReader();
      reader.onload = () => {
        this.local_file = file;
        try {
          const code = reader.result;
          if (
            this.lastModified != file.lastModified ||
            SparkMD5.hash(code) !== SparkMD5.hash(this.editor.getValue())
          ) {
            this.lastModified = file.lastModified;
            this.loading = true;
            this.$forceUpdate();
            this.window.plugin_manager.parsePluginCode(code);
            this.editor.setValue(code);
            if (this.run_changed_file) {
              this.run();
            } else if (save) {
              this.save();
            }
          }
        } catch (e) {
          this.window.plugin_manager.showMessage(
            `Failed to load plugin source code, error: ${e}`
          );
        } finally {
          if (this.loading) {
            setTimeout(() => {
              this.loading = false;
              this.$forceUpdate();
            }, 1000);
          }
        }
      };
      reader.onerror = e => {
        console.error(e);
        this.window.plugin_manager.showMessage(
          `Failed to load plugin source code, error: ${e}`
        );
        if (this.watch_timer) {
          clearInterval(this.watch_timer);
        }
        this.watch_file = false;
        this.$forceUpdate();
      };
      reader.readAsText(file);
    },
    async openEngineFile(fileObj) {
      const api = this.window.plugin_manager.imjoy_api;
      try {
        const retObj =
          fileObj ||
          (await api.showFileDialog(null, {
            title: "Load plugin source file",
            uri_type: "url",
            mode: "single",
            type: "file",
          }));
        this.code_origin = retObj;
        this.$refs.file_select.value = "";
        this.loadCodeFromURL();
      } catch (e) {
        this.window.plugin_manager.showMessage(
          `Failed to load plugin source code, error: ${e}`
        );
      }
    },
    async loadCodeFromURL() {
      if (!this.code_origin || !this.code_origin.url) return;
      try {
        const response = await axios.get(this.code_origin.url + "?" + randId());
        if (response && response.data) {
          const code = response.data;
          if (SparkMD5.hash(code) !== SparkMD5.hash(this.editor.getValue())) {
            this.loading = true;
            this.$forceUpdate();
            const config = this.window.plugin_manager.parsePluginCode(code);
            this.window.name = config.name;
            this.editor.setValue(code);
            if (this.run_changed_file) {
              this.run();
            } else {
              this.save();
            }
          }
        } else {
          this.window.plugin_manager.showMessage(
            "Failed to load plugin source code."
          );
        }
      } catch (e) {
        this.window.plugin_manager.showMessage(
          `Failed to load plugin source code, error: ${e}`
        );
      } finally {
        if (this.loading) {
          setTimeout(() => {
            this.loading = false;
            this.$forceUpdate();
          }, 1000);
        }
      }
    },
    async run() {
      assert(this.window.plugin_manager);
      await this.save();
      let config = {};
      const plugin = this.window.plugin;

      if (!plugin || !plugin.api) {
        console.error("plugin is not loaded.");
        return;
      }

      if (
        this.window_plugin_id &&
        !this.window.plugin_manager.wm.window_ids[this.window_plugin_id]
      ) {
        this.window_plugin_id = null;
      }
      if (!this.window_plugin_id && plugin.config && plugin.config.ui) {
        //show dialog only when there is input field in the ui string
        if (plugin.config.ui.indexOf("{") > -1) {
          config = await this.window.plugin_manager.imjoy_api.showDialog(
            plugin,
            plugin.config
          );
        } else {
          config = {};
        }
      } else {
        config = this.window_plugin_config;
      }
      if (this.window_plugin_id) {
        const node = document.getElementById("iframe_" + this.window_plugin_id);
        if (node) node.parentNode.removeChild(node);
      }
      const w = await plugin.api.run({
        id: this.window_plugin_id,
        config: config,
        data: {},
      });
      if (
        (plugin.config && plugin.config.type === "window") ||
        plugin.config.type === "web-python-window"
      ) {
        this.window_plugin_id = w && w.__id__;
        this.window_plugin_config = config;
      }
    },
    remove() {
      assert(this.window.plugin_manager);
      this.codeValue = this.editor.getValue();
      this.$emit("input", this.codeValue);
      this.window.data._id = null;
      this.window.plugin_manager.removePlugin(this.window.config).then(() => {
        this.window.config = {};
        this.window.plugin = null;
      });
    },
    reload() {
      assert(this.window.plugin_manager);
      this.$forceUpdate();
      return new Promise((resolve, reject) => {
        if (!this.editor) {
          reject("editor is not available.");
          return;
        }
        this.codeValue = this.editor.getValue();
        if (this.codeValue) {
          this.$emit("input", this.codeValue);
          if (this.window.config) {
            this.window.config.code = this.codeValue;
          }
          let newTag = this.window.config.tag;
          const config = this.window.data && this.window.data.config;
          if (config && this.window.config && this.window.config.tag) {
            if (
              !this.window.data.config.tags.includes(this.window.config.tag)
            ) {
              newTag = this.window.data.config.tags[0];
            }
          }
          const engine_mode =
            this.window.config && this.window.config.engine_mode;
          this.window.plugin_manager
            .reloadPlugin({
              _id: this.window.data._id,
              engine_mode: engine_mode,
              tag: newTag,
              name: this.window.data._name,
              code: this.codeValue,
              origin: this.window.config && this.window.config.origin,
            })
            .then(plugin => {
              this.window.config = plugin.config;
              this.window.plugin = plugin;
              this.$forceUpdate();
              resolve();
            })
            .catch(e => {
              reject(e);
            });
        }
      });
    },
    saveAs() {
      this.codeValue = this.editor.getValue();
      this.$emit("input", this.codeValue);
      const filename =
        this.window && this.window.config && this.window.config.name
          ? this.window.config.name + "_" + randId() + ".imjoy.html"
          : "plugin_" + randId() + ".imjoy.html";
      const file = new Blob([this.codeValue], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(file, filename);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.editor-with-toolbar {
  overflow: hidden;
  /* height: 100%; */
  /* width: 600px; */
  /* width: 100%; */
  height: calc(100% - 40px);
}

.editor-without-toolbar {
  overflow: hidden;
  /* height: 100%; */
  /* width: 600px; */
  /* width: 100%; */
  height: calc(100%);
}

.editor-toolbar {
  padding: 0px;
  min-height: 40px !important;
  height: 40px !important;
}

.floating {
  position: absolute !important;
  left: calc(50% - 1.5rem) !important;
  top: calc(39% - 1.5rem) !important;
  z-index: 999;
}

.floating-text {
  position: absolute !important;
  left: calc(50% - 85px) !important;
  top: calc(42%) !important;
  z-index: 999;
  font-size: 1rem;
}

.md-switch {
  margin-right: 3px;
}

/*

.plugin-editor {
  display: flex;
  width: 100%;
  height: calc(100% + 5px);
  flex-direction: column;
  overflow: auto;
}
.editor::-webkit-scrollbar {
 display: none;
} */
</style>
