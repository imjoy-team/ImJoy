# [WIP] I2K Workshop Tutorial

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
    - [Async + Await in JavaScript, talk from Wes Bos](https://www.youtube.com/watch?v=DwQJ_NPQWWo)
    - [Asynchronous programming in Python](https://www.youtube.com/watch?v=6kNzG0T44SI)

 - Since Remote Procedure Calls is a key technique used in ImJoy, we recommend reading this blog post: [RPCs, Life and All](http://tomerfiliba.com/blog/RPCs-Life-And-All/)


## 1. Understanding key concepts in ImJoy

Let's start by introducing you the live execution feature of this tutorial. We have loaded the core of ImJoy into this tutorial such that you can edit or run ImJoy plugin code directly in this page.

### Hello from ImJoy
See the following code block with one line in Javascript, if you click the **Run** button, you should see a popup message saying `Hello from ImJoy!`.
<!-- ImJoyPlugin: { "type": "iframe", "passive": true, "editor_height": "200px"} -->
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
<!-- ImJoyPlugin: { "type": "web-worker", "passive": true,"editor_height": "200px"} -->
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

### Remote Procedure Calls in ImJoy

Although calling `alert()` and `api.alert()` appears the same, the underlying processes are different. While calling `alert()`, the popup dialog is initiated from the plugin, calling `api.alert()` means the popup dialog is initiated by the ImJoy core.


Keep in mind that ImJoy run each plugin in isolated or sandboxed environment (i.e. sandboxed iframe, webworker, conda virtual environment or docker container).

When calling an ImJoy API function from a plugin, the function will be executed in the ImJoy core. The plugin runs in a different environment, all the functions defined in the ImJoy core are "remote" functions. In comparison, all the functions defined in the same plugin are "local".

?> Therefore, calling ImJoy API functions means doing **Remote Procedure Calls (RPC)**.

?> ImJoy supports bidirectional RPCs, not only between the plugin and the ImJoy core, but also between plugins. This can be consistently done across programming languages and hosting computers.

For example, when calling `api.alert()` from a Python plugin in a remote server, the popup dialog will be initiated by the ImJoy core in the user's browser (implemented in Javascript). You will also learn later that plugins can call each other via RPC.

?> RPCs allows distribute tasks to different plugins running in different languages and locations. For example, we can build user interface with powerful UI libraries (e.g. [D3](https://d3js.org/) and [ITK/VTK Viewer](https://kitware.github.io/itk-vtk-viewer/) ) in Javascript/HTML/CSS and run deep learning model in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) in [Tensorflow.js](https://www.tensorflow.org/js). For training models with GPUs, Python plugins can run on Jupyter notebook servers (a.k.a. Plugin Engine) locally or remotely, e.g. on a GPU cluster or lab workstation.

?> If you haven't read, this blog post ([RPCs, Life and All](http://tomerfiliba.com/blog/RPCs-Life-And-All/)) explains the idea behind a Python library ([RPyC](https://rpyc.readthedocs.io/en/latest/)) which is similar to the one in ImJoy.

### ImJoy API functions are asynchronous

Since ImJoy API functions are remote functions, it's a bit different from local functions defined in the same plugin. More specifically, the remote functions are asynchronous. Without explaining why we choose to make them asynchronous or the actually meaning of asynchronous function.

For now, let's remember the following simplified rule for calling an async function:

?> **All the remote functions in ImJoy are asynchronous. We can use them just like other local functions by add `await` before the function call.** 

This means we should do `await api.alert('hello')` to call the alert function. 

If the API function has returned value, for example, [`api.prompt`](https://imjoy.io/docs/#/api?id=apiprompt), we should do: `result = await api.prompt('type a number')`.

### Debugging with Chrome developer tool

The recommended way of running ImJoy API function is to add `await`. However, if you run the following code, nothing will happen because of a syntax error:
<!-- ImJoyPlugin: { "type": "web-worker", "passive": true, "editor_height": "200px"} -->
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
<!-- ImJoyPlugin: { "type": "web-worker", "passive": true, "editor_height": "250px"} -->
```js
// async/await example in Javascript
async function sayHello(){
    await api.alert("Hello from ImJoy!")
}
sayHello()
```

Another simplified rule for using `async/await` is:

?> **When using `await` in a function, add `async` before the function definition**


As another example, we can use another ImJoy API function [`api.prompt`](https://imjoy.io/docs/#/api?id=apiprompt) to get input from the user in a popup dialog and show the message with [`api.showMessage`](https://imjoy.io/docs/#/api?id=apishowmessage).
<!-- ImJoyPlugin: { "type": "web-worker", "passive": true, "editor_height": "250px"} -->
```js
async function choosePokemon(){
    const pokemon = await api.prompt("What is your favorite Pokémon?", "Pikachu")
    await api.showMessage("Your have chose " + pokemon + " as your Pokémon.")
}
choosePokemon()
```

?> For development in Javascript, you can also use other functions such as `console.log(<ANY OBJECT>)` to print a message or object to the console. you can also insert the keyword `debugger` to your code to instruct the browser to pause the execution when hit the corresponding line.

With the develop tool open, try to run the following code:
<!-- ImJoyPlugin: { "type": "web-worker", "passive": true, "editor_height": "250px"} -->
```javascript
console.log("Hello world!");

var myObj = { firstname : "John", lastname : "Doe" };
console.log(myObj);

debugger

var myArr = ["Orange", "Banana", "Mango", "Kiwi" ];
console.log(myArr);

console.error("this is an error")
```

### Async/Await in Python

The `async/await` syntax is similar in Python, for example:
```python
# async/await example in Python
async def say_hello():
    await api.alert("Hello from ImJoy!")
```

!> **For python plugin with type=`web-python`, we have no support for `async/await` yet. We are current waiting for the [asyncio support](https://github.com/iodide-project/pyodide/issues/245) in the Pyodide project.** For now, you have to switch the type to `native-python` or use callback style (see below) in `web-python` plugins.


#### Callback, Promise and Async/Await

Now let's go back to understand a bit more about asynchronous programming.

As we mentioned that one advantage of distributing tasks to different plugins via RPC is that we can schedule and run tasks in parallel.Conventionally, there are many other techniques to achieve concurrency including parallelization with multiple threads or processes in Python, Java and many other programming languages. Asynchronous programming is an increasingly popular way of achieving concurrency in a more scalable fashion. 

The basic idea is that we don't have to always wait for one task to finish until we can move to the next. For example, you go to a coffee shop, order a cup of cappuccino and get a ticket, while the coffee is in the making, you can make a phone call or read a newspaper. After some minutes, you can get your cappuccino by showing your ticket number.

?> One big difference between asynchronous programming and other techniques such as multi-threading is that the program runs in one thread and process. Therefore, in ImJoy, asynchronous programming is often used to schedule tasks to other plugins, rather than run heavy computation tasks in parallel within the same plugin.

`async/await` is not the only way to do asynchronous programming, in fact, it becomes more popular only in recent years. For example, Python introduces it only after Python 3. To really appreciate `async/await` as a life-saver programming pattern, you can watch this video: [Async + Await in JavaScript, talk from Wes Bos](https://www.youtube.com/watch?v=DwQJ_NPQWWo). It covers **callback style**, **promise style** and **async/await** style.

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
The ImJoy plugin ecosystem meant to be open in two ways: 1) other software tools and website should be able to easily use ImJoy and its plugins 2) other software tools should be easily used in ImJoy, typically as a plugin.

In general, any software that uses ImJoy RPC protocol to expose service functions can be treated as an ImJoy plugin. This includes the ImJoy web app itself which can read plugin files and produces plugin API. Meanwhile, we provide the [imjoy-rpc](https://github.com/imjoy-team/imjoy-rpc) library which currently support Python and Javascirpt for other software or web applications to directly communicate with the ImJoy core.

Recently, there is already several web applications that can run in standalone mode but also as an ImJoy plugin, [ITK/VTK Viewer](https://kitware.github.io/itk-vtk-viewer/docs/imjoy.html)(by [Matt McCormick](https://github.com/thewtex) et al.), [vizarr](https://github.com/hms-dbmi/vizarr)(by [Trevor Manz](https://github.com/manzt) et al.), , [Kaibu](https://kaibu.org/#/app) and [ImageJ.JS](https://ij.imjoy.io)(by the ImJoy Team).

For example, [ITK/VTK Viewer](https://kitware.github.io/itk-vtk-viewer/docs/imjoy.html) is an open-source software system for medical and scientific image, mesh, and point set visualization. While it can run [as a standalone app](https://kitware.github.io/itk-vtk-viewer/app/?fileToLoad=https://data.kitware.com/api/v1/file/564a65d58d777f7522dbfb61/download/data.nrrd), it can also run [as an ImJoy plugin](https://kitware.github.io/itk-vtk-viewer/docs/imjoy.html). If you can try the viewer by clicking the **Run** button below and you can use it to visualize your local files (e.g.: [download example file](https://data.kitware.com/api/v1/file/564a65d58d777f7522dbfb61/download/data.nrrd)):
<!-- ImJoyPlugin: { "type": "web-worker", "hide_code_block": true} -->
```js
api.showDialog({src: "https://kitware.github.io/itk-vtk-viewer/app/", name: "ITK/VTK Viewer"})
```

This is another example for the [vizarr](https://hms-dbmi.github.io/vizarr) which is a WebGL-based viewer for visualizing Zarr-based images. We loads it as an ImJoy plugin and call its `add_image` api function to visualize ome-zarr HCS data (a new feature implemented by [Will Moore](https://github.com/will-moore) recently).
<!-- ImJoyPlugin: { "type": "web-worker", "hide_code_block": true} -->
```js
api.showDialog({src: "https://hms-dbmi.github.io/vizarr", name: "visualizating HCS zarr images with vizarr"}).then((viewer)=>{
    viewer.add_image({source: "https://minio-dev.openmicroscopy.org/idr/idr0001-graml-sysgro/JL_120731_S6A/pr_45/2551.zarr", name: "Demo Image"})
})
```

?> While standalone web applications are more powerful, building them requires more advanced tooling and higher-level programming skills. For beginners, using basic imjoy plugin files can already solve many tasks. Therefore, in this tutorial, let's first focus on how to make basic ImJoy plugins.


## 2. Make your first ImJoy plugin

With these key concepts, we can proceed to build actual ImJoy plugins.

We have been already mentioning different types of plugins in the previous section without defining what is an ImJoy plugin. 

### What is an ImJoy plugin

?> In a nutshell, an ImJoy plugin is a script that produce a set of service functions (a.k.a plugin API functions) that can be called by the ImJoy core or other plugins. While loading the plugin, an `api` object contains all the ImJoy API functions will be passed to the the plugin, the plugin can then build the service functions and register them via a `api.export(...)` function call.

?> There are currently 4 common plugin types: `window`, `web-worker`, `web-python`, `native-python`. Plugin types can be further extended with plugins, for example, we can make a new plugin type for executing Fiji/Scijava scripts, see [this post](https://forum.image.sc/t/making-imjoy-plugins-with-fiji-scripts-for-running-remotely/39503).


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


?> In Javascript, there are different way of writing functions, you can do: 1) `function MyFunction() {...}` 2) `const MyFunction = ()=>{...}` 3) when defining a member function of a class or an object, you can simply do `MyFunction() {...}` (see the example above).

### ImJoy plugin file format

An ImJoy plugin is typically a text file with the extension `*.imjoy.html`. We use HTML/XML tags such as `<config>`, `<script>`, `<window>` to store code blocks. 

?> Most plugin types requires at least two code blocks: `<config>` and `<script>`, for example `web-worker`, `web-python` and `native-python`. For `window` plugin, another `<window>` block is required for the HTML code, as well as an optional `<style>` block for CSS code. Detailed description about ImJoy plugin file can be found here: [plugin file format](https://imjoy.io/docs/#/development?id=plugin-file-format).


### Your first ImJoy plugin
<!-- ImJoyPlugin: {"startup_mode": "edit"} -->
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

In the above code editor, you can click **Export** and it will download as an ImJoy plugin file (with extension `*.imjoy.html`). This plugin file can be used in the standalone ImJoy app: 1) go to https://imjoy.io/#/app 2) drag and drop the downloaded file into the browser.

### Deploy and share your plugin
If you want to share your plugin with others, you can either send the plugin file directly, or upload your plugins to Github/Gist. The later is recommended if you want to publish your plugins and share with the rest of the world.

You can [fork the imjoy-starter repo](https://github.com/imjoy-team/imjoy-starter/fork) (or create an empty one if you prefer) on Github.


Now you can name your plugin as, for example, `PokemonChooser.imjoy.html` and upload it to the `plugins` folder of your forked repo by using git commands or upload directly to the repo. You can organize upload the plugin file in any kind of folder organization.

After that, you can click the plugin file and copy the url in your address bar, it should be something like: `https://github.com/<YOUR-GITHUB-USERNAME>/imjoy-starter/blob/master/plugins/PokemonChooser.imjoy.html`

This URL can be used to install plugins in ImJoy, you can click **Run** to open the ImJoy app. To install the plugin, click `+PLUGINS` and paste the URL to the `Install from URL` input box and press Enter.

<!-- ImJoyPlugin: { "type": "web-worker", "hide_code_block": true, "passive": true} -->
```js
api.showDialog({src: "https://imjoy.io/#/app?w=i2k", passive: true, fullscreen: true})
```


Now you can construct an URL for sharing with others, just add the URL after `https://imjoy.io/#/app?plugin=` so it becomes something like: `https://imjoy.io/#/app?plugin=https://github.com/<YOUR-GITHUB-USERNAME>/imjoy-starter/blob/master/plugins/PokemonChooser.imjoy.html`.

If a user click your plugin URL, it will open the plugin directly in ImJoy and ask the user to install it.

## 3. Build plugins for image analysis

In this section let's start by making a plugin for image analysis. We will build image analysis tools with interactive interface.


?> A typical plugin design pattern in ImJoy is to separate a tool into the the compute part and the UI part (either build a plugin or reuse existing ones).

### Make GUI plugins with HTML/CSS/JS

Let's first look into how to use HTM/CSS/JS to build a simple interface that read a local image file and display it.

We will use the `<input>` tag for selecting the file and use its `change` event to trigger a display function. In the display function, we can use `img` tag to display the image.

See the code below:

<!-- ImJoyPlugin: {"startup_mode": "edit", "fold": [0, 21, 39], "editor_height": "500px"} -->
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
        var img = new Image()
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
            var fr = new FileReader();
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
        <h1>Please select an image (jpg/png/gif)</h1>
        <input  id="file-input" accept="image/*" capture="camera" type="file"/>
        <canvas id="input-canvas" style="width: 100%; object-fit: cover;"></canvas>
    </div>
</window>
<style>
    
</style>
```

As an exercise, you can try to add a `<button>` which will trigger the open file dialog so we can use the button to select the file. (Why we want to do that? Because we can later customize the appearance of the button easily.)

You edit the code above by doing:
 1. below the `<input>` tag, add a line: `<button id="select-button">Select an image</button>`
 2. in the `setup` function, add:
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
        var img = new Image()
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
            var fr = new FileReader();
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
        <h1>Please select an image (jpg/png/gif)</h1>
        <input  id="file-input" accept="image/*" capture="camera" type="file"/>
        <button id="select-button">Select an image</button>
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

Now we read a bit further on how to use the style, Bulma support a whole bunch of different elements and layout in the documentation, you can read about [buttons](https://bulma.io/documentation/elements/button/).

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
        var img = new Image()
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
            var fr = new FileReader();
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
        <h1 class="title">Please select an image (jpg/png/gif)</h1>
        <input  id="file-input" accept="image/*" capture="camera" type="file"/>
        <button id="select-button" class="button is-primary">Select an image</button>
        <canvas id="input-canvas" style="width: 100%; object-fit: cover;"></canvas>
    </div>
</window>
<style>
#file-input{
    display: none;
}
</style>
```

As another exercise, you can try to use a [panel](https://bulma.io/documentation/components/panel/) to contain the `button` and `<canvas>`.

?> To use icons in Bulma, we need to also add `https://use.fontawesome.com/releases/v5.14.0/js/all.js` the the `requirements`. Then search the icons from here: https://fontawesome.com/icons. For example, if you find an icon named `eye`, you can use add the icon to your html as `<i class="fas fa-eye"></i>`.

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
        var img = new Image()
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
            var fr = new FileReader();
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
            Select an image
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


#### Support TIFF format



?> Exercise 1: Use OpenCV.js to process images

?> Exercise 2: Run Tensorflow.js models

### Build computation plugin in Python

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

### Connect the GUI with computation



### Use existing plugins


### Build your own image viewer


## Use ImJoy in Juptyer notebooks and Colab

### Use the Jupyter extension

### Try the Micro-Manager plugin

### Train a deep learning model




