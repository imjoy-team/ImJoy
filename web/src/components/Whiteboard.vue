<template>
<div class="whiteboard noselect" ref="whiteboard" @mouseup="show_overlay=false"  @click="unselectWindows()">
  <div @mousemove="overlayMousemove" class="overlay" @click="show_overlay=false" v-if="show_overlay"></div>
  <grid-layout v-if="mode==='grid'" :layout="windows" :col-num="col_num" :is-mirrored="false" :auto-size="true" :row-height="row_height" :is-responsive="true" :is-draggable="true" :is-resizable="true" :vertical-compact="true" :margin="[3, 3]" :use-css-transforms="true">
    <grid-item v-for="w in windows" drag-allow-from=".drag-handle" drag-ignore-from=".no-drag" :x="w.x" :y="w.y" :w="w.w" :h="w.h" :i="w.i" @resize="viewChanging(w)" @move="viewChanging(w)" @resized="show_overlay=false;w.resize&&w.resize();focusWindow(w)" @moved="show_overlay=false;w.move&&w.move();focusWindow(w)" :key="w.id">
      <window :w="w" :withDragHandle="true" @duplicate="duplicate" @select="selectWindow" :loaders="wm.registered_loaders" @close="close" @fullscreen="fullScreen" @normalsize="normalSize"></window>
    </grid-item>
  </grid-layout>
  <window v-else v-for="w in windows" :key="w.id" v-show="wm.selected_window===w" :loaders="wm.registered_loaders" :withDragHandle="false" @duplicate="duplicate" @select="selectWindow" @close="close" @fullscreen="fullScreen" @normalsize="normalSize" :w="w"></window>
  <div class="md-layout md-gutter md-alignment-center-center">
    <md-empty-state v-if="!windows || windows.length===0" md-icon="static/img/imjoy-io-icon.svg" md-label="" md-description="">
    </md-empty-state>
  </div>
</div>
</template>

<script>
import {
  randId,
  assert
} from '../utils.js'
import {
  WindowManager
} from '../windowManager.js'

