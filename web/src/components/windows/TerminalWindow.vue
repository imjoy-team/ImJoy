<template>
  <div class="terminal">
    <h5 v-if="!engine || !engine.connected || disconnected">{{ status }}</h5>
    <div
      ref="terminal_container"
      :style="{ height: window_height }"
      class="terminal-window"
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
      status: "Disconnected",
      disconnected: false,
      engine: null,
      window_height: "500px",
    };
  },
  created() {},
  mounted() {
    this.engine = this.w.data.engine;
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
    this.fitToscreen()
    term.write("Welcome to ImJoy plugin engine terminal!\r\n");
    this.term = term;
    if (this.engine && this.engine.connected) {
      this.status = "Connecting terminal...";
      this.start();
    } else {
      this.status = "Waiting for engine to connect.";
      this.engine.socket.on("connect", this.start);
    }
  },
  methods: {
    start() {
      this.engine.socket.emit("start_terminal", {}, ret => {
        if (ret && ret.success) {
          this.term.on("key", key => {
            this.engine.socket.emit("terminal_input", { input: key });
          });
          this.term.on("paste", data => {
            this.engine.socket.emit("terminal_input", { input: data });
          });
          this.engine.socket.on("terminal_output", data => {
            this.term.write(data.output);
          });
          this.status = "Terminal connected.";
          this.disconnected = false;
          this.$forceUpdate();
        } else {
          this.status = "Failed to start terminal.";
          this.disconnected = true;
          this.$forceUpdate();
        }
        const wait_ms = 50;
        const fit2screen = debounce(this.fitToscreen, wait_ms);
        window.onresize = fit2screen;
        this.w.onResize(fit2screen);
        this.w.onRefresh(fit2screen);
      });
    },
    fitToscreen() {
      this.window_height = this.$el.clientHeight + "px";
      this.$forceUpdate();
      this.$nextTick(() => {
        this.term.fit();
        console.log(`size: ${this.term.cols} columns, ${this.term.rows} rows`);
        this.engine.socket.emit("terminal_window_resize", {
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
.terminal {
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

.terminal-window {
  width: 100%;
  display: block;
}
</style>
