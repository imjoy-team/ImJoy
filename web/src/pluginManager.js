/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_plugin$" }]*/
import PouchDB from 'pouchdb-browser';
import axios from 'axios';
import _ from 'lodash'

import {
  _clone,
  randId,
  debounce,
  url_regex,
  githubImJoyManifest,
  githubRepo,
  githubUrlRaw,
  assert
} from './utils.js'

import {
  parseComponent
} from './pluginParser.js'

import {
  DynamicPlugin
} from './jailed/jailed.js'

import {
  REGISTER_SCHEMA,
  JOY_SCHEMA,
  WINDOW_SCHEMA,
  PLUGIN_SCHEMA,
  CONFIGURABLE_FIELDS,
  SUPPORTED_PLUGIN_TYPES,
  upgradePluginAPI
} from './api.js'


import {
  Joy
} from './joy'

import Ajv from 'ajv'
const ajv = new Ajv()
import Vue from 'vue'

export class PluginManager {
  constructor({event_bus=null, config_db=null, engine_manager=null, window_manager=null, file_system_manager=null, imjoy_api={}, show_message_callback=null, update_ui_callback=null}){
    this.event_bus = event_bus
    this.em = engine_manager
    this.wm = window_manager
    this.fm = file_system_manager
    this.config_db = config_db
    assert(this.event_bus, 'event bus is not available')
    assert(this.em, 'engine manager is not available')
    assert(this.wm, 'window manager is not available')
    assert(this.config_db, 'config database is not available')

    this.show_message_callback = show_message_callback
    this.update_ui_callback = update_ui_callback || function (){}

    this.default_repository_list = [{name: 'ImJoy Repository', url: "oeway/ImJoy-Plugins", description: 'The official plugin repository provided by ImJoy.io.'},
                                    {name: 'ImJoy Demos', url: 'oeway/ImJoy-Demo-Plugins', description: 'A set of demo plugins provided by ImJoy.io'}
    ]

    this.repository_list = []
    this.repository_names = []
    this.available_plugins = []
    this.installed_plugins = []
    this.workspace_list = []
    this.selected_workspace = null
    this.selected_repository = null
    this.workflow_list = []

    this.db = null
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
    const api_utils_ = imjoy_api.utils
    this.imjoy_api = {
      register: this.register,
      unregister: this.unregister,
      createWindow: this.createWindow,
      run: this.runPlugin,
      call: this.callPlugin,
      getPlugin: this.getPlugin,
      setConfig: this.setPluginConfig,
      getConfig: this.getPluginConfig,
      getAttachment: this.getAttachment,
      onClose: this.onClose,
      utils: {}
    }
    // bind this to api functions
    for(let k in this.imjoy_api){
      if(typeof this.imjoy_api[k] === 'function'){
        this.imjoy_api[k] = this.imjoy_api[k].bind(this)
      }
      else if(typeof this.imjoy_api[k] === 'object'){
        for(let u in this.imjoy_api[k]){
          this.imjoy_api[k][u] = this.imjoy_api[k][u].bind(this)
        }
      }
    }
    // merge imjoy api
    this.imjoy_api = _.assign({}, imjoy_api, this.imjoy_api)
    // copy api utils make sure it was not overwritten
    if(api_utils_){
      for(let k in api_utils_){
        this.imjoy_api.utils[k] = api_utils_[k]
      }
    }
  }

  _sendToServiceWorker(message) {
    // This wraps the message posting/response in a promise, which will resolve if the response doesn't
    // contain an error, and reject with the error if it does. If you'd prefer, it's possible to call
    // controller.postMessage() and set up the onmessage handler independently of a promise, but this is
    // a convenient wrapper.
    return new Promise(function(resolve, reject) {
      if (!navigator.serviceWorker || !navigator.serviceWorker.register) {
       reject("This browser doesn't support service workers")
       return;
      }
      var messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = function(event) {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };

      // This sends the message data as well as transferring messageChannel.port2 to the service worker.
      // The service worker can then use the transferred port to reply via postMessage(), which
      // will in turn trigger the onmessage handler on messageChannel.port1.
      // See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
      navigator.serviceWorker.controller.postMessage(message,
        [messageChannel.port2]);
    });
  }

  showMessage(msg, duration){
    if(this.show_message_callback){
      this.show_message_callback(msg, duration)
    }
    else{
      console.log(`PLUGIN MESSAGE: ${msg}`)
    }
  }

  init(){
    this.plugins = {}
    this.plugin_names = {}
    this.registered = {
      ops: {},
      windows: {},
      extensions: {},
      internal_inputs: {},
      inputs: {},
      outputs: {},
      loaders: {}
    }
  }

  loadRepositoryList(){
    return new Promise((resolve, reject)=>{
      this.config_db.get('repository_list').then((doc) => {
        this.repository_list = doc.list
        for(let drep of this.default_repository_list){
          let found = false
          for(let repo of this.repository_list){
            if(repo.url === drep.url && repo.name === drep.name){
              found = repo
              break
            }
          }
          if(!found){
            this.addRepository(drep)
          }
        }
        this.repository_names = []
        for(let r of this.repository_list){
          this.repository_names.push(r.name)
        }
        resolve(this.repository_list)
      }).catch((err) => {
        if(err.name != 'not_found'){
          console.error("Database Error", err)
        }
        else{
          console.log('Failed to load repository list', err)
        }
        this.repository_list = this.default_repository_list
        this.repository_names = []
        for(let r of this.repository_list){
          this.repository_names.push(r.name)
        }
        this.config_db.put({
          _id: 'repository_list',
          list: this.repository_list
        }).then(()=>{
          resolve(this.repository_list)
        }).catch(()=>{
          reject('Failed to load the repository list or save the default repositories.')
        })

        this.saveRepositoryList().then(()=>{
          resolve(this.repository_list)
        }).catch(reject)

      })
    })
  }
  saveRepositoryList(){
    return new Promise((resolve, reject)=>{
      let _rev = null
      this.config_db.get('repository_list').then((doc) => {
        _rev = doc._rev
      }).finally(()=>{
        this.config_db.put({
          _id: 'repository_list',
          _rev: _rev || undefined,
          list: this.repository_list,
        }).then(()=>{
          resolve(this.repository_list)
        }).catch((err) => {
          this.showMessage("Failed to save repository, database Error:" + err.toString())
          reject("Failed to save repository, database Error:" + err.toString())
        })
      })
    })
  }

