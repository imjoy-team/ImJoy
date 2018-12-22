static/static/<template>
  <div class="about">
    <md-app-toolbar class="md-primary">
      <div class="md-toolbar-row" flex>
        <navbar/>
      </div>
    </md-app-toolbar>
    <!-- <md-subheader>Options</md-subheader> -->
    <md-subheader>About ImJoy.io</md-subheader>
    <md-card>
      <md-card-header>
       </md-card-header>
      <md-card-content class="centered-fixed">
        <md-icon class="md-size-5x md-small-hide" md-src="static/img/imjoy-icon.svg" />
        <!-- <h2>Cite ImJoy.io</h2>
        <p> </p> -->
        <md-button class="normal-text" href="https://github.com/oeway" target="_blank">Made by Wei OUYANG with <span class="red">❤</span></md-button>

        <h2>Acknowledgements</h2>
        <p>The ImJoy project is carried out in <a href="https://research.pasteur.fr/en/team/imaging-and-modeling/" target="_blank">Imaging and Modeling Unit</a> at Institut Pasteur.</p>
        <p>We thank <a href="https://sites.google.com/site/imagingandmodeling/people" target="_blank">all the team members</a> from the Imaging and Modeling Unit and people who have been using, testing, contributing valuable feedbacks and suggestions for improving ImJoy.</p>
        <p>This project is mainly funded by
        </p>
        <p><a href="https://www.pasteur.fr" target="_blank">
       <img id="ip-img" src="static/img/Institut_Pasteur_logo.svg" alt="Institut Pasteur">
       </a></p>
        <br>
      </md-card-content>
    </md-card>
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
.about{
  overflow-y: auto !important;
}
.centered-fixed{
  max-width: 800px;
  margin: 0 auto;
  text-align:center;
}
.normal-text{
  text-transform: none;
}
.red{
  display: inline-block;
  color: #f44336;
  transition: .3s;
}
</style>
