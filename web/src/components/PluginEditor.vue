<template>
  <div class="plugin-editor">
    <md-toolbar
      v-if="window"
      class="md-dense editor-toolbar md-layout"
      md-elevation="1"
    >
      <div class="md-toolbar-section-start">
        <md-button @click="run()" class="md-icon-button">
          <md-icon>play_arrow</md-icon>
          <md-tooltip class="md-medium-hide"
            >Run this plugin (Ctrl+E)</md-tooltip
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
          v-if="
            window &&
              window.plugin &&
              window.plugin.config &&
              window.plugin.config._id
          "
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
              window.plugin &&
              window.plugin.tags &&
              window.plugin.tags.length > 0
          "
        >
          <md-select
            id="tag"
            @md-selected="
              window.plugin.tags.includes(window.plugin.tag) && reload()
            "
            v-model="window.plugin.tag"
            name="tag"
          >
            <md-option
              :value="tag"
              v-for="tag in window.plugin.tags"
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
              window.plugin &&
              window.plugin.type === 'native-python' &&
              window.plugin.config &&
              window.engine_manager
          "
        >
          <md-select
            id="engine_mode"
            @md-selected="reload()"
            v-model="window.plugin.config.engine_mode"
            name="tag"
          >
            <md-option value="auto">auto</md-option>
            <md-option
              :value="e.id"
              v-for="e in window.engine_manager.engines"
              :key="e.url"
              >{{ e.url }}</md-option
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
import { randId, assert } from "../utils.js";

import * as monaco from "monaco-editor";

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
    };
  },
  created() {
    this.store = this.$root.$data.store;
    this.event_bus = this.$root.$data.store && this.$root.$data.store.event_bus;
    if (this.event_bus) this.event_bus.$on("resize", this.updateSize);
  },
  beforeDestroy() {
    if (this.event_bus) this.event_bus.$off("resize", this.updateSize);
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

    this.window.onRefresh(() => {
      this.editor.layout();
    });

    if (this.window) {
      this.window.onResize(() => {
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
          glyphMargin: medianScreen,
          folding: medianScreen,
          lineDecorationsWidth: medianScreen ? 5 : 2,
          lineNumbersMinChars: 0,
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
            tag: this.window.plugin && this.window.plugin.tag,
          })
          .then(config => {
            // this.window.data._id = config._id
            // this.window.plugin._id = config._id
            // this.window.plugin.config._id= config._id
            this.window.data.config = config;
            this.saved = true;
            this.reload()
              .catch(() => {
                this.window.plugin = { config: config };
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
    async run() {
      assert(this.window.plugin_manager);
      await this.save();
      let config = {};
      const plugin = this.window.plugin;
      if (!plugin || !plugin.api) {
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
        this.window_plugin_id = w.__id__;
        this.window_plugin_config = config;
      }
    },
    remove() {
      assert(this.window.plugin_manager);
      this.codeValue = this.editor.getValue();
      this.$emit("input", this.codeValue);
      this.window.data._id = null;
      this.window.plugin_manager
        .removePlugin(this.window.plugin.config)
        .then(() => {
          this.window.plugin = {};
        });
    },
    reload() {
      assert(this.window.plugin_manager);

      return new Promise((resolve, reject) => {
        if (!this.editor || !this.saved) {
          reject("editor is not available or never saved");
          return;
        }
        this.codeValue = this.editor.getValue();
        if (this.codeValue) {
          this.$emit("input", this.codeValue);
          if (this.window.plugin && this.window.plugin.config) {
            this.window.plugin.config.code = this.codeValue;
          }
          let newTag = this.window.plugin.tag;
          const config = this.window.data && this.window.data.config;
          if (config && this.window.plugin && this.window.plugin.tag) {
            if (
              !this.window.data.config.tags.includes(this.window.plugin.tag)
            ) {
              newTag = this.window.data.config.tags[0];
            }
          }
          const engine_mode =
            this.window.plugin &&
            this.window.plugin.config &&
            this.window.plugin.config.engine_mode;
          this.window.plugin_manager
            .reloadPlugin({
              _id: this.window.data._id,
              engine_mode: engine_mode,
              tag: newTag,
              name: this.window.data._name,
              code: this.codeValue,
            })
            .then(plugin => {
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
        this.window && this.window.plugin && this.window.plugin.name
          ? this.window.plugin.name + "_" + randId() + ".imjoy.html"
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
