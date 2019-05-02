# Developing Plugins for ImJoy

## Overview

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


### ImJoy architecture
Imjoy consists of **two main components**

 1.  The **ImJoy Web App**. The app can run alone, and plugins can be developed in
     JavaScript or in Python by using [pyodide](https://github.com/iodide-project/pyodide).

 2.  Complex computational tasks can be implemented in plugins, which run in the
     **Plugin Engine**. The latest release of the plugin engine is available
     together with installation  instructions on [GitHub](https://github.com/oeway/ImJoy-App/releases).
     The plugin engine will try to upgrade itself from GitHub when it starts.
     Packages are managed by `conda` and `pip` which provides access to the
     entire Python ecosystem.

![imjoy-plugin-development](assets/imjoy-architecture.png ':size=800')

 The Python Plugin Engine is connected with the ImJoy Web App through websockets
 and communicates with a customised remote procedure calls (RPC) based on [socket.io](https://github.com/miguelgrinberg/python-socketio).

 ### Choose a plugin environment
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

1. **Window (HTML/CSS/JS)**(type=`window`) plugins for building a rich and interactive user interface using HTML5/CSS and JavaScript;

1. **Web Worker (JS)**(type=`web-worker`) plugins for performing computational tasks using JavaScript or WebAssembly;

**Python** plugins support these two types:

1. **Native Python**(type=`native-python`) plugins for performing heavy-duty computational tasks using Python and its libraries, this requires additional installation of plugin engine.
   These plugins are indicated with a rocket 🚀;
1. **Web Python**(type=`web-python`) plugins for performing computational tasks using Python with in the browser through WebAssembly and the [pyodide project](https://github.com/iodide-project/pyodide).
   Such plugins are indicated with a little snake 🐍. This is in developmental stage and only a selected number of Python libraries are currently supported.

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

Different from other plugins which will be loaded and initialised when ImJoy is started,
a `window` plugin will not be loaded until the actual plugin is created with `api.createWindow` or clicked on by a user in the menu. During execution of `api.createWindow`, `setup` and `run` will be called for the first time, and return with an window api object (contains all the api functions of the window, including `setup`, `run` and other functions if defined). You can then use the window api object to access all the functions, for example, update the content of the window by `win_obj.run({'data': ... })`.

### Native Python
Used to run Python code. This requires that the **Python Plugin Engine** is installed and started before using the plugin. See the **Developing Python Plugins** for more details.

Similarly to Web Worker plugins, Native Python plugins do not have access to the html dom, but you can use `ImJoy API` to interact with the graphical interface of ImJoy or other plugin which can trigger changes on the user interface.


### Web Python
<!--**[TODO]**-->

### Debugging

*   **JavaScript plugins**: this concerns either Web Worker (`web-worker`) or Window (`window`) plugins. With the ImJoy code editor, you can write your code. For testing you can click save on the toolbar in the code editor, and it will automatically load your plugin to the plugin menu shown on the left side. By right click on in the workspace, you use the [chrome development tool](https://developers.google.com/web/tools/chrome-devtools) to see the console and debug your code.

* **Python plugins**: Similarly, you can create Python plugins from the `native-python` template in the **+ PLUGINS** dialog. If your plugin engine is running, you can save and run(Ctrl+S, or through the toolbar) with your code directly in the ImJoy code editor. For larger project with many Python files, the recommended way is to wrap your Python files as standard Python modules, write and test the Python module using your code editor/IDE of choice (Atom, Spyder, PyCharm,...). Then create an ImJoy plugin with the ImJoy code editor, by inserting the module path to `sys.path` (e.g. `sys.insert(0, '~/my_python_module')`), you can then import the module to the ImJoy plugin and test it.

## Plugin file format
The ImJoy plugin file format (shared by all Plugin types)  is built up on html format with customised blocks (inspired by the `.vue` format). It consists of two mandatory blocks `<config>` and `<script>`, and other optional blocks including `<docs>`, `<window>`,`<attachment>`,`<link>` and `<style>`.  For `<style>`, you can also set the `src` attribute.

Here is an a typical outline of such a plugin file. Note that the
order of these blocks does not matter, so you can shuffle the blocks.

```
<config lang="json">
   ** A code block in Json format describes the plugin**
</config>

<script lang="javascript">
   ** A code block in JavaScript or Python format**
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
   ** A recommended code block in Markdown format with the documentation of the plugin **
</docs>

<attachment name="XXXXX">
   ** An optional block for storing text data, you can use multiple of them **
</attachment>
```


### `<config>` block
Defines the general properties of a plugin with several fields.

```json
{
  "name": "Untitled Plugin",
  "type": "web-worker",
  "tags": [],
  "ui": "image processing",
  "cover": "",
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
Plugin type.

Allowed are : `web-worker`, `window`, `native-python` and `web-python`.
See dedicated section [ImJoy Plugins](development?id=imjoy-plugins) for more details.

#### version
Specifies the version of the plugin.

#### api_version
Specifies the api version of ImJoy the plugin is written for.

#### url
Points to current file. It is used to download the plugin when a user installs it from the plugin repository.

#### description
Contains a short description of the plugin.

#### cover
An url to a cover image of the plugin, it will shown up in the image installation dialog, and also on top of the plugin documentation.

Example: `"cover":"https://imjoy.io/static/img/imjoy-card-plain.png"`.

The cover image is recommended to have a aspect ratio of 16:9.
It can be hosted inside the github repo, in that case, a `raw` url to the image should be used.

Multiple images can be used, by set `cover` to an array: `"cover": ["url_to_image1", "url_to_image2", "url_to_image3"]`.

#### tags
List of supported tags.

Such tags provide configureable modes for plugin execution,
e.g. if a plugin is run on a CPU or GPU. Tags can be accessed at various points in the plugin.
If a plugin was defined with tags, they will appear  on top of the code editor and during the installation process.
If you distribute your plugin with an [url](development?id=generating-a-plugin-url), you can specify
with which tag the plugin will be installed.

Within the **``<config>``** block, the following fields can be made configurable:
- `env`
- `requirements`
- `dependencies`
- `icon`
- `ui`
- `type`

**Example 1**: a python plugin should install different requirements depending if it will
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

**Input form**: the following elements can be used to render an input form:

* `type: 'choose', options: ['cat', 'dog'], placeholder: 'cat'`
* `type: 'number', min: 0, max: 10, placeholder:2`
* `type: 'color'`
* `type: 'string'`
* `type: 'save'`
* `type: 'instructions/comment'`
* `type: 'variableName'`
* ...

For each element, you need to define a unique `id`, which can then be used to **access
the value of this element in the plugin** with `ctx.config.id`.

For example, to render a form with a selection use `"ui": "select an option: {id: 'option1', type: 'choose', options: ['cat', 'dog'],     placeholder: 'cat'}"`. In the plugin, the selection can then be accessed with `ctx.config.option1`.

In some cases, the ui might only contain a brief description of the op.
This can either be plain text, or you can also specify a **link**    with `"ui": " <a href='https://imjoy.io' target='_blank'> ImJoy</a>"`. The `target='_blank'` will open this page in a new tab.


**HTML and CSS**: for better rendering of the interface, we support **certain html tags** in the ui string.
Currently allowed tags are: `a`, `img`, `p`, `div`, `span`, `br`, `b`, `i`, `u`,`hr`.
Further, the following **css specification** are allowed: `border`, `margin`, `padding`.
These restriction are imposed to prevent XSS attacks.

**Longer forms**: to define forms with multiple lines, we support additional definitions of the `ui` string.

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
Defines an array of flags which will be used by ImJoy to control the behaviour of the plugin.

One important flag is **`functional`**:

*  The **`functional`** flag indicates that all api functions exposed by the plugin
   are [pure functions](https://www.sitepoint.com/functional-programming-pure-functions/).
   This means that their output will only depend on the current inputs passed to the
   function, nothing else. Pure functions thus guarantee no side effect to the plugin
   after calling any of the plugin api functions. This means that you should avoid
   modifying global variables in the plugin functions with one exception which is the `setup()` function.
   Making a plugin `functional` makes debugging easier, and importantly other plugins or workflows calling
   only `functional` plugins will be strictly reproducible.
   Functional plugins are crucial for ImJoy to perform parallelisation and batch processing in the near future.

   We don't have a real test to verify whether a plugin is functional yet, so please
   add the `functional` flag only when you are sure your plugin contains only pure functions.


Further, we support `flags` for run-time control.

These flags allow to specify how ImJoy instances are handled by the Interface and the Plugin engine.
For more information we refer to the dedicated section on [plugin run time behaviour](development?id=controlling-run-time-behaviour-of-native-python-plugins).

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
Defines the icon used in the plugin menu.

You can find different icons here https://material.io/tools/icons/ and used the specified name. Or, you can directly copy and paste Emoji, for example from [here](https://getemoji.com/).

#### inputs
Defines the inputs with json-schema syntax (http://json-schema.org/).

For example, to define that the plugin uses png files, you can specify `"inputs": {"properties": {"type": {"enum": ["image/png"]}}, "type": "object"}` . You can also use the simplified format which assumes the inputs is an object and use json schema to describe the properties: `"inputs": {"type": {"enum": ["image/png"]}}`.

#### outputs
Defines the outputs with json-schema syntax (http://json-schema.org/).
The format is the same as for `inputs`.

#### cmd
(**for python plugins only**) the command used to run the plugin. By default, it will be run with `python`. Depending on the installation it could also be something like `python3` or `python27` etc.

#### env
(**for python plugins only**) the virtual environment or docker image command
used to create an environment to run the plugin.

For more details see the dedicated [section](development?id=virtual-environments)

#### requirements
Defines the plugin requirements.

ImJoy provides a large number of options to specify these requirements for public
or private repositories, including `importScripts` for JavaScript, `pip` for Python,
conda environment specified by `environment.yml`, and others.

We refer to the dedicate [section](development?id=specifying-requirements)
for a detailed description.


#### dependencies
Array with names of other ImJoy plugins which the current plugin depends on.

They will be installed automatically during installation. To define a dependency use the following format: 1) for dependencies without tag `REPOSITORY:PLUGIN_NAME` or `PLUGIN_URL`, e.g.: `oeway/ImJoy-Plugins:Image Window`; 2) or with specified tag: `REPOSITORY:PLUGIN_NAME@TAG` or `PLUGIN_URL@TAG`, e.g.: `oeway/ImJoy-Plugins:Unet Segmentation@GPU`. In this case, a hash tag `GPU` is used to specify the tag for the plugin named `Unet Segmentation` hosted on GitHub repository `oeway/ImJoy-Plugin` (https://github.com/oeway/ImJoy-Plugins). If the plugin is not hosted on GitHub or the GitHub repository is not formatted as a ImJoy plugin repository (meaning there is no `manifest.imjoy.json` file defined in the root of the repository), you can use the url directly, e.g.: `https://github.com/oeway/ImJoy-Demo-Plugins/blob/master/repository/3dDemos.imjoy.html` (tags can be added with `@TAG`).

#### defaults
(**for window plugin only:**) defines an object of default values. 

For example, you can specify the default window size by setting `"defaults": {"w": 10, "h": 7}`.

Or, you can make the window in full screen mode by default with `"defaults": {"fullscreen": true}`.

To make the window in standalone mode by default (in full screen and detached from the workspace), you can set `"defaults": {"standalone": true}`.

#### runnable
Defines whether the plugin can be executed by clicking on the plugin menu (By default, all plugins are `runnable`). For helper plugins which do not run by themselves, (e.g. a `native-python` plugin can be called by a `window` plugin and do not necessarily executed by the user directly), setting `"runnable": false` would move down the plugin to the bottom of the plugin menu and made non-clickable.

### `<docs>` block
Contains the documentation of the plugin and is written in Markdown language.
Please consulte this document for an introduction to [Markdown](https://guides.github.com/features/mastering-markdown/).
Please note that if you provide links that these will be opened in another tab, leaving the ImJoy instance running.

### `<window>` block
Defines the HTML code for the display in the plugin window.

ImJoy uses vue.js to to parse plugin files, which enforces that only
root element exists in the template. This means in the window block you have to use
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
Defines the CSS code for displaying in the plugin window.

### `<script>` block
Contains the actual plugin code.

Plugins can be written in JavaScript or Python, a minimal plugin needs to implement two functions: `setup()` and `run()`. Exceptions are helper plugins (specified with `"runnable": false`), which don't need the `run()` function. Optionally, the function `exit` will be called when the plugin is killed.

  * **`setup()` function**: executed when a plugin is loaded and initialises
      it.
  * **`run()` function**: will be called each time a plugin is executed. When executed, an object (for Javascript) or a dictionary (for Python) with context (named `ctx`) will be passed into the function. The returned result will be displayed as a new window or passed to the next `op` in a workflow. More in the section [Plugin during runtime](development?id=plugin-during-runtime) below.
  * optional: **`update()` function**: will be called when any setting of the op is changed.

The `lang` property of the `<script>` block is used to specify the used programming language:
 * for Javascript, use `<script lang="javascript"> ... </script>`
 * for Python, use `<script lang="python"> ... </script>`

`<script>` also supports `tags`. For more information, see the dedicated section for [`tags`](development?id=tags).

## Specifying requirements

The plugin requirements are specified in the dedicated field
[`requirements`](http://localhost:8000/docs#/development?id=requirements)
in its `config` block.

Depending on the plugin type, requirements can be specified differently.

### Web Worker and Window plugins
Requirments are specified as an array of JavaScript urls. These libraries will then be
imported using `importScripts`.

For example, to specify the latest [plotly.js](https://plot.ly/javascript/) library you can
use
```json
"requirements": ["https://cdn.plot.ly/plotly-latest.min.js"]
```

For window plugins, you can also specify **CSS urls**, these need to end with `.css`, otherwise, you need to add a prefix `css:` to the url.

For example, to use the [W3.CSS framework](https://www.w3schools.com/w3css/), you can specify
```json
"requirements": ["https://www.w3schools.com/w3css/4/w3.css"]
```

If the url does not end with `.css`, you need to add `css:` before it, for example:
```json
"requirements": ["css:https://fonts.googleapis.com/icon?family=Material+Icons"]
```

ImJoy hosts **commonly used and tested libraries** in a dedicated [GitHub repository](https://github.com/oeway/static.imjoy.io).
You can refer to all files contained in the `docs` folder with a simple url: `https://static.imjoy.io` + `RelativePathInDocs`.

For example, the file `FileSaver.js` in the folder `static.imjoy.io/docs/js/`
can be referenced as
```json
"requirements": ["https://static.imjoy.io/js/FileSaver.js"]
```

If the url does not end with `.js`, you need to add `js:` before it, for example:
```json
"requirements": ["js:https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@0.11.2"]
```

### Native Python plugins

Requirements are defined as a list of strings.
A prefix is used to specify the supported requirement types: `conda:`, `pip:` and `repo:`.

The general syntax is `"requirements": ["prefix:requirementToInstall"]`. The table below
lists all supported requirements, the actual command being executed by ImJoy and
an example.

Prefix  | Command                                                 | Example
--------|---------------------------------------------------------|-----------------------------------------------
`conda` | `conda install -y`                                      | `"conda:scipy==1.0"`
`pip`   | `pip install`                                           | `"pip:scipy==1.0"`
`repo`  | `git clone` (new repo)  <br> `git pull` (existing repo) | `"repo:https://github.com/userName/myRepo"`
`cmd`   | Any other command                                       | `"cmd:pip install -r myRepo/requirements.txt"`


Some **important considerations**:

*  If **no prefix is used**, requirements will be treated as `pip` libraries.
   ```json
   "requirements": ["numpy", "scipy==1.0"]
   ```

*  If a **virtual environment** is defined by setting `env`, all `pip` and `conda`
   packages will be installed to this environment. For more information see the
   dedicated section on [virtual environments](development?id=virtual-environments).

*  You can list multiple requirements either directly as one string after a prefix:
   ```json
   "requirements": ["conda:numpy scipy==1.0"]
   ```
   or as separate strings in one list:

   ```json
   "requirements": ["conda:numpy", "conda:scipy==1.0"]
   ```
*  Different requirement types can be combined into one list.

   ```json
    "requirements": ["conda:numpy", "pip:scipy==1.0", "repo:https://github.com/userName/myRepo"]
    ```

#### Install package from GitHub
`pip` is Git-aware and can install packages. This means that you can installation
directly from a Git url. Several excellent resources exist to explain this step,
such as [this one](https://packaging.python.org/tutorials/packaging-projects/).
Please note that it is not necessary that you up-load
your package to the Package Index. The crucial part is that you provide the `setup.py`.

The general syntax is shown below with parameters indicated in `{}`:
 ```json
 "requirements": ["pip:git+https://github.com/{username}/{reponame}@{tagname}#egg={reponame}"]
 ```

 The syntax `"pip:git+https..."` is translated by ImJoy into the command `pip install git+https...`.
 This command allows a [pip install from GIT](https://pip.pypa.io/en/stable/reference/pip_install/#vcs-support).

 The following parameters have to be specified:

 *   `username`: name of the GitHub account.
 *   `reponame`: name of the GitHub repository.
 *   `tagname`:  allows passing of tag. This can be a commit hash tag, a
     [Git tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging), or a
     [GitHub release](https://help.github.com/articles/creating-releases/), or
     a commit hash tag. This provides precise control
     which version of the repository is installed and used.
 *   `eggname`: this is usually the name of your repository. This is recommended
     for an install of a Git repository, and tells pip what to call the repository for dependency checks.

Please note that once a package is installed, it will not be **upgraded** unless you
specify a new tag.

For a complete description please consult the [pip documentation](https://pip.pypa.io/en/latest/reference/pip_install/#git).

In order to test your module, you can use the `pip` terminal command with the
parameters specified above
```bash
pip install git+https://github.com/{username}/{reponame}@{tagname}#egg={reponame}
```

For an example, we refer [here](http://localhost:8000/docs#/development?id=repo-with-setuppy).

### Web Python
Requirements are specified as a list of strings specifying the required python modules. For instance,

```json
"requirements": ["numpy", "matplotlib"]
```

Please note that `web-python` plugins are based on [pyodide](https://github.com/iodide-project/pyodide/)
and only a limited number of python modules is currently supported.


### Typical scenarios
Here we describe typically encountered scenarios to add requirements for public
or your own libraries.

#### pip repositories
Your python module is deployed to as a pip repository (`pip.pypa.io`). You can
then add its pip name to `requirements` including the version number.

For example, to add `scipy` with version 1.0, you can specify

```json
"requirements": ["pip:scipy==1.0"]
```

#### repo with `setup.py`
The `pip` command can install a package and its dependencies from a GitHub repository,
when the `setup.py` is present.

Example: the GitHub repository `myRepo` is hosted on the account `mUsername` and
the latest Git tag is `v0.1.1`. You can then add this repository
```json
"requirements": "pip:git+https://github.com/myUserName/myRepo@v0.1.1#egg=myRepo"
```

We would like to highlight three important aspects:

1.  The syntax `"pip:git+https..."` is translated by ImJoy into the command
    `pip install git+https...` and allows a [pip install from GIT](https://pip.pypa.io/en/stable/reference/pip_install/#vcs-support).

0.  The string `@v0.1.1` is used to specify the [Git tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging),
    [GitHub release](https://help.github.com/articles/creating-releases/),
    This provides precise control which version of the repository is installed and used.

For more informations, consult the dedicate section [here](development?id=install-package-from-github).

#### repo with `requirements.txt`
The file `requirements.txt` contains a list of all packages and their version that
are required by the package. For more details see [here](https://pip.pypa.io/en/stable/user_guide/#requirements-files).

Usually, you will add this repository to your workspace. You can then install
the requirements, and also directly import the project directly from a folder.

Example, the GitHub repository `myRepo` is hosted on the account `mUsername`.
To add this repository to the plugin workspace, and install the requirements:
 ```json
 "requirements": ["repo:https://github.com/myUserName/myRepo", "cmd: pip install -r myRepo/requirements.txt"]
 ```

In your Python plugin, you can then add the local copy to the Python system path, and
import libraries from it
```python
sys.path.insert(0, './myRepo')
from  ... import ...
```

#### repo with `environment.yml`
The yaml file `environment.yml` defines a virtual environment with conda and pip
dependencies. A detailed description file format can be found [here](https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#create-env-file-manually).

Example, the GitHub repository `myRepo` is hosted on the account `mUsername`.
You can add the repo with
```json
"requirements": ["repo:https://github.com/myUserName/myRepo"]
```

and install the environment with
```json
"env": []"conda env create -f myRepo/environment.yml"]
```

#### repo hosted on Dropbox
You could also host your code (and also data) on dropbox and install it from there with
a https request. See our dedicated [demo](demos?id=distribution-of-codedata-stored-on-dropbox)
for more details.


## Plugin properties

### Loading/saving data
The **ImJoy app** is build on web technology and is running in the browser. This influences
how data can be loaded and saved. For security restrictions, ImJoy or plugins types running
in browser cannot directly access your local file system. The user will need to open or drag
files into ImJoy, and the result files can only be saved by triggering downloads.
On the other hand, the **Plugin Engine** has full access to the local file system,
native python plugins can read and write directly from the local file system.

![imjoy-data-accessibility](assets/imjoy-data-accessibility.png ':size=800')

Therefore, we provide several different ways to handle loading/saving files for plugins
with or without the plugin engine.

 *  If the **Plugin Engine** is running, there are three api functions for **all** types of
    plugins to access the local file system: `api.showFileDialog`, `api.getFileUrl`, `api.getFilePath`.
    Specifically for **Python plugins** running on the plugin engine, files can be directly
    loaded and written to the file system with standard python file operations.

 *   If the **Plugin Engine** is not running, the only way for **JavaScript** or **Web Python plugins** to access
     files is ask the user to drag a file or a folder directly into the ImJoy workspace. This will render a window
     with content of the file or folder. These data can then be accessed by the plugins and be processed.
     For exporting result as files, the `api.exportFile` function can be used to trigger a download.


### Plugin operators (ops)
You can define for a plugin independent operators (or **ops**) with the Plugin
API (see **api.register** for details). Each of these **ops** is defined in a similar fashion as
the `<config>` block: you can define an interface to set parameters, and it can have a dedicated run function.
The different ops are displayed when you press on the arrow down button in the plugin list.


### Transfer functions and data
The plugin system of ImJoy is built on remote procedure calls.
An encoding and decoding scheme is used by ImJoy to transfer data and functions
between plugins. We expose a set of API functions from both the main app and the plugins.

#### Interacting with ImJoy app and other plugins
The plugin can use a predefined object called `api` to call different ImJoy API
functions, which allow interaction with the main ImJoy user interface and other plugins.
We refer to the section [ImJoy API functions](/api) for a complete list of the available
API functions.

#### Exposing plugin functions
Plugin functions can be exported as `Plugin APIs` by using the ImJoy
API function `api.export` at the end of the plugin code.
`setup` and `run` are two mandatory functions which need to be defined and exported.

When exporting ImJoyPlugin class is exported with the `api.export` as proposed
in the plugin templates, these functions (and all other functions of the ImJoy plugin class)
will be exported. Other plugin functions can be also exported and can then be
called **repeatedly** by other plugins with `api.call` or `api.run` .

#### Callback functions
Plugin functions that were not exported as `Plugin API` functions, can be sent
as an object to another plugin or ImJoy. These function will be will be
treated as a `callback` function and can be only called once.

A typical case example is a notification function that can be used be the called
plugin to inform the calling plugin that a computation is finished. Such a function
has to be called only once.

### Data exchange
A window in ImJoy can contain data, e.g. an image. When selecting such a window
and executing a plugin, the contained data will be transferred to the Python plugin.
A plugin can then process the data within the `run` function, by accessing `ctx.data`.
The results will be sent back to the ImJoy workspace and displayed as a new window.

Natively, ImJoy supports the conversion and transmission of Numpy arrays and
Tensorflow tensors. Plugin developers could just use those data types and exchange
them between plugins, no matter if they are in Python or JavaScript.

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
may block normal communication between the engine and the ImJoy app. We recommend to store the data on the disk (in the workspace directory for example), then use `api.getFileUrl` to generate an url to access the file. The generated url can then be send to the web App and accessed with a download link or using JavaScript libraries such as `axios`. Many libraries such as Three.js, Vega etc. can load files through url directly.

### Plugin during runtime
When executing a plugin, it can access different fields from `ctx`:

 * `ctx.config`
    The config values from the GUI defined with the `ui` string (from the plugin `<config>` block
    or from a separate operation `api.register`, more below). For example, if you defined an ui string (e.g. `"ui": "option {id: 'opt1', type: 'number'}"`) in the plugin `<config>`, you can access it through `ctx.config.opt1`.

 * `ctx.data`
     It stores the data from current active window and state for running the plugin.

 * `ctx._variables`
     When the plugin is executed in a workflow, variables will be set in the workflow will be passed as `ctx._variables`. It will be set to the actual variable value if the user used ops such as `Set [number]`.

You can directly return your result and they will show as a generic result window.

If you want to define the window type of your result, you can return an object with at least two fields `type` and `data`.
ImJoy will use `type` to find the window for rendering the result stored in `data`.

In the example below, the image from an url will be displayed in a image window or passed to the next op in a workflow.

```javascript
   return { "type": "imjoy/image", "data": {"src": "https://imjoy.io/static/img/imjoy-icon.png"} }
```

ImJoy uses postMessage to exchange data between plugins. This means that for JavaScript
plugins, objects are cloned during the transfer. If large objects are exchanged,
if the created objects are not directly transferred. To enable that, you can
add `_transfer=true` to your object when you return it. In the above
example, you can set `ctx._transfer = true` when you return `ctx`. However, it will
only speed up the transferring of `ArrayBuffers` or `ArrayBufferViews` (and also
ndarrays produced by Python), and after transferring, you won't be able to access it.

(**Note**: in Python, the data type of `ctx` is a dictionary, ImJoy added the interface for allowing dot notation, just like in JavaScript. If you prefer, you can also use `[]` in both languages to access dictionary or object.)

<!-- ## Advanced options -->

### Workflow management
We provide additional fields in `ctx` that allow to track, maintain and reconstruct an entire analysis workflow.

* `ctx._op`
    Give the name of the op which is being executing. When a plugin registered for multiple ops and no callback function was specified for the op, the `run` function will be called, and you can use `ctx._op` to determine which op is being executing.
* `ctx._source_op`
    Give the name of the op which initiated current execution.
* `ctx._workflow_id`
    When the plugin is executed in a workflow, its id will be passed here. When the plugin is executed from the plugin menu, ImJoy will try to reuse the workflow id in the current active window, if no window is active, a new workflow id will be assigned. All the data window with the same `_workflow_id` is virtually connected in a pipeline or computational graph. By combining `_workflow_id` with `_op` and `_source_op`,

 Importantly, `_workflow_id`, `_variables`, `_op` and `_source_op` can be used to implement interactivity between plugins, meaning if the user changed a state in one of the result window, the downstream workflow will be updated automatically.

### Run-time behaviour of native Python plugins
You can control the run-time behaviour of a Python plugin process with the `flags` field in the `<config>` block. Next we provide next nomenclature and additional explanations to explain the different options you have to control how the Python processes running on the plugin engine interact with the ImJoy interface.

* **Interface**: web interface of ImJoy. You can have ImJoy running on multiple browser windows, i.e. multiple interfaces.
* **Plugin Engine**: running in the background to execute Python code from different Python plugins.
* **Python plugin**: plugin containing Python code. Some plugins might have **`tags`** to further specify details of how they are executed.
* **Python process**: specific Python plugin running on the Plugin engine. Processes can be seen on the Task Manager.
* **Workspace**: collection of installed ImJoy plugins. For plugins with `tags`, the user choses the appropriate tag. Each Python plugin within a workspace has its own process. Each workspace has a unique name.
* **ImJoy instance** is a workspace running in one ImJoy interface.

![imjoy-python-process](assets/imjoy-python-process.png ':size=800')

Below we describe the three main run-time behaviour of python plugins:
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

By default, python plugins from ImJoy will be executed in the default conda environment (e.g. Python 3.6).
If you want to run a plugin in a different conda environment, you can specify it by setting the `env`
field in the `<config>` section of the plugin.

`env` can be a string or an array. When connecting multiple command in a line please use `&&` or `||` which are supported on different operating systems. If you have several command which are independent from each other, please use an array to store the commands.
For example: `"env": ["export CUDA_VISIBLE_DEVICES=1", "conda create -n XXXXX python=3.7"]`.

You can also create an environment directly from a `environment.yml` file, e.g.
`"env": "conda env create -f ANNA-PALM/environment.yml"`. This requires
that the repository is defined as a repo in the [plugin requirements](development?id=requirements).
For more information, consult the dedicated [conda help page](https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#creating-an-environment-from-an-environment-yml-file).

It is also important to specify the pip packages required by the plugin, this can be done
with the `requirements` field in `<config>`.

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

  **Note 1**: in `requirements`, you can also specify the version number, for example `numpy==1.15.0`.

  **Note 2**: in the `env` field, you need to use `-n XXXX` to name your environment,
  otherwise, it will use the plugin name to name the environment.


## Hosting and deploying plugins
Here, we provide detailed information for how to host or deploy ImJoy plugins.

Hosting and deployment options range from storing single file to setting up
your own ImJoy plugin repository. The plugins can then be distributed directly as files or
with a dedicated url syntax, which allows an automatic installation.

The **default and recommended** way for ImJoy plugin is to deploy on GitHub (either
as an individual file or in a plugin repository) and then distribute with a plugin url.
We recommend GitHub since it provides stability and version control, which guarantees
reproducibility and traceability.

### Hosting individual plugin files
This is the typical case during development.

The plugin code can be hosted on the web, e.g. GitHub, Gist, or Dropbox.

### Own ImJoy plugin repository
You can easily create a ImJoy plugin repository for an existing GitHub project.

A template project can be found [here](https://github.com/oeway/ImJoy-project-template).
For this, you save your ImJoy plugins in a dedicated folder, and add a
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

You can then update this manifest either **automatically** or **manually**:

1.  For an **automatic update**, we provide a [node script](https://github.com/oeway/ImJoy-project-template/blob/master/update_manifest.js).
    This script requires node.js to be executed. Then run it  with the command `node update_manifest.js` in the root folder
    containing `manifest.imjoy.json`. It will then automatically search for ImJoy plugins and
    generate the manifest.

    Please note that when you use this node script for the first time, you have to manually change
    the name of the plugin repository `name`. For subsequent updates, the name will remain.

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
repository containing the ImJoy plugin repository. The user can then install the
plugins from this list. For more details on how to generate this url and see how
specific plugins can be installed see the dedicated section below.


### Official ImJoy plugin repository
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
be dragged into the ImJoy workspace, where it will be automatically recognised as a plugin.

In the last section, we describe how plugins **depending on custom libraries** can be
distributed.

<!-- THIS MIGHT BE CONFUSING.
In last option, which we typically don't recommend, you can send an url pointing
to the plugin file. This url can then be used to install the plugin in ImJoy:
press the `+ Plugins` button and add the url in the field `Install plugin from url`.
However, this option provides less control about how the plugin should be installed.
-->

### Generating a plugin url
The easiest way to distribute plugins is by creating a url, which can be shared.

The basic format is `http://imjoy.io/#/app?plugin=PLUGIN_URI`. You will need to
replace `PLUGIN_URI` with your actual **plugin URI** (Uniform Resource Identifier).
For example: [https://imjoy.io/#/app?plugin=https://github.com/oeway/ImJoy-Plugins/blob/master/repository/imageWindow.imjoy.html](https://imjoy.io/#/app?plugin=https://github.com/oeway/ImJoy-Plugins/blob/master/repository/imageWindow.imjoy.html). When the user click this link,
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
    Notice that, the plugin file needs to end with `.imjoy.html`. Below we describe
    how to obtain this url for different hosting platforms:

    1. For files on **GitHub**, you just need to copy the link to the file.
       For example: `https://github.com/oeway/ImJoy-Plugins/blob/master/repository/imageRecognition.imjoy.html`.

    0.  For **Gist** or other Git providers such as (GitLab), you need to obtain the `raw`
        link of the plugin file. For example, to create a Gist link

        1. Go to Gist on your GitHub account [https://gist.github.com/](https://gist.github.com/)
        0. Create new Gist, specify the plugin name followed by `.imjoy.html`, and copy & paste the code of your plugin.
        0. Create either a public or secret Gist.
        0. Link to Gist can be obtained from the `Raw` button (this links to the unprocessed versions of the file).
           The link will looks like this: `https://gist.githubusercontent.com/oeway/aad257cd9aaab448766c6dc287cb8614/raw/909d0a86e45a9640c0e108adea5ecd7e78b81301/chartJSDemo.imjoy.html`
        0. Please note that this url will change when you update your file.

    0. For **Dropbox** you need to modify the sharable url as follows:
         1. Replace `dl=0` to `dl=1`;
         2. Replace `https://www.dropbox.com/` to `https://dl.dropboxusercontent.com/`.

    To specify the plugin tag, you can just append `@TAG` right after `.imjoy.html`. For example: `https://raw.githubusercontent.com/oeway/DRFNS-Lite/master/DRFNS-Lite.imjoy.html@GPU`.

You can test in ImJoy if your plugin url works: paste it in the `+ PLUGINS` dialog
(`Install from URL`) and press `Enter`. If everything works, you should be able
to see a card rendered with your plugins which you can click `INSTALL`.

### Supported url parameters
You can construct the ImJoy url with customised functionality for facilitated installation.
These url parameters can be used after `https://imjoy.io/#/app?`, using a `PARAM=VALUE` syntax.

These parameters are independent from each other and multiple parameters
can be concatenate with `&`. For example we want to specify `par1=99` and `par2=hello`,
the corresponding url would be `https://imjoy.io/#/app?par1=99&par2=hello`.

The following url parameters are currently supported:

 *  `plugin` or `p`: show the specified plugin in the plugin management dialog as
     detailed in the section above. If the plugin with the same name and version exists, the dialog will not shown.
     If needed, add `upgrade=1` to force show the plugin dialog. For example: `https://imjoy.io/#/app?p=oeway/ImJoy-Demo-Plugins:alert&upgrade=1`.
 *   `workspace` or `w`: name of workspace. ImJoy will switch to the specified
     workspace if it exist, or create a new one. For example, `https://imjoy.io/#/app?workspace=test`
 *   `engine` or `e`: define the url of the plugin engine. For example: `http://imjoy.io/#/app?engine=http://127.0.0.1:9527`.
     Note that if you want to connect to a remote machine through a http (not https) connection,
     you can only do it by using `http://imjoy.io` and not `https://imjoy.io`.

     This restriction also exist if you use localhost with some browsers (e.g. Firefox).
     To avoid it, you need to use `http://127.0.0.1:9527` rather than `http://localhost:9527`,
     because most browser will consider `127.0.0.1` is a secured connection, but not `localhost`.
     However, there is an exception, on Safari, using `127.0.0.1` does not work due to
     [this restriction](https://bugs.webkit.org/show_bug.cgi?id=171934),  please use
     Firefox or Chrome instead.

 *   `token` or `t`: define the connection token. For example: `http://imjoy.io/#/app?token=2760239c-c0a7-4a53-a01e-d6da48b949bc`
 *   `repo` or `r`: specify a ImJoy manifest file pointing to a ImJoy plugin repository (see above).
      This can be a full repo link such as `repo=https://github.com/oeway/ImJoy-Plugins`
      or a simplified GitHub link `repo=oeway/ImJoy-Plugins`.

      If you are hosting your repo from a non-GitHub website (e.g. GitLab), please
      use the `raw` link to the `manifest.imjoy.json` file.

 *   `start` or `s`: define a startup plugin name which will be started automatically after ImJoy web app loaded.
      All the url parameters will be passed to the plugin as `ctx.config` to the `run(ctx)` function. This allows you to add customized arguments and use them in `run(ctx)`. For example, a plugin can load an image automatically with `load=URL` and set the width and height of the image with, for example, `width=1024&height=2048`. For example, pass `123` to the `run` function of the plugin as `ctx.data.x`: `https://imjoy.io/#/app?x=123&start=AwesomePlugin`.

      If you are starting a window plugin, you can also set `standalone` or `fullscreen` to `1` to make the window detached from the workspace or in full screen mode. For example: `https://imjoy.io/#/app?x=123&start=AwesomeWindowPlugin&fullscreen=1`.

 *   `load` or `l`: define an URL for making a http GET request, this parameter should only used when you defined a startup plugin with `start` or `s`. The data fetched from the URL will be passed to the startup plugin `run(ctx)` function as `ctx.data.loaded`.



### Distribute plugins with custom libraries
If your plugin depends on non-standard libraries and modules, you have to provide
them with your plugin. You can upload those libraries and modules to a GitHub repository,
GitHub Gist, or other data-sharing platforms such as Dropbox and link them in the plugin code.

 *  For **JavaScript** plugins, you need to create a Gist or GitHub.
    Upload the plugin (ending with `.imjoy.html`) file together with the other JavaScript files.

    In the plugin file, you can then add the url to the plugin `requirements`.
    However, due to GitHub restrictions, you can't use the GitHub url directly,
    but you have to convert it with [combinatronics.com](https://combinatronics.com/).

 *  For **Python** plugins, we recommend to package your library as a pip module
    on GitHub. For more information, consult the dedicated section [here](development?id=install-package-from-github).
