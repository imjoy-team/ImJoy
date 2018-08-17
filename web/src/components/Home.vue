<template>
<div class="home">
  <md-app-toolbar class="md-primary">
    <div class="md-toolbar-row" flex>
      <navbar/>
    </div>
  </md-app-toolbar>

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
      <md-button class="md-raised md-primary" to="app">Start</md-button>
      <p>You can process your data with the Imjoy app locally and anonymously, by default, no data will be transferred to the internet (also depends on the plugin you installed).</p>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showDialog=false">OK</md-button>
    </md-dialog-actions>
  </md-dialog>
  <br>
  <plugin-list display="card" config-url="https://raw.githubusercontent.com/oeway/ImJoy-Plugins/master/manifest.json" title="Plugins"></plugin-list>
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
    }
  },
  created(){
    this.router = this.$root.$data.router
    this.store = this.$root.$data.store
    this.api = this.$root.$data.store.api
  },
  mounted() {
    this.$nextTick(() => {})
  },
  methods: {
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
