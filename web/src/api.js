import schema from 'js-schema'

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

export const PLUGIN_SCHEMA= schema({
  _id: [null, String],
  name: String,
  code: String,
  lang: [null, String],
  script: [null, String],
})

export const REGISTER_SCHEMA= schema({
  name: String,
  type: String,
  ui: [null, String, Array, Object],
  inputs: [null, Object],
  outputs: [null, Object]
})

export const WINDOW_SCHEMA= schema({
  name: String,
  type: String,
  config: Object,
  data: [null, Object], //attachments: {}
  panel: [null, Object],
  // click2load: Boolean
})

export const OP_SCHEMA = {
  name: String,
  type: String,
  ui: [null, String, Array, Object],
  run: [null, String],
  inputs: [null, Object],
  outputs: [null, Object]
}
