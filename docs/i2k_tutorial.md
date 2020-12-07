# I2K Workshop Tutorial

This tutorial is presented as part of the [I2K workshop 2020](https://www.janelia.org/you-janelia/conferences/from-images-to-knowledge-with-imagej-friends).

<img src="https://www.janelia.org/sites/default/files/styles/adaptive/public/You%20%2B%20Janelia/Conferences/social%20card%20I2K.jpg?itok=EKdWiSld" style="width: 50%;"></img>


You can find more details about this tutorial here: [ImJoying Interactive Bioimage Analysis with Deep Learning, ImageJ.JS & Friends](https://www.janelia.org/sites/default/files/You%20%2B%20Janelia/Conferences/10.pdf).


## Recommendations for beginners
This tutorial assumes you have basic programming skills in any of the mainstream programming language including Python, Java, C/C++ and Javascript.

 - Please read and run this tutorial in [Chrome](https://www.google.com/chrome/) or [FireFox](https://www.mozilla.org/en-US/firefox/new/).
 - If you don't know how [**Github**](https://github.com/join) or **git** in general work, please take a look [here](https://guides.github.com/activities/hello-world/).
 -  If you want to use **your own GPU workstation**, please install [conda](https://docs.conda.io/en/latest/miniconda.html) and the [ImJoy-Engine](https://github.com/imjoy-team/imjoy-engine).
 - If you never used **HTML/CSS/Javascript**:
     - [Basic HTML (14 minutes)](https://www.youtube.com/watch?v=3JluqTojuME)
     - [Basic CSS (16 minutes)](https://www.youtube.com/watch?v=gBi8Obib0tw)
     - [Javascript for Beginners (48 minutes)](https://www.youtube.com/watch?v=W6NZfCO5SIk)
 - If you never used **Python**:
    - [Python Crash Course For Beginners](https://www.youtube.com/watch?v=JJmcL1N2KQs) (Install [VSCode](https://code.visualstudio.com/) if you want to follow the code examples in the video).

 - If you are not familiar with **asynchronous programming**, you might find the following tutorial useful:
    - [Async + Await in JavaScript, talk from Wes Bos](https://www.youtube.com/watch?v=DwQJ_NPQWWo)
    - [Asynchronous programming in Python](https://www.youtube.com/watch?v=6kNzG0T44SI)

 - Since **Remote Procedure Calls** is a key technique used in ImJoy, this blog post, [RPCs, Life and All](http://tomerfiliba.com/blog/RPCs-Life-And-All/), should give you better idea of the motivation of this type of design choice.

## 1. Understanding key concepts in ImJoy

### Live execution feature
Let's start by introducing the **live execution feature** of this tutorial. We have loaded the ImJoy core into this tutorial such that you can run and edit ImJoy plugin code directly on this page.

### Hello from ImJoy
The following code block contains one line in Javascript. If click the **Run** button, you should see a popup message saying `Hello from ImJoy!`.
<!-- ImJoyPlugin: { "type": "iframe", "editor_height": "200px"} -->
```js
alert("Hello from ImJoy!")
```

You can also click the **Edit** button, you should see a code editor. Now you can change `Hello from ImJoy!` to `Hello, <YOUR NAME>`, then click the **Run** button in the toolbar of the code editor

?> If you cannot see the run button or you don't see the popup message, you can try the following steps: **1)** Make sure you are reading this tutorial from https://imjoy.io/docs, it won't work if you read directly from Github; **2)** Make sure you are using the latest Chrome or FireFox, with Javascript enabled.

### ImJoy plugin types

?> ImJoy currently supports several **plugin types**: 1) `window` in for building web UI with HTML/CSS and Javascript; 2) `web-worker` in Javascript for browser-based computation, runs in a separate thread 3) `web-python` in Python for browser-based computation, powered by [WebAssembly](https://webassembly.org/)/[Pyodide](https://github.com/iodide-project/pyodide); 4) `native-python` in Python for heavy computation with local workstations or remote servers. See [here](https://imjoy.io/docs/#/development?id=plugin-types-and-configurations) for more details.

The above example is a `window` plugin and you can use Javascript/HTML/CSS. To show the popup message we used the native Javascript function `alert`. Please note that this won't work for example in plugins written in Python.

### Using ImJoy API

To permit basic user interactions, ImJoy provides a set of API (application programming interface ) functions which can be used consistently across all plugin types and supported programming language.

For example, the equivalent ImJoy API function to the Javascript function `alert()` is `api.alert()`.

?> You can find detailed description of all ImJoy API functions [here](https://imjoy.io/docs/#/api).

?> You can use `Ctrl+F` or `Command+F` to search api functions on the page. For example, type `api.alert` and you can find the definition of `api.alert` [here](https://imjoy.io/docs/#/api?id=apialert).

?> If you want to share the definition of a specific api function with someone, you can click on the function name and copy the url in the address bar (e.g.: https://imjoy.io/docs/#/api?id=apialert).

You can directly access the `api` object in Javascript plugins (with type=`window` or `web-worker`):
<!-- ImJoyPlugin: { "type": "web-worker","editor_height": "200px"} -->
```js
api.alert("Hello from ImJoy!")
```

In Python plugins (type=`web-python` or `native-python`), you will need to add `from imjoy import api` before you can access the `api` object.

```python
# import api object
from imjoy import api
...
# use api object
api.alert("Hello from ImJoy!")
```

?> In this tutorial we will show ImJoy API usage mostly for Javascript, but the Python code will be similar except some smaller differences in the syntax.

### Remote Procedure Calls in ImJoy

Although calling `alert()` and `api.alert()` produces the same results (a popup message), it is important to understand that the underlying processes are different. When calling `alert()`, the popup dialog is initiated from the plugin directly, while calling `api.alert()` results in the ImJoy core initating the popup dialog.

Keep in mind that ImJoy run each plugin in and isolated or sandboxed environment (i.e. sandboxed iframe, webworker, conda virtual environment or docker container). In short, this means that by default functions and variables are not shared between plugins or with the core.

When calling an ImJoy API function from a plugin, the function will be executed in the ImJoy core. Since the plugin runs in a different environment, all the functions defined in the ImJoy core are "remote" functions. In comparison, all the functions defined in the same plugin are "local".

?> Therefore, calling ImJoy API functions means performing a **Remote Procedure Calls (RPC)**.

?> ImJoy supports bidirectional RPCs, not only between the plugin and the ImJoy core, but also between plugins. This can be consistently done across programming languages and hosting computers.

For example, when calling `api.alert()` from a Python plugin running on a remote server, the popup dialog will be initiated by the ImJoy core in the user's browser (implemented in Javascript). You will also learn later that plugins can call each other via RPC.

?> RPCs allows distribute tasks to different plugins running in different languages and locations. For example, we can build a user interface in Javascript/HTML/CSS with powerful UI libraries (e.g. [D3](https://d3js.org/) and [ITK/VTK Viewer](https://kitware.github.io/itk-vtk-viewer/) ) and run deep learning model in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) in [Tensorflow.js](https://www.tensorflow.org/js). For training models with GPUs, Python plugins can run on Jupyter notebook servers (a.k.a. Plugin Engine) locally or remotely, e.g. on a GPU cluster or lab workstation.

?> This blog post ([RPCs, Life and All](http://tomerfiliba.com/blog/RPCs-Life-And-All/)) explains the idea behind a Python library for remote procedure calls ([RPyC](https://rpyc.readthedocs.io/en/latest/)) which is similar to the one provided in ImJoy.

### ImJoy API functions are asynchronous

Since ImJoy API functions are remote functions, they operate a bit differently from local functions defined in the same plugin. More specifically, remote functions are asynchronous. Let;s not go into explanations why we choose to make them asynchronous or what the actual meaning of asynchronous function.

For now, let's remember the following simplified rule for calling an async function:

?> **All the remote functions in ImJoy are asynchronous. We can use them just like other local functions by add `await` before the function call.** 

This means we should do `await api.alert('hello')` to call the alert function.

If the API function has returned value, for example, [`api.prompt`](https://imjoy.io/docs/#/api?id=apiprompt), we should write: `result = await api.prompt('type a number')`.

### Debugging with Chrome developer tool

The recommended way of running ImJoy API function is to add `await`. However, if you run the following code, nothing will happen because of a syntax error:
<!-- ImJoyPlugin: { "type": "web-worker", "editor_height": "200px"} -->
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

To fix the error, we need to wrap the code in an async function:
<!-- ImJoyPlugin: { "type": "web-worker", "editor_height": "250px"} -->
```js
// async/await example in Javascript
async function sayHello(){
    await api.alert("Hello from ImJoy!")
}
sayHello()
```

Another simple rule for using `async/await` is:

?> **When using `await` in a function, add `async` before the function definition**

As an example, we can use another ImJoy API function [`api.prompt`](https://imjoy.io/docs/#/api?id=apiprompt) to get input from the user in a popup dialog and show the message with [`api.showMessage`](https://imjoy.io/docs/#/api?id=apishowmessage).
<!-- ImJoyPlugin: { "type": "web-worker", "editor_height": "250px"} -->
```js
async function choosePokemon(){
    const pokemon = await api.prompt("What is your favorite Pokémon?", "Pikachu")
    await api.showMessage("Your have chose " + pokemon + " as your Pokémon.")
}
choosePokemon()
```

?> For development in Javascript, you can also use other functions such as `console.log(<ANY OBJECT>)` to print a message or object to the console. you can also insert the keyword `debugger` to your code to instruct the browser to pause the execution when hit the corresponding line.

With the develop tool open, try to run the following code:
<!-- ImJoyPlugin: { "type": "web-worker", "editor_height": "250px"} -->
```javascript
console.log("Hello world!");

const myObj = { firstname : "John", lastname : "Doe" };
console.log(myObj);

debugger

let myArr = ["Orange", "Banana", "Mango", "Kiwi" ];
console.log(myArr);

console.error("this is an error")
```

Code execution will stop at the line wiht `debugger` and you have access the the debugging tools provided by your browser.

### Async/Await in Python

The `async/await` syntax is similar in Python. For example:

```python
# async/await example in Python
async def say_hello():
    await api.alert("Hello from ImJoy!")
```

!> ~~**For Python plugin with type=`web-python`, we have no support for `async/await` yet. We are current waiting for the [asyncio support](https://github.com/iodide-project/pyodide/issues/245) in the Pyodide project.** For now, you have to switch the type to `native-python` or use callback style (see below) in `web-python` plugins.~~ Update: `async/await` syntax is supported after PR [imjoy-team/imjoy-core#91](https://github.com/imjoy-team/imjoy-core/pull/91).

!> When using asyncio in Python, a good practice is to avoid running heavy computation directly in the main thread, instead, you can [use executors](https://pymotw.com/3/asyncio/executors.html) (Threads and Processes). You can also use the default thread executor by doing: `loop.run_in_executor(None, my_heavy_computation, arg1, arg2...)`.

#### Callback, Promise and Async/Await

Now let's go back to understand a bit more about asynchronous programming.

As we mentioned that one advantage of distributing tasks to different plugins via RPC is that we can **schedule and run tasks in parallel**. Conventionally, there are many other techniques to achieve concurrency including parallelization with multiple threads or processes in Python, Java and many other programming languages. Asynchronous programming is an increasingly popular way of achieving concurrency in a more scalable fashion.

The basic idea is that we don't have to always wait for one task to finish until we can move to the next. For example, you go to a coffee shop, order a cup of cappuccino and get a ticket, while the coffee is in the making, you can make a phone call or read a newspaper. After some minutes, you can get your cappuccino by showing your ticket number.

?> One big difference between asynchronous programming and other techniques such as multi-threading is that the program runs in one thread and process. Therefore, in ImJoy, asynchronous programming is often used to schedule tasks to other plugins, rather than run heavy computation tasks in parallel within the same plugin.

`async/await` is not the only way to do asynchronous programming, in fact, it becomes more popular only in recent years. For example, Python introduced it only after Python 3. To really appreciate `async/await` as a life-saver programming pattern, you can watch this video: [Async + Await in JavaScript, talk from Wes Bos](https://www.youtube.com/watch?v=DwQJ_NPQWWo). It covers **callback style**, **promise style** and **async/await** style.

### Combining RPC with Async/Await

?> Another way to see `await` and async functions is: 1) async function will return immediately once called 2) the returned the object is not the actual result, but a special object called `Promise` in Javascript or `Future` in Python. Intuitively, it's like the ticket you get after ordering a coffee. 3) if you apply `await` to the `Promise` or `Future` object, you will get the actual result.

See two equivalent async functions below:

```js
async function choosePokemon1(){
    // apply await directly and we will get the actual result
    const pokemon = await api.prompt("What is your favorite Pokémon?", "Pikachu")
    return pokemon
}

async function choosePokemon2(){
    // if we don't use `await`, we get a promise to the actual result
    const promise = api.prompt("What is your favorite Pokémon?", "Pikachu")
    // to retrieve the actual result, apply await to the promise
    const pokemon = await promise
    return pokemon
}
```

While the above example is in Javascript, you can also do the same in Python.

?> Simply applying `await` for all the async functions will result in sequential execution. To run tasks in parallel, we can call functions without immediately applying `await`, instead we can first collect all the `Promise` objects, then wait them all together.

Lets assume we have taskA (takes 10 minutes), taskB (takes 5 minutes) and taskC (takes 3 minutes), we want to use the results returned from A and B in order to complete task C. Here are different ways of implementation:

1. Apply `await` to before all the function takes 18(`10+5+3`) minutes

    ```js
    function doTasks(){
        // do task B after A
        const resultA = await doTaskA() // takes 10 minutes
        const resultB = await doTaskB() // takes 5 minutes
        return await doTaskC(resultA, resultB) // takes 3 minutes
    }
    ```

2. Schedule the two tasks then `await` for both, takes 13 (`max(10, 5) + 3`) minutes.

    In Javascript, we can use `Promise.all` to combine two promises into one:

    ```js
    async function doTasks(){
        // run task A and B in parallel
        const promiseA = doTaskA()
        const promiseB = doTaskB()
        // collect the result
        const [resultA, resultB] = await Promise.all([promiseA, promiseB])
        return await doTaskC(resultA, resultB)
    }
    ```

    In Python, we can use `asyncio.gather` to combine two promises:

    ```python
    import asyncio
    async def doTasks():
        # run task A and B in parallel
        promiseA = doTaskA()
        promiseB = doTaskB()
        # collect the result
        [resultA, resultB] = await asyncio.gather(promiseA, promiseB)
        return await doTaskC(resultA, resultB)
    ```

### Open integration with ImJoy

The ImJoy plugin ecosystem is designed to be **open in two ways**: 1) other software tools and website should be able to easily use ImJoy and its plugins 2) other software tools should be easily used in ImJoy, typically as a plugin.

In general, any software that **uses the ImJoy RPC protocol** to expose service functions can be treated as an ImJoy plugin. This includes the ImJoy web app itself which can read plugin files and produces plugin API. Meanwhile, we provide the [imjoy-rpc](https://github.com/imjoy-team/imjoy-rpc) library which currently support Python and Javascirpt for other software or web applications to directly communicate with the ImJoy core.

There are already several **web applications that can run in standalone mode but also as an ImJoy plugin**: 

- [ITK/VTK Viewer](https://kitware.github.io/itk-vtk-viewer/docs/imjoy.html) by [Matt McCormick](https://github.com/thewtex) et al.
- [vizarr](https://github.com/hms-dbmi/vizarr) by [Trevor Manz](https://github.com/manzt) et al.
- [Kaibu](https://kaibu.org/#/app) by the ImJoy Team.
- [ImageJ.JS](https://ij.imjoy.io) by the ImJoy Team.

For example, the [ITK/VTK Viewer](https://kitware.github.io/itk-vtk-viewer/docs/imjoy.html) is an open-source software system for medical and scientific image, mesh, and point set visualization. While it can run [as a standalone app](https://kitware.github.io/itk-vtk-viewer/app/?fileToLoad=https://data.kitware.com/api/v1/file/564a65d58d777f7522dbfb61/download/data.nrrd), it can also run [as an ImJoy plugin](https://kitware.github.io/itk-vtk-viewer/docs/imjoy.html). You can try the viewer by clicking the **Run** button below. By clicking anywhere in the window, you can use it to visualize your local files (e.g.: [download example file](https://data.kitware.com/api/v1/file/564a65d58d777f7522dbfb61/download/data.nrrd)):
<!-- ImJoyPlugin: { "type": "web-worker", "hide_code_block": true} -->
```js
api.showDialog({src: "https://kitware.github.io/itk-vtk-viewer/app/", name: "ITK/VTK Viewer"})
```

This is another example for the [vizarr](https://hms-dbmi.github.io/vizarr) which is a WebGL-based viewer for visualizing Zarr-based images (The Zarr format is used for storage of chunked, compressed, N-dimensional arrays). We load it as an ImJoy plugin and call its `add_image` api function to visualize ome-zarr HCS data (a new feature implemented by [Will Moore](https://github.com/will-moore) recently).
<!-- ImJoyPlugin: { "type": "web-worker", "hide_code_block": true} -->
```js
api.showDialog({src: "https://hms-dbmi.github.io/vizarr", name: "visualizating HCS zarr images with vizarr"}).then((viewer)=>{
    viewer.add_image({source: "https://minio-dev.openmicroscopy.org/idr/idr0001-graml-sysgro/JL_120731_S6A/pr_45/2551.zarr", name: "Demo Image"})
})
```

[ImageJ.JS](https://ij.imjoy.io) is a standalone web app that supports ImJoy in two ways: 1) most plugins can run direclty in ImageJ.JS; 2) ImageJ.JS can be used as a plugin via its URL.

See the [project repo](https://github.com/imjoy-team/imagej.js) for more details.

As an exercise, you can load your image viewer plugin into ImageJ.JS by clicking the ImJoy icon, then choose load plugin and paste your plugin URL on Github/Gist.

<!-- ImJoyPlugin: { "type": "web-worker", "hide_code_block": true} -->
```js
api.showDialog({src: "https://ij.imjoy.io/", name: "ImageJ.JS"})
```

?> While standalone web applications are more powerful, building them requires more advanced tooling and higher-level programming skills. For beginners, using basic imjoy plugin files can already solve many tasks. Therefore, in this tutorial, let's first focus on how to make basic ImJoy plugins.

## 2. Make your first ImJoy plugin

With these key concepts established, we can proceed to build actual ImJoy plugins.

We have been already mentioning different types of plugins in the previous section without defining what is an ImJoy plugin. 

### What is an ImJoy plugin

?> In a nutshell, an ImJoy plugin is a script that produce a set of service functions (a.k.a plugin API functions) that can be called by the ImJoy core or other plugins. While loading the plugin, an `api` object containing all ImJoy API functions will be passed to the the plugin, the plugin can then build the service functions and register them via a `api.export(...)` function call.

?> There are currently 4 common plugin types: `window`, `web-worker`, `web-python`, `native-python`. Plugin types can be further extended with plugins. For example, we can make a new plugin type for executing Fiji/Scijava scripts, see [this post](https://forum.image.sc/t/making-imjoy-plugins-with-fiji-scripts-for-running-remotely/39503).

?> Most plugins will at least export two special functions named `setup` (for initialization ) and `run` (called when user click the plugin menu button).

For example, the following script block defines 3 plugin API functions: an empty `setup` function, the same `choosePokemon` function we wrote previously, and a `run` function which can be called (by the ImJoy core or the user when clicking the plugin menu):
<!-- ImJoyPlugin: { "type": "web-worker", "editor_height": "400px"} -->
```js
class ImJoyPlugin{
    async setup(){
    }
    async choosePokemon(){
        const pokemon = await api.prompt("What is your favorite Pokémon?", "Pikachu")
        await api.showMessage("Your have chose " + pokemon + " as your Pokémon.")
    }
    async run(ctx){
        await this.choosePokemon()
    }
}
api.export(new ImJoyPlugin())
```

?> In Javascript, there are different ways of writing functions, you can do: 1) `function MyFunction() {...}`. 2) `const MyFunction = ()=>{...}`. 3) when defining a member function of a class or an object, you can simply do `MyFunction() {...}` (see the example above).

### ImJoy plugin file format

An ImJoy plugin is typically a text file with the extension `*.imjoy.html`. We use HTML/XML tags such as `<config>`, `<script>`, `<window>` to store code blocks. 

?> Most plugin types requires at least two code blocks: `<config>` and `<script>`, for example `web-worker`, `web-python` and `native-python`. For `window` plugin, another `<window>` block is required for the HTML code, as well as an optional `<style>` block for CSS code. Detailed description about ImJoy plugin file can be found here: [plugin file format](https://imjoy.io/docs/#/development?id=plugin-file-format).

### Your first ImJoy plugin
<!-- ImJoyPlugin: {} -->
```html
<config lang="json">
{
  "name": "Pokémon Chooser",
  "type": "web-worker",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "cover": "",
  "description": "This is a demo plugin for choosing Pokémons",
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
        await api.log("plugin initialized")
    }
    async choosePokemon(){
        const pokemon = await api.prompt("What is your favorite Pokémon?", "Pikachu")
        await api.showMessage("Your have chose " + pokemon + " as your Pokémon.")
    }
    async run(ctx){
        await this.choosePokemon()
    }
}
api.export(new ImJoyPlugin())
</script>
```

To obtain the plugin file from the code above, click on `Edit` and then press the `Export` button. This code will then download as an ImJoy plugin file (with the extension `*.imjoy.html`). This plugin file can be used in the standalone ImJoy app: 1) go to https://imjoy.io/#/app 2) drag and drop the downloaded file into the browser.

### Deploy and share your plugin

If you want to share your plugin with others, you can either send directly the plugin file, or upload your plugins to Github/Gist. The later is recommended if you want to publish your plugins and share with the rest of the world.

You can [fork the imjoy-starter repo](https://github.com/imjoy-team/imjoy-starter/fork) (or create an empty one if you prefer) on Github.

?> The imjoy-starter repo contains a [docs folder](https://github.com/imjoy-team/imjoy-starter/tree/master/docs) which you can take notes in markdown and it will rendered as an interactive web site like this: https://imjoy-team.github.io/imjoy-starter/. For more information see [**here**](https://docsify.js.org/#/). You can add your plugin code with some special markup in the markdown, you can then see the **Run** and **Edit** button.

Now you can name your plugin as, for example, `PokemonChooser.imjoy.html` and upload it to the `plugins` folder of your forked repo by using git commands or upload directly to the repo. You can organize upload the plugin file in any kind of folder organization.

After that, you can click the plugin file and copy the url in your address bar, it should be something like: `https://github.com/<YOUR-GITHUB-USERNAME>/imjoy-starter/blob/master/plugins/PokemonChooser.imjoy.html`

This URL can be used to install plugins in ImJoy, you can click **Run** to open the ImJoy app. To install the plugin, click `+PLUGINS` and paste the URL to the `Install from URL` input box and press Enter.

<!-- ImJoyPlugin: { "type": "web-worker", "hide_code_block": true} -->
```js
api.showDialog({src: "https://imjoy.io/#/app?w=i2k", passive: true, fullscreen: true})
```

Now you can construct an URL for sharing with others, just add the URL after `https://imjoy.io/#/app?plugin=` so it becomes something like: `https://imjoy.io/#/app?plugin=https://github.com/<YOUR-GITHUB-USERNAME>/imjoy-starter/blob/master/plugins/PokemonChooser.imjoy.html`.

If a user click your plugin URL, it will open the plugin directly in ImJoy and ask the user to install it.

## 3. Build web-based plugins for image analysis

In this section, let's start by making a interactive plugins for image analysis.

?> A typical plugin design pattern in ImJoy is to separate a tool into a computational part and the UI part (either build a plugin or reuse existing ones).

### Make GUI plugins with HTML/CSS/JS

Let's first look into how to use HTM/CSS/JS to build a simple interface that reads a local image file and displays it.

We will use the `<input>` tag for selecting the file and use its `change` event to trigger a display function. In the display function, we can use `<canvas>` tag to display the image.

See the code below:

<!-- ImJoyPlugin: {"fold": [0, 21, 39], "editor_height": "500px"} -->
```html
<config lang="json">
{
  "name": "Image Viewer",
  "type": "window",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "cover": "",
  "description": "This is a demo plugin for displaying image",
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
// draw a base64 encoded image to the canvas
const drawImage = (canvas, base64Image)=>{
    return new Promise((resolve, reject)=>{
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = function(){
            const ctx = canvas.getContext("2d");
            canvas.width = Math.min(this.width, 512);
            canvas.height= Math.min(this.height, parseInt(512*this.height/this.width), 1024);
            // draw the img into canvas
            ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
        }
        img.onerror = reject;
        img.src = base64Image;
    })
}

// read the file and return as a base64 string
const readImageFile = (file)=>{
    return new Promise((resolve, reject)=>{
        const U = window.URL || window.webkitURL;
        // this works for safari
        if(U.createObjectURL){
            resolve(U.createObjectURL(file))
        }
        // fallback
        else{
            const fr = new FileReader();
            // when image is loaded, set the src of the image where you want to display it
            fr.onload = function(e) {
                resolve(e.target.result)
            };
            fr.onerror = reject
            // fill fr with image data
            fr.readAsDataURL(file);
        }
    })
}

class ImJoyPlugin{
    async setup(){
         // Display image when a file is selected.
        const fileInput = document.getElementById("file-input");
        const canvas = document.getElementById("input-canvas");
        fileInput.addEventListener("change", async ()=>{
            const img = await readImageFile(fileInput.files[0]);
            await drawImage(canvas, img);
        }, true);
        await api.log("plugin initialized")
    }
    async run(ctx){

    }
}
api.export(new ImJoyPlugin())
</script>
<window>
    <div>
        <h1>Please open an image (jpg/png/gif)</h1>
        <input  id="file-input" accept="image/*" capture="camera" type="file"/>
        <canvas id="input-canvas" style="width: 100%; object-fit: cover;"></canvas>
    </div>
</window>
<style>
    
</style>
```

As an exercise, you can try to add a `<button>` which will trigger the open file dialog so we can use the button to select the file. (Why we want to do that? Because we can later customize the appearance of the button easily.)

You edit the code above by doing:

 1. Below the `<input>` tag, add a line: `<button id="select-button">Open an image</button>`
 2. In the `setup` function, add:

    ```js
    // trigger the file dialog when the button is clicked
    const selectButton = document.getElementById("select-button");
    selectButton.addEventListener("click", async ()=>{
        // simulate a click on the <input> tag
        fileInput.click()
    }, true);
    ```

 3. now we can hide the `<input>` element by add a css style in the `<style>` block:

   ```css
   #file-input{
       display: none;
   }
   ```

4. Optionally, you can change the style of title text, by adding more css:

   ```css
   h1{
       color: pink;
   }
   ```

Please try it yourself in the editor above, and you can click "Show Source Code" below to see the reference implementation:

<!-- ImJoyPlugin: {"hide_code_block": true, "fold": [0, 21, 39], "editor_height": "500px"} -->
```html
<config lang="json">
{
  "name": "Image Viewer",
  "type": "window",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "cover": "",
  "description": "This is a demo plugin for displaying image",
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
// draw a base64 encoded image to the canvas
const drawImage = (canvas, base64Image)=>{
    return new Promise((resolve, reject)=>{
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = function(){
            const ctx = canvas.getContext("2d");
            canvas.width = Math.min(this.width, 512);
            canvas.height= Math.min(this.height, parseInt(512*this.height/this.width), 1024);
            // draw the img into canvas
            ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
        }
        img.onerror = reject;
        img.src = base64Image;
    })
}

// read the file and return as a base64 string
const readImageFile = (file)=>{
    return new Promise((resolve, reject)=>{
        const U = window.URL || window.webkitURL;
        // this works for safari
        if(U.createObjectURL){
            resolve(U.createObjectURL(file))
        }
        // fallback
        else{
            const fr = new FileReader();
            // when image is loaded, set the src of the image where you want to display it
            fr.onload = function(e) {
                resolve(e.target.result)
            };
            fr.onerror = reject
            // fill fr with image data
            fr.readAsDataURL(file);
        }
    })
}

class ImJoyPlugin{
    async setup(){
         // Display image when a file is selected.
        const fileInput = document.getElementById("file-input");
        const canvas = document.getElementById("input-canvas");
        fileInput.addEventListener("change", async ()=>{
            const img = await readImageFile(fileInput.files[0]);
            await drawImage(canvas, img);
        }, true);
        // trigger the file dialog when the button is clicked
        const selectButton = document.getElementById("select-button");
        selectButton.addEventListener("click", async ()=>{
            // simulate a click on the <input> tag
            fileInput.click()
        }, true);
        await api.log("plugin initialized")
    }
    async run(ctx){

    }
}
api.export(new ImJoyPlugin())
</script>
<window>
    <div>
        <h1>Please Open an image (jpg/png/gif)</h1>
        <input  id="file-input" accept="image/*" capture="camera" type="file"/>
        <button id="select-button">Open an image</button>
        <canvas id="input-canvas" style="width: 100%; object-fit: cover;"></canvas>
    </div>
</window>
<style>
#file-input{
    display: none;
}
h1 {
    color: pink;
}
</style>
```

### Using a CSS library

Handcrafting CSS style is time consuming and requires deep understanding of UI design principle and CSS itself.
Luckly there is already so many UI libraries ([Bootstrap](https://getbootstrap.com/), [https://materializecss.com/](https://materializecss.com/) etc.) which we can just use. There are also more powerful js libraries and framework for build more professional UI, for example: [React](https://reactjs.org/), [Vuejs](https://vuejs.org/) and [Angular](https://angular.io/). In this tutorial, we will choose a small CSS called [**Bulma**](https://bulma.io/) for the purpose of illustration, but feel free to try other libraries or framework if you are interested.

Let's first take a look at the documentation of Bulma [here](https://bulma.io/documentation/overview/start/). We basically need to load one CSS file.

?> In ImJoy plugins, the way to load third-party CSS or Javascript libraries is to add the url to the `requirements`(a list) field in the `<config>` block.

Therefore we will change the `requirements` to:

```json
{
    ...
    "requirements": ["https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css"],
}
```

Now we read a bit further on how to use the style, Bulma support a large number of different elements and layouts in the documentation, you can read about buttons [here](https://bulma.io/documentation/elements/button/).

Basically, we just need to add a class(e.g. `class="button is-primary"`) to the button tag and it will change how it looks. Similarly, we can also add `class="title"` to the `<h1>` title.

Please try it yourself, and you can take the code block below as reference:
<!-- ImJoyPlugin: {"hide_code_block": true, "fold": [21, 39, 61], "editor_height": "500px"} -->
```html
<config lang="json">
{
  "name": "Image Viewer",
  "type": "window",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "cover": "",
  "description": "This is a demo plugin for displaying image",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "api_version": "0.1.8",
  "env": "",
  "permissions": [],
  "requirements": ["https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css"],
  "dependencies": []
}
</config>
<script lang="javascript">
// draw a base64 encoded image to the canvas
const drawImage = (canvas, base64Image)=>{
    return new Promise((resolve, reject)=>{
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = function(){
            const ctx = canvas.getContext("2d");
            canvas.width = Math.min(this.width, 512);
            canvas.height= Math.min(this.height, parseInt(512*this.height/this.width), 1024);
            // draw the img into canvas
            ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
        }
        img.onerror = reject;
        img.src = base64Image;
    })
}

// read the file and return as a base64 string
const readImageFile = (file)=>{
    return new Promise((resolve, reject)=>{
        const U = window.URL || window.webkitURL;
        // this works for safari
        if(U.createObjectURL){
            resolve(U.createObjectURL(file))
        }
        // fallback
        else{
            const fr = new FileReader();
            // when image is loaded, set the src of the image where you want to display it
            fr.onload = function(e) {
                resolve(e.target.result)
            };
            fr.onerror = reject
            // fill fr with image data
            fr.readAsDataURL(file);
        }
    })
}

class ImJoyPlugin{
    async setup(){
         // Display image when a file is selected.
        const fileInput = document.getElementById("file-input");
        const canvas = document.getElementById("input-canvas");
        fileInput.addEventListener("change", async ()=>{
            const img = await readImageFile(fileInput.files[0]);
            await drawImage(canvas, img);
        }, true);
        // trigger the file dialog when the button is clicked
        const selectButton = document.getElementById("select-button");
        selectButton.addEventListener("click", async ()=>{
            // simulate a click on the <input> tag
            fileInput.click()
        }, true);
        await api.log("plugin initialized")
    }
    async run(ctx){

    }
}
api.export(new ImJoyPlugin())
</script>
<window>
    <div>
        <h1 class="title">Please Open an image (jpg/png/gif)</h1>
        <input  id="file-input" accept="image/*" capture="camera" type="file"/>
        <button id="select-button" class="button is-primary">Open an image</button>
        <canvas id="input-canvas" style="width: 100%; object-fit: cover;"></canvas>
    </div>
</window>
<style>
#file-input{
    display: none;
}
</style>
```

As another exercise, you can try to use a [panel](https://bulma.io/documentation/components/panel/) to group the `button` and `<canvas>`.

?> To use icons in Bulma, we need to add `https://use.fontawesome.com/releases/v5.14.0/js/all.js` the `requirements`. Then search the icons from [here](https://fontawesome.com/icons). For example, if you find an icon named `eye`, you can use add the icon to your html as `<i class="fas fa-eye"></i>`.

Please try it yourself, and you can take the code block below as reference:
<!-- ImJoyPlugin: {"hide_code_block": true, "fold": [21, 39, 61], "editor_height": "500px"} -->
```html
<config lang="json">
{
  "name": "Image Viewer",
  "type": "window",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "cover": "",
  "description": "This is a demo plugin for displaying image",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "api_version": "0.1.8",
  "env": "",
  "permissions": [],
  "requirements": ["https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css", "https://use.fontawesome.com/releases/v5.14.0/js/all.js"],
  "dependencies": []
}
</config>
<script lang="javascript">
// draw a base64 encoded image to the canvas
const drawImage = (canvas, base64Image)=>{
    return new Promise((resolve, reject)=>{
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = function(){
            const ctx = canvas.getContext("2d");
            canvas.width = Math.min(this.width, 512);
            canvas.height= Math.min(this.height, parseInt(512*this.height/this.width), 1024);
            // draw the img into canvas
            ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
        }
        img.onerror = reject;
        img.src = base64Image;
    })
}

// read the file and return as a base64 string
const readImageFile = (file)=>{
    return new Promise((resolve, reject)=>{
        const U = window.URL || window.webkitURL;
        // this works for safari
        if(U.createObjectURL){
            resolve(U.createObjectURL(file))
        }
        // fallback
        else{
            const fr = new FileReader();
            // when image is loaded, set the src of the image where you want to display it
            fr.onload = function(e) {
                resolve(e.target.result)
            };
            fr.onerror = reject
            // fill fr with image data
            fr.readAsDataURL(file);
        }
    })
}

class ImJoyPlugin{
    async setup(){
         // Display image when a file is selected.
        const fileInput = document.getElementById("file-input");
        const canvas = document.getElementById("input-canvas");
        fileInput.addEventListener("change", async ()=>{
            const img = await readImageFile(fileInput.files[0]);
            await drawImage(canvas, img);
        }, true);
        // trigger the file dialog when the button is clicked
        const selectButton = document.getElementById("select-button");
        selectButton.addEventListener("click", async ()=>{
            // simulate a click on the <input> tag
            fileInput.click()
        }, true);
        await api.log("plugin initialized")
    }
    async run(ctx){

    }
}
api.export(new ImJoyPlugin())
</script>
<window>
    <div>
        <input  id="file-input" accept="image/*" capture="camera" type="file"/>
        <nav class="panel">
        <p class="panel-heading">
            <i class="fas fa-eye" aria-hidden="true"></i> My Image Viewer
        </p>
        <div class="panel-block">
            <button id="select-button" class="button is-link is-outlined is-fullwidth">
            Open an image
            </button>
        </div>
        <div class="panel-block">
            <canvas id="input-canvas" style="width: 100%; object-fit: cover;"></canvas>
        </div> 
    </div>
</window>
<style>
#file-input{
    display: none;
}
</style>
```

### Support TIFF format

TIFF is one of the most common file formats for bioimages, so let's support reading tiff file.

We will use an existing ImJoy plugin called "Tif File Importer", the source code is [here](https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/tifFileImporter.imjoy.html).

We can now add it as part of the `dependencies` under `<config>`:

```json
{
    ...
    "dependencies": ["https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/tifFileImporter.imjoy.html"]
}
```

Instead of using this long url, you can also use the shorter plugin URI format: `imjoy-team/imjoy-plugins:Tif File Importer`.

?> To support short plugin URI format, the git repository should contain a file named `manifest.imjoy.json` with the mapping of plugin names to its actual file path in the repository. For example: [imjoy-team/imjoy-plugins](https://github.com/imjoy-team/imjoy-plugins/blob/master/manifest.imjoy.json)

Now we can use the plugin api functions (`open`, `readAsURL`) like this:

```js
const file = fileInput.files[0]
const p = await api.getPlugin('Tif File Importer')
const tiffObj = await p.open(file)
// locate the first frame
tiffObj.seek(0)
const img = await tiffObj.readAsURL()
```

Please try it yourself and use the following code block as reference:
<!-- ImJoyPlugin: {"hide_code_block": true, "fold": [21, 39, 61], "editor_height": "500px"} -->
```html
<config lang="json">
{
  "name": "Image Viewer",
  "type": "window",
  "tags": [],
  "ui": "",
  "version": "0.1.2",
  "cover": "",
  "description": "This is a demo plugin for displaying image",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "api_version": "0.1.8",
  "env": "",
  "permissions": [],
  "requirements": ["https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css", "https://use.fontawesome.com/releases/v5.14.0/js/all.js"],
  "dependencies": ["https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/tifFileImporter.imjoy.html"]
}
</config>
<script lang="javascript">
// draw a base64 encoded image to the canvas
const drawImage = (canvas, base64Image)=>{
    return new Promise((resolve, reject)=>{
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = function(){
            const ctx = canvas.getContext("2d");
            canvas.width = Math.min(this.width, 512);
            canvas.height= Math.min(this.height, parseInt(512*this.height/this.width), 1024);
            // draw the img into canvas
            ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
        }
        img.onerror = reject;
        img.src = base64Image;
    })
}

// read the file and return as a base64 string
const readImageFile = (file)=>{
    return new Promise((resolve, reject)=>{
        const U = window.URL || window.webkitURL;
        // this works for safari
        if(U.createObjectURL){
            resolve(U.createObjectURL(file))
        }
        // fallback
        else{
            const fr = new FileReader();
            // when image is loaded, set the src of the image where you want to display it
            fr.onload = function(e) {
                resolve(e.target.result)
            };
            fr.onerror = reject
            // fill fr with image data
            fr.readAsDataURL(file);
        }
    })
}

class ImJoyPlugin{
    async setup(){
         // Display image when a file is selected.
        const fileInput = document.getElementById("file-input");
        const canvas = document.getElementById("input-canvas");
        fileInput.addEventListener("change", async ()=>{
            const file = fileInput.files[0]
            let img;
            if(file.name.endsWith('.tiff') || file.name.endsWith('.tif')){
              const p = await api.getPlugin('Tif File Importer')
              const tiffObj = await p.open(file)
              // TODO: we can add a slider to browse through other tiff pages
              // For now let's only show the first page
              tiffObj.seek(0)
              img = await tiffObj.readAsURL()
            }
            else{
              img = await readImageFile(file);
            }
            await drawImage(canvas, img);
        }, true);
        // trigger the file dialog when the button is clicked
        const selectButton = document.getElementById("select-button");
        selectButton.addEventListener("click", async ()=>{
            // simulate a click on the <input> tag
            fileInput.click()
        }, true);
        await api.log("plugin initialized")
    }
    async run(ctx){

    }
}
api.export(new ImJoyPlugin())
</script>
<window>
    <div>
        <input  id="file-input" accept="image/*" capture="camera" type="file"/>
        <nav class="panel">
        <p class="panel-heading">
            <i class="fas fa-eye" aria-hidden="true"></i> My Image Viewer
        </p>
        <div class="panel-block">
            <button id="select-button" class="button is-link is-outlined is-fullwidth">
            Open an image
            </button>
        </div>
        <div class="panel-block">
            <canvas id="input-canvas" style="width: 100%; object-fit: cover;"></canvas>
        </div> 
    </div>
</window>
<style>
#file-input{
    display: none;
}
</style>
```

?> Exercise option 1, you can try to also add a slider to show other pages of a multi-tiff files.

<!-- ImJoyPlugin: {"hide_code_block": true, "fold": [21, 39, 61], "editor_height": "500px"} -->
```html
<config lang="json">
{
  "name": "Image Viewer",
  "type": "window",
  "tags": [],
  "ui": "",
  "version": "0.1.3",
  "cover": "",
  "description": "This is a demo plugin for displaying image",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "api_version": "0.1.8",
  "env": "",
  "permissions": [],
  "requirements": ["https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css", "https://use.fontawesome.com/releases/v5.14.0/js/all.js"],
  "dependencies": ["https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/tifFileImporter.imjoy.html"]
}
</config>
<script lang="javascript">
// draw a base64 encoded image to the canvas
const drawImage = (canvas, base64Image)=>{
    return new Promise((resolve, reject)=>{
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = function(){
            const ctx = canvas.getContext("2d");
            canvas.width = Math.min(this.width, 512);
            canvas.height= Math.min(this.height, parseInt(512*this.height/this.width), 1024);
            // draw the img into canvas
            ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
        }
        img.onerror = reject;
        img.src = base64Image;
    })
}

// read the file and return as a base64 string
const readImageFile = (file)=>{
    return new Promise((resolve, reject)=>{
        const U = window.URL || window.webkitURL;
        // this works for safari
        if(U.createObjectURL){
            resolve(U.createObjectURL(file))
        }
        // fallback
        else{
            const fr = new FileReader();
            // when image is loaded, set the src of the image where you want to display it
            fr.onload = function(e) {
                resolve(e.target.result)
            };
            fr.onerror = reject
            // fill fr with image data
            fr.readAsDataURL(file);
        }
    })
}

class ImJoyPlugin{
    async setup(){
         // Display image when a file is selected.
        const fileInput = document.getElementById("file-input");
        const canvas = document.getElementById("input-canvas");
        const frameSlider = document.getElementById("frame-slider");

        fileInput.addEventListener("change", async ()=>{
            const file = fileInput.files[0]
            let img;
            if(file.name.endsWith('.tiff') || file.name.endsWith('.tif')){
              const p = await api.getPlugin('Tif File Importer')
              const tiffObj = await p.open(file)
              tiffObj.seek(0)
              img = await tiffObj.readAsURL()
              frameSlider.max = tiffObj.n_frames
              frameSlider.value = 0
              frameSlider.onchange = async ()=>{
                tiffObj.seek(parseInt(frameSlider.value))
                img = await tiffObj.readAsURL()
                await drawImage(canvas, img);
              }
            }
            else{
              img = await readImageFile(file);
            }
            await drawImage(canvas, img);
        }, true);
        // trigger the file dialog when the button is clicked
        const selectButton = document.getElementById("select-button");
        selectButton.addEventListener("click", async ()=>{
            // simulate a click on the <input> tag
            fileInput.click()
        }, true);
        await api.log("plugin initialized")
    }
    async run(ctx){

    }
}
api.export(new ImJoyPlugin())
</script>
<window>
    <div>
        <input  id="file-input" accept="image/*" capture="camera" type="file"/>
        <nav class="panel">
        <p class="panel-heading">
            <i class="fas fa-eye" aria-hidden="true"></i> My Image Viewer
        </p>
        <div class="panel-block">
            <button id="select-button" class="button is-link is-outlined is-fullwidth">
            Open an image
            </button>
        </div>
        
        <div class="panel-block">
            <input id="frame-slider" class="slider is-fullwidth" step="1" min="0" max="1" value="0" type="range">
        </div>
        
        <div class="panel-block">
            <canvas id="input-canvas" style="width: 100%; object-fit: cover;"></canvas>
        </div> 
    </div>
</window>
<style>
#file-input{
    display: none;
}
.slider{
  width: 100%;
}
</style>
```

?> Exercise option 2, use [ITK/VTK Viewer](https://kitware.github.io/itk-vtk-viewer/) to replace the canvas for image display, you can integrate code in [this plugin](https://gist.github.com/oeway/ed0a164ebcea5fc48d040f39f2ead5e0) to your viewer.

### Process images with OpenCV.js

OpenCV is a commonly used library for computer vision written in C++, it has been now compiled with WebAssembly to run in the browser.

The opencv.js has intensive documentation for many function, but for this tutorial, the following two parts will be enough:

 1. Understand how to load and save images with opencv.js, read [here](https://docs.opencv.org/3.4/df/d24/tutorial_js_image_display.html)
 2. Choose one of the image processing tutorials from this list [here](https://docs.opencv.org/3.4/d2/df0/tutorial_js_table_of_contents_imgproc.html) and integrate it to your image viewer plugin. For example, [image thresholding](https://docs.opencv.org/3.4/d7/dd0/tutorial_js_thresholding.html), [smooth images](https://docs.opencv.org/3.4/dd/d6a/tutorial_js_filtering.html), [canny edge detection](https://docs.opencv.org/3.4/d7/de1/tutorial_js_canny.html), or [segmentation with watershed](https://docs.opencv.org/3.4/d7/d1c/tutorial_js_watershed.html).

?> Exercise: Use OpenCV.js to process images

You need to basically to do this in three steps:

1. Add the opencv.js library `"https://docs.opencv.org/master/opencv.js"` to `"requirements"` under `<config>`
2. Take the image process part from the tutorial and wrap it as a function (e.g. `processImage`)
3. Add a `button` that calls the function when clicked.

?> Tips: you can pass the id of the canvas (e.g. we have already defined `input-canvas`) to `cv.imread`, for displaying the result, we can use the same canvas id or create another one as with `id="output-canvas"`.

Here is a template for the processImage function:

```js
function processImage(inputCanvasId, outputCanvasId){
    let src = cv.imread(inputCanvasId);
    let out;
    // add your opencv code here and use src as input image, save the result as out
    cv.imshow(outputCanvasId, out);
}
```

 As a reference, this is how such a plugin looks like: [OpenCVSegmentation](http://imjoy.io/lite?plugin=https://gist.github.com/oeway/02a5736d552383df9b43930cbc75b168).

?> If you want to compare two images (input and output) with a slider to reveal the output images, try to use this simple [ CompareImage plugin](https://gist.github.com/oeway/f09955746ec01a20053793aba83c3545). You can basically do `api.showDialog({src:"https://gist.github.com/oeway/f09955746ec01a20053793aba83c3545", data:{first: inputCanvas.toDataURL(), second: outputCanvas.toDataURL()}})`.

?> Here is another [image compare plugin](https://imjoy.io/lite?plugin=https://gist.github.com/oeway/ffb6f0efae8a68d497202137820f68e8) made with itk-vtk-viewer, the source code is [here](https://gist.github.com/oeway/ffb6f0efae8a68d497202137820f68e8).

### Deep learning in the browser with Tensorflow.js

[Tensorflow](https://www.tensorflow.org/) is a widely used deep learning library, it has been ported to javascript to run in the browser and the library is called [Tensorflow.js](https://www.tensorflow.org/js/).

Let's make a plugin for analyzing images with Tensorflow.js.

As another exercise, please take the relevant parts from this [M2Unet plugin](https://gist.githubusercontent.com/oeway/95025b000242ead88b06460b27cdf938/raw/M2Unet-BF-Kaibu.imjoy.html) ([source](https://gist.github.com/oeway/95025b000242ead88b06460b27cdf938#file-m2unet-bf-kaibu-imjoy-html)) and integrate it as another button to your image viewer plugin.

!> While browser-based plugins can already be useful and becoming more powerful with new techniques such as WebAssembly and the incoming [WebGPU](https://en.wikipedia.org/wiki/WebGPU), it cannot do heavy computation and have many restrictions due to its security model.


## 4. Build computation plugin in Python

Let's first see a simple hello world example in `web-python` mode, which will run Python code entirely in the browser.

Note, when you run the following plugin, it will take a while because it needs to load the python libraries into the browser:
<!-- ImJoyPlugin: { "type": "web-python", "name": "my-web-python-plugin"} -->
```python
from imjoy import api

class ImJoyPlugin():
    async def setup(self):
        pass

    def run(self, ctx):
        api.alert("Hello from web-python plugin")

api.export(ImJoyPlugin())
```

In this section, we will move on to use Python running in a Jupyter notebook server. 

Let's first try the Pokémon Chooser plugin as you see in javascript. You don't need to setup anything locally yet. If you click **Run**, you will need to wait for a while because we will spin up a remote server on MyBinder.org for you to run the Python plugin.

<!-- ImJoyPlugin: { "type": "native-python", "name": "my-python-plugin"} -->
```python
from imjoy import api

class ImJoyPlugin():
    async def setup(self):
        pass

    async def choosePokemon(self):
        pokemon = await api.prompt("What is your favorite Pokémon?", "Pikachu")
        await api.showMessage("Your have chose " + pokemon + " as your Pokémon.")

    async def run(self, ctx):
        await self.choosePokemon()

api.export(ImJoyPlugin())
```

### Use your own Jupyter notebook server (optional)

?> Since MyBinder.org is a free service, it typically used for demonstration purposes. For many application, users should setup their own Jupyter server. In this tutorial, this is an optional step.

There are two ways to setup a local Jupyter server: 1) Install Jupyter notebook (via `pip install jupyter`), then install the [imjoy-jupyter-extension](https://github.com/imjoy-team/imjoy-jupyter-extension). 2) Instead of installing directly Jupyter notebooks, you can install our a wrapper library called [ImJoy-Engine](https://github.com/imjoy-team/imjoy-engine) via `pip install imjoy`. 

The later is recommended because this allows us to fix some settings on the Jupyter server which can be useful for ImJoy, and you don't need to install imjoy-jupyter-extension separately. 

In short, to install Jupyter notebook for ImJoy and the Jupyter extension, you need to run `pip install imjoy` and then start it via `imjoy --jupyter`.

Now, if you want to switch to your own locally installed Jupyter server, you need to **Run** the following code block:
<!-- ImJoyPlugin: { "type": "web-worker", "hide_code_block": true,"editor_height": "200px"} -->
```js
api.prompt("Please copy and paste your Jupyter notebook URL with token here").then(async (nbUrl)=>{
    if(nbUrl){
        try{
            const engine = await api.getPlugin("Jupyter-Engine-Manager")
            const config = {}
            config.nbUrl = nbUrl
            config.url = config.nbUrl.split("?")[0];
            config.connected = true;
            config.name = "MyJupyterNotebook"
            await engine.createEngine(config)
        }
        catch(e){
            await api.alert("Failed to add Jupyter notebook engine, error: " + e.toString())
        }
    }
})
```

### Display an image with ITK/VTK Viewer, Vizarr and Kaibu

Let's use the ITK/VTK Viewer to visualize images. Please read through the documentation [here](https://kitware.github.io/itk-vtk-viewer/docs/imjoy.html) before you start using it.

It's rather easy, we can basically create a viewer by calling `api.createWindow(...)` (or `api.showDialog(...)` if you want a popup window), then we call `viewer.setImage()` by passing a numpy array (2D or 3D).

See the example below (loading the default image might be a bit slow, just wait until the image is shown):
<!-- ImJoyPlugin: { "type": "native-python", "name": "itk-vtk-viewer-plugin", "requirements": ["imageio"]} -->
```python
from imjoy import api

# we will use imageio to read image
# you will need to add imageio to `requirements` (did it already here)
import imageio

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        # let's ask the user to type a file path, otherwise we will use a URL to an example image on the Human Protein Atlas
        path = await api.prompt("Please give me an image file path or URL", "https://images.proteinatlas.org/19661/221_G2_1_red_green.jpg")
        image = imageio.imread(path)
        # create a viewer
        viewer = await api.showDialog(src="https://kitware.github.io/itk-vtk-viewer/app/")
        # show an image
        viewer.setImage(image)

api.export(ImJoyPlugin())
```

While ITK/VTK Viewer can display 3D volume, another viewer [Vizarr](https://github.com/hms-dbmi/vizarr) can visualize massive multi-resolution images in [Zarr format](https://zarr.readthedocs.io/en/stable/). You can find examples [here](https://github.com/hms-dbmi/vizarr/tree/master/example).

Similarly, we can show the image with another plugin [Kaibu](https://kaibu.org) which integrates the ITK/VTK Viewer with [OpenLayers](https://openlayers.org/) and providing in interface where different layers can be displayed.

Based on the ITK/VTK Viewer example, we only need to change `src` to `https://kaibu.org/#/app` and use `viewer.view_image()` function instead of `viewer.setImage()`.

In the example below, we also show how to add a **shape layer** with polygons and points to annotate images.

To allow **more user interactions**, you can also add buttons to the interface by calling `viewer.add_widget`

<!-- ImJoyPlugin: { "type": "native-python", "name": "kaibu-plugin", "requirements": ["imageio", "numpy"]} -->
```python
from imjoy import api

# we will use imageio to read image
# you will need to add imageio to `requirements` (did it already here)
import imageio
import numpy as np

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        # let's ask the user to type a file path, otherwise we will use a URL to an example image on the Human Protein Atlas
        path = await api.prompt("Please give me an image file path or URL", "https://images.proteinatlas.org/19661/221_G2_1_red_green.jpg")
        image = imageio.imread(path)
        # create a viewer
        viewer = await api.showDialog(type="itk-vtk-viewer", src="https://kaibu.org/#/app")
        # show an image
        viewer.view_image(image)

        # add polygon to a vector layer
        triangle = np.array([[11, 13], [1801, 413], [22, 246]], dtype='uint16')
        await viewer.add_shapes([ triangle ], shape_type="polygon", edge_color="red", name="triangle")

        # add points to a vector layer
        points = np.random.randint(0, 2000, [100, 2], dtype='uint16')
        await viewer.add_points(points, face_color="purple", name="points")

        def say_hello():
            api.alert("Hello from Python!")

        await viewer.add_widget({
            "_rintf": True, 
            "name": "Control",
            "type": "control",
            "elements": [
                {
                    "type": "button",
                    "label": "Say Hello",
                    "callback": say_hello,
                },
            ]
        })

api.export(ImJoyPlugin())
```

?> In the example above, we set a special key `_rintf` to `True`. This is necessary because we are sending callback functions to the viewer and we want the function to be sent as an `interface` that can be called again and again, rather than a one-time function.

?> As an exercise, you can use a popular python library [scikit-image](https://scikit-image.org/) to process the image.

### Connect your image viewer to the Python plugin

In addition to ITK/VTK Viewer, Vizarr and Kaibu, we can also connect the image viewer from the previous sections to the Python plugin.

?> In this configuration, we have **two plugins**: the UI plugin and the computation plugin. In general, there are two ways to connect them: 1) You can do like the example above, first instantiate the UI plugin from the compute plugin with `api.createWindow(...)`, then interact with the returned viewer object; 2) Or you can directly start the UI plugin, then you can do `api.getPlugin()` to get the api provided by the compute plugin. It will depend on the actual need of your application, but we recommended way the first one for Python plugins because it make it easier to debug in Jupyter notebooks.

In this tutorial, let's adjust the our image viewer to provide some API functions to allow the Python plugin to interact with it.

Let's assume we want use the Python plugin to process our images, when we call `api.createWindow` to instantiate the viewer, we need to pass a `process` function defined in Python.

Therefore we need to change the image viewer to be able to use the process function. We can use the `ctx` (stands for context) variable passed to the run function to get the `process` function:

```js
    // the run funciton of the image viewer
    async run(ctx){
        // check if there is a process function passed in
        if(ctx.data && ctx.data.process){
            // show an additional "Process in Python" button
            // and set the call back to use this process function
        }
    }
```

Now in the Python plugin we can do `await api.createWindow(type="Image Viewer", data={"process": self.process})` (assuming you have defined a function in the plugin class named `process`).

?> When calling `api.createWindow`, there are two ways to refer to another window plugin: 1) set the `type` key to the window plugin name, e.g. if your window plugin is called `My Window Plugin` you will set this as `type`. Important this name is obtained from the `name` definition in the `<config>` block. Further you will need to set it as a dependencies, e.g. “dependencies”: [“https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/my-window-plugin.imjoy.html”]. 2) if the window plugin is available as source code or served from a public server, you can set `src` as the plugin source code or the plugin URL (same as in the above example, when we called to Kaibu plugin). In this case, the plugin will be dynamically populated. It allows, for example, storing the window plugin as a string in Python or even dynamically generate a window plugin based on templates.

The following code is for a simplified version of the image viewer. Please adjust your full image viewer code by taking it as a reference. To try it, you will need to run the following two plugins sequentially and the button `Process` shown in the first plugin will be disabled.

<!-- ImJoyPlugin: {"fold": [0], "editor_height": "500px"} -->
```html
<config lang="json">
{
  "name": "Image Viewer",
  "type": "window",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "cover": "",
  "description": "This is a demo plugin for displaying image",
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
    async run(ctx){
        if(ctx.data && ctx.data.process){
            const btn = document.getElementById('process')
            btn.disabled = false;
            btn.addEventListener("click", async ()=>{
                ctx.data.process()
            }, true);
        }
    }
}
api.export(new ImJoyPlugin())
</script>
<window>
    <div>
        <button id="process" disabled>Process</button>
    </div>
</window>
```

<!-- ImJoyPlugin: { "type": "native-python", "name": "my-python-plugin"} -->
```python
from imjoy import api

class ImJoyPlugin():
    async def setup(self):
        pass

    async def process(self):
        await api.alert('I am on it!')

    async def run(self, ctx):
        await api.createWindow(type="Image Viewer", data={"process": self.process})

api.export(ImJoyPlugin())
```

If you click the "Process" button, you are actually calling a function from Javascript to Python. 

!> However, you may notice that if you click the button for the second time, it doesn't work anymore, and if you go to your browser console, you will see an error saying `Callback function can only called once, if you want to call a function for multiple times, please make it as a plugin api function.`. This is because the `process` function is removed from the window after the first call. To explicitly tell the window to keep the `process` function, we can pass set a special key `_rintf` to `True`. Please, change the code above so it becomes `data={"process": self.process, "_rintf": True}`.

Also note that in this example, we didn't pass any parameter to the process function. For an actual image processing function, we will need to pass at least an image and return the output image. However, because Javascript and Python represent images in different ways, we will need to encode and decode to make them cross-compatible. The easiest way to do it is to encode an image as a `base64` string. Here are some code snippets:

```python
import re
import base64
import io
import imageio

def image_to_base64(image_array):
    '''This function takes a numpy image array as input
    and encode it into a base64 string
    '''
    buf = io.BytesIO()
    imageio.imwrite(buf, image_array, "PNG")
    buf.seek(0)
    img_bytes = buf.getvalue()
    base64_string = base64.b64encode(img_bytes).decode('ascii')
    return 'data:image/png;base64,' + base64_string

def base64_to_image(base64_string, format=None):
    '''This function takes a base64 string as input
    and decode it into an numpy array image
    '''
    base64_string = re.sub("^data:image/.+;base64,", "", base64_string)
    image_file = io.BytesIO(base64.b64decode(base64_string.encode('ascii')))
    return imageio.imread(image_file, format)
```

In Javascript, this is how the `base64` encoding works:
```js
const canvas = document.getElementById('canvas-id')

// get `base64` encoded image from a canvas
const base64String = canvas.toDataURL()

// draw a `base64` encoded image to the canvas
const drawImage = (canvas, base64Image)=>{
    return new Promise((resolve, reject)=>{
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = function(){
            const ctx = canvas.getContext("2d");
            canvas.width = Math.min(this.width, 512);
            canvas.height= Math.min(this.height, parseInt(512*this.height/this.width), 1024);
            // draw the img into canvas
            ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
        }
        img.onerror = reject;
        img.src = base64Image;
    })
}
```

As an exercise, please use the encoding and decoding functions above to:

 1. Get a `base64` string from the canvas in the image viewer
 2. Call `process` and pass the `base64` string
 3. In the Python plugin, decode the `base64` string into an image and process it, for example, using [scikit-image](https://scikit-image.org/docs/stable/auto_examples/index.html) (e.g. [watershed](https://scikit-image.org/docs/stable/auto_examples/segmentation/plot_watershed.html#sphx-glr-auto-examples-segmentation-plot-watershed-py)).
 4. Encode the result image into `base64` string and return it
 5. Show the `base64` string as an image on a canvas in the image viewer plugin

### Build deep learning based segmentation plugin with CellPose

CellPose is a deep learning model developed by Stringer et al., 2020 ([paper](https://www.biorxiv.org/content/10.1101/2020.02.02.931238v1), [source code](https://github.com/MouseLand/cellpose)).

It also provide a [server version](https://github.com/MouseLand/cellpose_web) for running inference from a remote server, for example the [CellPose demo website](https://cellpose.org/).

Cellpose now supports the [ImJoy RPC communication]([a Pull Request](https://github.com/MouseLand/cellpose_web/pull/1)), such that CellPose website itself can be used as a plugin.

This further enables the CellPose segmentation feature in [ImageJ.JS](https://ij.imjoy.io/)(ImageJ compiled into javascript and running in the browser). This is [the plugin](https://gist.github.com/oeway/c9592f23c7ee147085f0504d2f3e993a) that calls the CellPose plugin and run segmentation with the https://cellpose.org server. You can also find an announcement [here](https://forum.image.sc/t/new-imagej-js-release-with-3d-viewer-and-cellpose-segmentation/44842) about the cellpose feature.

?> While CellPose running on a server makes it much easier for users to try. However, users will need to upload images to a server maintained by others (even though cellpose.org don't store users' images). Besides that, you cannot rely on that to process a large amount of data.

Therefore, let's make an ImJoy plugin in Python to run the CellPose segmentation model locally (or on Google Colab with free GPU).

Here is the code for the CellPose plugin:
<!-- ImJoyPlugin: { "hide_code_block": true} -->
```html
<docs lang="markdown">
# CellPose
 
A generalist algorithm for cell and nucleus segmentation.

https://github.com/MouseLand/cellpose

</docs>

<config lang="json">
{
  "name": "CellPose-Segmentation",
  "type": "native-python",
  "version": "0.1.0",
  "description": "A generalist algorithm for cell and nucleus segmentation.",
  "tags": [],
  "ui": "",
  "cover": "",
  "inputs": null,
  "outputs": null,
  "flags": [],
  "icon": "extension",
  "api_version": "0.1.8",
  "env": [{"type": "binder", "spec": "MouseLand/cellpose_web/main", "skip_requirements": true}],
  "permissions": [],
  "requirements": ["repo: https://github.com/MouseLand/cellpose_web", "cmd: pip install -r cellpose_web/requirements.txt"],
  "dependencies": []
}
</config>

<script lang="python">
import os
# for Jupyter notebooks
if os.path.exists('cellpose_web'):
    os.chdir('cellpose_web')

import re
import base64
import io
import imageio
import cv2
from imjoy import api
from main import *

def image_to_base64(image_array):
    '''This function takes a numpy image array as input
    and encode it into a base64 string
    '''
    buf = io.BytesIO()
    imageio.imwrite(buf, image_array, "PNG")
    buf.seek(0)
    img_bytes = buf.getvalue()
    base64_string = base64.b64encode(img_bytes).decode('ascii')
    return 'data:image/png;base64,' + base64_string

def base64_to_image(base64_string, format=None):
    '''This function takes a base64 string as input
    and decode it into an numpy array image
    '''
    base64_string = re.sub("^data:image/.+;base64,", "", base64_string)
    image_file = io.BytesIO(base64.b64decode(base64_string.encode('ascii')))
    return imageio.imread(image_file, format)

class ImJoyPlugin():
    def setup(self):
        api.log('initialized')

    def segment(self, config):
        input64 = config["input"]
        original_img = base64_to_image(input64, config.get('format'))
        mask, flow, img = cellpose_segment(original_img, config)
        results = {"success": True, "input_shape": original_img.shape}
        outputs = config.get("outputs", "mask").split(",")
        if "geojson" in outputs:
            geojson_features = mask_to_geojson(mask)
            results["geojson"] = geojson_features
        if "img" in outputs:
            _, buffer = cv2.imencode('.png', img)
            img64 = base64.b64encode(buffer).decode()
            results["img"] = img64
        if "flow" in outputs:
            _, buffer = cv2.imencode('.png', flow)
            flow64 = base64.b64encode(buffer).decode()
            results["flow"] = flow64
        if "mask" in outputs:
            _, buffer = cv2.imencode('.png', mask.astype('uint16'))
            mask64 = base64.b64encode(buffer).decode()
            results["mask"] = mask64
        if "outline_plot" in outputs:
            outpix = plot_outlines(mask)
            results["outline_plot"] = img_to_html(img, outpix=outpix)
        if "overlay_plot" in outputs:
            overlay = plot_overlay(img, mask)
            results["overlay_plot"] = img_to_html(overlay)
        if "flow_plot" in outputs:
            results["flow_plot"] = img_to_html(flow)
        if "img_plot" in outputs:
            results["img_plot"] = img_to_html(img)
        return results

    async def run(self, ctx):
        if ctx.data and 'input' in ctx.data:
            return self.segment(ctx.data)
        else:
            try:
                path = await api.prompt("Please input an image file path or URL", "http://www.cellpose.org/static/images/img00.png")
                api.showStatus('Loading example image...')
                image = imageio.imread(path)
                api.showStatus('Running segmentation with cellpose...')
                outputs = self.segment({'input': image_to_base64(image), "diam": 30, "net": "cyto", "chan1": 0, "chan2": 0, "outputs": "flow,mask,outline_plot,overlay_plot"})
                api.showStatus('Displaying result...')
                outline_plot = base64_to_image(outputs['outline_plot'])
                await api.showDialog(src="https://kitware.github.io/itk-vtk-viewer/app/", name="CellPose Segmentation Result", data={"image": outline_plot})
                api.showStatus('Done.')
            except Exception as e:
                api.showMessage("Failed to run cellpose: " + str(e))
                raise e

api.export(ImJoyPlugin())
</script>
```

As an exercise, we can integrate your image viewer with cellpose. This time, let's try to use `api.getPlugin()` to interact with the plugin.

Here is a code snippet for reference:

```js
async function segmentWithCellPose(){
    const canvas = document.getElementById("input-canvas")
    const fileBase64 = canvas.toDataURL()
    const cellpose = await api.getPlugin('CellPose-Segmentation')
    const outputs = await cellpose.segment({input: fileBase64, outputs: "mask,img_plot,overlay_plot,outline_plot,flow_plot"})
    // let's assume you want to overwrite the input image canvas
    await drawImage(canvas, outputs.outline_plot)
}
```

?> If you get it working, you can also easily switch to the sever-side segmentation by changing the line `const cellpose = await api.getPlugin('CellPose-Segmentation')` into `const cellpose = await api.showDialog({src: 'https://cellpose.org/'})`. This is doable, because they share the same plugin API (e.g. `segment` with the same function signature).

## 5. Use ImJoy in Juptyer notebooks and Colab

Another way to use ImJoy is to run it in Jupyter notebooks and Colab.

As mentioned previously, you need to run `pip install imjoy` to install and then start the Jupyter notebook via `imjoy --jupyter`.

In your forked imjoy-starter repo, you can find [a list of notebook examples](https://github.com/imjoy-team/imjoy-starter/tree/master/notebooks), please feel free to go through and play with them.

!> Although we support running in Google Colab, there is an issue with the asyncio support that we've already reported [the issue](https://github.com/googlecolab/colabtools/issues/1648) to the Colab team. Unfortunately, we will need to wait for them to fix this issue. It might also help if you give add a 👍 to the issue.

### Use imjoy-elfinder to manage your remote files

To better manage remote files, we implemented [imjoy-elfinder](https://github.com/imjoy-team/imjoy-elfinder).
You can try it by [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imjoy-team/imjoy-elfinder/blob/master/example-data/ImJoy_elFinder_Colab.ipynb) or [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/imjoy-team/imjoy-elfinder/master?urlpath=elfinder).

Please try the following code block in a Jupyter notebook:
```python
from imjoy import api
import imageio

class ImJoyPlugin():
    async def setup(self):
        api.log('initialized')

    async def run(self, ctx):
        fileDialog = await api.showDialog(type="ImJoy elFinder")
        files = await fileDialog.getSelections()
        image = imageio.imread(files[0].path)
        await api.showDialog(src="https://kitware.github.io/itk-vtk-viewer/app/", data={"image": image})

api.export(ImJoyPlugin())
```


!> While you can normally use it as a standalone interface or within a Jupyter notebook, it fails to work in the ImJoy sandalone app, possibly due to some security changes in the latest Chrome ([this issue](https://github.com/imjoy-team/ImJoy/issues/401)). You can try it with Firefox for now.

### Training deep learning models

We also provide a demo plugin for interactive training of deep learning models during annotation, here is the [project repo](https://github.com/imjoy-team/imjoy-interactive-segmentation).

!> imjoy-interactive-segmentation is a work-in-progress project. Due to the bug in Google Colab, the current implementation is not straight-forward -- we had to send the async task into background thread and pool the result.

Nevertheless, you can try it locally or using MyBinder or Colab:
[![launch ImJoy](https://imjoy.io/static/badge/launch-imjoy-badge.svg)](https://imjoy.io/#/app?workspace=kaibu&plugin=https://raw.githubusercontent.com/imjoy-team/imjoy-interactive-segmentation/master/interactive_trainer.py)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/imjoy-team/imjoy-interactive-segmentation/master?filepath=Tutorial.ipynb)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imjoy-team/imjoy-interactive-segmentation/blob/master/Tutorial.ipynb)

### Deploy your models and plugin to BioImage.IO

Share pretrained deep learning models has many advantages. Not only the models can be used directly by others to process data (e.g. the cellpose model), but also pretrained models can be used to reduce training time, which is also good for the environment (keep in mind that the carbon footprint of training models are high!).

We are currently working with several other groups in the bioimage community to build a bioimage model zoo at [BioImage.IO](http://bioimage.io/). The initiative covers a common [model description file format](https://github.com/bioimage-io/configuration), the website powered by ImJoy and plugins (called `BioEngine`).

## 6. Integrate ImJoy to your software/web site

With the idea of open integration in mind, ImJoy and its plugins can be used in many different ways:

- ImJoy plugins can not only be used in the [ImJoy app](https://imjoy-team.github.io/imjoy-starter/#/), but also in [ImJoy lite](https://imjoy.io/lite), [ImageJ.JS](https://ij.imjoy.io), [BioImage.IO](http://bioimage.io/) and more recently the interactive [ImJoy docs](https://imjoy.io/docs/) which we are using now for this tutorial.
- Other software, web applications and websites can also integrate [imjoy-rpc](https://github.com/imjoy-team/imjoy-rpc) which makes them accessible to the entire ImJoy ecosystem, including: ITK/VTK Viewer, Vizarr, Kaibu, ImageJ.JS and CellPose.

If you are interested in integrating ImJoy to your project, please see instructions [here](https://github.com/imjoy-team/imjoy-core/blob/master/docs/integration.md)

## Plugin Gallery

[Placeholder for plugins made by students]

## FAQ

### How to make interactive documentation for ImJoy

[TODO]
