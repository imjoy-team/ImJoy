import {
  compareVersions
} from './utils.js'

import Ajv from 'ajv'
var ajv = new Ajv()

export const CONFIGURABLE_FIELDS = ["env", "requirements", "dependencies", "icon", "ui", "type", "flags"]

export const SUPPORTED_PLUGIN_TYPES = ['web-worker', 'native-python', 'web-python', 'iframe', 'window', 'collection']

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

export const WEB_WORKER_PLUGIN_TEMPLATE= `
<docs>
[TODO: write documentation for this plugin.]
</docs>

<config lang="json">
{
  "name": "Untitled Plugin",
  "type": "web-worker",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "api_version": "0.1.2",
  "url": "",
  "description": "[TODO: describe this plugin with one sentense.]",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "env": "",
  "requirements": [],
  "dependencies": []
}
</config>

<script lang="javascript">
class ImJoyPlugin {
  async setup() {

  }

  async run(my) {
    console.log('running in the plugin ', my)

  }
}

api.export(new ImJoyPlugin())
</script>

`

export const IFRAME_PLUGIN_TEMPLATE= `
<docs lang="markdown">
[TODO: write documentation for this plugin.]
</docs>

<config lang="json">
{
  "name": "Untitled Plugin",
  "type": "iframe",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "api_version": "0.1.2",
  "description": "[TODO: describe this plugin with one sentense.]",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "env": "",
  "requirements": [],
  "dependencies": []
}
</config>

<script lang="javascript">
class ImJoyPlugin {
  async setup() {

  }

  async run(my) {
    console.log('running in the plugin ', my)

  }
}

api.export(new ImJoyPlugin())
</script>
`

export const WINDOW_PLUGIN_TEMPLATE= `
<docs lang="markdown">
[TODO: write documentation for this plugin.]
</docs>

<config lang="json">
{
  "name": "Untitled Plugin",
  "type": "window",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "api_version": "0.1.2",
  "description": "[TODO: describe this plugin with one sentense.]",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "env": "",
  "requirements": [],
  "dependencies": [],
  "defaults": {"w": 7, "h": 7}
}
</config>

<script lang="javascript">
class ImJoyPlugin {
  async setup() {

  }

  async run(my) {
    console.log('running in the plugin ', my)

  }
}

api.export(new ImJoyPlugin())
</script>

<window lang="html">
  <div>
    <p>
    Hello World
    </p>
  </div>
</window>

<style lang="css">

</style>
`

export const NATIVE_PYTHON_PLUGIN_TEMPLATE= `
<docs lang="markdown">
[TODO: write documentation for this plugin.]
</docs>

<config lang="json">
{
  "name": "Untitled Plugin",
  "type": "native-python",
  "version": "0.1.0",
  "api_version": "0.1.2",
  "description": "[TODO: describe this plugin with one sentense.]",
  "tags": [],
  "ui": "",
  "inputs": null,
  "outputs": null,
  "flags": [],
  "icon": "extension",
  "env": "",
  "requirements": [],
  "dependencies": []
}
</config>

<script lang="python">
import numpy as np
class ImJoyPlugin():
    def setup(self):
        print('setup in python')

    def run(self, my):
        print('hello world.')
        return my

api.export(ImJoyPlugin())
</script>
`


export const WEB_PYTHON_PLUGIN_TEMPLATE= `
<docs lang="markdown">
[TODO: write documentation for this plugin.]
</docs>

<config lang="json">
{
  "name": "Untitled Plugin",
  "type": "web-python",
  "version": "0.1.0",
  "api_version": "0.1.2",
  "description": "[TODO: describe this plugin with one sentense.]",
  "tags": [],
  "ui": "UI for this plugin",
  "inputs": null,
  "outputs": null,
  "flags": [],
  "icon": "extension",
  "env": "",
  "requirements": [],
  "dependencies": []
}
</config>

<script lang="python">

class ImJoyPlugin():
    def setup(self):
        print('setup in python')

    def run(self, my):
        print('hello world.')

api.export(ImJoyPlugin())
</script>
`

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

export const WINDOW_SCHEMA= ajv.compile({
  properties: {
    name: {type: 'string'},
    type: {type: 'string'},
    config: {type: 'object'},
    data: {type: ['null', 'object']}, //attachments: {}
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
