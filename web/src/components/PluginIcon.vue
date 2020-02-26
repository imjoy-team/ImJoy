<template>
  <div>
    <md-icon v-if="!icon">extension</md-icon>
    <img v-else-if="icon.startsWith('http')" :src="icon" />
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
<style scoped></style>
