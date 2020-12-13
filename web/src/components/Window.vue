<template>
  <md-card v-if="w">
    <div
      v-if="w.hide_title_bar && w.menu_button_location !== 'none'"
      :class="{
        'drag-handle': withDragHandle,
        'floating-upper-left': w.menu_button_location === 'upper-left',
        'floating-upper-right': w.menu_button_location === 'upper-right',
        'floating-lower-left': w.menu_button_location === 'lower-left',
        'floating-lower-right': w.menu_button_location === 'lower-right',
      }"
      style="height:20px;width:20px;"
    >
      <md-menu
        class="floating-button"
        md-size="big"
        md-direction="bottom-end"
        :md-active.sync="options_menu_open"
      >
        <md-button class="md-icon-button md-primary md-raised" md-menu-trigger>
          <md-icon>more_horiz</md-icon>
        </md-button>

        <md-menu-content>
          <md-menu-item @click="options_menu_open = false">
            <md-icon>highlight_off</md-icon>
            <span>Cancel</span>
          </md-menu-item>
          <md-menu-item
            @click="normalSize(w)"
            v-if="!w.standalone && w.fullscreen"
          >
            <md-icon>fullscreen</md-icon>
            <span>Normal view</span>
          </md-menu-item>
          <md-menu-item @click="fullScreen(w)" v-else-if="!w.standalone">
            <md-icon>fullscreen</md-icon>
            <span>Fullscreen</span>
          </md-menu-item>
          <md-menu-item @click="detach(w)" v-if="!w.standalone">
            <md-icon>launch</md-icon>
            <span>Detach</span>
          </md-menu-item>
          <md-menu-item @click="duplicate(w)">
            <md-icon>filter</md-icon>
            <span>Duplicate</span>
          </md-menu-item>
          <md-menu-item @click="hide(w)">
            <md-icon>remove</md-icon>
            <span>Hide</span>
          </md-menu-item>
          <md-menu-item @click="close(w)">
            <md-icon>close</md-icon>
            <span>Close</span>
          </md-menu-item>
          <md-menu-item @click="printObject(w.type, w.data, w)">
            <md-icon>bug_report</md-icon>
            <span>Console.log</span>
          </md-menu-item>
          <md-menu-item
            v-for="(loader, name) in w.loaders"
            :key="name"
            @click="loaders && loaders[loader](w.data)"
          >
            <md-icon>play_arrow</md-icon>
            <span>{{ name }}</span>
          </md-menu-item>
        </md-menu-content>
      </md-menu>
    </div>
    <md-card-actions
      v-else-if="!w.standalone"
      :class="{
        'drag-handle': withDragHandle,
        'window-selected': w.selected,
        'window-header': !w.selected,
      }"
      md-alignment="space-between"
      @click.native="selectWindow(w, $event)"
      @dblclick.native="w.fullscreen ? normalSize(w) : fullScreen(w)"
    >
      <div>
        <md-button class="md-icon-button md-accent no-drag" @click="close(w)">
          <md-icon>close</md-icon>
          <md-tooltip>Close window</md-tooltip>
        </md-button>
        <md-button class="md-icon-button md-accent no-drag" @click="hide(w)">
          <md-icon>remove</md-icon>
          <md-tooltip>Hide window</md-tooltip>
        </md-button>
        <md-button
          v-if="!w.fullscreen"
          class="md-icon-button md-accent no-drag"
          @click="fullScreen(w)"
        >
          <md-icon>fullscreen</md-icon>
          <md-tooltip>Maximize window</md-tooltip>
        </md-button>
        <md-button
          v-if="w.fullscreen"
          class="md-icon-button md-accent no-drag"
          @click="normalSize(w)"
        >
          <md-icon>fullscreen_exit</md-icon>
          <md-tooltip>Exit fullscreen</md-tooltip>
        </md-button>
      </div>
      <div class="window-title noselect">
        {{ w.name.slice(0, 30) + "(#" + (w.index || "") + ")" }}
      </div>
      <div class="no-drag">
        <md-menu
          md-size="big"
          md-direction="bottom-end"
          :md-active.sync="options_menu_open"
        >
          <md-button class="md-icon-button" md-menu-trigger>
            <md-icon>more_vert</md-icon>
          </md-button>

          <md-menu-content>
            <md-menu-item @click="options_menu_open = false">
              <md-icon>highlight_off</md-icon>
              <span>Cancel</span>
            </md-menu-item>
            <md-menu-item
              @click="normalSize(w)"
              v-if="!w.standalone && w.fullscreen"
            >
              <md-icon>fullscreen</md-icon>
              <span>Normal view</span>
            </md-menu-item>
            <md-menu-item @click="fullScreen(w)" v-else-if="!w.standalone">
              <md-icon>fullscreen</md-icon>
              <span>Fullscreen</span>
            </md-menu-item>
            <md-menu-item @click="detach(w)" v-if="!w.standalone">
              <md-icon>launch</md-icon>
              <span>Detach</span>
            </md-menu-item>
            <md-menu-item @click="duplicate(w)">
              <md-icon>filter</md-icon>
              <span>Duplicate</span>
            </md-menu-item>
            <md-menu-item @click="hide(w)">
              <md-icon>remove</md-icon>
              <span>Hide</span>
            </md-menu-item>
            <md-menu-item @click="close(w)">
              <md-icon>close</md-icon>
              <span>Close</span>
            </md-menu-item>
            <md-menu-item @click="printObject(w.type, w.data, w)">
              <md-icon>bug_report</md-icon>
              <span>Console.log</span>
            </md-menu-item>
            <md-menu-item
              v-for="(loader, name) in w.loaders"
              :key="name"
              @click="loaders && loaders[loader](w.data)"
            >
              <md-icon>play_arrow</md-icon>
              <span>{{ name }}</span>
            </md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
    </md-card-actions>

    <md-card-content
      :class="
        w.standalone || w.hide_title_bar
          ? 'taller-container'
          : 'shorter-container'
      "
      class="plugin-iframe-container allow-scroll"
    >
      <div class="loading loading-lg floating" v-show="w.loading"></div>
      <div v-if="componentNames[w.type]" :id="w.window_id" v-show="false"></div>
      <component
        ref="window-content"
        v-if="componentNames[w.type] && w.type.startsWith('imjoy/')"
        :is="componentNames[w.type]"
        :w="w"
        :loaders="loaders"
        @init="setAPI"
      />
      <md-empty-state
        v-else-if="w.type.startsWith('imjoy/')"
        ref="window-content"
        md-icon="hourglass_empty"
        md-label="IMJOY.IO"
        md-description=""
      />
      <div v-else class="plugin-iframe">
        <div :id="w.window_id" class="plugin-iframe"></div>
      </div>
    </md-card-content>
  </md-card>
