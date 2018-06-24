<template>
<div class="whiteboard noselect" ref="whiteboard">
  <div class="overlay" @click="dragging=false" v-if="dragging"></div>
  <grid-layout :layout="windows" :col-num="18" :row-height="30" :is-draggable="true" :is-resizable="true" :vertical-compact="true" :margin="[10, 10]" :use-css-transforms="true">
    <grid-item v-for="(w, wi) in windows" :x="w.x" :y="w.y" :w="w.w" :h="w.h" :i="w.i" :key="w.iframe_container">
      <md-card>
        <md-card-expand>
          <md-card-actions md-alignment="space-between" :class="w.selected?'window-selected':'window-header'">
            <md-card-expand-trigger v-if="w.panel">
              <md-button class="md-icon-button">
                <md-icon>keyboard_arrow_down</md-icon>
              </md-button>
            </md-card-expand-trigger>
            <div v-if="!w.panel"></div>
            <div> <span class="window-title noselect">{{w.name}}</span></div>
            <div>
              <!-- <md-button>Action</md-button>
                <md-button>Action</md-button> -->
              <md-menu md-size="big" md-direction="bottom-end">
                <md-button class="md-icon-button" md-menu-trigger>
                  <md-icon>more_vert</md-icon>
                </md-button>
                <md-menu-content>
                  <md-menu-item v-if="w.type!='main'" @click="close(wi)">
                    <span>Close</span>
                    <md-icon>close</md-icon>
                  </md-menu-item>
                  <md-menu-item @click.stop="fullScreen(w)">
                    <span>Fullscreen</span>
                    <md-icon>fullscreen</md-icon>
                  </md-menu-item>
                </md-menu-content>
              </md-menu>
            </div>
          </md-card-actions>
          <md-card-expand-content v-if="w.panel">
            <md-card-content>
              <joy :config="w.panel"></joy>
            </md-card-content>
          </md-card-expand-content>
        </md-card-expand>

        <md-card-content class="plugin-iframe-container">
          <md-empty-state v-if="w.type=='empty'" md-icon="hourglass_empty" md-label="IMJOY.IO" md-description="">
          </md-empty-state>
          <div v-if="w.type=='files'">
            <md-chip v-for="f in w.data.files" :key="f.name">{{f.name}}</md-chip>
          </div>
          <div v-if="w.type=='joy_panel'">
            <joy :config="w.config"></joy>
          </div>
          <!-- <md-card-content class="plugin-iframe-container"> -->
          <md-button class="plugin-iframe" @click="w.click2load=false;w.renderWindow(w)" v-if="w.click2load">Click to load window</md-button>
          <div :id="w.iframe_container" class="plugin-iframe">
          </div>
          <!-- </md-card-content> -->
        </md-card-content>

      </md-card>
      <!-- </div> -->
    </grid-item>
  </grid-layout>
  <div class="md-layout md-gutter md-alignment-center-center">
    <md-empty-state v-if="!windows || windows.length==0" md-icon="static/img/anna-palm-icon-circle-animation.svg" md-label="IMJOY.IO" md-description="">
    </md-empty-state>
  </div>
</div>
</template>

<script>
export default {
  name: 'whiteboard',
  props: {
    windows: {
      type: Array,
      default: function() {
        return null
      }
    },
    pluginWindows: {
      type: Array,
      default: function() {
        return null
      }
    }
  },
  data() {
    return {
      active_window: null,
      dragging: false,
      router: this.$root.$data.router,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
  },
  mounted() {
    setTimeout(() => {
      this.dragging = false
      this.$forceUpdate()
    }, 500)
  },
  methods: {
    close(wi) {
      console.log('close', wi)
      this.windows.splice(wi, 1)
    },
    fullScreen(w) {

    },
    startDragging(w) {
      setTimeout(() => {
        this.dragging = true
        this.$forceUpdate()
      }, 100)
      if (this.active_window !== w) {
        this.$emit('select', w)
        this.active_window = w
      }
    },
    stopDragging() {
      setTimeout(() => {
        this.dragging = false
        this.$forceUpdate()
      }, 300)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.whiteboard {
  height: 100%;
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
  height: 30px;
}

.window-header {
  color: var(--md-theme-default-text-primary-on-primary, #fff) !important;
  background-color: #ddd !important;
  height: 30px;
}

.window-title {
  font-size: 1.2em;
}

.plugin-iframe-container {
  display: flex;
  width: 100%;
  height: calc(100% - 40px);
  ;
  flex-direction: column;
  overflow: hidden;
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 2px;
  padding-bottom: 2px;
}

.plugin-iframe {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  flex-grow: 1;
  border: none;
}

.overlay {
  z-index: 8888 !important;
  background-color: rgba(1, 1, 1, 0.1);
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
}
</style>
