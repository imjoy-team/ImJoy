<template>
<div class="welcome-dialog">
  <md-dialog :md-active.sync="showDialog" :md-click-outside-to-close="false" :md-close-on-esc="false">
    <md-dialog-title>Welcome to ImJoy!</md-dialog-title>
    <md-dialog-content>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="start()">Start ImJoy</md-button>
      <md-button class="md-primary" @click="showDocs()">Docs</md-button>
    </md-dialog-actions>
  </md-dialog>
</div>
</template>

<script>
export default {
  name: 'welcome-dialog',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showDialog: false
    }
  },
  created(){
  },
  mounted() {

  },
  watch: {
    show(newVal) {
      this.showDialog = newVal
    }
  },
  methods: {
    start(){
      this.$emit('start')
      this.showDialog = false
      this.$emit('show', false)
    },
    showDocs(){
      this.showDialog = false
      this.$emit('show', false)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.subtitle {
  text-align: center;
  font-family: 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 320;
  font-size: 4.0em;
  margin: 0 auto;
  line-height: 110%;
  display: block;
  max-width: 1100px;
  padding: 50px 40px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.banner-container {
  position: relative;
  text-align: center;
  color: white;
}

.floating-centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.home-carousel {
  max-height: 90vh;
}

.legend {
  padding-left: 10px;
}

@media screen and (max-width: 600px) {
  .subtitle {
    font-size: 1.3em;
  }
}

.carousel-img {
  min-width: 80%;
}

.centered-item {
  margin: 0 auto;
  text-align: center;
}

.fixed-content {
  padding: 3px;
  max-width: 1000px;
  text-align: center;
  margin: 0 auto;
}

.centered-fixed-card {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

/* .slide-1 {

  background-image: url('/static/img/scaled-movie-4.gif');
} */

.video-wrapper {
  position: relative;
}

.video-wrapper>video {
  width: 100%;
  vertical-align: middle;
}

.video-wrapper>video.has-media-controls-hidden::-webkit-media-controls {
  display: none;
}

.video-overlay-play-button {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 10px calc(50% - 50px);
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  display: block;
  opacity: 0.95;
  cursor: pointer;
  /* background-image: linear-gradient(transparent, rgba(10,10,10,0.4)); */
  transition: opacity 150ms;
}

.video-overlay-play-button:hover {
  opacity: 1;
}

.video-overlay-play-button.is-hidden {
  display: none;
}

.lower-button {
  text-transform: none;
}
</style>
