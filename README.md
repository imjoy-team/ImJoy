[![Build Status](https://travis-ci.com/oeway/ImJoy.svg?branch=master)](https://travis-ci.com/oeway/ImJoy)

<a href="https://imjoy.io" target="_blank"><img src="https://raw.githubusercontent.com/oeway/ImJoy/master/web/public/static/img/imjoy-logo-black.svg?sanitize=true" width="380"></img>
</a>

## Image Processing with Joy :)

ImJoy is a modern image processing framework bridging the web and the
Python ecosystem with plugins.

With ImJoy, developing and deploying advanced image processing methods, such as
deep learning, is simple and easy thanks to rich and interactive user interfaces.

<img src="https://github.com/oeway/ImJoy/raw/master/docs/assets/imjoy-screenshot.png" width="600px"></img>

Checkout the documentation for how to get started and more details
for how to develop ImJoy plugins: [ImJoy Docs](https://imjoy.io/docs)

## Quick Start

The easiest way to try ImJoy is to start with a plugin running directly in the browser.

For example, you can install our `Image Recongnition` plugin with [this link](https://imjoy.io/#/app?plugin=oeway/ImJoy-Plugins:Image%20Recognition&workspace=getting-started).
Clicking the link will open the ImJoy Web App and show a dialog to confirm the
installation of the plugin. Once installed, you can launch the plugin by clicking
the button `Image Recognition` in the plugin menu on the left. The demo plugin
will run a trained deep neural network model (MobileNet) to perform image
classification (e.g. identifying an elephant in an image).

![imjoy-interface](assets/imjoy-predict-elephant.png ':size=300')

This plugin uses your browser as its computational backend, so all
computation is done locally, no data will be sent to a remote server.

Besides running plugins in the browser, ImJoy provides the flexibility to keep
the GUI locally in your browser, and perform compuational tasks with Python.
These computations can be performed on your computer utilizing the full power
of the local GPU/CPU. The computional backend can also be launched on remote servers
including cloud servers on Amazon, Google Compute, or an institutional computing cluster.

To learn more details about ImJoy, please go to [ImJoy Docs](https://imjoy.io/docs/).


## Key Features of ImJoy
 * Minimal and flexible plugin powered web application
 * Serverless solution with offline support
 * Support mobile devices

 * Rich and interactive user interface powered by web technologies
   - use any existing web design libraries
   - Rendering multi-dimensional data in 3D with webGL, Three.js etc.
 * Easy-to-use workflow composition
 * Isolated workspaces for grouping plugins
 * Self-contained plugin prototyping and development
   - Built-in code editor, no extra IDE is needed for development
 * Powerful computational backend powered by the Python ecosystem
   - Support Javascript, native Python and web Python
   - Concurrent plugin execution through asynchronous programming
   - Run Python plugins in the browser with Webassembly
   - Browser plugins are isolated with secured sandboxes
   - Support `async/await` syntax for Python3 and Javascript
   - Support Conda virtual environments and pip packages for Python
   - Support libraries hosted on Github or CDNs for javascript
   - Easy plugin deployment and sharing through GitHub or Gist
   - Deploying your own plugin repository to Github
* Native support for n-dimensional arrays and tensors
   - Support ndarrays from Numpy for data exchange
   - Support Tensorflow.js and native Tensorflow for deep learning


## ImJoy architecture
By design, ImJoy itself provides very minimal task specific functionality.
It provides a flexible plugin interface to support plugins to extend the user
interface and perform computational tasks. Plugins can be designed to perform
simple tasks such as reading tif file, or more complex tasks such as training
a deep learning model for image segmentation.

<img src="https://github.com/oeway/ImJoy/raw/master/docs/assets/imjoy-overview.png" width="800px"></img>

Imjoy consists of **three parts**, each part can be extended with plugins:

1. **Web User Interface**. ImJoy is a web application. This means that using ImJoy is as easy as opening a web page from [ImJoy.io](https://imjoy.io/#/app). With ubiquitousness of the web, ImJoy provides unified user experience with browsers running on different operating systems, including mobile devices. The user can install plugins, and use them from the web interface. Besides a easy-to-use minimal interface, plugins can create their own window to create rich and interactive web interface by making use of the full power of the entire HTML/CSS/JS frameworks. For example, with [D3.js](https://d3js.org/) or [Three.js](https://threejs.org/), one can easily provide powerful interactive charts or 3D visualization plugins. For developers, the web interface is also used for writing and testing code. A stand-alone desktop application (desktopApp) is also provided.

1. **Web Computational Backend**. Computational tasks can be execution directly in the web browsers. Browsers are highly optimized and  JavaScript engines such as Google Chrome V8 and Firefox Quantum can be used to perform computational tasks. The performance of JavaScript Engines are close or even better than native languages such as Java and Python ([Benchmarks](https://benchmarksgame-team.pages.debian.net/benchmarksgame/faster/node-python3.html)). With HTML5/WebGL, browser can access to GPUs, allowing transparent GPU computing with libraries such as [Tensorflow.js](https://js.tensorflow.org/). With a new web standard called [WebAssembly](https://webassembly.org/), software/libraries written in high-level languages like C/C++/Rust can be ported to run in the browser. ImJoy uses ["Pyodide"](https://github.com/iodide-project/pyodide) to run Python plugins directly in the browser. The advantage of using the web computational backend is it requires almost zero setup and can run on mobile devices. Importantly, browser provides a unified, secured and sandboxed environment with maximized security and stability.

1. **Native Computational Backend**. This is supported with the installation of an additional Python module called ["ImJoy Plugin Engine"](https://github.com/oeway/ImJoy-Engine). This allows to access the entire Python ecosystem which covers most of the scientific computing applications. With [Conda](https://conda.io), ImJoy plugin engine handles the requirements of plugins automatically and provide isolate processes and virtual environments for different Python plugins. It provides maximum flexibility and has full access to the file system, GPU and other local or remote resources. The plugin engine can be launched either on the local machine, or remotely on a cloud server or a cluster to perform computationally intensive tasks, e.g. with institutional computing cluster, Amazon Cloud, or Google Compute.

## Repositories

Currently, ImJoy consists of the following repositories:
 - [ImJoy Web App (core)](https://github.com/oeway/ImJoy/) (this repository)
 - [ImJoy Plugin Engine](https://github.com/oeway/ImJoy-Engine)
 - [ImJoy Desktop App](https://github.com/oeway/ImJoy-App)

 - [ImJoy Plugin Repository](https://github.com/oeway/ImJoy-Plugins)
 - [ImJoy Demo Plugins](https://github.com/oeway/ImJoy-Demo-Plugins/)
 - [ImJoy Project Template](https://github.com/oeway/ImJoy-project-template)

## Documentation, questions and feedback

1. We provide a detailed [ImJoy Docs](https://imjoy.io/docs/). This includes
   a section with [frequently asked questions](user_manual?id=faqs).
2. For further help and questions for how to use ImJoy and process data with ImJoy, you can post on [image.sc](https://forum.image.sc/tags/imjoy).
3. To report bugs or suggest enhancements for ImJoy itself, please file a GitHub issue.


## Acknowledgements

 This is a non-exhaustive list of the open-source tools and libraries we used in ImJoy:

 -   [Joy.js](https://github.com/ncase/joy) (This is where the name `ImJoy` comes from!)
 -   [Jailed](https://github.com/asvd/jailed) (This helps ImJoy to isolate plugins)
 -   [Vue.js](https://vuejs.org/) (The main ImJoy App is written in Vue.js)
 -   [vue-grid-layout](https://github.com/jbaysolutions/vue-grid-layout) (For window management)
 -   [python-socketio](https://github.com/miguelgrinberg/python-socketio) (This how the plugin engine talk with the ImJoy app)
 -   [pyodide](https://github.com/iodide-project/pyodide) (Enables web python mode with WebAssembly)
 -   [conda](https://conda.io/) (The plugin engine uses Conda for managing virtual env. and packages)
 -   [docsify](https://github.com/docsifyjs/docsify/) (The ImJoy documentation is created with docsify)

 We thank all the authors for offering these excellent work to the open-source community.


## Support ImJoy

Please star the ImJoy GitHub repository to support ImJoy.

We would like ImJoy to be a community driven framework, everyone is welcome to
contribute your idea, feedback, plugins and code to the project.

We don't have a guidline for that yet, for now please feel free to use the [issues](https://github.com/oeway/ImJoy/issues) and fork the project.


## License

 [MIT License](https://github.com/oeway/ImJoy/blob/master/LICENSE)
