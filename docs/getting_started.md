# Getting Started

Here we describe briefly the main concepts of ImJoy and get you started with a
simple plugin to do some image processing.

For more detailed description of use ImJoy, we refer to the section **User Manual**
For developers, we provide more information about how to develop plugins in
the section **Development**, and we provide a detailed description of the entire **ImJoy API**.


## The ImJoy interface

When you launch ImJoy (https://imjoy.io/#/), you will see a welcome screen where
you can start the actual ImJoy app with the button `Start ImJoy`. This will open
the app and you will see an interface with all the functionality needed to process data.

![imjoy-interface](assets/imjoy-interface.png ':size=800')


## Plugins

The entire functionality of ImJoy is provided by plugins. To install new plugins
from the [Plugin Repository](https://github.com/oeway/ImJoy-Plugins), click **+ PLUGINS**.
This will show a window with all available plugins with a short description.
A longer description can be obtained by pressing on the **...** and **Docs**.
To install a plugin, press on the cloud button.

Plugins have the 🚀 symbol next to their title are written in native Python, and
usually developed for advanced image processing. To execute them,
[**Python Plugin Engine**](user_manual?id=imjoy-app-and-plugin-engine) needs
to be installed.


Once a plugin is installed, you can open the plugin menu, by pressing on the down
arrow next to the plugin. This will shows (if applicable) a list of
**parameters** which determine the plugin behavior. You can **execute**
the plugin by pressing on its title.

To obain more information about an installed plugin, press on the icon next to
the plugin and select **Docs**. This will show a new window with a detailed
description of how the plugin works. For instance how input data
is provided. From the same menu, you can also remove it.

## Some Examples
[ToDo]
