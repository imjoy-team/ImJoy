<template>
  <div class="fill-container">
    <img
      style="height: 100%; width: 100%; object-fit: contain;"
      :src="w.data.src"
      v-if="w.data && w.data.src"
    />
    <p v-else>No image available for display.</p>
  </div>
</template>

<script>
export default {
  name: "image-window",
  type: "imjoy/image",
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
<style scoped>
.fill-container {
  width: 100%;
  height: 100%;
}
</style>
