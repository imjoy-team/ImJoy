<template>
<div class="viewer">
  <div class="md-title">{{title}}</div>
  <!-- <md-card >
        <md-card-content > -->
  <md-app>
    <md-app-toolbar class="md-transparent md-dense" md-elevation="0" v-if="!menuVisible">
      <div class="md-toolbar-row" flex>
        <md-button class="md-fab md-primary" @click="menuVisible=true" v-if="!menuVisible">
          <md-icon>menu</md-icon>
        </md-button>
      </div>

    </md-app-toolbar>
    <md-app-drawer :md-active.sync="menuVisible" md-persistent="full">
      <div class="md-toolbar-row">
        <div class="md-toolbar-section-start">
          <md-button class="md-fab md-primary" @click="showImportDialog=true">
            <md-icon>add</md-icon>
          </md-button>
          <md-button class="md-icon-button md-primary" @click="showSettingsDialog=true">
            <md-icon>settings</md-icon>
          </md-button>
          <md-progress-spinner :md-diameter="30" :md-stroke="3" md-mode="indeterminate" v-if="loading"></md-progress-spinner>
        </div>
        <div class="md-toolbar-section-end">
          <md-button class="md-icon-button md-dense md-raised" @click="menuVisible = !menuVisible">
            <md-icon>keyboard_arrow_left</md-icon>
          </md-button>
        </div>
      </div>
      <md-card>
        <md-card-header>
            <div class="md-toolbar-row panel-header">
              <div class="md-toolbar-section-start">
                <span class="panel-title ">Workflow</span>
              </div>
            </div>
        </md-card-header>
        <md-card-content>
          <joy :config="workflow_joy_config" ref="workflow" @run="runWorkflow" v-if="plugin_loaded"></joy>
        </md-card-content>
        <md-card-actions>
        </md-card-actions>
      </md-card>

      <div class="md-layout">
        <md-card v-for="panel in panels" class="md-layout-item md-size-90" :key="panel.id">
          <md-card-expand>
            <md-card-actions md-alignment="space-between">
              <md-card-expand-trigger>
                <md-button class="md-icon-button">
                  <md-icon>keyboard_arrow_down</md-icon>
                </md-button>
              </md-card-expand-trigger>
              <div>  <span class="panel-title">{{panel.name}}</span></div>
              <div>

                <!-- <md-button>Action</md-button>
                <md-button>Action</md-button> -->
                <md-menu md-size="big" md-direction="bottom-end">
                  <md-button class="md-icon-button" md-menu-trigger>
                    <md-icon>more_vert</md-icon>
                  </md-button>
                  <md-menu-content>
                    <md-menu-item @click="closePanel(panel)">
                      <span>Close</span>
                      <md-icon>close</md-icon>
                    </md-menu-item>
                    <!-- <md-menu-item @click="fullScreenPanel(panel)">
                      <span>Fullscreen</span>
                      <md-icon>fullscreen</md-icon>
                    </md-menu-item> -->
                  </md-menu-content>
                </md-menu>
              </div>
            </md-card-actions>
            <md-card-expand-content>
              <md-card-content>
                <joy :config="panel" @run="runPanel($event, panel)" v-if="plugin_loaded"></joy>
              </md-card-content>
            </md-card-expand-content>
          </md-card-expand>

        </md-card>

      </div>


    </md-app-drawer>

    <md-app-content class="whiteboard-content">
      <whiteboard :windows="windows" @select="windowSelected"></whiteboard>
    </md-app-content>
  </md-app>
  <!-- </md-card-content> -->
  <md-dialog :md-active.sync="showLoadingDialog">
    <md-dialog-content>
      <md-progress-spinner :md-diameter="30" :md-stroke="3" md-mode="indeterminate"></md-progress-spinner>
    </md-dialog-content>
    <md-dialog-actions>

    </md-dialog-actions>
  </md-dialog>

  <md-dialog :md-active.sync="showPluginDialog" :md-click-outside-to-close="false">
    <md-dialog-content>
      <div v-if="plugin_dialog_config">
        <joy :config="plugin_dialog_config" :controlButtons="false" ref="plugin_dialog_joy"></joy>
      </div>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="closePluginDialog(true)">OK</md-button>
      <md-button class="md-primary" @click="closePluginDialog(false)">Cancel</md-button>
    </md-dialog-actions>
  </md-dialog>

  <md-dialog :md-active.sync="showSettingsDialog">
    <md-dialog-content>
        <plugin-list :plugins="installed_plugins" title="Installed Plugins"></plugin-list>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showSettingsDialog=false">OK</md-button>
    </md-dialog-actions>
  </md-dialog>

  <md-dialog :md-active.sync="showImportDialog">
    <md-dialog-content>
      <div class="md-layout-row md-gutter">
        <div class="md-flex">
          <md-switch v-model="folder_mode">{{folder_mode?"Load data from a folder":"Load data from a file"}}</md-switch>
          <md-field v-if="!folder_mode">
            <label>load a file</label>
            <md-file v-model="file_model" @md-change="selectFileChanged" />
          </md-field>
          <md-field v-if="folder_mode">
            <label>load a folder</label>
            <md-file v-model="file_model" @md-change="selectFileChanged" webkitdirectory mozdirectory msdirectory odirectory directory multiple/>
          </md-field>
        </div>
        <joy init="{id:'file_load_workflow', type:'ops'}" v-if="plugin_loaded"></joy>
      </div>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="loadData(); showImportDialog=false">OK</md-button>
      <md-button class="md-primary" @click="showImportDialog=false">Cancel</md-button>
    </md-dialog-actions>
  </md-dialog>
