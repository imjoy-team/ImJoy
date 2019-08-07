# Tutorials for users

## Building a workflow

Plugins within a workspace can also be composed into a workflow, where multiple plugins are chained to perform more complex data analysis and visualization tasks. 
Note that these workflows can also be stored and shared with other users via a single URL. 
Follow the step and you will make a simple workflow where a JavaScript plugin asking the user to provide a number is executed first, then this number is used by a second plugin to perform calculations. 

 1. click [here](https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:Calculator&workspace=workflow-demo) to install two demo plugins.
 2. click `WORKFLOW` in the left panel
 3. press the + circled button and select `GetNumber` to add it 
 4. then add `Calculator`
 5. press the `run` button


![imjoy-basic-workflow](assets/imjoy-basic-workflow.png ':size=800')

# Tutorials for plugin developers
## Calling Python from Javascript

ImJoy provides a remote procedure call (RPC) mechanism which enables transparent function calls between plugins.

This tutorial show how can call a function defined in Python in another Javascript plugin.

First, let's create a plugin by using the `web-python` or `native-python`(plugin engine required) template.

Then define a function called `calc_exp` which use numpy to calculate the natural exponential of input `x`:
```python
import numpy as np
from imjoy import api
import asyncio

class ImJoyPlugin():
    def setup(self):
        pass

    async def run(self, ctx):
        pass

    async def calc_exp(x):
        return np.exp(x)

api.export(ImJoyPlugin())
```
Change the plugin name to `calculator` and save the plugin, you should be able to see `calculator` in the menu item in the left panel.

After that, create another plugin with the `web-worker` template. In the `run` function, we will call `await api.getPlugin('calculator')` to obtain the plugin object of the Python plugin object we defined in the previous step. Then we can call `await calc.calc_exp(x)` to run the function.

```javascript
class ImJoyPlugin {
  async setup() {

  }

  async run(ctx) {
    const x = 9
    const calc = await api.getPlugin('calculator')
    const result = await calc.calc_exp(x)
    await api.alert("Exp of " + x + " is " + result)
  }
}

api.export(new ImJoyPlugin())
```

Name the plugin as `getPlugin-demo` and save the plugin. If you now click `getPlugin-demo` in the plugin menu, then you will be able to call a Python plugin in Javascript.

![imjoy-basic-workflow](assets/imjoy-function-call.png ':size=800')


As a quiz, You can also try the opposite example by defining a plugin in Javascript and call it in Python.

## Displaying a chart from Python
In this demo, we show how data generated in a **Python plugin** can be displayed in a window plugin. The plugin interface you can slightly change the data that is generated (you can change the number of data-points) and how the graph is actually displayed: either it is rendered with one of three JavaScript libraries, or the plot is generated with Matplotlib and saved as png and then shown.


### Plotting with a JavaScript library
You can install the Python plugin either to run

 * in the <a href="https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:Charts PyWorker&w=demo-charts" target="_blank">**Python plugin engine**</a>
 * or with <a href="https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:Charts WebPython&w=demo-charts" target="_blank">**web Python**</a>.

If you select in the Python plugin one of the options `Plotly`, `C3`, or `Charts.js` the Python plugin will send the data to the **window plugin** "Charts JS window".
This plugin was automatically installed, and provided simple example for three
of the major JavaScript chart libraries:

