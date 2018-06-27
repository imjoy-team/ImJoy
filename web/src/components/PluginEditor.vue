<template>
<div class="plugin-editor">
  <md-content>
    <!-- <div class="md-toolbar-row">
      <h2>Code Editor</h2>
    </div> -->
    <div id="editor">function foo(items) {
      var x = "All this is syntax highlighted";
      return x;
  }</div>

  </md-content>
    </div>
</template>

<script>
export default {
  name: 'joy',
  props: ['value', 'options'],
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
    this.editor = ace.edit("editor");
    ace.config.set('basePath', '/static/ace')
    this.editor.setTheme("ace/theme/chrome");
    this.editor.session.setMode("ace/mode/html");
    this.editor.session.on('change', (delta)=>{
        this.$emit('input', this.editor.getValue())
    });
    this.editor.setValue(this.value)
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
    position: absolute;
    top: 80px;
    right: 10px;
    bottom: 10px;
    left: 10px;
}
</style>
