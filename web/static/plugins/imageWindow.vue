<config>
{
  "name": "Image Window",
  "type": "simple 2D image window",
  "mode": "iframe",
  "tags": ["2d", "op", "window"],
  "init": "show image in 2D",
  "show_panel": true,
  "version": "0.1.0",
  "api_version": "0.1.0",
  "createdAt": "Mon Jun 19 2018 15:45:30",
  "file_path": "/imageWindow.vue",
  "description": "A plugin for display simple image.",
  "thunbnail": null,
  "dependencies": []
}
</config>

<docs>
This plugin is for dispalying 2d image.

</docs>

<html>
  <div>
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.1/dist/leaflet.css"
   integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
   crossorigin=""/>
   <div id="leaflet_canvas"></div>
  </div>
</html>

<script>


class ImageWindowPlugin {
  async setup() {
    await importScripts("https://unpkg.com/leaflet@1.3.1/dist/leaflet.js")
    const map = L.map('leaflet_canvas', {
      minZoom: -3,
      maxZoom: 3,
      center: [0, 0],
      zoom: -1,
      crs: L.CRS.Simple,
      zoomControl: false
    });
    this.leafletMap = map
  }
  run(my) {
    const imageUrl = my.data.image.url
    const w = my.data.image.w, h = my.data.image.h

    const map = this.leafletMap
    map.eachLayer(function(layer) {
      map.removeLayer(layer);
    });
    console.log(h, w)
    // this._canvas_data = imageData
    // dimensions of the image
    const southWest = map.unproject([0, h], 1);
    const northEast = map.unproject([w, 0], 1);
    const bounds = new L.LatLngBounds(southWest, northEast);
    // add the image overlay,
    // so that it covers the entire map
    if (this.inputLayer) {
      map.removeLayer(this.inputLayer)
      if (this.layerControl) {
        this.layerControl.removeLayer(this.inputLayer)
        if (this.outputLayer) {
          this.layerControl.removeLayer(this.outputLayer)
        }
      }
    }
    //test
    // var img = new Image();
    // img.onload = ()=>{
    //   console.log('xxxxx', img.height, img.width)
    // };
    // img.src = imageUrl;

    this.inputLayer = L.imageOverlay(imageUrl, bounds)
    this.inputLayer.addTo(map);
    if (!this.layerControl) {
      const baseLayers = {}
      const overlays = {}
      this.layerControl = L.control.layers(baseLayers, overlays, {
        position: 'topleft',
        collapsed: this.screenWidth < 600
      })
      this.layerControl.addTo(map);
      //add zoom control with your options
      L.control.zoom({
        position: 'topleft'
      }).addTo(map);
    }
    this.layerControl.addBaseLayer(this.inputLayer, 'input')
    // tell leaflet that the map is exactly as big as the image
    map.setMaxBounds(bounds);
  }
}

api.export(new ImageWindowPlugin())
</script>

<style>
#mapid { height: 100%; }
</style>
