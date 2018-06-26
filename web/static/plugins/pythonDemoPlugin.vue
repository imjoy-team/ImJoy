<config>
{
  "name": "Python Demo Plugin",
  "mode": "webworker",
  "version": "0.0.1",
  "api_version": "0.1.0",
  "createdAt": "Mon Jun 19 2018 15:45:30",
  "url": "/histogram2D.vue",
  "description": "A plugin for render 2D histogram from a localization table.",
  "tags": ["localization", "render"],
  "thunbnail": null,
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
    return my
  }
}

api.export(new Histogram2dPlugin())
</script>
