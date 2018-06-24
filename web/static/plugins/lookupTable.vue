<config>
{
  "name": "Lookup Table",
  "mode": "webworker",
  "version": "0.0.1",
  "api_version": "0.0.1",
  "createdAt": "Mon Jun 19 2018 16:33:11",
  "file_path": "/LookupTable/lookupTable.js",
  "description": "A plugin for applying lookup table to a single-channel image.",
  "tags": ["image", "LUT"],
  "thunbnail": null,
  "dependencies": []
}
</config>
<script>
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

    api.showDialog({
      name: "LUT Window",
      init: "Hey this is a dialog: {id:'heos', type:'choose', options:['1', '3'], placeholder: '1'}",
      onupdate:{
        btt: 'buttonCallback'
      }
    }).then((result)=>{
      console.log('dialog result', result)
    }).then(()=>{
      api.createWindow({
        name: "LUT Window",
        type: "joy_panel",
        config: {init: "Choose a LUT: {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}", width: 500, height: 200}
      })
    })
    return my
  }
}

api.export(new LookupTablePlugin())
</script>
