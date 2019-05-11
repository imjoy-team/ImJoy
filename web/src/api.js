import {
  compareVersions
} from './utils.js'

import Ajv from 'ajv'
var ajv = new Ajv()

export const CONFIGURABLE_FIELDS = ["env", "requirements", "dependencies", "icon", "ui", "type", "flags"]

export const SUPPORTED_PLUGIN_TYPES = ['web-worker', 'native-python', 'web-python', 'web-python-window', 'iframe', 'window', 'collection']

export function upgradePluginAPI(config){
  if(compareVersions(config.api_version, '<=', '0.1.1')){
    config.type = config.type || config.mode
    delete config.mode
    if(config.type === 'pyworker'){
      config.type = 'native-python'
    }
    else if(config.type === 'webworker'){
      config.type = 'web-worker'
    }
    else if(config.type === 'webpython'){
      config.type = 'web-python'
    }
  }
  return config
}

export const PLUGIN_SCHEMA= ajv.compile({
  properties: {
    _id: {type: ['null', 'string']},
    name: {type: 'string'},
    code: {type: 'string'},
    lang: {type: ['null', 'string']},
    script: {type: ['null', 'string']}
  }
})

export const REGISTER_SCHEMA= ajv.compile({
  properties: {
    name: {type: 'string'},
    type: {type: 'string'},
    ui: {type: ['null', 'string', 'array', 'object']},
    inputs: {type: ['null', 'object']},
    outputs: {type: ['null', 'object']}
  }
})

export const JOY_SCHEMA= ajv.compile({
  properties: {
    name: {type: 'string'},
    type: {type: 'string'},
    init: {type: ['null', 'string', 'array', 'object']}
  }
})

export const WINDOW_SCHEMA= ajv.compile({
  properties: {
    name: {type: 'string'},
    type: {type: 'string'},
    config: {type: ['null', 'object']},
    data: {type: ['null', 'number', 'string', 'array', 'object']}, //attachments: {}
    panel: {type: ['null', 'object']}
  }
})

export const OP_SCHEMA = ajv.compile({
  properties: {
    name: {type: 'string'},
    type: {type: 'string'},
    ui: {type: ['null', 'string', 'array', 'object']},
    run: {type: ['null', 'string']},
    inputs: {type: ['null', 'object']},
    outputs: {type: ['null', 'object'] }
  }
})
