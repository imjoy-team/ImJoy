<template>
<div class="plugin-list">
  <!-- <md-subheader>Options</md-subheader> -->
  <md-subheader v-if="title">{{title}}</md-subheader>
  <div class="md-layout md-gutter md-alignment-center">
  <md-card v-for="(plugin, i) in available_plugins" class="md-layout-item md-large-size-30 md-medium-size-40 md-small-size-50 md-xsmall-size-100" :key="i">
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
      <md-button v-if="plugin.installed" @click="edit(plugin)" class="md-primary">Edit</md-button>
    </md-card-content>
  </md-card>

  </div>
  <br>
  <md-dialog-confirm :md-active.sync="showRemoveConfirmation" md-title="Removing Plugin" md-content="Do you really want to <strong>delete</strong> this plugin" md-confirm-text="Yes" md-cancel-text="Cancel" @md-cancel="showRemoveConfirmation=false" @md-confirm="remove(_plugin2_remove);showRemoveConfirmation=false"
  />

  <md-dialog class="editor-dialog" :md-active.sync="showEditor">
    <md-dialog-content>
      <div class="md-toolbar-row">
        <h2>Code Editor</h2>
      </div>
      <codemirror class="codemirror" v-model="editorCode" :options="editorOptions"></codemirror>

    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="saveCode(); showEditor=false">Save</md-button>
      <md-button class="md-primary" @click="showEditor=false">Cancel</md-button>
    </md-dialog-actions>
  </md-dialog>
</div>
</template>

<script>
import axios from 'axios';
// language js
import 'codemirror/mode/javascript/javascript.js'
// theme css
import 'codemirror/theme/base16-dark.css'

export default {
  name: 'plugin-list',
  props: {
    configUrl: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    },
    plugins: {
      type: Array,
      default: function(){
        return null
      }
    }
  },
  data() {
    return {
      editorCode: '',
      editorPlugin: null,
      editorOptions: {},
      showEditor: false,
      root_url: null,
      plugin_dir: null,
      manifest: null,
      available_plugins: [],
      showRemoveConfirmation: false,
      _plugin2_remove: null,
      db: null,
      router: this.$root.$data.router,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
  },
  mounted() {
    this.db = new PouchDB('imjoy_plugins', {
      revs_limit: 2,
      auto_compaction: true
    })
    if(this.plugins){
      this.available_plugins = this.plugins
      this.updatePluginList()
    }
    else if (this.configUrl) {
      axios.get(this.configUrl).then(response => {
        if (response && response.data && response.data.plugins) {
          this.manifest = response.data
          this.available_plugins = this.manifest.plugins
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
    updatePluginList() {
      for (let i = 0; i < this.available_plugins.length; i++) {
        const plugin = this.available_plugins[i]
        console.log(plugin)
        if (!plugin.script_path.startsWith('http')) {
          if (!plugin.script_path.startsWith) {
            plugin.script_path = '/' + plugin.script_path
          }
          plugin.script_path = this.plugin_dir + plugin.script_path
        }
        plugin._id = plugin._id || plugin.name.replace(/ /g, '_')
        this.db.get(plugin._id).then((doc) => {
          plugin.installed = true
          this.$forceUpdate()
          console.log(plugin)
        }).catch((err) => {
          console.log(plugin.name, err)
        });
      }
    },
    edit(plugin) {
      this.db.get(plugin._id).then((doc) => {
        this.editorCode = doc.js_code
        this.editorOptions = {
          tabSize: 4,
          mode: 'text/javascript',
          theme: 'base16-dark',
          lineNumbers: true,
          line: true
        }
        this.editorPlugin = plugin
        this.showEditor = true
        this.$forceUpdate()
      }).catch((err) => {
        console.log('error occured when editing ', plugin.name, err)
      });

    },
    saveCode() {
      this.editorPlugin.js_code = this.editorCode
      this.db.get(this.editorPlugin._id).then((doc)=>{
        this.editorPlugin._id = this.editorPlugin.name.replace(/ /g, '_')
        this.editorPlugin._rev = doc._rev
        return this.db.put(this.editorPlugin);
      }).then((response)=>{
        this.api.show('changes has been saved.')
      }).catch( (err)=>{
        console.error(err);
        this.api.show('something went wrong during saving.')
      });
    },
    remove(plugin) {
      // remove if exists
      this.db.get(plugin._id).then((doc) => {
        return this.db.remove(doc);
      }).then((result) => {
        console.log('plugin has been removed')
        this.api.show('the plugin has been removed.')
        plugin.installed = false
        this.$forceUpdate()
      }).catch((err) => {
        console.log('error occured when removing ', plugin.name, err)
      });
    },
    install(plugin) {
      axios.get(plugin.script_path).then(response => {
        if (!response || !response.data || response.data == '') {
          alert('failed to get plugin code from ' + plugin.script_path)
          return
        }
        plugin.js_code = response.data
        plugin._id = plugin.name.replace(/ /g, '_')
        if(plugin.dependencies){
          for(let i=0;i<plugin.dependencies.length;i++){
            const ps = this.available_plugins.filter(p => p.name == plugin.dependencies[i]);
            if(ps.length<=0){
              alert(plugin.name +' plugin depends on '+plugin.dependencies[i]+', but it can not be found in the repository.')
            }
            else{
              console.log('installing dependency ', ps[0])
              if(!ps[0].installed)
              this.install(ps[0])
            }
          }
        }
        const addPlugin = () => {
          this.db.put(plugin, {
            force: true
          }).then((result) => {
            console.log('Successfully installed!');
            plugin.installed = true
            this.$forceUpdate()
            this.api.show(plugin.name + ' has been sucessfully installed.')
          }).catch((err) => {
            this.api.show('failed to install the plugin.')
            console.error(err)
          })
        }
        // remove if exists
        this.db.get(plugin._id).then((doc) => {
          return this.db.remove(doc);
        }).then((result) => {
          addPlugin()
        }).catch((err) => {
          addPlugin()
        });

      })

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.md-card {
  width: 450px;
  /* max-height: 1000px; */
  height: 300px;
  margin-top: 20px;
}

.editor-dialog{
  /* width: 80%; */
  height: 85%;
}

.codemirror {
  height: calc(100%)!important;
  width: calc(100%)!important;
}
</style>
