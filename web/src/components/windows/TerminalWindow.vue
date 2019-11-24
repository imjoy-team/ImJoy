<template>
  <div class="terminal-window">
    <md-button v-if="error" @click="start()">
      <md-icon>restore</md-icon> Restart Terminal
    </md-button>
    <div
      ref="terminal_container"
      :style="{ height: window_height }"
      class="terminal-container"
    ></div>
  </div>
</template>

<script>
import { Terminal } from "xterm";
import "xterm/lib/xterm.css";
import * as fullscreen from "xterm/lib/addons/fullscreen/fullscreen";
import * as fit from "xterm/lib/addons/fit/fit";
import * as webLinks from "xterm/lib/addons/webLinks/webLinks";
import * as search from "xterm/lib/addons/search/search";
function debounce(func, wait_ms) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait_ms);
  };
}
export default {
  name: "terminal-window",
  type: "imjoy/terminal",
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
      error: false,
      window_height: "500px",
    };
  },
  created() {},
  mounted() {
    Terminal.applyAddon(fullscreen);
    Terminal.applyAddon(fit);
    Terminal.applyAddon(webLinks);
    Terminal.applyAddon(search);
    const term = new Terminal({
      cursorBlink: true,
      macOptionIsMeta: true,
      scrollback: true,
    });
    term.open(this.$refs.terminal_container);
    this.term = term;
    this.$nextTick(() => {
      this.fitToscreen();
    });
    this.w.api.on("write", data => {
      this.term.write(data);
    });
    this.w.api.on("error", error => {
      this.error = error;
    });
    this.term.on("key", key => {
      this.w.api.emit("key", key);
    });
    this.term.on("paste", data => {
      this.w.api.emit("paste", data);
    });
    const wait_ms = 50;
    const fit2screen = debounce(this.fitToscreen, wait_ms);
    window.addEventListener("resize", fit2screen);
    document.addEventListener("orientationchange", fit2screen);
    this.w.api.on("resize", fit2screen);
    this.w.api.on("refresh", fit2screen);
    this.$emit("init");
  },
  beforeDestroy() {},
  methods: {
    fitToscreen() {
      this.window_height = this.$el.clientHeight + "px";
      this.$forceUpdate();
      this.$nextTick(() => {
        this.term.fit();
        this.w.api.emit("fit", {
          cols: this.term.cols,
          rows: this.term.rows,
        });
        this.$forceUpdate();
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.terminal-window {
  height: 100%;
  width: 100%;
}
.info {
  color: #4286f4;
  transition: 0.3s;
}
.error {
  color: #f44336;
  transition: 0.3s;
}
.terminal-container {
  width: 100%;
  display: block;
}
</style>
