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
