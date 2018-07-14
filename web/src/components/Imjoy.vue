Engine<template>
<div class="imjoy noselect">
  <div style="visibility:hidden; opacity:0" id="dropzone">
    <div id="textnode">Drop files to add data.</div>
  </div>
  <md-app>
    <md-app-toolbar class="md-dense" md-elevation="0">
      <div class="md-toolbar-section-start">
        <md-button v-if="!menuVisible" class="md-primary md-icon-button" @click="menuVisible=true">
          <md-icon>menu</md-icon>
          <md-tooltip>show sidebar</md-tooltip>
        </md-button>
        <md-button to="/" v-if="!menuVisible" class="md-medium-hide">
          <div class="site-title">ImJoy.io<span class="superscript md-small-hide">alpha</span></div>
          <md-tooltip>ImJoy home</md-tooltip>
        </md-button>
        <md-menu md-size="big">
          <md-button class="md-button" md-menu-trigger>
            <span class="subheader-title" style="flex: 1">Image Processing with Joy</span>
            <md-tooltip>Switch workspace</md-tooltip>
          </md-button>
          <md-menu-content>
            <md-menu-item @click="switchWorkspace(w)" v-for="w in workspace_list" :key="w.name">
              <span>{{w}}</span>
            </md-menu-item>
            <md-menu-item @click="showNewWorkspaceDialog=true">
              <span>New Workspace</span>
            </md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
      <span class="status-text md-small-hide" :class="status_text.includes('rror')?'error-message':''">{{status_text}}</span>
      <div class="md-toolbar-section-end">
        <md-snackbar :md-position="'center'" class="md-accent" :md-active.sync="show_snackbar" :md-duration="snackbar_duration">
         <span>{{snackbar_info}}</span>
         <md-button class="md-accent" @click="show_snackbar=false">close</md-button>
        </md-snackbar>
        <md-button @click="closeAll" class="md-icon-button md-accent">
          <md-icon>cancel</md-icon>
          <md-tooltip>Close all windows</md-tooltip>
        </md-button>
        <md-button :disabled="true" class="md-icon-button">
          <md-icon>save</md-icon>
          <md-tooltip>Save all windows</md-tooltip>
        </md-button>
        <md-menu md-size="big" md-direction="bottom-end">
          <md-button class="md-icon-button" :class="engine_connected?'md-primary':'md-accent'" md-menu-trigger>
            <md-icon>{{engine_connected?'sync':'sync_disabled'}}</md-icon>
            <md-tooltip>Connection to the Plugin Engine</md-tooltip>
          </md-button>
          <md-menu-content>
            <md-menu-item :disabled="true">
              <span>{{engine_status}}</span>
            </md-menu-item>
            <md-menu-item @click="connectEngine(engine_url)">
              <span>Connect</span>
              <md-icon>settings_ethernet</md-icon>
            </md-menu-item>
            <md-menu-item @click="disconnectEngine()">
              <span>Disconnect</span>
              <md-icon>clear</md-icon>
            </md-menu-item>
            <md-menu-item @click="showAboutEngineDialog=true">
              <span>About Plugin Engine</span>
              <md-icon>info</md-icon>
            </md-menu-item>
          </md-menu-content>
        </md-menu>
        <md-button class="md-icon-button">
          <md-icon>help</md-icon>
          <md-tooltip>Open help information.</md-tooltip>
        </md-button>
      </div>
    </md-app-toolbar>
    <md-app-drawer :md-active.sync="menuVisible" md-persistent="full">
      <!-- <md-app-toolbar class="md-primary md-dense"> -->
      <md-speed-dial class="md-top-left speed-dial" md-event="hover" md-effect="scale" md-direction="bottom">
        <md-speed-dial-target class="md-primary">
          <md-icon>add</md-icon>
        </md-speed-dial-target>
        <md-speed-dial-content>
          <md-button @click="$refs.file_select.openPicker()" class="md-icon-button md-primary">
            <md-icon>insert_drive_file</md-icon>
            <md-tooltip>Open a file</md-tooltip>
          </md-button>
          <md-button @click="$refs.folder_select.openPicker()" class="md-icon-button md-primary">
            <md-icon>folder_open</md-icon>
            <md-tooltip>Open a folder</md-tooltip>
          </md-button>
          <md-button @click="showAddPluginDialog=true" class="md-icon-button md-accent">
            <md-icon>extension</md-icon>
            <md-tooltip>Install or create a new plugin</md-tooltip>
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
            <md-tooltip>Show settings and installed plugins</md-tooltip>
          </md-button>
          <md-button class="md-icon-button md-dense md-raised" @click="menuVisible = !menuVisible">
            <md-icon>keyboard_arrow_left</md-icon>
            <md-tooltip>Hide sidebar</md-tooltip>
          </md-button>
        </div>
      </div>
      <br>
      <md-card>
        <md-card-header>
          <div class="md-layout md-gutter md-alignment-center-space-between">
            <div class="md-layout-item md-size-70">
              <span class="md-subheading">Workflow</span>
            </div>
            <div class="md-layout-item">
              <md-button @click="reloadOps()" class="md-icon-button">
                <md-icon>autorenew</md-icon>
                <md-tooltip>Reload workflow</md-tooltip>
              </md-button>
            </div>
          </div>
        </md-card-header>
        <md-card-content>
          <joy :config="workflow_joy_config" ref="workflow" v-if="plugin_loaded && !updating_workflow"></joy>
          <md-button class="md-button md-primary" v-if="plugin_loaded" @click="runWorkflow(workflow_joy_config.joy)">
            <md-icon>play_arrow</md-icon>Run
            <md-tooltip>run the workflow</md-tooltip>
          </md-button>

          <md-button class="md-button md-primary" v-if="plugin_loaded" @click="saveWorkflow(workflow_joy_config.joy)">
            <md-icon>save</md-icon>Save
            <md-tooltip>save the workflow</md-tooltip>
          </md-button>

          <md-menu>
            <md-button class="md-button md-primary" md-menu-trigger>
              <md-icon>more_horiz</md-icon> Load
              <md-tooltip>load a workflow</md-tooltip>
            </md-button>
            <md-menu-content>
              <md-menu-item @click="loadWorkflow(w)" v-for="w in workflow_list" :key="w.name">
                <span>{{w.name}}</span>
              </md-menu-item>
            </md-menu-content>
          </md-menu>

        </md-card-content>
      </md-card>

      <div v-if="plugin_loaded">
        <md-card>
          <md-card-header>
            <div class="md-layout md-gutter md-alignment-center-space-between">
              <div class="md-layout-item md-size-70">
                <span class="md-subheading">Plugins</span>
              </div>
              <div class="md-layout-item">
                <md-button @click="reloadPlugins()" class="md-icon-button">
                  <md-icon>autorenew</md-icon>
                  <md-tooltip>Reload plugins</md-tooltip>
                </md-button>
              </div>
            </div>
          </md-card-header>
          <md-card-content>
            <div v-for="plugin in this.plugins" :key="plugin.id">
              <md-divider></md-divider>
              <md-button class="md-icon-button" @click="editPlugin(plugin.id)">
                <md-icon v-if="plugin.icon">{{plugin.icon}}</md-icon>
                <md-icon v-else>extension</md-icon>
              </md-button>
              <md-button class="joy-run-button md-primary" @click="plugin.ops && plugin.ops[0] && runOp(plugin.ops[0])">
                {{plugin.name}}
              </md-button>
              <md-button class="md-icon-button" @click="plugin.panel_expanded=!plugin.panel_expanded; $forceUpdate()">
                <md-icon v-if="!plugin.panel_expanded">expand_more</md-icon>
                <md-icon v-else>expand_less</md-icon>
              </md-button>
              <div v-for="op in plugin.ops" :key="op.name + op.type">
                <joy :config="op" :show="plugin.panel_expanded || false"></joy>
                <md-button class="md-button md-primary" v-show="plugin.panel_expanded" @click="runOp(op)">
                  <md-icon>play_arrow</md-icon>Run
                </md-button>
                <!-- <md-button class="md-button md-primary">
                  <md-icon>stop</md-icon>Stop
                </md-button> -->
                <md-divider></md-divider>
              </div>
            </div>

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
  <md-dialog :md-active.sync="showAboutEngineDialog" :md-click-outside-to-close="false">
    <md-dialog-content>
      <h2>About Plugin Engine</h2>
      <p>Plugin Engine is a Python program running locally(or remotely) on your computer in order to utilize the full computation power of your computer.</p>
      <p>With the Plugin Engine running in the background, you can send heavy compuation to the python backend.</p>
      <p>TODO: how to setup the plugin engine?</p>
      <p>For developers, develop plugin which run in the plugin engine is as easy as javascript plugins.</p>
      <p>TODO: how it works?</p>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showAboutEngineDialog=false">OK</md-button>
    </md-dialog-actions>
  </md-dialog>

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

  <md-dialog :md-active.sync="showNewWorkspaceDialog" :md-click-outside-to-close="false">
    <md-dialog-content>
      <md-field>
        <label for="workspace_name">Name</label>
        <md-input type="text" v-model="new_workspace_name" name="workspace_name"></md-input>
      </md-field>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showNewWorkspaceDialog=false;switchWorkspace(new_workspace_name)">OK</md-button>
      <md-button class="md-primary" @click="showNewWorkspaceDialog=false">Cancel</md-button>
    </md-dialog-actions>
  </md-dialog>

  <md-dialog :md-active.sync="showSettingsDialog">
    <md-dialog-content>
      <md-tabs>
      <md-tab id="tab-settings" md-label="General Settings">
        <md-field>
          <label for="engine_url">Plugin Engine URL</label>
          <md-input type="text" v-model="engine_url" name="engine_url"></md-input>
        </md-field>
        <md-button class="md-primary" @click="connectEngine(engine_url)">Connect Plugin Engine</md-button>
        <md-button class="md-primary" @click="disconnectEngine()">Disconnect Plugin Engine</md-button>
        <p>{{engine_status}}</p>
      </md-tab>
      <md-tab id="tab-installed" md-label="Installed Plugins">
        <plugin-list :plugins="installed_plugins" :workspace="selected_workspace" title="Installed Plugins"></plugin-list>
      </md-tab>
      <md-tab id="tab-plugin-store" md-label="Plugin Store" >
        <plugin-list config-url="static/plugins/manifest.json" :workspace="selected_workspace"  title="Available Plugins"></plugin-list>
      </md-tab>
    </md-tabs>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showSettingsDialog=false">OK</md-button>
    </md-dialog-actions>
  </md-dialog>
  <md-dialog :md-active.sync="showAddPluginDialog">
    <md-dialog-content>
      <md-subheader>Create a New Plugin</md-subheader>
      <md-button class="md-primary md-raised" @click="addPlugin();showAddPluginDialog=false">Create</md-button>
      <plugin-list config-url="static/plugins/manifest.json" :workspace="selected_workspace" title="Or, install from the Plugin Store"></plugin-list>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showAddPluginDialog=false">OK</md-button>
    </md-dialog-actions>
  </md-dialog>
