<template>
  <div class="log-content">
    <p v-for="(t, k) in w.data.log_history" :key="k">{{t.value || t}}</p>
  </div>
</template>

<script>

export default {
  name: 'log-window',
  type: 'imjoy/log',
  props: {
    w: {
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
.log-content {
  overflow: auto;
}
.log-content p{
  padding-left: 10px;
  padding-right: 10px;
  margin: 1px;
}
</style>
