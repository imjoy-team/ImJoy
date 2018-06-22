// Create a new, plain <span> element
var sp1 = document.createElement("span");
sp1.innerHTML="Text built by the plugin"

// Insert the new element into the DOM before sp2
document.body.appendChild(sp1);

class Histogram2dPlugin {
  setup(){
    api.register({
      name: "render 2D histogram",
      type: "localization/render_2d_histogram",
      tags: ["localization", "op", "histogram"],
      init: "Render a histogram with pixel size {id:'pixel_size', type:'number', placeholder: 20}nm",
    })
  }

  async run(my){
    const pixel_size = my.config.pixel_size
    return my
  }
}

api.export(new Histogram2dPlugin())
