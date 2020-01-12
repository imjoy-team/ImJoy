<template>
    <md-dialog
      class="plugin-dialog"
      :md-active.sync="showAddPluginDialog"
      :md-click-outside-to-close="show_close"
    >
      <md-dialog-title
        >{{
          plugin4install ? "Plugin Installation" : "ImJoy Plugin Management"
        }}
        <md-button
          v-if="show_close"
          class="md-accent"
          style="position:absolute; top:8px; right:5px;"
          @click="close()"
          ><md-icon>clear</md-icon></md-button
        ></md-dialog-title
      >
      <md-dialog-content>
        <template v-if="show_plugin_templates">
          <md-menu>
            <md-button class="md-primary md-raised" md-menu-trigger>
              <md-icon>add</md-icon>Create a new plugin
              <md-tooltip>Create a new plugin</md-tooltip>
            </md-button>
            <md-menu-content>
              <md-menu-item
                @click="
                  newPlugin(template.code);
                  showAddPluginDialog = false;
                "
                v-for="template in plugin_templates"
                :key="template.name"
              >
                <md-icon>{{ template.icon }}</md-icon
                >{{ template.name }}
              </md-menu-item>
            </md-menu-content>
          </md-menu>
          <br />
          <br />
        </template>

        <!-- <md-switch v-if="pm.installed_plugins.length>0 && !plugin4install && !downloading_error && !downloading_plugin" v-model="show_installed_plugins">Show Installed Plugins</md-switch> -->
        <!-- <md-card v-if="show_installed_plugins">
        <md-card-header>
          <div class="md-title">Installed Plugins</div>
        </md-card-header>
        <md-card-content>
          <plugin-list name="Installed Plugins" description="" v-if="pm" :plugin-manager="pm" @message="showMessage" :plugins="pm.installed_plugins" :workspace="pm.selected_workspace"></plugin-list>
        </md-card-content>
      </md-card> -->
        <md-card v-if="show_plugin_url">
          <md-card-header>
            <div class="md-title">Install from URL</div>
            <md-toolbar md-elevation="0">
              <md-field md-clearable class="md-toolbar-section-start">
                <md-icon>cloud_download</md-icon>
                <md-input
                  placeholder="Please paste the URL here and press enter."
                  type="text"
                  v-model="plugin_url"
                  @keyup.enter="
                    tag4install = '';
                    getPlugin4Install(plugin_url);
                  "
                  name="plugin_url"
                ></md-input>
                <md-tooltip>Press `Enter` to get the plugin</md-tooltip>
              </md-field>
            </md-toolbar>
          </md-card-header>
        </md-card>
        <div
          v-if="downloading_plugin && !plugin4install"
          class="md-toolbar-section-center"
        >
          <div style="padding-right: 30px;" class="loading loading-lg"></div>
        </div>
        <h2 v-if="downloading_error">&nbsp;&nbsp;{{ downloading_error }}</h2>
        <md-card v-if="plugin4install">
          <md-card-media
            v-if="
              plugin4install.cover && typeof plugin4install.cover === 'string'
            "
            md-ratio="16:9"
          >
            <img :src="plugin4install.cover" alt="plugin-cover" />
          </md-card-media>
          <div class="carousel" v-else-if="plugin4install.cover">
            <!-- carousel locator -->
            <input
              v-once
              class="carousel-locator"
              v-for="(c, k) in plugin4install.cover"
              :key="k"
              :id="'slide-' + k"
              type="radio"
              name="carousel-radio"
              hidden=""
              :checked="k === 1"
            />
            <!-- carousel container -->
            <div class="carousel-container">
              <!-- carousel item -->
              <figure
                class="carousel-item"
                v-for="(c, k) in plugin4install.cover"
                :key="k"
              >
                <img
                  class="img-responsive rounded"
                  :src="c"
                  alt="plugin cover"
                />
              </figure>
            </div>
            <!-- carousel navigation -->
            <div class="carousel-nav">
              <label
                class="nav-item text-hide c-hand"
                v-for="(c, k) in plugin4install.cover"
                :key="k"
                :for="'slide-' + k"
                >{{ k }}</label
              >
            </div>
          </div>
          <md-card-header>
            <md-toolbar md-elevation="0">
              <div>
                <h2>
                  <md-icon v-if="plugin4install.icon">{{
                    plugin4install.icon
                  }}</md-icon
                  ><md-icon v-else>extension</md-icon>
                  {{ plugin4install.name + " " + plugin4install.badges }}
                </h2>
              </div>
              <div v-if="installing" class="md-toolbar-section-end">
                <div
                  style="padding-right: 30px;"
                  class="loading loading-lg"
                ></div>
              </div>
              <div v-else-if="tag4install" class="md-toolbar-section-end">
                <md-button
                  class="md-button md-primary"
                  @click="installPlugin(plugin4install, tag4install)"
                >
                  <md-icon>cloud_download</md-icon
                  >{{ plugin4install._installation_text || "Install" }}
                  <md-tooltip
                    >Install {{ plugin4install.name }} (tag=`{{
                      tag4install
                    }}`)</md-tooltip
                  >
                </md-button>
              </div>
              <div v-else class="md-toolbar-section-end">
                <md-menu
                  v-if="plugin4install.tags && plugin4install.tags.length > 0"
                >
                  <md-button class="md-button md-primary" md-menu-trigger>
                    <md-icon>cloud_download</md-icon
                    >{{ plugin4install._installation_text || "Install" }}
                    <md-tooltip
                      >Choose a tag to install
                      {{ plugin4install.name }}</md-tooltip
                    >
                  </md-button>
                  <md-menu-content>
                    <md-menu-item
                      v-for="tag in plugin4install.tags"
                      :key="tag"
                      @click="installPlugin(plugin4install, tag)"
                    >
                      <md-icon>cloud_download</md-icon>{{ tag }}
                    </md-menu-item>
                  </md-menu-content>
                </md-menu>
                <md-button
                  v-else
                  class="md-button md-primary"
                  @click="installPlugin(plugin4install)"
                >
                  <md-icon>cloud_download</md-icon
                  >{{ plugin4install._installation_text || "Install" }}
                </md-button>
              </div>
            </md-toolbar>
          </md-card-header>
          <md-card-content>
            <p>Version: {{ plugin4install.version }}</p>
            <p>{{ plugin4install.description }}</p>
            <md-chip
              v-for="tag in plugin4install.tags"
              @click="tag4install = tag"
              :class="tag4install === tag ? 'md-primary' : ''"
              :key="tag"
              >{{ tag }}</md-chip
            >
            <!-- <md-button class="md-button md-primary" @click="showCode(plugin4install)">
            <md-icon>code</md-icon>Code
          </md-button> -->
            <br />
            <md-switch v-if="plugin4install.code" v-model="show_plugin_source"
              >Show plugin source code</md-switch
            >
            <p>
              This plugin is <strong>NOT</strong> provided by ImJoy.io. Please
              make sure the plugin is provided by a trusted source, otherwise it
              may <strong>harm</strong> your computer.
            </p>
            <plugin-editor
              v-if="show_plugin_source"
              class="code-editor"
              v-model="plugin4install.code"
              :title="plugin4install.name"
            ></plugin-editor>
          </md-card-content>
        </md-card>
        <md-card v-show="show_plugin_store">
          <md-card-header v-if="pm">
            <div class="md-title">Install from the plugin repository</div>
            <md-chips
              @md-insert="pm.addRepository($event)"
              @md-delete="pm.removeRepository(getRepository($event))"
              class="md-primary shake-on-error"
              v-model="pm.repository_names"
              md-placeholder="Add a repository url (e.g. GITHUB REPO) and press enter."
            >
              <template slot="md-chip" slot-scope="{ chip }">
                <strong
                  class="md-primary"
                  v-if="
                    pm.selected_repository &&
                      chip === pm.selected_repository.name
                  "
                  >{{ chip }}</strong
                >
                <div v-else @click="selectRepository(chip)">{{ chip }}</div>
              </template>
              <div class="md-helper-text" v-if="pm.selected_repository">
                {{ pm.selected_repository.name }}:
                {{ pm.selected_repository.description }}
              </div>
            </md-chips>
          </md-card-header>
          <md-card-content>
            <plugin-list
              @message="showMessage"
              v-if="pm"
              :plugin-manager="pm"
              :init-search="init_plugin_search"
              :plugins="pm.available_plugins"
              :workspace="pm.selected_workspace"
            ></plugin-list>
          </md-card-content>
        </md-card>
      </md-dialog-content>
    </md-dialog>
