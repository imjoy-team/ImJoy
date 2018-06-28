<template>
<div class="plugin-editor">
    <md-toolbar class="md-dense">
      <md-button @click="reload()" class="md-icon-button">
        <md-icon>autorenew</md-icon>
      </md-button>
      <md-button @click="save()" class="md-icon-button">
        <md-icon>save</md-icon>
      </md-button>
    </md-toolbar>
    <md-content>
    <div :id="'editor_'+pluginId"></div>
  </md-content>
</div>
</template>

<script>
export default {
  name: 'joy',
  props: ['value', 'options', 'title', 'pluginId', 'window'],
  data() {
    return {
      router: this.$root.$data.router,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
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
        // enableBasicAutocompletion: true,
        // enableLiveAutocompletion: true
    });
    this.editor.setTheme("ace/theme/chrome");
    this.editor.session.setMode("ace/mode/html");
    this.editor.session.on('change', (delta)=>{
        this.$emit('input', this.editor.getValue())
    });
    this.editor.setValue(this.value)

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
      this.window.misc.save({pluginId: this.pluginId, code: this.editor.getValue()})
      //this.$emit('save', {pluginId: this.pluginId, code: this.editor.getValue()})
    },
    reload(){
      this.window.misc.reload({pluginId: this.pluginId, code: this.editor.getValue(), plugin: this.window.plugin}).then((plugin)=>{
        this.window.plugin = plugin
      })
      //this.$emit('reload', {pluginId: this.pluginId, code: this.editor.getValue()})
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.plugin-editor{
  overflow: auto;
}
#editor {
    position: fixed;
    top: 30px;
    right: 1px;
    bottom: 30px;
    left: 1px;
}
</style>
