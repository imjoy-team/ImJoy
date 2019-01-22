# Developing Plugins for ImJoy

Developing plugins for ImJoy is easy and fast with the built-in code editor which runs directly in the web app, no additional IDE or compiler is needed for development.

The following list illustrates key features of the plugin system in ImJoy:
 * Support Python and JavaScript
   - JavaScript plugins are isolated with secured sandboxes
   - Python plugins run in their own process
   - Support concurrent API calls using `async/await` syntax
   - Support virtual environments and pip packages for Python
   - Support libraries hosted on GitHub or CDNs for JavaScript
 * Native support for n-dimentional arrays and tensors
   - Support ndarrays from Numpy or Numjs for data exchange
   - Support Tensorflow.js and native Tensorflow for deep learning
 * Rendering multi-dimensional data in 3D with webGL, Three.js etc.
 * Deploying your own plugin with GitHub


 ## Main components of ImJoy

![imjoy-plugin-development](assets/imjoy-architecture.png ':size=800')

 1.  The **ImJoy Web App**. The app can run alone, and plugins can be developed in
     JavaScript or in Python by using [pyodide](https://github.com/iodide-project/pyodide).

 2.  Complex computional tasks can be implemented in plugins, which run in the
     **Plugin Engine**. The latest release of the plugin engine is available
     together with installation  instructions on [GitHub](https://github.com/oeway/ImJoy-App/releases).
     The plugin engine will try to upgrade itself from GitHub when it starts.
     Packages are managed by `conda` and `pip` which provides access to the
     entire Python ecosystem.

Imjoy consists of **two main components**

 The Python Plugin Engine is connected with the ImJoy Web App through websockets
 and communicates with a customized remote procedure calls (RPC) based on [socket.io](https://github.com/miguelgrinberg/python-socketio).

 ### How to choose a plugin environment
 ImJoy provides a flexible framework to develop your plugins. Here we provide
 some typical examples for how ImJoy can be used. Please not that these are only
 some suggestions, other combinations are of course possible and be interesting
 for particular applications

 1. **ImJoy Web App with JavaScript or Web Python plugins**. Such a framework runs without
  any installation on different operation systems. It can provide effortless user
  experience and ideal for distributing demos. Limitations are that Web Python is (currently)
  slower than native Python and that it doesn't support the entire Python ecosystem.

 2. **Desktop App**. Here you can all plugins types (JavaScript included). Further,
   you have access to the entire python ecosystem thanks to the integrated plugin engine.
   Ideal for heavy computations or when Python modules that are not available for webPY are used.
   However, the app has to be installed.

 3. **Plugin engine on a remote computer**. You can then connect to the engine either
   from the web or desktop app. This allows to process data on a dedicated processing
   workstation or a cluster.


## ImJoy plugins

![imjoy-plugin-development](assets/imjoy-plugin-development.png ':size=800')

There are four types of plugins available for different purposes:

**JavaScript** plugins support these two types:

1. `Window (HTML/CSS/JS)` plugins for building a rich and interactive user interface using HTML5/CSS and JavaScript;

1. `Web Worker (JS)` plugins for performing computational tasks using JavaScript or WebAssembly;

**Python** plugins support these two types:

1. `Native Python` plugins for performing heavy-duty computational tasks using Python and its libraries, this requires additional installation of plugin engine.
   These plugins are indicated with a rocket 🚀;
1. `Web Python` plugins for performing computational tasks using Python with in the browser through WebAssembly and the [pyodide project](https://github.com/iodide-project/pyodide).
   Such plugins are indicated with a little snack 🐍. This is in developmental stage and only a selected number of Python libraries are currently supported.

Click the **+ PLUGINS** button in `Plugins`, then select `Create a New Plugin`
with one of the plugin templates. A code editor will open in the ImJoy workspace,
where you can write the code, save it, or install the plugin to the plugin menu.
You can then test your plugin by clicking on the plugin name in the Plugins list.

![imjoy-plugin-types](assets/imjoy-plugin-types.png ':size=800')

### Web Worker
These plugins are used to do computation tasks in another thread,
using a new element called [web worker](https://en.wikipedia.org/wiki/Web_worker).
It does not have an interface, it runs in a new thread and won't hang the main thread during running.
It is basically a way for JavaScript to achieve multi-threading.

Since web workers are designed to perform computational tasks,
they do not have access to [html dom](https://www.w3schools.com/whatis/whatis_htmldom.asp)
 but you can use `ImJoy API` to interact with the graphical interface of ImJoy
 or other plugin which can trigger changes in the user interface.

### Window
Window plugins are used to create a new web interface with HTML/CSS and JavaScript.
They in the `iframe` mode, and it will show up as a window. The `<window>` and `<style>`
blocks (see below) can be used to define the actual content of the window.

Different from other plugins which will be loaded and initialized when ImJoy is started,
a `window` plugin will not be loaded until the actual plugin is created with `api.createWindow` or clicked on by a user in the menu. During execution of `api.createWindow`, `setup` and `run` will be called for the first time, and return with an window api object (contains all the api functions of the window, including `setup`, `run` and other functions if defined). You can then use the window api object to access all the functions, for example, update the content of the window by `win_obj.run({'data': ... })`.

### Native Python
Used to run Python code. This requires that the **Python Plugin Engine** is installed and started before using the plugin. See the **Developing Python Plugins** for more details.

Similary to Web Worker plugins, Native Python plugins do not have access to the html dom, but you can use `ImJoy API` to interact with the graphical interface of ImJoy or other plugin which can trigger changes on the user interface.


### Web Python
<!--**[TODO]**-->

### Debugging

*   **JavaScript plugins**: this concerns either Web Worker (`web-worker`) or Window (`window`) plugins. With the ImJoy code editor, you can write your code. For testing you can click save on the toolbar in the code editor, and it will automatically load your plugin to the plugin menu shown on the left side. By right click on in the workspace, you use the [chrome development tool](https://developers.google.com/web/tools/chrome-devtools) to see the console and debug your code.

* **Python plugins**: Similarly, you can create Python plugins from the `native-python` template in the **+ PLUGINS** dialog. If your plugin engine is running, you can save and run(Ctrl+S, or through the toolbar) with your code directly in the ImJoy code editor. For larger project with many Python files, the recommended way is to wrap your Python files as standard Python modules, write and test the Python module using your code editor/IDE of choice (Atom, Spyder, PyCharm,...). Then create an ImJoy plugin with the ImJoy code editor, by inserting the module path to `sys.path` (e.g. `sys.insert(0, '~/my_python_module')`), you can then import the module to the ImJoy plugin and test it.

## Loading / saving data
The **ImJoy app** is build on web technology and is running in the browser. This influences
how data can be loaded and saved. For security restrictions, ImJoy or its plugins running in a browser cannot directly
access your local file system, the user will need to open or drag files into ImJoy, and the result files can only be saved by triggering downloads. On the other hand, the **Plugin Engine** has full access to the local file system, native python plugins can read and write directly from the local file system.

![imjoy-data-accessibility](assets/imjoy-data-accessibility.png ':size=800')

Therefore, there are currently several different ways to handle loading/saving files for plugins
with or without the plugin engine.

 * If the **Plugin Engine** is running, there are three api functions for **all** types of plugins to access the local file system: `api.showFileDialog`, `api.getFileUrl`, `api.getFilePath`. Specifically for **Python plugins** running on the plugin engine, files can be directly loaded and written to the file system with standard python file operations.

 * If the **Plugin Engine** is not running, the only way for **JavaScript or Web Python plugins** to access files is ask the user to drag a file, a set of files or a folder directly into the ImJoy workspace. This will render a window with the file/folder content. These data can then be accessed by the plugins and be processed. For exporting result files, `api.exportFile` function can be used to trigger a download.

## Plugin file format
The ImJoy plugin file format (shared by all Plugin types)  is built up on html format with customized blocks (inspired by the `.vue` format). It consists of two mandatory blocks `<config>` and `<script>`, and other optional blocks including `<docs>`, `<window>`,`<attachment>`,`<link>` and `<style>`.  For `<style>`, you can also set the `src` attribute.

Here is an a typical outline of such a plugin file. Note that the
order of these blocks does not matter, so you can shuffle the blocks.

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


### `<config>` block
It defines the general properties of a plugin and contains several fields.

```json
{
  "name": "Untitled Plugin",
  "type": "web-worker",
  "tags": [],
  "ui": "image processing",
  "version": "0.1.0",
  "api_version": "0.1.2",
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

#### name
Name of the plugin. It **must** be unique to avoid conflicts with other plugins.

#### type
Plugin type. See dedicated section [ImJoy Plugins](development?id=imjoy-plugins] above for more details.

#### version
Specifies the version of the plugin.

#### api_version
Specifies the api version of ImJoy the plugin is written for.

#### url
Points to current file, and is used to download the plugin  when a user installs it from the plugin repository.

#### description
Contains a short description about the plugin.

#### tags
List of supported tags, which can be used to provide differentiate configureable
modes and can be accessed at various points in the plugin. If a plugin was defined with
tags, they will appear  on top of the code editor and during the installation process.
If you distribute your plugin with an [url](development?id=generating-a-plugin-url), you can specify
with which tag the plugin will be installed.

Within the **``<config>``** block, the following fields can be made configurable:
- `env`
- `requirements`
- `dependencies`
- `icon`
- `ui`
- `type`

**Example 1**. a python plugin should install different requirements depending if it will
be executed on GPU or CPU. You can then defined two tags: `"tags" : ["GPU", "CPU"]`.
You can set different `requirements` accordingly: `"requirements": {"gpu": ["tensorflow-gpu", "keras"], "cpu": ["tensorflow", "keras"]}`.
The user will be asked to choose one of the tags during the installation, which will then install
the specified requirements.

Besides the **``<config>``**, you can also configure the **`<script>`** block, and you can
select which script block will be executed. For this, you have to add the `tag` property
to the `<script>` block. Notice also that you will still need the `lang` property.

**Example 2**. You can switch between a stable and development version of a plugin.
If you have `"tags": ["stable", "dev"]`, then you can have two script blocks: `<script lang="python" tag="stable">` and `<script lang="python" tag="dev">`.
When developing and testing a plugin, the ImJoy editor will recognize that the plugin
has multiple tags and you can select a tag in the tile bar of the plugin. When loading
the plugin, it will be loaded with this tag.


#### ui
String specifying the plugin GUI that will be displayed just below the plugin.
The following elements can be used to render an input form:

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

For better rendering of the interface, we support **certain html tags** in the ui string. currently allowed
tags are: `a`, `img`, `p`, `div`, `span`, `br`, `b`, `i`, `u`,`hr`.
Further, the following **css specification** are allowed: `border`, `margin`, `padding`.
These restriction are imposed to prevent XSS attacks.


To define **longer forms with multiple lines**, we support additional definitions of the `ui` string.

* an array of strings. For example:
```javascript
"ui": [
   "option1: {id: 'option1', type: 'choose', options: ['cat', 'dog'], placeholder: 'cat'}",
   "option2: {id: 'option2', type: 'number', placeholder: 3}"
  ],
```
*   an array with keys and values. Here, you have to use `" "` for the keys and
    the strings. Definitions can also be mixed.

In the  example below, we use a string as above for `option1` and an array with keys and values for `option2`. Note how for `option2` each key and value is defined as an individual string.

 ```json
 "ui": [
  {"option1": "{id: 'option1', type: 'choose', options: ['cat', 'dog'], placeholder: 'cat'}"},
  {"option2": {"id": "option2",
               "type": "number",
               "placeholder": 3}}],
  ```

#### flags
Defines an array of flags which will be used by ImJoy to control the behavior of the plugin. Currently, we support these `flags` for run-time control. These flags allow to specify how ImJoy instances are handled by the Interface and the Plugin engine. For more information we refer to the section **TODO**.

* `single-instance` (**for python plugins only**). Python engine will only run a single plugin process even if
  plugin is called from multiple BUT identical workspaces. In this case, the different ImJoy instances will share
  the same plugin process.

* `allow-detach` (**for python plugins only**). Allows the plugin process to detach from the user interface. This means
  the plugin will not be killed when the user interface is disconnected or closed. However, in order to reconnect to this process,
  you  also need to add the `single-instance` flag.

Example: to make a plugin which can run without the user interface in the background and to which you can attach set
 `"flags": ["single-instance", "allow-detach"]`. The interface will automatically reconnect to this process when re-launched.
Please note that if  multiple ImJoy instances attach to this plugin process, each will call the `setup()` function.
This may cause conflicts, we therefore recommend to (1) keep the interface-related code in the `setup()`, e.g. `api.register()`;
(2) move code that you only want to run once per process into the `__init__` function of the plugin class.


#### icon
Defines the icon used in the plugin menu. You can find different icons here https://material.io/tools/icons/ and used the specified name. Or, you can directly copy and paste Emoji, for example from [here](https://getemoji.com/).

#### inputs
Defines the inputs with json-schema syntax (http://json-schema.org/) .
For example, to define that the plugin uses png files, you can specify `"inputs": {"properties": {"type": {"enum": ["image/png"]}}, "type": "object"}` . You can also use the simplified format which assumes the inputs is an object and use json schema to describe the properties: `"inputs": {"type": {"enum": ["image/png"]}}`.

#### outputs
Defines the outputs with json-schema syntax (http://json-schema.org/).
The format is the same as for `inputs`.

#### env
(**for python plugins only**) the virtual environment or docker image command used to create an environment to run the plugin.

#### cmd
(**for python plugins only**) the command used to run the plugin. By default, it will be run with `python`. Depending on the installation it could also be something like `python3` or `python27` etc.


#### requirements

* For `web-worker` plugins written in JavaScript, it can be a array of JavaScript urls. They will be imported using `importScripts`. ImJoy provides a dedicated [GitHub repository](https://github.com/oeway/static.imjoy.io) hosting commonly used and tested libraries. You can refer to all files contained in the `docs` folder, for this
you can construct an url with `https://static.imjoy.io` + `RelativePathInDocs`. For instance, the file `FileSaver.js` in the folder `static.imjoy.io/docs/js/` can be referenced as `https://static.imjoy.io/js/FileSaver.js`.
* For `window` plugin, it can be either a list of JavaScript url or CSS url (needs to be end with `.css`). Same considerations as for `web-worker` apply for import and static hosting.
* For `native-python` plugins, it defines the pip packages which will be installed before running the plugin defined as a list of pip packages or a command string. ImJoy supports package names and GitHub links. For example, `["numpy", "scipy==1.0"]` or `"pip install numpy scipy==1.0"`. To use conda, you can set the string to `"conda install numpy scipy==1.0"`. For more information see the dedicate section **Using virtual environments**.
* For `web-python` plugins, you can set it as a list of python modules e.g. `["numpy", "matplotlib"]`. Please also notice that `web-python` has a limited number of python modules supported.

#### dependencies
Array with names of other ImJoy plugins which the current plugin depends on. They will be installed automatically during installation. To define a dependency use the following format: 1) for dependencies without tag `REPOSITORY:PLUGIN_NAME` or `PLUGIN_URL`, e.g.: `oeway/ImJoy-Plugins:Image Window`; 2) or with specified tag: `REPOSITORY:PLUGIN_NAME@TAG` or `PLUGIN_URL@TAG`, e.g.: `oeway/ImJoy-Plugins:Unet Segmentation@GPU`. In this case, a hash tag `GPU` is used to specify the tag for the plugin named `Unet Segmentation` hosted on GitHub repository `oeway/ImJoy-Plugin` (https://github.com/oeway/ImJoy-Plugins). If the plugin is not hosted on GitHub or the GitHub repository is not formatted as a ImJoy plugin repository (meaning there is no `manifest.imjoy.json` file defined in the root of the repository), you can use the url directly, e.g.: `https://github.com/oeway/ImJoy-Demo-Plugins/blob/master/repository/3dDemos.imjoy.html` (tags can be added with `@TAG`).

#### defaults
(**for window plugin only**) define an object of default values, for example you can specify the default window size by setting `"defaults": {"w": 10, "h": 7}`.

#### runnable
Defines whether the plugin can be executed by clicking on the plugin menu (By default, all plugins are `runnable`). For helper plugins which do not run by themselves, (e.g. a `native-python` plugin can be called by a `window` plugin and do not necessarily executed by the user directly), setting `"runnable": false` would move down the plugin to the bottom of the plugin menu and made non-clickable.

### `<docs>` block
Used to contain documentation for the plugin, it need to be written in `Markdown` language. Here is a document about how to write document in `Markdown`: [Mastering Markdown](https://guides.github.com/features/mastering-markdown/). Please note that if you provide links that these will be opened in another tab, leaving the ImJoy instance running.

### `<window>` block
Define the HTML code for displaying in the plugin window.

ImJoy uses vue. to to parse plugin files, which enforces
only root element in the template. This means in the window block you have to use
a division to wrap all nodes:

```html
<window>
  <div>
    <p> line 1</p>
    <p> line 2</p>
  </div>
</window>
```

The following won't work:
```html
<window>
  <p> line 1</p>
  <p> line 2</p>
</window>
```


### `<style>` block
Define the CSS code for displaying in the plugin window.

### `<script>` block

Plugins can be written in JavaScript or Python, a minimal plugin needs to implement two functions: `setup()` and `run()`. Exceptions are helper plugins (specified with `"runnable": false`), which don't need the `run()` function. Optionally, the function `exit` will be called when the plugin is killed.

  * **`setup()` function**: executed when a plugin is loaded and initializes
      it.
  * **`run()` function**: will be called each time a plugin is executed. When executed, an object (for Javascript) or a dictionary (for Python) called `my` will be passed into the function. The returned result will be displayed as a new window or passed to the next `op` in a workflow. More in the section **Plugin during runtime ** below.
  * optional: **`update()` function**: will be called when any setting of the op is changed.

The `lang` property of the `<script>` block is used to specify the used programming language:
 * for Javascript, use `<script lang="javascript"> ... </script>`
 * for Python, use `<script lang="python"> ... </script>`

`<script>` also supports `tags`. For more information, see the dedicated section **Plugins and tags**.



## Plugin properties

### Plugin operators (ops)
For a plugin, you can define independent operators (or **ops**) with the Plugin API (see **api.register** for details). Each of these **ops** is defined in a similar fashion as
the `<config>` block and has it's own set of parameters defined via a GUI and can have its dedicated run function. The different ops are displayed when you press on the barrow down button in the Plugin list. Each op can also be added to the workflow separately.

### Transfer of functions and data
The plugin system of ImJoy is built on remote procedure calls, and an encoding and decoding scheme is used by ImJoy to transfer data and functions between plugins. We expose a set of API functions from both the main app and the plugins.

#### Interacting with ImJoy app and other plugins
The plugin can call ImJoy API functions to interact with the main ImJoy user interface
and other plugins via a predefined object called `api`. For the list of the API functions their usage, we refer to the [ImJoy API functions](/api).

#### Exposing Plugin functions
By using the ImJoy API function `api.export` at the end of the plugin code, a set of plugin functions can be exported as `Plugin APIs`. `setup` and `run` as described before are two mandatory `Plugin API` functions which need to be defined and exported. In addition to that, other functions can be also exported as `Plugin APIs`. These can then be called with `api.call` or `api.run` by other plugins.

#### Callback functions
Besides the `Plugin API` functions, when a plugin is executed, you can return an object which includes functions which will be called by other plugins or ImJoy.

However, if the function has never been exported as a `Plugin API` before, it will be treated as a `callback` function and can be only called once. Otherwise, if the function has been exported as `Plugin API`, it won't be treated as `callback` function and can be called repeatedly.

### Data exchange
When a window in the ImJoy workspace is selected, the contained data (e.g. an image) will be transferred to the Python plugin. The plugin can then process the data with the `run` function, results will be send back to the ImJoy workspace and displayed as a new window. Natively, ImJoy supports the conversion and transmission of Numpy arrays and Tensorflow tensors, so plugin developers could just use those data types and exchange them between plugins, no matter if they are in Python or JavaScript.

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
may block normal communication between the engine and the ImJoy app. We recommend to store the data on the disk (in the workspace directory for example), then use `api.getFileUrl` to generate an url to access the file. The generated url can then be send to the web App and accessed with a download link or using JavaScript libraries such as `axios`. Many libraries such as Three.js, Vega etc. can load files through url directly.

### Plugin during runtime
When executing a plugin, it can access different fields from `my`:

 * `my.config`
    The config values from the GUI defined with the `ui` string (from the plugin `<config>` block
    or from a separate operation `api.register`, more below). For example, if you defined an ui string (e.g. `"ui": "option {id: 'opt1', type: 'number'}"`) in the plugin `<config>`, you can access it through `my.config.opt1`.

 * `my.data`
     It stores the data from current active window and state for running the plugin.

 * `my._variables`
     When the plugin is executed in a workflow, variables will be set in the workflow will be passed as `my._variables`. It will be set to the actual variable value if the user used ops such as `Set [number]`.

You can directly return your result and they will show as a generic result window.

If you want to define the window type of your result, you can return an object with at least two fields `type` and `data`.
ImJoy will use `type` to find the window for rendering the result stored in `data`.

In the example below, the image from an url will be displayed in a image window or passed to the next op in a workflow.

```javascript
   return { "type": "imjoy/image", "data": {"src": "https://imjoy.io/static/img/imjoy-icon.png"} }
```


ImJoy use postMessage to exchange data between plugins. This means that for JavaScript
plugins, objects are cloned during the transfer. If large objects are exchanged,
if the created objects are not directly transferred. To enable that, you can
add `_transfer=true` to your object when you return it. In the above
example, you can set `my._transfer = true` when you return `my`. However, it will
only speed up the transferring of `ArrayBuffers` or `ArrayBufferViews` (and also
ndarrays produced by Python), and after transferring, you won't be able to access it.

(**Note**: in Python, the data type of `my` is a dictionary, ImJoy added the interface for allowing dot notation, just like in JavaScript. If you prefer, you can also use `[]` in both languages to access dictionary or object.)

## Advanced options

### Workflow management
We provide additional fields in `my` that allow to track, maintain and reconstruct an entire analysis workflow.

* `my._op`
    Give the name of the op which is being executing. When a plugin registered for multiple ops and no callback function was specified for the op, the `run` function will be called, and you can use `my._op` to determine which op is being executing.
* `my._source_op`
    Give the name of the op which initiated current execution.
* `my._workflow_id`
    When the plugin is executed in a workflow, its id will be passed here. When the plugin is executed from the plugin menu, ImJoy will try to reuse the workflow id in the current active window, if no window is active, a new workflow id will be assigned. All the data window with the same `_workflow_id` is virtually connected in a pipeline or computational graph. By combining `_workflow_id` with `_op` and `_source_op`,

 Importantly, `_workflow_id`, `_variables`, `_op` and `_source_op` can be used to implement interactivity between plugins, meaning if the user changed a state in one of the result window, the downstream workflow will be updated automatically.

### Controlling run-time behavior of Native Python plugins
You can control the run-time behavior of a Python plugin process with the `flags` field in the `<config>` block. Next we provide next nomenclature and additional explanations to explain the different options you have to control how the Python processes running on the plugin engine interact with the ImJoy interface.

* **Interface**: web interface of ImJoy. You can have ImJoy running on multiple browser windows, i.e. multiple interfaces.
* **Plugin Engine**: running in the background to execute Python code from different Python plugins.
* **Python plugin**: plugin containing Python code. Some plugins might have **`tags`** to further specify details of how they are executed.
* **Python process**: specific Python plugin running on the Plugin engine. Processes can be seen on the Task Manager.
* **Workspace**: collection of installed ImJoy plugins. For plugins with `tags`, the user choses the appropriate tag. Each Python plugin within a workspace has its own process. Each workspace has a unique name.
* **ImJoy instance** is a workspace running in one ImJoy interface.

![imjoy-python-process](assets/imjoy-python-process.png ':size=800')

Below we describe the three main run-time behavior of python plugins:
* By **default** (none of the flags is set), each ImJoy instance has its own process on the plugin engine. If you close the interface, you will kill the process.
* The **`single-instance`** flag will allow only one process to run for a given workspace. A workspace is defined by its name, all installed plugins, and the selected `tags`. If two ImJoy instances run the exact same workspace, then the `single-instance` means that they access the same process. Only closing last instance will  kill the process.
* The **`allow-detach`** flag means that the process is not killed when its ImJoy instance is closed. For instance, this allows to perform long computational tasks in the background which don't require additional user feedback and which terminate autonomously. Can also be used to protect a long computational tasks again browser instabilities. If you want to be able to attach to a detached process, the plugin has additionally have the `single-instance` flag.

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

### Virtual environments
Python plugins for ImJoy can have different conda environments, which provides a way to isolate plugins. You can therefore run python plugins with different versions of Python, or use different pip packages. However, we recommend to limit the number of virtual environments, since each
takes up considerable disk space.

By default, python plugins from ImJoy will be executed in the default conda environment (e.g. Python 3.6). If you want to run a plugin in a different conda environment, you can specify it by setting the `env` field in the `<config>` section of the plugin.

`env` can be a string or an array. When connecting multiple command in a line please use `&&` or `||` which supported on different operating systems. If you have several command which are independent from each other, please use array to store the commands. For example: `"env": ["git clone https://github.com/oeway/XXXXXX.git", "conda create -n XXXXX python=3.7"]`, this setting will first clone the source code on GitHub, then create an environment with conda. Notice that the git clone command will fail if the folder already exist, in that case, the second command will also been executed.

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


## Hosting and deploying plugins
Here, we provide detailed information for how to host or deploy ImJoy plugins.

Hosting and deployment options range from storing single file to setting up
your own ImJoy plugin repository. The plugins can then be distributed directly as files or
with a dedicated url syntax, which allows an automatic installation.

The **default and recommended** way for ImJoy plugin is to deploy on GitHub (either
as an individual file or in a plugin repository) and then distribute them with the plugin url.
We recommend GitHub since it provides stability and version control, which guarantees
reproducibility and traceability.

### Hosting individual plugin files
This is the typical case  during development. The plugin code can be hosted
on the web, e.g. GitHub, Gist, or Dropbox.

### Deployment through your own ImJoy Plugin Repository
You can easily create a ImJoy plugin repository for an existing GitHub project.
A template project can be found [here](https://github.com/oeway/ImJoy-project-template).
For this, you save your ImJoy plugins in a dedicated folder, and you add a
manifest json file `manifest.imjoy.json` to the GitHub root folder.

This manifest specifies which plugins are in your repository,
and where they can be found. A skeleton of this file is shown below,
and a full template can be found [here](https://github.com/oeway/ImJoy-project-template/blob/master/manifest.imjoy.json).
```json
{
 "name": "NAME OF THE REPOSITORY",
 "description": "DESCRIBE THE REPOSITORY",
 "version": "0.1.0",
 "uri_root": "",
 "plugins": [
   //copy and paste the <config> block of your plugin here
 ]
}
```

You can then update this manifest either **automatically or manually**:

1.  For an **automatic update**, we provide a [node script](https://github.com/oeway/ImJoy-project-template/blob/master/update_manifest.js).
    This script requires node.js to be executed. Then run it  with the command `node update_manifest.js` in the root folder
    containing `manifest.imjoy.json`. It will then automatically search for ImJoy plugins and
    generate the manifest.

2.  For a **manual update**, follow these steps:
    1. Place all plugin files in a folder in your GitHub repository.
       For example, a folder called [imjoy-plugins](https://github.com/oeway/ImJoy-project-template/tree/master/imjoy-plugins).
    1. Modify the `manifest.imjoy.json`. For each plugin
        1. Copy & paste the content of the `<config>` block from the plugin code
           to the `plugins` block in `manifest.imjoy.json`.
        1. Add a field called `"uri"`, and set the value to the actual file name
           of your plugin file, including the relative path within the GitHub repository.
           For example for a plugin file is named `untitledPlugin.imjoy.html` you have
           to specify `"uri": "imjoy-plugins/untitledPlugin.imjoy.html"`
           if your . You can skip this step if you name your plugin file exactly as the file name of the plugin.

In ImJoy, you can then **render a list of all plugins** in the repository with a
simple url with the form `http://imjoy.io/#/app?repo=GITHUB_USER_NAME/REPO_NAME`,
where `GITHUB_USER_NAME` is the user name, and `REPO_NAME` the name of the GitHub
repository containing the ImJoy plugin store. The user can then install the
plugins from this list. For more details on how to generate this url and see how
specific plugins can be installed see the dedicated section below.


### Deployment through the official ImJoy plugin repository
The ImJoy plugin repository shown on `ImJoy.io` is served through
[GitHub](https://github.com/oeway/ImJoy-Plugins).

In order to deploy your plugin to the [plugin repository](https://github.com/oeway/ImJoy-Plugins),
you can fork the repository, add your plugin and send a pull request.
Once the pull request is accepted, the user will be able to install your plugin from the plugin repository.


## Distributing plugins
To distribute your plugins, two main options exist.

1. You can create a **complete url**. When clicked, ImJoy will automatically open
and install the plugin. This link that can be shared directly through email or
social networks. We detail below how this link can be created and which options are supported.

1. You can **directly send** the plugin file (extension `*.imjoy.html`). This file can then
be dragged into the ImJoy workspace, where it will be automatically recognized as a plugin.


In the last section, we describe how plugins **depending on custom libraries** can be
distributed.

<!-- THIS MIGHT BE CONFUSING.
In last option, which we typically don't recommend, you can send an url pointing
to the plugin file. This url can then be used to install the plugin in ImJoy:
press the `+ Plugins` button and add the url in the field `Install plugin from url`.
However, this option provides less control about how the plugin should be installed.
-->

### Generating a plugin url
The easiest way to distribute plugins is by creating a url, which can be easily shared.
The basic format is `http://imjoy.io/#/app?plugin=PLUGIN_URI`. You will need to
replace `PLUGIN_URI` with your actuall **plugin URI** (Uniform Resource Identifier).
For example: [http://imjoy.io/#/app?plugin=https://github.com/oeway/ImJoy-Plugins/blob/master/repository/imageWindow.imjoy.html](http://imjoy.io/#/app?plugin=https://github.com/oeway/ImJoy-Plugins/blob/master/repository/imageWindow.imjoy.html). When the user click this link,
a plugin installation dialog will be shown which proposes to install the specified plugin.
The user has to simply confirm by clicking `Install`.

This url supports additional parameters controlling how the plugin is loaded.
These parameters are described in a dedicated section below.

There are **two types of URI**, depending on how your plugin is deployed:

1.  If your plugins are deployed in a **`ImJoy Plugin Repository`** (as described above),
    you can then use a short plugin URI formatted as `GITHUB_USER_NAME/REPO_NAME:PLUGIN_NAME`.

    For example, you can use `oeway/ImJoy-project-template:Untitled Plugin` to represent
    a plugin hosted on https://github.com/oeway/DRFNS-Lite.

    You can also specify the **plugin tag** by adding `@TAG` after the `PLUGIN_NAME`.
    For example: `oeway/DRFNS-Lite:DRFNS-Lite@GPU`.

    In case you want to specify a **git commit hashtag** to freeze the plugin at a
    certain commit, you can add `@COMMIT_HASHTAG` after the `REPO_NAME`.
    For example: `oeway/DRFNS-Lite@4063b24:DRFNS-Lite` where `4063b24` is the short
    form of the commit of [4063b24f01eab459718ba87678dd5c5db1e1eda1](https://github.com/oeway/DRFNS-Lite/tree/4063b24f01eab459718ba87678dd5c5db1e1eda1).

2.  Alternatively, you can use an **url pointing to the plugin** hosted on any
    websites including your own project site, blog, GitHub, Gist or Dropbox.
    Notice that, the plugin file needs to end with `.imjoy.html`.
    In that case, the url of this file is the plugin URI. Please consult the
    dedicated [section](development?id=distribute-plugins-without-dependencies)
    for how to obtain this url for different hosting platforms.

    In case you want to specify the plugin tag, you can just append `@TAG` to the
    file url, right after `.imjoy.html`. For example: `https://raw.githubusercontent.com/oeway/DRFNS-Lite/master/DRFNS-Lite.imjoy.html@GPU`.

To test if your plugin URI works, you can paste it to the `+ PLUGINS` dialog
(`Install from URL`) and press `Enter`. If everything works, you should be able
to see a card rendered with your plugins which you can click `INSTALL`.

### Supported url parameters
You can construct the ImJoy url with customized functionality for facilitated installation.
These url parameters can be used after `https://imjoy.io/#/app?`, using a `PARAM=VALUE` syntax.

These parameters are independent from each other and multiple parameters
can be concatenate with `&`. For example we want to specify `par1=99` and `par2=hello`,
the corresponding url would be `https://imjoy.io/#/app?par1=99&par2=hello`.

The following url parameters are currently supported:

 *  `plugin` or `p`: show the specified plugin in the plugin management dialog as
     detailed in the section above.
 *   `workspace` or `w`: name of workspace. ImJoy will swithc to the specified
     workspace if it exist, or create a new one. For example, `https://imjoy.io/#/app?workspace=test`
 *   `engine` or `e`: define the url of the plugin engine. For example: `http://imjoy.io/#/app?engine=http://127.0.0.1:8080`.
     Note that if you want to connect to a remote machine through a http (not https) connection,
     you can only do it by using `http://imjoy.io` and not `https://imjoy.io`.

     This restriction also exist if you use localhost with some browsers (e.g. Firefox).
     To avoid it, you need to use `http://127.0.0.1:8080` rather than `http://localhost:8080`,
     because most browser will consider `127.0.0.1` is a secured connection, but not `localhost`.
     However, there is an exception, on Safari, using `127.0.0.1` does not work due to
     [this](https://bugs.webkit.org/show_bug.cgi?id=171934), if you still want to use Safari, you have to switch to `http://imjoy.io`.

 *   `token` or `t`: define the connection token. For example: `http://imjoy.io/#/app?token=2760239c-c0a7-4a53-a01e-d6da48b949bc`
 *   `repo` or `r`: specify a ImJoy manifest file pointing to a ImJoy plugin repository (see above).
      This can be a full repo link such as `repo=https://github.com/oeway/ImJoy-Plugins`
      or a simplified GitHub link `repo=oeway/ImJoy-Plugins`.

      If you are hosting your repo from a non-GitHub website (e.g. GitLab), please
      use the `raw` link to the `manifest.imjoy.json` file.

 *   `load` or `l` define a customized url which contains data (e.g. a tif image)
     loaded automatically into the ImJoy workspace. This can be used to link data
     to ImJoy, for example, by defining a `open with imjoy` button.


### Distribute plugins without custom libraries
This is the case for a plugin that does not depend on libraries or modules written
by yourself, and you want to quickly share it with others. Here, you create an
url for this plugin (extension: `*.imjoy.html`). This file can be hosted on GitHub, Gist or Dropbox etc.

1. For files on **GitHub**, you just need to copy the link to the file.
   For example: `https://github.com/oeway/DRFNS-Lite/blob/master/DRFNS-Lite.imjoy.html`.

1.  For **Gist** or other Git providers such as (GitLab), you need to obtain the `raw`
    link of the plugin file. For example, to create a Gist link

    1. Go to Gist on your GitHub account [https://gist.github.com/](https://gist.github.com/)
    0. Create new Gst, specify the plugin name followed by `.imjoy.html`, and copy & paste the code of your plugin.
    0. Create either a public or secret Gist.
    0. Link to Gist can be obtained from the `Raw` button (this links to the unprocessed versions of the file).
       The link will looks like this: `https://gist.githubusercontent.com/oeway/aad257cd9aaab448766c6dc287cb8614/raw/909d0a86e45a9640c0e108adea5ecd7e78b81301/chartJSDemo.imjoy.html`
    0. Please note that this url will change when you update your file.

0. For **Dropbox** you need to modify the sharable url as follows:
     1. Replace `dl=0` to `dl=1`;
     2. Replace `https://www.dropbox.com/` to `https://dl.dropboxusercontent.com/`.
     <!--[ToDo]: example-->


### Distribute plugins with custom libraries
If your plugin depends on non-standard libraries and modules, you have to provide
them with your plugin. You can upload those libraries and modules to a GitHub repository,
GitHub Gist, or other data-sharing platforms such as Dropbox and link them in the plugin code.

 *  For **JavaScript** plugins, you need to create a Gist or GitHub.
    Upload the plugin (ending with `.imjoy.html`) file together with the other JavaScript files.

    In the plugin file, you can then use `importScripts(url_to_your_js_file)`
    to import this libraries. However, due GitHub restrictions, you can't use
    the GitHub url directly, but you convert the url with [jsDelivr](https://www.jsdelivr.com/rawgit).

 *  For **Python** plugins, we recommend to package your library as a pip module.
    Several excellent ressources, such as [this one](https://packaging.python.org/tutorials/packaging-projects/),
    explaining this step exist. Please note that it is not necessary that you up-load your package to the
    Package Index. The crucial part is that you provide the `setup.py`.

    Create a [gist](https://gist.github.com/) or a GitHub repository, and obtain
    the link to this repository. You can use the terminal command `pip install ...`
    to check if you can install your module.

    You can then add the GitHub link to `requirements` in the `<config>` block of your plugin.

    1. If your package is not indexed, then you can specify the requiremen in this formatted
       `pip install -U git+https://github.com/oeway/ImJoy-Engine#egg=imjoy`.
    2. If your package is indexed, you can format the requirement like this:`git+https://github.com/oeway/ImJoy-Engine#egg=imjoy`,

    We recommend specifying the [GitHub release](https://help.github.com/articles/creating-releases/)
    of your library with `#egg=imjoy`. This ensures that the correct
    version is installed.

    As an alternative - especially during development - you can use Dropbox as explained
    in this [Demo](demos?id=distribution-of-codedata-stored-on-dropbox).
