# ImJoy

Image processing with Joy

# Use Imjoy for image processing

Go to the [ImJoy web app](https://imjoy.io/#/:\)), click the + button to install new plugins or open an image.

When images is opened in the workspace, you need to first click the title bar of the window to select an active window, then click on the plugin menu to run the plugin.

# Developing Plugins for ImJoy
Click the + button and select the plugin dropdown option, then create a plugin.

Plugins can be written in Javascript or Python, a minimal plugin needs to implement two functions: `setup()` and `run(my)`.
## The `<config>` tag

```json
{
  "name": "Untitled Plugin",
  "type": "image/processing",
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

## The `<script>` tag

### `setup()` function
`setup` function used to get the plugin prepared for running, it will be exectued when the plugin during initialization.

### `run(my)` function
`run` function will be called each time a user click on the menu or the container workflow is executed. While executed, an object(for Javascript) or a dictionary(for Python) called `my` will be passed into the function. The plugin can use variables stored in `my`.

Here are the variables stored in `my`:
 * `my['op']`
 Give information about which op is executed, the plugin can use `my['op']['type']` to determine the op by its type.
 * `my['config']`
 The config values from the user interface defined with the `ui` string (from the plugin config or `api.register`).
 * `my['data']`
 It stores the data from current active window while running the plugin.
 * `my['variables']`
 When the plugin is executed in a workflow, variables setted in the workflow will be passed as `my['variables']`.

### Javascript example
```javascript
class UntitledPlugin {
  async setup() {
    console.log('setup in python');
  }

  run(my) {
    console.log('hello world.')
    return my
  }
}

api.export(new UntitledPlugin())
```

### Python example
```python
class PythonPlugin():
  def setup(self):
    print('setup in python')

  def run(self, my):
    print('hello world.')
    return my

api.export(PythonPlugin())
```

# Plugin API

Within the plugin, there is a variable called `api` which exposes a set of internal functions which can be used by the plugin to interact with the GUI, talk with another plugin etc.

## `api.alert(...)`
show alert dialog with message, example: `api.alert('hello world')`
## `api.register(...)`
register a new op.
## `api.createWindow(...)`
create a new window and add to the workspace.
## `api.showDialog(...)`
show a dialog with customized GUI.
## `api.showProgress(...)`
update the progress bar on the Imjoy GUI, example: `api.showProgress(85)`
## `api.showStatus(...)`
update the status text on the Imjoy GUI, example: `api.showStatus('processing...')`
## `api.run(...)`
run another plugin by the plugin name, example: `api.run("Python Demo Plugin")` or `api.run("Python Demo Plugin", my)`



# Use Python Plugin Engine

## Installation
  * Download Annaconda3 (Python3.6 version) from https://www.anaconda.com/download/
  * Install Annaconda
  * Run `pip install -U "git+https://github.com/oeway/ImJoy#egg=imjoy&subdirectory=backend"` in a terminal window

## Usage
  * Run `python -m imjoy` in a terminal and keep the window running.
  * Go to https://imjoy.io, connect to the plugin engine
  * Now you can start to use plugins written in Python

For plugin developers, you can now create a python plugin within the browser.

Here is a python `hello world` example:
```html
<config>
{
  "name": "Python Hello World Plugin",
  "type": "demo/hello-world",
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
    "env": "conda create -y -n python2 python=2.7 anaconda",
    "requirements": ["numpy", "scipy"],
    "cmd": "python",
    ...
  </config>
  ```

   * Similarly, if you want to run your plugin with Python 3.6, you just need to add the following fields to your `<config>`:
  ```json
  <config>
    ...
    "env": "conda create -y -n python3 python=3.6 anaconda",
    "requirements": ["numpy", "scipy"],
    "cmd": "python",
    ...
  </config>
  ```
  **Note 1**: in `requirements`, you can also specify the version number, for example `numpy>=1.15.0`.

  **Note 2**: in the `env` field, you need to use `-n XXXX` to name your environment, otherwise, it will use the plugin name to name the environment.

## TODO: Use Docker Containers
 **Not supported yet**

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
