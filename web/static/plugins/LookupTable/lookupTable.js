importScripts("https://threejs.org/build/three.js", "https://threejs.org/examples/js/controls/OrbitControls.js", "https://threejs.org/examples/js/Detector.js").then(()=>{
  console.log('---------------->script loaded in webworker')
})

class LookupTablePlugin {
  setup() {
    api.register({
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
        lut: 'update'
      }
    })
  }
  update(config){
    console.log('update running in the plugin', config)
    return {init: "apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow', 'hello'], placeholder: 'hot'}"}
  }
  buttonCallback(config){
    console.log('button callback running in the plugin', config)
    return {init: "apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow', 'hello'], placeholder: 'hot'}"}
  }
  async run(my) {
    const lut = my.config.lut
    console.log('running in the plugin', my)
    api.createWindow({
      name: "LUT Window",
      init: "Choose a LUT: {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}",
    })
    api.showDialog({
      name: "LUT Window",
      init: "Hey this is a dialog: {id:'heos', type:'choose', options:['1', '3'], placeholder: '1'}",
      onupdate:{
        btt: 'buttonCallback'
      }
    }).then((result)=>{
      console.log('dialog result', result)
    })
    return my
  }
}

api.export(new LookupTablePlugin())
