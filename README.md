![Powered by ImJoy](https://imjoy.io/static/badge/powered-by-imjoy-badge.svg)
![License](https://img.shields.io/github/license/imjoy-team/imjoy-engine.svg)
[![ImJoy Version](https://img.shields.io/badge/dynamic/json.svg?color=success&label=imjoy&prefix=v&query=version&url=https://raw.githubusercontent.com/imjoy-team/ImJoy/master/web/package.json)](https://imjoy.io/#/app) 
[![Build Site](https://github.com/imjoy-team/ImJoy/workflows/Build%20Site/badge.svg)](https://github.com/imjoy-team/ImJoy/actions)
[![Join the chat at https://gitter.im/imjoy-dev/community](https://badges.gitter.im/imjoy-dev/community.svg)](https://gitter.im/imjoy-dev/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![image.sc forum](https://img.shields.io/badge/dynamic/json.svg?label=forum&url=https%3A%2F%2Fforum.image.sc%2Ftags%2Fimjoy.json&query=%24.topic_list.tags.0.topic_count&colorB=brightgreen&suffix=%20topics&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAABPklEQVR42m3SyyqFURTA8Y2BER0TDyExZ+aSPIKUlPIITFzKeQWXwhBlQrmFgUzMMFLKZeguBu5y+//17dP3nc5vuPdee6299gohUYYaDGOyyACq4JmQVoFujOMR77hNfOAGM+hBOQqB9TjHD36xhAa04RCuuXeKOvwHVWIKL9jCK2bRiV284QgL8MwEjAneeo9VNOEaBhzALGtoRy02cIcWhE34jj5YxgW+E5Z4iTPkMYpPLCNY3hdOYEfNbKYdmNngZ1jyEzw7h7AIb3fRTQ95OAZ6yQpGYHMMtOTgouktYwxuXsHgWLLl+4x++Kx1FJrjLTagA77bTPvYgw1rRqY56e+w7GNYsqX6JfPwi7aR+Y5SA+BXtKIRfkfJAYgj14tpOF6+I46c4/cAM3UhM3JxyKsxiOIhH0IO6SH/A1Kb1WBeUjbkAAAAAElFTkSuQmCC)](https://forum.image.sc/tags/imjoy)



<a href="https://imjoy.io" target="_blank" ><img src="https://raw.githubusercontent.com/imjoy-team/ImJoy/master/web/public/static/img/imjoy-logo-black.svg?sanitize=true" width="380"></img>
</a>

## ImJoy - Deep Learning Made Easy!

---

**New**: The ImJoy paper is out [on Nature Methods](https://www.nature.com/articles/s41592-019-0627-0), check it out via the [free link](https://rdcu.be/bYbGO).

**New**: We are working actively on supporting Jupyter notebook based engines, ImJoy now comes with a `Jupyter Engine Manager`, which enables running Python plugins via [MyBinder.org](https://mybinder.org) or your own Jupyter notebook server. With the preview version, you will be able to try and test ImJoy Python plugins without additional setup. Stay tuned, more enhanced features will come soon.

---

ImJoy is a plugin powered hybrid computing platform for deploying deep learning applications such as advanced image analysis tools.

ImJoy runs on mobile and desktop environment cross different operating systems, plugins can run in the browser, localhost, remote and cloud servers.

With ImJoy, delivering Deep Learning tools to the end users is simple and easy thanks to
its flexible plugin system and sharable plugin URL. Developer can easily add rich and interactive web interfaces to existing Python code.

<img src="https://github.com/imjoy-team/ImJoy/raw/master/docs/assets/imjoy-overview.jpg" width="600px"></img>

Checkout the documentation for how to get started and more details
for how to develop ImJoy plugins: [ImJoy Docs](https://imjoy.io/docs)

## Key Features of ImJoy
 * Minimal and flexible plugin powered web application
 * Server-less progressive web application with offline support
 * Support mobile devices

 * Rich and interactive user interface powered by web technologies
   - use any existing web design libraries
   - Rendering multi-dimensional data in 3D with webGL, Three.js etc.
 * Easy-to-use workflow composition
 * Isolated workspaces for grouping plugins
 * Self-contained plugin prototyping and development
   - Built-in code editor, no extra IDE is needed for development
 * Powerful and extendable computational backends for browser, local and cloud computing
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


**ImJoy greatly accelerates the development and dissemination of new tools.** You can develop plugins in ImJoy, deploy the plugin file to Github, and share the plugin URL through social networks. Users can then use it by a single click, even on a mobile phone

<a href="https://imjoy.io/#/app?p=imjoy-team/example-plugins:Skin-Lesion-Analyzer" target="_blank">
  <img src="https://github.com/imjoy-team/ImJoy/raw/master/docs/assets/imjoy-sharing.jpg" width="500px"></img>
</a>

## Quick Start

The easiest way to try ImJoy is to start with a plugin running directly in the browser.

For example, you can install our `Image Recognition` plugin with [this link](https://imjoy.io/#/app?plugin=imjoy-team/imjoy-plugins:Image%20Recognition&workspace=getting-started).
Clicking the link will open the ImJoy Web App and show a dialog to confirm the
installation of the plugin. Once installed, you can launch the plugin by clicking
the button `Image Recognition` in the plugin menu on the left. The demo plugin
will run a trained deep neural network model (MobileNet) to perform image
classification (e.g. identifying an elephant in an image).

<img src="https://github.com/imjoy-team/ImJoy/raw/master/docs/assets/imjoy-predict-elephant.png" width="300px"></img>

This plugin uses your browser as its computational backend, so all
computation is done locally, no data will be sent to a remote server.

Besides running plugins in the browser, ImJoy provides the flexibility to keep
the GUI locally in your browser, and perform computational tasks with Python.
These computations can be performed on your computer utilising the full power
of the local GPU/CPU. The computational backend can also be launched on remote servers
including cloud servers on Amazon, Google Compute, or an institutional computing cluster.

Previously, running Python plugins would require installation of the Plugin Engine. However, now we have added experimental support for running Python plugins via the servers provided by MyBinder.org.
You can try for example the [DeepBindScan](https://imjoy.io/#/app?plugin=imjoy-team/imjoy-plugins:DeepBindScan) plugin without any installation.

To learn more details about ImJoy, please go to [ImJoy Docs](https://imjoy.io/docs/).

## Repositories

Currently, ImJoy consists of the following repositories:
 - [ImJoy RPC](https://github.com/imjoy-team/imjoy-rpc/)
 - [ImJoy Core](https://github.com/imjoy-team/imjoy-core/)
 - [ImJoy Web App](https://github.com/imjoy-team/ImJoy/) (this repository)
 - [ImJoy Plugin Engine](https://github.com/imjoy-team/imjoy-engine)
 - [ImJoy Plugin Repository](https://github.com/imjoy-team/imjoy-plugins)

## Documentation, questions and feedback

1. We provide a detailed [ImJoy Docs](https://imjoy.io/docs/). This includes
   a section with [frequently asked questions](https://imjoy.io/docs/#/user_manual?id=faqs).
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

If you use ImJoy in your project, please add one of the badges to your code repository or website: ![Powered by ImJoy](https://imjoy.io/static/badge/powered-by-imjoy-badge.svg) ![Launch ImJoy](https://imjoy.io/static/badge/launch-imjoy-badge.svg), see how to [add an ImJoy badge](https://imjoy.io/docs/#/development?id=add-an-imjoy-badge).

We would like ImJoy to be a community driven framework, everyone is welcome to
contribute your idea, feedback, plugins and code to the project.

We don't have a guideline for that yet, for now please feel free to use the [issues](https://github.com/imjoy-team/ImJoy/issues) and fork the project.

## Citation

Please cite our paper on Nature Methods ([https://www.nature.com/articles/s41592-019-0627-0](https://www.nature.com/articles/s41592-019-0627-0), free access: https://rdcu.be/bYbGO ):

`Ouyang, W., Mueller, F., Hjelmare, M. et al. ImJoy: an open-source computational platform for the deep learning era. Nat Methods (2019) doi:10.1038/s41592-019-0627-0`

## Code of Conduct

Help us keep the ImJoy community open and inclusive. Please read and follow our [Code of Conduct](https://github.com/imjoy-team/ImJoy/blob/master/docs/CODE_OF_CONDUCT.md).

## License

[MIT License](https://github.com/imjoy-team/ImJoy/blob/master/LICENSE)
