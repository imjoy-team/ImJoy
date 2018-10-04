<template>
    <md-app id="app"  md-waterfall md-mode="fixed">
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
      show_navbar: true,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
  },
  mounted(){
    if(window.location.href.indexOf('navbar=0')>=0){
      this.show_navbar = false
    }

    this.$nextTick(()=>{
      this.store.api.show = this.show
      const updateSize = (e)=>{
        this.store.windowHeight = window.innerHeight
        this.store.windowWidth = window.innerWidth
        this.store.event_bus.$emit('resize', {height:this.store.windowHeight, width:this.store.windowWidth})
      }
      updateSize()
      //window.addEventListener('resize', updateSize);
      document.addEventListener("orientationchange", window.onresize = updateSize);

      // window.addEventListener("message", receiveMessage, false);
      // function receiveMessage(event)
      // {
      //   console.log('message reveived: ', event)
      //   if (event.origin !== "http://127.0.0.1:8000" || event.origin !== "https://imjoy.io")
      //     return;
      //   this.store.event_bus.$emit('message', event)
      // }
    })
  },
  methods: {
    show(info, duration) {
        this.snackbar_info = info
        this.snackbar_duration = duration || 3000
        this.showSnackbar = true
    },
  },
  watch: {
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
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    -webkit-transform: translate3d(0,0,0);
    /* Disables pull-to-refresh but allows overscroll glow effects. */
    overscroll-behavior-y: contain;
    overscroll-behavior-x: none;
}

.md-app {
  height:100%;
}

.md-content {
  padding: 0px;
}

@media screen and (max-width: 800px) {
  .md-content {
    padding: 4px;
  }
}

.md-menu-content{
  z-index: 9999;
}
.md-subheader {
  font-size: 22px;
  font-weight: 300;
}

.md-input {
  font-size: 16px !important;
}

.table-head-checkbox{
  margin-top: 5px;
  width: 50px;
}

.CodeMirror{
  /* height: 500px!important; */
  height: calc(100%)!important;
  width: calc(100%)!important;
  max-width: 1000px;
}

.vue-resizable-handle{
  z-index: 9999 !important;
}
/*
.md-dialog{
  overflow-y: auto !important;
} */

.noselect {
  -webkit-touch-callout: none;
  /* iOS Safari */
  -webkit-user-select: none;
  /* Safari */
  -khtml-user-select: none;
  /* Konqueror HTML */
  -moz-user-select: none;
  /* Firefox */
  -ms-user-select: none;
  /* Internet Explorer/Edge */
  user-select: none;
  /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}

.md-dialog-container{
  max-width: 100% !important;
}
</style>
