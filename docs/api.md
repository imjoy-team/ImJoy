# ImJoy API

Every plugin runs in its own sandbox-like container environment (web worker or iframe for JS, process for Python). This avoids interference with other plugin and makes the entire ImJoy App more secure.

Interaction between plugins or between a  plugin with the main app is carried out through a set of API functions (`ImJoy API`). All the plugins have access to a special object called `api`, with which the plugin can, for example, show a dialog, send results to the main app, or call another plugin with paramenters and data.

To make the interaction more efficient and concurrently, we chose a programing pattern called ["asynchronous programming"](http://cs.brown.edu/courses/cs168/s12/handouts/async.pdf) for these API functions.

## Asynchronous programming

All ImJoy API functions are asynchronous. This means when an `ImJoy API` function
is called, ImJoy will not block its execution, but instead it will immediately return an object called [`Promise`(JS)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) or [`Future`(Python)](https://docs.python.org/3/library/asyncio-future.html). You can decide to wait for the actual result or set a callback function to retrieve the result once the process terminated. For example, if you popup a dialog to ask for user input, in many programming languages (synchronous programing), the code execution will be blocked until the user closes the dialog. However, an asynchronous program will return the `promise` object even if the user haven't close the dialog and continue processing.

Since every API call is asynchronous and non-blocking, a given plugin can call multiple other plugins to perform tasks simultaneously without using thread-like techniques.

ImJoy supports two asynchronous programming styles to access these asynchronous functions
for both Python and JavaScript: `async/await` and `callback` style. A few important
considerations

* `async/await` is recommended for JavaScript and Python 3 (expect Web Python, which doesn't support it yet).
* `callback` style can be used for JavaScript, Python 2 and Python 3.
*  **Note** that you **cannot** use both style at the same time.
* While you can use `try catch` (JavaScript) or `try except` (Python) syntax to capture error with `async/await` style, you cannot use them to capture error if you use `callback` style.

In the following list of API functions, we provided examples in `async` style. For Python 2, you can easily convert to callback style accordingly.

For more information about Asynchronous programming, we refer to a number of
excellent ressources:

* [Introduction to Promise in JS](https://developers.google.com/web/fundamentals/primers/promises)
* [Async functions for JS](https://developers.google.com/web/fundamentals/primers/async-functions)
* [Asynchronous I/O module for Python 3+](https://docs.python.org/3/library/asyncio.html).


### `async/await` style
For Javascript and Python 3+, `async/await` style is natively supported and recommended.

Declare your function with the `async` keyword. Add `await` before the asynchronous function to wait for the result. This essentially allows synchronous style programming without the need to set callbacks. For example:

 ```javascript
 // JavaScript
 class ImJoyPlugin(){
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
# Python
import asyncio

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, my):
        try:
            result = await api.XXXXX()
            print(result)
        except Exception as e:
            print(e)
 ```

Notice that you can **only** use `await` when you add `async` before the
definition of your function. Don't forget to `import asyncio` if you use `async/await` with Python 3.


### `callback` style
However, for Python 2 or Web Python, `asyncio` is not supported, therefore you need to use `callback` style.

Call the asynchronous function and set its callback with `.then(callback_func)`.
For JavaScript plugins, a native JavaScript `Promise` will be returned ([More about Promise.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)). For Python plugins, it will return a simplified Python implement of promise.

Below examples for an api name `XXXXX`:

```javascript
// JavaScript
class ImJoyPlugin(){
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
# Python
class ImJoyPlugin():
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


## Input arguments
When calling the API functions, most functions take an object (JavaScript) or dictionaries/named arguments (Python) as its first argument.

The following function call will work both in JavaScript and Python:

```javascript
// JavaScript
await api.XXXXX({"option1": 3, "option2": 'hi'})
```

This call will work only for Python:
```python
# Python
await api.XXXXX(option1=3, option2='hi')
```

### API functions
For each api function we provide a brief code snippet illustrating how this
function can be used. Below, you will find links **Try yourself >>**. These will
open a full example in ImJoy, where see the function in action. The examples are
in JavaScript, but the api functions are called in similar fashion in Python.

### api.alert

``` javascript
await api.alert(message)
```

Shows an alert dialog with a message.

**Arguments**

* **message**: String. Contains the message to be displayed.

**Example**
``` javascript
await api.alert('hello world')
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:alert&w=examples)


### api.call
```JavaScript
result = await api.call(plugin_name,plugin_op,data)
```

Calls a function from another plugin.

You can also transfer data. Number of argument number must match the required number
of arguments of the called function.

If you want to call frequently functions of another plugin, we recommend using `api.getPlugin`.

**Arguments**

* **plugin_name**: String. Name of the called plugin.
* **plugin_op**: String. Name of plugin function (op).
* **data**: Object. Any of the supported primitive data types that can be transferred.

**Returns**
* **result**: The result returned from the plugin function if any.

**Example**

To call a function `funcX` defined in the plugin  `PluginX` with the argument `1`, use

``` javascript
await api.call("PluginX", "funcX", 1)
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:call&w=examples)


### api.getPlugin
```JavaScript
plugin = await api.getPlugin(plugin_name)
```

Gets the API object of another plugin.


**Note 1:** If the plugin is terminated and you try to call its function, you will get an error. One solution to this is to use `try ... catch `(JavaScript) or `try: ... except: ...`(Python) statement to capture the error. <!--(TODO: this does not work for `native-python` plugin yet.)-->

**Note 2** on `api.getPlugin` and `api.call`. If you want to constantly access
different functions from another plugin, it is preferable to get all the API
functions of this plugin with `api.getPlugin`. Then you can access them
through the returned object. If you only access the API function in another
plugin occasionally, you can also use `api.call`


**Arguments**

* **plugin_name**: String. Name of another plugin.

**Returns**
* **plugin**: Object. An object which can be used to access the plugin API functions.

**Example**

Get the API of the plugin `PluginX`, and access its functions:

``` javascript
pluginX = await api.getPlugin("PluginX")
result = await pluginX.run()

// Assuming that PluginX defined an API function `funcX`, you can access it with:
await pluginX.funcX()
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:getPlugin&w=examples)


### api.export
```javascript
// JavaScript
api.export(new ImJoyPlugin())
```
or
``` python
# Python
api.export(ImJoyPlugin())
```
Exports the plugin class or an object/dict as `Plugin API`.

This call is mandatory for every ImJoy plugin (typically as the last line of the plugin script). Every member of the `ImJoyPlugin` instance will be exported as `Plugin API`, which means those exported functions or variables can be called or used by the ImJoy app or another plugin. This then allows other plugins to use `api.run` or `api.call` to call the plugin or its functions.

Only functions and variables with primitive types can be exported (number, string, boolean). And if a variable or function has a name start with `_`, it means that's an internal variable or function, will not be exported.

**Note** that in JavaScript, the `new` keyword is necessary to create an
instance of a class, while in Python there is no `new` keyword.

### api.register
```javascript
await api.register(op)
```

Register a new operator (**op**) to perform a specific task.

An op can have its own GUI defined by the `ui` string.

By default, all ops of a plugin will call the `run` function of the plugin.
You can use `my.config.type` in the `run` function to differentiate which op was called.

Alternatively, you can define another `Plugin API` function in the `run` field.
The function must be a member of the plugin class or being exported (with `api.export`) as a `Plugin API` function. This is because a arbitrary function transferred by ImJoy will be treated as `callback` function, thus only allowed to run once.

If you want to change your interface dynamically, you can run `api.register`
multiple times to overwrite the previous version. `api.register` can also be used to overwrite the default ui string of the plugin defined in `<config>`, just set the plugin name as the op name (or without setting a name).

**Arguments**

* **op**: Object (JavaScript) or dictionary (Python). Describes the plugin operation.
   Several fields are allowed:
    - `name`: String. Name of op.
    - `ui`: Object (JavaScript) or dictionary (Python). Rendered interface. Defined
       with the same rule as the `ui` field in `<config>`.
    - `run`: String, optional. Specifies the `Plugin API` function that will run when
      the op is executed. If not specified, the `run` function of the plugin will be executed.
    - `update`: String, optional. Specifies another `Plugin API` function that will run
      whenever any option in the `ui` is changed.
    - `inputs`: Object, optional. A [JSON Schema](https://json-schema.org/) which defines the inputs of this op.
    - `outputs`: Object, optional. A [JSON Schema](https://json-schema.org/) which defines the outputs of this op.

**Examples**

```javascript
// JavaScript
await api.register({
     "name": "LUT",
     "ui": [{
        "apply LUT": {
            id: 'lut',
            type: 'choose',
            options: ['hot', 'rainbow'],
            placeholder: 'hot'
          }
      }],
      "run": this.apply_lut,
      "update": this.update_lut
});

apply_lut(my) {
    ...
 };

update_lut(my) {
     ...
};

```
[**Try yourself >>**](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:register&w=examples) Compare how the ops for favorite number and animal are implemented.

### api.unregister
```javascript
await api.unregister(op_name)
```

Unregister an existing operator (**op**).

**Arguments**

* **op_name**: String. The name of the op to be removed.


### api.run
``` javascript
await api.run(plugin_name)
```
Run another plugin by specifying its name.

You can also pass [`my`](https://imjoy.io/docs/#/development?id=plugin-during-runtime)
to this plugin to transfer data.

**Arguments**

* **plugin_name**: String. Plugin name.

**Examples**


Example to call one plugin:

``` python
await api.run("Python Demo Plugin")
```
[**Try yourself >>**](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:run&w=examples)

Example for concurrent execution of two plugins, where the two plugins are
executed simultaneously, but ImJoy waits for the result one after the other.

```python
# Python
p1 = api.run("name of plugin 1")
p2 = api.run("name of plugin 2")

result1 = await p1
result2 = await p2
```

This can also be achieved with `asyncio.gather` in Python:

```python
p1 = api.run("name of plugin 1")
p2 = api.run("name of plugin 2")
result1, result2 = await asyncio.gather(p1, p2)
```

Similarly for JavaScript, you can use

```javascript
const p1 = api.run("name of plugin 1")
const p2 = api.run("name of plugin 2")
const [result1, result2] = [await p1, await p2]
```

Example for sequential execution of two plugins
```python
result1 = await api.run("name of plugin 1")
result2 = await api.run("name of plugin 2")
```

### api.createWindow
```javascript
win = await api.createWindow({name: window_name, type: window_type, w:w, h:h, data: data, config:config})
```
Creates a new window in the ImJoy workspace.

Once an window is created, it will return an object with the APIs of the corresponding window plugin,
which can be used to update the window, e.g. you can update the data field with `win.run({"data": ...})`).

**Note 1**: calling functions of a closed window. If the window is closed and you try to call its function, you will get an error, one solution to this is to use `try ... catch `(JavaScript) or `try: ... except: ...`(Python) statement to capture the error.

**Note 2:** difference between `api.createWindow` and `api.getPlugin`. Both
functions can be used to obtain an object containing the plugin api for `window`
plugins. However, only the object obtained by `api.createWindow` can be used to
update an existing window. In contrast, the object returned by `api.getPlugin`
will create a new window each time used.

This difference in behavior can be explained by the way ImJoy handles the different
plugin types. When ImJoy loads a plugin which is not `window` plugin, it will start
the appropriate standalone python process, webworker or iframe. This ensures that
only one instance of the plugin is running. In contrast, `window` plugins will
only be registered and a proxy plugin will be created. No actual instance will
be started unless the user clicks the plugin menu or the plugin is called by
another plugin. Each window in the workspace is then a new instance of the `window` plugin.

When `api.getPlugin` is called, it will return the api of the proxy plugin, e.g.
`proxy = await api.getPlugin('Image Window')`). Every time the `run` function
is executed, a new window will be created. For example, if you run `proxy.run({data: ...})`
for 10 times, 10 windows will be created.

When `api.createWindow` is used, it will return an instance of the window plugin,
e.g. `win = await api.createWindow({'name': 'new window', 'type': 'Image Window', 'data': {...}})`).
If you run `win.run({'data': ...})` for 10 times, the same window instance will be updated.


**Arguments**

* **window_name**: String. Specifies the name of new window.
* **window_type**: String. Specifies the window type. This can be either the name of
   window plugin or an internal ImJoy window type. The following types are
   supported:

    - `imjoy/image`. Display an image. Requires `data.src` pointing to an image location.
    - `imjoy/files`. Display a list of files. `data` is an array of file objects.
    - `imjoy/url_list`. Display a list of url rendered with HTML tag `<a> </a>`. `data` is an array of urls.
    - `imjoy/panel`. Render the `ui` string in a `<config>` block. <!--****[TODO] what can you do with this?**-->
    - `imjoy/markdown`. Render some markdown text provided in `data.source`.
    - `imjoy/generic`. Will show all objects in `data`. For instance, the window that you obtain with `return.my`
    - `imjoy/plugin-editor`. Opens the source code editors. `data.id` is a unique string (preferable random) specifying the window id, `data.code` contains the source code

* **w**: Integer. Window width in grid columns (1 column = 30 pixels).
* **h**: Integer. Window height in grid rows (1 row = 30 pixels).
* **data**: Object (JavaScript) or dictionary (Python). Contains data to be transferred to the window.
* **config**: Object (JavaScript) or dictionary (Python).

**Returns**

* **win**: Object. The API object of the created window. Can be stored in the plugin class
  (`self` for Python, or `this` for JavaScript) for later use, e.g. to update the window.

**Examples**

Create a simple window in JavaScript:
```javascript
win = await api.createWindow({name: 'new window', type: 'Image Window', w:7, h:7, data: {image: ...}, config: {}})
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:createWindow&w=examples)

In python you can either use the `async/await` style for Python 3

```python
win = await api.createWindow(name='new window', type='Image Window', w=7, h=7, data={image: ...}, config={})
```

or the `callback` style for Python 2
```python
def window_callback(win):
    self.win = win
    print('window created')

api.createWindow({name: 'new window', type: 'Image Window', w:7, h:7, data: {image: ...}, config: {}}).then(window_callback)
```

Use the returned object to update the window, or use `onclose` to set a callback
function which will be called hen the window is being closed.

For Python:
```python
# win is the object retured from api.createWindow
# pass as a dictionary
await win.run({'data': {'image': ...}})

# or named arguments
await win.run(data={'image': ...})

# set `onclose` callback
def close_callback():
    print('closing window.')

win.onclose(close_callback)
```

For Javascript:
```javascript
// win is the object retured from api.createWindow
await win.run({'data': {'image': ...}})

// set `onclose` callback
win.onclose(()=>{
  console.log('closing window.')
})
```

### api.showDialog
```javascript
answer = await api.showDialog(dialog)
```

Show a dialog with customized GUI.

The answer is stored in the returned object, and can be retrieved with the specified `id`. To consider the case when the user presses `cancel`, you can use the `try catch` (JavaScript) or `try except` (Python) syntax.

**Arguments**
* **dialog**. Object (JavaScript) or dictionary (Python). Specifies the dialog.
    Contains following fields:
    - `name`: String. Title of dialog.
    - `ui`: String. Specifies appearance of GUI. Defined with the same rule as the `ui` field in `<config>`. Defined name in `id` is used to retrieve answer.
**Returns**
* **answer**. Object (JavaScript) or dictionary (Python). Contains provided answer as field `answer[id]`.

**Example**
```javascript
result = await api.showDialog({
   "name": "This is a dialog",
   "ui": "Hey, please select a value for sigma: {id:'sigma', type:'choose', options:['1', '3'], placeholder: '1'}.",
})
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:showDialog&w=examples)


### api.showProgress
``` javascript
api.showProgress(progress)
```
Updates the progress bar on the Imjoy GUI.

**Arguments**

* **progress**: Float. Progress in percentage. Allowed range from 0 to 100.

**Examples**
``` javascript
api.showProgress(85)
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:showProgress&w=examples)


### api.showSnackbar
``` javascript
api.showSnackbar(message,duration)
```
Shows a quick message with a snackbar.

**Arguments**

* **message**: String. Message to be displayed.
* **duration**: Integer. Duration in seconds message will be shown. <!--**[TODO]**-->

**Examples**

``` javascript
api.showSnackbar('processing...', 5)
```

[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:showSnackbar&w=examples)


### api.showStatus
``` javascript
api.showStatus(status)
```
Updates the status text on the Imjoy GUI.

**Arguments**

* **status**: String. Message to be displayed.

**Examples**

``` javascript
api.showStatus('processing...')
```

[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:showStatus&w=examples)


### api.showPluginProgress
update the progress bar of the current plugin (in the plugin menu).

```javascript
api.showPluginProgress(85)
```

### api.showPluginStatus
Updates the status text of the current plugin (in the plugin menu).

``` javascript
api.showPluginStatus('processing...')
```

### api.setConfig
``` javascript
api.setConfig(config_name, config_value)
```
Store plugin data in its configuration.

These values can be retrieved when ImJoy is restarted. This function is ideally suited to store and reload settings. However, the  function  is designed for storing small amounts of data, not large objects. The current implementation uses `localStorage` for storage.
Most browsers only allow 5MB data storage shared by all the plugins and
the ImJoy app itself.

To remove a parameter, set its value to `null` (JavaScript) or `None` (Python).

**Arguments**
* **config_name**: String. Name of parameter. Don't use names starting with an `_` followed by
any of the field name of the `<config>` block.
* **config_value**: Number or String. Neither objects/arrays (JS) nor dict/list (Python). Please note that numbers are stored as strings.

**Examples**
``` javascript
api.setConfig('sigma', 928)
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:setConfig&w=examples)


### api.getConfig
``` javascript
config_value = await api.getConfig(config_name)
```
Retrieves configurations for plugin.

**Note 1:** numbers are converted to strings when saved with `api.setConfig`. They have to be converted back to numbers before using them (in JavaScript use `parseInt()` or `parseFloat()`, in Python `int()` or `float()`).

**Note 2:** you can also access the fields defined in the `<config>` block by adding `_` to the field name, for example, if you want to read the plugin name `defined` in the `<config>` block, you can use `plugin_name = await api.getConfig('_name')`.

**Arguments**
* **param_name**: String. Name of parameter.

**Returns**

* **param**: String. Returned parameter value. Please note that numbers will also be returned as string.

**Examples**

``` javascript
sigma = await api.getConfig('sigma')
```
[Try yourself in the setConfig example >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:setConfig&w=examples)



### api.showFileDialog
```javascript
file_path = await api.showFileDialog()
```

Shows a file dialog to select files or directories.

Importantly, this api function **works only** if the Python plugin engine is connected,
even if you are using it in JavaScript. The function will return a promise from which you
can get the file path string.

The file handling is different for the ImJoy app and the plugin engine. We recommend
reading the dedicated section in the [**TO DO** user manual]() to understand the difference.
When calling this api function within a **JavaScript** plugin, you will obtain
a warning message as the one shown below. It essentially indicates that the
ImJoy app now requests access to this part of your local file system:

<img src="./assets/imjoy-showFileDialog-warning.png" width="700px"></img>

Please note that the file-path for a JavaScript plugin is returned as an url, while
for a Python plugin it will be the absolute file-path. The url format is required for
a JavaScript plugin to be able to open a file. You can change this behavior with the
`uri_type` option (see below). For instance, you can obtain the absolute path also
for a JavaScript plugin. However, you can not use this path to open the file in
JavaScript, but you can pass it to another Python plugin for processing.


**Arguments**

* **type**: String. Supported modes of file dialog:
    - `file` (default): select one or multiple files;
    - `directory`:  select one or multiple directories. For Python plugins, if you don't specify the type, both file or directory can be selected.
* **title**: String. Title of the dialog.
* **root**: String. Initial path for the dialog to show. Note: for Python plugins on Windows,
   you may want to define the path string as raw string using `r"xxxxxx"` syntax,
   we have encountered unrecognized path issue with normal strings.
* **mode**: String. Modes for file selection. By default, the user can select a single or multiple file (with the `shift` key pressed)
    - `single`: only a single file or directory can be selected. <!--**[TODO]** what's returned here?-->
    - `multiple`: multiple files or directories are selected and are returned in an array or list.
    - `single|multiple` (default): both single and multiple selection are allowed. <!--**[TODO]** why this additional option?-->
* **uri_type**: String. Format of returned file path.
    - `url` (default for JavaScript plugins): <!--**[TODO]**-->
    - `path` (default for Python plugins): <!--**[TODO]**-->

**Returns**
* **file_path**: String. Contains file-path as specified by `uri_type`.

**Examples**
```javascript
file_path = await api.showFileDialog()
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:showStatus&w=examples)


### api.getFileUrl
```javascript
file_url = await api.showFileDialog(file_path)
```

Generates an url to access a local file or directory path.

When this function is called, a confirmation dialog will be displayed to obtain the
user's permission. This means a JavaScript plugin cannot access the user's file system without notifying the user.

The optional argument `header` describes how the url will be served. If no header
is specified, the url is specified to be rendered in the browser, and the
`Content-Type` will be guessed from the file name by Python library
[mimetypes](https://docs.python.org/3/library/mimetypes.html). If `mimetypes`
failed to guess a content type, the fallback type will be `application/octet-stream`.
Either behavior can be changed.

**Arguments**
* **file_path**: String. Absolute file path.
* **password** (optional): String. Password to access the file or folder
* **headers** (optional): String. By default, the generated url will be served
    with the header `Content-disposition: inline; filename="XXXXXXXXX.XXX"`
    for rendering in the browser. You can modify this header to create downloabable links,
    or alter how the link is rendered.

**Returns**
* **file_url**: String. File path in url format.

**Examples**

Simple example

``` javascript
api.getFileUrl('~/data/output.png')
// will return something like `http://127.0.0.1:8080/file/1ba89354-ae98-457c-a53b-39a4bdd14941?name=output.png`.
```

Specify password
``` javascript
api.getFileUrl('~/data/output.png', password='SECRET_PASSWORD').
```

Specify header to create downloadable link
```
headers={'Content-disposition': 'attachment; filename="XXXXXXXXX.XXX"'}
```

Specify header for specific content type
```
headers={'Content-disposition': 'inline; filename="XXXXXXXXX.XXX"', 'Content-Type': 'image/png'}
```

### api.getFilePath
```javascript
file_path = await api.getFilePath(file_url)
```

Converts an url generated by `api.getFileUrl` into an absolute file path on the file system.

**Arguments**
* **file_url**: String. File path in url format.

**Returns**
* **file_path**: String. Absolute file path.

### api.exportFile
```javascript
api.exportFile(file, name)
```

Trigger a download for a file object from the browser.

**Arguments**
* **file**: File or Blob. The file object to be downloaded.

**Returns**
* **name**: String. The file name.

**Examples**

```javascript
// JavaScript
var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
api.exportFile(blob, 'hello.txt')
```

### api.getAttachment
```javascript
content = await api.getAttachment(att_name)
```
Retrieve data stored in the `<attachment>` block of the plugin file.

You can store any text data such as base64 encoded images, code and json in the `<attachment>` block.

**Arguments**
* **att_name**: String. Identifier of the attachment.

**Returns**
* **content**: The text content stored in the `<attachment>` block.


**Examples**

``` html
<attachment name="att_name"></attachment>
```
```javascript
content = await api.getAttachment(att_name)
```

### api.utils.XXXX
``` javascript
await api.utils.utility_name()
```

Call utility function.

Currently supported functions for **all plugins** are:
 * `api.utils.$forceUpdate()`: refreshes the GUI manually.
 * `api.utils.openUrl(url)`: opens an `url` in a new browser tab.
 * `api.utils.sleep(duration)`: sleeps for the indicated `duration` in seconds. Note for Python plugins, use `time.sleep` instead.)

Currently supported functions for **Python plugins** are:
 * `api.utils.kill(subprocess)`: kills a `subprocess` in python.
 * `api.utils.ndarray(numpy_array)`: wrapps a ndarray `numpy_array` according to the ImJoy ndarray format.

### api.TAG constant
The current tag chosen by the user during installation.

### api.WORKSPACE constant
Name of the current workspace.
