<template>
    <md-app id="app"  md-waterfall md-mode="fixed">
      <md-app-toolbar class="md-primary">
        <navbar/>
      </md-app-toolbar>
      <md-app-content>
        <router-view/>
      </md-app-content>
   </md-app>
</template>
<script>
export default {
  name: 'app',
  data () {
    return {
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
  },
  mounted(){
    this.$nextTick(()=>{
      const updateSize = (e)=>{
        this.store.windowHeight = window.innerHeight
        this.store.windowWidth = window.innerWidth
        this.store.event_bus.$emit('resize', {height:this.store.windowHeight, width:this.store.windowWidth})
      }
      updateSize()
      //window.addEventListener('resize', updateSize);
      document.addEventListener("orientationchange", window.onresize = updateSize);

      this.store.event_bus.$on('connected', (authid)=>{
        try {
          ga('set', 'userId', authid);
        } catch (e) {
          console.error('google analytics error:', e)
        }
      })
    })
  },
  methods: {
  },
  watch: {
  	'$route': (value) => {
      // this.store.event_bus.$emit('route_changed', value)
      try {
        ga('send', 'pageview', value.path);
        console.log('pageview:', value.path)
      } catch (e) {
        console.error('google analytics error:', e)
      }
    }
  }
}
</script>

<style>
/* #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
} */
html, body
{
    height: 100%;
    overflow-y: auto; /* has to be scroll, not auto */
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    -webkit-transform: translate3d(0,0,0);
}

@media screen and (max-width: 800px) {
  .md-content {
    overflow-y: auto;
    overflow-x: hidden;
    padding: 4px;
  }
}
.md-app {
  max-height: 100vh;
  border: 1px solid rgba(#000, .12);
}

.md-menu-content{
  z-index: 9999;
}

.table-head-checkbox{
  margin-top: 5px;
  width: 50px;
}

.md-subheader {
  font-size: 22px;
  font-weight: 300;
}

.md-input {
  font-size: 16px !important;
}

.md-dialog{
  overflow-y: auto !important;
}

</style>
