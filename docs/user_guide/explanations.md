# Explanations


## Glossary

-   **ImJoy app** - Interface running either in the browser or as a standalone app
    allowing to control ImJoy.
-   **Plugin** - Added functionality to ImJoy to either enhance the user interface
    or perform computational tasks. Plugins developed in Python require the Plugin Engine.
-   **Plugin Engine** - Python program to execute plugins in the background for heavy
    computations.
-   **Operators [ops]** - One plugin can allow to perform tasks with a set of
    operators ("ops"). These ops can be used in a workflow or accessed from the plugin menu.
-   **Workspace** - Isolated work environments with a distinct set of plugins.
    Allows to perform independent calculations.



## ImJoy architecture
ImJoy provides a flexible plugin interface to support plugins to extend the user
interface and perform computational tasks. Plugins can be used to perform
simple tasks such as reading tif file, or more complex tasks such as training
a deep learning model for image segmentation.

![imjoy-architecture-overview](assets/imjoy-architecture-overview.png ':size=800')

Imjoy consists of **three parts**, each part can be extended with plugins:

1. **Web User Interface**. ImJoy is a web application. This means that using ImJoy is as easy as opening a web page from [ImJoy.io](https://imjoy.io/#/app). With ubiquitousness of the web, ImJoy provides unified user experience with browsers running on different operating systems, including mobile devices. The user can install plugins, and use them from the web interface. Besides a easy-to-use minimal interface, plugins can create their own window to create rich and interactive web interface by making use of the full power of the entire HTML/CSS/JS frameworks. For example, with [D3.js](https://d3js.org/) or [Three.js](https://threejs.org/), one can easily provide powerful interactive charts or 3D visualisation plugins. For developers, the web interface is also used for writing and testing code. A stand-alone desktop application (desktopApp) is also provided.

1. **Web Computational Backend**. Computational tasks can be execution directly in the web browsers. Browsers are highly optimised and  JavaScript engines such as Google Chrome V8 and Firefox Quantum can be used to perform computational tasks. The performance of JavaScript Engines are close or even better than native languages such as Java and Python ([Benchmarks](https://benchmarksgame-team.pages.debian.net/benchmarksgame/faster/node-python3.html)). With HTML5/WebGL, browser can access to GPUs, allowing transparent GPU computing with libraries such as [Tensorflow.js](https://js.tensorflow.org/). With a new web standard called [WebAssembly](https://webassembly.org/), software/libraries written in high-level languages like C/C++/Rust can be ported to run in the browser. ImJoy uses ["Pyodide"](https://github.com/iodide-project/pyodide) to run Python plugins directly in the browser. The advantage of using the web computational backend is it requires almost zero setup and can run on mobile devices. Importantly, browser provides a unified, secured and sandboxed environment with maximised security and stability.

1. **Native Computational Backend**. This is supported with the installation of an additional Python module called ["ImJoy Plugin Engine"](https://github.com/imjoy-team/imjoy-engine). This allows to access the entire Python ecosystem which covers most of the scientific computing applications. With [Conda](https://conda.io), ImJoy plugin engine handles the requirements of plugins automatically and provide isolate processes and virtual environments for different Python plugins. It provides maximum flexibility and has full access to the file system, GPU and other local or remote resources. The plugin engine can be launched either on the local machine, or remotely on a cloud server or a cluster to perform computationally intensive tasks, e.g. with institutional computing cluster, Amazon Cloud, or Google Compute.

## ImJoy App

ImJoy can be used directly from your browser (Chrome or Firefox) as the [ImJoy Web App](https://imjoy.io/#/app).

ImJoy is built with a new standard called [Progressive Web App](), which brings enhanced user experience.
Importantly, a technique called `service worker` allow ImJoy to run and most of the plugins run without internet.

While you can already benifit from the PWA support by go to https://imjoy.io with browsers including Chrome, FireFox and Safari.

The recommended way to use it is to install it as PWA, for example, in Chrome you will find the "Install ImJoy.IO" option when you open https://imjoy.io:

![imjoy-install-pwa](assets/imjoy-install-pwa.gif ':size=600')

ImJoy App support mobile devices and tablet, you can find similar install or add to home screen options on mobile browsers such as Safari on iOS and Chrome on Android.

Note that even though ImJoy can run without internet, depending on particular
plugin implementations, some plugins may still require internet access to function.

## Plugin Engine
For more advanced processing, the **Python Plugin Engine** is required. The Plugin
Engine allows to run native Python (`native-python`) plugins. 
