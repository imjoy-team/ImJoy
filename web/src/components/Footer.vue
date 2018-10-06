<template>
  <div class="footer" v-if="$route.path != '/app' && $route.path != '/app'">
    <div class="md-layout md-alignment-center-center">
      <md-button class="md-accent footer-button" target="_blank" href="https://github.com/oeway/ImJoy/issues">Create an issue on Github</md-button>
    </div>

    <div class="md-layout md-alignment-center-center">
      <md-button class="footer-button" href="https://creativecommons.org/licenses/by/4.0/" target="_blank">
        <md-tooltip>Except where otherwise noted, content on this site is licensed under a Creative Commons Attribution 4.0 International license.</md-tooltip>
         <img id="cc-by-img" src="static/img/by.svg" alt="CC BY 4.0">
      </md-button>
      <md-button class="footer-button" to="/about">About ImJoy.io</md-button>
    </div>
    <div class="md-layout md-alignment-center-center">
      <md-button class="footer-button" href="https://github.com/oeway" target="_blank">Made by Wei OUYANG with <span class="red">❤</span></md-button>
      <md-button class="footer-button" target="_blank" href="https://sites.google.com/site/imagingandmodeling/">Powered by Imaging and Modeling Unit</md-button>
      <a href="https://www.pasteur.fr" target="_blank">
      <img id="ip-img" src="static/img/Institut_Pasteur_logo.svg" alt="Institut Pasteur">
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'main-footer',
  data () {
    return {
      mode: 'about',
      showDialog: false,
      showQuestion: false,
    }
  },
  created(){
    this.store = this.$root.$data.store
  },
  mounted(){
  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.footer {
  text-align: center;
}
.footer-button{
  text-transform: none;
}
.red{
  display: inline-block;
  color: #f44336;
  transition: .3s;
}
#cc-by-img{
  height: 25px;
}
#ip-img{
  height: 40px;
  margin-bottom: 30px;
}

#question-dialog{
  max-height: 1000px !important;
  max-width: 1200px !important;
  width: 80% !important;
  height: 60% !important;
}

@media screen and (max-width: 800px) {
  #question-dialog{
    max-height: 100% !important;
    max-width: 100% !important;
    width: 100% !important;
    height: 100% !important;
  }
}

#typeform-full{
  height:100%;
  width: 100%;
  position:absolute; left: 0; right: 0; bottom: 0; top: 0px;
}

.holds-the-iframe {
 background: url(/static/img/ImJoy.io-icon-circle-animation.svg) center center no-repeat;
}

.md-dialog {
  min-width: 80%;
}
</style>
