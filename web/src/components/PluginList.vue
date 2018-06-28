url<template>
<div class="plugin-list">
  <!-- <md-subheader>Options</md-subheader> -->
  <md-subheader v-if="title">{{title}}</md-subheader>

  <grid
   :center="true"
   :draggable="false"
   :sortable="true"
   :items="available_plugins"
   :height="40"
   :width="40"
   :cell-width="480"
   :cell-height="280"

   >
   <template slot="cell" scope="props">
     <md-card>
       <md-card-header>
         {{props.item.createdAt}}
         <h2>{{props.item.name}}</h2>
         <p>{{props.item.description}}</p>
         <md-chip v-for="tag in props.item.tags" :key="tag">{{tag}}</md-chip>
       </md-card-header>
       <md-card-content>
         <md-button v-if="!props.item.installed" @click="install(props.item)" class="md-button md-primary"><md-icon>cloud_download</md-icon>Install</md-button>
         <md-button v-if="props.item.installed" @click="install(props.item)" class="md-button md-primary"><md-icon>update</md-icon>Update</md-button>
         <md-button v-if="props.item.installed" @click="_plugin2_remove=props.item;showRemoveConfirmation=true;" class="md-accent"><md-icon>delete_forever</md-icon>Delete</md-button>
         <md-button v-if="props.item.installed" @click="edit(props.item)" class="md-button md-primary"><md-icon>edit</md-icon>Edit</md-button>
       </md-card-content>
     </md-card>
   </template>
 </grid>

  <br>
  <md-dialog-confirm :md-active.sync="showRemoveConfirmation" md-title="Removing Plugin" md-content="Do you really want to <strong>delete</strong> this plugin" md-confirm-text="Yes" md-cancel-text="Cancel" @md-cancel="showRemoveConfirmation=false" @md-confirm="remove(_plugin2_remove);showRemoveConfirmation=false"
  />

  <md-dialog class="editor-dialog" :md-active.sync="showEditor">
    <md-dialog-content>
      <plugin-editor class="code-editor" v-model="editorCode" title="Plugin Editor" :options="editorOptions"></plugin-editor>
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
        if (!plugin.url.startsWith('http')) {
          if (!plugin.url.startsWith) {
            plugin.url = '/' + plugin.url
          }
          plugin.url = this.plugin_dir + plugin.url
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
        this.editorCode = doc.code
        this.editorOptions = {
          mode: "ace/mode/html",
          selectionStyle: "text"
        }
        this.editorPlugin = plugin
        this.showEditor = true
        this.$forceUpdate()
      }).catch((err) => {
        console.log('error occured when editing ', plugin.name, err)
      });

    },
    saveCode() {
      this.editorPlugin.code = this.editorCode
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
      axios.get(plugin.url).then(response => {
        if (!response || !response.data || response.data == '') {
          alert('failed to get plugin code from ' + plugin.url)
          return
        }
        plugin.code = response.data
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
  height: 250px;
  margin-top: 20px;
}

.editor-dialog{
  width: 80%;
  height: 85%;
}

.code-editor {
  height: calc(100%)!important;
  width: calc(100%)!important;
}
</style>
