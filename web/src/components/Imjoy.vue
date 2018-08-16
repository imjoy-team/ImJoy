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
        <md-menu>
          <md-button class="md-button" md-menu-trigger>
            <span class="subheader-title md-small-hide" style="flex: 1">Image Processing with </span><span class="subheader-emoji">😂</span>
            <md-tooltip>Switch workspace</md-tooltip>
          </md-button>
          <md-menu-content>
            <md-menu-item @click="switchWorkspace(w)" v-for="w in workspace_list" :key="w.name">
              <span>{{w}}</span><md-icon>forward</md-icon>
            </md-menu-item>
            <md-menu-item @click="showNewWorkspaceDialog=true">
              <md-icon>add</md-icon>New Workspace
            </md-menu-item>
          </md-menu-content>
        </md-menu>
        <md-button v-if="status_text&&status_text.length"class="status-text md-small-hide" @click="showAlert(status_text)" :class="status_text.includes('rror')?'error-message':''">
          {{status_text.slice(0,60)+(status_text.length>60?'...':'')}}
        </md-button>
      </div>

      <div class="md-toolbar-section-end">
        <md-snackbar :md-position="'center'" class="md-accent" :md-active.sync="show_snackbar" :md-duration="snackbar_duration">
         <span>{{snackbar_info}}</span>
         <md-button class="md-accent" @click="show_snackbar=false">close</md-button>
        </md-snackbar>
        <md-button @click="closeAll" class="md-icon-button">
          <md-icon>cancel</md-icon>
          <md-tooltip>Close all windows</md-tooltip>
        </md-button>
        <md-button :disabled="true" class="md-icon-button">
          <md-icon>save</md-icon>
          <md-tooltip>Save all windows</md-tooltip>
        </md-button>
        <md-button class="md-icon-button" target="_blank" href="https://github.com/oeway/ImJoy">
          <md-icon>help</md-icon>
          <md-tooltip>Open help information.</md-tooltip>
        </md-button>
        <md-button v-if="!engine_connected" @click="connectEngine(engine_url)" class="md-icon-button md-accent">
          <md-icon>🚀</md-icon>
          <md-tooltip>Connect to the Plugin Engine</md-tooltip>
        </md-button>
        <md-menu v-else md-size="big" md-direction="bottom-end">
          <md-button class="md-icon-button" :class="engine_connected?'md-primary':'md-accent'" md-menu-trigger>
            <md-icon>{{engine_connected?'sync':'sync_disabled'}}</md-icon>
            <md-tooltip>Connection to the Plugin Engine</md-tooltip>
          </md-button>
          <md-menu-content>
            <md-menu-item :disabled="true">
              <span>🚀{{engine_status}}</span>
            </md-menu-item>
            <!-- <md-menu-item @click="connectEngine(engine_url)">
              <span>Connect</span>
              <md-icon>settings_ethernet</md-icon>
            </md-menu-item> -->
            <md-menu-item @click="disconnectEngine()">
              <span>Disconnect</span>
              <md-icon>clear</md-icon>
            </md-menu-item>
            <md-menu-item @click="showPluginEngineInfo=true">
              <span>About Plugin Engine</span>
              <md-icon>info</md-icon>
            </md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
    </md-app-toolbar>
    <md-app-drawer :md-active.sync="menuVisible" md-persistent="full">
      <!-- <md-app-toolbar class="md-primary md-dense"> -->
      <md-speed-dial class="md-top-left speed-dial" md-event="hover" md-effect="scale" md-direction="bottom">
        <md-speed-dial-target class="md-primary">
          <md-icon>add</md-icon>
        </md-speed-dial-target>
        <md-speed-dial-content>
          <md-button @click="$refs.file_form.reset();$refs.file_select.click()" class="md-icon-button md-primary">
            <md-icon>insert_drive_file</md-icon>
            <md-tooltip>Open a file</md-tooltip>
          </md-button>
          <md-button @click="$refs.folder_form.reset();$refs.folder_select.click()" class="md-icon-button md-primary">
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
          <!-- <md-field v-show="false">
            <md-file v-show="false" v-model="folder_select" ref="file_select" @md-change="selectFileChanged" />
          </md-field>
          <md-field v-show="false">
            <md-file v-model="file_select" ref="folder_select" @md-change="selectFileChanged" webkitdirectory mozdirectory msdirectory odirectory directory multiple/>
          </md-field> -->
          <form v-show="false" ref="folder_form">
            <input class="md-file" type="file" @change="selectFileChanged" ref="folder_select" webkitdirectory mozdirectory msdirectory odirectory directory multiple></input>
          </form>
          <form v-show="false" ref="file_form">
            <input class="md-file" type="file" @change="selectFileChanged" ref="file_select" multiple></input>
          </form>
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
              <md-button @click="clearWorkflow()" class="md-icon-button">
                <md-icon>clear</md-icon>
                <md-tooltip>Clear workflow</md-tooltip>
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

          <md-menu md-size="big">
            <md-button class="md-button md-primary" :disabled="workflow_list.length==0" md-menu-trigger>
              <md-icon>more_horiz</md-icon> Load
              <md-tooltip>load a workflow</md-tooltip>
            </md-button>
            <md-menu-content>
              <md-menu-item @click="loadWorkflow(w)" v-for="w in workflow_list" :key="w.name">
                <span>{{w.name}}</span> <md-button @click.stop="removeWorkflow(w)" class="md-icon-button md-accent">
                  <md-icon>clear</md-icon>
                </md-button>
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
            <div v-for="plugin in sortedPlugins()" :key="plugin.name">
              <md-divider></md-divider>
              <md-menu md-size="medium">
                <md-button class="md-icon-button" :class="plugin.running?'md-accent':''" md-menu-trigger>
                  <md-icon v-if="plugin.config.icon">{{plugin.config.icon}}</md-icon>
                  <md-icon v-else>extension</md-icon>
                  <md-tooltip>show more options for the plugin</md-tooltip>
                </md-button>
                <md-menu-content>
                  <md-menu-item @click="editPlugin(plugin.id)">
                    <md-icon>edit</md-icon>Edit
                  </md-menu-item>
                  <md-menu-item @click="reloadPlugin({name: plugin.name, plugin:plugin})">
                    <md-icon>autorenew</md-icon>Reload
                  </md-menu-item>
                  <md-menu-item @click="plugin.terminate()">
                    <md-icon>clear</md-icon>Terminate
                  </md-menu-item>
                  <md-menu-item @click="showRemoveConfirmation=true">
                    <md-icon>delete_forever</md-icon>Remove
                  </md-menu-item>
                </md-menu-content>
              </md-menu>

              <md-button class="joy-run-button" :class="plugin.running?'md-accent':'md-primary'" :disabled="plugin._disconnected" @click="runOp(plugin.ops[plugin.name])">
                {{plugin.name}}
              </md-button>
              <md-button class="md-icon-button" @click="plugin.panel_expanded=!plugin.panel_expanded; $forceUpdate()">
                <md-icon v-if="!plugin.panel_expanded">expand_more</md-icon>
                <md-icon v-else>expand_less</md-icon>
              </md-button>
              <md-progress-bar md-mode="determinate" v-if="plugin.running&&plugin.progress" :md-value="plugin.progress"></md-progress-bar>
              <p v-if="plugin.running&&plugin.status_text">{{plugin.status_text}}</p>
              <div v-for="(op, n) in plugin.ops" :key="op.id + op.name">
                <md-button class="md-icon-button" v-show="plugin.panel_expanded && op.name != plugin.name" :disabled="true">
                  <md-icon>remove</md-icon>
                </md-button>
                <md-button class="joy-run-button md-primary" :disabled="plugin._disconnected" v-show="plugin.panel_expanded && op.name != plugin.name" @click="runOp(op)">
                    {{op.name}}
                </md-button>

                <md-button class="md-icon-button" v-show="plugin.panel_expanded &&  op.name != plugin.name" @click="op.panel_expanded=!op.panel_expanded; $forceUpdate()">
                  <md-icon v-if="!op.panel_expanded">expand_more</md-icon>
                  <md-icon v-else>expand_less</md-icon>
                </md-button>

                <joy :config="op" :show="(plugin.panel_expanded || false) && (((plugin.panel_expanded || false)  && op.name == plugin.name) || op.panel_expanded || false )"></joy>
                <md-divider></md-divider>
              </div>
            </div>

          </md-card-content>
        </md-card>
      </div>

    </md-app-drawer>
    <md-app-content class="whiteboard-content">
      <md-progress-bar md-mode="determinate" :md-value="progress"></md-progress-bar>
      <whiteboard :windows="windows" :loaders="registered&&registered.loaders" @select="windowSelected"></whiteboard>
    </md-app-content>
  </md-app>

  <md-dialog-confirm :md-active.sync="showRemoveConfirmation" md-title="Removing Plugin" md-content="Do you really want to <strong>delete</strong> this plugin" md-confirm-text="Yes" md-cancel-text="Cancel" @md-cancel="showRemoveConfirmation=false" @md-confirm="removePlugin(_plugin2_remove);showRemoveConfirmation=false"/>
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

  <md-dialog-prompt
        :md-active.sync="showTokenPrompt"
        v-model="connection_token"
        md-title="What is the connection token?"
        md-input-maxlength="36"
        :md-click-outside-to-close="false"
        md-input-placeholder="Please go to the plugin engine terminal to get the token."
        md-confirm-text="Connect"
        @md-confirm="connectEngine(engine_url)"/>

  <md-dialog-confirm
        :md-active.sync="showPluginEngineInfo"
        md-title="Using the Python Plugin Engine"
        :md-click-outside-to-close="false"
        md-content='Python plugins are supported by ImJoy with the Python Plugin Engine. <br><br>
        If it was already installed, run <strong>python -m imjoy</strong> in a terminal.<br><br>
        If not, you need to do the following:<br>
        &nbsp;&nbsp;* Install <a href="https://www.anaconda.com/download/" target="_blank">Anaconda</a> or <a href="https://conda.io/miniconda.html" target="_blank">Miniconda</a> (Python3.6 version is preferred) <br>
        &nbsp;&nbsp;* Open a `Terminal`(mac/linux) or `Anaconda Prompt`(windows), then run the following command:<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>conda install -y git pip && pip install -U git+https://github.com/oeway/ImJoy-Python#egg=imjoy</strong><br>
        &nbsp;&nbsp;* Run <strong>python -m imjoy</strong> in the terminal to start the engine.<br><br>
        Once the plugin engine is ready, click <strong>CONNECT</strong><br>
        If you failed to set it up, please consult <a href="https://github.com/oeway/ImJoy-Python" target="_blank">here</a><br>'
        md-confirm-text="Connect"
        md-cancel-text="Cancel"
        @md-confirm="connectEngine(engine_url)" />

  <md-dialog :md-active.sync="showSettingsDialog" :md-click-outside-to-close="false">
    <md-dialog-content>
      <md-divider></md-divider>
      <md-card>
        <md-card-header>
          <div class="md-title">General Settings</div>
        </md-card-header>
        <md-card-content>
          <md-field>
            <label for="engine_url">Plugin Engine URL</label>
            <md-input type="text" v-model="engine_url" name="engine_url"></md-input>
          </md-field>
          <md-button class="md-primary" @click="connectEngine(engine_url)">Connect Plugin Engine</md-button>
          <md-button class="md-primary" @click="disconnectEngine()">Disconnect Plugin Engine</md-button>
          <p>{{engine_status}}</p>
        </md-card-content>
      </md-card>

      <md-divider></md-divider>
      <md-card>
        <md-card-header>
          <div class="md-title">Installed Plugins</div>
        </md-card-header>
        <md-card-content>
          <plugin-list display="list" :plugins="installed_plugins" :workspace="selected_workspace"></plugin-list>
        </md-card-content>
      </md-card>
      <md-divider></md-divider>
      <md-card>
        <md-card-header>
          <div class="md-title">Plugin Store</div>
        </md-card-header>
        <md-card-content>
        <plugin-list show-url display="list" config-url="https://raw.githubusercontent.com/oeway/ImJoy-Plugins/master/manifest.json" :workspace="selected_workspace"></plugin-list>
    </md-card-content>
    </md-card>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showSettingsDialog=false; reloadPlugins()">OK</md-button>
    </md-dialog-actions>
  </md-dialog>
  <md-dialog :md-active.sync="showAddPluginDialog" :md-click-outside-to-close="false">
    <md-dialog-content>
      <md-subheader>Create a New Plugin</md-subheader>
      <md-button class="md-primary md-raised centered-button" @click="newPlugin(template);showAddPluginDialog=false" v-for="(template, k) in plugin_templates" :key="k">
        <md-icon>add</md-icon>{{k}}
      </md-button>
      <plugin-list show-url display="list" config-url="https://raw.githubusercontent.com/oeway/ImJoy-Plugins/master/manifest.json" :workspace="selected_workspace" title="Or, install from the Plugin Store"></plugin-list>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showAddPluginDialog=false; reloadPlugins()">OK</md-button>
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
  PYWORKER_PLUGIN_TEMPLATE,
  WEBWORKER_PLUGIN_TEMPLATE,
  IFRAME_PLUGIN_TEMPLATE
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

