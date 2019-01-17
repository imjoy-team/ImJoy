<template>
  <ul v-if="w.data && w.data.length && w.data.length>0">
    <li v-for="u in w.data" :key="u.href || u">
      <a :href="u.href || u" target="_blank">{{u.text || u}}</a>
    </li>
  </ul>
  <p v-else> No url.</p>
</template>

<script>

export default {
  name: 'url-list-window',
  type: 'imjoy/url_list',
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
