class LookupTablePlugin {
  setup() {
    this._init=''
    api.createOp({
      name: "apply LUT",
      type: "image/LUT",
      tags: ["image", "op", "LUT"],
      input: {
        type: "image",
        tags: ['grayscale']
      },
      output: {
        type: "image",
        tags: ['color']
      },
      init: "apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}",
      show_panel: true,
      onupdate: {
        'lut': 'update'
      }
    })
  }
  update(config){
    console.log('update running in the plugin', config)
    this._init = this._init + '#'
    return {init: "apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow', 'hello'], placeholder: 'hot'}" + this._init}
  }
  async run(my) {
    const lut = my.config.lut
    console.log('running in the plugin', my)
    api.createWindow({
      name: "LUT Window",
      init: "Choose a LUT: {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}",
      show_panel: true
    })
    return my
  }
}

api.export(new LookupTablePlugin())
