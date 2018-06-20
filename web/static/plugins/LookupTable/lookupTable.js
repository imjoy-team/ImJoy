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
      run: this.run
    })

    api.createPanel({
      name: "Choose LUT",
      init: "Choose a LUT: {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}",
      run: this.run
    })
  }

  async run(my) {
    const lut = my.config.lut
    api.createWindow({
      name: "LUT Window",
      init: "Choose a LUT: {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}"
      panel
    })
    return my
  }
}

api.export(new LookupTablePlugin())
