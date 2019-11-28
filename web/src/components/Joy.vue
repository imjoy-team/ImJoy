<template>
  <div class="joy">
    <div class="joy-container" v-show="show">
      <div class="joy-editor" ref="editor"></div>
    </div>
  </div>
</template>

<script>
import { Joy } from "../joy";
export default {
  name: "joy",
  props: {
    show: {
      type: Boolean,
      default: () => {
        return true;
      },
    },
    config: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      joy: null,
      isRunning: false,
    };
  },
  created() {
    this.store = this.$root.$data.store;
  },
  mounted() {
    setTimeout(this.setupJoy, 500);
  },
  watch: {
    config: function() {
      this.setupJoy();
    },
  },
  methods: {
    editSource() {
      this.$emit("edit", this.config);
    },
    normalizeUI(ui) {
      if (!ui) {
        return "";
      }
      let normui = "";
      if (Array.isArray(ui)) {
        for (let it of ui) {
          if (typeof it === "string") normui = normui + it + "<br>";
          else if (typeof it === "object") {
            for (let k in it) {
              if (typeof it[k] === "string")
                normui = normui + k + ": " + it[k] + "<br>";
              else normui = normui + k + ": " + JSON.stringify(it[k]) + "<br>";
            }
          } else normui = normui + JSON.stringify(it) + "<br>";
        }
      } else if (typeof ui === "object") {
        throw "ui can not be an object, you can only use a string or an array.";
      } else if (typeof ui === "string") {
        normui = ui.trim();
      } else {
        normui = "";
        console.log("Warining: removing ui string.");
      }
      return normui;
    },
    setupJoy(reset) {
      if (!reset && this.joy) {
        this.config.data = this.joy.top.data;
      }
      this.$nextTick(() => {
        if (!this.$refs.editor) return;
        this.$refs.editor.innerHTML = "";
        const joy_config = {
          // Where the Joy editor goes:
          container: this.$refs.editor,

          // The words & ops inside the editor:
          init: this.normalizeUI(this.config.ui) || "", //"{id:'localizationWorkflow', type:'ops'} " + // a list of ops
          //"<hr> {type:'save'}", // a save button!

          // Load data from URL, otherwise blank:
          data: this.config.data, // || Joy.loadFromURL(),

          // Other ops to include, beyond turtle ops:
          modules: this.config.modules || ["instructions", "math"],

          onexecute: this.config.onexecute,
          // What to do when the user makes a change:
          onupdate: this.config.onupdate,
        };
        // console.log('setting up joy ', this.config)
        try {
          this.joy = new Joy(joy_config);
        } catch (e) {
          console.error("error occured when loading the workflow", e);
          joy_config.data = "";
          this.joy = new Joy(joy_config);
          throw e;
        }
        this.config.joy = this.joy;
      });
    },
    runJoy() {
      this.$emit("run", this.joy);
    },
    stopJoy() {
      this.$emit("stop");
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
@import "../joy.css";
</style>
