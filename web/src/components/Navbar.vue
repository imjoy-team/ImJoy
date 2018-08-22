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
                <md-menu-item class="md-primary md-button menu-button" v-show="$route.path != '/app'" to="/app">Start ImJoy</md-menu-item>
                <md-menu-item class="md-primary md-button menu-button" href="https://github.com/oeway/ImJoy">Source</md-menu-item>
                <md-menu-item class="md-primary md-button menu-button" href="https://github.com/oeway/ImJoy/blob/master/README.md">Docs</md-menu-item>
                <!-- <md-menu-item class="md-primary md-button menu-button" href="/static/docs/">Docs</md-menu-item> -->
                <!-- <md-menu-item class="md-primary md-button menu-button" @click="shareOnTwitter">Share</md-menu-item> -->
                <md-menu-item class="md-primary md-button menu-button" v-show="$route.path != '/about'" to="/about">About</md-menu-item>
              </md-menu-content>
             </md-menu>

            <md-button v-show="$route.path != '/'" class="md-accent" v-if="screenWidth>=600" to="/">
              <md-icon>home</md-icon> Home
              <md-tooltip>Home Page</md-tooltip>
            </md-button>
            &nbsp;
            <md-button v-show="$route.path != '/app'" class="md-accent" v-if="screenWidth>=600" to="/app">
              <md-icon>mood</md-icon> ImJoy
              <md-tooltip>Start ImJoy App</md-tooltip>
            </md-button>
            &nbsp;
            <md-button href="https://github.com/oeway/ImJoy" class="md-accent" v-if="screenWidth>=600" target="_blank">
              <md-icon md-src="static/img/github.svg" class="md-size-1x svg-icon"></md-icon>source
              <md-tooltip>Source code on Github</md-tooltip>
            </md-button>
            &nbsp;
            <md-button href="https://github.com/oeway/ImJoy/blob/master/README.md" class="md-accent" v-if="screenWidth>=600">
              <md-icon>library_books</md-icon>docs
              <md-tooltip>Documentation</md-tooltip>
            </md-button>
            <!-- &nbsp; -->
            <!-- <md-button href="/static/docs/" class="md-accent" v-if="screenWidth>=600">
              <md-icon>library_books</md-icon>docs
              <md-tooltip>Documentation</md-tooltip>
            </md-button> -->
            <!-- &nbsp;
            <md-button @click="shareOnTwitter" class="md-accent" v-if="screenWidth>=600">
              <md-icon md-src="static/img/twitter.svg" class="md-size-1x svg-icon"></md-icon>share
              <md-tooltip>Share ImJoy on Twitter</md-tooltip>
            </md-button> -->
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
    }
  },
  created(){
    this.router = this.$root.$data.router
    this.store = this.$root.$data.store
    this.api = this.$root.$data.store.api
  },
  mounted(){
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
    shareOnTwitter() {
      const url = "https://imjoy.io";
      const text = " #ImJoy ";
      window.open('http://twitter.com/share?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text), '', 'left=0,top=0,width=550,height=450,personalbar=0,toolbar=0,scrollbars=0,resizable=0');
    }
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

.svg-icon {
  display: inline-block;
}
</style>
