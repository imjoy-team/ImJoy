# ImJoy
## Image processing with joy :)

<img src="https://github.com/oeway/ImJoy/raw/master/docs/img/imjoy-screenshot.png" width="600px"></img>

## Key Features of ImJoy
 * Serverless solution with offline-first design
 * Easy-to-use workflow composition
 * Extendable with a plugin interface
   - Support Python and Javascript
   - Plugins are isolated with secured sandboxes
   - Built-in code editor, no extra IDEs are needed for development
   - Support virtual environments and pip packages for Python
   - Support libraries hosted on Github or CDNs for javascript
   - Deploying your own plugin with Github
 * Native support for Deep Learning
   - Use ndarrays or tensors for data exchange
   - Support Tensorflow.js and native Tensorflow

# Use Imjoy for image processing

## Basic Usage
Go to the [ImJoy web app](https://imjoy.io/#/app), click the + button to install new plugins or open an image.

When images are opened in the workspace, you need to first click the title bar of the window to select an active window, then click on the plugin menu to run the plugin.

You can drag and drop your file into the workspace, or load with the + button. Then, a file window will open if files are loaded. File formats are supported with plugins, if a certain file extension is recognized by a plugin, you can just click the file in the file window to open it. For example, if you installed the plugin "Tif file importer", you will be able to click the .tif file in the file window.

## Using Python Plugins
In order to use Python Plugins, please follow the instructions below:
  * Download Annaconda (Python3.6 version) from https://www.anaconda.com/download/ and install it.
  * Run `pip install -U git+https://github.com/oeway/ImJoy-Python#egg=imjoy` in a terminal window
  * Run `python -m imjoy` in a terminal and keep the window running.

Now you can go to the [ImJoy web app](https://imjoy.io/#/app), and connect to the Plugin Engine with the button located on the upper-right corner.

For future usage, you just need to run `python -m imjoy` in a terminal.

### How does it work?
ImJoy supports Python Plugins which can run much more computationally intensive tasks. In order to run that, it needs to connect to the Python Plugin Engine -- a small python library we developed for ImJoy (source code: https://github.com/oeway/ImJoy-Python).

Under the hood, the Python Plugin Engine will be connected with the ImJoy web app through websockets, the interaction is done with remote procedure calls (RPC). When a window in the ImJoy workspace is selected, the contained data (e.g. an image) will be transferred to the Python plugin so it can process the data with the `run` function, results will be send back to the ImJoy workspace and displayed as a new window. Natively, ImJoy supports the conversion and transmission of Numpy arrays and Tensorflow tensors, so plugin developers could just use those data types and exchange them between plugins, no matter they are in Python or Javascript.

# Developing Plugins for ImJoy

<img src="https://github.com/oeway/ImJoy/raw/master/docs/img/imjoy-code-screenshot.png" width="600px"></img>

Click the + button and select the plugin dropdown option, then create a plugin.

Plugins can be written in Javascript or Python, a minimal plugin needs to implement two functions: `setup()` and `run(my)`.
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
  "dependencies": []
}
```
* `name` the name of the plugin, it must be unique to avoid conflicting with other plugins.
* `mode` the mode of the plugin, currently supported modes are `webworker`, `iframe` and `pyworker`.
  * `webworker` is used to run computationally intensive javascript plugins. It do not have an interface, it runs in a new thread and won't hang the main thread during running.
  * `iframe` is used for create new web interface with HTML/CSS and Javascript, it runs in the same thread as the main webpage.
  * `pyworker` is used to run plugins written in Python, the user needs to have the **Python Plugin Engine** installed and started before using the plugin. See the **Developing Python Plugins** for more details.
* `tags`
* `ui` a string used to generate the GUI to the user, you can include the following elements to render an input form:
  * `type: 'choice', options: []`
  * `type: 'number', min: 0, max: 10`
  * ...
* `version` version of the plugin
* `api_version` api version of imjoy which the plugin is written for
* `url` the url used point to current file, used to download the plugin file when a user install it from the plugin store on imjoy.io website.
* `description` a short description about the plugin, describe the main feature or the context of the plugin
* `icon` defines the icon used in the plugin menu. You can find a material icon from https://material.io/tools/icons/ and set its name to `icon`.
* `inputs` defines the inputs with json-schema syntax (http://json-schema.org/) .
* `outputs` defines the outputs with json-schema syntax (http://json-schema.org/).
* `env` (**for python plugins only**) the virtual environment or docker image command used for creating an enviroment to run the plugins
* `requirements` (**for python plugins only**) the pip packages which will be installed before running the plugin, package names or github links are both supported.
* `cmd` (**for python plugins only**) the command used to run the plugin, by default, it will run `python`, sometimes it can be something like `python3` or `python27` etc.
* `dependencies` names of other imjoy plugins which the current one depend on. They will be installed automatically during installation.
## The `<docs>` tag
Used to contain documentation for the plugin, it need to be written in markdown language.

## The `<script>` tag

### `setup()` function
`setup` function used to get the plugin prepared for running, it will be exectued when the plugin during initialization.

### `run(my)` function
`run` function will be called each time a user click on the menu or run a workflow is executed. While executed, an object(for Javascript) or a dictionary(for Python) called `my` will be passed into the function. The plugin can use variables stored in `my`. 

Here are the variables stored in `my`:
 * `my['op']`
 Give information about which op is executed, the plugin can use `my['op']['name']` to determine the op by its name.
 * `my['config']`
 The config values from the user interface defined with the `ui` string (from the plugin config or `api.register`).
 * `my['data']`
 It stores the data from current active window while running the plugin.
 * `my['variables']`
 When the plugin is executed in a workflow, variables setted in the workflow will be passed as `my['variables']`.



For the results, you can directly return your result and it will show in a result window. If you want to define the type of your result, or return multiple results, you can construct a new `my` variable(dictionary or object) with two fields `config` and `data`. Here is an example:
```json
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
```javascript
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
```

### Python example
```python
class PythonPlugin():
  def setup(self):
    print('initialized from python.')

  def run(self, my):
    print('hello world.')
    return my

api.export(PythonPlugin())
```

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
       "inputs": {"image": "image/grayscale"},
       "outputs": {"image": "image/color"},
       "ui": "apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}",
    })
```
(Should be placed inside `setup()`, works for both Javascript and Python)

## `api.createWindow(...)`
create a new window and add to the workspace, example:

`api.createWindow({name: 'new window', type: 'Image Window', w:7, h:7, data: {image: ...}, config: {}})`

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
## `api.run(...)`
run another plugin by the plugin name, example: `api.run("Python Demo Plugin")` or `api.run("Python Demo Plugin", my)`



# Developing Python Plugins

For plugin developers, you can now create a python plugin within the browser.

Here is a python `hello world` example:
```html
<config>
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

## Use virtual environments
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

# Deploy your own plugin to the ImJoy Plugin Repository
The plugin store shown on the ImJoy.IO is served with Github through the [ImJoy-Plugins repository](https://github.com/oeway/ImJoy-Plugins).

In order to deploy your plugin, you can fork the repository, add your plugin and then send a pull request to [ImJoy-Plugins](https://github.com/oeway/ImJoy-Plugins). Once the pull request being accepted, the user will be able to install your plugin from the plugin store.