</div>
</template>

<script>
import {
  WINDOW_TEMPLATE,
  PANEL_TEMPLATE,
  OP_TEMPLATE,
  IO_TEMPLATE
} from '../api.js'

import { randId } from '../utils.js'
import { parseComponent } from '../pluginParser.js'

export default {
  name: 'viewer',
  props: ['title'],
  data() {
    return {
      folder_mode: false,
      file_model: null,
      selected_file: null,
      selected_files: null,
      showLoadingDialog: false,
      showPluginDialog: false,
      showSettingsDialog: false,
      plugin_dialog_config: null,
      _plugin_dialog_promise: {},
      loading: false,
      showImportDialog: false,
      windows: [],
      panels: [],
      activeWindow: null,
      workflow_joy_config: {
        init: "{id:'workflow', type:'ops'}",
        onupdate: this.workflowOnchange
      },
      plugins: {},
      installed_plugins: [],
      plugin_api: null,
      plugin_loaded: false,
      menuVisible: true,
      db: null,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api,
    }
  },
  watch: {
    menuVisible() {

    }
  },
  created(){
    setTimeout(()=>{
      this.db.allDocs({
        include_docs: true,
        attachments: true
      }).then((result) => {
        const promises = []
        this.plugins = {}
        this.installed_plugins = []
        for (let i = 0; i < result.total_rows; i++) {
          const config = result.rows[i].doc
          this.installed_plugins.push(config)
          promises.push(this.loadPlugin(config))
        }
        // TODO: setup this promise all, it's now cause unknown problem
        // Promise.all(promises).then(()=>{
        // })
        this.plugin_loaded = true
        this.loading = false
        this.$forceUpdate()
      }).catch((err) => {
        console.error(err)
        this.loading = false
      });
    }, 1000)
  },
  mounted() {


    this.plugin_api = {
      alert: alert,
      register: this.register,
      createWindow: this.createWindow,
      showDialog: this.showDialog
    }
    this.plugin_loaded = false
    this.loading = true
    this.db = new PouchDB('imjoy_plugins', {
      revs_limit: 2,
      auto_compaction: true
    })
    const root = location.protocol + '//' + location.host

    //TODO: fix this, how to prevent loading failure if remove this timeout

  },
  beforeDestroy() {
      console.log('terminating plugins')
      for (let k in this.plugins) {
        if(this.plugins.hasOwnProperty(k)){
          const plugin = this.plugins[k]
          plugin.terminate()
        }
      }
  },
  methods: {
    closePluginDialog(ok){
      this.showPluginDialog = false
      let [resolve, reject] = this._plugin_dialog_promise
      if(ok){
         resolve(this.$refs.plugin_dialog_joy.joy.data)
      }
      else{
         reject()
      }
      this._plugin_dialog_promise = null
    },
    workflowOnchange(){
      console.log('workflow changed ...')
    },
    windowSelected(window) {
      console.log('activate window: ', window)
      this.activeWindow = window
    },
    loadData() {
      const window = {
        name: 'Files',
        type: 'files',
        config: {},
        data: {
          files: this.selected_files
        }
      }
      this.windows.push(window)
    },
    runWorkflow(joy) {
        console.log('run joy.')
        joy.workflow.execute({})

    },
    runPanel(joy, panel){
      console.log('run panel.', joy)
      joy._panel.execute({})
    },
    selectFileChanged(file_list) {
      console.log(file_list)
      this.selected_file = file_list[0]
      this.selected_files = file_list
    },
    updateProgress(p) {
      console.log(p)
    },
    test() {},
    closePanel(panel) {

    },
    register(config, _plugin) {
      const plugin = this.plugins[_plugin.id]
      //TODO: verify fields with OP_TEMPLATE
      console.log('creating Op: ', config, _plugin, this.plugins)
      if(!plugin.api.run){
        console.log("WARNING: no run function found in the config, this op won't be able to do anything: " + config.name)
        config.onexecute = () =>{
          console.log("WARNING: no run function defined.")
        }
      }
      else{
        const onexecute = async (my) => {
          //conver the api here data-->config   target--> data
          return await plugin.api.run({
            op: {
              name: my.op.name,
              type: my.op.type
            },
            config: my.data,
            data: my.target,
            progress: this.updateProgress
          })
        }
        config.onexecute = onexecute
      }
      if(config.onupdate && typeof config.onupdate == 'object'){
        for(let k in config.onupdate){
          if(config.onupdate.hasOwnProperty(k)){
            // replace the string to a real function
            const onupdate = plugin.api[config.onupdate[k]]
            config.onupdate[k] = onupdate
          }
        }
      }
      Joy.add(config);
      //update the joy workflow if new template added, TODO: preserve settings during reload
      this.$refs.workflow.setupJoy()

      const panel_config = {name: config.name, id: _plugin.id, init: "{id: '_panel', type: '"+config.type+"'}", onexecute: config.onexecute}
      plugin.panel_config = panel_config
      if(config.show_panel){
        console.log('creating panel: ', panel_config)
        this.panels.push(panel_config)
      }
      return true
    },
    createWindow(config, _plugin) {
      const plugin = this.plugins[_plugin.id]
      //TODO: verify fields with WINDOW_TEMPLATE
      console.log('creating window: ', config, plugin)
      config.window_id = 'plugin_window_'+plugin._id+randId()
      if(config.show_panel && plugin.panel_config){
        // create panel for the window
        console.log('creating panel: ', plugin.panel_config)
        // config.panel = plugin_config
      }
      if(config.onupdate && typeof config.onupdate == 'object'){
        for(let k in config.onupdate){
          if(config.onupdate.hasOwnProperty(k)){
            // replace the string to a real function
            const onupdate = plugin.api[config.onupdate[k]]
            config.onupdate[k] = onupdate
          }
        }
      }
      this.windows.unshift(config)
      return true
    },
    showDialog(config, _plugin) {
      return new Promise((resolve, reject) => {
        const plugin = this.plugins[_plugin.id]
        if(config.onupdate && typeof config.onupdate == 'object'){
          for(let k in config.onupdate){
            if(config.onupdate.hasOwnProperty(k)){
              // replace the string to a real function
              const onupdate = plugin.api[config.onupdate[k]]
              config.onupdate[k] = onupdate
            }
          }
        }
        //TODO: verify fields with WINDOW_TEMPLATE
        console.log('creating window: ', config, plugin)

        if(config.show_panel && plugin.panel_config){
          // create panel for the window
          console.log('creating panel: ', plugin.panel_config)
          // config.panel = plugin_config
        }
        this.plugin_dialog_config = config
        this.showPluginDialog = true
        this._plugin_dialog_promise = [resolve, reject]
      })
    },
    showPluginWindow(config) {
      return new Promise((resolve, reject) => {
        //TODO: verify fields with WINDOW_TEMPLATE
        console.log('creating window: ', config)
        this.windows.unshift(config)
              // container IS NOT finished rendering to the DOM
        // this.$nextTick(()=>{
        //      resolve()
        // })
        setTimeout(()=>{
        //   const target = document.getElementById(config.window_id)
        //   const source =  document.getElementById('iframe_'+plugin.id)
        //     console.log('moving.......', target, source)
        //   target.parentNode.appendChild(source)
          resolve()
        }, 500)
      })
    },
    loadPlugin(config) {
      const path = config.file_path
      //generate a random id for the plugin
      config.id = config._id+'_'+randId()
      return new Promise((resolve, reject) => {
        // exported methods, will be available to the plugin
        this.plugin_api.kk = 999
        this.plugin_api.get_kk = async () => {
          return new ArrayBuffer(1200400)
        }

        const _setupPlugin = ()=>{
          let plugin
          if (config.plugin_code) {
            if(path.endsWith('.vue')){
              console.log('parsing the plugin file')
              const pluginComp = parseComponent(config.plugin_code)
              console.log('code parsed from', path, pluginComp)
              config.script = pluginComp.script.content
              if(pluginComp.customBlocks[0].type == 'html'){
                config.html = pluginComp.customBlocks[0].content
              }
              else{
                console.error('no html tag found in side the plugin file.')
              }
              // here we only take the first stylesheet we found
              config.style = pluginComp.styles[0].content
            }
            else{
              config.script = config.plugin_code
            }

            plugin = new jailed.DynamicPlugin(config.script, this.plugin_api, config)
          } else {
            alert('no plugin source code found for '+config.name)
            //plugin = new jailed.Plugin(path, this.plugin_api, config);
          }
          this.plugins[plugin.id] = plugin
          plugin.whenConnected(() => {
            if (!plugin.api) {
              console.error('error occured when loading plugins.')
            }
            plugin.api.setup().then((result) => {
              console.log('sucessfully setup plugin: ', plugin)
              // setTimeout(()=>{
              //   plugin.terminate()
              // }, 10000)
              resolve()
            }).catch((e) => {
              console.error('error occured when loading plugin ' + config.name + ": ", e)
              reject(e)
              plugin.terminate()
            })
          });
          plugin.whenFailed((e) => {
            console.error('error occured when loading '+config.name + ":", e)
            alert('error occured when loading ' + config.name)
            plugin.terminate()
            this.plugins[plugin.id] = null
            // reject(e)
          });
        }
        if(config.type=='iframe'){
          // this is a unique id for the iframe to attach
          config.window_id = 'plugin_window_'+config.id
          this.showPluginWindow(config).then(()=>{
            _setupPlugin()
          })
        }
        else{
          _setupPlugin()
        }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.md-empty-state {
  height: 100%;
  width: 100%;
}

.md-content{
  overflow-x: hidden;
}
.viewer {
  height: 100%;
}

.md-dialog {
  width: 768px;
}

.md-card {
  /* width: 100%; */
  /* height: 300px; */
  margin-bottom: 20px;
}

.whiteboard-content{
  padding: 0px;
}

.panel-header{
  padding-left: 20px;
  height: 40px;
  min-height: 20px;
}

.panel-title{
  font-size: 1.4em;
}
</style>
