import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { router_config } from '../../src/router'
const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter(router_config)

import Imjoy from '@/components/Imjoy.vue'
describe('ImJoy.vue', () => {
  it('include ImJoy.io', () => {
    const wrapper = shallowMount(Imjoy, {
      localVue,
      router,
      propsData: {}
    })
    expect(wrapper.text()).to.include('Image Processing with Joy!')
  })
})
