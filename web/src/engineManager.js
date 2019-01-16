import io from 'socket.io-client'
import {
  assert
} from './utils.js'

export class EngineManager {
  constructor({event_bus=null, show_message_callback=null, update_ui_callback=null, show_engine_callback=null}){
    this.event_bus = event_bus
    assert(this.event_bus)
    this.socket = null
    this.engine_status = {connection: 'Disconnected'}
    this.show_message_callback = show_message_callback
    this.update_ui_callback = update_ui_callback || function (){}
    this.show_engine_callback = show_engine_callback || function(){}
  }
  getFileUrl(config) {
    return new Promise((resolve, reject)=>{
      try {
        this.socket.emit('get_file_url', config, resolve)
      } catch (e) {
        reject(e)
      }
    })
  }

  getFilePath(config) {
    return new Promise((resolve, reject)=>{
      try {
        this.socket.emit('get_file_path', config, resolve)
      } catch (e) {
        reject(e)
      }
    })
  }

  showMessage(msg, duration){
    if(this.show_message_callback){
      this.show_message_callback(msg, duration)
    }
    else{
      console.log(`ENGINE MESSAGE: ${msg}`)
    }
  }

  connectEngine(url, token, auto) {
    if (this.socket && this.connected && this.connected_url_token_ === (url + token)) {
      return
      //this.socket.disconnect()
    }
    //enforcing 127.0.0.1 for avoid security restrictions
    url = url.replace('localhost', '127.0.0.1')
    token = token && token.trim() || ''
    let reason = ''
    this.connected = false
    this.engine_status.connection = 'Connecting...'
    this.engine_status.url = url
    if(!auto) this.showMessage('Trying to connect to the plugin engine...')
    const socket = io(url);
    const timer = setTimeout(() => {
      if (!this.connected) {
        this.engine_status.connection = 'Plugin Engine is not connected.'
        if(!auto) this.showMessage('Failed to connect, please make sure you have started the plugin engine.')
        if(auto) socket.disconnect()
      }
    }, 2500)

    if(!auto) {this.show_engine_callback(true)}

    socket.on('connect', (d) => {
      clearTimeout(timer)
      socket.emit('register_client', {id: this.client_id, token: token, session_id: this.engine_session_id}, (ret)=>{
        if(ret.success){
          const connect_client = ()=>{
            this.socket = socket
            this.connected = true
            this.connected_url_token_ = url + token
            this.show_engine_callback(false)
            this.engine_status.connection = 'Connected.'
            this.connection_token = token
            localStorage.setItem("imjoy_connection_token", token);
            localStorage.setItem("imjoy_engine_url", url)
            this.showMessage(`Successfully connected to the Plugin Engine 🚀 (${url}).`)
            // console.log('plugin engine connected.')
            this.event_bus.$emit('engine_connected', d)
            this.update_ui_callback()
          }

          if(ret.message && ret.confirmation){
            this.show_engine_callback(true, ret.message, connect_client,  ()=>{
              socket.disconnect()
              console.log('you canceled the connection.')
            })
          }
          else{
            connect_client()
          }
          // this.listEngineDir()
        }
        else{
          reason = ret.reason
          if(ret.no_retry && ret.reason){
            this.showStatus('Failed to connect: ' + ret.reason)
            this.showMessage('Failed to connect: ' + ret.reason)
          }
          else{
            this.show_engine_callback(true)
            if(ret.reason) this.showMessage('Failed to connect: ' + ret.reason)
            console.error('Failed to connect to the plugin engine.', ret.reason)
          }
          socket.disconnect()
        }
      })

    })
    socket.on('disconnect', () => {
      if(this.connected){
        this.showMessage('Plugin Engine disconnected.')
      }
      else{
        if(reason){
          this.showMessage('Failed to connect: ' + reason)
        }
        else{
          this.showMessage('Failed to connect to the plugin engine')
        }
      }

      this.engine_status.connection = 'Disconnected.'
      this.socket = null
      this.connected = false
      this.event_bus.$emit('engine_disconnected')
    });
  }

  updateEngineStatus() {
    return new Promise((resolve, reject) => {
      this.socket.emit('get_engine_status', {}, (ret)=>{
        if(ret.success){
          this.engine_status.plugin_num = ret.plugin_num
          this.engine_status.plugin_processes = ret.plugin_processes
          resolve(ret)
        }
        else{
          this.showMessage(`Failed to get engine status: ${ret.error}`)
          reject(ret.error)
        }
      })
    })
  }

  killPluginProcess(p){
    return new Promise((resolve, reject) => {
      this.socket.emit('kill_plugin_process', {pid: p && p.pid, all: !p}, (ret)=>{
        if(ret.success){
          this.updateEngineStatus()
          resolve(ret)
        }
        else{
          this.showMessage(`Failed to get engine status: ${ret.error}`)
          reject(ret.error)
        }
      })
    })
  }

  disconnectEngine() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }

  listEngineDir(path, type, recursive){
    return new Promise((resolve, reject) => {
      this.socket.emit('list_dir', {path: path || '~', type: type || 'file', recursive: recursive || false}, (ret)=>{
        if(ret.success){
          resolve(ret)
        }
        else{
          this.showMessage(`Failed to list dir: ${path} ${ret.error}`)
          reject(ret.error)
        }
      })
    })
  }

  destroy(){
    this.disconnectEngine()
  }
}
