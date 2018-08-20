<template>
<div class="plugin-list" ref="container">
  <!-- <md-subheader>Options</md-subheader> -->
  <md-subheader v-if="title">{{title}}
  </md-subheader>

  <div  class="md-layout md-gutter">
    <md-button v-if="available_plugins" @click="updateAll()" class="md-button md-primary  md-size-20 md-layout-item">
      <md-icon>update</md-icon><span class="md-medium-hide">Update All</span></md-button>
      <md-field v-if="showUrl" class="md-layout-item md-size-50">
        <label for="plugin_url">Install from URL</label>
        <md-input type="text" v-model="plugin_url" name="plugin_url"></md-input>
      </md-field>
      <md-button v-if="showUrl && plugin_url&&plugin_url!=''" @click="install({uri: plugin_url})" class="md-button md-primary md-size-60  md-layout-item">
          <md-icon>cloud_download</md-icon>Install</md-button>
  </div>

  <md-list class="md-triple-line md-dense" v-if="display=='list'">
    <div v-for="(plugin, k) in available_plugins" :key="k">
      <md-list-item>
        <md-avatar>
          <!-- <img src="https://placeimg.com/40/40/people/1" alt="People"> -->
          <md-icon v-if="plugin.icon">{{plugin.icon}}</md-icon>
          <md-icon v-else>extension</md-icon>
        </md-avatar>

        <div class="md-list-item-text">
          <span>{{plugin.name}}</span>
          <p>{{plugin.description}}</p>
          <!-- <div>
              <md-chip v-for="tag in plugin.tags" :key="tag">{{tag}}</md-chip>
            </div> -->

          <p><span v-for="tag in plugin.tags" :key="tag">{{tag}}; </span></p>

        </div>
        <p>
        <md-button class="md-icon-button md-list-action md-primary" v-if="!plugin.installed" @click="install(plugin)">
          <md-icon>cloud_download</md-icon>
          <md-tooltip>Install {{plugin.name}}</md-tooltip>
        </md-button>
        <md-button  class="md-icon-button md-list-action md-primary" v-if="plugin.installed" @click="install(plugin)">
          <md-icon>update</md-icon>
          <md-tooltip>Update {{plugin.name}}</md-tooltip>
        </md-button>
        <md-button  class="md-icon-button md-list-action md-accent" v-if="plugin.installed" @click="_plugin2_remove=plugin;showRemoveConfirmation=true;">
          <md-icon>delete_forever</md-icon>
          <md-tooltip>Delete {{plugin.name}}</md-tooltip>
        </md-button>
        </p>
        <md-menu>
          <md-button class="md-icon-button md-list-action" md-menu-trigger>
            <md-icon class="md-primary">more_horiz</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item v-if="!plugin.installed" @click="install(plugin)">
              <md-icon>cloud_download</md-icon>Install
            </md-menu-item>
            <md-menu-item v-if="plugin.installed" @click="install(plugin)">
              <md-icon>update</md-icon>Update
            </md-menu-item>
            <md-menu-item v-if="plugin.installed" @click="_plugin2_remove=plugin;showRemoveConfirmation=true;">
              <md-icon>delete_forever</md-icon>Delete
            </md-menu-item>
            <md-menu-item v-if="plugin.installed" @click="edit(plugin)">
              <md-icon>edit</md-icon>Edit
            </md-menu-item>
          </md-menu-content>
        </md-menu>

        <!--<md-button v-if="!plugin.installed" @click="install(plugin)" class="md-icon-button md-list-action">
            <md-icon>cloud_download</md-icon>Install</md-button>
           <md-button v-if="plugin.installed" @click="install(plugin)" class="md-icon-button md-list-action">
            <md-icon>update</md-icon>Update</md-button>
          <md-button v-if="plugin.installed" @click="_plugin2_remove=plugin;showRemoveConfirmation=true;" class="md-icon-button md-list-action md-accent">
            <md-icon>delete_forever</md-icon>Delete</md-button>
          <md-button v-if="plugin.installed" @click="edit(plugin)"class="md-icon-button md-list-action">
            <md-icon>edit</md-icon>Edit</md-button> -->


      </md-list-item>
      <md-divider class="md-inset"></md-divider>
    </div>

  </md-list>

  <div v-if="display=='card'">
    <md-card v-if="containerWidth<=500" v-for="(plugin, k) in available_plugins" :key="k">
      <md-card-header>
        {{plugin.createdAt}}
        <h2>{{plugin.name}}</h2>
        <p>{{plugin.description}}</p>
        <md-chip v-for="tag in plugin.tags" :key="tag">{{tag}}</md-chip>
      </md-card-header>
      <md-card-content>
        <md-button v-if="!plugin.installed" @click="install(plugin)" class="md-button md-primary">
          <md-icon>cloud_download</md-icon>Install</md-button>
        <md-button v-if="plugin.installed" @click="install(plugin)" class="md-button md-primary">
          <md-icon>update</md-icon>Update</md-button>
        <md-button v-if="plugin.installed" @click="_plugin2_remove=plugin;showRemoveConfirmation=true;" class="md-accent">
          <md-icon>delete_forever</md-icon>Delete</md-button>
        <md-button v-if="plugin.installed" @click="edit(plugin)" class="md-button md-primary">
          <md-icon>edit</md-icon>Edit</md-button>
      </md-card-content>
    </md-card>
    <grid v-if="containerWidth>500" :center="center" :draggable="false" :sortable="true" :items="available_plugins" :cell-width="380" :cell-height="280" :grid-width="containerWidth" class="grid-container">
      <template slot="cell" slot-scope="props">
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
  </div>
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
import {
  _clone,
  randId
} from '../utils.js'

