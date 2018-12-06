import Ajv from 'ajv'
var ajv = new Ajv()

export const CONFIGURABLE_FIELDS = ["env", "requirements", "dependencies", "icon", "ui", "mode", "flags"]

export const SUPPORTED_PLUGIN_MODES = ['webworker', 'pyworker', 'webpython', 'iframe', 'window', 'collection']
export const WEBWORKER_PLUGIN_TEMPLATE= `
<docs>
Describe your plugin here.
</docs>

<config lang="json">
{
  "name": "Untitled Plugin",
  "mode": "webworker",
  "tags": [],
  "ui": "UI for Untitled Plugin",
  "version": "0.1.0",
  "api_version": "0.1.1",
  "url": "",
  "description": "describe your plugin here.",
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

  run(my) {
    console.log('running in the plugin ', my)

  }
}

api.export(new ImJoyPlugin())
</script>

`

export const IFRAME_PLUGIN_TEMPLATE= `
<docs lang="markdown">
Describe your plugin here.
</docs>

<config lang="json">
{
  "name": "Untitled Plugin",
  "mode": "iframe",
  "tags": [],
  "ui": "UI for Untitled Plugin",
  "version": "0.1.0",
  "api_version": "0.1.1",
  "description": "describe your plugin here",
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

  run(my) {
    console.log('running in the plugin ', my)

  }
}

api.export(new ImJoyPlugin())
</script>
`

export const WINDOW_PLUGIN_TEMPLATE= `
<docs lang="markdown">
Describe your plugin here.
</docs>

<config lang="json">
{
  "name": "Untitled Plugin",
  "mode": "window",
  "tags": [],
  "ui": "UI for Untitled Plugin",
  "version": "0.1.0",
  "api_version": "0.1.1",
  "description": "describe your plugin here.",
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

  run(my) {
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

export const PYWORKER_PLUGIN_TEMPLATE= `
<docs lang="markdown">
Describe your plugin here.
</docs>

<config lang="json">
{
  "name": "Untitled Plugin",
  "mode": "pyworker",
  "version": "0.1.0",
  "api_version": "0.1.1",
  "description": "describe your plugin here.",
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


export const WEBPYTHON_PLUGIN_TEMPLATE= `
<docs lang="markdown">
Describe your plugin here.
</docs>

<config lang="json">
{
  "name": "Untitled Plugin",
  "mode": "webpython",
  "version": "0.1.0",
  "api_version": "0.1.1",
  "description": "describe your plugin here.",
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
    // click2load: Boolean
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