import schema from 'js-schema'

export default {
  name: 'imjoy',
  props: ['title'],
  data() {
    return {
      client_id: null,
      file_select: null,
      folder_select: null,
      selected_file: null,
      selected_files: null,
      showPluginDialog: false,
      showSettingsDialog: false,
      showAddPluginDialog: false,
      showRemoveConfirmation: false,
      plugin_dialog_config: null,
      _plugin_dialog_promise: {},
      _plugin2_remove: null,
      loading: false,
      progress: 0,
      status_text: '',
      engine_status: 'Disconnected',
      engine_connected: false,
      engine_url: 'http://localhost:8080',
      windows: [],
      active_windows: [],
      selected_workspace: null,
      connection_token: null,
      showTokenPrompt: false,
      showPluginEngineInfo: false,
      workspace_list: [],
      workflow_list: [],
      resumable_plugins: [],
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
      plugin_names: null,
      registered: null,
      plugin_templates: {
        "Webworker(Javascript)": WEBWORKER_PLUGIN_TEMPLATE,
        "Iframe(Javascript and HTML)": IFRAME_PLUGIN_TEMPLATE,
        "PyWorker(Python)": PYWORKER_PLUGIN_TEMPLATE,
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
      const filelist = []
      let folder_supported = false
      // https://gist.github.com/tiff/3076863
       const traverseFileTree = (item, path, getDataLoaders) => {
         path = path || "";
         if (item.isFile) {
           // Get file
           item.file((file)=>{
             file.relativePath = path + file.name
             file.loaders = getDataLoaders(file)
             filelist.push(file);
           });
         } else if (item.isDirectory) {
           // Get folder contents
           var dirReader = item.createReader();
           dirReader.readEntries((entries)=>{
             for (var i = 0; i < entries.length; i++) {
               traverseFileTree(entries[i], path + item.name + "/", getDataLoaders);
             }
           });
         }
      };
      var length = e.dataTransfer.items.length;
      for (var i = 0; i < length; i++) {
        if(e.dataTransfer.items[i].webkitGetAsEntry){
          folder_supported = true
          var entry = e.dataTransfer.items[i].webkitGetAsEntry();
          traverseFileTree(entry, null, this.getDataLoaders)
        }
      }
      if(!folder_supported){
        this.selected_files = e.dataTransfer.files;
      }
      else{
        this.selected_files = filelist
      }
      console.log('files loaded: ', this.selected_files)
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

    // Make sure the GUI is refreshed
    setInterval(()=>{this.$forceUpdate()}, 5000)

    this.client_id = localStorage.getItem("imjoy_client_id")
    if(!this.client_id){
      this.client_id = 'imjoy_web_'+randId()
      localStorage.setItem("imjoy_client_id", this.client_id);
    }
    this.connection_token = localStorage.getItem("imjoy_connection_token")
    this.plugin_api = {
      alert: this.showAlert,
      register: this.register,
      createWindow: this.createWindow,
      showDialog: this.showDialog,
      showProgress: this.showProgress,
      showStatus: this.showStatus,
      run: this.runPlugin,
      showPluginProgress: this.showPluginProgress,
      showPluginStatus: this.showPluginStatus,
      $forceUpdate: this.$forceUpdate,
    }
    this.resetPlugins()
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

      this.connectEngine(this.engine_url, true)

    }).then(() => {
      this.reloadPlugins()
    });


    this.api.show = this.show;

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
    this.plugin_names = null
    this.disconnectEngine()
  },
  methods: {
    removePlugin(p){
      console.log('remove plugin', p)
    },
    sortedPlugins: function() {
        return _.orderBy(this.plugins, 'name');
    },
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
        name: 'app',
        query: q
      })
      this.$router.go()
    },
    show(info, duration) {
      this.snackbar_info = info
      this.snackbar_duration = duration || 3000
      this.show_snackbar = true
    },
    connectEngine(url, auto) {
      if (this.socket&&this.engine_connected) {
        return
        //this.socket.disconnect()
      }
      this.engine_status = 'Connecting...'
      this.show('Trying to connect to the plugin engine...')
      const socket = io(url);
      const timer = setTimeout(() => {
        if (!this.engine_connected) {
          this.engine_status = 'Plugin Engine not connected'
          if(!auto) this.show('Failed to connect, please make sure you have started the plugin engine.', 5000)
          if(!auto) this.showPluginEngineInfo = true
        }
      }, 2500)
      socket.on('connect', (d) => {
        clearTimeout(timer)
        this.connection_token = this.connection_token && this.connection_token.trim()
        socket.emit('register_client', {id: this.client_id, token: this.connection_token}, (ret)=>{
          if(ret.success){
            this.resumable_plugins = []//ret.plugins
            this.socket = socket
            this.pluing_context.socket = socket
            this.engine_connected = true
            this.engine_status = 'Connected.'
            localStorage.setItem("imjoy_connection_token", this.connection_token);
            console.log('these python plugins can be resumed: ', ret.plugins)
            this.show('Plugin Engine connected.')
            console.log('plugin engine connected.')
            this.store.event_bus.$emit('engine_connected', d)
            this.reloadPythonPlugins()
          }
          else{
            socket.disconnect()
            this.showTokenPrompt = true
            console.error('failed to connect.')
          }
        })

      })
      socket.on('disconnect', () => {
        console.log('plugin engine disconnected.')
        this.engine_connected = false
        this.show('Plugin Engine disconnected.')
        this.engine_status = 'Disconnected.'
        this.socket = null
        this.pluing_context.socket = null
        // this.pluing_context.socket = null
        this.removePythonPlugins()
      });
      this.socket = socket

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
      const pconfig = plugin.config
      const w = {
        name: pconfig.name,
        type: 'imjoy/plugin-editor',
        config: {},
        plugin: plugin,
        reload: this.reloadPlugin,
        save: this.savePlugin,
        w: 10,
        h: 10,
        data: {
          name: pconfig.name,
          id: plugin.id,
          code: pconfig.code
        }
      }
      this.addWindow(w)
    },
    newPlugin(template) {
      const w = {
        name: 'New Plugin',
        type: 'imjoy/plugin-editor',
        config: {},
        reload: this.reloadPlugin,
        save: this.savePlugin,
        w: 10,
        h: 10,
        plugin: {},
        data: {
          name: 'new plugin',
          id: 'plugin_' + randId(),
          code: JSON.parse(JSON.stringify(template))
        }
      }
      this.addWindow(w)
    },
    resumePlugin(pconfig) {


    },
    reloadPlugin(pconfig) {
      return new Promise((resolve, reject) => {
        if(pconfig.name){
          for (let k in this.plugins) {
            if (this.plugins.hasOwnProperty(k)) {
              const plugin = this.plugins[k]
              if(plugin.name == pconfig.name){
                  try {
                    delete this.plugins[k]
                    delete this.plugin_names[pconfig.name]
                    Joy.remove(pconfig.name)
                    console.log('terminating ',plugin)
                    if (typeof plugin.terminate == 'function') {
                      plugin.terminate()
                    }
                  } catch (e) {

                  }

              }
            }
          }
        }

        if (pconfig.plugin && pconfig.plugin.id){
          if(this.plugins[pconfig.plugin.id]){
            delete this.plugin_names[this.plugins[pconfig.plugin.id].name]
            delete this.plugins[pconfig.plugin.id]
          }
        }

        if (pconfig.plugin && pconfig.plugin.type)
          Joy.remove(pconfig.plugin.type)

        if (pconfig.plugin && pconfig.plugin.terminate) {
          try {
            console.log('terminating plugin ', pconfig.plugin)
            if (typeof pconfig.plugin.terminate == 'function'){
              pconfig.plugin.terminate()
              this.$forceUpdate()
              console.log('terminated.')
            }
          } finally {
            delete pconfig.plugin
          }
        }
        pconfig.plugin = null
        console.log('reloading plugin ', pconfig)
        const template = this.parsePluginCode(pconfig.code, pconfig)
        // const rplugins = this.resumable_plugins.filter(p => p.name==template.name && p.type==template.type)
        // let rplugin = null
        // if(rplugins.length>0){
        //   rplugin = rplugins[0]
        // }

        let p
        if (template.mode == 'iframe' && template.tags.includes('window')) {
          p = this.preLoadPlugin(template)
        } else {
          p = this.loadPlugin(template)
        }

        p.then((plugin) => {
          console.log('new plugin loaded', plugin)
          pconfig.name = plugin.name
          pconfig.type = plugin.type
          pconfig.plugin = plugin
          if (this.$refs.workflow) this.$refs.workflow.setupJoy()
          this.$forceUpdate()
          resolve(plugin)
        }).catch((e) => {
          pconfig.name = null
          pconfig.type = null
          pconfig.plugin = null
          this.$forceUpdate()
          reject(e)
        })

      })
    },
    savePlugin(pconfig) {
      //console.log('saving plugin ', pconfig)
      const code = pconfig.code
      const template = this.parsePluginCode(code, {})
      template.code = code
      template._id = template.name.replace(/ /g, '_')
      const addPlugin = () => {
        this.db.put(template, {
          force: true
        }).then((result) => {
          console.log('Successfully installed!');
          this.show(`${template.name } has been sucessfully saved.`)
        }).catch((err) => {
          this.show('failed to save the plugin.')
          console.error(err)
        })
      }
      // remove if exists
      this.db.get(template._id).then((doc) => {
        return this.db.remove(doc);
      }).then((result) => {
        addPlugin()
      }).catch((err) => {
        addPlugin()
      });
    },
    reloadPythonPlugins(){
      for(let p of this.installed_plugins){
        if(p.mode == 'pyworker'){
          this.reloadPlugin(p)
        }
      }
    },
    removePythonPlugins(){
      for (let k in this.plugins) {
        if (this.plugins.hasOwnProperty(k)) {
          const plugin = this.plugins[k]
          if(plugin.mode == 'pyworker'){
            try {
              Joy.remove(plugin.config.type)
              console.log('terminating ',plugin)
              if (typeof plugin.terminate == 'function') {
                plugin.terminate()
              }
              // delete this.plugins[k]
              // delete this.plugin_names[plugin.config.name]
            } catch (e) {

            }
          }
        }
      }
    },
    resetPlugins(){
      this.plugins = {}
      this.plugin_names = {}
      this.registered = {
        ops: {},
        windows: {},
        extensions: {},
        inputs: {},
        outputs: {},
        loaders: {}
      }
      this.registered.internal_inputs = {
        'Image': { schema: schema({type: ['image/jpeg', 'image/png', 'image/gif'], size: Number})},
      }
      this.registered.loaders['Image'] = (file)=>{
        var fr = new FileReader();
        fr.onload =  () => {
          this.createWindow({
            name: file.name,
            type: 'imjoy/image',
            data: {src: fr.result}
          })
        }
        fr.readAsDataURL(file);
      }
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
              }
            }
            this.plugins[k] = null
            this.plugin_names[plugin.name] = null
          }
        }
      }
      this.resetPlugins()
      this.db.allDocs({
        include_docs: true,
        attachments: true,
        sort: 'name'
      }).then((result) => {
        const promises = []
        this.workflow_list = []
        this.installed_plugins = []
        for (let i = 0; i < result.total_rows; i++) {
          const config = result.rows[i].doc
          if (config.workflow) {
            this.workflow_list.push(config)
          } else {
            this.installed_plugins.push(config)
            try {
              const template = this.parsePluginCode(config.code, config)
              const rplugins = this.resumable_plugins.filter(p => p.name==template.name && p.type==template.type)

              let rplugin = null
              if(rplugins.length>0){
                rplugin = rplugins[0]
              }

              if (template.mode == 'iframe' && template.tags.includes('window')) {
                promises.push(this.preLoadPlugin(template, rplugin))
              } else {
                promises.push(this.loadPlugin(template, rplugin))
              }
            } catch (e) {
              console.error(e)
              this.showStatus(`Error occured when loading plugin "${config.name}": ${e.toString()}` )
            }
          }
        }
        // TODO: setup this promise all, it's now cause unknown problem
        Promise.all(promises).then(()=>{
          this.$forceUpdate()
        })
        this.plugin_loaded = true
        this.loading = false
        this.$forceUpdate()
      }).catch((err) => {
        console.error(err)
        this.loading = false
      });

    },
    closeAll() {

      this.default_window_pos = {
        i: 0,
        x: 0,
        y: 0,
        w: 5,
        h: 5
      }
      this.status_text = ''

      for (var i = this.windows.length; i--;) {
        if (this.windows[i].type != 'imjoy/plugin-editor') {
            this.windows.splice(i, 1);
        }
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
    showPluginProgress(p, _plugin){
      if(_plugin && _plugin.id){
        const source_plugin = this.plugins[_plugin.id]
        if(source_plugin){
          if (p < 1) source_plugin.progress = p * 100
          else source_plugin.progress = p
          this.$forceUpdate()
        }
      }
    },
    showPluginStatus(s, _plugin){
      if(_plugin && _plugin.id){
        const source_plugin = this.plugins[_plugin.id]
        if(source_plugin){
          source_plugin.status_text = s
          this.$forceUpdate()
        }
      }
    },
    addWindow(w) {
      w.loaders = this.getDataLoaders(w.data)
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
      config.w = config.w || this.default_window_pos.w
      config.h = config.h || this.default_window_pos.h
      config.x = this.default_window_pos.x
      config.y = this.default_window_pos.y
      this.default_window_pos.x = this.default_window_pos.x + this.default_window_pos.w
      if (this.default_window_pos.x >= 20) {
        this.default_window_pos.x = 0
        this.default_window_pos.y = this.default_window_pos.y + this.default_window_pos.h
      }
      this.default_window_pos.i = this.default_window_pos.i + 1
    },
    validatePluginConfig(config){
      if(config.name.indexOf('/')<0){
        return true
      }
      else{
        throw "Plugin name should not contain '/'."
      }
    },
    getDataLoaders(data){
      const loaders = {}
      for (let k in this.registered.internal_inputs) {
        if (this.registered.internal_inputs.hasOwnProperty(k)) {
          // console.log(k, this.registered.internal_inputs[k])
          if (this.registered.internal_inputs[k].schema(data)) {
            loaders[k] = k
          }
        }
      }
      // find all the plugins registered for this type
      for (let k in this.registered.inputs) {
        if (this.registered.inputs.hasOwnProperty(k)) {
          // const error = this.registered.inputs[k].schema.errors(data)
          // console.error("schema mismatch: ", data, error)
          try {
            if (this.registered.inputs[k].schema(data)) {
              const plugin_name = this.registered.inputs[k].plugin_name
              const op_name = this.registered.inputs[k].op_name
              const plugin = this.plugin_names[plugin_name]
              if(plugin && this.registered.loaders[plugin_name+'/'+op_name]){
                console.log('associate data with ', plugin_name, op_name )
                loaders[op_name] = plugin_name+'/'+op_name
              }
            }
          } catch (e) {
            console.error('error with validation with', k, e)
          }
        }
      }
      return loaders
    },
    loadFiles() {
      for (let f = 0; f < this.selected_files.length; f++) {
        const file = this.selected_files[f]
        const tmp = file.name.split('.')
        const ext = tmp[tmp.length - 1]
        file.loaders = this.getDataLoaders(file)
        console.log('loaders', file.loaders)
      }
      const w = {
        name: 'Files',
        type: 'imjoy/files',
        config: {},
        data: {
          _op: '__file_loader__',
          _source_op: null,
          _workflow_id: 'files_'+randId(),
          files: this.selected_files
        }
      }
      this.addWindow(w)
    },
    clearWorkflow() {
      this.workflow_joy_config.data = ''
      this.$refs.workflow.setupJoy(true)
    },
    runWorkflow(joy) {
      console.log('run workflow.', this.active_windows)
      const w = this.active_windows[this.active_windows.length - 1] || {}
      this.status_text = ''
      const target = w.data || {}
      target._op = 'workflow'
      target._source_op = null
      target._workflow_id = target._workflow_id || "workflow_"+randId()
      joy.workflow.execute(target).then((my) => {
        my.target = my.target || {}
        my.target._op = target._op || null
        my.target._source_op = target._source_op || null
        my.target._workflow_id = target._workflow_id || null
        if (Object.keys(my.target).length>3) {
          console.log('result', my)
          const w = {}
          w.name = 'result'
          w.type = 'imjoy/generic'
          w.config = my.data
          w.data = my.target
          this.createWindow(w)
        }
        this.progress = 100

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
      const data = {}
      data.name = name
      data._id = name + '_workflow'
      // delete data._references
      data.workflow = JSON.stringify(joy.top.data)
      console.log('saving workflow: ', data)
      this.db.put(data, {
        force: true
      }).then((result) => {
        console.log('Successfully saved!');
        this.workflow_list.push(data)
        this.show(name + ' has been sucessfully saved.')
      }).catch((err) => {
        this.show('failed to save the workflow.')
        console.error(err)
        alert('error occured: ' + err.toString())
      })
    },
    loadWorkflow(w) {
      this.workflow_joy_config.data = JSON.parse(w.workflow)
      this.$refs.workflow.setupJoy()
      console.log(w)
    },
    removeWorkflow(w) {
      console.log('removing: ', w)
      this.db.get(w._id).then((doc) => {
        return this.db.remove(doc);
      }).then((result) => {
        var index = this.workflow_list.indexOf(w);
        if (index > -1) {
          this.workflow_list.splice(index, 1);
        }
        console.log('Successfully removed!');
        this.show(name + ' has been sucessfully removed.')
      }).catch((err) => {
        this.show('failed to remove the workflow.')
        console.error(err)
        alert('error occured: ' + err.toString())
      })
    },
    runOp(op) {
      console.log('run op.', this.active_windows)
      const w = this.active_windows[this.active_windows.length - 1] || {}
      const target = w.data || {}
      target._op = '_panel'
      target._source_op = null
      target._workflow_id = target._workflow_id || "op_"+op.name.trim().replace(/ /g, '_')+randId()
      op.joy._panel.execute(target).then((my) => {
        if (my.target && Object.keys(my.target).length>0) {
          console.log('result', my)
          my.name = 'result'
          my.type = 'imjoy/generic'
          my.config = my.data
          my.data = my.target
          my.data._op = target._op || null
          my.data._source_op = target._source_op || null
          my.data._workflow_id = target._workflow_id || null
          if(Object.keys(my.data).length>3)
          this.createWindow(my)
        }
        this.progress = 100
      }).catch((e) => {
        console.error(e)
        this.status_text = op.name + '->' + (e.toString() || "Error.")
      })
    },
    selectFileChanged(event) {
      console.log(event.target.files)
      this.selected_file = event.target.files[0];
      this.selected_files = event.target.files;
      //normalize relative path
      for(let i=0;i<event.target.files.length; i++){
        const file = event.target.files[i];
        file.relativePath = file.webkitRelativePath;
        file.loaders = this.getDataLoaders(file)
      }
      this.loadFiles()
    },
    closePanel(panel) {

    },
    parsePluginCode(code, config) {
      config = config || {}
      const uri = config.uri
      if (uri && uri.endsWith('.js')) {
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
      config.type = config.type || config.name
      config._id = config._id || null
      config.uri = uri
      config.code = code
      config.id = config.name.trim().replace(/ /g, '_') + '_' + randId()
      if (!PLUGIN_SCHEMA(config)) {
        const error = PLUGIN_SCHEMA.errors(config)
        console.error("Invalid plugin config: " + config.name, error)
        throw error
      }
      return config
    },
    preLoadPlugin(template, rplugin) {
      const config = {
        name: template.name,
        mode: template.mode,
        type: template.type,
        tags: template.tags,
        ui: template.ui,
        inputs: template.inputs,
        outputs: template.outputs
      }
      this.validatePluginConfig(config)
      //generate a random id for the plugin
      return new Promise((resolve, reject) => {
        if(!rplugin){
          config.id = template.name.trim().replace(/ /g, '_') + '_' + randId()
          config.initialized = false
        }
        else{
          config.id = rplugin.id
          config.initialized = true
        }
        const tconfig = _.assign({}, template, config)
        const plugin = {
          id: config.id,
          name: config.name,
          type: config.type,
          config: tconfig,
          mode: template.mode
        }
        this.plugins[plugin.id] = plugin
        this.plugin_names[plugin.name] = plugin
        config.click2load = false
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
    loadPlugin(template, rplugin) {
      this.status_text = ''
      template = _clone(template)
      this.validatePluginConfig(template)
      //generate a random id for the plugin
      return new Promise((resolve, reject) => {
        const config = {}
        if(!rplugin){
          config.id = template.name.trim().replace(/ /g, '_') + '_' + randId()
          config.initialized = false
        }
        else{
          config.id = rplugin.id
          config.initialized = true
        }
        config.context = this.pluing_context
        if (template.mode == 'pyworker') {
          if (!this.socket) {
            console.error("plugin engine is not connected.")
          }
        }
        const tconfig = _.assign({}, template, config)
        const plugin = new jailed.DynamicPlugin(tconfig, this.plugin_api)
        plugin.whenConnected(() => {
          if (!plugin.api) {
            console.error('error occured when loading plugin.')
            throw 'error occured when loading plugin.'
          }

          if (template.type) {
            this.register(template, {
              id: plugin.id
            })
          }
          if (template.extensions && template.extensions.length > 0) {
            this.registerExtension(template.extensions, plugin)
          }
          // if(!config.initialized){
            plugin.api.setup().then((result) => {
              console.log('sucessfully setup plugin: ', plugin)
              resolve(plugin)
            }).catch((e) => {
              console.error('error occured when loading plugin ' + template.name + ": ", e)
              reject(e)
              plugin.terminate()
            })
          // }
          // else{
          //   resolve(plugin)
          // }
        });
        plugin.whenFailed((e) => {
          if(e){
            this.status_text = template.name + '-> Error: ' + e
            this.show('error occured when loading ' + template.name + ": " + e)
          }
          console.error('error occured when loading ' + template.name + ": ", e)
          plugin.terminate()
          // reject(e)
        });

        this.plugins[plugin.id] = plugin
        this.plugin_names[plugin.name] = plugin
      })
    },
    async runPlugin(plugin_name, my, _plugin) {
      let source_plugin
      if(_plugin && _plugin.id){
        source_plugin = this.plugins[_plugin.id]
      }
      else{
        source_plugin = this.plugins[my.id]
        my = null
      }
      const target_plugin = this.plugin_names[plugin_name]
      if(target_plugin){
        my = my || {}
        my.op = {type: source_plugin.type, name:source_plugin.name}
        my.config = my.config || {}
        my.data = my.data || {}
        my.data._op = plugin_name
        my.data._source_op = source_plugin.name
        my.data._workflow_id = my.data._workflow_id || null
        return await target_plugin.api.run(my)
      }
      else{
        throw 'plugin with type '+plugin_name+ ' not found.'
      }
    },
    register(config, _plugin) {
      try {
        const plugin = this.plugins[_plugin.id]
        config.type = config.type || config.name
        config.mode = config.mode || 'webworker'
        config.show_panel = config.show_panel || false
        config.ui = config.ui || config.name
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
        console.log('creating Op: ', config, plugin)
        if (!plugin || !plugin.api || !plugin.api.run) {
          console.log("WARNING: no run function found in the config, this op won't be able to do anything: " + config.name)
          config.onexecute = () => {
            console.log("WARNING: no run function defined.")
          }
        } else {
          const onexecute = async (my) => {
            //conver the api here data-->config   target--> data
            my.target._source_op = my.target._op;
            my.target._op = my.op.name;
            // my.target._workflow_id = null;
            const _workflow_id = my.target._workflow_id;
            const result = await plugin.api.run({
              op: {
                name: my.op.name,
              },
              config: my.data,
              data: my.target,
            })
            const res = {}
            if(result && result.data && result.config){
              res.data = result.config
              res.target = result.data
            }
            else if(result){
              res.data = null
              res.target = result
            }
            res.target = res.target || {}
            res.target._workflow_id = _workflow_id
            res.target._op = my.target
            res.target._source_op = my._source_op
            return res
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

        // plugin.type = config.type
        // plugin.name = config.name
        console.log('register op plugin: ', plugin.config)

        const op_config = {
          plugin_id: _plugin.id,
          name: config.name,
          ui: "{id: '_panel', type: '" + config.type + "'}",
          onexecute: config.onexecute
        }
        plugin.ops = plugin.ops || {}
        plugin.ops[config.name] = op_config

        if (config.inputs){
          try {
            if(config.inputs.type != 'object' || !config.inputs.properties){
              if(typeof config.inputs == 'object'){
                config.inputs = {properties: config.inputs, type: 'object'}
              }
              else{
                throw "inputs schema must be an object."
              }
            }
            const sch = schema.fromJSON(config.inputs)
            console.log('inputs schema:-->', plugin.name, config.name, sch.toJSON())
            const plugin_name = plugin.name
            const op_name = config.name
            this.registered.inputs[plugin_name+'/'+op_name] =  {op_name: op_name, plugin_name: plugin_name, schema: sch}
            this.registered.loaders[plugin_name+'/'+op_name] = async (target_data) => {
                let config = {}
                if (plugin.config && plugin.config.ui) {
                  config = await this.showDialog(plugin.config)
                }
                target_data._source_op = target_data._op
                target_data._op = op_name
                target_data._workflow_id = target_data._workflow_id || 'data_loader_'+op_name.trim().replace(/ /g, '_')+randId()
                const result = await plugin.api.run({
                  op: {name: op_name},
                  config: config,
                  data: target_data
                })
                if(result){
                  console.log('result', result)
                  const my = {}
                  if(result && result.data && result.config){
                    my.data = result.config
                    my.target = result.data
                  }
                  else if(result){
                    my.data = null
                    my.target = result
                  }
                  my.target = my.target || {}
                  my.target._op = target_data._op || null
                  my.target._source_op = target_data._source_op || null
                  my.target._workflow_id = target_data._workflow_id || null
                  if (Object.keys(my.target).length>3) {
                    const w = {}
                    w.name = 'result'
                    w.type = 'imjoy/generic'
                    w.config = my.data
                    w.data = my.target
                    this.createWindow(w)
                  }
                }
            }

          } catch (e) {
            console.error(`something went wrong with the input schema for ${config.name}`, e)
          }
        }
        if (config.outputs){
          try {
            if(config.outputs.type != 'object' || !config.outputs.properties){
              if(typeof config.outputs == 'object'){
                config.outputs = {properties: config.outputs, type: 'object'}
              }
              else{
                throw "inputs schema must be an object."
              }
            }
            const sch = schema.fromJSON(config.outputs)
            this.registered.outputs[plugin.name+'/'+config.name] =  {op_name: config.name, plugin_name: plugin.name, schema: sch}
          } catch (e) {
            console.error(`something went wrong with the output schema for ${config.name}`, config.outputs)
          }
        }

        this.registered.ops[plugin.name+'/'+config.name] = op_config

        //update the joy workflow if new template added, TODO: preserve settings during reload
        if (this.$refs.workflow) this.$refs.workflow.setupJoy()

        console.log('creating panel: ', op_config)
        this.$forceUpdate()

        if (config.tags.includes('window')) {
          if (config.mode != 'iframe') {
            throw 'Window plugin must be with type "iframe"'
          }
          console.log('register window plugin: ', plugin.config)
          this.registered.windows[config.name] = plugin.config
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
      const tconfig = _.assign({}, pconfig.plugin, pconfig)
      const plugin = new jailed.DynamicPlugin(tconfig, this.plugin_api)
      plugin.whenConnected(() => {
        if (!plugin.api) {
          console.error('the window plugin seems not ready.')
        }
        // this.plugins[plugin.id] = plugin
        plugin.api.setup().then((result) => {
          console.log('sucessfully setup the window plugin: ', plugin, pconfig)
          //asuming the data._op is passed from last op
          pconfig.data._source_op = pconfig.data._op
          pconfig.data._op = plugin.name
          pconfig.data._workflow_id = pconfig.data._workflow_id
          plugin.api.run({
            data: pconfig.data,
            config: pconfig.config,
            op: pconfig.op,
          }).then(()=>{
            this.$forceUpdate()
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
      wconfig.config = wconfig.config || {}
      wconfig.data = wconfig.data || null
      wconfig.click2load = wconfig.click2load || false
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
        if (!pconfig.click2load) {
          pconfig.loadWindow = null
          this.showPluginWindow(pconfig).then(() => {
            this.renderWindow(pconfig)
          })
        } else {
          pconfig.renderWindow = this.renderWindow
          this.showPluginWindow(pconfig)
        }
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
        resolve()
      })
    },
    showAlert(text){
      console.log('alert: ', text)
      alert(text)
    }
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

.subheader-emoji {
  font-size: 20px;
  font-weight: 500;
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

/* .md-dialog {
  width: 80%;
  max-width: 700px;
} */

@media screen and (max-width: 700px) {
  .md-dialog {
    width: 100%;
    max-width: 100%;
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
  top: -10px !important;
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

.status-text{
  text-align: center;
  text-transform: none;
}

.centered-button{
  text-align: center;
  text-transform: none;
}

.md-button {
  margin: 1px;
}

</style>
