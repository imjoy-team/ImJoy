<template>
<div class="whiteboard noselect" ref="whiteboard"  @click="unselectWindows()">
  <div class="overlay" @click="show_overlay=false" v-if="show_overlay"></div>
  <grid-layout :layout="windows" :col-num="20" :is-mirrored="false" :auto-size="true" :row-height="row_height" :col-width="column_width" :is-draggable="true" :is-resizable="true" :vertical-compact="true" :margin="[3, 3]" :use-css-transforms="true">
    <grid-item v-for="(w, wi) in windows" drag-ignore-from=".ace_editor" :x="w.x" :y="w.y" :w="w.w" :h="w.h" :i="w.i" @resize="focusWindow(w)" @move="focusWindow(w)" @resized="show_overlay=false" @moved="show_overlay=false" :key="w.iframe_container">
      <md-card>
        <md-card-expand>
          <md-card-actions md-alignment="space-between" :class="w.selected?'window-selected':'window-header'">
            <md-card-expand-trigger v-if="w.panel">
              <md-button class="md-icon-button">
                <md-icon>keyboard_arrow_down</md-icon>
              </md-button>
            </md-card-expand-trigger>
            <div v-if="!w.panel"></div>
            <div class="window-title noselect" @click.stop="selectWindow(w, $event)">{{w.name+'(#'+w.i+')'}}</div>
            <div>
              <md-menu md-size="big" md-direction="bottom-end">
                <md-button class="md-icon-button" md-menu-trigger>
                  <md-icon>more_vert</md-icon>
                </md-button>
                <md-menu-content>
                  <md-menu-item @click.stop="normalSize(w)" v-if="w._h && w._w">
                    <span>Normal view</span>
                    <md-icon>fullscreen</md-icon>
                  </md-menu-item>
                  <md-menu-item @click.stop="fullScreen(w)" v-else>
                    <span>Fullscreen</span>
                    <md-icon>fullscreen</md-icon>
                  </md-menu-item>
                  <md-menu-item @click.stop="duplicate(w)">
                    <span>Duplicate</span>
                    <md-icon>filter</md-icon>
                  </md-menu-item>
                  <md-menu-item v-if="w.type!='main'" @click="close(wi)">
                    <span>Close</span>
                    <md-icon>close</md-icon>
                  </md-menu-item>
                  <md-menu-item @click="printObject(w.type, w.data)">
                    <span>Console.log</span>
                    <md-icon>bug_report</md-icon>
                  </md-menu-item>
                  <md-menu-item v-for="(loader, name) in w.loaders" v-if="w.loaders" :key="name" @click="loaders && loaders[loader](w.data)">
                    <span>{{name}}</span>
                    <md-icon>play_arrow</md-icon>
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
          <div v-if="w.type=='imjoy/files'" class="generic-plugin-window">
            <md-list>
              <md-list-item v-for="f in w.data.files" @click="loaders && f.loaders&&Object.keys(f.loaders).length > 0 && loaders[f.loaders[Object.keys(f.loaders)[0]]](f)" :key="f.name+f.relativePath">
                <md-icon>insert_drive_file</md-icon>
                <span class="md-list-item-text">{{f.name}}</span>
                <md-menu md-size="big" md-direction="bottom-end" v-if="f.loaders && Object.keys(f.loaders).length > 0">
                  <md-button class="md-icon-button" md-menu-trigger.stop>
                    <md-icon>more_horiz</md-icon>
                  </md-button>
                  <md-menu-content>
                    <md-menu-item v-for="(loader, name) in f.loaders" :key="name" @click="loaders && loaders[loader](f)">
                      <span>{{name}}</span>
                      <md-icon>play_arrow</md-icon>
                    </md-menu-item>
                  </md-menu-content>
                </md-menu>
              </md-list-item>
            </md-list>
          </div>
          <div v-else-if="w.type=='imjoy/image'">
            <img style="width: 100%" :src="w.data.src" v-if="w.data.src"></img>
            <p v-else> No image available for display.</p>
          </div>
          <div v-else-if="w.type=='imjoy/images'">
            <img style="width: 100%" :src="img" v-for="img in w.data.images" v-if="w.data.images"></img>
            <p v-else> No image available for display.</p>
          </div>
          <div v-else-if="w.type=='imjoy/panel'">
            <joy :config="w.config"></joy>
          </div>
          <div v-else-if="w.type=='imjoy/generic'" class="generic-plugin-window">
            <!-- <p>generic data</p> -->
            <md-list>
              <md-list-item :disabled="!w.loaders||Object.keys(w.loaders).length <= 0" @click="loaders && w.loaders&&Object.keys(w.loaders).length > 0&& loaders[w.loaders[Object.keys(w.loaders)[0]]](w.data)">
                <span class="md-list-item-text">{{dataSummary(w)}}</span>
                <md-tooltip>click to load.</md-tooltip>
              </md-list-item>
              <md-list-item v-for="(v, k) in w.data" @click="printObject(k, v)" v-if="(!k.startsWith || !k.startsWith('_')) && w.data && (!w.data.length) || (w.data.length && w.data.length > 0 && k <= 20)" :key="k">
                <md-icon>insert_drive_file</md-icon>
                <span class="md-list-item-text">{{k}}</span>
              </md-list-item>
              <md-list-item v-if="w.data && w.data.length && w.data.length > 20"  @click="printObject(w.data)">
                <md-icon>insert_drive_file</md-icon>
                <span class="md-list-item-text">...</span>
                <md-tooltip>click to print the data in your console.</md-tooltip>
              </md-list-item>
            </md-list>
          </div>
          <plugin-editor v-else-if="w.type=='imjoy/plugin-editor'" :pluginId="w.data.id" :window="w" v-model="w.data.code" :editorId="'editor_'+w.data.id"></plugin-editor>
          <div v-else class="plugin-iframe">
            <md-button class="iframe-load-button" @click="w.click2load=false;w.renderWindow(w)" v-if="w.click2load">Click to load the window</md-button>
            <div :id="w.iframe_container" class="plugin-iframe">
            </div>
          </div>
        </md-card-content>
      </md-card>
    </grid-item>
  </grid-layout>
  <div class="md-layout md-gutter md-alignment-center-center">
    <md-empty-state v-if="!windows || windows.length==0" md-icon="static/img/anna-palm-icon-circle-animation.svg" md-label="IMJOY.IO" md-description="">
    </md-empty-state>
  </div>
