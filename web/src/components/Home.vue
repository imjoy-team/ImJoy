<template>
<div class="home">
  <md-app-toolbar class="md-primary">
    <div class="md-toolbar-row" flex>
      <navbar/>
    </div>
  </md-app-toolbar>

  <div class="md-toolbar-row md-layout md-alignment-center-center">
    <div class="banner-container">
      <img src="static/img/perspective-hr.jpg" alt="banner" />
      <div class="subtitle">Image processing with joy!<br>
        <md-button class="md-raised" @click="$router.push('/app')">Start ImJoy App</md-button>
        <md-button class="md-raised" href="/docs">Docs</md-button>
      </div>
    </div>
  </div>
  <br>
  <plugin-list display="card" config-url="https://raw.githubusercontent.com/oeway/ImJoy-Plugins/master/manifest.imjoy.json" title="Plugins"></plugin-list>
  <br>
  <md-divider></md-divider>
  <main-footer/>
</div>
</template>

<script>
export default {
  name: 'home'
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

.lower-button {
  text-transform: none;
}
</style>
