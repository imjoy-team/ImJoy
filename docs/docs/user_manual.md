# User Manual
## Architecture
Imjoy consists of **two main components**
1. The **ImJoy Web App**. Plugins can be developed in JavaScript for this web interface.
2. The **Plugin Engine**. The latest release of the plugin engine is available together with installation 
instructions on [GitHub](https://github.com/oeway/ImJoy-Python/releases). The plugin engine will try 
to upgrade itself from Github when it starts. Packages are managed by `conda` and `pip` which provides thus
access to the entire Python ecosystem. 

Complex computional tasks can be implemented in plugins, which run in the **Plugin Engine**. The Python Plugin Engine 
is connected with the ImJoy Web App through websockets and communicate with a customized remote procedure calls (RPC) based on `socket.io`.

<img src="./asserts/imjoy-architecture.png" width="800px"></img>

**Importantly**, ImJoy can run without the Python backend and thus without the need of any
installation. Plugins can then only implemented in JavaScript (such as [TensoFlow.js](https://js.tensorflow.org/)).

## Python Engine
The Plugin Engine allows to run Python plugins. You have to **install** it once from [GitHub](https://github.com/oeway/ImJoy-Python/releases), each time you launch it will check for updates. 

You have to **launch** the engine each time you re-start the ImJoy app. In order for the ImJoy app to connect to the engine, it requires a connection token. When you **launch the Plugin Engine** for the first time it will show a page in the browser with the connection token (blacked out below). This token can also be found in the terminal window that opens once you start the engine. 

<img
  src="./asserts/imjoy-connectionToken.png" width="600px"></img>

In the ImJoy interface press the 🚀 symbol to connect it to the Plugin Engine. This will open a dialog where you can specify the token in the `Connection token` field. Please note, that the token will be saved and you will not need to enter it anymore to connect to this Plugin Engine.

<img
  src="./asserts/imjoy-install-engine.png" width="600px"></img>
  
You have to launch and connect to the plugin engine, each time your restart an ImJoy analysis and you use plugins relying on the engine. If the engine is not connected, you will get an error message in the lower part of the ImJoy interface.
<img
  src="./asserts/imjoy-warning-connect-engine.png" width="600px"></img>


## TODO: Loading data to the workspace

## TODO: How to build workflows

## TODO: How to use workspaces


## Access the Plugin Engine from a command line interface
You can also access the Miniconda environment from the command line interface.

To access this environment on **Linux or MacOS**, you need to add `~/ImJoyApp/bin` to your `$PATH`:
```
export PATH=~/ImJoyApp/bin:$PATH

# now you can use `conda`, `pip`, `python` provided by the ImJoyApp 
which conda

```
For **Windows**, you can use powershell to add the ImJoyApp to `$env.Path`:
```
$env:Path = '%systemdrive%%homepath%\ImJoyApp;%systemdrive%%homepath%\ImJoyApp\Scripts;' + $env:Path;

# now you can use `conda`, `pip`, `python` provided by the ImJoyApp 
(Get-Command conda.exe).Path
```

**Note: The following sections assume you ran the above command in your current terminal.**

## Using ImJoy offline
You can also use ImJoy without being connected to the internet. For this, you need to install the latest version of the [**Plugin Engine**](https://github.com/oeway/ImJoy-Python/releases). You cant then serve the static ImJoy web app. 

You then have to
1. Update the `$PATH` settings as explained below.
    ```
    # linux and mac
    # export PATH=~/ImJoyApp/bin:$PATH

    # windows
    # $env:Path = '%systemdrive%%homepath%\ImJoyApp;%systemdrive%%homepath%\ImJoyApp\Scripts;' + $env:Path;
    ```
1. Execute the the following command in the terminal. This will download all files necessary for offline access.
    ```
    python -m imjoy --serve
    ``` 
2. You now have your locally available ImJoy web app that your can access in your browser with this url 
    ```
    [http://127.0.0.1:8080](http://127.0.0.1:8080).
    ```

Also notice that, even though ImJoy can run without internet, depending on the implementation of the plugin, some might be unusable when  offline.

## Use the Plugin Engine remotely
To perform computational intensive calculations you can launch the Plugin Engine remotely, e.g. on dedicated processing workstations computational clusters, or the cloud. This can be achieved with a few simple steps as detailed below
1. Install Python plugin engine on remote computer
0. Launch Python plugin engine on remote computer and allow access. Please note that the **ImJoy token system** prevent unauthorized access.
0. Connect from your local ImJoy instance to plugin engine on remote machine. 

#### Install and configure Plugin Engine on remote environment
Install the latest version of the Plugin Engine from [GitHub](https://github.com/oeway/ImJoy-Python/releases).

#### Launch the Plugin Engine on remote machine
The installation of the Plugin Engine will setup an **Miniconda environment** located in `~/ImJoyApp`. 

You can then launch the Plugin Engine from a terminal (e.g. by ssh) and specify a host to allow outside connections. Before doing this, you need to update you `$PATH` settings as explained above.
```
# linux and mac
# export PATH=~/ImJoyApp/bin:$PATH

# windows
# $env:Path = '%systemdrive%%homepath%\ImJoyApp;%systemdrive%%homepath%\ImJoyApp\Scripts;' + $env:Path;

python -m imjoy --serve --host=0.0.0.0
```
By default, the host will be set to `127.0.0.1`, which allows only local connections. To allow remote access, the host is set to `0.0.0.0`. In order to connect to the Plugin Engine, you will need the **connection token** that is displayed in the terminal after you launched the plugin engin. **KEEP THIS TOKEN PRIVATE!!!!**. Besides the token, you will also need the `hostname` or the IP adress of your remote machine.

#### Connect local ImJoy instance to remote machine
On your local machineT go to `http://IP-OF-YOUR-REMOTE:8080` to connect to the remote machine. In order to launch the plugin engine, you  simply have to specify the **connection token**.


## FAQs
 * Cannot start the ImJoy Plugin Engine any more?
 Try to run the following command in your terminal to upgrade ImJoy manually.
 
 ```python
export PATH=~/ImJoyApp/bin:$PATH
pip install -U git+https://github.com/oeway/ImJoy-Python#egg=imjoy
 ```
 
 * Can I use my existing Python?

  It depends whether it's a conda-compatible distribution or not. Try to type `conda -V` command, if you see a version number(e.g:`conda 4.3.30`), it means you can skip the Anaconda/Miniconda installation, and install ImJoy directly with your existing Python.
  
 * Can I use ImJoy with Python 2.7 or other version lower than Python 3.6?

  Yes, you can if you have the conda environment. You will be able to install and run ImJoy with Python version lower thant 3.6 (e.g.: Anaconda/Miniconda Python2.7). However, in this case, it will bootstrapping itself by creating a Python 3 environment (named `imjoy`) in order to run the actual plugin engine code. Therefore, Anaconda/Miniconda (Python3.6+ version) is still recommended if you have the choice.
  
 * What's the difference between [Anaconda](https://www.anaconda.com/download/) and [Miniconda](https://conda.io/miniconda.html)?

 Miniconda is just a reduced version of Anaconda. Since ImJoy only relies on `conda` which is included by both, you can choose either of them. If you like minimal installation, choose Miniconda. If you want all those packages which will be used for scientific computing(such as numpy, scipy, scikit-image etc.), choose Anaconda.
 
 * Why I can't connect to my plugin engine run on a remote computer?

 First, you needs to make sure the other computer with plugin engine can be accessed from your current network and not blocked by a firewall for example.

 Second, currently you can't use ImJoy.io loaded with `https` with the Plugin Engine, because modern browsers do not allow you to make a insecured connection within a SSL secured website. So, you will have to switch to the offline version.

 * Getting the "address already in use error"?

 If you see something like this: `OSError: [Errno 48] error while attempting to bind on address ('127.0.0.1', 8080): address already in use`, It means you have another instance running which uses the the port needed by the Plugin Engine. You need to find this instance  and kill that task if you don't known which one. For example, for port `8080`, you can run `lsof -n -i :8080 | grep LISTEN` in a terminal. This will list all process listening to the `8080` port, e.g. `+python3.6 1095 fmueller    7u  IPv4 0xb4b82ae29cbba843      0t0  TCP 127.0.0.1:http-alt (LISTEN)`. The process ID can be found directly after `python3.6`, in this case `1095`, you can then kill this process with `kill 1095`.

 * CommandNotFoundError with 'conda activate'

 By default, ImJoy uses `conda activate` to activate conda environments if it's available. However, you may need to setup `conda activate` according to here: https://github.com/conda/conda/releases/tag/4.4.0

