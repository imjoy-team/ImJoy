<template>
  <div class="engine-control-panel">
    <md-button class="md-icon-button md-primary" v-if="!engineManager.engines || engineManager.engines.length==0" @click="showEngineDialog()">
      <md-icon>🚀</md-icon>
      <md-tooltip>Connection to the Plugin Engine</md-tooltip>
    </md-button>
    <md-menu v-else md-size="big" md-direction="top-start" >
      <md-button class="md-icon-button md-primary" md-menu-trigger>
        <md-icon>🚀</md-icon>
        <md-tooltip>ImJoy Plugin Engines</md-tooltip>
      </md-button>
      <md-menu-content class="engine-panel">
        <md-menu-item @click="showEngineDialog()">
          <md-icon>🚀</md-icon>
          <span>Plugin Engine Management</span>
        </md-menu-item>
        <div v-for="engine in engineManager.engines" :key="engine.url">
          <md-divider></md-divider>
          <md-menu-item v-if="engine.connected">
            <md-button v-if="engine.config.show_processes && engine.plugin_processes && engine.plugin_processes.length>0" @click.stop="hide(engine)" class="md-icon-button md-primary">
              <md-icon>remove</md-icon>
            </md-button>
            <md-button v-else @click.stop="expand(engine)" class="md-icon-button md-primary">
              <md-icon>autorenew</md-icon>
            </md-button>
            <a :href="engine.url" target="_blank">{{engine.url}}</a>
            <md-button @click.stop="engine.disconnect()" class="md-icon-button md-accent">
              <md-icon>highlight_off</md-icon>
              <md-tooltip>Disconnect Plugin Engines</md-tooltip>
            </md-button>
            <md-button @click.stop="engine.resetEngine()" class="md-icon-button md-accent">
              <md-icon>restore</md-icon>
              <md-tooltip>Reset Plugin Engines</md-tooltip>
            </md-button>
          </md-menu-item>
          <md-menu-item v-else @click.stop="engine.connect(false)">
            <md-icon>sync_disabled</md-icon> {{engine.name}}
          </md-menu-item>
          <div v-if="engine.connected && engine.config.show_processes">
            <md-divider></md-divider>
            <!-- <md-menu-item :disabled="true">
              <span>Running Processes</span>
              <md-button @click.stop="update(engine)" class="md-icon-button md-primary">
                <md-icon>autorenew</md-icon>
              </md-button>
            </md-menu-item> -->
            <md-menu-item v-show="engine.plugin_processes" v-for="p in engine.plugin_processes" :key="p.pid">
              &nbsp;&nbsp;
              - {{p.name}} (#{{p.pid}})
              <md-button @click.stop="kill(engine, p)" class="md-icon-button md-accent">
                <md-icon>clear</md-icon>
              </md-button>
            </md-menu-item>
            <md-menu-item v-if="!engine.plugin_processes">
              <md-button>
                <div class="loading loading-lg"></div>
              </md-button>
            </md-menu-item>

            <md-menu-item :disabled="true" v-if="engine.plugin_num>1">
              <span>&nbsp;&nbsp;{{engine.plugin_num}} Running Plugins</span>
              <md-button @click.stop="kill(engine)" class="md-icon-button md-accent">
                <md-icon>clear</md-icon>
              </md-button>
            </md-menu-item>
          </div>
        </div>
      </md-menu-content>
    </md-menu>
    <md-dialog :md-active.sync="showDialog" :md-click-outside-to-close="false" :md-close-on-esc="false">
      <md-dialog-title>ImJoy Plugin Engine</md-dialog-title>
      <md-dialog-content>
          <p>
            Python plugins are supported by ImJoy with the ImJoy Plugin Engine.
          </p>
          <div v-if="engineManager.engines.length>0">
            <p>This is a list of previously added Plugin Engines:</p>
            <md-list class="md-dense">
              <md-list-item @click="showToken(engine)" v-for="engine in engineManager.engines" :key="engine.url">
                <md-button v-if="!engine.connected" @click="connectEngine(engine)" class="md-button md-primary">
                  <md-icon>autorenew</md-icon>Connect
                </md-button>
                <md-button v-else @click="disconnectEngine(engine)" class="md-button md-accent">
                  <md-icon>highlight_off</md-icon>Disconnect
                </md-button>
                <span class="md-list-item-text" >{{engine.name}}</span>
                <md-menu>
                  <md-button class="md-icon-button md-list-action" md-menu-trigger>
                    <md-icon class="md-primary">more_horiz</md-icon>
                  </md-button>
                  <md-menu-content>
                    <md-menu-item @click="getInfo(engine)" disabled>
                      <md-icon>info</md-icon>Info
                    </md-menu-item>
                    <!-- <md-menu-item @click="setDefault(engine)" disabled>
                      <md-icon>star</md-icon>Set as default
                    </md-menu-item> -->
                    <md-menu-item @click="removeEngine(engine)" class="md-accent">
                      <md-icon>delete_forever</md-icon>Remove
                    </md-menu-item>
                  </md-menu-content>
                </md-menu>
              </md-list-item>
            </md-list>
            <br>
            <md-divider></md-divider>
            <h2>Connect to a new Plugin Engine</h2>
          </div>
          <p>
            If this is your first time to use ImJoy Plugin Engine, please <a href="https://github.com/oeway/ImJoy-App/releases" target="_blank">click here</a> to download the ImJoy Desktop App.
            <br> If you have it already, please start the Plugin Engine, and connect to it.<br>
          </p>
          <md-autocomplete v-model="engine_url" :md-options="engine_url_list" @keyup.enter="addEngine()" name="engine_url">
            <label for="engine_url">Plugin Engine URL</label>
          </md-autocomplete>
          <md-field>
            <label for="connection_token">Connection Token</label>
            <md-input type="password" v-model="connection_token" @keyup.enter="addEngine()" name="connection_token"></md-input>
          </md-field>
          <md-button class="md-primary md-raised" @click="addEngine()">Connect</md-button>
          <!-- <span>🚀{{engine.name}} <md-switch @change="addEngine()" v-model="engine.activate">Connect</md-switch>
          </span> -->
          <p>
            If you failed to install or start the Plugin Engine, please consult <a href="https://github.com/oeway/ImJoy-Engine" target="_blank">here</a>, and choose the alternative solution.<br>
          </p>


          <!-- <p v-if="is_https_mode">Please notice that, browsers such as Safari do not allow the connection form a `https` website to the Plugin Engine, in that case please <a href="http://imjoy.io/#/app" target="_blank">Switch to HTTP version</a> of ImJoy. </p> -->
          <!-- <p v-if="is_https_mode">Also notice that data and settings of ImJoy in the HTTP version and HTTPS version are not shared.</p> -->
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="hideEngineDialog()">OK</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>


export default {
  name: 'engine-control-panel',
  props: ['engineManager', 'showDialog'],
  data(){
    return {
      engine_url: 'http://127.0.0.1:9527',
      engine_url_list: ['http://127.0.0.1:9527'],
      connection_token: null,
    }
  },
  created(){
    this.event_bus = this.$root.$data.store && this.$root.$data.store.event_bus
  },
  mounted() {
    this.event_bus.$on('engine_connected', ()=>{this.$forceUpdate()})
    this.event_bus.$on('engine_disconnected', ()=>{this.$forceUpdate()})
  },
  beforeDestroy() {
    this.event_bus.$off('engine_connected', ()=>{this.$forceUpdate()})
    this.event_bus.$off('engine_disconnected', ()=>{this.$forceUpdate()})
  },
  methods: {
    expand(engine){
      engine.config.show_processes = true
      this.$forceUpdate()
      this.update(engine)
    },
    hide(engine){
      engine.config.show_processes = false
      this.$forceUpdate()
    },
    update(engine){
      engine.plugin_processes = null
      this.$forceUpdate()
      engine.updateEngineStatus().then(()=>{
        this.$forceUpdate()
      });
    },
    kill(engine, p){
      engine.killPluginProcess(p).then(()=>{
        this.update(engine)
      });
    },
    showEngineDialog(){
      this.$emit('update:showDialog', true)
    },
    hideEngineDialog(){
      this.$emit('update:showDialog', false)
    },
    addEngine(){
      this.engineManager.addEngine({type: 'default', name:this.engine_url,  url: this.engine_url, token: this.connection_token})
    },
    removeEngine(engine){
      this.engineManager.removeEngine(engine)
      this.$forceUpdate()
    },
    connectEngine(engine){
      engine.connect()
      this.$forceUpdate()
    },
    disconnectEngine(engine){
      engine.disconnect()
      this.$forceUpdate()
    },
    showToken(engine){
      this.engine_url = engine.config.url
      this.connection_token = engine.config.token
    },
    getInfo(){

    },
    setDefault(){

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
</style>
