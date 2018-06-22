<template>
<div class="home">
  <!-- <md-card>
    <md-card-header> -->

  <!-- <md-icon class="md-size-5x md-small-hide" md-src="static/img/ImJoy.io-icon-circle.svg" /> -->
  <md-toolbar class="md-transparent md-dense" md-elevation="0">
    <div class="md-toolbar-row" flex>
      <div class="md-toolbar-section-end">
        <md-button href="https://github.com/oeway/ImJoy" target="_blank">
          <md-icon md-src="static/img/github.svg" class="md-size-1x svg-icon"></md-icon>source code</md-button>
        <md-button @click="shareOnTwitter">
          <md-icon md-src="static/img/twitter.svg" class="md-size-1x svg-icon"></md-icon>share</md-button>
      </div>
    </div>
  </md-toolbar>
  <div class="md-toolbar-row md-layout md-alignment-center-center">
    <div class="banner-container">
      <img src="static/img/perspective-hr.jpg" alt="banner"></img>
      <div class="subtitle">Image processing with joy.<br>
        <md-button class="md-raised md-accent" @click="showDialog=true">Getting Started</md-button>
      </div>
    </div>
  </div>
  <br>

  <md-dialog :md-active.sync="showDialog">
    <md-dialog-title>Getting Started with ImJoy</md-dialog-title>
    <md-dialog-content>
      <p>With the ImJoy web app, you process your images within the browser, instantly, no installation.</p>
      <md-button class="md-raised md-primary" to="viewer">Start</md-button>
      <p>You can process your data with the viewer locally and anonymously, by default, no data will be transferred to the internet (also depends on the plugin you installed).</p>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showDialog=false">OK</md-button>
    </md-dialog-actions>
  </md-dialog>
  <br>
  <plugin-list config-url="static/plugins/manifest.json" title="Plugins"></plugin-list>
  <br>
  <md-divider></md-divider>
  <main-footer/>
</div>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      showDialog: false,
      router: this.$root.$data.router,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
  },
  mounted() {
    this.$nextTick(() => {})
  },
  methods: {
    shareOnTwitter() {
      const url = "https://imjoy.io";
      const text = " #ShareLoc ";
      window.open('http://twitter.com/share?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text), '', 'left=0,top=0,width=550,height=450,personalbar=0,toolbar=0,scrollbars=0,resizable=0');
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

.svg-icon {
  display: inline-block;
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
