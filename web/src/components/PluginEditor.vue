<template>
<div class="plugin-editor">
    <md-toolbar class="md-dense editor-toolbar" md-elevation="1">
      <md-button @click="reload()" class="md-icon-button">
        <md-icon>autorenew</md-icon>
        <md-tooltip>Update the plugin</md-tooltip>
      </md-button>
      <md-button @click="save()" class="md-icon-button">
        <md-icon>save</md-icon>
        <md-tooltip>Save the plugin</md-tooltip>
      </md-button>
      <md-button @click="saveAs()" class="md-icon-button">
        <md-icon>cloud_download</md-icon>
        <md-tooltip>Export the plugin</md-tooltip>
      </md-button>
    </md-toolbar>
    <md-content class="editor">
    <div :id="'editor_'+pluginId"></div>
  </md-content>
</div>
</template>

<script>
import { saveAs } from 'file-saver';
import {
  randId
} from '../utils.js'
export default {
  name: 'joy',
  props: ['value', 'options', 'title', 'pluginId', 'window'],
  data() {
    return {
    }
  },
  created(){
    this.router = this.$root.$data.router
    this.store = this.$root.$data.store
    this.api = this.$root.$data.store.api
  },
  watch: {
    options: ()=>{
      this.editor.setOptions(this.options)
    }
  },
  mounted() {
    const editorId = 'editor_'+this.pluginId
    ace.require('ace/tooltip').Tooltip.prototype.setPosition = function (x, y) {
        var rect = document.getElementById(editorId).getBoundingClientRect()
        y -= (rect.top-64);
        x -= rect.left;
        this.getElement().style.left = x + "px";
        this.getElement().style.top = y + "px";
     };
    // ace.require("ace/ext/language_tools");

    this.editor = ace.edit(editorId);
    ace.config.set('basePath', '/static/ace')
    this.editor.setOptions({
        wrap: false,
        maxLines: Infinity,
        // autoScrollEditorIntoView : false,
        // enableBasicAutocompletion: true,
        // enableLiveAutocompletion: true
    });
    this.editor.setTheme("ace/theme/chrome");
    this.editor.session.setMode("ace/mode/html");
    this.editor.session.on('change', (delta)=>{
        this.$emit('input', this.editor.getValue())
    });
    this.editor.setValue(this.value)

    this.editor.commands.addCommand({
      name: 'save',
      bindKey: {"win": "Ctrl-S", "mac": "Cmd-S"},
      exec: (editor) => {
          this.save()
      }
    })

    this.editor.commands.addCommand({
      name: 'reload',
      bindKey: {"win": "Ctrl-R", "mac": "Cmd-R"},
      exec: (editor) => {
          this.reload()
      }
    })
    // var editorDiv = document.getElementById(this.editorId);     // its container
    // var doc = this.editor.getSession().getDocument();  // a reference to the doc
    // this.editor.on("change", ()=>{
    //     var lineHeight = this.editor.renderer.lineHeight;
    //     editorDiv.style.height = lineHeight * doc.getLength() + "px";
    //     this.editor.resize();
    // });
  },
  watch: {

  },
  methods: {
    save(){
      this.window.save({pluginId: this.pluginId, code: this.editor.getValue()})
      //this.$emit('save', {pluginId: this.pluginId, code: this.editor.getValue()})
    },
    reload(){
      this.editor.resize()
      this.window.reload({pluginId: this.pluginId, type:this.window.plugin.type, name:this.window.plugin.name, code: this.editor.getValue(), plugin: this.window.plugin}).then((plugin)=>{
        this.window.plugin = plugin
        this.window.name = plugin.name
      })
      //this.$emit('reload', {pluginId: this.pluginId, code: this.editor.getValue()})
    },
    saveAs(){
      const filename = this.window.plugin&&this.window.plugin.name?this.window.plugin.name+"_"+randId()+'.imjoy.html':'plugin_'+randId()+'.imjoy.html'
      const file = new Blob([this.editor.getValue()], {type: "text/plain;charset=utf-8"})
      saveAs(file, filename);
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.editor{
  overflow: auto;
}
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
</style>
