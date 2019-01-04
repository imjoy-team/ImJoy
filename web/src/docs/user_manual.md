# User Manual

## Plugin Engine
The Plugin Engine allows to run native Python plugins. You have to
[**install**](https://github.com/oeway/ImJoy-App/releases) the
by either downloading the ImJoy Desktop App or using a provided command line script.

The plugin engine will then check for updates at each launch.

If you use plugins relying on the engine, you have  **launch** the plugin engine
each time you re-start the ImJoy app. If the engine is not connected, you will
get an error message in the lower part of the ImJoy interface.
<img  src="./assets/imjoy-warning-connect-engine.png" width="600px"></img>

In order for the ImJoy app to connect to the engine, it requires a connection token.
When you **launch the Plugin Engine** for the first time it will show a page in
the browser with the connection token (indicated in green below). Alternatively, this
token can also be found in the terminal window that opens once you start the engine.

<img
  src="./assets/imjoy-connectionToken.png" width="600px"></img>

In the ImJoy interface press the 🚀 symbol to connect it to the Plugin Engine.
This will open a dialog where you can specify the token in the `Connection token` field.
Please note, that the token will be saved in the browser and you will not need to
enter it anymore to connect to this Plugin Engine. **KEEP THIS TOKEN PRIVATE!!!!**

<img
  src="./assets/imjoy-install-engine.png" width="600px"></img>


## Access the Plugin Engine from a command line interface
The installation of the Plugin Engine will setup an **Miniconda environment**
located in `~/ImJoyApp`. You can access this Miniconda environment from the
command line interface.

For **Linux or MacOS**, you need to add `~/ImJoyApp/bin` to your `$PATH`:
```
export PATH=~/ImJoyApp/bin:$PATH

# now you can use `conda`, `pip`, `python` provided from ~/ImJoyApp
which conda

# start the plugin engine
python -m imjoy

```

For **Windows**, you can use a powershell and add the ImJoyApp to `$env.Path`:
```
$env:Path = '%systemdrive%%homepath%\ImJoyApp;%systemdrive%%homepath%\ImJoyApp\Scripts;' + $env:Path;

# now you can use `conda`, `pip`, `python` provided from ~/ImJoyApp
(Get-Command conda.exe).Path

# start the plugin engine
python -m imjoy
```


## Using ImJoy offline
You can also use ImJoy without being connected to the internet. For this, you
need to install the latest version of the [**ImJoy App**](https://github.com/oeway/ImJoy-Engine/releases).
You can then serve the static ImJoy web app. Note that even though ImJoy can run
without internet, depending on the implementation of the plugin, some might be
unusable when offline.

You have to
1. Update the `$PATH` settings as explained [above](#access-the-plugin-engine-from-a-command-line-interface).
    ```
    # linux and mac
    # export PATH=~/ImJoyApp/bin:$PATH

    # windows
    # $env:Path = '%systemdrive%%homepath%\ImJoyApp;%systemdrive%%homepath%\ImJoyApp\Scripts;' + $env:Path;
    ```
1. Execute the following command in the terminal. This will download all files necessary for offline access.
    ```
    python -m imjoy --serve
    ```
2. You now have your locally available ImJoy web app that your can access in your browser
   with this url[(http://127.0.0.1:8080)](http://127.0.0.1:8080).


## Using the Plugin Engine remotely
To perform computational intensive calculations you can launch the Plugin Engine
remotely, e.g. on dedicated processing workstations, computational clusters, or
the cloud. Please note that the [**ImJoy token system**](#plugin-engine) prevent
unauthorized access.

Installing and connecting to such a remote Plugin engine can
be achieved in a few steps. You first install the plugin engine and configure it
for command line access as [describe above](#access-the-plugin-engine-from-a-command-line-interface).
You can launch the Plugin Engine from a terminal (e.g. by `ssh`) and specify the
host to allow outside connections. In order to connect to the Plugin Engine,
you will need the **connection token** and the `hostname` or the IP address
of your remote machine. Depending on your IT security restrictions,
you might need to contact your IT department.


1. Install Python plugin engine on the remote computer. If this remote machine is
  running under Linux, you can connect with SSH, and run a provided installation
  script: `wget https://raw.githubusercontent.com/oeway/ImJoy-Engine/master/utils/Linux_Install.sh  -O - | bash`.
  Otherwise, download it from [GitHub](https://github.com/oeway/ImJoy-App/releases).

0. Update the `$PATH` settings as explained [above](#launch-the-plugin-engine-on-remote-machine).
  For Linux or Mac, use `export PATH=~/ImJoyApp/bin:$PATH`

0. Launch Python plugin engine on remote computer and allow access. We recommend
  to login the remote server with SSH, start the plugin engine with `python -m imjoy --serve --host=0.0.0.0`.
  By default, the host is to `127.0.0.1`, which allows only local connections. For remote access, the host is set to `0.0.0.0`.
  The plugin engine will be launched and serve a copy of the ImJoy app through `http://YOUR_REMOTE_IP:8080`.
  At the end of the initialization process, it will display the **connection token**.
  Copy it from the terminal, since you will need it in the next step. **KEEP THIS TOKEN PRIVATE!!!!**

0. On your local machine, use your web browser to access the ImJoy app on the remote machine
  with `http://YOUR_REMOTE_IP:8080` (instead of `https://imjoy.io` ). Then connect
  to the plugin engine by using `http://YOUR_REMOTE_IP:8080` as host and
  the **connection token** you get when you start the engine.



<!--
## [ToDo]: Loading data to the workspace

## [ToDo]: How to build workflows

## [ToDo]: How to use workspaces
-->

## FAQs

### Plugin engine doesn't start (anymore)
When the plugin engine doesn't start, performing an ImJoy upgrade often resolves this
problem. For this, you can run the following command in your terminal:

```python
export PATH=~/ImJoyApp/bin:$PATH
pip install -U git+https://github.com/oeway/ImJoy-Engine#egg=imjoy
```

### Use existing Python
This depends whether it's a conda-compatible distribution or not. Try to type `conda -V` command, if you see a version number(e.g:`conda 4.3.30`), it means you can skip the Anaconda/Miniconda installation, and install ImJoy directly with your existing Python.

### Using ImJoy with Python 2.7 or version <3.6
Yes, if you the conda environment exists. You will be able to install and run ImJoy with Python version lower thant 3.6 (e.g.: Anaconda/Miniconda Python2.7). However, in this case, it will bootstrapping itself by creating a Python 3 environment (named `imjoy`) in order to run the actual plugin engine code. Therefore, Anaconda/Miniconda (Python3.6+ version) is still recommended if you have the choice.

### Difference between [Anaconda](https://www.anaconda.com/download/) and [Miniconda](https://conda.io/miniconda.html)
Miniconda is just a reduced version of Anaconda. Since ImJoy only relies on `conda` which is included by both, you can choose either of them. If you like minimal installation, choose Miniconda. If you want all those packages which will be used for scientific computing(such as numpy, scipy, scikit-image etc.), choose Anaconda.

### Can't connect to plugin engine running on a remote computer

First, you needs to make sure the other computer with plugin engine can be
accessed from your current network and is no blocked, e.g. by a firewall.

Second, currently you can't use ImJoy.io loaded with `https` with the Plugin Engine,
because modern browsers do not allow you to make a insecure connection within a SSL
secured website. So, you will have to switch to the offline version.

Currently, the recommended way to use ImJoy on a remote computer:
 1. Login the remote server with SSH, start the plugin engine with
    `python -m imjoy --serve --host=0.0.0.0`. The plugin engine will
    download a copy of ImJoy app and serve it through `http://YOUR_REMOTE_IP:8080`.
    In the meantime, it will give your a **connection token**, copy it from the
    terminal and you will need it in the next step.

 2. Use your web browser to access `http://YOUR_REMOTE_IP:8080`
    (instead of `https://imjoy.io` ), then you can connect to the plugin engine
    by using `http://YOUR_REMOTE_IP:8080` as host and the **connection token** you
    get when you start the engine.

Also notice that, the ImJoy web app served from your plugin engine are completely isolated from the one from https://imjoy.io, meaning that the installed plugins, data are not shared.

### Plugin engine error "address already in use"
If you see something like this: `OSError: [Errno 48] error while attempting to bind on address ('127.0.0.1', 8080): address already in use`, It means you have another instance running which uses the port needed by the Plugin Engine. You need to find this instance  and kill that task if you don't known which one. For example, for port `8080`, you can run `lsof -n -i :8080 | grep LISTEN` in a terminal. This will list all process listening to the `8080` port, e.g. `+python3.6 1095 fmueller    7u  IPv4 0xb4b82ae29cbba843      0t0  TCP 127.0.0.1:http-alt (LISTEN)`. The process ID can be found directly after `python3.6`, in this case `1095`, you can then kill this process with `kill 1095`.

### CommandNotFoundError with 'conda activate'
By default, ImJoy uses `conda activate` to activate conda environments if it's available. However, you may need to setup `conda activate` according to here: https://github.com/conda/conda/releases/tag/4.4.0
