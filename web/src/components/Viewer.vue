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
        </md-card-header>
        <md-card-content>
          <joy init="{id:'analysis_workflow', type:'ops'}" @update="updateWorkflow" @run="runWorkflow('analysis_workflow')" v-if="plugin_loaded"></joy>
        </md-card-content>
        <md-card-actions>
        </md-card-actions>
      </md-card>

      <div class="md-layout">
        <md-card v-for="panel in panels" class="md-layout-item" :key="panel.name">
          <md-card-header>
            <div class="md-toolbar-row">
              <div class="md-toolbar-section-start">
                <h2>{{panel.name}}</h2>
              </div>
              <div class="md-toolbar-section-end">
                <md-button @click="closePanel(panel)" class="md-icon-button">
                  <md-icon>close</md-icon>
                </md-button>
              </div>
            </div>
          </md-card-header>
          <md-card-content>
            <joy :init="panel.init" v-if="plugin_loaded"></joy>
          </md-card-content>
        </md-card>

      </div>


    </md-app-drawer>

    <md-app-content>
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
      loading: false,
      showImportDialog: false,
      windows: [],
      panels: [],
      activeWindow: null,
      _workflow_my: null,
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
  mounted() {
    this.plugin_api = {
      alert: alert,
      createPanel: this.createPanel,
      createWindow: this.createWindow,
      createOp: this.createOp,
    }
    this.plugin_loaded = false
    this.loading = true
    this.db = new PouchDB('imjoy_plugins', {
      revs_limit: 2,
      auto_compaction: true
    })
    const root = location.protocol + '//' + location.host
    setTimeout(() => {
      this.db.allDocs({
        include_docs: true,
        attachments: true
      }).then((result) => {
        console.log(result)
        const promises = []
        for (let i = 0; i < result.total_rows; i++) {
          const config = result.rows[i].doc
          promises.push(this.loadPlugin(config))
        }
        Promise.all(promises).then(() => {
          this.plugin_loaded = true
        }).catch((e) => {
          console.error(e)
          this.plugin_loaded = true
        })
        this.loading = false
      }).catch((err) => {
        console.error(err)
        this.loading = false
      });
    }, 500)

    // this.store.event_bus.$on('message', this.messageHandler)
  },
  methods: {
    // messageHandler(e){
    //   const data = e.data
    //   console.log('recieved message from ', e.origin, ' data: ',  data)
    // },
    windowSelected(window){
      console.log('activate window: ', window)
      this.activeWindow = window
    },
    loadData(){
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
    updateWorkflow(my){
      this._workflow_my = my
      console.log('update workflow', my)
    },
    runWorkflow(mainOp){
      if(this._workflow_my){
        console.log('run workflow', mainOp)
        this._workflow_my[mainOp].execute({})
      }
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
    createOp(config) {
      console.log('creating Op: ', config)
      const onexecute = async (my) => {
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
      Joy.add(config);
      return true
    },
    createPanel(config) {
      console.log('creating panel: ', config)
      this.panels.push(config)
      return true
    },
    createWindow(config) {
      console.log('creating window: ', config)
      this.windows.push(config)
      return true
    },
    loadPlugin(config) {
      const path = config.js_path,
        code = config.js_code
      new Promise((resolve, reject) => {
        // exported methods, will be available to the plugin
        this.plugin_api.kk = 999
        this.plugin_api.get_kk = async () => {
          return new ArrayBuffer(1200400)
        }
        let plugin
        if (code) {
          plugin = new jailed.DynamicPlugin(code, this.plugin_api)
        } else {
          plugin = new jailed.Plugin(path, this.plugin_api);
        }
        plugin.whenConnected(() => {
          if (!plugin.api) {
            console.error('error occured when loading plugins.')
          }
          console.log(plugin.api)
          plugin.api.setup().then((result) => {
            console.log('sucessfully setup plugin ' + config.name)
            resolve(plugin)
          }).catch((e) => {
            console.error('error occured when loading plugin ' + config.name + ": ", e)
            reject(e)
          })
        });
        plugin.whenFailed((e) => {
          alert('error occured when loading ' + config.name)
          reject(e)
        });

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
</style>