</template>

<script>
import { PluginManager } from "../pluginManager.js";
import { EngineManager } from "../engineManager.js";
import WEB_WORKER_PLUGIN_TEMPLATE from "../plugins/webWorkerTemplate.imjoy.html";
import NATIVE_PYTHON_PLUGIN_TEMPLATE from "../plugins/nativePythonTemplate.imjoy.html";
import WEB_PYTHON_PLUGIN_TEMPLATE from "../plugins/webPythonTemplate.imjoy.html";
import WINDOW_PLUGIN_TEMPLATE from "../plugins/windowTemplate.imjoy.html";
import { randId } from "../utils.js";
import Minibus from "minibus";
import { ImJoy } from "../imjoyLib.js";

export default {
  name: "plugin-dialog",
  props: {
    pluginManager: {
      type: [PluginManager, Object],
      default: null,
    },
    engineManager: {
      type: [EngineManager, Object],
      default: null,
    },
  },
  data() {
    return {
      pm: null,
      em: null,
      plugin_templates: [],
      showAddPluginDialog: false,
      plugin4install: null,
      plugin_url: null,
      downloading_plugin: false,
      downloading_error: "",
      show_plugin_source: false,
      init_plugin_search: null,
      show_plugin_templates: true,
      show_plugin_store: true,
      show_plugin_url: true,
      show_installed_plugins: false,
      show_close: true,
      installing: false,
    };
  },
  created() {
    this.event_bus =
      (this.$root.$data.store && this.$root.$data.store.event_bus) ||
      Minibus.create();
  },
  mounted() {
    this.showAddPluginDialog = false;
    this.pm = this.pluginManager;
    this.em = this.engineManager;
    this.plugin_templates = [
      {
        name: "Default template",
        code: WEB_WORKER_PLUGIN_TEMPLATE,
        icon: "code",
      },
      {
        name: "Web Worker (JS)",
        code: WEB_WORKER_PLUGIN_TEMPLATE,
        icon: "swap_horiz",
      },
      {
        name: "Window (HTML/CSS/JS)",
        code: WINDOW_PLUGIN_TEMPLATE,
        icon: "picture_in_picture",
      },
      {
        name: "Native Python",
        code: NATIVE_PYTHON_PLUGIN_TEMPLATE,
        icon: "🚀",
      },
      // {name: "Iframe(Javascript)", code: IFRAME_PLUGIN_TEMPLATE},
      { name: "Web Python", code: WEB_PYTHON_PLUGIN_TEMPLATE, icon: "🐍" },
    ];
    if (window.opener) {
      if (!this.pm) {
        const client_id = localStorage.getItem("imjoy_client_id");
        const imjoy = new ImJoy({
          imjoy_api: {},
          event_bus: this.event_bus,
          show_message_callback: msg => {
            alert(msg);
          },
          update_ui_callback: () => {
            this.$forceUpdate();
          },
          client_id: client_id,
        });
        this.pm = imjoy.pm;
        this.em = imjoy.em;
        imjoy.init().then(async () => {
          await this.pm.loadWorkspace("default");
          this.show_close = false;
          this.downloading_error = "";
          this.downloading_plugin = false;
          this.showAddPluginDialog = true;
          this.show_plugin_templates = false;
          this.show_plugin_store = false;
          this.show_plugin_url = false;
          window.addEventListener("message", ev => {
            if (ev.data.type === "load-imjoy-plugin") {
              const code = ev.data.code;
              let config = this.pm.parsePluginCode(code);
              this.plugin4install = config;
              this.tag4install = config.tag;
              this.downloading_plugin = false;
              this.$forceUpdate();
            }
          });
          window.opener.postMessage({ type: "imjoy-app-ready" }, "*");
        });
      }
    }
    this.event_bus.on("update_preview", config => {
      for (let k in config) {
        this[k] = config[k];
      }
    });
  },
  methods: {
    installPlugin(plugin4install, tag4install) {
      this.installing = true;
      plugin4install.tag = tag4install;
      this.pm
        .savePlugin(plugin4install)
        .then(() => {
          this.close();
          this.$router.push({
            name: "app",
          });
        })
        .finally(() => {
          this.installing = false;
        });
    },
    showMessage(msg) {
      alert(msg);
    },
    newPlugin(code) {
      const w = {
        name: "New Plugin",
        type: "imjoy/plugin-editor",
        config: {},
        plugin_manager: this.pm,
        engine_manager: this.em,
        w: 30,
        h: 20,
        standalone: this.screenWidth < 1200,
        plugin: null,
        data: {
          name: "new plugin",
          id: "plugin_" + randId(),
          code: JSON.parse(JSON.stringify(code)),
        },
      };
      this.pm.createWindow(null, w);
    },
    close() {
      this.showAddPluginDialog = false;
      const query = Object.assign({}, this.$route.query);
      // delete query.p;
      // delete query.plugin;
      delete query.upgrade;
      this.$router.replace({ query });
      this.$forceUpdate();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.plugin-dialog {
  width: 80%;
  max-width: 800px;
  max-height: 90%;
}

@media screen and (max-width: 700px) {
  .plugin-dialog {
    width: 100% !important;
    max-width: 100% !important;
  }
}

@media screen and (max-height: 900px) {
  .plugin-dialog {
    max-height: 100%;
  }
}

.carousel .carousel-nav .nav-item {
  color: rgba(5, 142, 255, 0.5);
}
.carousel .carousel-nav .nav-item::before {
  height: 0.15rem;
}

.code-editor {
  height: 500px;
}
</style>
