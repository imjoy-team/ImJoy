# How-tos Guide

## Setup a local plugin engine

To obtain the plugin engine, you need to download and install it with a command line script as described [here](https://github.com/imjoy-team/imjoy-engine).

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



<!--
## [ToDo]: Loading data to the workspace

## [ToDo]: How to use workspaces
-->


## Setup a remote plugin engine

By default a local plugin engine won't allow access from outside, and your browser won't allow imjoy.io to connect to a plugin engine served with `http` connection because it's not secured. You will need an engine URL starts with `https` if you want to connect to it remotely. ( In Chrome and FireFox you can connect with `http` only to localhost with `127.0.0.1`, but not in Safari. ) 

The easiest way to encrypt your plugin engine connection is to use an existing tunnelling service which will expose your plugin engine through a secured public URL starts with `https`. 
And that will make your plugin engine accessible from outside your network. 

There are at least several such services, for example, you can use Telebit to generate an public URL for your plugin eneing:
1. goto https://telebit.cloud/ and follow the installation guide to install Telebit and register with your email.
2. Once success, you will get a permenent URL (e.g.: https://shaggy-pig-23.telebit.io ) which can be used later.
3. Now if you start your plugin engine, and run `~/telebit http 9527`
4. You or your collabrators can then access your plugin engine remotely with engine url (e.g. https://shaggy-pig-23.telebit.io) and the connection token you get previously.


The nice thing about using telebit is that you will have a fixed URL. Alternatively, you can also try with [ngrok](https://ngrok.com/) if Telebit did not work for you. Importantly, your command will be `ngrok http --host-header=rewrite 9527`. Notice that, although you can use ngrok without signup, but you will have a certain time limit and connection number.



## FAQs

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
    `imjoy --jupyter --host=0.0.0.0`. The plugin engine will
    download a copy of ImJoy app and serve it through `http://YOUR_REMOTE_IP:9527`.
    In the meantime, it will give your a **connection token**, copy it from the
    terminal and you will need it in the next step.

 2. Use your web browser to access `http://YOUR_REMOTE_IP:9527`
    (instead of `https://imjoy.io` ), then you can connect to the plugin engine
    by using `http://YOUR_REMOTE_IP:9527` as host and the **connection token** you
    get when you start the engine.

Also notice that, the ImJoy web app served from your plugin engine are completely isolated from the one from https://imjoy.io, meaning that the installed plugins, data are not shared.

### CommandNotFoundError with 'conda activate'
By default, ImJoy uses `conda activate` to activate conda environments if it's available. However, you may need to setup `conda activate` according to here: https://github.com/conda/conda/releases/tag/4.4.0