</template>

<script>
import ResizeObserver from "resize-observer-polyfill";
import * as windowComponents from "./windows";

const components = {};
for (let c in windowComponents) {
  components[windowComponents[c].name] = windowComponents[c];
}

export default {
  name: "window",
  components,
  props: {
    w: {
      type: Object,
      default: function() {
        return null;
      },
    },
    withDragHandle: {
      type: Boolean,
      default: function() {
        return false;
      },
    },
    loaders: {
      type: Object,
      default: function() {
        return null;
      },
    },
  },
  data() {
    return {
      componentNames: {},
      options_menu_open: false,
    };
  },
  created() {
    for (let c in components) {
      this.componentNames[components[c].type] = components[c].name;
    }
  },
  mounted() {
    if (this.w) {
      this.w.menu_button_location = this.w.menu_button_location || "upper-left";
      this.w.$el = this.$el;
      this.w.api.on("refresh", () => {
        this.refresh();
      });
      this.w.api.on("focus", () => {
        if (this.w.hidden) {
          this.w.hidden = false;
          this.w.w = this.w.__w;
          this.w.h = this.w.__h;
        }

        this.selectWindow(this.w, {});
        if (!this.w.standalone)
          this.$nextTick(() => {
            this.$el.scrollIntoView(true);
          });
        else this.w.api.show();
      });
      if (this.w.fullscreen) {
        this.fullScreen(this.w);
      }
    }
    const ro = new ResizeObserver(entries => {
      this.w.api.emit("resize", entries[0].contentRect);
    });
    ro.observe(this.$el);

    setTimeout(() => {
      if (this.$refs["window-content"]) {
        const comp = this.$refs["window-content"];
        const ro2 = new ResizeObserver(() => {
          setTimeout(() => {
            if (comp.$el)
              this.w.api.emit(
                "window_size_changed",
                comp.$el.getBoundingClientRect()
              );
          }, 500);
        });
        ro2.observe(comp.$el);
      }
    }, 100);
  },
  beforeDestroy() {
    this.w.closed = true;
  },
  watch: {
    w() {
      this.w.api.on("refresh", () => {
        this.refresh();
      });
      this.w.api.on("focus", () => {
        if (!this.w.standalone)
          this.$nextTick(() => {
            this.$el.scrollIntoView(true);
          });
      });
      this.w.api.on("fullscreen", () => {
        this.fullScreen(this.w);
      });
      if (!this.w.standalone)
        this.$nextTick(() => {
          this.$el.scrollIntoView(true);
        });
      if (this.w.fullscreen) {
        this.fullScreen(this.w);
      }
    },
  },
  methods: {
    setAPI(exportedAPI) {
      exportedAPI = exportedAPI || {};
      this.w.api = this.w.api || {};
      for (let k of Object.keys(exportedAPI)) {
        this.w.api[k] = exportedAPI[k];
      }
      this.w.api.emit("ready");
    },
    refresh() {
      this.$forceUpdate();
    },
    hide(w) {
      this.$emit("hide", w);
    },
    close(w) {
      this.$emit("close", w);
    },
    fullScreen(w) {
      this.$emit("fullscreen", w);
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    detach(w) {
      this.$emit("detach", w);
    },
    normalSize(w) {
      this.$emit("normalsize", w);
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    duplicate(w) {
      this.$emit("duplicate", w);
    },
    selectWindow(w, evt) {
      this.$emit("select", w, evt);
    },
    printObject(name, obj, obj2) {
      console.log(name, obj, obj2);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.drag-handle > .floating-button {
  width: 20px;
  height: 20px;
  display: none;
}
.drag-handle:hover > .floating-button {
  display: inline-block !important;
}

.floating-upper-left {
  position: absolute;
  left: 0;
  top: 0;
}
.floating-upper-right {
  position: absolute;
  right: 6px;
  top: 0;
}
.floating-lower-left {
  position: absolute;
  left: 0;
  bottom: 0;
}
.floating-lower-right {
  position: absolute;
  right: 6px;
  bottom: 0;
}
.whiteboard {
  height: calc(100% - 8px);
  position: relative;
  overflow: auto !important;
}

.md-empty-state {
  position: absolute;
  top: 39%;
  transform: translateY(-50%);
  height: 100%;
}

.md-card {
  /* width: 450px;*/
  /* height: 300px; */
  width: 100%;
  height: 100%;
  max-height: 100%;
  max_width: 100%;
  margin: 0px;
}

.window-selected {
  overflow: hidden;
  color: var(--md-theme-default-text-accent-on-primary, #fff) !important;
  background-color: var(--md-theme-default-primary, #448aff) !important;
  height: 30px !important;
}

.window-header {
  overflow: hidden;
  color: var(--md-theme-default-text-primary-on-primary, #fff) !important;
  background-color: #ddd !important;
  height: 30px !important;
}

.window-title {
  font-size: 1.2em;
  white-space: nowrap;
}

.md-icon-button {
  width: 32px;
  min-width: 32px;
  height: 32px;
}

.plugin-iframe-container {
  display: flex;
  width: 100%;
  flex-direction: column;
  overflow: hidden;
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 0px;
  padding-bottom: 0px;
}

.taller-container {
  height: 100%;
}

.shorter-container {
  height: calc(100% - 30px);
}

.md-card-content:last-of-type {
  padding-bottom: 2px;
}

.allow-scroll {
  overflow: auto !important;
}

.iframe-load-button {
  width: 100%;
  height: 100%;
}

.plugin-iframe {
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
  flex-grow: 1;
  border: none;
}

.overlay {
  z-index: 8888 !important;
  background-color: rgba(1, 1, 1, 0.05);
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
}

.floating {
  position: absolute !important;
  left: calc(50% - 1.5rem) !important;
  top: calc(39% - 1.5rem) !important;
  z-index: 999;
}

.loading.loading-lg::after {
  height: 3rem !important;
  margin-left: -0.8rem;
  margin-top: -0.8rem;
  width: 3rem !important;
}
</style>
