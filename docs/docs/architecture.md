# ImJoy architecture

Here we provide and overview of the design of ImJoy and how plugins can be developed.

Imjoy consists of **two main components**
1. The **ImJoy Web App**. Plugins can be developed in JavaScript for this web interface.
2. The **Plugin Engine**. Packages are managed by `conda` and `pip` which provides thus
access to the entire Python ecosystem. Complex computional tasks can be implemented
in plugins, which run in the **Plugin Engine**. The Python Plugin Engine is connected with the ImJoy Web App through websockets and communicate with a customized remote procedure calls (RPC) based on `socket.io`.

<img src="./asserts/imjoy-architecture.png" width="800px"></img>


**Importantly**, ImJoy can run without the Python backend and thus without the need of any
installation. Plugins can then only implemented in JavaScript (such as [TensoFlow.js](https://js.tensorflow.org/)).
