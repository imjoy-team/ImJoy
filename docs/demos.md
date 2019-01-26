# Demos
Here we provide several demos illustrating important concepts of ImJoy.
Once you installed the plugins, you can inspect the code of the provided plugins
by clicking on the symbol left of the plugin name and selecting `Edit`.

## How to interact with the user
An important part of ImJoy is to provide a flexible way to interact with the user, to either specify input information or provide results.

**User input**

1. In the simplest case, you can define how the GUI of the plugin is rendered in the plugin dialog. You can ask for general user-input in the **`<config>`** [**block**](development?id=ltconfiggt-block) or specify specific input for the different [**plugin operations**](api?id=apiregister).
2. The ImJoy API provides several functions to ask for user input, e.g. [file dialog](api?id=apishowfiledialog), or a [general dialog](api?id=apishowdialog).

**Provide results**

1. The ImJoy API provides several functions to show results, e.g. indicate [progress](api?id=apishowprogress), update the [ImJoy status](api?id=api-showstatus),
2. The ImJoy API also provides a function to [create a window](api?id=apicreatewindow). Different window types exist, you can either directly
show an results image (type `imjoy/image`). Or create your own window, where you can use JavaScript visualization libraries' to render your results. We provide
examples for the different approaches below.

**Dedicated user interface**
For more advanced purposes, you can use define a user interface with the [**window plugin**](development?id=ltconfiggt-block). Such an interface is designed with web technology (HTML, JavaScript and CSS) and thus provides maximum flexibility. Further, such an interface can communicate with another plugin, e.g. a Python worker that performs the actual analysis. For more details, have a look at the dedicated demo below.

### Python plugin displays a chart in a window plugin
In this demo, we show how data generated in a **Python plugin** can be displayed in a window plugin. The plugin interface you can slightly change the data that is generated (you can change the number of data-points) and how the graph is actually displayed: either it is rendered with one of three JavaScript libraries, or the plot is generated with Matplotlib and saved as png and then shown.


#### Plotting with a JavaScript library
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
3. In the window plugin the transferred data are available as `my.data` and are used to create the JavaScript plot and also populate the HTML text field.
4. The `api.createWindow` returns an identifier for the window. When plotting again, the Python plugin attempts to plot into this window. Please note that here on the actual data are passed as an input and not the larger dictionary containing the specifications of the window. For the plugin running in the Python engine, we added a  `try ... except` statement to catch error arises when the window has been closed.

#### Opening a chart saved as png in a window
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
    api.createWindow('type':'imjoy/image','w':12, 'h':15,data = {"src": imgurl})
