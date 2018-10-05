# Developing Plugins for ImJoy

<img src="https://github.com/oeway/ImJoy/raw/master/docs/img/imjoy-code-screenshot.png" width="600px"></img>

Click the **+ PLUGINS** button in `Plugins`, then select `Create a New Plugin` with one of the plugin templates. A code editor will open in the workspace, where you can write the code, save it, or install the plugin to the plugin menu. You can then test your plugin by clicking on
the plugin name in the Plugins list.

## Plugin file format
The ImJoy plugin file format is built up on html format with customized tags (inspired by the `.vue` format). it consists of two mandatory tags `<config>` and `<script>`, and other optional tags including `<docs>`, `<window>`,`<attachment>`,`<link>` and `<style>`.  For `<style>`, you can also use  multiple `src` tags.

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
### `<config>` tag

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
* `mode` is the plugin type. Currently supported are:
  * `webworker` to run computationally intensive javascript plugins. It does not have an interface, it runs in a new thread and won't hang the main thread during running.
  * `iframe` is used for create a new web interface with HTML/CSS and Javascript. It runs in the same thread as the main webpage. If `iframe` mode is selected, then you need to provide HTML code with the `<window>` tag and CSS code with the `style` tag.
  * `pyworker` is used to run plugins written in Python. This requires that the **Python Plugin Engine** is installed and started before using the plugin. See the **Developing Python Plugins** for more details.
* `tags` defines a list of supported tags, which can be used to provide differentiate configureable modes and can be accessed at various points in the plugin. For an overview we
we refer to the dedicate description **## Plugins and tags**
* `ui` is a string specifying the GUI that will be displayed to the user. The following elements can be used to render an input form:
  * `type: 'choice', options: ['cat', 'dog'], placeholder: 'cat'`
  * `type: 'number', min: 0, max: 10, placeholder:2`
  * `type: 'color'`
  * `type: 'string'`
  * `type: 'save'`
  * `type: 'instructions/comment'`
  * `type: 'variableName'`
  * ...

  For each element, you need to define a unique `id`, which can then be used to access
  the value of this element in the plugin. For example, to render a form with a selection use `"ui": "select an option: {id: 'option1', type: 'choice', options: ['cat', 'dog'], placeholder: 'cat'}"`.  In the plugin, the selection can then be accessed with `my.config.option1`.

  To define longer forms with multiple lines, we support additional definitions
  of the `ui` string.

  * an array of strings. For example:
```json
"ui": [
       "option1: {id: 'option1', type: 'choice', options: ['cat', 'dog'], placeholder: 'cat'}",
       "option2: {id: 'option2', type: 'number', placeholder: 3}"
      ],
```
  * an array with keys and values. Here, you have to use `" "` for the keys and the strings. Definitions can also be mixed. In the example below, we use a string as above for `option1` and an array with keys and values for `option2`. Note how for `option2` each key and value
  is defined as an individual string.
```json
"ui": [
       {"option1": "{id: 'option1', type: 'choice', options: ['cat', 'dog'], placeholder: 'cat'}"},
       {"option2": {"id": "option2",
                    "type": "number",
                    "placeholder": 3}}],
```

