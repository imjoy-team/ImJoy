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
    setupJoy(reset) {
      if (!reset && this.joy) {
        this.config.data = this.joy.top.data;
      }
      this.$nextTick(() => {
        this.$refs.editor.innerHTML = "";
        const joy_config = {
          // Where the Joy editor goes:
          container: this.$refs.editor,

          // The words & ops inside the editor:
          init: this.config.ui || "", //"{id:'localizationWorkflow', type:'ops'} " + // a list of ops
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