import {
  parseComponent
} from '../pluginParser.js'

export default {
  name: 'plugin-list',
  props: {
    configUrl: {
      type: String,
      default: null
    },
    workspace: {
      type: String,
      default: 'default'
    },
    title: {
      type: String,
      default: null
    },
    display: {
      type: String,
      default: function() {
        return 'list'
      }
    },
    showUrl: {
      type: Boolean,
      default: false
    },
    center: {
      type: Boolean,
      default: true
    },
    plugins: {
      type: Array,
      default: function() {
        return null
      }
    }
  },
  data() {
    return {
      editorCode: '',
      plugin_url: '',
      editorPlugin: null,
      editorOptions: {},
      showEditor: false,
      containerWidth: 500,
      uri_root: null,
      plugin_dir: null,
      manifest: null,
      available_plugins: [],
      showRemoveConfirmation: false,
      _plugin2_remove: null,
      db: null,
    }
  },
  created(){
    this.router = this.$root.$data.router
    this.store = this.$root.$data.store
    this.api = this.$root.$data.store.api
  },
  mounted() {
    this.containerWidth = this.$refs.container.offsetWidth;
    this.store.event_bus.$on('resize', this.updateSize)
    this.db = new PouchDB(this.workspace + '_workspace', {
      revs_limit: 2,
      auto_compaction: true
    })
    if (this.plugins) {
      this.available_plugins = this.plugins
      this.updatePluginList()
    } else if (this.configUrl) {
      axios.get(this.configUrl).then(response => {
        if (response && response.data && response.data.plugins) {
          this.manifest = response.data
          this.available_plugins = this.manifest.plugins
          this.plugin_dir = this.manifest.uri_root
          if (this.plugin_dir) {
            this.uri_root = location.protocol + '//' + location.host
            if (!this.plugin_dir.startsWith('http')) {
              this.plugin_dir = this.uri_root + this.plugin_dir
              console.log(this.plugin_dir)
            }
          } else {
            this.uri_root = ''
            this.plugin_dir = ''
          }

          this.updatePluginList()
        }
      })
    }


  },
  beforeDestroy() {
    this.store.event_bus.$off('resize', this.updateSize)
  },
  methods: {
    updateSize() {
      this.containerWidth = this.$refs.container.offsetWidth;
    },
    updatePluginList() {
      for (let i = 0; i < this.available_plugins.length; i++) {
        const plugin = this.available_plugins[i]
        plugin.uri = plugin.uri || plugin.name + '.html'
        if (!plugin.uri.startsWith(this.plugin_dir) && !plugin.uri.startsWith('http')) {
          plugin.uri = this.plugin_dir + '/' + plugin.uri
        }
        plugin._id = plugin._id || plugin.name.replace(/ /g, '_')
        this.db.get(plugin._id).then((doc) => {
          plugin.installed = true
          this.$forceUpdate()
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
      this.db.get(this.editorPlugin._id).then((doc) => {
        this.editorPlugin._id = this.editorPlugin.name.replace(/ /g, '_')
        this.editorPlugin._rev = doc._rev
        return this.db.put(this.editorPlugin);
      }).then((response) => {
        this.api.show('changes has been saved.')
      }).catch((err) => {
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
        this.api.show('The plugin has been removed.')
        plugin.installed = false
        this.$forceUpdate()
      }).catch((err) => {
        console.log('error occured when removing ', plugin.name, err)
      });
    },
    updateAll() {
      const ps = []
      for (let plugin of this.available_plugins) {
        if (plugin.installed) {
          ps.push(this.install(plugin))
        }
      }
      Promise.all(ps).then(() => {
        console.log('All plugins updated successfully.')
        this.api.show('All plugins updated successfully.')
      }).catch((e) => {
        console.error('Plugins updated with error.', e)
        this.api.show('Plugins updated with error.')
      });
    },
    install(p) {
      return new Promise((resolve, reject) => {
        const uri = typeof p == 'object' ? p.uri : p
        axios.get(uri).then(response => {
          if (!response || !response.data || response.data == '') {
            alert('failed to get plugin code from ' + uri)
            reject('failed to get code.')
            return
          }
          let config = null
          const code = response.data
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
          if (!config) {
            console.error('Failed to parse the plugin code.', code)
            reject('Failed to parse the plugin code.')
            return
          }
          config.uri = uri
          config.code = code
          config._id = config.name && config.name.replace(/ /g, '_') || randId()
          if (config.dependencies) {
            for (let i = 0; i < config.dependencies.length; i++) {
              const ps = this.available_plugins.filter(p => p.name == config.dependencies[i]);
              if (ps.length <= 0) {
                alert(config.name + ' plugin depends on ' + config.dependencies[i] + ', but it can not be found in the repository.')
              } else {
                console.log('installing dependency ', ps[0])
                if (!ps[0].installed)
                  this.install(ps[0])
              }
            }
          }
          const addPlugin = () => {
            this.db.put(config, {
              force: true
            }).then((result) => {
              console.log('Successfully installed!');
              if (typeof p == 'object') {
                p.installed = true
              }
              this.$forceUpdate()
              this.api.show(config.name + ' has been sucessfully installed.')
              resolve()
            }).catch((err) => {
              this.api.show('failed to install the plugin.')
              console.error(err)
            })
          }
          // remove if exists
          this.db.get(config._id).then((doc) => {
            return this.db.remove(doc);
          }).then((result) => {
            addPlugin()
          }).catch((err) => {
            addPlugin()
          });

        })
      })

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.md-card {
  width: 95%;
  /* max-height: 1000px; */
  height: 250px;
  margin-top: 20px
}

.editor-dialog {
  width: 80%;
  height: 85%;
}


@media screen and (max-width: 600px) {
  .editor-dialog {
    width: 100%;
    height: 100%;
  }
}

.code-editor {
  height: calc(100%) !important;
  width: calc(100%) !important;
}

.grid-container {
  width: calc(100%) !important;
}

.md-list {
  max-width: 100%;
}


</style>
