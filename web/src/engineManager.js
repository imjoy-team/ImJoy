import io from 'socket.io-client'
import {
  assert
} from './utils.js'

export class EngineManager {
  constructor({event_bus=null, show_message_callback=null}){
    this.event_bus = event_bus
    assert(this.event_bus)
    this.socket = null
    this.engine_status = {connection: 'Disconnected'}
    this.show_message_callback = show_message_callback
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
    if (this.socket&&this.engine_connected) {
      return
      //this.socket.disconnect()
    }
    //enforcing 127.0.0.1 for avoid security restrictions
    url = url.replace('localhost', '127.0.0.1')
    token = token && token.trim() || ''
    this.engine_status.connection = 'Connecting...'
    this.engine_status.url = url
    if(!auto) this.showMessage('Trying to connect to the plugin engine...')
    const socket = io(url);
    const timer = setTimeout(() => {
      if (!this.engine_connected) {
        this.engine_status.connection = 'Plugin Engine is not connected.'
        if(!auto) this.showMessage('Failed to connect, please make sure you have started the plugin engine.')

        if(auto) socket.disconnect()
      }
    }, 2500)

    if(!auto) this.showPluginEngineInfo = true

    socket.on('connect', (d) => {
      clearTimeout(timer)
      socket.emit('register_client', {id: this.client_id, token: token, session_id: this.engine_session_id}, (ret)=>{
        if(ret.success){
          const connect_client = ()=>{
            this.socket = socket
            this.engine_connected = true
            this.showPluginEngineInfo = false
            this.engine_status.connection = 'Connected.'
            this.connection_token = token
            localStorage.setItem("imjoy_connection_token", token);
            localStorage.setItem("imjoy_engine_url", url)
            this.showMessage('Plugin Engine is connected.')
            // console.log('plugin engine connected.')
            this.event_bus.$emit('engine_connected', d)

          }

          if(ret.message && ret.confirmation){
            this.permission_message = ret.message
            this.resolve_permission = connect_client
            this.reject_permission = ()=>{
              socket.disconnect()
              console.log('you canceled the connection.')
            }
            this.showPluginEngineInfo = false
            this.showPermissionConfirmation = true
          }
          else{
            connect_client()
          }
          // this.listEngineDir()
        }
        else{
          socket.disconnect()
          if(ret.no_retry && ret.reason){
            this.showStatus('Failed to connect: ' + ret.reason)
            this.showMessage('Failed to connect: ' + ret.reason)
          }
          else{
            this.showPluginEngineInfo = true
            if(ret.reason) this.showMessage('Failed to connect: ' + ret.reason)
            console.error('Failed to connect to the plugin engine.', ret.reason)
          }
        }
      })

    })
    socket.on('disconnect', () => {
      // console.log('plugin engine disconnected.')
      this.engine_connected = false
      this.showMessage('Plugin Engine disconnected.')
      this.engine_status.connection = 'Disconnected.'
      this.socket = null
      this.event_bus.$emit('engine_disconnected')
    });
    this.socket = socket
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
