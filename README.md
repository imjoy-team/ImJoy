# ImJoy
## Image processing with joy :)

<img src="https://github.com/oeway/ImJoy/raw/master/docs/img/imjoy-screenshot.png" width="600px"></img>

## Key Features of ImJoy
 * Serverless solution with offline-first design
 * Easy-to-use workflow composition
 * Extendable plugin interface
   - Support Python and Javascript
   - Plugins are isolated with secured sandboxes
   - Built-in code editor, no extra IDEs are needed for development
   - Support virtual environments and pip packages for Python
   - Support libraries hosted on Github or CDNs for javascript
   - Deploying your own plugin with Github
 * Native support for n-dimentional arrays and tensors
   - Support ndarrays from Numpy or Numjs for data exchange
   - Support Tensorflow.js and native Tensorflow for deep learning

# Using Imjoy for image processing

## Basic Usage: the ImJoy web app
 * Go to the [ImJoy web app](https://imjoy.io/#/app), click the **+** button to install new plugins from the [Plugin Repository](https://github.com/oeway/ImJoy-Plugins).
 * You can then open files or folders with the **+** button, or drag and drop them to the web app.
 * When files are loaded into the workspace, you can click the file to open it if the file is recognized by ImJoy or any plugin. For example, if you installed the plugin "Tif file importer", you will be able to click the .tif file in the file window. 
 * Similar to [ImageJ](https://imagej.nih.gov/ij), when clicking on the plugin menu, ImJoy will try to pass the current active window to the plugin, it is them let the plugin decide how to process the data contained in the window.
 * If you installed plugins written in Python, they will be disabled by default. In order to light them up, and benifit from the full power of your computer, you need to setup the **Python Plugin Engine** as follows.

## Advanced Usage: the Python Plugin Engine
You can use the **Python Plugin Engine** to unlock the power of your computer or another computer in your local network.

To use it, go to the [ImJoy web app](https://imjoy.io/#/app), and click the 🚀 button located on the upper-right corner, you will find instructions on how to set it up. Basically, you will be asked to install the engine and run `python -m imjoy` to start it.

More detailed instructions can be found here: [ImJoy-Python](https://github.com/oeway/ImJoy-Python).

### How does it work?
ImJoy supports Python Plugins which can run much more computationally intensive tasks. In order to run that, it needs to connect to the Python Plugin Engine -- a small python library we developed for ImJoy (source code: https://github.com/oeway/ImJoy-Python).

Under the hood, the Python Plugin Engine will be connected with the ImJoy web app through websockets, the interaction is done with remote procedure calls (RPC). When a window in the ImJoy workspace is selected, the contained data (e.g. an image) will be transferred to the Python plugin so it can process the data with the `run` function, results will be send back to the ImJoy workspace and displayed as a new window. Natively, ImJoy supports the conversion and transmission of Numpy arrays and Tensorflow tensors, so plugin developers could just use those data types and exchange them between plugins, no matter they are in Python or Javascript.

# Developing Plugins for ImJoy

<img src="https://github.com/oeway/ImJoy/raw/master/docs/img/imjoy-code-screenshot.png" width="600px"></img>

Click the + button and select the plugin dropdown option, then create a plugin.

The ImJoy plugin file format is built up on html format with customized tags (inspired by the `.vue` format), it consists of two mandatory tags `<config>` and `<script>`, and other optional tags including `<docs>`, `<window>` and `<style>`.

Here is an outline of the plugin file:
```
<config lang="json">
   ** A code block in Json format describes the plugin**
</config>

<script lang="javascript">
   ** A code block in Javascrit or Python format**
</script>

<window lang="html">
   ** A code block in HTML format**
   (for plugins in iframe mode)
</window>

<style lang="css">
   ** A code block in CSS format**
   (for plugins in iframe mode)
</style lang="json">

<docs lang="markdown">
   ** An recommanded code block in Markdown format with the documentation of the plugin **
</docs>
```
## The `<config>` tag

```json
{
  "name": "Untitled Plugin",
  "mode": "webworker",
  "tags": ["op", "image"],
  "ui": "image processing",
  "version": "0.1.0",
  "api_version": "0.1.0",
  "url": "",
  "description": "A plugin for image processing.",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "env": null,
  "requirements": null,
  "dependencies": []
}
```
* `name` the name of the plugin, it must be unique to avoid conflicting with other plugins.
* `mode` the mode of the plugin, currently supported modes are `webworker`, `iframe` and `pyworker`.
  * `webworker` is used to run computationally intensive javascript plugins. It does not have an interface, it runs in a new thread and won't hang the main thread during running.
  * `iframe` is used for create new web interface with HTML/CSS and Javascript, it runs in the same thread as the main webpage. If `iframe` mode is selected, then you need to provied HTML code with the `<window>` tag and CSS code with the `style` tag.
  * `pyworker` is used to run plugins written in Python, the user needs to have the **Python Plugin Engine** installed and started before using the plugin. See the **Developing Python Plugins** for more details.
* `tags` defines the tags for the plugin, if the tag is used for several plugins, they will be grouped in the ops menu shown in workflow.
* `ui` is a string used to generate the GUI to the user, you can include the following elements to render an input form:
  * `type: 'choice', options: []`
  * `type: 'number', min: 0, max: 10`
  * ...
* `version` defines the version of the plugin
* `api_version` api version of imjoy which the plugin is written for
* `url` the url used point to current file, used to download the plugin file when a user install it from the plugin store on imjoy.io website.
* `description` a short description about the plugin, describe the main feature or the context of the plugin
* `icon` defines the icon used in the plugin menu. You can find a material icon from https://material.io/tools/icons/ and set its name to `icon`. Or, you can directly copy and paste Emoji, for example from [here](https://getemoji.com/).
* `inputs` defines the inputs with json-schema syntax (http://json-schema.org/) .
For example, you can use `"inputs": {"properties": {"type": {"enum": ["image/png"], "required": true}}, "type": "object"}` to describe the plugin takes an png image as input. You can also use the simplified format which assumes the inputs is an object and use json schema to describe the properties: `"inputs": {"type": {"enum": ["image/png"], "required": true}}`.
* `outputs` defines the outputs with json-schema syntax (http://json-schema.org/).
The format is exactly the same as `inputs`.
* `env` (**for python plugins only**) the virtual environment or docker image command used for creating an enviroment to run the plugins
* `cmd` (**for python plugins only**) the command used to run the plugin, by default, it will run `python`, sometimes it can be something like `python3` or `python27` etc.
* `requirements` (**for python plugins only**) the pip packages which will be installed before running the plugin, package names or github links are both supported.
* `dependencies` names of other imjoy plugins which the current one depend on. They will be installed automatically during installation.

## The `<script>` tag

Plugins can be written in Javascript or Python, a minimal plugin needs to implement two functions: `setup()` and `run()`.
In order to differentiate the two different languages, use the `lang` property of the `<script>` tag:
 * for Javascript plugin, use `<script lang="javascript"> ... </script>`
 * for Python plugin, use `<script lang="python"> ... </script>`

### `setup()` function
`setup` function used to get the plugin prepared for running, it will be executed when the plugin during initialization.

### `run()` function
`run` function will be called each time a user click on the menu or run a workflow is executed. While executed, an object(for Javascript) or a dictionary(for Python) called `my` will be passed into the function.

All the plugins can access `config` and `data` from `my`:

 * `my['config']`
 The config values from the user interface defined with the `ui` string (from the plugin config or `api.register`).
 * `my['data']`
 It stores the data from current active window and state for running the plugin.

 In `my['data']`, there are internal fields which will be used to store the state of the current workflow.
  * `_variables`
     When the plugin is executed in a workflow, variables will be set in the workflow will be passed as `my['data']['_variables']`. It will be set to the actual variable value if the user used ops such as `Set [number]`.
  * `_op`
     Give the name of the op which is being executing, the plugin can use `my['data']['_op']` to determine the op by its name.
  * `_source_op`
     Give the name of the op which initiated current execution.
  * `_workflow_id`
     When the plugin is executed in a workflow, the workflow id will be set in the workflow will be passed as `my['data']['_workflowId']`.

     When the plugin is clicked in the plugin menu, ImJoy will try to reuse the workflow id in the current active window, if no window is active, a new workflow id will be assigned. All the data window with the same `_workflow_id` is virtually connected in a pipeline or computational graph. By combining `_workflow_id` with `_op` and `_source_op`, ImJoy can track, maintain and reconstruct the entire workflow.

  Importantly, `_workflow_id`, `_variables`, `_op` and `_source_op` can be used to implement interactivity between plugins, meaning if the user changed a state in one of the result window, downstream of the workflow will be updated automatically.


For the results, you can directly return your result and it will show in a result window. If you want to define the type of your result, or return multiple results, you can construct a new `my` variable(dictionary or object) with two fields `config` and `data`. Here is an example:
```javascript
   my = {
      "config": {},
      "data": {
         "data_1": {"type": "image/grayscale", "image": img},
         "result_tensor": {"type": "tensor", "tensor": t}
      }
   }
   return my
```
In the result, two fields named `data_1` and `result_tensor` will be displayed in a result window or passed to the next op in a workflow.

### Javascript example
```html
<script lang="javascript">
class UntitledPlugin {
  async setup() {
    console.log('initialized from Javascript.');
  }

  async run(my) {
    console.log('hello world.');
    return my;
  }
}

api.export(new UntitledPlugin())
</script>
```

### Python example
```html
<script lang="python">
class PythonPlugin():
  def setup(self):
    print('initialized from python.')

  def run(self, my):
    print('hello world.')
    return my

api.export(PythonPlugin())
</script>
```

## The `<docs>` tag
Used to contain documentation for the plugin, it need to be written in `Markdown` language. Here is a document about how to write document in `Markdown`: [Mastering Markdown](https://guides.github.com/features/mastering-markdown/).

## The `<window>` tag
Define the HTML code for displaying in the plugin window.

## The `<style>` tag
Define the CSS code for displaying in the plugin window.

# Plugin API

Within the plugin, there is a variable called `api` which exposes a set of internal utility functions. These utility functions can be used in the plugin to interact with the GUI, talk with another plugin etc.

## `api.alert(...)`
show alert dialog with message, example: `api.alert('hello world')`
## `api.register(...)`
register a new op, example:
```javascript
    api.register({
       "name": "LUT",
       "tags": ["op"],
       "inputs": {"type": {"enum": ["image/grayscale"], "required": true}},
       "outputs": {"type": {"enum": ["image/color"], "required": true}},
       "ui": "apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}",
    })
```
(Should be placed inside `setup()`, works for both Javascript and Python)

## `api.createWindow(...)`
create a new window and add to the workspace, example:

`api.createWindow({name: 'new window', type: 'Image Window', w:7, h:7, data: {image: ...}, config: {}})`

If you do not want the window to load immediately, you can add `click2load: true` and the window will ask for an extra click to load the content.

## `api.showDialog(...)`
show a dialog with customized GUI, example:

```javascript
   api.showDialog({
      "name": "This is a dialog",
      "ui": "Hey, please select a value for sigma: {id:'sigma', type:'choose', options:['1', '3'], placeholder: '1'}.",
   }).then((result)=>{

   })
```
## `api.showProgress(...)`
update the progress bar on the Imjoy GUI, example: `api.showProgress(85)`
## `api.showStatus(...)`
update the status text on the Imjoy GUI, example: `api.showStatus('processing...')`
## `api.showPluginProgress(...)`
update the progress bar of the current plugin (in the plugin menu), example: `api.showPluginProgress(85)`
## `api.showPluginStatus(...)`
update the status text of the current plugin (in the plugin menu), example: `api.showPluginStatus('processing...')`
## `api.run(...)`
run another plugin by the plugin name, example: `api.run("Python Demo Plugin")` or `api.run("Python Demo Plugin", my)`



# Developing Python Plugins

For plugin developers, you can now create a python plugin within the browser.

Here is a python `hello world` example:
```html
<config lang="json">
{
  "name": "Python Hello World Plugin",
  "mode": "pyworker",
  "version": "0.1.0",
  "api_version": "0.1.1",
  "description": "A python plugin demo.",
  "tags": ["demo", "op"],
  "ui": "print hello world from python",
  "inputs": null,
  "outputs": null,
  "icon": null,
  "env": null,
  "requirements": ["numpy"],
  "cmd": "python",
  "dependencies": []
}
</config>

<script lang="python">
import numpy as np

class PythonPlugin():
  def setup(self):
    pass

  def run(self, my):
    print('hello world.')
    return my

api.export(PythonPlugin())
</script>

```

## Using virtual environments
  Python plugins for ImJoy can have different conda environments, which provides a way to isolate plugins. You can therefore run python plugins with different versions of Python, or use different pip packages.



  By default, python plugins from ImJoy will be executed in the default conda environment(Python 3.6). If you want to run a plugin in a different conda environment, you can specify it by setting the `env` field in the `<config>` section of the plugin.

  It is also important to specify the pip packages required by the plugin, this can be done with the `requirements` field in `<config>`.

  Examples:
   * If you want to run your plugin with Python 2.7, you just need to add the following fields to your `<config>`:
  ```json
  <config>
    ...
    "env": "conda create -y -n python2 python=2.7",
    "requirements": ["numpy", "scipy"],
    "cmd": "python",
    ...
  </config>
  ```

   * Similarly, if you want to run your plugin with Python 3.6, you just need to add the following fields to your `<config>`:
  ```json
  <config>
    ...
    "env": "conda create -y -n python3 python=3.6",
    "requirements": ["numpy", "scipy"],
    "cmd": "python",
    ...
  </config>
  ```
  **Note 1**: in `requirements`, you can also specify the version number, for example `numpy>=1.15.0`.

  **Note 2**: in the `env` field, you need to use `-n XXXX` to name your environment, otherwise, it will use the plugin name to name the environment.

## TODO: Use Docker Containers
 **Not yet supported**

 Python plugin can also be ran with Docker.
 Examples:
  * If you want to run your plugin with tensorflow docker, you need to add the following fields to your `<config>`:
 ```json
 <config>
   ...
   "env": "docker pull tensorflow/tensorflow:1.9.0-py3",
   "requirements": ["numpy", "scipy"],
   "cmd": "python",
   ...
 </config>
 ```

# Testing and deploying your own plugin
During the development of a plugin, you can use chrome dev tool to debug your javascript plugin. Python plugins can be tested alone first and then wrap as python modules, you can import them by running the `python -m imjoy` in the directory with your modules.

For depolying your plugin, if they do not depend on library or module written by your self, you could just upload the file to a Github repository. For sharing with others, you can copy the link point to the `raw` file. Other uses can use the url to install from ImJoy. If you want to contribute your plugin to the ImJoy central repository, so users can directly install from the plugin store shown on ImJoy.io, you need to send a pull request to the repository. More details about that: [ImJoy-Plugins repository].

If your plugin depends on non-standard libraries and modules, and you want to provid them with your plugin. You just need to upload those libraries and modules to a github [gist](https://gist.github.com/) or repository, and link them in the plugin code.

 * for javascript plugin with extra dependencies, you need to create a [gist](https://gist.github.com/) or repository on Github named with the plugin name, and upload the plugin file together with other javascript files. In the plugin file, you can use `importScripts(url_to_your_js_file)` function to use this libraries. However, due to a restriction of Github, you can't use the url of github directly, you need to copy the url of your javascript file, and convert it with [RawGit](https://rawgit.com/).
 * for python plugin with extra dependencies, you need to create a `setup.py` file to wrap the plugin as a pip module, create a [gist](https://gist.github.com/) or repository on Github named with the plugin name, and upload the plugin file together with your python modules. Now add the github link to `requirements` in `<config>` of your plugin. The github link should be formated to something like: `git+https://github.com/oeway/ImJoy-Python#egg=imjoy`, you can test with the `pip install ...` command to see if you can install your module.

The plugin store shown on the ImJoy.IO is served with Github through the [ImJoy-Plugins repository](https://github.com/oeway/ImJoy-Plugins).

In order to deploy your plugin to the plugin store, you can fork the repository, add your plugin and then send a pull request to [ImJoy-Plugins](https://github.com/oeway/ImJoy-Plugins). Once the pull request being accepted, the user will be able to install your plugin from the plugin store.