```

### User interface communicating with Python worker
In this demo, we show how to use a **window** plugin to defined a user interface, and how this interface can interact with a **Python worker** plugin to perform calculations.

You can install this plugin from this
<a href="http://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:GUI w3&w=demo-GUI" target="_blank">**link**</a>.
This will install the actual interface plugin (GUI w3.css) and automatically the Python plugin (GUI PyWorker) performing the calculations. The purpose of this plugin is self-explanatory, you can open the GUI by double clicking on the plugin title. Just play around.

![imjoy-demo-gui-screenshot](assets/imjoy-demo-gui-screenshot.png ':size=800')

This demo illustrates a number of different important concepts, which we describe briefly below.

1. How to get started in coding an ImJoy user-interface with HTML, CSS and JavaScript.
2. How to communicate between the user interface and the Python worker.
3. How to store data in the Python worker for further calculations.

#### Web-design for an ImJoy user interface
The window plugins are developed with HTML5/CSS and JavaScript. Here we provide
only a fast overview of these languages. An excellent resource to get started with HTML, CSS and JavaScript is  [www.w3schools.com/](https://www.w3schools.com/). Other coding platforms exist to test and develop code ([playcode.io/](https://playcode.io/) or [codepen.io](https://codepen.io/)), but you can essentially use ImJoy to test your code as well.

HTML5/CSS and JavaScript control the three relevant aspects of an interface. In ImJoy, these three elements are defined in one [single file](https://github.com/oeway/ImJoy-Demo-Plugins/blob/master/repository/GUI.imjoy.html), and specified in dedicated code blocks.

* **HTML**: structure of the page. The HTML code is in the code block delignated as shown below. Please note the `<div>` element, which is required. Currently, window plugins can only have one root element.
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

#### Workflow in the plugin
The image below shows some code snippets to illustrate the workflow from clicking
a button to showing the plot. The main steps are the following (and detailed more below)

1. User presses on a button. This is triggers the execution of the `onclick` function.
2. In this function, user input from the window plugin is retrieved, and the Python plugin is called.
2. Calculations are performed, results stored in Python plugin and shown in main interface.

![imjoy-demo-gui-code](assets/imjoy-demo-gui-code.png ':size=800')

**Determine behavior of HTML elements**

HTML elements can respond to user interaction. The corresponding action is defined in JavaScript in the ```setup()``` function. In the image above, this is shown for the html element button with the id `btn_plot`. When the user clicks on this button (`onclick`) the defined function calls are executed. In the example, the current value of two other html elements (the forms containing the number of data points and the math operator) are retrieved, and passed to the Python plugin together with a callback function permitting to plot data in the window plugin.

**Communication between window and Python plugin**

Communication between the window and Python plugin is achieved by the ImJoy API [**api.call()**](api?id=apicall) and so-called **callback functions**. Simply put such a callback is a function that will be executed after another function has finished its execution. The function `calc_plot()` from above will use `api.call()` to call the function `calc_results` from the `Python worker` plugin. It will pass two parameters obtained from the user-interface and a callback function . The callback function allows the Python plugin to plot data in the window plugin.

**Python calculations, storage and callback**

Let's have a look at the Python function `calc_results`. It receives the JavaScript dictionary, extracts all necessary parameters and perform the desired calculation. Then it stores the data wiht `self.x_values = x`. Lastly, invokes the callback function to print in the main window with `callback_fun(...)`. Here the parameters are again passed as a dictionary. Please note, the **numpy** arrays are not supported, and the data has therefore be transformed to a list.

## Using JavaScript libraries in ImJoy
You can readily use existing JavaScript libraries in ImJoy. Here we provide some
examples.


### 3D visualization
Several 3D visualization libraries exist. We provide a plugin where you can select
examples for some of them.

- [**vtk.js**](https://kitware.github.io/vtk-js/index.html)
    > VTK.js is a JavaScript library available for scientific visualization in your browser.

- [**sponza by Babylon.js**](https://www.babylonjs.com/demos/sponza/)
    > Babylon.js is a real time 3D engine using a JavaScript library for displaying 3D graphics in a web browser via HTML5.

![imjoy-demo-gui-code](assets/imjoy-demo-3d-vtk.png ':size=500')

<a href="http://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:3D visualization&w=demo-js" target="_blank">**Try me >>**</a>


### blockly
From [https://developers.google.com/blockly/](https://developers.google.com/blockly/)

> A JavaScript library for building visual programming editors. The Blockly library
  adds an editor to your app that represents coding concepts as interlocking blocks.
  It outputs syntactically correct code in the programming language of your choice.

![imjoy-demo-gui-code](assets/imjoy-demo-blockly.png ':size=600')

<a href="http://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:Fixed-Blockly&w=demo-js" target="_blank">**Try me >>**</a>


### handlebars.js

From [https://handlebarsjs.com/](https://handlebarsjs.com/):

> Handlebars provides the power necessary to let you build semantic templates
  effectively with no frustration. Handlebars is largely compatible with Mustache
  templates. In most cases it is possible to swap out Mustache with Handlebars
  and continue using your current templates.

<a href="http://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:handlebars.js&w=demo-js" target="_blank">**Try me >>**</a>


<!--
#### three.js

From [https://threejs.org/](https://threejs.org/)

> Three.js is a cross-browser JavaScript library and Application Programming Interface
  used to create and display animated 3D computer graphics in a web browser.
  Three.js uses WebGL.

**[TODO] not working yet**
<a href="http://imjoy.io/#/app?plugin=oeway/ImJoy-Demo-Plugins:three.js&w=demo-js" target="_blank">**Try me >>**</a>

### t-SNE analysis
Example from [https://cs.stanford.edu/people/karpathy/tsnejs/]()


**[TODO] not working yet**

-->

## Distribution of code/data stored on Dropbox
This example describes how you can deploy and distribute a Python plugin stored on Dropbox.
This allows to share projects that are private.

1. The **code** or **data** is stored as a zip file on Dropbox. This allows to change
the code/data by replacing the zip file (see Notes below).
2. The ImJoy plugin file (`.imjoy.html`) is hosted with a secret or public **gist**.

Let's assume the python code is in a Zip archive `testcode.zip` stored on Dropbox and
available with the link `DROPBOXLINK/testcode.zip`. You can then place the following code-fragment in the `setup()` function of your plugin to make it available. This fragment performs the following steps

1. Performs an [http request](http://docs.python-requests.org). Please note the **dl=1** option in this request. By default this value is set to 0.
2. Uses the returned request object to generate the zip file locally, unpacks it, and finally deletes it.
3. Add the local path to the system path.

```python
import sys
import os
import requests
import zipfile

url = 'https://DROPBOXLINK/testcode.zip?dl=1'
r = requests.get(url, allow_redirects=True)

# download the zip file
name_zip = os.path.join('.','testcode.zip')
open(name_zip, 'wb').write(r.content)

# extract to the current folder (i.e. workspace)
with zipfile.ZipFile(name_zip, 'r') as f:
    f.extractall('./')
os.remove(name_zip)

# If you want to import your python modules, append the folder to sys.path
sys.path.append(os.path.join('.','testcode'))
```

**Notes**
1. Code is locally stored in `USER_HOME/ImJoyWorkspace/WORKSPACENAME/testcode`, where WORKSPACENAME is the name of the current ImJoy workspace. You can set the workspace automatically in the URL your provide to distribute your plugin (next section).
2. When updating the zip archive, don't delete the old one REPLACE it with the new version. This guarantees that the same link is valid.
3. This code will install each time the plugin is called the current version the zip archive.
