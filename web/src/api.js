import schema from 'js-schema'

export const PLUGIN_SCHEMA= schema({
  _id: String,
  name: String,
  file_path: [null, String],
  plugin_code: String,
  script: String,
  style: [null, String],
  html: [null, String],
  iframe_container: [null, String, Object],
  iframe_window: [null, Object]
})

export const REGISTER_SCHEMA= schema({
  name: String,
  type: String,
  mode: String,
  tags: Array,
  init: String,
  show_panel: Boolean
})

export const WINDOW_SCHEMA= schema({
  name: String,
  type: String,
  config: Object,
  data: [null, Object], //attachments: {}
  panel: [null, Object]
})

export const OP_SCHEMA = {
  name: String,
  type: String,
  init: String,
  tags: Array,
  run: [null, String]
}
