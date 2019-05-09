<template>
  <div class="engine-control-panel">
    <md-button class="md-icon-button md-primary" v-if="!engineManager.engines || engineManager.engines.length==0" @click="showAddEngine()">
      <md-icon>🚀</md-icon>
      <md-tooltip>Connection to the Plugin Engine</md-tooltip>
    </md-button>
    <md-menu v-else md-size="big" md-direction="top-start" >
      <md-button class="md-icon-button md-primary" md-menu-trigger>
        <md-icon>🚀</md-icon>
        <md-tooltip>ImJoy Plugin Engines</md-tooltip>
      </md-button>
      <md-menu-content class="engine-panel">
        <md-menu-item @click="showAddEngineDialog=true">
          <md-icon style="margin: 16px;">add</md-icon>
          <span>Add Plugin Engine 🚀</span>
        </md-menu-item>
        <div v-for="engine in engineManager.engines" :key="engine.url">
          <md-divider></md-divider>
          <md-menu-item v-if="engine.connected"  @click="showInfo(engine)">
            <md-button v-if="engine.show_processes && engine.plugin_processes && engine.plugin_processes.length>0" @click.stop="hide_processes(engine)" class="md-icon-button md-primary">
              <md-icon>remove</md-icon>
            </md-button>
            <md-button v-else @click.stop="expand_processes(engine)" class="md-icon-button md-primary">
              <md-icon>autorenew</md-icon>
            </md-button>
            <span>{{engine.url.replace(local_engine_url, 'My Computer')}}</span>
          </md-menu-item>
          <md-menu-item v-else @click.stop="engine.connect(false)">
            <md-icon>sync_disabled</md-icon> {{engine.url.replace(local_engine_url, 'My Computer')}}
            <md-tooltip>Connect to {{engine.name}} </md-tooltip>
          </md-menu-item>
          <div v-if="engine.connected && engine.show_processes">
            <md-divider></md-divider>
            <md-menu-item v-show="engine.plugin_processes" v-for="p in engine.plugin_processes" :key="p.pid">
              &nbsp;&nbsp;
              - {{p.name}} (#{{p.pid}})
              <md-button @click.stop="kill(engine, p)" class="md-icon-button small-icon-button md-accent">
                <md-icon>clear</md-icon>
              </md-button>
            </md-menu-item>
            <md-menu-item v-if="!engine.plugin_processes">
              <md-button>
                <div class="loading loading-lg"></div>
              </md-button>
            </md-menu-item>
            <!-- <md-menu-item :disabled="true" v-if="engine.plugin_num>1">
              <span>&nbsp;&nbsp;{{engine.plugin_num}} Running Plugins</span>
              <md-button @click.stop="kill(engine)" class="md-icon-button small-icon-button md-accent">
                <md-icon>clear</md-icon>
              </md-button>
            </md-menu-item> -->
          </div>
        </div>
      </md-menu-content>
    </md-menu>
    <md-dialog :md-active.sync="showAddEngineDialog" :md-click-outside-to-close="false" :md-close-on-esc="false">
      <md-dialog-title>New Plugin Engine</md-dialog-title>
      <md-dialog-content>
          <p>
            Python plugins are supported by ImJoy with the ImJoy Plugin Engine.
          </p>
          <p>
            If this is your first time to use ImJoy Plugin Engine, please <a href="https://github.com/oeway/ImJoy-App/releases" target="_blank">click here</a> to download the ImJoy Desktop App.
            <br> If you have it already, please start the Plugin Engine, and connect to it.<br>
          </p>
          <div>
            <md-radio v-model="url_type" value="localhost">My Computer</md-radio>
            <md-radio v-model="url_type" value="remote">Another Computer</md-radio>
          </div>
          <md-autocomplete v-if="url_type==='remote'" v-model="engine_url" :md-options="engine_url_list" @keyup.enter="addEngine()" name="engine_url">
            <label for="engine_url">Plugin Engine URL</label>
          </md-autocomplete>
          <md-field>
            <md-select v-model="engine_role" name="engine_role">
              <md-option value="admin">Connect as an admininistrator</md-option>
              <md-option value="user">Connect as a regular user</md-option>
            </md-select>
          </md-field>
          <md-field v-if="engine_role === 'admin'">
            <label for="connection_token">Connection Token</label>
            <md-input type="password" v-model="connection_token" name="connection_token" @keyup.enter="addEngine()"></md-input>
          </md-field>
           <md-button class="md-primary md-raised" @click="addEngine()">Connect</md-button>
          <p>
            If you failed to install or start the Plugin Engine, please consult <a href="https://github.com/oeway/ImJoy-Engine" target="_blank">here</a>, and choose the alternative solution.<br>
          </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showAddEngineDialog=false">OK</md-button>
      </md-dialog-actions>
    </md-dialog>
    <md-dialog :md-active.sync="showEngineInfoDialog" :md-click-outside-to-close="true" :md-close-on-esc="true">
      <md-dialog-title>About Plugin Engine</md-dialog-title>
      <md-dialog-content v-if="selected_engine">
        <h3>{{selected_engine.url.replace(local_engine_url, 'My computer ('+local_engine_url+')')}}</h3>
        <md-field>
          <md-select @md-selected="setting_changed=true" v-model="selected_engine.role" name="engine_role">
            <md-option value="admin">Connect as an admininistrator</md-option>
            <md-option value="user">Connect as a regular user</md-option>
          </md-select>
        </md-field>
        <md-field v-if="selected_engine.role === 'admin'">
          <label for="connection_token">Connection Token</label>
          <md-input type="password" @change="setting_changed=true" v-model="selected_engine.config.token" @keyup.enter="connectEngine(selected_engine)" name="connection_token"></md-input>
        </md-field>
        <div v-if="selected_engine.connected && show_sys_info && selected_engine.engine_info.platform" class="platform-info">
          <p> - api version: {{selected_engine.engine_info.api_version}}</p>
          <p v-for="(v, k) in selected_engine.engine_info.platform" :key="k"> - {{k}}: {{v}}</p>
        </div>
        <br>
        <md-button class="md-primary md-raised" v-if="!selected_engine.connected" @click="connectEngine(selected_engine)"><md-icon>sync</md-icon> Connect</md-button>
        <md-button class="md-accent" v-else @click="disconnectEngine(selected_engine)"><md-icon>sync_disabled</md-icon>Disconnect</md-button>
        <md-button class="md-primary" :disabled="!selected_engine.connected" @click="expand_published_plugins(selected_engine)">
          <md-icon>autorenew</md-icon> Published Plugins
        </md-button>
        <md-button class="md-primary" :disabled="!selected_engine.connected" @click="expand_processes(selected_engine)">
          <md-icon>autorenew</md-icon> Show Processes
        </md-button>
        <md-menu>
          <md-button class="md-icon-button" md-menu-trigger>
            <md-icon class="md-primary">more_horiz</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item :disabled="!selected_engine.connected || show_sys_info" @click.stop="show_sys_info=true" target="_blank">
              <md-icon>info</md-icon> System Information
            </md-menu-item>
            <md-menu-item @click.stop="openEngineUrl(selected_engine.url)" target="_blank">
              <md-icon>launch</md-icon> Open Engine Site
            </md-menu-item>
            <md-menu-item v-if="selected_engine.connected" @click.stop="resetEngine(selected_engine)" class="md-accent">
              <md-icon>restore</md-icon> Reset
            </md-menu-item>
            <md-menu-item @click="removeEngine(selected_engine); showEngineInfoDialog=false; selected_engine=null; " class="md-accent">
              <md-icon>delete_forever</md-icon>Remove
            </md-menu-item>
          </md-menu-content>
        </md-menu>
        
        <div v-if="selected_engine.connected && selected_engine.show_processes">
          <md-divider></md-divider>
          <ul>
            <li v-show="selected_engine.plugin_processes" v-for="p in selected_engine.plugin_processes" :key="p.pid">
             
              <span>{{p.name}} (#{{p.pid}})</span>
              <md-button @click.stop="kill(selected_engine, p)" class="md-icon-button md-accent small-icon-button">
                <md-icon>clear</md-icon>
              </md-button>
            </li>
            <li class="menu-item" v-if="!selected_engine.plugin_processes">
              <md-button>
                <div class="loading loading-lg"></div>
              </md-button>
            </li>
            <!-- <li :disabled="true" v-if="selected_engine.plugin_num>1">
              <span>&nbsp;&nbsp;{{selected_engine.plugin_num}} Running Plugins</span>
              <md-button @click.stop="kill(selected_engine)" class="md-icon-button md-accent">
                <md-icon>clear</md-icon>
              </md-button>
            </li> -->
          </ul>
        </div>

        <div v-if="selected_engine.connected && selected_engine.show_published_plugins">
          <md-divider></md-divider>
          <ul>
            <li v-show="selected_engine.published_plugins" v-for="p in selected_engine.published_plugins" :key="p.id">
              <md-button @click.stop="loadPublishedPlugin(selected_engine, p)" style="text-transform: none;" class="md-primary">
                <md-icon v-if="p.require_token">vpn_key</md-icon>
                {{p.name}}  
                <md-icon>cloud_download</md-icon>
              </md-button>
              <md-button @click.stop="unPublishPlugin(selected_engine, p)" v-if="selected_engine.role==='admin'" class="md-icon-button md-accent small-icon-button">
                <md-icon>clear</md-icon>
              </md-button>
            </li>
            <li v-if="!selected_engine.published_plugins">
              <md-button>
                <div class="loading loading-lg"></div>
              </md-button>
            </li>
          </ul>
        </div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showEngineInfoDialog=false">OK</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>


export default {
  name: 'engine-control-panel',
  props: ['engineManager', 'pluginManager'],
  data(){
    return {
      engine_url: 'http://127.0.0.1:9527',
      local_engine_url: 'http://127.0.0.1:9527',
      engine_url_list: [],
      connection_token: null,
      showEngineInfoDialog: false,
      selected_engine: null,
      show_sys_info: false,
      showAddEngineDialog: false,
      url_type: 'localhost',
      engine_role: 'admin',
      setting_changed: false
    }
  },
  created(){
    this.event_bus = this.$root.$data.store && this.$root.$data.store.event_bus
  },
  mounted() {
    this.event_bus.$on('engine_connected', this.forceUpdate)
    this.event_bus.$on('engine_disconnected', this.forceUpdate)
    this.event_bus.$on('show_engine_dialog', this.showDialog)
  },
  beforeDestroy() {
    this.event_bus.$off('engine_connected', this.forceUpdate)
    this.event_bus.$off('engine_disconnected', this.forceUpdate)
    this.event_bus.$off('show_engine_dialog', this.showDialog)
  },
  methods: {
    showDialog(config){
      this.setting_changed = false
      if(!config.engine){
        this.showEngineInfoDialog = false
        this.showAddEngineDialog  = config.show
      }
      else{
        this.showAddEngineDialog  = false
        this.selected_engine = config.engine
        this.showEngineInfoDialog = config.show
      }
    },
    forceUpdate(){
      this.$forceUpdate()
    },
    expand_processes(engine){
      engine.show_processes = true
      engine.show_published_plugins = false
      this.$forceUpdate()
      this.updateStatus(engine)
    },
    expand_published_plugins(engine){
      engine.show_processes = false
      engine.show_published_plugins = true
      this.$forceUpdate()
      this.updatePublishedPlugins(engine)
    },
    hide_processes(engine){
      engine.show_processes = false
      this.$forceUpdate()
    },
    hide_published_plugins(engine){
      engine.show_published_plugins = false
      this.$forceUpdate()
    },
    updateStatus(engine){
      engine.plugin_processes = null
      this.$forceUpdate()
      engine.updateEngineStatus().then(()=>{
        this.$forceUpdate()
      });
    },
    updatePublishedPlugins(engine){
      engine.published_plugins = null
      this.$forceUpdate()
      engine.getPublishedPlugins().then(()=>{
        this.$forceUpdate()
      });
    },
    kill(engine, p){
      engine.killPluginProcess(p).then(()=>{
        this.updateStatus(engine)
      });
    },
    loadPublishedPlugin(engine, p){
      const plugin_token = prompt('Plugin token?')
      engine.getPublicationInfo({publish_id: p.publish_id, token: plugin_token}).then(async (ret)=>{
        if(ret && ret.success){
          ret.plugin_list = ret.plugin_list || []
          for(let p of ret.plugin_list){
            await this.pluginManager.reloadPlugin({code: p.code}, {id: p.id, publish_id: p.publish_id, engine: engine.url, plugin_token: plugin_token})
          }
          
        }
        this.$forceUpdate()
      });
    },
    unPublishPlugin(engine, p){
      engine.unpublishPlugin({publish_id: p.publish_id}).then(()=>{
        this.updatePublishedPlugins(engine)
      })
    },
    showAddEngine(){
      this.showAddEngineDialog = true
    },
    hide_processesAddEngine(){
      this.showAddEngineDialog = false
    },
    addEngine(){
      let token = null
      if(this.engine_role === 'admin'){
        token = this.connection_token
      }
      if(this.url_type === 'localhost'){
        this.engineManager.addEngine({type: 'default', role: this.engine_role, name: this.local_engine_url,  url: this.local_engine_url, token: token})
      }
      else{
        this.engineManager.addEngine({type: 'default', role: this.engine_role, name:this.engine_url,  url: this.engine_url, token: token})
      }
    },
    removeEngine(engine){
      this.engineManager.removeEngine(engine)
      this.$forceUpdate()
    },
    connectEngine(engine){
      if(!engine.connected)
      engine.connect()
      this.$forceUpdate()
    },
    disconnectEngine(engine){
      if(engine.connected)
      engine.disconnect()
      this.$forceUpdate()
    },
    showToken(engine){
      this.engine_url = engine.config.url
      this.connection_token = engine.config.token
    },
    resetEngine(engine){
      engine.resetEngine()
    },
    showInfo(engine){
      this.show_sys_info = false
      this.selected_engine = engine
      this.showEngineInfoDialog=true
    },
    openEngineUrl(url){
      window.open(url, '_blank')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.engine-panel{
  width: 350px!important;
  max-width: 100%!important;
}

.platform-info>p{
 margin: 3px;
}

.small-icon-button {
  width: 24px!important;
  min-width: 24px!important;
  height: 24px!important;
  margin: 0 2px;
}
</style>
