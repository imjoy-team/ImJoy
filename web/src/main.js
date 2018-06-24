// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css' // This line here
import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import vueSlider from 'vue-slider-component'

import Navbar from '@/components/Navbar'
import Viewer from '@/components/Viewer'
import Footer from '@/components/Footer'
import About from '@/components/About'
import Whiteboard from '@/components/Whiteboard'
import Joy from '@/components/Joy'
import FAQ from '@/components/FAQ'
import PluginList from '@/components/PluginList'
import store from './store.js'
import App from './App'
import VueGridLayout from 'vue-grid-layout'


Vue.config.productionTip = false

Vue.use(VueMaterial)
Vue.use(VueCodemirror)

// register
Vue.component('vue-slider', vueSlider)
Vue.component('navbar', Navbar)
Vue.component('faq', FAQ)
Vue.component('viewer', Viewer)
Vue.component('main-footer', Footer)
Vue.component('about', About)
Vue.component('whiteboard', Whiteboard)
Vue.component('joy', Joy)
Vue.component('plugin-list', PluginList)
Vue.component('grid-layout', VueGridLayout.GridLayout)
Vue.component('grid-item', VueGridLayout.GridItem)

const truncate = function(text, length, clamp) {
  clamp = clamp || '...';
  const node = document.createElement('div');
  node.innerHTML = text;
  const content = node.textContent;
  return content.length > length ? content.slice(0, length) + clamp : content;
};

Vue.filter('truncate', truncate);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  data: {
    store: store,
    router: router
  },
  template: '<App/>',
  components: {
    App
  }
})
