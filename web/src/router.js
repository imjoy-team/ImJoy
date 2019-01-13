import Vue from 'vue'
import Router from 'vue-router'
import Imjoy from '@/components/Imjoy'
import About from '@/components/About'

Vue.use(Router)

export const router_config = {
  // mode: 'history',
  base: window.location.pathName,
  routes: [
    {
      path: '/',
      name: 'App',
      component: Imjoy
    },
    {
      path: '/app',
      redirect: '/'
    },
    {
      path: '/:)',
      redirect: { name: 'joy' }
    },
    {
      path: '/%F0%9F%98%82',
      name: 'joy',
      component: Imjoy
    },
    {
      path: '/imjoy',
      name: 'Imjoy',
      component: Imjoy
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
}

export default new Router(router_config)