  addRepository(repo){
    return new Promise((resolve, reject)=>{
      if(typeof repo === 'string'){
        repo = {name: repo, url: repo, description: repo}
      }
      if(!(repo.name && repo.url)){
        reject('You need to provide name and url')
        return
      }
      this.reloadRepository(repo).then((manifest)=>{
        repo.name = manifest.name || repo.name
        repo.description = manifest.description || repo.description
        const normalizedUrl = repo.url && repo.url.replace('https://github.com/', '').replace('http://github.com/', '')
        //remove existing repo if same url already exists
        for(let r of this.repository_list){
          if(r.url && r.url.replace('https://github.com/', '').replace('http://github.com/', '') === normalizedUrl){
            // remove it if already exists
            this.repository_list.splice( this.repository_list.indexOf(r), 1 )
            this.showMessage("Repository with the same url already exists.")
          }
        }
        // use repo url if name exists
        for(let r of this.repository_list){
          if(r.name === repo.name){
            repo.name = normalizedUrl
            break
          }
        }
        if(!(repo.name && repo.url)){
          reject('You need to provide name and url')
          return
        }
        this.repository_list.push(repo)
        this.repository_names = []
        for(let r of this.repository_list){
          this.repository_names.push(r.name)
        }
        this.saveRepositoryList().then(()=>{
          resolve(repo)
        }).catch(reject)

      }).catch(()=>{
        if(this.repository_names.indexOf(repo.name)>=0)
          this.repository_names.splice(this.repository_names.indexOf(repo.name), 1)
        this.showMessage("Failed to load repository from: " + repo.url)
        reject("Failed to load repository from: " + repo.url)
      })
    })
  }

  removeRepository(repo) {
    return new Promise((resolve, reject)=>{
      if(!repo || !(repo.name && repo.url)){
        reject('You need to provide name and url')
        return
      }
      let found = false
      for(let r of this.repository_list){
        if(r.url === repo.url || r.name === repo.name){
          found = r
        }
      }
      if (found) {
        const index = this.repository_list.indexOf(found)
        this.repository_list.splice(index, 1)
        this.repository_names = []
        for(let r of this.repository_list){
          this.repository_names.push(r.name)
        }

        this.saveRepositoryList().then(()=>{
          this.showMessage(`Repository has been deleted.`)
          resolve()
        }).catch(()=>{
          this.showMessage(`Error occured when removing repository.`)
          reject(`Error occured when removing repository.`)
        })
      }
      else{
        reject('Repository not found: ' + repo.name)
      }
    })
  }

  reloadRepository(repo){
    repo = repo || this.selected_repository
    return new Promise((resolve, reject)=>{
        this.getRepoManifest(repo.url).then((manifest)=>{
          this.available_plugins = manifest.plugins
          for (let i = 0; i < this.available_plugins.length; i++) {
            const ap = this.available_plugins[i]
            const ps = this.installed_plugins.filter((p) => {
              return ap.name === p.name
            })
            // mark as installed
            if(ps.length>0){
              ap.installed = true
              ap.tag = ps[0].tag
            }
          }
          this.selected_repository = repo
          resolve(manifest)
        }).catch(reject)
    })
  }

  loadWorkspaceList(){
    return new Promise((resolve, reject)=>{
      this.config_db.get('workspace_list').then((doc) => {
        this.workspace_list = doc.list
        this.selected_workspace = this.workspace_list[0]
        resolve(this.workspace_list)
      }).catch((err) => {
        if(err.name != 'not_found'){
          console.error("Database Error", err)
        }
        this.workspace_list = ['default']
        this.config_db.put({
          _id: 'workspace_list',
          list: this.workspace_list
        }).then(()=>{
          this.selected_workspace = this.workspace_list[0]
          resolve(this.workspace_list)
        }).catch(()=>{
          reject("Failed to load Plugin Engine list, database Error:" + err.toString())
        })
      })
    })
  }

  loadWorkspace(selected_workspace){
    return new Promise((resolve, reject)=>{
      selected_workspace = selected_workspace || this.selected_workspace
      const load_ = ()=>{
        try {
          this.event_bus.$emit('workspace_list_updated', this.workspace_list)
          this.db = new PouchDB(selected_workspace + '_workspace', {
            revs_limit: 2,
            auto_compaction: true
          })
          this.selected_workspace = selected_workspace
          resolve()
        } catch (e) {
          reject(e)
        }
      }
      if (!this.workspace_list.includes(selected_workspace)) {
        if (!this.workspace_list.includes(selected_workspace)) {
          this.workspace_list.push(selected_workspace)
        }
        this.saveWorkspaceList().then(()=>{
          load_()
        }).catch(reject)
      }
      else{
        load_()
      }
    })
  }

  saveWorkspaceList(){
    return new Promise((resolve, reject)=>{
      this.config_db.get('workspace_list').then((doc) => {
        this.config_db.put({
          _id: doc._id,
          _rev: doc._rev,
          list: this.workspace_list,
          default: 'default'
        }).then(resolve).catch((e)=>{
          reject(`Failed to save workspace, database Error: ${e.toString()}`)
        })
      }).catch((err) => {
        reject(`Failed to save workspaces, database Error: ${err.toString()}`)
      })
    })
  }

  removeWorkspace(w) {
    return new Promise((resolve, reject)=>{
      if (this.workspace_list.includes(w)) {
        const index = this.workspace_list.indexOf(w)
        this.workspace_list.splice(index, 1)
        this.saveWorkspaceList().then(()=>{
          resolve()
          if(this.selected_workspace === w.name){
            this.selected_workspace = null
          }
        }).catch(reject)
      }
    })
  }

  saveWorkflow(joy) {
    // remove if exists
    const name = prompt("Please enter a name for the workflow", "default");
    if (!name) {
      return
    }
    const data = {}
    data.name = name
    data._id = name + '_workflow'
    // delete data._references
    data.workflow = JSON.stringify(joy.top.data)
    this.db.get(data._id).then((doc) => {
      data._rev = doc._rev
    }).finally(() => {
      this.db.put(data).then(() => {
        this.workflow_list.push(data)
        this.showMessage( `Workflow "${name}" has been successfully saved.`)
      }).catch((err) => {
        this.showMessage('Failed to save the workflow.')
        console.error(err)
      })
    })

  }

