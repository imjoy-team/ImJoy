# User Manual

Here we describe in more detail the main concepts of ImJoy and how it can
be used.

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

1. **Native Computational Backend**. This is supported with the installation of an additional Python module called ["ImJoy Plugin Engine"](https://github.com/oeway/ImJoy-Engine). This allows to access the entire Python ecosystem which covers most of the scientific computing applications. With [Conda](https://conda.io), ImJoy plugin engine handles the requirements of plugins automatically and provide isolate processes and virtual environments for different Python plugins. It provides maximum flexibility and has full access to the file system, GPU and other local or remote resources. The plugin engine can be launched either on the local machine, or remotely on a cloud server or a cluster to perform computationally intensive tasks, e.g. with institutional computing cluster, Amazon Cloud, or Google Compute.

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
Engine allows to run native Python (`native-python`) plugins. We provide two ways
to obtain this engine:

1.  The plugin engine is included in the ImJoy Desktop App. After installing the
    [Desktop App](https://github.com/oeway/ImJoy-App/releases), you can start the engine
    with the button `START PLUGINE ENGINE`.
    
    ![imjoy-app-start-screen](assets/imjoy-app-start-screen.png ':size=400')

2. You can download and install it with a command line script as described [here](https://github.com/oeway/ImJoy-engine).

Once you start the engine, it will automatically check for updates.

You can then connect to the engine either from the Imjoy Web App or Desktop App.
Click the 🚀 symbol located at the top-right corner and select `Add Plugin Engine 🚀`. This will open a dialog and
ask you for the `Connection token` which can be obtained from your Plugin Engine window or terminal.

![imjoy-connection-token](assets/imjoy-connection-token.png ':size=400')

You can choose to connect to the same computer or another computer. 

If you choose to connect to another computer or server (e.g. on dedicated processing workstations, computational clusters, or
the cloud), what you need is to fill in the corresponding `Plugin Engine URL` and the `Connection token`.

Please note, that the connection token will be saved in the browser and you will
not need to enter it anymore to connect to this Plugin Engine.
**KEEP THIS TOKEN PRIVATE!!!!**

### Setup a remote plugin engine

By default a local plugin engine won't allow access from outside. In order to make your plugin engine accessible from outside, the easiest way is to use an existing tunnelling service which will expose your plugin engine through a secured public URL.

There are at least several such services, for example, you can use Telebit to generate an public URL for your plugin eneing:
1. goto https://telebit.cloud/ and follow the installation guide to install Telebit and register with your email.
2. Once success, you will get a permenent URL (e.g.: https://shaggy-pig-23.telebit.io ) which can be used later.
3. Now if you start your plugin engine, and run `~/telebit http 9527`
4. You or your collabrators can then access your plugin engine remotely with engine url (e.g. https://shaggy-pig-23.telebit.io) and the connection token you get previously.


The nice thing about using telebit is that you will have a fixed URL. Alternatively, you can also try with [ngrok](https://ngrok.com/) if Telebit did not work for you. Importantly, your command will be `ngrok http --host-header=rewrite 9527`. Notice that, although you can use ngrok without signup, but you will have a certain time limit and connection number.


<!--
## [ToDo]: Loading data to the workspace

## [ToDo]: How to use workspaces
-->

## FAQs

### Plugin engine doesn't start (anymore)
When the plugin engine doesn't start, performing an ImJoy upgrade often resolves this
problem. For this, you can run the following command in your terminal:

```bash
export PATH=~/ImJoyApp/bin:$PATH
pip install -U git+https://github.com/oeway/ImJoy-Engine#egg=imjoy
```

### Use existing Python
This depends whether it's a conda-compatible distribution or not. Try to type `conda -V` command, if you see a version number(e.g:`conda 4.3.30`), it means you can skip the Anaconda/Miniconda installation, and install ImJoy directly with your existing Python.

### Using ImJoy with Python 2.7 or version <3.6
Yes, if you the conda environment exists. You will be able to install and run ImJoy with Python version lower than 3.6 (e.g.: Anaconda/Miniconda Python2.7). However, in this case, it will bootstrapping itself by creating a Python 3 environment (named `imjoy`) in order to run the actual plugin engine code. Therefore, Anaconda/Miniconda (Python3.6+ version) is still recommended if you have the choice.

### Can't connect to plugin engine running on a remote computer

First, you needs to make sure the other computer with plugin engine can be
accessed from your current network and is no blocked, e.g. by a firewall.

Second, currently you can't use ImJoy.io loaded with `https` with the Plugin Engine,
because modern browsers do not allow you to make a insecure connection within a SSL
secured website. So, you will have to switch to the offline version.

Currently, the recommended way to use ImJoy on a remote computer:
 1. Login the remote server with SSH, start the plugin engine with
    `python -m imjoy --serve --host=0.0.0.0`. The plugin engine will
    download a copy of ImJoy app and serve it through `http://YOUR_REMOTE_IP:9527`.
    In the meantime, it will give your a **connection token**, copy it from the
    terminal and you will need it in the next step.

 2. Use your web browser to access `http://YOUR_REMOTE_IP:9527`
    (instead of `https://imjoy.io` ), then you can connect to the plugin engine
    by using `http://YOUR_REMOTE_IP:9527` as host and the **connection token** you
    get when you start the engine.

Also notice that, the ImJoy web app served from your plugin engine are completely isolated from the one from https://imjoy.io, meaning that the installed plugins, data are not shared.

### Plugin engine error "address already in use"
If you see something like this: `OSError: [Errno 48] error while attempting to bind on address ('127.0.0.1', 9527): address already in use`, It means you have another instance running which uses the port needed by the Plugin Engine. You need to find this instance  and kill that task if you don't known which one. For example, for port `9527`, you can run `lsof -n -i :9527 | grep LISTEN` in a terminal. This will list all process listening to the `9527` port, e.g. `+python3.6 1095 fmueller    7u  IPv4 0xb4b82ae29cbba843      0t0  TCP 127.0.0.1:http-alt (LISTEN)`. The process ID can be found directly after `python3.6`, in this case `1095`, you can then kill this process with `kill 1095`.

### CommandNotFoundError with 'conda activate'
By default, ImJoy uses `conda activate` to activate conda environments if it's available. However, you may need to setup `conda activate` according to here: https://github.com/conda/conda/releases/tag/4.4.0
