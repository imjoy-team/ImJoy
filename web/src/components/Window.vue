<template>
  <md-card v-if="w">
    <md-card-actions
      v-if="!w.standalone"
      :class="{
        'drag-handle': withDragHandle,
        'window-selected': w.selected,
        'window-header': !w.selected,
      }"
      md-alignment="space-between"
      @click.native="selectWindow(w, $event)"
      @dblclick.native="w._h && w._w ? normalSize(w) : fullScreen(w)"
    >
      <md-button class="md-icon-button md-accent no-drag" @click="close(w)">
        <md-icon>close</md-icon>
        <md-tooltip>Close window</md-tooltip>
      </md-button>
      <div class="window-title noselect">
        {{ w.name.slice(0, 30) + "(#" + w.index + ")" }}
      </div>
      <div class="no-drag">
        <md-menu md-size="big" md-direction="bottom-end">
          <md-button class="md-icon-button" md-menu-trigger>
            <md-icon>more_vert</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item
              @click="normalSize(w)"
              v-if="!w.standalone && w.fullscreen"
            >
              <span>Normal view</span>
              <md-icon>fullscreen</md-icon>
            </md-menu-item>
            <md-menu-item @click="fullScreen(w)" v-else-if="!w.standalone">
              <span>Fullscreen</span>
              <md-icon>fullscreen</md-icon>
            </md-menu-item>
            <md-menu-item @click="detach(w)" v-if="!w.standalone">
              <span>Detach</span>
              <md-icon>launch</md-icon>
            </md-menu-item>
            <md-menu-item @click="duplicate(w)">
              <span>Duplicate</span>
              <md-icon>filter</md-icon>
            </md-menu-item>
            <md-menu-item @click="close(w)">
              <span>Close</span>
              <md-icon>close</md-icon>
            </md-menu-item>
            <md-menu-item @click="printObject(w.type, w.data, w)">
              <span>Console.log</span>
              <md-icon>bug_report</md-icon>
            </md-menu-item>
            <md-menu-item
              v-for="(loader, name) in w.loaders"
              :key="name"
              @click="loaders && loaders[loader](w.data)"
            >
              <span>{{ name }}</span>
              <md-icon>play_arrow</md-icon>
            </md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
    </md-card-actions>

    <md-card-content
      :class="w.standalone ? 'taller-container' : 'shorter-container'"
      class="plugin-iframe-container allow-scroll"
    >
      <div class="loading loading-lg floating" v-show="w.loading"></div>
      <component
        v-if="componentNames[w.type] && w.type.startsWith('imjoy/')"
        :is="componentNames[w.type]"
        :w="w"
        :loaders="loaders"
      />
      <md-empty-state
        v-else-if="w.type.startsWith('imjoy/')"
        md-icon="hourglass_empty"
        md-label="IMJOY.IO"
        md-description=""
      />
      <div v-else class="plugin-iframe">
        <div :id="w.iframe_container" class="plugin-iframe"></div>
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
    };
  },
  created() {
    for (let c in components) {
      this.componentNames[components[c].type] = components[c].name;
    }
  },
  mounted() {
    if (this.w) {
      this.w.$el = this.$el;
      this.w.onRefresh(() => {
        this.refresh();
      });
      this.w.focus = () => {
        if (!this.w.standalone) this.$el.scrollIntoView(true);
      };
      if (this.w.fullscreen) {
        this.fullScreen(this.w);
      }
    }
    const ro = new ResizeObserver(entries => {
      this.w.resize(entries[0].contentRect);
    });
    ro.observe(this.$el);
  },
  beforeDestroy() {
    this.w.closed = true;
  },
  watch: {
    w() {
      this.w.onRefresh(() => {
        this.refresh();
      });
      this.w.focus = () => {
        if (!this.w.standalone) this.$el.scrollIntoView(true);
      };
      this.w.focus();
      if (this.w.fullscreen) {
        this.fullScreen(this.w);
      }
    },
  },
  methods: {
    refresh() {
      this.$forceUpdate();
    },
    close(w) {
      this.$emit("close", w);
    },
    fullScreen(w) {
      this.$emit("fullscreen", w);
    },
    detach(w) {
      this.$emit("detach", w);
    },
    normalSize(w) {
      this.$emit("normalsize", w);
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
  color: var(--md-theme-default-text-accent-on-primary, #fff) !important;
  background-color: var(--md-theme-default-primary, #448aff) !important;
  height: 30px !important;
}

.window-header {
  color: var(--md-theme-default-text-primary-on-primary, #fff) !important;
  background-color: #ddd !important;
  height: 30px !important;
}

.window-title {
  font-size: 1.2em;
  white-space: nowrap;
}

.plugin-iframe-container {
  display: flex;
  width: 100%;
  flex-direction: column;
  overflow: hidden;
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 2px;
  padding-bottom: 2px;
}

.taller-container {
  height: calc(100% - 5px);
}

.shorter-container {
  height: calc(100% - 40px);
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
  margin: 0;
  padding: 2px;
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
