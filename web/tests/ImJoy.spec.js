import { expect } from "chai";
import { shallowMount, createLocalVue } from "@vue/test-utils";
import VueRouter from "vue-router";
import VueMaterial from "vue-material";
import { router_config } from "../src/router";
import { version } from "imjoy-core";
import Imjoy from "@/components/Imjoy.vue";
import _ from "lodash";

import WEB_WORKER_PLUGIN_TEMPLATE from "../src/plugins/webWorkerTemplate.imjoy.html";
import WINDOW_PLUGIN_TEMPLATE from "../src/plugins/windowTemplate.imjoy.html";
// import NATIVE_PYTHON_PLUGIN_TEMPLATE from '../src/plugins/nativePythonTemplate.imjoy.html';
import WEB_PYTHON_PLUGIN_TEMPLATE from "../src/plugins/webPythonTemplate.imjoy.html";

const localVue = createLocalVue();

console.log("ImJoy Core version: " + version);

describe("ImJoy.vue", async () => {
  localVue.use(VueMaterial);
  localVue.use(VueRouter);
  const router = new VueRouter(router_config);
  const wrapper = shallowMount(Imjoy, {
    localVue,
    router,
    propsData: { exposeAPI: false },
  });
  const vm = wrapper.vm; //vm of ImJoy
  const wm = vm.wm; //window_manager
  const pm = vm.pm; //plugin_manager

  before(function(done) {
    this.timeout(30000);
    vm.event_bus.on("imjoy_ready", () => {
      expect(vm.plugin_loaded).to.be.true;
      done();
    });
    // We need this because the vue components are not properly setup in the tests.
    // TODO: remove this when we import all the global components
    vm.event_bus.on("add_window", w => {
      const elem = document.createElement("DIV");
      elem.id = w.window_id;
      document.body.appendChild(elem);
    });
  });

  it("should load default repositories", async () => {
    await pm.loadRepositoryList();
    expect(pm.repository_names).to.include("ImJoy Repository");
    expect(pm.repository_names).to.include("ImJoy Demos");
  });

  // it("should add and remove repositories", async () => {
  //   await pm.addRepository({
  //     name: "test",
  //     url: "imjoy-team/imjoy-project-template",
  //   });
  //   expect(pm.repository_names).to.include("Project Template");
  //   await pm.removeRepository({
  //     name: "Project Template",
  //     url: "imjoy-team/imjoy-project-template",
  //   });
  //   expect(pm.repository_names).to.not.include("Project Template");
  // });

  // it("should load a repository and install plugin from it", async () => {
  //   await pm.reloadRepository({ url: "imjoy-team/imjoy-project-template" });
  //   await pm.installPlugin(
  //     { uri: "imjoy-team/imjoy-project-template:Template plugin" },
  //     null,
  //     true
  //   );
  //   const ps = pm.installed_plugins.filter(p => {
  //     return p.name === "Template plugin";
  //   });
  //   expect(ps.length).to.equal(1);
  // });

  it("should show add plugin dialog", async () => {
    // wrapper.find({ ref: 'add_plugin_button' }).trigger('click')
    vm.showPluginManagement();
    await vm.$nextTick();
    expect(vm.showAddPluginDialog).to.be.true;
  });

  it("should create a new plugin", async () => {
    const old_len = wm.windows.length;
    const code = _.clone(WEB_WORKER_PLUGIN_TEMPLATE);
    vm.newPlugin(code);
    expect(wm.windows).to.have.lengthOf(old_len + 1);
  });

  it("should save a new plugin", async () => {
    const code = _.clone(WEB_WORKER_PLUGIN_TEMPLATE);
    const pconfig = await pm.savePlugin({
      code: code,
      tag: null,
      origin: "__test__",
    });
    expect(pconfig.installed).to.be.true;
    expect(pconfig.name).to.equal("Untitled Plugin");
  });

  it("should load the new web-worker plugin", async () => {
    const code = _.clone(WEB_WORKER_PLUGIN_TEMPLATE);
    const plugin = await pm.reloadPlugin({ code: code });
    expect(plugin.name).to.equal("Untitled Plugin");
    expect(plugin.type).to.equal("web-worker");
    expect(typeof plugin.api.run).to.equal("function");
    await plugin.api.run({});
    plugin.terminate();
  }).timeout(20000);

  it("should load the new window plugin", async () => {
    const code = _.clone(WINDOW_PLUGIN_TEMPLATE);
    const plugin = await pm.reloadPlugin({ code: code });
    expect(plugin.name).to.equal("Untitled Plugin");
    expect(plugin.type).to.equal("window");
    expect(typeof plugin.api.run).to.equal("function");
    await plugin.api.run({});
    plugin.terminate();
  }).timeout(20000);

  // it('should load the new native-python plugin', async () => {
  //   const code = _.clone(NATIVE_PYTHON_PLUGIN_TEMPLATE)
  //   const plugin = await vm.pm.reloadPlugin({code: code})
  //   expect(plugin.name).to.equal('Untitled Plugin')
  //   expect(plugin.type).to.equal('native-python')
  //   expect(typeof plugin.api.run).to.equal('function')
  //   plugin.api.run({})
  // }).timeout(10000)

  it("should load the new web-python plugin", async () => {
    const code = _.clone(WEB_PYTHON_PLUGIN_TEMPLATE);
    const plugin = await pm.reloadPlugin({ code: code });
    expect(plugin.name).to.equal("Untitled Plugin");
    expect(plugin.type).to.equal("web-python");
    expect(typeof plugin.api.run).to.equal("function");
    await plugin.api.run({});
    plugin.terminate();
  }).timeout(100000);
});
