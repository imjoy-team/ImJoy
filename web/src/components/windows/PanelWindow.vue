<template>
  <joy :config="w.config"></joy>
</template>

<script>
export default {
  name: "panel-window",
  type: "imjoy/panel",
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
  mounted() {
    this.$emit("init");
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