  removeWorkflow(w) {
    this.db.get(w._id).then((doc) => {
      return this.db.remove(doc);
    }).then(() => {
      var index = this.workflow_list.indexOf(w);
      if (index > -1) {
        this.workflow_list.splice(index, 1);
      }
      this.showMessage(`Workflow "${w.name}" has been successfully removed.`)
    }).catch((err) => {
      this.showMessage('Failed to remove the workflow.')
      console.error(err)
    })
  }

  reloadDB(){
    return new Promise((resolve, reject) => {
      try {
        if(this.db){
          try {
              this.db.close().finally(()=>{
                this.db = new PouchDB(this.selected_workspace + '_workspace', {
                  revs_limit: 2,
                  auto_compaction: true
                })
                if(this.db){
                  resolve()
                }
                else{
                  reject('Failed to reload database.')
                }
              })
          } catch (e) {
            console.error('Failed to reload database: ', e)
            this.db = new PouchDB(this.selected_workspace + '_workspace', {
              revs_limit: 2,
              auto_compaction: true
            })
            if(this.db){
              resolve()
            }
            else{
              reject('Failed to reload database.')
            }
          }
        }
        else{
          this.db = new PouchDB(this.selected_workspace + '_workspace', {
            revs_limit: 2,
            auto_compaction: true
          })
          if(this.db){
            resolve()
          }
          else{
            reject('Failed to reload database.')
          }
        }
      } catch (e) {
        console.error('Failed to reload database.')
        reject('Failed to reload database.')
      }
    })
  }

  setInputLoaders(input_loaders){
    for(let inputs of input_loaders){
      this.wm.registerInputLoader(inputs.loader_key, inputs, inputs.loader)
    }
  }

  reloadPlugins() {
    return new Promise((resolve, reject) => {
      if (this.plugins) {
        for (let k in this.plugins) {
          if (this.plugins.hasOwnProperty(k)) {
            const plugin = this.plugins[k]
            if (typeof plugin.terminate === 'function') {
              try {
                plugin.terminate().then(()=>{this.update_ui_callback()})
              } catch (e) {
                console.error(e)
              }
            }
            this.plugins[k] = null
            this.plugin_names[plugin.name] = null
          }
        }
      }
      this.init()
      this.reloadDB().then(()=>{
        this.db.allDocs({
          include_docs: true,
          attachments: true,
          sort: 'name'
        }).then((result) => {
          this.workflow_list = []
          this.installed_plugins = []
          for (let i = 0; i < result.total_rows; i++) {
            const config = result.rows[i].doc
            if (config.workflow) {
              this.workflow_list.push(config)
            } else {
              config.installed = true
              this.installed_plugins.push(config)
              this.reloadPlugin(config).catch((e)=>{
                console.error(config, e)
                this.showMessage(`<${config.name}>: ${e.toString()}`)
              })
            }
          }
          resolve()
        }).catch((err) => {
          console.error(err)
          reject()
        });
      })
    })
  }

  async getPluginFromUrl(uri, scoped_plugins){
    scoped_plugins = scoped_plugins || this.available_plugins
    let selected_tag
    if(uri.includes('github') && uri.includes('/blob/')){
      uri = githubUrlRaw(uri)
    }
    // if the uri format is REPO_NAME:PLUGIN_NAME
    if(!uri.startsWith('http') && uri.includes('/') && uri.includes(':')){
      let [repo_name, plugin_name] = uri.split(':')
      selected_tag = plugin_name.split('@')[1]
      plugin_name = plugin_name.split('@')[0]
      plugin_name = plugin_name.trim()
      const repo_hashtag = repo_name.split('@')[1]
      repo_name = repo_name.split('@')[0]
      repo_name = repo_name.trim()
      assert(repo_name && plugin_name, 'Wrong URI format, it must be "REPO_NAME:PLUGIN_NAME"')
      const manifest = await this.getRepoManifest(repo_name, repo_hashtag)
      let found = null
      for(let p of manifest.plugins){
        if(p.name === plugin_name){
          found = p
          break
        }
      }
      if(!found){
        throw(`plugin not found ${repo_name}:${plugin_name}`)
      }
      uri = found.uri
      scoped_plugins = manifest.plugins
    }
    else if(!uri.match(url_regex)){
      let dep = uri.split('@')
      selected_tag = dep[1]
      const ps = scoped_plugins.filter((p) => {
        return dep[0] && p.name === dep[0].trim()
      });
      if (ps.length <= 0) {
        throw `Plugin "${dep[0]}" cannot be found in the repository.`
      }
      else{
        uri = ps[0].uri
      }
    }
    else{
      selected_tag = uri.split('.imjoy.html@')[1]
      if(selected_tag){
        uri = uri.split('@'+selected_tag)[0]
      }
    }
    if(!uri.split('?')[0].endsWith('.imjoy.html')){
      throw 'Plugin url must be ends with ".imjoy.html"'
    }
    const response = await axios.get(uri)
    if (!response || !response.data || response.data === '') {
      alert('failed to get plugin code from ' + uri)
      throw 'failed to get code.'
    }
    const code = response.data
    let config = this.parsePluginCode(code, {tag: selected_tag})
    config.uri = uri
    config.scoped_plugins = scoped_plugins
    return config
  }

  installPlugin(pconfig, tag, do_not_load){
    return new Promise((resolve, reject) => {
      let uri = typeof pconfig === 'string' ? pconfig : pconfig.uri
      let scoped_plugins = this.available_plugins
      if(pconfig.scoped_plugins){
        scoped_plugins = pconfig.scoped_plugins
        delete pconfig.scoped_plugins
      }
      //use the has tag in the uri if no hash tag is defined.
      if(!uri){
        reject('No url found for plugin ' + pconfig.name)
        return
      }
      // tag = tag || uri.split('@')[1]
      // uri = uri.split('@')[0]

      this.getPluginFromUrl(uri, scoped_plugins).then(async (config)=>{
        config.origin = pconfig.origin || uri
        if (!config) {
          console.error(`Failed to fetch the plugin from "${uri}".`)
          reject(`Failed to fetch the plugin from "${uri}".`)
          return
        }
        if (!SUPPORTED_PLUGIN_TYPES.includes(config.type)){
          reject('Unsupported plugin type: '+config.type)
          return
        }
        config.tag = tag || config.tag
        if(config.tag){
          // remove existing tag
          const sp = config.origin.split(':')
          if(sp[1]){
            if(sp[1].split('@')[1])
            config.origin = sp[0] + ':' + sp[1].split('@')[0]
          }
          // add a new tag
          config.origin = config.origin + '@' + config.tag
        }
        config._id = config.name && config.name.replace(/ /g, '_') || randId()
        config.dependencies = config.dependencies || []
        try{
          for (let i = 0; i < config.dependencies.length; i++) {
            await this.installPlugin({uri: config.dependencies[i], scoped_plugins: config.scoped_plugins || scoped_plugins}, null, do_not_load)
          }
          const template = await this.savePlugin(config)
          for (let p of this.available_plugins) {
            if(p.name === template.name && !p.installed){
              p.installed = true
              p.tag = tag
            }
          }
          this.showMessage(`Plugin "${template.name}" has been successfully installed.`)
          resolve(template)
          if(!do_not_load) this.reloadPlugin(template)
        }
        catch(error){
          alert(`Failed to install dependencies for ${config.name}: ${error}`)
          throw `Failed to install dependencies for ${config.name}: ${error}`
        }
      }).catch((e)=>{
        console.error(e)
        this.showMessage('Failed to download, if you download from github, please use the url to the raw file', 10)
        reject(e)
      })
    })
  }

