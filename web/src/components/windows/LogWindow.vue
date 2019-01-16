<template>
  <div class="log-content">
    <ul>
      <li v-for="(t, k) in w.data.log_history" :key="k">
        <p :class="t.type==='error'?'error': 'info'">{{t.value || t}}</p>
      </li>
    </ul>
    <md-button class="md-mini" v-if="w.data && w.data.log_history && w.data.log_history.length>0" @click="clear">
        <md-icon>clear</md-icon>Clear
    </md-button>
    <p v-else>
      No log available.
    </p>
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
  },
  methods: {
    clear(){
      this.w.data.log_history.splice(0, this.w.data.log_history.length)
      this.w.data.log_history._error = ''
      this.w.data.log_history._info = ''
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

.info {
  color: #4286f4;
  transition: .3s;
}

.error {
  color: #f44336;
  transition: .3s;
}
</style>
