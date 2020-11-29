# I2K Workshop Tutorial

This tutorial is presented as part of the [I2K workshop 2020](https://www.janelia.org/you-janelia/conferences/from-images-to-knowledge-with-imagej-friends)

<img src="https://www.janelia.org/sites/default/files/styles/adaptive/public/You%20%2B%20Janelia/Conferences/social%20card%20I2K.jpg?itok=EKdWiSld" style="width: 50%;"></img>


You can find more details about this tutorial here: [ImJoying Interactive Bioimage Analysis with Deep Learning, ImageJ.JS & Friends](https://www.janelia.org/sites/default/files/You%20%2B%20Janelia/Conferences/10.pdf).


## Recommendations for beginners
This tutorial assumes you have basic programming skills in any of the mainstream programming language including Python, Java, C/C++ and Javascript.

 - Please read and run this tutorial in [Chrome](https://www.google.com/chrome/) or [FireFox](https://www.mozilla.org/en-US/firefox/new/)
 - If you don't know how [Github](https://github.com/join) or git in general works, please take a look at [here](https://guides.github.com/activities/hello-world/).
 -  If you want to use your own GPU workstation, please install [conda](https://docs.conda.io/en/latest/miniconda.html) and [ImJoy-Engine](https://github.com/imjoy-team/imjoy-engine).
 - If you never used HTML/CSS/Javascript:
     - [Basic HTML (14 minutes)](https://www.youtube.com/watch?v=3JluqTojuME)
     - [Basic CSS (16 minutes)](https://www.youtube.com/watch?v=gBi8Obib0tw)
     - [Javascript for Beginners (48 minutes)](https://www.youtube.com/watch?v=W6NZfCO5SIk)
 - If you never used Python:
    - [Python Crash Course For Beginners](https://www.youtube.com/watch?v=JJmcL1N2KQs) (Install [VSCode](https://code.visualstudio.com/) if you want to follow the code examples in the video)

 - If you are not familiar with asynchronous programming, you might find the following tutorial useful:
    - [Callback, Promise and asynchronous programming in Javascript](https://www.youtube.com/watch?v=DwQJ_NPQWWo)
    - [Asynchronous programming in Python](https://www.youtube.com/watch?v=6kNzG0T44SI)

 - Since Remote Procedure Calls is a key technique used in ImJoy, we recommended reading this blog post: [RPCs, Life and All](http://tomerfiliba.com/blog/RPCs-Life-And-All/)


## Getting started

Let's start by introducing you the live execution feature of this tutorial. We have loaded the core of ImJoy into this tutorial such that you can edit or run ImJoy plugin code directly in this page.

### Hello from ImJoy
See the following code block with one line in Javascript, if you click the **Run** button, you should see a popup message saying `Hello from ImJoy!`.
<!-- ImJoyPlugin: {"type": "iframe", "passive": true} -->
```js
alert("Hello from ImJoy!")
```
You can also click the **Edit** button, you should see a code editor. Now you can change `Hello from ImJoy!` to `Hello, <YOUR NAME>`, then click the **Run** button in the toolbar of the code editor


?> If you cannot run see the run button or you don't see the popup message, please check: **1)** Make sure you are reading this tutorial from https://imjoy.io/docs, it won't work if you read directly from Github; **2)** Make sure you use the latest Chrome or FireFox, with javascript enabled.

### Using ImJoy API
The above example uses the native javascript function `alert`, but it only works in ImJoy plugins with `"type": "window"` in Javascript (it won't work for example in plugins written in Python).

?> ImJoy currently support several types of plugins: 1) `window` in HTML/CSS/Javascript for building web UI; 2) `web-worker` in Javascript for browser based computation, runs in a separate thread 3) `web-python` in Python for browser based computation, powered by [WebAssembly](https://webassembly.org/)/[Pyodide](https://github.com/iodide-project/pyodide); 4) `native-python` in Python for heavy computation with local workstations or remote servers. See [here](https://imjoy.io/docs/#/development?id=plugin-types-and-configurations) for more details.

In order to perform basic user interactions, ImJoy provide a set of API which can be used consistently across all the plugin types and supported programming language.

For example, the equivalent ImJoy API function to `alert()` in javascript is `api.alert()`. 

?> You can find detailed description of all the ImJoy API [here](https://imjoy.io/docs/#/api). 

?> You can use `Ctrl+F` or `Command+F` to search api functions in the page. For example, type `api.alert` and you can easily find the definition of `api.alert` [here](https://imjoy.io/docs/#/api?id=apialert). 

?> If you want to share the definition of a specific api function to someone, you can simply click on the function name and copy the url in the address bar (e.g.: https://imjoy.io/docs/#/api?id=apialert).

You can directly access the `api` object in Javascript plugins (with type=`window` or `web-worker`):
<!-- ImJoyPlugin: {"type": "web-worker", "passive": true} -->
```js
api.alert("Hello from ImJoy!")
```


In Python plugins (type=`web-python` or `native-python`), you will need to do `from imjoy import api` before you can access the `api` object.
```python
# import it 
from imjoy import api
...
# use it 
api.alert("Hello from ImJoy!")
```

### ImJoy API functions are remote and asynchronous

Although calling `alert()` and `api.alert()` appears the same, the underlying processes are different. While calling `alert()`, the popup dialog is initiated from the plugin, calling `api.alert()` means the popup dialog is initiated by the ImJoy core.

Keep in mind that ImJoy run each plugin in isolated or sandboxed environment (i.e. sandboxed iframe, webworker, conda virtual environment or docker container). Therefore, calling ImJoy API functions means doing a **Remote Procedure Call (RPC)**. For example, when calling `api.alert()` from a Python plugin in a remote server, the popup dialog will be initiated by the ImJoy core in the user's browser. Even if we call `api.alert()` from a Javascript plugin which will be executed in the same browser as the ImJoy core, we still use the term **Remote Procedure Call (RPC)**. This is because the plugin environments are isolated from each other.

?> Importantly, since every ImJoy API call is remote, they are always asynchronous. In most cases, we should add `await` before the function. This means instead of calling `api.alert`, we should do `await api.alert`. 

### Debugging with Chrome developer tool

The recommended way of running ImJoy API function is to add `await`. However, if you run the following code, nothing will happen because of a syntax error:
<!-- ImJoyPlugin: {"type": "web-worker", "passive": true} -->
```js
await api.alert("Hello from ImJoy!")
```

?> To see the error, you need to open console in the developer tool of your browser. If you are using Chrome browser, you can simply right click in this webpage and choose **Inspect** in the context menu (called **Inspect Element** in Firefox or Safari). Then, click the **Console** tab and you will see the errors in red color. 

Here is an example of the error:
```
pluginIframe.js:194 failed to execute scripts:  {type: "script", content: "↵await api.alert("Hello from ImJoy!")↵", lang: "javascript", attrs: {…}, src: undefined} SyntaxError: await is only valid in async function
    at Connection.execute (pluginIframe.js:159)
    at rpc.js:173
    at Connection._fire (utils.js:167)
    at Connection.handleEvent (pluginIframe.js:73)
```

To fix the error, we need to wrap it in an async function:
<!-- ImJoyPlugin: {"type": "web-worker", "passive": true} -->
```js
async function sayHello(){
    await api.alert("Hello from ImJoy!")
}
sayHello()
```

As another example, we can use another ImJoy API function [`api.prompt`](https://imjoy.io/docs/#/api?id=apiprompt) to get input from the user in a popup dialog and show the message with [`api.showMessage`](https://imjoy.io/docs/#/api?id=apishowmessage).
<!-- ImJoyPlugin: {"type": "web-worker", "passive": true} -->
```js
async function getUserAge(){
    const age = await api.prompt("What is your age?", 10)
    await api.showMessage("You are " + age + " years old.")
}
getUserAge()
```

### Make your first ImJoy plugin

So far, we have been using simplified code snippets for illustration.

Let's first place these functions in a plugin class:
<!-- ImJoyPlugin: {"type": "web-worker"} -->
```js
class ImJoyPlugin{
    async setup(){
    }
    async getUserAge(){
        const age = await api.prompt("What is your age?", 10)
        await api.showMessage("You are " + age + " years old.")
    }
    async run(ctx){
        await this.getUserAge()
    }
}
api.export(new ImJoyPlugin())
```
?> In Javascript, there are different way of writing functions, you can do: 1) `function MyFunction() {...}` 2) `const MyFunction = ()=>{...}` 3) when defining a member function of a class or an object, you can simply do `MyFunction() {...}` (see the example above).

In order to make an full ImJoy plugin, we will need to place the plugin class into a `<script>` tag and set the `lang` property to `javascript`(or `python`). In addition, we also need a `<config>` block to provide meta information:

<!-- ImJoyPlugin: {"startup_mode": "edit"} -->
```html
<config lang="json">
{
  "name": "Untitled Plugin",
  "type": "web-worker",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "cover": "",
  "description": "[TODO: describe this plugin with one sentence.]",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "api_version": "0.1.8",
  "env": "",
  "permissions": [],
  "requirements": [],
  "dependencies": []
}
</config>
<script lang="javascript">
class ImJoyPlugin{
    async setup(){
    }
    async getUserAge(){
        const age = await api.prompt("What is your age?", 10)
        await api.showMessage("You are " + age + " years old.")
    }
    async run(ctx){
        await this.getUserAge()
    }
}
api.export(new ImJoyPlugin())
</script>
```
In the above code editor, you can click **Export** and it will download as an ImJoy plugin file (with extension `*.imjoy.html`).

This plugin file can be used in the standalone ImJoy app: 1) go to https://imjoy.io/#/app 2) drag and drop the downloaded file into the browser.


### Run Python Plugins
<!-- ImJoyPlugin: {"type": "native-python", "name": "my-python-plugin"} -->
```python
from imjoy import api

class ImJoyPlugin():
    async def setup(self):
        pass

    async def getUserAge(self):
        age = await api.prompt("What is your age?", 10)
        await api.showMessage("You are " + age + " years old.")

    async def run(self, ctx):
        await self.getUserAge()

api.export(ImJoyPlugin())
```




<!-- ImJoyPlugin: {"type": "window", "passive": true, "w": 1, "h": 1, "editor_height": "300px"} -->
```html
<script lang="javascript">
window.hello = ()=>{
    api.showMessage('hello')
}
</script>
<window>
    <div>
        <button onclick="hello()">Hello</button>
    </div>
</window>
<style>
    
</style>
```


### 


<!-- ImJoyPlugin: {"type": "web-worker", "hide_code_block": true, "passive": true} -->
<!-- ```js
api.createWindow({src: "https://imjoy.io/#/app?w=i2k", "passive": true})
``` -->



