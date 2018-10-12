<template>
<div class="plugin-list" ref="container">
  <!-- <md-subheader>Options</md-subheader> -->
  <md-subheader v-if="title">{{title}} <span v-if="name">{{name}}</span>
  </md-subheader>
  <p v-if="description">{{description}}</p>
  <md-toolbar md-elevation="0">
    <md-field md-clearable class="md-toolbar-section-start">
      <md-icon>search</md-icon>
      <md-input placeholder="Search by name..." v-model="search" @input="searchPlugin" />
    </md-field>
    <md-button v-show="!search && installPlugin" @click="updateAll()" class="md-button md-primary">
      <md-icon>update</md-icon><span class="md-small-hide">Update All</span>
    </md-button>
  </md-toolbar>
  <md-list class="md-triple-line md-dense" v-if="display=='list'">
    <div v-for="(plugin, k) in searched_plugins" :key="k">
      <md-list-item>
        <md-avatar>
          <!-- <img src="https://placeimg.com/40/40/people/1" alt="People"> -->
          <md-icon v-if="plugin.icon">{{plugin.icon}}</md-icon>
          <md-icon v-else>extension</md-icon>
        </md-avatar>

        <div class="md-list-item-text">
          <span>{{plugin.mode == 'pyworker'? plugin.name + ' 🚀': plugin.name}}</span>
          <p>{{plugin.description}}</p>
          <!-- <div>
              <md-chip v-for="tag in plugin.tags" :key="tag">{{tag}}</md-chip>
            </div> -->
          <p><span v-for="tag in plugin.tags" :key="tag">{{tag}}, </span></p>

        </div>
        <p>
        <md-menu v-if="installPlugin && !plugin.installed && plugin.tags && plugin.tags.length>0">
          <md-button class="md-icon-button md-list-action md-primary" md-menu-trigger>
            <md-icon>cloud_download</md-icon>
            <md-tooltip>Install {{plugin.name}}</md-tooltip>
          </md-button>
          <md-menu-content>
            <md-menu-item v-for="tag in plugin.tags" :key="tag" @click="install(plugin, tag)">
              <md-icon>cloud_download</md-icon>{{tag}}
            </md-menu-item>
          </md-menu-content>
        </md-menu>
        <md-button class="md-icon-button md-list-action md-primary" v-else-if="!plugin.installed && installPlugin" @click="install(plugin)">
          <md-icon>cloud_download</md-icon>
          <md-tooltip>Install {{plugin.name}}</md-tooltip>
        </md-button>
        <md-button  class="md-icon-button md-list-action md-primary" v-if="plugin.installed && installPlugin" @click="install(plugin)">
          <md-icon>update</md-icon>
          <md-tooltip>Update {{plugin.name}}</md-tooltip>
        </md-button>
        <md-button  class="md-icon-button md-list-action md-accent" v-if="removePlugin && plugin.installed" @click="_plugin2_remove=plugin;showRemoveConfirmation=true;">
          <md-icon>delete_forever</md-icon>
          <md-tooltip>Delete {{plugin.name}}</md-tooltip>
        </md-button>
        </p>
        <md-menu>
          <md-button class="md-icon-button md-list-action" md-menu-trigger>
            <md-icon class="md-primary">more_horiz</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item @click="showDocs(plugin)">
              <md-icon>description</md-icon>Docs
            </md-menu-item>
            <md-menu-item v-if="plugin.installed && installPlugin" @click="install(plugin)">
              <md-icon>update</md-icon>Update
            </md-menu-item>
            <md-menu-item v-if="plugin.installed && removePlugin" @click="_plugin2_remove=plugin;showRemoveConfirmation=true;">
              <md-icon>delete_forever</md-icon>Delete
            </md-menu-item>
            <md-menu-item @click="showCode(plugin)">
              <md-icon>code</md-icon>Code
            </md-menu-item>
          </md-menu-content>
        </md-menu>
      </md-list-item>
      <md-divider class="md-inset"></md-divider>
    </div>

  </md-list>

  <div v-if="display=='card'">
    <md-card v-if="containerWidth<=500" v-for="(plugin, k) in searched_plugins" :key="k">
      <md-card-header>
        {{plugin.createdAt}}
        <h2>{{plugin.mode == 'pyworker'? plugin.name + ' 🚀': plugin.name}}</h2>
        <p>{{plugin.description}}</p>
        <md-chip v-for="tag in plugin.tags" :key="tag">{{tag}}</md-chip>
      </md-card-header>
      <md-card-content>
        <md-menu v-if="installPlugin && !plugin.installed && plugin.tags && plugin.tags.length>0 && plugin.uri">
          <md-button class="md-button md-primary" md-menu-trigger>
            <md-icon>cloud_download</md-icon>Install
          </md-button>
          <md-menu-content>
            <md-menu-item v-for="tag in plugin.tags" :key="tag" @click="install(plugin, tag)">
              <md-icon>cloud_download</md-icon>{{tag}}
            </md-menu-item>
          </md-menu-content>
        </md-menu>
        <md-button v-else-if="installPlugin && !plugin.installed && plugin.uri" @click="install(plugin)" class="md-button md-primary">
            <md-icon>cloud_download</md-icon>Install</md-button>
        <md-button v-if="installPlugin && plugin.installed && plugin.uri" @click="install(plugin, plugin.tag)" class="md-button md-primary">
          <md-icon>update</md-icon>Update</md-button>
        <md-button v-if="removePlugin && plugin.installed" @click="_plugin2_remove=plugin;showRemoveConfirmation=true;" class="md-accent">
          <md-icon>delete_forever</md-icon>Delete</md-button>
        <md-button  @click="showDocs(plugin)" class="md-button md-primary">
          <md-icon>note</md-icon>Docs
        </md-button>
        <md-button @click="showCode(plugin)" class="md-button md-primary">
          <md-icon>code</md-icon>Code
        </md-button>
      </md-card-content>
    </md-card>
    <grid v-if="containerWidth>500" :center="center" :draggable="false" :sortable="true" :items="searched_plugins" :cell-width="380" :cell-height="280" :grid-width="containerWidth" class="grid-container">
      <template slot="cell" slot-scope="props">
     <md-card>
       <md-card-header>
         <h2><md-icon v-if="props.item.icon">{{props.item.icon}}</md-icon><md-icon v-else>extension</md-icon>
           {{props.item.mode == 'pyworker'? props.item.name + ' 🚀': props.item.name}}

         </h2>
         <p>{{props.item.description}}</p>
         <md-chip v-for="tag in props.item.tags" :key="tag">{{tag}}</md-chip>
       </md-card-header>
       <md-card-content>
         <md-menu v-if="installPlugin && !props.item.installed && props.item.tags && props.item.tags.length>0 && props.item.uri">
           <md-button class="md-button md-primary" md-menu-trigger>
             <md-icon>cloud_download</md-icon>Install
           </md-button>
           <md-menu-content>
             <md-menu-item v-for="tag in props.item.tags" :key="tag" @click="install(props.item, tag)">
               <md-icon>cloud_download</md-icon>{{tag}}
             </md-menu-item>
           </md-menu-content>
         </md-menu>
         <md-button v-else-if="!props.item.installed && installPlugin && props.item.uri" @click="install(props.item)" class="md-button md-primary"><md-icon>cloud_download</md-icon>Install</md-button>
         <md-button v-if="props.item.installed && installPlugin && props.item.uri" @click="install(props.item, props.item.tag)" class="md-button md-primary"><md-icon>update</md-icon>Update</md-button>
         <md-button v-if="props.item.installed && removePlugin" @click="_plugin2_remove=props.item;showRemoveConfirmation=true;" class="md-accent"><md-icon>delete_forever</md-icon>Delete</md-button>
         <md-button  @click="showDocs(props.item)" class="md-button md-primary">
           <md-icon>note</md-icon>Docs
         </md-button>
         <md-button  @click="showCode(props.item)" class="md-button md-primary"><md-icon>code</md-icon>Code</md-button>
       </md-card-content>
     </md-card>
   </template>
    </grid>
  </div>
  <br>
  <md-dialog-confirm :md-active.sync="showRemoveConfirmation" md-title="Removing Plugin" md-content="Do you really want to <strong>delete</strong> this plugin" md-confirm-text="Yes" md-cancel-text="Cancel" @md-cancel="showRemoveConfirmation=false" @md-confirm="remove(_plugin2_remove);showRemoveConfirmation=false"
  />

  <md-dialog class="editor-dialog" :md-active.sync="showEditor">
    <md-dialog-title>{{plugin_name}}</md-dialog-title>
    <md-dialog-content>
      <plugin-editor v-if="showEditor" class="code-editor" v-model="editorCode" title="Plugin Editor"></plugin-editor>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="downloadCode()">Download</md-button>
      <md-button class="md-primary" @click="showEditor=false">Exit</md-button>
    </md-dialog-actions>
  </md-dialog>

  <md-dialog :md-active.sync="showDocsDialog">
    <md-dialog-content>
      <div style="padding-left: 10px; padding-right: 5px;" v-if="docs && docs.trim() !='' " v-html="marked(docs, { sanitize: true })"></div>
      <h3 v-else> Oops, this plugin has no documentation!</h3>
    </md-dialog-content>
    <md-dialog-actions>
      <!-- <md-button class="md-primary" @click="downloadCode(); showEditor=false">Save</md-button> -->
      <md-button class="md-primary" @click="showDocsDialog=false">OK</md-button>
    </md-dialog-actions>
  </md-dialog>