  removePlugin(plugin){
    return new Promise((resolve, reject) => {
      // remove if exists
      this.db.get(plugin._id).then((doc) => {
        return this.db.remove(doc);
      }).then(() => {

        for (let i = 0; i < this.installed_plugins.length; i++) {
          if(this.installed_plugins[i].name === plugin.name){
            this.installed_plugins.splice(i, 1)
          }
        }
        for (let p of this.available_plugins) {
            if(p.name === plugin.name){
              p.installed = false
              p.tag = null
            }
        }
        resolve()
        this.showMessage(`"${plugin.name}" has been removed.`)
        this.unloadPlugin(plugin, true)
      }).catch((err) => {
        this.showMessage( err.toString() || "Error occured.")
        console.error('error occured when removing ', plugin, err)
        reject(err)
      });
    });
  }

  getPluginDocs(plugin_id){
    return new Promise((resolve, reject) => {
      this.db.get(plugin_id).then((doc) => {
        const pluginComp = parseComponent(doc.code)
        const docs = pluginComp.docs && pluginComp.docs[0] && pluginComp.docs[0].content
        resolve(docs)
      }).catch((err) => {
        reject(err)
      });
    })
  }

  getPluginSource(plugin_id){
    return new Promise((resolve, reject) => {
      this.db.get(plugin_id).then((doc) => {
        resolve(doc.code)
      }).catch((err) => {
        reject(err)
      });
    })
  }

  unloadPlugin(_plugin, temp_remove){
    const name = _plugin.name
    for (let k in this.plugins) {
      if (this.plugins.hasOwnProperty(k)) {
        const plugin = this.plugins[k]
        if(plugin.name === name){
            try {
              if(temp_remove){
                delete this.plugins[k]
                delete this.plugin_names[name]
              }
              plugin._unloaded = true
              this.unregister(plugin)
              if (typeof plugin.terminate === 'function') {
                plugin.terminate().then(()=>{this.update_ui_callback()})
              }
            } catch (e) {
              console.error(e)
            }
        }
      }
    }
    this.unregister(_plugin)
    if (typeof _plugin.terminate === 'function') {
      _plugin.terminate().then(()=>{this.update_ui_callback()})
    }
  }

  reloadPlugin(pconfig) {
    return new Promise((resolve, reject) => {
      try {
        this.unloadPlugin(pconfig, true)
        const template = this.parsePluginCode(pconfig.code, pconfig)
        template._id = pconfig._id
        template.engine_mode = pconfig.engine_mode

        if(template.type === 'collection'){
          return
        }
        this.unloadPlugin(template, true)
        let p

        if (template.type === 'window') {
          p = this.preLoadPlugin(template)
        } else {
          p = this.loadPlugin(template)
        }
        p.then((plugin) => {
          plugin._id = pconfig._id
          pconfig.name = plugin.name
          pconfig.type = plugin.type
          pconfig.plugin = plugin
          this.update_ui_callback()
          resolve(plugin)
        }).catch((e) => {
          pconfig.plugin = null
          reject(e)
        })
      } catch (e) {
        this.showMessage(e || "Error.", 15)
        reject(e)
      }
    })
  }

  savePlugin(pconfig) {
    return new Promise((resolve, reject) => {
      const code = pconfig.code
      try {
        const template = this.parsePluginCode(code, {tag: pconfig.tag})
        template.code = code
        template.origin = pconfig.origin
        template._id = template.name.replace(/ /g, '_')
        template.engine_mode = pconfig.engine_mode
        const addPlugin = (template) => {
          this.db.put(template).then(() => {
            for (let i = 0; i < this.installed_plugins.length; i++) {
              if(this.installed_plugins[i].name === template.name){
                this.installed_plugins.splice(i, 1)
              }
            }
            template.installed = true
            this.installed_plugins.push(template)
            resolve(template)
            this.showMessage(`${template.name } has been successfully saved.`)
            // this._sendToServiceWorker(template)
          }).catch((err) => {
            this.showMessage('Failed to save the plugin.', 15)
            console.error(err)
            reject('failed to save')
          })
        }
        // remove if exists
        this.db.get(template._id).then((doc) => {
          template._rev = doc._rev
          addPlugin(template)
        }).catch(() => {
          addPlugin(template)
        });
      } catch (e) {
        this.showMessage( e || "Error.", 15)
        reject(e)
      }
    })
  }

  reloadPythonPlugins(engine){

    for(let p of this.installed_plugins){
      if(p.type === 'native-python' && p.engine_mode === engine.id){
        this.reloadPlugin(p)
      }
      else if(p.type === 'native-python' && (!p.engine_mode || p.engine_mode === 'auto') && (!p.plugin || p.plugin._unloaded)){
        this.reloadPlugin(p)
      }
    }
  }

  unloadPythonPlugins(engine){
    for (let k in this.plugins) {
      if (this.plugins.hasOwnProperty(k)) {
        const plugin = this.plugins[k]
        if(plugin.type === 'native-python' && plugin.config.engine === engine){
          if(plugin.config.engine_mode === 'auto' && plugin._disconnected && plugin.code){
            this.reloadPlugin(plugin)
          }
          else{
            this.unloadPlugin(plugin, false)
          }
        }
      }
    }
  }