* `version` specifies the version of the plugin.
* `api_version` specifies the api version of ImJoy the plugin is written for.
* `url` points to current file, and is used to download the plugin  when a user installs it from the plugin store.
* `description` contains a short description about the plugin.
* `icon` defines the icon used in the plugin menu. You can find different icons here https://material.io/tools/icons/ and used the specified name. Or, you can directly copy and paste Emoji, for example from [here](https://getemoji.com/).
* `inputs` defines the inputs with json-schema syntax (http://json-schema.org/) .
For example, to define that the plugin uses png files, you can specify `"inputs": {"properties": {"type": {"enum": ["image/png"], "required": true}}, "type": "object"}` . You can also use the simplified format which assumes the inputs is an object and use json schema to describe the properties: `"inputs": {"type": {"enum": ["image/png"], "required": true}}`.
* `outputs` defines the outputs with json-schema syntax (http://json-schema.org/).
The format is the same as for `inputs`.
* `env` (**for python plugins only**) the virtual environment or docker image command used to create an enviroment to run the plugin.
* `cmd` (**for python plugins only**) the command used to run the plugin. By default, it will be run with `python`. Depending on the installtion it could also be be something like `python3` or `python27` etc.
* `requirements` (**for python plugins only**) the pip packages which will be installed before running the plugin defined as a list of pip packages or a command string. ImJoy supports package names and github links. For example, `["numpy", "scipy==1.0"]` or `"pip install numpy scipy==1.0"`. To use conda, you can set the string to `"conda install numpy scipy==1.0"`. For more information see the dedicate section **Using virtual environments**.
* `dependencies` names of other imjoy plugins which the current pluging depend on. They will be installed automatically during installation. An url can also be used as a dependency for sharing a plugin. For both cases, a hash tag can be used to specify the tag for the plugin. For example: `dependencies: ["Image Denoising#stable"]`, it means this plugin depends on the `stable` version of the `Image Denoising` plugin (of course, the plugin needs to define these tags).

### `<docs>` tag
Used to contain documentation for the plugin, it need to be written in `Markdown` language. Here is a document about how to write document in `Markdown`: [Mastering Markdown](https://guides.github.com/features/mastering-markdown/).

### `<window>` tag
Define the HTML code for displaying in the plugin window.

### `<style>` tag
Define the CSS code for displaying in the plugin window.

### `<script>` tag

Plugins can be written in Javascript or Python, a minimal plugin needs to implement two functions: `setup()` and `run()`. Optionally, the function `exit` will be called when the plugin is killed.

The `lang` property of the `<script>` tag is used to specify the used programming language:
 * for Javascript, use `<script lang="javascript"> ... </script>`
 * for Python, use `<script lang="python"> ... </script>`

`<script>` also supports `tags`. For more information, see the dedicated section **Plugins and tags**.

#### `setup()` function
This function will be executed when a plugin is loaded and initializes it.

#### `run()` function
This function will be called each time a plugin is executed. When executed, an object (for Javascript) or a dictionary (for Python) called `my` will be passed into the function. More in the section **Plugin during runtime ** below.

#### optional: `update()` function
Optionally, you can define an update function which will be called when any setting of the op is changed.

## Plugin operations
For a plugin, you can define independent operations (or **ops**) with the Plugin API (see **api.register** for details). Each of these **ops** is defined in a similar fashion as
the `<config>` tag and has it's own set of parameters defined via a GUI and can have its dedicated run fucntion. The different ops are displaued when you press on the button down arrow in the Plugin list. Each op can also be added to the workflow separately.

## Plugin during runtime
When executing a plugin, it can can access the fields `config` and `data` from `my`:

 * `my.config`
 The config values from the GUI defined with the `ui` string (from the plugin `<config>` tag
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

The **`<script>`** tag can be configured, and you can select which script script is executed. For this, you have to add the `tag` property to the `<script>` tag. Notice also that you will still need the `lang` property. For example, if you have `"tags": ["stable", "dev"]`, then you can have two script blocks: `<script lang="python" tag="stable">` and `<script lang="python" tag="dev">`.

When developing and testing a plugin, the ImJoy editor will recognize that the plugin
has multiple tags and you can select a tag in the tile bar of the plugin. When loading
the plugin, it will be loaded with this tag.


## `Plugin API`
The plugin system of ImJoy is built on remote procedure calls, and an encoding and decoding scheme is used by ImJoy to transfer data and functions between plugins. We expose a set of API functions from  both the main app and the plugins.

In the plugin, a predefined object called `api` can be used to access the ImJoy API, detailed information can be found in the **ImJoy API** section. By using an ImJoy API called `api.export`, a set of functions can be exported as `Plugin APIs`, `setup` and `run` as described before are two mandatory `Plugin API` functions which need to be defined and exported. In addition to that, other functions can be also exported as `Plugin APIs`.

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
Within the plugin, the variable  `api` exposes a set of internal utility functions, e.g.
to interact with the GUI or other plugins.

### Asynchronous behaviour
All API functions are asynchronous. This means that when a `ImJoy API` function
is executed, it will not return the result immediately but instead return a object called `promise`.

For example, if you popup a dialog to ask for user input, a synchronous program will block the execution until the user close the dialog. However an synchronous program will return the `promise` object even if the user didn't close the dialog. You can then set a so-called callback function which will be called when the user close the dialog.([More about Promise.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)).

ImJoy suports two programming styles to access these asynchronous functions
for both Python and JavaScript:

 1) `callback` style. Call the asynchronous function and set its callback with `.then(callback_func)`. For Javascrit plugins, a native Javascrit `Promise` will
 be returned. For Python plugins, it will return a simplified Python implement of promise.
 Below examples for an api name `XXXXX`):

```javascript
class JSPlugin(){
  setup(){
  }
  run(my){
      api.XXXXX().then(this.callback)

      // optionally, you can catch error
      const error_callback(error){
        console.error(error)
      }
      api.XXXXX().then(this.callback).catch(error_callback)
  }

  callback(result){
     console.log(result)
  }
}
```

```python
class PyPlugin():
    def setup(self):
        pass

    def run(self, my):
        api.XXXXX().then(self.callback)

        # optionally, you can catch an error
        def error_callback(error):
            print(error)
        api.XXXXX().then(self.callback).catch(error_callback)

     def callback(result):
        print(result)
```

 2) `async/await` style. Declare your function with the `async` keyword. Append `await` to the asynchronous function to wait fore the result. This essentially allows a synchronous style programming without the need to sett callbacks. For example:
 ```javascript
 // JavaScript
 class JSPlugin(){
   async setup(){
   }
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
 ```

 ```python
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

 Notice that, for Javascript and Python 3+, both syntax are available, however, for Python 2, `asyncio` is not supported, you can only use the first `callback` style. Don't forget to `import asyncio` if you use `async/await` with Python 3.

### Input arguments
When calling the API functions, most functions take an object (Javascript) or dictionaries/named arguments (Python) as its first argument. The following function call will work in both JavaScript and Python:
```javascript
//# works for JavaScript and Python
api.XXXXX({"option1": 3, "option2": 'hi'})
```

```python
# only for Python
api.XXXXX(option1=3, option2='hi')
```
### ImJoy API functions

For the list of the API functions, we refer to the [ ImJoy API functions](/api).


## Developing Window Plugin
Window plugin is a special type of plugins running in `iframe` mode, and it will show up as a window. `<window>` and `<style>` can be used to define the actual content of the window.

In order to make a `window` plugin, you need to set `mode` as `window` in the `<config>` tag.

Different from other plugins which will be loaded and intialized when ImJoy is started, a `window` plugin will not be loaded until the actuall plugin is created with `api.createWindow` or clicked by a user in the menu. During execution of `api.createWindow`, `setup` and `run` will be called for the first time, and return with an window ID. After that, if needed, another plugin can call `api.updateWindow` with the window ID, ImJoy will try to execute the `run` function with the new data again.

If the `run` returned with an object, then it will be used to update the window status managed by ImJoy. This means, for example, if the user changed the name of the plugin, it can be achieved by returning the same `my` object in the `run` function.


## Developing Webworker Plugin

## Developing Python Plugins

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

### Data exchange

When a window in the ImJoy workspace is selected, the contained data (e.g. an image) will be transferred to the Python plugin. The plugin can then process the data with the `run` function, results will be send back to the ImJoy workspace and displayed as a new window. Natively, ImJoy supports the conversion and transmission of Numpy arrays and Tensorflow tensors, so plugin developers could just use those data types and exchange them between plugins, no matter if they are in Python or Javascript.

#### Small data volumes

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

#### Large data volumes
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
During the development of a plugin, you can use the chrome developments tool to debug your javascript plugin. Python plugins can be tested alone first and then wrapped as python modules, you can import them by running the `python -m imjoy` in the directory with your modules.

For depolying your plugin, if they do not depend on library or module written by your self, you could just upload the file to a Github repository. For sharing with others, you can copy the link point to the `raw` file. Other uses can use the url to install from ImJoy. If you want to contribute your plugin to the ImJoy central repository, so users can directly install from the plugin store shown on ImJoy.io, you need to send a pull request to the repository. More details about that: [ImJoy-Plugins repository].

If your plugin depends on non-standard libraries and modules, and you want to provid them with your plugin. You just need to upload those libraries and modules to a github [gist](https://gist.github.com/) or repository, and link them in the plugin code.

 * for javascript plugin with extra dependencies, you need to create a [gist](https://gist.github.com/) or repository on Github named with the plugin name, and upload the plugin file together with other javascript files. In the plugin file, you can use `importScripts(url_to_your_js_file)` function to use this libraries. However, due to a restriction of Github, you can't use the url of github directly, you need to copy the url of your javascript file, and convert it with [RawGit](https://rawgit.com/).
 * for python plugin with extra dependencies, you need to create a `setup.py` file to wrap the plugin as a pip module, create a [gist](https://gist.github.com/) or repository on Github named with the plugin name, and upload the plugin file together with your python modules. Now add the github link to `requirements` in `<config>` of your plugin. The github link should be formated to something like: `git+https://github.com/oeway/ImJoy-Python#egg=imjoy`, you can test with the `pip install ...` command to see if you can install your module.

The plugin store shown on the ImJoy.IO is served with Github through the [ImJoy-Plugins repository](https://github.com/oeway/ImJoy-Plugins).

In order to deploy your plugin to the plugin store, you can fork the repository, add your plugin and then send a pull request to [ImJoy-Plugins](https://github.com/oeway/ImJoy-Plugins). Once the pull request being accepted, the user will be able to install your plugin from the plugin store.


### Install plugins from url
You can install a plugin from an url which point to a ImJoy plugin file (extension: `*.imjoy.html`).In order to do that, you can construct an url by setting `plugin` to the **raw** file url of your image plugin file from Github, for example: `http://imjoy.io/#/app?plugin=https://raw.githubusercontent.com/oeway/ImJoy-Plugins/master/repository/imageWindow.imjoy.html`. You may need to encode all the strings into url, the easiest way to make it right is to write directly in the address bar of your browser and then use the url copied from the address bar. For example the previous url will become: `http://imjoy.io/#/app?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Foeway%2FImJoy-Plugins%2Fmaster%2Frepository%2FimageWindow.imjoy.html`.

For installing a plugin with predefined tag, you can use `#` to append the tag, for example, you can add `#dev` to tell ImJoy to install with the `dev` tag from the plugin.

When open such an url, a plugin management dialog will be shown which allow the user to click `Install`.

#### Supported url parameters
 * `w` workspace name, an url contains `w` as a query string (e.g. https://imjoy.io/#/app?w=test) can be used to create or switch to a new workspace.
 * `plugin` show the specified plugin in the plugin management dialog, you can use plugin name or an url for the plugin, for example: `https://imjoy.io/#/app?plugin=Image%20Window` will show up a plugin dialog with `Image Window` in the search. You can also set `plugin` to an url for sharing plugin hosted on github, please refer to `Install from url` for more details.
 * `engine` define the engine url, for example: `http://imjoy.io/#/app?engine=http://127.0.0.1:8080`, notice that if you want to connect to a remote machine through http (not https) connection, you can only do it by using `http://imjoy.io` rather than `https://imjoy.io`. This restriction also exist if you use localhost with some browsers (e.g. firefox), to avoid it, you need to use `http://127.0.0.1:8080` rather than `http://localhost:8080`, because most browser will consider `127.0.0.1` is a secured connection, but not `localhost`. However, there is an exception, on Safari, using `127.0.0.1` does not work due to [this](https://bugs.webkit.org/show_bug.cgi?id=171934), if you still want to use Safari, you have to switch to `http://imjoy.io`.
 * `token` define the connection token, for example: `http://imjoy.io/#/app?token=2760239c-c0a7-4a53-a01e-d6da48b949bc`

 These parameters are independent from each other, meaning you can combine different parameters with `&` and construct a long url. For example combining engine url and connection token:  `http://imjoy.io/#/app?engine=http://127.0.0.1:8080&token=2760239c-c0a7-4a53-a01e-d6da48b949bc`.
