[![ImJoy Version](https://img.shields.io/badge/dynamic/json.svg?color=success&label=imjoy&prefix=v&query=version&url=https://raw.githubusercontent.com/oeway/ImJoy/master/web/package.json)](https://imjoy.io/#/app) [![Engine Version](https://img.shields.io/badge/dynamic/json.svg?color=success&label=imjoy%20engine&prefix=v&query=version&url=https%3A%2F%2Fraw.githubusercontent.com%2Foeway%2FImJoy-Engine%2Fmaster%2Fimjoy%2FVERSION)](https://github.com/oeway/ImJoy-Engine) [![Build Status](https://travis-ci.com/oeway/ImJoy.svg?branch=master)](https://travis-ci.com/oeway/ImJoy) [![Netlify Status](https://api.netlify.com/api/v1/badges/3aa71748-2778-4c31-a9ea-f7fdf5445fd1/deploy-status)](https://app.netlify.com/sites/imjoy/deploys) [![DOI](https://zenodo.org/badge/137741898.svg)](https://zenodo.org/badge/latestdoi/137741898) ![GitHub](https://img.shields.io/github/license/oeway/ImJoy-Engine.svg)


<a href="https://imjoy.io" target="_blank" ><img src="https://raw.githubusercontent.com/oeway/ImJoy/master/web/public/static/img/imjoy-logo-black.svg?sanitize=true" width="380"></img>
</a>

## ImJoy - Deep Learning Made Easy!

**New**: Preprint on Arxiv: [https://arxiv.org/abs/1905.13105](https://arxiv.org/abs/1905.13105)

ImJoy is a plugin powered hybrid computing platform for deploying deep learning applications such as advanced image analysis tools.

ImJoy runs on mobile and desktop environment cross different operating systems, plugins can run in the browser, localhost, remote and cloud servers.

With ImJoy, delivering Deep Learning tools to the end users is simple and easy thanks to
its flexible plugin system and sharable plugin URL. Developer can easily add rich and interactive web interfaces to existing Python code.


<img src="https://github.com/oeway/ImJoy/raw/master/docs/assets/imjoy-overview.jpg" width="600px"></img>

Checkout the documentation for how to get started and more details
for how to develop ImJoy plugins: [ImJoy Docs](https://imjoy.io/docs)

## Key Features of ImJoy
 * Minimal and flexible plugin powered web application
 * Server-less solution with offline support
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


**ImJoy greatly accelerates the development and dissemination of new tools.** You can develop plugins in ImJoy, deploy the plugin file to Github, and share the plugin URL through social networks. Users can then use it by a single click, even on a mobile phone

<a href="https://imjoy.io/#/app?p=imjoy-team/example-plugins:Skin-Lesion-Analyzer 
" target="_blank"><img src="https://github.com/oeway/ImJoy/raw/master/docs/assets/imjoy-sharing.jpg" height="500px"></img></a>


## Quick Start

The easiest way to try ImJoy is to start with a plugin running directly in the browser.

For example, you can install our `Image Recognition` plugin with [this link](https://imjoy.io/#/app?plugin=oeway/ImJoy-Plugins:Image%20Recognition&workspace=getting-started).
Clicking the link will open the ImJoy Web App and show a dialog to confirm the
installation of the plugin. Once installed, you can launch the plugin by clicking
the button `Image Recognition` in the plugin menu on the left. The demo plugin
will run a trained deep neural network model (MobileNet) to perform image
classification (e.g. identifying an elephant in an image).

<img src="https://github.com/oeway/ImJoy/raw/master/docs/assets/imjoy-predict-elephant.png" width="300px"></img>

This plugin uses your browser as its computational backend, so all
computation is done locally, no data will be sent to a remote server.

Besides running plugins in the browser, ImJoy provides the flexibility to keep
the GUI locally in your browser, and perform computational tasks with Python.
These computations can be performed on your computer utilising the full power
of the local GPU/CPU. The computational backend can also be launched on remote servers
including cloud servers on Amazon, Google Compute, or an institutional computing cluster.

To learn more details about ImJoy, please go to [ImJoy Docs](https://imjoy.io/docs/).

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

We don't have a guideline for that yet, for now please feel free to use the [issues](https://github.com/oeway/ImJoy/issues) and fork the project.

## Citation

Please cite our preprint on Arxiv ([https://arxiv.org/abs/1905.13105](https://arxiv.org/abs/1905.13105)):

```
@article{ouyang2019imjoy,
    title={ImJoy: an open-source computational platform for the deep learning era},
    author={Wei Ouyang and Florian Mueller and Martin Hjelmare and Emma Lundberg and Christophe Zimmer},
    year={2019},
    eprint={1905.13105},
    archivePrefix={arXiv},
    primaryClass={cs.LG}
}
```

## License

[MIT License](https://github.com/oeway/ImJoy/blob/master/LICENSE)
