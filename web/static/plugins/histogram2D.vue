<config>
{
  "name": "2D Histogram",
  "mode": "webworker",
  "version": "0.1.0",
  "api_version": "0.1.0",
  "createdAt": "Mon Jun 19 2018 15:45:30",
  "url": "/histogram2D.vue",
  "description": "A plugin for render 2D histogram from a localization table.",
  "tags": ["localization", "render"],
  "icon": null,
  "dependencies": ["Lookup Table"]
}
</config>

<script lang="javascript">
class Histogram2dPlugin {
  setup(){
    api.register({
      name: "render 2D histogram",
      type: "localization/render_2d_histogram",
      tags: ["localization", "op", "histogram"],
      ui: "Render a histogram with pixel size {id:'pixel_size', type:'number', placeholder: 20}nm",
    })
  }

  async run(my){
    const pixel_size = my.config.pixel_size
    try {
      var data = e.data
      var options = data.options
      var canvas_data = data.canvas_img_data.data;  // the array of RGBA values
      var xx = options.tableDict.x
      var yy = options.tableDict.y
      var ff = options.tableDict.frame
      var rows = options.rows
      var xy_range = options.xy_range
      var width = options.histogram_width
      var height = options.histogram_height
      var table_dict = options.tableDict
      var pixel_size = options.pixel_size
      var isFiltered = options.isFiltered

      var i = canvas_data.length
      while(i--){
        if(i%4 == 3){
          canvas_data[i] = 255
        }
        else {
          canvas_data[i] = 0
        }
      }
      var progress = 0

      for (var line = 0; line < rows; line++) {
          var newProgress = Math.floor(100 * line / (rows+0.5));
          if(newProgress != progress){
              progress = newProgress
              // self.postMessage({progress:progress});
              console.log(progress)
              my.progress(progress)
          }
          if(isFiltered && !isFiltered[line]) continue
          var f = parseInt(ff[line])
          var x = parseInt(xx[line]/pixel_size)
          var y = parseInt(yy[line]/pixel_size)
          if(!f || !x || !y ){
            continue
          }
          if(y-xy_range[2]>height || x-xy_range[0]>width) continue

          var s = 4 * (y-xy_range[2]) * width + 4 * (x-xy_range[0]);  // calculate the index in the array
          if(isNaN(canvas_data[s] )){
            continue
          }
          if(!canvas_data[s]){
            canvas_data[s] = 0
          }
          var v = canvas_data[s]+1
          if(v<=255){
            canvas_data[s] = v
            canvas_data[s+1] = v
            canvas_data[s+2] = v
            canvas_data[s+3] = 255
          }
      }
      my.data = {}
      my.data.canvas_data = data.canvas_img_data
      return my
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}

api.export(new Histogram2dPlugin())
</script>
