import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Viewer from '@/components/Viewer'
import About from '@/components/About'
import FAQ from '@/components/FAQ'

Vue.use(Router)

export default new Router({
  base: window.location.pathName,
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/viewer',
      name: 'Viewer',
      component: Viewer
    },
    {
      path: '/view',
      name: 'Viewe',
      component: Viewer
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/faq',
      name: 'FAQ',
      component: FAQ
    }
  ]
})
