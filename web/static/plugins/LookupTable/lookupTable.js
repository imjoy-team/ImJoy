class LookupTablePlugin {

  setup(){
    api.createPanel({
      name: "Choose LUT",
      init: "Choose a LUT: {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}"
    })
    api.createOp({
      name: "apply LUT",
      type: "image/LUT",
      tags: ["image", "op", "LUT"],
      init: "apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}"
    })
    api.registerIO({
      input: {type: "image", tags: ['grayscale']},
      output: {type: "image", tags: ['color']},
    })
  }

  async run(my){
    const lut = my.config.lut
    api.createWindow({
      name: "LUT Window",
      init: "Choose a LUT: {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}"
    })
    return my
  }

}

api.export(new LookupTablePlugin())
