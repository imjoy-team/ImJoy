<template>
<div class="plugin-list">
  <!-- <md-subheader>Options</md-subheader> -->
  <md-subheader>Plugins</md-subheader>
  <md-card v-for="plugin in plugins" :key="plugin.name">
    <md-card-header>
      {{plugin.createdAt}}
      <h2>{{plugin.name}}</h2>
      <p>{{plugin.description}}</p>
      <md-chip v-for="tag in plugin.tags" :key="tag">{{tag}}</md-chip>
    </md-card-header>
    <md-card-content>
      <md-button v-if="!plugin.installed" @click="install(plugin)" class="md-primary">Install</md-button>
      <md-button v-if="plugin.installed" @click="install(plugin)" class="md-primary">Update</md-button>
      <md-button v-if="plugin.installed" @click="_plugin2_remove=plugin;showRemoveConfirmation=true;" class="md-accent">Remove</md-button>
    </md-card-content>
  </md-card>
  <br>
  <md-dialog-confirm
     :md-active.sync="showRemoveConfirmation"
     md-title="Removing Plugin"
     md-content="Do you really want to <strong>delete</strong> this plugin"
     md-confirm-text="Yes"
     md-cancel-text="Cancel"
     @md-cancel="showRemoveConfirmation=false"
     @md-confirm="remove(_plugin2_remove);showRemoveConfirmation=false" />
</div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'plugin-list',
  props: {
    configUrl: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      plugins: [],
      root_url: null,
      plugin_dir: null,
      manifest: null,
      showRemoveConfirmation: false,
      _plugin2_remove: null,
      db: null,
      router: this.$root.$data.router,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
  },
  mounted() {
    this.db = new PouchDB('imjoy_plugins', {revs_limit: 2, auto_compaction: true})
    if (this.configUrl) {
      axios.get(this.configUrl).then(response => {
        if (response && response.data && response.data.plugins) {
          this.manifest = response.data
          this.plugins = this.manifest.plugins
          this.plugin_dir = this.manifest.root_path
          this.root_url = location.protocol + '//' + location.host
          if (!this.plugin_dir.startsWith('http')) {
            this.plugin_dir = this.root_url + this.plugin_dir
            console.log(this.plugin_dir)
          }
          this.updatePluginList()
        }
      })
    }

  },
  methods: {
    updatePluginList(){
      for (let i = 0; i < this.plugins.length; i++) {
        const plugin = this.plugins[i]
        console.log(plugin)
        if (!plugin.js_path.startsWith('http')) {
          if (!plugin.js_path.startsWith) {
            plugin.js_path = '/' + plugin.js_path
          }
          plugin.js_path = this.plugin_dir + plugin.js_path
        }
        this.db.get(plugin.name).then((doc) => {
          plugin.installed = true
          this.$forceUpdate()
          console.log(plugin)
        }).catch((err)=>{
            console.log(plugin.name, err)
        });
      }
    },
    remove(plugin){
      // remove if exists
      this.db.get(plugin.name).then((doc) => {
        return this.db.remove(doc);
      }).then((result)=>{
        console.log('plugin has been removed')
        this.api.show('the plugin has been removed.')
        plugin.installed = false
        this.$forceUpdate()
      }).catch((err)=>{
        console.log('error occured when removing ', plugin.name, err)
      });
    },
    install(plugin) {
      axios.get(plugin.js_path).then(response => {
        if(!response || !response.data || response.data == '' ){
          alert('failed to get plugin code from '+ plugin.js_path)
          return
        }
        plugin.js_code = response.data
        plugin._id = plugin.name
        const addPlugin = ()=>{
          this.db.put(plugin, {force: true}).then((result)=> {
            console.log('Successfully installed!');
            plugin.installed = true
            this.$forceUpdate()
            this.api.show(plugin.name+' has been sucessfully installed.')
          }).catch((err)=>{
            this.api.show('failed to install the plugin.')
            console.error(err)
          })
        }
        // remove if exists
        this.db.get(plugin._id).then((doc) => {
          return this.db.remove(doc);
        }).then((result)=>{
          addPlugin()
        }).catch((err)=>{
          addPlugin()
        });

      })

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.md-card{
  max-width: 500px;
  max-height: 1000px;
}
</style>
