<template>
  <div class="footer" v-if="$route.path != '/viewer' && $route.path != '/view'">
    <div class="md-layout md-alignment-center-center">
      <md-button class="md-accent footer-button" target="_blank" @click="contact()">Ask a question</md-button>
      <md-button class="md-accent footer-button" target="_blank" href="https://github.com/oeway/ImJoy/issues">Create an issue on Github</md-button>
    </div>

    <div class="md-layout md-alignment-center-center">
      <md-button class="footer-button" href="https://creativecommons.org/licenses/by/4.0/" target="_blank">
        <md-tooltip>Except where otherwise noted, content on this site is licensed under a Creative Commons Attribution 4.0 International license.</md-tooltip>
         <img id="cc-by-img" src="static/img/by.svg" alt="CC BY 4.0"> Site content licensed under CC BY 4.0
      </md-button>
      <md-button class="footer-button" @click="mode='about';showDialog=true">About ImJoy.io</md-button>
    </div>
    <div class="md-layout md-alignment-center-center">
      <md-button class="footer-button" href="https://github.com/oeway" target="_blank">Made by Wei OUYANG with <span class="red">❤</span></md-button>
      <md-button class="footer-button" target="_blank" href="https://sites.google.com/site/imagingandmodeling/">Powered by Imaging and Modeling Unit</md-button>
      <a href="https://www.pasteur.fr" target="_blank">
      <img id="ip-img" src="static/img/Institut_Pasteur_logo.svg" alt="Institut Pasteur">
      </a>
    </div>


    <md-dialog :md-active.sync="showDialog">
      <md-dialog-content>
        <about v-if="mode=='about'" :footer="false" :faq="false"/>
        <tos v-if="mode=='tos'"/>
      </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showDialog=false">OK</md-button>
    </md-dialog-actions>
    </md-dialog>
    <md-dialog :md-active.sync="showQuestion" id="question-dialog">
      <md-toolbar class="md-primary">
        <div class="md-toolbar-row" flex>
          <md-subheader>
            Contact us
          </md-subheader>
          <div class="md-toolbar-section-end" >
            <md-button class="md-icon-button" @click="showQuestion=false"> <md-icon>close</md-icon></md-button>
          </div>
        </div>
      </md-toolbar>
      <md-dialog-content>
        <div class="holds-the-iframe"><iframe id="typeform-full" width="100%" height="100%" frameborder="0" src="https://oeway.typeform.com/to/qyJOIy"></iframe></div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showQuestion=false">Close</md-button>
      </md-dialog-actions>
    </md-dialog>
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
      router: this.$root.$data.router,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
  },
  mounted(){
    this.api.contact = this.contact
  },
  methods: {
    contact(){
      this.showQuestion = true
    }
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
