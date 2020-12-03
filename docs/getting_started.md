# Getting Started

Here we describe briefly the main concepts of ImJoy and get you started with a
simple plugin to do some image processing.

For more detailed description of use ImJoy, we refer to the section **User Manual**
For developers, we provide more information about how to develop plugins in
the section **Development**, and we provide a detailed description of the entire **ImJoy API**.


## Launching ImJoy and its interface
ImJoy can be used directly in your browser. When you launch ImJoy (https://imjoy.io),
you will see a welcome screen where you can start the actual ImJoy app with the
button `Start ImJoy`. This will open the app and you will see an interface with
all the functionality needed to process data.

![imjoy-interface](assets/imjoy-interface.png ':size=800')

Optionally, you can click the "Run" button below and it will load ImJoy app directly:
<!-- ImJoyPlugin: { "type": "web-worker", "hide_code_block": true, "passive": true} -->
```js
api.createWindow({src: "https://imjoy.io/#/app", passive: true, fullscreen: true})
```

## Plugins
The entire functionality of ImJoy is provided by plugins. To install new plugins
from the [Plugin Repository](https://github.com/imjoy-team/imjoy-plugins), click **+ PLUGINS**.
This will show a window with all available plugins with a short description.
A longer description can be obtained by pressing on the **...** and **Docs**.
To install a plugin, press on the cloud button, no further confirmation is required.

Once a plugin is installed, you can open a **plugin specific menu**, by
pressing on the down arrow right to plugin name. This will shows (if applicable)
a list of parameters which determine the plugin behaviour. You can **execute**
the plugin by pressing on its title.

To obtain more information about an installed plugin, press on the icon left of they
plugin name and select **Docs**. This will show a new window with a detailed
description of how the plugin works. Other options to remove, terminate, or share
the plugin with and url are provided as well.

Plugins have the 🚀 symbol next to their title are written in native Python, and
usually developed for advanced image processing. To execute them,
[**Python Plugin Engine**](user_manual?id=imjoy-app-and-plugin-engine) needs
to be installed.

## Example

### Image recognition
Here, we describe how to install and use a ImJoy plugin to perform image recognition
with a pre-trained neural network. The plugin is ported from [mobilenet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet).

This plugin can be obtained by installing the plugin `Image Recognition` from
the ImJoy plugin repository. Alternatively, you can also use this
<a href="https://imjoy.io/#/app?plugin=imjoy-team/imjoy-plugins:Image Recognition&w=getting-started" target="_blank">**link**</a>,
which will open ImJoy and provide a dialog where you can confirm the installation.

Once the plugin is install, it will appear in the plugin dialog on the left.
You can start the plugin by pressing on its name. This will open a window
and the trained network is loaded. Then you can perform image recognition by
pressing on the `predict` button. You can either predict the already displayed image
of a cat, or upload your own file. The prediction is displayed as an ImJoy message and also in
the window itself.

![imjoy-interface](assets/imjoy-predict-elephant.png ':size=300')

You can run this plugin even on your **mobile phone**. Here, rather than uploading
and image, you will be able to snap an image and perform a prediction.

