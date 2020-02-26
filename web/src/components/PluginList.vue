<template>
  <div class="plugin-list" ref="container">
    <!-- <md-subheader>Options</md-subheader> -->
    <md-subheader v-if="title"
      >{{ title }} <span v-if="name">{{ name }}</span>
    </md-subheader>
    <p v-if="description">{{ description }}</p>
    <md-toolbar md-elevation="0">
      <md-field md-clearable class="md-toolbar-section-start">
        <md-icon>search</md-icon>
        <md-input
          placeholder="Search by name..."
          v-model="search"
          @input="searchPlugin"
        />
      </md-field>
      <md-button
        v-show="!search && pm && pm.installPlugin"
        @click="updateAll()"
        class="md-button md-primary"
        :disabled="loading"
      >
        <md-icon>update</md-icon><span class="md-small-hide">Update All</span>
      </md-button>
    </md-toolbar>
    <div
      v-if="loading"
      style="left: -30px"
      class="loading loading-lg floating"
    ></div>
    <md-list class="md-triple-line md-dense">
      <div v-for="(plugin, k) in searched_plugins" :key="k">
        <md-list-item>
          <md-avatar class="md-xsmall-hide">
            <plugin-icon :icon="plugin.icon"></plugin-icon>
          </md-avatar>
          <div class="md-list-item-text">
            <span>{{ plugin.name + " " + plugin.badges }}</span>
            <p>{{ plugin.description }}</p>
            <p>
              <span v-for="tag in plugin.tags" :key="tag">{{ tag }}, </span>
            </p>
          </div>
          <span>
            <md-button
              class="md-icon-button md-list-action md-accent"
              v-if="pm && pm.removePlugin && plugin.installed"
              @click="
                plugin2_remove_ = plugin;
                showRemoveConfirmation = true;
              "
              :disabled="loading"
            >
              <md-icon>delete_forever</md-icon>
              <md-tooltip>Delete {{ plugin.name }}</md-tooltip>
            </md-button>
            <md-menu
              v-if="
                pm &&
                  pm.installPlugin &&
                  !plugin.installed &&
                  plugin.tags &&
                  plugin.tags.length > 0
              "
            >
              <md-button
                class="md-icon-button md-list-action md-primary"
                md-menu-trigger
                :disabled="loading"
              >
                <md-icon>cloud_download</md-icon>
                <md-tooltip>Install {{ plugin.name }}</md-tooltip>
              </md-button>
              <md-menu-content>
                <md-menu-item
                  v-for="tag in plugin.tags"
                  :key="tag"
                  @click="install(plugin, tag)"
                >
                  <md-icon>cloud_download</md-icon>{{ tag }}
                </md-menu-item>
              </md-menu-content>
            </md-menu>
            <md-button
              class="md-icon-button md-list-action md-primary"
              v-else-if="!plugin.installed && pm && pm.installPlugin"
              @click="install(plugin)"
              :disabled="loading"
            >
              <md-icon>cloud_download</md-icon>
              <md-tooltip>Install {{ plugin.name }}</md-tooltip>
            </md-button>
            <md-button
              class="md-icon-button md-list-action md-primary"
              v-if="plugin.installed && pm && pm.installPlugin"
              @click="install(plugin)"
              :disabled="loading"
            >
              <md-icon>update</md-icon>
              <md-tooltip>Update {{ plugin.name }}</md-tooltip>
            </md-button>
          </span>
          <md-menu>
            <md-button
              :disabled="loading"
              class="md-icon-button md-list-action"
              md-menu-trigger
            >
              <md-icon class="md-primary">more_horiz</md-icon>
            </md-button>
            <md-menu-content>
              <md-menu-item @click="showDocs(plugin)">
                <md-icon>description</md-icon>Docs
              </md-menu-item>
              <md-menu-item
                v-if="plugin.installed && pm && pm.installPlugin"
                @click="install(plugin)"
              >
                <md-icon>update</md-icon>Update
              </md-menu-item>
              <md-menu-item
                v-if="plugin.installed && pm && pm.removePlugin"
                @click="
                  plugin2_remove_ = plugin.config;
                  showRemoveConfirmation = true;
                "
              >
                <md-icon>delete_forever</md-icon>Delete
              </md-menu-item>
              <md-menu-item @click="showCode(plugin)">
                <md-icon>code</md-icon>Code
              </md-menu-item>
            </md-menu-content>
          </md-menu>
        </md-list-item>
        <md-divider></md-divider>
      </div>
    </md-list>

    <md-dialog-confirm
      :md-active.sync="showRemoveConfirmation"
      md-title="Removing Plugin"
      md-content="Do you really want to <strong>delete</strong> this plugin"
      md-confirm-text="Yes"
      md-cancel-text="Cancel"
      @md-cancel="showRemoveConfirmation = false"
      @md-confirm="
        remove(plugin2_remove_);
        showRemoveConfirmation = false;
      "
    />

    <md-dialog class="editor-dialog" :md-active.sync="showEditor">
      <md-dialog-title>{{ plugin_name }}</md-dialog-title>
      <md-dialog-content>
        <plugin-editor
          v-if="showEditor"
          class="code-editor"
          v-model="editorCode"
          title="Plugin Editor"
        ></plugin-editor>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="downloadCode()"
          >Download</md-button
        >
        <md-button class="md-primary" @click="showEditor = false"
          >Exit</md-button
        >
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showDocsDialog">
      <md-dialog-content>
        <div
          style="padding-left: 10px; padding-right: 5px;"
          v-if="docs && docs.trim() != ''"
          v-html="sanitizedMarked(docs)"
        ></div>
        <h3 v-else>Oops, this plugin has no documentation!</h3>
      </md-dialog-content>
      <md-dialog-actions>
        <!-- <md-button class="md-primary" @click="downloadCode(); showEditor=false">Save</md-button> -->
        <md-button class="md-primary" @click="showDocsDialog = false"
          >OK</md-button
        >
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import { saveAs } from "file-saver";
import { PluginManager } from "../pluginManager.js";
import axios from "axios";
import marked from "marked";
import DOMPurify from "dompurify";
import _ from "lodash";
import { randId } from "../utils.js";

