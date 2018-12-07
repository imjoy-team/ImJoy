# ImJoy

ImJoy is a flexible image processing framework for the deployment of complex
computational tasks in a robust, secure and easy-to-use environment.
The entire functionality is provided by **plugins**. These plugins can be
assembled into **workflows** in a modern graphical user-interface.
Plugins can be grouped and installed into isolated workspaces avoiding
overcrowded plugin menus. This design makes ImJoy intuitive to work with
for end users. While ImJoy was developd with image processing in mind, it can
be use to deploy any kind of data processing task.


**[TODO] Add a link for a nice demo app to showcast ImJoy!**

<img src="./assets/imjoy-screenshot.png" width="600px"></img>

## ImJoy architecture
By design, ImJoy itself provides very minimal task specific functionality, it
provides a flexible plugin interface to support plugins to extend the user
interface and perform computational tasks. Plugins can be designed to perform
simple tasks such as reading tif file, or more complex tasks such as training
a deep learning model for image segmentation.

<img src="./assets/imjoy-overview.png" width="800px"></img>

Imjoy consists of **two parts**:

1.  the **ImJoy app**. It can either run in a browser ("webApp") or as a stand-alone app (desktopApp). The app alone can already perform computational tasks with the powerful
Javascript engine and WebGL providing GPU access. We further provide support for
for (pyodide)[https://github.com/iodide-project/pyodide], which allows to run
Python directly inside the ImJoy app. However, here only a few libraries are
currenty supported.

2.  the **Python plugin engine backend**. This allows to access the entire Python ecosystem. The plugin engine can be launched either on the local machine, or remotely to perform compuationally intensive tasks on dedicated workstations, e.g. with state-of-the-art GPUs.


## Key features

-   Minimal and flexible design
-   Rich and interactive user interface powered by web technologies
-   Powerful computational backend powered by the Python ecosystem
-   Easy-to-use workflow composition
-   Isolated workspaces for grouping plugins
-   Extendable plugin interface supports Python and Javascript
-   WebAssembly powered web Python plugins
-   Concurrent plugin execution through asynchronous programming
-   Self-contained plugin development
-   Easy plugin deployment and sharing through Github or Gist

## Source code

Currently, ImJoy source code consists of three repositories:

-   [web application](https://github.com/oeway/ImJoy/)
-   [plugin engine](https://github.com/oeway/ImJoy-Engine)
-   [plugin repository](https://github.com/oeway/ImJoy-Plugins)

## Acknowledgements

This is a non-exhaustive list of the open-source tools and libraries we used in ImJoy:

-   [Joy.js](https://github.com/ncase/joy) (This is where the name `ImJoy` comes from!)
-   [Jailed](https://github.com/asvd/jailed) (This helps ImJoy to isolate plugins)
-   [Vue.js](https://vuejs.org/) (The main ImJoy App is written in Vue.js)
-   [vue-grid-layout](https://github.com/jbaysolutions/vue-grid-layout) (For window management)
-   [python-socketio](https://github.com/miguelgrinberg/python-socketio) (This how the plugin engine talk with the ImJoy app)
-   [pyodide](https://github.com/iodide-project/pyodide) (Enables web python mode with WebAssembly)
-   [conda](https://conda.io/) (The plugin engine uses Conda for managing virtual env. and pacakges)

We thank all the authors for offering these excellent work to the open-source community.

## License

[MIT License](https://github.com/oeway/ImJoy/blob/master/LICENSE)
