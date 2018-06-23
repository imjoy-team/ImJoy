<template>
<div class="whiteboard">
    <div class="overlay" @click="dragging=false" v-if="dragging"></div>
    <vue-draggable-resizable :grid="[30,30]" drag-handle=".md-card-expand" :w="w.config.width" :h="w.config.height" :x="w.config.x" :y="w.config.y" :z="w.config.z" :active.sync="w.selected" @dragging="startDragging(w)" @dragstop="stopDragging" @resizing="startDragging(w)" @resizestop="stopDragging" :parent="true" v-for="(w, wi) in windows" :key="w.iframe_container">
          <md-card>
          <md-card-expand>
            <md-card-actions md-alignment="space-between" :class="w.selected?'window-selected':''" class="window-header">
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
                  <md-button class="md-icon-button" @click.stop md-menu-trigger>
                    <md-icon>more_vert</md-icon>
                  </md-button>
                  <md-menu-content>
                    <md-menu-item v-if="w.type!='main'" @click="close(wi)">
                      <span>Close</span>
                      <md-icon>close</md-icon>
                    </md-menu-item>
                    <md-menu-item @click="fullScreen(wi)">
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
            <div v-once :id="w.iframe_container" class="plugin-iframe"></div>
            <!-- </md-card-content> -->
          </md-card-content>

        </md-card>
      <!-- </div> -->
    </vue-draggable-resizable>
  <div class="md-layout md-gutter md-alignment-top-left">
    <md-empty-state v-if="!windows" md-icon="static/img/anna-palm-icon-circle-animation.svg" md-label="IMJOY.IO" md-description="">
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
    setTimeout(()=>{
      this.dragging = false
      this.$forceUpdate()
    }, 500)
  },
  methods: {
    close(wi) {
      console.log('close', wi)
      this.windows.splice(wi, 1)
    },
    fullScreen(wi) {

    },
    startDragging(w){

      setTimeout(()=>{
        this.dragging=true
        this.$forceUpdate()
      }, 100)
      if(this.active_window !== w){
        this.$emit('select', w)
        this.active_window = w
      }

    },
    stopDragging(){
      // setTimeout(()=>{
        this.dragging=false
        // this.$forceUpdate()
      // }, 500)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.whiteboard {
  height: 100%;
  position: relative;
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
  color: var(--md-theme-default-text-primary-on-primary, #fff) !important;
  background-color: var(--md-theme-default-primary, #448aff) !important;
}

.window-header {
  height: 40px;
}

.window-title {
  font-size: 1.4em;
}

.plugin-iframe-container {
  display: flex;
  width: 100%;
  height: calc(100% - 40px);;
  flex-direction: column;
  overflow: hidden;
  padding-left: 5px;
  padding-right: 5px;
  padding-top: 5px;
  padding-bottom: 5px;
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
  z-index: 9999!important;
  background-color: rgba(1, 1, 1, 0.1);
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}
</style>
