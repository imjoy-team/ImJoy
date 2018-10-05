# ImJoy architecture

Here we provide and overview of the design of ImJoy and how plugins can be developed.

Imjoy consists of **two main components**
1. A **web interface** (JS, HTML, WebGL). Plugins can be developed in JavaScript for this web interface.
2. **Computational Python backend**. Packages are managed by `conda` and `pip` which provides thus
access to the entire Python ecosystem. Complex computional tasks can be implemented
in plugins, which run in the **Python Plugin Engine** - a small python library we developed for ImJoy. The Python Plugin Engine is connected with the ImJoy web interface through websockets and communicate with a customized remote procedure calls (RPC) based on `socket.io`.

<img src="./asserts/imjoy-overview.png" width="800px"></img>

**Importantly**, ImJoy can run without the Python backend and thus without the need of any
installation. Plugins can then only implemented in JavaScript (such as [TensoFlow.js](https://js.tensorflow.org/)).

Currently, ImJoy consists of three repositories:
 * [web application](https://github.com/oeway/ImJoy/)
 * [plugin engine](https://github.com/oeway/ImJoy-Python)
 * [plugin repository](https://github.com/oeway/ImJoy-Plugins)


# Going offline

If you have already installed the **Python Plugin Engine**, then you can run ImJoy in offline mode. What you do is to run the engine with `python -m imjoy --serve` . And it will download all the files for offline access, after that, if you run `python -m imjoy` in the **same directory**, you will have your personal ImJoy web app which can be access by [http://127.0.0.1:8080](http://127.0.0.1:8080).

Also notice that, even though ImJoy can run without internet, depends on the implementation of the plugin, some plugins maybe unusable when you go offline.
