# ImJoy API

Every plugin runs in its own sandbox-like container environment (web worker or
iframe for JavaScript, process for Python). This avoids interference with other
plugins and makes the ImJoy App more secure.

Interactions between plugins or between a plugin with the main ImJoy app are carried
out through a set of API functions (`ImJoy API`). All plugins have access
to a special object called `api`. In Javascript, `api` is a global object which you can use directly.
In Python, you can import it by calling `from imjoy import api`. With this object plugins can, for example,
show a dialog, send results to the main app, or call another plugin with
parameters and data.

To make the interaction more efficient and concurrently, we chose a
programming pattern called [asynchronous programming](http://cs.brown.edu/courses/cs168/s12/handouts/async.pdf)
for these API functions.

## Asynchronous programming

All ImJoy API functions are asynchronous. This means when an `ImJoy API` function
is called, ImJoy will not block its execution, but instead it will immediately return an object called [Promise(JS)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) or [Future (Python)](https://docs.python.org/3/library/asyncio-future.html). You can decide to wait for the actual result or set a callback function to retrieve the result once the process terminated. For example, if you popup a dialog to ask for user input, in many programming languages (synchronous programming), the code execution will be blocked until the user closes the dialog. However, an asynchronous program will return the `promise` object even if the user didn't close the dialog and continue processing.

Since every API call is asynchronous and non-blocking, a given plugin can call multiple other plugins to perform tasks simultaneously without using thread-like techniques.

ImJoy supports two asynchronous programming styles to access these asynchronous functions
for both Python and JavaScript: `async/await` and `callback` style. A few important
considerations

* `async/await` is recommended for JavaScript and Python 3 (expect Web Python, which doesn't support it yet).
* `callback` style can be used for JavaScript, Python 2 and Python 3.
*  **Note** that you **cannot** use both style at the same time.
* While you can use `try catch` (JavaScript) or `try except` (Python) syntax to capture error with `async/await` style, you cannot use them to capture error if you use `callback` style.

In the following list of API functions, we provided examples in `async` style. For Python 2, you can easily convert to callback style accordingly.


### async/await style
This style is natively supported and recommended for Javascript and Python 3+ plugins.

Declare your function with the `async` keyword. Add `await` before the asynchronous
function to wait for the result. This essentially allows synchronous style
programming without the need to set callbacks.

Below is a simple example for an api function named `XXXXX`. Please note that that you can **only**
use `await` when you add `async` before the function definition. For Python3,
don't forget to `import asyncio`.

<!-- tabs:start -->

#### ** JavaScript **
```javascript
 class ImJoyPlugin(){
  async setup(){
  }
  async run(ctx){
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

#### ** Python **
```python
import asyncio
from imjoy import api

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        try:
            result = await api.XXXXX()
            print(result)
        except Exception as e:
            print(e)
 ```
<!-- tabs:end -->



### callback style
However, for Python 2 or Web Python, `asyncio` is not supported, therefore
you need to use `callback` style.

Call the asynchronous function and set its callback with `.then(callback_func)`.
For JavaScript plugins, a native JavaScript `Promise` will be returned ([More about Promise.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)). For Python plugins,
it will return a simplified Python implement of promise.

Below examples for an api function named `XXXXX`:

<!-- tabs:start -->
#### ** JavaScript **

```javascript
class ImJoyPlugin(){
  setup(){
  }

  run(ctx){
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

#### ** Python **
```python
from imjoy import api
class ImJoyPlugin():
    def setup(self):
        pass

    def run(self, ctx):
        api.XXXXX().then(self.callback)

        # optionally, you can catch an error
        def error_callback(error):
            print(error)
        api.XXXXX().then(self.callback).catch(error_callback)

     def callback(result):
        print(result)
```
<!-- tabs:end -->


## Input arguments
When calling the API functions, most functions take an object (JavaScript)
or dictionaries (Python) as its first argument. for `native-python` plugins.

The following function call will work both in JavaScript and Python:

```javascript
// JavaScript or Python
await api.XXXXX({"option1": 3, "option2": 'hi'})
```

This call will work only for Python:
```python
# Python
await api.XXXXX(option1=3, option2='hi')
```

## API functions
For each api function we provide a brief code snippet illustrating how this
function can be used. Below, you will find links **Try yourself >>**. These will
open a full example in ImJoy, where see the function in action. The examples are
in JavaScript, but the api functions are called in similar fashion in Python.

### api.alert

```javascript
await api.alert(message)
```

Shows an alert dialog with a message to the user. 

**Arguments**
<!--****[TODO] add instructions about customizable parameters **-->

For plain text:

* **message**: String. Contains the message to be displayed. HTML tags can be used in the message, but only limited to a restricted set of tags and css, more details can be found [here](api?id=sanitized-html-and-css).

For HTML:

* **message**: Object. It contains the following fields:
  - **content**: Contains the question to be displayed. HTML tags can be used in the message, but only limited to a restricted set of tags and css, more details can be found [here](api?id=sanitized-html-and-css).
  - **title**: The title of the dialog


**Example**
```javascript
await api.alert('hello world')
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:alert&w=examples)

### api.prompt

```javascript
const answer = await api.prompt(question, default_answer)
```

Shows a prompt to ask the user for input.

**Arguments**
<!--****[TODO] add instructions about customizable parameters **-->

For plain text:

* **question**: String. Contains the question to be displayed.  HTML tags can be used in the message, but only limited to a restricted set of tags and css, more details can be found [here](api?id=sanitized-html-and-css).

For HTML:

* **question**: Object. It contains the following fields:
  - **content**: Contains the question to be displayed. HTML tags can be used in the message, but only limited to a restricted set of tags and css, more details can be found [here](api?id=sanitized-html-and-css).
  - **placeholder**: The default answer of the question
  - **title**: The title of the dialog

* **default_answer** (optional): String. Contains the default answer to the question.

**Returns**
* **answer**: Boolean. The answer from the user.

**Example**
```javascript
const answer = await api.prompt('What is your name?')
```
<!--****[TODO] add example **-->

### api.confirm

```javascript
const confirmation = await api.confirm(question)
```

Shows a confirmation message to the user.

**Arguments**
<!--****[TODO] add instructions about customizable parameters **-->

For plain text:

* **question**: String. Contains the question to be displayed.  HTML tags can be used in the message, but only limited to a restricted set of tags and css, more details can be found [here](api?id=sanitized-html-and-css).

For HTML:

* **question**: Object. It contains the following fields:
  - **content**: Contains the question to be displayed. HTML tags can be used in the message, but only limited to a restricted set of tags and css, more details can be found [here](api?id=sanitized-html-and-css).
  - **title**: The title of the dialog

**Returns**
* **confirmation**: Boolean. True or false.


**Example**
```javascript
const confirmation = await api.confirm('Do you want to delete these files?')
if(confirmation){
  delete_file()
}
else{
  console.log('User cancelled file deletion.')
}
```
<!--****[TODO] add example **-->

### api.call
```javascript
result = await api.call(plugin_name, plugin_op, arg1, arg2 ...)
```

Calls a function from another plugin.

You can also transfer data. Number of argument number must match the required number
of arguments of the called function.

If you want to call frequently functions of another plugin, we recommend using `api.getPlugin`.

**Arguments**

* **plugin_name**: String. Name of the called plugin.
* **plugin_op**: String. Name of plugin function (op).
* **args** (optional): Any of the supported primitive data types that can be transferred.

**Returns**
* **result**: The result returned from the plugin function if any.

**Example**

To call a function `funcX` defined in the plugin  `PluginX` with the argument `1`, use

```javascript
await api.call("PluginX", "funcX", 1)
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:call&w=examples)


### api.createWindow
```javascript
win = await api.createWindow(config)
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

This difference in behaviour can be explained by the way ImJoy handles the different
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
Run `win.close()` will close the window.


**Arguments**

* **config**. Object (JavaScript) or dictionary (Python). Options for creating window.
It contains the following fields:

  - **name**: String. Specifies the name of new window.
  - **type**: String. Specifies the window type. This can be either the name of
   window plugin or an internal ImJoy window type. The following types are
   supported:

    - `imjoy/image`. Display an image. Requires `data.src` pointing to an image location.
    - `imjoy/image-compare`. Displays two images that can be compared with a slider. Images are passed as `data.first` and `data.second`. See example below.
    - `imjoy/files`. Display a list of files. `data` is an array of file objects.
    - `imjoy/url_list`. Display a list of url rendered with HTML tag `<a> </a>`. `data` is an array of urls.
    - `imjoy/panel`. Render the `ui` string in a `<config>` block. <!--****[TODO] what can you do with this?**-->
    - `imjoy/markdown`. Render some markdown text provided in `data.source`.
    - `imjoy/generic`. Will show all objects in `data`.
    - `imjoy/plugin-editor`. Opens the source code editors. `data.id` is a unique string (preferable random) specifying the window id, `data.code` contains the source code

  - **w**: Integer. Window width in grid columns (1 column = 30 pixels).
  - **h**: Integer. Window height in grid rows (1 row = 30 pixels).
  - **data**: Object (JavaScript) or dictionary (Python). Contains data to be transferred to the window.
  - **config**: Object (JavaScript) or dictionary (Python).

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

Use the returned object to update the window, or use `onClose` to set a callback
function which will be called when the window is closed. Similarly, `onResize` can be used to set callbacks which will be called when the window size is changed.

To close the created window, call `win.close()`.

To scroll to the window in the ImJoy workspace, call `win.focus()`.

Inside the window plugin, `this.close`, `this.onClose`, `this.focus`, `this.resize`, `this.onResize` can be used.

<!-- tabs:start -->

#### ** JavaScript **
```javascript
// win is the object returned from api.createWindow
await win.run({'data': {'image': ...}})

// set `onClose` callback
win.onClose(()=>{
  console.log('closing window.')
})
```

Create a window with two images and a comparison slider.
```python
  api.createWindow({
    name: 'test compare',
    type: 'imjoy/image-compare',
    data: {
      first: '//placehold.it/350x150/0288D1/FFFFFF',
      second: '//placehold.it/350x150/E8117F/FFFFFF'
    }
  })
```

[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:createWindowImgComp&w=examples)

#### ** Python **
```python
# win is the object returned from api.createWindow
# pass as a dictionary
await win.run({'data': {'image': ...}})

# or named arguments
await win.run(data={'image': ...})

# set `onClose` callback
def close_callback():
    print('closing window.')

win.onClose(close_callback)
```
<!-- tabs:end -->


### api.error

```javascript
api.error(message)
```

Log a error message for the current plugin, which is stored in its log history.

The presence of an error message is indicated with a red icon next to
the plugin name. Pressing on this icon will open a window showing the log history.

Similar to `console.error` or `print`, `api.error` can accept multiple arguments, which will be concatenated with a space.

**Arguments**

* **message**: String. Error message to be logged.

**Examples**

```javascript
api.error('Error occurred during processing.')
```


### api.export

Exports funcstions defined by the plugin as `Plugin API`.

`Plugin API` can be exported as a plugin class or an object/dictionary contains all the api functions:

<!-- tabs:start -->
#### ** JavaScript (class) **
```javascript
class ImJoyPlugin(){
  async setup(){
  }
  async run(ctx){
  }
}

api.export(new ImJoyPlugin())
```
#### ** JavaScript (functions) **
```javascript
function setup(){

}

function run(){

}

api.export({setup: setup, run: run})
```

#### ** Python (class) **
```python
class ImJoyPlugin():
    def setup(self):
        pass

    def run(self, ctx):
        pass

api.export(ImJoyPlugin())
```

#### ** Python (functions) **
```python
def setup():
    pass

def run(ctx):
    pass

api.export({'setup': setup, 'run': run})
```
<!-- tabs:end -->

This call is mandatory for every ImJoy plugin (typically as the last line of the plugin script).
Every member of the `ImJoyPlugin` instance will be exported as `Plugin API`, which means those exported functions can be called or used by the ImJoy app or another plugin.
This then allows other plugins to use `api.run` or `api.call` to call functions of the plugin.

Only functions and variables with primitive types can be exported (number, string, boolean).
And if a variable or function has a name start with `_`, it means that's an internal variable or function, will not be exported.

**Note** that in JavaScript, the `new` keyword is necessary to create an
instance of a class, while in Python there is no `new` keyword.


### api.exportFile
```javascript
api.exportFile(file, name)
```

Trigger a download for a file from the browser.

**Arguments**
* **file**: File, Blob or String. The file object to be downloaded.
If a string is passed, it will be wrapped as a text file.

**Returns**
* **name**: String. The file name.

**Examples**

```javascript
var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
api.exportFile(blob, 'hello.txt')
```

### api.fs.* [experimental]
```javascript
api.fs.XXXXX(...)
```

Access the in-browser filesystem with the [Node JS filesystem API](https://nodejs.org/api/fs.html). More details about the underlying implemetation, see [BrowserFS](https://github.com/jvilk/BrowserFS), the default file system in ImJoy supports the following nodes:

 * `/tmp`: `InMemory`, data is stored in browser memory, cleared when ImJoy is closed.

 * `/home`: `IndexedDB`, data is stored in the browser IndexedDB database, can be used as persistent storage.

**Examples**

<!-- tabs:start -->
#### ** JavaScript **
```javascript
api.fs.writeFile('/tmp/temp.txt', 'hello world', function(err, data){
    if (err) {
        console.log(err);
        return
    }
    console.log("Successfully Written to File.");
    api.fs.readFile('/tmp/temp.txt', 'utf8', function (err, data) {
        if (err) {
            console.log(err);
            return
        }
        console.log('Reald from file', data)
    });
});
```
#### ** Python **
```python
def read(err, data=None):
    if err:
        print(err)
        return

    def cb(err, data=None):
        if err:
            print(err)
            return
        api.log(data)
    api.fs.readFile('/tmp/temp.txt', 'utf8', cb)

api.fs.writeFile('/tmp/temp.txt', 'hello world', read)

```
<!-- tabs:end -->


Reading large files chunk-by-chunk in JavaScript:
```javascript
function generate_random_data(size){
    var chars = 'abcdefghijklmnopqrstuvwxyz'.split('');
    var len = chars.length;
    var random_data = [];

    while (size--) {
        random_data.push(chars[Math.random()*len | 0]);
    }

    return random_data.join('');
}

const fs = api.fs
fs.writeFile('/tmp/test.txt', generate_random_data(100000), function(err){
if (err){
    console.error(err);
}
fs.open('/tmp/test.txt', 'r', function(err, fd) {
    fs.fstat(fd, function(err, stats) {
      if(err){
          reject(err)
          return
      }
      var bufferSize = stats.size,
          chunkSize = 512,
          buffer = new Uint8Array(new ArrayBuffer(chunkSize)),
          bytesRead = 0;

      var stopReadding = false
      var readCallback = function(err, bytesRead, read_buffer){
          if(err){
              console.log('err : ' +  err);
              stopReadding = true
              reject(err)
          }
          const bytes = read_buffer.slice(0, bytesRead)
          console.log('new chunk:', bytes)
      };
      while (bytesRead < bufferSize && !stopReadding) {
          if ((bytesRead + chunkSize) > bufferSize) {
              chunkSize = (bufferSize - bytesRead);
          }
          fs.read(fd, buffer, 0, chunkSize, bytesRead, readCallback);
          bytesRead += chunkSize;
      }
      fs.close(fd);
      resolve()
    });
  });
})
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

```html
<attachment name="att_name"></attachment>
```
```javascript
content = await api.getAttachment(att_name)
```

### api.getConfig
```javascript
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

```javascript
sigma = await api.getConfig('sigma')
```
[Try yourself in the setConfig example >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:setConfig&w=examples)

### api.getFileUrl

*** WARNING: `api.getFileUrl` is deprecated since `api_version > 0.6.1`, please use `api.getFileManger` instead.

```python
file_url = await api.getFileUrl(config)
```

Generates an url to access a local file or directory path.

When this function is called, a confirmation dialog will be displayed to obtain the
user's permission. This means a JavaScript plugin cannot access the user's file system without notifying the user.

If a directory is selected, it can be used to access all the files or subfolders contained in the folder.
While this can be used to serve the entire folder, please *BE CAREFUL** when using this feature -- if the root folder or disk is selected, the entire file system will be exposed through the url. If you are running the plugin engine on a public server,  anyone knows the url will be able to access your files.

The optional argument `header` describes how the url will be served. If no header
is specified, the url is specified to be rendered in the browser, and the
`Content-Type` will be guessed from the file name by Python library
[mimetypes](https://docs.python.org/3/library/mimetypes.html). If `mimetypes`
failed to guess a content type, the fallback type will be `application/octet-stream`.
Either behavior can be changed.

**Arguments**
* **config**. Object (JavaScript) or dictionary (Python). Options for getting file URL from a absolute file path.
It contains the following fields:
  - **path**: String. Specifies the absolute file path to be converted.
  - **engine**: String. the url of the plugin engine.
  - **password** (optional): String. Password to access the file or folder
  - **headers** (optional): String. By default, the generated url will be served
    with the header `Content-disposition: inline; filename="XXXXXXXXX.XXX"`
    for rendering in the browser. You can modify this header to create downloadable links,
    or alter how the link is rendered.

**Returns**
* **file_url**: String. File path in url format.

**Examples**

Obtain file url with default settings

```javascript
api.getFileUrl({'path': 'data/output.png', 'engine': 'http://127.0.0.1:9527'})
// will return something like `http://127.0.0.1:9527/file/1ba89354-ae98-457c-a53b-39a4bdd14941/output.png`.
```

Specify password to access file
```javascript
api.getFileUrl({'path': 'data/output.png', 'password': 'SECRET_PASSWORD', 'engine': 'http://127.0.0.1:9527'})
// will return something like `http://127.0.0.1:9527/file/1ba89354-ae98-457c-a53b-39a4bdd14941@SECRET_PASSWORD/output.png`.
```

Specify header to create downloadable link
```javascript
headers={'Content-disposition': 'attachment; filename="XXXXXXXXX.XXX"'}
api.getFileUrl({'path': 'data/output.png', 'headers': headers, 'engine': 'http://127.0.0.1:9527'})
```

Specify header for specific content type
```javascript
headers={'Content-disposition': 'inline; filename="XXXXXXXXX.XXX"', 'Content-Type': 'image/png'}
api.getFileUrl({'path': 'data/output.png', 'headers': headers, 'engine': 'http://127.0.0.1:9527'})
```

### api.getPlugin
```javascript
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

```javascript
pluginX = await api.getPlugin("PluginX")
result = await pluginX.run()

// Assuming that PluginX defined an API function `funcX`, you can access it with:
await pluginX.funcX()
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:getPlugin&w=examples)



### api.getEngine
```javascript
engine = await api.getEngine(engine_url)
```

Gets the API object of an plugin engine.

**Arguments**

* **engine_url**: String. URL of the plugin engine.

**Returns**
* **engine**: Object. An engine object which can be used to access the engine API functions.

**Example**

Get the API of the engine (url = `https://127.0.0.1:2957`), and access its functions:

```javascript
engine = await api.getEngine("https://127.0.0.1:2957")
await engine.disconnect()
```

### api.getEngineFactory
```javascript
engine_factory = await api.getEngineFactory(engine_factory_name)
```

Gets the API object of an plugin engine factory.

**Arguments**

* **engine_factory_name**: String. Name of the plugin engine factory.

**Returns**
* **engine_factory**: Object. An plugin engine factory object which can be used to access the engine API functions.

**Example**

Get the API of the plugin engine factory (name = `ImJoy-Engine`), and access its functions:

```javascript
engine_factory = await api.getEngineFactory("ImJoy-Engine")
await engine_factory.addEngine()
```


### api.getFileManager
```javascript
file_manager = await api.getFileManager(file_manager_url)
```

Gets the API object of an file manager.

Note: since `api_version > 0.6.1`, `api.getFileUrl` and `api.requestUploadUrl` are deprecated, the replacement solution is to use `api.getFileManager` to get the file manager first, and access `getFileUrl` and `requestUploadUrl` from the returned file manager object.

**Arguments**

* **file_manager_url**: String. URL of the file manager.

**Returns**
* **file_manager**: Object. An file manager object which can be used to access the file manager API functions.

**Example**

Get the API of the file manager (url = `https://127.0.0.1:2957`), and access its functions:

```javascript
file_manager = await api.getFileManager("https://127.0.0.1:2957")
await file_manager.listFiles()
```

Get file URL for downloading (replacement of `api.getFileUrl`)
```javascript
file_manager = await api.getFileManager("https://127.0.0.1:2957")
await file_manager.getFileUrl({'path': './data/output.png'})
```

Request file URL for uploading (replacement of `api.requestUploadUrl`)
```javascript
file_manager = await api.getFileManager("https://127.0.0.1:2957")
await file_manager.requestUploadUrl({'path': './data/input.png'})
```

### api.log

```javascript
api.log(message)
```

Log a status message for the current plugin, which is stored in its log history.

The presence of a status message is indicated with a grey icon next to
the plugin name. Pressing on this icon will open a window showing the history of
logged messages.

Status message can either be a string or an image. The latter can be used to create
an automated log, for example, to log the training of a neural network.

Similar to `console.log` or `print`, `api.log` can accept multiple arguments, which will be concatenated with a space.

**Arguments**

* **message**: String. Message to be logged.value

**Examples**

Create a simple text message:
```javascript
api.log('Processing data ...')
```

Log a an image file.
```javascript
api.log({type: 'image', value: 'https://imjoy.io/static/img/imjoy-icon.png' })
```


### api.progress
```javascript
api.progress(progress)
```
Updates the progress bar of the current plugin.

This progress bar will be displayed in the plugin menu itself. Please use
`api.showProgress` to generate a progress bar for the ImJoy status bar.

**Arguments**

* **progress**: Float or Integer. Progress in percentage. Allowed range from 0 to 100 for Integer, or 0 to 1 for float.

**Examples**
```javascript
api.progress(85)
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:progress&w=examples)


### api.register
```javascript
await api.register(config)
```

Register a new plugin operator (**op**) to perform a specific task.

An op can have its own GUI defined by the `ui` string.

By default, all ops of a plugin will call the `run` function of the plugin.
You can use `ctx.config.type` in the `run` function to differentiate which op was called.

Alternatively, you can define another `Plugin API` function in the `run` field.
The function must be a member of the plugin class or being exported (with `api.export`)
as a `Plugin API` function. This is because a arbitrary function transferred by ImJoy will be treated as `callback` function, thus only allowed to run once.

If you want to change your interface dynamically, you can run `api.register`
multiple times to overwrite the previous version. `api.register` can also be used to overwrite the default ui string of the plugin defined in `<config>`, just set the plugin name as the op name (or without setting a name).

**Arguments**

* **config**: Object (JavaScript) or dictionary (Python). Describes the plugin operation.
   Several fields are allowed:
  - `name`: String. Name of op.
  - `ui`: Object (JavaScript) or dictionary (Python). Rendered interface. Defined
       with the same rule as the `ui` field in `<config>`.
  - `run`: Function, optional. Specifies the `Plugin API` function that will run when
      the op is executed. Note that it must be a member of the plugin class or a function being exported with `api.export`. If not specified, the `run` function of the plugin will be executed.
  - `update`: String, optional. Specifies another `Plugin API` function that will run
      whenever any option in the `ui` is changed.
  - `inputs`: Object, optional. A [JSON Schema](https://json-schema.org/) which defines the inputs of this op.
  - `outputs`: Object, optional. A [JSON Schema](https://json-schema.org/) which defines the outputs of this op.

(Please also consult [this section](api?id=input-arguments) for how arguments can be set.)

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

apply_lut(ctx) {
    ...
 };

update_lut(ctx) {
     ...
};

```
[**Try yourself >>**](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:register&w=examples) Compare how the ops for favourite number and animal are implemented.


### api.requestUploadUrl

***WARNING: `api.requestUploadUrl` is deprecated since `api_version > 0.6.1`, please use `api.getFileManger` instead.***

```python
upload_url = await api.requestUploadUrl(config)
```

Generates an url for upload a file to the plugin engine

**Arguments**
* **config**. Object (JavaScript) or dictionary (Python). Options for generating a url for uploading a file.
It contains the following fields:
  - **dir** (optional): String. If specified, `dir` can be used to define the folder which will be used to contain the uploaded file. If relative path is used, then it will relative to the current workspace folder. If not specified, the default value is the current work folder.
  - **path** (optional): String. If specified, it will override the file name.

  - **engine**: String. The engine url of the plugin engine which the file will be uploaded to. For native-python plugin, if not specified, the plugin's current engine will be used. It is required for other plugin types.
  - **overwrite** (optional): String. If the file exists, whether overwrite it. By default, it will raise error if a file already exists.

**Returns**
* **upload_url**: String. an URL for performing upload.

**Examples**

Obtain url with default settings. It will return something like `http://127.0.0.1:9527/upload/1ba89354-ae98-457c-a53b-39a4bdd14941`.

```javascript
const url = await api.requestUploadUrl({'path': 'data/output.png', 'engine': 'http://127.0.0.1:9527'})
```

### api.run
```javascript
await api.run(plugin_name)
```
Run another plugin by specifying its name.

You can also pass [`ctx`](development?id=plugin-during-runtime)
to this plugin to transfer data.

**Arguments**

* **plugin_name**: String. Plugin name.

**Examples**


Example to call one plugin:

```python
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



### api.setConfig
```javascript
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
```javascript
api.setConfig('sigma', 928)
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:setConfig&w=examples)


### api.showDialog
```javascript
answer = await api.showDialog(config)
```

Show a window or customized GUI as a dialog.

Similar to `api.createWindow`, you can pass an object `{"type": "WINDOW_PLUGIN_NAME", "name": "new dialog", "config": {...}, "data": {...}}`. This will show the window plugin instance as a dialog. The dialog can be closed programmatically with `win.close()` or by the user with the close button.

For a simple dialog with joy ui, you can pass `{"type": "joy", "name": "new dialog", "config": {...}, "data": {...}}`. The answer is stored in the returned object, and can be retrieved with the specified `id`. To consider the case when the user presses `cancel`, you can use the `try catch` (JavaScript) or `try except` (Python) syntax.

**Arguments**
* **config**. Object (JavaScript) or dictionary (Python). Specifies the dialog.
    Contains following fields:
    - `name`: String. Title of dialog.
    - `type`: String. Type of the dialog (use the window plugin name or `joy`).

If `type="joy"`, you need to provide `ui` which is defined with the same rule as the `ui` field in `<config>`. Otherwise, you need to provide `config` and `data` as `api.createWindow`.

(Please also consult [this section](api?id=input-arguments) for how arguments can be set.)

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


### api.showFileDialog
```javascript
ret = await api.showFileDialog(config)
```

Shows a file dialog to select files or directories.

The function will return a promise from which you can get the file path string.

Importantly, this api function **works only** if the Python plugin engine is connected,
even if you are using it in JavaScript. The default root directory will be
the current workspace for python plugins, and the home folder for all other plugin
types.

The file handling is different for the ImJoy app and the plugin engine. We recommend
reading the dedicated section in the [user manual](development?id=loading-saving-data) to understand the difference.

Please note that the file-path for a JavaScript plugin is returned as an url, while
for a Python plugin it will be the absolute file-path. The url format is required for
a JavaScript plugin to be able to open a file. You can change this behaviour with the
`uri_type` option (see below). For instance, you can obtain the absolute path also
for a JavaScript plugin. However, you can not use this path to open the file in
JavaScript, but you can pass it to another Python plugin for processing.

**Arguments**

* **config**. Object (JavaScript) or dictionary (Python). Options for showing the file dialog.
It contains the following fields:

  - **type**: String. Supported modes of file dialog:
    - `file` (default): select one or multiple files;
    - `directory`:  select one or multiple directories. For Python plugins, if you don't specify the type, both file or directory can be selected.
  - **title**: String. Title of the dialog.
  - **root**: String. Initial path for the dialog to show. Note: for Python plugins on Windows,
   you may want to define the path string as raw string using `r"xxxxxx"` syntax,
   we have encountered unrecognised path issue with normal strings.
  - **mode**: String. Modes for file selection. By default, the user can select a single or multiple file (with the `shift` key pressed)
    - `single`: only a single file or directory can be selected. <!--**[TODO]** what's returned here?-->
    - `multiple`: multiple files or directories are selected and are returned in an array or list.
    - `single|multiple` (default): both single and multiple selection are allowed. <!--**[TODO]** why this additional option?-->
  - **uri_type**: String. Format of returned file path.
    - `url` (default for JavaScript plugins): <!--**[TODO]**-->
    - `path` (default for Python plugins): <!--**[TODO]**-->
  - **engine**: String. Specify the engine url.

(Please also consult [this section](api?id=input-arguments) for how arguments can be set.)

**Returns**
* **ret**: Object (JavaScript) or dictionary (Python). Contains path or url and engine url as specified by `uri_type`.
  - **path**: String or Array. It will be included for both `uri_type` (`'path'` or `'url'`). If multiple files are selected, it will be an array of paths.
  - **url**: String or Array. Only available for `uri_type = 'url'`. If multiple files are selected, it will be an array of urls.
  - **engine**: String. The engine url selected by the user.

**Examples**

Example will show either the specified file-name or an message that the
user canceled or that the plugin engine was not running.

```javascript

const ret = await api.showFileDialog({root: '/', uri_type: 'url'})
if(ret){
  await api.alert("Selected file " + ret.url)
}
else{
  await api.alert("User cancelled file selection.")
}


```
<!--**[TODO]: update this example to new api**-->
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:showFileDialog&w=examples)


### api.showMessage
```javascript
api.showMessage(message,duration)
```
Updates the status text on the status bar of ImJoy and displays the message with a snackbar.

If duration is not specified, snackbar will be shown for 10s.

**Arguments**

* **message**: String. Message to be displayed.
* **duration** (optional): Integer. Duration in seconds for message to be shown.

**Examples**

```javascript
api.showMessage('Processing...', 5)
```


### api.showProgress
```javascript
api.showProgress(progress)
```
Updates the progress bar on the Imjoy GUI.

**Arguments**

* **progress**: Float or Integer. Progress in percentage. Allowed range from 0 to 100 for integer, or 0 to 1 for float.

**Examples**
```javascript
api.showProgress(85)
```
[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:showProgress&w=examples)

### api.showSnackbar
```javascript
api.showSnackbar(message, duration)
```
Shows a popup message with a snackbar, and disappear in a specific amount of time.

**Arguments**

* **message**: String. Message to be displayed.
* **duration**: Integer. Duration in seconds message will be shown.

**Examples**

```javascript
api.showSnackbar('processing...', 5)
```

[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:showSnackbar&w=examples)

### api.showStatus
```javascript
api.showStatus(status)
```
Updates the status text on the Imjoy GUI.

**Arguments**

* **status**: String. Message to be displayed.

**Examples**

```javascript
api.showStatus('processing...')
```

[Try yourself >>](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:showStatus&w=examples)


### api.TAG constant
The current tag chosen by the user during installation.


### api.unregister
```javascript
await api.unregister(op_name)
```

Unregister an existing operator (**op**).

**Arguments**

* **op_name**: String. The name of the op to be removed.



### api.utils.*
```javascript
await api.utils.UTILITY_NAME()
```

Call utility function.

Currently supported functions for **all plugins** are:
 * `api.utils.$forceUpdate()`: refreshes the GUI manually.
 * `api.utils.openUrl(url)`: opens an `url` in a new browser tab.
 * `api.utils.sleep(duration)`: sleeps for the indicated `duration` in seconds. Note for Python plugins, use `time.sleep` instead.)
 * `api.utils.assert(expression, error_message)`: assert an expression, typically used in a test to make sure a certain condition is met. E.g: `api.utils.assert(v === 98)`

Currently supported functions for **Python plugins** are:
 * `api.utils.kill(subprocess)`: kills a `subprocess` in python.
 * `api.utils.ndarray(numpy_array)`: wrapps a ndarray `numpy_array` according to the ImJoy ndarray format.


### api.WORKSPACE constant
Name of the current workspace.


### api.ENGINE_URL constant
**Only available to native-python plugins**

URL of the current plugin engine.


## Sanitized HTML and CSS

For security reasons, we used [DOMPurify](https://github.com/cure53/DOMPurify) to sanitize the HTML and CSS provided to shown in the ImJoy main interface. For example, all the markdown, `ui` string for `<config>` block and `api.register`, and the content shown in `api.alert`, `api.confirm` and `api.prompt`. 

Also notice that the content shown inside a `window` plugin do not have these restrictions.



