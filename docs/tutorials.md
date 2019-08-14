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



## Making a plugin for segmentation with U-net
[U-net](https://lmb.informatik.uni-freiburg.de/people/ronneber/u-net/) is one of the most widely used neural network for image segmentation, especially for biomedical images.

This is a tutorial to show how we can easily implement an ImJoy plugin which can perform **training** and **prediction** for segmentation with Unet. We will use an existing implementation of Unet on Github (https://github.com/zhixuhao/unet), and add a ImJoy plugin file to bridge with the python modules.


### Source code repository

Let's first take a look at the repository on Github: https://github.com/zhixuhao/unet. 

It consists of some python files (`data.py`, `main.py`, `model.py`), an example dataset (`data/membrane`) and two Jupyter notebooks (`dataPrepare.ipynb`, `trainUnet.ipynb`).

The file named `model.py` defines the U-net architecutre, and `main.py` shows how to use it, it contains the following code for training and prediction:
```python
from model import *
from data import *

#os.environ["CUDA_VISIBLE_DEVICES"] = "0"


data_gen_args = dict(rotation_range=0.2,
                    width_shift_range=0.05,
                    height_shift_range=0.05,
                    shear_range=0.05,
                    zoom_range=0.05,
                    horizontal_flip=True,
                    fill_mode='nearest')
myGene = trainGenerator(2,'data/membrane/train','image','label',data_gen_args,save_to_dir = None)

model = unet()
model_checkpoint = ModelCheckpoint('unet_membrane.hdf5', monitor='loss',verbose=1, save_best_only=True)
model.fit_generator(myGene,steps_per_epoch=300,epochs=1,callbacks=[model_checkpoint])

testGene = testGenerator("data/membrane/test")
results = model.predict_generator(testGene,30,verbose=1)
saveResult("data/membrane/test",results)
```
Importantly, we are going to port the above code in our ImJoy plugin.

### Preperation
Before start, you will need to install the ImJoy plugin engine accroding to the instructions here: https://github.com/oeway/ImJoy-Engine , and we recommend to use Google Chrome or FireFox to perform the experiments (note: Safari won't work). 

Once installed, you need to first start the plugin engine, either through the desktop if you installed, or run `imjoy` command if you chose the command line version of the plugin engine. Either way you will get a connection token string, which we will need to use to connect from the ImJoy web app.

Open Chrome or Firefox, go to https://imjoy.io and start ImJoy. Click the 🚀 icon in the upper-right corner to add the plugin engine by filling the connection token you got in the previous step.

### Create a new plugin

Now click the "+ Plugins" button, and create a new plugin with the `🚀 Native Python` template. To test your plugin connection, you can directly click the play button in the code editor to run the plugin through your plugin engine. You should be able to see a popup dialog showing "hellow world"

![](https://dl.dropbox.com/s/gq4am9d7jcgugzd/tutorial-create-python-plugin.gif ':size=800')



[>>>Full plugin source code](https://gist.github.com/oeway/5edb106eb9360405412bba8ebd2dbeb5/af1442b8376b7d979b510acae7b33e1776bd7b02)

### Change the plugin name and description
We need to first give a name to our plugin and a short description by editing two fields `name` and `description` in the `<config>` block as below:
```json
<config lang="json">
{
  "name": "Unet-Segmentation",
  ...
  "description": "This plugin uses U-net to segment images.",
  ...
}
</config>
```

(The part with `...` means keep as is.)

[>>>Full plugin source code](https://gist.github.com/oeway/5edb106eb9360405412bba8ebd2dbeb5/222d5def221e8bb7588b0a5435abef542063f1fc)

### Setup plugin dependencies
If we go to the [README page](https://github.com/zhixuhao/unet#dependencies), we will need to add dependencies the following dependencies to ImJoy:
 * Tensorflow
 * Keras >= 1.0

The way to add dependent libraries to a ImJoy plugin is to edit the filed called `requirements` in the `<config>` block in the plugin file. It's a good practice to pin the version of dependent libraries, so will need to add "pip: keras==2.1.4 tensorflow==1.14.0" as `requirements`.

In addition to the libraries, we also want ImJoy to clone the repository from https://github.com/zhixuhao/unet so the unet python modules can be accessed by the plugin. Therefore we also add "repo: https://github.com/zhixuhao/unet" to `requirements` so ImJoy will clone it automatically to the workspace folder located in `~/ImJoyWorkspace`.

Optionally, we can also create an conda virtual environment for the plugin, which often provide more stability when on the users' machine because it reduces the chance of interfer with other plugins. For this we need to add `conda create -n unet-segmentation-cpu python=3.6.7` to the `env` field.

Then we will have the following `requirements` and `env` fields:

```json
<config lang="json">
{
  "name": "Unet-Segmentation",
  ...
  "description": "This plugin uses U-net to segment images.",
  ...
  "env": "conda create -n unet-segmentation-cpu python=3.6.8",
  "requirements": ["repo:https://github.com/zhixuhao/unet", "pip:keras==2.1.4 tensorflow==1.8.0"],
  ...
}
</config>
```

Since the unet repo will be cloned when the plugin is loaded (or saved), the source code and example data will be cloned to a folder called `unet` (inside `~/ImJoyWorkspace/default`). The eaiest way to import these modules in Python is to switch current work directory to the `unet` folder. Therefore we add `os.chdir('unet')` to the `<script>` block. And we can then import the model defined in the `unet` folder. Here is the code:

```python
<script lang="python">
import os
os.chdir('unet')

from model import *
from data import *

from imjoy import api

class ImJoyPlugin():
    ...

```

Now if we click the save button in the plugin editor, and the plugin engine will clone the repo, setup the virutal environment and install the dependencies. Note that this may take a while depending on your computer and the internet connection. Once done, you should have an entry called `Unet-Segmentation` (blue color) in the plugin menu.

![](https://dl.dropbox.com/s/moau28ivwos4vl9/tutorial-add-dependencies.gif ':size=800')

If anything goes wrong, there is an round error icon which allows you to access the error log. Click the log icon, it will open the log in a separate window.

[>>>Full plugin source code](https://gist.github.com/oeway/5edb106eb9360405412bba8ebd2dbeb5/c7c98980090b3571e48b8012ad8b9c82eca1311c)

### write a train function
Let's then add a function for training, and call it when the user click the plugin menu.

In the following code, we first define a `train` function, copy and paste the training part from [main.py](https://github.com/zhixuhao/unet/blob/master/main.py#L7-L18) to it. Then we call `self.train()` in the `run()` which will be called when the user click the plugin.
To tell the user if the training is done, we add an additional line `api.alert('training done!')`.

Now save the plugin, it should reload, once the plugin button turn blue, click the plugin name and wait for the popup dialog with "'training done!'".

Since we the default code will only train for 1 epoch, we can run and test it pretty quickly.

```python
class ImJoyPlugin():
    def setup(self):
        api.log('initialized')
    
    def train(self):
        data_gen_args = dict(rotation_range=0.2,
                    width_shift_range=0.05,
                    height_shift_range=0.05,
                    shear_range=0.05,
                    zoom_range=0.05,
                    horizontal_flip=True,
                    fill_mode='nearest')
        myGene = trainGenerator(2,'data/membrane/train','image','label',data_gen_args,save_to_dir = None)

        model = unet()
        model_checkpoint = ModelCheckpoint('unet_membrane.hdf5', monitor='loss',verbose=1, save_best_only=True)
        model.fit_generator(myGene,steps_per_epoch=300,epochs=1,callbacks=[model_checkpoint]

    def run(self, ctx):
        self.train()
        api.alert('training done!')

```

![](https://dl.dropbox.com/s/moau28ivwos4vl9/tutorial-add-dependencies.gif ':size=800')


[>>>Full plugin source code](https://gist.github.com/oeway/5edb106eb9360405412bba8ebd2dbeb5/cfbf85f629c3e2258d5be27e295dd438f7f477ff)

### Get user input and show traininig progress
You can use [`api.prompt`](https://imjoy.io/docs/#/api?id=apiprompt) function to get user input, for example to specify how many epochs. Similary to [`api.alert`](https://imjoy.io/docs/#/api?id=apialert) function, [`api.showProgress`](https://imjoy.io/docs/#/api?id=apishowprogress) and [`api.showStatus`](https://imjoy.io/docs/#/api?id=apishowstatus) function can be used to show the current training progress.

Importantly, all the api functions are [`async function`](https://imjoy.io/docs/#/api?id=asynchronous-programming), which means the returned value is not the actual results, but a special object called `Promise` or `Future`, we need to explicitly wait for it to get the value. In Python, we can easily use async functions with a built-in libriary called `asyncio` (only available in Python 3) according to the following steps:

 1. `import asyncio`
 2. add `async` to any function which you want to call async functions, for example if you want to call `api.prompt` inside `run`, then you need to add `async` before `def run`, i.e.: `async def run(self, ctx):`
 3. add `await` before the acutal async function you want to call and you can get the actuall value. For example, if you want to get the user input, you need to call `result = await api.prompt('How many epochs do you want to train')`.

 **This means you can only use `await` inside a function defined with `async`.**
 **`await` can be ignored if we don't want to wait for the execution or the result, e.g. api.alert('hello'), `await` is optional**


#### Get user input with `api.prompt`

This is the `run` function if we want to get the epoch number from the user and pass it to `train`:
```python
    def train(self, epochs):
        ...
        # pass epochs to model.fit_genenerator function
        model.fit_generator(myGene,steps_per_epoch=300,epochs=epochs,callbacks=[model_checkpoint]

    async def run(self, ctx):
        epochs = await api.prompt('How many epochs do you want to train', 1)
        self.train(int(epochs))
        api.alert('training done!')
```

![](https://dl.dropbox.com/s/hhaqnvblo4eg4qt/tutorial-get-user-input.gif ':size=800')

[>>>Full plugin source code](https://gist.github.com/oeway/5edb106eb9360405412bba8ebd2dbeb5/9cce27ad7c5b0b055dc077233713c1aea403ab22)

#### Show plugin progress by setting up a keras callback function
To show the progress during the training, we need to use Keras [callback functions](https://keras.io/callbacks/) which is a function which will be called during model training.

To simplify the process, we can use [`keras.callbacks.LambdaCallback`](https://keras.io/callbacks/#lambdacallback). Specifically, we will first define a function called `on_epoch_end`:

```python
from keras.callbacks import LambdaCallback

class ImJoyPlugin():
    ...
    def train(self, epochs):
        ...

        # define callback
        def on_epoch_end(epoch, logs):
            api.showStatus('Training epoch: {}/{}  {}'.format(epoch+1, epochs, logs))
            api.showProgress((epoch+1)/epochs*100)
        progress_callback = LambdaCallback(on_epoch_end=on_epoch_end)

        api.showStatus('Start training...')
        # set the callback
        model.fit_generator(myGene,steps_per_epoch=80,epochs=epochs,callbacks=[progress_callback, model_checkpoint])
```

![](https://dl.dropbox.com/s/2ir3gkj9pppzl5y/tutorial-show-progress.gif ':size=800')


[>>>Full plugin source code](https://gist.github.com/oeway/5edb106eb9360405412bba8ebd2dbeb5/a56b34c8b8d896f3195bb4a596b21ed3f8499ad7)
### Support training and prediction with parameters

With the `api.prompt` function, we can only take one parameter at a time, and we only one plugin button to run the training.
In order to add more actions for, e.g. prediciton, we need to register imjoy `ops` with [`api.register`](https://imjoy.io/docs/#/api?id=apiregister). An `op` in ImJoy is an actionable function which can define a simple input form with the [`ui` string](https://imjoy.io/docs/#/development?id=ui).

For example, we can register a `train` op with an input argument called `epochs` and a `predict` op:
```python

from keras.models import load_model

class ImJoyPlugin():
    def setup(self):
        api.register(name="train", ui="epochs: {id: 'epochs', type: 'number', min: 1, max: 100000, placeholder: 10}")
        api.register(name="predict", ui="perform unet prediction")

    def predict(self):
        model = load_model('unet_membrane.hdf5')
        testGene = testGenerator("data/membrane/test")
        results = model.predict_generator(testGene,30,verbose=1)
        saveResult("data/membrane/test",results)

    def train(self, epochs):
        ...

    async def run(self, ctx):
        if ctx._op == 'train':
            epochs = ctx.config.epochs
            self.train(int(epochs))
            api.alert('training done!')
        elif ctx._op == 'predict':
            self.predict()
            api.alert('prediction done!')
```

![](https://dl.dropbox.com/s/m5r6ed2ydzdny9g/tutorial-suport-training-prediction.gif ':size=800')

[>>>Full plugin source code](https://gist.github.com/oeway/5edb106eb9360405412bba8ebd2dbeb5/32a58bcf7b7ad6bd59f4b56a3f692a32e5e7496b)


### Select user's own data files
Until now, we are using the default example dataset for training and prediction.

If we take a look at the [membrane data folder](https://github.com/zhixuhao/unet/tree/master/data/membrane), it contains the following structure.

Importantly, `train/image` contains the input images, and `train/label` contains the target mask image. During prediction, only the input image is required in the `test` folder.

```
 - train
    - image
      - 0.png
      - 1.png
      - 2.png
      - ...
    - label
      - 0.png
      - 1.png
      - 2.png
      - ...
 - test
    - 0.png
    - 1.png
    - ...
```

If the user provide their own data organized with the same folder structure as above, then new models can be trained on their own data.
ImJoy provide the [`api.showFileDialog`](https://imjoy.io/docs/#/api?id=apishowfiledialog) function to allow user to select (or upload by drag and drop) files. A file path can be retrieved after the user selected the input folder.

```python
    async def train(self, epochs):
        ...
        ret = await api.showFileDialog(type="directory", title="please select an training input folder", engine=api.ENGINE_URL)
        train_folder = ret.path
        api.showStatus('Preparing data from {}...'.format(train_folder))
        myGene = trainGenerator(2, train_folder,'image','label',data_gen_args,save_to_dir = None)
        ...

    async def run(self, ctx):
        ...
            await self.train(int(epochs))
        ...
```
[>>>Full plugin source code](https://gist.github.com/oeway/5edb106eb9360405412bba8ebd2dbeb5/44cfd2d1cd6b18774df64de521ebdf80179ca57e)


Similarily, we can add a file dialog for prediction.

```python
    async def predict(self):
        ret = await api.showFileDialog(type="directory", title="please select a test input folder", engine=api.ENGINE_URL)
        test_folder = ret.path # "data/membrane/test"
        model = load_model('unet_membrane.hdf5')
        testGene = testGenerator(test_folder)
        api.showStatus('Start prediction...')
        results = model.predict_generator(testGene,30,verbose=1)
        saveResult(test_folder,results)

    async def run(self, ctx):
        ...
            await self.predict()
        ...
```

![](https://dl.dropbox.com/s/melbkrgn65tst2a/tutorial-select-train-folder.gif ':size=800')

[>>>Full plugin source code](https://gist.github.com/oeway/5edb106eb9360405412bba8ebd2dbeb5/8a801678e562707b2f5a87a2c4592ea4e47e886f)

### Deploy the plugin to Github

Now we have a plugin which allows train Unet models and make prediciton user's own data, we can deploy it to github and share it with others.

The recommended way to do is make a deicated repository and place the plugin file directly into the Github repo.

As an example, we can login to Github, open https://github.com/zhixuhao/unet and then click the `Fork` button which will create a copy of the unet folder under your own account. For example, we have the copy at https://github.com/imjoy-team/unet.

In the plugin editor, since we have our own copy of the unet plugin repo, we can change the `requirements` to use our own unet repo:

```json
<config lang="json">
{
  ...
  "requirements": ["repo:https://github.com/imjoy-team/unet", "pip:keras==2.1.4 tensorflow==1.8.0"],
  ...
}
</config>
```

Now, we can click the export button to download the plugin file, for example, named `Unet-Segmentation_wj39bdom0c.imjoy.html`. 

We can rename it to `Unet-Segmentation.imjoy.html`, then upload to our forked plugin repository (https://github.com/imjoy-team/unet).

After that, we can make a sharable url by adding the plugin file url after `https://imjoy.io/#/app?plugin=`. For example: `https://imjoy.io/#/app?plugin=https://github.com/imjoy-team/unet/blob/master/Unet-Segmentation.imjoy.html`.

Add this url to the README file so your users can then just click and use the plugin.

![](https://dl.dropbox.com/s/o02kb0eirra6dke/tutorial-deploy-plugin.gif ':size=800')


### More examples

For more advanced examples, please take a look at our plugin repository: https://github.com/oeway/ImJoy-Plugins/tree/master/repository. For example, the [CARE plugin](https://github.com/oeway/ImJoy-Plugins/blob/master/repository/CARE.imjoy.html) is similar to the Unet plugin we made in this tutorial, but can show an interactive loss chart during training.


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
