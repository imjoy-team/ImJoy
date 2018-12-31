import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
// import { PouchDB } from '../../public/static/js/pouchdb-7.0.0.min.js'
// import store from '../../src/store.js'
import { router_config } from '../../src/router'
const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter(router_config)

import Imjoy from '@/components/Imjoy.vue'
describe('ImJoy.vue', () => {
  it('include ImJoy.io', () => {
    const wrapper = shallowMount(Imjoy, {
      localVue,
      router
      // propsData: {default_store: store},
      // mocks: {
      //  $route: router_config
      // }
    })
    expect(wrapper.text()).to.include('ImJoy.io')
  })
})
