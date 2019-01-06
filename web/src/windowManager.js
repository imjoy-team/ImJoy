import {
  randId,
  assert
} from './utils.js'


export class WindowManager {
  constructor({event_bus=null, show_message_callback=null, add_window_callback=null}){
    this.event_bus = event_bus
    assert(this.event_bus)
    this.windows = []
    this.window_ids = {}
    this.active_windows = []
    this.show_message_callback = show_message_callback
    this.add_window_callback = add_window_callback
    this.selected_window = null
    this.registered_inputs = {}
    this.registered_loaders = {}
    this.default_window_pos = {
      i: 0,
      x: 0,
      y: 0,
      w: 5,
      h: 5
    }
  }

  showMessage(msg, duration){
    if(this.show_message_callback){
      this.show_message_callback(msg, duration)
    }
    else{
      console.log(`WINDOW MESSAGE: ${msg}`)
    }
  }

  generateGridPosition(config) {
    config.i = this.default_window_pos.i.toString()
    config.w = config.w || this.default_window_pos.w
    config.h = config.h || this.default_window_pos.h
    config.x = this.default_window_pos.x
    config.y = this.default_window_pos.y
    this.default_window_pos.x = this.default_window_pos.x + this.default_window_pos.w
    if (this.default_window_pos.x >= 20) {
      this.default_window_pos.x = 0
      this.default_window_pos.y = this.default_window_pos.y + this.default_window_pos.h
    }
    this.default_window_pos.i = this.default_window_pos.i + 1
  }

  getDataLoaders(data){
    const loaders = {}
    // find all the plugins registered for this type
    for (let k in this.registered_inputs) {
      if (this.registered_inputs.hasOwnProperty(k)) {
        // const error = this.registered_inputs[k].schema.errors(data)
        // console.error("schema mismatch: ", data, error)
        try {
          if (this.registered_inputs[k].schema(data) && this.registered_inputs[k].loader_key) {
            const plugin_name = this.registered_inputs[k].plugin_name
            const loader_key = this.registered_inputs[k].loader_key
            const plugin_exists = this.plugin_names[plugin_name] || plugin_name === '__internel__'
            if(plugin_exists && this.registered_loaders[loader_key]){
              loaders[loader_key] = loader_key
            }
          }
        } catch (e) {
          // console.error('error with validation with', k, e)
        }
      }
    }
    return loaders
  }

  addWindow(w){
    return new Promise((resolve, reject)=>{
      try {
        w.id = w.id || w.name + randId()
        w.loaders = this.getDataLoaders(w.data)
        this.generateGridPosition(w)
        this.windows.push(w)
        this.window_ids[w.id] = w
        if(this.window_mode === 'single'){
          this.selectWindow(w)
        }
        if(this.add_window_callback){
          this.add_window_callback(w).then(()=>{
            this.event_bus.$emit('add_window', w)
            resolve(w.id)
          })
        }
        else{
          this.event_bus.$emit('add_window', w)
          resolve(w.id)
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  selectWindow(w){
    for (let i = 0; i < this.active_windows.length; i++) {
      this.active_windows[i].selected = false
      this.active_windows[i].refresh()
    }
    this.selected_window = w
    w.selected = true
    console.log('activate window: ', [w])
    this.active_windows = [w]
    w.refresh()
  }

  closeWindow(w){
    this.windows.splice(this.windows.indexOf(w), 1)
    delete this.window_ids[w.id]
    if(w.selected || this.selected_window===w){
      w.selected = false
      if(this.window_mode === 'single'){
        this.selected_window = this.windows[0]
      }
      else{
        this.selected_window = null
      }
    }
    w.refresh()
    this.event_bus.$emit('close_window', w)
  }

  resizeAll(){
    for (var i = this.windows.length; i--;) {
      try {
        this.windows[i].resize()
      } catch (e) {
      }
    }
  }

  closeAll() {
    this.default_window_pos = {
      i: 0,
      x: 0,
      y: 0,
      w: 5,
      h: 5
    }
    this.status_text = ''

    for (var i = this.windows.length; i--;) {
      if (this.windows[i].type != 'imjoy/plugin-editor') {
          // delete this.window_ids[this.windows[i].id]
          // this.windows.splice(i, 1);
          this.closeWindow(this.windows[i])
      }
    }
  }

  destroy(){
    this.disconnectEngine()
  }
}
