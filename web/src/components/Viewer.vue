<template>
<div class="viewer noselect">
  <div style="visibility:hidden; opacity:0" id="dropzone">
    <div id="textnode">Drop files to add data.</div>
  </div>
  <md-app>
    <md-app-toolbar class="md-dense" md-elevation="0">
      <div class="md-toolbar-section-start">
        <md-button v-if="!menuVisible" class="md-primary md-icon-button" @click="menuVisible=true">
          <md-icon>menu</md-icon>
        </md-button>
        <md-button to="/" v-if="!menuVisible">
          <div class="site-title">ImJoy.io<span class="superscript">alpha</span></div>
        </md-button>
        <span class="subheader-title md-small-hide" style="flex: 1">Image Processing with Joy</span>
      </div>
      <span class="status-text md-small-hide" :class="status_text.includes('rror')?'error-message':''">{{status_text}}</span>
      <div class="md-toolbar-section-end">
        <md-button @click="closeAll" class="md-icon-button md-accent">
          <md-icon>cancel</md-icon>
        </md-button>
        <md-button @click="reloadPlugins()" class="md-icon-button">
          <md-icon>autorenew</md-icon>
        </md-button>
        <md-button class="md-icon-button">
          <md-icon>save</md-icon>
        </md-button>
        <md-button class="md-icon-button">
          <md-icon>share</md-icon>
        </md-button>
        <md-button class="md-icon-button">
          <md-icon>help</md-icon>
        </md-button>
      </div>
    </md-app-toolbar>
    <md-app-drawer :md-active.sync="menuVisible" md-persistent="full">
      <!-- <md-app-toolbar class="md-primary md-dense"> -->
      <md-speed-dial class="md-top-left speed-dial" md-effect="scale" md-direction="bottom">
        <md-speed-dial-target class="md-primary">
          <md-icon>add</md-icon>
        </md-speed-dial-target>
        <md-speed-dial-content>
          <md-button @click="$refs.file_select.openPicker()" class="md-icon-button md-primary">
            <md-icon>insert_drive_file</md-icon>
          </md-button>
          <md-button @click="$refs.folder_select.openPicker()" class="md-icon-button md-primary">
            <md-icon>folder_open</md-icon>
          </md-button>
          <md-button @click="showImportDialog=true" class="md-icon-button md-accent">
            <md-icon>extension</md-icon>
          </md-button>
        </md-speed-dial-content>
      </md-speed-dial>
      <div class="md-toolbar-row">
        <div class="md-toolbar-section-start">
          <!-- <md-button v-if="!menuVisible" class="md-fab md-primary" @click="menuVisible=true">
            <md-icon>menu</md-icon>
          </md-button> -->
          <md-field v-show="false">
            <md-file v-show="false" v-model="folder_select" ref="file_select" @md-change="selectFileChanged" />
          </md-field>
          <md-field v-show="false">
            <md-file v-model="file_select" ref="folder_select" @md-change="selectFileChanged" webkitdirectory mozdirectory msdirectory odirectory directory multiple/>
          </md-field>
          <md-button class="site-button" to="/">
            <div class="site-title">ImJoy.io<span class="superscript">alpha</span></div>
          </md-button>
        </div>
        <div class="md-toolbar-section-end">
          <md-button class="md-icon-button md-primary" @click="showSettingsDialog=true">
            <md-icon>settings</md-icon>
          </md-button>
          <md-button class="md-icon-button md-dense md-raised" @click="menuVisible = !menuVisible">
            <md-icon>keyboard_arrow_left</md-icon>
          </md-button>
        </div>
      </div>
      <br>
      <md-card>
        <md-card-header>
          <span class="md-subheading">Workflow</span>
        </md-card-header>
        <md-card-content>
          <joy :config="workflow_joy_config" :showHeader="false" ref="workflow" @run="runWorkflow" v-if="plugin_loaded"></joy>
        </md-card-content>
      </md-card>

      <div v-if="plugin_loaded">
        <md-card>
          <md-card-header>
            <span class="md-subheading">Plugins</span>
          </md-card-header>
          <md-card-content>
            <div v-for="panel in panels" :key="panel.id">
              <md-divider></md-divider>
              <joy :config="panel" @run="runPanel($event, panel)"></joy>

            </div>
            <md-divider></md-divider>
          </md-card-content>
        </md-card>
      </div>

    </md-app-drawer>
    <md-app-content class="whiteboard-content">
      <md-progress-bar md-mode="determinate" :md-value="progress"></md-progress-bar>
      <whiteboard :windows="windows" @select="windowSelected"></whiteboard>
    </md-app-content>
  </md-app>
  <!-- </md-card-content> -->

  <md-dialog :md-active.sync="showPluginDialog" :md-click-outside-to-close="false">
    <md-dialog-content>
      <div v-if="plugin_dialog_config">
        <joy :config="plugin_dialog_config" :showHeader="false" :controlButtons="false" ref="plugin_dialog_joy"></joy>
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
  _clone,
  randId
} from '../utils.js'
import {
  parseComponent
} from '../pluginParser.js'