</div>
</template>

<script>
import { saveAs } from 'file-saver';
import axios from 'axios';
import marked from 'marked';
import {
  _clone,
  randId,
  url_regex
} from '../utils.js'

import {
  parseComponent
} from '../pluginParser.js'

export default {
  name: 'plugin-list',
  props: {
    name: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    configUrl: {
      type: String,
      default: null
    },
    database: {
      type: PouchDB,
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
    initSearch: {
      type: String,
      default: null
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
    },
    installPlugin: {
      type: Function,
      default: null
    },
    removePlugin: {
      type: Function,
      default: null
    },
  },
  data() {
    return {
      search: '',
      editorCode: '',
      editorPlugin: null,
      showEditor: false,
      plugin_name: '',
      containerWidth: 500,
      uri_root: null,
      plugin_dir: null,
      manifest: null,
      available_plugins: [],
      searched_plugins: [],
      showRemoveConfirmation: false,
      _plugin2_remove: null,
      showDocsDialog: false,
      docs: null,
      db: null,
    }
  },
  created(){
    this.store = this.$root.$data.store
    this.marked = marked
  },
  mounted() {
    this.search = this.initSearch || '';
    this.containerWidth = this.$refs.container.offsetWidth;
    this.store.event_bus.$on('resize', this.updateSize)
    this.db = this.database || new PouchDB(this.workspace + '_workspace', {
      revs_limit: 2,
      auto_compaction: true
    })

    if (this.plugins) {
      this.available_plugins = this.plugins
      this.searched_plugins = this.plugins
      if(this.search){
        this.searchPlugin()
      }
    } else if (this.configUrl) {
      axios.get(this.configUrl).then(response => {
        if (response && response.data && response.data.plugins) {
          this.manifest = response.data
          this.available_plugins = this.manifest.plugins
          this.searched_plugins = this.manifest.plugins
          const uri_root = this.manifest.uri_root
          for (let i = 0; i < this.available_plugins.length; i++) {
              const p = this.available_plugins[i]
              p.uri = p.uri || p.name + '.html'
              if (!p.uri.startsWith(uri_root) && !p.uri.startsWith('http')) {
                p.uri = uri_root + '/' + p.uri
              }
              p._id = p._id || p.name.replace(/ /g, '_')
          }
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
          if(this.search){
            this.searchPlugin()
          }
        }
      })
    }
  },
  beforeDestroy() {
    this.store.event_bus.$off('resize', this.updateSize)
  },
  methods: {
    toLower(text){
      return text.toString().toLowerCase()
    },
    searchByName(items, term){
      if (term) {
        return items.filter(item => this.toLower(item.name+' '+item.description).includes(this.toLower(term)))
      }
      return items
    },
    searchPlugin(){
      this.searched_plugins = this.searchByName(this.available_plugins, this.search)
    },
    updateSize() {
      this.containerWidth = this.$refs.container.offsetWidth;
    },
    downloadCode(){
      this.$emit('input', this.codeValue)
      const filename = this.window&&this.window.plugin&&this.window.plugin.name?this.window.plugin.name+"_"+randId()+'.imjoy.html':'plugin_'+randId()+'.imjoy.html'
      const file = new Blob([this.codeValue], {type: "text/plain;charset=utf-8"})
      saveAs(file, filename);
    },
    showDocs(plugin){
      if(plugin.installed){
        this.db.get(plugin._id).then((doc) => {
          const pluginComp = parseComponent(doc.code)
          this.docs = pluginComp.docs && pluginComp.docs[0] && pluginComp.docs[0].content
          this.showDocsDialog = true
          this.$forceUpdate()
        }).catch((err) => {
          console.log('error occured when editing ', plugin.name, err)
        });
      }
      else{
        const uri = plugin.uri
        axios.get(uri).then(response => {
          if (!response || !response.data || response.data == '') {
            alert('failed to get plugin code from ' + uri)
            return
          }
          const pluginComp = parseComponent(response.data)
          this.docs = pluginComp.docs && pluginComp.docs[0] && pluginComp.docs[0].content
          this.showDocsDialog = true
          this.$forceUpdate()
        })
      }
    },
    showCode(plugin) {
      if(plugin.installed){
        this.db.get(plugin._id).then((doc) => {
          this.editorCode = doc.code
          this.editorPlugin = plugin
          this.plugin_name = "Plugin Source Code:" + plugin.name
          this.showEditor = true
          this.$forceUpdate()
        }).catch((err) => {
          console.log('error occured when editing ', plugin.name, err)
        });
      }
      else{
        const uri = plugin.uri
        axios.get(uri).then(response => {
          if (!response || !response.data || response.data == '') {
            alert('failed to get plugin code from ' + uri)
            return
          }
          this.editorCode = response.data
          this.editorPlugin = plugin
          this.plugin_name = "Plugin Source Code"
          this.showEditor = true
          this.$forceUpdate()
        })
      }
    },
    updateAll() {
      const ps = []
      for (let plugin of this.available_plugins) {
        if (plugin.installed) {
          ps.push(this.install(plugin, plugin.tag))
        }
      }
      Promise.all(ps).then(() => {
        console.log('All plugins updated successfully.')
        this.$emit('message', 'All plugins updated successfully.')
      }).catch((e) => {
        console.error('Plugins updated with error.', e)
        this.$emit('message', 'Plugins updated with error.')
      });
    },
    install(pconfig, t){
      if(this.installPlugin){
        const p = this.installPlugin(pconfig, t)
        if(p){
          p.then(()=>{
            this.$forceUpdate()
          }).catch((e)=>{
            this.$emit('message', e)
            this.$forceUpdate()
          })
        }
      }

    },
    remove(pconfig){
      if(this.removePlugin){
        const p = this.removePlugin(pconfig)
        if(p){
          p.then(()=>{
            this.$forceUpdate()
          }).catch((e)=>{
            this.$emit('message', e)
            this.$forceUpdate()
          })
        }
      }
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

.code-editor{
  display: flex;
  width: 100%;
  height: calc(100%);
  flex-direction: column;
  overflow: hidden;
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 2px;
  padding-bottom: 2px;
}

.grid-container {
  width: calc(100%) !important;
}

.md-list {
  max-width: 100%;
}

.md-dialog-content {
  height: 100%;
  padding: 4px;
}

</style>
