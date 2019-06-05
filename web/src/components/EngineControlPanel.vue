<template>
  <div class="engine-control-panel">
    <md-button
      class="md-icon-button md-primary"
      v-if="!engineManager.engines || engineManager.engines.length == 0"
      @click="showAddEngine()"
    >
      <md-icon>🚀</md-icon>
      <md-tooltip>Connection to the Plugin Engine</md-tooltip>
    </md-button>
    <md-menu
      v-else
      md-size="big"
      md-direction="top-start"
      @md-closed="collapseProcesses()"
    >
      <md-button class="md-icon-button md-primary" md-menu-trigger>
        <md-icon>🚀</md-icon>
        <md-tooltip>ImJoy Plugin Engines</md-tooltip>
      </md-button>
      <md-menu-content class="engine-panel">
        <md-menu-item @click="showAddEngineDialog = true">
          <md-icon style="margin: 16px;">add</md-icon>
          <span>Add Plugin Engine 🚀</span>
        </md-menu-item>
        <template v-for="engine in engineManager.engines">
          <!-- <md-divider></md-divider> -->
          <md-menu-item @click="showInfo(engine)" :key="engine.url">
            <md-button
              v-if="
                engine.show_processes &&
                  engine.plugin_processes &&
                  engine.plugin_processes.length > 0
              "
              @click.stop="hide(engine)"
              class="md-icon-button md-primary median-icon-button"
            >
              <md-icon>remove</md-icon>
            </md-button>
            <md-button
              v-else
              @click.stop="expand(engine)"
              class="md-icon-button  median-icon-button"
              :class="engine.connected ? 'md-primary md-raised' : ''"
              :disabled="!engine.connected"
            >
              <md-icon v-if="engine.connected">autorenew</md-icon>
              <md-icon v-else>sync_disabled</md-icon>
              <md-tooltip
                >Show plugin processes or terminal of the engine.</md-tooltip
              >
            </md-button>
            <span>&nbsp;{{ engine.name }}</span>
          </md-menu-item>
          <!-- <md-menu-item v-else @click.stop="engine.connect(false)" :key="engine.url">
            <md-icon>sync_disabled</md-icon> {{ engine.name }}
            <md-tooltip>Connect to {{ engine.name }} </md-tooltip>
          </md-menu-item> -->
          <template v-if="engine.connected && engine.show_processes">
            <md-divider :key="engine.url + '_start_divider'"></md-divider>
            <md-menu-item
              v-show="engine.plugin_processes"
              @click="startTerminal(engine)"
              :key="engine.url + '_start_terminal'"
            >
              &nbsp;&nbsp;<md-button class="md-icon-button">
                <md-icon>code</md-icon>
              </md-button>
              Open terminal
            </md-menu-item>
            <md-menu-item
              v-show="engine.plugin_processes"
              v-for="p in engine.plugin_processes"
              :key="p.pid"
            >
              &nbsp;&nbsp;<md-button
                @click.stop="kill(engine, p)"
                class="md-icon-button md-accent"
              >
                <md-icon>clear</md-icon>
              </md-button>
              {{ p.name }} (#{{ p.pid }})
            </md-menu-item>
            <md-menu-item
              v-if="!engine.plugin_processes"
              :key="engine.url + '_processes'"
            >
              <md-button>
                <div class="loading loading-lg"></div>
              </md-button>
            </md-menu-item>
            <md-menu-item
              :disabled="true"
              v-if="engine.plugin_num > 1"
              :key="engine.url + '_running_plugins'"
            >
              &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;<span
                >Running Plugins: {{ engine.plugin_num }}
              </span>
              <md-button
                @click.stop="kill(engine)"
                class="md-icon-button md-accent"
              >
                <md-icon>clear</md-icon>
                <md-tooltip>Kill all the running plugins</md-tooltip>
              </md-button>
            </md-menu-item>
            <md-divider :key="engine.url + '_end_divider'"></md-divider>
          </template>
        </template>
      </md-menu-content>
    </md-menu>
    <md-dialog
      :md-active.sync="showAddEngineDialog"
      :md-click-outside-to-close="false"
      :md-close-on-esc="false"
    >
      <md-dialog-title
        >New Plugin Engine
        <md-button
          class="md-accent"
          style="position:absolute; top:8px; right:5px;"
          @click="showAddEngineDialog = false"
          ><md-icon>clear</md-icon></md-button
        ></md-dialog-title
      >
      <md-dialog-content>
        <p>
          Python plugins are supported by ImJoy with the ImJoy Plugin Engine.
        </p>
        <p>
          If you don't have the Plugin Engine, please install it from the ImJoy
          Desktop App.<br />
          <md-button
            class="md-raised"
            target="_blank"
            href="https://github.com/oeway/ImJoy-App/releases"
            >Get ImJoy Desktop App</md-button
          >
        </p>
        <p>
          Alternatively, if you have Anaconda or Miniconda installed already,
          you can run <code>pip install imjoy</code> and start with
          <code>imjoy</code> command from your teriminal (see
          <a target="_blank" href="https://github.com/oeway/ImJoy-Engine"
            >ImJoy-Engine</a
          >).
        </p>
        <p>
          If you have it already, please start the Plugin Engine, and connect to
          it.
        </p>
        <div v-if="!is_mobile_or_tablet">
          <md-radio v-model="url_type" value="localhost">My Computer</md-radio>
          <md-radio v-model="url_type" value="remote"
            >Another Computer</md-radio
          >
        </div>
        <md-autocomplete
          v-if="url_type === 'remote'"
          v-model="engine_url"
          :md-options="engine_url_list"
          @keyup.enter="addEngine()"
          name="engine_url"
        >
          <label for="engine_url">Plugin Engine URL</label>
          <span class="md-helper-text"
            >engine url, e.g.: https://my-imjoy-plugin-engine.com</span
          >
        </md-autocomplete>
        <md-field>
          <label for="connection_token">Connection Token</label>
          <md-input
            type="password"
            v-model="connection_token"
            name="connection_token"
            @keyup.enter="addEngine()"
          ></md-input>
          <span v-if="url_type === 'localhost'" class="md-helper-text"
            >you can find the token from imjoy desktop app or terminal</span
          >
        </md-field>
        <md-button class="md-primary md-raised" @click="addEngine()"
          >Connect</md-button
        >
        <p>
          If you failed to install or start the Plugin Engine, please consult
          <a href="https://github.com/oeway/ImJoy-Engine" target="_blank"
            >here</a
          >, and choose the alternative solution.<br />
        </p>
      </md-dialog-content>
    </md-dialog>
    <md-dialog
      :md-active.sync="showEngineInfoDialog"
      :md-click-outside-to-close="true"
      :md-close-on-esc="true"
    >
      <md-dialog-title
        >About Plugin Engine
        <md-button
          class="md-accent"
          style="position:absolute; top:8px; right:5px;"
          @click="showEngineInfoDialog = false"
          ><md-icon>clear</md-icon></md-button
        ></md-dialog-title
      >
      <md-dialog-content v-if="selected_engine">
        <h4>
          <a :href="selected_engine.url" target="_blank">
            {{
              selected_engine.url.replace(
                local_engine_url,
                "My computer (" + local_engine_url + ")"
              )
            }}
          </a>
        </h4>
        <md-field>
          <label for="connection_token">Connection Token</label>
          <md-input
            type="password"
            v-model="selected_engine.config.token"
            @keyup.enter="connectEngine(selected_engine)"
            name="connection_token"
          ></md-input>
        </md-field>
        <md-button
          class="md-primary md-raised"
          v-if="!selected_engine.connected"
          @click="connectEngine(selected_engine)"
          ><md-icon>sync</md-icon> Connect</md-button
        >
        <md-button
          class="md-accent"
          v-else
          @click="disconnectEngine(selected_engine)"
          ><md-icon>sync_disabled</md-icon>Disconnect</md-button
        >
        <md-button
          class="md-primary"
          :disabled="!selected_engine.connected"
          @click="expand(selected_engine)"
        >
          <md-icon>autorenew</md-icon> Processes
        </md-button>
        <md-button
          v-if="selected_engine.connected"
          @click="
            startTerminal(selected_engine);
            showEngineInfoDialog = false;
          "
          class="md-primary"
          :disabled="!selected_engine.connected"
        >
          <md-icon>code</md-icon> Terminal
        </md-button>

        <md-menu>
          <md-button class="md-icon-button" md-menu-trigger>
            <md-icon class="md-primary">more_horiz</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item
              :disabled="!selected_engine.connected || show_sys_info"
              @click.stop="
                show_sys_info = true;
                hide(selected_engine);
              "
              target="_blank"
            >
              <md-icon>info</md-icon> System Information
            </md-menu-item>
            <md-menu-item
              @click.stop="openEngineUrl(selected_engine.url)"
              target="_blank"
            >
              <md-icon>launch</md-icon> Open Engine Site
            </md-menu-item>
            <md-menu-item
              v-if="selected_engine.connected"
              @click.stop="resetEngine(selected_engine)"
              class="md-accent"
            >
              <md-icon>restore</md-icon> Reset
            </md-menu-item>
            <md-menu-item
              @click="
                removeEngine(selected_engine);
                showEngineInfoDialog = false;
                selected_engine = null;
              "
              class="md-accent"
            >
              <md-icon>delete_forever</md-icon>Remove
            </md-menu-item>
          </md-menu-content>
        </md-menu>
        <md-divider></md-divider>

        <div v-if="selected_engine.connected && selected_engine.engine_info">
          <br />
          <code>
            ImJoy Plugin Engine (v{{ selected_engine.engine_info.version }},
            api: v{{ selected_engine.engine_info.api_version }})
          </code>
        </div>
        <div
          v-if="
            selected_engine.connected &&
              show_sys_info &&
              selected_engine.engine_info.platform
          "
          class="platform-info"
        >
          <div>
            <br />
            <code>## Platform</code>
            <br />
            <code
              v-for="(v, k) in selected_engine.engine_info.platform"
              :key="k"
            >
              - {{ k }}: {{ v }}
              <br />
            </code>
          </div>

          <div v-for="gpu in selected_engine.engine_info.GPUs" :key="gpu.id">
            <br />
            <code>## GPU {{ gpu.id }}</code>
            <br />
            <code v-for="(v, k) in gpu" :key="k">- {{ k }}: {{ v }}<br /></code>
          </div>
        </div>

        <div v-if="selected_engine.connected && selected_engine.show_processes">
          <br />
          <md-divider></md-divider>
          <ul>
            <li
              v-show="selected_engine.plugin_processes"
              v-for="p in selected_engine.plugin_processes"
              :key="p.pid"
            >
              &nbsp;<md-button
                @click.stop="kill(selected_engine, p)"
                class="md-icon-button md-accent small-icon-button"
              >
                <md-icon>clear</md-icon>
              </md-button>
              {{ p.name }} (#{{ p.pid }})
            </li>
            <li v-if="!selected_engine.plugin_processes">
              <md-button>
                <div class="loading loading-lg"></div>
              </md-button>
            </li>
            <li :disabled="true" v-if="selected_engine.plugin_num > 1">
              <md-button @click.stop="kill(selected_engine)" class="md-accent ">
                <md-icon>clear</md-icon> Kill All ({{
                  selected_engine.plugin_num
                }}
                Running Plugins)
              </md-button>
            </li>
          </ul>
        </div>
      </md-dialog-content>
    </md-dialog>
  </div>
</template>

<script>
import { mobileAndTabletcheck } from "../utils.js";

export default {
  name: "engine-control-panel",
  props: ["engineManager"],
  data() {
    return {
      engine_url: "",
      local_engine_url: "http://127.0.0.1:9527",
      engine_url_list: [],
      connection_token: null,
      showEngineInfoDialog: false,
      selected_engine: null,
      show_sys_info: false,
      showAddEngineDialog: false,
      url_type: "localhost",
    };
  },
  created() {
    this.is_mobile_or_tablet = mobileAndTabletcheck();
    this.event_bus = this.$root.$data.store && this.$root.$data.store.event_bus;
  },
  mounted() {
    this.event_bus.$on("engine_connected", this.forceUpdate);
    this.event_bus.$on("engine_disconnected", this.forceUpdate);
    this.event_bus.$on("show_engine_dialog", this.showDialog);
    if (this.is_mobile_or_tablet) {
      this.url_type = "remote";
      this.engine_url = "";
    }
  },
  beforeDestroy() {
    this.event_bus.$off("engine_connected", this.forceUpdate);
    this.event_bus.$off("engine_disconnected", this.forceUpdate);
    this.event_bus.$off("show_engine_dialog", this.showDialog);
  },
  methods: {
    showDialog(config) {
      if (!config.engine) {
        this.showEngineInfoDialog = false;
        this.showAddEngineDialog = config.show;
      } else {
        this.showAddEngineDialog = false;
        this.selected_engine = config.engine;
        this.showEngineInfoDialog = config.show;
      }
    },
    forceUpdate() {
      this.$forceUpdate();
    },
    expand(engine) {
      this.show_sys_info = false;
      engine.show_processes = true;
      this.$forceUpdate();
      this.update(engine);
    },
    hide(engine) {
      engine.show_processes = false;
      this.$forceUpdate();
    },
    update(engine) {
      engine.plugin_processes = null;
      this.$forceUpdate();
      engine.updateEngineStatus().finally(() => {
        this.$forceUpdate();
      });
    },
    kill(engine, p) {
      engine.plugin_processes = null;
      engine.killPluginProcess(p).finally(() => {
        this.update(engine);
      });
    },
    collapseProcesses() {
      for (let engine of this.engineManager.engines) {
        engine.show_processes = false;
      }
      this.$forceUpdate();
    },
    showAddEngine() {
      this.showAddEngineDialog = true;
    },
    hideAddEngine() {
      this.showAddEngineDialog = false;
    },
    addEngine() {
      if (this.url_type === "localhost") {
        this.engineManager.addEngine({
          type: "default",
          name: this.local_engine_url,
          url: this.local_engine_url,
          token: this.connection_token,
        });
      } else {
        this.engineManager.addEngine({
          type: "default",
          name: this.engine_url,
          url: this.engine_url,
          token: this.connection_token,
        });
      }
    },
    removeEngine(engine) {
      this.engineManager.removeEngine(engine);
      this.$forceUpdate();
    },
    connectEngine(engine) {
      if (!engine.connected) engine.connect();
      this.$forceUpdate();
    },
    disconnectEngine(engine) {
      if (engine.connected) engine.disconnect();
      this.$forceUpdate();
    },
    startTerminal(engine) {
      this.$emit("start-terminal", engine);
    },
    showToken(engine) {
      this.engine_url = engine.config.url;
      this.connection_token = engine.config.token;
    },
    resetEngine(engine) {
      engine.resetEngine();
    },
    showInfo(engine) {
      this.show_sys_info = false;
      this.selected_engine = engine;
      this.showEngineInfoDialog = true;
    },
    openEngineUrl(url) {
      window.open(url, "_blank");
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.engine-panel {
  width: 280px !important;
  max-width: 100% !important;
}

.platform-info > p {
  margin: 3px;
}

.small-icon-button {
  width: 22px !important;
  min-width: 22px !important;
  height: 22px !important;
}

.median-icon-button {
  width: 32px !important;
  min-width: 32px !important;
  height: 32px !important;
}

.md-list-item {
  height: 48px;
}

.md-list-item {
  padding: 2px 0;
}

.md-dialog {
  width: 600px;
}

@media screen and (max-width: 800px) {
  .md-dialog {
    width: 100% !important;
    height: 100% !important;
    max-width: 100%;
    max-height: 100%;
  }
}

@media screen and (max-height: 800px) and (pointer: fine) {
  .md-list-item {
    height: 36px;
    min-height: 36px;
  }
}

p {
  margin: 0 0 0.5rem;
}
</style>
