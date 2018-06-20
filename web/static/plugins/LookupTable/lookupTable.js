class LookupTablePlugin {
  setup() {
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
      lut_onupdate: this.update,
      onupdate: this.update,
      run: this.run
    })
  }
  update(data){
    console.log('update called within the plugin.', data)
    return {init: "don't apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}"}
  }
  async run(my) {
    const lut = my.config.lut
    console.log('running in the plugin', my)
    api.createWindow({
      name: "LUT Window",
      init: "Choose a LUT: {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}"
    })
    return my
  }
}

api.export(new LookupTablePlugin())
