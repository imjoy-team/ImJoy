<template>
<div class="plugin-editor">

    <div class="md-toolbar-row">
      <h2>{{title}}</h2>
    </div>
    <div id="editor"></div>

</div>
</template>

<script>
export default {
  name: 'joy',
  props: ['value', 'options', 'title'],
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
    ace.require('ace/tooltip').Tooltip.prototype.setPosition = function (x, y) {
        var rect = document.getElementById("editor").getBoundingClientRect();
        y -= rect.top;
        x -= rect.left;
        this.getElement().style.left = x + "px";
        this.getElement().style.top = y + "px";
     };
    this.editor = ace.edit("editor");
    ace.config.set('basePath', '/static/ace')
    this.editor.setOptions({
        maxLines: 30//Infinity
    });
    this.editor.setTheme("ace/theme/chrome");
    this.editor.session.setMode("ace/mode/html");
    this.editor.session.on('change', (delta)=>{
        this.$emit('input', this.editor.getValue())
    });
    this.editor.setValue(this.value)

    // var editorDiv = document.getElementById("editor");     // its container
    // var doc = this.editor.getSession().getDocument();  // a reference to the doc
    //
    // this.editor.on("change", function() {
    //     var lineHeight = this.editor.renderer.lineHeight;
    //     editorDiv.style.height = lineHeight * doc.getLength() + "px";
    //     this.editor.resize();
    // });
  },
  watch: {

  },
  methods: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#editor {
    position: fixed;
    top: 30px;
    right: 1px;
    bottom: 30px;
    left: 1px;
}
</style>
