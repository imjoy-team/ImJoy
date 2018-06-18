<template>
  <div class="about">
    <!-- <md-subheader>Options</md-subheader> -->
    <md-subheader>About ImJoy.io</md-subheader>
    <md-card>
      <md-card-header>
       </md-card-header>
      <md-card-content class="centered-fixed">
        <md-icon class="md-size-5x md-small-hide" md-src="static/img/anna-palm-icon-circle.svg" />
        <!-- <h2>Cite ImJoy.io</h2>
        <p> </p> -->
        <h2>Acknowledgements</h2>
        <p>ImJoy.io project is mainly supported by
        </p>
        <p><a href="https://www.pasteur.fr" target="_blank">
       <img id="ip-img" src="static/img/Institut_Pasteur_logo.svg" alt="Institut Pasteur">
       </a></p>
        <br>
      <md-button @click="api.contact" class="md-raised">Contact us</md-button>
      </md-card-content>
    </md-card>

    <faq v-if="faq">
    </faq>
    <br>
    <br>
    <md-divider v-if="footer"></md-divider>
    <main-footer v-if="footer"/>
  </div>
</template>

<script>
export default {
  name: 'about',
  props: {faq:{
    type: Boolean,
    default: true
  }, footer:{
    type: Boolean,
    default: true
  }},
  data () {
    return {
      router: this.$root.$data.router,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
  },
  mounted(){

  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.about{
  overflow-y: auto !important;
}
.centered-fixed{
  max-width: 800px;
  margin: 0 auto;
  text-align:center;
}
</style>
