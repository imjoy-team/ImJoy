# ImJoy
## Image processing with joy :)
[![Build Status](https://travis-ci.org/oeway/ImJoy.svg?branch=master)](https://travis-ci.org/oeway/ImJoy)


ImJoy is a modern image processing framework aims to bridge the web and the Python ecosystem with plugins.

With ImJoy, developing and deploying advanced image processing methods such as deep learning with rich and interactive user interface has never been so easy.

<img src="https://github.com/oeway/ImJoy/raw/master/docs/docs/asserts/imjoy-screenshot.png" width="600px"></img>

Currently, ImJoy consists of three repositories:
 * [the ImJoy web application](https://github.com/oeway/ImJoy/) (this repository)
 * [the ImJoy plugin engine](https://github.com/oeway/ImJoy-Engine)
 * [the ImJoy plugin repository](https://github.com/oeway/ImJoy-Plugins)

Getting started and documentations for the development: [ImJoy Docs](https://imjoy.io/docs)

## Key Features of ImJoy
 * Serverless solution with offline-first design
 * Easy-to-use workflow composition
 * Extendable plugin interface
   - Support Python and Javascript
   - Javascript plugins are isolated with secured sandboxes
   - Run Python plugins in the browser completely
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

# Documentation

Please refer to: [ImJoy Docs](https://imjoy.io/docs/)

# Support ImJoy

Please star the ImJoy repo to support ImJoy.

We would like ImJoy to be a community driven framework, everyone is welcome to contribute your idea, feedback, plugins and code to the project. We don't have a guidline for that yet, for now please feel free to use the [issues](https://github.com/oeway/ImJoy/issues) and fork the project.
