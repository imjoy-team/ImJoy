<template>
  <div class="log-content">
    <ul>
      <li v-for="(t, k) in log_history" :key="k">
        <img v-if="t.type === 'image'" :src="t.value" />
        <p v-else :class="t.type === 'error' ? 'error' : 'info'">
          {{ t.value || t }}
        </p>
      </li>
    </ul>
    <md-button class="md-mini" @click="refresh()">
      <md-icon>autorenew</md-icon>Refresh
    </md-button>
    <md-button
      class="md-mini"
      v-if="log_history && log_history.length > 0"
      @click="clearLog()"
    >
      <md-icon>clear</md-icon>Clear
    </md-button>
    <md-button
      class="md-mini"
      v-if="log_history && log_history.length > 0"
      @click="exportLog()"
    >
      <md-icon>cloud_download</md-icon>Export
    </md-button>
    <p v-else>
      No log available.
    </p>
  </div>
</template>

<script>
import { saveAs } from "file-saver";
export default {
  name: "log-window",
  type: "imjoy/log",
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
  computed: {
    log_history: function() {
      if (this.w.data.log_history) {
        return this.w.data.log_history;
      } else if (
        this.w.data.plugins &&
        this.w.data.name &&
        this.w.data.plugins[this.w.data.name]
      ) {
        return this.w.data.plugins[this.w.data.name]._log_history;
      } else {
        console.error("unsupported log input.");
        return [];
      }
    },
  },
  methods: {
    refresh() {
      this.$forceUpdate();
    },
    clearLog() {
      const log_history = this.log_history;
      log_history.splice(0, log_history.length);
      log_history._error = "";
      log_history._info = "";
    },
    exportLog() {
      const log_history = this.log_history;
      const filename = this.w.name + "_log.txt";
      let content = "";
      for (let c of log_history) {
        content = c.type + ":" + content + c.value + "\n";
      }
      const file = new Blob([content], { type: "text/plain;charset=utf-8" });
      saveAs(file, filename);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.log-content {
  overflow: auto;
  width: 100%;
  user-select: text !important;
  -webkit-touch-callout: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}

.log-content p {
  padding-left: 10px;
  padding-right: 10px;
  margin: 1px;
}

ul {
  list-style: circle outside !important;
  margin-left: 30px !important;
}

.info {
  color: #4286f4;
  transition: 0.3s;
}

.error {
  color: #f44336;
  transition: 0.3s;
}
</style>
