<template>
  <div class="settings">
    <md-button class="md-button md-accent" @click="clearCache()">
      <md-icon>clear</md-icon>Clear Offline Cache
    </md-button>
  </div>
</template>

<script>
import { SendMessageToServiceWorker } from "../utils.js";

export default {
  name: "settings",
  methods: {
    async clearCache() {
      try {
        await SendMessageToServiceWorker({ command: "clear" });
      } catch (e) {
        alert(e);
        console.error(e);
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
