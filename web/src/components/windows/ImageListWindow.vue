<template>
  <div class="allow-scroll fill-container">
    <p v-if="!w.data || !w.data.images || w.data.images.length == 0">
      No image available for display.
    </p>
    <img
      v-else
      style="height: 100%; width: 100%; object-fit: contain;"
      :src="img"
      v-for="(img, i) in w.data.images"
      :key="i"
    />
  </div>
</template>

<script>
export default {
  name: "image-list-window",
  type: "imjoy/images",
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
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.allow-scroll {
  overflow: auto !important;
}

.fill-container {
  width: 100%;
  height: 100%;
}
</style>