</div>
</template>

<script>
import axios from 'axios';
import {
  REGISTER_SCHEMA,
  WINDOW_SCHEMA,
  OP_SCHEMA,
  PLUGIN_SCHEMA,
  PLUGIN_TEMPLATE
} from '../api.js'

import {
  _clone,
  randId
} from '../utils.js'
import {
  parseComponent
} from '../pluginParser.js'

import io from 'socket.io-client'

import _ from 'lodash'

import {
  Joy
} from '../joy'

export default {
  name: 'imjoy',
  props: ['title'],
  data() {
    return {
      file_select: null,
      folder_select: null,
      selected_file: null,
      selected_files: null,
      showPluginDialog: false,
      showSettingsDialog: false,
      showAddPluginDialog: false,
      showAboutEngineDialog: false,
      plugin_dialog_config: null,
      _plugin_dialog_promise: {},
      loading: false,
      progress: 0,
      status_text: '',
      engine_status: 'disconnected',
      engine_connected: false,
      engine_url: 'http://localhost:8080',
      windows: [],
      active_windows: [],
      selected_workspace: null,
      workspace_list: [],
      workflow_list: [],
      showNewWorkspaceDialog: false,
      new_workspace_name: 'default',
      preload_main: ['/static/tfjs/tfjs.js', 'https://rawgit.com/nicolaspanel/numjs/893016ec40e62eaaa126e1024dbe250aafb3014b/dist/numjs.min.js'],
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
        windows: {},
        extensions: {}
      },
      updating_workflow: false,
      installed_plugins: [],
      plugin_api: null,
      plugin_context: null,
      plugin_loaded: false,
      menuVisible: true,
      snackbar_info: '',
      snackbar_duration: 3000,
      show_snackbar: false,
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
      this.loadFiles()
    });
    this.importScripts.apply(null, this.preload_main).then(() => {
      console.log('preload done.')
    })
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
    // for(let u in this.builtin_scripts_url){
    //   if(this.builtin_scripts_url.hasOwnProperty(u)){
    //     axios.get(this.builtin_scripts_url[u]).then(response => {
    //       if (!response || !response.data || response.data == '') {
    //         alert('failed to get plugin code from ' + plugin.url)
    //         return
    //       }
    //       this.builtin_scripts[u] = response.data
    //       console.log('downloaded script: ', u)
    //     })
    //   }
    // }

    this.plugin_api = {
      alert: alert,
      register: this.register,
      createWindow: this.createWindow,
      showDialog: this.showDialog,
      showProgress: this.showProgress,
      showStatus: this.showStatus,
      run: this.runPlugin,
    }
    this.pluing_context = {}
    this.plugin_loaded = false
    this.loading = true
    this.config_db = new PouchDB('imjoy_config', {
      revs_limit: 2,
      auto_compaction: true
    })
    let default_ws = null
    console.log('loading workspace: ', this.$route.query.w)
    this.config_db.get('workspace_list').then((doc) => {
      this.workspace_list = doc.list
      default_ws = doc.default
    }).catch((err) => {
      console.error(err)
      this.config_db.put({
        _id: 'workspace_list',
        list: ['default'],
        default: 'default'
      })
      this.workspace_list = ['default']
      default_ws = 'default'
    }).then(() => {
      this.selected_workspace = this.$route.query.w || default_ws
      if (!this.workspace_list.includes(this.selected_workspace) || this.selected_workspace != default_ws) {
        if (!this.workspace_list.includes(this.selected_workspace)) {
          this.workspace_list.push(this.selected_workspace)
        }
        this.config_db.get('workspace_list').then((doc) => {
          this.config_db.put({
            _id: doc._id,
            _rev: doc._rev,
            list: this.workspace_list,
            default: 'default'
          })
        })
      }
      if (this.selected_workspace != 'default') {
        this.$router.replace({
          query: {
            w: this.selected_workspace
          }
        })
      }
      this.db = new PouchDB(this.selected_workspace + '_workspace', {
        revs_limit: 2,
        auto_compaction: true
      })
    }).then(() => {
      this.reloadPlugins()
    });

  },
  beforeDestroy() {
    console.log('terminating plugins')
    for (let k in this.plugins) {
      if (this.plugins.hasOwnProperty(k)) {
        const plugin = this.plugins[k]
        try {
          if (typeof plugin.terminate == 'function') plugin.terminate()
        } catch (e) {

        }
      }
    }
    this.plugins = null
    this.disconnectEngine()
  },
  methods: {
    registerExtension(exts, plugin) {
      for (let i = 0; i < exts.length; i++) {
        exts[i] = exts[i].replace('.', '')
        if (this.registered.extensions[exts[i]]) {
          this.registered.extensions[exts[i]].push(plugin)
        } else {
          this.registered.extensions[exts[i]] = [plugin]
        }
      }
    },
    switchWorkspace(w) {
      console.log('switch to ', w)
      let q = {
        w: w
      }
      if (w == 'default') {
        q = null
      }
      this.$router.push({
        name: ':)',
        query: q
      })
      this.$router.go()
    },
    show(info, duration) {
      this.snackbar_info = info
      this.snackbar_duration = duration || 3000
      this.show_snackbar = true
    },
    connectEngine(url) {
      if (this.socket) {
        this.socket.disconnect()
      }
      this.engine_status = 'Connecting, please wait...'
      const socket = io(url);
      const timer = setTimeout(() => {
        if (socket) {
          this.engine_status = 'Error: connection timeout, please make sure you have started the plugin engine.'
          this.show('Error: connection timeout, please make sure you have started the plugin engine.', 5000)
          socket.disconnect()
        }
      }, 3000)
      socket.on('connect', (d) => {
        console.log('plugin engine connected.')
        clearTimeout(timer)
        this.socket = socket
        this.engine_connected = true
        this.engine_status = 'Plugin Engine connected.'
        this.show('Plugin Engine connected.')
        this.store.event_bus.$emit('engine_connected', d)
      })
      socket.on('disconnect', () => {
        console.log('plugin engine disconnected.')
        this.engine_connected = false
        this.show('Plugin Engine disconnected.')
        this.engine_status = 'Plugin Engine disconnected.'
        this.socket = null
        // this.pluing_context.socket = null
      });
      this.socket = socket
      this.pluing_context.socket = socket
    },
    disconnectEngine() {
      if (this.socket) {
        this.socket.disconnect()
      }
    },
    importScript(url) {
      //url is URL of external file, implementationCode is the code
      //to be called from the file, location is the location to
      //insert the <script> element
      return new Promise((resolve, reject) => {
        var scriptTag = document.createElement('script');
        scriptTag.src = url;
        scriptTag.onload = resolve;
        scriptTag.onreadystatechange = resolve;
        scriptTag.onerror = reject;
        document.head.appendChild(scriptTag);
      })
    },
    async importScripts() {
      var args = Array.prototype.slice.call(arguments),
        len = args.length,
        i = 0;
      for (; i < len; i++) {
        await this.importScript(args[i])
      }
    },
    editPlugin(pid) {
      const plugin = this.plugins[pid]
      const template = plugin.template
      const w = {
        name: template.name,
        type: 'imjoy/plugin-editor',
        config: {},
        plugin: plugin,
        reload: this.reloadPlugin,
        save: this.savePlugin,
        data: {
          name: template.name,
          id: plugin.id,
          code: template.code
        }
      }
      this.addWindow(w)
    },
    addPlugin() {
      const w = {
        name: 'New Plugin',
        type: 'imjoy/plugin-editor',
        config: {},
        reload: this.reloadPlugin,
        save: this.savePlugin,
        data: {
          name: 'new plugin',
          id: 'plugin_' + randId(),
          code: JSON.parse(JSON.stringify(PLUGIN_TEMPLATE))
        }
      }
      this.addWindow(w)
    },
    reloadPlugin(pconfig) {
      return new Promise((resolve, reject) => {
        if (pconfig.plugin && pconfig.plugin.id)
          delete this.plugins[pconfig.plugin.id]
        if (pconfig.plugin && pconfig.plugin.type)
          Joy.remove(pconfig.plugin.type)
        if (pconfig.plugin && pconfig.plugin.terminate) {
          try {
            console.log('terminating plugin ', pconfig.plugin)
            pconfig.plugin.terminate()
            console.log('terminated.')
          } finally {
            delete pconfig.plugin
          }
        }
        pconfig.plugin = null
        console.log('reloading plugin ', pconfig)
        const template = this.parsePluginCode(pconfig.code, pconfig)
        let p
        if (template.mode == 'iframe' && template.tags.includes('window')) {
          p = this.preLoadPlugin(template)
        } else {
          p = this.loadPlugin(template)
        }
        p.then((plugin) => {
          resolve(plugin)
          console.log('new plugin loaded', plugin)
          pconfig.plugin = plugin
          if (this.$refs.workflow) this.$refs.workflow.setupJoy()
        }).catch((e) => {
          pconfig.plugin = null
          reject(e)
        })
        // this.$forceUpdate()
      })
    },
    savePlugin(pconfig) {
      //console.log('saving plugin ', pconfig)
      const code = pconfig.code
      const template = this.parsePluginCode(code, {})
      template.code = code
      template._id = template.name
      const addPlugin = () => {
        this.db.put(template, {
          force: true
        }).then((result) => {
          console.log('Successfully installed!');
          this.api.show(template.name + ' has been sucessfully saved.')
        }).catch((err) => {
          this.api.show('failed to save the plugin.')
          console.error(err)
        })
      }
      // remove if exists
      this.db.get(template.name).then((doc) => {
        return this.db.remove(doc);
      }).then((result) => {
        addPlugin()
      }).catch((err) => {
        addPlugin()
      });
    },
    reloadOps() {
      if (this.$refs.workflow) this.$refs.workflow.setupJoy()
    },
    reloadPlugins() {
      if (this.plugins) {
        for (let k in this.plugins) {
          if (this.plugins.hasOwnProperty(k)) {
            const plugin = this.plugins[k]
            if (typeof plugin.terminate == 'function') {
              try {
                plugin.terminate()
              } catch (e) {
                console.error(e)
              } finally {
                this.plugins[k] = null
              }
            }
          }
        }
      }
      this.plugins = {}
      this.db.allDocs({
        include_docs: true,
        attachments: true,
        sort: 'name'
      }).then((result) => {
        const promises = []
        this.plugins = {}
        this.installed_plugins = []
        for (let i = 0; i < result.total_rows; i++) {
          const config = result.rows[i].doc
          if (config.workflow) {
            this.workflow_list.push(config)
          } else {
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
    closeAll() {
      this.windows = []
      this.default_window_pos = {
        i: 0,
        x: 0,
        y: 0,
        w: 5,
        h: 5
      }
    },
    showProgress(p) {
      if (p < 1) this.progress = p * 100
      else this.progress = p
      // this.$forceUpdate()
    },
    showStatus(s) {
      this.status_text = s
      // this.$forceUpdate()
    },
    addWindow(w) {
      this.generateGridPosition(w)
      this.windows.push(w)
      this.store.event_bus.$emit('add_window', w)
    },
    closePluginDialog(ok) {
      this.showPluginDialog = false
      let [resolve, reject] = this._plugin_dialog_promise
      if (ok) {
        resolve(this.$refs.plugin_dialog_joy.joy.get_config())
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
      this.active_windows = ws
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
      this.default_window_pos.i = this.default_window_pos.i + 1
    },
    loadFiles() {
      for (let f = 0; f < this.selected_files.length; f++) {
        const file = this.selected_files[f]
        const tmp = file.name.split('.')
        const ext = tmp[tmp.length - 1]
        if (this.registered.extensions[ext]) {
          const plugins = this.registered.extensions[ext]
          file.loaders = {}
          for (let i = 0; i < plugins.length; i++) {
            console.log('trying to open the file with ', plugins[i].name, plugins[i])
            file.loaders[plugins[i].name] = async () => {
              let config = {}
              if (plugins[i].template && plugins[i].template.ui) {
                config = await this.showDialog(plugins[i].template)
              }
              plugins[i].api.run({
                op: {},
                config: config,
                data: {
                  file: file
                }
              }).then((my) => {
                if (my) {
                  console.log('result', my)
                  my.name = my.name || 'result'
                  my.type = my.type || 'imjoy/generic'
                  this.addWindow(my)
                }
              })
            }
          }
        }
      }
      const w = {
        name: 'Files',
        type: 'imjoy/files',
        config: {},
        data: {
          files: this.selected_files
        }
      }
      this.addWindow(w)
    },
    runWorkflow(joy) {
      console.log('run workflow.', this.active_windows)
      const w = this.active_windows[this.active_windows.length - 1] || {}
      joy.workflow.execute(w.data || {}).then((my) => {
        if (my.target) {
          console.log('result', my)
          my.name = 'result'
          my.type = 'imjoy/generic'
          my.config = my.data
          my.data = my.target
          this.createWindow(my)
        }
        this.progress = 100
        this.status_text = ''
      }).catch((e) => {
        console.error(e)
        this.status_text = e.toString() || "Error."
      })
    },
    saveWorkflow(joy) {
      // remove if exists
      const name = prompt("Please enter a name for the workflow", "default");
      if (name == null) {
        return
      }
      const data = _.cloneDeep(joy.top.data)
      data.name = name
      data._id = name + '_workflow'
      delete data._references
      console.log('saving workflow: ', data)
      this.db.put(data, {
        force: true
      }).then((result) => {
        console.log('Successfully saved!');
        this.workflow_list.push(data)
        this.api.show(name + ' has been sucessfully saved.')
      }).catch((err) => {
        this.api.show('failed to save the workflow.')
        console.error(err)
        alert('error occured: ' + err.toString())
      })
    },
    loadWorkflow(w) {
      this.updating_workflow = false
      this.$forceUpdate()
      this.workflow_joy_config.data = w.workflow
      setTimeout(() => {
        this.updating_workflow = true
        console.log(this.workflow_joy_config)
        this.$forceUpdate()
      }, 500);
      console.log(w)

    },
    runOp(op) {
      console.log('run op.', this.active_windows)
      const w = this.active_windows[this.active_windows.length - 1] || {}
      op.joy._panel.execute(w.data || {}).then((my) => {
        if (my.target) {
          console.log('result', my)
          my.name = 'result'
          my.type = 'imjoy/generic'
          my.config = my.data
          my.data = my.target
          this.createWindow(my)
        }
        this.progress = 100
        this.status_text = ''
      }).catch((e) => {
        console.error(e)
        this.status_text = op.name + '->' + (e.toString() || "Error.")
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
      if (url && url.endsWith('.js')) {
        config.lang = config.lang || 'javascript'
        config.script = code
        config.style = null
        config.window = null
      } else {
        console.log('parsing the plugin file')
        const pluginComp = parseComponent(code)
        console.log('code parsed from', pluginComp)
        let c = null
        for (let i = 0; i < pluginComp.customBlocks.length; i++) {
          if (pluginComp.customBlocks[i].type == 'config') {
            // find the first config block
            config = JSON.parse(pluginComp.customBlocks[i].content)
            console.log('loading config from .html file', config)
            break
          }
        }

        config.script = pluginComp.script.content
        config.lang = pluginComp.script.attrs.lang || 'javascript'
        for (let i = 0; i < pluginComp.customBlocks.length; i++) {
          if (pluginComp.customBlocks[i].type == 'window') {
            // find the first html block
            config.window = pluginComp.customBlocks[i].content
            break
            //show the iframe if there is html defined
            // config.iframe_container = 'plugin_window_' + config.id + randId()
            // config.iframe_window = null
            // config.type = 'main'
            // this.showPluginWindow(config)
          }
        }
        config.window = config.window || null
        if (pluginComp.styles.length > 0) {
          // here we only take the first stylesheet we found
          config.style = pluginComp.styles[0].content
        } else {
          config.style = null
        }
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
        ui: template.ui,
        inputs: template.inputs,
        outputs: template.outputs
      }
      //generate a random id for the plugin
      return new Promise((resolve, reject) => {
        config.id = template.name.trim().replace(/ /g, '_') + '_' + randId()
        const plugin = {
          id: config.id,
          name: config.name,
          type: config.type,
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
        resolve(plugin)
      })
    },
    loadPlugin(template) {
      template = _clone(template)
      //generate a random id for the plugin
      return new Promise((resolve, reject) => {
        const config = {}
        config.id = template.name.trim().replace(/ /g, '_') + '_' + randId()
        config.context = this.pluing_context
        if (template.mode == 'pyworker') {
          if (!this.socket) {
            console.error("plugin engine is not connected.")
          }
        }
        const plugin = new jailed.DynamicPlugin(template, config, this.plugin_api)
        plugin.whenConnected(() => {
          if (!plugin.api) {
            console.error('error occured when loading plugin.')
            throw 'error occured when loading plugin.'
          }
          this.plugins[plugin.id] = plugin
          if (template.type) {
            this.register(template, {
              id: plugin.id
            })
          }
          if (template.extensions && template.extensions.length > 0) {
            this.registerExtension(template.extensions, plugin)
          }
          plugin.api.setup().then((result) => {
            console.log('sucessfully setup plugin: ', plugin)
            resolve(plugin)
          }).catch((e) => {
            console.error('error occured when loading plugin ' + template.name + ": ", e)
            reject(e)
            plugin.terminate()
          })
        });
        plugin.whenFailed((e) => {
          console.error('error occured when loading ' + template.name + ":", e)
          alert('error occured when loading ' + template.name)
          plugin.terminate()
          // reject(e)
        });
      })
    },
    async runPlugin(plugin_type, my, _plugin) {
      const target_plugin = this.plugins[plugin_type]
      //conver the api here data-->config   target--> data
      return await target_plugin.api.run(my)
    },
    register(config, _plugin) {
      try {
        const plugin = this.plugins[_plugin.id]
        config.mode = config.mode || 'webworker'
        config.show_panel = config.show_panel || false
        console.log('registering op', config)
        if (!REGISTER_SCHEMA(config)) {
          const error = REGISTER_SCHEMA.errors(config)
          console.error("Error occured during registering " + config.name, error)
          throw error
        }
        // if (this.registered.ops[config.type]) {
        //   console.log('plugin already registered')
        //   return
        // }
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
          joy_template.init = joy_template.ui || joy_template.name
          // joy_template.ui = null
          Joy.add(joy_template);
          //update the joy workflow if new template added, TODO: preserve settings during reload
          if (this.$refs.workflow) this.$refs.workflow.setupJoy()
          plugin.type = config.type
          console.log('register op plugin: ', plugin.template)
          this.registered.ops[config.type] = plugin.template
          const op_config = {
            name: config.name,
            id: _plugin.id,
            ui: "{id: '_panel', type: '" + config.type + "'}",
            onexecute: config.onexecute
          }
          plugin.ops = plugin.ops || []
          plugin.ops.push(op_config)

          console.log('creating panel: ', op_config)
          this.$forceUpdate()
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
        // this.plugins[plugin.id] = plugin
        plugin.api.setup().then((result) => {
          console.log('sucessfully setup the window plugin: ', plugin, pconfig)
          plugin.api.run({
            data: pconfig.data,
            config: pconfig.config,
            op: pconfig.op,
          }).catch((e) => {
            this.status_text = plugin.name + '->' + e
            console.error('error in the run function of plugin ' + plugin.name, e)
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
        if (!WINDOW_SCHEMA(wconfig)) {
          const error = WINDOW_SCHEMA.errors(wconfig)
          console.error("Error occured during creating window " + wconfig.name, error)
          throw error
        }
        console.log('window config', wconfig)
        if (wconfig.type.startsWith('imjoy')) {
          // console.log('creating imjoy window', wconfig)
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
          console.log('changing id...')
          pconfig.iframe_window = null
          pconfig.plugin = window_config
          pconfig.context = this.pluing_context
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
        // const plugin = this.plugins[_plugin.id]
        // if (config.onupdate && typeof config.onupdate == 'object') {
        //   for (let k in config.onupdate) {
        //     if (config.onupdate.hasOwnProperty(k)) {
        //       // replace the string to a real function
        //       const onupdate = plugin.api[config.onupdate[k]]
        //       config.onupdate[k] = onupdate
        //     }
        //   }
        // }
        //TODO: verify fields with WINDOW_TEMPLATE
        // console.log('creating dialog: ', config, plugin)

        // if (config.show_panel && plugin.op_config) {
        // create panel for the window
        // console.log('creating panel: ', plugin.op_config)
        // config.panel = plugin_config
        // }

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
  text-transform: none;
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

.imjoy {
  height: 100%;
}

.md-dialog {
  width: 80%;
}

@media screen and (max-width: 700px) {
  .md-dialog {
    width: 100%;
  }
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

.error-message {
  color: red;
  user-select: text;
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
  top: 8px !important;
  left: 15px !important;
}

.md-speed-dial-content {
  left: 40px !important;
  top: -20px !important;
  display: flex;
  flex-direction: row;
}

.site-button {
  left: 80px;
}

.fullscreen {
  max-width: 100%;
  width: 100%;
  height: 100%;
  max-height: 100%;
}
</style>
