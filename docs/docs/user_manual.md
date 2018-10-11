# User Manual
## Architecture
Imjoy consists of **two main components**
1. The **ImJoy Web App**. Plugins can be developed in JavaScript for this web interface.
2. The **Plugin Engine**. Packages are managed by `conda` and `pip` which provides thus
access to the entire Python ecosystem. Complex computional tasks can be implemented
in plugins, which run in the **Plugin Engine**. The Python Plugin Engine is connected with the ImJoy Web App through websockets and communicate with a customized remote procedure calls (RPC) based on `socket.io`.

<img src="./asserts/imjoy-architecture.png" width="800px"></img>

**Importantly**, ImJoy can run without the Python backend and thus without the need of any
installation. Plugins can then only implemented in JavaScript (such as [TensoFlow.js](https://js.tensorflow.org/)).

## TODO: Loading data to the workspace

## TODO: How to build workflows

## TODO: How to use workspaces

## Going offline

If you have already installed the **Python Plugin Engine**, then you can run ImJoy in offline mode. What you do is to run the engine with `python -m imjoy --serve` . And it will download all the files for offline access, after that, if you run `python -m imjoy` in the **same directory**, you will have your personal ImJoy web app which can be access by [http://127.0.0.1:8080](http://127.0.0.1:8080).

Also notice that, even though ImJoy can run without internet, depends on the implementation of the plugin, some plugins maybe unusable when you go offline.

## Use the Plugin Engine remotely
You can launch the Python engine remotely to perform heavy computations, e.g. on dedicated processing workstations, computational clusters, or the cloud. This can be achieved with a few simple steps as detailed below
1. Install Python plugin engine on remote computer
0. Launch Python plugin engine on remote computer and allow access. Please note that the **ImJoy token system** prevent unauthorized access.
0. Connect from your local ImJoy instance to plugin engine on remote machine. 

#### Install and configure plugin engine on remote environment
The latest release of the plugin engine is available together with installation instructions on [GitHub](https://github.com/oeway/ImJoy-Python/releases). 

**TODO** How to handle updates? 

#### Launch plugin engine on remote machine
The installation of the plugin engine will setup an **Miniconda environment** located in `~/ImJoyApp`.

To access this environment on **Linux or MacOS**, you need to add `~/ImJoyApp/bin` to your `$PATH`:
```
export PATH=~/ImJoyApp/bin:$PATH

# now you can use `conda`, `pip`, `python` provided by the ImJoyApp 
which conda

```
For **Windows**, you can use powershell to add the ImJoyApp to `$env.Path`:
```
$env:Path = '%systemdrive%%homepath%\ImJoyApp;%systemdrive%%homepath%\ImJoyApp\Scripts;' + $env:Path;
```

You can then launch the Plugin engine from a terminal (e.g. by ssh) and specify a host to allow outside connection:
```
  python -m imjoy --serve --host=0.0.0.0
```
By default, the host will be set to `127.0.0.1`, which allows only local connection. To allow remote access the host is set to 0.0.0.0. In order to connect to the Python engine, you will need the **token** that is displayed in ther terminal. **KEEP THIS TOKEN PRIVATE!!!!**. Besides the token, you will also need the `hostname` or the IP adress of your remote machine.

#### Connect local ImJoy instance to 
On your local machineThen go to http://IP-OF-YOUR-REMOTE:8080 to connect to the remote machine. In order to launch the plugin engine, you have simply to specify the **token**.
