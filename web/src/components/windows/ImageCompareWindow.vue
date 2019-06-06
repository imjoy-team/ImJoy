<template>
  <comparify
    ref="compare"
    v-if="w.data && w.data.first && w.data.second"
    :value="w.data.offset || 50"
    class="bg-white h-64 w-full"
  >
    <img
      slot="first"
      class="h-64 object-fit-first h-full w-full"
      :src="w.data.first"
      alt=""
    />
    <img
      slot="second"
      class="object-fit-second h-full w-full"
      :src="w.data.second"
      alt=""
    />
  </comparify>
  <p v-else>No image available for display.</p>
</template>

<script>
import { default as Comparify } from "./Comparify.vue";
import { setTimeout } from "timers";

export default {
  name: "image-compare-window",
  type: "imjoy/image-compare",
  components: {
    Comparify,
  },
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
    this.w.onResize(() => {
      setTimeout(() => {
        this.$refs.compare.handleResize();
      }, 0);
    });
    this.w.onRefresh(() => {
      setTimeout(() => {
        this.$refs.compare.handleResize();
      }, 0);
    });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.compare-window {
  overflow: hidden;
}

.object-fit-first {
  object-fit: contain;
  height: 100%;
  width: 100%;
}

.object-fit-second {
  object-fit: contain;
  height: 100%;
  width: 100%;
}
</style>
