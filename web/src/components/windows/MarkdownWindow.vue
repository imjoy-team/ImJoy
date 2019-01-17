<template>
  <div style="padding-left: 10px; padding-right: 5px; overflow: auto" v-if="w.data && w.data.source && w.data.source.trim() !='' " v-html="marked(w.data.source, { sanitize: true })"></div>
  <h3 v-else> Oops, this plugin has no documentation!</h3>
</template>

<script>

export default {
  name: 'markdown-window',
  type: 'imjoy/markdown',
  props: {
    w: {
      type: Object,
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
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
