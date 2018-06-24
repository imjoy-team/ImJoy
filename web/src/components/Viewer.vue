<template>
<div class="viewer">
  <md-button v-if="!menuVisible" class="md-fab md-primary md-fab-top-left" @click="menuVisible=true">
    <md-icon>menu</md-icon>
  </md-button>
  <md-app-toolbar v-if="menuVisible" class="md-primary md-dense">
    <div class="md-toolbar-row">
      <div class="md-toolbar-section-start">
        <!-- <md-button v-if="!menuVisible" class="md-fab md-primary" @click="menuVisible=true">
          <md-icon>menu</md-icon>
        </md-button> -->
        <navbar/>
      </div>
    </div>
  </md-app-toolbar>
  <md-app>
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
              <div> <span class="panel-title">{{panel.name}}</span></div>
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
  REGISTER_SCHEMA,
  WINDOW_SCHEMA,
  OP_SCHEMA,
  PLUGIN_SCHEMA,
} from '../api.js'

import {
  randId
} from '../utils.js'
import {
  parseComponent
} from '../pluginParser.js'

// Deep clone
var _clone = function(json){
	return JSON.parse(JSON.stringify(json));
};

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
      activeWindow: {},
      workflow_joy_config: {
        init: "{id:'workflow', type:'ops'}",
        onupdate: this.workflowOnchange
      },
      default_window_pos: [0, 0, 0],
      plugins: {},
      registered: {ops: {}, windows: {}},
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
  created() {

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
    setTimeout(() => {
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
          const c = this.parsePluginCode(config.plugin_code, config.file_path)
          if(c.mode == 'iframe' && c.tags.includes('window')){
            promises.push(this.preLoadPlugin(c))
          }
          else{
            promises.push(this.loadPlugin(c))
          }
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
  beforeDestroy() {
    console.log('terminating plugins')
    for (let k in this.plugins) {
      if (this.plugins.hasOwnProperty(k)) {
        const plugin = this.plugins[k]
        plugin.terminate()
      }
    }
  },
  methods: {
    closePluginDialog(ok) {
      this.showPluginDialog = false
      let [resolve, reject] = this._plugin_dialog_promise
      if (ok) {
        resolve(this.$refs.plugin_dialog_joy.joy.data)
      } else {
        reject()
      }
      this._plugin_dialog_promise = null
    },
    workflowOnchange() {
      console.log('workflow changed ...')
    },
    windowSelected(w) {
      console.log('activate window: ', w)
      this.activeWindow = w
    },
    loadData() {
      const w = {
        name: 'Files',
        type: 'files',
        config: {},
        data: {
          files: this.selected_files
        }
      }
      this.windows.push(w)
    },
    runWorkflow(joy) {
      console.log('run workflow.', this.activeWindow)
      const w = this.activeWindow || {}
      joy.workflow.execute(w.data)
    },
    runPanel(joy, panel) {
      console.log('run panel.', this.activeWindow)
      const w = this.activeWindow || {}
      joy._panel.execute(w.data)
    },
    selectFileChanged(file_list) {
      console.log(file_list)
      this.selected_file = file_list[0]
      this.selected_files = file_list
    },
    updateProgress(p) {
      console.log(p)
    },
    closePanel(panel) {

    },
    parsePluginCode(code, file_path){
      let config = {}
      if (file_path.endsWith('.vue')) {
        console.log('parsing the plugin file')
        const pluginComp = parseComponent(code)
        console.log('code parsed from', pluginComp)
        for(let i=0;i<pluginComp.customBlocks.length;i++){
          if(pluginComp.customBlocks[i].type == 'config'){
            // find the first config block
            config = JSON.parse(pluginComp.customBlocks[i].content)
            break
          }
        }
        config.script = pluginComp.script.content
        for(let i=0;i<pluginComp.customBlocks.length;i++){
          if (pluginComp.customBlocks[i].type == 'html') {
            // find the first html block
            config.html = pluginComp.customBlocks[i].content
            break
            //show the iframe if there is html defined
            // config.iframe_container = 'plugin_window_' + config.id + randId()
            // config.iframe_window = null
            // config.type = 'main'
            // this.showPluginWindow(config)
          }
        }
        config.html = config.html || null
        if(pluginComp.styles.length>0){
          // here we only take the first stylesheet we found
          config.style = pluginComp.styles[0].content
        }
        else{
          config.style = null
        }
      } else {
        config.script = code
        config.style = null
        config.html = null
      }
      config._id = config._id || null
      config.file_path = file_path
      config.plugin_code = code
      config.id = config.name + '_' + randId()
      config.iframe_container = null
      config.iframe_window = null
      if(!PLUGIN_SCHEMA(config)){
        const error = PLUGIN_SCHEMA.errors(config)
        console.error("Invalid plugin config: "+config.name, error)
        throw error
      }
      return config
    },
    preLoadPlugin(config) {
      //generate a random id for the plugin
      return new Promise((resolve, reject) => {
        const plugin = {id: config.id, config: _clone(config)}
        this.plugins[plugin.id] = plugin
        config.force_show = false
        plugin.api = {run: (my)=>{
          const c = _clone(config)
          c.op = my.op
          c.progress = my.progress
          c.data = my.data
          c.config = my.config
          this.createWindow(c, {id: c.id})}
        }
        this.register(config, {id: config.id})
        console.log('sucessfully registered plugin: ', plugin)
        resolve()
      })
    },
    loadPlugin(config) {
      //generate a random id for the plugin
      return new Promise((resolve, reject) => {
        const plugin = new jailed.DynamicPlugin(_clone(config), this.plugin_api)
        plugin.whenConnected(() => {
          if (!plugin.api) {
            console.error('error occured when loading plugin.')
            throw 'error occured when loading plugin.'
          }
          this.plugins[plugin.id] = plugin
          plugin.api.setup().then((result) => {
            console.log('sucessfully setup plugin: ', plugin)
            resolve()
          }).catch((e) => {
            console.error('error occured when loading plugin ' + config.name + ": ", e)
            reject(e)
            plugin.terminate()
          })
        });
        plugin.whenFailed((e) => {
          console.error('error occured when loading ' + config.name + ":", e)
          alert('error occured when loading ' + config.name)
          plugin.terminate()
          // reject(e)
        });
      })
    },
    register(config, _plugin) {
      try {
        const plugin = this.plugins[_plugin.id]
        config.mode = config.mode || 'webworker'
        config.show_panel = config.show_panel || true
        if(!REGISTER_SCHEMA(config)){
          const error = REGISTER_SCHEMA.errors(config)
          console.error("Error occured during registering "+config.name, error)
          throw error
        }
        if(this.registered.ops[config.type]){
          console.log('plugin already registered')
          return
        }
        if(config.tags.includes('op')){
          console.log('creating Op: ', config, plugin)
          if (!plugin|| !plugin.api || !plugin.api.run) {
            console.log("WARNING: no run function found in the config, this op won't be able to do anything: " + config.name)
            config.onexecute = () => {
              console.log("WARNING: no run function defined.")
            }
          } else {
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
          if (config.onupdate && typeof config.onupdate == 'object') {
            for (let k in config.onupdate) {
              if (config.onupdate.hasOwnProperty(k)) {
                // replace the string to a real function
                const onupdate = plugin.api[config.onupdate[k]]
                config.onupdate[k] = onupdate
              }
            }
          }
          Joy.add(config);
          //update the joy workflow if new template added, TODO: preserve settings during reload
          if(this.$refs.workflow) this.$refs.workflow.setupJoy()
          this.registered.ops[config.type] = config
          plugin.config.type = config.type
          const panel_config = {
            name: config.name,
            id: _plugin.id,
            init: "{id: '_panel', type: '" + config.type + "'}",
            onexecute: config.onexecute
          }
          plugin.panel_config = panel_config
          if (config.show_panel) {
            console.log('creating panel: ', panel_config)
            this.panels.push(panel_config)
          }
        }
        if(config.tags.includes('window')){
          if(config.mode != 'iframe'){
            throw 'Window plugin must be with type "iframe"'
          }
          this.registered.windows[config.type] = plugin.config
        }
        if(config.tags.includes('file_importer')){
          throw "file importer not supported yet"
        }
        if(config.tags.includes('file_exporter')){
          throw "file importer not supported yet"
        }
        return true
      } catch (e) {
          console.error(e)
          throw e
      }

    },
    renderWindow(pconfig) {
      const plugin = new jailed.DynamicPlugin(pconfig, this.plugin_api)
      plugin.whenConnected(() => {
        if (!plugin.api) {
          console.error('the window plugin seems not ready.')
        }
        this.plugins[plugin.id] = plugin
        plugin.api.setup().then((result) => {
          console.log('sucessfully setup the window plugin: ', plugin, pconfig)
          plugin.api.run({data: pconfig.data, config: pconfig.config, op: pconfig.op, progress: pconfig.progress}).catch((e)=>{
            console.error('error in run function: ', e)
          })
        }).catch((e) => {
          console.error('error occured when loading the window plugin ' + pconfig.name + ": ", e)
          plugin.terminate()
        })
      });
      plugin.whenFailed((e) => {
        console.error('error occured when loading ' + pconfig.name + ":", e)
        alert('error occured when loading ' + pconfig.name)
        plugin.terminate()
      });
    },
    createWindow(config, _plugin) {
      try {
        config.type = config.type || "joy_panel"
        config.data = config.data || null
        config.force_show = config.force_show || false
        config.config = config.config || {}
        config.panel = config.panel || null
        config.config.width = config.config.width || 300
        config.config.height = config.config.height || 100
        if(!config.config.x || !config.config.y){
          config.config.x = this.default_window_pos[0]
          config.config.y = this.default_window_pos[1]
          this.default_window_pos[0] = this.default_window_pos[0]+10
          this.default_window_pos[1] = this.default_window_pos[1]+10
        }
        if(!config.config.z){
          config.config.z = this.default_window_pos[2]
          this.default_window_pos[2] = this.default_window_pos[2]+1
        }
        if(!WINDOW_SCHEMA(config)){
          const error = WINDOW_SCHEMA.errors(config)
          console.error("Error occured during creating window "+config.name, error)
          throw error
        }
        const source_plugin = this.plugins[_plugin.id]
        if(config.type == 'joy_panel'){
          console.log('creating joy_panel', config)
          // config.window_id = 'plugin_window_'+plugin._id+randId()
          this.windows.unshift(config)
        }
        else{
          const window_config = this.registered.windows[config.type]
          console.log(window_config)
          if(!window_config){
            console.error('no plugin registered for window type: ', config.type)
            throw 'no plugin registered for window type: ', config.type
          }
          console.log(window_config)
          const pconfig = _clone(window_config)
          //generate a new window id
          pconfig.id = pconfig.name + '_' + randId()
          pconfig.config = config.config
          pconfig.data = config.data
          pconfig.config.width = config.config.width
          pconfig.config.height = config.config.height
          pconfig.config.x = config.config.x
          pconfig.config.y = config.config.y
          pconfig.config.z = config.config.z
          pconfig.force_show = config.force_show
          console.log('creating window: ', pconfig, source_plugin)
          if(pconfig.mode != 'iframe'){
            throw 'Window plugin must be with mode "iframe"'
          }
          // this is a unique id for the iframe to attach
          pconfig.iframe_container = 'plugin_window_' + pconfig.id + randId()
          pconfig.iframe_window = null

          if(config.force_show){
            pconfig.click2load = false
            pconfig.loadWindow = null
            this.showPluginWindow(pconfig).then(() => {
              this.renderWindow(pconfig)
            })
          }
          else{
            pconfig.click2load = true
            pconfig.renderWindow = this.renderWindow
            this.showPluginWindow(pconfig)
          }

        }
      } catch (e) {
        console.error(e)
        throw e
      }
      return true
    },
    showDialog(config, _plugin) {
      return new Promise((resolve, reject) => {
        const plugin = this.plugins[_plugin.id]
        if (config.onupdate && typeof config.onupdate == 'object') {
          for (let k in config.onupdate) {
            if (config.onupdate.hasOwnProperty(k)) {
              // replace the string to a real function
              const onupdate = plugin.api[config.onupdate[k]]
              config.onupdate[k] = onupdate
            }
          }
        }
        //TODO: verify fields with WINDOW_TEMPLATE
        console.log('creating window: ', config, plugin)

        if (config.show_panel && plugin.panel_config) {
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
        config.type = config.type || "joy_panel"
        config.data = config.data || null
        config.config = config.config || {}
        config.panel = config.panel || null
        config.config.width = config.config.width || 500
        config.config.height = config.config.height || 300
        if(!config.config.x || !config.config.y){
          config.config.x = this.default_window_pos[0]
          config.config.y = this.default_window_pos[1]
          this.default_window_pos[0] = this.default_window_pos[0]+10
          this.default_window_pos[1] = this.default_window_pos[1]+10
        }
        if(!config.config.z){
          config.config.z = this.default_window_pos[2]
          this.default_window_pos[2] = this.default_window_pos[2]+1
        }
        if(!WINDOW_SCHEMA(config)){
          const error = WINDOW_SCHEMA.errors(config)
          console.error("Error occured during creating window "+config.name, error)
          throw error
        }
        //TODO: verify fields with WINDOW_TEMPLATE
        console.log('creating window: ', config)
        this.windows.push(config)
        // container IS NOT finished rendering to the DOM
        // this.$nextTick(()=>{
        //      resolve()
        // })
        setTimeout(() => {
          resolve()
        }, 500)
      })
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.md-empty-state {
  height: 100%;
  width: 100%;
}

.md-content {
  overflow-x: hidden;
}

.viewer {
  height: 100%;
}

.md-dialog {
  width: 90%;
}

.md-card {
  /* width: 100%; */
  /* height: 300px; */
  margin-bottom: 20px;
}

.whiteboard-content {
  padding: 0px;
}

.panel-header {
  padding-left: 20px;
  height: 40px;
  min-height: 20px;
}

.panel-title {
  font-size: 1.4em;
}

/* .floating-fab{
  position: absolute;
} */
</style>