import { parseComponent } from "../pluginParser.js";

export default {
  name: "plugin-list",
  props: {
    name: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    configUrl: {
      type: String,
      default: null,
    },
    pluginManager: {
      type: [PluginManager, Object],
      default: null,
    },
    workspace: {
      type: String,
      default: "default",
    },
    title: {
      type: String,
      default: null,
    },
    initSearch: {
      type: String,
      default: null,
    },
    center: {
      type: Boolean,
      default: true,
    },
    plugins: {
      type: Array,
      default: function() {
        return null;
      },
    },
  },
  data() {
    return {
      loading: false,
      search: "",
      editorCode: "",
      editorPlugin: null,
      showEditor: false,
      plugin_name: "",
      containerWidth: 500,
      uri_root: null,
      plugin_dir: null,
      manifest: null,
      available_plugins: [],
      searched_plugins: [],
      showRemoveConfirmation: false,
      plugin2_remove_: null,
      showDocsDialog: false,
      docs: null,
      pm: null,
    };
  },
  created() {
    this.event_bus = this.$root.$data.store && this.$root.$data.store.event_bus;
    //open link in a new tab
    const renderer = new marked.Renderer();
    renderer.link = function(href, title, text) {
      var link = marked.Renderer.prototype.link.call(this, href, title, text);
      return link.replace("<a", "<a target='_blank' ");
    };
    marked.setOptions({
      renderer: renderer,
    });
    DOMPurify.addHook("afterSanitizeAttributes", function(node) {
      // set all elements owning target to target=_blank
      if ("target" in node) {
        node.setAttribute("target", "_blank");
        // prevent https://www.owasp.org/index.php/Reverse_Tabnabbing
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
    this.sanitizedMarked = mk => {
      return DOMPurify.sanitize(marked(mk));
    };
  },
  mounted() {
    this.search = this.initSearch || "";
    this.containerWidth = this.$refs.container.offsetWidth;
    this.event_bus.on("resize", this.updateSize);
    this.pm = this.pluginManager;

    if (this.plugins) {
      this.available_plugins = this.plugins;
      this.searched_plugins = this.plugins;
      if (this.search) {
        this.searchPlugin();
      }
    } else if (this.configUrl) {
      let uri = this.configUrl;
      //if the file is from github or gist, then add random query string to avoid browser caching
      if (
        (uri.startsWith("https://raw.githubusercontent.com") ||
          uri.startsWith("https://gist.githubusercontent.com")) &&
        uri.indexOf("?") === -1
      ) {
        uri = uri + "?" + randId();
      }
      axios.get(uri).then(response => {
        if (response && response.data && response.data.plugins) {
          this.manifest = response.data;
          this.available_plugins = this.manifest.plugins;
          this.searched_plugins = this.manifest.plugins;
          let uri_root = this.manifest.uri_root;
          if (!uri_root.startsWith("http")) {
            uri_root = this.configUrl.replace(
              new RegExp("manifest.imjoy.json$"),
              _.trim(uri_root, "/")
            );
          }
          for (let i = 0; i < this.available_plugins.length; i++) {
            const p = this.available_plugins[i];
            p.uri = p.uri || p.name + ".html";
            if (!p.uri.startsWith(uri_root) && !p.uri.startsWith("http")) {
              p.uri = uri_root + "/" + p.uri;
            }
            p._id = p._id || p.name.replace(/ /g, "_");
          }
          this.plugin_dir = this.manifest.uri_root;
          if (this.plugin_dir) {
            this.uri_root = location.protocol + "//" + location.host;
            if (!this.plugin_dir.startsWith("http")) {
              this.plugin_dir = this.uri_root + this.plugin_dir;
            }
          } else {
            this.uri_root = "";
            this.plugin_dir = "";
          }
          if (this.search) {
            this.searchPlugin();
          }
        }
      });
    }
  },
  beforeDestroy() {
    this.event_bus.off("resize", this.updateSize);
  },
  watch: {
    plugins: {
      handler: function(newValue) {
        this.$data.available_plugins = newValue;
        this.$data.searched_plugins = newValue;
      },
      deep: true,
    },
  },
  methods: {
    toLower(text) {
      return text.toString().toLowerCase();
    },
    searchByName(items, term) {
      if (term) {
        return items.filter(item =>
          this.toLower(item.name + " " + item.description).includes(
            this.toLower(term)
          )
        );
      }
      return items;
    },
    searchPlugin() {
      this.searched_plugins = this.searchByName(
        this.available_plugins,
        this.search
      );
    },
    updateSize() {
      this.containerWidth = this.$refs.container.offsetWidth;
    },
    downloadCode() {
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
    showDocs(plugin) {
      if (plugin.installed) {
        this.pm
          .getPluginDocs(plugin._id)
          .then(docs => {
            this.docs = docs;
            this.showDocsDialog = true;
            this.$forceUpdate();
          })
          .catch(err => {
            console.log("error occured when editing ", plugin.name, err);
          });
      } else {
        let uri = plugin.uri;
        //if the file is from github or gist, then add random query string to avoid browser caching
        if (
          (uri.startsWith("https://raw.githubusercontent.com") ||
            uri.startsWith("https://gist.githubusercontent.com")) &&
          uri.indexOf("?") === -1
        ) {
          uri = uri + "?" + randId();
        }
        axios.get(uri).then(response => {
          if (!response || !response.data) {
            alert("failed to get plugin code from " + uri);
            return;
          }
          const pluginComp = parseComponent(response.data);
          this.docs =
            pluginComp.docs && pluginComp.docs[0] && pluginComp.docs[0].content;
          this.showDocsDialog = true;
          this.$forceUpdate();
        });
      }
    },
    showCode(plugin) {
      if (plugin.installed) {
        this.pm
          .getPluginSource(plugin._id)
          .then(code => {
            this.editorCode = code;
            this.editorPlugin = plugin;
            this.plugin_name = "Plugin Source Code:" + plugin.name;
            this.showEditor = true;
            this.$forceUpdate();
          })
          .catch(err => {
            console.log("error occured when editing ", plugin.name, err);
          });
      } else {
        let uri = plugin.uri;
        //if the file is from github or gist, then add random query string to avoid browser caching
        if (
          (uri.startsWith("https://raw.githubusercontent.com") ||
            uri.startsWith("https://gist.githubusercontent.com")) &&
          uri.indexOf("?") === -1
        ) {
          uri = uri + "?" + randId();
        }
        axios.get(uri).then(response => {
          if (!response || !response.data) {
            alert("failed to get plugin code from " + uri);
            return;
          }
          this.editorCode = response.data;
          this.editorPlugin = plugin;
          this.plugin_name = "Plugin Source Code";
          this.showEditor = true;
          this.$forceUpdate();
        });
      }
    },
    updateAll() {
      const ps = [];
      for (let plugin of this.available_plugins) {
        if (plugin.installed) {
          ps.push(this.install(plugin, plugin.tag));
        }
      }
      Promise.all(ps)
        .then(() => {
          console.log("All plugins updated successfully.");
          this.$emit("message", "All plugins updated successfully.");
        })
        .catch(e => {
          console.error("Plugins updated with error.", e);
          this.$emit("message", "Plugins updated with error.");
        });
    },
    install(pconfig, t) {
      if (this.pm && this.pm.installPlugin) {
        this.loading = true;
        this.$forceUpdate();
        this.pm
          .installPlugin(pconfig, t)
          .then(() => {
            this.$forceUpdate();
          })
          .catch(e => {
            this.$emit("message", e);
            this.$forceUpdate();
          })
          .finally(() => {
            this.loading = false;
            this.$forceUpdate();
          });
      }
    },
    remove(pconfig) {
      if (this.pm) {
        const p = this.pm.removePlugin(pconfig);
        if (p) {
          p.then(() => {
            this.$forceUpdate();
          }).catch(e => {
            this.$emit("message", e);
            this.$forceUpdate();
          });
        }
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.md-card {
  width: 95%;
  /* max-height: 1000px; */
  height: 250px;
  margin-top: 20px;
}

.editor-dialog {
  width: 80%;
  height: 85%;
}

@media screen and (max-width: 600px) {
  .editor-dialog {
    width: 100%;
    height: 100%;
  }
}

.code-editor {
  display: flex;
  width: 100%;
  height: calc(100%);
  flex-direction: column;
  overflow: hidden;
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 2px;
  padding-bottom: 2px;
}

.grid-container {
  width: calc(100%) !important;
}

.md-list {
  max-width: 100%;
}

.md-dialog-content {
  height: 100%;
  padding: 4px;
}

.floating {
  position: absolute !important;
  left: calc(50% - 1.5rem) !important;
  top: calc(5% - 1.5rem) !important;
  z-index: 999;
}
</style>
