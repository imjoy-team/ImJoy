# Developing Plugins for ImJoy

<img src="./asserts/imjoy-code-screenshot.png" width="600px"></img>

Developing plugins for ImJoy is easy and fast with the built-in code editor which runs directly in the web app, no additional IDE or compiler is needed for development.

The following list illustrates key features of the plugin system in ImJoy:
 * Support Python and Javascript
   - Javascript plugins are isolated with secured sandboxes
   - Python plugins run in their own process
   - Support concurrent API calls using `async/await` syntax
   - Support virtual environments and pip packages for Python
   - Support libraries hosted on Github or CDNs for javascript
 * Native support for n-dimentional arrays and tensors
   - Support ndarrays from Numpy or Numjs for data exchange
   - Support Tensorflow.js and native Tensorflow for deep learning
 * Rendering muti-dimentional data in 3D with webGL, Three.js etc.
 * Deploying your own plugin with Github

## Getting started

There are four types of plugins available for different purposes:

 1. `window` plugin for building rich and interactive user interface using HTML5/CSS and JavaScript;
 2. `webworker` plugin for performing computational tasks using JavaScript or WebAssembly;
 3. `pyworker` plugin for performing heavy-duty computational tasks using Python and its libraries, this requires additional installation of an desktop app;
 4. `webpython` plugin for performing computational tasks using Python with in the browser through WebAssembly. This is in developmental stage and only selected number of Python libraries are currently supported.

<img src="./asserts/imjoy-plugin-development.png" width="800px"></img>

Click the **+ PLUGINS** button in `Plugins`, then select `Create a New Plugin` with one of the plugin templates.
A code editor will open in the workspace, where you can write the code, save it, or install the plugin to the plugin menu. You can then test your plugin by clicking on the plugin name in the Plugins list.


## Plugin file format
The ImJoy plugin file format is built up on html format with customized blocks (inspired by the `.vue` format). it consists of two mandatory blocks `<config>` and `<script>`, and other optional blocks including `<docs>`, `<window>`,`<attachment>`,`<link>` and `<style>`.  For `<style>`, you can also set the `src` attribute.

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
   (for plugins in `window` mode)
</window>

<style lang="css">
   ** A code block in CSS format**
   (for plugins in `window` mode)
</style lang="json">

<docs lang="markdown">
   ** A recommanded code block in Markdown format with the documentation of the plugin **
</docs>

<attachment name="XXXXX">
   ** An optional block for storing text data, you can use multiple of them **