* [Plotly](https://plot.ly/javascript/)
* [C3](https://c3js.org/)
* [Chart.js](https://www.chartjs.org/docs/latest/)

The Python plugin will send to this plugin the calculated data, specifications of the window size, and which library to use the obtained data will be rendered as a line plot.

The **main steps** are described below and basic data flow is illustrated by dashed errors in the image above.

![imjoy-demo-python-to-js](assets/imjoy-demo-python-to-js.png ':size=800')

1. User defines how many data points should be calculated, some text that will be displayed in the window plugin, and which JavaScript library will be used to plot the data.
2. Upon execution of the Python plugin, the damped cosine curve will be computed. Then a dictionary `data` containing these values, as well as the text and the name of the desired JS library is created. The necessary content of this dictionary is specified by the window plugin. This will then be added to another dictionary `data_plot` that contains specifications for the window plugin: `type` to specify which window plugin should be called, `name` to specify the window title, `w` and `h` the specify the size. The dictionary `data_plot` will be used with the ImJoy API function `api.createWindow` to call the window plugin.
3. In the window plugin the transferred data are available as `ctx.data` and are used to create the JavaScript plot and also populate the HTML text field.
4. The `api.createWindow` returns an identifier for the window. When plotting again, the Python plugin attempts to plot into this window. Please note that here on the actual data are passed as an input and not the larger dictionary containing the specifications of the window. For the plugin running in the Python engine, we added a  `try ... except` statement to catch error arises when the window has been closed.

### Opening a chart saved as png
Rather then sending the data, you can directly show an image in a window plugin with this
<a href="https://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:Charts PNG&w=demo-charts" target="_blank">**demo**</a>.

Before getting to the actual demo, we would like to provide two important clarifications
concerning the supported file-types and how the file-system is seen by window plugins.

ImJoy plugins communicate with the provided api functions. These functions support only **limited data types**. You can pass most of the primitive types such as number, string, and dictionaries containing those types. However, the api functions don’t support  other objects, such as an images. If you want toto pass these objects, you need to encode them to supported types, such as a `base64` string that we will use below.

You may then wonder why you just send save the file locally, and send this file path to the window plugin, which will read the file from the disk. Here it is important to note that the browser (where ImJoy is running) can not directly access the file system (for security reasons). ImJoy, provides a solution to this problem with function `api.getFileUrl()`, which converts a provided file path to an url. This url can be passed to a dedicated window, which fetches and displays the encoded data.

In practice, this can be done with a few line of code. You essentially need to save
your plot, and convert it to base64, and send this to the provided window type `imjoy/image` with the api function `api.createWindow`. This window will then use the function
`api.getFileUrl()` to decode the image and display it.

```python
with open(name_plot, 'rb') as f:
    data = f.read()
    result = base64.b64encode(data).decode('ascii')
    imgurl = 'data:image/png;base64,' + result
    api.createWindow(type='imjoy/image', w=12, h=15, data={"src": imgurl})
```

## User interface calling Python plugin
In this demo, we show how to use a **window** plugin to defined a user interface, and how this interface can interact with a **Python** plugin to perform calculations.

You can install this plugin from this
<a href="http://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:GUI w3&w=demo-GUI" target="_blank">**link**</a>.
This will install the actual interface plugin (GUI w3.css) and automatically the Python plugin (GUI PyWorker) performing the calculations. The purpose of this plugin is self-explanatory, you can open the GUI by double clicking on the plugin title. Just play around.

![imjoy-demo-gui-screenshot](assets/imjoy-demo-gui-screenshot.png ':size=800')

This demo illustrates a number of different important concepts, which we describe briefly below.

1. How to get started in coding an ImJoy user-interface with HTML, CSS and JavaScript.
2. How to communicate between the user interface and the Python plugin.
3. How to store data in the Python plugin for further calculations.

#### Web-design for an ImJoy interface
The window plugins are developed with HTML5/CSS and JavaScript. Here we provide
only a fast overview of these languages. An excellent resource to get started with HTML, CSS and JavaScript is  [www.w3schools.com/](https://www.w3schools.com/). Other coding platforms exist to test and develop code ([playcode.io/](https://playcode.io/) or [codepen.io](https://codepen.io/)), but you can essentially use ImJoy to test your code as well.

HTML5/CSS and JavaScript control the three relevant aspects of an interface. In ImJoy, these three elements are defined in one [single file](https://github.com/oeway/ImJoy-Demo-Plugins/blob/master/repository/GUI.imjoy.html), and specified in dedicated code blocks.

* **HTML**: structure of the page. The HTML code is in the code block designated as shown below. Please note the `<div>` element, which is required. Currently, window plugins can only have one root element.
    ```html
    <window lang="html">
       <div>
        ...
        </div>
    </window>
    ```
* **JavaScript**: behavior of the interface.
    ```html
    <script lang="javascript">
       ...
    </script>
    ```

* **CSS**: visual appearance of the interface. Many different CSS frameworks exist, but we recommend [W3.css](https://www.w3schools.com/w3css/default.asp). It provides most needed elements, and has an outstanding documentation with interactive examples for
all options. This framework can be imported in the plugin requirements
    ```html
   "requirements": ["https://www.w3schools.com/w3css/4/w3.css",
                    "https://www.w3schools.com/lib/w3-theme-indigo.css",
                    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"],
    ```
     The provided default font-size is rather large to ensure readability on web sites.
     For the purpose of a user-interface it might actually be too large. You can overwrite the default values, by modifying the `css` block in plugin file. Note that the [`!important`](https://css-tricks.com/when-using-important-is-the-right-choice/) is necessary to achieve this.

     ```
      <style lang="css">
        /* Overwrite css defaults*/
        body {font-size: 13px !important;}
      </style>
     ```

### Workflow in the plugin
The image below shows some code snippets to illustrate the workflow from clicking
a button to showing the plot. The main steps are the following (and detailed more below)

1. User presses on a button. This is triggers the execution of the `onclick` function.
2. In this function, user input from the window plugin is retrieved, and the Python plugin is called.
2. Calculations are performed, results stored in Python plugin and shown in main interface.

![imjoy-demo-gui-code](assets/imjoy-demo-gui-code.png ':size=800')

**Determine behavior of HTML elements**

HTML elements can respond to user interaction. The corresponding action is defined in JavaScript in the ```setup()``` function. In the image above, this is shown for the html element button with the id `btn_plot`. When the user clicks on this button (`onclick`) the defined function calls are executed. In the example, the current value of two other html elements (the forms containing the number of data points and the math operator) are retrieved, and passed to the Python plugin together with a callback function permitting to plot data in the window plugin.

**Communication between window and Python plugin**

Communication between the window and Python plugin is achieved by the ImJoy API [**api.call()**](api?id=apicall) and so-called **callback functions**. Simply put such a callback is a function that will be executed after another function has finished its execution. The function `calc_plot()` from above will use `api.call()` to call the function `calc_results` from the `Python` plugin. It will pass two parameters obtained from the user-interface and a callback function . The callback function allows the Python plugin to plot data in the window plugin.

**Python calculations, storage and callback**

Let's have a look at the Python function `calc_results`. It receives the JavaScript dictionary, extracts all necessary parameters and perform the desired calculation. Then it stores the data with `self.x_values = x`. Lastly, invokes the callback function to print in the main window with `callback_fun(...)`. Here the parameters are again passed as a dictionary. Please note, the **numpy** arrays are not supported, and the data has therefore be transformed to a list.


## Porting a deep learing method to ImJoy

## Using ImageJ modules and plugins in ImJoy


