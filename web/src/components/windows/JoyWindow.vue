<!-- taken from https://vuejsexamples.com/responsive-image-content-comparison-slider-built-with-vue/ -->
<template>
  <div class="joy-window">
    <joy
      v-if="plugin_dialog_config"
      :config="plugin_dialog_config"
      :showHeader="false"
      :controlButtons="false"
      ref="plugin_dialog_joy"
    ></joy>
    <md-dialog-actions>
      <md-button class="md-primary" @click="w.ok()">OK</md-button>
      <md-button class="md-accent" @click="w.cancel()">Cancel</md-button>
    </md-dialog-actions>
  </div>
</template>

<script>
export default {
  name: "joy-window",
  type: "imjoy/joy",
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
      plugin_dialog_config: null,
    };
  },
  mounted() {
    if (this.w) {
      this.plugin_dialog_config = this.w;
      this.w.get_config = () => this.$refs.plugin_dialog_joy.joy.get_config();
    }
  },
  methods: {
    getConfig() {
      return;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