export default {
  name: 'viewer',
  props: ['title'],
  data() {
    return {
      file_select: null,
      folder_select: null,
      selected_file: null,
      selected_files: null,
      showPluginDialog: false,
      showSettingsDialog: false,
      plugin_dialog_config: null,
      _plugin_dialog_promise: {},
      loading: false,
      progress: 0,
      status_text: '',
      showImportDialog: false,
      windows: [],
      panels: [],
      activeWindows: [],
      workflow_joy_config: {
        expanded: true,
        name: "Workflow",
        ui: "{id:'workflow', type:'ops'}",
        // onupdate: this.workflowOnchange
      },
      default_window_pos: {
        i: 0,
        x: 0,
        y: 0,
        w: 5,
        h: 5
      },
      plugins: null,
      registered: {
        ops: {},
        windows: {}
      },
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
    window.onbeforeunload = s => modified ? "" : null;
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
      document.querySelector("#dropzone").style.visibility = "";
      document.querySelector("#dropzone").style.opacity = 1;
      document.querySelector("#textnode").style.fontSize = "48px";
    });
    window.addEventListener("dragenter", (e) => {
      e.preventDefault();
      document.querySelector("#dropzone").style.visibility = "";
      document.querySelector("#dropzone").style.opacity = 1;
      document.querySelector("#textnode").style.fontSize = "48px";
    });
    window.addEventListener("dragleave", (e) => {
      e.preventDefault();
      document.querySelector("#dropzone").style.visibility = "hidden";
      document.querySelector("#dropzone").style.opacity = 0;
      document.querySelector("#textnode").style.fontSize = "42px";
    });
    window.addEventListener("drop", (e) => {
      e.preventDefault();
      document.querySelector("#dropzone").style.visibility = "hidden";
      document.querySelector("#dropzone").style.opacity = 0;
      document.querySelector("#textnode").style.fontSize = "42px";
      this.selected_files = e.dataTransfer.files;
      this.loadData()
    });

  },
  beforeRouteLeave(to, from, next) {
    if (this.windows && this.windows.length > 0) {
      const answer = window.confirm('Do you really want to leave? you have unsaved changes!')
      if (answer) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  },
  mounted() {
    this.plugin_api = {
      alert: alert,
      register: this.register,
      createWindow: this.createWindow,
      showDialog: this.showDialog,
      showProgress: this.showProgress,
      showStatus: this.showStatus,
      run: this.runPlugin,
    }
    this.plugin_loaded = false
    this.loading = true
    this.db = new PouchDB('imjoy_plugins', {
      revs_limit: 2,
      auto_compaction: true
    })
    const root = location.protocol + '//' + location.host

    //TODO: fix this, how to prevent loading failure if remove this timeout
    this.$nextTick(() => {
      this.reloadPlugins()
    })
  },
  beforeDestroy() {
    console.log('terminating plugins')
    for (let k in this.plugins) {
      if (this.plugins.hasOwnProperty(k)) {
        const plugin = this.plugins[k]
        if (typeof plugin.terminate == 'function') plugin.terminate()
      }
    }
  },
  methods: {
    reloadPlugins(){
      if(this.plugins){
        for (let k in this.plugins) {
          if (this.plugins.hasOwnProperty(k)) {
            const plugin = this.plugins[k]
            if (typeof plugin.terminate == 'function') plugin.terminate()
          }
        }
      }
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
          try {
            const template = this.parsePluginCode(config.code, config)
            if (template.mode == 'iframe' && template.tags.includes('window')) {
              promises.push(this.preLoadPlugin(template))
            } else {
              promises.push(this.loadPlugin(template))
            }
          } catch (e) {
            console.error(e)
            alert('error occured when loading plugin "' + config.name + '": ' + e.toString())
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
    },
    closeAll(){
      this.windows = []
      this.default_window_pos = {
        i: 0,
        x: 0,
        y: 0,
        w: 5,
        h: 5
      }
    },
    showProgress(p){
      if (p < 1) this.progress = p * 100
      else this.progress = p
      // this.$forceUpdate()
    },
    showStatus(s){
      this.status_text = s
      // this.$forceUpdate()
    },
    addWindow(w){
      this.windows.push(w)
      this.store.event_bus.$emit('add_window', w)
    },
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
    // workflowOnchange() {
    //   // console.log('workflow changed ...')
    // },
    windowSelected(ws) {
      console.log('activate window: ', ws)
      this.activeWindows = ws
    },
    generateGridPosition(config) {
      config.i = this.default_window_pos.i.toString()
      config.w = this.default_window_pos.w
      config.h = this.default_window_pos.h
      config.x = this.default_window_pos.x
      config.y = this.default_window_pos.y
      this.default_window_pos.x = this.default_window_pos.x + this.default_window_pos.w
      if (this.default_window_pos.x >= 20) {
        this.default_window_pos.x = 0
        this.default_window_pos.y = this.default_window_pos.y + this.default_window_pos.h
      }
      console.log('set window position to ', config.x, config.y, config.w, config.h, config.i)
      this.default_window_pos.i = this.default_window_pos.i + 1
    },
    loadData() {
      const w = {
        name: 'Files',
        type: 'imjoy/files',
        config: {},
        data: {
          files: this.selected_files
        }
      }
      this.generateGridPosition(w)
      this.addWindow(w)
    },
    runWorkflow(joy) {
      console.log('run workflow.', this.activeWindows)
      const w = this.activeWindows[this.activeWindows.length - 1] || {}
      joy.workflow.execute(w.data || {}).then((my) => {
        if(my && !my.op.tags.includes('window')){
          console.log('result', my)
          my.name = 'result'
          my.type = 'imjoy/generic'
          my.config = my.data
          my.data = my.target
          this.createWindow(my)
        }
        this.progress = 100
        this.status_text = ''
      }).catch((e)=>{
        console.error(e)
        this.status_text = e.toString() || "Error."
      })
    },
    runPanel(joy, panel) {
      console.log('run panel.', this.activeWindows)
      const w = this.activeWindows[this.activeWindows.length - 1] || {}
      joy._panel.execute(w.data || {}).then((my) => {
        if(my && !my.op.tags.includes('window')){
          console.log('result', my)
          my.name = 'result'
          my.type = 'imjoy/generic'
          my.config = my.data
          my.data = my.target
          this.createWindow(my)
        }
        this.progress = 100
        this.status_text = ''
      }).catch((e)=>{
        console.error(e)
        this.status_text = e.toString() || "Error."
      })
    },
    selectFileChanged(file_list) {
      console.log(file_list)
      this.selected_file = file_list[0]
      this.selected_files = file_list
    },
    closePanel(panel) {

    },
    parsePluginCode(code, config) {
      config = config || {}
      const url = config.url
      if (url.endsWith('.vue')) {
        console.log('parsing the plugin file')
        const pluginComp = parseComponent(code)
        console.log('code parsed from', pluginComp)
        let c = null
        for (let i = 0; i < pluginComp.customBlocks.length; i++) {
          if (pluginComp.customBlocks[i].type == 'config') {
            // find the first config block
             config = JSON.parse(pluginComp.customBlocks[i].content)
             console.log('loading config from .vue file', config)
            break
          }
        }

        config.script = pluginComp.script.content
        config.lang = pluginComp.script.attrs.lang || 'javascript'
        for (let i = 0; i < pluginComp.customBlocks.length; i++) {
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
        if (pluginComp.styles.length > 0) {
          // here we only take the first stylesheet we found
          config.style = pluginComp.styles[0].content
        } else {
          config.style = null
        }
      } else {
        config.lang = config.lang || 'javascript'
        config.script = code
        config.style = null
        config.html = null
      }
      config._id = config._id || null
      config.url = url
      config.code = code
      config.id = config.name.trim().replace(/ /g, '_') + '_' + randId()
      if (!PLUGIN_SCHEMA(config)) {
        const error = PLUGIN_SCHEMA.errors(config)
        console.error("Invalid plugin config: " + config.name, error)
        throw error
      }
      return config
    },
    preLoadPlugin(template) {
      const config = {
        name: template.name,
        mode: template.mode,
        type: template.type,
        tags: template.tags,
        ui: template.ui
      }
      //generate a random id for the plugin
      return new Promise((resolve, reject) => {
        config.id = template.name.trim().replace(/ /g, '_') + '_' + randId()
        const plugin = {
          id: config.id,
          config: config,
          template: template,
          mode: template.mode
        }
        this.plugins[plugin.id] = plugin
        config.force_show = false
        plugin.api = {
          run: (my) => {
            const c = {}
            c.type = template.type
            c.name = template.name
            // c.op = my.op
            c.data = my.data
            c.config = my.config
            this.createWindow(c)
          }
        }
        this.register(config, {
          id: config.id
        })
        console.log('sucessfully preloaded plugin: ', plugin)
        resolve()
      })
    },
    loadPlugin(config) {
      config = _clone(config)
      //generate a random id for the plugin
      return new Promise((resolve, reject) => {
        const plugin = new jailed.DynamicPlugin(config, {}, this.plugin_api)
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
    async runPlugin(plugin_type, my, _plugin) {
      console.log('run plugin', plugin_type, my, _plugin)
      const target_plugin = this.plugins[plugin_type]
      //conver the api here data-->config   target--> data
      return await target_plugin.api.run(my)
    },
    register(config, _plugin) {
      try {
        const plugin = this.plugins[_plugin.id]
        config.mode = config.mode || 'webworker'
        config.show_panel = config.show_panel || true
        console.log('registering op', config)
        if (!REGISTER_SCHEMA(config)) {
          const error = REGISTER_SCHEMA.errors(config)
          console.error("Error occured during registering " + config.name, error)
          throw error
        }
        if (this.registered.ops[config.type]) {
          console.log('plugin already registered')
          return
        }
        if (config.tags.includes('op')) {
          console.log('creating Op: ', config, plugin)
          if (!plugin || !plugin.api || !plugin.api.run) {
            console.log("WARNING: no run function found in the config, this op won't be able to do anything: " + config.name)
            config.onexecute = () => {
              console.log("WARNING: no run function defined.")
            }
          } else {
            const onexecute = async (my) => {
              //conver the api here data-->config   target--> data
              const result = await plugin.api.run({
                op: {
                  name: my.op.name,
                  type: my.op.type
                },
                config: my.data,
                data: my.target
              })
              my.data = result && result.config
              my.target = result && result.data
              return my
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
          console.log('adding joy op', config)
          const joy_template = config
          joy_template.init = joy_template.ui
          joy_template.ui = null
          Joy.add(joy_template);
          //update the joy workflow if new template added, TODO: preserve settings during reload
          if (this.$refs.workflow) this.$refs.workflow.setupJoy()
          plugin.config.type = config.type
          console.log('register op plugin: ', plugin.template)
          this.registered.ops[config.type] = plugin.template
          const panel_config = {
            name: config.name,
            id: _plugin.id,
            ui: "{id: '_panel', type: '" + config.type + "'}",
            onexecute: config.onexecute
          }
          plugin.panel_config = panel_config
          if (config.show_panel) {
            console.log('creating panel: ', panel_config)
            this.panels.push(panel_config)
            this.$forceUpdate()
          }
        }
        if (config.tags.includes('window')) {
          if (config.mode != 'iframe') {
            throw 'Window plugin must be with type "iframe"'
          }
          console.log('register window plugin: ', plugin.template)
          this.registered.windows[config.type] = plugin.template
        }
        if (config.tags.includes('file_importer')) {
          throw "file importer not supported yet"
        }
        if (config.tags.includes('file_exporter')) {
          throw "file importer not supported yet"
        }
        return true
      } catch (e) {
        console.error(e)
        throw e
      }

    },
    renderWindow(pconfig) {
      console.log('rendering window', pconfig)
      const plugin = new jailed.DynamicPlugin(pconfig.plugin, pconfig, this.plugin_api)
      plugin.whenConnected(() => {
        if (!plugin.api) {
          console.error('the window plugin seems not ready.')
        }
        this.plugins[plugin.id] = plugin
        plugin.api.setup().then((result) => {
          console.log('sucessfully setup the window plugin: ', plugin, pconfig)
          plugin.api.run({
            data: pconfig.data,
            config: pconfig.config,
            op: pconfig.op,
          }).catch((e) => {
            this.status_text = "Error occured when running plugin "+plugin.name
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
    createWindow(wconfig, _plugin) {
      try {
        // wconfig.type = wconfig.type || "imjoy/panel"
        wconfig.config = wconfig.config || {}
        wconfig.data = wconfig.data || null
        wconfig.force_show = wconfig.force_show || false
        wconfig.panel = wconfig.panel || null
        console.log('--------------------------', wconfig)
        this.generateGridPosition(wconfig)
        if (!WINDOW_SCHEMA(wconfig)) {
          const error = WINDOW_SCHEMA.errors(wconfig)
          console.error("Error occured during creating window " + wconfig.name, error)
          throw error
        }
        console.log('window config', wconfig)
        if (wconfig.type.startsWith('imjoy')) {
          console.log('creating imjoy window', wconfig)
          // wconfig.window_id = 'plugin_window_'+plugin._id+randId()
          this.addWindow(wconfig)
          return true
        } else {
          const window_config = this.registered.windows[wconfig.type]
          console.log(window_config)
          if (!window_config) {
            console.error('no plugin registered for window type: ', wconfig.type)
            throw 'no plugin registered for window type: ', wconfig.type
          }
          // console.log(window_config)
          const pconfig = wconfig //_clone(window_config)
          //generate a new window id
          pconfig.mode = window_config.mode
          pconfig.id = window_config.name.trim().replace(/ /g, '_') + '_' + randId()
          console.log('creating window: ', pconfig)
          if (pconfig.mode != 'iframe') {
            throw 'Window plugin must be with mode "iframe"'
          }
          // this is a unique id for the iframe to attach
          pconfig.iframe_container = 'plugin_window_' + pconfig.id + randId()
          pconfig.iframe_window = null
          pconfig.plugin = window_config
          if (wconfig.force_show) {
            pconfig.click2load = false
            pconfig.loadWindow = null
            this.showPluginWindow(pconfig).then(() => {
              this.renderWindow(pconfig)
            })
          } else {
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
        console.log('creating dialog: ', config, plugin)

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
        // this.generateGridPosition(config)
        if (!WINDOW_SCHEMA(config)) {
          const error = WINDOW_SCHEMA.errors(config)
          console.error("Error occured during creating window " + config.name, error)
          throw error
        }
        //TODO: verify fields with WINDOW_TEMPLATE
        console.log('creating plugin window: ', config)
        this.addWindow(config)
        console.log('added the window')
        // container IS NOT finished rendering to the DOM
        // this.$nextTick(()=>{
        //      resolve()
        // })
        // setTimeout(() => {
        //   resolve()
        // }, 500)
      })
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.site-title {
  font-size: 35px;
  font-weight: 300;
}

@media screen and (max-width: 600px) {
  .site-title {
    font-size: 26px;
    font-weight: 250;
  }
}

@media screen and (max-width: 400px) {
  .site-title {
    font-size: 22px;
    font-weight: 220;
  }
}

.subheader-title {
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
}

.superscript {
  font-size: 16px;
  text-transform: none;
  vertical-align: super;
  color: #ff5253;
}

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


/* The sticky class is added to the header with JS when it reaches its scroll position */

.sticky {
  position: fixed;
  top: 0;
  width: 100%
}

/* Add some top padding to the page content to prevent sudden quick movement (as the header gets a new position at the top of the page (position:fixed and top:0) */

.sticky+.content {
  padding-top: 102px;
}

.floating-fab {
  margin-top: 40px;
}

.error-message{
  color: red;
}

div#dropzone {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999999999;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: visibility 175ms, opacity 175ms;
  display: table;
  text-shadow: 1px 1px 2px #000;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  font: bold 42px Oswald, DejaVu Sans, Tahoma, sans-serif;
}

div#textnode {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
  transition: font-size 175ms;
}

.speed-dial {
  top: 8px;
  left: 15px;
}

.site-button{
  left: 80px;
}
</style>
