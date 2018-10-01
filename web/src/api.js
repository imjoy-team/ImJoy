import schema from 'js-schema'

export const CONFIGURABLE_FIELDS = ["env", "requirements", "dependencies", "icon", "ui", "mode"]

export const SUPPORTED_PLUGIN_MODES = ['webworker', 'pyworker', 'iframe', 'window', 'collection']

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
  "api_version": "0.1.0",
  "url": "",
  "description": "describe your plugin here.",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "env": null,
  "requirements": null,
  "dependencies": []
}
</config>

<script lang="javascript">
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
  "api_version": "0.1.0",
  "description": "describe your plugin here",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "dependencies": []
}
</config>

<script lang="javascript">
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
  "api_version": "0.1.0",
  "description": "describe your plugin here.",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "dependencies": []
}
</config>

<script lang="javascript">
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
  "ui": null,
  "inputs": null,
  "outputs": null,
  "icon": null,
  "env": null,
  "requirements": [],
  "dependencies": []
}
</config>

<script lang="python">
import numpy as np
class PythonPlugin():
    def setup(self):
        print('setup in python')

    def run(self, my):
        print('hello world.')
        return my

api.export(PythonPlugin())
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
  tags: Array,
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
  tags: Array,
  run: [null, String],
  inputs: [null, Object],
  outputs: [null, Object]
}