  parsePluginCode(code, config) {
    config = config || {}
    const uri = config.uri
    const tag = config.tag
    const origin = config.origin
    try {
      if (uri && uri.endsWith('.js')) {
        config.lang = config.lang || 'javascript'
        config.script = code
        config.style = null
        config.window = null
        config.tag = tag || null
      } else {
        const pluginComp = parseComponent(code)
        config = JSON.parse(pluginComp.config[0].content)
        config.scripts = []
        for (let i = 0; i < pluginComp.script.length; i++) {
          if (pluginComp.script[i].attrs.lang) {
            config.script = pluginComp.script[i].content
            config.lang = pluginComp.script[i].attrs.lang || 'javascript'
          }
          else{
            config.scripts.push(pluginComp.script[i])
          }
        }
        if(!config.script){
          config.script = pluginComp.script[0].content
          config.lang = pluginComp.script[0].attrs.lang || 'javascript'
        }
        config.tag = tag || config.tags && config.tags[0]
        // try to match the script with current tag
        for (let i = 0; i < pluginComp.script.length; i++) {
          if (pluginComp.script[i].attrs.tag === config.tag) {
            config.script = pluginComp.script[i].content
            config.lang = pluginComp.script[i].attrs.lang || 'javascript'
            break
          }
        }
        config.links = pluginComp.link || null
        config.windows = pluginComp.window || null
        config.styles = pluginComp.style || null
        config.docs = pluginComp.docs || null
        config.attachments = pluginComp.attachment || null
      }
      config._id = config._id || null
      config.uri = uri
      config.origin = origin
      config.code = code
      config.id = config.name.trim().replace(/ /g, '_') + '_' + randId()
      config.runnable = config.runnable === false ? false : true
      for (let i = 0; i < CONFIGURABLE_FIELDS.length; i++) {
          const obj = config[CONFIGURABLE_FIELDS[i]]
          if(obj && typeof obj === 'object' && !(obj instanceof Array)){
            if(config.tag){
              config[CONFIGURABLE_FIELDS[i]] = obj[config.tag]
              if(!obj.hasOwnProperty(config.tag)){
                console.log("WARNING: " + CONFIGURABLE_FIELDS[i] + " do not contain a tag named: " + config.tag)
              }
            }
            else{
              throw "You must use 'tags' with configurable fields."
            }
          }
      }
      config = upgradePluginAPI(config)
      if (!PLUGIN_SCHEMA(config)) {
        const error = PLUGIN_SCHEMA.errors
        console.error("Invalid plugin config: " + config.name, error)
        throw error
      }
      return config
    } catch (e) {
      console.error(e)
      throw "Failed to parse the content of the plugin."
    }
  }

  validatePluginConfig(config){
    if(config.name.indexOf('/')<0){
      return true
    }
    else{
      throw "Plugin name should not contain '/'."
    }
  }

