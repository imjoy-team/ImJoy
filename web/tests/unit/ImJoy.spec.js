import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { router_config } from '../../src/router'
import Imjoy from '@/components/Imjoy.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter(router_config)

describe('ImJoy.vue', () => {
  it('should include "Image Processing with Joy!"', () => {
    const wrapper = shallowMount(Imjoy, {
      localVue,
      router,
      propsData: {}
    })
    expect(wrapper.text()).to.include('Image Processing with Joy!')
  })
})
