import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { router_config } from '../src/router'
import Imjoy from '@/components/Imjoy.vue'
import _ from 'lodash'
import {
  // NATIVE_PYTHON_PLUGIN_TEMPLATE,
  WEB_WORKER_PLUGIN_TEMPLATE,
  WEB_PYTHON_PLUGIN_TEMPLATE,
  WINDOW_PLUGIN_TEMPLATE
} from '../src/api.js'

const TEST_WEB_WORKER_PLUGIN_TEMPLATE= `
<docs>
[TODO: write documentation for this plugin.]
</docs>

<config lang="json">
{
  "name": "Test Web Worker Plugin",
  "type": "web-worker",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "api_version": "0.1.2",
  "url": "",
  "description": "[TODO: describe this plugin with one sentense.]",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "env": "",
  "requirements": [],
  "dependencies": []
}
</config>

<script lang="javascript">
class ImJoyPlugin {
  async setup() {
  }

  async run() {
    console.log('running in the plugin.')
  }

  async test_register() {
    await api.register({
         "name": "LUT",
         "ui": [{
            "apply LUT": {
                id: 'lut',
                type: 'choose',
                options: ['hot', 'rainbow'],
                placeholder: 'hot'
              }
          }],
          "run": this.run,
          "update": this.run
    })
    return true
  }

  async test_unregister() {
    await api.unregister('LUT')
    return true
  }

  async test_createWindow() {
    await api.createWindow({
      name: 'new image',
      type: 'imjoy/image',
      data: {src: 'https://imjoy.io/static/img/loader.gif'}
    })
    return true
  }

}

api.export(new ImJoyPlugin())
</script>
`

const TEST_WINDOW_PLUGIN_TEMPLATE= `
<docs lang="markdown">
[TODO: write documentation for this plugin.]
</docs>

<config lang="json">
{
  "name": "Test Window Plugin",
  "type": "window",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "api_version": "0.1.2",
  "description": "[TODO: describe this plugin with one sentense.]",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "env": "",
  "requirements": [],
  "dependencies": [],
  "defaults": {"w": 7, "h": 7}
}
</config>

<script lang="javascript">
class ImJoyPlugin {
  async setup() {

  }

  async run(my) {
    console.log('running in the window plugin ')
    return my
  }

  async multi2(arg) {
    return arg*2
  }
}

api.export(new ImJoyPlugin())
</script>

<window lang="html">
  <div>
    <p>
    Hello World
    </p>
  </div>
</window>

<style lang="css">

</style>
`

