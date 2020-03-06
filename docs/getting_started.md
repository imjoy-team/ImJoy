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

## Plugins
The entire functionality of ImJoy is provided by plugins. To install new plugins
from the [Plugin Repository](https://github.com/imjoy-team/ImJoy-Plugins), click **+ PLUGINS**.
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
<a href="https://imjoy.io/#/app?plugin=imjoy-team/ImJoy-Plugins:Image Recognition&w=getting-started" target="_blank">**link**</a>,
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

### Digit classification
Here, we describe how to install and use an ImJoy plugin to perform digit classification
with TensorFlow.js. This plugin runs directly in the browser. You can train a
convolution neural network (CNN) to recognize digits. Once the network is trained,
you can classify hand drawn numbers. It is based on [tfjs-vis](https://github.com/tensorflow/tfjs-vis)
- a small library for in browser visualization for use with TensorFlow.js.

This plugin can be obtained by installing the plugin `MNIST-CNN` from
the ImJoy plugin repository. Alternatively, you can also use this
<a href="https://imjoy.io/#/app?plugin=imjoy-team/ImJoy-Plugins:MNIST-CNN&w=getting-started" target="_blank">**link**</a>,
which will open ImJoy and provide a dialog where you can confirm the installation.

Once the plugin is install, it will appear in the plugin dialog on the left.
You can start the plugin by pressing on its name. This will open a window with
the different controls, where you can perform training, inspect training progress
and the final results, and perform prediction. The usual workflow consists of a few steps
illustrated in the screen shots and the text below:

![imjoy-MNIST-training](assets/imjoy-MNIST-training.png ':size=800')

1.  Adding training data with the button `Add Training Data`. Each time you press on the
    button more data is added. Adding more data increases the accuracy of the trained model.
0.  Perform training with the button `Start training`. Training will be performed for 80 batches.
0.  Once the training is finished, you can inspect the per-digit accuracy and the confusion matrix
    with the respective buttons.
0.  You can perform predictions on hand drawn digits. For this, select the panel `Prediction` and draw
    a digit. Once you release the mouse button, the network will predict the digit. Press clear to

    ![imjoy-MNIST-prediction](assets/imjoy-MNIST-prediction.png ':size=400')

Note that you retrain you model by adding more training data. This allows to appreciate
improved performance when adding more training data.
