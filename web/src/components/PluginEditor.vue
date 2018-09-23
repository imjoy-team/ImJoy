<template>
<div class="plugin-editor">
    <md-toolbar class="md-dense editor-toolbar" md-elevation="1">
      <md-button @click="reload()"  v-if="window" class="md-icon-button">
        <md-icon>autorenew</md-icon>
        <md-tooltip>Update this plugin</md-tooltip>
      </md-button>
      <md-button @click="save()"  v-if="window" class="md-icon-button">
        <md-icon>save</md-icon>
        <md-tooltip>Save this plugin</md-tooltip>
      </md-button>
      <md-button @click="saveAs()" class="md-icon-button">
        <md-icon>cloud_download</md-icon>
        <md-tooltip>Export this plugin</md-tooltip>
      </md-button>
      <md-button @click="remove()" v-if="window && window.plugin&&window.plugin.config&&window.plugin.config._id" class="md-icon-button">
        <md-icon>delete</md-icon>
        <md-tooltip>Remove this plugin</md-tooltip>
      </md-button>
    </md-toolbar>
    <monaco-editor
      class="editor code_editor"
      v-model="codeValue"
      language="html"
      ref="monaco_editor">
    </monaco-editor>
    <!-- <div class="editor">
      <div :id="'editor_'+pluginId" style='width="auto";height="auto"'></div>
    </div> -->
</div>
</template>

<script>
import { saveAs } from 'file-saver';
import {
  randId
} from '../utils.js'

import MonacoEditor from 'vue-monaco'

window.MonacoEnvironment = {
  getWorkerUrl: function(workerId, label) {
    var fullPath = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
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
      `
    )}`;
  }
};

export default {
  name: 'joy',
  props: ['value', 'title', 'pluginId', 'window'],
  data() {
    return {
      codeValue: '',
    }
  },
  created(){
    this.router = this.$root.$data.router
    this.store = this.$root.$data.store
    this.api = this.$root.$data.store.api
  },
  watch: {

  },
  mounted() {
    this.codeValue = this.value
    this.editor = this.$refs.monaco_editor.getMonaco()
    if(this.window){
        this.window.resize = ()=>{
        this.editor.layout();
      }
    }
    setTimeout(()=>{
      this.editor.layout();
    }, 1000)

    this.editor.addCommand( window.monaco.KeyMod.CtrlCmd |  window.monaco.KeyCode.KEY_S, ()=>{
      this.save()
    });
    this.editor.addCommand( window.monaco.KeyMod.CtrlCmd |  window.monaco.KeyCode.KEY_R, ()=>{
      this.reload()
    });
  },
  methods: {
    save(){
      this.$emit('input', this.codeValue)
      const save_plugin = ()=>{this.window.save({pluginId: this.pluginId, code: this.codeValue}).then((p_id)=>{
        this.window.data._id = p_id
        this.window.plugin.config._id= p_id
        this.$forceUpdate()
      })}
      save_plugin()
      this.reload()
    },
    remove(){
      this.$emit('input', this.codeValue)
      this.window.data._id = null
      this.window.remove(this.window.plugin).then(()=>{
        this.window.plugin = {}
      })
    },
    reload(){
      return new Promise((resolve, reject) => {
        this.$emit('input', this.codeValue)
        this.window.reload({pluginId: this.pluginId, type:this.window.plugin.type, name:this.window.plugin.name, code: this.codeValue, plugin: this.window.plugin}).then((plugin)=>{
          this.window.plugin = plugin
          this.window.name = plugin.name
          resolve()
        }).catch(()=>{
          reject()
        })
      })
    },
    saveAs(){
      $emit('input', this.codeValue)
      const filename = this.window&&this.window.plugin&&this.window.plugin.name?this.window.plugin.name+"_"+randId()+'.imjoy.html':'plugin_'+randId()+'.imjoy.html'
      const file = new Blob([this.codeValue], {type: "text/plain;charset=utf-8"})
      saveAs(file, filename);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.editor{
  overflow: auto;
  /* height: 100%; */
  /* width: 600px; */
  /* width: 100%; */
  height: 800px;
}
/*
.editor-toolbar{
  min-height: 40px!important;
  height: 40px!important;
}
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
