import schema from 'js-schema'

export const PLUGIN_TEMPLATE= `
<config>
{
  "name": "Untitled Plugin",
  "type": "image/processing",
  "mode": "webworker",
  "tags": ["op", "image"],
  "ui": "image processing",
  "show_panel": true,
  "version": "0.1.0",
  "api_version": "0.1.0",
  "url": "",
  "description": "A plugin for image processing.",
  "icon": "extension",
  "dependencies": []
}
</config>

<docs>
Describe your plugin here.
</docs>

<script>
class UntitledPlugin {
  async setup() {
    //await importScripts("http://xxxx/xxx.js")
  }

  run(my) {
    console.log('running in the plugin ', my)

  }
}

api.export(new UntitledPlugin())
</script>

`

export const PLUGIN_SCHEMA= schema({
  _id: [null, String],
  name: String,
  url: [null, String],
  code: String,
  lang: [null, String],
  script: [null, String],
  style: [null, String],
  window: [null, String]
})

export const REGISTER_SCHEMA= schema({
  name: String,
  type: String,
  mode: String,
  tags: Array,
  ui: String,
  show_panel: Boolean
})

export const WINDOW_SCHEMA= schema({
  name: String,
  type: String,
  config: Object,
  data: [null, Object], //attachments: {}
  panel: [null, Object],
  force_show: Boolean
})

export const OP_SCHEMA = {
  name: String,
  type: String,
  ui: String,
  tags: Array,
  run: [null, String]
}
