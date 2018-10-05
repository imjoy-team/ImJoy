# ImJoy architecture

Here we provide and overview of the design of ImJoy and how plugins can be developed

## ImJoy key features
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

## ImJoy architecture
Imjoy consists of **two main components**
1. A **web interface** (JS, HTML, WebGL) and an offline first design. Plugins can be developed in JavaScript for this web interface.
2. **Computational Python backend**. Packages are managed by Condo and provide thus
access to the entire Python ecosystem. Complex computional tasks can be implemented
in plugins, which run in the **Python Plugin Engine** - a small python library we developed for ImJoy. The Python Plugin Engine is  connected with the ImJoy web interface through websockets and communicate with remote procedure calls (RPC).

<img src="https://github.com/oeway/ImJoy/raw/master/docs/img/imjoy-design.png" width="400px"></img>

**Importantly**, ImJoy can run without the Python backend and thus without the need of any
installation. Plugins can then only implemented in JavaScript (such as [TensoFlow.js](https://js.tensorflow.org/)).

Currently, ImJoy consists of three repositories:
 * [web application](https://github.com/oeway/ImJoy/)
 * [plugin engine](https://github.com/oeway/ImJoy-Python)
 * [plugin repository](https://github.com/oeway/ImJoy-Plugins)



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


## Going offline
If you have already installed the **Python Plugin Engine**, then you can run ImJoy in offline mode. What you do is to run the engine with `python -m imjoy --serve` . And it will download all the files for offline access, after that, if you run `python -m imjoy` in the **same directory**, you will have your personal ImJoy web app which can be access by [http://127.0.0.1:8080](http://127.0.0.1:8080).

Also notice that, even though ImJoy can run without internet, depends on the implementation of the plugin, some plugins maybe unusable when you go offline.