  preLoadPlugin(template, rplugin) {
    const config = {
      _id: template._id,
      name: template.name,
      type: template.type,
      ui: template.ui,
      tag: template.tag,
      inputs: template.inputs,
      outputs: template.outputs,
      docs: template.docs,
      attachments: template.attachments,
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
      const _interface = _.assign({TAG: tconfig.tag, WORKSPACE: this.selected_workspace}, this.imjoy_api)

      // create a proxy plugin
      const plugin = new DynamicPlugin(tconfig, _interface, this.fm.api, true)
      plugin.api = {
        __jailed_type__: 'plugin_api',
        __id__: plugin.id,
        setup: async () => {
        },
        run: async (my) => {
          const c = _clone(template.defaults) || {}
          c.type = template.name
          c.name = template.name
          c.tag = template.tag
          // c.op = my.op
          c.data = my && my.data || {}
          c.config = my && my.config || {}
          c.id = my && my.id
          return await this.createWindow(null, c)
        }
      }
      try {
        this.register(plugin, config)
        this.plugins[plugin.id] = plugin
        this.plugin_names[plugin.name] = plugin
        this.event_bus.$emit('plugin_loaded', plugin)
        resolve(plugin)
      } catch (e) {
        reject(e)
      }
    })
  }

  loadPlugin(template, rplugin) {
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
      config._id = template._id
      config.engine_mode = template.engine_mode || 'auto'

      if (template.type === 'native-python') {
        config.engine = this.em.getEngine(config.engine_mode)
        if (!config.engine || !config.engine.connected ) {
          console.error("Please connect to the Plugin Engine 🚀.")
        }
      }
      else{
        config.engine = null
      }
      const tconfig = _.assign({}, template, config)
      tconfig.workspace = this.selected_workspace
      const _interface = _.assign({TAG: tconfig.tag, WORKSPACE: this.selected_workspace, ENGINE_URL: config.engine && config.engine.url}, this.imjoy_api)
      const plugin = new DynamicPlugin(tconfig, _interface, this.fm.api)
      plugin.whenConnected(() => {
        if (!plugin.api) {
          console.error('Error occured when loading plugin.')
          this.showMessage('Error occured when loading plugin.')
          reject('Error occured when loading plugin.')
          throw 'Error occured when loading plugin.'
        }

        if (template.type) {
          this.register(plugin, template)
        }
        if (template.extensions && template.extensions.length > 0) {
          this.registerExtension(template.extensions, plugin)
        }
        if(plugin.api.setup){
          plugin.api.setup().then(() => {
            this.event_bus.$emit('plugin_loaded', plugin)
            resolve(plugin)
          }).catch((e) => {
            console.error('error occured when loading plugin ' + template.name + ": ", e)
            this.showMessage(`<${template.name}>: ${e}`, 15)
            reject(e)
            plugin.terminate().then(()=>{this.update_ui_callback()})
          })
        }
        else{
          this.showMessage(`No "setup()" function is defined in plugin "${plugin.name}".`)
          reject(`No "setup()" function is defined in plugin "${plugin.name}".`)
        }
      });
      plugin.whenFailed((e) => {
        plugin.error(e)
        if(e){
          this.showMessage(`<${template.name}>: ${e}`)
        }
        else{
          this.showMessage(`Error occured when loading ${template.name}.`)
        }
        console.error('error occured when loading ' + template.name + ": ", e)
        plugin.terminate().then(()=>{this.update_ui_callback()})
        reject(e)
      });
      plugin.docs = template.docs
      plugin.attachments = template.attachments
      this.plugins[plugin.id] = plugin
      this.plugin_names[plugin.name] = plugin
    })
  }

  normalizeUI(ui){
    if(!ui){
      return ''
    }
    let normui = ''
    if(Array.isArray(ui)){
      for(let it of ui){
        if(typeof it === 'string')
          normui =  normui + it + '<br>'
        else if(typeof it === 'object'){
          for(let k in it){
            if(typeof it[k] === 'string')
              normui =  normui + k + ': ' + it[k] + '<br>'
            else
              normui =  normui + k + ': ' + JSON.stringify(it[k])+ '<br>'
          }
        }
        else
          normui =  normui + JSON.stringify(it) + '<br>'
      }
    }
    else if(typeof ui === 'object'){
      throw "ui can not be an object, you can only use a string or an array."
    }
    else if(typeof ui === 'string'){
      normui = ui.trim()
    }
    else{
      normui = ''
      console.log('Warining: removing ui string.')
    }
    return normui
  }

  renderWindow(pconfig) {
    return new Promise((resolve, reject) => {
      const tconfig = _.assign({}, pconfig.plugin, pconfig)
      tconfig.workspace = this.selected_workspace
      const _interface = _.assign({TAG: tconfig.tag, WORKSPACE: this.selected_workspace}, this.imjoy_api)
      const plugin = new DynamicPlugin(tconfig, _interface, this.fm.api)
      if(pconfig.focus) pconfig.focus()
      plugin.whenConnected(() => {
        if (!plugin.api) {
          console.error('the window plugin seems not ready.')
          reject('the window plugin seems not ready.')
          return
        }
        plugin.api.setup().then(() => {
          //asuming the data._op is passed from last op
          pconfig.data = pconfig.data || {}
          pconfig.data._source_op = pconfig.data && pconfig.data._op
          pconfig.data._op = plugin.name
          pconfig.data._workflow_id = pconfig.data && pconfig.data._workflow_id
          pconfig.plugin = plugin
          pconfig.update = plugin.api.run
          if(plugin.config.runnable && !plugin.api.run){
            const error_text = 'You must define a `run` function for '+plugin.name+' or set its `runnable` field to false.'
            reject(error_text)
            plugin.error(error_text)
            return
          }
          if(plugin.api.run){
            plugin.api.run(this.filter4plugin(pconfig)).then((result)=>{
              if(result){
                for(let k in result){
                  pconfig[k] = result[k]
                }
              }
              resolve(plugin)
            }).catch((e) => {
              console.error('Error in the run function of plugin ' + plugin.name, e)
              plugin.error(`<${plugin.name}>: (e.toString() || "Error.")`)
              reject(e)
            })
          }
          else{
            resolve(plugin)
          }
        }).catch((e) => {
          console.error('Error occured when loading the window plugin ' + pconfig.name + ": ", e)
          plugin.error(`Error occured when loading the window plugin ${pconfig.name}: ${e.toString()}`)
          plugin.terminate().then(()=>{this.update_ui_callback()})
          reject(e)
        })
      });
      plugin.whenFailed((e) => {
        console.error('error occured when loading ' + pconfig.name + ":", e)
        plugin.error(`Error occured when loading ${pconfig.name}: ${e}.`)
        plugin.terminate().then(()=>{this.update_ui_callback()})
        reject(e)
      });
    })
  }

  plugin2joy(my){
    if(!my) return null
    //conver config--> data  data-->target
    const res = {}
    res.__jailed_type__ = my.__jailed_type__
    if(my.type && my.data){
      res.data = my.config
      res.target = my.data
      res.target.name = my.name || ''
      res.target.type = my.type || ''
    }
    else{
      res.data = null
      res.target = my
    }

    res.target = res.target || {}
    if(Array.isArray(res.target) && res.target.length>0){
      if(my.select !== undefined && res.target[my.select]){
        res.target = res.target[my.select]
      }
    }
    if(typeof res.target === 'object'){
      res.target._variables = my._variables || {}
      res.target._workflow_id = my._workflow_id || null
      res.target._op = my._op || null
      res.target._source_op = my._source_op || null
      res.target._transfer = my._transfer || false
      if(Object.keys(res.target).length>4){
        return res
      }
      else{
        return null
      }
    }
    else {
      return res
    }
  }

  filter4plugin(my){
    return my && {
      _variables: my._variables || null,
      _op: my._op,
      _source_op: my._source_op,
      _transfer: my._transfer,
      _workflow_id: my._workflow_id,
      config: my.config,
      data: my.data,
    }
  }

  joy2plugin(my){
    //conver data-->config target--> data
    if(!my) return null;
    my.target = my.target || {}
    const ret = {
      __jailed_type__: my.__jailed_type__,
      _variables: my.target._variables || null,
      _op: my.target._op,
      _source_op: my.target._source_op,
      _transfer: my.target._transfer,
      _workflow_id: my.target._workflow_id,
      config: my.data,
      data: my.target,
      name: my.target.name || '',
      type: my.target.type || ''
    }
    delete my.target._op
    delete my.target._workflow_id
    delete my.target._variables
    delete my.target._source_op
    delete my.target._transfer

    return ret
  }

  getRepoManifest(url, hashtag){
    return new Promise((resolve, reject)=>{
      const re = new RegExp('^[^/.]+/[^/.]+$')
      let repository_url
      let repo_origin
      if(url.match(re)){
        repo_origin = url
        if(hashtag){
          url = url + '/tree/'+ hashtag
          repo_origin = repo_origin + '@' + hashtag
        }
        repository_url = githubImJoyManifest('https://github.com/'+url)
      }
      else if(url.includes('github.com')){
        repository_url = githubImJoyManifest(url)
        repo_origin = githubRepo(url)
      }
      else{
        repository_url = url
        repo_origin = repository_url
      }
      axios.get(repository_url).then(response => {
        if (response && response.data && response.data.plugins) {
          const manifest = response.data
          manifest.plugins = manifest.plugins.filter((p) => {
            return !p.disabled
          })
          if(!manifest.uri_root.startsWith('http')){
            manifest.uri_root = repository_url.replace(new RegExp('manifest.imjoy.json$'), _.trim(manifest.uri_root, '/'));
          }
          for (let i = 0; i < manifest.plugins.length; i++) {
              const p = manifest.plugins[i]
              p.uri = p.uri || p.name + '.imjoy.html'
              p.origin = repo_origin + ':' + p.name
              if (!p.uri.startsWith(manifest.uri_root) && !p.uri.startsWith('http')) {
                p.uri = manifest.uri_root + '/' + p.uri
              }
              p._id = p._id || p.name.replace(/ /g, '_')
          }
          resolve(manifest)
        }
        else{
          reject('failed to load url: ' + repository_url)
        }
      }).catch(reject)
    })
  }

  destroy(){
    for (let k in this.plugins) {
      if (this.plugins.hasOwnProperty(k)) {
        const plugin = this.plugins[k]
        try {
          if (typeof plugin.terminate === 'function') plugin.terminate()
        } catch (e) {

        }
      }
    }
  }

  //#################ImJoy API functions##################
  register(plugin, config) {
    try {
      if(!plugin) throw "Plugin not found."
      config = _clone(config)
      config.name = config.name || plugin.name
      config.show_panel = config.show_panel || false
      config.ui = this.normalizeUI(config.ui)
      if(plugin.name === config.name){
        config.ui = config.ui || plugin.config.description
      }
      config.inputs = config.inputs || null
      config.outputs = config.outputs || null
      if (!REGISTER_SCHEMA(config)) {
        const error = REGISTER_SCHEMA.errors
        console.error("Error occured during registering " + config.name, error)
        throw error
      }

      const plugin_name = plugin.name
      const op_name = config.name
      const op_key = op_name === plugin_name ? plugin_name : plugin_name+'/'+op_name
      const joy_template = {
        name: config.name,
        tags: ["op", "plugin"],
        type: op_key,
        init: config.ui
      }
      // save type to tags
      if(config.type === 'window'){
        joy_template.tags.push('window')
      }
      else if(config.type === 'native-python'){
        joy_template.tags.push('python')
      }
      else if(config.type === 'web-worker'){
        joy_template.tags.push('web-worker')
      }
      else if(config.type === 'web-python'){
        joy_template.tags.push('web-python')
      }
      else if(config.type === 'iframe'){
        joy_template.tags.push('iframe')
      }
      let run = null
      if(config.run && typeof config.run === 'function'){
        run = config.run
      }
      else{
        run = plugin && plugin.api && plugin.api.run
      }
      if (!plugin || !run) {
        console.log("WARNING: no run function found in the config, this op won't be able to do anything: " + config.name)
        joy_template.onexecute = () => {
          plugin.log("WARNING: no run function defined.")
        }
      } else {
        const onexecute = async (my) => {
          // my.target._workflow_id = null;
          try {
            const result = await run(this.joy2plugin(my))
            return this.plugin2joy(result)
          } catch (e) {
            plugin.error(e.toString())
            throw e
          }
        }
        joy_template.onexecute = onexecute
      }

      if(config.update && typeof config.update === 'function'){
        const onupdate = async (my) => {
          // my.target._workflow_id = null;
          const result = await config.update(this.joy2plugin(my))
          return this.plugin2joy(result)
        }
        joy_template.onupdate = debounce(onupdate, 300)
      }
      else if(plugin && plugin.api && plugin.api.update){
        const onupdate = async (my) => {
          // my.target._workflow_id = null;
          const result = await plugin.api.update(this.joy2plugin(my))
          return this.plugin2joy(result)
        }
        joy_template.onupdate = debounce(onupdate, 300)
      }

      if (!JOY_SCHEMA(joy_template)) {
        const error = JOY_SCHEMA.errors
        console.error("Error occured during registering op to joy " + joy_template.name, error)
        throw error
      }
      Joy.add(joy_template);

      const op_config = {
        plugin_id: plugin.id,
        name: joy_template.name,
        ui: "{id: '__op__', type: '" + joy_template.type + "'}",
        onexecute: joy_template.onexecute
      }
      plugin.ops = plugin.ops || {}
      plugin.ops[config.name] = op_config

      if (config.inputs){
        try {
          if((config.inputs.type != 'object' || !config.inputs.properties) && (config.inputs.type != 'array' || !config.inputs.items)){
            if(typeof config.inputs === 'object'){
              config.inputs = {properties: config.inputs, type: 'object'}
            }
            else{
              throw "inputs schema must be an object."
            }
          }
          // set all the properties as required by default
          if(config.inputs.type === 'object' && config.inputs.properties && !config.inputs.required){
            config.inputs.required = Object.keys(config.inputs.properties)
          }
          const sch = ajv.compile(config.inputs)

          this.registered.inputs[op_key] =  {loader_key: op_key, op_name: op_name, plugin_name: plugin_name, schema: sch}
          this.registered.loaders[op_key] = async (target) => {
              let config = {}
              if (plugin.config && plugin.config.ui) {
                config = await this.imjoy_api.showDialog(plugin, plugin.config)
              }
              target.transfer = target.transfer || false
              target._source_op = target._op
              target._op = op_name
              target._workflow_id = target._workflow_id || 'data_loader_'+op_name.trim().replace(/ /g, '_')+randId()
              const my = {op:{name: op_name}, target: target, data: config}
              const result = await plugin.api.run(this.joy2plugin(my))
              if(result){
                const res = this.plugin2joy(result)
                if (res) {
                  const w = {}
                  w.name = res.name || 'result'
                  w.type = res.type || 'imjoy/generic'
                  w.config = res.data || {}
                  w.data = res.target || {}
                  await this.createWindow(plugin, w)
                }
              }
          }
          this.wm.registerInputLoader(op_key, this.registered.inputs[op_key], this.registered.loaders[op_key])

        } catch (e) {
          console.error(`error occured when parsing the inputs schema of "${config.name}"`, e)
        }
      }
      if (config.outputs){
        try {
          if(config.outputs.type != 'object' || !config.outputs.properties){
            if(typeof config.outputs === 'object'){
              config.outputs = {properties: config.outputs, type: 'object'}
            }
            else{
              throw "inputs schema must be an object."
            }
          }
          // set all the properties as required by default
          if(config.outputs.type === 'object' && config.outputs.properties && !config.outputs.required){
            config.outputs.required = Object.keys(config.outputs.properties)
          }
          const sch = ajv.compile(config.outputs)
          this.registered.outputs[op_key] =  {op_name: config.name, plugin_name: plugin.name, schema: sch}
        } catch (e) {
          console.error(`error occured when parsing the outputs schema of "${config.name}"`, e)
        }
      }

      this.registered.ops[op_key] = op_config
      this.registered.windows[config.name] = plugin.config
      this.event_bus.$emit('op_registered', op_config)
      return true
    } catch (e) {
      console.error(e)
      throw e
    }

  }

  unregister(plugin, config) {
    if(!plugin) throw "Plugin not found."
    const plugin_name = plugin.name
    if(!config){
      if(plugin.ops && Object.keys(plugin.ops).length>0){
        for(let k in plugin.ops){
          const op = plugin.ops[k]
          if(op.name) this.unregister(plugin, op.name)
        }
      }
      if(plugin.name) this.unregister(plugin, plugin.name)
      return
    }
    else{
      const op_name = typeof config === 'string'? config : config.name
      const op_key = op_name === plugin_name ? plugin_name : plugin_name+'/'+op_name
      if(this.registered.inputs[op_key]) delete this.registered.inputs[op_key]
      if(this.registered.loaders[op_key]) delete this.registered.loaders[op_key]
      if(op_name === plugin_name  && this.registered.windows[plugin_name]) delete this.registered.windows[plugin_name]
      if(this.registered.ops[op_key]) delete this.registered.ops[op_key]
      if(plugin.ops && plugin.ops[op_name]) delete plugin.ops[op_name]
      this.wm.unregisterInputLoader(op_key)
      Joy.remove(op_name)
    }
  }

  createWindow(_plugin, wconfig) {
    return new Promise((resolve, reject) => {
      wconfig.data = wconfig.data || null
      wconfig.panel = wconfig.panel || null
      if (!WINDOW_SCHEMA(wconfig)) {
        const error = WINDOW_SCHEMA.errors
        console.error("Error occured during creating window ", wconfig, error)
        throw error
      }
      if (wconfig.type && wconfig.type.startsWith('imjoy/')) {
        wconfig.id = 'imjoy_'+randId()
        wconfig.name = wconfig.name || 'untitled window'
        this.wm.addWindow(wconfig).then((wid)=>{
          const window_plugin_apis = {
            __jailed_type__: 'plugin_api',
            __id__: wid,
            run: (wconfig)=>{
              const w = this.wm.window_ids[wid]
              for(let k in wconfig){
                w[k] = wconfig[k]
              }
            }
          }
          resolve(window_plugin_apis)
        })
      } else {
        const window_config = this.registered.windows[wconfig.type]
        if (!window_config) {
          console.error('no plugin registered for window type: ', wconfig.type)
          throw 'no plugin registered for window type: ', wconfig.type
        }
        const pconfig = wconfig
        //generate a new window id
        pconfig.id = pconfig.id || window_config.id + '_' + randId()

        pconfig.window_type = pconfig.type
        //assign plugin type ('window')
        pconfig.type = window_config.type
        if (pconfig.type != 'window') {
          throw 'Window plugin must be with type "window"'
        }

        // this is a unique id for the iframe to attach
        pconfig.iframe_container = pconfig.window_container || 'plugin_window_' + pconfig.id + randId()
        pconfig.iframe_window = null
        pconfig.plugin = window_config

        if (!WINDOW_SCHEMA(pconfig)) {
          const error = WINDOW_SCHEMA.errors
          console.error("Error occured during creating window ", pconfig, error)
          throw error
        }
        if(pconfig.window_container){
          Vue.nextTick(()=>{
            this.renderWindow(pconfig).then((wplugin)=>{
              pconfig.onclose = ()=>{
                return wplugin.terminate()
              }
              wplugin.api.close = ()=>{
                return pconfig.onclose()
              }
              resolve(wplugin.api)
            }).catch(reject)
          })
        }
        else{
          this.wm.addWindow(pconfig).then((wid)=>{
            this.wm.window_ids[wid].loading = true
            this.wm.window_ids[wid].refresh()
            this.renderWindow(pconfig).then((wplugin)=>{
              pconfig.onclose = ()=>{
                return wplugin.terminate()
              }
              wplugin.api.close = async ()=>{
                const w = this.wm.window_ids[wplugin.id]
                try {
                  await pconfig.onclose()
                } finally {
                  this.wm.closeWindow(w)
                }
              }
              this.wm.window_ids[wid].loading = false
              this.wm.window_ids[wid].refresh()
              resolve(wplugin.api)
            }).catch((e)=>{
              this.wm.window_ids[wid].loading = false
              this.wm.window_ids[wid].refresh()
              reject(e)
            })
            
          })
        }
      }
    })
  }

  async callPlugin(_plugin, plugin_name, function_name) {
    const target_plugin = this.plugin_names[plugin_name]
    if(target_plugin){
      if(!target_plugin.api[function_name]){
        throw `function "${function_name}" of ${plugin_name} is not available.`
      }
      return await target_plugin.api[function_name].apply(null, Array.prototype.slice.call(arguments, 3, arguments.length))
    }
    else{
      throw `plugin with type ${plugin_name} not found.`
    }
  }

  async getPlugin(_plugin, plugin_name) {
    const target_plugin = this.plugin_names[plugin_name]
    if(target_plugin){
      return target_plugin.api
    }
    else{
      throw `plugin with type ${plugin_name} not found.`
    }
  }

  async runPlugin(_plugin, plugin_name, my) {
    if(!_plugin || !_plugin.id){
      throw 'source plugin is not available.'
    }
    const target_plugin = this.plugin_names[plugin_name]
    if(target_plugin){
      return await target_plugin.api.run(my || {})
    }
    else{
      throw 'plugin with type '+plugin_name+ ' not found.'
    }
  }

  setPluginConfig(plugin, name, value){
    if(!plugin) throw "setConfig Error: Plugin not found."
    if(name.startsWith('_') && plugin.config.hasOwnProperty(name.slice(1))){
      throw `'${name.slice(1)}' is a readonly field defined in <config> block, please avoid using it`
    }
    if(value){
      return localStorage.setItem("config_"+plugin.name+'_'+name, value)
    }
    else{
      return localStorage.removeItem("config_"+plugin.name+'_'+name)
    }
  }

  getPluginConfig(plugin, name){
    if(!plugin) throw "getConfig Error: Plugin not found."
    if(name.startsWith('_') && plugin.config.hasOwnProperty(name.slice(1))){
      return plugin.config[name.slice(1)]
    }
    else{
      return localStorage.getItem("config_"+plugin.name+'_'+name)
    }
  }

  getAttachment(plugin, name){
    if(plugin.config.attachments){
      for (let i = 0; i < plugin.config.attachments.length; i++) {
        if (plugin.config.attachments[i].attrs.name === name) {
          return plugin.config.attachments[i].content
        }
      }
    }
    else{
      return null
    }
  }

  onClose(_plugin, cb){
    _plugin.onClose(cb)
  }

}