</attachment>
```

The order of these blocks does not matter, so you can shuffle the blocks.

### `<config>` block

```json
{
  "name": "Untitled Plugin",
  "mode": "webworker",
  "tags": [],
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

* `name` is the name of the plugin. It **must** be unique to avoid conflicts with other plugins.
* `mode` is the plugin type or execution mode. Currently supported are:
  * `window` is used for create a new web interface with HTML/CSS and Javascript. If `window` mode is selected, then you need to provide HTML code with the `<window>` block and CSS code with the `style` block. Notice that this type of plugin runs in the same thread as the main web page, it may hang the entire web app when running heavy computation. A better choice for computational tasks is `webworker` plugin. However, some WebGL powered libraries including `tensorflow.js` do not support (yet) `webworker` mode, in that case, another mode called `iframe` can be used. `iframe` mode is the same as `window` mode except it does not need an interface, it is especially useful for plugins which needs to access GPU through WebGL.
  * `webworker` to run computationally intensive javascript plugins. It does not have an interface, it runs in a new thread and won't hang the main thread during running.
  * `pyworker` is used to run plugins written in Python. This requires that the **Python Plugin Engine** is installed and started before using the plugin. See the **Developing Python Plugins** for more details.
* `tags` defines a list of supported tags, which can be used to provide differentiate configureable modes and can be accessed at various points in the plugin. For an overview we
we refer to the dedicate description **## Plugins and tags**
* `ui` is a string specifying the GUI that will be displayed to the user. The following elements can be used to render an input form:
    * `type: 'choose', options: ['cat', 'dog'], placeholder: 'cat'`
    * `type: 'number', min: 0, max: 10, placeholder:2`
    * `type: 'color'`
    * `type: 'string'`
    * `type: 'save'`
    * `type: 'instructions/comment'`
    * `type: 'variableName'`
    * ...

    For each element, you need to define a unique `id`, which can then be used to **access
    the value of this element in the plugin** with `my.config.id`.

    For example, to render a form with a selection use `"ui": "select an option: {id: 'option1', type: 'choose', options: ['cat', 'dog'],     placeholder: 'cat'}"`. In the plugin, the selection can then be accessed with `my.config.option1`.

    In some cases, the ui might only contain a brief description of the op. This can either be plain text, or you can also specify a           **link**    with `"ui": " <a href='https://imjoy.io' target='_blank'> ImJoy</a>"`. The `target='_blank'` will open this page in a new     tab.

    To define **longer forms with multiple lines**, we support additional definitions of the `ui` string.

     - an array of strings. For example:
         ```json
         "ui": [
             "option1: {id: 'option1', type: 'choose', options: ['cat', 'dog'], placeholder: 'cat'}",
             "option2: {id: 'option2', type: 'number', placeholder: 3}"
            ],
          ```
     - an array with keys and values. Here, you have to use `" "` for the keys and the strings. Definitions can also be mixed.
       In the   example below, we use a string as above for `option1` and an array with keys and values for `option2`.
       Note how for `option2` each key and value is defined as an individual string.

         ```json
         "ui": [
          {"option1": "{id: 'option1', type: 'choose', options: ['cat', 'dog'], placeholder: 'cat'}"},
          {"option2": {"id": "option2",
                       "type": "number",
                       "placeholder": 3}}],
          ```

* `version` specifies the version of the plugin.
* `api_version` specifies the api version of ImJoy the plugin is written for.
* `url` points to current file, and is used to download the plugin  when a user installs it from the plugin repository.
* `description` contains a short description about the plugin.
* `icon` defines the icon used in the plugin menu. You can find different icons here https://material.io/tools/icons/ and used the specified name. Or, you can directly copy and paste Emoji, for example from [here](https://getemoji.com/).
* `inputs` defines the inputs with json-schema syntax (http://json-schema.org/) .
For example, to define that the plugin uses png files, you can specify `"inputs": {"properties": {"type": {"enum": ["image/png"], "required": true}}, "type": "object"}` . You can also use the simplified format which assumes the inputs is an object and use json schema to describe the properties: `"inputs": {"type": {"enum": ["image/png"], "required": true}}`.
* `outputs` defines the outputs with json-schema syntax (http://json-schema.org/).
The format is the same as for `inputs`.
* `flags` defines an array of flags which will be used by ImJoy to control the behavior of the plugin. Currently, we support these `flags` for run-time control. These flags allow to specify how ImJoy instances are handled by the Interface and the Plugin engine. For more information we refer to the section **TODO**.

    * `single-instance` (**for python plugins only**). Python engine will only run a single plugin process even if
    plugin is called from multiple BUT identical workspaces. In this case, the different ImJoy instances will share
    the same plugin process.
    * `allow-detach` (**for python plugins only**). Allows the plugin process to detatch from the user interface. This means
    the plugin will not be killed when the user interface is disconnected or closed. However, in order to reconnect to this process,
    you  also need to add the `single-instance` flag.

   Example: to make a plugin which can run without the user interface in the background and to which you can attach set
   `"flags": ["single-instance", "allow-detach"]`. The inteface will automatically reconnect to this process when re-launched.
   Please note that if  multiple ImJoy instances attache to this plugin process, each will call the `setup()` function.
   This may cause conflicts, we therefore recommend to (1) keep the interface-related code in the `setup()`, e.g. `api.register()`;
   (2) move code that you only want to run once per process into the `__init__` function of the plugin class.

* `env` (**for python plugins only**) the virtual environment or docker image command used to create an enviroment to run the plugin.
* `cmd` (**for python plugins only**) the command used to run the plugin. By default, it will be run with `python`. Depending on the installtion it could also be be something like `python3` or `python27` etc.
* `requirements` for `webworker` plugins written in Javascript, it can be a array of JavaScript url which will be imported using `importScripts`, for `window` plugin, it can be either a list of JavaScript url or CSS url (needs to be end with `.css`). For `webpython` plugins, you can set it as a list of python modules e.g. `["numpy", "matplotlib"]`, please also notice that `webpython` has a limited number of python modules supported. For `pyworker` plugins, it defines the pip packages which will be installed before running the plugin defined as a list of pip packages or a command string. ImJoy supports package names and github links. For example, `["numpy", "scipy==1.0"]` or `"pip install numpy scipy==1.0"`. To use conda, you can set the string to `"conda install numpy scipy==1.0"`. For more information see the dedicate section **Using virtual environments**.
* `dependencies` names of other imjoy plugins which the current pluging depend on. They will be installed automatically during installation. To define a dependency use the following format: 1) for dependencies without tag `REPOSITORY:PLUGIN_NAME` or `PLUGIN_URL`, e.g.: `oeway/ImJoy-Plugins:Image Window`; 2) or with specified tag: `REPOSITORY:PLUGIN_NAME@TAG` or `PLUGIN_URL@TAG`, e.g.: `oeway/ImJoy-Plugins:Unet Segmentation@GPU`. In this case, a hash tag `GPU` is used to specify the tag for the plugin named `Unet Segmentation` hosted on github repository `oeway/ImJoy-Plugin` (https://github.com/oeway/ImJoy-Plugins). If the plugin is not hosted on Github or the github repository is not formated as a ImJoy plugin repository (meaning there is no `manifest.imjoy.json` file defined in the root of the repository), you can use the the url directly, e.g.: `https://github.com/oeway/ImJoy-Demo-Plugins/blob/master/repository/3dDemos.imjoy.html` (tags can be added with `@TAG`).

* `defaults` (**for window plugin only**) define an object of default values, for example you can specify the default window size by setting `"defaults": {"w": 10, "h": 7}`.
* `runnable` defines whether the plugin can be executed by clicking on the plugin menu (By default, all plugins are `runnable`). For helper plugins which do not run by themselves, (e.g. a `pyworker` plugin can be called by a `window` plugin and do not necessarily executed by the user directly), setting `"runnable": false` would move down the plugin to the bottom of the plugin menu and made non-clickable.

### `<docs>` block
Used to contain documentation for the plugin, it need to be written in `Markdown` language. Here is a document about how to write document in `Markdown`: [Mastering Markdown](https://guides.github.com/features/mastering-markdown/). Please note that if you provide links that these will be opened in another tab, leaving the ImJoy instance running.

### `<window>` block
Define the HTML code for displaying in the plugin window.

### `<style>` block
Define the CSS code for displaying in the plugin window.

### `<script>` block

Plugins can be written in Javascript or Python, a minimal plugin needs to implement two functions: `setup()` and `run()`. Exceptions are helper plugins (specified with `"runnable": false`), which don't need the `run()` function. Optionally, the function `exit` will be called when the plugin is killed.

The `lang` property of the `<script>` block is used to specify the used programming language:
 * for Javascript, use `<script lang="javascript"> ... </script>`
 * for Python, use `<script lang="python"> ... </script>`

`<script>` also supports `tags`. For more information, see the dedicated section **Plugins and tags**.

#### `setup()` function
This function will be executed when a plugin is loaded and initializes it.

#### `run()` function
This function will be called each time a plugin is executed. When executed, an object (for Javascript) or a dictionary (for Python) called `my` will be passed into the function. More in the section **Plugin during runtime ** below.

#### optional: `update()` function
Optionally, you can define an update function which will be called when any setting of the op is changed.

## Plugin operators (ops)
For a plugin, you can define independent operators (or **ops**) with the Plugin API (see **api.register** for details). Each of these **ops** is defined in a similar fashion as
the `<config>` block and has it's own set of parameters defined via a GUI and can have its dedicated run fucntion. The different ops are displaued when you press on the button down arrow in the Plugin list. Each op can also be added to the workflow separately.

## Plugin during runtime
When executing a plugin, it can can access the fields `config` and `data` from `my`:

 * `my.config`
 The config values from the GUI defined with the `ui` string (from the plugin `<config>` block
 or from a separate operation `api.register`, more below). For example, if you defined an ui string (e.g. `"ui": "option {id: 'opt1', type: 'number'}"`) in the plugin `<config>`, you can access it through `my.config.opt1`.

 * `my.data`
 It stores the data from current active window and state for running the plugin.

 * `my._variables`
     When the plugin is executed in a workflow, variables will be set in the workflow will be passed as `my._variables`. It will be set to the actual variable value if the user used ops such as `Set [number]`.

You can directly return your result and they will show as a result window. If you
want to define the type of your result, or return multiple results, you can construct a new `my` variable(dictionary or object) with two fields `config` and `data`. Here is an example:
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

Since ImJoy use postMessage to exchange data between plugins, for Javascript plugins, objects are cloned during the transfer. When there is a large object exchange, it will be more effective if the object created by a plugin can be directly transferred. To enable that, you can add `_transfer=true` to your object when you return it. For example, in the above example, you can set `my._transfer = true` when you return `my`. However, it will only speed up the transferring of `ArrayBuffers` or `ArrayBufferViews` (and also ndarrays produced by Python), and after transferring, you won't be able to access it.

(**Note**: in Python, the data type of `my` is a dictionary, ImJoy added the interface for allowing dot notation, just like in Javascript. If you prefer, you can also use `[]` in both languages to access dictionary or object.)

### Javascript example
```html
<script lang="javascript">
class ImJoyPlugin {
  async setup() {
    console.log('initialized from Javascript.');
  }

  async run(my) {
    console.log('hello world.');
    return my;
  }
}

api.export(new ImJoyPlugin())
</script>
```

### Python example
```html
<script lang="python">
class ImJoyPlugin():
    def setup(self):
        print('initialized from python.')

    def run(self, my):
        print('hello world.')
        return my

api.export(ImJoyPlugin())
</script>
```

## Workflow management
We provide additional fields in `my` that allow to track, maintain and reconstruct an entire analysis workflow.

* `my._op`
    Give the name of the op which is being executing. When a plugin registered for multiple ops and no callback function was specified for the op, the `run` function will be called, and you can use `my._op` to determine which op is being executing.
* `my._source_op`
    Give the name of the op which initiated current execution.
* `my._workflow_id`
    When the plugin is executed in a workflow, its id will be passed here. When the plugin is executed from the plugin menu, ImJoy will try to reuse the workflow id in the current active window, if no window is active, a new workflow id will be assigned. All the data window with the same `_workflow_id` is virtually connected in a pipeline or computational graph. By combining `_workflow_id` with `_op` and `_source_op`,

 Importantly, `_workflow_id`, `_variables`, `_op` and `_source_op` can be used to implement interactivity between plugins, meaning if the user changed a state in one of the result window, the downstream workflow will be updated automatically.


## Plugins and tags
In a plugin configuration <config> you can define different `tags`. These tags can then be
used to control to overall functionality of the plugin.

Within the **<config>** tag, the following fields can be made configurable: `"env", "requirements", "dependencies", "icon", "ui", "mode"`. For example, a python plugin may have two tags `["GPU", "CPU"]`. The user will be asked to choose one of the tag during the installation. For example, you can set different `requirements` according to different tag which selected by the user during installation. In order to support that, the `requirements` can be set to `{"gpu": "pip install tensorflow-gpu keras", "cpu": "pip install tensorflow keras"}` or `{"gpu": ["tensorflow-gpu", "keras"], "cpu": ["tensorflow", "keras"]}`.

The **`<script>`** block can be configured, and you can select which script script is executed. For this, you have to add the `tag` property to the `<script>` block. Notice also that you will still need the `lang` property. For example, if you have `"tags": ["stable", "dev"]`, then you can have two script blocks: `<script lang="python" tag="stable">` and `<script lang="python" tag="dev">`.

When developing and testing a plugin, the ImJoy editor will recognize that the plugin
has multiple tags and you can select a tag in the tile bar of the plugin. When loading
the plugin, it will be loaded with this tag.


## `Plugin API`
The plugin system of ImJoy is built on remote procedure calls, and an encoding and decoding scheme is used by ImJoy to transfer data and functions between plugins. We expose a set of API functions from  both the main app and the plugins.

In the plugin, a predefined object called `api` can be used to access the ImJoy API, detailed information can be found in the **ImJoy API** section. By using an ImJoy API called `api.export`, a set of functions can be exported as `Plugin APIs`, `setup` and `run` as described before are two mandatory `Plugin API` functions which need to be defined and exported. In addition to that, other functions can be also exported as `Plugin APIs`.

As you may see in the above examples, they both contain an `api.export` statement as the last line of the `<script>` code block.

```javascript
//Javascript
api.export(new ImJoyPlugin())

# Python
api.export(ImJoyPlugin())
```

**Notice** that in Javascript, the `new` keyword is necessary to create an instance of a class, while in Python there is no `new` keyword.


## Callback functions
Besides the `Plugin API` functions, when a plugin is executed, you can return an object which includes functions which will be called by other plugins or ImJoy. However, if the function has never been exported as a `Plugin API` before, it will be treated as a `callback` function and can be only called once. Otherwise, if the function has been exported as `Plugin API`, it won't be treated as `callback` function and can be called repeatly.

## ImJoy API functions

For interacting with the main ImJoy user interface and other plugins, the plugin needs to call ImJoy API functions. For the list of the API functions their usage, we refer to the [ ImJoy API functions](/api).


## Developing Window Plugin

To develop a window plugin, choose the `+ Window(Javasript and HTML)` plugin template when creating a new plugin in the ImJoy app. The key difference is the `mode` field in the `<config>` block which has been set to `window`.

Window plugin is a special type of plugins running in `iframe` mode, and it will show up as a window. `<window>` and `<style>` can be used to define the actual content of the window.

Different from other plugins which will be loaded and intialized when ImJoy is started, a `window` plugin will not be loaded until the actuall plugin is created with `api.createWindow` or clicked by a user in the menu. During execution of `api.createWindow`, `setup` and `run` will be called for the first time, and return with an window ID. After that, if needed, another plugin can call `api.updateWindow` with the window ID, ImJoy will try to execute the `run` function with the new data again.

If the `run` returned with an object, then it will be used to update the window status managed by ImJoy. This means, for example, if the user changed the name of the plugin, it can be achieved by returning the same `my` object in the `run` function.


## Developing Webworker Plugin

To develop a window plugin, choose the `+ Webworker(Javascript)` plugin template when creating a new plugin in the ImJoy app. The key difference is the `mode` field in the `<config>` block which has been set to `webworker`.

Webworker plugin is used to do computation tasks in another thread, using a new element called ["web worker"](https://en.wikipedia.org/wiki/Web_worker). It is basically a way for Javascript to achieve multi-threading.

Since it's designed for perfoming computational tasks, it does not have access to html dom but you can use `ImJoy API` to interact with the graphical interface of ImJoy or other plugin which can trigger changes on the user interface.

## Developing Python Plugins

To develop a window plugin, choose the `+ PyWorker(Python)` plugin template when creating a new plugin in the ImJoy app.  The key difference is the `mode` field in the `<config>` block which has been set to `pyworker`.

Here is a python `hello world` example:
```html
<config lang="json">
{
  "name": "Python Hello World Plugin",
  "mode": "pyworker",
  "version": "0.1.0",
  "api_version": "0.1.1",
  "description": "A python plugin demo.",
  "tags": [],
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

class ImJoyPlugin():
    def setup(self):
        pass

    def run(self, my):
        print('hello world.')
        return my

api.export(ImJoyPlugin())
</script>

```

Similary to `webworker` plugin, python plugins do not have access to the html dom, but you can use `ImJoy API` to interact with the graphical interface of ImJoy or other plugin which can trigger changes on the user interface.

### Data exchange

When a window in the ImJoy workspace is selected, the contained data (e.g. an image) will be transferred to the Python plugin. The plugin can then process the data with the `run` function, results will be send back to the ImJoy workspace and displayed as a new window. Natively, ImJoy supports the conversion and transmission of Numpy arrays and Tensorflow tensors, so plugin developers could just use those data types and exchange them between plugins, no matter if they are in Python or Javascript.

#### Small data

You can directly pass the data as parameters of api functions which will be send to the frontend.
Small numpy arrays, strings, bytes (less 10MB for example) can be directly send through the builtin websocket between the Plugin Engine and the web app.

For example, for quick display of an small image, you can save it as png format and encode it as base64 strings which can then be directly displayed with a standard HTML `<img>` tag.

```python
with open("output.png", "rb") as f:
    data = f.read()
    result = base64.b64encode(data).decode('ascii')
    imgurl = 'data:image/png;base64,' + result
    api.createWindow(name='unet prediction', type = 'imjoy/image', w=7, h=7, data= {"src": imgurl})
```

#### Large data
Potentially, you can send large files in smaller chunks but this is not optimal and
may block normal communication between the engine and the ImJoy app. We recommend to store the data on the disk (in the workspace directory for example), then use `api.getFileUrl` to generate an url to access the file. The generated url can then be send to the web App and accessed with a downlad link or using js libraries such as `axios`. Many libraries such as Three.js, Vega etc. can load files through url directly.

### Virtual environments
Python plugins for ImJoy can have different conda environments, which provides a way to isolate plugins. You can therefore run python plugins with different versions of Python, or use different pip packages.

By default, python plugins from ImJoy will be executed in the default conda environment (e.g. Python 3.6). If you want to run a plugin in a different conda environment, you can specify it by setting the `env` field in the `<config>` section of the plugin.

`env` can be a string or an array. When connecting multiple command in a line please use `&&` or `||` which supported on different operating systems. If you have several command which are indipendent from each other, please use array to store the commands. For example: `"env": ["git clone https://github.com/oeway/XXXXXX.git", "conda create -n XXXXX python=3.7"]`, this setting will first clone the source code on github, then create an environment with conda. Notice that the git clone command will fail if the folder already exist, in that case, the second command will also been executed.

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
  **Note 1**: in `requirements`, you can also specify the version number, for example `numpy==1.15.0`. If you want to install conda modules or you want to run pip with other parameters, you can set `requirements` as a command string instead of a list, for example: you can do `requirements: "conda install opencv-python && pip install numpy"`.

  **Note 2**: in the `env` field, you need to use `-n XXXX` to name your environment, otherwise, it will use the plugin name to name the environment.


### Controlling run-time behavior
You can control the run-time behavior of a Python plugin process with the `flags` field in the `<config>` block. Next we provide next  nomenclature and additional explanations to explain the different options you have to control how the Python processes running on the plugin engine interact with the ImJoy interface.

* **Interface**: web interface of ImJoy. You can have ImJoy running on multiple browser windows, i.e. multiple interfaces.
* **Plugin Engine**: running in the background to execute Python code from different Python plugins.
* **Python plugin**: plugin containing Python code. Some plugins might have **`tags`** to further specify details of how they are exectuted.
* **Python process**: specific Python plugin running on the Plugin engine. Processes can be seen on the Task Manager.
* **Workspace**: collection of installed ImJoy plugins. For plugins with `tags`, the user choses the appropriate tag. Each Python plugin within a workspace has its own process. Each workspace has a unique name.   
* **ImJoy instance** is a workspace running in one ImJoy interface.

<img src="./asserts/imjoy-python-process.png" width="600px"></img>

Below we describe the three main run-time behavior of python plugins:
* By **default** (none of the flags is set), each ImJoy instance has its own process on the plugin engine. If you close the interface, you will kill the process.
* The **`single-instance`** flag will allow only one process to run for a given workspace. A workspace is defined by its name, all installed plugins, and the selected `tags`. If two ImJoy instances run the exact same workspace, then the `single-instance` means that they access the same process. Only closing last instance will  kill the process.
* The **`allow-detach`** flag means that the process is not killed when its ImJoy instance is closed. For instance, this allows to perform long computional tasks in the background which dont require additional user feedback and which terminate autonomously. Can also be used to protect a long computional tasks again browser instabilties. If you want to be able to attach to a detached process, the plugin has additionally have the `single-instance` flag.

This is how the `flags` option looks like in the `<config>` block:
```json
<config lang="json">

  ...
  "flags": ["single-instance", "allow-detach"],
  ...

</config>
```
Optionally, the `flags` can be made configurable with `tags`, for example:
```json
<config lang="json">

  ...
  "tags": ["Single", "Multi"],
  "flags": {"Single": ["single-instance", "allow-detach"], "Multi": []},
  ...

</config>
```
The above `<config>` block will create a plugin with two tags(`Single` and `Multi`). During installation, the user which run-time behavior he would like to use (either a single instance of the plugin process (`Single`), or multiple plugin processes if multiple ImJoy interface with the same workspace are opened (`Multi`)).

### TODO: Use Docker Containers
 **Not yet supported**

 Python plugin can also be ran with Docker.
 Examples:
  * If you want to run your plugin with tensorflow docker, you need to add the following fields to your `<config>`:
 ```json
 <config lang="json">
   ...
   "env": "docker pull tensorflow/tensorflow:1.9.0-py3",
   "requirements": ["numpy", "scipy"],
   "cmd": "python",
   ...
 </config>
 ```

## Development and Debugging
* **JavaScript plugin**: You can create Javascript plugins from the template(`webworker` or `window`) in the **+ PLUGINS** dialog. With the ImJoy code editor, you can write your code. For testing you can click save on the toolbar in the code editor, and it will automatically load your plugin to the plugin menu shown on the left side. By right click on in the workspace, you use the [chrome development tool](https://developers.google.com/web/tools/chrome-devtools) to see the console and debug your code.

* **Python plugin**: Similary, you can create Python plugins from the `pyworker` template in the **+ PLUGINS** dialog. If your plugin engine is running, you can save and run(Ctrl+S, or through the toolbar) with your code directly in the ImJoy code editor. For larger project with many Python files, the recommended way is to wrap your Python files as standard Python modules, write and test the Python module using your code editor/IDE of choice (Atom, Spyder, PyCharm,...). Then create an ImJoy plugin with the ImJoy code editor, by inserting the module path to `sys.path` (e.g. `sys.insert(0, '~/my_python_module')`), you can then import the module to the ImJoy plugin and test it.

## Deployment of your plugin
Below we provide detailed information for the different deployment options we recommend. We also provide some examples in the [Tutorial section](http://imjoy.io/docs/#/tutorial?id=tutorials-for-distribution-and-deployment).

### Plugins without dependencies
If the pluging does not depend on libraries or module written by yourself, you can just uploade the file (.imjoy.html) to a Gist or GiHub repository. To share with others, copy the link pointing to the link of the Github file or the `raw` link of the Gist file. This url can then be used to install the plugin in ImJoy: press the `+ Plugins` button and add the the url in the field `Install plugin from url`. See also the dedicated [Tutorial](http://imjoy.io/docs/#/tutorial?id=distribution-and-deployment-of-a-plugin-with-github-gist).

If you want to contribute your plugin to the ImJoy central plugin repository, so users can directly install from the plugin repository shown on ImJoy.io, you need to send a pull request to the repository. More details about that: [ImJoy-Plugins repository].

### Plugins with extra dependencies
If your plugin depends on non-standard libraries and modules, you have to provid them with your plugin. You can upload those libraries and modules to a [GitHub Gist](https://gist.github.com/), a GitHub repository, or other data-sharing platforms such as Dropbox and link them in the plugin code.

 * for **JavaScript** plugins, you need to create a [gist](https://gist.github.com/) or repository on GitHub named with the plugin name, and upload the plugin file together with other JavaScript files. In the plugin file, you can use `importScripts(url_to_your_js_file)` function to use this libraries. However, due to a restriction of GitHub, you can't use the url of GitHub directly, you need to copy the url of your JavaScript file, and convert it with [jsDelivr](https://www.jsdelivr.com/rawgit).
 * for **Python** plugins, you need to create a `setup.py` file to wrap the plugin as a pip module, create a [gist](https://gist.github.com/) or a GitHub repository named with the plugin name, and upload the plugin file together with your python modules. Now add the github link to `requirements` in the `<config>` block of your plugin. The GitHub link should be formated to something like: `git+https://github.com/oeway/ImJoy-Engine#egg=imjoy`, you can test with the `pip install ...` command to see if you can install your module. As an alternative recommended during development, you can also use Dropbox as explained in this [Tutorial](http://imjoy.io/docs/#/tutorial?id=distribution-and-deployment-of-codedata-stored-on-dropbox).

## Deploying your plugins through your own Github repository
You can easily build a plugin repository by adding a json file named `manifest.imjoy.json`, here is an example: [ImJoy Project Template/manifest.imjoy.json](https://github.com/oeway/ImJoy-project-template/blob/master/manifest.imjoy.json).
An skeleton of `manifest.imjoy.json` looks like this:
```json
{
 "name": "NAME OF THE REPOSITORY",
 "description": "DESCRIBE THE REPOSITORY",
 "version": "0.1.0",
 "uri_root": "/imjoy-plugins",
 "plugins": [
   //copy and paste the <config> block of your plugin here
 ]
}
```

1. Place all the plugin files in a folder in your Github repository, for example, a folder called [imjoy-plugins](https://github.com/oeway/ImJoy-project-template/tree/master/imjoy-plugins).
1. Set `uri_root` in `manifest.imjoy.json` to the name/path of your plugin folder, for example `"uri_root": "/imjoy-plugins"`.
1. For each plugin you, you can copy and paste the content in your `<config>` block to `plugins` in `manifest.imjoy.json`.
1. For each plugin `<config>` block you added to `manifest.imjoy.json`, add a field called `"uri"`, and set the value to the actual file name of your plugin file, for example: `"uri": "untitledPlugin.imjoy.html",` if your plugin file is named "untitledPlugin.imjoy.html". You can skip this step if you name your plugin file exactly as the file name of the plugin file name.
1. In case you place plugins into different subfolders, you can set `uri_root` to empty(`""`), and set `"uri"` to a relative path to that file, for example `"uri": "imjoy-plugins/untitledPlugin.imjoy.html",`.


### Deploying your plugins through the ImJoy plugin repository
The plugin repository shown on the ImJoy.IO is served with Github through the [ImJoy-Plugins repository](https://github.com/oeway/ImJoy-Plugins). In order to deploy your plugin to the plugin repository, you can fork the repository, add your plugin and then send a pull request to [ImJoy-Plugins](https://github.com/oeway/ImJoy-Plugins). Once the pull request being accepted, the user will be able to install your plugin from the plugin repository.

### Deploying your plugin for development
If you only have one plugin and you just want to quickly share with others, this often happens in the early stage of the development. An alternative to make a plugin repository is to send the plugin directly with an url. In that case, the only thing you need is to get an url pointing to the ImJoy plugin file (extension: `*.imjoy.html`), therefore, the plugin file can be hosted on GitHub, Gist or Dropbox etc. A user can then install the plugin from the plugin url.

1. For files on Github, you just need to copy the link to the file, example link would be:
1. For Gist or other Git providers such as (Gitlab), you need to obtain the `raw` link of the plugin file. For example, a Gist `raw` link would looks like this: `https://gist.githubusercontent.com/oeway/aad257cd9aaab448766c6dc287cb8614/raw/909d0a86e45a9640c0e108adea5ecd7e78b81301/chartJSDemo.imjoy.html`

1. A special case for Dropbox, you need to convert the sharable url: 1) replace `dl=0` to `dl=1`; 2) replace `https://www.dropgox.com/` to `https://dl.dropboxusercontent.com/`. TODO: example

## Distribution of your plugin
There are in general two ways of distributing your Imjoy plugins, sending the plugin file (`*.imjoy.html`) or with the url.
The easiest and recommended way is by generating an url and share it directly through email or social networks. The user can then directly click the url and install it in one click.

#### Generating a plugin url
This url is composed of  the base url `http://imjoy.io/#/app?`, followed by the url parameter `plugin` set to the file url of your ImJoy plugin file.
The basic format is `http://imjoy.io/#/app?plugin=PLUGIN_URI`, you will need to replace `PLUGIN_URI` to your actuall plugin URI.

There are two types of plugin URI:
1. If your plugins are deployed as a `ImJoy Plugin Repository`(as described above), you can then use a short plugin URI formated as `GITHUB_USER_NAME/REPO_NAME:PLUGIN_NAME`. For example, you can use `oeway/ImJoy-project-template:Untitled Plugin` to represent a plugin hosted on https://github.com/oeway/DRFNS-Lite. You can also specify the plugin tag by adding `@TAG` after the `PLUGIN_NAME` For example: `oeway/DRFNS-Lite:DRFNS-Lite@GPU`. In case you want to specify a git commit hashtag to freeze the plugin at a certain commit, you can add `@COMMIT_HASHTAG` after the `REPO_NAME`: for example: `oeway/DRFNS-Lite@4063b24:DRFNS-Lite` where `4063b24` is the short form of the commit of [4063b24f01eab459718ba87678dd5c5db1e1eda1](https://github.com/oeway/DRFNS-Lite/tree/4063b24f01eab459718ba87678dd5c5db1e1eda1).

2. Alternatively, you can always use an url to the plugin file hosted on any websites including your own project site, blog, Github, Gist or Dropbox. In that case, the url would be the URI for the plugin. Notice that, the plugin file needs to end with `.imjoy.html`. In case you want to specify the plugin tag, you can just append `@TAG` to the file url, right after `.imjoy.html`. For example: `https://raw.githubusercontent.com/oeway/DRFNS-Lite/master/DRFNS-Lite.imjoy.html@GPU`.


Once you generated the URI, you can paste it to the `+ PLUGINS` dialog (`Install from URL`) and press `Enter`, to see the URI is understand by ImJoy. If everything works, you should be able to see a card rendered with your plugins which you can click `INSTALL`.

To share with others, you just need to add the plugin URI to `http://imjoy.io/#/app?plugin=`. For example: [http://imjoy.io/#/app?plugin=https://github.com/oeway/ImJoy-Plugins/blob/master/repository/imageWindow.imjoy.html](http://imjoy.io/#/app?plugin=https://github.com/oeway/ImJoy-Plugins/blob/master/repository/imageWindow.imjoy.html). When the user click this link, a plugin installation dialog will be shown which proposes to install the specified plugin. The user has to simply confirm by clicking `Install`.

#### Supported url parameters

Moreover, you can construct ImJoy url with customized functionality. It largely simplify the user operation when installing or using ImJoy. This is particularly useful for sharing plugins through your own project or Github repo. For example, with the `plugin` parameter in an ImJoy url, the defined plugin will be shown to the user directly.

Url parameters can be used after `https://imjoy.io/#/app?`, using `PARAM=VALUE` syntax. Multiple parameters can be concatenate togeter with `&`. For example we want to specify `A=99` and `B=hello`, the corresponding url would be `https://imjoy.io/#/app?A=99&B=hello`.

Following is a list of supported url parameters:

 * `w` workspace name, an url contains `w` as a query string (e.g. https://imjoy.io/#/app?w=test) can be used to create or switch to a new workspace.
 * `plugin` show the specified plugin in the plugin management dialog, you can use plugin name or an url/URI for the plugin, for example: `https://imjoy.io/#/app?plugin=Image%20Window` will show up a plugin dialog with `Image Window` in the search. If your plugin is hosted from a github repository, you can make it as a `ImJoy Plugin Repository` by adding a manifest file named `manifest.imjoy.json`, an example can be found here: https://github.com/oeway/ImJoy-project-template. Please also refer to `Install from url` for more details.
 * `tag` define a plugin tag, this can only be used with `plugin`, if the plugin have multiple tags, the user won't need to select the tag when installing the plugin.
 * `engine` define the engine url, for example: `http://imjoy.io/#/app?engine=http://127.0.0.1:8080`, notice that if you want to connect to a remote machine through http (not https) connection, you can only do it by using `http://imjoy.io` rather than `https://imjoy.io`. This restriction also exist if you use localhost with some browsers (e.g. firefox), to avoid it, you need to use `http://127.0.0.1:8080` rather than `http://localhost:8080`, because most browser will consider `127.0.0.1` is a secured connection, but not `localhost`. However, there is an exception, on Safari, using `127.0.0.1` does not work due to [this](https://bugs.webkit.org/show_bug.cgi?id=171934), if you still want to use Safari, you have to switch to `http://imjoy.io`.
 * `token` define the connection token, for example: `http://imjoy.io/#/app?token=2760239c-c0a7-4a53-a01e-d6da48b949bc`
 * `repo` specify a imjoy manifest file which point to a customized plugin repository, this can be a full repo link such as `repo=https://github.com/oeway/ImJoy-Plugins` or a simplified github link `repo=oeway/ImJoy-Plugins`. If you are hosting your repo from a non-GitHub website (e.g. Gitlab), please use the `raw` link to the `manifest.imjoy.json` file. This can be used by developers to deploy their own plugin repository through Github. Fork the [ImJoy-Plugins](https://github.com/oeway/ImJoy-Plugins) repository, and change the `manifest.imjoy.json` file. Then copy the link of the Github repository or the raw link of the manifest file and use it with `repo` to construct an url for sharing with the users.
 * `load` define a customized url which contains data (e.g. a tif image) loaded automatically into the ImJoy workspace. This can be used to link data to ImJoy, for example, by defining a `open with imjoy` button.
 These parameters are independent from each other, meaning you can combine different parameters with `&` and construct a long url. For example combining engine url and connection token:  `http://imjoy.io/#/app?engine=http://127.0.0.1:8080&token=2760239c-c0a7-4a53-a01e-d6da48b949bc`.
