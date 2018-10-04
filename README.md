# ImJoy
## Image processing with joy :)

<img src="https://github.com/oeway/ImJoy/raw/master/docs/img/imjoy-screenshot.png" width="600px"></img>

Currently, ImJoy consists of three repositories:
 * [the ImJoy web application](https://github.com/oeway/ImJoy/) (this repository)
 * [the ImJoy plugin engine](https://github.com/oeway/ImJoy-Python)
 * [the ImJoy plugin repository](https://github.com/oeway/ImJoy-Plugins)

## Key Features of ImJoy
 * Serverless solution with offline-first design
 * Easy-to-use workflow composition
 * Extendable plugin interface
   - Support Python and Javascript
   - Javascript plugins are isolated with secured sandboxes
   - Python plugins run in their own process
   - Support `async/await` syntax for Python3 and Javascript
   - Support virtual environments and pip packages for Python
   - Support libraries hosted on Github or CDNs for javascript
   - Deploying your own plugin with Github
 * Battery-included plugin prototyping
   - Built-in code editor, no extra IDE is needed for development
 * Native support for n-dimentional arrays and tensors
   - Support ndarrays from Numpy or Numjs for data exchange
   - Support Tensorflow.js and native Tensorflow for deep learning
 * Rendering muti-dimentional data in 3D with webGL, Three.js etc.

# Using Imjoy for image processing

## Basic Usage: the ImJoy web app
 * Go to the [ImJoy web app](https://imjoy.io/#/app), click the **+ PLUGINS** button in `Plugins` to install new plugins from the [Plugin Repository](https://github.com/oeway/ImJoy-Plugins).
 * You can then open files or folders with the **+** button, or drag and drop them to the web app.
 * When files are loaded into the workspace, you can click the file to open it if the file is recognized by ImJoy or any plugin. For example, if you installed the plugin "Tif file importer", you will be able to click the .tif file in the file window.
 * Similar to [ImageJ](https://imagej.nih.gov/ij), when clicking on the plugin menu, ImJoy will try to pass the current active window to the plugin, it is them let the plugin decide how to process the data contained in the window.
 * If you installed plugins written in Python, they will be disabled by default. In order to light them up, and benifit from the full power of your computer, you need to setup the **Python Plugin Engine** as follows.

## Advanced Usage: the Python Plugin Engine
You can use the **Python Plugin Engine** to unlock the power of your computer or another computer in your local network.

To use it, go to the [ImJoy web app](https://imjoy.io/#/app), and click the 🚀 button located on the upper-right corner, you will find instructions on how to set it up. Basically, you will be asked to install the engine and run `python -m imjoy` to start it.

More detailed instructions can be found here: [ImJoy-Python](https://github.com/oeway/ImJoy-Python).

### Install from url
You can install a plugin from an url which point to a ImJoy plugin file (extension: `*.imjoy.html`).In order to do that, you can construct an url by setting `plugin` to the **raw** file url of your image plugin file from Github, for example: `http://imjoy.io/#/app?plugin=https://raw.githubusercontent.com/oeway/ImJoy-Plugins/master/repository/imageWindow.imjoy.html`. You may need to encode all the strings into url, the easiest way to make it right is to write directly in the address bar of your browser and then use the url copied from the address bar. For example the previous url will become: `http://imjoy.io/#/app?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Foeway%2FImJoy-Plugins%2Fmaster%2Frepository%2FimageWindow.imjoy.html`.

For installing a plugin with predefined tag, you can use `#` to append the tag, for example, you can add `#dev` to tell ImJoy to install with the `dev` tag from the plugin.

When open such an url, a plugin management dialog will be shown which allow the user to click `Install`.

### Supported url parameters
 * `w` workspace name, an url contains `w` as a query string (e.g. https://imjoy.io/#/app?w=test) can be used to create or switch to a new workspace.
 * `plugin` show the specified plugin in the plugin management dialog, you can use plugin name or an url for the plugin, for example: `https://imjoy.io/#/app?plugin=Image%20Window` will show up a plugin dialog with `Image Window` in the search. You can also set `plugin` to an url for sharing plugin hosted on github, please refer to `Install from url` for more details.
 * `engine` define the engine url, for example: `http://imjoy.io/#/app?engine=http://127.0.0.1:8080`, notice that if you want to connect to a remote machine through http (not https) connection, you can only do it by using `http://imjoy.io` rather than `https://imjoy.io`. This restriction also exist if you use localhost with some browsers (e.g. safari), to avoid it, you need to use `http://127.0.0.1:8080` rather than `http://localhost:8080`, because most browser will consider `127.0.0.1` is a secured connection, but not `localhost`.
 * `token` define the connection token, for example: `http://imjoy.io/#/app?token=2760239c-c0a7-4a53-a01e-d6da48b949bc`

 These parameters are independent from each other, meaning you can combine different parameters with `&` and construct a long url. For example combining engine url and connection token:  `http://imjoy.io/#/app?engine=http://127.0.0.1:8080&token=2760239c-c0a7-4a53-a01e-d6da48b949bc`.
### How does it work?
ImJoy supports Python Plugins which can run much more computationally intensive tasks. In order to run that, it needs to connect to the Python Plugin Engine -- a small python library we developed for ImJoy (source code: https://github.com/oeway/ImJoy-Python).

Under the hood, the Python Plugin Engine will be connected with the ImJoy web app through websockets, the interaction is done with remote procedure calls (RPC). When a window in the ImJoy workspace is selected, the contained data (e.g. an image) will be transferred to the Python plugin so it can process the data with the `run` function, results will be send back to the ImJoy workspace and displayed as a new window. Natively, ImJoy supports the conversion and transmission of Numpy arrays and Tensorflow tensors, so plugin developers could just use those data types and exchange them between plugins, no matter they are in Python or Javascript.

## Advanced Usage: Going offline
If you have already installed the **Python Plugin Engine**, then you can run ImJoy in offline mode. What you do is to run the engine with `python -m imjoy --serve` . And it will download all the files for offline access, after that, if you run `python -m imjoy` in the **same directory**, you will have your personal ImJoy web app which can be access by [http://127.0.0.1:8080](http://127.0.0.1:8080).

Also notice that, even though ImJoy can run without internet, depends on the implementation of the plugin, some plugins maybe unusable when you go offline.


# Developing Plugins for ImJoy

<img src="https://github.com/oeway/ImJoy/raw/master/docs/img/imjoy-code-screenshot.png" width="600px"></img>

Click the **+ PLUGINS** button in `Plugins`, then select `Create a New Plugin` with one of the plugin template. A code editor will show up in the workspace, you can write the code, save it, or install the plugin to the plugin menu. You can then test by click your new plugin in the plugin menu.

The ImJoy plugin file format is built up on html format with customized tags (inspired by the `.vue` format), it consists of two mandatory tags `<config>` and `<script>`, and other optional tags including `<docs>`, `<window>` and `<style>`.  For `<style>`, you can also use `src` property and have multiple of it.

Other optional tags includes `<docs>`, `<attachment>` and `<link>`.

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
   ** A recommanded code block in Markdown format with the documentation of the plugin **
</docs>

<attachment name="XXXXX">
   ** An optional for storing text data, you can use multiple of them **
</attachment>
```
## The `<config>` tag

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
* `name` the name of the plugin, it must be unique to avoid conflicting with other plugins.
* `mode` the mode of the plugin, currently supported modes are `webworker`, `iframe` and `pyworker`.
  * `webworker` is used to run computationally intensive javascript plugins. It does not have an interface, it runs in a new thread and won't hang the main thread during running.
  * `iframe` is used for create new web interface with HTML/CSS and Javascript, it runs in the same thread as the main webpage. If `iframe` mode is selected, then you need to provied HTML code with the `<window>` tag and CSS code with the `style` tag.
  * `pyworker` is used to run plugins written in Python, the user needs to have the **Python Plugin Engine** installed and started before using the plugin. See the **Developing Python Plugins** for more details.
* `tags` defines a list of tags which is supported by the plugin. It will serve as a configureable modes for the plugin, for example, a python plugin may have two tags `["GPU", "CPU"]`. The user will be asked to choose one of the tag for the installation. The plugin then can be configured to work in different modes controlled by the corresponding tag.
* `ui` is a string used to generate the GUI to the user, you can include the following elements to render an input form:
  * `type: 'choice', options: ['cat', 'dog'], placeholder: 'cat'`
  * `type: 'number', min: 0, max: 10, placeholder:2`
  * `type: 'color'`
  * `type: 'string'`
  * `type: 'save'`
  * `type: 'instructions/comment'`
  * `type: 'variableName'`
  * ...

  You need to define a unique id for each element, for example `"ui": "select an option: {id: 'option1', type: 'choice', options: ['cat', 'dog'], placeholder: 'cat'}"`.

  In this example, during running, you can read `option1` with the `my.config.option1`.

  Besides one plain string as shown above which may get very long and `json` do not support breaking long string into several lines. Therefore, we support other different ways of defining the `ui` string. Here are different ways:

  * an array with strings: for example:
```json
"ui": [
       "option1: {id: 'option1', type: 'choice', options: ['cat', 'dog'], placeholder: 'cat'}",
       "option2: {id: 'option2', type: 'number', placeholder: 3}"
      ],
```
  * an array with keys and values: for example:
```json
"ui": [
       {"option1": "{id: 'option1', type: 'choice', options: ['cat', 'dog'], placeholder: 'cat'}"},
       {"option2": {"id": "option2",
                    "type": "number",
                    "placeholder": 3}
       }
      ],
```

Notice that for `option2` in the above example, the value is not an string, so we used `" "` for the keys and strings.


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
* `requirements` (**for python plugins only**) the pip packages which will be installed before running the plugin, package names or github links are both supported. It can be a list of pip packages or a command string. For example, `["numpy", "scipy==1.0"]` or `"pip install numpy scipy==1.0"`. If you want to use conda, you can set it to `"conda install numpy scipy==1.0"`.
* `dependencies` names of other imjoy plugins which the current one depend on. They will be installed automatically during installation. An url can also be used as a dependency for sharing a plugin. For both cases, a hash tag can be used to specify the tag for the plugin. For example: `dependencies: ["Image Denoising#stable"]`, it means this plugin depends on the `stable` version of the `Image Denoising` plugin (of course, the plugin needs to define these tags).

To configure the plugin with `tags`, the following `<config>` fields can be made configurable: `"env", "requirements", "dependencies", "icon", "ui", "mode"`.

For example, you can set different `requirements` according to different tag which selected by the user during installation. In order to support that, the `requirements` can be set to `{"gpu": "pip install tensorflow-gpu keras", "cpu": "pip install tensorflow keras"}` or `{"gpu": ["tensorflow-gpu", "keras"], "cpu": ["tensorflow", "keras"]}`.

## The `<docs>` tag
Used to contain documentation for the plugin, it need to be written in `Markdown` language. Here is a document about how to write document in `Markdown`: [Mastering Markdown](https://guides.github.com/features/mastering-markdown/).

## The `<window>` tag
Define the HTML code for displaying in the plugin window.

## The `<style>` tag
Define the CSS code for displaying in the plugin window.

## The `<script>` tag

Plugins can be written in Javascript or Python, a minimal plugin needs to implement two functions: `setup()` and `run()`. Optionally, if you provided a function called `exit`, it will be called when the plugin is being killed.

In order to differentiate the two different languages, use the `lang` property of the `<script>` tag:
 * for Javascript plugin, use `<script lang="javascript"> ... </script>`
 * for Python plugin, use `<script lang="python"> ... </script>`

If `tags` are defined, you can define configurable script tag by adding a `tag` property to the `<script>` tag. Notice also that you will still need the `lang` property.

For example, if you have `"tags": ["stable", "dev"]`, then you can have two script blocks: `<script lang="python" tag="stable">` and `<script lang="python" tag="dev">`.

Beside seperating the code into different `<script>` tags, the plugin script can also access `api.TAG` variable to determine current plugin tag and change its behavior correspondingly.

### `setup()` function
`setup` function used to get the plugin prepared for running, it will be executed when the plugin during initialization.

### `run()` function
`run` function will be called each time a user click on the menu or run a workflow is executed. While executed, an object(for Javascript) or a dictionary(for Python) called `my` will be passed into the function.

### optional: `update()` function
Optionally, you can define an update function which will be called when any setting of the op is changed.

All the plugins can access `config` and `data` from `my`:

 * `my.config`
 The config values from the user interface defined with the `ui` string (from the plugin config or `api.register`). For example, if you defined an ui string(e.g. `"ui": "option {id: 'opt1', type: 'number'}"`) in the plugin `<config>` or in `api.register({"ui": "option {id: 'opt1', , type: 'number'}"})`, you can access it through `my.config.opt1`.
 * `my.data`
 It stores the data from current active window and state for running the plugin.

 * `my._variables`
     When the plugin is executed in a workflow, variables will be set in the workflow will be passed as `my._variables`. It will be set to the actual variable value if the user used ops such as `Set [number]`.
 * `my._op`
     Give the name of the op which is being executing. When a plugin registered for multiple ops and no callback function was specified for the op, the `run` function will be called, and you can use `my._op` to determine which op is being executing.
 * `my._source_op`
     Give the name of the op which initiated current execution.
 * `my._workflow_id`
     When the plugin is executed in a workflow, the workflow id will be set in the workflow will be passed as `my._workflowId`.

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

Since ImJoy use postMessage to exchange data between plugins, for Javascript plugins, objects are cloned during the transfer. When there is a large object exchange, it will be more effective if the object created by a plugin can be directly transferred. To enable that, you can add `_transfer=true` to your object when you return it. For example, in the above example, you can set `my._transfer = true` when you return `my`. However, it will only speed up the transferring of `ArrayBuffers` or `ArrayBufferViews` (and also ndarrays produced by Python), and after transferring, you won't be able to access it.

(**Note**: in Python, the data type of `my` is a dictionary, ImJoy added the interface for allowing dot notation, just like in Javascript. If you prefer, you can also use `[]` in both languages to access dictionary or object.)

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
class UntitledPythonPlugin():
  def setup(self):
    print('initialized from python.')

  def run(self, my):
    print('hello world.')
    return my

api.export(UntitledPythonPlugin())
</script>
```

## `Plugin API`
The plugin system of ImJoy is built upon remote procedure calls we implemented, an encoding and decoding scheme is used by ImJoy to transfer data and functions between plugins. It works by exposing a set of API functions both from the plugin or the main app. In the plugin, predefined object called `api` is to access the ImJoy API, detailed information can be found in the **ImJoy API** section. By using an ImJoy API called `api.export`, a set of functions can be exported as `Plugin APIs`, `setup` and `run` as described before are two mandatory `Plugin API` functions which need to be defined and exported. In addition to that, other functions can be also exported as `Plugin APIs`.

As you may see in the above examples, they both contain an `api.export` statement as the last line of the `<script>` code block.

```javascript
//Javascript
api.export(new UntitledJSPlugin())

# Python
api.export(UntitledPythonPlugin())
```

**Notice** that in Javascript, the `new` keyword is necessary to create an instance of a class, while in Python there is no `new` keyword.

## Callback functions
Besides the `Plugin API` functions, when a plugin is executed, you can return an object which includes functions which will be called by other plugins or ImJoy. However, if the function has never been exported as a `Plugin API` before, it will be treated a `callback` function and can be only called once. Otherwise, if the function has been exported as `Plugin API`, it won't be treated as `callback` function and can be called repeatly.

## `ImJoy API`
Within the plugin, there is a variable called `api` which exposes a set of internal utility functions. These utility functions can be used in the plugin to interact with the GUI, talk with another plugin etc.

All the API functions provided by ImJoy are asynchronous functions, meaning that when a `ImJoy API` function is executed, you won't get the result immediately. Instead, it will immediately return a object called `promise` ([more about Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)).

There are two supported programming style for accessing asynchronous functions in ImJoy both for Python and JavaScript:

 1) `callback` style: Call the function and set its callback function with `.then(callback_func)`. For example, if you want to popup a dialog for taking the user input, a synchronous program will block the execution until the user close the dialog. However in ImJoy, it will return immediately even if the user haven't close the dialog, with the `promise` object, you can set a callback function which will be called when the user close the dialog.

For Javascrit plugins, native Javascrit `Promise` will be returned. For Python plugins, it will return a simplified Python implement of promise.

Here is how you can use it (suppose the api name is `XXXXX`):
```javascript
// JavaScript
class JSPlugin(){
  run(my){
      const callback(result){
        console.log(result)
      }
      api.XXXXX().then(callback)

      // optionally, you can catch error
      const error_callback(error){
        console.error(error)
      }
      api.XXXXX().then(callback).catch(error_callback)
  }
}

class PyPlugin():
    def setup(self):
        pass

    def run(self, my):
        api.XXXXX().then(self.callback)

        # optionally, you can catch error
        def error_callback(error):
            print(error)
        api.XXXXX().then(callback).catch(error_callback)

     def callback(result):
        print(result)
```
 2) `async/await` style: declear your function use `async`, append `await` to the async function for waiting the result. This essentially allows synchronous style programming without setting callbacks. For example:
 ```javascript
 // JavaScript
 class JSPlugin(){
   async run(my){
     try{
       result = await api.XXXXX()
       console.log(result)
     }
     catch(e){
       console.error(e)
     }
   }
 }

 # Python
import asyncio

class PyPlugin():
    async def setup(self):
        pass

    async def run(self, my):
        try:
            result = await api.XXXXX()
            print(result)
        except Exception as e:
            print(e)
 ```

 Notice that, for Javascript and Python 3+, both syntax are available, however, for Python 2, `asyncio` is not supported, you can only use the first `.then().catch()` style. Don't forget to `import asyncio` if you use `async/await` with Python 3.

When calling the API functions, most functions take an object or dictionary as its first argument. For Javascript plugins, an object should be used. For Python plugins, you use a dictionary, or use named arguments. For example, the following function call will work in both JavaScript and Python:
```javascript
//# works for JavaScript and Python
api.XXXXX({"option1": 3, "option2": 'hi'})

# only for Python
api.XXXXX(option1=3, option2='hi')
```

### `api.alert(...)`
show alert dialog with message, example: `api.alert('hello world')`
### `api.register(...)`
register a new op, example code for JavaScript:
```javascript
    api.register({name: "LUT", ui: "apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}"})
```

Example code for Python:
```python
    api.register(name="LUT", ui="apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}")
```

Or, you can use the following version which works for both Javascript and Python:
```javascript
api.register({"name":"LUT", "ui":"apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}"})
```

By default, each all the ops created by the same plugin will call the same `run` function defined in the plugin, and you will need to use `my._op` in the `run` function to differentiate which op is called.

Alternatively, another `Plugin API` function other than `run` can be passed when calling `api.register`. For example, you can add  `"run": this.hello` in a Javascript plugin or `"run": self.hello` in a Python plugin if `hello` is a member function of the plugin class. When the registered op is exectued, `hello` will be called. **Note:** the function must be a member of the plugin class or being exported (with `api.export`) as a `Plugin API` function. This is because a arbitrary function transfered by ImJoy will be treated as `callback` function, thus only allowed to run once.

If you want to run a function whenever any option is changed, you can pass a `update` function. Similar to `run`, you need to pass a function from the member of the plugin class.

Here is an example which defines `run` and `update` in Python:

```python
class PythonPlugin():
  def apply_lut(self, my):
    ...
  def lut_updated(self, my):
    ...
  def setup(self):
    ...
    api.register(name="LUT",
                 ui="apply LUT {id:'lut', type:'choose', options:['hot', 'rainbow'], placeholder: 'hot'}",
                 run=self.apply_lut,
                 update=self.lut_updated)
    ...
```

If you want to change your interface dynamically, you can run `api.register` multiple times to overwrite the previous version.
`api.register` can also be used to overwrite the default ui string set in the `<config>`, just set the op name as the same as the plugin name, it will update the UI.

### `api.createWindow(...)`
create a new window and add to the workspace, example:
```javascript
//Javascript
const window_callback = (windowId)=>{
  //use `windowId` here to access the window
  console.log(windowId)
}
api.createWindow({name: 'new window', type: 'Image Window', w:7, h:7, data: {image: ...}, config: {}}).then(window_callback)

# Python
def window_callback(windowId):
  # use `windowId` here to access the window
  print(windowId)
api.createWindow({name: 'new window', type: 'Image Window', w:7, h:7, data: {image: ...}, config: {}}).then(window_callback)
```

If you do not want the window to load immediately, you can add `click2load: true` and the window will ask for an extra click to load the content.

Once an window is created, it will return a window ID, which can be used for updating the window with `api.updateWindow`.

### `api.updateWindow(...)`
update an existing window, an window ID should be passed in order to perform the update, example:

```javascript

# Javascript
api.updateWindow({id: windowId, data: {image: ...}})

# Python
api.updateWindow({'id': windowId, 'data': {'image': ...}})
```

The second parameter is an object contains fields which the plugin wants to update.

### `api.showDialog(...)`
show a dialog with customized GUI, example:

```javascript
   api.showDialog({
      "name": "This is a dialog",
      "ui": "Hey, please select a value for sigma: {id:'sigma', type:'choose', options:['1', '3'], placeholder: '1'}.",
   }).then((result)=>{

   })
```
### `api.showProgress(...)`
update the progress bar on the Imjoy GUI, example: `api.showProgress(85)`
### `api.showStatus(...)`
update the status text on the Imjoy GUI, example: `api.showStatus('processing...')`
### `api.showSnackbar(...)`
show a quick message with a snackbar and disappear in a few seconds, example: `api.showSnackbar('processing...', 5)`
### `api.showPluginProgress(...)`
update the progress bar of the current plugin (in the plugin menu), example: `api.showPluginProgress(85)`
### `api.showPluginStatus(...)`
update the status text of the current plugin (in the plugin menu), example: `api.showPluginStatus('processing...')`

### `api.showFileDialog(...)`
show a file dialog for selecting files or directories. It accept the following options:
 * `type` the mode of file dialog, it accept `file` for selecting one or multiple files; `directory` for selecting one or multiple directories; By default, it will use `type='file'`. For Python plugin, if you don't specify the type, both file or directory can be selected.
 * `title` the title of the dialog.
 * `root` the initial path for the dialog to show. (Note: for python plugins on windows, you may want to define the path string as raw string using `r"xxxxxx"` syntax, we have seen unrecognized path issue with normal string).
 * `mode` two modes are supported, by default, the user can select a single or multiple file (with `shift` key pressed), if you want to force the dialog to return multiple files or directories in an array or list, set `mode` to `"multiple"`, or you can force it to return only a single file or directory by setting `mode` to `"single"`, if you want to support both, you can explicitly set `mode` to `"single|multiple"` or keep the default setting.
 * `uri_type` choose the type for return between `"url"` or `"path"`. The default value for JavaScript plugins is `"url"` and for Python plugins is `"path"`.

Since the file handling is different in the browser environment and Python, this api have different behavior when called from different types of plugin. In Javascrpt and Python, an Imjoy file dialog will be displayed, it will only return a promise which you can get the file path string with.

Example:
```javascript
//javascript example
api.showFileDialog().then((file)=>{
  console.log(file)
})
```

```python
# python example
def print_path(path):
  print(path)
api.showFileDialog().then(print_path)
```

### `api.run(...)`
run another plugin by the plugin name, example: `api.run("Python Demo Plugin")` or `api.run("Python Demo Plugin", my)`

### `api.utils`
For Javascript plugins, currently supported functions are:
`api.utils.$forceUpdate` for force refreshing the GUI.

For Python Plugins, currently supported functions are:
`api.utils.kill` for kill a `subprocess` in python.

`api.utils.ndarray` for wrapping ndarray according to ImJoy ndarray format.


### api.getFileUrl
Used for generating an url for accesing a local file or directory path. For example: `api.getFileUrl('~/data/output.png')`, it will return something like `http://127.0.0.1:8080/file/1ba89354-ae98-457c-a53b-39a4bdd14941?name=output.png`.

When this function is called, a confirmation dialog will popup for getting the user's permission. This means a JavaScript plugin cannot access the user's file system without notifying the user.

There are two optional parameters `password` and `headers`:
 * `password`: You can specify a password for accessing the file or folder, For example: `api.getFileUrl('~/data/output.png', password='SECRET_PASSWORD')`.

 * `headers`: With the generated url, By default, the generated url will be served with the default header `Content-disposition: inline; filename="XXXXXXXXX.XXX"` which aims for rendering in the browser. If you want to generate a direct download link, you can pass customized `headers`, for example: `headers={'Content-disposition': 'attachment; filename="XXXXXXXXX.XXX"'}` will give you a direct download link. In order to correctly render the file, you may need to pass a `Content-Type` like this:  `headers={'Content-disposition': 'inline; filename="XXXXXXXXX.XXX"', 'Content-Type': 'image/png'}`. If no header is specified, it will use the standard Python library [mimetypes](https://docs.python.org/3/library/mimetypes.html) to guess a MIME type from the file name, if `mimetypes` failed to guess one, the fallback mime type will be `application/octet-stream`.

### api.getFilePath
This api function convert an url generated by `api.getFileUrl` into an absolute file path on the file system, which can be further accessed by a Python Plugin.

### `api.setConfig(...)`
Each plugin can store its configurations with `api.setConfig`. For example store a simple number `api.setConfig('sigma', 928)`. You can store numbers ands strings but neither objects/arrays (JS) nor dict/list (Python).

**Note** this is designed for storing small amount of data, do not store large object.
Current implementation uses `localStorage` to store settings. Depends on different browsers, most of them can only allow 5M data storage shared by all the plugins and ImJoy app itself.

### `api.getConfig(...)`
This is used for retrieve configurations set by `api.setConfig(...)`.
For example in Javascrit you can use `const sigma = await api.getConfig('sigma')` to access get a previously stored settings.
Notice that `await` is needed because all the api are async functions. Alternatively, you can use `Promise` to access it: ` api.getConfig('sigma').then((sigma)=>{ console.log(sigma) })`.

Similarly, for Python, you will need to use callback function to access the result:
```python
def print_sigma(result):
    print(result)

api.getConfig('sigma').then(print_sigma)
```

### `api.getAttachment(...)`
You can store any text data such as base64 encoded images, code and json in `<attachment>` tag, for example if you have the following tag in the plugin file:
```
<attachment name="att_name">

</attachment>
```

To get the content in JavaScript or Python, you can use `api.getAttachment("att_name")`.
```
// JavaScript
api.getAttachment("att_name").then((content)=>{
  console.log(content)
})

# Python
def callback(content):
    print(content)

api.getAttachment("att_name").then(callback)
```
### `api.TAG` constant
The current plugin tag chose by the user during installation.

### `api.WORKSPACE` constant
Name of the current workspace.

## Developing Window Plugin
Window plugin is a speical type of plugins running in `iframe` mode, and it will show up as a window. `<window>` and `<style>` can be used to define the actual content of the window.

I order to make a `window` plugin, you need to set `mode` as `window` in the `<config>` tag.

Different from other plugins which will be loaded and intialized when ImJoy is started, a `window` plugin will not be loaded until the actuall plugin is created with `api.createWindow` or clicked by a user in the menu. During execution of `api.createWindow`, `setup` and `run` will be called for the first time, and return with an window ID. After that, if needed, another plugin can call `api.updateWindow` with the window ID, ImJoy will try to execute the `run` function with the new data again.

If the `run` returned with an object, then it will be used to update the window status managed by ImJoy. This means, for example, if the user changed the name of the plugin, it can be achieved by returning the same `my` object in the `run` function.


## Developing Webworker Plugin

## Developing Python Plugins

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

class PythonPlugin():
  def setup(self):
    pass

  def run(self, my):
    print('hello world.')
    return my

api.export(PythonPlugin())
</script>

```

### Sending data/files from Python to the web App.

#### sending small amount of data or small files

You can directly pass the data as parameters of api functions which will be send to the frontend directly.

Small numpy arrays, strings, bytes (less 10MB for example) can be directly send through the builtin websocket between the Plugin Engine and the web App.

For example, for quick display of an small image, you can save it as png format and encode it as base64 strings which can then be directly displayed with a standard HTML `<img>` tag.

```python
with open("output.png", "rb") as f:
    data = f.read()
    result = base64.b64encode(data).decode('ascii')
    imgurl = 'data:image/png;base64,' + result
    api.createWindow(name='unet prediction', type = 'imjoy/image', w=7, h=7, data= {"src": imgurl})
```

#### sending large amount of data or huge files

Potentially, you can send large files chunk by chunk using api calls, however, it's not optimal and may block normal communication between the engine and the App.

The recommended way to do that is to store the data on the disk (in the workspace directory for example), then use `api.getFileUrl` to generate an url for accessing the file.

The generated url can then be send to the web App and accessed with a downlad link or using js libraries such as `axios`. Many libraries such as Three.js, Vega etc. can load files through url directly.

### Using virtual environments
  Python plugins for ImJoy can have different conda environments, which provides a way to isolate plugins. You can therefore run python plugins with different versions of Python, or use different pip packages.


  By default, python plugins from ImJoy will be executed in the default conda environment(Python 3.6). If you want to run a plugin in a different conda environment, you can specify it by setting the `env` field in the `<config>` section of the plugin.

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
  **Note 1**: in `requirements`, you can also specify the version number, for example `numpy>=1.15.0`. If you want to install conda modules or you want to run pip with other parameters, you can set `requirements` as a command string instead of a list, for example: you can do `requirements: "conda install opencv-python && pip install numpy"`.

  **Note 2**: in the `env` field, you need to use `-n XXXX` to name your environment, otherwise, it will use the plugin name to name the environment.

### TODO: Use Docker Containers
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