import marked from 'marked';
export default {
  name: 'whiteboard',
  props: {
    mode: {
      type: String,
      default: function() {
        return 'grid'
      }
    },
    windowManager:{
      type: WindowManager,
      default: function() {
        return null
      }
    }
  },
  data() {
    return {
      row_height: 30,
      column_width: 30,
      col_num: 20,
      active_windows: [],
      show_overlay: false,
      scrolling: false,
      scrollClientY: 0,
      screenWidth: window.innerWidth
    }
  },
  created(){
    this.wm = this.windowManager
    this.windows = this.wm && this.wm.windows
    assert(this.windows)
    this.event_bus = this.wm.event_bus
    this.event_bus.$on('add_window', this.onWindowAdd)
    this.event_bus.$on('resize', this.updateSize)

    //open link in a new tab
    const renderer = new marked.Renderer();
    renderer.link = function(href, title, text) {
        var link = marked.Renderer.prototype.link.call(this, href, title, text);
        return link.replace("<a","<a target='_blank' ");
    };
    marked.setOptions({
        renderer: renderer
    });
    this.marked = marked
  },
  mounted() {
    this.event_bus.$on('close_window', ()=>{ this.$forceUpdate() })
    this.screenWidth = window.innerWidth
    this.col_num = parseInt(this.$refs.whiteboard.clientWidth/this.column_width)
  },
  beforeDestroy() {
    this.event_bus.$off('add_window', this.onWindowAdd)
    this.event_bus.$off('resize', this.updateSize)
  },
  methods: {
    overlayMousemove(e){
      const bbox = this.$refs.whiteboard.getBoundingClientRect()
      const top = bbox.y
      const bottom = bbox.y+ bbox.height
      this.scrollClientY = e.clientY
      let scroll
      if(this.scrollClientY<top+10){
        scroll =()=>{this.$refs.whiteboard.scrollTop = this.$refs.whiteboard.scrollTop - (top-this.scrollClientY)/2
          if(this.show_overlay && this.scrollClientY<top){
            this.scrolling = true
            window.requestAnimationFrame(scroll)
          }
          else{
            this.scrolling = false
          }
        }
        if(!this.scrolling)
        scroll()
      }
      else if(this.scrollClientY>bottom-20){
        scroll =()=>{this.$refs.whiteboard.scrollTop = this.$refs.whiteboard.scrollTop+(this.scrollClientY-bottom+20)/2
          if(this.show_overlay && this.scrollClientY>bottom-10){
            this.scrolling = true
            window.requestAnimationFrame(scroll)
          }
          else{
            this.scrolling = false
          }
        }
        if(!this.scrolling)
        scroll()
      }

      // console.log('hi', top, bottom, this.scrollClientY, this.$refs.whiteboard.scrollTop, this.$refs.whiteboard.scrollHeight, bbox)
    },
    updateSize(e){
      this.screenWidth = e.width
      // this.column_width = parseInt(this.screenWidth/60)
      this.col_num = parseInt(this.$refs.whiteboard.clientWidth/this.column_width)
    },
    onWindowAdd(w) {
      this.selectWindow(w, {})
      this.$forceUpdate()
    },
    close(w) {
      const ai = this.active_windows.indexOf(w)
      if(ai>=0){
        this.active_windows[ai].selected = false
        this.active_windows[ai].refresh()
        this.active_windows.splice(ai, 1)
        this.wm.active_windows = this.active_windows
        this.$emit('select', this.active_windows, null)
      }
      this.wm.closeWindow(w)
      this.$emit('close', w)
    },
    isTypedArray(obj)
    {
      return !!obj && obj.byteLength !== undefined;
    },
    fullScreen(w) {
      const fh = parseInt((this.$refs.whiteboard.clientHeight-70)/this.row_height)
      const fw = parseInt(this.$refs.whiteboard.clientWidth/this.column_width)
      w._h = w.h
      w._w = w.w
      w.h = fh
      w.w = fw
      setTimeout(()=>{w.resize&&w.resize(); w.refresh();}, 1000);
    },
    normalSize(w) {
      w.h = w._h || 5
      w.w = w._w || 5
      w._w = null
      w._h = null
      setTimeout(()=>{w.resize&&w.resize(); w.refresh();}, 1000);
    },
    duplicate(w) {
      const nw = Object.assign({}, w)
      if (nw.iframe_container)
        nw.iframe_container = 'plugin_window_' + nw.id + randId()
      nw.i = nw.i + "_"
      if (w.renderWindow) {
        nw.renderWindow = w.renderWindow
      }
      nw.id = nw.name + randId()
      this.wm.windows.push(nw)
      this.$emit('add', nw)
    },
    unselectWindows(){
      if(this.active_windows && this.active_windows.length>0){
        for (let i = 0; i < this.active_windows.length; i++) {
            this.active_windows[i].selected = false
            this.active_windows[i].refresh()
        }
        this.active_windows = []
        this.wm.active_windows = this.active_windows
        this.$emit('select', this.active_windows, null)
        this.$forceUpdate()
      }
    },
    selectWindow(w, evt) {
      w.selected = true
      w.refresh && w.refresh()
      if (this.active_windows.length <= 0 || this.active_windows[this.active_windows.length - 1] !== w) {
        //unselect previous windows if no shift key pressed
        if (!evt.shiftKey) {
          for (let i = 0; i < this.active_windows.length; i++) {
            this.active_windows[i].selected = false
            this.active_windows[i].refresh()
          }
        }
        if (evt.shiftKey && this.active_windows.length > 0) {
          this.active_windows.push(w)
        } else {
          this.active_windows = [w]
        }
        this.wm.active_windows = this.active_windows
        this.$emit('select', this.active_windows, w)

      } else if (!evt.shiftKey && this.active_windows.length > 1) {
        for (let i = 0; i < this.active_windows.length; i++) {
          if (this.active_windows[i] !== w)
            this.active_windows[i].selected = false
            this.active_windows[i].refresh()
        }
        this.active_windows = [w]
      }
      this.$forceUpdate()

    },
    viewChanging(){
      this.show_overlay = true
      //this.$refs.whiteboard.scrollTop = this.$refs.whiteboard.scrollHeight
    },
    focusWindow(w) {
      this.show_overlay = false
      this.selectWindow(w, {})
    },
    stopDragging() {
      setTimeout(() => {
        this.show_overlay = false
        this.$forceUpdate()
      }, 300)
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
  height: 30px!important;
}

.window-header {
  color: var(--md-theme-default-text-primary-on-primary, #fff) !important;
  background-color: #ddd !important;
  height: 30px!important;
}
.fill-container{
  width: 100%;
  height: 100%;
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

.allow-scroll {
  overflow: auto !important;
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
