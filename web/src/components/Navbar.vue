<template>
  <div class="md-toolbar-row">
      <div class="md-toolbar-row" flex>
          <md-button to="/">
            <div class="site-title">ImJoy.io<span class="superscript">alpha</span></div>
          </md-button>

          <span v-show="$route.path!='/'" class="md-layout-item md-medium-hide subheader-title">Image processing with joy.</span>

          <div class="md-toolbar-section-end">
            <md-menu md-size="medium" v-if="screenWidth<600">
              <md-button class="md-primary md-icon-button" md-menu-trigger>
                <md-icon>menu</md-icon>
              </md-button>
              <md-menu-content>
                <md-menu-item class="md-primary md-button menu-button" v-show="$route.path != '/'" to="/">Home</md-menu-item>
                <md-menu-item class="md-primary md-button menu-button" v-show="$route.path != '/viewer' && $route.path != '/view'" to="/viewer">Viewer</md-menu-item>
                <md-menu-item class="md-primary md-button menu-button" v-show="$route.path != '/about'" to="/about">About</md-menu-item>
              </md-menu-content>
             </md-menu>

            <md-button v-show="$route.path != '/'" class="md-accent" v-if="screenWidth>=600" to="/">
              <md-icon>home</md-icon> Home
              <md-tooltip>Home Page</md-tooltip>
            </md-button>
            &nbsp;
            <md-button v-show="$route.path != '/viewer' && $route.path != '/view'" class="md-accent" v-if="screenWidth>=600" to="/viewer">
              <md-icon>pageview</md-icon> Viewer
              <md-tooltip>SMLM data viewer</md-tooltip>
            </md-button>
            &nbsp;
            <md-button v-show="$route.path != '/about'" class="md-accent" v-if="screenWidth>=600" to="/about">
              <md-icon>info</md-icon> About
              <md-tooltip>About ImJoy.io</md-tooltip>
            </md-button>
          </div>

      </div>
      <md-snackbar :md-position="'center'" class="md-accent" :md-active.sync="showSnackbar" :md-duration="snackbar_duration">
       <span>{{snackbar_info}}</span>
       <md-button class="md-accent" @click="showSnackbar=false">close</md-button>
      </md-snackbar>

  </div>
</template>

<script>
export default {
  name: 'navbar',
  data () {
    return {
      snackbar_info: "",
      snackbar_duration: 1000,
      showSnackbar: false,
      screenWidth: window.innerWidth,
      router: this.$root.$data.router,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
  },
  mounted(){
    this.store.api.show = this.show
    // this.api.connect(["anonymous"]).then((session, connection)=>{
    //   session.subscribe('org.imod.public.message', this.api.handle_notification).then(()=>{
    //     console.log('subscribed to org.imod.public.message')
    //   })
    // });
    this.screenWidth = window.innerWidth
    const updateSize = (e)=>{
      this.screenWidth = e.width
    }
    this.store.event_bus.$on('resize',updateSize)
  },
  methods: {
    show(info, duration) {
        this.snackbar_info = info
        this.snackbar_duration = duration || 3000
        this.showSnackbar = true
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.superscript {
  font-size: 16px;
  text-transform: none;
  vertical-align: super;
  color: #ff5253;
}
.subheader-title {
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
}
.menu-button {
  text-align: left;
}

.site-title {
  font-size: 30px;
  font-weight: 300;
}

@media screen and (max-width: 600px) {
  .site-title {
    font-size: 25px;
    font-weight: 250;
  }
}
@media screen and (max-width: 400px) {
  .site-title {
    font-size: 20px;
    font-weight: 220;
  }
}
</style>
