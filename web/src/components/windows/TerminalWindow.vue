<template>
  <div class="terminal">
    <md-button v-if="error" @click="start()">
      <md-icon>restore</md-icon> Restart Terminal
    </md-button>
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
      error: false,
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

    this.fitToscreen();

    this.term = term;
    if (this.engine && this.engine.connected) {
      this.start();
    } else {
      term.write("Engine is not connected.\r\n");
      this.engine.socket.on("connect", this.start);
      this.engine.socket.on("disconnect", this.disconnect);
    }
  },
  beforeDestroy() {
    if (this.engine && this.engine.socket) {
      this.engine.socket.removeListener("terminal_output", this.write_terminal);
      this.engine.socket.removeListener("connect", this.start);
      this.engine.socket.removeListener("disconnect", this.disconnect);
    }
  },
  methods: {
    disconnect() {
      this.term.write("\r\nDisconnected from the plugin engine.\r\n");
    },
    start() {
      if (this.engine && this.engine.socket) {
        this.engine.socket.emit("start_terminal", {}, ret => {
          if (ret && ret.success) {
            this.term.write(ret.message + "\r\n");
            this.error = null;
            this.term.on("key", key => {
              this.engine.socket.emit(
                "terminal_input",
                { input: key },
                error => {
                  if (error) {
                    this.error = true;
                  } else {
                    this.error = false;
                  }
                }
              );
            });
            this.term.on("paste", data => {
              this.engine.socket.emit("terminal_input", { input: data });
            });
            this.engine.socket.on("terminal_output", this.write_terminal);
            this.disconnected = false;
            this.$forceUpdate();
          } else {
            this.term.write("\r\nFailed to start terminal.\r\n");
            this.error = true;
            this.disconnected = true;
            this.$forceUpdate();
          }
          const wait_ms = 50;
          const fit2screen = debounce(this.fitToscreen, wait_ms);
          window.onresize = fit2screen;
          this.w.onResize(fit2screen);
          this.w.onRefresh(fit2screen);
        });
      } else {
        this.term.write(
          "\r\nCannot start terminal because engine is not connected.\r\n"
        );
        this.error = true;
        console.error("cannot start terminal because engine is not connected.");
      }
    },
    write_terminal(data) {
      this.term.write(data.output);
    },
    fitToscreen() {
      this.window_height = this.$el.clientHeight + "px";
      this.$forceUpdate();
      setTimeout(() => {
        this.window_height = this.$el.clientHeight + "px";
        this.term.fit();
        if (this.engine && this.engine.socket) {
          this.engine.socket.emit("terminal_window_resize", {
            cols: this.term.cols,
            rows: this.term.rows,
          });
        } else {
          console.error("engine is not connected.");
        }
        this.$forceUpdate();
      }, 400);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.terminal {
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
