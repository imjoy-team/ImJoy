<template>
  <plugin-editor
    ref="code_editor"
    class="no-drag fill-container"
    :pluginId="w.data.id"
    :window="w"
    v-model="w.data.code"
    :editorId="'editor_' + w.data.id"
  ></plugin-editor>
</template>

<script>
export default {
  name: "plugin-editor-window",
  type: "imjoy/plugin-editor",
  props: {
    w: {
      type: Object,
      default: function() {
        return null;
      },
    },
    loaders: {
      type: Object,
      default: function() {
        return null;
      },
    },
  },
  mounted() {
    if (this.w.data.engine_file_obj) {
      this.$refs.code_editor.openEnigneFile(this.w.data.engine_file_obj);
    }
  },
  methods: {
    dataSummary(w) {
      if (Array.isArray(w.data)) {
        return `${w.type}, ${typeof w.data}, length: ${w.data.length}`;
      } else if (
        w.data.buffer &&
        Object.prototype.toString.call(w.data.buffer) === "[object ArrayBuffer]"
      ) {
        return `${w.type}, typedarray, length: ${w.data.length}`;
      } else if (typeof w.data === "object") {
        return `${w.type}, ${typeof w.data}, length: ${
          Object.keys(w.data).length
        }`;
      } else {
        return `${w.type}`;
      }
    },
    printObject(name, obj, obj2) {
      console.log(name, obj, obj2);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.fill-container {
  width: 100%;
  height: 100%;
}
</style>
