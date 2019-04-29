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
      show_navbar: true
    }
  },
  mounted(){
    if(window.location.href.indexOf('navbar=0')>=0){
      this.show_navbar = false
    }

    this.$nextTick(()=>{
      const updateSize = ()=>{
        this.$root.$data.store.event_bus.$emit('resize', {height:window.innerHeight, width:window.innerWidth})
      }
      updateSize()
      // window.addEventListener('resize', updateSize);
      document.addEventListener("orientationchange", window.onresize = updateSize)

      // hide animation
      const element = document.getElementById('welcome-page')
      if(element) element.parentNode.removeChild(element);

      const element2 = document.getElementById('loading-imjoy-section')
      if(element2) element2.parentNode.removeChild(element2);


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
    overflow-y: hidden;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    -webkit-transform: translate3d(0,0,0);
    /* Disables pull-to-refresh but allows overscroll glow effects. */
    overscroll-behavior-y: contain;
    overscroll-behavior-x: none;
}

.h1, h1 {
  font-size: 1.3rem!important;
}

.h2, h2 {
   font-size: 1.0rem!important;
}

.h3, h3 {
   font-size: 0.8rem!important;
}

.h4, h4 {
   font-size: 0.75rem!important;
}

.h5, h5 {
   font-size: 0.7rem!important;
}


ul {
    list-style: circle outside!important;
    margin-left: 30px!important;
}

.md-app {
  height:100%;
  margin: 0px;
}

.md-content {
  padding: 0px;
}

@media screen and (max-width: 800px) {
  .md-content {
    padding: 4px;
  }
}

.md-app-content{
  padding: 0px;
}

.md-list-item-content{
  justify-content: flex-start !important;
}

.joy-run-button .md-ripple{
  justify-content: flex-start !important;
}

.md-menu-content{
  z-index: 9998;
}

.md-tooltip{
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
  overflow: auto;
  -webkit-transform: translateZ(0);
}

</style>