describe('ImJoy.vue', async () => {
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  const router = new VueRouter(router_config)
  const wrapper = shallowMount(Imjoy, {
    localVue,
    router,
    propsData: {}
  })
  const vm = wrapper.vm //vm of ImJoy
  const wm = vm.wm //window_manager
  const pm = vm.pm //plugin_manager

  before(function(done) {
    this.timeout(10000)
    vm.event_bus.$on('imjoy_ready', ()=>{
      expect(vm.plugin_loaded).to.be.true
      done()
    })
  })

  it('should include "Image Processing with Joy!"', async () => {
    expect(wrapper.text()).to.include('Python Plugin Engine')
  })

  it('should show add plugin dialog', async () => {
    // wrapper.find({ ref: 'add_plugin_button' }).trigger('click')
    vm.showPluginManagement()
    await vm.$nextTick()
    expect(vm.showAddPluginDialog).to.be.true
  })

  it('should create a new plugin', async () => {
    const old_len = wm.windows.length
    const code = _.clone(WEB_WORKER_PLUGIN_TEMPLATE)
    vm.newPlugin(code)
    expect(wm.windows).to.have.lengthOf(old_len+1)
  })

  it('should save a new plugin', async () => {
    const code = _.clone(WEB_WORKER_PLUGIN_TEMPLATE)
    const pconfig = await pm.savePlugin({code: code, tag: null, origin: '__test__'})
    expect(pconfig.installed).to.be.true
    expect(pconfig.name).to.equal('Untitled Plugin')
  })

  it('should load the new web-worker plugin', async () => {
    const code = _.clone(WEB_WORKER_PLUGIN_TEMPLATE)
    const plugin = await pm.reloadPlugin({_id: 'new plugin', tag: null, name:'new plugin', code: code})
    expect(plugin.name).to.equal('Untitled Plugin')
    expect(plugin.type).to.equal('web-worker')
    expect(typeof plugin.api.run).to.equal('function')
    await plugin.api.run({})
  }).timeout(10000)

  it('should load the new window plugin', async () => {
    const code = _.clone(WINDOW_PLUGIN_TEMPLATE)
    const plugin = await pm.reloadPlugin({_id: 'new plugin', tag: null, name:'new plugin', code: code})
    expect(plugin.name).to.equal('Untitled Plugin')
    expect(plugin.type).to.equal('window')
    expect(typeof plugin.api.run).to.equal('function')
    await plugin.api.run({})
  }).timeout(10000)

  // it('should load the new native-python plugin', async () => {
  //   const code = _.clone(NATIVE_PYTHON_PLUGIN_TEMPLATE)
  //   const plugin = await vm.pm.reloadPlugin({_id: 'new plugin', tag: null, name:'new plugin', code: code})
  //   expect(plugin.name).to.equal('Untitled Plugin')
  //   expect(plugin.type).to.equal('native-python')
  //   expect(typeof plugin.api.run).to.equal('function')
  //   plugin.api.run({})
  // }).timeout(10000)

  it('should load the new web-python plugin', async () => {
    const code = _.clone(WEB_PYTHON_PLUGIN_TEMPLATE)
    const plugin = await pm.reloadPlugin({_id: 'new plugin', tag: null, name:'new plugin', code: code})
    expect(plugin.name).to.equal('Untitled Plugin')
    expect(plugin.type).to.equal('web-python')
    expect(typeof plugin.api.run).to.equal('function')
    await plugin.api.run({})
  }).timeout(10000)


  describe('Test ImJoy API', async () => {
    let plugin1
    let plugin2
    before(function(done){
      this.timeout(10000)
      pm.reloadPlugin({_id: 'new plugin1', tag: null, name:'new plugin1', code: _.clone(TEST_WEB_WORKER_PLUGIN_TEMPLATE)}).then((p1)=>{
        plugin1 = p1
        expect(plugin1.name).to.equal('Test Web Worker Plugin')
        expect(plugin1.type).to.equal('web-worker')
        expect(typeof plugin1.api.run).to.equal('function')

        pm.reloadPlugin({_id: 'new plugin2', tag: null, name:'new plugin2', code: _.clone(TEST_WINDOW_PLUGIN_TEMPLATE)}).then((p2)=>{
          plugin2 = p2
          expect(plugin2.name).to.equal('Test Window Plugin')
          expect(plugin2.type).to.equal('window')
          expect(typeof plugin2.api.run).to.equal('function')

          pm.createWindow(null, {name: 'new window', type: 'Test Window Plugin'}).then((wplugin)=>{
            expect(typeof wplugin.multi2).to.equal('function')
            done()
          })

        })
      })
    })

    it('should register and unregister', async () => {
      expect(Object.keys(plugin1.ops).length).to.equal(1)
      expect(await plugin1.api.test_register()).to.be.true
      expect(Object.keys(plugin1.ops).length).to.equal(2)
      expect(await plugin1.api.test_unregister()).to.be.true
      expect(Object.keys(plugin1.ops).length).to.equal(1)
    })

    it('should create window', async () => {
      const count = wm.windows.length
      expect(await plugin1.api.test_createWindow()).to.be.true
      expect(wm.windows.length).to.equal(count+1)
      expect(wm.windows[wm.windows.length-1].name).to.equal('new image')
      wm.closeWindow(wm.windows[wm.windows.length-1])
      expect(wm.windows.length).to.equal(count)
    })

  })

})
