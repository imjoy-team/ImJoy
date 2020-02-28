<template>
  <div class="plugin-icon">
    <md-icon v-if="!icon">extension</md-icon>
    <img class="icon-image" v-else-if="icon.startsWith('http')" :src="icon" />
    <md-icon v-else>{{ icon }} </md-icon>
  </div>
</template>

<script>
export default {
  name: "plugin-icon",
  props: {
    icon: { type: String, default: "" },
  },
  created() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.plugin-icon {
  display: inline-block;
  vertical-align: middle;
}
.icon-image {
  max-height: 46px;
}
@media screen and (max-width: 800px) {
  .icon-image {
    max-height: 30px;
  }
}

@media screen and (max-width: 400px) {
  .icon-image {
    max-height: 15px;
  }
}
</style>
