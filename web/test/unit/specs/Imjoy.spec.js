import Vue from 'vue'
import Imjoy from '@/components/Imjoy'

describe('Imjoy.vue', () => {
  it('set and load config', async () => {
    const Constructor = Vue.extend(Imjoy)
    const vm = new Constructor().$mount()
    const fakePlugin = {
      config: {
        name: 'fakePluginName'
      }
    }
    vm.plugins = {'fakeId': fakePlugin}
    await vm.setPluginConfig('testConfig', 234, {id: 'fakeId'})
    expect(await vm.getPluginConfig('testConfig', {id: 'fakeId'}))
      .to.equal('234')
    // expect(vm.$el.querySelector('.imjoy .md-app').textContent)
    //   .to.equal('Welcome to Your Vue.js App')
  })
})
