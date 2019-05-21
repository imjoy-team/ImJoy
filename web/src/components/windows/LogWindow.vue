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
  data() {
    return {
      log_history: null,
    };
  },
  mounted() {
    this.event_bus = this.$root.$data.store && this.$root.$data.store.event_bus;
    if (this.event_bus) {
      this.event_bus.$on("plugin_loaded", this.fetchLog);
    }
    this.log_history = this.w.data.log_history;
    this.plugin_id = this.w.data.plugin_id;
    this.plugin_name = this.w.data.plugin_name;
  },
  beforeDestroy() {
    if (this.event_bus) {
      this.event_bus.$off("plugin_loaded", this.fetchLog);
    }
  },
  methods: {
    fetchLog(plugin) {
      if (plugin.name == this.w.data.plugin_name) {
        this.log_history = plugin._log_history;
        this.plugin_id = plugin.id;
        this.plugin_name = plugin.name;
      }
      this.$forceUpdate();
    },
    clearLog() {
      const log_history = this.log_history;
      log_history.splice(0, log_history.length);
      log_history._error = "";
      log_history._info = "";
      this.$forceUpdate();
    },
    exportLog() {
      const log_history = this.log_history;
      const filename = this.plugin_id || this.plugin_name + "_log.txt";
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
