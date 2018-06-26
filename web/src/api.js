import schema from 'js-schema'

export const PLUGIN_SCHEMA= schema({
  _id: [null, String],
  name: String,
  url: [null, String],
  code: String,
  lang: [null, String],
  script: [null, String],
  style: [null, String],
  html: [null, String]
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