</div>
</template>

<script>
import {
  randId
} from '../utils.js'

export default {
  name: 'whiteboard',
  props: {
    windows: {
      type: Array,
      default: function() {
        return null
      }
    },
    loaders: {
      type: Object,
      default: function() {
        return null
      }
    }
  },
  data() {
    return {
      row_height: 30,
      column_width: 30,
      active_windows: [],
      show_overlay: false,
    }
  },
  created(){
    this.router = this.$root.$data.router
    this.store = this.$root.$data.store
    this.api = this.$root.$data.store.api
    this.store.event_bus.$on('add_window', this.onWindowAdd)
  },
  mounted() {

  },
  beforeDestroy() {
    this.store.event_bus.$off('add_window', this.onWindowAdd)
  },
  methods: {
    onWindowAdd(w) {
      this.selectWindow(w, {})
    },
    close(wi) {
      console.log('close', wi)
      const ai = this.active_windows.indexOf(this.windows[wi])
      if(ai>=0){
        this.active_windows[ai].selected = false
        this.active_windows.splice(ai, 1)
        this.$emit('select', this.active_windows, null)
      }
      this.$emit('close', this.windows[wi])
      this.windows.splice(wi, 1)
    },
    fullScreen(w) {
      const fh = parseInt(this.$refs.whiteboard.clientHeight/this.row_height) -10
      const fw = parseInt(this.$refs.whiteboard.clientWidth/this.column_width) -1
      w._h = w.h
      w._w = w.w
      w.h = fh
      w.w = fw
    },
    normalSize(w) {
      w.h = w._h || 5
      w.w = w._w || 5
      w._w = null
      w._h = null
    },
    duplicate(w) {
      const nw = Object.assign({}, w)
      if (nw.iframe_container)
        nw.iframe_container = 'plugin_window_' + nw.id + randId()
      nw.i = nw.i + "_"
      if (!nw.click2load)
        nw.click2load = true
      if (w.renderWindow) {
        nw.renderWindow = w.renderWindow
      }
      nw.id = nw.name + randId()
      this.windows.push(nw)
      this.$emit('add', nw)
    },
    unselectWindows(){
      if(this.active_windows && this.active_windows.length>0){
        for (let i = 0; i < this.active_windows.length; i++) {
            this.active_windows[i].selected = false
        }
        this.active_windows = []
        this.$emit('select', [], null)
        this.$forceUpdate()
      }
    },
    selectWindow(w, evt) {
      w.selected = true
      if (this.active_windows.length <= 0 || this.active_windows[this.active_windows.length - 1] !== w) {
        //unselect previous windows if no shift key pressed
        if (!evt.shiftKey) {
          for (let i = 0; i < this.active_windows.length; i++) {
            this.active_windows[i].selected = false
          }
        }
        if (evt.shiftKey && this.active_windows.length > 0) {
          this.active_windows.push(w)
        } else {
          this.active_windows = [w]
        }
        this.$emit('select', this.active_windows, w)

      } else if (!evt.shiftKey && this.active_windows.length > 1) {
        for (let i = 0; i < this.active_windows.length; i++) {
          if (this.active_windows[i] !== w)
            this.active_windows[i].selected = false
        }
        this.active_windows = [w]
      }
      this.$forceUpdate()
    },
    focusWindow(w) {
      // setTimeout(() => {
      this.show_overlay = true
      // this.$forceUpdate()
      // }, 100)
      this.selectWindow(w, {})
    },
    stopDragging() {
      setTimeout(() => {
        this.show_overlay = false
        this.$forceUpdate()
      }, 300)
    },
    printObject(name, obj){
      console.log(name, obj)
    },
    dataSummary(w){

      if(typeof w.data == 'array'){
        return `${w.type}, ${typeof w.data}, length: ${w.data.length}`
      }
      else if(w.data.buffer && Object.prototype.toString.call(w.data.buffer) === "[object ArrayBuffer]"){
        return `${w.type}, typedarray, length: ${w.data.length}`
      }
      else if(typeof w.data == 'object'){
        return `${w.type}, ${typeof w.data}, length: ${Object.keys(w.data).length}`
      }
      else{
        return `${w.type}`
      }
    }
  }
}
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
  height: 30px;
}

.window-header {
  color: var(--md-theme-default-text-primary-on-primary, #fff) !important;
  background-color: #ddd !important;
  height: 30px;
}

.window-title {
  font-size: 1.2em;
  white-space: nowrap;
}

.plugin-iframe-container {
  display: flex;
  width: 100%;
  height: calc(100% - 40px);
  flex-direction: column;
  overflow: hidden;
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 2px;
  padding-bottom: 2px;
}

.generic-plugin-window {
  overflow: auto;
}

.iframe-load-button {
  width: 100%;
  height: 100%;
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
  background-color: rgba(1, 1, 1, 0.05);
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
}
</style>
